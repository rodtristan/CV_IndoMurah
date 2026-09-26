import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '@prisma/client';
import { CreateSalePaymentDto, UpdateSalePaymentDto } from './dto/sale-payment.dto';
import { AutoJournalService, REF, Tx } from '../../common/accounting/auto-journal.service';
import { DepositLedgerService } from '../../common/accounting/deposit-ledger.service';
import { PartyBalanceService } from '../../common/stock/party-balance.service';
import { ensureDepositMethod, isChequeInstrument, syncChequeMirror } from '../../common/accounting/payment-link';

@Injectable()
export class SalePaymentService {
  private readonly CACHE_PREFIX = 'sale_payments';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
    private autoJournal: AutoJournalService,
    private deposits: DepositLedgerService,
    private party: PartyBalanceService,
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

  /** Total of non-cancelled returns of the document (reduces what can still be paid). */
  private returnsOf(parent: any): number {
    return ((parent?.SaleReturns ?? []) as any[])
      .filter((r) => (r.Status?.Code ?? '').toUpperCase() !== 'CANCELLED')
      .reduce((a, r) => a + Number(r.TotalReturn), 0);
  }

  // ─── writes: every change posts / reverses the SALE_PAYMENT journal, keeps the cek/BG mirror and deposit usage in sync ───

  private async resolveInstrument(tx: Tx, methodId: number | undefined, instrument: string | undefined, useDeposit?: boolean) {
    let inst = useDeposit ? 'DEPOSIT' : instrument ?? 'CASH';
    let method = methodId ? await tx.paymentMethod.findUnique({ where: { ID: methodId } }) : null;
    if (methodId && !method) throw new BadRequestException('Metode pembayaran tidak ditemukan');
    if (method?.Code === 'DEPOSIT') inst = 'DEPOSIT';
    if (inst === 'DEPOSIT') method = await ensureDepositMethod(tx);
    if (!method) throw new BadRequestException('Metode pembayaran wajib dipilih');
    return { inst, methodId: method.ID };
  }

  /** Apply side effects of a written payment inside the transaction. */
  private async afterPaymentWrite(tx: Tx, paymentId: number, userId: string) {
    const p = await tx.salePayment.findUniqueOrThrow({ where: { ID: paymentId }, include: { Sale: { select: { CustomerID: true, Code: true } } } });
    if (p.InstrumentType === 'DEPOSIT') {
      await this.deposits.useCustomerDeposit(tx, {
        customerId: p.Sale.CustomerID, salePaymentId: p.ID, amount: Number(p.Amount), date: p.Date, userId,
        note: `Pembayaran penjualan ${p.Sale.Code} memakai deposit`,
      });
    } else {
      await this.deposits.releaseCustomerDeposit(tx, p.ID);
    }
    await syncChequeMirror(tx, 'SALE_PAYMENT', p);
    await this.autoJournal.postSalePayment(tx, p.ID, userId);
    await this.updateSalePaymentStatus(tx, p.SaleID);
  }

  async create(dto: CreateSalePaymentDto, userId: string) {
    const parent = await this.prisma.sale.findUnique({ where: { ID: dto.SaleID }, include: { SaleReturns: { select: { TotalReturn: true, Status: { select: { Code: true } } } } } });
    if (!parent) throw new NotFoundException('Sale not found');
    const returned = this.returnsOf(parent);

    // Overpayment guard counts every payment, including cek/bg not yet cleared.
    const existing = await this.prisma.salePayment.findMany({ where: { SaleID: dto.SaleID } });
    const committed = existing.reduce((sum, p) => sum + Number(p.Amount), 0);
    const remaining = Number(parent.Total) - returned - committed;
    if (dto.Amount <= 0) throw new BadRequestException('Jumlah pembayaran harus lebih dari 0');
    if (dto.Amount > remaining + 0.005) {
      throw new BadRequestException(`Payment amount (${dto.Amount}) exceeds remaining amount (${remaining})`);
    }

    const payment = await this.prisma.$transaction(async (tx) => {
      const { inst, methodId } = await this.resolveInstrument(tx, dto.MethodID, dto.InstrumentType, dto.UseDeposit);
      const cleared = !isChequeInstrument(inst);
      const created = await tx.salePayment.create({
        data: {
          SaleID: dto.SaleID,
          MethodID: methodId,
          Amount: new Prisma.Decimal(dto.Amount.toString()),
          ReferenceNumber: dto.ReferenceNumber,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          Notes: dto.Notes,
          InstrumentType: inst,
          DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
          IsCleared: cleared,
          ClearedAt: cleared ? new Date() : null,
          CreatedByID: userId,
        },
      });
      await this.afterPaymentWrite(tx, created.ID, userId);
      return tx.salePayment.findUniqueOrThrow({ where: { ID: created.ID }, include: { Sale: true, Creator: true } });
    });

    await this.invalidate(dto.SaleID);
    return this.serialize(payment);
  }

