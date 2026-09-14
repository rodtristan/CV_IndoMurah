import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '.prisma/client';
import { CreateSalePaymentDto, UpdateSalePaymentDto } from './dto/sale-payment.dto';

@Injectable()
export class SalePaymentService {
  private readonly CACHE_PREFIX = 'sale_payments';
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
          searchableFields: ['code', 'notes', 'referenceNumber'],
          allowedIncludes: ['sale', 'creator'],
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
    const cacheKey = `${this.CACHE_PREFIX}:${id}`;

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          allowedIncludes: ['sale', 'creator'],
        });

        const findArgs: any = { where: { id } };

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
    const sale = await this.prisma.sale.findUnique({ where: { id: dto.sale_id } });
    if (!sale) throw new NotFoundException('Sale not found');

    // Check if payment would exceed sale total
    const existingPayments = await this.prisma.salePayment.findMany({
      where: { saleId: dto.sale_id },
    });
    const paidAmount = existingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const newTotal = paidAmount + dto.amount;

    if (newTotal > Number(sale.total)) {
      throw new BadRequestException('Payment amount exceeds sale total');
    }

    const payment = await this.prisma.salePayment.create({
      data: {
        saleId: dto.sale_id,
        method: dto.method,
        amount: new Prisma.Decimal(dto.amount.toString()),
        referenceNumber: dto.reference_number,
        date: dto.date ? new Date(dto.date) : new Date(),
        notes: dto.notes,
        createdById: userId,
      },
      include: { sale: true, creator: true },
    });

    // Update sale payment status
    await this.updateSalePaymentStatus(dto.sale_id);

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern(`sales:${dto.sale_id}*`);

    return this.serialize(payment);
  }

  async update(id: number, dto: UpdateSalePaymentDto) {
    const payment = await this.prisma.salePayment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Sale payment not found');

    const updateData: any = {};
    if (dto.method) updateData.method = dto.method;
    if (dto.amount) updateData.amount = new Prisma.Decimal(dto.amount.toString());
    if (dto.reference_number !== undefined) updateData.referenceNumber = dto.reference_number;
    if (dto.date) updateData.date = new Date(dto.date);
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await this.prisma.salePayment.update({
      where: { id },
      data: updateData,
      include: { sale: true, creator: true },
    });

    await this.updateSalePaymentStatus(payment.saleId);
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern(`sales:${payment.saleId}*`);

    return this.serialize(updated);
  }

  async delete(id: number) {
    const payment = await this.prisma.salePayment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Sale payment not found');

    await this.prisma.salePayment.delete({ where: { id } });
    await this.updateSalePaymentStatus(payment.saleId);

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern(`sales:${payment.saleId}*`);

    return { id };
  }

  async findBySale(saleId: number, query: Record<string, any> = {}) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      allowedIncludes: ['creator'],
      defaultOrderBy: { createdAt: 'desc' },
    });

    const findArgs: any = {
      where: { saleId, ...prismaQuery.where },
      orderBy: prismaQuery.orderBy,
      skip: prismaQuery.skip,
      take: prismaQuery.take,
    };

    if (prismaQuery.include) {
      findArgs.include = prismaQuery.include;
    }

    const [data, total] = await Promise.all([
      this.prisma.salePayment.findMany(findArgs),
      this.prisma.salePayment.count({ where: { saleId } }),
    ]);

    const serializedData = data.map((item) => this.serialize(item));
    return { data: serializedData, total, skip: prismaQuery.skip, take: prismaQuery.take };
  }

  private async updateSalePaymentStatus(saleId: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: { salePayments: true },
    });

    if (!sale) return;

    const paidAmount = sale.salePayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalAmount = Number(sale.total);

    let paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';
    if (paidAmount > 0 && paidAmount < totalAmount) {
      paymentStatus = 'PARTIAL';
    } else if (paidAmount >= totalAmount) {
      paymentStatus = 'PAID';
    }

    await this.prisma.sale.update({
      where: { id: saleId },
      data: { paymentStatus },
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
