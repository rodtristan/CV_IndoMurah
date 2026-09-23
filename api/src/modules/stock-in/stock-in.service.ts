import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { Prisma } from '@prisma/client';
import { CreateStockInDto, UpdateStockInDto } from './dto/stock-in.dto';

@Injectable()
export class StockInService extends BaseService<
  any,
  CreateStockInDto,
  UpdateStockInDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
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

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC METHODS
  // ═══════════════════════════════════════════════════════════════════

  async createStockIn(dto: CreateStockInDto, userId: string) {
    if (!dto.Items || dto.Items.length === 0) {
      throw new BadRequestException('Stock in items tidak boleh kosong');
    }

    const code = await this.generateCode();
    const completedStatus = await this.getTransactionStatusByCode('COMPLETED');

    const totalItems = dto.Items.reduce((sum, item) => sum + Number(item.Quantity), 0);

    const itemsData = dto.Items.map((item) => {
      const subtotal = item.Subtotal !== undefined ? item.Subtotal : item.Quantity * item.UnitPrice;
      return {
        ProductID: item.ProductID,
        Quantity: new Prisma.Decimal(item.Quantity),
        UnitID: item.UnitID,
        UnitPrice: new Prisma.Decimal(item.UnitPrice),
        Subtotal: new Prisma.Decimal(subtotal),
      };
    });

    const stockIn = await this.prisma.$transaction(async (tx) => {
      const newStockIn = await tx.stockIn.create({
        data: {
          Code: code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          Warehouse: { connect: { ID: dto.WarehouseID } },
          ...(dto.SupplierID ? { Supplier: { connect: { ID: dto.SupplierID } } } : {}),
          ...(dto.ReferenceTypeID ? { ReferenceType: { connect: { ID: dto.ReferenceTypeID } } } : {}),
          ReferenceID: dto.ReferenceID,
          TotalItems: new Prisma.Decimal(totalItems),
          Description: dto.Description,
          Status: { connect: { ID: completedStatus.ID } },
          Creator: { connect: { ID: userId } },
          StockInItems: { create: itemsData },
        },
        include: {
          Warehouse: true,
          Supplier: true,
          Status: true,
          Creator: true,
          StockInItems: { include: { Product: true, Unit: true } },
        },
      });

      for (const item of dto.Items) {
        await tx.product.update({
          where: { ID: item.ProductID },
          data: { Stock: { increment: new Prisma.Decimal(item.Quantity) } },
        });
      }

      return newStockIn;
    });

    return this.serializeStockIn(stockIn);
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
