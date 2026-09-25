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
exports.OpeningBalanceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const cents = (n) => Math.round(n * 100);
let OpeningBalanceService = class OpeningBalanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    assertType(t) {
        const u = String(t).toUpperCase();
        if (u !== 'ACCOUNT' && u !== 'DEBT' && u !== 'RECEIVABLE')
            throw new common_1.BadRequestException('Tipe saldo awal tidak valid');
        return u;
    }
    async list(type) {
        const t = this.assertType(type);
        return this.prisma.openingBalance.findMany({
            where: { Type: t },
            include: { Account: true, Supplier: true, Customer: true },
            orderBy: { ID: 'asc' },
        });
    }
    async saveAll(type, dto, userId) {
        const t = this.assertType(type);
        const rows = dto?.rows ?? [];
        const date = dto?.date ? new Date(dto.date) : new Date();
        if (isNaN(date.getTime()))
            throw new common_1.BadRequestException('Tanggal tidak valid');
        if (t === 'ACCOUNT')
            return this.saveAccounts(rows, date, userId);
        const data = [];
        for (const r of rows) {
            const amount = Number(r.amount ?? (t === 'DEBT' ? r.credit : r.debit) ?? 0);
            if (!amount)
                continue;
            if (amount < 0)
                throw new common_1.BadRequestException('Nominal tidak boleh negatif');
            if (t === 'DEBT' && !r.supplierId)
                throw new common_1.BadRequestException('Saldo awal hutang wajib memilih Supplier');
            if (t === 'RECEIVABLE' && !r.customerId)
                throw new common_1.BadRequestException('Saldo awal piutang wajib memilih Pelanggan');
            data.push({
                Type: t, Date: date,
                SupplierID: t === 'DEBT' ? Number(r.supplierId) : null,
                CustomerID: t === 'RECEIVABLE' ? Number(r.customerId) : null,
                Debit: new client_1.Prisma.Decimal(t === 'RECEIVABLE' ? amount : 0),
                Credit: new client_1.Prisma.Decimal(t === 'DEBT' ? amount : 0),
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
    async saveAccounts(rows, date, userId) {
        const lines = rows
            .map((r) => ({ accountId: Number(r.accountId), debit: Number(r.debit || 0), credit: Number(r.credit || 0) }))
            .filter((r) => r.debit || r.credit);
        if (lines.some((l) => !Number.isInteger(l.accountId)))
            throw new common_1.BadRequestException('Perkiraan wajib diisi');
        if (lines.some((l) => l.debit < 0 || l.credit < 0))
            throw new common_1.BadRequestException('Nominal tidak boleh negatif');
        if (new Set(lines.map((l) => l.accountId)).size !== lines.length)
            throw new common_1.BadRequestException('Perkiraan duplikat');
        const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
        const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
        if (cents(totalDebit) !== cents(totalCredit)) {
            throw new common_1.BadRequestException(`Saldo awal tidak balance: total debit ${totalDebit} tidak sama dengan total kredit ${totalCredit}`);
        }
        if (lines.length) {
            const found = await this.prisma.account.count({ where: { ID: { in: lines.map((l) => l.accountId) } } });
            if (found !== lines.length)
                throw new common_1.BadRequestException('Ada perkiraan yang tidak ditemukan');
        }
        await this.prisma.$transaction(async (tx) => {
            const old = await tx.journal.findMany({ where: { ReferenceType: 'OPENING_BALANCE' }, select: { ID: true } });
            if (old.length) {
                const ids = old.map((o) => o.ID);
                await tx.journalEntry.deleteMany({ where: { JournalID: { in: ids } } });
                await tx.journal.deleteMany({ where: { ID: { in: ids } } });
            }
            await tx.openingBalance.deleteMany({ where: { Type: 'ACCOUNT' } });
            if (!lines.length)
                return;
            await tx.openingBalance.createMany({
                data: lines.map((l) => ({
                    Type: 'ACCOUNT', Date: date, AccountID: l.accountId,
                    Debit: new client_1.Prisma.Decimal(l.debit), Credit: new client_1.Prisma.Decimal(l.credit), CreatedByID: userId,
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
        });
        return this.list('ACCOUNT');
    }
};
exports.OpeningBalanceService = OpeningBalanceService;
exports.OpeningBalanceService = OpeningBalanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OpeningBalanceService);
