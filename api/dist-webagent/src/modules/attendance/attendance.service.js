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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const base_service_1 = require("../../common/templates/base.service");
const client_1 = require("@prisma/client");
let AttendanceService = class AttendanceService extends base_service_1.BaseService {
    constructor(prisma, redis, queryService) {
        super(prisma, redis, queryService, {
            modelName: 'attendance',
            primaryKey: 'ID',
            searchableFields: ['*'],
            allowedIncludes: ['*'],
            allowedSortFields: ['*'],
            allowedSelectFields: ['*'],
            defaultOrderBy: { CreatedAt: 'desc' },
            maxTake: 100,
            defaultTake: 20,
            cacheTtl: 60,
            softDelete: true,
            softDeleteField: 'IsActive',
        });
        this.prisma = prisma;
        this.redis = redis;
        this.queryService = queryService;
    }
    async resolveStatusId(statusCode, fallbackCode) {
        const status = await this.prisma.attendanceStatus.findUnique({
            where: { Code: statusCode || fallbackCode },
        });
        if (!status)
            throw new common_1.BadRequestException(`Status kehadiran '${statusCode || fallbackCode}' tidak ditemukan`);
        return status.ID;
    }
    async createAttendance(dto) {
        const statusId = await this.resolveStatusId(dto.statusCode, 'PRESENT');
        const result = await this.prisma.attendance.create({
            data: {
                Employee: { connect: { ID: dto.employeeId } },
                Date: new Date(dto.date),
                CheckIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
                CheckInLatitude: dto.checkInLatitude != null ? new client_1.Prisma.Decimal(dto.checkInLatitude) : undefined,
                CheckInLongitude: dto.checkInLongitude != null ? new client_1.Prisma.Decimal(dto.checkInLongitude) : undefined,
                CheckOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
                CheckOutLatitude: dto.checkOutLatitude != null ? new client_1.Prisma.Decimal(dto.checkOutLatitude) : undefined,
                CheckOutLongitude: dto.checkOutLongitude != null ? new client_1.Prisma.Decimal(dto.checkOutLongitude) : undefined,
                Status: { connect: { ID: statusId } },
                Notes: dto.notes,
            },
            include: { Employee: true, Status: true },
        });
        await this.invalidateCache();
        return result;
    }
    async updateAttendance(id, dto) {
        const data = {};
        if (dto.employeeId !== undefined)
            data.Employee = { connect: { ID: dto.employeeId } };
        if (dto.date !== undefined)
            data.Date = new Date(dto.date);
        if (dto.checkIn !== undefined)
            data.CheckIn = dto.checkIn ? new Date(dto.checkIn) : null;
        if (dto.checkInLatitude !== undefined)
            data.CheckInLatitude = dto.checkInLatitude != null ? new client_1.Prisma.Decimal(dto.checkInLatitude) : null;
        if (dto.checkInLongitude !== undefined)
            data.CheckInLongitude = dto.checkInLongitude != null ? new client_1.Prisma.Decimal(dto.checkInLongitude) : null;
        if (dto.checkOut !== undefined)
            data.CheckOut = dto.checkOut ? new Date(dto.checkOut) : null;
        if (dto.checkOutLatitude !== undefined)
            data.CheckOutLatitude = dto.checkOutLatitude != null ? new client_1.Prisma.Decimal(dto.checkOutLatitude) : null;
        if (dto.checkOutLongitude !== undefined)
            data.CheckOutLongitude = dto.checkOutLongitude != null ? new client_1.Prisma.Decimal(dto.checkOutLongitude) : null;
        if (dto.statusCode !== undefined)
            data.Status = { connect: { ID: await this.resolveStatusId(dto.statusCode, 'PRESENT') } };
        if (dto.notes !== undefined)
            data.Notes = dto.notes;
        if (dto.isActive !== undefined)
            data.IsActive = dto.isActive;
        const result = await this.prisma.attendance.update({
            where: { ID: id },
            data,
            include: { Employee: true, Status: true },
        });
        await this.invalidateCache();
        await this.invalidateItemCache(id);
        return result;
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService])
], AttendanceService);
