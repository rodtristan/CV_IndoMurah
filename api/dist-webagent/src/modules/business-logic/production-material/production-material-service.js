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
exports.ProductionMaterialService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const number_1 = require("../../../common/utils/number");
let ProductionMaterialService = class ProductionMaterialService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProductionCategory(dto) {
        const existing = await this.prisma.productionCategory.findUnique({
            where: { Code: dto.Code },
        });
        if (existing) {
            throw new common_1.BadRequestException('Category Code already exists');
        }
        const Category = await this.prisma.productionCategory.create({
            data: {
                Code: dto.Code,
                Name: dto.Name,
                Description: dto.Description,
                IsRawMaterial: dto.isRawMaterial ?? false,
            },
        });
        return { success: true, Category: this.formatCategory(Category) };
    }
    async listProductionCategories(includeInActive = false) {
        const where = includeInActive ? {} : { IsActive: true };
        const Categories = await this.prisma.productionCategory.findMany({
            where,
            include: { _count: { select: { Materials: true } } },
            orderBy: { Name: 'asc' },
        });
        return Categories.map((c) => ({
            ...this.formatCategory(c),
            MaterialCount: c._count.Materials,
        }));
    }
    async getProductionCategory(ID) {
        const Category = await this.prisma.productionCategory.findUnique({
            where: { ID: ID },
            include: { Materials: true },
        });
        if (!Category)
            throw new common_1.NotFoundException('Category not found');
        return {
            ...this.formatCategory(Category),
            Materials: Category.Materials.map((m) => this.formatMaterial(m)),
        };
    }
    async updateProductionCategory(ID, dto) {
        const Category = await this.prisma.productionCategory.findUnique({ where: { ID: ID } });
        if (!Category)
            throw new common_1.NotFoundException('Category not found');
        const updated = await this.prisma.productionCategory.update({
            where: { ID: ID },
            data: {
                Name: dto.Name ?? Category.Name,
                Description: dto.Description ?? Category.Description,
                IsActive: dto.IsActive ?? Category.IsActive,
            },
        });
        return { success: true, Category: this.formatCategory(updated) };
    }
    async deleteProductionCategory(ID) {
        const Category = await this.prisma.productionCategory.findUnique({
            where: { ID: ID },
            include: { _count: { select: { Materials: true } } },
        });
        if (!Category)
            throw new common_1.NotFoundException('Category not found');
        if (Category._count.Materials > 0) {
            throw new common_1.BadRequestException('Cannot delete Category with existing Materials');
        }
        await this.prisma.productionCategory.delete({ where: { ID: ID } });
        return { success: true, message: 'Category deleted' };
    }
    async createProductionMaterial(dto, UserId) {
        const Category = await this.prisma.productionCategory.findUnique({
            where: { ID: dto.CategoryId },
        });
        if (!Category)
            throw new common_1.NotFoundException('Category not found');
        const Unit = await this.prisma.unit.findUnique({ where: { ID: dto.UnitId } });
        if (!Unit)
            throw new common_1.NotFoundException('Unit not found');
        const Code = await this.generateMaterialCode();
        const Material = await this.prisma.productionMaterial.create({
            data: {
                Code: Code,
                Name: dto.Name,
                ProductionCategoryID: dto.CategoryId,
                UnitID: dto.UnitId,
                PurchasePrice: dto.PurchasePrice,
                MinimumStock: dto.MinimumStock,
                Description: dto.Description,
                IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
            },
            include: { ProductionCategory: true, Unit: true },
        });
        return { success: true, Material: this.formatMaterial(Material) };
    }
    async listProductionMaterials(dto) {
        const where = {};
        if (dto.CategoryId)
            where.ProductionCategoryID = dto.CategoryId;
        if (dto.IsActive !== undefined)
            where.IsActive = dto.IsActive;
        if (dto.Search) {
            where.OR = [
                { Name: { contains: dto.Search, mode: 'insensitive' } },
                { Code: { contains: dto.Search, mode: 'insensitive' } },
            ];
        }
        const Materials = await this.prisma.productionMaterial.findMany({
            where,
            include: { ProductionCategory: true, Unit: true },
            orderBy: { Name: 'asc' },
        });
        return Materials.map((m) => this.formatMaterial(m));
    }
    async getProductionMaterial(ID) {
        const Material = await this.prisma.productionMaterial.findUnique({
            where: { ID: ID },
            include: { ProductionCategory: true, Unit: true },
        });
        if (!Material)
            throw new common_1.NotFoundException('Material not found');
        return this.formatMaterial(Material);
    }
    async updateProductionMaterial(ID, dto, UserId) {
        const Material = await this.prisma.productionMaterial.findUnique({ where: { ID: ID } });
        if (!Material)
            throw new common_1.NotFoundException('Material not found');
        const updated = await this.prisma.productionMaterial.update({
            where: { ID: ID },
            data: {
                Name: dto.Name ?? Material.Name,
                ProductionCategoryID: dto.CategoryId ?? Material.ProductionCategoryID,
                UnitID: dto.UnitId ?? Material.UnitID,
                PurchasePrice: dto.PurchasePrice ?? Material.PurchasePrice,
                MinimumStock: dto.MinimumStock ?? Material.MinimumStock,
                Description: dto.Description ?? Material.Description,
                IsActive: dto.IsActive ?? Material.IsActive,
            },
            include: { ProductionCategory: true, Unit: true },
        });
        return { success: true, Material: this.formatMaterial(updated) };
    }
    async deleteProductionMaterial(ID) {
        const Material = await this.prisma.productionMaterial.findUnique({ where: { ID: ID } });
        if (!Material)
            throw new common_1.NotFoundException('Material not found');
        await this.prisma.productionMaterial.delete({ where: { ID: ID } });
        return { success: true, message: 'Material deleted' };
    }
    async getLowStockMaterials() {
        const Materials = await this.prisma.productionMaterial.findMany({
            where: {
                IsActive: true,
                MinimumStock: { gt: 0 },
            },
            include: { ProductionCategory: true, Unit: true },
        });
        const lowStock = Materials.filter((m) => m.MinimumStock && Number(m.CurrentStock || 0) < Number(m.MinimumStock));
        return lowStock.map((m) => ({
            ...this.formatMaterial(m),
            currentStock: (0, number_1.number)(m.CurrentStock || 0),
            minimumStock: (0, number_1.number)(m.MinimumStock),
            deficit: (0, number_1.number)(m.MinimumStock) - Number(m.CurrentStock || 0),
        }));
    }
    async generateMaterialCode() {
        const prefix = 'MAT';
        const lastMaterial = await this.prisma.productionMaterial.findFirst({
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastMaterial) {
            const lastSeq = parseInt(lastMaterial.Code.replace(prefix, ''), 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}${String(nextNumber).padStart(4, '0')}`;
    }
    formatCategory(Category) {
        return {
            ID: Category.ID,
            Code: Category.Code,
            Name: Category.Name,
            Description: Category.Description,
            isRawMaterial: Category.IsRawMaterial,
            IsActive: Category.IsActive,
        };
    }
    formatMaterial(Material) {
        return {
            ID: Material.ID,
            Code: Material.Code,
            Name: Material.Name,
            Category: Material.ProductionCategory?.Name,
            CategoryId: Material.ProductionCategoryID,
            Unit: Material.Unit?.Name,
            UnitId: Material.UnitID,
            PurchasePrice: Material.PurchasePrice ? Number(Material.PurchasePrice) : null,
            minimumStock: Material.MinimumStock ? Number(Material.MinimumStock) : null,
            currentStock: Material.CurrentStock ? Number(Material.CurrentStock) : 0,
            Description: Material.Description,
            IsActive: Material.IsActive,
        };
    }
};
exports.ProductionMaterialService = ProductionMaterialService;
exports.ProductionMaterialService = ProductionMaterialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductionMaterialService);
