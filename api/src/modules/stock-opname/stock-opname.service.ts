import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { Prisma } from '@prisma/client';
import { CreateStockOpnameDto, UpdateStockOpnameDto } from './dto/stock-opname.dto';

@Injectable()
export class StockOpnameService extends BaseService<
  any,
  CreateStockOpnameDto,
  UpdateStockOpnameDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'stockOpname',
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

  async createStockOpname(dto: CreateStockOpnameDto, userId: string) {
    if (!dto.Items || dto.Items.length === 0) {
      throw new BadRequestException('Stock opname items tidak boleh kosong');
    }

    const code = await this.generateCode();
    const completedStatus = await this.getStockOpnameStatusByCode('COMPLETED');

    const totalItems = dto.Items.reduce((sum, item) => sum + Number(item.CountedStock), 0);

    const itemsData = dto.Items.map((item) => ({
      ProductID: item.ProductID,
      SystemStock: new Prisma.Decimal(item.SystemStock),
      CountedStock: new Prisma.Decimal(item.CountedStock),
      Difference: new Prisma.Decimal(item.Difference),
      UnitID: item.UnitID,
      UnitPrice: new Prisma.Decimal(item.UnitPrice ?? 0),
      Note: item.Note,
    }));

    const stockOpname = await this.prisma.$transaction(async (tx) => {
      const newStockOpname = await tx.stockOpname.create({
        data: {
          Code: code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          Warehouse: { connect: { ID: dto.WarehouseID } },
          TotalItems: new Prisma.Decimal(totalItems),
          Notes: dto.Notes,
          Status: { connect: { ID: completedStatus.ID } },
          Creator: { connect: { ID: userId } },
          OpnameItems: { create: itemsData },
        },
        include: {
          Warehouse: true,
          Status: true,
          Creator: true,
          OpnameItems: { include: { Product: true, Unit: true } },
        },
      });

      // Physical recount reconciliation: set Product.Stock directly to the
      // counted value (not increment/decrement).
      for (const item of dto.Items) {
        await tx.product.update({
          where: { ID: item.ProductID },
          data: { Stock: new Prisma.Decimal(item.CountedStock) },
        });
      }

      return newStockOpname;
    });

    return this.serializeStockOpname(stockOpname);
  }

  private async getStockOpnameStatusByCode(code: string) {
    const status = await this.prisma.stockOpnameStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Stock opname status '${code}' tidak ditemukan`);
    return status;
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `OP-${year}${month}`;

    const lastStockOpname = await this.prisma.stockOpname.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastStockOpname) {
      const lastSeq = parseInt(lastStockOpname.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private serializeStockOpname(data: any): any {
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
    if (data.OpnameItems && Array.isArray(data.OpnameItems)) {
      result.OpnameItems = data.OpnameItems.map((item: any) => this.serializeStockOpname(item));
    }
    return result;
  }
}
