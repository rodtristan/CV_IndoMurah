import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma-service';

const PL_TYPES = ['REVENUE', 'EXPENSE', 'COST'];
const r2 = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class FiscalYearService {
  constructor(private readonly prisma: PrismaService) {}

  private range(year: number) {
    return { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) };
  }

  /** Net balance (debit - credit) per revenue/expense account for the year. */
  private async plBalances(year: number) {
    const lines = await this.prisma.journalEntryLine.findMany({
      where: {
        Account: { Type: { Code: { in: PL_TYPES } } },
        JournalEntry: { Status: 'POSTED', Date: this.range(year), NOT: { ReferenceType: 'YEAR_CLOSE' } },
      },
      select: { AccountID: true, Debit: true, Credit: true },
    });
    const map = new Map<number, number>();
    for (const l of lines) map.set(l.AccountID, (map.get(l.AccountID) ?? 0) + Number(l.Debit) - Number(l.Credit));
    return [...map.entries()].map(([accountId, bal]) => ({ accountId, bal: r2(bal) })).filter((b) => b.bal !== 0);
  }

  async status() {
    const now = new Date().getFullYear();
    const first = await this.prisma.journalEntry.findFirst({ orderBy: { Date: 'asc' }, select: { Date: true } });
    const start = Math.min(first ? first.Date.getUTCFullYear() : now, now - 1);
    const closes = await this.prisma.fiscalYearClose.findMany();
    const byYear = new Map(closes.map((c) => [c.Year, c]));
    const out: any[] = [];
    for (let y = now; y >= start; y--) {
      const c = byYear.get(y);
      const bals = c ? [] : await this.plBalances(y);
      out.push({
        year: y,
        finished: y < now,
        closed: !!c,
        closedAt: c?.ClosedAt ?? null,
        journalCode: c?.JournalCode ?? null,
        netIncome: c ? Number(c.NetIncome) : r2(-bals.reduce((s, b) => s + b.bal, 0)),
      });
    }
    const setting = await this.prisma.accountSetting.findUnique({ where: { Key: 'retained' } });
    return { currentYear: now, retainedAccountID: setting?.AccountID ?? null, years: out };
  }

  async close(year: number, userId: string) {
    year = Number(year);
    if (!Number.isInteger(year)) throw new BadRequestException('Tahun tidak valid');
    if (year >= new Date().getFullYear()) throw new BadRequestException(`Tahun ${year} belum berakhir, tidak dapat ditutup`);
    if (await this.prisma.fiscalYearClose.findUnique({ where: { Year: year } })) {
      throw new BadRequestException(`Tahun ${year} sudah pernah ditutup`);
    }
    const setting = await this.prisma.accountSetting.findUnique({ where: { Key: 'retained' } });
    if (!setting?.AccountID) throw new BadRequestException('Setting Perkiraan "Laba Ditahan" belum diisi');

    const bals = await this.plBalances(year);
    const net = r2(-bals.reduce((s, b) => s + b.bal, 0)); // > 0 = profit
    const date = new Date(Date.UTC(year, 11, 31));
    const code = `YC-${year}`;
    const desc = `Jurnal Penutup Tahun ${year}`;

    const lines: { accountId: number; debit: number; credit: number }[] = bals.map((b) => ({
      accountId: b.accountId,
      debit: b.bal < 0 ? -b.bal : 0,
      credit: b.bal > 0 ? b.bal : 0,
    }));
    if (net !== 0) lines.push({ accountId: setting.AccountID, debit: net < 0 ? -net : 0, credit: net > 0 ? net : 0 });
    const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = lines.reduce((s, l) => s + l.credit, 0);

    await this.prisma.$transaction(async (tx) => {
      if (lines.length) {
        await tx.journal.create({
          data: {
            Code: code, Date: date, Description: desc, ReferenceType: 'YEAR_CLOSE', ReferenceID: year,
            IsPosted: true, PostedAt: new Date(), CreatedByID: userId,
            JournalEntries: {
              create: {
                JournalNumber: code, Date: date, Description: desc, ReferenceType: 'YEAR_CLOSE', ReferenceID: year,
                TotalDebit: new Prisma.Decimal(totalDebit), TotalCredit: new Prisma.Decimal(totalCredit),
                Status: 'POSTED', CreatedByID: userId,
                Lines: {
                  create: lines.map((l, i) => ({
                    AccountID: l.accountId, Debit: new Prisma.Decimal(l.debit), Credit: new Prisma.Decimal(l.credit),
                    Description: desc, LineNumber: i + 1, CreatedByID: userId,
                  })),
                },
              },
            },
          },
        });
      }
      await tx.fiscalYearClose.create({
        data: { Year: year, ClosedByID: userId, JournalCode: lines.length ? code : null, NetIncome: new Prisma.Decimal(net) },
      });
    });
    return { year, netIncome: net, journalCode: lines.length ? code : null };
  }
}
