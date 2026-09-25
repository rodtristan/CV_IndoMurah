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
exports.WorkOrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
const date_range_1 = require("../shared/date-range");
let WorkOrderService = class WorkOrderService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createWorkOrder(dto, UserId) {
        const workOrdernumber = await this.generateWorkOrderNumber();
        const pendingStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'PENDING' },
        });
        let estimatedCost = 0;
        let itemsWithDetails = [];
        for (const item of dto.Items) {
            const Product = await this.prisma.product.findUnique({
                where: { ID: item.ProductId },
            });
            if (!Product) {
                throw new common_1.NotFoundException(`Product ${item.ProductId} not found`);
            }
            if (item.BOMId) {
                const BOM = await this.prisma.bOM.findUnique({
                    where: { ID: item.BOMId },
                });
                if (BOM) {
                    estimatedCost += Number(BOM.TotalCost) * item.Quantity;
                }
            }
            estimatedCost += Number(Product.PurchasePrice) * item.Quantity;
            itemsWithDetails.push({
                ProductId: item.ProductId,
                ProductName: Product.Name,
                Quantity: item.Quantity,
                UnitId: item.UnitId || Product.UnitID,
                UnitPrice: (0, number_1.number)(Product.PurchasePrice),
                subTotal: (0, number_1.number)(Product.PurchasePrice) * item.Quantity,
            });
        }
        const workOrder = await this.prisma.$transaction(async (tx) => {
            const newWorkOrder = await tx.workOrder.create({
                data: {
                    WorkOrderNumber: workOrdernumber,
                    WorkOrderDate: new Date(dto.WorkOrderDate),
                    DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
                    ProductionID: dto.ProductionId || null,
                    WarehouseID: dto.WarehouseId || null,
                    AssignedToID: dto.AssignedToId || null,
                    StatusID: pendingStatus?.ID || 1,
                    Priority: dto.Priority || 'NORMAL',
                    EstimatedCost: new client_1.Prisma.Decimal(estimatedCost),
                    Notes: dto.Notes,
                    CreatedByID: UserId,
                },
            });
            await tx.workOrderItem.createMany({
                data: itemsWithDetails.map((item, index) => ({
                    WorkOrderID: newWorkOrder.ID,
                    ProductID: item.ProductId,
                    ProductName: item.ProductName,
                    Quantity: new client_1.Prisma.Decimal(item.Quantity),
                    UnitID: item.UnitId,
                    UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice),
                    SubTotal: new client_1.Prisma.Decimal(item.subTotal),
                    SortOrder: index + 1,
                })),
            });
            return newWorkOrder;
        });
        return {
            success: true,
            workOrder: {
                ID: workOrder.ID,
                workOrderNumber: workOrder.WorkOrderNumber,
                workOrderDate: workOrder.WorkOrderDate,
                dueDate: workOrder.DueDate,
                Status: pendingStatus?.Name || 'Pending',
                priority: workOrder.Priority,
                estimatedCost,
                itemCount: dto.Items.length,
            },
        };
    }
    async getWorkOrder(workOrderId) {
        const workOrder = await this.prisma.workOrder.findUnique({
            where: { ID: workOrderId },
            include: {
                Production: true,
                Warehouse: true,
                Status: true,
                Items: { include: { Product: true, Unit: true }, orderBy: { SortOrder: 'asc' } },
                ProgressRecords: { include: { WorkStation: true, Employee: true }, orderBy: { CreatedAt: 'desc' } },
                MaterialAllocations: { include: { Product: true } },
            },
        });
        if (!workOrder) {
            throw new common_1.NotFoundException('Work Order not found');
        }
        const TotalCompleted = workOrder.ProgressRecords.reduce((sum, p) => sum + Number(p.CompletedQuantity), 0);
        return {
            ID: workOrder.ID,
            workOrderNumber: workOrder.WorkOrderNumber,
            workOrderDate: workOrder.WorkOrderDate,
            dueDate: workOrder.DueDate,
            Production: workOrder.Production?.Code,
            Warehouse: workOrder.Warehouse?.Name,
            assignedToId: workOrder.AssignedToID,
            Status: workOrder.Status?.Name,
            StatusCode: workOrder.Status?.Code,
            priority: workOrder.Priority,
            estimatedCost: (0, number_1.number)(workOrder.EstimatedCost),
            Notes: workOrder.Notes,
            items: workOrder.Items.map((item) => ({
                ID: item.ID,
                ProductId: item.ProductID,
                ProductName: item.Product?.Name || item.ProductName,
                ProductCode: item.Product?.Code,
                Quantity: (0, number_1.number)(item.Quantity),
                Unit: item.Unit?.Name,
                UnitPrice: (0, number_1.number)(item.UnitPrice),
                subTotal: (0, number_1.number)(item.Subtotal),
                completedQuantity: workOrder.ProgressRecords
                    .filter((p) => p.ProductID === item.ProductID)
                    .reduce((sum, p) => sum + Number(p.CompletedQuantity), 0),
            })),
            TotalQuantity: workOrder.Items.reduce((sum, i) => sum + Number(i.Quantity), 0),
            completedQuantity: TotalCompleted,
            progressPercent: workOrder.Items.reduce((sum, i) => sum + Number(i.Quantity), 0) > 0
                ? (TotalCompleted /
                    workOrder.Items.reduce((sum, i) => sum + Number(i.Quantity), 0)) *
                    100
                : 0,
            MaterialAllocations: workOrder.MaterialAllocations.map((m) => ({
                ProductId: m.ProductID,
                ProductName: m.Product?.Name,
                allocatedQuantity: (0, number_1.number)(m.AllocatedQuantity),
                usedQuantity: (0, number_1.number)(m.UsedQuantity),
            })),
            ProgressRecords: workOrder.ProgressRecords.map((p) => ({
                ID: p.ID,
                completedQuantity: (0, number_1.number)(p.CompletedQuantity),
                workStation: p.WorkStation?.Name,
                Employee: p.Employee?.Name,
                Notes: p.Notes,
                RecordedAt: p.CreatedAt,
            })),
            isOverdue: workOrder.DueDate && new Date(workOrder.DueDate) < new Date() && workOrder.Status?.Code !== 'COMPLETED',
        };
    }
    async listWorkOrders(dto) {
        const where = {};
        if (dto.StartDate || dto.EndDate) {
            where.WorkOrderDate = {};
            if (dto.StartDate) {
                where.WorkOrderDate.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.WorkOrderDate.lte = new Date(dto.EndDate);
            }
        }
        if (dto.status) {
            where.Status = { Code: dto.status };
        }
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        if (dto.AssignedToId) {
            where.AssignedToID = dto.AssignedToId;
        }
        if (dto.Priority) {
            where.Priority = dto.Priority;
        }
        if (dto.OverdueOnly) {
            where.DueDate = { lt: new Date() };
            where.Status = { IsTerminal: false };
        }
        const WorkOrders = await this.prisma.workOrder.findMany({
            where,
            include: {
                Production: true,
                Warehouse: true,
                Status: true,
                Items: true,
                ProgressRecords: true,
            },
            orderBy: [
                { Priority: 'desc' },
                { DueDate: 'asc' },
                { WorkOrderDate: 'desc' },
            ],
        });
        return WorkOrders.map((wo) => {
            const TotalQuantity = wo.Items.reduce((sum, i) => sum + Number(i.Quantity), 0);
            const completedQuantity = wo.ProgressRecords.reduce((sum, p) => sum + Number(p.CompletedQuantity), 0);
            return {
                ID: wo.ID,
                workOrderNumber: wo.WorkOrderNumber,
                workOrderDate: wo.WorkOrderDate,
                dueDate: wo.DueDate,
                Production: wo.Production?.Code,
                Warehouse: wo.Warehouse?.Name,
                assignedToId: wo.AssignedToID,
                Status: wo.Status?.Name,
                StatusColor: wo.Status?.Color,
                priority: wo.Priority,
                itemCount: wo.Items.length,
                TotalQuantity,
                completedQuantity,
                progressPercent: TotalQuantity > 0 ? (completedQuantity / TotalQuantity) * 100 : 0,
                isOverdue: wo.DueDate && new Date(wo.DueDate) < new Date() && !wo.Status?.IsTerminal,
            };
        });
    }
    async updateWorkOrder(workOrderId, dto, UserId) {
        const workOrder = await this.prisma.workOrder.findUnique({
            where: { ID: workOrderId },
            include: { Status: true },
        });
        if (!workOrder) {
            throw new common_1.NotFoundException('Work Order not found');
        }
        const updated = await this.prisma.workOrder.update({
            where: { ID: workOrderId },
            data: {
                DueDate: dto.DueDate ? new Date(dto.DueDate) : undefined,
                AssignedToID: dto.AssignedToId,
                Priority: dto.Priority,
                Notes: dto.Notes,
                StatusID: dto.status
                    ? (await this.prisma.transactionStatus.findFirst({ where: { Code: dto.status } }))?.ID
                    : undefined,
            },
            include: { Status: true },
        });
        return {
            success: true,
            workOrder: {
                ID: updated.ID,
                workOrderNumber: updated.WorkOrderNumber,
                dueDate: updated.DueDate,
                assignedTo: updated.AssignedToID,
                priority: updated.Priority,
                Status: updated.Status?.Name,
            },
        };
    }
    async cancelWorkOrder(workOrderId, reason, UserId) {
        const workOrder = await this.prisma.workOrder.findUnique({
            where: { ID: workOrderId },
            include: { Status: true },
        });
        if (!workOrder) {
            throw new common_1.NotFoundException('Work Order not found');
        }
        if (workOrder.Status?.IsTerminal) {
            throw new common_1.BadRequestException('Cannot cancel completed work Order');
        }
        const cancelledStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'CANCELLED' },
        });
        const updated = await this.prisma.workOrder.update({
            where: { ID: workOrderId },
            data: {
                StatusID: cancelledStatus?.ID,
                Notes: `Cancelled: ${reason}. ${workOrder.Notes || ''}`,
                CancelledByID: UserId,
                CancelledAt: new Date(),
            },
        });
        await this.prisma.materialAllocation.updateMany({
            where: { WorkOrderID: workOrderId },
            data: { Status: 'CANCELLED' },
        });
        return {
            success: true,
            workOrderId,
            Status: 'CANCELLED',
        };
    }
    async scheduleWorkOrder(dto, UserId) {
        const workOrder = await this.prisma.workOrder.findUnique({
            where: { ID: dto.workOrderId },
        });
        if (!workOrder) {
            throw new common_1.NotFoundException('Work Order not found');
        }
        const ScheduledStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'SCHEDULED' },
        });
        const updated = await this.prisma.$transaction(async (tx) => {
            const wo = await tx.workOrder.update({
                where: { ID: dto.workOrderId },
                data: {
                    ScheduledStartDate: new Date(dto.scheduledStartDate),
                    ScheduledEndDate: new Date(dto.scheduledEndDate),
                    StatusID: ScheduledStatus?.ID || workOrder.StatusID,
                },
            });
            if (dto.resources) {
                await tx.workOrderSchedule.deleteMany({
                    where: { WorkOrderID: dto.workOrderId },
                });
                await tx.workOrderSchedule.createMany({
                    data: dto.resources.map((r) => ({
                        WorkOrderID: dto.workOrderId,
                        ResourceType: r.resourceType,
                        ResourceID: r.resourceId,
                        AllocatedHours: r.AllocatedHours,
                    })),
                });
            }
            return wo;
        });
        return {
            success: true,
            workOrderId: dto.workOrderId,
            workOrderNumber: updated.WorkOrderNumber,
            ScheduledStartDate: updated.ScheduledStartDate,
            ScheduledEndDate: updated.ScheduledEndDate,
        };
    }
    async getWorkOrderSchedule(dto) {
        const where = {
            WorkOrderDate: { gte: new Date(dto.StartDate), lte: new Date(dto.EndDate) },
        };
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        const WorkOrders = await this.prisma.workOrder.findMany({
            where,
            include: {
                Production: true,
                Warehouse: true,
                Status: true,
                Items: { include: { Product: true } },
                Schedules: true,
            },
            orderBy: { ScheduledStartDate: 'asc' },
        });
        const ScheduleByDate = {};
        for (const wo of WorkOrders) {
            const startDate = wo.ScheduledStartDate?.toISOString().split('T')[0] || wo.WorkOrderDate.toISOString().split('T')[0];
            const endDate = wo.ScheduledEndDate?.toISOString().split('T')[0] || startDate;
            const currentDate = new Date(startDate);
            const end = new Date(endDate);
            while (currentDate <= end) {
                const DateKey = currentDate.toISOString().split('T')[0];
                if (!ScheduleByDate[DateKey]) {
                    ScheduleByDate[DateKey] = [];
                }
                ScheduleByDate[DateKey].push({
                    ID: wo.ID,
                    workOrderNumber: wo.WorkOrderNumber,
                    priority: wo.Priority,
                    Status: wo.Status?.Name,
                    Production: wo.Production?.Code,
                    assignedToId: wo.AssignedToID,
                    itemCount: wo.Items.length,
                    Products: wo.Items.slice(0, 3).map((i) => i.Product?.Name),
                    resources: wo.Schedules.map((s) => ({
                        Type: s.ResourceType,
                        resourceId: s.ResourceID,
                    })),
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            ScheduleByDate,
            WorkOrders: WorkOrders.map((wo) => ({
                ID: wo.ID,
                workOrderNumber: wo.WorkOrderNumber,
                workOrderDate: wo.WorkOrderDate,
                ScheduledStartDate: wo.ScheduledStartDate,
                ScheduledEndDate: wo.ScheduledEndDate,
                dueDate: wo.DueDate,
                priority: wo.Priority,
                Status: wo.Status?.Name,
                Production: wo.Production?.Code,
                Warehouse: wo.Warehouse?.Name,
                assignedToId: wo.AssignedToID,
                items: wo.Items.map((i) => i.Product?.Name),
            })),
        };
    }
    async recordProgress(dto, UserId) {
        const workOrder = await this.prisma.workOrder.findUnique({
            where: { ID: dto.workOrderId },
            include: { Items: true, ProgressRecords: true },
        });
        if (!workOrder) {
            throw new common_1.NotFoundException('Work Order not found');
        }
        const currentCompleted = workOrder.ProgressRecords.reduce((sum, p) => sum + Number(p.CompletedQuantity), 0);
        const TotalQuantity = workOrder.Items.reduce((sum, i) => sum + Number(i.Quantity), 0);
        if (dto.CompletedQuantity + currentCompleted > TotalQuantity) {
            throw new common_1.BadRequestException(`Cannot exceed Total Quantity. Current: ${currentCompleted}, Requested: ${dto.CompletedQuantity}, Total: ${TotalQuantity}`);
        }
        const progress = await this.prisma.$transaction(async (tx) => {
            const newProgress = await tx.progressRecord.create({
                data: {
                    WorkOrderID: dto.workOrderId,
                    ProductID: workOrder.Items[0]?.ProductID,
                    CompletedQuantity: new client_1.Prisma.Decimal(dto.CompletedQuantity),
                    WorkStationID: dto.workStationId,
                    EmployeeID: dto.EmployeeId,
                    Notes: dto.Notes,
                    RecordedByID: UserId,
                },
            });
            const newTotal = currentCompleted + dto.CompletedQuantity;
            if (newTotal >= TotalQuantity) {
                const completedStatus = await tx.transactionStatus.findFirst({
                    where: { Code: 'COMPLETED' },
                });
                await tx.workOrder.update({
                    where: { ID: dto.workOrderId },
                    data: { StatusID: completedStatus?.ID },
                });
            }
            return newProgress;
        });
        const updatedWorkOrder = await this.prisma.workOrder.findUnique({
            where: { ID: dto.workOrderId },
            include: { Status: true },
        });
        return {
            success: true,
            workOrderId: dto.workOrderId,
            progress: {
                ID: progress.ID,
                completedQuantity: (0, number_1.number)(progress.CompletedQuantity),
                RecordedAt: progress.CreatedAt,
            },
            TotalCompleted: currentCompleted + dto.CompletedQuantity,
            TotalQuantity,
            progressPercent: ((currentCompleted + dto.CompletedQuantity) / TotalQuantity) * 100,
            Status: updatedWorkOrder?.Status?.Name,
            isCompleted: currentCompleted + dto.CompletedQuantity >= TotalQuantity,
        };
    }
    async allocateMaterials(dto, UserId) {
        const workOrder = await this.prisma.workOrder.findUnique({
            where: { ID: dto.workOrderId },
        });
        if (!workOrder) {
            throw new common_1.NotFoundException('Work Order not found');
        }
        const allocations = await this.prisma.$transaction(async (tx) => {
            const Results = [];
            for (const item of dto.allocations) {
                const Product = await tx.product.findUnique({
                    where: { ID: item.ProductId },
                });
                if (!Product) {
                    throw new common_1.NotFoundException(`Product ${item.ProductId} not found`);
                }
                if (Number(Product.Stock) < item.AllocatedQuantity) {
                    throw new common_1.BadRequestException(`Insufficient Stock for ${Product.Name}. Available: ${Product.Stock}, Requested: ${item.AllocatedQuantity}`);
                }
                const allocation = await tx.materialAllocation.create({
                    data: {
                        WorkOrderID: dto.workOrderId,
                        ProductID: item.ProductId,
                        AllocatedQuantity: new client_1.Prisma.Decimal(item.AllocatedQuantity),
                        UsedQuantity: new client_1.Prisma.Decimal(0),
                        Status: 'ALLOCATED',
                    },
                });
                await tx.product.update({
                    where: { ID: item.ProductId },
                    data: { Stock: { decrement: new client_1.Prisma.Decimal(item.AllocatedQuantity) } },
                });
                Results.push({
                    ID: allocation.ID,
                    ProductId: item.ProductId,
                    ProductName: Product.Name,
                    allocatedQuantity: item.AllocatedQuantity,
                });
            }
            return Results;
        });
        return {
            success: true,
            workOrderId: dto.workOrderId,
            allocations,
        };
    }
    async releaseMaterials(workOrderId, UserId) {
        const allocations = await this.prisma.materialAllocation.findMany({
            where: { WorkOrderID: workOrderId, Status: 'ALLOCATED' },
        });
        if (allocations.length === 0) {
            return { success: true, message: 'No Materials to release' };
        }
        await this.prisma.$transaction(async (tx) => {
            for (const allocation of allocations) {
                await tx.product.update({
                    where: { ID: allocation.ProductID },
                    data: { Stock: { increment: allocation.AllocatedQuantity } },
                });
                await tx.materialAllocation.update({
                    where: { ID: allocation.ID },
                    data: { Status: 'RELEASED' },
                });
            }
        });
        return {
            success: true,
            releasedCount: allocations.length,
            TotalQuantity: allocations.reduce((sum, a) => sum + Number(a.AllocatedQuantity), 0),
        };
    }
    async createWorkStation(dto, UserId) {
        const Code = dto.Code || (await this.generateWorkStationCode());
        const workStation = await this.prisma.workStation.create({
            data: {
                Name: dto.Name,
                Code: Code,
                Description: dto.Description,
                Capacity: dto.capacity || 1,
                WarehouseID: dto.WarehouseId,
                Capabilities: dto.capabilities?.join(','),
                IsActive: true,
            },
        });
        return {
            success: true,
            workStation: {
                ID: workStation.ID,
                Name: workStation.Name,
                Code: workStation.Code,
                capacity: workStation.Capacity,
            },
        };
    }
    async listWorkStations(dto) {
        const where = {};
        if (dto.IsActive !== undefined) {
            where.IsActive = dto.IsActive;
        }
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        const Stations = await this.prisma.workStation.findMany({
            where,
            include: { Warehouse: true },
            orderBy: { Name: 'asc' },
        });
        const StationsWithUtilization = await Promise.all(Stations.map(async (Station) => {
            const ActiveWorkOrders = await this.prisma.workOrder.count({
                where: {
                    Schedules: { some: { ResourceType: 'WORKSTATION', ResourceID: Station.ID } },
                    Status: { IsTerminal: false },
                },
            });
            return {
                ID: Station.ID,
                Name: Station.Name,
                Code: Station.Code,
                Description: Station.Description,
                capacity: Station.Capacity,
                currentLoad: ActiveWorkOrders,
                utilizationPercent: Station.Capacity > 0 ? (ActiveWorkOrders / Station.Capacity) * 100 : 0,
                Warehouse: Station.Warehouse?.Name,
                capabilities: Station.Capabilities?.split(',').filter(Boolean),
                IsActive: Station.IsActive,
            };
        }));
        return StationsWithUtilization;
    }
    async getWorkStationUtilization(startDate, endDate, workStationId) {
        const range = (0, date_range_1.resolveDateRange)(startDate, endDate);
        const where = {
            ScheduledStartDate: { lte: range.end },
            ScheduledEndDate: { gte: range.start },
            Status: { IsTerminal: false },
        };
        if (workStationId) {
            where.Schedules = { some: { ResourceType: 'WORKSTATION', ResourceID: workStationId } };
        }
        const WorkOrders = await this.prisma.workOrder.findMany({
            where,
            include: {
                Schedules: { where: workStationId ? { ResourceID: workStationId } : undefined },
                Status: true,
            },
        });
        const utilizationByDay = {};
        for (const wo of WorkOrders) {
            if (!wo.ScheduledStartDate || !wo.ScheduledEndDate)
                continue;
            const start = new Date(Math.max(new Date(wo.ScheduledStartDate).getTime(), range.start.getTime()));
            const end = new Date(Math.min(new Date(wo.ScheduledEndDate).getTime(), range.end.getTime()));
            if (end < start)
                continue;
            const dayCursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
            while (dayCursor <= end) {
                const dayStart = dayCursor.getTime();
                const dayEnd = dayStart + 24 * 60 * 60 * 1000;
                const overlapMs = Math.min(dayEnd, end.getTime()) - Math.max(dayStart, start.getTime());
                const DateKey = dayCursor.toISOString().split('T')[0];
                if (!utilizationByDay[DateKey]) {
                    utilizationByDay[DateKey] = { allocated: 0, hours: 0 };
                }
                utilizationByDay[DateKey].allocated += 1;
                utilizationByDay[DateKey].hours += Math.max(0, overlapMs) / (1000 * 60 * 60);
                dayCursor.setUTCDate(dayCursor.getUTCDate() + 1);
            }
        }
        return {
            period: { startDate: range.start.toISOString(), endDate: range.end.toISOString() },
            workStationId,
            TotalWorkOrders: WorkOrders.length,
            utilizationByDay: Object.entries(utilizationByDay)
                .sort()
                .map(([Date, data]) => ({ Date, ...data })),
        };
    }
    async getWorkOrderAnalytics(startDate, endDate) {
        const { start, end } = (0, date_range_1.resolveDateRange)(startDate, endDate);
        const WorkOrders = await this.prisma.workOrder.findMany({
            where: {
                WorkOrderDate: { gte: start, lte: end },
            },
            include: {
                Status: true,
                Items: true,
                ProgressRecords: true,
            },
        });
        const byStatus = {};
        const byPriority = {};
        let TotalCompletedOnTime = 0;
        let TotalCompletedLate = 0;
        let TotalInProgress = 0;
        for (const wo of WorkOrders) {
            byStatus[wo.Status?.Name || 'Unknown'] = (byStatus[wo.Status?.Name || 'Unknown'] || 0) + 1;
            byPriority[wo.Priority] = (byPriority[wo.Priority] || 0) + 1;
            const isCompleted = wo.Status?.Code === 'COMPLETED';
            if (isCompleted) {
                if (wo.DueDate && new Date(wo.DueDate) >= wo.UpdatedAt) {
                    TotalCompletedOnTime++;
                }
                else if (wo.DueDate) {
                    TotalCompletedLate++;
                }
            }
            else if (!wo.Status?.IsTerminal) {
                TotalInProgress++;
            }
        }
        const completedWorkOrders = WorkOrders.filter((wo) => wo.Status?.Code === 'COMPLETED');
        const completionTimes = completedWorkOrders.map((wo) => {
            const created = new Date(wo.WorkOrderDate);
            const completed = new Date(wo.UpdatedAt);
            return (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
        });
        const avgCompletionTime = completionTimes.length > 0
            ? completionTimes.reduce((sum, t) => sum + t, 0) / completionTimes.length
            : 0;
        return {
            period: { startDate, endDate },
            Summary: {
                TotalWorkOrders: WorkOrders.length,
                completedOnTime: TotalCompletedOnTime,
                completedLate: TotalCompletedLate,
                inProgress: TotalInProgress,
                onTimeRate: completedWorkOrders.length > 0
                    ? (TotalCompletedOnTime / completedWorkOrders.length) * 100
                    : 0,
                averageCompletionTimeHours: Math.round(avgCompletionTime * 100) / 100,
            },
            byStatus: Object.entries(byStatus).map(([Status, Count]) => ({ Status, Count })),
            byPriority: Object.entries(byPriority).map(([priority, Count]) => ({ priority, Count })),
        };
    }
    async generateWorkOrderNumber() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `WO-${year}${month}`;
        const lastWorkOrder = await this.prisma.workOrder.findFirst({
            where: { WorkOrderNumber: { startsWith: prefix } },
            orderBy: { WorkOrderNumber: 'desc' },
            select: { WorkOrderNumber: true },
        });
        let nextNumber = 1;
        if (lastWorkOrder) {
            const lastSeq = parseInt(lastWorkOrder.WorkOrderNumber.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    async generateWorkStationCode() {
        const prefix = 'WS';
        const lastStation = await this.prisma.workStation.findFirst({
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastStation) {
            const lastSeq = parseInt(lastStation.Code.replace(prefix, ''), 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}${String(nextNumber).padStart(3, '0')}`;
    }
};
exports.WorkOrderService = WorkOrderService;
exports.WorkOrderService = WorkOrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkOrderService);
