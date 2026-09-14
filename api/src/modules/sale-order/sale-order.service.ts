import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '.prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
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
          this.prisma.saleOrder.findMany(findArgs),
          this.prisma.saleOrder.count({ where: prismaQuery.where }),
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

        const data = await this.prisma.saleOrder.findUnique(findArgs);
        return data ? this.serializeSaleOrder(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreateSaleOrderDto, userId: number) {
    const code = await this.generateCode();

    const itemsData = dto.items.map((item) => {
      const subtotal = item.price * item.quantity - (item.discount || 0);
      return {
        product_id: item.product_id,
        quantity: new Prisma.Decimal(item.quantity.toString()),
        unit_id: item.unit_id,
        price: new Prisma.Decimal(item.price.toString()),
        discount: new Prisma.Decimal((item.discount || 0).toString()),
        subtotal: new Prisma.Decimal(subtotal.toString()),
      };
    });

    const total = itemsData.reduce((sum, item) => sum + Number(item.subtotal), 0);

    const saleOrder = await this.prisma.saleOrder.create({
      data: {
        code,
        customer_id: dto.customer_id,
        sales_person_id: dto.sales_person_id,
        date: dto.date ? new Date(dto.date) : new Date(),
        due_date: dto.due_date ? new Date(dto.due_date) : null,
        notes: dto.notes,
        total: new Prisma.Decimal(total.toString()),
        status: 'draft',
        created_by: userId,
        items: {
          create: itemsData,
        },
      },
      include: {
        customer: true,
        salesPerson: true,
        items: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serializeSaleOrder(saleOrder);
  }

  async update(id: number, dto: UpdateSaleOrderDto) {
    const saleOrder = await this.prisma.saleOrder.findUnique({ where: { id } });
    if (!saleOrder) throw new NotFoundException('Sale order not found');
    if (saleOrder.status !== 'draft') {
      throw new BadRequestException('Can only update draft sale orders');
    }

    const updated = await this.prisma.saleOrder.update({
      where: { id },
      data: {
        customer_id: dto.customer_id,
        sales_person_id: dto.sales_person_id,
        date: dto.date ? new Date(dto.date) : undefined,
        due_date: dto.due_date ? new Date(dto.due_date) : undefined,
        notes: dto.notes,
      },
      include: {
        customer: true,
        salesPerson: true,
        items: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serializeSaleOrder(updated);
  }

  async addItem(id: number, dto: AddSaleOrderItemDto) {
    const saleOrder = await this.prisma.saleOrder.findUnique({ where: { id } });
    if (!saleOrder) throw new NotFoundException('Sale order not found');
    if (saleOrder.status !== 'draft') {
      throw new BadRequestException('Can only add items to draft sale orders');
    }

    const subtotal = dto.price * dto.quantity - (dto.discount || 0);

    await this.prisma.saleOrderItem.create({
      data: {
        sale_order_id: id,
        product_id: dto.product_id,
        quantity: new Prisma.Decimal(dto.quantity.toString()),
        unit_id: dto.unit_id,
        price: new Prisma.Decimal(dto.price.toString()),
        discount: new Prisma.Decimal((dto.discount || 0).toString()),
        subtotal: new Prisma.Decimal(subtotal.toString()),
      },
    });

    await this.recalculateTotal(id);
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.findOne(id, {});
  }

  async removeItem(id: number, itemId: number) {
    const saleOrder = await this.prisma.saleOrder.findUnique({ where: { id } });
    if (!saleOrder) throw new NotFoundException('Sale order not found');
    if (saleOrder.status !== 'draft') {
      throw new BadRequestException('Can only remove items from draft sale orders');
    }

    const item = await this.prisma.saleOrderItem.findFirst({
      where: { id: itemId, sale_order_id: id },
    });
    if (!item) throw new NotFoundException('Item not found');

    await this.prisma.saleOrderItem.delete({ where: { id: itemId } });
    await this.recalculateTotal(id);
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.findOne(id, {});
  }

  async confirm(id: number) {
    return this.updateStatus(id, { status: 'confirmed' });
  }

  async complete(id: number) {
    return this.updateStatus(id, { status: 'completed' });
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const saleOrder = await this.prisma.saleOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!saleOrder) throw new NotFoundException('Sale order not found');

    const validTransitions: Record<string, string[]> = {
      draft: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
    };

    const allowed = validTransitions[saleOrder.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from '${saleOrder.status}' to '${dto.status}'`,
      );
    }

    const updated = await this.prisma.saleOrder.update({
      where: { id },
      data: { status: dto.status },
      include: {
        customer: true,
        salesPerson: true,
        items: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serializeSaleOrder(updated);
  }

  async delete(id: number) {
    const saleOrder = await this.prisma.saleOrder.findUnique({ where: { id } });
    if (!saleOrder) throw new NotFoundException('Sale order not found');
    if (saleOrder.status !== 'draft') {
      throw new BadRequestException('Can only delete draft sale orders');
    }
    if (saleOrder.sales && saleOrder.sales.length > 0) {
      throw new BadRequestException('Cannot delete sale order with linked sales');
    }

    await this.prisma.saleOrder.delete({ where: { id } });
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return { id };
  }

  private async recalculateTotal(saleOrderId: number) {
    const items = await this.prisma.saleOrderItem.findMany({
      where: { sale_order_id: saleOrderId },
    });

    const total = items.reduce((sum, item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);
      const discount = Number(item.discount);
      return sum + price * quantity - discount;
    }, 0);

    await this.prisma.saleOrder.update({
      where: { id: saleOrderId },
      data: { total: new Prisma.Decimal(total.toString()) },
    });
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SO-${year}${month}`;

    const lastOrder = await this.prisma.saleOrder.findFirst({
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
      if (value instanceof Decimal) {
        result[key] = Number(value);
      } else if (value instanceof Date) {
        result[key] = value.toISOString();
      } else {
        result[key] = value;
      }
    }

    if (data.items && Array.isArray(data.items)) {
      result.items = data.items.map((item: any) => this.serializeSaleOrderItem(item));
    }

    return result;
  }

  private serializeSaleOrderItem(data: any): any {
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

    return result;
  }
}
