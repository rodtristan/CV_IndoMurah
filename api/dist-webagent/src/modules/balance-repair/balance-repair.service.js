"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceRepairService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
let BalanceRepairService = class BalanceRepairService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkDiscrepancies(dto) {
        const asOfDate = dto.asOfDate ? new Date(dto.asOfDate) : new Date();
        const discrepancies = [];
        const accounts = await this.prisma.account.findMany({
            where: {
                IsActive: true,
                ...(dto.accountId ? { ID: dto.accountId } : {}),
            },
            include: { Type: true },
        });
        for (const account of accounts) {
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
            let lastTransactionDate = null;
            for (const t of transactions) {
                if (t.DebitCredit === 'DEBIT') {
                    expectedBalance += Number(t.Amount);
                }
                else {
                    expectedBalance -= Number(t.Amount);
                }
                if (!lastTransactionDate || t.JournalEntry.Date > lastTransactionDate) {
                    lastTransactionDate = t.JournalEntry.Date;
                }
            }
            const openingBalance = await this.prisma.openingBalance.findFirst({
                where: { AccountID: account.ID },
            });
            const currentBalance = openingBalance
                ? Number(openingBalance.Debit) - Number(openingBalance.Credit)
                : 0;
            const totalBalance = currentBalance + expectedBalance;
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
    async getBalanceHistory(accountId, startDate, endDate) {
        const account = await this.prisma.account.findUnique({
            where: { ID: accountId },
        });
        if (!account) {
            throw new common_1.NotFoundException(`Account with ID ${accountId} not found`);
        }
        const where = {
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
        const history = [];
        let runningBalance = 0;
        for (const t of transactions) {
            if (t.DebitCredit === 'DEBIT') {
                runningBalance += Number(t.Amount);
            }
            else {
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
    async repairBalance(dto, userId) {
        const repairs = [];
        const discrepancies = [];
        let totalAdjustment = 0;
        const asOfDate = dto.asOfDate ? new Date(dto.asOfDate) : new Date();
        let accounts;
        if (dto.accountId) {
            accounts = await this.prisma.account.findMany({
                where: { ID: dto.accountId, IsActive: true },
                include: { Type: true },
            });
        }
        else if (dto.repairAll) {
            accounts = await this.prisma.account.findMany({
                where: { IsActive: true },
                include: { Type: true },
            });
        }
        else {
            throw new common_1.BadRequestException('Please specify accountId or repairAll=true');
        }
        for (const account of accounts) {
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
                }
                else {
                    transactionCredit += Number(t.Amount);
                }
            }
            const isDebitNormal = ['ASSET', 'EXPENSE'].includes(account.Type?.Code?.toUpperCase() || '');
            const expectedBalance = isDebitNormal
                ? transactionDebit - transactionCredit
                : transactionCredit - transactionDebit;
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
                const journalCode = `ADJ-${account.Code}-${Date.now()}`;
                const description = `Adjustment for account ${account.Code} - Balance repair`;
                let debit = 0;
                let credit = 0;
                if (difference > 0) {
                    if (isDebitNormal) {
                        debit = Math.abs(difference);
                    }
                    else {
                        credit = Math.abs(difference);
                    }
                }
                else {
                    if (isDebitNormal) {
                        credit = Math.abs(difference);
                    }
                    else {
                        debit = Math.abs(difference);
                    }
                }
                if (debit > 0 || credit > 0) {
                    await this.prisma.$transaction(async (tx) => {
                        await tx.journalEntry.create({
                            data: {
                                JournalNumber: journalCode,
                                Date: asOfDate,
                                Reference: `REPAIR-${account.ID}`,
                                Description: description,
                                SourceDocumentType: 'BALANCE_REPAIR',
                                TotalDebit: new client_1.Prisma.Decimal(debit),
                                TotalCredit: new client_1.Prisma.Decimal(credit),
                                Status: 'POSTED',
                                CreatedByID: userId,
                            },
                        });
                        if (currentOB) {
                            await tx.openingBalance.update({
                                where: { ID: currentOB.ID },
                                data: {
                                    Debit: isDebitNormal ? new client_1.Prisma.Decimal(Math.max(0, expectedBalance)) : new client_1.Prisma.Decimal(0),
                                    Credit: !isDebitNormal ? new client_1.Prisma.Decimal(Math.max(0, expectedBalance)) : new client_1.Prisma.Decimal(0),
                                },
                            });
                        }
                        else {
                            await tx.openingBalance.create({
                                data: {
                                    Type: 'ACCOUNT',
                                    Date: asOfDate,
                                    AccountID: account.ID,
                                    Debit: isDebitNormal ? new client_1.Prisma.Decimal(Math.max(0, expectedBalance)) : new client_1.Prisma.Decimal(0),
                                    Credit: !isDebitNormal ? new client_1.Prisma.Decimal(Math.max(0, expectedBalance)) : new client_1.Prisma.Decimal(0),
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
    async getAccountBalance(accountId, asOfDate) {
        const account = await this.prisma.account.findUnique({
            where: { ID: accountId },
            include: { Type: true },
        });
        if (!account) {
            throw new common_1.NotFoundException(`Account with ID ${accountId} not found`);
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
            }
            else {
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
};
exports.BalanceRepairService = BalanceRepairService;
exports.BalanceRepairService = BalanceRepairService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BalanceRepairService);
