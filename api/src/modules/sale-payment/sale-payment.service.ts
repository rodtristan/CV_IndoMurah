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

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
  ) {}

  private async getPaymentStatusByCode(code: string) {
    const status = await this.prisma.paymentStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Payment status '${code}' tidak ditemukan`);
    return status;
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
    const parent = await this.prisma.sale.findUnique({ where: { ID: dto.SaleID } });
    if (!parent) throw new NotFoundException('Sale not found');

    // Overpayment guard counts every payment, including cek/bg not yet cleared.
    const existing = await this.prisma.salePayment.findMany({ where: { SaleID: dto.SaleID } });
    const committed = existing.reduce((sum, p) => sum + Number(p.Amount), 0);
    const remaining = Number(parent.Total) - committed;
    if (dto.Amount <= 0) throw new BadRequestException('Jumlah pembayaran harus lebih dari 0');
    if (dto.Amount > remaining + 0.005) {
      throw new BadRequestException(`Payment amount (${dto.Amount}) exceeds remaining amount (${remaining})`);
    }

    const instrument = dto.InstrumentType ?? 'CASH';
    const cleared = instrument === 'CASH';
    const payment = await this.prisma.salePayment.create({
      data: {
        SaleID: dto.SaleID,
        MethodID: dto.MethodID,
        Amount: new Prisma.Decimal(dto.Amount.toString()),
        ReferenceNumber: dto.ReferenceNumber,
        Date: dto.Date ? new Date(dto.Date) : new Date(),
        Notes: dto.Notes,
        InstrumentType: instrument,
        DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
        IsCleared: cleared,
        ClearedAt: cleared ? new Date() : null,
        CreatedByID: userId,
      },
      include: { Sale: true, Creator: true },
    });

    await this.updateSalePaymentStatus(dto.SaleID);
    await this.invalidate(dto.SaleID);
    return this.serialize(payment);
  }

  async update(id: number, dto: UpdateSalePaymentDto) {
    const payment = await this.prisma.salePayment.findUnique({ where: { ID: id } });
    if (!payment) throw new NotFoundException('Sale payment not found');

    if (dto.Amount !== undefined) {
      const parent = await this.prisma.sale.findUnique({ where: { ID: payment.SaleID } });
      const others = await this.prisma.salePayment.findMany({ where: { SaleID: payment.SaleID, NOT: { ID: id } } });
      const committed = others.reduce((sum, p) => sum + Number(p.Amount), 0);
      if (dto.Amount <= 0) throw new BadRequestException('Jumlah pembayaran harus lebih dari 0');
      if (parent && dto.Amount + committed > Number(parent.Total) + 0.005) {
        throw new BadRequestException('Payment amount exceeds remaining amount');
      }
    }

    const updateData: any = {};
    if (dto.MethodID) updateData.MethodID = dto.MethodID;
    if (dto.Amount !== undefined) updateData.Amount = new Prisma.Decimal(dto.Amount.toString());
    if (dto.ReferenceNumber !== undefined) updateData.ReferenceNumber = dto.ReferenceNumber;
    if (dto.Date) updateData.Date = new Date(dto.Date);
    if (dto.Notes !== undefined) updateData.Notes = dto.Notes;
    if (dto.DueDate !== undefined) updateData.DueDate = dto.DueDate ? new Date(dto.DueDate) : null;
    if (dto.InstrumentType) {
      updateData.InstrumentType = dto.InstrumentType;
      if (dto.InstrumentType === 'CASH') {
        updateData.IsCleared = true;
        updateData.ClearedAt = payment.ClearedAt ?? new Date();
      } else if (payment.InstrumentType === 'CASH') {
        updateData.IsCleared = false;
        updateData.ClearedAt = null;
      }
    }

    const updated = await this.prisma.salePayment.update({
      where: { ID: id },
      data: updateData,
      include: { Sale: true, Creator: true },
    });

    await this.updateSalePaymentStatus(payment.SaleID);
    await this.invalidate(payment.SaleID);
    return this.serialize(updated);
  }

  async clear(id: number) {
    const payment = await this.prisma.salePayment.findUnique({ where: { ID: id } });
    if (!payment) throw new NotFoundException('Sale payment not found');
    if (payment.IsCleared) throw new BadRequestException('Pembayaran sudah lunas/cair');

    const updated = await this.prisma.salePayment.update({
      where: { ID: id },
      data: { IsCleared: true, ClearedAt: new Date() },
    });
    await this.updateSalePaymentStatus(payment.SaleID);
    await this.invalidate(payment.SaleID);
    return this.serialize(updated);
  }

  async delete(id: number) {
    const payment = await this.prisma.salePayment.findUnique({ where: { ID: id } });
    if (!payment) throw new NotFoundException('Sale payment not found');

    await this.prisma.salePayment.delete({ where: { ID: id } });
    await this.updateSalePaymentStatus(payment.SaleID);
    await this.invalidate(payment.SaleID);
    return { id };
  }

  async list(query: Record<string, any>) {
    const where: any = {};
    if (query.from || query.to) {
      where.Date = {};
      if (query.from) where.Date.gte = new Date(query.from);
      if (query.to) {
        const to = new Date(query.to);
        to.setHours(23, 59, 59, 999);
        where.Date.lte = to;
      }
    }
    if (query.methodId) where.MethodID = Number(query.methodId);
    if (query.instrumentType) where.InstrumentType = String(query.instrumentType);
    else if (query.chequeOnly === 'true') where.InstrumentType = { in: ['CEK', 'BG'] };
    if (query.cleared === 'true') where.IsCleared = true;
    if (query.cleared === 'false') where.IsCleared = false;
    if (query.search) {
      const s = String(query.search);
      where.OR = [
        { ReferenceNumber: { contains: s, mode: 'insensitive' } },
        { Sale: { Code: { contains: s, mode: 'insensitive' } } },
        { Sale: { Customer: { Name: { contains: s, mode: 'insensitive' } } } },
      ];
    }
    const skip = Number(query.skip) || 0;
    const take = Math.min(Number(query.take) || 50, 500);
    const [data, total] = await Promise.all([
      this.prisma.salePayment.findMany({
        where,
        include: { Sale: { include: { Customer: true } }, Method: true },
        orderBy: [{ Date: 'desc' }, { ID: 'desc' }],
        skip,
        take,
      }),
      this.prisma.salePayment.count({ where }),
    ]);
    return { data: data.map((d) => this.serializeDeep(d)), total, skip, take };
  }

  private async invalidate(parentId: number) {
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern(`sales:${parentId}*`);
    await this.redis.invalidatePattern('reports:*');
  }

  private serializeDeep(v: any): any {
    if (v instanceof Prisma.Decimal) return Number(v);
    if (v instanceof Date) return v.toISOString();
    if (Array.isArray(v)) return v.map((x) => this.serializeDeep(x));
    if (v && typeof v === 'object') {
      const r: any = {};
      for (const [k, x] of Object.entries(v)) r[k] = this.serializeDeep(x);
      return r;
    }
    return v;
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

    // Only cleared payments (cash, or cek/bg marked lunas) count as paid.
    const paidAmount = sale.SalePayments.filter((p) => p.IsCleared).reduce((sum, p) => sum + Number(p.Amount), 0);
    const totalAmount = Number(sale.Total);

    let code: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';
    if (paidAmount > 0 && paidAmount < totalAmount) code = 'PARTIAL';
    else if (paidAmount >= totalAmount && totalAmount > 0) code = 'PAID';

    const status = await this.getPaymentStatusByCode(code);
    await this.prisma.sale.update({ where: { ID: saleId }, data: { PaymentStatusID: status.ID } });
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
