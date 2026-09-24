import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma-service';

export type OpeningType = 'ACCOUNT' | 'DEBT' | 'RECEIVABLE';
export interface OpeningRowInput {
  accountId?: number; supplierId?: number; customerId?: number;
  debit?: number; credit?: number; amount?: number;
  dueDate?: string; reference?: string; notes?: string;
}
export interface SaveOpeningDto { date?: string; rows: OpeningRowInput[] }

const cents = (n: number) => Math.round(n * 100);

@Injectable()
export class OpeningBalanceService {
  constructor(private readonly prisma: PrismaService) {}

  private assertType(t: string): OpeningType {
    const u = String(t).toUpperCase();
    if (u !== 'ACCOUNT' && u !== 'DEBT' && u !== 'RECEIVABLE') throw new BadRequestException('Tipe saldo awal tidak valid');
    return u;
  }

  async list(type: string) {
    const t = this.assertType(type);
    return this.prisma.openingBalance.findMany({
      where: { Type: t },
      include: { Account: true, Supplier: true, Customer: true },
      orderBy: { ID: 'asc' },
    });
  }

  async saveAll(type: string, dto: SaveOpeningDto, userId: string) {
    const t = this.assertType(type);
    const rows = dto?.rows ?? [];
    const date = dto?.date ? new Date(dto.date) : new Date();
    if (isNaN(date.getTime())) throw new BadRequestException('Tanggal tidak valid');

    if (t === 'ACCOUNT') return this.saveAccounts(rows, date, userId);

    const data: Prisma.OpeningBalanceCreateManyInput[] = [];
    for (const r of rows) {
      const amount = Number(r.amount ?? (t === 'DEBT' ? r.credit : r.debit) ?? 0);
      if (!amount) continue;
      if (amount < 0) throw new BadRequestException('Nominal tidak boleh negatif');
      if (t === 'DEBT' && !r.supplierId) throw new BadRequestException('Saldo awal hutang wajib memilih Supplier');
      if (t === 'RECEIVABLE' && !r.customerId) throw new BadRequestException('Saldo awal piutang wajib memilih Pelanggan');
      data.push({
        Type: t, Date: date,
        SupplierID: t === 'DEBT' ? Number(r.supplierId) : null,
        CustomerID: t === 'RECEIVABLE' ? Number(r.customerId) : null,
        Debit: new Prisma.Decimal(t === 'RECEIVABLE' ? amount : 0),
        Credit: new Prisma.Decimal(t === 'DEBT' ? amount : 0),
        DueDate: r.dueDate ? new Date(r.dueDate) : null,
        Reference: r.reference || null, Notes: r.notes || null, CreatedByID: userId,
      });
    }
    await this.prisma.$transaction([
      this.prisma.openingBalance.deleteMany({ where: { Type: t } }),
      this.prisma.openingBalance.createMany({ data }),
    ]);
    return this.list(t);
  }

  private async saveAccounts(rows: OpeningRowInput[], date: Date, userId: string) {
    const lines = rows
      .map((r) => ({ accountId: Number(r.accountId), debit: Number(r.debit || 0), credit: Number(r.credit || 0) }))
      .filter((r) => r.debit || r.credit);
    if (lines.some((l) => !Number.isInteger(l.accountId))) throw new BadRequestException('Perkiraan wajib diisi');
    if (lines.some((l) => l.debit < 0 || l.credit < 0)) throw new BadRequestException('Nominal tidak boleh negatif');
    if (new Set(lines.map((l) => l.accountId)).size !== lines.length) throw new BadRequestException('Perkiraan duplikat');
    const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
    if (cents(totalDebit) !== cents(totalCredit)) {
      throw new BadRequestException(`Saldo awal tidak balance: total debit ${totalDebit} tidak sama dengan total kredit ${totalCredit}`);
    }
    if (lines.length) {
      const found = await this.prisma.account.count({ where: { ID: { in: lines.map((l) => l.accountId) } } });
      if (found !== lines.length) throw new BadRequestException('Ada perkiraan yang tidak ditemukan');
    }

    await this.prisma.$transaction(async (tx) => {
      // replace the previous opening journal
      const old = await tx.journal.findMany({ where: { ReferenceType: 'OPENING_BALANCE' }, select: { ID: true } });
      if (old.length) {
        const ids = old.map((o) => o.ID);
        await tx.journalEntry.deleteMany({ where: { JournalID: { in: ids } } }); // lines cascade
        await tx.journal.deleteMany({ where: { ID: { in: ids } } });
      }
      await tx.openingBalance.deleteMany({ where: { Type: 'ACCOUNT' } });
      if (!lines.length) return;
      await tx.openingBalance.createMany({
        data: lines.map((l) => ({
          Type: 'ACCOUNT', Date: date, AccountID: l.accountId,
          Debit: new Prisma.Decimal(l.debit), Credit: new Prisma.Decimal(l.credit), CreatedByID: userId,
        })),
      });
      const code = `OB-${Date.now()}`;
      const desc = 'Saldo Awal Perkiraan';
      await tx.journal.create({
        data: {
          Code: code, Date: date, Description: desc, ReferenceType: 'OPENING_BALANCE',
          IsPosted: true, PostedAt: new Date(), CreatedByID: userId,
          JournalEntries: {
            create: {
              JournalNumber: code, Date: date, Description: desc, ReferenceType: 'OPENING_BALANCE',
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
    });
    return this.list('ACCOUNT');
  }
}
