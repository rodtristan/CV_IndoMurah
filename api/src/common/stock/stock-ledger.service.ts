// ================================================================
// stock-ledger.service.ts — Satu-satunya pintu perubahan stok
// ================================================================
//
// Model stok (berlaku untuk semua modul):
//   - Sumber kebenaran = ProductStock per (produk, gudang), dalam SATUAN DASAR.
//   - Product.Stock    = SUM(ProductStock.Quantity) semua gudang (dihitung ulang
//                        setiap kali ada mutasi, tidak pernah di-increment langsung).
//   - Setiap mutasi menulis satu baris StockLedger (kartu stok) dengan
//     BalanceAfter = saldo gudang tsb setelah mutasi.
//
// Semua method menerima `tx` (Prisma.TransactionClient) milik pemanggil,
// sehingga dokumen + stok + ledger tersimpan atomik dalam satu transaksi.
//
// Harga pokok (Product.PurchasePrice) memakai metode RATA-RATA TERTIMBANG
// (weighted average / moving average) per satuan dasar:
//   HPP baru = (stok lama × HPP lama + qty masuk × harga masuk) / (stok lama + qty masuk)
// Stok lama yang negatif dianggap 0. Harga masuk = subtotal baris setelah diskon
// (termasuk pro-rata diskon faktur, tanpa PPN) ÷ qty satuan dasar.
// ================================================================

import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma-service';
import { RedisService } from '../redis/redis-service';

export type StockRefType =
  | 'SALE'
  | 'SALE_RETURN'
  | 'PURCHASE'
  | 'PURCHASE_RETURN'
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'OPNAME'
  | 'OPENING'
  | 'ADJUST';

export const STOCK_REF_LABEL: Record<string, string> = {
  SALE: 'Penjualan',
  SALE_RETURN: 'Retur Penjualan',
  PURCHASE: 'Pembelian',
  PURCHASE_RETURN: 'Retur Pembelian',
  STOCK_IN: 'Barang Masuk',
  STOCK_OUT: 'Barang Keluar',
  TRANSFER_IN: 'Transfer Masuk',
  TRANSFER_OUT: 'Transfer Keluar',
  OPNAME: 'Stock Opname',
  OPENING: 'Saldo Awal',
  ADJUST: 'Penyesuaian',
};

type Tx = Prisma.TransactionClient;
type Num = number | string | Prisma.Decimal;

export interface StockMoveInput {
  productId: number;
  /** Gudang; kosong = gudang default (IsDefault, jika tidak ada → ID terkecil). */
  warehouseId?: number | null;
  /** Qty dalam SATUAN DASAR. Positif = masuk, negatif = keluar. */
  qty: Num;
  refType: StockRefType;
  refId?: number | null;
  refCode?: string | null;
  /** Harga pokok per satuan dasar untuk baris ledger (default: Product.PurchasePrice). */
  unitCost?: Num | null;
  notes?: string | null;
  userId?: string | null;
  /** Izinkan saldo gudang menjadi minus (default: ditolak). */
  allowNegative?: boolean;
  /** Tanggal mutasi (default: sekarang) — biasanya tanggal dokumen. */
  date?: Date | null;
}

export interface StockMoveResult {
  ledgerId: number;
  warehouseId: number;
  balanceAfter: Prisma.Decimal;
  productStock: Prisma.Decimal;
}

const D = (v: Num | null | undefined) => new Prisma.Decimal(v === null || v === undefined || v === '' ? 0 : v);
const fmtQty = (d: Prisma.Decimal) => {
  const n = Number(d);
  return Number.isInteger(n) ? n.toLocaleString('id-ID') : n.toLocaleString('id-ID', { maximumFractionDigits: 3 });
};

