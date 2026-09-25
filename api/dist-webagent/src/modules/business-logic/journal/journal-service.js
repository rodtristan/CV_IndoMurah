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
exports.JournalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let JournalService = class JournalService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const TotalDebit = dto.Items.reduce((sum, item) => sum + item.Debit, 0);
        const TotalCredit = dto.Items.reduce((sum, item) => sum + item.Credit, 0);
        if (Math.abs(TotalDebit - TotalCredit) > 0.01) {
            throw new common_1.BadRequestException('Total debit must equal Total credit');
        }
        const JournalNumber = await this.generateJournalNumber();
        await this.prisma.$transaction(async (tx) => {
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
                    TotalDebit: new client_1.Prisma.Decimal(TotalDebit),
                    TotalCredit: new client_1.Prisma.Decimal(TotalCredit),
                    Lines: {
                        create: dto.Items.map((item, index) => ({
                            AccountID: item.AccountId,
                            Debit: new client_1.Prisma.Decimal(item.Debit || 0),
                            Credit: new client_1.Prisma.Decimal(item.Credit || 0),
                            Description: item.Description,
                            LineNumber: index + 1,
                        })),
                    },
                },
            });
            for (const item of dto.Items) {
                if (item.Debit > 0) {
                    await tx.account.update({
                        where: { ID: item.AccountId },
                        data: { Balance: { increment: new client_1.Prisma.Decimal(item.Debit) } },
                    }).catch(() => { });
                }
                if (item.Credit > 0) {
                    await tx.account.update({
                        where: { ID: item.AccountId },
                        data: { Balance: { decrement: new client_1.Prisma.Decimal(item.Credit) } },
                    }).catch(() => { });
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
    async findAll(query) {
        const { Search, Page = 1, Limit = 20, Type, ReferenceType, AccountId, StartDate, EndDate } = query;
        const where = {};
        if (Search) {
            where.OR = [
                { JournalNumber: { contains: Search, mode: 'insensitive' } },
                { Description: { contains: Search, mode: 'insensitive' } },
                { ReferenceNumber: { contains: Search, mode: 'insensitive' } },
            ];
        }
        if (Type)
            where.Type = Type;
        if (ReferenceType)
            where.ReferenceType = ReferenceType;
        if (AccountId) {
            where.Lines = { some: { AccountID: AccountId } };
        }
        if (StartDate || EndDate) {
            where.Date = {};
            if (StartDate)
                where.Date.gte = new Date(StartDate);
            if (EndDate)
                where.Date.lte = new Date(EndDate);
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
    async findById(ID) {
        const entry = await this.prisma.journalEntry.findUnique({
            where: { ID },
            include: {
                Lines: { include: { Account: true } },
            },
        });
        if (!entry) {
            throw new common_1.NotFoundException('Journal entry not found');
        }
        return entry;
    }
    async update(ID, dto) {
        const existing = await this.findById(ID);
        if (existing.Status === 'POSTED') {
            throw new common_1.BadRequestException('Cannot update posted journal entry');
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
    async post(ID) {
        const entry = await this.findById(ID);
        if (entry.Status === 'POSTED') {
            throw new common_1.BadRequestException('Journal entry already posted');
        }
        return this.prisma.journalEntry.update({
            where: { ID },
            data: { Status: 'POSTED' },
            include: { Lines: { include: { Account: true } } },
        });
    }
    async unpost(ID) {
        const entry = await this.findById(ID);
        if (entry.Status !== 'POSTED') {
            throw new common_1.BadRequestException('Journal entry is not posted');
        }
        return this.prisma.journalEntry.update({
            where: { ID },
            data: { Status: 'DRAFT' },
            include: { Lines: { include: { Account: true } } },
        });
    }
    async cancel(ID, dto) {
        const entry = await this.findById(ID);
        if (entry.Status === 'CANCELLED') {
            throw new common_1.ConflictException('Journal entry already cancelled');
        }
        return this.prisma.journalEntry.update({
            where: { ID },
            data: { Status: 'CANCELLED', Notes: `${entry.Notes || ''}\nCancellation: ${dto.Reason}` },
            include: { Lines: { include: { Account: true } } },
        });
    }
    async getAccountBalance(dto) {
        const account = await this.prisma.account.findUnique({
            where: { ID: dto.AccountId },
            include: { Type: true },
        });
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
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
                Debit: (0, number_1.number)(e.Debit),
                Credit: (0, number_1.number)(e.Credit),
            })),
        };
    }
    async getTrialBalance(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : new Date(new Date().getFullYear(), 0, 1);
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        const Accounts = await this.prisma.account.findMany({
            where: { IsActive: true },
            include: { Type: true },
            orderBy: { Code: 'asc' },
        });
        const items = [];
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
    async generateJournalNumber() {
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
};
exports.JournalService = JournalService;
exports.JournalService = JournalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JournalService);
