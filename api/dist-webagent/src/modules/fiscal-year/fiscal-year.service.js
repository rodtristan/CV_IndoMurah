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
exports.FiscalYearService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const PL_TYPES = ['REVENUE', 'EXPENSE', 'COST'];
const r2 = (n) => Math.round(n * 100) / 100;
let FiscalYearService = class FiscalYearService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    range(year) {
        return { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) };
    }
    async plLines(year) {
        const r = this.range(year);
        return this.prisma.journalEntryLine.findMany({
            where: {
                Account: { Type: { Code: { in: PL_TYPES } } },
                JournalEntry: {
                    Journal: {
                        IsPosted: true,
                        Date: { gte: r.gte, lt: r.lt },
                        OR: [{ ReferenceType: null }, { ReferenceType: { notIn: ['YEAR_CLOSE', 'OPENING_BALANCE'] } }],
                    },
                },
            },
            select: { AccountID: true, Debit: true, Credit: true, Account: { select: { Type: { select: { Code: true } } } } },
        });
    }
    async plBalances(year) {
        const lines = await this.plLines(year);
        const map = new Map();
        for (const l of lines)
            map.set(l.AccountID, (map.get(l.AccountID) ?? 0) + Number(l.Debit) - Number(l.Credit));
        return [...map.entries()].map(([accountId, bal]) => ({ accountId, bal: r2(bal) })).filter((b) => b.bal !== 0);
    }
    async plSummary(year) {
        const lines = await this.plLines(year);
        let revenue = 0, expenses = 0;
        for (const l of lines) {
            const d = Number(l.Debit) - Number(l.Credit);
            if (l.Account.Type.Code === 'REVENUE')
                revenue -= d;
            else
                expenses += d;
        }
        return { totalRevenue: r2(revenue), totalExpenses: r2(expenses), netIncome: r2(revenue - expenses) };
    }
    async status() {
        const now = new Date().getFullYear();
        const first = await this.prisma.journal.findFirst({ orderBy: { Date: 'asc' }, select: { Date: true } });
        const start = Math.min(first ? first.Date.getUTCFullYear() : now, now - 1);
        const closes = await this.prisma.fiscalYearClose.findMany();
        const byYear = new Map(closes.map((c) => [c.Year, c]));
        const out = [];
        for (let y = now; y >= start; y--) {
            const c = byYear.get(y);
            const sum = await this.plSummary(y);
            out.push({
                year: y,
                startDate: new Date(Date.UTC(y, 0, 1)).toISOString(),
                endDate: new Date(Date.UTC(y, 11, 31)).toISOString(),
                finished: y < now,
                closed: !!c,
                closedAt: c?.ClosedAt ?? null,
                journalCode: c?.JournalCode ?? null,
                totalRevenue: sum.totalRevenue,
                totalExpenses: sum.totalExpenses,
                netIncome: c ? Number(c.NetIncome) : sum.netIncome,
            });
        }
        const setting = await this.prisma.accountSetting.findUnique({ where: { Key: 'retained' } });
        return { currentYear: now, retainedAccountID: setting?.AccountID ?? null, years: out };
    }
    async close(year, userId) {
        year = Number(year);
        if (!Number.isInteger(year))
            throw new common_1.BadRequestException('Tahun tidak valid');
        if (year >= new Date().getFullYear())
            throw new common_1.BadRequestException(`Tahun ${year} belum berakhir, tidak dapat ditutup`);
        if (await this.prisma.fiscalYearClose.findUnique({ where: { Year: year } })) {
            throw new common_1.BadRequestException(`Tahun ${year} sudah pernah ditutup`);
        }
        const setting = await this.prisma.accountSetting.findUnique({ where: { Key: 'retained' } });
        if (!setting?.AccountID)
            throw new common_1.BadRequestException('Setting Perkiraan "Laba Ditahan" belum diisi');
        const later = await this.prisma.fiscalYearClose.findFirst({ where: { Year: { gt: year } } });
        if (later)
            throw new common_1.BadRequestException(`Tahun ${later.Year} sudah ditutup; tahun sebelumnya tidak dapat ditutup lagi`);
        const bals = await this.plBalances(year);
        const net = r2(-bals.reduce((s, b) => s + b.bal, 0));
        const date = new Date(Date.UTC(year, 11, 31));
        const code = `YC-${year}`;
        const desc = `Jurnal Penutup Tahun ${year}`;
        const lines = bals.map((b) => ({
            accountId: b.accountId,
            debit: b.bal < 0 ? -b.bal : 0,
            credit: b.bal > 0 ? b.bal : 0,
        }));
        if (net !== 0)
            lines.push({ accountId: setting.AccountID, debit: net < 0 ? -net : 0, credit: net > 0 ? net : 0 });
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
                                TotalDebit: new client_1.Prisma.Decimal(totalDebit), TotalCredit: new client_1.Prisma.Decimal(totalCredit),
                                Status: 'POSTED', CreatedByID: userId,
                                Lines: {
                                    create: lines.map((l, i) => ({
                                        AccountID: l.accountId, Debit: new client_1.Prisma.Decimal(l.debit), Credit: new client_1.Prisma.Decimal(l.credit),
                                        Description: desc, LineNumber: i + 1, CreatedByID: userId,
                                    })),
                                },
                            },
                        },
                    },
                });
            }
            await tx.fiscalYearClose.create({
                data: { Year: year, ClosedByID: userId, JournalCode: lines.length ? code : null, NetIncome: new client_1.Prisma.Decimal(net) },
            });
        });
        return { year, netIncome: net, journalCode: lines.length ? code : null };
    }
};
exports.FiscalYearService = FiscalYearService;
exports.FiscalYearService = FiscalYearService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FiscalYearService);
