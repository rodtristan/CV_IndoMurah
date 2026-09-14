import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '.prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateSaleReturnDto, UpdateSaleReturnDto, UpdateStatusDto } from './dto/sale-return.dto';

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
    const sale = await this.prisma.sale.findUnique({ where: { id: dto.sale_id } });
    if (!sale) throw new NotFoundException('Sale not found');

    const code = await this.generateCode();

    // Calculate total return
    const itemsData = dto.items.map((item) => {
      const subtotal = item.unit_price * item.quantity;
      return {
        product_id: item.product_id,
        quantity: new Prisma.Decimal(item.quantity.toString()),
        unit_price: new Prisma.Decimal(item.unit_price.toString()),
        subtotal: new Prisma.Decimal(subtotal.toString()),
      };
    });

    const totalReturn = itemsData.reduce((sum, item) => sum + Number(item.subtotal), 0);

    const saleReturn = await this.prisma.saleReturn.create({
      data: {
        code,
        sale_id: dto.sale_id,
        customer_id: dto.customer_id || sale.customerId,
        warehouse_id: dto.warehouse_id,
        date: dto.date ? new Date(dto.date) : new Date(),
        total_return: new Prisma.Decimal(totalReturn.toString()),
        reason: dto.reason,
        status: 'DRAFT',
        createdById: userId,
        returnItems: {
          create: itemsData,
        },
      },
      include: {
        sale: true,
        customer: true,
        warehouse: true,
        returnItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(saleReturn);
  }

  async update(id: number, dto: UpdateSaleReturnDto) {
    const saleReturn = await this.prisma.saleReturn.findUnique({ where: { id } });
    if (!saleReturn) throw new NotFoundException('Sale return not found');
    if (saleReturn.status !== 'DRAFT') {
      throw new BadRequestException('Can only update draft sale returns');
    }

    const updated = await this.prisma.saleReturn.update({
      where: { id },
      data: {
        warehouse_id: dto.warehouse_id,
        date: dto.date ? new Date(dto.date) : undefined,
        reason: dto.reason,
      },
      include: {
        sale: true,
        customer: true,
        warehouse: true,
        returnItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(updated);
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const saleReturn = await this.prisma.saleReturn.findUnique({
      where: { id },
      include: { returnItems: true },
    });
    if (!saleReturn) throw new NotFoundException('Sale return not found');

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[saleReturn.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from '${saleReturn.status}' to '${dto.status}'`);
    }

    const updated = await this.prisma.saleReturn.update({
      where: { id },
      data: { status: dto.status },
      include: {
        sale: true,
        customer: true,
        warehouse: true,
        returnItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(updated);
  }

  async delete(id: number) {
    const saleReturn = await this.prisma.saleReturn.findUnique({ where: { id } });
    if (!saleReturn) throw new NotFoundException('Sale return not found');
    if (saleReturn.status !== 'DRAFT') {
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
      if (value instanceof Decimal) {
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
