import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '@prisma/client';
import { CreateSalePaymentDto, UpdateSalePaymentDto } from './dto/sale-payment.dto';

@Injectable()
export class SalePaymentService {
  private readonly CACHE_PREFIX = 'sale_payments';
  private readonly CACHE_TTL = 60;

  // Default PaymentStatus IDs
  private readonly STATUS_PENDING = 1;
  private readonly STATUS_PARTIAL = 2;
  private readonly STATUS_PAID = 3;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
  ) {}

  private async getPaymentStatusId(statusCode: string): Promise<number> {
    const statusMap: Record<string, number> = {
      'PENDING': this.STATUS_PENDING,
      'PARTIAL': this.STATUS_PARTIAL,
      'PAID': this.STATUS_PAID,
    };
    return statusMap[statusCode.toUpperCase()] || this.STATUS_PENDING;
  }

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
          this.prisma.salePayment.findMany(findArgs),
          this.prisma.salePayment.count({ where: prismaQuery.where }),
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

        const data = await this.prisma.salePayment.findUnique(findArgs);
        return data ? this.serialize(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreateSalePaymentDto, userId: string) {
    // Verify sale exists
    const sale = await this.prisma.sale.findUnique({ where: { ID: dto.SaleID } });
    if (!sale) throw new NotFoundException('Sale not found');

    // Check if payment would exceed sale total
    const existingPayments = await this.prisma.salePayment.findMany({
      where: { SaleID: dto.SaleID },
    });
    const paidAmount = existingPayments.reduce((sum, p) => sum + Number(p.Amount), 0);
    const newTotal = paidAmount + dto.Amount;

    if (newTotal > Number(sale.Total)) {
      throw new BadRequestException('Payment amount exceeds sale total');
    }

    const payment = await this.prisma.salePayment.create({
      data: {
        saleId: dto.saleId,
        methodId: dto.methodId,
        amount: new Prisma.Decimal(dto.amount.toString()),
        referenceNumber: dto.referenceNumber,
        date: dto.date ? new Date(dto.date) : new Date(),
        notes: dto.notes,
        createdById: userId,
      },
      include: { Sale: true, Creator: true },
    });

    // Update sale payment status
    await this.updateSalePaymentStatus(dto.SaleID);

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern(`sales:${dto.SaleID}*`);
    await this.redis.invalidatePattern('reports:*');

    return this.serialize(payment);
  }

  async update(id: number, dto: UpdateSalePaymentDto) {
    const payment = await this.prisma.salePayment.findUnique({ where: { ID: id } });
    if (!payment) throw new NotFoundException('Sale payment not found');

    const updateData: any = {};
    if (dto.methodId) updateData.methodId = dto.methodId;
    if (dto.amount) updateData.amount = new Prisma.Decimal(dto.amount.toString());
    if (dto.referenceNumber !== undefined) updateData.referenceNumber = dto.referenceNumber;
    if (dto.date) updateData.date = new Date(dto.date);
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await this.prisma.salePayment.update({
      where: { ID: id },
      data: updateData,
      include: { Sale: true, Creator: true },
    });

    await this.updateSalePaymentStatus(payment.SaleID);
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern(`sales:${payment.SaleID}*`);
    await this.redis.invalidatePattern('reports:*');

    return this.serialize(updated);
  }

  async delete(id: number) {
    const payment = await this.prisma.salePayment.findUnique({ where: { ID: id } });
    if (!payment) throw new NotFoundException('Sale payment not found');

    await this.prisma.salePayment.delete({ where: { ID: id } });
    await this.updateSalePaymentStatus(payment.SaleID);

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern(`sales:${payment.SaleID}*`);
    await this.redis.invalidatePattern('reports:*');

    return { id };
  }

  async findBySale(saleId: number, query: Record<string, any> = {}) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      allowedIncludes: ['*'],
      defaultOrderBy: { CreatedAt: 'desc' },
    });

    const findArgs: any = {
      where: { SaleID: saleId, ...prismaQuery.where },
      orderBy: prismaQuery.orderBy,
      skip: prismaQuery.skip,
      take: prismaQuery.take,
    };

    if (prismaQuery.include) {
      findArgs.include = prismaQuery.include;
    }

    const [data, total] = await Promise.all([
      this.prisma.salePayment.findMany(findArgs),
      this.prisma.salePayment.count({ where: { SaleID: saleId } }),
    ]);

    const serializedData = data.map((item) => this.serialize(item));
    return { data: serializedData, total, skip: prismaQuery.skip, take: prismaQuery.take };
  }

  private async updateSalePaymentStatus(saleId: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { ID: saleId },
      include: { SalePayments: true },
    });

    if (!sale) return;

    const paidAmount = sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
    const totalAmount = Number(sale.Total);

    let paymentStatusCode: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';
    if (paidAmount > 0 && paidAmount < totalAmount) {
      paymentStatusCode = 'PARTIAL';
    } else if (paidAmount >= totalAmount) {
      paymentStatusCode = 'PAID';
    }

    const paymentStatusId = await this.getPaymentStatusId(paymentStatusCode);

    await this.prisma.sale.update({
      where: { id: saleId },
      data: { paymentStatusId },
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
