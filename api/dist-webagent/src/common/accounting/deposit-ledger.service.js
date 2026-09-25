"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositLedgerService = exports.supplierUsageCode = exports.customerUsageCode = void 0;
exports.depositKind = depositKind;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const dec = (n) => new client_1.Prisma.Decimal(r2(n).toFixed(2));
function depositKind(code, type) {
    const t = (type ?? '').toUpperCase();
    if (t === 'WITHDRAW' || t === 'WITHDRAWAL' || t === 'REFUND')
        return 'OUT';
    if (t === 'USAGE' || t === 'USE')
        return 'USE';
    const c = (code ?? '').toUpperCase();
    if (c.startsWith('DPOUT') || c.startsWith('DBOUT'))
        return 'OUT';
    if (c.startsWith('DPUSE') || c.startsWith('DBUSE'))
        return 'USE';
    return 'IN';
}
const customerUsageCode = (salePaymentId) => `DPUSE-SP${salePaymentId}`;
exports.customerUsageCode = customerUsageCode;
const supplierUsageCode = (purchasePaymentId) => `DBUSE-PP${purchasePaymentId}`;
exports.supplierUsageCode = supplierUsageCode;
let DepositLedgerService = class DepositLedgerService {
    allocate(rows) {
        const kinds = rows.map((r) => ({ r, k: depositKind(r.Code, r.Type) }));
        const totalIn = kinds.filter((x) => x.k === 'IN').reduce((s, x) => s + Number(x.r.Amount), 0);
        const consumed = kinds.filter((x) => x.k !== 'IN').reduce((s, x) => s + Number(x.r.Amount), 0);
        let left = consumed;
        const remaining = new Map();
        for (const x of kinds) {
            if (x.k !== 'IN') {
                remaining.set(x.r.ID, 0);
                continue;
            }
            const take = Math.min(Number(x.r.Amount), left);
            left = r2(left - take);
            remaining.set(x.r.ID, r2(Number(x.r.Amount) - take));
        }
        return { balance: r2(totalIn - consumed), remaining };
    }
    async customerBalance(tx, customerId) {
        const rows = await tx.customerDeposit.findMany({ where: { CustomerID: customerId }, orderBy: [{ Date: 'asc' }, { ID: 'asc' }] });
        return this.allocate(rows).balance;
    }
    async supplierBalance(tx, supplierId) {
        const rows = await tx.supplierDeposit.findMany({ where: { SupplierID: supplierId }, orderBy: [{ Date: 'asc' }, { ID: 'asc' }] });
        return this.allocate(rows).balance;
    }
    async recomputeCustomer(tx, customerId) {
        const rows = await tx.customerDeposit.findMany({ where: { CustomerID: customerId }, orderBy: [{ Date: 'asc' }, { ID: 'asc' }] });
        const { balance, remaining } = this.allocate(rows);
        if (balance < -0.004)
            throw new common_1.BadRequestException(`Saldo deposit pelanggan tidak mencukupi (saldo menjadi ${balance})`);
        for (const r of rows) {
            const v = remaining.get(r.ID) ?? 0;
            if (Number(r.RemainingAmount) !== v)
                await tx.customerDeposit.update({ where: { ID: r.ID }, data: { RemainingAmount: dec(v) } });
        }
        await tx.customer.update({ where: { ID: customerId }, data: { DepositBalance: dec(balance) } });
        return balance;
    }
    async recomputeSupplier(tx, supplierId) {
        const rows = await tx.supplierDeposit.findMany({ where: { SupplierID: supplierId }, orderBy: [{ Date: 'asc' }, { ID: 'asc' }] });
        const { balance, remaining } = this.allocate(rows);
        if (balance < -0.004)
            throw new common_1.BadRequestException(`Saldo deposit supplier tidak mencukupi (saldo menjadi ${balance})`);
        for (const r of rows) {
            const v = remaining.get(r.ID) ?? 0;
            if (Number(r.RemainingAmount) !== v)
                await tx.supplierDeposit.update({ where: { ID: r.ID }, data: { RemainingAmount: dec(v) } });
        }
        return balance;
    }
    async useCustomerDeposit(tx, p) {
        const code = (0, exports.customerUsageCode)(p.salePaymentId);
        await tx.customerDeposit.deleteMany({ where: { Code: code } });
        await tx.customerDeposit.create({
            data: {
                Code: code, Date: p.date, CustomerID: p.customerId, Amount: dec(p.amount), RemainingAmount: dec(0),
                Type: 'USAGE', ReferenceNumber: `SALE_PAYMENT:${p.salePaymentId}`, Description: p.note, CreatedByID: p.userId,
            },
        });
        return this.recomputeCustomer(tx, p.customerId);
    }
    async releaseCustomerDeposit(tx, salePaymentId) {
        const row = await tx.customerDeposit.findUnique({ where: { Code: (0, exports.customerUsageCode)(salePaymentId) } });
        if (!row)
            return;
        await tx.customerDeposit.delete({ where: { ID: row.ID } });
        await this.recomputeCustomer(tx, row.CustomerID);
    }
    async useSupplierDeposit(tx, p) {
        const code = (0, exports.supplierUsageCode)(p.purchasePaymentId);
        await tx.supplierDeposit.deleteMany({ where: { Code: code } });
        await tx.supplierDeposit.create({
            data: { Code: code, Date: p.date, SupplierID: p.supplierId, Amount: dec(p.amount), RemainingAmount: dec(0), Description: p.note, CreatedByID: p.userId },
        });
        return this.recomputeSupplier(tx, p.supplierId);
    }
    async releaseSupplierDeposit(tx, purchasePaymentId) {
        const row = await tx.supplierDeposit.findUnique({ where: { Code: (0, exports.supplierUsageCode)(purchasePaymentId) } });
        if (!row)
            return;
        await tx.supplierDeposit.delete({ where: { ID: row.ID } });
        await this.recomputeSupplier(tx, row.SupplierID);
    }
};
exports.DepositLedgerService = DepositLedgerService;
exports.DepositLedgerService = DepositLedgerService = __decorate([
    (0, common_1.Injectable)()
], DepositLedgerService);
