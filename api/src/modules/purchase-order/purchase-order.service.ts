import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '@prisma/client';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  AddPurchaseOrderItemDto,
  UpdatePurchaseOrderStatusDto,
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
          allowedIncludes: ['*'],
        });

        const findArgs: any = { where: { ID: id } };

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

    const draftStatus = await this.getStatusByCode('DRAFT');
    const paymentStatus = await this.getPaymentStatusByCode('PENDING');

    // Calculate totals for items
    const itemsData = dto.Items.map((item) => {
      const subtotal = item.UnitPrice * item.Quantity - (item.DiscountAmount || 0);
      return {
        ProductID: item.ProductID,
        Quantity: new Prisma.Decimal(item.Quantity.toString()),
        UnitID: item.UnitID,
        UnitPrice: new Prisma.Decimal(item.UnitPrice.toString()),
        DiscountAmount: new Prisma.Decimal((item.DiscountAmount || 0).toString()),
        Subtotal: new Prisma.Decimal(subtotal.toString()),
      };
    });

    const total = itemsData.reduce((sum, item) => sum + Number(item.Subtotal), 0);

    const purchaseOrder = await this.prisma.purchaseOrder.create({
      data: {
        Code: code,
        SupplierID: dto.SupplierID,
        Date: dto.Date ? new Date(dto.Date) : new Date(),
        DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
        Notes: dto.Notes,
        Total: new Prisma.Decimal(total.toString()),
        StatusID: draftStatus.ID,
        PaymentStatusID: paymentStatus.ID,
        CreatedByID: String(userId),
        PurchaseOrderItems: {
          create: itemsData,
        },
      },
      include: {
        Supplier: true,
        PurchaseOrderItems: { include: { Product: true, Unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serializePurchaseOrder(purchaseOrder);
  }

  async update(id: number, dto: UpdatePurchaseOrderDto) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({ where: { ID: id } });
    if (!purchaseOrder) throw new NotFoundException('Purchase order not found');

    const status = await this.getStatusById(purchaseOrder.StatusID);
    if (status?.Code !== 'DRAFT') {
      throw new BadRequestException('Can only update draft purchase orders');
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { ID: id },
      data: {
        SupplierID: dto.SupplierID,
        Date: dto.Date ? new Date(dto.Date) : undefined,
        DueDate: dto.DueDate ? new Date(dto.DueDate) : undefined,
        Notes: dto.Notes,
      },
      include: {
        Supplier: true,
        PurchaseOrderItems: { include: { Product: true, Unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serializePurchaseOrder(updated);
  }

  async addItem(id: number, dto: AddPurchaseOrderItemDto) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({ where: { ID: id } });
    if (!purchaseOrder) throw new NotFoundException('Purchase order not found');

    const status = await this.getStatusById(purchaseOrder.StatusID);
    if (status?.Code !== 'DRAFT') {
      throw new BadRequestException('Can only add items to draft purchase orders');
    }

    const subtotal = dto.UnitPrice * dto.Quantity - (dto.DiscountAmount || 0);

    await this.prisma.purchaseOrderItem.create({
      data: {
        PurchaseOrderID: id,
        ProductID: dto.ProductID,
        Quantity: new Prisma.Decimal(dto.Quantity.toString()),
        UnitID: dto.UnitID,
        UnitPrice: new Prisma.Decimal(dto.UnitPrice.toString()),
        DiscountAmount: new Prisma.Decimal((dto.DiscountAmount || 0).toString()),
        Subtotal: new Prisma.Decimal(subtotal.toString()),
      },
    });

    // Recalculate total
    await this.recalculateTotal(id);

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.findOne(id, {});
  }

  async removeItem(id: number, itemId: number) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({ where: { ID: id } });
    if (!purchaseOrder) throw new NotFoundException('Purchase order not found');

    const status = await this.getStatusById(purchaseOrder.StatusID);
    if (status?.Code !== 'DRAFT') {
      throw new BadRequestException('Can only remove items from draft purchase orders');
    }

    const item = await this.prisma.purchaseOrderItem.findFirst({
      where: { ID: itemId, PurchaseOrderID: id },
    });
    if (!item) throw new NotFoundException('Item not found');

    await this.prisma.purchaseOrderItem.delete({ where: { ID: itemId } });

    // Recalculate total
    await this.recalculateTotal(id);

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.findOne(id, {});
  }

  async updateStatus(id: number, dto: UpdatePurchaseOrderStatusDto) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { ID: id },
      include: { PurchaseOrderItems: true },
    });
    if (!purchaseOrder) throw new NotFoundException('Purchase order not found');

    const currentStatus = await this.getStatusById(purchaseOrder.StatusID);
    const currentCode = currentStatus?.Code ?? 'DRAFT';

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[currentCode] || [];
    if (!allowed.includes(dto.StatusCode)) {
      throw new BadRequestException(
        `Cannot transition from '${currentCode}' to '${dto.StatusCode}'`,
      );
    }

    const newStatus = await this.getStatusByCode(dto.StatusCode);

    const updated = await this.prisma.purchaseOrder.update({
      where: { ID: id },
      data: { StatusID: newStatus.ID },
      include: {
        Supplier: true,
        PurchaseOrderItems: { include: { Product: true, Unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serializePurchaseOrder(updated);
  }

  async delete(id: number) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({ where: { ID: id } });
    if (!purchaseOrder) throw new NotFoundException('Purchase order not found');

    const status = await this.getStatusById(purchaseOrder.StatusID);
    if (status?.Code !== 'DRAFT') {
      throw new BadRequestException('Can only delete draft purchase orders');
    }

    await this.prisma.purchaseOrder.delete({ where: { ID: id } });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return { id };
  }

  private async recalculateTotal(purchaseOrderId: number) {
    const items = await this.prisma.purchaseOrderItem.findMany({
      where: { PurchaseOrderID: purchaseOrderId },
    });

    const total = items.reduce((sum, item) => {
      const unitPrice = Number(item.UnitPrice);
      const quantity = Number(item.Quantity);
      const discountAmount = Number(item.DiscountAmount);
      return sum + unitPrice * quantity - discountAmount;
    }, 0);

    await this.prisma.purchaseOrder.update({
      where: { ID: purchaseOrderId },
      data: { Total: new Prisma.Decimal(total.toString()) },
    });
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `PO-${year}${month}`;

    const lastOrder = await this.prisma.purchaseOrder.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  // ─── TransactionStatus / PaymentStatus lookup helpers ──────────────────────

  private async getStatusByCode(code: string) {
    const status = await this.prisma.transactionStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Status '${code}' tidak ditemukan`);
    return status;
  }

  private async getStatusById(id: number) {
    return this.prisma.transactionStatus.findUnique({ where: { ID: id } });
  }

  private async getPaymentStatusByCode(code: string) {
    const status = await this.prisma.paymentStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Payment status '${code}' tidak ditemukan`);
    return status;
  }

  private serializePurchaseOrder(data: any): any {
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

    // Serialize nested items
    if (data.PurchaseOrderItems && Array.isArray(data.PurchaseOrderItems)) {
      result.PurchaseOrderItems = data.PurchaseOrderItems.map((item: any) => this.serializePurchaseOrderItem(item));
    }

    return result;
  }

  private serializePurchaseOrderItem(data: any): any {
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
