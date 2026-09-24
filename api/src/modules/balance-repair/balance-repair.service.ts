import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import {
  RepairBalanceDto,
  BalanceDiscrepancyDto,
  BalanceHistoryDto,
  RepairResultDto,
  BalanceRepairReportDto,
  BalanceCheckDto,
} from './balance-repair.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BalanceRepairService {
  constructor(private readonly prisma: PrismaService) {}

  async checkDiscrepancies(dto: BalanceCheckDto): Promise<BalanceDiscrepancyDto[]> {
    const asOfDate = dto.asOfDate ? new Date(dto.asOfDate) : new Date();
    const discrepancies: BalanceDiscrepancyDto[] = [];

    const accounts = await this.prisma.account.findMany({
      where: {
        IsActive: true,
        ...(dto.accountId ? { ID: dto.accountId } : {}),
      },
      include: { Type: true },
    });

    for (const account of accounts) {
      // Calculate expected balance from journal entries
      const transactions = await this.prisma.journalEntryLine.findMany({
        where: {
          AccountID: account.ID,
          JournalEntry: {
            Date: { lte: asOfDate },
            Status: { in: ['POSTED', 'DRAFT'] },
          },
        },
        include: { JournalEntry: true },
      });

      let expectedBalance = 0;
      let lastTransactionDate: Date | null = null;

      for (const t of transactions) {
        if (t.DebitCredit === 'DEBIT') {
          expectedBalance += Number(t.Amount);
        } else {
          expectedBalance -= Number(t.Amount);
        }
        if (!lastTransactionDate || t.JournalEntry.Date > lastTransactionDate) {
          lastTransactionDate = t.JournalEntry.Date;
        }
      }

      // Get opening balance
      const openingBalance = await this.prisma.openingBalance.findFirst({
        where: { AccountID: account.ID },
      });

      const currentBalance = openingBalance
        ? Number(openingBalance.Debit) - Number(openingBalance.Credit)
        : 0;

      const totalBalance = currentBalance + expectedBalance;

      // Check if there's a discrepancy
      if (Math.abs(expectedBalance) > 0.01) {
        discrepancies.push({
          accountId: account.ID,
          accountCode: account.Code,
          accountName: account.Name,
          accountType: account.Type?.Name || 'Unknown',
          expectedBalance: totalBalance,
          currentBalance: expectedBalance,
          difference: totalBalance - expectedBalance,
          transactionCount: transactions.length,
          lastTransactionDate,
        });
      }
    }

    return discrepancies;
  }

  async getBalanceHistory(accountId: number, startDate?: string, endDate?: string): Promise<BalanceHistoryDto[]> {
    const account = await this.prisma.account.findUnique({
      where: { ID: accountId },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    const where: any = {
      AccountID: accountId,
    };

    if (startDate || endDate) {
      where.JournalEntry = {};
      if (startDate) {
        where.JournalEntry.Date = { ...where.JournalEntry.Date, gte: new Date(startDate) };
      }
      if (endDate) {
        where.JournalEntry.Date = { ...where.JournalEntry.Date, lte: new Date(endDate) };
      }
    }

    const transactions = await this.prisma.journalEntryLine.findMany({
      where,
      include: { JournalEntry: true },
      orderBy: { JournalEntry: { Date: 'asc' } },
    });

    const history: BalanceHistoryDto[] = [];
    let runningBalance = 0;

    for (const t of transactions) {
      if (t.DebitCredit === 'DEBIT') {
        runningBalance += Number(t.Amount);
      } else {
        runningBalance -= Number(t.Amount);
      }

      history.push({
        accountId,
        accountCode: account.Code,
        accountName: account.Name,
        date: t.JournalEntry.Date,
        reference: t.JournalEntry.Reference || t.JournalEntry.JournalNumber,
        description: t.Description || t.JournalEntry.Description || '',
        debit: t.DebitCredit === 'DEBIT' ? Number(t.Amount) : 0,
        credit: t.DebitCredit === 'KREDIT' ? Number(t.Amount) : 0,
        balance: runningBalance,
        source: t.JournalEntry.SourceDocumentType || 'JOURNAL',
      });
    }

    return history;
  }

  async repairBalance(dto: RepairBalanceDto, userId: string): Promise<BalanceRepairReportDto> {
    const repairs: RepairResultDto[] = [];
    const discrepancies: BalanceDiscrepancyDto[] = [];
    let totalAdjustment = 0;

    const asOfDate = dto.asOfDate ? new Date(dto.asOfDate) : new Date();

    // Get accounts to repair
    let accounts;
    if (dto.accountId) {
      accounts = await this.prisma.account.findMany({
        where: { ID: dto.accountId, IsActive: true },
        include: { Type: true },
      });
    } else if (dto.repairAll) {
      accounts = await this.prisma.account.findMany({
        where: { IsActive: true },
        include: { Type: true },
      });
    } else {
      throw new BadRequestException('Please specify accountId or repairAll=true');
    }

    for (const account of accounts) {
      // Calculate expected balance from transactions
      const transactions = await this.prisma.journalEntryLine.findMany({
        where: {
          AccountID: account.ID,
          JournalEntry: {
            Date: { lte: asOfDate },
            Status: { in: ['POSTED', 'DRAFT'] },
          },
        },
      });

      let transactionDebit = 0;
      let transactionCredit = 0;

      for (const t of transactions) {
        if (t.DebitCredit === 'DEBIT') {
          transactionDebit += Number(t.Amount);
        } else {
          transactionCredit += Number(t.Amount);
        }
      }

      const isDebitNormal = ['ASSET', 'EXPENSE'].includes(account.Type?.Code?.toUpperCase() || '');
      const expectedBalance = isDebitNormal
        ? transactionDebit - transactionCredit
        : transactionCredit - transactionDebit;

      // Get current opening balance
      const currentOB = await this.prisma.openingBalance.findFirst({
        where: { AccountID: account.ID },
      });

      const currentBalance = currentOB
        ? isDebitNormal
          ? Number(currentOB.Debit) - Number(currentOB.Credit)
          : Number(currentOB.Credit) - Number(currentOB.Debit)
        : 0;

      const difference = expectedBalance - currentBalance;

      if (Math.abs(difference) > 0.01) {
        // Create adjusting journal entry
        const journalCode = `ADJ-${account.Code}-${Date.now()}`;
        const description = `Adjustment for account ${account.Code} - Balance repair`;

        let debit = 0;
        let credit = 0;

        if (difference > 0) {
          if (isDebitNormal) {
            debit = Math.abs(difference);
          } else {
            credit = Math.abs(difference);
          }
        } else {
          if (isDebitNormal) {
            credit = Math.abs(difference);
          } else {
            debit = Math.abs(difference);
          }
        }

        if (debit > 0 || credit > 0) {
          await this.prisma.$transaction(async (tx) => {
            // Create journal entry
            await tx.journalEntry.create({
              data: {
                JournalNumber: journalCode,
                Date: asOfDate,
                Reference: `REPAIR-${account.ID}`,
                Description: description,
                SourceDocumentType: 'BALANCE_REPAIR',
                TotalDebit: new Prisma.Decimal(debit),
                TotalCredit: new Prisma.Decimal(credit),
                Status: 'POSTED',
                CreatedByID: userId,
              },
            });

            // Update or create opening balance
            if (currentOB) {
              await tx.openingBalance.update({
                where: { ID: currentOB.ID },
                data: {
                  Debit: isDebitNormal ? new Prisma.Decimal(Math.max(0, expectedBalance)) : new Prisma.Decimal(0),
                  Credit: !isDebitNormal ? new Prisma.Decimal(Math.max(0, expectedBalance)) : new Prisma.Decimal(0),
                },
              });
            } else {
              await tx.openingBalance.create({
                data: {
                  Type: 'ACCOUNT',
                  Date: asOfDate,
                  AccountID: account.ID,
                  Debit: isDebitNormal ? new Prisma.Decimal(Math.max(0, expectedBalance)) : new Prisma.Decimal(0),
                  Credit: !isDebitNormal ? new Prisma.Decimal(Math.max(0, expectedBalance)) : new Prisma.Decimal(0),
                  CreatedByID: userId,
                },
              });
            }
          });

          repairs.push({
            accountId: account.ID,
            accountCode: account.Code,
            accountName: account.Name,
            repaired: true,
            expectedBalance,
            previousBalance: currentBalance,
            adjustmentAmount: difference,
            journalCode,
            repairDate: new Date(),
          });

          totalAdjustment += Math.abs(difference);
        }
      }

      discrepancies.push({
        accountId: account.ID,
        accountCode: account.Code,
        accountName: account.Name,
        accountType: account.Type?.Name || 'Unknown',
        expectedBalance,
        currentBalance,
        difference,
        transactionCount: transactions.length,
        lastTransactionDate: null,
      });
    }

    return {
      totalAccountsChecked: accounts.length,
      accountsWithDiscrepancy: discrepancies.filter(d => Math.abs(d.difference) > 0.01).length,
      accountsRepaired: repairs.length,
      totalAdjustmentAmount: totalAdjustment,
      repairs,
      discrepancies,
      repairDate: new Date(),
      repairedBy: userId,
    };
  }

  async getAccountBalance(accountId: number, asOfDate?: string): Promise<any> {
    const account = await this.prisma.account.findUnique({
      where: { ID: accountId },
      include: { Type: true },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    const date = asOfDate ? new Date(asOfDate) : new Date();

    const transactions = await this.prisma.journalEntryLine.findMany({
      where: {
        AccountID: accountId,
        JournalEntry: {
          Date: { lte: date },
        },
      },
    });

    const openingBalance = await this.prisma.openingBalance.findFirst({
      where: { AccountID: accountId },
    });

    let transactionDebit = 0;
    let transactionCredit = 0;

    for (const t of transactions) {
      if (t.DebitCredit === 'DEBIT') {
        transactionDebit += Number(t.Amount);
      } else {
        transactionCredit += Number(t.Amount);
      }
    }

    const isDebitNormal = ['ASSET', 'EXPENSE'].includes(account.Type?.Code?.toUpperCase() || '');

    return {
      accountId: account.ID,
      accountCode: account.Code,
      accountName: account.Name,
      accountType: account.Type?.Name,
      isDebitNormal,
      openingBalance: openingBalance
        ? isDebitNormal
          ? Number(openingBalance.Debit) - Number(openingBalance.Credit)
          : Number(openingBalance.Credit) - Number(openingBalance.Debit)
        : 0,
      periodDebit: transactionDebit,
      periodCredit: transactionCredit,
      closingBalance: isDebitNormal
        ? transactionDebit - transactionCredit
        : transactionCredit - transactionDebit,
      transactionCount: transactions.length,
    };
  }
}
