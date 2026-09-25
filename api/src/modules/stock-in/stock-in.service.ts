import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { StockDocumentService } from '../../common/stock/stock-document.service';
import { StockLedgerService } from '../../common/stock/stock-ledger.service';
import { Prisma } from '@prisma/client';
import { CreateStockInDto, UpdateStockInDto } from './dto/stock-in.dto';

/**
 * Barang Masuk: stok masuk ke gudang dokumen lewat StockLedger (RefType STOCK_IN).
 * Bila harga diisi (> 0), HPP rata-rata produk ikut diperbarui.
 * Hapus = balik mutasi; ubah gudang = pindahkan mutasi ke gudang baru.
 */
@Injectable()
export class StockInService extends StockDocumentService<any, CreateStockInDto, UpdateStockInDto> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
    private readonly ledger: StockLedgerService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'stockIn',
      primaryKey: 'ID',
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { CreatedAt: 'desc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: false,
    });
  }

  async createStockIn(dto: CreateStockInDto, userId: string) {
    if (!dto.Items || dto.Items.length === 0) {
      throw new BadRequestException('Item barang masuk tidak boleh kosong');
    }
    if (dto.Items.some((i) => !(Number(i.Quantity) > 0))) throw new BadRequestException('Jumlah item harus lebih dari 0');

    const code = await this.generateCode();
    const completedStatus = await this.getTransactionStatusByCode('COMPLETED');
    const docDate = dto.Date ? new Date(dto.Date) : new Date();
    const totalItems = dto.Items.reduce((sum, item) => sum + Number(item.Quantity), 0);

    const itemsData = dto.Items.map((item) => {
      const unitPrice = item.UnitPrice ?? 0;
      const subtotal = item.Subtotal !== undefined ? item.Subtotal : item.Quantity * unitPrice;
      return {
        ProductID: item.ProductID,
        Quantity: new Prisma.Decimal(item.Quantity),
        UnitID: item.UnitID,
        UnitPrice: new Prisma.Decimal(unitPrice),
        Subtotal: new Prisma.Decimal(subtotal),
      };
    });

    const stockIn = await this.prisma.$transaction(
      async (tx) => {
        const warehouseId = await this.ledger.resolveWarehouseId(tx, dto.WarehouseID);
        const created = await tx.stockIn.create({
          data: {
            Code: code,
            Date: docDate,
            Warehouse: { connect: { ID: warehouseId } },
            ...(dto.SupplierID ? { Supplier: { connect: { ID: dto.SupplierID } } } : {}),
            ...(dto.ReferenceTypeID ? { ReferenceType: { connect: { ID: dto.ReferenceTypeID } } } : {}),
            ReferenceID: dto.ReferenceID,
            TotalItems: new Prisma.Decimal(totalItems),
            Description: dto.Description,
            Status: { connect: { ID: completedStatus.ID } },
            Creator: { connect: { ID: userId } },
            StockInItems: { create: itemsData },
          },
          include: { StockInItems: true },
        });

        for (const it of created.StockInItems) {
          const conv = await this.ledger.conversion(tx, it.ProductID, it.UnitID);
          const base = new Prisma.Decimal(it.Quantity).mul(conv);
          const price = Number(it.UnitPrice);
          const unitCost = price > 0 ? new Prisma.Decimal(price).div(conv) : undefined;
          if (unitCost) await this.ledger.applyAverageCostIn(tx, it.ProductID, base, unitCost);
          await this.ledger.move(tx, {
            productId: it.ProductID,
            warehouseId,
            qty: base,
            refType: 'STOCK_IN',
            refId: created.ID,
            refCode: created.Code,
            unitCost,
            userId,
            date: docDate,
            notes: dto.Description,
          });
        }

        return tx.stockIn.findUniqueOrThrow({
          where: { ID: created.ID },
          include: { Warehouse: true, Supplier: true, Status: true, Creator: true, StockInItems: { include: { Product: true, Unit: true } } },
        });
      },
      { timeout: 30000 },
    );

    await this.afterWrite();
    return this.serializeStockIn(stockIn);
  }

  /** Ubah header. Ganti gudang = mutasi dipindah ke gudang baru. Item tidak dapat diubah. */
  async patchById(id: any, dto: Partial<UpdateStockInDto>, userId?: string) {
    const doc = await this.prisma.stockIn.findUnique({ where: { ID: Number(id) } });
    if (!doc) throw new NotFoundException('Barang masuk tidak ditemukan');
    const result = await this.prisma.$transaction(async (tx) => {
      const data: Prisma.StockInUncheckedUpdateInput = {};
      if (dto.WarehouseID && Number(dto.WarehouseID) !== doc.WarehouseID) {
        const wh = await this.ledger.resolveWarehouseId(tx, Number(dto.WarehouseID));
        await this.ledger.relocateRef(tx, ['STOCK_IN'], doc.ID, wh, { refCode: doc.Code, userId });
        data.WarehouseID = wh;
      }
      if (dto.SupplierID !== undefined) data.SupplierID = dto.SupplierID || null;
      if (dto.Date) data.Date = new Date(dto.Date);
      if (dto.Description !== undefined) data.Description = dto.Description;
      return tx.stockIn.update({ where: { ID: doc.ID }, data });
    });
    await this.afterWrite();
    return this.serializeStockIn(result);
  }

  async deleteById(id: any, userId?: string) {
    const doc = await this.prisma.stockIn.findUnique({ where: { ID: Number(id) }, include: { StockInItems: true } });
    if (!doc) throw new NotFoundException('Barang masuk tidak ditemukan');
    await this.prisma.$transaction(
      async (tx) => {
        const priced = new Map<number, Prisma.Decimal>();
        for (const it of doc.StockInItems) {
          if (Number(it.UnitPrice) > 0) priced.set(it.ProductID, new Prisma.Decimal(it.UnitPrice).div(await this.ledger.conversion(tx, it.ProductID, it.UnitID)));
        }
        const nets = await this.ledger.netByRef(tx, ['STOCK_IN'], doc.ID);
        for (const n of nets) {
          const cost = priced.get(n.productId);
          if (cost && n.net.gt(0)) await this.ledger.applyAverageCostOut(tx, n.productId, n.net, cost);
          await this.ledger.move(tx, {
            productId: n.productId,
            warehouseId: n.warehouseId,
            qty: n.net.neg(),
            refType: 'STOCK_IN',
            refId: doc.ID,
            refCode: doc.Code,
            unitCost: cost,
            userId,
            notes: `Hapus barang masuk ${doc.Code}`,
          });
        }
        await tx.stockIn.delete({ where: { ID: doc.ID } });
      },
      { timeout: 30000 },
    );
    await this.afterWrite();
    return this.serializeStockIn(doc);
  }

  private async afterWrite() {
    await this.invalidateCache();
    await this.ledger.invalidateCaches();
  }

  private async getTransactionStatusByCode(code: string) {
    const status = await this.prisma.transactionStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Transaction status '${code}' tidak ditemukan`);
    return status;
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SI-${year}${month}`;

    const lastStockIn = await this.prisma.stockIn.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastStockIn) {
      const lastSeq = parseInt(lastStockIn.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private serializeStockIn(data: any): any {
    if (!data) return null;
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Prisma.Decimal) {
        result[key] = Number(value);
      } else if (value instanceof Date) {
        result[key] = value.toISOString();
      } else {
        result[key] = value;
      }
    }
    if (data.StockInItems && Array.isArray(data.StockInItems)) {
      result.StockInItems = data.StockInItems.map((item: any) => this.serializeStockIn(item));
    }
    return result;
  }
}
