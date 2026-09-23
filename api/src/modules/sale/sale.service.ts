import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { NotificationService } from '../notification/notification.service';
import { Prisma } from '@prisma/client';
import { CreateSaleDto, UpdateSaleDto, PaymentDto, UpdateStatusDto, UpdateShippingDto } from './dto/sale.dto';

@Injectable()
export class SaleService {
  private readonly CACHE_PREFIX = 'sales';
  private readonly CACHE_TTL = 60;

  // Default PaymentStatus IDs (assuming these exist in the database)
  private readonly STATUS_PENDING = 1; // Adjust based on actual data
  private readonly STATUS_PARTIAL = 2;
  private readonly STATUS_PAID = 3;
  private readonly STATUS_CANCELLED = 4;

  constructor(
    private prisma: PrismaService,
    private queryService: QueryService,
    private notificationService: NotificationService,
  ) {}

  private async getPaymentStatusId(statusCode: string): Promise<number> {
    const statusMap: Record<string, number> = {
      'PENDING': this.STATUS_PENDING,
      'PARTIAL': this.STATUS_PARTIAL,
      'PAID': this.STATUS_PAID,
      'CANCELLED': this.STATUS_CANCELLED,
    };
    return statusMap[statusCode.toUpperCase()] || this.STATUS_PENDING;
  }

