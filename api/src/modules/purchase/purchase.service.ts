import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { NotificationService } from '../notification/notification.service';
import { Prisma } from '@prisma/client';
import { CreatePurchaseDto, UpdatePurchaseDto, UpdateStatusDto } from './dto/purchase.dto';

@Injectable()
export class PurchaseService {
  private readonly CACHE_PREFIX = 'purchases';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
    private notificationService: NotificationService,
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

        const data = await this.prisma.purchase.findUnique(findArgs);
        return data ? this.serialize(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreatePurchaseDto, userId: string) {
    // Verify supplier exists
    const supplier = await this.prisma.supplier.findUnique({ where: { ID: dto.SupplierID } });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const code = await this.generateCode();
    const draftStatus = await this.getStatusByCode('DRAFT');
    const paymentStatus = await this.getPaymentStatusByCode('PENDING');

    // Calculate totals
    let subtotal = dto.Subtotal || 0;
    let discountAmount = dto.DiscountAmount || 0;
    let taxAmount = 0;

    if (dto.Items && dto.Items.length > 0) {
      const itemsData = dto.Items.map((item) => {
        const itemSubtotal = item.UnitPrice * item.Quantity;
        const itemDiscount = item.DiscountAmount || (itemSubtotal * (item.DiscountPercent || 0) / 100);
        return {
          ProductID: item.ProductID,
          Quantity: new Prisma.Decimal(item.Quantity.toString()),
          UnitID: item.UnitID,
          UnitPrice: new Prisma.Decimal(item.UnitPrice.toString()),
          DiscountPercent: new Prisma.Decimal((item.DiscountPercent || 0).toString()),
          DiscountAmount: new Prisma.Decimal(itemDiscount.toString()),
          Subtotal: new Prisma.Decimal((itemSubtotal - itemDiscount).toString()),
        };
      });

      subtotal = itemsData.reduce((sum, item) => sum + Number(item.Subtotal), 0);

      // Create purchase with items
      const purchase = await this.prisma.purchase.create({
        data: {
          Code: code,
          SupplierID: dto.SupplierID,
          WarehouseID: dto.WarehouseID,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
          PaymentMethodID: dto.PaymentMethodID,
          Subtotal: new Prisma.Decimal(subtotal.toString()),
          DiscountPercent: new Prisma.Decimal((dto.DiscountPercent || 0).toString()),
          DiscountAmount: new Prisma.Decimal(discountAmount.toString()),
          TaxPercent: new Prisma.Decimal((dto.TaxPercent || 0).toString()),
          TaxAmount: new Prisma.Decimal(taxAmount.toString()),
          Total: new Prisma.Decimal((subtotal - discountAmount + taxAmount).toString()),
          Paid: new Prisma.Decimal('0'),
          Remaining: new Prisma.Decimal((subtotal - discountAmount + taxAmount).toString()),
          PaymentStatusID: paymentStatus.ID,
          StatusID: draftStatus.ID,
          Notes: dto.Notes,
          CreatedByID: userId,
          PurchaseItems: {
            create: itemsData,
          },
        },
        include: {
          Supplier: true,
          Warehouse: true,
          PurchaseItems: { include: { Product: true, Unit: true } },
        },
      });

      await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
      await this.notificationService.notify({
        title: 'Pembelian Baru',
        message: `Transaksi ${purchase.Code} dari ${supplier.Name} sebesar Rp ${Number(purchase.Total).toLocaleString('id-ID')}`,
        typeCode: 'PURCHASE',
        referenceType: 'Purchase',
        referenceId: purchase.ID,
      });
      return this.serialize(purchase);
    }

    // Create purchase without items
    taxAmount = (subtotal - discountAmount) * ((dto.TaxPercent || 0) / 100);
    const total = subtotal - discountAmount + taxAmount;

    const purchase = await this.prisma.purchase.create({
      data: {
        Code: code,
        SupplierID: dto.SupplierID,
        WarehouseID: dto.WarehouseID,
        Date: dto.Date ? new Date(dto.Date) : new Date(),
        DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
        PaymentMethodID: dto.PaymentMethodID,
        Subtotal: new Prisma.Decimal(subtotal.toString()),
        DiscountPercent: new Prisma.Decimal((dto.DiscountPercent || 0).toString()),
        DiscountAmount: new Prisma.Decimal(discountAmount.toString()),
        TaxPercent: new Prisma.Decimal((dto.TaxPercent || 0).toString()),
        TaxAmount: new Prisma.Decimal(taxAmount.toString()),
        Total: new Prisma.Decimal(total.toString()),
        Paid: new Prisma.Decimal('0'),
        Remaining: new Prisma.Decimal(total.toString()),
        PaymentStatusID: paymentStatus.ID,
        StatusID: draftStatus.ID,
        Notes: dto.Notes,
        CreatedByID: userId,
      },
      include: {
        Supplier: true,
        Warehouse: true,
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.notificationService.notify({
      title: 'Pembelian Baru',
      message: `Transaksi ${purchase.Code} dari ${supplier.Name} sebesar Rp ${Number(purchase.Total).toLocaleString('id-ID')}`,
      typeCode: 'PURCHASE',
      referenceType: 'Purchase',
      referenceId: purchase.ID,
    });
    return this.serialize(purchase);
  }

  async update(id: number, dto: UpdatePurchaseDto) {
    const purchase = await this.prisma.purchase.findUnique({ where: { ID: id } });
    if (!purchase) throw new NotFoundException('Purchase not found');
    const status = await this.getStatusById(purchase.StatusID);
    if (status?.Code !== 'DRAFT') {
      throw new BadRequestException('Can only update draft purchases');
    }

    const updateData: any = {};
    if (dto.WarehouseID !== undefined) updateData.WarehouseID = dto.WarehouseID;
    if (dto.Date) updateData.Date = new Date(dto.Date);
    if (dto.DueDate !== undefined) updateData.DueDate = dto.DueDate ? new Date(dto.DueDate) : null;
    if (dto.PaymentMethodID !== undefined) updateData.PaymentMethodID = dto.PaymentMethodID;
    if (dto.DiscountPercent !== undefined) updateData.DiscountPercent = new Prisma.Decimal(dto.DiscountPercent.toString());
    if (dto.DiscountAmount !== undefined) updateData.DiscountAmount = new Prisma.Decimal(dto.DiscountAmount.toString());
    if (dto.TaxPercent !== undefined) updateData.TaxPercent = new Prisma.Decimal(dto.TaxPercent.toString());
    if (dto.Notes !== undefined) updateData.Notes = dto.Notes;

    const updated = await this.prisma.purchase.update({
      where: { ID: id },
      data: updateData,
      include: {
        Supplier: true,
        Warehouse: true,
        PurchaseItems: { include: { Product: true, Unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    return this.serialize(updated);
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { ID: id },
      include: { PurchaseItems: true },
    });
    if (!purchase) throw new NotFoundException('Purchase not found');

    const currentStatus = await this.getStatusById(purchase.StatusID);
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

    const updated = await this.prisma.purchase.update({
      where: { ID: id },
      data: { StatusID: newStatus.ID },
      include: {
        Supplier: true,
        Warehouse: true,
        PurchaseItems: { include: { Product: true, Unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    return this.serialize(updated);
  }

  async delete(id: number) {
    const purchase = await this.prisma.purchase.findUnique({ where: { ID: id } });
    if (!purchase) throw new NotFoundException('Purchase not found');
    const status = await this.getStatusById(purchase.StatusID);
    if (status?.Code !== 'DRAFT') {
      throw new BadRequestException('Can only delete draft purchases');
    }

    const [returns, payments] = await Promise.all([
      this.prisma.purchaseReturn.count({ where: { PurchaseID: id } }),
      this.prisma.purchasePayment.count({ where: { PurchaseID: id } }),
    ]);
    if (returns > 0) throw new BadRequestException('Pembelian tidak dapat dihapus karena sudah memiliki retur pembelian');
    if (payments > 0) throw new BadRequestException('Pembelian tidak dapat dihapus karena sudah memiliki pembayaran');

    await this.prisma.purchase.delete({ where: { ID: id } });
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    return { id };
  }

  async getReport(query: Record<string, any>) {
    const { startDate, endDate, supplierId } = query;

    const where: any = {};
    if (startDate || endDate) {
      where.Date = {};
      if (startDate) where.Date.gte = new Date(startDate);
      if (endDate) where.Date.lte = new Date(endDate);
    }
    if (supplierId) where.SupplierID = parseInt(supplierId);

    const purchases = await this.prisma.purchase.findMany({
      where,
      include: {
        Supplier: true,
        PurchaseItems: { include: { Product: true } },
      },
      orderBy: { Date: 'desc' },
    });

    const summary = {
      totalPurchases: purchases.length,
      totalAmount: purchases.reduce((sum, p) => sum + Number(p.Total), 0),
      totalPaid: purchases.reduce((sum, p) => sum + Number(p.Paid), 0),
      totalRemaining: purchases.reduce((sum, p) => sum + Number(p.Remaining), 0),
    };

    return {
      data: purchases.map((p) => this.serialize(p)),
      summary,
    };
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

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `BP-${year}${month}`;

    const lastPurchase = await this.prisma.purchase.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastPurchase) {
      const lastSeq = parseInt(lastPurchase.Code.split('-').pop() || '0', 10);
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

    if (data.PurchaseItems && Array.isArray(data.PurchaseItems)) {
      result.PurchaseItems = data.PurchaseItems.map((item: any) => this.serialize(item));
    }

    return result;
  }
}
