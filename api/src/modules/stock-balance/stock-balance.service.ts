import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma-service';

export interface StockBalanceRow {
  productId: number;
  code: string;
  name: string;
  oldBalance: number;
  newBalance: number;
  difference: number;
  warehouses: { warehouseId: number; oldQty: number; newQty: number }[];
}

const isCancelled = (code?: string | null) => !!code && code.toUpperCase().includes('CANCEL');
const num = (v: unknown) => Number(v ?? 0);
const round = (n: number) => Math.round(n * 1000) / 1000;

@Injectable()
export class StockBalanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Recompute balances from stock movements (kartu stok):
   *   + StockIn, Purchase, SaleReturn, transfer-in
   *   - StockOut, Sale, PurchaseReturn, transfer-out
   *   Opname: the latest opname per product+warehouse sets an absolute baseline
   *   (CountedStock); only movements dated after it are added on top.
   * Quantities are converted to the base unit via ProductUnit.ConversionValue.
   * Products with no movement at all are skipped (their opening stock is entered
   * directly on ProductStock and is not recorded as a movement).
   */
  private async compute(warehouseId?: number) {
    const p = this.prisma;
    const [warehouses, units] = await Promise.all([
      p.warehouse.findMany({ orderBy: { ID: 'asc' }, select: { ID: true } }),
      p.productUnit.findMany({ select: { ProductID: true, UnitID: true, ConversionValue: true } }),
    ]);
    const defaultWh = warehouses[0]?.ID ?? 0;
    const conv = new Map<string, number>();
    for (const u of units) conv.set(`${u.ProductID}:${u.UnitID}`, num(u.ConversionValue) || 1);
    const factor = (pid: number, uid?: number | null) => (uid ? conv.get(`${pid}:${uid}`) ?? 1 : 1);

    type Ev = { pid: number; wh: number; qty: number; date: Date };
    const ev: Ev[] = [];
    const add = (pid: number, wh: number | null | undefined, qty: number, uid: number | null | undefined, date: Date, sign: 1 | -1) =>
      ev.push({ pid, wh: wh ?? defaultWh, qty: sign * qty * factor(pid, uid), date });

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

    for (const i of sin) if (!isCancelled(i.StockIn.Status?.Code)) add(i.ProductID, i.StockIn.WarehouseID, num(i.Quantity), i.UnitID, i.StockIn.Date, 1);
    for (const i of sout) if (!isCancelled(i.StockOut.Status?.Code)) add(i.ProductID, i.StockOut.WarehouseID, num(i.Quantity), i.UnitID, i.StockOut.Date, -1);
    for (const i of trf) {
      const t = i.StockTransfer;
      if (isCancelled(t.Status?.Code)) continue;
      add(i.ProductID, t.FromWarehouseID, num(i.Quantity), i.UnitID, t.Date, -1);
      add(i.ProductID, t.ToWarehouseID, num(i.Quantity), i.UnitID, t.Date, 1);
    }
    for (const i of sale) if (!isCancelled(i.Sale.PaymentStatus?.Code)) add(i.ProductID, i.Sale.WarehouseID, num(i.Quantity), i.UnitID, i.Sale.Date, -1);
    for (const i of pur) if (!isCancelled(i.Purchase.Status?.Code) && !isCancelled(i.Purchase.PaymentStatus?.Code)) add(i.ProductID, i.Purchase.WarehouseID, num(i.Quantity), i.UnitID, i.Purchase.Date, 1);
    for (const i of sret) if (!isCancelled(i.SaleReturn.Status?.Code)) add(i.ProductID, i.SaleReturn.WarehouseID, num(i.Quantity), i.UnitID, i.SaleReturn.Date, 1);
    for (const i of pret) if (!isCancelled(i.PurchaseReturn.Status?.Code)) add(i.ProductID, i.PurchaseReturn.WarehouseID, num(i.Quantity), i.UnitID, i.PurchaseReturn.Date, -1);

    // Latest opname per (product, warehouse) = absolute baseline.
    const base = new Map<string, { date: Date; qty: number }>();
    for (const i of opn) {
      const o = i.StockOpname;
      const k = `${i.ProductID}:${o.WarehouseID}`;
      const cur = base.get(k);
      if (!cur || o.Date >= cur.date) base.set(k, { date: o.Date, qty: num(i.CountedStock) * factor(i.ProductID, i.UnitID) });
    }

    const calc = new Map<string, number>();
    const touched = new Set<number>();
    for (const [k, b] of base) { calc.set(k, b.qty); touched.add(Number(k.split(':')[0])); }
    for (const e of ev) {
      const k = `${e.pid}:${e.wh}`;
      const b = base.get(k);
      if (b && e.date <= b.date) continue; // already covered by the opname count
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
    return { rows, scanned: touched.size };
  }

  async preview(warehouseId?: number) {
    const { rows, scanned } = await this.compute(warehouseId);
    return { scanned, changed: rows.length, rows };
  }

  async apply(warehouseId?: number, productIds?: number[]) {
    const { rows, scanned } = await this.compute(warehouseId);
    const target = productIds?.length ? rows.filter((r) => productIds.includes(r.productId)) : rows;
    await this.prisma.$transaction(async (tx) => {
      for (const r of target) {
        for (const w of r.warehouses) {
          await tx.productStock.upsert({
            where: { ProductID_WarehouseID: { ProductID: r.productId, WarehouseID: w.warehouseId } },
            update: { Quantity: new Prisma.Decimal(w.newQty) },
            create: { ProductID: r.productId, WarehouseID: w.warehouseId, Quantity: new Prisma.Decimal(w.newQty), MinimumStock: new Prisma.Decimal(0) },
          });
        }
        // Product.Stock = total across all warehouses, re-summed inside the transaction.
        const agg = await tx.productStock.aggregate({ where: { ProductID: r.productId }, _sum: { Quantity: true } });
        await tx.product.update({ where: { ID: r.productId }, data: { Stock: agg._sum.Quantity ?? new Prisma.Decimal(0) } });
      }
    }, { timeout: 120000 });
    return { scanned, updated: target.length, rows: target };
  }
}
