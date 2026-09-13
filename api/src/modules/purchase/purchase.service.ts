import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '.prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CreatePurchaseDto, UpdatePurchaseDto, UpdateStatusDto } from './dto/purchase.dto';

@Injectable()
export class PurchaseService {
  private readonly CACHE_PREFIX = 'purchases';
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
          allowedIncludes: ['supplier', 'warehouse', 'creator', 'purchasePayments', 'purchaseItems', 'purchaseItems.product'],
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
          this.prisma.purchase.findMany(findArgs),
          this.prisma.purchase.count({ where: prismaQuery.where }),
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
          allowedIncludes: ['supplier', 'warehouse', 'creator', 'purchasePayments', 'purchaseItems', 'purchaseItems.product', 'purchaseItems.unit'],
        });

        const findArgs: any = { where: { id } };

        if (prismaQuery.select) {
          findArgs.select = prismaQuery.select;
        } else if (prismaQuery.include) {
          findArgs.include = prismaQuery.include;
        }

        const data = await this.prisma.purchase.findUnique(findArgs);
        return data ? this.serialize(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreatePurchaseDto, userId: string) {
    // Verify supplier exists
    const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.supplier_id } });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const code = await this.generateCode();

    // Calculate totals
    let subtotal = dto.subtotal || 0;
    let discountAmount = dto.discount_amount || 0;
    let taxAmount = 0;

    if (dto.items && dto.items.length > 0) {
      const itemsData = dto.items.map((item) => {
        const itemSubtotal = item.unit_price * item.quantity;
        const itemDiscount = item.discount_amount || (itemSubtotal * (item.discount_percent || 0) / 100);
        return {
          product_id: item.product_id,
          quantity: new Prisma.Decimal(item.quantity.toString()),
          unit_id: item.unit_id,
          unit_price: new Prisma.Decimal(item.unit_price.toString()),
          discount_percent: new Prisma.Decimal((item.discount_percent || 0).toString()),
          discount_amount: new Prisma.Decimal(itemDiscount.toString()),
          subtotal: new Prisma.Decimal((itemSubtotal - itemDiscount).toString()),
        };
      });

      subtotal = itemsData.reduce((sum, item) => sum + Number(item.subtotal), 0);

      // Create purchase with items
      const purchase = await this.prisma.purchase.create({
        data: {
          code,
          supplier_id: dto.supplier_id,
          warehouse_id: dto.warehouse_id,
          date: dto.date ? new Date(dto.date) : new Date(),
          due_date: dto.due_date ? new Date(dto.due_date) : null,
          payment_method: dto.payment_method,
          subtotal: new Prisma.Decimal(subtotal.toString()),
          discount_percent: new Prisma.Decimal((dto.discount_percent || 0).toString()),
          discount_amount: new Prisma.Decimal(discountAmount.toString()),
          tax_percent: new Prisma.Decimal((dto.tax_percent || 0).toString()),
          tax_amount: new Prisma.Decimal(taxAmount.toString()),
          total: new Prisma.Decimal((subtotal - discountAmount + taxAmount).toString()),
          paid: new Prisma.Decimal('0'),
          remaining: new Prisma.Decimal((subtotal - discountAmount + taxAmount).toString()),
          status: 'DRAFT',
          notes: dto.notes,
          createdById: userId,
          purchaseItems: {
            create: itemsData,
          },
        },
        include: {
          supplier: true,
          warehouse: true,
          purchaseItems: { include: { product: true, unit: true } },
        },
      });

      await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
      return this.serialize(purchase);
    }

    // Create purchase without items
    taxAmount = (subtotal - discountAmount) * ((dto.tax_percent || 0) / 100);
    const total = subtotal - discountAmount + taxAmount;

    const purchase = await this.prisma.purchase.create({
      data: {
        code,
        supplier_id: dto.supplier_id,
        warehouse_id: dto.warehouse_id,
        date: dto.date ? new Date(dto.date) : new Date(),
        due_date: dto.due_date ? new Date(dto.due_date) : null,
        payment_method: dto.payment_method,
        subtotal: new Prisma.Decimal(subtotal.toString()),
        discount_percent: new Prisma.Decimal((dto.discount_percent || 0).toString()),
        discount_amount: new Prisma.Decimal(discountAmount.toString()),
        tax_percent: new Prisma.Decimal((dto.tax_percent || 0).toString()),
        tax_amount: new Prisma.Decimal(taxAmount.toString()),
        total: new Prisma.Decimal(total.toString()),
        paid: new Prisma.Decimal('0'),
        remaining: new Prisma.Decimal(total.toString()),
        status: 'DRAFT',
        notes: dto.notes,
        createdById: userId,
      },
      include: {
        supplier: true,
        warehouse: true,
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    return this.serialize(purchase);
  }

  async update(id: number, dto: UpdatePurchaseDto) {
    const purchase = await this.prisma.purchase.findUnique({ where: { id } });
    if (!purchase) throw new NotFoundException('Purchase not found');
    if (purchase.status !== 'DRAFT') {
      throw new BadRequestException('Can only update draft purchases');
    }

    const updateData: any = {};
    if (dto.warehouse_id !== undefined) updateData.warehouse_id = dto.warehouse_id;
    if (dto.date) updateData.date = new Date(dto.date);
    if (dto.due_date !== undefined) updateData.due_date = dto.due_date ? new Date(dto.due_date) : null;
    if (dto.payment_method !== undefined) updateData.payment_method = dto.payment_method;
    if (dto.discount_percent !== undefined) updateData.discount_percent = new Prisma.Decimal(dto.discount_percent.toString());
    if (dto.discount_amount !== undefined) updateData.discount_amount = new Prisma.Decimal(dto.discount_amount.toString());
    if (dto.tax_percent !== undefined) updateData.tax_percent = new Prisma.Decimal(dto.tax_percent.toString());
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await this.prisma.purchase.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        warehouse: true,
        purchaseItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    return this.serialize(updated);
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: { purchaseItems: true },
    });
    if (!purchase) throw new NotFoundException('Purchase not found');

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[purchase.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from '${purchase.status}' to '${dto.status}'`);
    }

    const updated = await this.prisma.purchase.update({
      where: { id },
      data: { status: dto.status },
      include: {
        supplier: true,
        warehouse: true,
        purchaseItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    return this.serialize(updated);
  }

  async delete(id: number) {
    const purchase = await this.prisma.purchase.findUnique({ where: { id } });
    if (!purchase) throw new NotFoundException('Purchase not found');
    if (purchase.status !== 'DRAFT') {
      throw new BadRequestException('Can only delete draft purchases');
    }

    await this.prisma.purchase.delete({ where: { id } });
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    return { id };
  }

  async getReport(query: Record<string, any>) {
    const { startDate, endDate, supplierId } = query;

    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (supplierId) where.supplierId = parseInt(supplierId);

    const purchases = await this.prisma.purchase.findMany({
      where,
      include: {
        supplier: true,
        purchaseItems: { include: { product: true } },
      },
      orderBy: { date: 'desc' },
    });

    const summary = {
      totalPurchases: purchases.length,
      totalAmount: purchases.reduce((sum, p) => sum + Number(p.total), 0),
      totalPaid: purchases.reduce((sum, p) => sum + Number(p.paid), 0),
      totalRemaining: purchases.reduce((sum, p) => sum + Number(p.remaining), 0),
    };

    return {
      data: purchases.map((p) => this.serialize(p)),
      summary,
    };
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `BP-${year}${month}`;

    const lastPurchase = await this.prisma.purchase.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });

    let nextNumber = 1;
    if (lastPurchase) {
      const lastSeq = parseInt(lastPurchase.code.split('-').pop() || '0', 10);
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

    if (data.purchaseItems && Array.isArray(data.purchaseItems)) {
      result.purchaseItems = data.purchaseItems.map((item: any) => this.serialize(item));
    }

    return result;
  }
}
