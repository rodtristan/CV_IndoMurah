import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma-service';
import { AutoJournalService, JournalLineInput, REF, Tx } from './auto-journal.service';

export interface CashLine { accountId: number; amount: number; description?: string }
export interface CashDocInput {
  code?: string;
  accountId?: number;
  amount?: number;
  date?: string;
  description?: string;
  referenceType?: string;
  referenceId?: number;
  lines?: CashLine[];
}

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
const stamp = () => new Date().toISOString().replace(/\D/g, '').slice(0, 14);

/**
 * Kas Masuk / Kas Keluar with automatic journal.
 *  IN : Dr akun kas (AccountID) / Cr akun rincian (lines; default Pendapatan Lain)
 *  OUT: Dr akun rincian (lines; default Biaya Lain) / Cr akun kas
 * Rincian (lines) live only in the journal (CashIn/CashOut have no line table).
 */
export class CashDocHelper {
  constructor(
    private readonly prisma: PrismaService,
    private readonly journal: AutoJournalService,
    private readonly kind: 'in' | 'out',
  ) {}

  private get model(): any { return this.kind === 'in' ? this.prisma.cashIn : this.prisma.cashOut; }
  private tm(tx: Tx): any { return this.kind === 'in' ? tx.cashIn : tx.cashOut; }
  private get ref() { return this.kind === 'in' ? REF.CASH_IN : REF.CASH_OUT; }
  private get label() { return this.kind === 'in' ? 'Kas Masuk' : 'Kas Keluar'; }

  private async checkAccounts(ids: number[]) {
    const uniq = [...new Set(ids)];
    const found = await this.prisma.account.count({ where: { ID: { in: uniq } } });
    if (found !== uniq.length) throw new BadRequestException('Ada perkiraan yang tidak ditemukan');
  }

  /** Counter-side lines currently stored in the journal of this document. */
  async lines(id: number): Promise<{ accountId: number; code: string; name: string; amount: number; description: string | null }[]> {
    const doc = await this.model.findUnique({ where: { ID: id } });
    if (!doc) throw new NotFoundException(`${this.label} tidak ditemukan`);
    const ls = await this.journal.linesOf(this.prisma, this.ref, id);
    // the cash side is the line on AccountID with the cash direction (first matching); others are counter lines
    let cashTaken = false;
    const out: any[] = [];
    for (const l of ls) {
      const isCashSide = this.kind === 'in' ? Number(l.Debit) > 0 : Number(l.Credit) > 0;
      if (isCashSide && !cashTaken && l.AccountID === doc.AccountID) { cashTaken = true; continue; }
      out.push({ accountId: l.AccountID, code: l.Account.Code, name: l.Account.Name, amount: Number(l.Debit) + Number(l.Credit), description: l.Description });
    }
    return out;
  }

  private async post(tx: Tx, doc: any, lines: CashLine[], userId: string) {
    const jl: JournalLineInput[] = [];
    const desc = `${this.label} ${doc.Code}${doc.Description ? ` - ${doc.Description}` : ''}`;
    if (this.kind === 'in') {
      jl.push({ accountId: doc.AccountID, debit: Number(doc.Amount), memo: desc });
      for (const l of lines) jl.push({ accountId: l.accountId, credit: l.amount, memo: l.description || desc });
    } else {
      for (const l of lines) jl.push({ accountId: l.accountId, debit: l.amount, memo: l.description || desc });
      jl.push({ accountId: doc.AccountID, credit: Number(doc.Amount), memo: desc });
    }
    await this.journal.post(tx, { referenceType: this.ref, referenceId: doc.ID, date: doc.Date, description: desc, lines: jl, userId, referenceNumber: doc.Code });
  }

