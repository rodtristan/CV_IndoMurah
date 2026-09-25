import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma-service';
import { StockLedgerService } from '../../common/stock/stock-ledger.service';

export interface StockBalanceRow {
  productId: number;
  code: string;
  name: string;
  oldBalance: number;
  newBalance: number;
  difference: number;
  warehouses: { warehouseId: number; oldQty: number; newQty: number }[];
}

export type BalanceSource = 'ledger' | 'documents';

const isCancelled = (code?: string | null) => !!code && code.toUpperCase().includes('CANCEL');
const num = (v: unknown) => Number(v ?? 0);
const round = (n: number) => Math.round(n * 1000) / 1000;
const ADMIN_ROLES = ['admin', 'administrator', 'superadmin', 'super admin', 'super_admin', 'owner'];

@Injectable()
export class StockBalanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: StockLedgerService,
  ) {}

  // ─── Sumber: StockLedger (default) ─────────────────────────────────────

  /**
   * Saldo per (produk, gudang) = Σ(QtyIn − QtyOut) StockLedger.
   * Produk yang belum punya baris ledger sama sekali dilewati (jalankan backfill-opening dulu).
   * Selain itu, produk dengan Product.Stock ≠ Σ ProductStock selalu ikut diperbaiki.
   */
  private async computeFromLedger(warehouseId?: number) {
    const p = this.prisma;
    const [sums, stocks, products] = await Promise.all([
      p.stockLedger.groupBy({ by: ['ProductID', 'WarehouseID'], _sum: { QtyIn: true, QtyOut: true } }),
      p.productStock.findMany({ select: { ProductID: true, WarehouseID: true, Quantity: true } }),
      p.product.findMany({ select: { ID: true, Code: true, Name: true, Stock: true } }),
    ]);
    const ledgerQty = new Map<string, number>();
    const hasLedger = new Set<number>();
    for (const s of sums) {
      ledgerQty.set(`${s.ProductID}:${s.WarehouseID}`, num(s._sum.QtyIn) - num(s._sum.QtyOut));
      hasLedger.add(s.ProductID);
    }
    const old = new Map<string, number>();
    for (const s of stocks) old.set(`${s.ProductID}:${s.WarehouseID}`, num(s.Quantity));

    const rows: StockBalanceRow[] = [];
    let withoutLedger = 0;
    for (const pr of products) {
      const keys = new Set<string>();
      for (const k of [...ledgerQty.keys(), ...old.keys()]) if (Number(k.split(':')[0]) === pr.ID) keys.add(k);
      const useLedger = hasLedger.has(pr.ID);
      if (!useLedger && [...keys].some((k) => Math.abs(old.get(k) ?? 0) > 0.0005)) withoutLedger++;
      const all = [...keys].map((k) => {
        const w = Number(k.split(':')[1]);
        const o = old.get(k) ?? 0;
        return { warehouseId: w, oldQty: o, newQty: round(useLedger ? ledgerQty.get(k) ?? 0 : o) };
      });
      const whs = all.filter((w) => !warehouseId || w.warehouseId === warehouseId);
      const sumNew = round(all.reduce((a, w) => a + w.newQty, 0));
      const oldBalance = warehouseId ? round(whs.reduce((a, w) => a + w.oldQty, 0)) : num(pr.Stock);
      const newBalance = warehouseId ? round(whs.reduce((a, w) => a + w.newQty, 0)) : sumNew;
      const changed =
        whs.some((w) => Math.abs(w.newQty - w.oldQty) > 0.0005) || (!warehouseId && Math.abs(num(pr.Stock) - sumNew) > 0.0005);
      if (!changed) continue;
      rows.push({ productId: pr.ID, code: pr.Code, name: pr.Name, oldBalance, newBalance, difference: round(newBalance - oldBalance), warehouses: whs });
    }
    rows.sort((a, b) => a.code.localeCompare(b.code));
    return { rows, scanned: products.length, withoutLedger };
  }

  // ─── Sumber: dokumen (rebuild satu kali untuk data sebelum ada ledger) ──

  /**
   * Hitung ulang saldo dari dokumen (kartu stok lama):
   *   + StockIn, Purchase, SaleReturn, transfer-in
   *   - StockOut, Sale, PurchaseReturn, transfer-out
   *   Opname: opname terakhir per produk+gudang = baseline absolut (CountedStock);
   *   hanya mutasi setelahnya yang ditambahkan.
   * Qty dikonversi ke satuan dasar (BaseQuantity bila ada, jika tidak via ProductUnit.ConversionValue).
   * Produk tanpa mutasi dokumen dilewati (saldo awal yang diinput langsung tidak tercatat sebagai dokumen).
   */
  private async computeFromDocuments(warehouseId?: number) {
    const p = this.prisma;
    const [units, defaultWh] = await Promise.all([
      p.productUnit.findMany({ select: { ProductID: true, UnitID: true, ConversionValue: true } }),
      this.ledger.getDefaultWarehouseId(p),
    ]);
    const conv = new Map<string, number>();
    for (const u of units) conv.set(`${u.ProductID}:${u.UnitID}`, num(u.ConversionValue) || 1);
    const base = (pid: number, qty: unknown, uid?: number | null, baseQty?: unknown) =>
      num(baseQty) > 0 ? num(baseQty) : num(qty) * (uid ? conv.get(`${pid}:${uid}`) ?? 1 : 1);

    type Ev = { pid: number; wh: number; qty: number; date: Date };
    const ev: Ev[] = [];
    const add = (pid: number, wh: number | null | undefined, qty: number, date: Date, sign: 1 | -1) =>
      ev.push({ pid, wh: wh ?? defaultWh, qty: sign * qty, date });

    const [sin, sout, trf, opn, sale, pur, sret, pret] = await Promise.all([
      p.stockInItem.findMany({ include: { StockIn: { select: { WarehouseID: true, Date: true, Status: { select: { Code: true } } } } } }),
      p.stockOutItem.findMany({ include: { StockOut: { select: { WarehouseID: true, Date: true, Status: { select: { Code: true } } } } } }),
      p.stockTransferItem.findMany({ include: { StockTransfer: { select: { FromWarehouseID: true, ToWarehouseID: true, Date: true, Status: { select: { Code: true } } } } } }),
      p.stockOpnameItem.findMany({ include: { StockOpname: { select: { WarehouseID: true, Date: true } } } }),
      p.saleItem.findMany({ include: { Sale: { select: { WarehouseID: true, Date: true, PaymentStatus: { select: { Code: true } } } } } }),
      p.purchaseItem.findMany({ include: { Purchase: { select: { WarehouseID: true, Date: true, Status: { select: { Code: true } }, PaymentStatus: { select: { Code: true } } } } } }),
      p.saleReturnItem.findMany({ include: { SaleReturn: { select: { WarehouseID: true, Date: true, Status: { select: { Code: true } } } } } }),
      p.purchaseReturnItem.findMany({ include: { PurchaseReturn: { select: { WarehouseID: true, Date: true, Status: { select: { Code: true } } } } } }),
    ]);

    for (const i of sin) if (!isCancelled(i.StockIn.Status?.Code)) add(i.ProductID, i.StockIn.WarehouseID, base(i.ProductID, i.Quantity, i.UnitID), i.StockIn.Date, 1);
    for (const i of sout) if (!isCancelled(i.StockOut.Status?.Code)) add(i.ProductID, i.StockOut.WarehouseID, base(i.ProductID, i.Quantity, i.UnitID), i.StockOut.Date, -1);
    for (const i of trf) {
      const t = i.StockTransfer;
      if (isCancelled(t.Status?.Code)) continue;
      const q = base(i.ProductID, i.Quantity, i.UnitID);
      add(i.ProductID, t.FromWarehouseID, q, t.Date, -1);
      add(i.ProductID, t.ToWarehouseID, q, t.Date, 1);
    }
    for (const i of sale) if (!isCancelled(i.Sale.PaymentStatus?.Code)) add(i.ProductID, i.Sale.WarehouseID, base(i.ProductID, i.Quantity, i.UnitID, i.BaseQuantity), i.Sale.Date, -1);
    for (const i of pur) if (!isCancelled(i.Purchase.Status?.Code) && !isCancelled(i.Purchase.PaymentStatus?.Code)) add(i.ProductID, i.Purchase.WarehouseID, base(i.ProductID, i.Quantity, i.UnitID, i.BaseQuantity), i.Purchase.Date, 1);
    for (const i of sret) if (!isCancelled(i.SaleReturn.Status?.Code)) add(i.ProductID, i.SaleReturn.WarehouseID, base(i.ProductID, i.Quantity, i.UnitID, i.BaseQuantity), i.SaleReturn.Date, 1);
    for (const i of pret) if (!isCancelled(i.PurchaseReturn.Status?.Code)) add(i.ProductID, i.PurchaseReturn.WarehouseID, base(i.ProductID, i.Quantity, i.UnitID, i.BaseQuantity), i.PurchaseReturn.Date, -1);

    const baseline = new Map<string, { date: Date; qty: number }>();
    for (const i of opn) {
      const o = i.StockOpname;
      const k = `${i.ProductID}:${o.WarehouseID}`;
      const cur = baseline.get(k);
      if (!cur || o.Date >= cur.date) baseline.set(k, { date: o.Date, qty: base(i.ProductID, i.CountedStock, i.UnitID) });
    }

    const calc = new Map<string, number>();
    const touched = new Set<number>();
    for (const [k, b] of baseline) { calc.set(k, b.qty); touched.add(Number(k.split(':')[0])); }
    for (const e of ev) {
      const k = `${e.pid}:${e.wh}`;
      const b = baseline.get(k);
      if (b && e.date <= b.date) continue;
      calc.set(k, (calc.get(k) ?? 0) + e.qty);
      touched.add(e.pid);
    }

    const ids = [...touched];
    const [products, stocks] = await Promise.all([
      p.product.findMany({ where: { ID: { in: ids } }, select: { ID: true, Code: true, Name: true, Stock: true } }),
      p.productStock.findMany({ where: { ProductID: { in: ids } } }),
    ]);
    const oldByPw = new Map<string, number>();
    for (const s of stocks) oldByPw.set(`${s.ProductID}:${s.WarehouseID}`, num(s.Quantity));

    const rows: StockBalanceRow[] = [];
    for (const pr of products) {
      const whIds = new Set<number>();
      for (const k of [...calc.keys(), ...oldByPw.keys()]) {
        const [pid, wh] = k.split(':').map(Number);
        if (pid === pr.ID && wh > 0) whIds.add(wh);
      }
      const whs = [...whIds]
        .map((w) => ({ warehouseId: w, oldQty: oldByPw.get(`${pr.ID}:${w}`) ?? 0, newQty: round(calc.get(`${pr.ID}:${w}`) ?? 0) }))
        .filter((w) => !warehouseId || w.warehouseId === warehouseId);
      if (!whs.length) continue;
      const newBalance = round(whs.reduce((a, w) => a + w.newQty, 0));
      const oldBalance = warehouseId ? round(whs.reduce((a, w) => a + w.oldQty, 0)) : num(pr.Stock);
      const changed = Math.abs(newBalance - oldBalance) > 0.0005 || whs.some((w) => Math.abs(w.newQty - w.oldQty) > 0.0005);
      if (!changed) continue;
      rows.push({ productId: pr.ID, code: pr.Code, name: pr.Name, oldBalance, newBalance, difference: round(newBalance - oldBalance), warehouses: whs });
    }
    rows.sort((a, b) => a.code.localeCompare(b.code));
    return { rows, scanned: touched.size, withoutLedger: 0 };
  }

  private compute(warehouseId: number | undefined, source: BalanceSource) {
    return source === 'documents' ? this.computeFromDocuments(warehouseId) : this.computeFromLedger(warehouseId);
  }

  async preview(warehouseId?: number, source: BalanceSource = 'ledger') {
    const { rows, scanned, withoutLedger } = await this.compute(warehouseId, source);
    return { source, scanned, changed: rows.length, productsWithoutLedger: withoutLedger, rows };
  }

  /**
   * ledger    : ProductStock := saldo ledger (ledger adalah kebenaran), Product.Stock := Σ gudang.
   * documents : selisih dibukukan sebagai mutasi ADJUST di ledger sehingga ledger & saldo tetap konsisten.
   */
  async apply(warehouseId: number | undefined, productIds: number[] | undefined, source: BalanceSource = 'ledger', userId?: string) {
    if (source === 'documents') await this.assertAdmin(userId);
    const { rows, scanned } = await this.compute(warehouseId, source);
    const target = productIds?.length ? rows.filter((r) => productIds.includes(r.productId)) : rows;
    await this.prisma.$transaction(
      async (tx) => {
        for (const r of target) {
          for (const w of r.warehouses) {
            if (source === 'documents') {
              const diff = round(w.newQty - w.oldQty);
              if (Math.abs(diff) > 0.0005) {
                await this.ledger.move(tx, {
                  productId: r.productId, warehouseId: w.warehouseId, qty: diff, refType: 'ADJUST', userId,
                  notes: 'Rebuild saldo dari dokumen', allowNegative: true,
                });
              }
            } else {
              await tx.productStock.upsert({
                where: { ProductID_WarehouseID: { ProductID: r.productId, WarehouseID: w.warehouseId } },
                update: { Quantity: new Prisma.Decimal(w.newQty) },
                create: { ProductID: r.productId, WarehouseID: w.warehouseId, Quantity: new Prisma.Decimal(w.newQty), MinimumStock: new Prisma.Decimal(0) },
              });
            }
          }
          await this.ledger.syncProductTotal(tx, r.productId);
        }
      },
      { timeout: 120000 },
    );
    await this.ledger.invalidateCaches();
    return { source, scanned, updated: target.length, rows: target };
  }

  /**
   * Backfill satu kali (idempoten): setiap saldo ProductStock yang belum punya baris ledger
   * dicatat sebagai OPENING (tanggal sekarang) agar kartu stok dimulai dari saldo hari ini.
   * Produk data lama yang hanya punya Product.Stock global dipindah ke gudang default.
   * Terakhir Product.Stock := Σ ProductStock.
   */
  async backfillOpening(userId?: string) {
    await this.assertAdmin(userId);
    const products = await this.prisma.product.findMany({ select: { ID: true, Stock: true } });
    let openingRows = 0;
    let seededFromGlobal = 0;
    let totalsFixed = 0;
    for (const pr of products) {
      await this.prisma.$transaction(async (tx) => {
        const before = await tx.productStock.count({ where: { ProductID: pr.ID } });
        await this.ledger.ensureWarehouseRows(tx, pr.ID, userId);
        if (before === 0 && (await tx.productStock.count({ where: { ProductID: pr.ID } })) > 0) seededFromGlobal++;
        const [rows, product] = await Promise.all([
          tx.productStock.findMany({ where: { ProductID: pr.ID } }),
          tx.product.findUnique({ where: { ID: pr.ID }, select: { PurchasePrice: true } }),
        ]);
        for (const ps of rows) {
          const q = new Prisma.Decimal(ps.Quantity);
          if (q.isZero()) continue;
          const exists = await tx.stockLedger.count({ where: { ProductID: pr.ID, WarehouseID: ps.WarehouseID } });
          if (exists > 0) continue;
          await tx.stockLedger.create({
            data: {
              ProductID: pr.ID,
              WarehouseID: ps.WarehouseID,
              RefType: 'OPENING',
              QtyIn: q.gt(0) ? q : new Prisma.Decimal(0),
              QtyOut: q.lt(0) ? q.neg() : new Prisma.Decimal(0),
              BalanceAfter: q,
              UnitCost: new Prisma.Decimal(product?.PurchasePrice ?? 0),
              Notes: 'Saldo awal kartu stok (migrasi ke ledger)',
              CreatedByID: userId ?? null,
            },
          });
          openingRows++;
        }
        const total = await this.ledger.syncProductTotal(tx, pr.ID);
        if (!total.equals(new Prisma.Decimal(pr.Stock))) totalsFixed++;
      });
    }
    await this.ledger.invalidateCaches();
    return { products: products.length, openingRows, seededFromGlobal, totalsFixed };
  }

  /** Perbaikan saldo manual per gudang: saldo := saldo aktual, selisih dibukukan sebagai ADJUST. */
  async adjust(
    body: { warehouseId?: number | string; items?: { productId: number; actualStock: number; notes?: string }[]; notes?: string; date?: string },
    userId?: string,
  ) {
    const items = body?.items ?? [];
    if (!items.length) throw new BadRequestException('Tidak ada item untuk diperbaiki');
    if (items.some((i) => !Number.isFinite(Number(i.actualStock)) || Number(i.actualStock) < 0)) {
      throw new BadRequestException('Saldo aktual harus angka dan tidak boleh minus');
    }
    const result = await this.prisma.$transaction(
      async (tx) => {
        const wh = await this.ledger.resolveWarehouseId(tx, body.warehouseId ? Number(body.warehouseId) : undefined);
        const out: { productId: number; oldQty: number; newQty: number; difference: number }[] = [];
        for (const it of items) {
          await this.ledger.ensureWarehouseRows(tx, Number(it.productId), userId);
          const cur = await tx.productStock.findUnique({ where: { ProductID_WarehouseID: { ProductID: Number(it.productId), WarehouseID: wh } } });
          const oldQty = num(cur?.Quantity);
          const diff = round(Number(it.actualStock) - oldQty);
          if (Math.abs(diff) > 0.0005) {
            await this.ledger.move(tx, {
              productId: Number(it.productId), warehouseId: wh, qty: diff, refType: 'ADJUST', userId, allowNegative: true,
              date: body.date ? new Date(body.date) : undefined,
              notes: it.notes || body.notes || 'Perbaikan saldo stok',
            });
          }
          out.push({ productId: Number(it.productId), oldQty, newQty: Number(it.actualStock), difference: diff });
        }
        return { warehouseId: wh, items: out };
      },
      { timeout: 60000 },
    );
    await this.ledger.invalidateCaches();
    return result;
  }

  private async assertAdmin(userId?: string) {
    if (!userId) throw new ForbiddenException('Hanya admin yang dapat menjalankan proses ini');
    const u = await this.prisma.user.findUnique({ where: { ID: userId }, select: { Role: true } });
    if (!u || !ADMIN_ROLES.includes((u.Role ?? '').toLowerCase())) {
      throw new ForbiddenException('Hanya admin yang dapat menjalankan proses ini');
    }
  }
}