  async update(id: number, dto: UpdateSalePaymentDto, userId?: string) {
    const payment = await this.prisma.salePayment.findUnique({ where: { ID: id } });
    if (!payment) throw new NotFoundException('Sale payment not found');

    if (dto.Amount !== undefined) {
      const parent = await this.prisma.sale.findUnique({ where: { ID: payment.SaleID }, include: { SaleReturns: { select: { TotalReturn: true, Status: { select: { Code: true } } } } } });
      const others = await this.prisma.salePayment.findMany({ where: { SaleID: payment.SaleID, NOT: { ID: id } } });
      const committed = others.reduce((sum, p) => sum + Number(p.Amount), 0);
      if (dto.Amount <= 0) throw new BadRequestException('Jumlah pembayaran harus lebih dari 0');
      if (parent && dto.Amount + committed > Number(parent.Total) - this.returnsOf(parent) + 0.005) {
        throw new BadRequestException('Payment amount exceeds remaining amount');
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const target = dto.UseDeposit ? 'DEPOSIT' : dto.InstrumentType ?? (dto.UseDeposit === false && payment.InstrumentType === 'DEPOSIT' ? 'CASH' : payment.InstrumentType);
      const leavingDeposit = target !== 'DEPOSIT' && payment.InstrumentType === 'DEPOSIT';
      const { inst, methodId } = await this.resolveInstrument(tx, dto.MethodID ?? (leavingDeposit ? undefined : payment.MethodID), target, dto.UseDeposit);
      const updateData: any = { MethodID: methodId, InstrumentType: inst };
      if (dto.Amount !== undefined) updateData.Amount = new Prisma.Decimal(dto.Amount.toString());
      if (dto.ReferenceNumber !== undefined) updateData.ReferenceNumber = dto.ReferenceNumber;
      if (dto.Date) updateData.Date = new Date(dto.Date);
      if (dto.Notes !== undefined) updateData.Notes = dto.Notes;
      if (dto.DueDate !== undefined) updateData.DueDate = dto.DueDate ? new Date(dto.DueDate) : null;
      if (!isChequeInstrument(inst)) {
        updateData.IsCleared = true;
        updateData.ClearedAt = payment.ClearedAt ?? new Date();
      } else if (!isChequeInstrument(payment.InstrumentType)) {
        updateData.IsCleared = false;
        updateData.ClearedAt = null;
      }
      await tx.salePayment.update({ where: { ID: id }, data: updateData });
      await this.afterPaymentWrite(tx, id, userId ?? payment.CreatedByID);
      return tx.salePayment.findUniqueOrThrow({ where: { ID: id }, include: { Sale: true, Creator: true } });
    });

    await this.invalidate(payment.SaleID);
    return this.serialize(updated);
  }

  /** Mark cek/BG as cleared (cair) inside a transaction: posts the payment journal and updates the cheque mirror. */
  async clearTx(tx: Tx, id: number, userId?: string, clearedAt?: Date) {
    const payment = await tx.salePayment.findUnique({ where: { ID: id } });
    if (!payment) throw new NotFoundException('Sale payment not found');
    if (payment.IsCleared) throw new BadRequestException('Pembayaran sudah lunas/cair');
    await tx.salePayment.update({ where: { ID: id }, data: { IsCleared: true, ClearedAt: clearedAt ?? new Date() } });
    await this.afterPaymentWrite(tx, id, userId ?? payment.CreatedByID);
    return tx.salePayment.findUniqueOrThrow({ where: { ID: id } });
  }

  async clear(id: number, userId?: string) {
    const updated = await this.prisma.$transaction((tx) => this.clearTx(tx, id, userId));
    await this.invalidate(updated.SaleID);
    return this.serialize(updated);
  }

  /** Delete inside a transaction: reverses the journal, releases deposit usage, drops the pending/cleared cheque mirror. */
  async deleteTx(tx: Tx, id: number) {
    const payment = await tx.salePayment.findUnique({ where: { ID: id } });
    if (!payment) throw new NotFoundException('Sale payment not found');
    await this.autoJournal.reverse(tx, REF.SALE_PAYMENT, id);
    await tx.chequePayment.deleteMany({ where: { ReferenceType: 'SALE_PAYMENT', ReferenceID: id, Status: { in: ['PENDING', 'CLEARED'] } } });
    await tx.salePayment.delete({ where: { ID: id } });
    await this.deposits.releaseCustomerDeposit(tx, id);
    await this.updateSalePaymentStatus(tx, payment.SaleID);
    return payment;
  }

  async delete(id: number) {
    const payment = await this.prisma.$transaction((tx) => this.deleteTx(tx, id));
    await this.invalidate(payment.SaleID);
    return { id };
  }

  /** Invalidate caches after a write made through clearTx/deleteTx by another module. */
  async invalidateFor(parentId: number) {
    await this.invalidate(parentId);
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
    await this.redis.invalidatePattern('journal:*');
    await this.redis.invalidatePattern('customer*');
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

  /** Paid/Remaining/status + Customer.TotalReceivable via PartyBalanceService (returns are subtracted). */
  private async updateSalePaymentStatus(tx: Tx, saleId: number) {
    const o = await this.party.recalcSale(tx, saleId);
    if (o) await this.party.recalcCustomer(tx, o.customerId);
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
