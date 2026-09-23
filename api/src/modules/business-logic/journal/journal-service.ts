import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateJournalEntryDto,
  UpDateJournalEntryDto,
  JournalEntryQueryDto,
  CancelJournalEntryDto,
  AccountBalanceDto,
  TrialBalanceDto,
} from './journal.dto';

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new journal entry (Jurnal Umum)
   * Flow: Admin buat jurnal → sistem validasi debit=kredit → simpan transaksi
   */
  async create(dto: CreateJournalEntryDto) {
    // Validate debit = credit
    const TotalDebit = dto.Items.reduce((sum, item) => sum + item.Debit, 0);
    const TotalCredit = dto.Items.reduce((sum, item) => sum + item.Credit, 0);

    if (Math.abs(TotalDebit - TotalCredit) > 0.01) {
      throw new BadRequestException('Total debit must equal Total credit');
    }

    // Generate JournalNumber
    const JournalNumber = await this.generateJournalNumber();

    await this.prisma.$transaction(async (tx) => {
      // Create journal entry
      await tx.journalEntry.create({
        data: {
          JournalNumber,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          Type: dto.Type || 'GENERAL',
          ReferenceType: dto.ReferenceType,
          ReferenceID: dto.ReferenceId,
          ReferenceNumber: dto.ReferenceNumber,
          Description: dto.Description,
          Notes: dto.Notes,
          CreatedByID: dto.CreatedById?.toString() || 'system',
          Status: 'POSTED',
          TotalDebit: new Prisma.Decimal(TotalDebit),
          TotalCredit: new Prisma.Decimal(TotalCredit),
          Lines: {
            create: dto.Items.map((item, index) => ({
              AccountID: item.AccountId,
              Debit: new Prisma.Decimal(item.Debit || 0),
              Credit: new Prisma.Decimal(item.Credit || 0),
              Description: item.Description,
              LineNumber: index + 1,
            })),
          },
        },
      });

      // Update account Balances
      for (const item of dto.Items) {
        if (item.Debit > 0) {
          await tx.account.update({
            where: { ID: item.AccountId },
            data: { Balance: { increment: new Prisma.Decimal(item.Debit) } },
          }).catch(() => {}); // Ignore if account not found
        }
        if (item.Credit > 0) {
          await tx.account.update({
            where: { ID: item.AccountId },
            data: { Balance: { decrement: new Prisma.Decimal(item.Credit) } },
          }).catch(() => {});
        }
      }
    });

    return {
      success: true,
      journalEntry: {
        JournalNumber,
        TotalDebit,
        TotalCredit,
        Status: 'POSTED',
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUERY
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Find all journal entries with pagination
   */
  async findAll(query: JournalEntryQueryDto) {
    const { Search, Page = 1, Limit = 20, Type, ReferenceType, AccountId, StartDate, EndDate } = query;

    const where: any = {};

    if (Search) {
      where.OR = [
        { JournalNumber: { contains: Search, mode: 'insensitive' } },
        { Description: { contains: Search, mode: 'insensitive' } },
        { ReferenceNumber: { contains: Search, mode: 'insensitive' } },
      ];
    }

    if (Type) where.Type = Type;
    if (ReferenceType) where.ReferenceType = ReferenceType;
    if (AccountId) {
      where.Lines = { some: { AccountID: AccountId } };
    }

    if (StartDate || EndDate) {
      where.Date = {};
      if (StartDate) where.Date.gte = new Date(StartDate);
      if (EndDate) where.Date.lte = new Date(EndDate);
    }

    const skip = ((Page || 1) - 1) * (Limit || 20);

    const [data, Total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where,
        include: {
          Lines: { include: { Account: true } },
        },
        skip,
        take: Limit || 20,
        orderBy: [{ Date: 'desc' }, { CreatedAt: 'desc' }],
      }),
      this.prisma.journalEntry.count({ where }),
    ]);

    return {
      data,
      pagination: { Page: Page || 1, Limit: Limit || 20, Total, TotalPages: Math.ceil(Total / (Limit || 20)) },
    };
  }

  /**
   * Find journal entry by ID
   */
  async findById(ID: number) {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { ID },
      include: {
        Lines: { include: { Account: true } },
      },
    });

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    return entry;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Update journal entry (unposted only)
   */
  async update(ID: number, dto: UpDateJournalEntryDto) {
    const existing = await this.findById(ID);

    if (existing.Status === 'POSTED') {
      throw new BadRequestException('Cannot update posted journal entry');
    }

    return this.prisma.journalEntry.update({
      where: { ID },
      data: {
        Date: dto.Date ? new Date(dto.Date) : undefined,
        Description: dto.Description,
        Notes: dto.Notes,
      },
      include: { Lines: { include: { Account: true } } },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Post journal entry (Kunci transaksi)
   */
  async post(ID: number) {
    const entry = await this.findById(ID);

    if (entry.Status === 'POSTED') {
      throw new BadRequestException('Journal entry already posted');
    }

    return this.prisma.journalEntry.update({
      where: { ID },
      data: { Status: 'POSTED' },
      include: { Lines: { include: { Account: true } } },
    });
  }

  /**
   * Unpost journal entry (Buka transaksi)
   */
  async unpost(ID: number) {
    const entry = await this.findById(ID);

    if (entry.Status !== 'POSTED') {
      throw new BadRequestException('Journal entry is not posted');
    }

    return this.prisma.journalEntry.update({
      where: { ID },
      data: { Status: 'DRAFT' },
      include: { Lines: { include: { Account: true } } },
    });
  }

  /**
   * Cancel journal entry
   */
  async cancel(ID: number, dto: CancelJournalEntryDto) {
    const entry = await this.findById(ID);

    if (entry.Status === 'CANCELLED') {
      throw new ConflictException('Journal entry already cancelled');
    }

    return this.prisma.journalEntry.update({
      where: { ID },
      data: { Status: 'CANCELLED', Notes: `${entry.Notes || ''}\nCancellation: ${dto.Reason}` },
      include: { Lines: { include: { Account: true } } },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get account Balance as of Date
   */
  async getAccountBalance(dto: AccountBalanceDto) {
    const account = await this.prisma.account.findUnique({
      where: { ID: dto.AccountId },
      include: { Type: true },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const asOfDate = dto.AsOfDate ? new Date(dto.AsOfDate) : new Date();

    const entries = await this.prisma.journalEntryLine.findMany({
      where: {
        AccountID: dto.AccountId,
        JournalEntry: {
          Date: { lte: asOfDate },
          Status: 'POSTED',
        },
      },
      include: { JournalEntry: true },
    });

    const TotalDebit = entries.reduce((sum, e) => sum + Number(e.Debit), 0);
    const TotalCredit = entries.reduce((sum, e) => sum + Number(e.Credit), 0);
    const Balance = TotalDebit - TotalCredit;

    return {
      account: { ID: account.ID, Code: account.Code, Name: account.Name, Type: account.Type?.Name },
      asOfDate,
      TotalDebit,
      TotalCredit,
      Balance,
      transactions: entries.map((e) => ({
        Date: e.JournalEntry.Date,
        JournalNumber: e.JournalEntry.JournalNumber,
        Description: e.JournalEntry.Description,
        Debit: number(e.Debit),
        Credit: number(e.Credit),
      })),
    };
  }

  /**
   * Get trial Balance Report (Neraca Saldo)
   */
  async getTrialBalance(dto: TrialBalanceDto) {
    const startDate = dto.StartDate ? new Date(dto.StartDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();

    const Accounts = await this.prisma.account.findMany({
      where: { IsActive: true },
      include: { Type: true },
      orderBy: { Code: 'asc' },
    });

    const items: Array<{
      AccountID: number;
      AccountCode: string;
      AccountName: string;
      AccountType: string | null;
      Debit: number;
      Credit: number;
    }> = [];

    for (const account of Accounts) {
      const entries = await this.prisma.journalEntryLine.findMany({
        where: {
          AccountID: account.ID,
          JournalEntry: {
            Date: { gte: startDate, lte: endDate },
            Status: 'POSTED',
          },
        },
      });

      const TotalDebit = entries.reduce((sum, e) => sum + Number(e.Debit), 0);
      const TotalCredit = entries.reduce((sum, e) => sum + Number(e.Credit), 0);

      items.push({
        AccountID: account.ID,
        AccountCode: account.Code,
        AccountName: account.Name,
        AccountType: account.Type?.Name,
        Debit: TotalDebit,
        Credit: TotalCredit,
      });
    }

    const TotalDebitBalance = items.reduce((sum, i) => sum + i.Debit, 0);
    const TotalCreditBalance = items.reduce((sum, i) => sum + i.Credit, 0);

    return {
      startDate,
      endDate,
      items,
      Summary: {
        TotalDebit: TotalDebitBalance,
        TotalCredit: TotalCreditBalance,
        isBalanced: Math.abs(TotalDebitBalance - TotalCreditBalance) < 0.01,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateJournalNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const prefix = `JRN-${year}${month}${day}`;

    const lastEntry = await this.prisma.journalEntry.findFirst({
      where: { JournalNumber: { startsWith: prefix } },
      orderBy: { JournalNumber: 'desc' },
      select: { JournalNumber: true },
    });

    let nextNumber = 1;
    if (lastEntry) {
      const lastSeq = parseInt(lastEntry.JournalNumber.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
