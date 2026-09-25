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
exports.ProductTypeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
let ProductTypeService = class ProductTypeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProductType(dto, UserId) {
        const existing = await this.prisma.productType.findFirst({
            where: { Name: dto.Name },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Product Type '${dto.Name}' already exists`);
        }
        const productType = await this.prisma.productType.create({
            data: {
                Name: dto.Name,
                Description: dto.Description,
                IsActive: dto.IsActive ?? true,
            },
        });
        return {
            success: true,
            ProductType: {
                ID: productType.ID,
                Name: productType.Name,
                Description: productType.Description,
                IsActive: productType.IsActive,
                createdAt: productType.CreatedAt,
            },
        };
    }
    async updateProductType(ID, dto, UserId) {
        const productType = await this.prisma.productType.findUnique({
            where: { ID: ID },
        });
        if (!productType) {
            throw new common_1.NotFoundException(`Product Type ${ID} not found`);
        }
        if (dto.Name && dto.Name !== productType.Name) {
            const existing = await this.prisma.productType.findFirst({
                where: { Name: dto.Name, ID: { not: ID } },
            });
            if (existing) {
                throw new common_1.BadRequestException(`Product Type '${dto.Name}' already exists`);
            }
        }
        const updated = await this.prisma.productType.update({
            where: { ID: ID },
            data: {
                Name: dto.Name,
                Description: dto.Description,
                IsActive: dto.IsActive,
            },
        });
        return {
            success: true,
            ProductType: {
                ID: updated.ID,
                Name: updated.Name,
                Description: updated.Description,
                IsActive: updated.IsActive,
                updatedAt: updated.UpdatedAt,
            },
        };
    }
    async getProductType(ID) {
        const productType = await this.prisma.productType.findUnique({
            where: { ID: ID },
            include: {
                Products: {
                    select: { ID: true, Code: true, Name: true },
                    take: 10,
                },
            },
        });
        if (!productType) {
            throw new common_1.NotFoundException(`Product Type ${ID} not found`);
        }
        const TotalProducts = await this.prisma.product.count({
            where: { ProductTypeID: ID },
        });
        return {
            ID: productType.ID,
            Name: productType.Name,
            Description: productType.Description,
            IsActive: productType.IsActive,
            createdAt: productType.CreatedAt,
            updatedAt: productType.UpdatedAt,
            ProductCount: TotalProducts,
            sampleProducts: productType.Products,
        };
    }
    async listProductTypes(dto) {
        const where = {};
        if (dto.ActiveOnly) {
            where.IsActive = true;
        }
        if (dto.Search) {
            where.OR = [
                { Name: { contains: dto.Search, mode: 'insensitive' } },
                { Description: { contains: dto.Search, mode: 'insensitive' } },
            ];
        }
        const ProductTypes = await this.prisma.productType.findMany({
            where,
            include: {
                _count: {
                    select: { Products: true },
                },
            },
            orderBy: { Name: 'asc' },
        });
        return ProductTypes.map((pt) => ({
            ID: pt.ID,
            Name: pt.Name,
            Description: pt.Description,
            IsActive: pt.IsActive,
            ProductCount: pt._count.Products,
            createdAt: pt.CreatedAt,
        }));
    }
    async deleteProductType(ID) {
        const productType = await this.prisma.productType.findUnique({
            where: { ID: ID },
        });
        if (!productType) {
            throw new common_1.NotFoundException(`Product Type ${ID} not found`);
        }
        const ProductCount = await this.prisma.product.count({
            where: { ProductTypeID: ID },
        });
        if (ProductCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete Product Type. ${ProductCount} Product(s) are using this Type.`);
        }
        await this.prisma.productType.delete({
            where: { ID: ID },
        });
        return {
            success: true,
            message: `Product Type '${productType.Name}' deleted successfully`,
        };
    }
    async getProductTypeStats() {
        const stats = await this.prisma.productType.findMany({
            include: {
                _count: {
                    select: { Products: true },
                },
            },
        });
        const TotalProducts = await this.prisma.product.count();
        return {
            TotalTypes: stats.length,
            TotalProducts,
            Types: stats.map((pt) => ({
                ID: pt.ID,
                Name: pt.Name,
                ProductCount: pt._count.Products,
                Percentage: TotalProducts > 0 ? Math.round((pt._count.Products / TotalProducts) * 10000) / 100 : 0,
            })),
        };
    }
};
exports.ProductTypeService = ProductTypeService;
exports.ProductTypeService = ProductTypeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductTypeService);
