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
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let CustomerService = class CustomerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCustomer(dto, UserId) {
        const existing = await this.prisma.customer.findUnique({
            where: { Code: dto.Code },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Customer Code '${dto.Code}' already exists`);
        }
        const Group = await this.prisma.customerGroup.findUnique({
            where: { ID: dto.CustomerGroupId },
        });
        if (!Group) {
            throw new common_1.NotFoundException(`Customer Group not found`);
        }
        const Customer = await this.prisma.customer.create({
            data: {
                Code: dto.Code,
                Name: dto.Name,
                Phone: dto.Phone,
                Email: dto.Email,
                Address: dto.Address,
                CustomerGroupID: dto.CustomerGroupId,
                PointBalance: dto.PointBalance || 0,
                TotalReceivable: new client_1.Prisma.Decimal(dto.TotalReceivable || 0),
                Notes: dto.Notes,
                IsActive: true,
            },
            include: {
                CustomerGroup: true,
            },
        });
        await this.prisma.activityLog.create({
            data: {
                Type: 'CUSTOMER_CREATED',
                Title: 'Customer Created',
                Description: `New Customer ${Customer.Name} (${Customer.Code}) created`,
                ReferenceType: 'CUSTOMER',
                ReferenceID: Customer.ID,
                CreatedByID: UserId,
            },
        });
        return {
            success: true,
            Customer: this.formatCustomer(Customer),
        };
    }
    async updateCustomer(CustomerId, dto, UserId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const updated = await this.prisma.customer.update({
            where: { ID: CustomerId },
            data: {
                Name: dto.Name,
                Phone: dto.Phone,
                Email: dto.Email,
                Address: dto.Address,
                CustomerGroupID: dto.CustomerGroupId,
                Notes: dto.Notes,
                IsActive: dto.IsActive,
            },
            include: {
                CustomerGroup: true,
            },
        });
        await this.prisma.activityLog.create({
            data: {
                Type: 'CUSTOMER_UPDATED',
                Title: 'Customer UpDated',
                Description: `Customer ${updated.Name} (${updated.Code}) updated`,
                ReferenceType: 'CUSTOMER',
                ReferenceID: updated.ID,
                CreatedByID: UserId,
            },
        });
        return {
            success: true,
            Customer: this.formatCustomer(updated),
        };
    }
    async getCustomer(CustomerId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: CustomerId },
            include: {
                CustomerGroup: true,
                Sales: {
                    take: 5,
                    orderBy: { Date: 'desc' },
                    include: {
                        SaleItems: true,
                    },
                },
                CustomerDeposits: {
                    take: 5,
                    orderBy: { Date: 'desc' },
                },
                PointRedemptions: {
                    take: 5,
                    orderBy: { Date: 'desc' },
                },
            },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const TotalTransaction = Customer.Sales.reduce((sum, Sale) => {
            return sum + Number(Sale.Total);
        }, 0);
        const ActiveDeposit = await this.prisma.customerDeposit.aggregate({
            where: { CustomerID: CustomerId },
            _sum: { RemainingAmount: true },
        });
        return {
            ...this.formatCustomer(Customer),
            TotalTransaction,
            TotalTransactions: Customer.Sales.length,
            recentSales: Customer.Sales.map((s) => ({
                ID: s.ID,
                Code: s.Code,
                Date: s.Date,
                Total: (0, number_1.number)(s.Total),
                Status: s.PaymentStatusID,
            })),
            ActiveDeposit: (0, number_1.number)(ActiveDeposit._sum.RemainingAmount || 0),
        };
    }
    async listCustomers(dto) {
        const where = {};
        if (dto.Search) {
            where.OR = [
                { Name: { contains: dto.Search, mode: 'insensitive' } },
                { Code: { contains: dto.Search, mode: 'insensitive' } },
                { Phone: { contains: dto.Search, mode: 'insensitive' } },
                { Email: { contains: dto.Search, mode: 'insensitive' } },
            ];
        }
        if (dto.CustomerGroupId) {
            where.CustomerGroupID = dto.CustomerGroupId;
        }
        if (dto.IsActive !== undefined) {
            where.IsActive = dto.IsActive;
        }
        if (dto.HasReceivable) {
            where.TotalReceivable = { gt: 0 };
        }
        if (dto.HasPoints) {
            where.PointBalance = { gt: 0 };
        }
        if (dto.StartDate || dto.EndDate) {
            where.CreatedAt = {};
            if (dto.StartDate) {
                where.CreatedAt.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.CreatedAt.lte = new Date(dto.EndDate);
            }
        }
        const page = dto.Page || 1;
        const limit = dto.Limit || 20;
        const skip = (page - 1) * limit;
        const [Customers, Total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                include: {
                    CustomerGroup: true,
                },
                orderBy: { Name: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.customer.count({ where }),
        ]);
        const CustomersWithCount = await Promise.all(Customers.map(async (c) => ({
            ...this.formatCustomer(c),
            TotalSales: await this.prisma.sale.count({ where: { CustomerID: c.ID } }),
        })));
        return {
            data: CustomersWithCount,
            pagination: {
                page,
                limit,
                Total,
                TotalPages: Math.ceil(Total / limit),
            },
        };
    }
    async deleteCustomer(CustomerId, UserId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const SalesCount = await this.prisma.sale.count({
            where: { CustomerID: CustomerId },
        });
        if (SalesCount > 0) {
            await this.prisma.customer.update({
                where: { ID: CustomerId },
                data: { IsActive: false },
            });
        }
        else {
            await this.prisma.customer.delete({
                where: { ID: CustomerId },
            });
        }
        return {
            success: true,
            message: SalesCount > 0
                ? 'Customer deactivated (has existing transactions)'
                : 'Customer deleted successfully',
        };
    }
    async createCustomerGroup(dto) {
        const existing = await this.prisma.customerGroup.findUnique({
            where: { Code: dto.Code },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Group Code '${dto.Code}' already exists`);
        }
        const Group = await this.prisma.customerGroup.create({
            data: {
                Code: dto.Code,
                Name: dto.Name,
                Description: dto.Description,
                DiscountPercent: new client_1.Prisma.Decimal(dto.DiscountPercent || 0),
                PointMultiplier: new client_1.Prisma.Decimal(dto.PointMultiplier || 1),
            },
        });
        return {
            success: true,
            Group: this.formatCustomerGroup(Group),
        };
    }
    async updateCustomerGroup(GroupId, dto) {
        const Group = await this.prisma.customerGroup.findUnique({
            where: { ID: GroupId },
        });
        if (!Group) {
            throw new common_1.NotFoundException('Customer Group not found');
        }
        const updated = await this.prisma.customerGroup.update({
            where: { ID: GroupId },
            data: {
                Name: dto.Name,
                Description: dto.Description,
                DiscountPercent: dto.DiscountPercent !== undefined
                    ? new client_1.Prisma.Decimal(dto.DiscountPercent)
                    : undefined,
                PointMultiplier: dto.PointMultiplier !== undefined
                    ? new client_1.Prisma.Decimal(dto.PointMultiplier)
                    : undefined,
                IsActive: dto.IsActive,
            },
        });
        return {
            success: true,
            Group: this.formatCustomerGroup(updated),
        };
    }
    async listCustomerGroups() {
        const Groups = await this.prisma.customerGroup.findMany({
            orderBy: { SortOrder: 'asc' },
        });
        const GroupsWithCount = await Promise.all(Groups.map(async (g) => ({
            ...this.formatCustomerGroup(g),
            CustomerCount: await this.prisma.customer.count({ where: { CustomerGroupID: g.ID } }),
        })));
        return GroupsWithCount;
    }
    async deleteCustomerGroup(GroupId) {
        const Group = await this.prisma.customerGroup.findUnique({
            where: { ID: GroupId },
        });
        if (!Group) {
            throw new common_1.NotFoundException('Customer Group not found');
        }
        const CustomerCount = await this.prisma.customer.count({ where: { CustomerGroupID: GroupId } });
        if (CustomerCount > 0) {
            throw new common_1.BadRequestException('Cannot delete Group with existing Customers');
        }
        await this.prisma.customerGroup.delete({
            where: { ID: GroupId },
        });
        return { success: true, message: 'Group deleted successfully' };
    }
    async addReceivable(dto, UserId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: dto.CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const updated = await this.prisma.customer.update({
            where: { ID: dto.CustomerId },
            data: {
                TotalReceivable: { increment: new client_1.Prisma.Decimal(dto.Amount) },
            },
        });
        await this.prisma.activityLog.create({
            data: {
                Type: 'RECEIVABLE_ADDED',
                Title: 'Receivable Added',
                Description: `Added ${dto.Amount} to ${Customer.Name}'s receivable. ${dto.Notes || ''}`,
                ReferenceType: dto.ReferenceType,
                ReferenceID: dto.ReferenceId,
                Amount: new client_1.Prisma.Decimal(dto.Amount),
                CreatedByID: UserId,
            },
        });
        return {
            success: true,
            CustomerId: dto.CustomerId,
            CustomerName: Customer.Name,
            previousReceivable: (0, number_1.number)(Customer.TotalReceivable),
            addedAmount: dto.Amount,
            newReceivable: (0, number_1.number)(updated.TotalReceivable),
        };
    }
    async paymentReceivable(dto, UserId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: dto.CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        if (Number(Customer.TotalReceivable) < dto.Amount) {
            throw new common_1.BadRequestException(`Payment exceeds receivable. Available: ${Customer.TotalReceivable}, Payment: ${dto.Amount}`);
        }
        const updated = await this.prisma.customer.update({
            where: { ID: dto.CustomerId },
            data: {
                TotalReceivable: { decrement: new client_1.Prisma.Decimal(dto.Amount) },
            },
        });
        await this.prisma.activityLog.create({
            data: {
                Type: 'RECEIVABLE_PAID',
                Title: 'Receivable Payment',
                Description: `${Customer.Name} paid ${dto.Amount}. ${dto.Notes || ''}`,
                ReferenceType: 'RECEIVABLE_PAYMENT',
                Amount: new client_1.Prisma.Decimal(dto.Amount),
                CreatedByID: UserId,
            },
        });
        return {
            success: true,
            CustomerId: dto.CustomerId,
            CustomerName: Customer.Name,
            previousReceivable: (0, number_1.number)(Customer.TotalReceivable),
            PaymentAmount: dto.Amount,
            newReceivable: (0, number_1.number)(updated.TotalReceivable),
        };
    }
    async getCustomerReceivable(CustomerId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: CustomerId },
            include: {
                CustomerGroup: true,
                Sales: {
                    where: {
                        PaymentStatus: {
                            Code: { in: ['PARTIAL', 'UNPAID'] },
                        },
                    },
                    orderBy: { Date: 'desc' },
                    include: {
                        SalePayments: true,
                    },
                },
            },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const outstandingSales = Customer.Sales.map((Sale) => ({
            ID: Sale.ID,
            Code: Sale.Code,
            Date: Sale.Date,
            Total: (0, number_1.number)(Sale.Total),
            Paid: Sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0),
            outstanding: (0, number_1.number)(Sale.Total) - Sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0),
        }));
        return {
            Customer: this.formatCustomer(Customer),
            currentReceivable: (0, number_1.number)(Customer.TotalReceivable),
            outstandingInvoices: outstandingSales,
            TotalOutstanding: outstandingSales.reduce((sum, inv) => sum + inv.outstanding, 0),
        };
    }
    async adjustPoints(dto, UserId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: dto.CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const newBalance = Customer.PointBalance + dto.Points;
        if (newBalance < 0) {
            throw new common_1.BadRequestException(`Cannot reduce Points below zero. Current: ${Customer.PointBalance}, Adjustment: ${dto.Points}`);
        }
        await this.prisma.customer.update({
            where: { ID: dto.CustomerId },
            data: { PointBalance: newBalance },
        });
        await this.prisma.activityLog.create({
            data: {
                Type: dto.Points > 0 ? 'POINTS_ADDED' : 'POINTS_DEDUCTED',
                Title: dto.Points > 0 ? 'Points Added' : 'Points Deducted',
                Description: `${Math.abs(dto.Points)} Points ${dto.Points > 0 ? 'added to' : 'deducted from'} ${Customer.Name}. Reason: ${dto.Reason}`,
                ReferenceType: 'CUSTOMER',
                ReferenceID: dto.CustomerId,
                Amount: new client_1.Prisma.Decimal(dto.Points),
                CreatedByID: UserId,
            },
        });
        return {
            success: true,
            CustomerId: dto.CustomerId,
            CustomerName: Customer.Name,
            previousBalance: Customer.PointBalance,
            adjustment: dto.Points,
            newBalance,
            reason: dto.Reason,
        };
    }
    async getCustomerLoyaltyHistory(CustomerId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: CustomerId },
            include: {
                CustomerGroup: true,
                PointRedemptions: {
                    orderBy: { Date: 'desc' },
                },
                Sales: {
                    where: {
                        PaymentStatus: {
                            Code: 'PAID',
                        },
                    },
                    orderBy: { Date: 'desc' },
                },
            },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const TotalEarned = Customer.Sales.reduce((sum, Sale) => sum + Number(Sale.Total), 0);
        const TotalRedeemed = Customer.PointRedemptions.reduce((sum, r) => sum + r.PointsRedeemed, 0);
        return {
            Customer: this.formatCustomer(Customer),
            currentBalance: Customer.PointBalance,
            TotalEarned,
            TotalRedeemed,
            redemptionHistory: Customer.PointRedemptions.map((r) => ({
                ID: r.ID,
                Code: r.Code,
                PointsRedeemed: r.PointsRedeemed,
                rewardName: r.RewardName,
                rewardValue: (0, number_1.number)(r.RewardValue),
                Date: r.Date,
            })),
        };
    }
    async getTopCustomersByRevenue(dto) {
        const limit = dto.Limit || 10;
        const where = {};
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.Date.lte = new Date(dto.EndDate);
            }
        }
        const Customers = await this.prisma.customer.findMany({
            include: {
                CustomerGroup: true,
                Sales: {
                    where,
                    select: {
                        Total: true,
                    },
                },
            },
        });
        const topCustomers = Customers
            .map((c) => ({
            CustomerId: c.ID,
            CustomerCode: c.Code,
            CustomerName: c.Name,
            CustomerGroup: c.CustomerGroup?.Name,
            TotalRevenue: c.Sales.reduce((sum, s) => sum + Number(s.Total), 0),
            transactionCount: c.Sales.length,
        }))
            .filter((c) => c.TotalRevenue > 0)
            .sort((a, b) => b.TotalRevenue - a.TotalRevenue)
            .slice(0, limit);
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            topCustomers,
        };
    }
    async getCustomerSummary() {
        const [TotalCustomers, ActiveCustomers, InactiveCustomers, CustomersWithReceivable, CustomersWithPoints,] = await Promise.all([
            this.prisma.customer.count(),
            this.prisma.customer.count({ where: { IsActive: true } }),
            this.prisma.customer.count({ where: { IsActive: false } }),
            this.prisma.customer.count({ where: { TotalReceivable: { gt: 0 } } }),
            this.prisma.customer.count({ where: { PointBalance: { gt: 0 } } }),
        ]);
        const TotalReceivable = await this.prisma.customer.aggregate({
            where: { TotalReceivable: { gt: 0 } },
            _sum: { TotalReceivable: true },
        });
        const TotalPoints = await this.prisma.customer.aggregate({
            where: { PointBalance: { gt: 0 } },
            _sum: { PointBalance: true },
        });
        return {
            TotalCustomers,
            ActiveCustomers,
            InactiveCustomers,
            CustomersWithReceivable,
            CustomersWithPoints,
            TotalOutstandingReceivable: (0, number_1.number)(TotalReceivable._sum.TotalReceivable || 0),
            TotalLoyaltyPoints: (0, number_1.number)(TotalPoints._sum.PointBalance || 0),
        };
    }
    async getCustomerStatement(dto) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: dto.CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const startDate = new Date(dto.StartDate);
        const endDate = new Date(dto.EndDate);
        endDate.setHours(23, 59, 59, 999);
        const openingReceivable = Number(Customer.TotalReceivable);
        const Sales = await this.prisma.sale.findMany({
            where: {
                CustomerID: dto.CustomerId,
                Date: { gte: startDate, lte: endDate },
            },
            orderBy: { Date: 'asc' },
            include: {
                SalePayments: true,
            },
        });
        const Deposits = await this.prisma.customerDeposit.findMany({
            where: {
                CustomerID: dto.CustomerId,
                Date: { gte: startDate, lte: endDate },
            },
            orderBy: { Date: 'asc' },
        });
        const transactions = [
            ...Sales.map((s) => ({
                Date: s.Date,
                Type: 'SALE',
                reference: s.Code,
                Description: 'Penjualan',
                debit: (0, number_1.number)(s.Total),
                credit: s.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0),
            })),
            ...Deposits.map((d) => ({
                Date: d.Date,
                Type: 'PAYMENT',
                reference: d.Code,
                Description: 'Pembayaran Piutang',
                debit: 0,
                credit: (0, number_1.number)(d.Amount),
            })),
        ].sort((a, b) => a.Date.getTime() - b.Date.getTime());
        const TotalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
        const TotalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
        return {
            Customer: this.formatCustomer(Customer),
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            openingBalance: openingReceivable,
            transactions,
            closingBalance: openingReceivable + TotalDebit - TotalCredit,
            Summary: {
                TotalSales: TotalDebit,
                TotalPayments: TotalCredit,
                netChange: TotalDebit - TotalCredit,
            },
        };
    }
    formatCustomer(Customer) {
        return {
            ID: Customer.ID,
            Code: Customer.Code,
            Name: Customer.Name,
            phone: Customer.Phone,
            email: Customer.Email,
            address: Customer.Address,
            CustomerGroupId: Customer.CustomerGroupID,
            CustomerGroup: Customer.CustomerGroup
                ? {
                    ID: Customer.CustomerGroup.ID,
                    Code: Customer.CustomerGroup.Code,
                    Name: Customer.CustomerGroup.Name,
                    discountPercent: (0, number_1.number)(Customer.CustomerGroup.DiscountPercent),
                }
                : null,
            TotalReceivable: (0, number_1.number)(Customer.TotalReceivable),
            PointBalance: Customer.PointBalance,
            Notes: Customer.Notes,
            IsActive: Customer.IsActive,
            createdAt: Customer.CreatedAt,
            updatedAt: Customer.UpDatedAt,
        };
    }
    formatCustomerGroup(Group) {
        return {
            ID: Group.ID,
            Code: Group.Code,
            Name: Group.Name,
            Description: Group.Description,
            discountPercent: (0, number_1.number)(Group.DiscountPercent),
            PointMultiplier: (0, number_1.number)(Group.PointMultiplier),
            IsActive: Group.IsActive,
            sortOrder: Group.SortOrder,
        };
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerService);
