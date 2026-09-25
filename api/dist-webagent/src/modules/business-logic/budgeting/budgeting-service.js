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
exports.BudgetingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let BudgetingService = class BudgetingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBudget(dto, UserId) {
        const existing = await this.prisma.budget.findFirst({
            where: {
                Type: dto.Type,
                CategoryID: dto.CategoryId,
                WarehouseID: dto.WarehouseId,
                DepartmentID: dto.DepartmentId,
                OR: [
                    {
                        AND: [
                            { StartDate: { lte: new Date(dto.StartDate) } },
                            { EndDate: { gte: new Date(dto.StartDate) } },
                        ],
                    },
                    {
                        AND: [
                            { StartDate: { lte: new Date(dto.EndDate) } },
                            { EndDate: { gte: new Date(dto.EndDate) } },
                        ],
                    },
                ],
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Budget already exists for this period and scope');
        }
        const Budget = await this.prisma.budget.create({
            data: {
                Name: dto.Name,
                Type: dto.Type,
                StartDate: new Date(dto.StartDate),
                EndDate: new Date(dto.EndDate),
                CategoryID: dto.CategoryId,
                WarehouseID: dto.WarehouseId,
                DepartmentID: dto.DepartmentId,
                BudgetedAmount: new client_1.Prisma.Decimal(dto.BudgetedAmount),
                IsActive: true,
            },
        });
        return {
            success: true,
            Budget: this.formatBudget(Budget),
        };
    }
    async getBudget(BudgetId) {
        const Budget = await this.prisma.budget.findUnique({
            where: { ID: BudgetId },
        });
        if (!Budget) {
            throw new common_1.NotFoundException('Budget not found');
        }
        const Category = Budget.CategoryID
            ? await this.prisma.category.findUnique({ where: { ID: Budget.CategoryID } })
            : null;
        const Warehouse = Budget.WarehouseID
            ? await this.prisma.warehouse.findUnique({ where: { ID: Budget.WarehouseID } })
            : null;
        const Department = Budget.DepartmentID
            ? await this.prisma.department.findUnique({ where: { ID: Budget.DepartmentID } })
            : null;
        return {
            ...this.formatBudget(Budget),
            Category: Category?.Name,
            Warehouse: Warehouse?.Name,
            Department: Department?.Name,
        };
    }
    async listBudgets(dto) {
        const where = {};
        if (dto.Type)
            where.Type = dto.Type;
        if (dto.CategoryId)
            where.CategoryID = dto.CategoryId;
        if (dto.WarehouseId)
            where.WarehouseID = dto.WarehouseId;
        if (dto.DepartmentId)
            where.DepartmentID = dto.DepartmentId;
        if (dto.ActiveOnly !== false)
            where.IsActive = true;
        if (dto.Year) {
            where.StartDate = {
                gte: new Date(`${dto.Year}-01-01`),
                lte: new Date(`${dto.Year}-12-31`),
            };
        }
        const Budgets = await this.prisma.budget.findMany({
            where,
            orderBy: { StartDate: 'desc' },
        });
        const enrichedBudgets = await Promise.all(Budgets.map(async (b) => {
            const Category = b.CategoryID
                ? await this.prisma.category.findUnique({ where: { ID: b.CategoryID } })
                : null;
            const Warehouse = b.WarehouseID
                ? await this.prisma.warehouse.findUnique({ where: { ID: b.WarehouseID } })
                : null;
            const Department = b.DepartmentID
                ? await this.prisma.department.findUnique({ where: { ID: b.DepartmentID } })
                : null;
            return {
                ...this.formatBudget(b),
                Category: Category?.Name,
                Warehouse: Warehouse?.Name,
                Department: Department?.Name,
            };
        }));
        return enrichedBudgets;
    }
    async updateBudget(BudgetId, dto, UserId) {
        const Budget = await this.prisma.budget.findUnique({
            where: { ID: BudgetId },
        });
        if (!Budget) {
            throw new common_1.NotFoundException('Budget not found');
        }
        const updateData = {};
        if (dto.Name)
            updateData.Name = dto.Name;
        if (dto.BudgetedAmount !== undefined)
            updateData.BudgetedAmount = new client_1.Prisma.Decimal(dto.BudgetedAmount);
        if (dto.IsActive !== undefined)
            updateData.IsActive = dto.IsActive;
        if (dto.Description !== undefined)
            updateData.Description = dto.Description;
        const updated = await this.prisma.budget.update({
            where: { ID: BudgetId },
            data: updateData,
        });
        return {
            success: true,
            Budget: this.formatBudget(updated),
        };
    }
    async deleteBudget(BudgetId, UserId) {
        const Budget = await this.prisma.budget.findUnique({
            where: { ID: BudgetId },
        });
        if (!Budget) {
            throw new common_1.NotFoundException('Budget not found');
        }
        await this.prisma.budget.update({
            where: { ID: BudgetId },
            data: { IsActive: false },
        });
        return {
            success: true,
            message: 'Budget deleted successfully',
        };
    }
    async copyBudget(dto, UserId) {
        const sourceBudget = await this.prisma.budget.findUnique({
            where: { ID: dto.SourceBudgetId },
        });
        if (!sourceBudget) {
            throw new common_1.NotFoundException('Source Budget not found');
        }
        const newAmount = dto.AdjustmentPercent
            ? Number(sourceBudget.BudgetedAmount) * (1 + dto.AdjustmentPercent / 100)
            : Number(sourceBudget.BudgetedAmount);
        const newBudget = await this.prisma.budget.create({
            data: {
                Name: sourceBudget.Name,
                Type: sourceBudget.Type,
                StartDate: new Date(dto.NewStartDate),
                EndDate: new Date(dto.NewEndDate),
                CategoryID: sourceBudget.CategoryID,
                WarehouseID: sourceBudget.WarehouseID,
                DepartmentID: sourceBudget.DepartmentID,
                BudgetedAmount: new client_1.Prisma.Decimal(newAmount),
                IsActive: true,
            },
        });
        return {
            success: true,
            Budget: this.formatBudget(newBudget),
        };
    }
    async createSalesTarget(dto, UserId) {
        const Target = await this.prisma.salesTarget.create({
            data: {
                Name: dto.Name,
                Type: dto.Type,
                StartDate: new Date(dto.StartDate),
                EndDate: new Date(dto.EndDate),
                EmployeeID: dto.EmployeeId,
                WarehouseID: dto.WarehouseId,
                CategoryID: dto.CategoryId,
                TargetRevenue: new client_1.Prisma.Decimal(dto.TargetRevenue),
                TargetQuantity: dto.TargetQuantity ? new client_1.Prisma.Decimal(dto.TargetQuantity) : undefined,
                IsActive: true,
            },
        });
        return {
            success: true,
            Target: this.formatSalesTarget(Target),
        };
    }
    async getSalesTarget(TargetId) {
        const Target = await this.prisma.salesTarget.findUnique({
            where: { ID: TargetId },
        });
        if (!Target) {
            throw new common_1.NotFoundException('Sales Target not found');
        }
        const Employee = Target.EmployeeID
            ? await this.prisma.employee.findUnique({ where: { ID: Target.EmployeeID } })
            : null;
        const Warehouse = Target.WarehouseID
            ? await this.prisma.warehouse.findUnique({ where: { ID: Target.WarehouseID } })
            : null;
        const Category = Target.CategoryID
            ? await this.prisma.category.findUnique({ where: { ID: Target.CategoryID } })
            : null;
        return {
            ...this.formatSalesTarget(Target),
            EmployeeName: Employee?.Name,
            Warehouse: Warehouse?.Name,
            Category: Category?.Name,
        };
    }
    async listSalesTargets(dto) {
        const where = {};
        if (dto.EmployeeId)
            where.EmployeeID = dto.EmployeeId;
        if (dto.WarehouseId)
            where.WarehouseID = dto.WarehouseId;
        if (dto.ActiveOnly !== false)
            where.IsActive = true;
        if (dto.Year) {
            where.StartDate = {
                gte: new Date(`${dto.Year}-01-01`),
                lte: dto.Month
                    ? new Date(`${dto.Year}-${String(dto.Month).padStart(2, '0')}-31`)
                    : new Date(`${dto.Year}-12-31`),
            };
        }
        const Targets = await this.prisma.salesTarget.findMany({
            where,
            orderBy: { StartDate: 'desc' },
        });
        const enrichedTargets = await Promise.all(Targets.map(async (t) => {
            const Employee = t.EmployeeID
                ? await this.prisma.employee.findUnique({ where: { ID: t.EmployeeID } })
                : null;
            const Warehouse = t.WarehouseID
                ? await this.prisma.warehouse.findUnique({ where: { ID: t.WarehouseID } })
                : null;
            const Category = t.CategoryID
                ? await this.prisma.category.findUnique({ where: { ID: t.CategoryID } })
                : null;
            return {
                ...this.formatSalesTarget(t),
                EmployeeName: Employee?.Name,
                Warehouse: Warehouse?.Name,
                Category: Category?.Name,
            };
        }));
        return enrichedTargets;
    }
    async updateSalesTarget(TargetId, dto, UserId) {
        const Target = await this.prisma.salesTarget.findUnique({
            where: { ID: TargetId },
        });
        if (!Target) {
            throw new common_1.NotFoundException('Sales Target not found');
        }
        const updateData = {};
        if (dto.Name)
            updateData.Name = dto.Name;
        if (dto.TargetRevenue !== undefined)
            updateData.TargetRevenue = new client_1.Prisma.Decimal(dto.TargetRevenue);
        if (dto.TargetQuantity !== undefined)
            updateData.TargetQuantity = new client_1.Prisma.Decimal(dto.TargetQuantity);
        if (dto.IsActive !== undefined)
            updateData.IsActive = dto.IsActive;
        const updated = await this.prisma.salesTarget.update({
            where: { ID: TargetId },
            data: updateData,
        });
        return {
            success: true,
            Target: this.formatSalesTarget(updated),
        };
    }
    async recalculateTargets(TargetId) {
        const Target = await this.prisma.salesTarget.findUnique({
            where: { ID: TargetId },
        });
        if (!Target) {
            throw new common_1.NotFoundException('Target not found');
        }
        const SalesWhere = {
            Date: {
                gte: Target.StartDate,
                lte: Target.EndDate,
            },
            IsReturn: false,
        };
        if (Target.EmployeeID)
            SalesWhere.SalesPersonID = Target.EmployeeID;
        if (Target.WarehouseID)
            SalesWhere.WarehouseID = Target.WarehouseID;
        const Sales = await this.prisma.sale.findMany({
            where: SalesWhere,
            include: {
                SaleItems: {
                    include: { Product: true },
                },
            },
        });
        let actualRevenue = 0;
        let actualQuantity = 0;
        for (const Sale of Sales) {
            actualRevenue += Number(Sale.Total);
            for (const item of Sale.SaleItems) {
                if (Target.CategoryID && item.Product?.CategoryID !== Target.CategoryID)
                    continue;
                actualQuantity += Number(item.Quantity);
            }
        }
        return {
            success: true,
            TargetId: Target.ID,
            actualRevenue,
            actualQuantity,
            revenueAchievement: Number(Target.TargetRevenue) > 0
                ? Math.round((actualRevenue / Number(Target.TargetRevenue)) * 10000) / 100
                : 0,
        };
    }
    async getBudgetComparison(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : new Date();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        endDate.setHours(23, 59, 59, 999);
        const where = {
            IsActive: true,
            StartDate: { lte: endDate },
            EndDate: { gte: startDate },
        };
        if (dto.BudgetId)
            where.ID = dto.BudgetId;
        if (dto.CategoryId)
            where.CategoryID = dto.CategoryId;
        if (dto.DepartmentId)
            where.DepartmentID = dto.DepartmentId;
        const Budgets = await this.prisma.budget.findMany({
            where,
        });
        const comparison = [];
        for (const Budget of Budgets) {
            const Category = Budget.CategoryID
                ? await this.prisma.category.findUnique({ where: { ID: Budget.CategoryID } })
                : null;
            const Department = Budget.DepartmentID
                ? await this.prisma.department.findUnique({ where: { ID: Budget.DepartmentID } })
                : null;
            const expenses = await this.prisma.expense.findMany({
                where: {
                    Date: {
                        gte: new Date(Math.max(new Date(Budget.StartDate).getTime(), startDate.getTime())),
                        lte: new Date(Math.min(new Date(Budget.EndDate).getTime(), endDate.getTime())),
                    },
                    IsActive: true,
                    ...(Budget.CategoryID ? { ExpenseCategoryID: Budget.CategoryID } : {}),
                },
            });
            const actualSpent = expenses.reduce((sum, e) => sum + Number(e.Amount), 0);
            const Budgeted = Number(Budget.BudgetedAmount);
            const variance = actualSpent - Budgeted;
            const variancePercent = Budgeted > 0 ? (variance / Budgeted) * 100 : 0;
            comparison.push({
                BudgetId: Budget.ID,
                Name: Budget.Name,
                Type: Budget.Type,
                Category: Category?.Name,
                Department: Department?.Name,
                BudgetedAmount: Budgeted,
                actualSpent,
                variance,
                variancePercent: Math.round(variancePercent * 100) / 100,
                remainingBudget: Budgeted - actualSpent,
                utilizationPercent: Budgeted > 0 ? Math.round((actualSpent / Budgeted) * 10000) / 100 : 0,
                Status: actualSpent > Budgeted ? 'OVER_BUDGET' : actualSpent >= Budgeted * 0.9 ? 'WARNING' : 'ON_TRACK',
            });
        }
        const Summary = {
            TotalBudgeted: comparison.reduce((sum, c) => sum + c.BudgetedAmount, 0),
            TotalSpent: comparison.reduce((sum, c) => sum + c.actualSpent, 0),
            TotalVariance: comparison.reduce((sum, c) => sum + c.variance, 0),
            overBudgetCount: comparison.filter((c) => c.Status === 'OVER_BUDGET').length,
            onTrackCount: comparison.filter((c) => c.Status === 'ON_TRACK').length,
            warningCount: comparison.filter((c) => c.Status === 'WARNING').length,
        };
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            Summary,
            comparison,
        };
    }
    async getSalesTargetReport(dto) {
        const where = { IsActive: true };
        if (dto.Year) {
            where.StartDate = {
                gte: new Date(`${dto.Year}-01-01`),
                lte: dto.Month
                    ? new Date(`${dto.Year}-${String(dto.Month).padStart(2, '0')}-31`)
                    : new Date(`${dto.Year}-12-31`),
            };
        }
        if (dto.EmployeeId)
            where.EmployeeID = dto.EmployeeId;
        if (dto.WarehouseId)
            where.WarehouseID = dto.WarehouseId;
        const Targets = await this.prisma.salesTarget.findMany({
            where,
        });
        const Report = [];
        for (const Target of Targets) {
            const Employee = Target.EmployeeID
                ? await this.prisma.employee.findUnique({ where: { ID: Target.EmployeeID } })
                : null;
            const Warehouse = Target.WarehouseID
                ? await this.prisma.warehouse.findUnique({ where: { ID: Target.WarehouseID } })
                : null;
            const Category = Target.CategoryID
                ? await this.prisma.category.findUnique({ where: { ID: Target.CategoryID } })
                : null;
            const SalesWhere = {
                Date: { gte: Target.StartDate, lte: Target.EndDate },
                IsReturn: false,
            };
            if (Target.EmployeeID)
                SalesWhere.SalesPersonID = Target.EmployeeID;
            if (Target.WarehouseID)
                SalesWhere.WarehouseID = Target.WarehouseID;
            const Sales = await this.prisma.sale.findMany({
                where: SalesWhere,
                include: { SaleItems: { include: { Product: true } } },
            });
            let actualRevenue = 0;
            let actualQuantity = 0;
            for (const Sale of Sales) {
                actualRevenue += Number(Sale.Total);
                for (const item of Sale.SaleItems) {
                    if (Target.CategoryID && item.Product?.CategoryID !== Target.CategoryID)
                        continue;
                    actualQuantity += Number(item.Quantity);
                }
            }
            const TargetRevenue = Number(Target.TargetRevenue);
            const TargetQuantity = Target.TargetQuantity ? Number(Target.TargetQuantity) : 0;
            const revenueAchievement = TargetRevenue > 0 ? (actualRevenue / TargetRevenue) * 100 : 0;
            const QuantityAchievement = TargetQuantity > 0 ? (actualQuantity / TargetQuantity) * 100 : 0;
            const item = {
                TargetId: Target.ID,
                Name: Target.Name,
                Type: Target.Type,
                EmployeeName: Employee?.Name,
                Warehouse: Warehouse?.Name,
                Category: Category?.Name,
                period: `${Target.StartDate.toISOString().split('T')[0]} to ${Target.EndDate.toISOString().split('T')[0]}`,
                TargetRevenue,
                actualRevenue,
                revenueAchievement: Math.round(revenueAchievement * 100) / 100,
                TargetQuantity,
                actualQuantity,
                QuantityAchievement: Math.round(QuantityAchievement * 100) / 100,
                Status: revenueAchievement >= 100
                    ? 'ACHIEVED'
                    : revenueAchievement >= 80
                        ? 'ON_TRACK'
                        : revenueAchievement >= 50
                            ? 'BEHIND'
                            : 'CRITICAL',
            };
            if (dto.UnderperformingOnly && item.Status !== 'CRITICAL' && item.Status !== 'BEHIND') {
                continue;
            }
            Report.push(item);
        }
        const Summary = {
            TotalTargets: Report.length,
            achievedCount: Report.filter((r) => r.Status === 'ACHIEVED').length,
            onTrackCount: Report.filter((r) => r.Status === 'ON_TRACK').length,
            behindCount: Report.filter((r) => r.Status === 'BEHIND').length,
            criticalCount: Report.filter((r) => r.Status === 'CRITICAL').length,
            averageAchievement: Report.length > 0
                ? Report.reduce((sum, r) => sum + r.revenueAchievement, 0) / Report.length
                : 0,
        };
        return {
            period: dto.Year ? { year: dto.Year, month: dto.Month } : null,
            Summary,
            Report,
        };
    }
    async getBudgetAlerts(dto) {
        const threshold = dto.Threshold || 80;
        const today = new Date();
        const where = {
            IsActive: true,
            EndDate: { gte: today },
        };
        if (dto.BudgetId)
            where.ID = dto.BudgetId;
        const Budgets = await this.prisma.budget.findMany({ where });
        const Alerts = [];
        for (const Budget of Budgets) {
            const expenses = await this.prisma.expense.findMany({
                where: {
                    Date: { gte: Budget.StartDate, lte: Budget.EndDate },
                    IsActive: true,
                },
            });
            const actualSpent = expenses.reduce((sum, e) => sum + Number(e.Amount), 0);
            const Budgeted = Number(Budget.BudgetedAmount);
            const utilization = Budgeted > 0 ? (actualSpent / Budgeted) * 100 : 0;
            if (utilization >= threshold) {
                Alerts.push({
                    BudgetId: Budget.ID,
                    Name: Budget.Name,
                    Category: Budget.CategoryID,
                    Department: Budget.DepartmentID,
                    BudgetedAmount: Budgeted,
                    spentAmount: actualSpent,
                    remainingAmount: Budgeted - actualSpent,
                    utilizationPercent: Math.round(utilization * 100) / 100,
                    AlertLevel: utilization >= 100 ? 'CRITICAL' : utilization >= 90 ? 'WARNING' : 'INFO',
                    message: utilization >= 100
                        ? `Budget ${Budget.Name} has exceeded the limit!`
                        : `Budget ${Budget.Name} has used ${Math.round(utilization)}% of allocated Amount`,
                });
            }
        }
        return {
            threshold,
            AlertCount: Alerts.length,
            Alerts: Alerts.sort((a, b) => b.utilizationPercent - a.utilizationPercent),
        };
    }
    formatBudget(Budget) {
        return {
            ID: Budget.ID,
            Name: Budget.Name,
            Type: Budget.Type,
            startDate: Budget.StartDate,
            endDate: Budget.EndDate,
            BudgetedAmount: (0, number_1.number)(Budget.BudgetedAmount),
            spentAmount: (0, number_1.number)(Budget.SpentAmount),
            remainingAmount: (0, number_1.number)(Budget.BudgetedAmount) - Number(Budget.SpentAmount),
            utilizationPercent: Number(Budget.BudgetedAmount) > 0
                ? Math.round((Number(Budget.SpentAmount) / Number(Budget.BudgetedAmount)) * 10000) / 100
                : 0,
            IsActive: Budget.IsActive,
            Description: Budget.Description,
            createdAt: Budget.CreatedAt,
        };
    }
    formatSalesTarget(Target) {
        const TargetRevenue = Number(Target.TargetRevenue);
        const actualRevenue = Number(Target.ActualRevenue);
        const revenueAchievement = TargetRevenue > 0 ? (actualRevenue / TargetRevenue) * 100 : 0;
        return {
            ID: Target.ID,
            Name: Target.Name,
            Type: Target.Type,
            startDate: Target.StartDate,
            endDate: Target.EndDate,
            TargetRevenue,
            actualRevenue,
            TargetQuantity: Target.TargetQuantity ? Number(Target.TargetQuantity) : null,
            actualQuantity: Target.ActualQuantity ? Number(Target.ActualQuantity) : null,
            revenueAchievement: Math.round(revenueAchievement * 100) / 100,
            IsActive: Target.IsActive,
            Description: Target.Description,
            createdAt: Target.CreatedAt,
        };
    }
};
exports.BudgetingService = BudgetingService;
exports.BudgetingService = BudgetingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BudgetingService);
