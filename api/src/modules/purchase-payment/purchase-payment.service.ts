import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '.prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CreatePurchasePaymentDto, UpdatePurchasePaymentDto } from './dto/purchase-payment.dto';

@Injectable()
export class PurchasePaymentService {
  private readonly CACHE_PREFIX = 'purchase_payments';
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
          this.prisma.purchasePayment.findMany(findArgs),
          this.prisma.purchasePayment.count({ where: prismaQuery.where }),
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
          allowedIncludes: ['*'],
        });

        const findArgs: any = { where: { id } };

        if (prismaQuery.select) {
          findArgs.select = prismaQuery.select;
        } else if (prismaQuery.include) {
          findArgs.include = prismaQuery.include;
        }

        const data = await this.prisma.purchasePayment.findUnique(findArgs);
        return data ? this.serialize(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreatePurchasePaymentDto, userId: string) {
    // Verify purchase exists
    const purchase = await this.prisma.purchase.findUnique({ where: { id: dto.purchase_id } });
    if (!purchase) throw new NotFoundException('Purchase not found');

    // Check if payment would exceed remaining amount
    const existingPayments = await this.prisma.purchasePayment.findMany({
      where: { purchase_id: dto.purchase_id },
    });
    const paidAmount = existingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const newTotal = paidAmount + dto.amount;
    const remaining = Number(purchase.total) - paidAmount;

    if (dto.amount > remaining) {
      throw new BadRequestException(`Payment amount (${dto.amount}) exceeds remaining amount (${remaining})`);
    }

    const payment = await this.prisma.purchasePayment.create({
      data: {
        purchase_id: dto.purchase_id,
        method: dto.method,
        amount: new Prisma.Decimal(dto.amount.toString()),
        reference_number: dto.reference_number,
        date: dto.date ? new Date(dto.date) : new Date(),
        notes: dto.notes,
        createdById: userId,
      },
      include: { purchase: true, creator: true },
    });

    // Update purchase payment status
    await this.updatePurchasePaymentStatus(dto.purchase_id);

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern(`purchases:${dto.purchase_id}*`);

    return this.serialize(payment);
  }

  async update(id: number, dto: UpdatePurchasePaymentDto) {
    const payment = await this.prisma.purchasePayment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Purchase payment not found');

    const updateData: any = {};
    if (dto.method) updateData.method = dto.method;
    if (dto.amount) updateData.amount = new Prisma.Decimal(dto.amount.toString());
    if (dto.reference_number !== undefined) updateData.reference_number = dto.reference_number;
    if (dto.date) updateData.date = new Date(dto.date);
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await this.prisma.purchasePayment.update({
      where: { id },
      data: updateData,
      include: { purchase: true, creator: true },
    });

    await this.updatePurchasePaymentStatus(payment.purchase_id);
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern(`purchases:${payment.purchase_id}*`);

    return this.serialize(updated);
  }

  async delete(id: number) {
    const payment = await this.prisma.purchasePayment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Purchase payment not found');

    await this.prisma.purchasePayment.delete({ where: { id } });
    await this.updatePurchasePaymentStatus(payment.purchase_id);

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern(`purchases:${payment.purchase_id}*`);

    return { id };
  }

  async findByPurchase(purchaseId: number, query: Record<string, any> = {}) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      allowedIncludes: ['*'],
      defaultOrderBy: { createdAt: 'desc' },
    });

    const findArgs: any = {
      where: { purchase_id: purchaseId, ...prismaQuery.where },
      orderBy: prismaQuery.orderBy,
      skip: prismaQuery.skip,
      take: prismaQuery.take,
    };

    if (prismaQuery.include) {
      findArgs.include = prismaQuery.include;
    }

    const [data, total] = await Promise.all([
      this.prisma.purchasePayment.findMany(findArgs),
      this.prisma.purchasePayment.count({ where: { purchase_id: purchaseId } }),
    ]);

    const serializedData = data.map((item) => this.serialize(item));
    return { data: serializedData, total, skip: prismaQuery.skip, take: prismaQuery.take };
  }

  private async updatePurchasePaymentStatus(purchaseId: number) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { purchasePayments: true },
    });

    if (!purchase) return;

    const paidAmount = purchase.purchasePayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalAmount = Number(purchase.total);

    let paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';
    if (paidAmount > 0 && paidAmount < totalAmount) {
      paymentStatus = 'PARTIAL';
    } else if (paidAmount >= totalAmount) {
      paymentStatus = 'PAID';
    }

    const remainingAmount = totalAmount - paidAmount;

    await this.prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        paymentStatus,
        paid: new Prisma.Decimal(paidAmount.toString()),
        remaining: new Prisma.Decimal(remainingAmount.toString()),
      },
    });
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
    return result;
  }
}
