"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashDocHelper = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const auto_journal_service_1 = require("./auto-journal.service");
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const stamp = () => new Date().toISOString().replace(/\D/g, '').slice(0, 14);
class CashDocHelper {
    constructor(prisma, journal, kind) {
        this.prisma = prisma;
        this.journal = journal;
        this.kind = kind;
    }
    get model() { return this.kind === 'in' ? this.prisma.cashIn : this.prisma.cashOut; }
    tm(tx) { return this.kind === 'in' ? tx.cashIn : tx.cashOut; }
    get ref() { return this.kind === 'in' ? auto_journal_service_1.REF.CASH_IN : auto_journal_service_1.REF.CASH_OUT; }
    get label() { return this.kind === 'in' ? 'Kas Masuk' : 'Kas Keluar'; }
    async checkAccounts(ids) {
        const uniq = [...new Set(ids)];
        const found = await this.prisma.account.count({ where: { ID: { in: uniq } } });
        if (found !== uniq.length)
            throw new common_1.BadRequestException('Ada perkiraan yang tidak ditemukan');
    }
    async lines(id) {
        const doc = await this.model.findUnique({ where: { ID: id } });
        if (!doc)
            throw new common_1.NotFoundException(`${this.label} tidak ditemukan`);
        const ls = await this.journal.linesOf(this.prisma, this.ref, id);
        let cashTaken = false;
        const out = [];
        for (const l of ls) {
            const isCashSide = this.kind === 'in' ? Number(l.Debit) > 0 : Number(l.Credit) > 0;
            if (isCashSide && !cashTaken && l.AccountID === doc.AccountID) {
                cashTaken = true;
                continue;
            }
            out.push({ accountId: l.AccountID, code: l.Account.Code, name: l.Account.Name, amount: Number(l.Debit) + Number(l.Credit), description: l.Description });
        }
        return out;
    }
    async post(tx, doc, lines, userId) {
        const jl = [];
        const desc = `${this.label} ${doc.Code}${doc.Description ? ` - ${doc.Description}` : ''}`;
        if (this.kind === 'in') {
            jl.push({ accountId: doc.AccountID, debit: Number(doc.Amount), memo: desc });
            for (const l of lines)
                jl.push({ accountId: l.accountId, credit: l.amount, memo: l.description || desc });
        }
        else {
            for (const l of lines)
                jl.push({ accountId: l.accountId, debit: l.amount, memo: l.description || desc });
            jl.push({ accountId: doc.AccountID, credit: Number(doc.Amount), memo: desc });
        }
        await this.journal.post(tx, { referenceType: this.ref, referenceId: doc.ID, date: doc.Date, description: desc, lines: jl, userId, referenceNumber: doc.Code });
    }
    async normalizeLines(tx, amount, lines, fallback) {
        let ls = lines?.filter((l) => l && (l.amount || l.accountId)) ?? null;
        if (!ls || !ls.length) {
            if (fallback && fallback.length) {
                if (Math.round(fallback.reduce((s, l) => s + l.amount, 0) * 100) === Math.round(amount * 100))
                    return fallback;
                if (fallback.length === 1)
                    return [{ ...fallback[0], amount }];
                throw new common_1.BadRequestException('Jumlah berubah: kirim ulang rincian akun (lines) yang totalnya sama dengan Jumlah Kas');
            }
            const key = this.kind === 'in' ? 'otherIncome' : 'otherExpense';
            const a = await this.journal.accounts(tx, [key]);
            return [{ accountId: a[key], amount }];
        }
        if (ls.some((l) => !Number.isInteger(l.accountId) || !(Number(l.amount) > 0)))
            throw new common_1.BadRequestException('Setiap rincian wajib punya Kode Akun dan jumlah > 0');
        ls = ls.map((l) => ({ ...l, amount: r2(l.amount) }));
        const total = r2(ls.reduce((s, l) => s + l.amount, 0));
        if (Math.round(total * 100) !== Math.round(amount * 100))
            throw new common_1.BadRequestException(`Total rincian (${total}) harus sama dengan Jumlah Kas (${amount})`);
        return ls;
    }
    async create(dto, userId) {
        if (!dto.accountId)
            throw new common_1.BadRequestException('Akun kas wajib dipilih');
        const amount = r2(Number(dto.amount));
        if (!(amount > 0))
            throw new common_1.BadRequestException('Jumlah harus lebih dari 0');
        await this.checkAccounts([dto.accountId, ...(dto.lines ?? []).map((l) => l.accountId)]);
        const date = dto.date ? new Date(dto.date) : new Date();
        if (isNaN(date.getTime()))
            throw new common_1.BadRequestException('Tanggal tidak valid');
        return this.prisma.$transaction(async (tx) => {
            const lines = await this.normalizeLines(tx, amount, dto.lines, null);
            const doc = await this.tm(tx).create({
                data: {
                    Code: dto.code || `${this.kind === 'in' ? 'KM' : 'KK'}-${stamp()}`,
                    Date: date, AccountID: dto.accountId, Amount: new client_1.Prisma.Decimal(amount.toFixed(2)),
                    Description: dto.description ?? null, ReferenceType: dto.referenceType ?? null, ReferenceID: dto.referenceId ?? null,
                    CreatedByID: userId,
                },
            });
            await this.post(tx, doc, lines, userId);
            return doc;
        });
    }
    async update(id, dto, userId) {
        const existing = await this.model.findUnique({ where: { ID: id } });
        if (!existing)
            throw new common_1.NotFoundException(`${this.label} tidak ditemukan`);
        const amount = dto.amount !== undefined ? r2(Number(dto.amount)) : Number(existing.Amount);
        if (!(amount > 0))
            throw new common_1.BadRequestException('Jumlah harus lebih dari 0');
        const accountId = dto.accountId ?? existing.AccountID;
        await this.checkAccounts([accountId, ...(dto.lines ?? []).map((l) => l.accountId)]);
        const date = dto.date ? new Date(dto.date) : existing.Date;
        if (isNaN(date.getTime()))
            throw new common_1.BadRequestException('Tanggal tidak valid');
        const prevLines = (await this.lines(id)).map((l) => ({ accountId: l.accountId, amount: l.amount, description: l.description ?? undefined }));
        return this.prisma.$transaction(async (tx) => {
            const lines = await this.normalizeLines(tx, amount, dto.lines, prevLines);
            const doc = await this.tm(tx).update({
                where: { ID: id },
                data: {
                    ...(dto.code ? { Code: dto.code } : {}),
                    Date: date, AccountID: accountId, Amount: new client_1.Prisma.Decimal(amount.toFixed(2)),
                    ...(dto.description !== undefined ? { Description: dto.description } : {}),
                    ...(dto.referenceType !== undefined ? { ReferenceType: dto.referenceType } : {}),
                    ...(dto.referenceId !== undefined ? { ReferenceID: dto.referenceId } : {}),
                },
            });
            await this.post(tx, doc, lines, userId);
            return doc;
        });
    }
    async remove(id) {
        const existing = await this.model.findUnique({ where: { ID: id } });
        if (!existing)
            throw new common_1.NotFoundException(`${this.label} tidak ditemukan`);
        return this.prisma.$transaction(async (tx) => {
            await this.journal.reverse(tx, this.ref, id);
            return this.tm(tx).delete({ where: { ID: id } });
        });
    }
}
exports.CashDocHelper = CashDocHelper;
