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
exports.AutoJournalService = exports.REF = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma-service");
const account_keys_1 = require("./account-keys");
exports.REF = {
    SALE: 'SALE',
    SALE_PAYMENT: 'SALE_PAYMENT',
    SALE_RETURN: 'SALE_RETURN',
    PURCHASE: 'PURCHASE',
    PURCHASE_PAYMENT: 'PURCHASE_PAYMENT',
    PURCHASE_RETURN: 'PURCHASE_RETURN',
    CASH_IN: 'CASH_IN',
    CASH_OUT: 'CASH_OUT',
    CASH_TRANSFER: 'CASH_TRANSFER',
    CUSTOMER_DEPOSIT: 'CUSTOMER_DEPOSIT',
    SUPPLIER_DEPOSIT: 'SUPPLIER_DEPOSIT',
    CHEQUE_PAYMENT: 'CHEQUE_PAYMENT',
};
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const dec = (n) => new client_1.Prisma.Decimal(r2(n).toFixed(2));
const CASH_CODES = ['CASH', 'TUNAI'];
let AutoJournalService = class AutoJournalService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async accounts(tx, keys) {
        const rows = await tx.accountSetting.findMany({ where: { Key: { in: keys } } });
        const map = {};
        for (const r of rows)
            if (r.AccountID)
                map[r.Key] = r.AccountID;
        const missing = keys.filter((k) => !map[k]);
        if (missing.length) {
            const names = missing.map((k) => `"${account_keys_1.ACCOUNT_KEY_LABELS[k] ?? k}"`).join(', ');
            throw new common_1.BadRequestException(`Setting Perkiraan ${names} belum diisi. Minta admin melengkapi menu Akuntansi > Setting Perkiraan sebelum menyimpan transaksi ini.`);
        }
        return map;
    }
    async optionalAccount(tx, key) {
        const r = await tx.accountSetting.findUnique({ where: { Key: key } });
        return r?.AccountID ?? null;
    }
    async paymentAccount(tx, methodId, instrument) {
        const { cash } = await this.accounts(tx, ['cash']);
        let isCash = !instrument || instrument === 'CASH';
        if (isCash && methodId) {
            const m = await tx.paymentMethod.findUnique({ where: { ID: methodId } });
            if (m) {
                const t = (m.Type ?? '').toUpperCase();
                const c = m.Code.toUpperCase();
                isCash = t ? t === 'CASH' : CASH_CODES.some((x) => c.includes(x));
            }
        }
        if (isCash)
            return cash;
        return (await this.optionalAccount(tx, 'bank')) ?? cash;
    }
    async assertOpenPeriod(tx, date) {
        const year = date.getUTCFullYear();
        const closed = await tx.fiscalYearClose.findUnique({ where: { Year: year } });
        if (closed)
            throw new common_1.BadRequestException(`Tahun buku ${year} sudah ditutup; transaksi pada tahun tersebut tidak dapat dibuat, diubah atau dihapus`);
    }
    async nextCode(tx, date = new Date()) {
        await tx.$queryRawUnsafe('SELECT 1 AS ok FROM (SELECT pg_advisory_xact_lock(730100)) x');
        const prefix = `JR-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
        const rows = await tx.$queryRawUnsafe(`SELECT MAX(CAST(substring("Code" from '[0-9]+$') AS INTEGER)) AS mx FROM "Journals" WHERE "Code" ~ $1`, `^${prefix}-[0-9]+$`);
        const rows2 = await tx.$queryRawUnsafe(`SELECT MAX(CAST(substring("JournalNumber" from '[0-9]+$') AS INTEGER)) AS mx FROM "JournalEntries" WHERE "JournalNumber" ~ $1`, `^${prefix}-[0-9]+$`);
        const next = Math.max(Number(rows[0]?.mx ?? 0), Number(rows2[0]?.mx ?? 0)) + 1;
        return `${prefix}-${String(next).padStart(4, '0')}`;
    }
    async post(tx, input) {
        await this.reverse(tx, input.referenceType, input.referenceId);
        const lines = input.lines
            .map((l) => ({ ...l, debit: r2(l.debit ?? 0), credit: r2(l.credit ?? 0) }))
            .filter((l) => l.debit !== 0 || l.credit !== 0)
            .map((l) => {
            const net = r2(l.debit - l.credit);
            return { ...l, debit: net > 0 ? net : 0, credit: net < 0 ? -net : 0 };
        })
            .filter((l) => l.debit !== 0 || l.credit !== 0);
        if (!lines.length)
            return null;
        if (lines.some((l) => !l.accountId))
            throw new common_1.BadRequestException('Baris jurnal otomatis tanpa perkiraan');
        const totalDebit = r2(lines.reduce((s, l) => s + l.debit, 0));
        const totalCredit = r2(lines.reduce((s, l) => s + l.credit, 0));
        if (Math.round(totalDebit * 100) !== Math.round(totalCredit * 100)) {
            throw new common_1.BadRequestException(`Jurnal otomatis ${input.referenceType} #${input.referenceId} tidak balance (D ${totalDebit} / K ${totalCredit})`);
        }
        await this.assertOpenPeriod(tx, input.date);
        const code = await this.nextCode(tx, input.date);
        return tx.journal.create({
            data: {
                Code: code,
                Date: input.date,
                Description: input.description,
                ReferenceType: input.referenceType,
                ReferenceID: input.referenceId,
                IsPosted: true,
                PostedAt: new Date(),
                CreatedByID: input.userId,
                JournalEntries: {
                    create: {
                        JournalNumber: code,
                        Date: input.date,
                        Type: 'AUTO',
                        Description: input.description,
                        ReferenceType: input.referenceType,
                        ReferenceID: input.referenceId,
                        ReferenceNumber: input.referenceNumber ?? null,
                        SourceDocumentType: input.source?.type ?? input.referenceType,
                        SourceDocumentID: input.source?.id ?? input.referenceId,
                        TotalDebit: dec(totalDebit),
                        TotalCredit: dec(totalCredit),
                        Status: 'POSTED',
                        CreatedByID: input.userId,
                        Lines: {
                            create: lines.map((l, i) => ({
                                AccountID: l.accountId,
                                Debit: dec(l.debit),
                                Credit: dec(l.credit),
                                DebitCredit: l.debit > 0 ? 'DEBIT' : 'KREDIT',
                                Amount: dec(l.debit || l.credit),
                                Description: l.memo ?? input.description,
                                LineNumber: i + 1,
                                CreatedByID: input.userId,
                            })),
                        },
                    },
                },
            },
            include: { JournalEntries: { include: { Lines: true } } },
        });
    }
    async reverse(tx, referenceType, referenceId) {
        const js = await tx.journal.findMany({ where: { ReferenceType: referenceType, ReferenceID: referenceId }, select: { ID: true, Date: true } });
        return this.deleteJournals(tx, js);
    }
    async reverseBySource(tx, sourceType, sourceId) {
        const js = await tx.journal.findMany({
            where: {
                OR: [
                    { ReferenceType: sourceType, ReferenceID: sourceId },
                    { JournalEntries: { some: { SourceDocumentType: sourceType, SourceDocumentID: sourceId } } },
                ],
            },
            select: { ID: true, Date: true },
        });
        return this.deleteJournals(tx, js);
    }
    async deleteJournals(tx, js) {
        if (!js.length)
            return 0;
        for (const j of js)
            await this.assertOpenPeriod(tx, j.Date);
        const ids = js.map((j) => j.ID);
        await tx.journalEntry.deleteMany({ where: { JournalID: { in: ids } } });
        await tx.journal.deleteMany({ where: { ID: { in: ids } } });
        return ids.length;
    }
    async linesOf(tx, referenceType, referenceId) {
        return tx.journalEntryLine.findMany({
            where: { JournalEntry: { Journal: { ReferenceType: referenceType, ReferenceID: referenceId } } },
            include: { Account: { select: { ID: true, Code: true, Name: true } } },
            orderBy: { LineNumber: 'asc' },
        });
    }
    async postSale(tx, saleId, userId) {
        const sale = await tx.sale.findUnique({ where: { ID: saleId }, include: { SaleItems: true, SalePayments: true } });
        if (!sale)
            throw new common_1.NotFoundException(`Penjualan #${saleId} tidak ditemukan`);
        const uid = userId ?? sale.CreatedByID;
        const total = Number(sale.Total);
        const tax = Number(sale.TaxAmount);
        const subtotal = Number(sale.Subtotal);
        const discount = r2(subtotal + tax - total);
        const cost = r2(sale.SaleItems.reduce((s, i) => s + Number(i.CostPrice) * Number(Number(i.BaseQuantity) > 0 ? i.BaseQuantity : i.Quantity), 0));
        const keys = ['receivable', 'sales'];
        if (tax)
            keys.push('vatOut');
        if (discount > 0)
            keys.push('salesDiscount');
        if (discount < 0)
            keys.push('otherIncome');
        if (cost)
            keys.push('cogs', 'inventory');
        const a = await this.accounts(tx, keys);
        const desc = `Penjualan ${sale.Code}`;
        const lines = [
            { accountId: a.receivable, debit: total, memo: desc },
            { accountId: a.sales, credit: subtotal, memo: desc },
        ];
        if (tax)
            lines.push({ accountId: a.vatOut, credit: tax, memo: `PPN ${sale.Code}` });
        if (discount > 0)
            lines.push({ accountId: a.salesDiscount, debit: discount, memo: `Potongan ${sale.Code}` });
        if (discount < 0)
            lines.push({ accountId: a.otherIncome, credit: -discount, memo: `Biaya lain ${sale.Code}` });
        if (cost) {
            lines.push({ accountId: a.cogs, debit: cost, memo: `HPP ${sale.Code}` });
            lines.push({ accountId: a.inventory, credit: cost, memo: `HPP ${sale.Code}` });
        }
        await this.reverseBySource(tx, exports.REF.SALE, sale.ID);
        const j = await this.post(tx, { referenceType: exports.REF.SALE, referenceId: sale.ID, date: sale.Date, description: desc, lines, userId: uid, referenceNumber: sale.Code });
        for (const p of sale.SalePayments)
            await this.postSalePayment(tx, p.ID, uid);
        return j;
    }
    async reverseSale(tx, saleId) {
        return this.reverseBySource(tx, exports.REF.SALE, saleId);
    }
    async postSalePayment(tx, paymentId, userId) {
        const p = await tx.salePayment.findUnique({ where: { ID: paymentId }, include: { Sale: { select: { ID: true, Code: true } } } });
        if (!p)
            throw new common_1.NotFoundException(`Pembayaran penjualan #${paymentId} tidak ditemukan`);
        if (!p.IsCleared) {
            await this.reverse(tx, exports.REF.SALE_PAYMENT, p.ID);
            return null;
        }
        const isDeposit = p.InstrumentType === 'DEPOSIT';
        const a = await this.accounts(tx, isDeposit ? ['receivable', 'custDeposit'] : ['receivable']);
        const debitAcc = isDeposit ? a.custDeposit : await this.paymentAccount(tx, p.MethodID, p.InstrumentType);
        const desc = `${isDeposit ? 'Pemakaian deposit' : 'Pembayaran'} penjualan ${p.Sale.Code}${p.ReferenceNumber ? ` (${p.ReferenceNumber})` : ''}`;
        const amount = Number(p.Amount);
        return this.post(tx, {
            referenceType: exports.REF.SALE_PAYMENT, referenceId: p.ID, date: p.InstrumentType === 'CEK' || p.InstrumentType === 'BG' ? p.ClearedAt ?? p.Date : p.Date,
            description: desc, userId: userId ?? p.CreatedByID, source: { type: exports.REF.SALE, id: p.SaleID }, referenceNumber: p.Sale.Code,
            lines: [
                { accountId: debitAcc, debit: amount },
                { accountId: a.receivable, credit: amount },
            ],
        });
    }
    async postPurchase(tx, purchaseId, userId) {
        const pu = await tx.purchase.findUnique({ where: { ID: purchaseId }, include: { PurchasePayments: true } });
        if (!pu)
            throw new common_1.NotFoundException(`Pembelian #${purchaseId} tidak ditemukan`);
        const uid = userId ?? pu.CreatedByID;
        const total = Number(pu.Total);
        const tax = Number(pu.TaxAmount);
        const a = await this.accounts(tx, tax ? ['inventory', 'payable', 'vatIn'] : ['inventory', 'payable']);
        const desc = `Pembelian ${pu.Code}`;
        const lines = [
            { accountId: a.inventory, debit: r2(total - tax), memo: desc },
            { accountId: a.payable, credit: total, memo: desc },
        ];
        if (tax)
            lines.push({ accountId: a.vatIn, debit: tax, memo: `PPN ${pu.Code}` });
        await this.reverseBySource(tx, exports.REF.PURCHASE, pu.ID);
        const j = await this.post(tx, { referenceType: exports.REF.PURCHASE, referenceId: pu.ID, date: pu.Date, description: desc, lines, userId: uid, referenceNumber: pu.Code });
        for (const p of pu.PurchasePayments)
            await this.postPurchasePayment(tx, p.ID, uid);
        return j;
    }
    async reversePurchase(tx, purchaseId) {
        return this.reverseBySource(tx, exports.REF.PURCHASE, purchaseId);
    }
    async postPurchasePayment(tx, paymentId, userId) {
        const p = await tx.purchasePayment.findUnique({ where: { ID: paymentId }, include: { Purchase: { select: { ID: true, Code: true } } } });
        if (!p)
            throw new common_1.NotFoundException(`Pembayaran pembelian #${paymentId} tidak ditemukan`);
        if (!p.IsCleared) {
            await this.reverse(tx, exports.REF.PURCHASE_PAYMENT, p.ID);
            return null;
        }
        const isDeposit = p.InstrumentType === 'DEPOSIT';
        const a = await this.accounts(tx, isDeposit ? ['payable', 'suppDeposit'] : ['payable']);
        const creditAcc = isDeposit ? a.suppDeposit : await this.paymentAccount(tx, p.MethodID, p.InstrumentType);
        const desc = `${isDeposit ? 'Pemakaian deposit' : 'Pembayaran'} pembelian ${p.Purchase.Code}${p.ReferenceNumber ? ` (${p.ReferenceNumber})` : ''}`;
        const amount = Number(p.Amount);
        return this.post(tx, {
            referenceType: exports.REF.PURCHASE_PAYMENT, referenceId: p.ID, date: p.InstrumentType === 'CEK' || p.InstrumentType === 'BG' ? p.ClearedAt ?? p.Date : p.Date,
            description: desc, userId: userId ?? p.CreatedByID, source: { type: exports.REF.PURCHASE, id: p.PurchaseID }, referenceNumber: p.Purchase.Code,
            lines: [
                { accountId: a.payable, debit: amount },
                { accountId: creditAcc, credit: amount },
            ],
        });
    }
    async postSaleReturn(tx, saleReturnId, userId) {
        const r = await tx.saleReturn.findUnique({ where: { ID: saleReturnId }, include: { ReturnItems: true, Sale: { include: { SaleItems: true } } } });
        if (!r)
            throw new common_1.NotFoundException(`Retur penjualan #${saleReturnId} tidak ditemukan`);
        const total = Number(r.TotalReturn);
        const cost = r2(r.ReturnItems.reduce((s, it) => {
            const src = r.Sale.SaleItems.find((x) => x.ProductID === it.ProductID);
            const qty = Number(it.BaseQuantity) > 0 ? Number(it.BaseQuantity) : Number(it.Quantity);
            return s + qty * Number(src?.CostPrice ?? 0);
        }, 0));
        const a = await this.accounts(tx, cost ? ['salesReturn', 'receivable', 'inventory', 'cogs'] : ['salesReturn', 'receivable']);
        const desc = `Retur penjualan ${r.Code} (${r.Sale.Code})`;
        const lines = [
            { accountId: a.salesReturn, debit: total },
            { accountId: a.receivable, credit: total },
        ];
        if (cost) {
            lines.push({ accountId: a.inventory, debit: cost, memo: `Persediaan kembali ${r.Code}` });
            lines.push({ accountId: a.cogs, credit: cost, memo: `Koreksi HPP ${r.Code}` });
        }
        return this.post(tx, { referenceType: exports.REF.SALE_RETURN, referenceId: r.ID, date: r.Date, description: desc, lines, userId: userId ?? r.CreatedByID, referenceNumber: r.Code });
    }
    async reverseSaleReturn(tx, saleReturnId) {
        return this.reverse(tx, exports.REF.SALE_RETURN, saleReturnId);
    }
    async postPurchaseReturn(tx, purchaseReturnId, userId) {
        const r = await tx.purchaseReturn.findUnique({ where: { ID: purchaseReturnId }, include: { Purchase: { select: { Code: true } } } });
        if (!r)
            throw new common_1.NotFoundException(`Retur pembelian #${purchaseReturnId} tidak ditemukan`);
        const total = Number(r.TotalReturn);
        const a = await this.accounts(tx, ['payable', 'inventory']);
        const desc = `Retur pembelian ${r.Code} (${r.Purchase.Code})`;
        return this.post(tx, {
            referenceType: exports.REF.PURCHASE_RETURN, referenceId: r.ID, date: r.Date, description: desc, userId: userId ?? r.CreatedByID, referenceNumber: r.Code,
            lines: [
                { accountId: a.payable, debit: total },
                { accountId: a.inventory, credit: total },
            ],
        });
    }
    async reversePurchaseReturn(tx, purchaseReturnId) {
        return this.reverse(tx, exports.REF.PURCHASE_RETURN, purchaseReturnId);
    }
};
exports.AutoJournalService = AutoJournalService;
exports.AutoJournalService = AutoJournalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AutoJournalService);
