import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '@prisma/client';
import { CreateSaleReturnDto, UpdateSaleReturnDto, UpdateSaleReturnStatusDto } from './dto/sale-return.dto';

@Injectable()
export class SaleReturnService {
  private readonly CACHE_PREFIX = 'sale_returns';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
  ) {}

  async findAll(query: Record<string, any>) {
    const cacheKey = this.queryService.generateCacheKey(this.CACHE_PREFIX, query);

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          searchableFields: ['*'],
          allowedIncludes: ['*'],
          defaultOrderBy: { CreatedAt: 'desc' },
        });

        const findArgs: any = {
          where: prismaQuery.where,
          orderBy: prismaQuery.orderBy,
          skip: prismaQuery.skip,
          take: prismaQuery.take,
        };

        if (prismaQuery.select) {
          findArgs.select = prismaQuery.select;
        } else if (prismaQuery.include) {
          findArgs.include = prismaQuery.include;
        }

        const [data, total] = await Promise.all([
          this.prisma.saleReturn.findMany(findArgs),
          this.prisma.saleReturn.count({ where: prismaQuery.where }),
        ]);

        const serializedData = data.map((item) => this.serialize(item));
        return { data: serializedData, total, skip: prismaQuery.skip, take: prismaQuery.take };
      },
      this.CACHE_TTL,
    );
  }

  async findOne(id: number, query: Record<string, any> = {}) {
    // Include/select query params change the payload, so they must be part of the cache key.
    const cacheKey = Object.keys(query).length
      ? `${this.CACHE_PREFIX}:${id}:${this.queryService.generateCacheKey('q', query)}`
      : `${this.CACHE_PREFIX}:${id}`;

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          allowedIncludes: ['*'],
        });

        const findArgs: any = { where: { ID: id } };

        if (prismaQuery.select) {
          findArgs.select = prismaQuery.select;
        } else if (prismaQuery.include) {
          findArgs.include = prismaQuery.include;
        }

        const data = await this.prisma.saleReturn.findUnique(findArgs);
        return data ? this.serialize(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreateSaleReturnDto, userId: string) {
    // Verify sale exists
    const sale = await this.prisma.sale.findUnique({ where: { ID: dto.SaleID } });
    if (!sale) throw new NotFoundException('Sale not found');

    const code = await this.generateCode();
    const draftStatus = await this.getStatusByCode('DRAFT');

    // Calculate total return
    const itemsData = dto.Items.map((item) => {
      const subtotal = item.UnitPrice * item.Quantity;
      return {
        ProductID: item.ProductID,
        Quantity: new Prisma.Decimal(item.Quantity.toString()),
        UnitPrice: new Prisma.Decimal(item.UnitPrice.toString()),
        Subtotal: new Prisma.Decimal(subtotal.toString()),
      };
    });

    const totalReturn = itemsData.reduce((sum, item) => sum + Number(item.Subtotal), 0);

    const saleReturn = await this.prisma.saleReturn.create({
      data: {
        Code: code,
        SaleID: dto.SaleID,
        CustomerID: dto.CustomerID || sale.CustomerID,
        WarehouseID: dto.WarehouseID,
        Date: dto.Date ? new Date(dto.Date) : new Date(),
        TotalReturn: new Prisma.Decimal(totalReturn.toString()),
        Reason: dto.Reason,
        StatusID: draftStatus.ID,
        CreatedByID: userId,
        ReturnItems: {
          create: itemsData,
        },
      },
      include: {
        Sale: true,
        Customer: true,
        Warehouse: true,
        ReturnItems: { include: { Product: true, Unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(saleReturn);
  }

  async update(id: number, dto: UpdateSaleReturnDto) {
    const saleReturn = await this.prisma.saleReturn.findUnique({ where: { ID: id } });
    if (!saleReturn) throw new NotFoundException('Sale return not found');
    const status = await this.getStatusById(saleReturn.StatusID);
    if (status?.Code !== 'DRAFT') {
      throw new BadRequestException('Can only update draft sale returns');
    }

    const updated = await this.prisma.saleReturn.update({
      where: { ID: id },
      data: {
        WarehouseID: dto.WarehouseID,
        Date: dto.Date ? new Date(dto.Date) : undefined,
        Reason: dto.Reason,
      },
      include: {
        Sale: true,
        Customer: true,
        Warehouse: true,
        ReturnItems: { include: { Product: true, Unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(updated);
  }

  async updateStatus(id: number, dto: UpdateSaleReturnStatusDto) {
    const saleReturn = await this.prisma.saleReturn.findUnique({
      where: { ID: id },
      include: { ReturnItems: true },
    });
    if (!saleReturn) throw new NotFoundException('Sale return not found');

    const currentStatus = await this.getStatusById(saleReturn.StatusID);
    const currentCode = currentStatus?.Code ?? 'DRAFT';

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[currentCode] || [];
    if (!allowed.includes(dto.StatusCode)) {
      throw new BadRequestException(`Cannot transition from '${currentCode}' to '${dto.StatusCode}'`);
    }

    const newStatus = await this.getStatusByCode(dto.StatusCode);

    const updated = await this.prisma.saleReturn.update({
      where: { ID: id },
      data: { StatusID: newStatus.ID },
      include: {
        Sale: true,
        Customer: true,
        Warehouse: true,
        ReturnItems: { include: { Product: true, Unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(updated);
  }

  async delete(id: number) {
    const saleReturn = await this.prisma.saleReturn.findUnique({ where: { ID: id } });
    if (!saleReturn) throw new NotFoundException('Sale return not found');
    const status = await this.getStatusById(saleReturn.StatusID);
    if (status?.Code !== 'DRAFT') {
      throw new BadRequestException('Can only delete draft sale returns');
    }

    await this.prisma.saleReturn.delete({ where: { ID: id } });
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return { id };
  }

  // ─── TransactionStatus lookup helpers ───────────────────────────────────

  private async getStatusByCode(code: string) {
    const status = await this.prisma.transactionStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Status '${code}' tidak ditemukan`);
    return status;
  }

  private async getStatusById(id: number) {
    return this.prisma.transactionStatus.findUnique({ where: { ID: id } });
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SR-${year}${month}`;

    const lastReturn = await this.prisma.saleReturn.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastReturn) {
      const lastSeq = parseInt(lastReturn.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private serialize(data: any): any {
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

    if (data.ReturnItems && Array.isArray(data.ReturnItems)) {
      result.ReturnItems = data.ReturnItems.map((item: any) => this.serialize(item));
    }

    return result;
  }
}