@Injectable()
export class StockLedgerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ─── Gudang ────────────────────────────────────────────────────────────

  /** Gudang default: IsDefault=true (aktif), jika tidak ada → gudang aktif dengan ID terkecil. */
  async getDefaultWarehouseId(tx: Tx | PrismaService = this.prisma): Promise<number> {
    const def =
      (await tx.warehouse.findFirst({ where: { IsDefault: true, IsActive: true }, orderBy: { ID: 'asc' }, select: { ID: true } })) ??
      (await tx.warehouse.findFirst({ where: { IsActive: true }, orderBy: { ID: 'asc' }, select: { ID: true } })) ??
      (await tx.warehouse.findFirst({ orderBy: { ID: 'asc' }, select: { ID: true } }));
    if (!def) throw new BadRequestException('Belum ada gudang. Tambahkan data gudang terlebih dahulu.');
    return def.ID;
  }

  async resolveWarehouseId(tx: Tx | PrismaService, warehouseId?: number | null): Promise<number> {
    if (warehouseId) {
      const wh = await tx.warehouse.findUnique({ where: { ID: warehouseId }, select: { ID: true } });
      if (!wh) throw new BadRequestException(`Gudang dengan ID ${warehouseId} tidak ditemukan`);
      return wh.ID;
    }
    return this.getDefaultWarehouseId(tx);
  }

  // ─── Konversi satuan ───────────────────────────────────────────────────

  /** Faktor konversi satuan → satuan dasar (ProductUnit.ConversionValue, 1 jika tidak ada). */
  async conversion(tx: Tx | PrismaService, productId: number, unitId?: number | null): Promise<Prisma.Decimal> {
    if (!unitId) return new Prisma.Decimal(1);
    const pu = await tx.productUnit.findUnique({
      where: { ProductID_UnitID: { ProductID: productId, UnitID: unitId } },
      select: { ConversionValue: true },
    });
    const c = pu ? new Prisma.Decimal(pu.ConversionValue) : new Prisma.Decimal(1);
    return c.lte(0) ? new Prisma.Decimal(1) : c;
  }

  /** Qty dalam satuan `unitId` → qty satuan dasar. */
  async toBaseQty(tx: Tx | PrismaService, productId: number, unitId: number | null | undefined, qty: Num): Promise<Prisma.Decimal> {
    const c = await this.conversion(tx, productId, unitId);
    return D(qty).mul(c).toDecimalPlaces(3);
  }

  // ─── Mutasi ────────────────────────────────────────────────────────────

  /**
   * Catat satu mutasi stok. Harus dipanggil di dalam $transaction milik pemanggil.
   * Menolak (400) bila saldo gudang menjadi minus, kecuali allowNegative.
   */
  async move(tx: Tx, input: StockMoveInput): Promise<StockMoveResult | null> {
    const qty = D(input.qty).toDecimalPlaces(3);
    if (qty.isZero()) return null;

    const product = await tx.product.findUnique({
      where: { ID: input.productId },
      select: { ID: true, Code: true, Name: true, PurchasePrice: true },
    });
    if (!product) throw new BadRequestException(`Produk dengan ID ${input.productId} tidak ditemukan`);
    const warehouseId = await this.resolveWarehouseId(tx, input.warehouseId);

    await this.ensureWarehouseRows(tx, product.ID, input.userId);

    // Atomic increment → baris ProductStock terkunci sampai transaksi selesai,
    // sehingga dua kasir yang menjual barang yang sama tidak bisa sama-sama lolos.
    const ps = await tx.productStock.upsert({
      where: { ProductID_WarehouseID: { ProductID: product.ID, WarehouseID: warehouseId } },
      create: { ProductID: product.ID, WarehouseID: warehouseId, Quantity: qty, MinimumStock: new Prisma.Decimal(0) },
      update: { Quantity: { increment: qty } },
    });
    const balance = new Prisma.Decimal(ps.Quantity);

    if (!input.allowNegative && qty.lt(0) && balance.lt(0)) {
      const wh = await tx.warehouse.findUnique({ where: { ID: warehouseId }, select: { Name: true } });
      const before = balance.minus(qty);
      throw new BadRequestException(
        `Stok ${product.Name} di ${wh?.Name ?? `gudang #${warehouseId}`} tidak cukup (sisa ${fmtQty(before)}, dibutuhkan ${fmtQty(qty.neg())})`,
      );
    }

    const total = await this.syncProductTotal(tx, product.ID);

    const ledger = await tx.stockLedger.create({
      data: {
        Date: input.date ?? new Date(),
        ProductID: product.ID,
        WarehouseID: warehouseId,
        RefType: input.refType,
        RefID: input.refId ?? null,
        RefCode: input.refCode ?? null,
        QtyIn: qty.gt(0) ? qty : new Prisma.Decimal(0),
        QtyOut: qty.lt(0) ? qty.neg() : new Prisma.Decimal(0),
        BalanceAfter: balance,
        UnitCost: D(input.unitCost ?? product.PurchasePrice).toDecimalPlaces(2),
        Notes: input.notes ? String(input.notes).slice(0, 500) : null,
        CreatedByID: input.userId ?? null,
      },
      select: { ID: true },
    });

    return { ledgerId: ledger.ID, warehouseId, balanceAfter: balance, productStock: total };
  }

  /**
   * Jumlah bersih mutasi ledger sebuah dokumen per (produk, gudang).
   * Dipakai untuk membatalkan dokumen secara idempoten.
   */
  async netByRef(tx: Tx | PrismaService, refTypes: StockRefType[], refId: number) {
    const rows = await tx.stockLedger.groupBy({
      by: ['ProductID', 'WarehouseID', 'RefType'],
      where: { RefType: { in: refTypes }, RefID: refId },
      _sum: { QtyIn: true, QtyOut: true },
    });
    return rows
      .map((r) => ({
        productId: r.ProductID,
        warehouseId: r.WarehouseID,
        refType: r.RefType as StockRefType,
        net: D(r._sum.QtyIn ?? 0).minus(D(r._sum.QtyOut ?? 0)),
      }))
      .filter((r) => !r.net.isZero());
  }

  /**
   * Batalkan seluruh efek stok dokumen (RefType+RefID): menulis mutasi lawan
   * sebesar saldo bersih. Idempoten — dokumen yang sudah dibatalkan menghasilkan 0 baris.
   * Urutan: mutasi MASUK dibalik lebih dulu (mis. TRANSFER_IN sebelum TRANSFER_OUT).
   */
  async reverseRef(
    tx: Tx,
    refTypes: StockRefType[],
    refId: number,
    opts: { refCode?: string | null; userId?: string | null; notes?: string; allowNegative?: boolean; unitCost?: (productId: number) => Num | undefined } = {},
  ) {
    const nets = await this.netByRef(tx, refTypes, refId);
    nets.sort((a, b) => Number(b.net.gt(0)) - Number(a.net.gt(0)));
    const out: { productId: number; warehouseId: number; qty: Prisma.Decimal; refType: StockRefType }[] = [];
    for (const n of nets) {
      await this.move(tx, {
        productId: n.productId,
        warehouseId: n.warehouseId,
        qty: n.net.neg(),
        refType: n.refType,
        refId,
        refCode: opts.refCode,
        userId: opts.userId,
        notes: opts.notes ?? `Pembatalan ${opts.refCode ?? ''}`.trim(),
        allowNegative: opts.allowNegative,
        unitCost: opts.unitCost?.(n.productId),
      });
      out.push({ productId: n.productId, warehouseId: n.warehouseId, qty: n.net.neg(), refType: n.refType });
    }
    return out;
  }

  /**
   * Pindahkan efek stok dokumen ke gudang lain (header dokumen diubah gudangnya):
   * efek bersih di gudang lama dibatalkan dan diterapkan di gudang baru.
   */
  async relocateRef(
    tx: Tx,
    refTypes: StockRefType[],
    refId: number,
    toWarehouseId: number,
    opts: { refCode?: string | null; userId?: string | null; date?: Date | null } = {},
  ) {
    const nets = (await this.netByRef(tx, refTypes, refId)).filter((n) => n.warehouseId !== toWarehouseId);
    const plan: StockMoveInput[] = [];
    for (const n of nets) {
      const note = `Pindah gudang ${opts.refCode ?? ''}`.trim();
      plan.push({ productId: n.productId, warehouseId: n.warehouseId, qty: n.net.neg(), refType: n.refType, refId, refCode: opts.refCode, userId: opts.userId, notes: note });
      plan.push({ productId: n.productId, warehouseId: toWarehouseId, qty: n.net, refType: n.refType, refId, refCode: opts.refCode, userId: opts.userId, notes: note, date: opts.date });
    }
    plan.sort((a, b) => Number(D(b.qty).gt(0)) - Number(D(a.qty).gt(0)));
    for (const m of plan) await this.move(tx, m);
    return plan.length;
  }

  // ─── Harga pokok rata-rata ─────────────────────────────────────────────

  /**
   * Terapkan barang masuk ke HPP rata-rata. Panggil SEBELUM move() (memakai
   * Product.Stock sebelum mutasi). qty & unitCost dalam satuan dasar.
   */
  async applyAverageCostIn(tx: Tx, productId: number, qty: Num, unitCost: Num) {
    const q = D(qty);
    const c = D(unitCost);
    if (q.lte(0) || c.lt(0)) return;
    const p = await tx.product.findUnique({ where: { ID: productId }, select: { Stock: true, PurchasePrice: true } });
    if (!p) return;
    const oldQty = Prisma.Decimal.max(D(p.Stock), 0);
    const oldCost = D(p.PurchasePrice);
    const newQty = oldQty.plus(q);
    const avg = oldQty.isZero() || oldCost.isZero() ? c : oldQty.mul(oldCost).plus(q.mul(c)).div(newQty);
    await tx.product.update({ where: { ID: productId }, data: { PurchasePrice: avg.toDecimalPlaces(2) } });
  }

  /**
   * Keluarkan barang yang dulu masuk dengan harga `unitCost` dari HPP rata-rata
   * (pembatalan pembelian / retur pembelian). Panggil SEBELUM move().
   */
  async applyAverageCostOut(tx: Tx, productId: number, qty: Num, unitCost: Num) {
    const q = D(qty);
    const c = D(unitCost);
    if (q.lte(0)) return;
    const p = await tx.product.findUnique({ where: { ID: productId }, select: { Stock: true, PurchasePrice: true } });
    if (!p) return;
    const curQty = D(p.Stock);
    const rest = curQty.minus(q);
    if (rest.lte(0)) return; // stok habis → HPP terakhir dipertahankan
    const avg = curQty.mul(D(p.PurchasePrice)).minus(q.mul(c)).div(rest);
    if (avg.lte(0)) return;
    await tx.product.update({ where: { ID: productId }, data: { PurchasePrice: avg.toDecimalPlaces(2) } });
  }

  // ─── Sinkronisasi ──────────────────────────────────────────────────────

  /** Product.Stock = SUM(ProductStock.Quantity). */
  async syncProductTotal(tx: Tx, productId: number): Promise<Prisma.Decimal> {
    const agg = await tx.productStock.aggregate({ where: { ProductID: productId }, _sum: { Quantity: true } });
    const total = D(agg._sum.Quantity ?? 0);
    await tx.product.update({ where: { ID: productId }, data: { Stock: total } });
    return total;
  }

  /**
   * Data lama: produk yang punya Product.Stock tetapi belum punya baris ProductStock
   * sama sekali. Sebelum mutasi pertama, stok global itu dipindah ke gudang default
   * (dengan ledger OPENING) agar tidak hilang saat Product.Stock dihitung ulang.
   */
  async ensureWarehouseRows(tx: Tx, productId: number, userId?: string | null) {
    const count = await tx.productStock.count({ where: { ProductID: productId } });
    if (count > 0) return;
    const p = await tx.product.findUnique({ where: { ID: productId }, select: { Stock: true, PurchasePrice: true } });
    const legacy = D(p?.Stock ?? 0);
    if (legacy.isZero()) return;
    const wh = await this.getDefaultWarehouseId(tx);
    await tx.productStock.create({ data: { ProductID: productId, WarehouseID: wh, Quantity: legacy, MinimumStock: new Prisma.Decimal(0) } });
    await tx.stockLedger.create({
      data: {
        ProductID: productId,
        WarehouseID: wh,
        RefType: 'OPENING',
        QtyIn: legacy.gt(0) ? legacy : new Prisma.Decimal(0),
        QtyOut: legacy.lt(0) ? legacy.neg() : new Prisma.Decimal(0),
        BalanceAfter: legacy,
        UnitCost: D(p?.PurchasePrice ?? 0),
        Notes: 'Saldo awal otomatis dari stok global (data lama)',
        CreatedByID: userId ?? null,
      },
    });
  }

  /** Hapus cache daftar produk/stok setelah transaksi stok selesai (panggil di luar tx). */
  async invalidateCaches() {
    await Promise.all([
      this.redis.invalidatePattern('product:*'),
      this.redis.invalidatePattern('productStock:*'),
      this.redis.invalidatePattern('stockLedger:*'),
      this.redis.invalidatePattern('reports:*'),
    ]);
  }
}