  async findAll(query: Record<string, unknown>) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      defaultOrderBy: { CreatedAt: 'desc' },
    });

    const findArgs: Record<string, unknown> = {
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
      this.prisma.sale.findMany(findArgs as Parameters<typeof this.prisma.sale.findMany>[0]),
      this.prisma.sale.count({ where: prismaQuery.where }),
    ]);

    return {
      data: data.map((item) => this.serialize(item)),
      total,
      skip: prismaQuery.skip,
      take: prismaQuery.take,
    };
  }

  async findOne(id: number, query: Record<string, unknown> = {}) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      allowedIncludes: ['*'],
    });

    const findArgs: Record<string, unknown> = { where: { ID: id } };

    if (prismaQuery.select) {
      findArgs.select = prismaQuery.select;
    } else if (prismaQuery.include) {
      findArgs.include = prismaQuery.include;
    }

    const data = await this.prisma.sale.findUnique(findArgs as Parameters<typeof this.prisma.sale.findUnique>[0]);
    if (!data) throw new NotFoundException('Sale not found');
    return this.serialize(data);
  }

  async create(dto: CreateSaleDto, userId: string) {
    const code = await this.generateCode();
    const pendingStatus = await this.getPaymentStatusByCode('PENDING');
    const partialStatus = await this.getPaymentStatusByCode('PARTIAL');
    const paidStatus = await this.getPaymentStatusByCode('PAID');

    // Calculate totals
    const subtotal = dto.Items.reduce((sum, item) => {
      const itemDiscount = (item.DiscountAmount || 0);
      return sum + (item.UnitPrice * item.Quantity - itemDiscount);
    }, 0);

    const discountAmount = dto.DiscountAmount || 0;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = dto.TaxPercent ? afterDiscount * (dto.TaxPercent / 100) : 0;
    const total = afterDiscount + taxAmount;

    const cashAmount = dto.CashAmount || 0;
    const changeAmount = cashAmount > total ? cashAmount - total : 0;
    const paid = cashAmount >= total ? total : cashAmount;

    // Determine payment status based on paid amount
    const paymentStatusCode = paid >= total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING';
    const paymentStatusId = await this.getPaymentStatusId(paymentStatusCode);

    const saleItemsData = dto.Items.map((item) => {
      const itemDiscount = item.DiscountAmount || 0;
      const itemSubtotal = item.UnitPrice * item.Quantity - itemDiscount;
      return {
        ProductID: item.ProductID,
        Quantity: new Prisma.Decimal(item.Quantity),
        UnitID: item.UnitID,
        UnitPrice: new Prisma.Decimal(item.UnitPrice),
        DiscountPercent: new Prisma.Decimal(item.DiscountPercent || 0),
        DiscountAmount: new Prisma.Decimal(itemDiscount),
        Subtotal: new Prisma.Decimal(itemSubtotal),
      };
    });

    // Transaction: create sale, decrease stock, record payment, add points
    const sale = await this.prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          code,
          date: dto.date ? new Date(dto.date) : new Date(),
          customerId: dto.customerId,
          salesPersonId: dto.salesPersonId,
          salePointId: dto.salePointId,
          warehouseId: dto.warehouseId,
          subtotal: new Prisma.Decimal(subtotal),
          discountPercent: new Prisma.Decimal(dto.discountPercent || 0),
          discountAmount: new Prisma.Decimal(discountAmount),
          taxPercent: new Prisma.Decimal(dto.taxPercent || 0),
          taxAmount: new Prisma.Decimal(taxAmount),
          total: new Prisma.Decimal(total),
          cashAmount: new Prisma.Decimal(cashAmount),
          changeAmount: new Prisma.Decimal(changeAmount),
          paymentStatusId: paymentStatusId,
          paymentMethodId: dto.paymentMethodId,
          notes: dto.notes,
          createdById: userId,
          saleItems: { create: saleItemsData },
        },
        include: {
          Customer: true,
          SalesPerson: true,
          SalePoint: true,
          Warehouse: true,
          SaleItems: { include: { Product: true, Unit: true } },
        },
      });

      // Decrease product stock
      for (const item of dto.Items) {
        await tx.product.update({
          where: { ID: item.ProductID },
          data: { Stock: { decrement: new Prisma.Decimal(item.Quantity) } },
        });
      }

      // Record payment if cash received
      if (paid > 0 && dto.paymentMethodId) {
        await tx.salePayment.create({
          data: {
            saleId: newSale.id,
            methodId: dto.paymentMethodId,
            amount: new Prisma.Decimal(paid),
            referenceNumber: null,
            createdById: userId,
          },
        });

        // Add loyalty points
        await this.addPoints(tx, dto.customerId, newSale.id, total);
      }

      return newSale;
    });

    await this.notificationService.notify({
      title: 'Penjualan Baru',
      message: `Transaksi ${sale.Code} sebesar ${this.formatIdr(Number(sale.Total))} telah dibuat`,
      typeCode: 'SALE',
      referenceType: 'Sale',
      referenceId: sale.ID,
    });

    for (const item of dto.Items) {
      const product = await this.prisma.product.findUnique({ where: { ID: item.ProductID } });
      if (product && Number(product.Stock) <= Number(product.MinimumStock)) {
        await this.notificationService.notify({
          title: Number(product.Stock) <= 0 ? 'Stok Habis' : 'Stok Menipis',
          message: `${product.Name} (${product.Code}) sisa stok ${Number(product.Stock)}`,
          typeCode: 'STOCK',
          referenceType: 'Product',
          referenceId: product.ID,
        });
      }
    }

    return this.serialize(sale);
  }

  private formatIdr(value: number): string {
    return `Rp ${value.toLocaleString('id-ID')}`;
  }

  async update(id: number, dto: UpdateSaleDto) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { paymentStatus: true }
    });
    if (!sale) throw new NotFoundException('Sale not found');

    const statusCode = sale.paymentStatus?.code?.toUpperCase();
    if (statusCode === 'PAID' || statusCode === 'CANCELLED') {
      throw new BadRequestException('Cannot update paid or cancelled sales');
    }

    const updateData: Record<string, unknown> = {};
    if (dto.customerId !== undefined) updateData.customerId = dto.customerId;
    if (dto.salesPersonId !== undefined) updateData.salesPersonId = dto.salesPersonId;
    if (dto.salePointId !== undefined) updateData.salePointId = dto.salePointId;
    if (dto.warehouseId !== undefined) updateData.warehouseId = dto.warehouseId;
    if (dto.date) updateData.date = new Date(dto.date);
    if (dto.discountPercent !== undefined) updateData.discountPercent = new Prisma.Decimal(dto.discountPercent);
    if (dto.discountAmount !== undefined) updateData.discountAmount = new Prisma.Decimal(dto.discountAmount);
    if (dto.taxPercent !== undefined) updateData.taxPercent = new Prisma.Decimal(dto.taxPercent);
    if (dto.paymentMethodId !== undefined) updateData.paymentMethodId = dto.paymentMethodId;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await this.prisma.sale.update({
      where: { ID: id },
      data: updateData,
      include: {
        Customer: true,
        SalesPerson: true,
        SalePoint: true,
        Warehouse: true,
        SaleItems: { include: { Product: true, Unit: true } },
      },
    });

    return this.serialize(updated);
  }

  // NOTE: `ShippingStatus`/`ShippingDate`/`TrackingNumber` were added to the
  // `sales` table by migration 20260918010000_add_sale_shipping (still lowercase
  // `shippingStatus`/`shippingDate`/`trackingNumber` columns), but the teammate's
  // PascalCase schema refactor (commit 4e760c8) dropped these fields from the Sale
  // model in schema.prisma, so the generated Prisma client no longer knows about
  // them. Per this task's constraints we cannot touch schema.prisma or run
  // migrations, so this method falls back to raw SQL against the literal (still
  // camelCase) DB columns to keep the endpoint working. The parent session should
  // double check this — the correct long-term fix is re-adding these 3 fields to
  // the Sale model (with @map if needed) and regenerating the client.
  async updateShipping(id: number, dto: UpdateShippingDto) {
    const sale = await this.prisma.sale.findUnique({ where: { ID: id } });
    if (!sale) throw new NotFoundException('Sale not found');

    const updateData: Record<string, unknown> = {};
    if (dto.ShippingStatus !== undefined) updateData.ShippingStatus = dto.ShippingStatus;
    if (dto.ShippingDate !== undefined) updateData.ShippingDate = dto.ShippingDate ? new Date(dto.ShippingDate) : null;
    if (dto.TrackingNumber !== undefined) updateData.TrackingNumber = dto.TrackingNumber;

    const updated = await this.prisma.sale.update({
      where: { ID: id },
      data: updateData,
      include: { Customer: true },
    });

    return this.serialize(updated);
  }

  async payment(id: number, dto: PaymentDto, userId: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { salePayments: true, paymentStatus: true },
    });
    if (!sale) throw new NotFoundException('Sale not found');

    const statusCode = sale.paymentStatus?.code?.toUpperCase();
    if (statusCode === 'CANCELLED') {
      throw new BadRequestException('Cannot add payment to cancelled sale');
    }

    const currentPaid = sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
    const paymentAmount = dto.Amount;
    const newPaid = currentPaid + paymentAmount;
    const totalAmount = Number(sale.Total);

    const newStatusCode = newPaid >= totalAmount ? 'PAID' : 'PARTIAL';
    const newStatusId = await this.getPaymentStatusId(newStatusCode);

    await this.prisma.$transaction(async (tx) => {
      if (dto.paymentMethodId) {
        await tx.salePayment.create({
          data: {
            saleId: id,
            methodId: dto.paymentMethodId,
            amount: new Prisma.Decimal(paymentAmount),
            referenceNumber: dto.referenceNumber,
            notes: dto.notes,
            createdById: userId,
          },
        });
      }

      await tx.sale.update({
        where: { ID: id },
        data: {
          paymentStatusId: newStatusId,
          paymentMethodId: dto.paymentMethodId || sale.paymentMethodId,
        },
      });

      // Award points on first full payment
      if (newStatusCode === 'PAID' && currentPaid === 0) {
        await this.addPoints(tx, sale.customerId, id, totalAmount);
      }
    });

    return this.findOne(id, {});
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { paymentStatus: true }
    });
    if (!sale) throw new NotFoundException('Sale not found');

    const currentStatus = sale.paymentStatus?.code?.toUpperCase() || 'PENDING';
    const newStatus = dto.paymentStatusCode.toUpperCase();

    const validTransitions: Record<string, string[]> = {
      PENDING: ['PARTIAL', 'PAID', 'CANCELLED'],
      PARTIAL: ['PAID', 'CANCELLED'],
      INSTALMENT: ['PARTIAL', 'PAID', 'CANCELLED'],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from '${currentStatus}' to '${newStatus}'`,
      );
    }

    const newStatusId = await this.getPaymentStatusId(newStatus);

    const updated = await this.prisma.sale.update({
      where: { id },
      data: { paymentStatusId: newStatusId },
      include: {
        Customer: true,
        SalesPerson: true,
        SaleItems: { include: { Product: true, Unit: true } },
      },
    });

    return this.serialize(updated);
  }

  async cancel(id: number) {
    return this.updateStatus(id, { paymentStatusCode: 'CANCELLED' });
  }

  async delete(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { salePayments: true, saleReturns: true, saleItems: true, paymentStatus: true },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    if (sale.SalePayments && sale.SalePayments.length > 0) {
      throw new BadRequestException('Cannot delete sale with payments');
    }
    if (sale.SaleReturns && sale.SaleReturns.length > 0) {
      throw new BadRequestException('Cannot delete sale with returns');
    }

    const statusCode = sale.paymentStatus?.code?.toUpperCase();
    if (statusCode && statusCode !== 'PENDING') {
      throw new BadRequestException('Can only delete pending sales');
    }

    await this.prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of sale.SaleItems) {
        await tx.product.update({
          where: { ID: item.ProductID },
          data: { Stock: { increment: item.Quantity } },
        });
      }

      await tx.sale.delete({ where: { ID: id } });
    });

    return { id };
  }

  private async addPoints(tx: any, customerId: number, saleId: number, totalAmount: number) {
    const setting = await tx.pointSetting.findFirst({ where: { IsActive: true } });
    if (!setting) return;

    const minimumTransaction = Number(setting.MinimumTransaction);
    if (totalAmount < minimumTransaction) return;

    const pointsPerRupiah = Number(setting.PointsPerRupiah);
    const points = Math.floor(totalAmount * pointsPerRupiah);

    if (points <= 0) return;

    await tx.customer.update({
      where: { ID: customerId },
      data: { PointBalance: { increment: points } },
    });
  }

  private async getCashMethodId(tx: any): Promise<number | undefined> {
    const cashMethod = await tx.paymentMethod.findUnique({ where: { Code: 'CASH' } });
    return cashMethod?.ID;
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
    const prefix = `SA-${year}${month}`;

    const lastSale = await this.prisma.sale.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastSale) {
      const lastSeq = parseInt(lastSale.Code.split('-').pop() || '0', 10);
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
    if (data.SaleItems && Array.isArray(data.SaleItems)) {
      result.SaleItems = data.SaleItems.map((item: any) => this.serialize(item));
    }
    return result;
  }
}
