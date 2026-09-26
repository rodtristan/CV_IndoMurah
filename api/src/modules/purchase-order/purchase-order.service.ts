import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '@prisma/client';
import { computeDocTotals } from '../../common/accounting/doc-totals';
import { recalcPurchaseOrderReceipt } from '../../common/stock/purchase-order-receipt';
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

  async create(dto: CreatePurchaseOrderDto, userId: number | string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { ID: dto.SupplierID } });
    if (!supplier) throw new NotFoundException('Supplier tidak ditemukan');
    const code = await this.generateCode();
    const draftStatus = await this.getStatusByCode('DRAFT');
    const paymentStatus = await this.getPaymentStatusByCode('PENDING');

    const purchaseOrder = await this.prisma.$transaction(async (tx) => {
      const items = this.buildItems(dto.Items);
      const t = this.docTotals(items, dto);
      const created = await tx.purchaseOrder.create({
        data: {
          Code: code,
          SupplierID: dto.SupplierID,
          WarehouseID: dto.WarehouseID ?? null,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
          DeliveryDate: dto.DeliveryDate ? new Date(dto.DeliveryDate) : null,
          OrderStatus: dto.OrderStatus ?? 'WAITING_PAYMENT',
          Notes: dto.Notes ?? null,
          ...this.totalsData(t, dto),
          DownPayment: new Prisma.Decimal(Math.min(dto.DownPayment ?? 0, t.total)),
          StatusID: draftStatus.ID,
          PaymentStatusID: paymentStatus.ID,
          CreatedByID: String(userId),
          OrderedQty: new Prisma.Decimal(items.reduce((s, i) => s + Number(i.Quantity), 0)),
          PurchaseOrderItems: { create: items },
        },
      });
      return tx.purchaseOrder.findUniqueOrThrow({
        where: { ID: created.ID },
        include: { Supplier: true, Warehouse: true, PurchaseOrderItems: { include: { Product: true, Unit: true } } },
      });
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    return this.serializePurchaseOrder(purchaseOrder);
  }

  async update(id: number, dto: UpdatePurchaseOrderDto) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { ID: id }, include: { PurchaseOrderItems: true } });
    if (!po) throw new NotFoundException('Pesanan pembelian tidak ditemukan');
    const status = await this.getStatusById(po.StatusID);
    if (status?.Code === 'CANCELLED' || status?.Code === 'COMPLETED') {
      throw new BadRequestException('Pesanan yang sudah selesai / batal tidak dapat diubah');
    }
    if (dto.Items && Number(po.ReceivedQty) > 0) {
      throw new BadRequestException('Item pesanan tidak dapat diganti karena sebagian sudah diterima lewat pembelian');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const items = dto.Items ? this.buildItems(dto.Items) : null;
      const merged = {
        TaxMode: dto.TaxMode ?? po.TaxMode,
        TaxPercent: dto.TaxPercent ?? Number(po.TaxPercent),
        DiscountPercent: dto.DiscountPercent ?? Number(po.DiscountPercent),
        DiscountAmount: dto.DiscountAmount ?? Number(po.DiscountAmount),
        OtherCost: dto.OtherCost ?? Number(po.OtherCost),
        OtherCostAdds: dto.OtherCostAdds ?? po.OtherCostAdds,
      };
      const t = this.docTotals(items ?? po.PurchaseOrderItems, merged);
      const data: Prisma.PurchaseOrderUncheckedUpdateInput = {
        ...this.totalsData(t, merged),
        DownPayment: new Prisma.Decimal(Math.min(dto.DownPayment ?? Number(po.DownPayment), t.total)),
      };
      if (dto.SupplierID !== undefined) data.SupplierID = dto.SupplierID;
      if (dto.WarehouseID !== undefined) data.WarehouseID = dto.WarehouseID ?? null;
      if (dto.Date) data.Date = new Date(dto.Date);
      if (dto.DueDate !== undefined) data.DueDate = dto.DueDate ? new Date(dto.DueDate) : null;
      if (dto.DeliveryDate !== undefined) data.DeliveryDate = dto.DeliveryDate ? new Date(dto.DeliveryDate) : null;
      if (dto.OrderStatus !== undefined) data.OrderStatus = dto.OrderStatus;
      if (dto.Notes !== undefined) data.Notes = dto.Notes ?? null;
      if (items) {
        await tx.purchaseOrderItem.deleteMany({ where: { PurchaseOrderID: id } });
        data.PurchaseOrderItems = { create: items } as any;
        data.OrderedQty = new Prisma.Decimal(items.reduce((s, i) => s + Number(i.Quantity), 0));
      }
      await tx.purchaseOrder.update({ where: { ID: id }, data });
      await recalcPurchaseOrderReceipt(tx, id);
      return tx.purchaseOrder.findUniqueOrThrow({
        where: { ID: id },
        include: { Supplier: true, Warehouse: true, PurchaseOrderItems: { include: { Product: true, Unit: true } } },
      });
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    return this.serializePurchaseOrder(updated);
  }

  private buildItems(items: CreatePurchaseOrderDto['Items']) {
    return items.map((item) => {
      const gross = item.UnitPrice * item.Quantity;
      const disc = item.DiscountAmount ?? (gross * (item.DiscountPercent ?? 0)) / 100;
      return {
        ProductID: item.ProductID,
        Quantity: new Prisma.Decimal(item.Quantity),
        UnitID: item.UnitID,
        UnitPrice: new Prisma.Decimal(item.UnitPrice),
        DiscountPercent: new Prisma.Decimal(item.DiscountPercent ?? 0),
        DiscountAmount: new Prisma.Decimal(Math.round(disc * 100) / 100),
        Subtotal: new Prisma.Decimal(Math.round((gross - disc) * 100) / 100),
      };
    });
  }

  private docTotals(
    items: { Subtotal: Prisma.Decimal | number }[],
    h: { TaxMode?: string; TaxPercent?: number; DiscountPercent?: number; DiscountAmount?: number; OtherCost?: number; OtherCostAdds?: boolean },
  ) {
    const subtotal = items.reduce((s, i) => s + Number(i.Subtotal), 0);
    const discount = h.DiscountAmount ?? (subtotal * (h.DiscountPercent ?? 0)) / 100;
    return computeDocTotals({
      subtotal, discount, taxMode: h.TaxMode ?? (h.TaxPercent ? 'EXCLUDE' : 'NON'), taxPercent: h.TaxPercent ?? 0,
      otherCost: h.OtherCost ?? 0, otherCostAdds: h.OtherCostAdds ?? true,
    });
  }

  private totalsData(
    t: ReturnType<typeof computeDocTotals>,
    h: { TaxMode?: string; TaxPercent?: number; DiscountPercent?: number; OtherCostAdds?: boolean },
  ) {
    return {
      Subtotal: new Prisma.Decimal(t.subtotal),
      DiscountPercent: new Prisma.Decimal(h.DiscountPercent ?? 0),
      DiscountAmount: new Prisma.Decimal(t.discount),
      TaxMode: h.TaxMode ?? (h.TaxPercent ? 'EXCLUDE' : 'NON'),
      TaxPercent: new Prisma.Decimal(t.taxPercent),
      TaxAmount: new Prisma.Decimal(t.tax),
      OtherCost: new Prisma.Decimal(t.otherCost),
      OtherCostAdds: h.OtherCostAdds ?? true,
      Total: new Prisma.Decimal(t.total),
    };
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
    const po = await this.prisma.purchaseOrder.findUniqueOrThrow({ where: { ID: purchaseOrderId }, include: { PurchaseOrderItems: true } });
    const h = {
      TaxMode: po.TaxMode, TaxPercent: Number(po.TaxPercent), DiscountPercent: Number(po.DiscountPercent),
      OtherCost: Number(po.OtherCost), OtherCostAdds: po.OtherCostAdds,
    };
    const t = this.docTotals(po.PurchaseOrderItems, h);
    await this.prisma.purchaseOrder.update({
      where: { ID: purchaseOrderId },
      data: { ...this.totalsData(t, h), OrderedQty: new Prisma.Decimal(po.PurchaseOrderItems.reduce((s, i) => s + Number(i.Quantity), 0)) },
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
