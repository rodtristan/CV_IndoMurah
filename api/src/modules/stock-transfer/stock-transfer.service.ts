import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { Prisma } from '@prisma/client';
import { CreateStockTransferDto, UpdateStockTransferDto } from './dto/stock-transfer.dto';

@Injectable()
export class StockTransferService extends BaseService<
  any,
  CreateStockTransferDto,
  UpdateStockTransferDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
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

    // NOTE: Product.Stock in this schema is a single global figure (not
    // per-warehouse), so a transfer between warehouses nets to zero on the
    // total. We do NOT mutate Product.Stock here — matching
    // report.service.ts#stockMutationReport, which records StockTransfer
    // rows only as TRANSFER_IN/TRANSFER_OUT movement entries.
    const stockTransfer = await this.prisma.$transaction(async (tx) => {
      const newStockTransfer = await tx.stockTransfer.create({
        data: {
          Code: code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          FromWarehouse: { connect: { ID: dto.FromWarehouseID } },
          ToWarehouse: { connect: { ID: dto.ToWarehouseID } },
          TotalItems: new Prisma.Decimal(totalItems),
          Notes: dto.Notes,
          Status: { connect: { ID: completedStatus.ID } },
          Creator: { connect: { ID: userId } },
          TransferItems: { create: itemsData },
        },
        include: {
          FromWarehouse: true,
          ToWarehouse: true,
          Status: true,
          Creator: true,
          TransferItems: { include: { Product: true, Unit: true } },
        },
      });

      return newStockTransfer;
    });

    return this.serializeStockTransfer(stockTransfer);
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