  private async normalizeLines(tx: Tx, amount: number, lines: CashLine[] | undefined, fallback: CashLine[] | null): Promise<CashLine[]> {
    let ls = lines?.filter((l) => l && (l.amount || l.accountId)) ?? null;
    if (!ls || !ls.length) {
      if (fallback && fallback.length) {
        if (Math.round(fallback.reduce((s, l) => s + l.amount, 0) * 100) === Math.round(amount * 100)) return fallback;
        if (fallback.length === 1) return [{ ...fallback[0], amount }];
        throw new BadRequestException('Jumlah berubah: kirim ulang rincian akun (lines) yang totalnya sama dengan Jumlah Kas');
      }
      const key = this.kind === 'in' ? 'otherIncome' : 'otherExpense';
      const a = await this.journal.accounts(tx, [key]);
      return [{ accountId: a[key], amount }];
    }
    if (ls.some((l) => !Number.isInteger(l.accountId) || !(Number(l.amount) > 0))) throw new BadRequestException('Setiap rincian wajib punya Kode Akun dan jumlah > 0');
    ls = ls.map((l) => ({ ...l, amount: r2(l.amount) }));
    const total = r2(ls.reduce((s, l) => s + l.amount, 0));
    if (Math.round(total * 100) !== Math.round(amount * 100)) throw new BadRequestException(`Total rincian (${total}) harus sama dengan Jumlah Kas (${amount})`);
    return ls;
  }

  async create(dto: CashDocInput, userId: string) {
    if (!dto.accountId) throw new BadRequestException('Akun kas wajib dipilih');
    const amount = r2(Number(dto.amount));
    if (!(amount > 0)) throw new BadRequestException('Jumlah harus lebih dari 0');
    await this.checkAccounts([dto.accountId, ...(dto.lines ?? []).map((l) => l.accountId)]);
    const date = dto.date ? new Date(dto.date) : new Date();
    if (isNaN(date.getTime())) throw new BadRequestException('Tanggal tidak valid');
    return this.prisma.$transaction(async (tx) => {
      const lines = await this.normalizeLines(tx, amount, dto.lines, null);
      const doc = await this.tm(tx).create({
        data: {
          Code: dto.code || `${this.kind === 'in' ? 'KM' : 'KK'}-${stamp()}`,
          Date: date, AccountID: dto.accountId, Amount: new Prisma.Decimal(amount.toFixed(2)),
          Description: dto.description ?? null, ReferenceType: dto.referenceType ?? null, ReferenceID: dto.referenceId ?? null,
          CreatedByID: userId,
        },
      });
      await this.post(tx, doc, lines, userId);
      return doc;
    });
  }

  async update(id: number, dto: CashDocInput, userId: string) {
    const existing = await this.model.findUnique({ where: { ID: id } });
    if (!existing) throw new NotFoundException(`${this.label} tidak ditemukan`);
    const amount = dto.amount !== undefined ? r2(Number(dto.amount)) : Number(existing.Amount);
    if (!(amount > 0)) throw new BadRequestException('Jumlah harus lebih dari 0');
    const accountId = dto.accountId ?? existing.AccountID;
    await this.checkAccounts([accountId, ...(dto.lines ?? []).map((l) => l.accountId)]);
    const date = dto.date ? new Date(dto.date) : existing.Date;
    if (isNaN(date.getTime())) throw new BadRequestException('Tanggal tidak valid');
    const prevLines = (await this.lines(id)).map((l) => ({ accountId: l.accountId, amount: l.amount, description: l.description ?? undefined }));
    return this.prisma.$transaction(async (tx) => {
      const lines = await this.normalizeLines(tx, amount, dto.lines, prevLines);
      const doc = await this.tm(tx).update({
        where: { ID: id },
        data: {
          ...(dto.code ? { Code: dto.code } : {}),
          Date: date, AccountID: accountId, Amount: new Prisma.Decimal(amount.toFixed(2)),
          ...(dto.description !== undefined ? { Description: dto.description } : {}),
          ...(dto.referenceType !== undefined ? { ReferenceType: dto.referenceType } : {}),
          ...(dto.referenceId !== undefined ? { ReferenceID: dto.referenceId } : {}),
        },
      });
      await this.post(tx, doc, lines, userId);
      return doc;
    });
  }

  async remove(id: number) {
    const existing = await this.model.findUnique({ where: { ID: id } });
    if (!existing) throw new NotFoundException(`${this.label} tidak ditemukan`);
    return this.prisma.$transaction(async (tx) => {
      await this.journal.reverse(tx, this.ref, id);
      return this.tm(tx).delete({ where: { ID: id } });
    });
  }
}
