import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '@prisma/client';
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

        const data = await this.prisma.purchasePayment.findUnique(findArgs);
        return data ? this.serialize(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreatePurchasePaymentDto, userId: string) {
    // Verify purchase exists
    const purchase = await this.prisma.purchase.findUnique({ where: { ID: dto.PurchaseID } });
    if (!purchase) throw new NotFoundException('Purchase not found');

    // Check if payment would exceed remaining amount
    const existingPayments = await this.prisma.purchasePayment.findMany({
      where: { PurchaseID: dto.PurchaseID },
    });
    const paidAmount = existingPayments.reduce((sum, p) => sum + Number(p.Amount), 0);
    const remaining = Number(purchase.Total) - paidAmount;

    if (dto.Amount > remaining) {
      throw new BadRequestException(`Payment amount (${dto.Amount}) exceeds remaining amount (${remaining})`);
    }

    const payment = await this.prisma.purchasePayment.create({
      data: {
        PurchaseID: dto.PurchaseID,
        MethodID: dto.MethodID,
        Amount: new Prisma.Decimal(dto.Amount.toString()),
        ReferenceNumber: dto.ReferenceNumber,
        Date: dto.Date ? new Date(dto.Date) : new Date(),
        Notes: dto.Notes,
        CreatedByID: userId,
      },
      include: { Purchase: true, Creator: true },
    });

    // Update purchase payment status
    await this.updatePurchasePaymentStatus(dto.PurchaseID);

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern(`purchases:${dto.PurchaseID}*`);
    await this.redis.invalidatePattern('reports:*');

    return this.serialize(payment);
  }

  async update(id: number, dto: UpdatePurchasePaymentDto) {
    const payment = await this.prisma.purchasePayment.findUnique({ where: { ID: id } });
    if (!payment) throw new NotFoundException('Purchase payment not found');

    const updateData: any = {};
    if (dto.MethodID) updateData.MethodID = dto.MethodID;
    if (dto.Amount) updateData.Amount = new Prisma.Decimal(dto.Amount.toString());
    if (dto.ReferenceNumber !== undefined) updateData.ReferenceNumber = dto.ReferenceNumber;
    if (dto.Date) updateData.Date = new Date(dto.Date);
    if (dto.Notes !== undefined) updateData.Notes = dto.Notes;

    const updated = await this.prisma.purchasePayment.update({
      where: { ID: id },
      data: updateData,
      include: { Purchase: true, Creator: true },
    });

    await this.updatePurchasePaymentStatus(payment.PurchaseID);
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern(`purchases:${payment.PurchaseID}*`);
    await this.redis.invalidatePattern('reports:*');

    return this.serialize(updated);
  }

  async delete(id: number) {
    const payment = await this.prisma.purchasePayment.findUnique({ where: { ID: id } });
    if (!payment) throw new NotFoundException('Purchase payment not found');

    await this.prisma.purchasePayment.delete({ where: { ID: id } });
    await this.updatePurchasePaymentStatus(payment.PurchaseID);

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern(`purchases:${payment.PurchaseID}*`);
    await this.redis.invalidatePattern('reports:*');

    return { id };
  }

  async findByPurchase(purchaseId: number, query: Record<string, any> = {}) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      allowedIncludes: ['*'],
      defaultOrderBy: { CreatedAt: 'desc' },
    });

    const findArgs: any = {
      where: { PurchaseID: purchaseId, ...prismaQuery.where },
      orderBy: prismaQuery.orderBy,
      skip: prismaQuery.skip,
      take: prismaQuery.take,
    };

    if (prismaQuery.include) {
      findArgs.include = prismaQuery.include;
    }

    const [data, total] = await Promise.all([
      this.prisma.purchasePayment.findMany(findArgs),
      this.prisma.purchasePayment.count({ where: { PurchaseID: purchaseId } }),
    ]);

    const serializedData = data.map((item) => this.serialize(item));
    return { data: serializedData, total, skip: prismaQuery.skip, take: prismaQuery.take };
  }

  private async updatePurchasePaymentStatus(purchaseId: number) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { ID: purchaseId },
      include: { PurchasePayments: true },
    });

    if (!purchase) return;

    const paidAmount = purchase.PurchasePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
    const totalAmount = Number(purchase.Total);

    let paymentStatusCode: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';
    if (paidAmount > 0 && paidAmount < totalAmount) {
      paymentStatusCode = 'PARTIAL';
    } else if (paidAmount >= totalAmount) {
      paymentStatusCode = 'PAID';
    }

    const paymentStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: paymentStatusCode } });

    const remainingAmount = totalAmount - paidAmount;

    await this.prisma.purchase.update({
      where: { ID: purchaseId },
      data: {
        PaymentStatusID: paymentStatus?.ID ?? purchase.PaymentStatusID,
        Paid: new Prisma.Decimal(paidAmount.toString()),
        Remaining: new Prisma.Decimal(remainingAmount.toString()),
      },
    });
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
    return result;
  }
}
