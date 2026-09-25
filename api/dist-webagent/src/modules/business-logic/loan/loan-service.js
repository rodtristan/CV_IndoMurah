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
exports.LoanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let LoanService = class LoanService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createLoan(dto, UserId) {
        const Employee = await this.prisma.employee.findUnique({
            where: { ID: dto.EmployeeId },
        });
        if (!Employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const LoanType = await this.prisma.loanType.findUnique({
            where: { ID: dto.LoanTypeId },
        });
        if (!LoanType) {
            throw new common_1.NotFoundException('Loan Type not found');
        }
        const Code = await this.generateLoanCode();
        const PrincipalAmount = dto.PrincipalAmount;
        const InterestRate = dto.InterestRate ?? Number(LoanType.InterestRate);
        const TenorMonths = dto.TenorMonths;
        const TotalInterest = PrincipalAmount * (InterestRate / 100);
        const TotalAmount = PrincipalAmount + TotalInterest;
        const InstallmentAmount = Math.round((TotalAmount / TenorMonths) * 100) / 100;
        const StartDate = dto.StartDate ? new Date(dto.StartDate) : new Date();
        const Loan = await this.prisma.$transaction(async (tx) => {
            const newLoan = await tx.loan.create({
                data: {
                    Code: Code,
                    EmployeeID: dto.EmployeeId,
                    LoanTypeID: dto.LoanTypeId,
                    PrincipalAmount: new client_1.Prisma.Decimal(PrincipalAmount),
                    InterestRate: new client_1.Prisma.Decimal(InterestRate),
                    TenorMonths: TenorMonths,
                    InstallmentAmount: new client_1.Prisma.Decimal(InstallmentAmount),
                    TotalAmount: new client_1.Prisma.Decimal(TotalAmount),
                    RemainingAmount: new client_1.Prisma.Decimal(TotalAmount),
                    StartDate: StartDate,
                    Notes: dto.Notes,
                    StatusID: 1,
                },
            });
            for (let i = 1; i <= TenorMonths; i++) {
                const InstallmentDate = new Date(StartDate);
                InstallmentDate.setMonth(InstallmentDate.getMonth() + i);
                const period = `${InstallmentDate.getFullYear()}-${String(InstallmentDate.getMonth() + 1).padStart(2, '0')}`;
                await tx.loanInstallment.create({
                    data: {
                        LoanID: newLoan.ID,
                        Period: period,
                        Amount: new client_1.Prisma.Decimal(InstallmentAmount),
                        Principal: new client_1.Prisma.Decimal(PrincipalAmount / TenorMonths),
                        Interest: new client_1.Prisma.Decimal(TotalInterest / TenorMonths),
                        RemainingBefore: new client_1.Prisma.Decimal(TotalAmount - (InstallmentAmount * i)),
                        RemainingAfter: new client_1.Prisma.Decimal(TotalAmount - (InstallmentAmount * (i + 1))),
                        Status: 'UNPAID',
                    },
                });
            }
            return newLoan;
        });
        await this.prisma.activityLog.create({
            data: {
                Type: 'LOAN_CREATED',
                Title: 'Loan Created',
                Description: `Loan ${Code} created for ${Employee.Name} (${PrincipalAmount})`,
                ReferenceType: 'LOAN',
                ReferenceID: Loan.ID,
                Amount: new client_1.Prisma.Decimal(TotalAmount),
                CreatedByID: UserId,
            },
        });
        return {
            success: true,
            Loan: await this.formatLoan(Loan.ID),
        };
    }
    async updateLoan(LoanId, dto) {
        const Loan = await this.prisma.loan.findUnique({
            where: { ID: LoanId },
        });
        if (!Loan) {
            throw new common_1.NotFoundException('Loan not found');
        }
        const updated = await this.prisma.loan.update({
            where: { ID: LoanId },
            data: {
                Notes: dto.Notes ?? Loan.Notes,
            },
        });
        return {
            success: true,
            Loan: await this.formatLoan(updated.ID),
        };
    }
    async RecordInstallment(dto, UserId) {
        const Loan = await this.prisma.loan.findUnique({
            where: { ID: dto.LoanId },
            include: { Installments: true },
        });
        if (!Loan) {
            throw new common_1.NotFoundException('Loan not found');
        }
        const ActiveStatus = await this.prisma.loanStatus.findFirst({
            where: { Code: 'ACTIVE' },
        });
        const completedStatus = await this.prisma.loanStatus.findFirst({
            where: { Code: 'COMPLETED' },
        });
        const PaymentDate = dto.PaymentDate ? new Date(dto.PaymentDate) : new Date();
        const currentInstallment = Loan.Installments.find((i) => i.Status === 'UNPAID' && i.Period <= this.getCurrentPeriod(PaymentDate));
        if (!currentInstallment) {
            throw new common_1.BadRequestException('No pending Installment found');
        }
        const Result = await this.prisma.$transaction(async (tx) => {
            await tx.loanInstallment.update({
                where: { ID: currentInstallment.ID },
                data: {
                    PaymentDate: PaymentDate,
                    RemainingAfter: new client_1.Prisma.Decimal(Number(currentInstallment.RemainingBefore) - dto.Amount),
                    Status: 'PAID',
                },
            });
            const TotalPaid = Loan.Installments
                .filter((i) => i.Status === 'PAID' || i.ID === currentInstallment.ID)
                .reduce((sum, i) => sum + (i.ID === currentInstallment.ID ? dto.Amount : (0, number_1.number)(i.Amount)), 0);
            const newRemaining = Number(Loan.TotalAmount) - TotalPaid;
            const updatedLoan = await tx.loan.update({
                where: { ID: dto.LoanId },
                data: {
                    RemainingAmount: new client_1.Prisma.Decimal(Math.max(0, newRemaining)),
                    StatusID: newRemaining <= 0 ? (completedStatus?.ID || 3) : (ActiveStatus?.ID || 1),
                },
            });
            return updatedLoan;
        });
        await this.prisma.activityLog.create({
            data: {
                Type: 'LOAN_INSTALLMENT_PAID',
                Title: 'Loan Installment PaID',
                Description: `Installment of ${dto.Amount} paid for Loan ${Loan.Code}`,
                ReferenceType: 'LOAN',
                ReferenceID: Loan.ID,
                Amount: new client_1.Prisma.Decimal(dto.Amount),
                CreatedByID: UserId,
            },
        });
        return {
            success: true,
            Loan: await this.formatLoan(Result.ID),
        };
    }
    async getLoan(LoanId) {
        const Loan = await this.prisma.loan.findUnique({
            where: { ID: LoanId },
            include: {
                Employee: {
                    include: {
                        Department: true,
                        Position: true,
                    },
                },
                LoanType: true,
                Status: true,
                Installments: {
                    orderBy: { Period: 'asc' },
                },
            },
        });
        if (!Loan) {
            throw new common_1.NotFoundException('Loan not found');
        }
        return {
            ...this.formatLoan(Loan),
            Installments: Loan.Installments.map((i) => ({
                ID: i.ID,
                Period: i.Period,
                Amount: (0, number_1.number)(i.Amount),
                Principal: (0, number_1.number)(i.Principal),
                Interest: (0, number_1.number)(i.Interest),
                RemainingBefore: (0, number_1.number)(i.RemainingBefore),
                RemainingAfter: (0, number_1.number)(i.RemainingAfter),
                PaymentDate: i.PaymentDate,
                Status: i.Status,
            })),
        };
    }
    async listLoans(dto) {
        const where = {};
        if (dto.EmployeeId) {
            where.EmployeeID = dto.EmployeeId;
        }
        if (dto.LoanTypeId) {
            where.LoanTypeID = dto.LoanTypeId;
        }
        if (dto.StatusId) {
            where.StatusID = dto.StatusId;
        }
        if (dto.ActiveOnly) {
            where.Status = { Code: { in: ['ACTIVE', 'PENDING'] } };
        }
        const Page = dto.Page || 1;
        const Limit = dto.Limit || 20;
        const skip = (Page - 1) * Limit;
        const [Loans, Total] = await Promise.all([
            this.prisma.loan.findMany({
                where,
                include: {
                    Employee: true,
                    LoanType: true,
                    Status: true,
                },
                orderBy: { CreatedAt: 'desc' },
                skip,
                take: Limit,
            }),
            this.prisma.loan.count({ where }),
        ]);
        const formattedLoans = await Promise.all(Loans.map((l) => this.formatLoan(l)));
        return {
            data: formattedLoans,
            pagination: {
                Page,
                Limit,
                Total,
                TotalPages: Math.ceil(Total / Limit),
            },
        };
    }
    async getLoanSummary(dto) {
        const where = {};
        if (dto.EmployeeId) {
            where.EmployeeID = dto.EmployeeId;
        }
        const [ActiveLoans, completedLoans, TotalLoans] = await Promise.all([
            this.prisma.loan.findMany({
                where: { ...where, Status: { Code: 'ACTIVE' } },
            }),
            this.prisma.loan.findMany({
                where: { ...where, Status: { Code: 'COMPLETED' } },
            }),
            this.prisma.loan.findMany({ where }),
        ]);
        const TotalOutstanding = ActiveLoans.reduce((sum, l) => sum + Number(l.RemainingAmount), 0);
        const TotalDisbursed = TotalLoans.reduce((sum, l) => sum + Number(l.PrincipalAmount), 0);
        const TotalRepaid = TotalLoans.reduce((sum, l) => sum + (Number(l.TotalAmount) - Number(l.RemainingAmount)), 0);
        return {
            TotalLoans: TotalLoans.length,
            ActiveLoans: ActiveLoans.length,
            completedLoans: completedLoans.length,
            TotalOutstanding,
            TotalDisbursed,
            TotalRepaid,
            rePaymentRate: TotalDisbursed > 0 ? Math.round((TotalRepaid / TotalDisbursed) * 10000) / 100 : 0,
        };
    }
    async getEmployeeLoanHistory(EmployeeId) {
        const Employee = await this.prisma.employee.findUnique({
            where: { ID: EmployeeId },
        });
        if (!Employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const Loans = await this.prisma.loan.findMany({
            where: { EmployeeID: EmployeeId },
            include: {
                LoanType: true,
                Status: true,
                Installments: {
                    orderBy: { Period: 'desc' },
                },
            },
            orderBy: { CreatedAt: 'desc' },
        });
        const TotalOutstanding = Loans
            .filter((l) => l.Status.Code === 'ACTIVE')
            .reduce((sum, l) => sum + Number(l.RemainingAmount), 0);
        return {
            Employee: {
                ID: Employee.ID,
                Code: Employee.Code,
                Name: Employee.Name,
            },
            TotalLoans: Loans.length,
            TotalOutstanding,
            Loans: Loans.map((l) => ({
                ...this.formatLoan(l),
                InstallmentCount: l.Installments.length,
                PaidCount: l.Installments.filter((i) => i.Status === 'PAID').length,
            })),
        };
    }
    async getLoanTypes() {
        const Types = await this.prisma.loanType.findMany({
            where: { IsActive: true },
            orderBy: { SortOrder: 'asc' },
        });
        return Types.map((t) => ({
            ID: t.ID,
            Code: t.Code,
            Name: t.Name,
            Description: t.Description,
            MaxTenorMonths: t.MaxTenorMonths,
            MaxAmount: (0, number_1.number)(t.MaxAmount),
            InterestRate: (0, number_1.number)(t.InterestRate),
        }));
    }
    async getLoanStatuses() {
        const Statuses = await this.prisma.loanStatus.findMany({
            where: { IsActive: true },
            orderBy: { SortOrder: 'asc' },
        });
        return Statuses.map((s) => ({
            ID: s.ID,
            Code: s.Code,
            Name: s.Name,
            Color: s.Color,
        }));
    }
    async generateLoanCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `LOAN-${year}${month}`;
        const lastLoan = await this.prisma.loan.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastLoan) {
            const lastSeq = parseInt(lastLoan.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    getCurrentPeriod(Date) {
        return `${Date.getFullYear()}-${String(Date.getMonth() + 1).padStart(2, '0')}`;
    }
    async formatLoan(loan) {
        const fullLoan = typeof loan === 'number'
            ? await this.prisma.loan.findUnique({
                where: { ID: loan },
                include: { Employee: true, LoanType: true, Status: true, Installments: true },
            })
            : loan;
        if (!fullLoan) {
            throw new common_1.NotFoundException('Loan not found');
        }
        const paidInstallments = fullLoan.Installments?.filter((i) => i.Status === 'PAID').length || 0;
        const TotalInstallments = fullLoan.TenorMonths;
        return {
            ID: fullLoan.ID,
            Code: fullLoan.Code,
            EmployeeId: fullLoan.EmployeeID,
            EmployeeName: fullLoan.Employee?.Name,
            EmployeeCode: fullLoan.Employee?.Code,
            LoanTypeId: fullLoan.LoanTypeID,
            LoanType: fullLoan.LoanType?.Name,
            PrincipalAmount: (0, number_1.number)(fullLoan.PrincipalAmount),
            InterestRate: (0, number_1.number)(fullLoan.InterestRate),
            TenorMonths: fullLoan.TenorMonths,
            InstallmentAmount: (0, number_1.number)(fullLoan.InstallmentAmount),
            TotalAmount: (0, number_1.number)(fullLoan.TotalAmount),
            RemainingAmount: (0, number_1.number)(fullLoan.RemainingAmount),
            PaidAmount: (0, number_1.number)(fullLoan.TotalAmount) - Number(fullLoan.RemainingAmount),
            Progress: Math.round((paidInstallments / TotalInstallments) * 100),
            PaidInstallments: paidInstallments,
            TotalInstallments,
            StartDate: fullLoan.StartDate,
            StatusId: fullLoan.StatusID,
            Status: fullLoan.Status
                ? { ID: fullLoan.Status.ID, Code: fullLoan.Status.Code, Name: fullLoan.Status.Name, Color: fullLoan.Status.Color }
                : null,
            Notes: fullLoan.Notes,
            CreatedAt: fullLoan.CreatedAt,
        };
    }
};
exports.LoanService = LoanService;
exports.LoanService = LoanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoanService);
