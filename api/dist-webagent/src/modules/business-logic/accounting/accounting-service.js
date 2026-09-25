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
exports.AccountingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
let AccountingService = class AccountingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAccount(dto, UserId) {
        const accountType = await this.prisma.accountType.findUnique({
            where: { ID: dto.AccountTypeId },
        });
        if (!accountType) {
            throw new common_1.NotFoundException('Account Type not found');
        }
        const existing = await this.prisma.account.findFirst({
            where: { Code: dto.Code },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Account Code '${dto.Code}' already exists`);
        }
        const Code = dto.Code || await this.generateAccountCode(dto.AccountTypeId);
        const account = await this.prisma.account.create({
            data: {
                Code: Code,
                Name: dto.Name,
                TypeID: dto.AccountTypeId,
                ParentID: dto.ParentId || null,
                IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
            },
            include: { Type: true, Parent: true, Extension: true },
        });
        if (dto.TaxRate !== undefined || dto.DepreciationMethod !== undefined) {
            await this.prisma.accountExtension.create({
                data: {
                    AccountID: account.ID,
                    TaxRate: dto.TaxRate ? new client_1.Prisma.Decimal(dto.TaxRate) : null,
                    DepreciationMethod: dto.DepreciationMethod,
                },
            });
        }
        return {
            success: true,
            account: this.formatAccount(account),
        };
    }
    async getAccount(accountId) {
        const account = await this.prisma.account.findUnique({
            where: { ID: accountId },
            include: { Type: true, Parent: true, Children: true, Extension: true },
        });
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        return this.formatAccount(account);
    }
    async listAccounts(dto) {
        const where = {};
        if (dto.AccountTypeId) {
            where.TypeID = dto.AccountTypeId;
        }
        if (dto.ParentId !== undefined) {
            where.ParentID = dto.ParentId || null;
        }
        if (dto.IsActive !== undefined) {
            where.IsActive = dto.IsActive;
        }
        if (dto.Search) {
            where.OR = [
                { Name: { contains: dto.Search, mode: 'insensitive' } },
                { Code: { contains: dto.Search, mode: 'insensitive' } },
            ];
        }
        const Accounts = await this.prisma.account.findMany({
            where,
            include: { Type: true, Parent: true, Extension: true },
            orderBy: [{ Type: { SortOrder: 'asc' } }, { Code: 'asc' }],
        });
        return Accounts.map((a) => this.formatAccount(a));
    }
    async updateAccount(accountId, dto, UserId) {
        const account = await this.prisma.account.findUnique({
            where: { ID: accountId },
        });
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        const updated = await this.prisma.account.update({
            where: { ID: accountId },
            data: {
                Name: dto.Name,
                TypeID: dto.AccountTypeId,
                ParentID: dto.ParentId,
                IsActive: dto.IsActive,
            },
            include: { Type: true, Extension: true },
        });
        if (dto.TaxRate !== undefined) {
            const existingExt = await this.prisma.accountExtension.findUnique({
                where: { AccountID: accountId },
            });
            if (existingExt) {
                await this.prisma.accountExtension.update({
                    where: { AccountID: accountId },
                    data: {
                        TaxRate: dto.TaxRate !== undefined ? (dto.TaxRate ? new client_1.Prisma.Decimal(dto.TaxRate) : null) : undefined,
                    },
                });
            }
            else if (dto.TaxRate !== undefined) {
                await this.prisma.accountExtension.create({
                    data: {
                        AccountID: accountId,
                        TaxRate: dto.TaxRate ? new client_1.Prisma.Decimal(dto.TaxRate) : null,
                    },
                });
            }
        }
        return {
            success: true,
            account: this.formatAccount(updated),
        };
    }
    async getAccountTree() {
        const Accounts = await this.prisma.account.findMany({
            where: { IsActive: true },
            include: { Type: true, Extension: true },
            orderBy: [{ Type: { SortOrder: 'asc' } }, { Code: 'asc' }],
        });
        const rootAccounts = Accounts.filter((a) => !a.ParentID);
        const childrenMap = new Map();
        Accounts.forEach((a) => {
            if (a.ParentID) {
                const children = childrenMap.get(a.ParentID) || [];
                children.push(this.formatAccount(a));
                childrenMap.set(a.ParentID, children);
            }
        });
        return rootAccounts.map((a) => ({
            ...this.formatAccount(a),
            children: childrenMap.get(a.ID) || [],
        }));
    }
    async createJournalEntry(dto, UserId) {
        let TotalDebit = 0;
        let TotalCredit = 0;
        for (const item of dto.Items) {
            if (item.DebitCredit === 'DEBIT') {
                TotalDebit += item.Amount;
            }
            else {
                TotalCredit += item.Amount;
            }
        }
        if (Math.abs(TotalDebit - TotalCredit) > 0.01) {
            throw new common_1.BadRequestException(`Journal entry is not Balanced. Total Debit: ${TotalDebit}, Total Credit: ${TotalCredit}`);
        }
        for (const item of dto.Items) {
            const account = await this.prisma.account.findUnique({
                where: { ID: item.AccountId },
            });
            if (!account) {
                throw new common_1.NotFoundException(`Account ${item.AccountId} not found`);
            }
        }
        const journalNumber = await this.generateJournalNumber();
        const entry = await this.prisma.$transaction(async (tx) => {
            const newEntry = await tx.journalEntry.create({
                data: {
                    JournalNumber: journalNumber,
                    Date: new Date(dto.Date),
                    Reference: dto.Reference,
                    Description: dto.Description,
                    SourceDocumentID: dto.SourceDocumentId,
                    SourceDocumentType: dto.SourceDocumentType,
                    TotalDebit: new client_1.Prisma.Decimal(TotalDebit),
                    TotalCredit: new client_1.Prisma.Decimal(TotalCredit),
                    CreatedByID: UserId,
                },
            });
            await tx.journalEntryLine.createMany({
                data: dto.Items.map((item, index) => ({
                    JournalEntryID: newEntry.ID,
                    AccountID: item.AccountId,
                    DebitCredit: item.DebitCredit,
                    Amount: new client_1.Prisma.Decimal(item.Amount),
                    Description: item.Description,
                    LineNumber: index + 1,
                })),
            });
            for (const item of dto.Items) {
                const extension = await tx.accountExtension.findUnique({
                    where: { AccountID: item.AccountId },
                });
                if (extension) {
                    await tx.accountExtension.update({
                        where: { AccountID: item.AccountId },
                        data: {
                            CurrentDebit: item.DebitCredit === 'DEBIT'
                                ? { increment: new client_1.Prisma.Decimal(item.Amount) }
                                : undefined,
                            CurrentCredit: item.DebitCredit === 'KREDIT'
                                ? { increment: new client_1.Prisma.Decimal(item.Amount) }
                                : undefined,
                        },
                    });
                }
            }
            return newEntry;
        });
        return {
            success: true,
            journalEntry: {
                ID: entry.ID,
                journalNumber: entry.JournalNumber,
                Date: entry.Date,
                reference: entry.Reference,
                description: entry.Description,
                TotalDebit: TotalDebit,
                TotalCredit: TotalCredit,
                sourceDocumentType: entry.SourceDocumentType,
                LineCount: dto.Items.length,
            },
        };
    }
    async getJournalEntry(entryId) {
        const entry = await this.prisma.journalEntry.findUnique({
            where: { ID: entryId },
            include: {
                Lines: { include: { Account: { include: { Type: true } } }, orderBy: { LineNumber: 'asc' } },
                Creator: true,
            },
        });
        if (!entry) {
            throw new common_1.NotFoundException('Journal entry not found');
        }
        return {
            ID: entry.ID,
            journalNumber: entry.JournalNumber,
            Date: entry.Date,
            reference: entry.Reference,
            description: entry.Description,
            totalDebit: Number(entry.TotalDebit),
            totalCredit: Number(entry.TotalCredit),
            sourceDocumentType: entry.SourceDocumentType,
            sourceDocumentId: entry.SourceDocumentID,
            createdBy: entry.Creator?.Name || 'System',
            createdAt: entry.CreatedAt,
            Lines: entry.Lines.map((Line) => ({
                ID: Line.ID,
                accountId: Line.AccountID,
                accountCode: Line.Account.Code,
                accountName: Line.Account.Name,
                accountType: Line.Account.Type?.Name,
                debitCredit: Line.DebitCredit,
                amount: Number(Line.Amount),
                description: Line.Description,
            })),
        };
    }
    async listJournalEntries(dto) {
        const where = {};
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.Date.lte = new Date(dto.EndDate);
            }
        }
        if (dto.AccountId) {
            where.Lines = { some: { AccountID: dto.AccountId } };
        }
        if (dto.Reference) {
            where.Reference = { contains: dto.Reference, mode: 'insensitive' };
        }
        if (dto.SourceDocumentType) {
            where.SourceDocumentType = dto.SourceDocumentType;
        }
        const entries = await this.prisma.journalEntry.findMany({
            where,
            include: {
                Lines: { include: { Account: true } },
            },
            orderBy: [{ Date: 'desc' }, { JournalNumber: 'desc' }],
        });
        return entries.map((entry) => ({
            ID: entry.ID,
            journalNumber: entry.JournalNumber,
            Date: entry.Date,
            reference: entry.Reference,
            description: entry.Description,
            totalDebit: Number(entry.TotalDebit),
            totalCredit: Number(entry.TotalCredit),
            sourceDocumentType: entry.SourceDocumentType,
            LineCount: entry.Lines.length,
            Accounts: [...new Set(entry.Lines.map((l) => l.Account.Name))].slice(0, 3),
        }));
    }
    async reverseJournalEntry(entryId, ReversalDate, UserId) {
        const originalEntry = await this.prisma.journalEntry.findUnique({
            where: { ID: entryId },
            include: { Lines: { include: { Account: true } } },
        });
        if (!originalEntry) {
            throw new common_1.NotFoundException('Journal entry not found');
        }
        const reversingEntry = await this.prisma.$transaction(async (tx) => {
            const newEntry = await tx.journalEntry.create({
                data: {
                    JournalNumber: await this.generateJournalNumber(),
                    Date: new Date(ReversalDate),
                    Reference: `REVERSAL-${originalEntry.JournalNumber}`,
                    Description: `Reversal of ${originalEntry.JournalNumber}`,
                    TotalDebit: originalEntry.TotalDebit,
                    TotalCredit: originalEntry.TotalCredit,
                    CreatedByID: UserId,
                    ReversedEntryID: originalEntry.ID,
                },
            });
            await tx.journalEntryLine.createMany({
                data: originalEntry.Lines.map((Line) => ({
                    JournalEntryID: newEntry.ID,
                    AccountID: Line.AccountID,
                    DebitCredit: Line.DebitCredit === 'DEBIT' ? 'KREDIT' : 'DEBIT',
                    Amount: Line.Amount,
                    Description: `Reversal: ${Line.Description || Line.Account.Name}`,
                    LineNumber: Line.LineNumber,
                })),
            });
            return newEntry;
        });
        return {
            success: true,
            originalEntry: originalEntry.JournalNumber,
            ReversalEntry: {
                ID: reversingEntry.ID,
                journalNumber: reversingEntry.JournalNumber,
                Date: reversingEntry.Date,
            },
        };
    }
    async getGeneralLedger(dto) {
        const Accounts = await this.prisma.account.findMany({
            where: {
                IsActive: true,
                ...(dto.AccountId ? { ID: dto.AccountId } : {}),
                ...(dto.AccountTypeId ? { TypeID: dto.AccountTypeId } : {}),
            },
            include: { Type: true, Extension: true },
            orderBy: [{ Type: { SortOrder: 'asc' } }, { Code: 'asc' }],
        });
        const startDate = new Date(dto.StartDate);
        const endDate = new Date(dto.EndDate);
        const ledgerData = [];
        for (const account of Accounts) {
            const openingEntries = await this.prisma.journalEntryLine.aggregate({
                where: {
                    AccountID: account.ID,
                    JournalEntry: { Date: { lt: startDate } },
                },
                _sum: { Amount: true },
            });
            let openingDebit = 0;
            let openingCredit = 0;
            const transactions = await this.prisma.journalEntryLine.findMany({
                where: {
                    AccountID: account.ID,
                    JournalEntry: { Date: { gte: startDate, lte: endDate } },
                },
                include: { JournalEntry: true, Account: { include: { Type: true } } },
                orderBy: { JournalEntry: { Date: 'asc' } },
            });
            let runningDebit = 0;
            let runningCredit = 0;
            const isDebitNormal = ['ASSET', 'EXPENSE'].includes(account.Type?.Code?.toUpperCase() || '');
            for (const trans of transactions) {
                if (trans.DebitCredit === 'DEBIT') {
                    runningDebit += Number(trans.Amount);
                }
                else {
                    runningCredit += Number(trans.Amount);
                }
            }
            const TotalDebit = transactions
                .filter((t) => t.DebitCredit === 'DEBIT')
                .reduce((sum, t) => sum + Number(t.Amount), 0);
            const TotalCredit = transactions
                .filter((t) => t.DebitCredit === 'KREDIT')
                .reduce((sum, t) => sum + Number(t.Amount), 0);
            const closingBalance = isDebitNormal
                ? runningDebit - runningCredit
                : runningCredit - runningDebit;
            if (!dto.ShowZeroBalance && TotalDebit === 0 && TotalCredit === 0 && closingBalance === 0) {
                continue;
            }
            ledgerData.push({
                accountId: account.ID,
                accountCode: account.Code,
                accountName: account.Name,
                accountType: account.Type?.Name,
                normalBalance: isDebitNormal ? 'DEBIT' : 'KREDIT',
                openingBalance: isDebitNormal ? openingDebit - openingCredit : openingCredit - openingDebit,
                periodDebit: TotalDebit,
                periodCredit: TotalCredit,
                closingBalance,
                transactionCount: transactions.length,
                transactions: transactions.map((t) => ({
                    ID: t.ID,
                    Date: t.JournalEntry.Date,
                    journalNumber: t.JournalEntry.JournalNumber,
                    reference: t.JournalEntry.Reference,
                    description: t.JournalEntry.Description,
                    debitCredit: t.DebitCredit,
                    amount: Number(t.Amount),
                    lineDescription: t.Description,
                })),
            });
        }
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            Accounts: ledgerData,
            Summary: {
                TotalAccounts: ledgerData.length,
                TotalDebit: ledgerData.reduce((sum, a) => sum + a.periodDebit, 0),
                TotalCredit: ledgerData.reduce((sum, a) => sum + a.periodCredit, 0),
            },
        };
    }
    async getTrialBalance(dto) {
        const asOfDate = new Date(dto.AsOfDate);
        const Accounts = await this.prisma.account.findMany({
            where: { IsActive: true },
            include: { Type: true, Extension: true },
            orderBy: [{ Type: { SortOrder: 'asc' } }, { Code: 'asc' }],
        });
        const trialBalanceData = [];
        for (const account of Accounts) {
            const transactions = await this.prisma.journalEntryLine.findMany({
                where: {
                    AccountID: account.ID,
                    JournalEntry: { Date: { lte: asOfDate } },
                },
            });
            const TotalDebit = transactions
                .filter((t) => t.DebitCredit === 'DEBIT')
                .reduce((sum, t) => sum + Number(t.Amount), 0);
            const TotalCredit = transactions
                .filter((t) => t.DebitCredit === 'KREDIT')
                .reduce((sum, t) => sum + Number(t.Amount), 0);
            const isDebitNormal = ['ASSET', 'EXPENSE'].includes(account.Type?.Code?.toUpperCase() || '');
            const Balance = isDebitNormal ? TotalDebit - TotalCredit : TotalCredit - TotalDebit;
            if (Balance !== 0 || dto.ShowZeroBalance) {
                trialBalanceData.push({
                    accountId: account.ID,
                    accountCode: account.Code,
                    accountName: account.Name,
                    accountType: account.Type?.Name,
                    debit: isDebitNormal && Balance > 0 ? Balance : !isDebitNormal && Balance < 0 ? Math.abs(Balance) : 0,
                    credit: !isDebitNormal && Balance > 0 ? Balance : isDebitNormal && Balance < 0 ? Math.abs(Balance) : 0,
                });
            }
        }
        const Totals = {
            TotalDebit: trialBalanceData.reduce((sum, a) => sum + a.debit, 0),
            TotalCredit: trialBalanceData.reduce((sum, a) => sum + a.credit, 0),
        };
        return {
            asOfDate: dto.AsOfDate,
            Accounts: trialBalanceData,
            Totals,
            isBalanced: Math.abs(Totals.TotalDebit - Totals.TotalCredit) < 0.01,
        };
    }
    async getBalanceSheet(dto) {
        const asOfDate = new Date(dto.AsOfDate);
        const comparisonDate = dto.ComparisonDate ? new Date(dto.ComparisonDate) : null;
        const calculateBalance = async (accountId, Date) => {
            const transactions = await this.prisma.journalEntryLine.findMany({
                where: {
                    AccountID: accountId,
                    JournalEntry: { Date: { lte: Date } },
                },
            });
            const TotalDebit = transactions
                .filter((t) => t.DebitCredit === 'DEBIT')
                .reduce((sum, t) => sum + Number(t.Amount), 0);
            const TotalCredit = transactions
                .filter((t) => t.DebitCredit === 'KREDIT')
                .reduce((sum, t) => sum + Number(t.Amount), 0);
            return TotalDebit - TotalCredit;
        };
        const Accounts = await this.prisma.account.findMany({
            where: { IsActive: true },
            include: { Type: true },
            orderBy: { Code: 'asc' },
        });
        const assets = [];
        const liabilities = [];
        const equities = [];
        for (const account of Accounts) {
            const Balance = await calculateBalance(account.ID, asOfDate);
            const comparisonBalance = comparisonDate ? await calculateBalance(account.ID, comparisonDate) : null;
            const acCountData = {
                ID: account.ID,
                Code: account.Code,
                Name: account.Name,
                Balance,
                comparisonBalance,
                change: comparisonBalance !== null ? Balance - comparisonBalance : null,
            };
            const TypeCode = account.Type?.Code?.toUpperCase();
            if (TypeCode === 'ASSET') {
                assets.push(acCountData);
            }
            else if (TypeCode === 'LIABILITY') {
                liabilities.push(acCountData);
            }
            else if (TypeCode === 'EQUITY') {
                equities.push(acCountData);
            }
        }
        const TotalAssets = assets.reduce((sum, a) => sum + a.Balance, 0);
        const TotalLiabilities = liabilities.reduce((sum, a) => sum + a.Balance, 0);
        const TotalEquity = equities.reduce((sum, a) => sum + a.Balance, 0);
        return {
            asOfDate: dto.AsOfDate,
            comparisonDate: dto.ComparisonDate,
            BalanceSheet: {
                assets: {
                    items: assets,
                    Total: TotalAssets,
                },
                liabilities: {
                    items: liabilities,
                    Total: TotalLiabilities,
                },
                equity: {
                    items: equities,
                    Total: TotalEquity,
                },
            },
            Totals: {
                TotalAssets,
                TotalLiabilities,
                TotalEquity,
                isBalanced: Math.abs(TotalAssets - (TotalLiabilities + TotalEquity)) < 0.01,
            },
        };
    }
    async getProfitAndLoss(dto) {
        const startDate = new Date(dto.StartDate);
        const endDate = new Date(dto.EndDate);
        const comparisonStartDate = dto.ComparisonStartDate ? new Date(dto.ComparisonStartDate) : null;
        const comparisonEndDate = dto.ComparisonEndDate ? new Date(dto.ComparisonEndDate) : null;
        const calculatePeriodTotal = async (accountTypeCode, start, end) => {
            const accountType = await this.prisma.accountType.findFirst({
                where: { Code: accountTypeCode },
            });
            if (!accountType)
                return 0;
            const Accounts = await this.prisma.account.findMany({
                where: { TypeID: accountType.ID, IsActive: true },
            });
            let Total = 0;
            for (const account of Accounts) {
                const transactions = await this.prisma.journalEntryLine.findMany({
                    where: {
                        AccountID: account.ID,
                        JournalEntry: { Date: { gte: start, lte: end } },
                    },
                });
                const debitTotal = transactions
                    .filter((t) => t.DebitCredit === 'DEBIT')
                    .reduce((sum, t) => sum + Number(t.Amount), 0);
                const creditTotal = transactions
                    .filter((t) => t.DebitCredit === 'KREDIT')
                    .reduce((sum, t) => sum + Number(t.Amount), 0);
                if (accountTypeCode === 'REVENUE' || accountTypeCode === 'OTHER_INCOME') {
                    Total += creditTotal - debitTotal;
                }
                else {
                    Total += debitTotal - creditTotal;
                }
            }
            return Total;
        };
        const SalesRevenue = await calculatePeriodTotal('REVENUE', startDate, endDate);
        const otherIncome = await calculatePeriodTotal('OTHER_INCOME', startDate, endDate);
        const TotalRevenue = SalesRevenue + otherIncome;
        const cogs = await calculatePeriodTotal('COST_OF_GOODS_SOLD', startDate, endDate);
        const grossProfit = TotalRevenue - cogs;
        const operatingExpenses = await calculatePeriodTotal('EXPENSE', startDate, endDate);
        const otherExpenses = await calculatePeriodTotal('OTHER_EXPENSE', startDate, endDate);
        const TotalExpenses = operatingExpenses + otherExpenses;
        const operatingProfit = grossProfit - operatingExpenses;
        const netProfit = grossProfit - TotalExpenses + otherIncome;
        let comparisonData = null;
        if (comparisonStartDate && comparisonEndDate) {
            const compSalesRevenue = await calculatePeriodTotal('REVENUE', comparisonStartDate, comparisonEndDate);
            const compOtherIncome = await calculatePeriodTotal('OTHER_INCOME', comparisonStartDate, comparisonEndDate);
            const compTotalRevenue = compSalesRevenue + compOtherIncome;
            const compCogs = await calculatePeriodTotal('COST_OF_GOODS_SOLD', comparisonStartDate, comparisonEndDate);
            const compGrossProfit = compTotalRevenue - compCogs;
            const compOperatingExpenses = await calculatePeriodTotal('EXPENSE', comparisonStartDate, comparisonEndDate);
            const compOtherExpenses = await calculatePeriodTotal('OTHER_EXPENSE', comparisonStartDate, comparisonEndDate);
            const compTotalExpenses = compOperatingExpenses + compOtherExpenses;
            const compNetProfit = compGrossProfit - compTotalExpenses + compOtherIncome;
            comparisonData = {
                TotalRevenue: compTotalRevenue,
                cogs: compCogs,
                grossProfit: compGrossProfit,
                operatingExpenses: compOperatingExpenses,
                operatingProfit: compGrossProfit - compOperatingExpenses,
                otherIncome: compOtherIncome,
                otherExpenses: compOtherExpenses,
                netProfit: compNetProfit,
            };
        }
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            comparisonPeriod: comparisonData
                ? { startDate: dto.ComparisonStartDate, endDate: dto.ComparisonEndDate }
                : null,
            income: {
                SalesRevenue,
                otherIncome,
                TotalRevenue,
            },
            CostOfGoodsSold: {
                cogs,
            },
            grossProfit: {
                Value: grossProfit,
                margin: TotalRevenue > 0 ? (grossProfit / TotalRevenue) * 100 : 0,
            },
            expenses: {
                operating: operatingExpenses,
                other: otherExpenses,
                Total: TotalExpenses,
            },
            profit: {
                operatingProfit,
                netProfit,
                margin: TotalRevenue > 0 ? (netProfit / TotalRevenue) * 100 : 0,
            },
            comparison: comparisonData
                ? {
                    revenueChange: comparisonData.TotalRevenue > 0
                        ? ((TotalRevenue - comparisonData.TotalRevenue) / comparisonData.TotalRevenue) * 100
                        : 0,
                    profitChange: comparisonData.netProfit !== 0
                        ? ((netProfit - comparisonData.netProfit) / Math.abs(comparisonData.netProfit)) * 100
                        : 0,
                }
                : null,
        };
    }
    async getCashFlowStatement(dto) {
        const startDate = new Date(dto.StartDate);
        const endDate = new Date(dto.EndDate);
        const method = dto.Method || 'INDIRECT';
        const getAccountBalance = async (accountCode, asOfDate) => {
            const accountType = await this.prisma.accountType.findFirst({
                where: { Code: accountCode },
            });
            if (!accountType)
                return 0;
            const Accounts = await this.prisma.account.findMany({
                where: { TypeID: accountType.ID, IsActive: true },
            });
            let Total = 0;
            for (const account of Accounts) {
                const transactions = await this.prisma.journalEntryLine.findMany({
                    where: {
                        AccountID: account.ID,
                        JournalEntry: { Date: { lte: asOfDate } },
                    },
                });
                const debitTotal = transactions
                    .filter((t) => t.DebitCredit === 'DEBIT')
                    .reduce((sum, t) => sum + Number(t.Amount), 0);
                const creditTotal = transactions
                    .filter((t) => t.DebitCredit === 'KREDIT')
                    .reduce((sum, t) => sum + Number(t.Amount), 0);
                Total += debitTotal - creditTotal;
            }
            return Total;
        };
        const netIncome = await getAccountBalance('REVENUE', endDate) - await getAccountBalance('EXPENSE', endDate);
        const fixedAssetType = await this.prisma.accountType.findFirst({
            where: { Code: 'FIXED_ASSET' },
        });
        let investingActivities = 0;
        if (fixedAssetType) {
            const fixedAssetAccounts = await this.prisma.account.findMany({
                where: { TypeID: fixedAssetType.ID },
            });
            for (const account of fixedAssetAccounts) {
                const transactions = await this.prisma.journalEntryLine.findMany({
                    where: {
                        AccountID: account.ID,
                        JournalEntry: { Date: { gte: startDate, lte: endDate } },
                    },
                });
                const debitTotal = transactions
                    .filter((t) => t.DebitCredit === 'DEBIT')
                    .reduce((sum, t) => sum + Number(t.Amount), 0);
                const creditTotal = transactions
                    .filter((t) => t.DebitCredit === 'KREDIT')
                    .reduce((sum, t) => sum + Number(t.Amount), 0);
                investingActivities += creditTotal - debitTotal;
            }
        }
        const equityType = await this.prisma.accountType.findFirst({
            where: { Code: 'EQUITY' },
        });
        let financingActivities = 0;
        if (equityType) {
            const equityAccounts = await this.prisma.account.findMany({
                where: { TypeID: equityType.ID },
            });
            for (const account of equityAccounts) {
                const transactions = await this.prisma.journalEntryLine.findMany({
                    where: {
                        AccountID: account.ID,
                        JournalEntry: { Date: { gte: startDate, lte: endDate } },
                    },
                });
                const debitTotal = transactions
                    .filter((t) => t.DebitCredit === 'DEBIT')
                    .reduce((sum, t) => sum + Number(t.Amount), 0);
                const creditTotal = transactions
                    .filter((t) => t.DebitCredit === 'KREDIT')
                    .reduce((sum, t) => sum + Number(t.Amount), 0);
                financingActivities += creditTotal - debitTotal;
            }
        }
        const CashType = await this.prisma.accountType.findFirst({
            where: { Code: 'CASH' },
        });
        let beginningCash = 0;
        let endingCash = 0;
        if (CashType) {
            const CashAccounts = await this.prisma.account.findMany({
                where: { TypeID: CashType.ID },
            });
            for (const account of CashAccounts) {
                const prevTransactions = await this.prisma.journalEntryLine.findMany({
                    where: {
                        AccountID: account.ID,
                        JournalEntry: { Date: { lt: startDate } },
                    },
                });
                const prevDebit = prevTransactions.filter((t) => t.DebitCredit === 'DEBIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                const prevCredit = prevTransactions.filter((t) => t.DebitCredit === 'KREDIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                beginningCash += prevDebit - prevCredit;
                const allTransactions = await this.prisma.journalEntryLine.findMany({
                    where: {
                        AccountID: account.ID,
                        JournalEntry: { Date: { lte: endDate } },
                    },
                });
                const allDebit = allTransactions.filter((t) => t.DebitCredit === 'DEBIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                const allCredit = allTransactions.filter((t) => t.DebitCredit === 'KREDIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                endingCash += allDebit - allCredit;
            }
        }
        const netCashChange = endingCash - beginningCash;
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            method,
            operatingActivities: {
                netIncome,
                adjustments: [],
                CashFromOperations: netIncome,
            },
            investingActivities: {
                capitalExpenditures: -investingActivities,
                assetDisposals: investingActivities,
                Total: 0,
            },
            financingActivities: {
                equityChanges: financingActivities,
                debtChanges: 0,
                divIDends: 0,
                Total: financingActivities,
            },
            CashPosition: {
                beginningCash,
                netChange: netCashChange,
                endingCash,
            },
        };
    }
    async getEquityChanges(dto) {
        const startDate = new Date(dto.StartDate);
        const endDate = new Date(dto.EndDate);
        const equityType = await this.prisma.accountType.findFirst({
            where: { Code: 'EQUITY' },
        });
        if (!equityType) {
            return { error: 'Equity account Type not found' };
        }
        const equityAccounts = await this.prisma.account.findMany({
            where: { TypeID: equityType.ID, IsActive: true },
            include: { Type: true },
        });
        const changes = [];
        for (const account of equityAccounts) {
            const openingTransactions = await this.prisma.journalEntryLine.findMany({
                where: {
                    AccountID: account.ID,
                    JournalEntry: { Date: { lt: startDate } },
                },
            });
            const openingDebit = openingTransactions.filter((t) => t.DebitCredit === 'DEBIT').reduce((sum, t) => sum + Number(t.Amount), 0);
            const openingCredit = openingTransactions.filter((t) => t.DebitCredit === 'KREDIT').reduce((sum, t) => sum + Number(t.Amount), 0);
            const openingBalance = openingCredit - openingDebit;
            const periodTransactions = await this.prisma.journalEntryLine.findMany({
                where: {
                    AccountID: account.ID,
                    JournalEntry: { Date: { gte: startDate, lte: endDate } },
                },
                include: { JournalEntry: true },
            });
            const periodDebit = periodTransactions.filter((t) => t.DebitCredit === 'DEBIT').reduce((sum, t) => sum + Number(t.Amount), 0);
            const periodCredit = periodTransactions.filter((t) => t.DebitCredit === 'KREDIT').reduce((sum, t) => sum + Number(t.Amount), 0);
            changes.push({
                accountId: account.ID,
                accountCode: account.Code,
                accountName: account.Name,
                openingBalance,
                additions: periodCredit,
                deductions: periodDebit,
                closingBalance: openingBalance + periodCredit - periodDebit,
                transactions: periodTransactions.map((t) => ({
                    Date: t.JournalEntry.Date,
                    journalNumber: t.JournalEntry.JournalNumber,
                    description: t.JournalEntry.Description,
                    debit: t.DebitCredit === 'DEBIT' ? Number(t.Amount) : 0,
                    credit: t.DebitCredit === 'KREDIT' ? Number(t.Amount) : 0,
                })),
            });
        }
        const Totals = {
            TotalOpening: changes.reduce((sum, c) => sum + c.openingBalance, 0),
            TotalAdditions: changes.reduce((sum, c) => sum + c.additions, 0),
            TotalDeductions: changes.reduce((sum, c) => sum + c.deductions, 0),
            TotalClosing: changes.reduce((sum, c) => sum + c.closingBalance, 0),
        };
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            changes,
            Totals,
        };
    }
    async getCostOfGoodsSold(dto) {
        const startDate = new Date(dto.StartDate);
        const endDate = new Date(dto.EndDate);
        const cogsType = await this.prisma.accountType.findFirst({
            where: { Code: 'COST_OF_GOODS_SOLD' },
        });
        const inventoryType = await this.prisma.accountType.findFirst({
            where: { Code: 'INVENTORY' },
        });
        let beginningInventory = 0;
        if (inventoryType) {
            const invAccounts = await this.prisma.account.findMany({
                where: { TypeID: inventoryType.ID, IsActive: true },
            });
            for (const account of invAccounts) {
                const transactions = await this.prisma.journalEntryLine.findMany({
                    where: {
                        AccountID: account.ID,
                        JournalEntry: { Date: { lt: startDate } },
                    },
                });
                const debit = transactions.filter((t) => t.DebitCredit === 'DEBIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                const credit = transactions.filter((t) => t.DebitCredit === 'KREDIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                beginningInventory += debit - credit;
            }
        }
        const PurchaseType = await this.prisma.accountType.findFirst({
            where: { Code: 'PURCHASE' },
        });
        let Purchases = 0;
        if (PurchaseType) {
            const PurchaseAccounts = await this.prisma.account.findMany({
                where: { TypeID: PurchaseType.ID, IsActive: true },
            });
            for (const account of PurchaseAccounts) {
                const transactions = await this.prisma.journalEntryLine.findMany({
                    where: {
                        AccountID: account.ID,
                        JournalEntry: { Date: { gte: startDate, lte: endDate } },
                    },
                });
                const debit = transactions.filter((t) => t.DebitCredit === 'DEBIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                Purchases += debit;
            }
        }
        let endingInventory = 0;
        if (inventoryType) {
            const invAccounts = await this.prisma.account.findMany({
                where: { TypeID: inventoryType.ID, IsActive: true },
            });
            for (const account of invAccounts) {
                const transactions = await this.prisma.journalEntryLine.findMany({
                    where: {
                        AccountID: account.ID,
                        JournalEntry: { Date: { lte: endDate } },
                    },
                });
                const debit = transactions.filter((t) => t.DebitCredit === 'DEBIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                const credit = transactions.filter((t) => t.DebitCredit === 'KREDIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                endingInventory += debit - credit;
            }
        }
        const cogs = beginningInventory + Purchases - endingInventory;
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            CostOfGoodsSold: {
                beginningInventory,
                Purchases,
                goodsAvailable: beginningInventory + Purchases,
                endingInventory,
                cogs,
            },
        };
    }
    async calculateDepreciation(dto) {
        const asOfDate = dto.AsOfDate ? new Date(dto.AsOfDate) : new Date();
        const fixedAssetType = await this.prisma.accountType.findFirst({
            where: { Code: 'FIXED_ASSET' },
        });
        if (!fixedAssetType) {
            return { error: 'Fixed asset account Type not found' };
        }
        const assets = await this.prisma.account.findMany({
            where: {
                TypeID: fixedAssetType.ID,
                IsActive: true,
                ...(dto.AssetId ? { ID: dto.AssetId } : {}),
            },
            include: { Type: true, Extension: true },
        });
        const depreciationResults = [];
        for (const asset of assets) {
            const transactions = await this.prisma.journalEntryLine.findMany({
                where: {
                    AccountID: asset.ID,
                    JournalEntry: { Date: { lte: asOfDate } },
                },
                orderBy: { JournalEntry: { Date: 'asc' } },
            });
            const TotalDebit = transactions.filter((t) => t.DebitCredit === 'DEBIT').reduce((sum, t) => sum + Number(t.Amount), 0);
            const TotalCredit = transactions.filter((t) => t.DebitCredit === 'KREDIT').reduce((sum, t) => sum + Number(t.Amount), 0);
            const currentValue = TotalDebit - TotalCredit;
            const extension = asset.Extension;
            const usefulLifeMonths = extension?.UsefulLife || 12;
            const salvageValue = Number(extension?.SalvageValue || 0);
            const depreciableAmount = currentValue - salvageValue;
            const monthlyDepreciation = depreciableAmount / usefulLifeMonths;
            const accumulatedDepreciationType = await this.prisma.accountType.findFirst({
                where: { Code: 'ACCUMULATED_DEPRECIATION' },
            });
            let accumulatedDepreciation = 0;
            if (accumulatedDepreciationType) {
                const accDepAccounts = await this.prisma.account.findMany({
                    where: { TypeID: accumulatedDepreciationType.ID, ParentID: asset.ID },
                });
                for (const accDepAccount of accDepAccounts) {
                    const accDepTransactions = await this.prisma.journalEntryLine.findMany({
                        where: {
                            AccountID: accDepAccount.ID,
                            JournalEntry: { Date: { lte: asOfDate } },
                        },
                    });
                    const accDebit = accDepTransactions.filter((t) => t.DebitCredit === 'DEBIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                    const accCredit = accDepTransactions.filter((t) => t.DebitCredit === 'KREDIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                    accumulatedDepreciation += accCredit - accDebit;
                }
            }
            const bookValue = currentValue - accumulatedDepreciation;
            depreciationResults.push({
                assetId: asset.ID,
                assetCode: asset.Code,
                assetName: asset.Name,
                acquisitionCost: currentValue,
                usefulLifeMonths,
                salvageValue,
                monthlyDepreciation: Math.round(monthlyDepreciation * 100) / 100,
                accumulatedDepreciation: Math.round(accumulatedDepreciation * 100) / 100,
                bookValue: Math.round(bookValue * 100) / 100,
                depreciationMethod: extension?.DepreciationMethod || 'STRAIGHT_LINE',
            });
        }
        return {
            asOfDate: dto.AsOfDate || new Date().toISOString(),
            assets: depreciationResults,
            Summary: {
                TotalAssets: depreciationResults.length,
                TotalAcquisitionCost: depreciationResults.reduce((sum, a) => sum + a.acquisitionCost, 0),
                TotalAccumulatedDepreciation: depreciationResults.reduce((sum, a) => sum + a.accumulatedDepreciation, 0),
                TotalBookValue: depreciationResults.reduce((sum, a) => sum + a.bookValue, 0),
            },
        };
    }
    async createClosingEntries(dto, UserId) {
        const periodEndDate = new Date(dto.PeriodEndDate);
        const periodStartDate = new Date(periodEndDate.getFullYear(), periodEndDate.getMonth(), 1);
        const existingClosing = await this.prisma.closingEntry.findFirst({
            where: { PeriodEndDate: periodEndDate },
        });
        if (existingClosing) {
            throw new common_1.BadRequestException('Period already closed');
        }
        const incomeType = await this.prisma.accountType.findFirst({ where: { Code: 'REVENUE' } });
        const expenseType = await this.prisma.accountType.findFirst({ where: { Code: 'EXPENSE' } });
        const incomeSummaryType = await this.prisma.accountType.findFirst({ where: { Code: 'INCOME_SUMMARY' } });
        if (!incomeType || !expenseType || !incomeSummaryType) {
            throw new common_1.BadRequestException('Required account Types not found');
        }
        const incomeAccounts = await this.prisma.account.findMany({
            where: { TypeID: incomeType.ID, IsActive: true },
        });
        const expenseAccounts = await this.prisma.account.findMany({
            where: { TypeID: expenseType.ID, IsActive: true },
        });
        const incomeSummaryAccounts = await this.prisma.account.findMany({
            where: { TypeID: incomeSummaryType.ID, IsActive: true },
        });
        const closingEntry = await this.prisma.$transaction(async (tx) => {
            let TotalIncome = 0;
            let TotalExpense = 0;
            const JournalLines = [];
            for (const account of incomeAccounts) {
                const transactions = await tx.journalEntryLine.findMany({
                    where: {
                        AccountID: account.ID,
                        JournalEntry: { Date: { gte: periodStartDate, lte: periodEndDate } },
                    },
                });
                const debit = transactions.filter((t) => t.DebitCredit === 'DEBIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                const credit = transactions.filter((t) => t.DebitCredit === 'KREDIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                const Balance = credit - debit;
                if (Balance !== 0) {
                    TotalIncome += Balance;
                    JournalLines.push({
                        AccountID: account.ID,
                        DebitCredit: 'DEBIT',
                        Amount: new client_1.Prisma.Decimal(Math.abs(Balance)),
                    });
                }
            }
            for (const account of expenseAccounts) {
                const transactions = await tx.journalEntryLine.findMany({
                    where: {
                        AccountID: account.ID,
                        JournalEntry: { Date: { gte: periodStartDate, lte: periodEndDate } },
                    },
                });
                const debit = transactions.filter((t) => t.DebitCredit === 'DEBIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                const credit = transactions.filter((t) => t.DebitCredit === 'KREDIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                const Balance = debit - credit;
                if (Balance !== 0) {
                    TotalExpense += Balance;
                    JournalLines.push({
                        AccountID: account.ID,
                        DebitCredit: 'KREDIT',
                        Amount: new client_1.Prisma.Decimal(Math.abs(Balance)),
                    });
                }
            }
            const incomeSummaryAccount = incomeSummaryAccounts[0];
            if (!incomeSummaryAccount) {
                throw new common_1.BadRequestException('Income Summary account not configured');
            }
            const netIncome = TotalIncome - TotalExpense;
            JournalLines.push({
                AccountID: incomeSummaryAccount.ID,
                DebitCredit: netIncome >= 0 ? 'KREDIT' : 'DEBIT',
                Amount: new client_1.Prisma.Decimal(Math.abs(netIncome)),
            });
            if (netIncome >= 0) {
                JournalLines.push({
                    AccountID: incomeSummaryAccount.ID,
                    DebitCredit: 'DEBIT',
                    Amount: new client_1.Prisma.Decimal(Math.abs(netIncome)),
                });
            }
            else {
                JournalLines.push({
                    AccountID: incomeSummaryAccount.ID,
                    DebitCredit: 'KREDIT',
                    Amount: new client_1.Prisma.Decimal(Math.abs(netIncome)),
                });
            }
            const closingJE = await tx.journalEntry.create({
                data: {
                    JournalNumber: await this.generateJournalNumber(),
                    Date: periodEndDate,
                    Reference: `CLOSING-${periodEndDate.toISOString().split('T')[0]}`,
                    Description: `Closing entries for period ending ${periodEndDate.toISOString().split('T')[0]}`,
                    TotalDebit: new client_1.Prisma.Decimal(Math.abs(netIncome)),
                    TotalCredit: new client_1.Prisma.Decimal(Math.abs(netIncome)),
                    CreatedByID: UserId,
                },
            });
            await tx.journalEntryLine.createMany({
                data: JournalLines.map((Line, index) => ({
                    ...Line,
                    JournalEntryID: closingJE.ID,
                    LineNumber: index + 1,
                    Description: `Closing entry`,
                })),
            });
            const Record = await tx.closingEntry.create({
                data: {
                    PeriodEndDate: periodEndDate,
                    JournalEntryID: closingJE.ID,
                    TotalIncome: new client_1.Prisma.Decimal(TotalIncome),
                    TotalExpense: new client_1.Prisma.Decimal(TotalExpense),
                    NetIncome: new client_1.Prisma.Decimal(netIncome),
                    CreatedByID: UserId,
                },
            });
            return Record;
        });
        return {
            success: true,
            closingEntry: {
                ID: closingEntry.ID,
                periodEndDate: closingEntry.PeriodEndDate,
                totalIncome: Number(closingEntry.TotalIncome),
                totalExpense: Number(closingEntry.TotalExpense),
                netIncome: Number(closingEntry.NetIncome),
            },
        };
    }
    async createOpeningEntries(dto, UserId) {
        const periodStartDate = new Date(dto.PeriodStartDate);
        const prevYearEnd = new Date(periodStartDate);
        prevYearEnd.setDate(prevYearEnd.getDate() - 1);
        const BalanceSheetTypes = await this.prisma.accountType.findMany({
            where: {
                Code: { in: ['ASSET', 'LIABILITY', 'EQUITY'] },
            },
        });
        const openingEntries = [];
        for (const Type of BalanceSheetTypes) {
            const Accounts = await this.prisma.account.findMany({
                where: { TypeID: Type.ID, IsActive: true },
            });
            for (const account of Accounts) {
                const transactions = await this.prisma.journalEntryLine.findMany({
                    where: {
                        AccountID: account.ID,
                        JournalEntry: { Date: { lte: prevYearEnd } },
                    },
                });
                const debit = transactions.filter((t) => t.DebitCredit === 'DEBIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                const credit = transactions.filter((t) => t.DebitCredit === 'KREDIT').reduce((sum, t) => sum + Number(t.Amount), 0);
                const Balance = debit - credit;
                if (Balance !== 0) {
                    const isDebitNormal = ['ASSET'].includes(Type.Code?.toUpperCase() || '');
                    openingEntries.push({
                        accountId: account.ID,
                        accountCode: account.Code,
                        accountName: account.Name,
                        openingBalance: Balance,
                        debitCredit: isDebitNormal ? (Balance >= 0 ? 'DEBIT' : 'KREDIT') : (Balance >= 0 ? 'KREDIT' : 'DEBIT'),
                        Amount: Math.abs(Balance),
                    });
                }
            }
        }
        return {
            periodStartDate: dto.PeriodStartDate,
            previousYearEnd: prevYearEnd.toISOString().split('T')[0],
            openingEntries,
            TotalDebit: openingEntries.filter((e) => e.debitCredit === 'DEBIT').reduce((sum, e) => sum + e.Amount, 0),
            TotalCredit: openingEntries.filter((e) => e.debitCredit === 'KREDIT').reduce((sum, e) => sum + e.Amount, 0),
        };
    }
    formatAccount(account) {
        const ext = account.Extension;
        return {
            ID: account.ID,
            Code: account.Code,
            Name: account.Name,
            accountTypeId: account.TypeID,
            accountType: account.Type?.Name,
            accountTypeCode: account.Type?.Code,
            parentId: account.ParentID,
            parentName: account.Parent?.Name,
            IsActive: account.IsActive,
            taxRate: ext?.TaxRate ? Number(ext.TaxRate) : null,
            depreciationMethod: ext?.DepreciationMethod,
            usefulLife: ext?.UsefulLife,
            salvageValue: ext?.SalvageValue ? Number(ext.SalvageValue) : null,
            children: account.Children,
        };
    }
    async generateAccountCode(accountTypeId) {
        const accountType = await this.prisma.accountType.findUnique({
            where: { ID: accountTypeId },
        });
        if (!accountType) {
            throw new common_1.NotFoundException('Account Type not found');
        }
        const prefix = accountType.Code?.substring(0, 2) || '00';
        const lastAccount = await this.prisma.account.findFirst({
            where: { TypeID: accountTypeId },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastAccount) {
            const lastSeq = parseInt(lastAccount.Code.substring(2) || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}${String(nextNumber).padStart(4, '0')}`;
    }
    async generateJournalNumber() {
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
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountingService);
