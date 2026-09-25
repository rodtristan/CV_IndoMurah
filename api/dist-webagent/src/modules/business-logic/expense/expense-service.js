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
exports.ExpenseService = void 0;
const common_1 = require("@nestjs/common");
const date_range_1 = require("../shared/date-range");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let ExpenseService = class ExpenseService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCategory(dto) {
        const existing = await this.prisma.expenseCategory.findUnique({
            where: { Code: dto.Code },
        });
        if (existing) {
            throw new common_1.BadRequestException('Category Code already exists');
        }
        const Category = await this.prisma.expenseCategory.create({
            data: {
                Code: dto.Code,
                Name: dto.Name,
                Description: dto.Description,
            },
        });
        return {
            success: true,
            Category: {
                ID: Category.ID,
                Code: Category.Code,
                Name: Category.Name,
                Description: Category.Description,
            },
        };
    }
    async listCategories() {
        const Categories = await this.prisma.expenseCategory.findMany({
            where: { IsActive: true },
            orderBy: { Name: 'asc' },
        });
        return Categories.map((c) => ({
            ID: c.ID,
            Code: c.Code,
            Name: c.Name,
            Description: c.Description,
        }));
    }
    async createExpense(dto, UserId) {
        const Category = await this.prisma.expenseCategory.findUnique({
            where: { ID: dto.CategoryId },
        });
        if (!Category) {
            throw new common_1.NotFoundException('Expense Category not found');
        }
        const Code = await this.generateExpenseCode();
        const expense = await this.prisma.expense.create({
            data: {
                Code: Code,
                Date: new Date(dto.Date),
                ExpenseCategoryID: dto.CategoryId,
                Amount: new client_1.Prisma.Decimal(dto.Amount),
                Description: dto.Description,
                ReferenceNumber: dto.ReferenceNumber,
                Notes: dto.Notes,
                IsApproved: false,
            },
            include: {
                ExpenseCategory: true,
            },
        });
        return {
            success: true,
            expense: {
                ID: expense.ID,
                Code: expense.Code,
                Date: expense.Date,
                Category: expense.ExpenseCategory.Name,
                Amount: (0, number_1.number)(expense.Amount),
                Description: expense.Description,
                referenceNumber: expense.ReferenceNumber,
                IsApproved: expense.IsApproved,
            },
        };
    }
    async bulkCreateExpenses(dto, UserId) {
        const Results = [];
        for (const expenseDto of dto.Expenses) {
            try {
                const Result = await this.createExpense(expenseDto, UserId);
                Results.push({ success: true, ...Result.expense });
            }
            catch (error) {
                Results.push({
                    success: false,
                    description: expenseDto.Description,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return {
            success: true,
            Total: dto.Expenses.length,
            succeeded: Results.filter((r) => r.success).length,
            failed: Results.filter((r) => !r.success).length,
            Results,
        };
    }
    async approveExpense(expenseId, dto, UserId) {
        const expense = await this.prisma.expense.findUnique({
            where: { ID: expenseId },
        });
        if (!expense) {
            throw new common_1.NotFoundException('Expense not found');
        }
        if (expense.IsApproved) {
            throw new common_1.BadRequestException('Expense already approved');
        }
        await this.prisma.expense.update({
            where: { ID: expenseId },
            data: {
                IsApproved: true,
                ApprovedByID: UserId,
                ApprovedAt: new Date(),
                Notes: dto.Notes || expense.Notes,
            },
        });
        return {
            success: true,
            expenseId,
            Code: expense.Code,
            Amount: (0, number_1.number)(expense.Amount),
            approvedBy: UserId,
        };
    }
    async bulkApproveExpenses(expenseIds, UserId) {
        const Results = [];
        for (const ID of expenseIds) {
            try {
                const expense = await this.prisma.expense.findUnique({
                    where: { ID: ID },
                });
                if (!expense) {
                    Results.push({ success: false, ID, error: 'Not found' });
                    continue;
                }
                if (expense.IsApproved) {
                    Results.push({ success: false, ID, error: 'Already approved' });
                    continue;
                }
                await this.prisma.expense.update({
                    where: { ID: ID },
                    data: {
                        IsApproved: true,
                        ApprovedByID: UserId,
                        ApprovedAt: new Date(),
                    },
                });
                Results.push({ success: true, ID, Code: expense.Code });
            }
            catch (error) {
                Results.push({
                    success: false,
                    ID,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return {
            success: true,
            Total: expenseIds.length,
            succeeded: Results.filter((r) => r.success).length,
            failed: Results.filter((r) => !r.success).length,
            Results,
        };
    }
    async listExpenses(dto) {
        const where = {};
        if (dto.CategoryId) {
            where.ExpenseCategoryID = dto.CategoryId;
        }
        if (dto.ApprovedOnly) {
            where.IsApproved = true;
        }
        if (dto.PendingOnly) {
            where.IsApproved = false;
        }
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.Date.lte = new Date(dto.EndDate);
            }
        }
        const expenses = await this.prisma.expense.findMany({
            where,
            include: {
                ExpenseCategory: true,
                Approver: true,
            },
            orderBy: { Date: 'desc' },
        });
        return expenses.map((e) => ({
            ID: e.ID,
            Code: e.Code,
            Date: e.Date,
            Category: e.ExpenseCategory.Name,
            Amount: (0, number_1.number)(e.Amount),
            Description: e.Description,
            referenceNumber: e.ReferenceNumber,
            IsApproved: e.IsApproved,
            approvedBy: e.Approver?.Name || null,
            approvedAt: e.ApprovedAt,
            Notes: e.Notes,
        }));
    }
    async getExpense(expenseId) {
        const expense = await this.prisma.expense.findUnique({
            where: { ID: expenseId },
            include: {
                ExpenseCategory: true,
                Approver: true,
            },
        });
        if (!expense) {
            throw new common_1.NotFoundException('Expense not found');
        }
        return {
            ID: expense.ID,
            Code: expense.Code,
            Date: expense.Date,
            Category: expense.ExpenseCategory,
            Amount: (0, number_1.number)(expense.Amount),
            Description: expense.Description,
            referenceNumber: expense.ReferenceNumber,
            IsApproved: expense.IsApproved,
            approvedBy: expense.Approver,
            approvedAt: expense.ApprovedAt,
            Notes: expense.Notes,
        };
    }
    async getExpenseSummary(startDate, endDate) {
        const { start, end } = (0, date_range_1.resolveDateRange)(startDate, endDate);
        const where = {
            Date: {
                gte: start,
                lte: end,
            },
        };
        const expenses = await this.prisma.expense.findMany({
            where,
            include: { ExpenseCategory: true },
        });
        const byCategory = {};
        let TotalAmount = 0;
        let approvedAmount = 0;
        let pendingAmount = 0;
        for (const expense of expenses) {
            const CategoryName = expense.ExpenseCategory.Name;
            if (!byCategory[CategoryName]) {
                byCategory[CategoryName] = {
                    Category: CategoryName,
                    Count: 0,
                    TotalAmount: 0,
                    approvedAmount: 0,
                    pendingAmount: 0,
                };
            }
            const Amount = Number(expense.Amount);
            byCategory[CategoryName].Count++;
            byCategory[CategoryName].TotalAmount += Amount;
            TotalAmount += Amount;
            if (expense.IsApproved) {
                byCategory[CategoryName].approvedAmount += Amount;
                approvedAmount += Amount;
            }
            else {
                byCategory[CategoryName].pendingAmount += Amount;
                pendingAmount += Amount;
            }
        }
        return {
            period: { startDate, endDate },
            Summary: {
                TotalCount: expenses.length,
                TotalAmount,
                approvedAmount,
                pendingAmount,
            },
            byCategory: Object.values(byCategory),
        };
    }
    async generateExpenseCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `EXP-${year}${month}`;
        const lastExpense = await this.prisma.expense.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastExpense) {
            const lastSeq = parseInt(lastExpense.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.ExpenseService = ExpenseService;
exports.ExpenseService = ExpenseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpenseService);
