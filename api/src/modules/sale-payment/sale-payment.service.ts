import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '@prisma/client';
import { CreateSalePaymentDto, UpdateSalePaymentDto } from './dto/sale-payment.dto';
import { CreatePaymentBatchDto } from '../../common/dto/payment-batch.dto';
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

  /**
   * Status Lunas Cek/Bg (Ketoko): centang / hapus centang lunas beberapa pembayaran cek/BG sekaligus.
   * Lunas → jurnal kas diposting pada Tanggal Lunas; tidak lunas → jurnal dibalik.
   */
  async setClearedBatch(items: { ID: number; IsCleared: boolean; ClearedAt?: string | null }[], userId?: string) {
    const parents = new Set<number>();
    await this.prisma.$transaction(async (tx) => {
      for (const it of items ?? []) {
        const p = await tx.salePayment.findUnique({ where: { ID: Number(it.ID) } });
        if (!p || !isChequeInstrument(p.InstrumentType)) continue;
        const cleared = !!it.IsCleared;
        const at = cleared ? (it.ClearedAt ? new Date(`${String(it.ClearedAt).slice(0, 10)}T12:00:00+07:00`) : new Date()) : null;
        if (p.IsCleared === cleared && (!cleared || (p.ClearedAt && at && p.ClearedAt.getTime() === at.getTime()))) continue;
        await tx.salePayment.update({ where: { ID: p.ID }, data: { IsCleared: cleared, ClearedAt: at } });
        await this.afterPaymentWrite(tx, p.ID, userId ?? p.CreatedByID);
        parents.add(p.SaleID);
      }
    }, { timeout: 60000 });
    for (const id of parents) await this.invalidate(id);
    return { updated: parents.size };
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

  private async nextBatchCode(tx: Tx, prefix: string) {
    const d = new Date();
    const head = `${prefix}-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-`;
    const last = await tx.salePayment.findFirst({ where: { BatchCode: { startsWith: head } }, orderBy: { BatchCode: 'desc' }, select: { BatchCode: true } });
    const seq = last?.BatchCode ? Number(last.BatchCode.slice(head.length)) + 1 : 1;
    return `${head}${String(seq).padStart(4, '0')}`;
  }

  /** Faktur penjualan pelanggan yang masih ada sisa piutang (untuk form Bayar Piutang). */
  async outstanding(customerId: number) {
    const rows = await this.prisma.sale.findMany({
      where: { CustomerID: customerId, PaymentStatus: { Code: { notIn: ['PAID', 'CANCELLED'] } } },
      orderBy: [{ DueDate: 'asc' }, { Date: 'asc' }],
      select: {
        ID: true, Code: true, Date: true, DueDate: true, Total: true,
        SalePayments: { select: { Amount: true } },
        SaleReturns: { select: { TotalReturn: true, Status: { select: { Code: true } } } },
      },
    });
    return rows
      .map((r) => {
        const paid = r.SalePayments.reduce((a, p) => a + Number(p.Amount), 0);
        const remaining = Math.round((Number(r.Total) - this.returnsOf(r) - paid) * 100) / 100;
        return { ID: r.ID, Code: r.Code, Date: r.Date, DueDate: r.DueDate, Total: Number(r.Total), Paid: paid, Remaining: remaining };
      })
      .filter((r) => r.Remaining > 0.005)
      .map((r) => this.serializeDeep(r));
  }

  async createBatch(dto: CreatePaymentBatchDto, userId: string) {
    const lines = dto.Lines.filter((l) => (l.Amount || 0) + (l.Discount || 0) > 0);
    if (!lines.length) throw new BadRequestException('Isi Jml Bayar atau Pot minimal pada satu faktur');
    const ids = lines.map((l) => l.InvoiceID);
    if (new Set(ids).size !== ids.length) throw new BadRequestException('Faktur tidak boleh dobel');

    const code = await this.prisma.$transaction(async (tx) => {
      const batchCode = await this.nextBatchCode(tx, 'PP');
      const date = dto.Date ? new Date(dto.Date) : new Date();
      for (const line of lines) {
        const pu = await tx.sale.findUnique({
          where: { ID: line.InvoiceID },
          include: { SalePayments: true, SaleReturns: { select: { TotalReturn: true, Status: { select: { Code: true } } } } },
        });
        if (!pu || pu.CustomerID !== dto.PartnerID) throw new BadRequestException(`Faktur #${line.InvoiceID} bukan milik pelanggan ini`);
        const committed = pu.SalePayments.reduce((a, x) => a + Number(x.Amount), 0);
        const remaining = Number(pu.Total) - this.returnsOf(pu) - committed;
        const want = (line.Amount || 0) + (line.Discount || 0);
        if (want > remaining + 0.005) throw new BadRequestException(`Pembayaran ${pu.Code} (${want}) melebihi sisa piutang (${Math.max(remaining, 0)})`);

        const parts: { amount: number; inst: string }[] = [];
        if (line.Amount > 0) parts.push({ amount: line.Amount, inst: dto.InstrumentType ?? 'CASH' });
        if ((line.Discount || 0) > 0) parts.push({ amount: line.Discount!, inst: 'DISCOUNT' });
        for (const part of parts) {
          const { inst, methodId } = part.inst === 'DISCOUNT'
            ? { inst: 'DISCOUNT', methodId: dto.MethodID }
            : await this.resolveInstrument(tx, dto.MethodID, part.inst, part.inst === 'DEPOSIT');
          const cleared = !isChequeInstrument(inst);
          const created = await tx.salePayment.create({
            data: {
              SaleID: pu.ID, MethodID: methodId, Amount: new Prisma.Decimal(part.amount), ReferenceNumber: dto.Number || null,
              Date: date, Notes: dto.Notes || null, InstrumentType: inst, DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
              IsCleared: cleared, ClearedAt: cleared ? new Date() : null, CreatedByID: userId, BatchCode: batchCode,
              AccountID: inst === 'DISCOUNT' ? null : dto.AccountID ?? null,
            },
          });
          await this.afterPaymentWrite(tx, created.ID, userId);
        }
      }
      return batchCode;
    }, { timeout: 60000 });

    for (const id of ids) await this.invalidate(id);
    return this.getBatch(code);
  }

  /** Detail satu dokumen (kode batch, atau "#<ID>" untuk pembayaran lama tanpa batch). */
  async getBatch(code: string) {
    const where = code.startsWith('#') ? { ID: Number(code.slice(1)) } : { BatchCode: code };
    const rows = await this.prisma.salePayment.findMany({
      where, orderBy: { ID: 'asc' },
      include: { Sale: { select: { ID: true, Code: true, Date: true, DueDate: true, Total: true, Customer: { select: { ID: true, Code: true, Name: true } } } }, Method: true, Creator: { select: { Username: true } } },
    });
    if (!rows.length) throw new NotFoundException('Dokumen pembayaran tidak ditemukan');
    const first = rows[0];
    const byInvoice = new Map<number, any>();
    for (const r of rows) {
      const cur = byInvoice.get(r.SaleID) ?? { InvoiceID: r.SaleID, Code: r.Sale.Code, Date: r.Sale.Date, DueDate: r.Sale.DueDate, Total: Number(r.Sale.Total), Remaining: 0, Amount: 0, Discount: 0 };
      if (r.InstrumentType === 'DISCOUNT') cur.Discount += Number(r.Amount);
      else cur.Amount += Number(r.Amount);
      byInvoice.set(r.SaleID, cur);
    }
    const lines = [...byInvoice.values()];
    return this.serializeDeep({
      BatchCode: first.BatchCode ?? `#${first.ID}`, Date: first.Date, Partner: first.Sale.Customer, Method: first.Method,
      InstrumentType: rows.find((r) => r.InstrumentType !== 'DISCOUNT')?.InstrumentType ?? 'CASH', AccountID: first.AccountID,
      Number: first.ReferenceNumber, DueDate: first.DueDate, Notes: first.Notes, CreatedBy: first.Creator?.Username,
      Lines: lines, TotalAmount: lines.reduce((a, l) => a + l.Amount, 0), TotalDiscount: lines.reduce((a, l) => a + l.Discount, 0),
      PaymentIDs: rows.map((r) => r.ID),
    });
  }

  async deleteBatch(code: string) {
    const where = code.startsWith('#') ? { ID: Number(code.slice(1)) } : { BatchCode: code };
    const rows = await this.prisma.salePayment.findMany({ where, select: { ID: true, SaleID: true } });
    if (!rows.length) throw new NotFoundException('Dokumen pembayaran tidak ditemukan');
    await this.prisma.$transaction(async (tx) => { for (const r of rows) await this.deleteTx(tx, r.ID); }, { timeout: 60000 });
    for (const r of rows) await this.invalidate(r.SaleID);
    return { code, deleted: rows.length };
  }

  /** Daftar Pembayaran Piutang: satu baris per dokumen (No Transaksi, Tanggal, Cara Bayar, Supplier, Total). */
  async listBatches(query: Record<string, any>) {
    const where: any = {};
    const day = (v: string, end: boolean) => new Date(`${v}T${end ? '23:59:59.999' : '00:00:00'}+07:00`);
    if (query.from || query.to) {
      where.Date = {};
      if (query.from) where.Date.gte = day(String(query.from), false);
      if (query.to) where.Date.lte = day(String(query.to), true);
    }
    if (query.partnerId) where.Purchase = { CustomerID: Number(query.partnerId) };
    if (query.search) {
      const s = String(query.search);
      where.OR = [
        { BatchCode: { contains: s, mode: 'insensitive' } },
        { ReferenceNumber: { contains: s, mode: 'insensitive' } },
        { Notes: { contains: s, mode: 'insensitive' } },
        { Sale: { Code: { contains: s, mode: 'insensitive' } } },
        { Sale: { Customer: { Name: { contains: s, mode: 'insensitive' } } } },
      ];
    }
    const rows = await this.prisma.salePayment.findMany({
      where, take: 5000, orderBy: [{ Date: 'desc' }, { ID: 'desc' }],
      include: { Sale: { select: { Code: true, Customer: { select: { Code: true, Name: true } } } }, Method: { select: { Name: true } }, Creator: { select: { Username: true } } },
    });
    const docs = new Map<string, any>();
    for (const r of rows) {
      const key = r.BatchCode ?? `#${r.ID}`;
      const d = docs.get(key) ?? {
        ID: key, BatchCode: key, Date: r.Date, MethodName: r.Method?.Name, InstrumentType: r.InstrumentType,
        PartnerCode: r.Sale.Customer?.Code, PartnerName: r.Sale.Customer?.Name, Notes: r.Notes, Number: r.ReferenceNumber,
        Invoices: [] as string[], Total: 0, Discount: 0, CreatedBy: r.Creator?.Username, UpdatedBy: null, IsCleared: true,
      };
      if (r.InstrumentType === 'DISCOUNT') d.Discount += Number(r.Amount);
      else { d.Total += Number(r.Amount); d.InstrumentType = r.InstrumentType; d.IsCleared = d.IsCleared && r.IsCleared; }
      if (!d.Invoices.includes(r.Sale.Code)) d.Invoices.push(r.Sale.Code);
      docs.set(key, d);
    }
    let list = [...docs.values()].map((d) => ({ ...d, Invoices: d.Invoices.join(', ') }));
    const sortKey = String(query.sort || 'Date');
    const dir = String(query.dir || 'desc') === 'asc' ? 1 : -1;
    list.sort((a, b) => (a[sortKey] > b[sortKey] ? dir : a[sortKey] < b[sortKey] ? -dir : 0));
    const total = list.length;
    const skip = Number(query.skip) || 0;
    const take = Math.min(Number(query.take) || 50, 500);
    list = list.slice(skip, skip + take);
    return { data: this.serializeDeep(list), total, skip, take };
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
    if (query.partnerId) where.Sale = { CustomerID: Number(query.partnerId) };
    if (query.number) where.ReferenceNumber = { contains: String(query.number), mode: 'insensitive' };
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
