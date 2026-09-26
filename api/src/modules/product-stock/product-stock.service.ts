import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { StockDocumentService } from '../../common/stock/stock-document.service';
import { StockLedgerService } from '../../common/stock/stock-ledger.service';
import { CreateProductStockDto, UpdateProductStockDto } from './dto/product-stock.dto';
import { Prisma } from '@prisma/client';

type Any = Record<string, any>;
const pick = (dto: Any, camel: string, pascal: string) => (dto[camel] !== undefined ? dto[camel] : dto[pascal]);

/**
 * Stok per gudang (Saldo Awal Item). Mengubah Quantity = menetapkan saldo gudang:
 * selisihnya dibukukan lewat StockLedger (RefType OPENING) sehingga ProductStock,
 * Product.Stock (= jumlah semua gudang) dan kartu stok selalu konsisten.
 */
@Injectable()
export class ProductStockService extends StockDocumentService<any, CreateProductStockDto, UpdateProductStockDto> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
    private readonly ledger: StockLedgerService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'productStock',
      primaryKey: 'ID',
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { UpdatedAt: 'desc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: false,
    });
  }

  /** Tetapkan saldo (produk, gudang). Baris dibuat bila belum ada. */
  async createOpening(dto: CreateProductStockDto, userId?: string) {
    const d = dto as Any;
    const productId = Number(pick(d, 'productId', 'ProductID'));
    const warehouseId = Number(pick(d, 'warehouseId', 'WarehouseID'));
    if (!productId || !warehouseId) throw new BadRequestException('Produk dan gudang wajib diisi');
    const row = await this.prisma.$transaction((tx) =>
      this.setQuantity(tx, productId, warehouseId, pick(d, 'quantity', 'Quantity'), pick(d, 'minimumStock', 'MinimumStock'), d, userId),
    );
    await this.afterWrite();
    return row;
  }

  async patchById(id: any, dto: Partial<UpdateProductStockDto>, userId?: string) {
    const d = dto as Any;
    const row = await this.prisma.productStock.findUnique({ where: { ID: Number(id) } });
    if (!row) throw new NotFoundException('Data stok tidak ditemukan');
    const pid = pick(d, 'productId', 'ProductID');
    const wid = pick(d, 'warehouseId', 'WarehouseID');
    if ((pid !== undefined && Number(pid) !== row.ProductID) || (wid !== undefined && Number(wid) !== row.WarehouseID)) {
      throw new BadRequestException('Produk/gudang tidak dapat diubah. Hapus baris lalu tambahkan di gudang yang benar.');
    }
    const result = await this.prisma.$transaction((tx) =>
      this.setQuantity(tx, row.ProductID, row.WarehouseID, pick(d, 'quantity', 'Quantity'), pick(d, 'minimumStock', 'MinimumStock'), d, userId),
    );
    await this.afterWrite();
    return result;
  }

  /** Hapus baris: saldo gudang dinolkan lewat ledger (OPENING) lalu baris dihapus. */
  async deleteById(id: any, userId?: string) {
    const row = await this.prisma.productStock.findUnique({ where: { ID: Number(id) } });
    if (!row) throw new NotFoundException('Data stok tidak ditemukan');
    await this.prisma.$transaction(async (tx) => {
      await this.ledger.move(tx, {
        productId: row.ProductID,
        warehouseId: row.WarehouseID,
        qty: new Prisma.Decimal(row.Quantity).neg(),
        refType: 'OPENING',
        userId,
        notes: 'Hapus saldo stok gudang',
        allowNegative: true,
      });
      await tx.productStock.delete({ where: { ID: row.ID } });
      await this.ledger.syncProductTotal(tx, row.ProductID);
    });
    await this.afterWrite();
    return row;
  }

  /** Saldo Awal Item (Ketoko): jumlah bersih mutasi OPENING per item & gudang, harga = HPP saldo awal terakhir. */
  async openingList(warehouseId?: number) {
    const rows = await this.prisma.stockLedger.findMany({
      where: { RefType: 'OPENING', ...(warehouseId ? { WarehouseID: warehouseId } : {}) },
      orderBy: { ID: 'asc' },
      select: { ProductID: true, WarehouseID: true, QtyIn: true, QtyOut: true, UnitCost: true, Date: true },
    });
    const map = new Map<string, { ProductID: number; WarehouseID: number; Quantity: number; UnitPrice: number; Date: Date }>();
    for (const r of rows) {
      const k = `${r.ProductID}:${r.WarehouseID}`;
      const cur = map.get(k) ?? { ProductID: r.ProductID, WarehouseID: r.WarehouseID, Quantity: 0, UnitPrice: 0, Date: r.Date };
      cur.Quantity += Number(r.QtyIn) - Number(r.QtyOut);
      if (Number(r.QtyIn) > 0 && Number(r.UnitCost) > 0) cur.UnitPrice = Number(r.UnitCost);
      if (r.Date < cur.Date) cur.Date = r.Date;
      map.set(k, cur);
    }
    const list = [...map.values()].filter((x) => Math.abs(x.Quantity) > 0.0005);
    const [products, warehouses] = await Promise.all([
      this.prisma.product.findMany({ where: { ID: { in: list.map((x) => x.ProductID) } }, select: { ID: true, Code: true, Name: true, PurchasePrice: true, Unit: { select: { Name: true } } } }),
      this.prisma.warehouse.findMany({ select: { ID: true, Code: true, Name: true } }),
    ]);
    const pm = new Map(products.map((p) => [p.ID, p]));
    const wm = new Map(warehouses.map((w) => [w.ID, w]));
    return list
      .map((x) => {
        const p = pm.get(x.ProductID);
        const w = wm.get(x.WarehouseID);
        const price = x.UnitPrice || Number(p?.PurchasePrice ?? 0);
        return {
          ProductID: x.ProductID, Code: p?.Code ?? '', Name: p?.Name ?? '', Unit: p?.Unit?.Name ?? '',
          WarehouseID: x.WarehouseID, WarehouseCode: w?.Code ?? '', WarehouseName: w?.Name ?? '',
          Quantity: Math.round(x.Quantity * 1000) / 1000, UnitPrice: price, Total: Math.round(x.Quantity * price * 100) / 100, Date: x.Date.toISOString(),
        };
      })
      .sort((a, b) => a.Code.localeCompare(b.Code) || a.WarehouseCode.localeCompare(b.WarehouseCode));
  }

  /**
   * Simpan Saldo Awal Item: tiap baris menetapkan saldo OPENING (item, gudang) — selisih terhadap saldo
   * awal sebelumnya dibukukan sebagai mutasi OPENING (stok & kartu stok ikut). Removed = saldo awal dinolkan.
   */
  async saveOpening(body: { Date?: string; Items?: any[]; Removed?: any[] }, userId?: string) {
    const date = body.Date ? new Date(body.Date) : new Date();
    const items = (body.Items ?? []).map((i) => ({ ProductID: Number(i.ProductID), WarehouseID: Number(i.WarehouseID), Quantity: Number(i.Quantity), UnitPrice: Number(i.UnitPrice ?? 0) }));
    const removed = (body.Removed ?? []).map((i) => ({ ProductID: Number(i.ProductID), WarehouseID: Number(i.WarehouseID), Quantity: 0, UnitPrice: 0 }));
    for (const i of items) {
      if (!i.ProductID || !i.WarehouseID) throw new BadRequestException('Item dan gudang wajib diisi');
      if (!(i.Quantity >= 0)) throw new BadRequestException('Jumlah saldo awal tidak boleh minus');
    }
    const keys = new Set<string>();
    for (const i of items) {
      const k = `${i.ProductID}:${i.WarehouseID}`;
      if (keys.has(k)) throw new BadRequestException('Item yang sama di gudang yang sama tidak boleh dobel');
      keys.add(k);
    }
    await this.prisma.$transaction(async (tx) => {
      for (const i of [...removed.filter((r) => !keys.has(`${r.ProductID}:${r.WarehouseID}`)), ...items]) {
        const agg = await tx.stockLedger.aggregate({ where: { RefType: 'OPENING', ProductID: i.ProductID, WarehouseID: i.WarehouseID }, _sum: { QtyIn: true, QtyOut: true } });
        const current = Number(agg._sum.QtyIn ?? 0) - Number(agg._sum.QtyOut ?? 0);
        const delta = new Prisma.Decimal(i.Quantity).minus(current);
        if (delta.isZero()) continue;
        await this.ledger.ensureWarehouseRows(tx, i.ProductID, userId);
        if (delta.gt(0) && i.UnitPrice > 0) await this.ledger.applyAverageCostIn(tx, i.ProductID, delta, i.UnitPrice);
        await this.ledger.move(tx, {
          productId: i.ProductID, warehouseId: i.WarehouseID, qty: delta, refType: 'OPENING',
          unitCost: i.UnitPrice > 0 ? i.UnitPrice : undefined, userId, date, notes: 'Saldo awal item', allowNegative: true,
        });
      }
    }, { timeout: 60000 });
    await this.afterWrite();
    return this.openingList();
  }

  /**
   * Proses Perbaikan Saldo (Ketoko): saldo berjalan kartu stok (BalanceAfter) dihitung ulang berurutan
   * tanggal, lalu stok per gudang (ProductStock) = Σ mutasi kartu stok dan stok item = Σ semua gudang.
   */
  async repairBalances(warehouseId?: number) {
    const whSql = warehouseId ? Prisma.sql`WHERE "WarehouseID" = ${warehouseId}` : Prisma.empty;
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`UPDATE "StockLedgers" sl SET "BalanceAfter" = x.bal
        FROM (SELECT "ID", SUM("QtyIn" - "QtyOut") OVER (PARTITION BY "ProductID", "WarehouseID" ORDER BY "Date", "ID") AS bal
              FROM "StockLedgers" ${whSql}) x
        WHERE sl."ID" = x."ID" AND sl."BalanceAfter" IS DISTINCT FROM x.bal`;
      const sums = await tx.$queryRaw<{ ProductID: number; WarehouseID: number; qty: Prisma.Decimal }[]>`
        SELECT "ProductID", "WarehouseID", SUM("QtyIn" - "QtyOut") AS qty FROM "StockLedgers" ${whSql} GROUP BY "ProductID", "WarehouseID"`;
      let fixed = 0;
      const touched = new Set<number>();
      for (const r of sums) {
        const cur = await tx.productStock.findUnique({ where: { ProductID_WarehouseID: { ProductID: r.ProductID, WarehouseID: r.WarehouseID } } });
        const qty = new Prisma.Decimal(r.qty ?? 0);
        if (!cur) {
          await tx.productStock.create({ data: { ProductID: r.ProductID, WarehouseID: r.WarehouseID, Quantity: qty, MinimumStock: new Prisma.Decimal(0) } });
          fixed++;
        } else if (!new Prisma.Decimal(cur.Quantity).equals(qty)) {
          await tx.productStock.update({ where: { ID: cur.ID }, data: { Quantity: qty } });
          fixed++;
        }
        touched.add(r.ProductID);
      }
      for (const pid of touched) await this.ledger.syncProductTotal(tx, pid);
      return { items: sums.length, fixed, products: touched.size };
    }, { timeout: 300000 });
    await this.afterWrite();
    return result;
  }

  private async setQuantity(
    tx: Prisma.TransactionClient,
    productId: number,
    warehouseId: number,
    quantity: unknown,
    minimumStock: unknown,
    d: Any,
    userId?: string,
  ) {
    const product = await tx.product.findUnique({ where: { ID: productId }, select: { ID: true } });
    if (!product) throw new BadRequestException(`Produk dengan ID ${productId} tidak ditemukan`);
    const wh = await this.ledger.resolveWarehouseId(tx, warehouseId);
    // data lama (stok global tanpa baris gudang) dipindah dulu ke gudang default
    await this.ledger.ensureWarehouseRows(tx, productId, userId);

    if (quantity !== undefined && quantity !== null && quantity !== '') {
      const target = new Prisma.Decimal(quantity as any);
      if (target.lt(0)) throw new BadRequestException('Saldo stok tidak boleh minus');
      const cur = await tx.productStock.findUnique({ where: { ProductID_WarehouseID: { ProductID: productId, WarehouseID: wh } } });
      const delta = target.minus(cur?.Quantity ?? 0);
      const price = Number(pick(d, 'unitPrice', 'UnitPrice') ?? 0);
      const date = pick(d, 'date', 'Date');
      if (!delta.isZero()) {
        if (delta.gt(0) && price > 0) await this.ledger.applyAverageCostIn(tx, productId, delta, price);
        await this.ledger.move(tx, {
          productId,
          warehouseId: wh,
          qty: delta,
          refType: 'OPENING',
          unitCost: price > 0 ? price : undefined,
          userId,
          date: date ? new Date(date) : undefined,
          notes: 'Saldo awal / koreksi saldo gudang',
          allowNegative: true,
        });
      }
    }

    const data: Prisma.ProductStockUncheckedUpdateInput = {};
    if (minimumStock !== undefined && minimumStock !== null && minimumStock !== '') data.MinimumStock = new Prisma.Decimal(minimumStock as any);
    return tx.productStock.upsert({
      where: { ProductID_WarehouseID: { ProductID: productId, WarehouseID: wh } },
      create: { ProductID: productId, WarehouseID: wh, Quantity: new Prisma.Decimal(0), MinimumStock: (data.MinimumStock as Prisma.Decimal) ?? new Prisma.Decimal(0) },
      update: data,
    });
  }

  private async afterWrite() {
    await this.invalidateCache();
    await this.ledger.invalidateCaches();
  }
}
