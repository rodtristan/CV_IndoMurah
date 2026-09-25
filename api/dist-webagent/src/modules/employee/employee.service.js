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
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const base_service_1 = require("../../common/templates/base.service");
const client_1 = require("@prisma/client");
let EmployeeService = class EmployeeService extends base_service_1.BaseService {
    constructor(prisma, redis, queryService) {
        super(prisma, redis, queryService, {
            modelName: 'employee',
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
        const status = await this.prisma.employeeStatus.findUnique({
            where: { Code: statusCode || fallbackCode },
        });
        if (!status)
            throw new common_1.BadRequestException(`Status karyawan '${statusCode || fallbackCode}' tidak ditemukan`);
        return status.ID;
    }
    async createEmployee(dto) {
        const statusId = await this.resolveStatusId(dto.statusCode, 'ACTIVE');
        const result = await this.prisma.employee.create({
            data: {
                Code: dto.code,
                Name: dto.name,
                DepartmentID: dto.departmentId,
                PositionID: dto.positionId,
                JoinDate: dto.joinDate ? new Date(dto.joinDate) : undefined,
                EndDate: dto.endDate ? new Date(dto.endDate) : undefined,
                BirthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
                Gender: dto.gender,
                Phone: dto.phone,
                Email: dto.email,
                Address: dto.address,
                EmergencyContact: dto.emergencyContact,
                EmergencyPhone: dto.emergencyPhone,
                BasicSalary: new client_1.Prisma.Decimal(dto.basicSalary || 0),
                StatusID: statusId,
            },
            include: { Department: true, Position: true, Status: true },
        });
        await this.invalidateCache();
        return result;
    }
    async updateEmployee(id, dto) {
        const data = {};
        if (dto.code !== undefined)
            data.Code = dto.code;
        if (dto.name !== undefined)
            data.Name = dto.name;
        if (dto.departmentId !== undefined)
            data.DepartmentID = dto.departmentId;
        if (dto.positionId !== undefined)
            data.PositionID = dto.positionId;
        if (dto.joinDate !== undefined)
            data.JoinDate = dto.joinDate ? new Date(dto.joinDate) : null;
        if (dto.endDate !== undefined)
            data.EndDate = dto.endDate ? new Date(dto.endDate) : null;
        if (dto.birthDate !== undefined)
            data.BirthDate = dto.birthDate ? new Date(dto.birthDate) : null;
        if (dto.gender !== undefined)
            data.Gender = dto.gender;
        if (dto.phone !== undefined)
            data.Phone = dto.phone;
        if (dto.email !== undefined)
            data.Email = dto.email;
        if (dto.address !== undefined)
            data.Address = dto.address;
        if (dto.emergencyContact !== undefined)
            data.EmergencyContact = dto.emergencyContact;
        if (dto.emergencyPhone !== undefined)
            data.EmergencyPhone = dto.emergencyPhone;
        if (dto.basicSalary !== undefined)
            data.BasicSalary = new client_1.Prisma.Decimal(dto.basicSalary);
        if (dto.statusCode !== undefined)
            data.StatusID = await this.resolveStatusId(dto.statusCode, 'ACTIVE');
        if (dto.isActive !== undefined)
            data.IsActive = dto.isActive;
        const result = await this.prisma.employee.update({
            where: { ID: id },
            data,
            include: { Department: true, Position: true, Status: true },
        });
        await this.invalidateCache();
        await this.invalidateItemCache(id);
        return result;
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService])
], EmployeeService);
