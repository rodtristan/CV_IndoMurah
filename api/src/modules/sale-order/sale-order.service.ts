import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '.prisma/client';
import {
  CreateSaleOrderDto,
  UpdateSaleOrderDto,
  AddSaleOrderItemDto,
  UpdateStatusDto,
} from './dto/sale-order.dto';

@Injectable()
export class SaleOrderService {
  private readonly CACHE_PREFIX = 'sale_orders';
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
          this.prisma.sale.findMany(findArgs),
          this.prisma.sale.count({ where: prismaQuery.where }),
        ]);

        const serializedData = data.map((item) => this.serializeSaleOrder(item));

        return { data: serializedData, total, skip: prismaQuery.skip, take: prismaQuery.take };
      },
      this.CACHE_TTL,
    );
  }

  async findOne(id: number, query: Record<string, any> = {}) {
    const cacheKey = `${this.CACHE_PREFIX}:${id}:${this.queryService.generateCacheKey('q', query)}`;

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

        const data = await this.prisma.sale.findUnique(findArgs);
        return data ? this.serializeSaleOrder(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreateSaleOrderDto, userId: string) {
    const code = await this.generateCode();

    const saleItemsData = dto.items.map((item) => {
      const subtotal = item.unitPrice * item.quantity - (item.discountAmount || 0);
      return {
        productId: item.productId,
        quantity: new Prisma.Decimal(item.quantity.toString()),
        unitId: item.unitId,
        unitPrice: new Prisma.Decimal(item.unitPrice.toString()),
        discountAmount: new Prisma.Decimal((item.discountAmount || 0).toString()),
        subtotal: new Prisma.Decimal(subtotal.toString()),
      };
    });

    const total = saleItemsData.reduce((sum, item) => sum + Number(item.subtotal), 0);

    const sale = await this.prisma.sale.create({
      data: {
        code,
        customerId: dto.customerId,
        salesPersonId: dto.salesPersonId,
        date: dto.date ? new Date(dto.date) : new Date(),
        notes: dto.notes,
        subtotal: new Prisma.Decimal(total.toString()),
        total: new Prisma.Decimal(total.toString()),
        paymentStatus: 'PENDING',
        createdById: userId,
        saleItems: {
          create: saleItemsData,
        },
      },
      include: {
        customer: true,
        salesPerson: true,
        saleItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serializeSaleOrder(sale);
  }

  async update(id: number, dto: UpdateSaleOrderDto) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Sale not found');
    if (sale.paymentStatus !== 'PENDING') {
      throw new BadRequestException('Can only update pending sales');
    }

    const updated = await this.prisma.sale.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        salesPersonId: dto.salesPersonId,
        date: dto.date ? new Date(dto.date) : undefined,
        notes: dto.notes,
      },
      include: {
        customer: true,
        salesPerson: true,
        saleItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serializeSaleOrder(updated);
  }

  async addItem(id: number, dto: AddSaleOrderItemDto) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Sale not found');
    if (sale.paymentStatus !== 'PENDING') {
      throw new BadRequestException('Can only add items to pending sales');
    }

    const subtotal = dto.unitPrice * dto.quantity - (dto.discountAmount || 0);

    await this.prisma.saleItem.create({
      data: {
        saleId: id,
        productId: dto.productId,
        quantity: new Prisma.Decimal(dto.quantity.toString()),
        unitId: dto.unitId,
        unitPrice: new Prisma.Decimal(dto.unitPrice.toString()),
        discountAmount: new Prisma.Decimal((dto.discountAmount || 0).toString()),
        subtotal: new Prisma.Decimal(subtotal.toString()),
      },
    });

    await this.recalculateTotal(id);
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.findOne(id, {});
  }

  async removeItem(id: number, itemId: number) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Sale not found');
    if (sale.paymentStatus !== 'PENDING') {
      throw new BadRequestException('Can only remove items from pending sales');
    }

    const item = await this.prisma.saleItem.findFirst({
      where: { id: itemId, saleId: id },
    });
    if (!item) throw new NotFoundException('Item not found');

    await this.prisma.saleItem.delete({ where: { id: itemId } });
    await this.recalculateTotal(id);
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.findOne(id, {});
  }

  async confirm(id: number) {
    return this.updatePaymentStatus(id, 'PAID');
  }

  async complete(id: number) {
    return this.updatePaymentStatus(id, 'PAID');
  }

  async updatePaymentStatus(id: number, paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'CANCELLED' | 'INSTALMENT') {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { saleItems: true },
    });
    if (!sale) throw new NotFoundException('Sale not found');

    const updated = await this.prisma.sale.update({
      where: { id },
      data: { paymentStatus },
      include: {
        customer: true,
        salesPerson: true,
        saleItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serializeSaleOrder(updated);
  }

  async delete(id: number) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Sale not found');
    if (sale.paymentStatus !== 'PENDING') {
      throw new BadRequestException('Can only delete pending sales');
    }

    await this.prisma.sale.delete({ where: { id } });
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return { id };
  }

  private async recalculateTotal(saleId: number) {
    const items = await this.prisma.saleItem.findMany({
      where: { saleId: saleId },
    });

    const total = items.reduce((sum, item) => {
      const unitPrice = Number(item.unitPrice);
      const quantity = Number(item.quantity);
      const discountAmount = Number(item.discountAmount);
      return sum + unitPrice * quantity - discountAmount;
    }, 0);

    await this.prisma.sale.update({
      where: { id: saleId },
      data: { total: new Prisma.Decimal(total.toString()) },
    });
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SO-${year}${month}`;

    const lastOrder = await this.prisma.sale.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });

    let nextNumber = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private serializeSaleOrder(data: any): any {
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

    if (data.saleItems && Array.isArray(data.saleItems)) {
      result.saleItems = data.saleItems.map((item: any) => this.serializeSaleOrderItem(item));
    }

    return result;
  }

  private serializeSaleOrderItem(data: any): any {
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

    return result;
  }
}
