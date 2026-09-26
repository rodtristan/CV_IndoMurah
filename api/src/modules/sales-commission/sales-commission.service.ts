import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { AutoJournalService, REF } from '../../common/accounting/auto-journal.service';
import { computeCommission, returnCommission } from '../../common/sales/commission';
import { ClearCommissionChequeDto, CreateCommissionPaymentDto, UpdateCommissionPaymentDto } from './dto/sales-commission.dto';

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
const day = (v: string, end: boolean) => new Date(`${String(v).slice(0, 10)}T${end ? '23:59:59.999' : '00:00:00'}+07:00`);
const isCheque = (i?: string | null) => i === 'CEK' || i === 'BG';

/**
 * Komisi Sales Ketoko: "Daftar Pembayaran Sales" (Bayar Komisi Sales) dan "Status Lunas Cek/Bg Sales".
 * Komisi hanya dapat ditarik untuk penjualan yang sudah dilunasi pelanggan; satu penjualan hanya
 * dapat dibayar komisinya sekali (SalesCommissionPaymentLine.SaleID unik).
 */
@Injectable()
export class SalesCommissionService {
  private readonly CACHE_PREFIX = 'sales_commissions';

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
    private journal: AutoJournalService,
  ) {}

  async findAll(query: Record<string, any>) {
    const q = this.queryService.buildPrismaQuery(query, { searchableFields: ['*'], allowedIncludes: ['*'], defaultOrderBy: { Date: 'desc' } });
    const args: any = { where: q.where, orderBy: q.orderBy, skip: q.skip, take: q.take };
    if (q.select) args.select = q.select;
    else if (q.include) args.include = q.include;
    const [data, total] = await Promise.all([this.prisma.salesCommissionPayment.findMany(args), this.prisma.salesCommissionPayment.count({ where: q.where })]);
    return { data: this.ser(data), total, skip: q.skip, take: q.take };
  }

  async findOne(id: number) {
    const p = await this.prisma.salesCommissionPayment.findUnique({
      where: { ID: id },
      include: {
        SalesPerson: true, Creator: { select: { Username: true } },
        Lines: { include: { Sale: { select: { ID: true, Code: true, Date: true, Total: true, SalesPerson: { select: { Code: true } } } } }, orderBy: { ID: 'asc' } },
      },
    });
    if (!p) throw new NotFoundException('Pembayaran komisi tidak ditemukan');
    return this.ser(p);
  }

  /**
   * Penjualan lunas milik sales pada periode yang komisinya belum dibayar (dan, saat edit,
   * penjualan yang sudah ada di dokumen ini).
   */
  async eligible(salesPersonId: number, from?: string, to?: string, paymentId?: number) {
    const sp = await this.prisma.salesPerson.findUnique({ where: { ID: salesPersonId } });
    if (!sp) throw new NotFoundException('Sales tidak ditemukan');
    const sales = await this.prisma.sale.findMany({
      where: {
        SalesPersonID: salesPersonId,
        PaymentStatus: { Code: 'PAID' },
        ...(from || to ? { Date: { ...(from ? { gte: day(from, false) } : {}), ...(to ? { lte: day(to, true) } : {}) } } : {}),
        OR: [{ CommissionLines: { none: {} } }, ...(paymentId ? [{ CommissionLines: { some: { PaymentID: paymentId } } }] : [])],
      },
      orderBy: { Date: 'asc' },
      include: {
        SaleItems: { include: { Product: { select: { SalesCommission: true } } } },
        SalePayments: { select: { Date: true, ClearedAt: true, IsCleared: true } },
        SaleReturns: { select: { TotalReturn: true, Status: { select: { Code: true } } } },
      },
    });
    return sales
      .map((s) => {
        const paidAt = s.SalePayments.filter((p) => p.IsCleared).reduce<Date | null>((a, p) => {
          const d = p.ClearedAt ?? p.Date;
          return !a || d > a ? d : a;
        }, null);
        const commission = computeCommission(s, sp, paidAt);
        const returns = s.SaleReturns.filter((r) => r.Status?.Code !== 'CANCELLED').reduce((a, r) => a + Number(r.TotalReturn), 0);
        const retCommission = returnCommission(commission, Number(s.Total), returns);
        return {
          SaleID: s.ID, Type: 'Penjualan', Code: s.Code, Date: s.Date.toISOString(), SalesCode: sp.Code, SaleTotal: Number(s.Total),
          Commission: commission, ReturnCommission: retCommission, Amount: r2(commission - retCommission),
        };
      })
      .filter((x) => x.Commission > 0);
  }

  async create(dto: CreateCommissionPaymentDto, userId: string) {
    const code = await this.nextCode();
    const id = await this.prisma.$transaction(async (tx) => {
      const lines = await this.buildLines(dto.SalesPersonID, dto.SaleIDs, dto.PeriodFrom, dto.PeriodTo);
      const cheque = isCheque(dto.InstrumentType);
      const p = await tx.salesCommissionPayment.create({
        data: {
          Code: code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          SalesPersonID: dto.SalesPersonID,
          MethodID: dto.MethodID ?? null,
          InstrumentType: dto.InstrumentType ?? 'CASH',
          AccountID: dto.AccountID ?? null,
          Number: dto.Number || null,
          DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
          IsCleared: !cheque,
          ClearedAt: cheque ? null : new Date(),
          PeriodFrom: dto.PeriodFrom ? day(dto.PeriodFrom, false) : null,
          PeriodTo: dto.PeriodTo ? day(dto.PeriodTo, true) : null,
          Notes: dto.Notes || null,
          ...this.totals(lines),
          CreatedByID: userId,
          Lines: { create: lines.map((l) => ({ SaleID: l.SaleID, Commission: l.Commission, ReturnCommission: l.ReturnCommission, Amount: l.Amount })) },
        },
      });
      await this.journal.postCommissionPayment(tx, p.ID, userId);
      return p.ID;
    });
    await this.invalidate();
    return this.findOne(id);
  }

  async update(id: number, dto: UpdateCommissionPaymentDto, userId: string) {
    const ex = await this.prisma.salesCommissionPayment.findUnique({ where: { ID: id }, include: { Lines: true } });
    if (!ex) throw new NotFoundException('Pembayaran komisi tidak ditemukan');
    const spId = dto.SalesPersonID ?? ex.SalesPersonID;
    const saleIds = dto.SaleIDs ?? ex.Lines.map((l) => l.SaleID);
    await this.prisma.$transaction(async (tx) => {
      const lines = await this.buildLines(spId, saleIds, dto.PeriodFrom ?? undefined, dto.PeriodTo ?? undefined, id);
      const inst = dto.InstrumentType ?? ex.InstrumentType;
      const cheque = isCheque(inst);
      await tx.salesCommissionPaymentLine.deleteMany({ where: { PaymentID: id } });
      await tx.salesCommissionPayment.update({
        where: { ID: id },
        data: {
          SalesPersonID: spId,
          ...(dto.Date ? { Date: new Date(dto.Date) } : {}),
          ...(dto.MethodID !== undefined ? { MethodID: dto.MethodID } : {}),
          InstrumentType: inst,
          ...(dto.AccountID !== undefined ? { AccountID: dto.AccountID } : {}),
          ...(dto.Number !== undefined ? { Number: dto.Number || null } : {}),
          ...(dto.DueDate !== undefined ? { DueDate: dto.DueDate ? new Date(dto.DueDate) : null } : {}),
          ...(dto.PeriodFrom !== undefined ? { PeriodFrom: dto.PeriodFrom ? day(dto.PeriodFrom, false) : null } : {}),
          ...(dto.PeriodTo !== undefined ? { PeriodTo: dto.PeriodTo ? day(dto.PeriodTo, true) : null } : {}),
          ...(dto.Notes !== undefined ? { Notes: dto.Notes || null } : {}),
          ...(cheque && !isCheque(ex.InstrumentType) ? { IsCleared: false, ClearedAt: null } : {}),
          ...(!cheque ? { IsCleared: true, ClearedAt: ex.ClearedAt ?? new Date() } : {}),
          ...this.totals(lines),
          Lines: { create: lines.map((l) => ({ SaleID: l.SaleID, Commission: l.Commission, ReturnCommission: l.ReturnCommission, Amount: l.Amount })) },
        },
      });
      await this.journal.postCommissionPayment(tx, id, userId);
    });
    await this.invalidate();
    return this.findOne(id);
  }

  async remove(id: number) {
    const ex = await this.prisma.salesCommissionPayment.findUnique({ where: { ID: id } });
    if (!ex) throw new NotFoundException('Pembayaran komisi tidak ditemukan');
    await this.prisma.$transaction(async (tx) => {
      await this.journal.reverse(tx, REF.SALES_COMMISSION, id);
      await tx.salesCommissionPayment.delete({ where: { ID: id } });
    });
    await this.invalidate();
    return { id };
  }

  /** Status Lunas Cek/Bg Sales: pembayaran komisi dengan cek/BG. */
  async cheques(query: { salesPersonId?: string; number?: string; cleared?: string }) {
    const rows = await this.prisma.salesCommissionPayment.findMany({
      where: {
        InstrumentType: { in: ['CEK', 'BG'] },
        ...(query.salesPersonId ? { SalesPersonID: Number(query.salesPersonId) } : {}),
        ...(query.number ? { Number: { contains: query.number, mode: 'insensitive' as const } } : {}),
        ...(query.cleared === 'false' ? { IsCleared: false } : query.cleared === 'true' ? { IsCleared: true } : {}),
      },
      orderBy: { Date: 'desc' },
      include: { SalesPerson: { select: { Code: true, Name: true } } },
    });
    return this.ser(rows);
  }

  async clearCheques(dto: ClearCommissionChequeDto, userId: string) {
    await this.prisma.$transaction(async (tx) => {
      for (const it of dto.Items ?? []) {
        const p = await tx.salesCommissionPayment.findUnique({ where: { ID: Number(it.ID) } });
        if (!p || !isCheque(p.InstrumentType)) continue;
        await tx.salesCommissionPayment.update({
          where: { ID: p.ID },
          data: { IsCleared: !!it.IsCleared, ClearedAt: it.IsCleared ? (it.ClearedAt ? new Date(it.ClearedAt) : new Date()) : null },
        });
        await this.journal.postCommissionPayment(tx, p.ID, userId);
      }
    });
    await this.invalidate();
    return { updated: dto.Items?.length ?? 0 };
  }

  // ─── helpers ────────────────────────────────────────────────────────────

  private async buildLines(salesPersonId: number, saleIds: number[], from?: string | null, to?: string | null, paymentId?: number) {
    if (!saleIds?.length) throw new BadRequestException('Pilih minimal satu penjualan');
    if (new Set(saleIds).size !== saleIds.length) throw new BadRequestException('Penjualan tidak boleh dobel');
    const avail = await this.eligible(salesPersonId, from ?? undefined, to ?? undefined, paymentId);
    const map = new Map(avail.map((a) => [a.SaleID, a]));
    return saleIds.map((sid) => {
      const a = map.get(sid);
      if (!a) throw new BadRequestException(`Penjualan #${sid} tidak dapat dibayar komisinya (belum lunas, bukan milik sales ini, di luar periode, atau sudah dibayar)`);
      return a;
    });
  }

  private totals(lines: { Commission: number; ReturnCommission: number; Amount: number }[]) {
    const commission = r2(lines.reduce((a, l) => a + l.Commission, 0));
    const ret = r2(lines.reduce((a, l) => a + l.ReturnCommission, 0));
    return { TotalCommission: new Prisma.Decimal(commission), TotalReturn: new Prisma.Decimal(ret), Total: new Prisma.Decimal(r2(commission - ret)) };
  }

  private async nextCode() {
    const d = new Date();
    const head = `KS-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-`;
    const last = await this.prisma.salesCommissionPayment.findFirst({ where: { Code: { startsWith: head } }, orderBy: { Code: 'desc' }, select: { Code: true } });
    const seq = last ? Number(last.Code.slice(head.length)) + 1 : 1;
    return `${head}${String(seq).padStart(4, '0')}`;
  }

  private async invalidate() {
    await Promise.all([this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`), this.redis.invalidatePattern('journal:*'), this.redis.invalidatePattern('reports:*')]);
  }

  private ser(v: any): any {
    if (v instanceof Prisma.Decimal) return Number(v);
    if (v instanceof Date) return v.toISOString();
    if (Array.isArray(v)) return v.map((x) => this.ser(x));
    if (v && typeof v === 'object') {
      const r: any = {};
      for (const [k, x] of Object.entries(v)) r[k] = this.ser(x);
      return r;
    }
    return v;
  }

}
