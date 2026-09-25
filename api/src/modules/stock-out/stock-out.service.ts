import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { StockDocumentService } from '../../common/stock/stock-document.service';
import { StockLedgerService } from '../../common/stock/stock-ledger.service';
import { Prisma } from '@prisma/client';
import { CreateStockOutDto, UpdateStockOutDto } from './dto/stock-out.dto';

/**
 * Barang Keluar: stok keluar dari gudang dokumen lewat StockLedger (RefType STOCK_OUT),
 * ditolak bila stok gudang tidak cukup. Nilai keluar = HPP rata-rata produk.
 * Hapus = balik mutasi; ubah gudang = pindahkan mutasi ke gudang baru.
 */
@Injectable()
export class StockOutService extends StockDocumentService<any, CreateStockOutDto, UpdateStockOutDto> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
    private readonly ledger: StockLedgerService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'stockOut',
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

  async createStockOut(dto: CreateStockOutDto, userId: string) {
    if (!dto.Items || dto.Items.length === 0) {
      throw new BadRequestException('Item barang keluar tidak boleh kosong');
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
        const created = await tx.stockOut.create({
          data: {
            Code: code,
            Date: docDate,
            Warehouse: { connect: { ID: warehouseId } },
            ...(dto.ReferenceTypeID ? { ReferenceType: { connect: { ID: dto.ReferenceTypeID } } } : {}),
            ReferenceID: dto.ReferenceID,
            TotalItems: new Prisma.Decimal(totalItems),
            Description: dto.Description,
            Status: { connect: { ID: completedStatus.ID } },
            Creator: { connect: { ID: userId } },
            StockOutItems: { create: itemsData },
          },
          include: { StockOutItems: true },
        });

        for (const it of created.StockOutItems) {
          const base = await this.ledger.toBaseQty(tx, it.ProductID, it.UnitID, it.Quantity);
          await this.ledger.move(tx, {
            productId: it.ProductID,
            warehouseId,
            qty: base.neg(),
            refType: 'STOCK_OUT',
            refId: created.ID,
            refCode: created.Code,
            userId,
            date: docDate,
            notes: dto.Description,
          });
        }

        return tx.stockOut.findUniqueOrThrow({
          where: { ID: created.ID },
          include: { Warehouse: true, Status: true, Creator: true, StockOutItems: { include: { Product: true, Unit: true } } },
        });
      },
      { timeout: 30000 },
    );

    await this.afterWrite();
    return this.serializeStockOut(stockIn);
  }

  /** Ubah header. Ganti gudang = mutasi dipindah ke gudang baru. Item tidak dapat diubah. */
  async patchById(id: any, dto: Partial<UpdateStockOutDto>, userId?: string) {
    const doc = await this.prisma.stockOut.findUnique({ where: { ID: Number(id) } });
    if (!doc) throw new NotFoundException('Barang keluar tidak ditemukan');
    const result = await this.prisma.$transaction(async (tx) => {
      const data: Prisma.StockOutUncheckedUpdateInput = {};
      if (dto.WarehouseID && Number(dto.WarehouseID) !== doc.WarehouseID) {
        const wh = await this.ledger.resolveWarehouseId(tx, Number(dto.WarehouseID));
        await this.ledger.relocateRef(tx, ['STOCK_OUT'], doc.ID, wh, { refCode: doc.Code, userId });
        data.WarehouseID = wh;
      }
      if (dto.Date) data.Date = new Date(dto.Date);
      if (dto.Description !== undefined) data.Description = dto.Description;
      return tx.stockOut.update({ where: { ID: doc.ID }, data });
    });
    await this.afterWrite();
    return this.serializeStockOut(result);
  }

  async deleteById(id: any, userId?: string) {
    const doc = await this.prisma.stockOut.findUnique({ where: { ID: Number(id) }, include: { StockOutItems: true } });
    if (!doc) throw new NotFoundException('Barang keluar tidak ditemukan');
    await this.prisma.$transaction(
      async (tx) => {
        await this.ledger.reverseRef(tx, ['STOCK_OUT'], doc.ID, { refCode: doc.Code, userId, notes: `Hapus barang keluar ${doc.Code}` });
        await tx.stockOut.delete({ where: { ID: doc.ID } });
      },
      { timeout: 30000 },
    );
    await this.afterWrite();
    return this.serializeStockOut(doc);
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
    const prefix = `SO-${year}${month}`;

    const lastStockOut = await this.prisma.stockOut.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastStockOut) {
      const lastSeq = parseInt(lastStockOut.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private serializeStockOut(data: any): any {
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
    if (data.StockOutItems && Array.isArray(data.StockOutItems)) {
      result.StockOutItems = data.StockOutItems.map((item: any) => this.serializeStockOut(item));
    }
    return result;
  }
}
