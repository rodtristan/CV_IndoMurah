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

  constructor(
    private prisma: PrismaService,
    private queryService: QueryService,
    private notificationService: NotificationService,
  ) {}

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

    // Calculate totals
    const subtotal = dto.Items.reduce((sum, item) => {
      const itemDiscount = item.DiscountAmount || 0;
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
    const paymentStatus = await this.getPaymentStatusByCode(paymentStatusCode);

    const paymentMethodId = dto.PaymentMethodID ?? (await this.getCashMethodId(this.prisma));

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
          Code: code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          CustomerID: dto.CustomerID,
          SalesPersonID: dto.SalesPersonID,
          SalePointID: dto.SalePointID,
          WarehouseID: dto.WarehouseID,
          Subtotal: new Prisma.Decimal(subtotal),
          DiscountPercent: new Prisma.Decimal(dto.DiscountPercent || 0),
          DiscountAmount: new Prisma.Decimal(discountAmount),
          TaxPercent: new Prisma.Decimal(dto.TaxPercent || 0),
          TaxAmount: new Prisma.Decimal(taxAmount),
          Total: new Prisma.Decimal(total),
          CashAmount: new Prisma.Decimal(cashAmount),
          ChangeAmount: new Prisma.Decimal(changeAmount),
          PaymentStatusID: paymentStatus.ID,
          PaymentMethodID: paymentMethodId,
          Notes: dto.Notes,
          CreatedByID: userId,
          SaleItems: { create: saleItemsData },
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
      if (paid > 0 && paymentMethodId) {
        await tx.salePayment.create({
          data: {
            SaleID: newSale.ID,
            MethodID: paymentMethodId,
            Amount: new Prisma.Decimal(paid),
            ReferenceNumber: null,
            CreatedByID: userId,
          },
        });

        // Add loyalty points
        await this.addPoints(tx, dto.CustomerID, newSale.ID, total);
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
      where: { ID: id },
      include: { PaymentStatus: true },
    });
    if (!sale) throw new NotFoundException('Sale not found');

    const statusCode = sale.PaymentStatus?.Code?.toUpperCase();
    if (statusCode === 'PAID' || statusCode === 'CANCELLED') {
      throw new BadRequestException('Cannot update paid or cancelled sales');
    }

    const updateData: Record<string, unknown> = {};
    if (dto.CustomerID !== undefined) updateData.CustomerID = dto.CustomerID;
    if (dto.SalesPersonID !== undefined) updateData.SalesPersonID = dto.SalesPersonID;
    if (dto.SalePointID !== undefined) updateData.SalePointID = dto.SalePointID;
    if (dto.WarehouseID !== undefined) updateData.WarehouseID = dto.WarehouseID;
    if (dto.Date) updateData.Date = new Date(dto.Date);
    if (dto.DiscountPercent !== undefined) updateData.DiscountPercent = new Prisma.Decimal(dto.DiscountPercent);
    if (dto.DiscountAmount !== undefined) updateData.DiscountAmount = new Prisma.Decimal(dto.DiscountAmount);
    if (dto.TaxPercent !== undefined) updateData.TaxPercent = new Prisma.Decimal(dto.TaxPercent);
    if (dto.PaymentMethodID !== undefined) updateData.PaymentMethodID = dto.PaymentMethodID;
    if (dto.Notes !== undefined) updateData.Notes = dto.Notes;

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
      where: { ID: id },
      include: { SalePayments: true, PaymentStatus: true },
    });
    if (!sale) throw new NotFoundException('Sale not found');

    const statusCode = sale.PaymentStatus?.Code?.toUpperCase();
    if (statusCode === 'CANCELLED') {
      throw new BadRequestException('Cannot add payment to cancelled sale');
    }

    const currentPaid = sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
    const paymentAmount = dto.Amount;
    const newPaid = currentPaid + paymentAmount;
    const totalAmount = Number(sale.Total);

    const newStatusCode = newPaid >= totalAmount ? 'PAID' : 'PARTIAL';
    const newStatus = await this.getPaymentStatusByCode(newStatusCode);
    const paymentMethodId = dto.PaymentMethodID ?? sale.PaymentMethodID ?? (await this.getCashMethodId(this.prisma));

    await this.prisma.$transaction(async (tx) => {
      if (paymentMethodId) {
        await tx.salePayment.create({
          data: {
            SaleID: id,
            MethodID: paymentMethodId,
            Amount: new Prisma.Decimal(paymentAmount),
            ReferenceNumber: dto.ReferenceNumber,
            Notes: dto.Notes,
            CreatedByID: userId,
          },
        });
      }

      await tx.sale.update({
        where: { ID: id },
        data: {
          PaymentStatusID: newStatus.ID,
          PaymentMethodID: paymentMethodId,
        },
      });

      // Award points on first full payment
      if (newStatusCode === 'PAID' && currentPaid === 0) {
        await this.addPoints(tx, sale.CustomerID, id, totalAmount);
      }
    });

    return this.findOne(id, {});
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const sale = await this.prisma.sale.findUnique({
      where: { ID: id },
      include: { PaymentStatus: true },
    });
    if (!sale) throw new NotFoundException('Sale not found');

    const currentStatus = sale.PaymentStatus?.Code?.toUpperCase() || 'PENDING';
    const newStatus = dto.PaymentStatusCode.toUpperCase();

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

    const newPaymentStatus = await this.getPaymentStatusByCode(newStatus);

    const updated = await this.prisma.sale.update({
      where: { ID: id },
      data: { PaymentStatusID: newPaymentStatus.ID },
      include: {
        Customer: true,
        SalesPerson: true,
        SaleItems: { include: { Product: true, Unit: true } },
      },
    });

    return this.serialize(updated);
  }

  async cancel(id: number) {
    return this.updateStatus(id, { PaymentStatusCode: 'CANCELLED' });
  }

  async delete(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { ID: id },
      include: { SalePayments: true, SaleReturns: true, SaleItems: true, PaymentStatus: true },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    if (sale.SalePayments && sale.SalePayments.length > 0) {
      throw new BadRequestException('Cannot delete sale with payments');
    }
    if (sale.SaleReturns && sale.SaleReturns.length > 0) {
      throw new BadRequestException('Cannot delete sale with returns');
    }

    const statusCode = sale.PaymentStatus?.Code?.toUpperCase();
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

  private async addPoints(tx: Prisma.TransactionClient, customerId: number, saleId: number, totalAmount: number) {
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

  private async getCashMethodId(client: Prisma.TransactionClient | PrismaService): Promise<number | undefined> {
    const cashMethod = await client.paymentMethod.findUnique({ where: { Code: 'CASH' } });
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
