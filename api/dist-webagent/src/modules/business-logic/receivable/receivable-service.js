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
exports.ReceivableService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let ReceivableService = class ReceivableService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getReceivablesOverview(dto) {
        const where = {};
        if (dto.CustomerId) {
            where.CustomerId = dto.CustomerId;
        }
        const paidStatus = await this.prisma.paymentStatus.findFirst({ where: { Code: 'PAID' } });
        const paidStatusId = paidStatus?.ID || 2;
        const Customers = await this.prisma.customer.findMany({
            where: { ...where, TotalReceivable: { gt: 0 } },
            include: {
                CustomerGroup: true,
                Sales: {
                    where: {
                        PaymentStatusID: { not: paidStatusId },
                    },
                    include: {
                        SalePayments: true,
                    },
                },
            },
        });
        const today = new Date();
        const Summaries = Customers.map((Customer) => {
            const TotalReceivable = Number(Customer.TotalReceivable);
            const TotalPaid = Customer.Sales.reduce((sum, Sale) => sum + Sale.SalePayments.reduce((pSum, p) => pSum + Number(p.Amount), 0), 0);
            const remainingBalance = TotalReceivable;
            const overdueAmount = Customer.Sales.reduce((sum, Sale) => {
                const isOverdue = Sale.SalePayments.length === 0 && new Date(Sale.Date) < today;
                return isOverdue ? sum + Number(Sale.Total) : sum;
            }, 0);
            const oldestDueDate = Customer.Sales.length > 0
                ? new Date(Math.min(...Customer.Sales.map((s) => new Date(s.Date).getTime())))
                : null;
            return {
                CustomerId: Customer.ID,
                CustomerName: Customer.Name,
                CustomerCode: Customer.Code,
                TotalReceivable: TotalReceivable,
                TotalPaid: TotalPaid,
                RemainingBalance: remainingBalance,
                OverdueAmount: overdueAmount,
                OldestDueDate: oldestDueDate,
                SalesCount: Customer.Sales.length,
            };
        });
        let filtered = Summaries;
        if (dto.OverdueOnly) {
            filtered = Summaries.filter((s) => s.OverdueAmount > 0);
        }
        const Totals = {
            TotalCustomers: filtered.length,
            TotalReceivable: filtered.reduce((sum, s) => sum + s.RemainingBalance, 0),
            TotalOverdue: filtered.reduce((sum, s) => sum + s.OverdueAmount, 0),
        };
        return { Summaries: filtered, Totals };
    }
    async getCustomerReceivables(CustomerId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: CustomerId },
            include: {
                CustomerGroup: true,
                Sales: {
                    where: {
                        PaymentStatusID: { not: 2 },
                    },
                    include: {
                        SalePayments: { orderBy: { CreatedAt: 'asc' } },
                    },
                    orderBy: { Date: 'desc' },
                },
                CustomerDeposits: {
                    orderBy: { Date: 'desc' },
                },
            },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const today = new Date();
        const Sales = Customer.Sales.map((Sale) => {
            const paid = Sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
            const remaining = Number(Sale.Total) - paid;
            const isOverdue = paid < Number(Sale.Total) && new Date(Sale.Date) < today;
            return {
                ID: Sale.ID,
                Code: Sale.Code,
                Date: Sale.Date,
                Total: (0, number_1.number)(Sale.Total),
                Paid: paid,
                Remaining: remaining,
                IsOverdue: isOverdue,
                DaysOverdue: isOverdue
                    ? Math.floor((today.getTime() - new Date(Sale.Date).getTime()) / (1000 * 60 * 60 * 24))
                    : 0,
                Payments: Sale.SalePayments.map((p) => ({
                    ID: p.ID,
                    Amount: (0, number_1.number)(p.Amount),
                    Date: p.CreatedAt,
                    MethodID: p.MethodID,
                })),
            };
        });
        const Deposits = Customer.CustomerDeposits.map((d) => ({
            ID: d.ID,
            Code: d.Code,
            Amount: (0, number_1.number)(d.Amount),
            Remaining: (0, number_1.number)(d.RemainingAmount),
            Date: d.Date,
        }));
        return {
            Customer: {
                ID: Customer.ID,
                Code: Customer.Code,
                Name: Customer.Name,
                CustomerGroup: Customer.CustomerGroup?.Name || 'Default',
                TotalReceivable: (0, number_1.number)(Customer.TotalReceivable),
                PointBalance: Customer.PointBalance,
            },
            Sales,
            Deposits,
            Summary: {
                TotalSales: Sales.length,
                TotalBilled: Sales.reduce((sum, s) => sum + s.Total, 0),
                TotalPaid: Sales.reduce((sum, s) => sum + s.Paid, 0),
                TotalRemaining: Sales.reduce((sum, s) => sum + s.Remaining, 0),
                OverdueCount: Sales.filter((s) => s.IsOverdue).length,
                TotalOverdue: Sales.filter((s) => s.IsOverdue).reduce((sum, s) => sum + s.Remaining, 0),
            },
        };
    }
    async RecordPayment(SaleId, dto, UserId) {
        const Sale = await this.prisma.sale.findUnique({
            where: { ID: SaleId },
            include: {
                SalePayments: true,
                Customer: true,
            },
        });
        if (!Sale) {
            throw new common_1.NotFoundException('Sale not found');
        }
        const currentPaID = Sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
        const TotalAmount = Number(Sale.Total);
        const remainingAmount = TotalAmount - currentPaID;
        if (dto.Amount > remainingAmount) {
            throw new common_1.BadRequestException(`Payment exceeds remaining Amount. Remaining: ${remainingAmount}`);
        }
        const Result = await this.prisma.$transaction(async (tx) => {
            await tx.salePayment.create({
                data: {
                    SaleID: SaleId,
                    MethodID: dto.PaymentMethodId,
                    Amount: new client_1.Prisma.Decimal(dto.Amount),
                    ReferenceNumber: dto.ReferenceNumber,
                    Date: dto.PaymentDate ? new Date(dto.PaymentDate) : new Date(),
                    Notes: dto.Notes,
                    CreatedByID: UserId,
                },
            });
            const newPaID = currentPaID + dto.Amount;
            const newRemaining = TotalAmount - newPaID;
            let newStatusId = Sale.PaymentStatusID;
            if (newPaID >= TotalAmount) {
                const paidStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PAID' } });
                if (paidStatus)
                    newStatusId = paidStatus.ID;
            }
            else if (newPaID > 0) {
                const partialStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PARTIAL' } });
                if (partialStatus)
                    newStatusId = partialStatus.ID;
            }
            await tx.sale.update({
                where: { ID: SaleId },
                data: { PaymentStatusID: newStatusId },
            });
            if (newPaID >= TotalAmount) {
                await tx.customer.update({
                    where: { ID: Sale.CustomerID },
                    data: { TotalReceivable: { decrement: new client_1.Prisma.Decimal(remainingAmount) } },
                });
            }
            return { newPaID, newRemaining, newStatusId };
        });
        return {
            success: true,
            SaleId,
            SaleCode: Sale.Code,
            PreviousPaid: currentPaID,
            PaymentAmount: dto.Amount,
            NewPaid: Result.newPaID,
            RemainingAmount: Result.newRemaining,
            Status: Result.newStatusId === 2 ? 'PAID' : 'PARTIAL',
        };
    }
    async RecordBulkPayment(dto, UserId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: dto.CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const Sales = await this.prisma.sale.findMany({
            where: { ID: { in: dto.SaleIds }, CustomerID: dto.CustomerId },
            include: { SalePayments: true },
        });
        if (Sales.length !== dto.SaleIds.length) {
            throw new common_1.NotFoundException('Some Sales not found or do not belong to this Customer');
        }
        const SalesWithRemaining = Sales.map((Sale) => {
            const paid = Sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
            const remaining = Number(Sale.Total) - paid;
            return { ...Sale, remaining };
        });
        const TotalRemaining = SalesWithRemaining.reduce((sum, s) => sum + s.remaining, 0);
        if (dto.Amount > TotalRemaining) {
            throw new common_1.BadRequestException(`Payment exceeds Total remaining Amount. Total remaining: ${TotalRemaining}`);
        }
        const Result = await this.prisma.$transaction(async (tx) => {
            let remainingPayment = dto.Amount;
            const PaymentResults = [];
            for (const Sale of SalesWithRemaining.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())) {
                if (remainingPayment <= 0)
                    break;
                const PaymentForThisSale = Math.min(remainingPayment, Sale.remaining);
                await tx.salePayment.create({
                    data: {
                        SaleID: Sale.ID,
                        MethodID: dto.PaymentMethodId,
                        Amount: new client_1.Prisma.Decimal(PaymentForThisSale),
                        ReferenceNumber: dto.ReferenceNumber,
                        Notes: `Bulk Payment: ${dto.Notes || 'Multiple invoices'}`,
                        CreatedByID: UserId,
                    },
                });
                if (Sale.remaining <= PaymentForThisSale) {
                    const paidStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PAID' } });
                    if (paidStatus) {
                        await tx.sale.update({
                            where: { ID: Sale.ID },
                            data: { PaymentStatusID: paidStatus.ID },
                        });
                    }
                }
                PaymentResults.push({
                    SaleId: Sale.ID,
                    SaleCode: Sale.Code,
                    Paid: PaymentForThisSale,
                    Remaining: Sale.remaining - PaymentForThisSale,
                });
                remainingPayment -= PaymentForThisSale;
            }
            if (dto.Amount > remainingPayment) {
                const AmountApplied = dto.Amount - remainingPayment;
                await tx.customer.update({
                    where: { ID: dto.CustomerId },
                    data: { TotalReceivable: { decrement: new client_1.Prisma.Decimal(AmountApplied) } },
                });
            }
            return PaymentResults;
        });
        return {
            success: true,
            CustomerId: dto.CustomerId,
            CustomerName: Customer.Name,
            TotalPayment: dto.Amount,
            Payments: Result,
            TotalApplied: Result.reduce((sum, p) => sum + p.Paid, 0),
        };
    }
    async addCustomerDeposit(CustomerId, dto, UserId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const Code = await this.generateDepositCode();
        const Deposit = await this.prisma.$transaction(async (tx) => {
            const newDeposit = await tx.customerDeposit.create({
                data: {
                    Code: Code,
                    Date: new Date(),
                    CustomerID: CustomerId,
                    Amount: new client_1.Prisma.Decimal(dto.Amount),
                    RemainingAmount: new client_1.Prisma.Decimal(dto.Amount),
                    Description: dto.Notes,
                    CreatedByID: UserId,
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
                RemainingAmount: (0, number_1.number)(Deposit.RemainingAmount),
                Date: Deposit.Date,
            },
        };
    }
    async useCustomerDeposit(CustomerId, SaleId, Amount, UserId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: CustomerId },
            include: {
                CustomerDeposits: {
                    where: { RemainingAmount: { gt: 0 } },
                    orderBy: { Date: 'asc' },
                },
            },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const TotalAvailable = Customer.CustomerDeposits.reduce((sum, d) => sum + Number(d.RemainingAmount), 0);
        if (Amount > TotalAvailable) {
            throw new common_1.BadRequestException(`Insufficient Deposit. Available: ${TotalAvailable}, Requested: ${Amount}`);
        }
        const Result = await this.prisma.$transaction(async (tx) => {
            let remainingAmount = Amount;
            const usedDeposits = [];
            for (const Deposit of Customer.CustomerDeposits) {
                if (remainingAmount <= 0)
                    break;
                const usedFromThis = Math.min(remainingAmount, Number(Deposit.RemainingAmount));
                await tx.customerDeposit.update({
                    where: { ID: Deposit.ID },
                    data: { RemainingAmount: { decrement: new client_1.Prisma.Decimal(usedFromThis) } },
                });
                usedDeposits.push({
                    DepositId: Deposit.ID,
                    DepositCode: Deposit.Code,
                    Used: usedFromThis,
                });
                remainingAmount -= usedFromThis;
            }
            await tx.salePayment.create({
                data: {
                    SaleID: SaleId,
                    MethodID: 1,
                    Amount: new client_1.Prisma.Decimal(Amount),
                    ReferenceNumber: `DEP-${Customer.Code}`,
                    Notes: 'Payment from Customer Deposit',
                    CreatedByID: UserId,
                },
            });
            return usedDeposits;
        });
        return {
            success: true,
            CustomerId,
            SaleId,
            TotalUsed: Amount,
            Deposits: Result,
        };
    }
    async getAgingReport(dto) {
        const asOfDate = dto.AsOfDate ? new Date(dto.AsOfDate) : new Date();
        const paidStatus = await this.prisma.paymentStatus.findFirst({ where: { Code: 'PAID' } });
        const paidStatusId = paidStatus?.ID || 2;
        const Customers = await this.prisma.customer.findMany({
            where: { TotalReceivable: { gt: 0 } },
            include: {
                CustomerGroup: true,
                Sales: {
                    where: {
                        PaymentStatusID: { not: paidStatusId },
                    },
                    include: { SalePayments: true },
                },
            },
        });
        const agingBuckets = {
            'CURRENT (0-30)': { Amount: 0, Count: 0 },
            '31-60 DAYS': { Amount: 0, Count: 0 },
            '61-90 DAYS': { Amount: 0, Count: 0 },
            '91-180 DAYS': { Amount: 0, Count: 0 },
            '180+ DAYS': { Amount: 0, Count: 0 },
        };
        const CustomerDetails = [];
        for (const Customer of Customers) {
            let TotalRemaining = 0;
            const SalesByAge = [];
            for (const Sale of Customer.Sales) {
                const paid = Sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
                const remaining = Number(Sale.Total) - paid;
                if (remaining <= 0)
                    continue;
                TotalRemaining += remaining;
                const daysOverdue = Math.floor((asOfDate.getTime() - new Date(Sale.Date).getTime()) / (1000 * 60 * 60 * 24));
                let ageBucket = '180+ DAYS';
                if (daysOverdue <= 30)
                    ageBucket = 'CURRENT (0-30)';
                else if (daysOverdue <= 60)
                    ageBucket = '31-60 DAYS';
                else if (daysOverdue <= 90)
                    ageBucket = '61-90 DAYS';
                else if (daysOverdue <= 180)
                    ageBucket = '91-180 DAYS';
                agingBuckets[ageBucket].Amount += remaining;
                agingBuckets[ageBucket].Count += 1;
                SalesByAge.push({
                    SaleId: Sale.ID,
                    SaleCode: Sale.Code,
                    Date: Sale.Date,
                    Total: (0, number_1.number)(Sale.Total),
                    Paid: paid,
                    Remaining: remaining,
                    DaysOverdue: daysOverdue,
                    AgeBucket: ageBucket,
                });
            }
            if (TotalRemaining > 0) {
                CustomerDetails.push({
                    CustomerId: Customer.ID,
                    CustomerCode: Customer.Code,
                    CustomerName: Customer.Name,
                    CustomerGroup: Customer.CustomerGroup?.Name || 'Default',
                    TotalReceivable: TotalRemaining,
                    Sales: SalesByAge,
                });
            }
        }
        return {
            AsOfDate: asOfDate,
            Summary: {
                TotalCustomers: CustomerDetails.length,
                TotalReceivable: Object.values(agingBuckets).reduce((sum, b) => sum + b.Amount, 0),
                buckets: agingBuckets,
            },
            Customers: CustomerDetails.sort((a, b) => b.TotalReceivable - a.TotalReceivable),
        };
    }
    async updateCreditLimit(CustomerId, dto, UserId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const oldLimit = Number(Customer.TotalReceivable);
        await this.prisma.customer.update({
            where: { ID: CustomerId },
            data: { Notes: `Credit limit updated from ${oldLimit} to ${dto.CreditLimit}. ${dto.Reason || ''}` },
        });
        return {
            success: true,
            CustomerId,
            CustomerName: Customer.Name,
            OldCreditLimit: oldLimit,
            NewCreditLimit: dto.CreditLimit,
            ChangedBy: UserId,
        };
    }
    async CheckCreditAvailability(CustomerId, Amount) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: CustomerId },
            include: { CustomerGroup: true },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const currentReceivable = Number(Customer.TotalReceivable);
        const availableCredit = 1000000 - currentReceivable;
        const canPurchase = availableCredit >= Amount;
        return {
            CustomerId,
            CustomerName: Customer.Name,
            CurrentReceivable: currentReceivable,
            RequestedAmount: Amount,
            AvailableCredit: availableCredit,
            CanPurchase: canPurchase,
            Message: canPurchase
                ? 'Credit available'
                : `Insufficient credit. Available: ${availableCredit}, Requested: ${Amount}`,
        };
    }
    async sendPaymentReminder(dto, UserId) {
        const paidStatus = await this.prisma.paymentStatus.findFirst({ where: { Code: 'PAID' } });
        const paidStatusId = paidStatus?.ID || 2;
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: dto.CustomerId },
            include: {
                Sales: {
                    where: {
                        PaymentStatusID: { not: paidStatusId },
                    },
                },
            },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const notification = await this.prisma.notification.create({
            data: {
                UserID: UserId,
                Title: `Payment Reminder - ${Customer.Name}`,
                Message: dto.Message,
                TypeID: 1,
                ReferenceType: 'CUSTOMER',
                ReferenceID: dto.CustomerId,
            },
        });
        return {
            success: true,
            CustomerId: dto.CustomerId,
            CustomerName: Customer.Name,
            OutstandingInvoices: Customer.Sales.length,
            TotalOutstanding: Customer.Sales.reduce((sum, s) => sum + Number(s.Total), 0),
            NotificationId: notification.ID,
            Channel: dto.Channel || 'IN_APP',
        };
    }
    async writeOffReceivable(dto, UserId) {
        const Sale = await this.prisma.sale.findUnique({
            where: { ID: dto.ReceivableId },
            include: { Customer: true },
        });
        if (!Sale) {
            throw new common_1.NotFoundException('Receivable not found');
        }
        const writeOffAmount = dto.Amount || Number(Sale.Total);
        await this.prisma.$transaction(async (tx) => {
            await tx.customer.update({
                where: { ID: Sale.CustomerID },
                data: { TotalReceivable: { decrement: new client_1.Prisma.Decimal(writeOffAmount) } },
            });
            await tx.activityLog.create({
                data: {
                    Type: 'RECEIVABLE_WRITEOFF',
                    Title: 'Receivable Written Off',
                    Description: `Customer: ${Sale.Customer.Name}, Amount: ${writeOffAmount}, Reason: ${dto.Reason}`,
                    ReferenceType: 'SALE',
                    ReferenceID: dto.ReceivableId,
                    Amount: new client_1.Prisma.Decimal(writeOffAmount),
                    CreatedByID: UserId,
                },
            });
        });
        return {
            success: true,
            ReceivableId: dto.ReceivableId,
            SaleCode: Sale.Code,
            CustomerName: Sale.Customer.Name,
            WrittenOffAmount: writeOffAmount,
            Reason: dto.Reason,
            WrittenOffBy: UserId,
        };
    }
    async generateDepositCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `DEP-${year}${month}`;
        const lastDeposit = await this.prisma.customerDeposit.findFirst({
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
exports.ReceivableService = ReceivableService;
exports.ReceivableService = ReceivableService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReceivableService);
