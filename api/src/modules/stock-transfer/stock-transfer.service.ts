import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { StockDocumentService } from '../../common/stock/stock-document.service';
import { StockLedgerService } from '../../common/stock/stock-ledger.service';
import { Prisma } from '@prisma/client';
import { CreateStockTransferDto, UpdateStockTransferDto } from './dto/stock-transfer.dto';

/**
 * Transfer antar gudang: TRANSFER_OUT dari gudang asal (ditolak bila stok tidak cukup) dan
 * TRANSFER_IN ke gudang tujuan, atomik dalam satu transaksi. Total Product.Stock tetap.
 */
@Injectable()
export class StockTransferService extends StockDocumentService<
  any,
  CreateStockTransferDto,
  UpdateStockTransferDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
    private readonly ledger: StockLedgerService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'stockTransfer',
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

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC METHODS
  // ═══════════════════════════════════════════════════════════════════

  async createStockTransfer(dto: CreateStockTransferDto, userId: string) {
    if (!dto.Items || dto.Items.length === 0) {
      throw new BadRequestException('Stock transfer items tidak boleh kosong');
    }

    if (dto.FromWarehouseID === dto.ToWarehouseID) {
      throw new BadRequestException('Gudang asal dan tujuan tidak boleh sama');
    }

    const code = await this.generateCode();
    const completedStatus = await this.getTransactionStatusByCode('COMPLETED');

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

    if (dto.Items.some((i) => !(Number(i.Quantity) > 0))) throw new BadRequestException('Jumlah item harus lebih dari 0');
    const docDate = dto.Date ? new Date(dto.Date) : new Date();

    const stockTransfer = await this.prisma.$transaction(
      async (tx) => {
        const fromId = await this.ledger.resolveWarehouseId(tx, dto.FromWarehouseID);
        const toId = await this.ledger.resolveWarehouseId(tx, dto.ToWarehouseID);
        const created = await tx.stockTransfer.create({
          data: {
            Code: code,
            Date: docDate,
            FromWarehouse: { connect: { ID: fromId } },
            ToWarehouse: { connect: { ID: toId } },
            TotalItems: new Prisma.Decimal(totalItems),
            Notes: dto.Notes,
            Status: { connect: { ID: completedStatus.ID } },
            Creator: { connect: { ID: userId } },
            TransferItems: { create: itemsData },
          },
          include: { TransferItems: true },
        });

        for (const it of created.TransferItems) {
          const base = await this.ledger.toBaseQty(tx, it.ProductID, it.UnitID, it.Quantity);
          const common = { productId: it.ProductID, refId: created.ID, refCode: created.Code, userId, date: docDate, notes: dto.Notes };
          await this.ledger.move(tx, { ...common, warehouseId: fromId, qty: base.neg(), refType: 'TRANSFER_OUT' });
          await this.ledger.move(tx, { ...common, warehouseId: toId, qty: base, refType: 'TRANSFER_IN' });
        }

        return tx.stockTransfer.findUniqueOrThrow({
          where: { ID: created.ID },
          include: {
            FromWarehouse: true,
            ToWarehouse: true,
            Status: true,
            Creator: true,
            TransferItems: { include: { Product: true, Unit: true } },
          },
        });
      },
      { timeout: 30000 },
    );

    await this.afterWrite();
    return this.serializeStockTransfer(stockTransfer);
  }

  /** Ubah header; ganti gudang asal/tujuan = mutasi dipindahkan. Item tidak dapat diubah. */
  async patchById(id: any, dto: Partial<UpdateStockTransferDto>, userId?: string) {
    const doc = await this.prisma.stockTransfer.findUnique({ where: { ID: Number(id) } });
    if (!doc) throw new NotFoundException('Transfer tidak ditemukan');
    const from = dto.FromWarehouseID ? Number(dto.FromWarehouseID) : doc.FromWarehouseID;
    const to = dto.ToWarehouseID ? Number(dto.ToWarehouseID) : doc.ToWarehouseID;
    if (from === to) throw new BadRequestException('Gudang asal dan tujuan tidak boleh sama');
    const result = await this.prisma.$transaction(async (tx) => {
      const data: Prisma.StockTransferUncheckedUpdateInput = {};
      if (to !== doc.ToWarehouseID) {
        const wh = await this.ledger.resolveWarehouseId(tx, to);
        await this.ledger.relocateRef(tx, ['TRANSFER_IN'], doc.ID, wh, { refCode: doc.Code, userId });
        data.ToWarehouseID = wh;
      }
      if (from !== doc.FromWarehouseID) {
        const wh = await this.ledger.resolveWarehouseId(tx, from);
        await this.ledger.relocateRef(tx, ['TRANSFER_OUT'], doc.ID, wh, { refCode: doc.Code, userId });
        data.FromWarehouseID = wh;
      }
      if (dto.Date) data.Date = new Date(dto.Date);
      if (dto.Notes !== undefined) data.Notes = dto.Notes;
      return tx.stockTransfer.update({ where: { ID: doc.ID }, data });
    });
    await this.afterWrite();
    return this.serializeStockTransfer(result);
  }

  async deleteById(id: any, userId?: string) {
    const doc = await this.prisma.stockTransfer.findUnique({ where: { ID: Number(id) } });
    if (!doc) throw new NotFoundException('Transfer tidak ditemukan');
    await this.prisma.$transaction(
      async (tx) => {
        await this.ledger.reverseRef(tx, ['TRANSFER_IN', 'TRANSFER_OUT'], doc.ID, { refCode: doc.Code, userId, notes: `Hapus transfer ${doc.Code}` });
        await tx.stockTransfer.delete({ where: { ID: doc.ID } });
      },
      { timeout: 30000 },
    );
    await this.afterWrite();
    return this.serializeStockTransfer(doc);
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
    const prefix = `TR-${year}${month}`;

    const lastStockTransfer = await this.prisma.stockTransfer.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastStockTransfer) {
      const lastSeq = parseInt(lastStockTransfer.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private serializeStockTransfer(data: any): any {
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
    if (data.TransferItems && Array.isArray(data.TransferItems)) {
      result.TransferItems = data.TransferItems.map((item: any) => this.serializeStockTransfer(item));
    }
    return result;
  }
}
