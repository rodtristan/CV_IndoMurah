import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client';
import { YearCloseDto, YearCloseResultDto, FiscalYearDto } from './year-close.dto';

@Injectable()
export class YearCloseService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get list of fiscal years with their financial summary
   */
  async getFiscalYears(): Promise<FiscalYearDto[]> {
    // Get all journal entries grouped by year
    const entries = await this.prisma.journalEntry.findMany({
      where: { Status: { in: ['POSTED', 'DRAFT'] } },
      select: {
        Date: true,
        TotalDebit: true,
        TotalCredit: true,
      },
    });

    // Group by year
    const yearMap = new Map<number, { revenue: number; expenses: number }>();

    for (const entry of entries) {
      const year = entry.Date.getFullYear();
      const existing = yearMap.get(year) || { revenue: 0, expenses: 0 };

      // Simplified: assume TotalDebit = expenses, TotalCredit = revenue
      // This should be refined based on actual account types
      existing.revenue += Number(entry.TotalCredit);
      existing.expenses += Number(entry.TotalDebit);

      yearMap.set(year, existing);
    }

    // Get locked years from opening balances
    const lockedYears = await this.prisma.openingBalance.findMany({
      where: { Type: 'YEAR_CLOSE' },
      select: { Date: true, Notes: true },
    });

    const lockedYearSet = new Set<number>();
    for (const lock of lockedYears) {
      lockedYearSet.add(lock.Date.getFullYear());
    }

    // Build result
    const years: FiscalYearDto[] = [];
    for (const [year, data] of yearMap) {
      years.push({
        year,
        startDate: new Date(year, 0, 1),
        endDate: new Date(year, 11, 31),
        isLocked: lockedYearSet.has(year),
        totalRevenue: data.revenue,
        totalExpenses: data.expenses,
        netIncome: data.revenue - data.expenses,
      });
    }

    return years.sort((a, b) => b.year - a.year);
  }

  /**
   * Close a fiscal year
   * 1. Calculate net income (revenue - expenses)
   * 2. Create closing entries (revenue -> income summary -> retained earnings)
   * 3. Lock the year from editing
   * 4. Create opening balances for new year (optional)
   */
  async closeYear(dto: YearCloseDto, userId: string): Promise<YearCloseResultDto> {
    const closingDate = new Date(dto.closingDate);
    const yearToClose = dto.fiscalYear;

    // Check if year is already locked
    const existingLock = await this.prisma.openingBalance.findFirst({
      where: {
        Type: 'YEAR_CLOSE',
        Date: {
          gte: new Date(yearToClose, 0, 1),
          lte: new Date(yearToClose, 11, 31),
        },
      },
    });

    if (existingLock) {
      throw new BadRequestException(`Fiscal year ${yearToClose} is already closed`);
    }

    // Get account settings for required accounts
    const [revenueAccount, expenseAccount, incomeSummaryAccount, retainedEarningsAccount] = await Promise.all([
      this.prisma.accountSetting.findUnique({ where: { Key: 'revenue' } }),
      this.prisma.accountSetting.findUnique({ where: { Key: 'expense' } }),
      this.prisma.accountSetting.findUnique({ where: { Key: 'incomeSummary' } }),
      this.prisma.accountSetting.findUnique({ where: { Key: 'retainedEarnings' } }),
    ]);

    // Calculate totals for the year
    const yearStart = new Date(yearToClose, 0, 1);
    const yearEnd = new Date(yearToClose, 11, 31, 23, 59, 59);

    const journalLines = await this.prisma.journalEntryLine.findMany({
      where: {
        JournalEntry: {
          Date: { gte: yearStart, lte: yearEnd },
          Status: { in: ['POSTED', 'DRAFT'] },
        },
      },
      include: {
        JournalEntry: true,
        Account: { include: { Type: true } },
      },
    });

    // Calculate revenue and expenses
    let totalRevenue = 0;
    let totalExpenses = 0;
    const accountBalances = new Map<number, number>();

    for (const line of journalLines) {
      const balance = accountBalances.get(line.AccountID) || 0;
      if (line.DebitCredit === 'DEBIT') {
        accountBalances.set(line.AccountID, balance - Number(line.Amount));
      } else {
        accountBalances.set(line.AccountID, balance + Number(line.Amount));
      }
    }

    // Get revenue and expense account IDs from settings
    const revenueAccountId = revenueAccount?.AccountID;
    const expenseAccountId = expenseAccount?.AccountID;

    // Calculate totals from journal lines
    for (const line of journalLines) {
      const accountType = line.Account?.Type?.Code?.toUpperCase();

      // Check if this is a revenue or expense account
      if (line.AccountID === revenueAccountId || accountType === 'REVENUE' || accountType === 'INCOME') {
        if (line.DebitCredit === 'KREDIT') {
          totalRevenue += Number(line.Amount);
        } else {
          totalRevenue -= Number(line.Amount);
        }
      }

      if (line.AccountID === expenseAccountId || accountType === 'EXPENSE') {
        if (line.DebitCredit === 'DEBIT') {
          totalExpenses += Number(line.Amount);
        } else {
          totalExpenses -= Number(line.Amount);
        }
      }
    }

    const netIncome = totalRevenue - totalExpenses;

    // Create closing journal entries
    const journalCode = await this.generateJournalCode();
    let closingEntriesCreated = 0;

    await this.prisma.$transaction(async (tx) => {
      // 1. Close Revenue accounts (debit revenue, credit income summary)
      if (totalRevenue > 0 && revenueAccountId) {
        await tx.journalEntry.create({
          data: {
            JournalNumber: `${journalCode}-REV`,
            Date: closingDate,
            Reference: `YEAR-CLOSE-${yearToClose}`,
            Description: `Closing Revenue for FY ${yearToClose}`,
            SourceDocumentType: 'YEAR_CLOSE',
            TotalDebit: new Prisma.Decimal(totalRevenue),
            TotalCredit: new Prisma.Decimal(totalRevenue),
            Status: 'POSTED',
            CreatedByID: userId,
            Lines: {
              create: [
                {
                  AccountID: revenueAccountId,
                  DebitCredit: 'DEBIT',
                  Amount: new Prisma.Decimal(totalRevenue),
                  Description: `Close Revenue - FY ${yearToClose}`,
                  LineNumber: 1,
                },
                {
                  AccountID: incomeSummaryAccount?.AccountID || revenueAccountId,
                  DebitCredit: 'KREDIT',
                  Amount: new Prisma.Decimal(totalRevenue),
                  Description: `Close Revenue - FY ${yearToClose}`,
                  LineNumber: 2,
                },
              ],
            },
          },
        });
        closingEntriesCreated++;
      }

      // 2. Close Expense accounts (debit income summary, credit expenses)
      if (totalExpenses > 0 && expenseAccountId) {
        await tx.journalEntry.create({
          data: {
            JournalNumber: `${journalCode}-EXP`,
            Date: closingDate,
            Reference: `YEAR-CLOSE-${yearToClose}`,
            Description: `Closing Expenses for FY ${yearToClose}`,
            SourceDocumentType: 'YEAR_CLOSE',
            TotalDebit: new Prisma.Decimal(totalExpenses),
            TotalCredit: new Prisma.Decimal(totalExpenses),
            Status: 'POSTED',
            CreatedByID: userId,
            Lines: {
              create: [
                {
                  AccountID: incomeSummaryAccount?.AccountID || expenseAccountId,
                  DebitCredit: 'DEBIT',
                  Amount: new Prisma.Decimal(totalExpenses),
                  Description: `Close Expenses - FY ${yearToClose}`,
                  LineNumber: 1,
                },
                {
                  AccountID: expenseAccountId,
                  DebitCredit: 'KREDIT',
                  Amount: new Prisma.Decimal(totalExpenses),
                  Description: `Close Expenses - FY ${yearToClose}`,
                  LineNumber: 2,
                },
              ],
            },
          },
        });
        closingEntriesCreated++;
      }

      // 3. Close Income Summary to Retained Earnings
      if (netIncome !== 0 && retainedEarningsAccount?.AccountID) {
        const incomeSummaryId = incomeSummaryAccount?.AccountID || revenueAccountId || expenseAccountId;
        if (incomeSummaryId && netIncome > 0) {
          await tx.journalEntry.create({
            data: {
              JournalNumber: `${journalCode}-INC`,
              Date: closingDate,
              Reference: `YEAR-CLOSE-${yearToClose}`,
              Description: `Transfer Net Income ${netIncome > 0 ? 'Profit' : 'Loss'} to Retained Earnings - FY ${yearToClose}`,
              SourceDocumentType: 'YEAR_CLOSE',
              TotalDebit: new Prisma.Decimal(Math.abs(netIncome)),
              TotalCredit: new Prisma.Decimal(Math.abs(netIncome)),
              Status: 'POSTED',
              CreatedByID: userId,
              Lines: {
                create: [
                  {
                    AccountID: netIncome > 0 ? incomeSummaryId : retainedEarningsAccount.AccountID,
                    DebitCredit: netIncome > 0 ? 'DEBIT' : 'KREDIT',
                    Amount: new Prisma.Decimal(Math.abs(netIncome)),
                    Description: `Net Income ${yearToClose}`,
                    LineNumber: 1,
                  },
                  {
                    AccountID: netIncome > 0 ? retainedEarningsAccount.AccountID : incomeSummaryId,
                    DebitCredit: netIncome > 0 ? 'KREDIT' : 'DEBIT',
                    Amount: new Prisma.Decimal(Math.abs(netIncome)),
                    Description: `Retained Earnings - FY ${yearToClose}`,
                    LineNumber: 2,
                  },
                ],
              },
            },
          });
          closingEntriesCreated++;
        }
      }

      // 4. Mark year as locked
      await tx.openingBalance.create({
        data: {
          Type: 'YEAR_CLOSE',
          Date: closingDate,
          Notes: `Year Close ${yearToClose}`,
          Debit: new Prisma.Decimal(netIncome),
          Credit: new Prisma.Decimal(0),
          CreatedByID: userId,
        },
      });

      // 5. Create opening balances for new year if requested
      let openingEntriesCreated = false;
      if (dto.createOpeningEntries) {
        const nextYear = yearToClose + 1;
        const nextYearStart = new Date(nextYear, 0, 1);

        // Get all account balances at year end
        const accounts = await tx.account.findMany({
          where: { IsActive: true },
        });

        for (const account of accounts) {
          const balance = accountBalances.get(account.ID) || 0;
          if (Math.abs(balance) > 0.01) {
            await tx.openingBalance.create({
              data: {
                Type: 'ACCOUNT',
                Date: nextYearStart,
                AccountID: account.ID,
                Debit: balance > 0 ? new Prisma.Decimal(balance) : new Prisma.Decimal(0),
                Credit: balance < 0 ? new Prisma.Decimal(Math.abs(balance)) : new Prisma.Decimal(0),
                Notes: `Opening Balance FY ${nextYear}`,
                CreatedByID: userId,
              },
            });
          }
        }
        openingEntriesCreated = true;
      }
    });

    return {
      success: true,
      closedYear: yearToClose,
      closingDate,
      netIncome,
      totalRevenue,
      totalExpenses,
      closingEntriesCreated,
      openingEntriesCreated: dto.createOpeningEntries || false,
      fiscalYearsLocked: [String(yearToClose)],
      message: `Fiscal year ${yearToClose} closed successfully. Net Income: ${netIncome.toLocaleString('id-ID')}`,
    };
  }

  private async generateJournalCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `JE-${year}${month}`;

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
