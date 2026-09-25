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
exports.CustomerDepositService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let CustomerDepositService = class CustomerDepositService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: dto.CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const Code = await this.generateCode();
        const Deposit = await this.prisma.$transaction(async (tx) => {
            const newDeposit = await tx.customerDeposit.create({
                data: {
                    Code: Code,
                    Date: dto.Date ? new Date(dto.Date) : new Date(),
                    CustomerID: dto.CustomerId,
                    Amount: new client_1.Prisma.Decimal(dto.Amount),
                    RemainingAmount: new client_1.Prisma.Decimal(dto.Amount),
                    ReferenceNumber: dto.ReferenceNumber,
                    Type: dto.Type || 'DEPOSIT',
                    PaymentMethodID: dto.PaymentMethodId,
                    Description: dto.Notes,
                    ...(dto.CreatedById && { CreatedByID: dto.CreatedById.toString() }),
                },
                include: {
                    Customer: true,
                },
            });
            await tx.customer.update({
                where: { ID: dto.CustomerId },
                data: { DepositBalance: { increment: new client_1.Prisma.Decimal(dto.Amount) } },
            });
            return newDeposit;
        });
        return {
            ID: Deposit.ID,
            Code: Deposit.Code,
            Date: Deposit.Date,
            Customer: {
                ID: Deposit.Customer.ID,
                Name: Deposit.Customer.Name,
                DepositBalance: (0, number_1.number)(Customer.DepositBalance) + dto.Amount,
            },
            Amount: (0, number_1.number)(Deposit.Amount),
            RemainingAmount: (0, number_1.number)(Deposit.RemainingAmount),
            Description: Deposit.Description,
        };
    }
    async update(ID, dto) {
        const Deposit = await this.prisma.customerDeposit.findUnique({
            where: { ID: ID },
        });
        if (!Deposit) {
            throw new common_1.NotFoundException('Deposit not found');
        }
        const updated = await this.prisma.customerDeposit.update({
            where: { ID: ID },
            data: { Description: dto.Notes },
        });
        return {
            ID: updated.ID,
            Code: updated.Code,
            Description: updated.Description,
        };
    }
    async useDeposit(dto) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: dto.CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const DepositBalance = Number(Customer.DepositBalance);
        if (DepositBalance < dto.Amount) {
            throw new common_1.BadRequestException(`Insufficient Deposit Balance. Available: ${DepositBalance}, Requested: ${dto.Amount}`);
        }
        const Code = await this.generateCode();
        const withdrawal = await this.prisma.$transaction(async (tx) => {
            const newWithdrawal = await tx.customerDeposit.create({
                data: {
                    Code: Code,
                    Date: new Date(),
                    CustomerID: dto.CustomerId,
                    Amount: new client_1.Prisma.Decimal(-dto.Amount),
                    RemainingAmount: new client_1.Prisma.Decimal(0),
                    ReferenceNumber: dto.ReferenceNumber,
                    Type: 'USED',
                    Description: dto.Notes || `Used for Sale ${dto.SaleId}`,
                    CreatedByID: dto.CreatedById?.toString(),
                },
                include: { Customer: true },
            });
            await tx.customer.update({
                where: { ID: dto.CustomerId },
                data: { DepositBalance: { decrement: new client_1.Prisma.Decimal(dto.Amount) } },
            });
            return newWithdrawal;
        });
        return {
            ID: withdrawal.ID,
            Code: withdrawal.Code,
            Date: withdrawal.Date,
            Customer: {
                ID: withdrawal.Customer.ID,
                Name: withdrawal.Customer.Name,
                DepositBalance: (0, number_1.number)(withdrawal.Customer.DepositBalance),
            },
            Amount: (0, number_1.number)(withdrawal.Amount),
        };
    }
    async refundDeposit(ID, dto) {
        const Deposit = await this.prisma.customerDeposit.findUnique({
            where: { ID: ID },
            include: { Customer: true },
        });
        if (!Deposit) {
            throw new common_1.NotFoundException('Deposit not found');
        }
        const refundAmount = dto.Amount || Number(Deposit.Amount);
        if (refundAmount > Number(Deposit.Amount)) {
            throw new common_1.BadRequestException('Refund Amount cannot exceed Deposit Amount');
        }
        const Code = await this.generateCode();
        await this.prisma.$transaction(async (tx) => {
            await tx.customerDeposit.create({
                data: {
                    Code: Code,
                    Date: new Date(),
                    CustomerID: Deposit.CustomerID,
                    Amount: new client_1.Prisma.Decimal(-refundAmount),
                    RemainingAmount: new client_1.Prisma.Decimal(0),
                    Type: 'REFUND',
                    Description: dto.Notes || `Refund from Deposit ${Deposit.Code}`,
                    CreatedByID: dto.createdById?.toString(),
                },
            });
            await tx.customerDeposit.update({
                where: { ID: ID },
                data: { Description: `${Deposit.Description || ''}\nRefunded: ${refundAmount}` },
            });
            await tx.customer.update({
                where: { ID: Deposit.CustomerID },
                data: { DepositBalance: { decrement: new client_1.Prisma.Decimal(refundAmount) } },
            });
        });
        return {
            ID: ID,
            Code: Deposit.Code,
            RefundAmount: refundAmount,
            Status: 'REFUNDED',
            Message: 'Deposit refunded successfully',
        };
    }
    async findById(ID) {
        const Deposit = await this.prisma.customerDeposit.findUnique({
            where: { ID: ID },
            include: {
                Customer: true,
                Creator: true,
            },
        });
        if (!Deposit) {
            throw new common_1.NotFoundException('Deposit not found');
        }
        return {
            ID: Deposit.ID,
            Code: Deposit.Code,
            Date: Deposit.Date,
            Customer: {
                ID: Deposit.Customer.ID,
                Name: Deposit.Customer.Name,
                DepositBalance: (0, number_1.number)(Deposit.Customer.DepositBalance),
            },
            Amount: (0, number_1.number)(Deposit.Amount),
            RemainingAmount: (0, number_1.number)(Deposit.RemainingAmount),
            Description: Deposit.Description,
            CreatedBy: Deposit.Creator?.Name,
            CreatedAt: Deposit.CreatedAt,
        };
    }
    async findAll(dto) {
        const where = {};
        if (dto.Search) {
            where.OR = [
                { Code: { contains: dto.Search, mode: 'insensitive' } },
                { Description: { contains: dto.Search, mode: 'insensitive' } },
            ];
        }
        if (dto.CustomerId) {
            where.CustomerID = dto.CustomerId;
        }
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                const endDate = new Date(dto.EndDate);
                endDate.setHours(23, 59, 59, 999);
                where.Date.lte = endDate;
            }
        }
        const page = dto.Page || 1;
        const limit = dto.Limit || 20;
        const skip = (page - 1) * limit;
        const [Deposits, Total] = await Promise.all([
            this.prisma.customerDeposit.findMany({
                where,
                include: {
                    Customer: true,
                },
                orderBy: { CreatedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.customerDeposit.count({ where }),
        ]);
        return {
            data: Deposits.map((d) => ({
                ID: d.ID,
                Code: d.Code,
                Date: d.Date,
                Customer: d.Customer.Name,
                Amount: (0, number_1.number)(d.Amount),
                RemainingAmount: (0, number_1.number)(d.RemainingAmount),
                Description: d.Description,
            })),
            meta: {
                page,
                limit,
                Total,
                TotalPages: Math.ceil(Total / limit),
            },
        };
    }
    async getCustomerSummary(dto) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: dto.CustomerId },
            include: {
                CustomerDeposits: {
                    orderBy: { Date: 'desc' },
                    take: 10,
                },
            },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const Deposits = await this.prisma.customerDeposit.findMany({
            where: { CustomerID: dto.CustomerId },
        });
        const TotalDeposit = Deposits
            .filter(d => Number(d.Amount) > 0)
            .reduce((sum, d) => sum + Number(d.Amount), 0);
        const TotalUsed = Deposits
            .filter(d => Number(d.Amount) < 0)
            .reduce((sum, d) => sum + Math.abs(Number(d.Amount)), 0);
        return {
            Customer: {
                ID: Customer.ID,
                Name: Customer.Name,
                Code: Customer.Code,
            },
            Balance: (0, number_1.number)(Customer.DepositBalance),
            Summary: {
                TotalDeposit: TotalDeposit,
                TotalUsed: TotalUsed,
            },
            RecentTransactions: Customer.CustomerDeposits.map((d) => ({
                ID: d.ID,
                Code: d.Code,
                Date: d.Date,
                Amount: (0, number_1.number)(d.Amount),
                Description: d.Description,
            })),
        };
    }
    async generateCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `DP-CUST-${year}${month}`;
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
exports.CustomerDepositService = CustomerDepositService;
exports.CustomerDepositService = CustomerDepositService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerDepositService);
