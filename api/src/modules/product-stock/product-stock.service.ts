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
