import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '.prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  AddPurchaseOrderItemDto,
  UpdateStatusDto,
} from './dto/purchase-order.dto';

@Injectable()
export class PurchaseOrderService {
  private readonly CACHE_PREFIX = 'purchase_orders';
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
          searchableFields: ['code', 'notes'],
          allowedIncludes: ['supplier', 'creator', 'items', 'items.product', 'items.unit', 'purchases'],
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
          this.prisma.purchaseOrder.findMany(findArgs),
          this.prisma.purchaseOrder.count({ where: prismaQuery.where }),
        ]);

        // Convert Decimal to number for API response
        const serializedData = data.map((item) => this.serializePurchaseOrder(item));

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
          allowedIncludes: ['supplier', 'creator', 'items', 'items.product', 'items.unit', 'purchases'],
        });

        const findArgs: any = { where: { id } };

        if (prismaQuery.select) {
          findArgs.select = prismaQuery.select;
        } else if (prismaQuery.include) {
          findArgs.include = prismaQuery.include;
        }

        const data = await this.prisma.purchaseOrder.findUnique(findArgs);
        return data ? this.serializePurchaseOrder(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreatePurchaseOrderDto, userId: number) {
    // Generate code
    const code = await this.generateCode();

    // Calculate totals for items
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

    const purchaseOrder = await this.prisma.purchaseOrder.create({
      data: {
        code,
        supplier_id: dto.supplier_id,
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
        supplier: true,
        items: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serializePurchaseOrder(purchaseOrder);
  }

  async update(id: number, dto: UpdatePurchaseOrderDto) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!purchaseOrder) throw new NotFoundException('Purchase order not found');
    if (purchaseOrder.status !== 'draft') {
      throw new BadRequestException('Can only update draft purchase orders');
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        supplier_id: dto.supplier_id,
        date: dto.date ? new Date(dto.date) : undefined,
        due_date: dto.due_date ? new Date(dto.due_date) : undefined,
        notes: dto.notes,
      },
      include: {
        supplier: true,
        items: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serializePurchaseOrder(updated);
  }

  async addItem(id: number, dto: AddPurchaseOrderItemDto) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!purchaseOrder) throw new NotFoundException('Purchase order not found');
    if (purchaseOrder.status !== 'draft') {
      throw new BadRequestException('Can only add items to draft purchase orders');
    }

    const subtotal = dto.price * dto.quantity - (dto.discount || 0);

    await this.prisma.purchaseOrderItem.create({
      data: {
        purchase_order_id: id,
        product_id: dto.product_id,
        quantity: new Prisma.Decimal(dto.quantity.toString()),
        unit_id: dto.unit_id,
        price: new Prisma.Decimal(dto.price.toString()),
        discount: new Prisma.Decimal((dto.discount || 0).toString()),
        subtotal: new Prisma.Decimal(subtotal.toString()),
      },
    });

    // Recalculate total
    await this.recalculateTotal(id);

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.findOne(id, {});
  }

  async removeItem(id: number, itemId: number) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!purchaseOrder) throw new NotFoundException('Purchase order not found');
    if (purchaseOrder.status !== 'draft') {
      throw new BadRequestException('Can only remove items from draft purchase orders');
    }

    const item = await this.prisma.purchaseOrderItem.findFirst({
      where: { id: itemId, purchase_order_id: id },
    });
    if (!item) throw new NotFoundException('Item not found');

    await this.prisma.purchaseOrderItem.delete({ where: { id: itemId } });

    // Recalculate total
    await this.recalculateTotal(id);

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.findOne(id, {});
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!purchaseOrder) throw new NotFoundException('Purchase order not found');

    const validTransitions: Record<string, string[]> = {
      draft: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
    };

    const allowed = validTransitions[purchaseOrder.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from '${purchaseOrder.status}' to '${dto.status}'`,
      );
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: dto.status },
      include: {
        supplier: true,
        items: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serializePurchaseOrder(updated);
  }

  async delete(id: number) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!purchaseOrder) throw new NotFoundException('Purchase order not found');
    if (purchaseOrder.status !== 'draft') {
      throw new BadRequestException('Can only delete draft purchase orders');
    }
    if (purchaseOrder.purchases.length > 0) {
      throw new BadRequestException('Cannot delete purchase order with linked purchases');
    }

    await this.prisma.purchaseOrder.delete({ where: { id } });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return { id };
  }

  private async recalculateTotal(purchaseOrderId: number) {
    const items = await this.prisma.purchaseOrderItem.findMany({
      where: { purchase_order_id: purchaseOrderId },
    });

    const total = items.reduce((sum, item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);
      const discount = Number(item.discount);
      return sum + price * quantity - discount;
    }, 0);

    await this.prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { total: new Prisma.Decimal(total.toString()) },
    });
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `PO-${year}${month}`;

    const lastOrder = await this.prisma.purchaseOrder.findFirst({
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

  private serializePurchaseOrder(data: any): any {
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

    // Serialize nested items
    if (data.items && Array.isArray(data.items)) {
      result.items = data.items.map((item: any) => this.serializePurchaseOrderItem(item));
    }

    return result;
  }

  private serializePurchaseOrderItem(data: any): any {
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
