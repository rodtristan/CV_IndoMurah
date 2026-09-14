import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '@prisma/client';
import { CreateSaleDto, UpdateSaleDto, PaymentDto, UpdateStatusDto } from './dto/sale.dto';

@Injectable()
export class SaleService {
  private readonly CACHE_PREFIX = 'sales';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private queryService: QueryService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      defaultOrderBy: { createdAt: 'desc' },
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

    const findArgs: Record<string, unknown> = { where: { id } };

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
    const subtotal = dto.items.reduce((sum, item) => {
      const itemDiscount = (item.discountAmount || 0);
      return sum + (item.unitPrice * item.quantity - itemDiscount);
    }, 0);

    const discountAmount = dto.discountAmount || 0;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = dto.taxPercent ? afterDiscount * (dto.taxPercent / 100) : 0;
    const total = afterDiscount + taxAmount;

    const cashAmount = dto.cashAmount || 0;
    const changeAmount = cashAmount > total ? cashAmount - total : 0;
    const paid = cashAmount >= total ? total : cashAmount;
    const remaining = total - paid;

    const paymentStatus = paid >= total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING';

    const saleItemsData = dto.items.map((item) => {
      const itemDiscount = item.discountAmount || 0;
      const itemSubtotal = item.unitPrice * item.quantity - itemDiscount;
      return {
        productId: item.productId,
        quantity: new Prisma.Decimal(item.quantity),
        unitId: item.unitId,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        discountPercent: new Prisma.Decimal(item.discountPercent || 0),
        discountAmount: new Prisma.Decimal(itemDiscount),
        subtotal: new Prisma.Decimal(itemSubtotal),
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
          paymentStatus: paymentStatus as any,
          paymentMethod: dto.paymentMethod,
          notes: dto.notes,
          createdById: userId,
          saleItems: { create: saleItemsData },
        },
        include: {
          customer: true,
          salesPerson: true,
          salePoint: true,
          warehouse: true,
          saleItems: { include: { product: true, unit: true } },
        },
      });

      // Decrease product stock
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: new Prisma.Decimal(item.quantity) } },
        });
      }

      // Record payment if cash received
      if (paid > 0) {
        await tx.salePayment.create({
          data: {
            saleId: newSale.id,
            method: dto.paymentMethod || 'CASH',
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

    return this.serialize(sale);
  }

  async update(id: number, dto: UpdateSaleDto) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Sale not found');
    if (sale.paymentStatus === 'PAID' || sale.paymentStatus === 'CANCELLED') {
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
    if (dto.paymentMethod !== undefined) updateData.paymentMethod = dto.paymentMethod;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await this.prisma.sale.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        salesPerson: true,
        salePoint: true,
        warehouse: true,
        saleItems: { include: { product: true, unit: true } },
      },
    });

    return this.serialize(updated);
  }

  async payment(id: number, dto: PaymentDto, userId: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { salePayments: true },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    if (sale.paymentStatus === 'CANCELLED') {
      throw new BadRequestException('Cannot add payment to cancelled sale');
    }

    const currentPaid = sale.salePayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const paymentAmount = dto.amount;
    const newPaid = currentPaid + paymentAmount;
    const totalAmount = Number(sale.total);

    let newStatus: 'PARTIAL' | 'PAID' = 'PARTIAL';
    const actualPaid = newPaid >= totalAmount ? totalAmount : newPaid;
    if (newPaid >= totalAmount) newStatus = 'PAID';

    await this.prisma.$transaction(async (tx) => {
      await tx.salePayment.create({
        data: {
          saleId: id,
          method: dto.paymentMethod || 'CASH',
          amount: new Prisma.Decimal(paymentAmount),
          referenceNumber: dto.referenceNumber,
          notes: dto.notes,
          createdById: userId,
        },
      });

      await tx.sale.update({
        where: { id },
        data: {
          paymentStatus: newStatus,
          paymentMethod: dto.paymentMethod || sale.paymentMethod,
        },
      });

      // Award points on first full payment
      if (newStatus === 'PAID' && currentPaid === 0) {
        await this.addPoints(tx, sale.customerId, id, totalAmount);
      }
    });

    return this.findOne(id, {});
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Sale not found');

    const validTransitions: Record<string, string[]> = {
      PENDING: ['PARTIAL', 'PAID', 'CANCELLED'],
      PARTIAL: ['PAID', 'CANCELLED'],
      INSTALMENT: ['PARTIAL', 'PAID', 'CANCELLED'],
    };

    const allowed = validTransitions[sale.paymentStatus] || [];
    if (!allowed.includes(dto.paymentStatus)) {
      throw new BadRequestException(
        `Cannot transition from '${sale.paymentStatus}' to '${dto.paymentStatus}'`,
      );
    }

    const updated = await this.prisma.sale.update({
      where: { id },
      data: { paymentStatus: dto.paymentStatus },
      include: {
        customer: true,
        salesPerson: true,
        saleItems: { include: { product: true, unit: true } },
      },
    });

    return this.serialize(updated);
  }

  async cancel(id: number) {
    return this.updateStatus(id, { paymentStatus: 'CANCELLED' });
  }

  async delete(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { salePayments: true, saleReturns: true, saleItems: true },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    if (sale.salePayments && sale.salePayments.length > 0) {
      throw new BadRequestException('Cannot delete sale with payments');
    }
    if (sale.saleReturns && sale.saleReturns.length > 0) {
      throw new BadRequestException('Cannot delete sale with returns');
    }
    if (sale.paymentStatus !== 'PENDING') {
      throw new BadRequestException('Can only delete pending sales');
    }

    await this.prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of sale.saleItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.sale.delete({ where: { id } });
    });

    return { id };
  }

  private async addPoints(tx: any, customerId: number, saleId: number, totalAmount: number) {
    const setting = await tx.pointSetting.findFirst({ where: { isActive: true } });
    if (!setting) return;

    const minimumTransaction = Number(setting.minimumTransaction);
    if (totalAmount < minimumTransaction) return;

    const pointsPerRupiah = Number(setting.pointsPerRupiah);
    const points = Math.floor(totalAmount * pointsPerRupiah);

    if (points <= 0) return;

    await tx.customer.update({
      where: { id: customerId },
      data: { pointBalance: { increment: points } },
    });
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SA-${year}${month}`;

    const lastSale = await this.prisma.sale.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });

    let nextNumber = 1;
    if (lastSale) {
      const lastSeq = parseInt(lastSale.code.split('-').pop() || '0', 10);
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
    if (data.saleItems && Array.isArray(data.saleItems)) {
      result.saleItems = data.saleItems.map((item: any) => this.serialize(item));
    }
    return result;
  }
}
