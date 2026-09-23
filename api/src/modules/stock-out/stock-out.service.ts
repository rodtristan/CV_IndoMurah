import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { Prisma } from '@prisma/client';
import { CreateStockOutDto, UpdateStockOutDto } from './dto/stock-out.dto';

@Injectable()
export class StockOutService extends BaseService<
  any,
  CreateStockOutDto,
  UpdateStockOutDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
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

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC METHODS
  // ═══════════════════════════════════════════════════════════════════

  async createStockOut(dto: CreateStockOutDto, userId: string) {
    if (!dto.Items || dto.Items.length === 0) {
      throw new BadRequestException('Stock out items tidak boleh kosong');
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

    const stockOut = await this.prisma.$transaction(async (tx) => {
      const newStockOut = await tx.stockOut.create({
        data: {
          Code: code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          Warehouse: { connect: { ID: dto.WarehouseID } },
          ...(dto.ReferenceTypeID ? { ReferenceType: { connect: { ID: dto.ReferenceTypeID } } } : {}),
          ReferenceID: dto.ReferenceID,
          TotalItems: new Prisma.Decimal(totalItems),
          Description: dto.Description,
          Status: { connect: { ID: completedStatus.ID } },
          Creator: { connect: { ID: userId } },
          StockOutItems: { create: itemsData },
        },
        include: {
          Warehouse: true,
          Status: true,
          Creator: true,
          StockOutItems: { include: { Product: true, Unit: true } },
        },
      });

      for (const item of dto.Items) {
        await tx.product.update({
          where: { ID: item.ProductID },
          data: { Stock: { decrement: new Prisma.Decimal(item.Quantity) } },
        });
      }

      return newStockOut;
    });

    return this.serializeStockOut(stockOut);
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
