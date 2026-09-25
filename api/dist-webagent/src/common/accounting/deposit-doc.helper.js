"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositDocHelper = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const auto_journal_service_1 = require("./auto-journal.service");
const deposit_ledger_service_1 = require("./deposit-ledger.service");
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const dec = (n) => new client_1.Prisma.Decimal(r2(n).toFixed(2));
const stamp = () => new Date().toISOString().replace(/\D/g, '').slice(0, 14);
class DepositDocHelper {
    constructor(prisma, journal, ledger, party) {
        this.prisma = prisma;
        this.journal = journal;
        this.ledger = ledger;
        this.party = party;
    }
    get isCustomer() { return this.party === 'customer'; }
    get ref() { return this.isCustomer ? auto_journal_service_1.REF.CUSTOMER_DEPOSIT : auto_journal_service_1.REF.SUPPLIER_DEPOSIT; }
    get depKey() { return this.isCustomer ? 'custDeposit' : 'suppDeposit'; }
    get label() { return this.isCustomer ? 'Deposit Pelanggan' : 'Deposit Supplier'; }
    model(tx) { return this.isCustomer ? tx.customerDeposit : tx.supplierDeposit; }
    partyId(row) { return this.isCustomer ? row.CustomerID : row.SupplierID; }
    prefix(kind) {
        if (this.isCustomer)
            return kind === 'OUT' ? 'DPOUT' : 'DPIN';
        return kind === 'OUT' ? 'DBOUT' : 'DBIN';
    }
    cashIsDebit(kind) { return this.isCustomer ? kind === 'IN' : kind === 'OUT'; }
    kindOf(row) { return (0, deposit_ledger_service_1.depositKind)(row.Code, row.Type); }
    async recompute(tx, partyId) {
        return this.isCustomer ? this.ledger.recomputeCustomer(tx, partyId) : this.ledger.recomputeSupplier(tx, partyId);
    }
    async accountsFor(tx, kind, dto, prev) {
        const needs = [];
        if (!dto.cashAccountId && !prev?.cash)
            needs.push('cash');
        if (!dto.depositAccountId && !prev?.dep)
            needs.push(this.depKey);
        const a = needs.length ? await this.journal.accounts(tx, needs) : {};
        const cash = dto.cashAccountId ?? prev?.cash ?? a.cash;
        const dep = dto.depositAccountId ?? prev?.dep ?? a[this.depKey];
        const ids = [...new Set([cash, dep])];
        if ((await tx.account.count({ where: { ID: { in: ids } } })) !== ids.length)
            throw new common_1.BadRequestException('Ada perkiraan yang tidak ditemukan');
        if (cash === dep)
            throw new common_1.BadRequestException('Akun kas dan akun deposit tidak boleh sama');
        return { cash, dep, kind };
    }
    async prevAccounts(tx, row) {
        const ls = await this.journal.linesOf(tx, this.ref, row.ID);
        if (!ls.length)
            return {};
        const debit = ls.find((l) => Number(l.Debit) > 0)?.AccountID;
        const credit = ls.find((l) => Number(l.Credit) > 0)?.AccountID;
        return this.cashIsDebit(this.kindOf(row)) ? { cash: debit, dep: credit } : { cash: credit, dep: debit };
    }
    async post(tx, row, acc, userId) {
        const kind = this.kindOf(row);
        const amount = Number(row.Amount);
        const desc = `${this.label} ${row.Code}${row.Description ? ` - ${row.Description}` : ''}`;
        const cashDebit = this.cashIsDebit(kind);
        await this.journal.post(tx, {
            referenceType: this.ref, referenceId: row.ID, date: row.Date, description: desc, userId, referenceNumber: row.Code,
            lines: [
                { accountId: cashDebit ? acc.cash : acc.dep, debit: amount },
                { accountId: cashDebit ? acc.dep : acc.cash, credit: amount },
            ],
        });
    }
    async assertParty(id) {
        if (!id)
            throw new common_1.BadRequestException(`${this.isCustomer ? 'Pelanggan' : 'Supplier'} wajib dipilih`);
        const found = this.isCustomer
            ? await this.prisma.customer.count({ where: { ID: id } })
            : await this.prisma.supplier.count({ where: { ID: id } });
        if (!found)
            throw new common_1.BadRequestException(`${this.isCustomer ? 'Pelanggan' : 'Supplier'} tidak ditemukan`);
    }
    async create(dto, userId) {
        const partyId = this.isCustomer ? dto.customerId : dto.supplierId;
        await this.assertParty(partyId);
        const amount = r2(Number(dto.amount));
        if (!(amount > 0))
            throw new common_1.BadRequestException('Jumlah harus lebih dari 0');
        const kind = dto.type ?? (0, deposit_ledger_service_1.depositKind)(dto.code ?? '');
        if (kind === 'USE')
            throw new common_1.BadRequestException('Pemakaian deposit dicatat dari menu pembayaran (metode Deposit)');
        const code = dto.code && (0, deposit_ledger_service_1.depositKind)(dto.code) === kind ? dto.code : `${this.prefix(kind)}-${stamp()}`;
        const date = dto.date ? new Date(dto.date) : new Date();
        if (isNaN(date.getTime()))
            throw new common_1.BadRequestException('Tanggal tidak valid');
        return this.prisma.$transaction(async (tx) => {
            const acc = await this.accountsFor(tx, kind, dto);
            const data = {
                Code: code, Date: date, Amount: dec(amount), RemainingAmount: dec(kind === 'IN' ? amount : 0),
                Description: dto.description ?? null, CreatedByID: userId,
            };
            if (this.isCustomer) {
                Object.assign(data, {
                    CustomerID: partyId, Type: kind === 'OUT' ? 'WITHDRAW' : 'DEPOSIT',
                    PaymentMethodID: dto.paymentMethodId ?? null, ReferenceNumber: dto.referenceNumber ?? null,
                });
            }
            else
                data.SupplierID = partyId;
            const row = await this.model(tx).create({ data });
            await this.recompute(tx, partyId);
            await this.post(tx, row, acc, userId);
            return this.model(tx).findUnique({ where: { ID: row.ID } });
        });
    }
    async update(id, dto, userId) {
        const ex = await this.model(this.prisma).findUnique({ where: { ID: id } });
        if (!ex)
            throw new common_1.NotFoundException(`${this.label} tidak ditemukan`);
        if (this.kindOf(ex) === 'USE')
            throw new common_1.BadRequestException('Pemakaian deposit hanya dapat diubah/dihapus dari pembayaran terkait');
        const newParty = (this.isCustomer ? dto.customerId : dto.supplierId) ?? this.partyId(ex);
        if (newParty !== this.partyId(ex))
            await this.assertParty(newParty);
        const kind = dto.type ?? (dto.code ? (0, deposit_ledger_service_1.depositKind)(dto.code) : this.kindOf(ex));
        if (kind === 'USE')
            throw new common_1.BadRequestException('Jenis deposit tidak valid');
        const amount = dto.amount !== undefined ? r2(Number(dto.amount)) : Number(ex.Amount);
        if (!(amount > 0))
            throw new common_1.BadRequestException('Jumlah harus lebih dari 0');
        let code = dto.code ?? ex.Code;
        if ((0, deposit_ledger_service_1.depositKind)(code) !== kind)
            code = code.replace(/^[A-Z]+-/, `${this.prefix(kind)}-`);
        if ((0, deposit_ledger_service_1.depositKind)(code) !== kind)
            code = `${this.prefix(kind)}-${stamp()}`;
        return this.prisma.$transaction(async (tx) => {
            const prev = await this.prevAccounts(tx, ex);
            const acc = await this.accountsFor(tx, kind, dto, prev);
            const data = {
                Code: code, Amount: dec(amount), ...(dto.date ? { Date: new Date(dto.date) } : {}),
                ...(dto.description !== undefined ? { Description: dto.description } : {}),
            };
            if (this.isCustomer) {
                Object.assign(data, { CustomerID: newParty, Type: kind === 'OUT' ? 'WITHDRAW' : 'DEPOSIT' });
                if (dto.paymentMethodId !== undefined)
                    data.PaymentMethodID = dto.paymentMethodId;
                if (dto.referenceNumber !== undefined)
                    data.ReferenceNumber = dto.referenceNumber;
            }
            else
                data.SupplierID = newParty;
            const row = await this.model(tx).update({ where: { ID: id }, data });
            await this.recompute(tx, newParty);
            if (newParty !== this.partyId(ex))
                await this.recompute(tx, this.partyId(ex));
            await this.post(tx, row, acc, userId);
            return this.model(tx).findUnique({ where: { ID: id } });
        });
    }
    async remove(id) {
        const ex = await this.model(this.prisma).findUnique({ where: { ID: id } });
        if (!ex)
            throw new common_1.NotFoundException(`${this.label} tidak ditemukan`);
        if (this.kindOf(ex) === 'USE')
            throw new common_1.BadRequestException('Pemakaian deposit hanya dapat dihapus dengan menghapus pembayaran terkait');
        return this.prisma.$transaction(async (tx) => {
            await this.journal.reverse(tx, this.ref, id);
            await this.model(tx).delete({ where: { ID: id } });
            try {
                await this.recompute(tx, this.partyId(ex));
            }
            catch {
                throw new common_1.BadRequestException('Deposit tidak dapat dihapus karena saldonya sudah terpakai / ditarik');
            }
            return ex;
        });
    }
    async balance(partyId) {
        return this.isCustomer ? this.ledger.customerBalance(this.prisma, partyId) : this.ledger.supplierBalance(this.prisma, partyId);
    }
}
exports.DepositDocHelper = DepositDocHelper;
