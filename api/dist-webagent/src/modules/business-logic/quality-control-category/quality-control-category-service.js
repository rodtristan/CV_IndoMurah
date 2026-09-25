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
exports.QualityControlCategoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
let QualityControlCategoryService = class QualityControlCategoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createQCCategory(dto) {
        const existing = await this.prisma.qCCategory.findUnique({
            where: { Code: dto.Code },
        });
        if (existing) {
            throw new common_1.BadRequestException('Category Code already exists');
        }
        const Category = await this.prisma.qCCategory.create({
            data: {
                Code: dto.Code,
                Name: dto.Name,
                Description: dto.Description,
                QCType: dto.QcType,
                IsActive: true,
            },
        });
        return { success: true, Category: this.formatCategory(Category) };
    }
    async listQCCategories(includeInActive = false) {
        const where = includeInActive ? {} : { IsActive: true };
        const Categories = await this.prisma.qCCategory.findMany({
            where,
            include: { _count: { select: { Checkpoints: true } } },
            orderBy: { Name: 'asc' },
        });
        return Categories.map((c) => ({
            ...this.formatCategory(c),
            CheckpointCount: c._count.Checkpoints,
        }));
    }
    async getQCCategory(ID) {
        const Category = await this.prisma.qCCategory.findUnique({
            where: { ID: ID },
            include: { Checkpoints: { where: { IsActive: true }, orderBy: { SortOrder: 'asc' } } },
        });
        if (!Category)
            throw new common_1.NotFoundException('Category not found');
        return {
            ...this.formatCategory(Category),
            Checkpoints: Category.Checkpoints.map((cp) => this.formatCheckPoint(cp)),
        };
    }
    async updateQCCategory(ID, dto) {
        const Category = await this.prisma.qCCategory.findUnique({ where: { ID: ID } });
        if (!Category)
            throw new common_1.NotFoundException('Category not found');
        const updated = await this.prisma.qCCategory.update({
            where: { ID: ID },
            data: {
                Name: dto.Name ?? Category.Name,
                Description: dto.Description ?? Category.Description,
                QCType: dto.QcType ?? Category.QCType,
                IsActive: dto.IsActive ?? Category.IsActive,
            },
        });
        return { success: true, Category: this.formatCategory(updated) };
    }
    async deleteQCCategory(ID) {
        const Category = await this.prisma.qCCategory.findUnique({
            where: { ID: ID },
            include: { _count: { select: { Checkpoints: true } } },
        });
        if (!Category)
            throw new common_1.NotFoundException('Category not found');
        if (Category._count.Checkpoints > 0) {
            throw new common_1.BadRequestException('Cannot delete Category with existing CheckPoints');
        }
        await this.prisma.qCCategory.delete({ where: { ID: ID } });
        return { success: true, message: 'Category deleted' };
    }
    async createQCCheckpoint(dto) {
        const Category = await this.prisma.qCCategory.findUnique({ where: { ID: dto.CategoryId } });
        if (!Category)
            throw new common_1.NotFoundException('Category not found');
        const CheckPointCount = await this.prisma.qCCheckpoint.count({
            where: { QCCategoryID: dto.CategoryId },
        });
        const CheckPoint = await this.prisma.qCCheckpoint.create({
            data: {
                Name: dto.Name,
                QCCategoryID: dto.CategoryId,
                Description: dto.Description,
                IsRequired: dto.IsRequired ?? true,
                PassCriteria: dto.PassCriteria,
                SortOrder: CheckPointCount + 1,
                IsActive: true,
            },
        });
        return { success: true, CheckPoint: this.formatCheckPoint(CheckPoint) };
    }
    async updateQCCheckpoint(ID, dto) {
        const CheckPoint = await this.prisma.qCCheckpoint.findUnique({ where: { ID: ID } });
        if (!CheckPoint)
            throw new common_1.NotFoundException('CheckPoint not found');
        const updated = await this.prisma.qCCheckpoint.update({
            where: { ID: ID },
            data: {
                Name: dto.Name ?? CheckPoint.Name,
                Description: dto.Description ?? CheckPoint.Description,
                IsRequired: dto.IsRequired ?? CheckPoint.IsRequired,
                PassCriteria: dto.PassCriteria ?? CheckPoint.PassCriteria,
                IsActive: dto.IsActive ?? CheckPoint.IsActive,
            },
        });
        return { success: true, CheckPoint: this.formatCheckPoint(updated) };
    }
    async deleteQCCheckpoint(ID) {
        const CheckPoint = await this.prisma.qCCheckpoint.findUnique({ where: { ID: ID } });
        if (!CheckPoint)
            throw new common_1.NotFoundException('CheckPoint not found');
        await this.prisma.qCCheckpoint.delete({ where: { ID: ID } });
        return { success: true, message: 'CheckPoint deleted' };
    }
    async recordQCCheck(dto, UserId) {
        const Category = await this.prisma.qCCategory.findUnique({
            where: { ID: dto.CategoryId },
            include: { Checkpoints: { where: { IsActive: true } } },
        });
        if (!Category)
            throw new common_1.NotFoundException('QC Category not found');
        const Code = await this.generateQCCode();
        const qcCheck = await this.prisma.$transaction(async (tx) => {
            const newCheck = await tx.qCCheck.create({
                data: {
                    Code: Code,
                    QCCategoryID: dto.CategoryId,
                    ReferenceType: dto.ReferenceType,
                    ReferenceID: dto.ReferenceId,
                    Date: new Date(dto.Date),
                    InspectorName: dto.InspectorName,
                    Result: dto.Result || 'PENDING',
                    Notes: dto.Notes,
                    CreatedByID: UserId,
                },
            });
            if (dto.CheckpointResults && dto.CheckpointResults.length > 0) {
                await tx.qCCheckResult.createMany({
                    data: dto.CheckpointResults.map((cr) => ({
                        QCCheckID: newCheck.ID,
                        QCCheckpointID: cr.CheckpointId,
                        Result: cr.Result,
                        ActualValue: cr.ActualValue,
                        Notes: cr.Notes,
                    })),
                });
            }
            return newCheck;
        });
        return {
            success: true,
            qcCheck: {
                ID: qcCheck.ID,
                Code: qcCheck.Code,
                Category: Category.Name,
                referenceType: qcCheck.ReferenceType,
                referenceId: qcCheck.ReferenceID,
                Result: qcCheck.Result,
                Date: qcCheck.Date,
                inspectorName: qcCheck.InspectorName,
            },
        };
    }
    async listQCChecks(dto) {
        const where = {};
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate)
                where.Date.gte = new Date(dto.StartDate);
            if (dto.EndDate)
                where.Date.lte = new Date(dto.EndDate);
        }
        if (dto.CategoryId)
            where.QCCategoryID = dto.CategoryId;
        if (dto.Result)
            where.Result = dto.Result;
        const Checks = await this.prisma.qCCheck.findMany({
            where,
            include: { QCCategory: true },
            orderBy: { Date: 'desc' },
        });
        return Checks.map((c) => ({
            ID: c.ID,
            Code: c.Code,
            Category: c.QCCategory?.Name,
            referenceType: c.ReferenceType,
            referenceId: c.ReferenceID,
            Result: c.Result,
            Date: c.Date,
            inspectorName: c.InspectorName,
        }));
    }
    async generateQCCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `QC-${year}${month}`;
        const lastCheck = await this.prisma.qCCheck.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastCheck) {
            const lastSeq = parseInt(lastCheck.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    formatCategory(Category) {
        return {
            ID: Category.ID,
            Code: Category.Code,
            Name: Category.Name,
            Description: Category.Description,
            qcType: Category.QCType,
            IsActive: Category.IsActive,
        };
    }
    formatCheckPoint(CheckPoint) {
        return {
            ID: CheckPoint.ID,
            Name: CheckPoint.Name,
            Description: CheckPoint.Description,
            isRequired: CheckPoint.IsRequired,
            passCriteria: CheckPoint.PassCriteria,
            sortOrder: CheckPoint.SortOrder,
            IsActive: CheckPoint.IsActive,
        };
    }
};
exports.QualityControlCategoryService = QualityControlCategoryService;
exports.QualityControlCategoryService = QualityControlCategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QualityControlCategoryService);
