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
exports.PartyBalanceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma-service");
const n = (v) => Number(v ?? 0);
const r2 = (v) => Math.round(v * 100) / 100;
const isCancelled = (code) => (code ?? '').toUpperCase() === 'CANCELLED';
let PartyBalanceService = class PartyBalanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async saleOutstanding(tx, saleId) {
        const s = await tx.sale.findUnique({
            where: { ID: saleId },
            include: {
                PaymentStatus: { select: { Code: true } },
                SalePayments: { select: { Amount: true, IsCleared: true } },
                SaleReturns: { select: { TotalReturn: true, Status: { select: { Code: true } } } },
            },
        });
        if (!s)
            return null;
        const returns = s.SaleReturns.filter((r) => !isCancelled(r.Status?.Code)).reduce((a, r) => a + n(r.TotalReturn), 0);
        const paid = s.SalePayments.filter((p) => p.IsCleared).reduce((a, p) => a + n(p.Amount), 0);
        const committed = s.SalePayments.reduce((a, p) => a + n(p.Amount), 0);
        const total = n(s.Total);
        return {
            total,
            returns: r2(returns),
            paid: r2(paid),
            committed: r2(committed),
            remaining: r2(Math.max(total - returns - paid, 0)),
            cancelled: isCancelled(s.PaymentStatus?.Code),
            customerId: s.CustomerID,
        };
    }
    async recalcSale(tx, saleId) {
        const o = await this.saleOutstanding(tx, saleId);
        if (!o || o.cancelled)
            return o;
        const effective = r2(o.total - o.returns);
        const code = effective <= 0.005 || o.paid >= effective - 0.005 ? 'PAID' : o.paid > 0 ? 'PARTIAL' : 'PENDING';
        const st = await tx.paymentStatus.findUnique({ where: { Code: code }, select: { ID: true } });
        if (st)
            await tx.sale.update({ where: { ID: saleId }, data: { PaymentStatusID: st.ID } });
        return o;
    }
    async customerOutstanding(tx, customerId, excludeSaleId) {
        const sales = await tx.sale.findMany({
            where: { CustomerID: customerId, NOT: [{ PaymentStatus: { Code: 'CANCELLED' } }, ...(excludeSaleId ? [{ ID: excludeSaleId }] : [])] },
            select: {
                Total: true,
                SalePayments: { select: { Amount: true, IsCleared: true } },
                SaleReturns: { select: { TotalReturn: true, Status: { select: { Code: true } } } },
            },
        });
        let sum = 0;
        for (const s of sales) {
            const ret = s.SaleReturns.filter((r) => !isCancelled(r.Status?.Code)).reduce((a, r) => a + n(r.TotalReturn), 0);
            const paid = s.SalePayments.filter((p) => p.IsCleared).reduce((a, p) => a + n(p.Amount), 0);
            sum += Math.max(n(s.Total) - ret - paid, 0);
        }
        return r2(sum);
    }
    async recalcCustomer(tx, customerId) {
        const total = await this.customerOutstanding(tx, customerId);
        await tx.customer.update({ where: { ID: customerId }, data: { TotalReceivable: new client_1.Prisma.Decimal(total) } });
        return total;
    }
    async recalcPurchase(tx, purchaseId) {
        const p = await tx.purchase.findUnique({
            where: { ID: purchaseId },
            include: {
                Status: { select: { Code: true } },
                PaymentStatus: { select: { Code: true } },
                PurchasePayments: { select: { Amount: true, IsCleared: true } },
                PurchaseReturns: { select: { TotalReturn: true, Status: { select: { Code: true } } } },
            },
        });
        if (!p)
            return null;
        const returns = p.PurchaseReturns.filter((r) => !isCancelled(r.Status?.Code)).reduce((a, r) => a + n(r.TotalReturn), 0);
        const paid = p.PurchasePayments.filter((x) => x.IsCleared).reduce((a, x) => a + n(x.Amount), 0);
        const effective = r2(n(p.Total) - returns);
        const remaining = r2(Math.max(effective - paid, 0));
        const data = { Paid: new client_1.Prisma.Decimal(r2(paid)), Remaining: new client_1.Prisma.Decimal(remaining) };
        if (!isCancelled(p.Status?.Code) && !isCancelled(p.PaymentStatus?.Code)) {
            const code = effective <= 0.005 || paid >= effective - 0.005 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING';
            const st = await tx.paymentStatus.findUnique({ where: { Code: code }, select: { ID: true } });
            if (st)
                data.PaymentStatus = { connect: { ID: st.ID } };
        }
        await tx.purchase.update({ where: { ID: purchaseId }, data });
        return { total: n(p.Total), returns: r2(returns), paid: r2(paid), remaining, supplierId: p.SupplierID };
    }
    async supplierOutstanding(tx, supplierId) {
        const rows = await tx.purchase.findMany({
            where: { SupplierID: supplierId, NOT: [{ Status: { Code: 'CANCELLED' } }, { PaymentStatus: { Code: 'CANCELLED' } }] },
            select: {
                Total: true,
                PurchasePayments: { select: { Amount: true, IsCleared: true } },
                PurchaseReturns: { select: { TotalReturn: true, Status: { select: { Code: true } } } },
            },
        });
        let sum = 0;
        for (const p of rows) {
            const ret = p.PurchaseReturns.filter((r) => !isCancelled(r.Status?.Code)).reduce((a, r) => a + n(r.TotalReturn), 0);
            const paid = p.PurchasePayments.filter((x) => x.IsCleared).reduce((a, x) => a + n(x.Amount), 0);
            sum += Math.max(n(p.Total) - ret - paid, 0);
        }
        return r2(sum);
    }
    async recalcSupplier(tx, supplierId) {
        const total = await this.supplierOutstanding(tx, supplierId);
        await tx.supplier.update({ where: { ID: supplierId }, data: { TotalDebt: new client_1.Prisma.Decimal(total) } });
        return total;
    }
};
exports.PartyBalanceService = PartyBalanceService;
exports.PartyBalanceService = PartyBalanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PartyBalanceService);
