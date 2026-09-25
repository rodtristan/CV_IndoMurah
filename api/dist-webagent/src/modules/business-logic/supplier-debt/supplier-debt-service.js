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
exports.SupplierDebtService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let SupplierDebtService = class SupplierDebtService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDebtOverview(dto) {
        const where = {};
        if (dto.SupplierId) {
            where.SupplierID = dto.SupplierId;
        }
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate)
                where.Date.gte = new Date(dto.StartDate);
            if (dto.EndDate)
                where.Date.lte = new Date(dto.EndDate);
        }
        const unpaidStatus = await this.prisma.paymentStatus.findFirst({
            where: { Code: { in: ['PENDING', 'PARTIAL'] } },
        });
        const Purchases = await this.prisma.purchase.findMany({
            where: {
                ...where,
                PaymentStatusID: unpaidStatus?.ID,
                IsReturn: false,
            },
            include: {
                Supplier: true,
                PurchasePayments: true,
            },
        });
        const debtSummary = Purchases.map((p) => {
            const paid = p.PurchasePayments.reduce((sum, pay) => sum + Number(pay.Amount), 0);
            const remaining = Number(p.Total) - paid;
            const dueDate = p.DueDate ? new Date(p.DueDate) : null;
            const isOverdue = dueDate && dueDate < new Date();
            return {
                PurchaseId: p.ID,
                PurchaseCode: p.Code,
                Date: p.Date,
                SupplierId: p.SupplierID,
                SupplierName: p.Supplier.Name,
                Total: (0, number_1.number)(p.Total),
                paid,
                remaining,
                dueDate,
                isOverdue,
                daysOverdue: isOverdue && dueDate
                    ? Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                    : 0,
            };
        });
        const TotalDebt = debtSummary.reduce((sum, d) => sum + d.remaining, 0);
        const overdueDebt = debtSummary.filter((d) => d.isOverdue).reduce((sum, d) => sum + d.remaining, 0);
        const overdueCount = debtSummary.filter((d) => d.isOverdue).length;
        const bySupplier = {};
        for (const debt of debtSummary) {
            if (!bySupplier[debt.SupplierId]) {
                bySupplier[debt.SupplierId] = {
                    SupplierId: debt.SupplierId,
                    SupplierName: debt.SupplierName,
                    TotalDebt: 0,
                    PurchaseCount: 0,
                    overdueAmount: 0,
                    overdueCount: 0,
                    oldestDueDate: null,
                };
            }
            bySupplier[debt.SupplierId].TotalDebt += debt.remaining;
            bySupplier[debt.SupplierId].PurchaseCount++;
            if (debt.isOverdue) {
                bySupplier[debt.SupplierId].overdueAmount += debt.remaining;
                bySupplier[debt.SupplierId].overdueCount++;
            }
            if (!bySupplier[debt.SupplierId].oldestDueDate ||
                (debt.dueDate && debt.dueDate < bySupplier[debt.SupplierId].oldestDueDate)) {
                bySupplier[debt.SupplierId].oldestDueDate = debt.dueDate;
            }
        }
        return {
            Summary: {
                TotalDebt,
                TotalSuppliers: Object.keys(bySupplier).length,
                TotalPurchases: debtSummary.length,
                overdueDebt,
                overdueCount,
            },
            bySupplier: Object.values(bySupplier),
            debts: debtSummary,
        };
    }
    async getSupplierDebt(dto) {
        const Supplier = await this.prisma.supplier.findUnique({
            where: { ID: dto.SupplierId },
        });
        if (!Supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
        const unpaidStatus = await this.prisma.paymentStatus.findFirst({
            where: { Code: { in: ['PENDING', 'PARTIAL'] } },
        });
        const where = {
            SupplierID: dto.SupplierId,
            PaymentStatusID: unpaidStatus?.ID,
            IsReturn: false,
        };
        if (!dto.IncludePaid) {
            where.PaymentStatus = { Code: { in: ['PENDING', 'PARTIAL'] } };
        }
        const Purchases = await this.prisma.purchase.findMany({
            where,
            include: {
                PurchasePayments: { orderBy: { CreatedAt: 'asc' } },
                PaymentStatus: true,
            },
            orderBy: { Date: 'asc' },
        });
        const debtDetails = Purchases.map((p) => {
            const paid = p.PurchasePayments.reduce((sum, pay) => sum + Number(pay.Amount), 0);
            const remaining = Number(p.Total) - paid;
            const dueDate = p.DueDate ? new Date(p.DueDate) : null;
            const isOverdue = dueDate && dueDate < new Date();
            return {
                PurchaseId: p.ID,
                PurchaseCode: p.Code,
                Date: p.Date,
                Total: (0, number_1.number)(p.Total),
                paid,
                remaining,
                dueDate,
                isOverdue,
                daysOverdue: isOverdue && dueDate
                    ? Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                    : 0,
                Status: p.PaymentStatus,
                Payments: p.PurchasePayments.map((pay) => ({
                    ID: pay.ID,
                    Amount: (0, number_1.number)(pay.Amount),
                    Date: pay.CreatedAt,
                    referenceNumber: pay.ReferenceNumber,
                })),
            };
        });
        const TotalDebt = debtDetails.reduce((sum, d) => sum + d.remaining, 0);
        const overdueDebt = debtDetails.filter((d) => d.isOverdue).reduce((sum, d) => sum + d.remaining, 0);
        return {
            Supplier: {
                ID: Supplier.ID,
                Code: Supplier.Code,
                Name: Supplier.Name,
                phone: Supplier.Phone,
            },
            Summary: {
                TotalDebt,
                TotalPurchases: debtDetails.length,
                overdueDebt,
                overdueCount: debtDetails.filter((d) => d.isOverdue).length,
            },
            Purchases: debtDetails,
        };
    }
    async recordPayment(dto, UserId) {
        const Supplier = await this.prisma.supplier.findUnique({
            where: { ID: dto.SupplierId },
        });
        if (!Supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
        const unpaidStatus = await this.prisma.paymentStatus.findFirst({
            where: { Code: { in: ['PENDING', 'PARTIAL'] } },
        });
        let Purchases;
        if (dto.PurchaseIds && dto.PurchaseIds.length > 0) {
            Purchases = await this.prisma.purchase.findMany({
                where: {
                    ID: { in: dto.PurchaseIds },
                    SupplierID: dto.SupplierId,
                    PaymentStatusID: unpaidStatus?.ID,
                },
                include: { PurchasePayments: true },
            });
        }
        else {
            Purchases = await this.prisma.purchase.findMany({
                where: {
                    SupplierID: dto.SupplierId,
                    PaymentStatusID: unpaidStatus?.ID,
                },
                include: { PurchasePayments: true },
                orderBy: { Date: 'asc' },
            });
        }
        if (Purchases.length === 0) {
            throw new common_1.BadRequestException('No unpaid Purchases found');
        }
        const PurchasesWithRemaining = Purchases.map((p) => ({
            ...p,
            Paid: p.PurchasePayments.reduce((sum, pay) => sum + Number(pay.Amount), 0),
            remaining: (0, number_1.number)(p.Total) - p.PurchasePayments.reduce((sum, pay) => sum + Number(pay.Amount), 0),
        }));
        const TotalRemaining = PurchasesWithRemaining.reduce((sum, p) => sum + p.remaining, 0);
        if (dto.Amount > TotalRemaining) {
            throw new common_1.BadRequestException(`Payment Amount exceeds Total debt. Total remaining: ${TotalRemaining}`);
        }
        const Result = await this.prisma.$transaction(async (tx) => {
            let remainingPayment = dto.Amount;
            const PaymentResults = [];
            for (const Purchase of PurchasesWithRemaining) {
                if (remainingPayment <= 0)
                    break;
                const PaymentForThis = Math.min(remainingPayment, Purchase.remaining);
                if (PaymentForThis <= 0)
                    continue;
                await tx.purchasePayment.create({
                    data: {
                        PurchaseID: Purchase.ID,
                        MethodID: dto.PaymentMethodId,
                        Amount: new client_1.Prisma.Decimal(PaymentForThis),
                        ReferenceNumber: dto.ReferenceNumber,
                        Date: dto.PaymentDate ? new Date(dto.PaymentDate) : new Date(),
                        Notes: dto.Notes,
                        CreatedByID: UserId,
                    },
                });
                const newPaID = Purchase.Paid + PaymentForThis;
                const newRemaining = Purchase.remaining - PaymentForThis;
                let newStatusId = Purchase.PaymentStatusID;
                if (newRemaining <= 0) {
                    const paidStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PAID' } });
                    if (paidStatus)
                        newStatusId = paidStatus.ID;
                }
                else {
                    const partialStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PARTIAL' } });
                    if (partialStatus)
                        newStatusId = partialStatus.ID;
                }
                await tx.purchase.update({
                    where: { ID: Purchase.ID },
                    data: {
                        Paid: new client_1.Prisma.Decimal(newPaID),
                        Remaining: new client_1.Prisma.Decimal(newRemaining),
                        PaymentStatusID: newStatusId,
                    },
                });
                PaymentResults.push({
                    PurchaseId: Purchase.ID,
                    PurchaseCode: Purchase.Code,
                    Paid: PaymentForThis,
                    remaining: newRemaining,
                });
                remainingPayment -= PaymentForThis;
            }
            if (dto.Amount - remainingPayment > 0) {
                await tx.supplier.update({
                    where: { ID: dto.SupplierId },
                    data: {
                        TotalDebt: { decrement: new client_1.Prisma.Decimal(dto.Amount - remainingPayment) },
                    },
                });
            }
            return PaymentResults;
        });
        return {
            success: true,
            SupplierId: dto.SupplierId,
            SupplierName: Supplier.Name,
            TotalPayment: dto.Amount,
            actualPayment: dto.Amount - Result.reduce((sum, r) => sum + r.remaining, 0) +
                Result[Result.length - 1]?.remaining || 0,
            Payments: Result,
        };
    }
    async bulkPayment(dto, UserId) {
        return this.recordPayment({
            SupplierId: dto.SupplierId,
            Amount: dto.Amount,
            PaymentMethodId: dto.PaymentMethodId,
            PurchaseIds: undefined,
            ReferenceNumber: dto.ReferenceNumber,
            PaymentDate: dto.PaymentDate,
            Notes: dto.Notes,
        }, UserId);
    }
    async addDeposit(dto, UserId) {
        const Supplier = await this.prisma.supplier.findUnique({
            where: { ID: dto.SupplierId },
        });
        if (!Supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
        const Code = await this.generateDepositCode();
        const Deposit = await this.prisma.$transaction(async (tx) => {
            const newDeposit = await tx.supplierDeposit.create({
                data: {
                    Code: Code,
                    Date: new Date(),
                    SupplierID: dto.SupplierId,
                    Amount: new client_1.Prisma.Decimal(dto.Amount),
                    RemainingAmount: new client_1.Prisma.Decimal(dto.Amount),
                    Description: dto.Notes,
                    CreatedByID: UserId,
                },
            });
            await tx.supplier.update({
                where: { ID: dto.SupplierId },
                data: {
                    TotalDebt: { decrement: new client_1.Prisma.Decimal(dto.Amount) },
                },
            });
            return newDeposit;
        });
        return {
            success: true,
            Deposit: {
                ID: Deposit.ID,
                Code: Deposit.Code,
                Amount: (0, number_1.number)(Deposit.Amount),
                remainingAmount: (0, number_1.number)(Deposit.RemainingAmount),
                Date: Deposit.Date,
                SupplierName: Supplier.Name,
            },
        };
    }
    async useDeposit(dto, UserId) {
        const Purchase = await this.prisma.purchase.findUnique({
            where: { ID: dto.PurchaseId },
            include: {
                Supplier: {
                    include: {
                        SupplierDeposits: {
                            where: { RemainingAmount: { gt: 0 } },
                            orderBy: { Date: 'asc' },
                        },
                    },
                },
                PurchasePayments: true,
            },
        });
        if (!Purchase) {
            throw new common_1.NotFoundException('Purchase not found');
        }
        const TotalAvailable = Purchase.Supplier.SupplierDeposits.reduce((sum, d) => sum + Number(d.RemainingAmount), 0);
        if (dto.Amount > TotalAvailable) {
            throw new common_1.BadRequestException(`Insufficient Deposit. Available: ${TotalAvailable}, Requested: ${dto.Amount}`);
        }
        const Result = await this.prisma.$transaction(async (tx) => {
            let remainingAmount = dto.Amount;
            const usedDeposits = [];
            for (const Deposit of Purchase.Supplier.SupplierDeposits) {
                if (remainingAmount <= 0)
                    break;
                const usedFromThis = Math.min(remainingAmount, Number(Deposit.RemainingAmount));
                await tx.supplierDeposit.update({
                    where: { ID: Deposit.ID },
                    data: { RemainingAmount: { decrement: new client_1.Prisma.Decimal(usedFromThis) } },
                });
                usedDeposits.push({
                    DepositId: Deposit.ID,
                    DepositCode: Deposit.Code,
                    used: usedFromThis,
                });
                remainingAmount -= usedFromThis;
            }
            await tx.purchasePayment.create({
                data: {
                    PurchaseID: dto.PurchaseId,
                    MethodID: 1,
                    Amount: new client_1.Prisma.Decimal(dto.Amount),
                    ReferenceNumber: `SUP-DEP-${Purchase.Supplier.Code}`,
                    Notes: 'Payment from Supplier Deposit',
                    CreatedByID: UserId,
                },
            });
            const newPaID = Purchase.PurchasePayments.reduce((sum, p) => sum + Number(p.Amount), 0) + dto.Amount;
            const newRemaining = Number(Purchase.Total) - newPaID;
            let newStatusId = Purchase.PaymentStatusID;
            if (newRemaining <= 0) {
                const paidStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PAID' } });
                if (paidStatus)
                    newStatusId = paidStatus.ID;
            }
            else {
                const partialStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PARTIAL' } });
                if (partialStatus)
                    newStatusId = partialStatus.ID;
            }
            await tx.purchase.update({
                where: { ID: dto.PurchaseId },
                data: {
                    Paid: new client_1.Prisma.Decimal(newPaID),
                    Remaining: new client_1.Prisma.Decimal(newRemaining),
                    PaymentStatusID: newStatusId,
                },
            });
            return usedDeposits;
        });
        return {
            success: true,
            PurchaseId: dto.PurchaseId,
            PurchaseCode: Purchase.Code,
            SupplierName: Purchase.Supplier.Name,
            TotalUsed: dto.Amount,
            Deposits: Result,
        };
    }
    async getDeposits(SupplierId) {
        const Supplier = await this.prisma.supplier.findUnique({
            where: { ID: SupplierId },
            include: {
                SupplierDeposits: {
                    orderBy: { Date: 'desc' },
                },
            },
        });
        if (!Supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
        const TotalDeposit = Supplier.SupplierDeposits.reduce((sum, d) => sum + Number(d.Amount), 0);
        const TotalRemaining = Supplier.SupplierDeposits.reduce((sum, d) => sum + Number(d.RemainingAmount), 0);
        const TotalUsed = TotalDeposit - TotalRemaining;
        return {
            Supplier: {
                ID: Supplier.ID,
                Code: Supplier.Code,
                Name: Supplier.Name,
            },
            Summary: {
                TotalDeposit,
                TotalUsed,
                TotalRemaining,
            },
            Deposits: Supplier.SupplierDeposits.map((d) => ({
                ID: d.ID,
                Code: d.Code,
                Date: d.Date,
                Amount: (0, number_1.number)(d.Amount),
                remainingAmount: (0, number_1.number)(d.RemainingAmount),
                usedAmount: (0, number_1.number)(d.Amount) - Number(d.RemainingAmount),
                Description: d.Description,
            })),
        };
    }
    async getDebtAging(dto) {
        const asOfDate = dto.AsOfDate ? new Date(dto.AsOfDate) : new Date();
        const unpaidStatus = await this.prisma.paymentStatus.findFirst({
            where: { Code: { in: ['PENDING', 'PARTIAL'] } },
        });
        const Purchases = await this.prisma.purchase.findMany({
            where: {
                PaymentStatusID: unpaidStatus?.ID,
                IsReturn: false,
            },
            include: {
                Supplier: true,
                PurchasePayments: true,
            },
        });
        const buckets = {
            'CURRENT (0-30 days)': { Amount: 0, Count: 0, Suppliers: [] },
            '31-60 DAYS': { Amount: 0, Count: 0, Suppliers: [] },
            '61-90 DAYS': { Amount: 0, Count: 0, Suppliers: [] },
            '91-180 DAYS': { Amount: 0, Count: 0, Suppliers: [] },
            '180+ DAYS': { Amount: 0, Count: 0, Suppliers: [] },
        };
        const SupplierDebts = {};
        for (const Purchase of Purchases) {
            const paid = Purchase.PurchasePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
            const remaining = Number(Purchase.Total) - paid;
            if (remaining <= 0)
                continue;
            const dueDate = Purchase.DueDate ? new Date(Purchase.DueDate) : new Date(Purchase.Date);
            const daysUntilDue = Math.floor((asOfDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            let bucket;
            if (daysUntilDue <= 0) {
                bucket = 'CURRENT (0-30 days)';
            }
            else if (daysUntilDue <= 30) {
                bucket = 'CURRENT (0-30 days)';
            }
            else if (daysUntilDue <= 60) {
                bucket = '31-60 DAYS';
            }
            else if (daysUntilDue <= 90) {
                bucket = '61-90 DAYS';
            }
            else if (daysUntilDue <= 180) {
                bucket = '91-180 DAYS';
            }
            else {
                bucket = '180+ DAYS';
            }
            buckets[bucket].Amount += remaining;
            buckets[bucket].Count++;
            if (!buckets[bucket].Suppliers.includes(Purchase.Supplier.Name)) {
                buckets[bucket].Suppliers.push(Purchase.Supplier.Name);
            }
            if (!SupplierDebts[Purchase.SupplierID]) {
                SupplierDebts[Purchase.SupplierID] = {
                    SupplierId: Purchase.SupplierID,
                    SupplierName: Purchase.Supplier.Name,
                    TotalDebt: 0,
                    oldestDueDate: null,
                };
            }
            SupplierDebts[Purchase.SupplierID].TotalDebt += remaining;
            if (!SupplierDebts[Purchase.SupplierID].oldestDueDate || dueDate < SupplierDebts[Purchase.SupplierID].oldestDueDate) {
                SupplierDebts[Purchase.SupplierID].oldestDueDate = dueDate;
            }
        }
        const TotalDebt = Object.values(buckets).reduce((sum, b) => sum + b.Amount, 0);
        const TotalSuppliers = new Set(Object.values(SupplierDebts).map((s) => s.SupplierName)).size;
        return {
            asOfDate: asOfDate.toISOString(),
            Summary: {
                TotalDebt,
                TotalSuppliers,
                TotalPurchases: Object.values(buckets).reduce((sum, b) => sum + b.Count, 0),
            },
            buckets: Object.entries(buckets).map(([Name, data]) => ({
                Name,
                Amount: Math.round(data.Amount * 100) / 100,
                Count: data.Count,
                SupplierCount: data.Suppliers.length,
            })),
            bySupplier: Object.values(SupplierDebts),
        };
    }
    async getDebtReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : this.getStartOfYear();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        const where = {
            Date: { gte: startDate, lte: endDate },
        };
        if (dto.SupplierId) {
            where.SupplierID = dto.SupplierId;
        }
        const Purchases = await this.prisma.purchase.findMany({
            where,
            include: {
                Supplier: true,
                PurchasePayments: true,
                PaymentStatus: true,
            },
            orderBy: { Date: 'asc' },
        });
        const bySupplier = {};
        let TotalPurchase = 0;
        let TotalPaid = 0;
        let TotalDebt = 0;
        for (const Purchase of Purchases) {
            const paid = Purchase.PurchasePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
            const remaining = Number(Purchase.Total) - paid;
            TotalPurchase += Number(Purchase.Total);
            TotalPaid += paid;
            TotalDebt += remaining;
            if (!bySupplier[Purchase.SupplierID]) {
                bySupplier[Purchase.SupplierID] = {
                    SupplierId: Purchase.SupplierID,
                    SupplierName: Purchase.Supplier.Name,
                    SupplierCode: Purchase.Supplier.Code,
                    TotalPurchase: 0,
                    TotalPaid: 0,
                    TotalDebt: 0,
                    Purchases: [],
                };
            }
            bySupplier[Purchase.SupplierID].TotalPurchase += Number(Purchase.Total);
            bySupplier[Purchase.SupplierID].TotalPaid += paid;
            bySupplier[Purchase.SupplierID].TotalDebt += remaining;
            bySupplier[Purchase.SupplierID].Purchases.push({
                Code: Purchase.Code,
                Date: Purchase.Date,
                Total: (0, number_1.number)(Purchase.Total),
                paid,
                remaining,
                Status: Purchase.PaymentStatus.Name,
            });
        }
        return {
            period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
            Summary: {
                TotalPurchase,
                TotalPaid,
                TotalDebt,
                TotalSuppliers: Object.keys(bySupplier).length,
                TotalPurchases: Purchases.length,
            },
            bySupplier: Object.values(bySupplier),
        };
    }
    getStartOfYear() {
        const now = new Date();
        return new Date(now.getFullYear(), 0, 1);
    }
    async generateDepositCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `SUP-DEP-${year}${month}`;
        const lastDeposit = await this.prisma.supplierDeposit.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastDeposit) {
            const lastSeq = parseInt(lastDeposit.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.SupplierDebtService = SupplierDebtService;
exports.SupplierDebtService = SupplierDebtService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupplierDebtService);
