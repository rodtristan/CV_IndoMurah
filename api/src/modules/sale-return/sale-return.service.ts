import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '@prisma/client';
import { CreateSaleReturnDto, UpdateSaleReturnDto, UpdateStatusDto } from './dto/sale-return.dto';

@Injectable()
export class SaleReturnService {
  private readonly CACHE_PREFIX = 'sale_returns';
  private readonly CACHE_TTL = 60;

  // Default TransactionStatus IDs for SaleReturn
  private readonly STATUS_DRAFT = 1;
  private readonly STATUS_CONFIRMED = 2;
  private readonly STATUS_COMPLETED = 3;
  private readonly STATUS_CANCELLED = 4;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
  ) {}

  private async getStatusId(statusCode: string): Promise<number> {
    const statusMap: Record<string, number> = {
      'DRAFT': this.STATUS_DRAFT,
      'CONFIRMED': this.STATUS_CONFIRMED,
      'COMPLETED': this.STATUS_COMPLETED,
      'CANCELLED': this.STATUS_CANCELLED,
    };
    return statusMap[statusCode.toUpperCase()] || this.STATUS_DRAFT;
  }

  async findAll(query: Record<string, any>) {
    const cacheKey = this.queryService.generateCacheKey(this.CACHE_PREFIX, query);

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          searchableFields: ['*'],
          allowedIncludes: ['*'],
          defaultOrderBy: { createdAt: 'desc' },
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
    const cacheKey = `${this.CACHE_PREFIX}:${id}`;

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          allowedIncludes: ['*'],
        });

        const findArgs: any = { where: { id } };

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
    const sale = await this.prisma.sale.findUnique({ where: { id: dto.saleId } });
    if (!sale) throw new NotFoundException('Sale not found');

    const code = await this.generateCode();
    const statusId = await this.getStatusId('DRAFT');

    // Calculate total return
    const itemsData = dto.items.map((item) => {
      const subtotal = item.unitPrice * item.quantity;
      return {
        productId: item.productId,
        unitId: item.unitId,
        quantity: new Prisma.Decimal(item.quantity.toString()),
        unitPrice: new Prisma.Decimal(item.unitPrice.toString()),
        subtotal: new Prisma.Decimal(subtotal.toString()),
      };
    });

    const totalReturn = itemsData.reduce((sum, item) => sum + Number(item.subtotal), 0);

    const saleReturn = await this.prisma.saleReturn.create({
      data: {
        code,
        saleId: dto.saleId,
        customerId: dto.customerId || sale.customerId,
        warehouseId: dto.warehouseId,
        date: dto.date ? new Date(dto.date) : new Date(),
        totalReturn: new Prisma.Decimal(totalReturn.toString()),
        reason: dto.reason,
        statusId: statusId,
        createdById: userId,
        returnItems: {
          create: itemsData,
        },
      },
      include: {
        sale: true,
        customer: true,
        warehouse: true,
        status: true,
        returnItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(saleReturn);
  }

  async update(id: number, dto: UpdateSaleReturnDto) {
    const saleReturn = await this.prisma.saleReturn.findUnique({
      where: { id },
      include: { status: true }
    });
    if (!saleReturn) throw new NotFoundException('Sale return not found');

    const statusCode = saleReturn.status?.code?.toUpperCase();
    if (statusCode && statusCode !== 'DRAFT') {
      throw new BadRequestException('Can only update draft sale returns');
    }

    const updated = await this.prisma.saleReturn.update({
      where: { id },
      data: {
        warehouseId: dto.warehouseId,
        date: dto.date ? new Date(dto.date) : undefined,
        reason: dto.reason,
      },
      include: {
        sale: true,
        customer: true,
        warehouse: true,
        status: true,
        returnItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(updated);
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const saleReturn = await this.prisma.saleReturn.findUnique({
      where: { id },
      include: { status: true, returnItems: true },
    });
    if (!saleReturn) throw new NotFoundException('Sale return not found');

    const currentStatus = saleReturn.status?.code?.toUpperCase() || 'DRAFT';
    const newStatus = dto.status.toUpperCase();

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from '${currentStatus}' to '${newStatus}'`);
    }

    const newStatusId = await this.getStatusId(newStatus);

    const updated = await this.prisma.saleReturn.update({
      where: { id },
      data: { statusId: newStatusId },
      include: {
        sale: true,
        customer: true,
        warehouse: true,
        status: true,
        returnItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(updated);
  }

  async delete(id: number) {
    const saleReturn = await this.prisma.saleReturn.findUnique({
      where: { id },
      include: { status: true }
    });
    if (!saleReturn) throw new NotFoundException('Sale return not found');

    const statusCode = saleReturn.status?.code?.toUpperCase();
    if (statusCode && statusCode !== 'DRAFT') {
      throw new BadRequestException('Can only delete draft sale returns');
    }

    await this.prisma.saleReturn.delete({ where: { id } });
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return { id };
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SR-${year}${month}`;

    const lastReturn = await this.prisma.saleReturn.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });

    let nextNumber = 1;
    if (lastReturn) {
      const lastSeq = parseInt(lastReturn.code.split('-').pop() || '0', 10);
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

    if (data.returnItems && Array.isArray(data.returnItems)) {
      result.returnItems = data.returnItems.map((item: any) => this.serialize(item));
    }

    return result;
  }
}
