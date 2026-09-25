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
exports.ProductionScheduleService = void 0;
const common_1 = require("@nestjs/common");
const date_range_1 = require("../shared/date-range");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let ProductionScheduleService = class ProductionScheduleService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSchedule(dto, CreatedBy) {
        const Product = await this.prisma.product.findUnique({
            where: { ID: dto.ProductId },
        });
        if (!Product) {
            throw new common_1.NotFoundException(`Product ${dto.ProductId} not found`);
        }
        const Schedulenumber = await this.generateScheduleNumber();
        const Schedule = await this.prisma.productionSchedule.create({
            data: {
                ProductID: dto.ProductId,
                ScheduledDate: new Date(dto.ScheduledDate),
                Quantity: new client_1.Prisma.Decimal(dto.Quantity),
                Status: dto.Status || 'SCHEDULED',
                Notes: dto.Notes ?? null,
                CreatedBy: CreatedBy,
            },
        });
        return {
            success: true,
            Schedule: {
                ID: Schedule.ID,
                ScheduleNumber: Schedule.ProductionScheduleNumber,
                ProductId: Schedule.ProductID,
                ProductName: Product.Name,
                WarehouseId: Schedule.WarehouseID,
                ScheduledDate: Schedule.ScheduledDate,
                Quantity: (0, number_1.number)(Schedule.Quantity),
                Status: Schedule.Status,
                Notes: Schedule.Notes,
                createdBy: Schedule.CreatedBy,
                createdAt: Schedule.CreatedAt,
            },
        };
    }
    async getSchedule(ID) {
        const Schedule = await this.prisma.productionSchedule.findUnique({
            where: { ID: ID },
            include: {
                Product: true,
                Warehouse: true,
            },
        });
        if (!Schedule) {
            throw new common_1.NotFoundException(`Schedule ${ID} not found`);
        }
        return {
            ID: Schedule.ID,
            ScheduleNumber: Schedule.ProductionScheduleNumber,
            ProductId: Schedule.ProductID,
            ProductName: Schedule.Product?.Name,
            ProductCode: Schedule.Product?.Code,
            WarehouseId: Schedule.WarehouseID,
            WarehouseName: Schedule.Warehouse?.Name,
            ScheduledDate: Schedule.ScheduledDate,
            Quantity: (0, number_1.number)(Schedule.Quantity),
            Status: Schedule.Status,
            Notes: Schedule.Notes,
            createdBy: Schedule.CreatedBy,
            createdAt: Schedule.CreatedAt,
            updatedAt: Schedule.UpdatedAt,
        };
    }
    async listSchedules(dto) {
        const where = {};
        if (dto.ProductId) {
            where.ProductID = dto.ProductId;
        }
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        if (dto.Status) {
            where.Status = dto.Status.toUpperCase();
        }
        if (dto.StartDate || dto.EndDate) {
            where.ScheduledDate = {};
            if (dto.StartDate) {
                where.ScheduledDate.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.ScheduledDate.lte = new Date(dto.EndDate);
            }
        }
        const Schedules = await this.prisma.productionSchedule.findMany({
            where,
            include: {
                Product: { select: { ID: true, Code: true, Name: true } },
                Warehouse: { select: { ID: true, Name: true } },
            },
            orderBy: { ScheduledDate: 'asc' },
        });
        return Schedules.map((s) => ({
            ID: s.ID,
            ScheduleNumber: s.ProductionScheduleNumber,
            ProductId: s.ProductID,
            ProductCode: s.Product?.Code,
            ProductName: s.Product?.Name,
            WarehouseId: s.WarehouseID,
            WarehouseName: s.Warehouse?.Name,
            ScheduledDate: s.ScheduledDate,
            Quantity: (0, number_1.number)(s.Quantity),
            Status: s.Status,
            Notes: s.Notes,
            createdAt: s.CreatedAt,
        }));
    }
    async updateSchedule(ID, dto, CreatedBy) {
        const Schedule = await this.prisma.productionSchedule.findUnique({
            where: { ID: ID },
        });
        if (!Schedule) {
            throw new common_1.NotFoundException(`Schedule ${ID} not found`);
        }
        if (Schedule.Status === 'COMPLETED' || Schedule.Status === 'CANCELLED') {
            throw new common_1.BadRequestException('Cannot update completed or cancelled Schedules');
        }
        const updated = await this.prisma.productionSchedule.update({
            where: { ID: ID },
            data: {
                ScheduledDate: dto.ScheduledDate ? new Date(dto.ScheduledDate) : undefined,
                Quantity: dto.Quantity ? new client_1.Prisma.Decimal(dto.Quantity) : undefined,
                Status: dto.Status,
                Notes: dto.Notes,
            },
        });
        return {
            success: true,
            Schedule: {
                ID: updated.ID,
                ScheduleNumber: updated.ProductionScheduleNumber,
                ScheduledDate: updated.ScheduledDate,
                Quantity: (0, number_1.number)(updated.Quantity),
                Status: updated.Status,
                Notes: updated.Notes,
            },
        };
    }
    async getCalendarView(startDate, endDate, WarehouseId) {
        const { start, end } = (0, date_range_1.resolveDateRange)(startDate, endDate);
        const where = {
            ScheduledDate: {
                gte: start,
                lte: end,
            },
        };
        if (WarehouseId) {
            where.WarehouseID = Number(WarehouseId);
        }
        const Schedules = await this.prisma.productionSchedule.findMany({
            where,
            include: {
                Product: { select: { ID: true, Code: true, Name: true } },
                Warehouse: { select: { ID: true, Name: true } },
            },
            orderBy: { ScheduledDate: 'asc' },
        });
        const GroupedByDate = {};
        for (const Schedule of Schedules) {
            const DateKey = Schedule.ScheduledDate.toISOString().split('T')[0];
            if (!GroupedByDate[DateKey]) {
                GroupedByDate[DateKey] = [];
            }
            GroupedByDate[DateKey].push({
                ID: Schedule.ID,
                ScheduleNumber: Schedule.ProductionScheduleNumber,
                ProductCode: Schedule.Product?.Code,
                ProductName: Schedule.Product?.Name,
                WarehouseName: Schedule.Warehouse?.Name,
                Quantity: (0, number_1.number)(Schedule.Quantity),
                Status: Schedule.Status,
            });
        }
        return {
            startDate,
            endDate,
            TotalSchedules: Schedules.length,
            TotalQuantity: Schedules.reduce((sum, s) => sum + Number(s.Quantity), 0),
            GroupedByDate,
        };
    }
    async generateScheduleNumber() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `SCH-${year}${month}`;
        const lastSchedule = await this.prisma.productionSchedule.findFirst({
            where: { ProductionScheduleNumber: { startsWith: prefix } },
            orderBy: { ProductionScheduleNumber: 'desc' },
            select: { ProductionScheduleNumber: true },
        });
        let nextNumber = 1;
        if (lastSchedule) {
            const lastSeq = parseInt(lastSchedule.ProductionScheduleNumber.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.ProductionScheduleService = ProductionScheduleService;
exports.ProductionScheduleService = ProductionScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductionScheduleService);
