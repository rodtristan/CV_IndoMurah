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
exports.ServicePackageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let ServicePackageService = class ServicePackageService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createServiceCategory(dto, UserId) {
        const existing = await this.prisma.serviceCategory.findFirst({
            where: { Code: dto.Code },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Category with Code '${dto.Code}' already exists`);
        }
        const Category = await this.prisma.serviceCategory.create({
            data: {
                Code: dto.Code,
                Name: dto.Name,
                Description: dto.Description,
                DefaultLaborCost: dto.DefaultLaborCost
                    ? new client_1.Prisma.Decimal(dto.DefaultLaborCost)
                    : null,
                IsActive: true,
            },
        });
        return {
            success: true,
            Category: this.formatCategory(Category),
        };
    }
    async getServiceCategory(CategoryId) {
        const Category = await this.prisma.serviceCategory.findUnique({
            where: { ID: CategoryId },
            include: { _count: { select: { Packages: true } } },
        });
        if (!Category) {
            throw new common_1.NotFoundException('Service Category not found');
        }
        return {
            ...this.formatCategory(Category),
            PackageCount: Category._count.Packages,
        };
    }
    async listServiceCategories(IsActive) {
        const where = {};
        if (IsActive !== undefined) {
            where.IsActive = IsActive;
        }
        const Categories = await this.prisma.serviceCategory.findMany({
            where,
            include: {
                _count: { select: { Packages: true } },
            },
            orderBy: { Name: 'asc' },
        });
        return Categories.map((c) => ({
            ...this.formatCategory(c),
            PackageCount: c._count.Packages,
        }));
    }
    async updateServiceCategory(CategoryId, dto) {
        const Category = await this.prisma.serviceCategory.findUnique({
            where: { ID: CategoryId },
        });
        if (!Category) {
            throw new common_1.NotFoundException('Service Category not found');
        }
        const updated = await this.prisma.serviceCategory.update({
            where: { ID: CategoryId },
            data: {
                Name: dto.Name,
                Description: dto.Description,
                DefaultLaborCost: dto.DefaultLaborCost
                    ? new client_1.Prisma.Decimal(dto.DefaultLaborCost)
                    : undefined,
                IsActive: dto.IsActive,
            },
        });
        return {
            success: true,
            Category: this.formatCategory(updated),
        };
    }
    async deleteServiceCategory(CategoryId) {
        const Category = await this.prisma.serviceCategory.findUnique({
            where: { ID: CategoryId },
            include: { _count: { select: { Packages: true } } },
        });
        if (!Category) {
            throw new common_1.NotFoundException('Service Category not found');
        }
        if (Category._count.Packages > 0) {
            throw new common_1.BadRequestException('Cannot delete Category with existing Packages');
        }
        await this.prisma.serviceCategory.delete({
            where: { ID: CategoryId },
        });
        return {
            success: true,
            message: 'Service Category deleted successfully',
        };
    }
    async createServicePackage(dto, UserId) {
        const existing = await this.prisma.servicePackage.findFirst({
            where: { Code: dto.Code },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Package with Code '${dto.Code}' already exists`);
        }
        const Category = await this.prisma.serviceCategory.findUnique({
            where: { ID: dto.ServiceCategoryId },
        });
        if (!Category) {
            throw new common_1.NotFoundException('Service Category not found');
        }
        let TotalCost = dto.CostPrice || 0;
        if (dto.Items && dto.Items.length > 0) {
            for (const item of dto.Items) {
                if (item.ProductId) {
                    const Product = await this.prisma.product.findUnique({
                        where: { ID: item.ProductId },
                    });
                    if (Product) {
                        TotalCost += Number(Product.PurchasePrice) * item.Quantity;
                    }
                }
                else if (item.UnitPrice) {
                    TotalCost += item.UnitPrice * item.Quantity;
                }
            }
        }
        const pkg = await this.prisma.servicePackage.create({
            data: {
                Code: dto.Code,
                Name: dto.Name,
                ServiceCategoryID: dto.ServiceCategoryId,
                EstimatedDuration: dto.EstimatedDuration || 0,
                SellingPrice: new client_1.Prisma.Decimal(dto.SellingPrice || 0),
                CostPrice: new client_1.Prisma.Decimal(TotalCost),
                Description: dto.Description,
                IsActive: true,
                PackageItems: dto.Items
                    ? {
                        create: await Promise.all(dto.Items.map(async (item, index) => {
                            let UnitPrice = item.UnitPrice || 0;
                            if (item.ProductId) {
                                const Product = await this.prisma.product.findUnique({
                                    where: { ID: item.ProductId },
                                });
                                if (Product) {
                                    UnitPrice = Number(Product.PurchasePrice);
                                }
                            }
                            return {
                                ProductID: item.ProductId || null,
                                ItemName: item.ItemName,
                                Quantity: new client_1.Prisma.Decimal(item.Quantity),
                                UnitPrice: new client_1.Prisma.Decimal(UnitPrice),
                                Subtotal: new client_1.Prisma.Decimal(UnitPrice * item.Quantity),
                            };
                        })),
                    }
                    : undefined,
            },
            include: {
                ServiceCategory: true,
                PackageItems: {
                    include: { Product: true },
                    orderBy: { ID: 'asc' },
                },
            },
        });
        return {
            success: true,
            Package: this.formatPackage(pkg),
        };
    }
    async getServicePackage(PackageId) {
        const pkg = await this.prisma.servicePackage.findUnique({
            where: { ID: PackageId },
            include: {
                ServiceCategory: true,
                PackageItems: {
                    include: { Product: true },
                    orderBy: { ID: 'asc' },
                },
            },
        });
        if (!pkg) {
            throw new common_1.NotFoundException('Service Package not found');
        }
        return this.formatPackage(pkg);
    }
    async listServicePackages(dto) {
        const where = {};
        if (dto.ServiceCategoryId) {
            where.ServiceCategoryID = dto.ServiceCategoryId;
        }
        if (dto.IsActive !== undefined) {
            where.IsActive = dto.IsActive;
        }
        if (dto.Search) {
            where.OR = [
                { Name: { contains: dto.Search, mode: 'insensitive' } },
                { Code: { contains: dto.Search, mode: 'insensitive' } },
            ];
        }
        const Packages = await this.prisma.servicePackage.findMany({
            where,
            include: {
                ServiceCategory: true,
                PackageItems: true,
            },
            orderBy: { Name: 'asc' },
        });
        return Packages.map((p) => this.formatPackage(p));
    }
    async updateServicePackage(PackageId, dto, UserId) {
        const pkg = await this.prisma.servicePackage.findUnique({
            where: { ID: PackageId },
            include: { PackageItems: true },
        });
        if (!pkg) {
            throw new common_1.NotFoundException('Service Package not found');
        }
        let TotalCost = Number(pkg.CostPrice);
        if (dto.Items) {
            TotalCost = 0;
            for (const item of dto.Items) {
                let UnitPrice = item.UnitPrice || 0;
                if (item.ProductId) {
                    const Product = await this.prisma.product.findUnique({
                        where: { ID: item.ProductId },
                    });
                    if (Product) {
                        UnitPrice = Number(Product.PurchasePrice);
                    }
                }
                TotalCost += UnitPrice * item.Quantity;
            }
        }
        const updated = await this.prisma.servicePackage.update({
            where: { ID: PackageId },
            data: {
                Name: dto.Name,
                ServiceCategoryID: dto.ServiceCategoryId,
                EstimatedDuration: dto.EstimatedDuration,
                SellingPrice: dto.SellingPrice
                    ? new client_1.Prisma.Decimal(dto.SellingPrice)
                    : undefined,
                CostPrice: dto.Items
                    ? new client_1.Prisma.Decimal(TotalCost)
                    : undefined,
                Description: dto.Description,
                IsActive: dto.IsActive,
            },
            include: {
                ServiceCategory: true,
                PackageItems: {
                    include: { Product: true },
                    orderBy: { ID: 'asc' },
                },
            },
        });
        if (dto.Items) {
            await this.prisma.packageItem.deleteMany({
                where: { ServicePackageID: PackageId },
            });
            for (let i = 0; i < dto.Items.length; i++) {
                const item = dto.Items[i];
                let UnitPrice = item.UnitPrice || 0;
                if (item.ProductId) {
                    const Product = await this.prisma.product.findUnique({
                        where: { ID: item.ProductId },
                    });
                    if (Product) {
                        UnitPrice = Number(Product.PurchasePrice);
                    }
                }
                await this.prisma.packageItem.create({
                    data: {
                        ServicePackageID: PackageId,
                        ProductID: item.ProductId || null,
                        ItemName: item.ItemName,
                        Quantity: new client_1.Prisma.Decimal(item.Quantity),
                        UnitPrice: new client_1.Prisma.Decimal(UnitPrice),
                        Subtotal: new client_1.Prisma.Decimal(UnitPrice * item.Quantity),
                    },
                });
            }
        }
        return {
            success: true,
            Package: this.formatPackage(updated),
        };
    }
    async deleteServicePackage(PackageId) {
        const pkg = await this.prisma.servicePackage.findUnique({
            where: { ID: PackageId },
        });
        if (!pkg) {
            throw new common_1.NotFoundException('Service Package not found');
        }
        await this.prisma.packageItem.deleteMany({
            where: { ServicePackageID: PackageId },
        });
        await this.prisma.servicePackage.delete({
            where: { ID: PackageId },
        });
        return {
            success: true,
            message: 'Service Package deleted successfully',
        };
    }
    async cloneServicePackage(PackageId, newCode, newName, UserId) {
        const original = await this.prisma.servicePackage.findUnique({
            where: { ID: PackageId },
            include: { PackageItems: true },
        });
        if (!original) {
            throw new common_1.NotFoundException('Service Package not found');
        }
        const existing = await this.prisma.servicePackage.findFirst({
            where: { Code: newCode },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Package with Code '${newCode}' already exists`);
        }
        const cloned = await this.prisma.servicePackage.create({
            data: {
                Code: newCode,
                Name: newName,
                ServiceCategoryID: original.ServiceCategoryID,
                EstimatedDuration: original.EstimatedDuration,
                SellingPrice: original.SellingPrice,
                CostPrice: original.CostPrice,
                Description: original.Description,
                IsActive: true,
                PackageItems: {
                    create: original.PackageItems.map((item, index) => ({
                        ProductID: item.ProductID,
                        ItemName: item.ItemName,
                        Quantity: item.Quantity,
                        UnitPrice: item.UnitPrice,
                        Subtotal: item.Subtotal,
                    })),
                },
            },
            include: {
                ServiceCategory: true,
                PackageItems: {
                    include: { Product: true },
                    orderBy: { ID: 'asc' },
                },
            },
        });
        return {
            success: true,
            Package: this.formatPackage(cloned),
        };
    }
    async calculatePackageQuote(dto) {
        const pkg = await this.prisma.servicePackage.findUnique({
            where: { ID: dto.PackageId },
            include: {
                ServiceCategory: true,
                PackageItems: {
                    include: { Product: true },
                },
            },
        });
        if (!pkg) {
            throw new common_1.NotFoundException('Service Package not found');
        }
        const Quantity = dto.Quantity || 1;
        const items = pkg.PackageItems.map((item) => {
            const requiredQty = Number(item.Quantity) * Quantity;
            return {
                ID: item.ID,
                ProductId: item.ProductID,
                ProductName: item.Product?.Name || item.ItemName,
                baseQuantity: (0, number_1.number)(item.Quantity),
                requiredQuantity: requiredQty,
                UnitPrice: (0, number_1.number)(item.UnitPrice),
                subTotal: (0, number_1.number)(item.UnitPrice) * requiredQty,
            };
        });
        const itemSubTotal = items.reduce((sum, item) => sum + item.subTotal, 0);
        const laborCost = Number(pkg.ServiceCategory?.DefaultLaborCost || 0) * Quantity;
        const TotalCost = itemSubTotal + laborCost;
        const sellingPrice = Number(pkg.SellingPrice) * Quantity;
        const discountAmount = dto.DiscountPercent
            ? sellingPrice * (dto.DiscountPercent / 100)
            : 0;
        const finalPrice = sellingPrice - discountAmount;
        return {
            PackageId: pkg.ID,
            PackageCode: pkg.Code,
            PackageName: pkg.Name,
            Category: pkg.ServiceCategory?.Name,
            estimatedDuration: pkg.EstimatedDuration * Quantity,
            Quantity,
            items,
            calculation: {
                itemSubTotal,
                laborCost,
                TotalCost,
                suggestedPrice: sellingPrice,
                discountPercent: dto.DiscountPercent || 0,
                discountAmount,
                finalPrice,
                profit: finalPrice - TotalCost,
                profitMargin: finalPrice > 0 ? ((finalPrice - TotalCost) / finalPrice) * 100 : 0,
            },
        };
    }
    async comparePackages(dto) {
        const Packages = await this.prisma.servicePackage.findMany({
            where: { ID: { in: dto.PackageIds } },
            include: {
                ServiceCategory: true,
                PackageItems: {
                    include: { Product: true },
                },
            },
        });
        if (Packages.length === 0) {
            throw new common_1.NotFoundException('No Packages found');
        }
        const comparisons = Packages.map((pkg) => {
            const itemCost = pkg.PackageItems.reduce((sum, item) => sum + Number(item.UnitPrice) * Number(item.Quantity), 0);
            const laborCost = Number(pkg.ServiceCategory?.DefaultLaborCost || 0);
            const TotalCost = itemCost + laborCost;
            const sellingPrice = Number(pkg.SellingPrice);
            return {
                ID: pkg.ID,
                Code: pkg.Code,
                Name: pkg.Name,
                Category: pkg.ServiceCategory?.Name,
                estimatedDuration: pkg.EstimatedDuration,
                itemCount: pkg.PackageItems.length,
                itemCost,
                laborCost,
                TotalCost,
                sellingPrice,
                profit: sellingPrice - TotalCost,
                profitMargin: sellingPrice > 0 ? ((sellingPrice - TotalCost) / sellingPrice) * 100 : 0,
                items: pkg.PackageItems.map((item) => ({
                    Name: item.Product?.Name || item.ItemName,
                    Quantity: (0, number_1.number)(item.Quantity),
                    UnitPrice: (0, number_1.number)(item.UnitPrice),
                })),
            };
        });
        const sortedByMargin = [...comparisons].sort((a, b) => b.profitMargin - a.profitMargin);
        return {
            comparison: comparisons,
            bestValue: sortedByMargin[0],
            sortedByMargin,
        };
    }
    async getPackagesByCategory(CategoryId) {
        const Category = await this.prisma.serviceCategory.findUnique({
            where: { ID: CategoryId },
            include: {
                Packages: {
                    where: { IsActive: true },
                    include: { PackageItems: true },
                    orderBy: { SellingPrice: 'asc' },
                },
            },
        });
        if (!Category) {
            throw new common_1.NotFoundException('Service Category not found');
        }
        const Packages = Category.Packages.map((pkg) => {
            const itemCost = pkg.PackageItems.reduce((sum, item) => sum + Number(item.UnitPrice) * Number(item.Quantity), 0);
            const laborCost = Number(Category.DefaultLaborCost || 0);
            const TotalCost = itemCost + laborCost;
            const sellingPrice = Number(pkg.SellingPrice);
            return {
                ID: pkg.ID,
                Code: pkg.Code,
                Name: pkg.Name,
                estimatedDuration: pkg.EstimatedDuration,
                CostPrice: TotalCost,
                sellingPrice,
                profit: sellingPrice - TotalCost,
                profitMargin: sellingPrice > 0 ? ((sellingPrice - TotalCost) / sellingPrice) * 100 : 0,
                itemCount: pkg.PackageItems.length,
            };
        });
        return {
            CategoryId: Category.ID,
            CategoryName: Category.Name,
            DefaultLaborCost: (0, number_1.number)(Category.DefaultLaborCost || 0),
            Packages,
            Summary: {
                TotalPackages: Packages.length,
                avgPrice: Packages.length > 0
                    ? Packages.reduce((sum, p) => sum + p.sellingPrice, 0) / Packages.length
                    : 0,
                avgProfitMargin: Packages.length > 0
                    ? Packages.reduce((sum, p) => sum + p.profitMargin, 0) / Packages.length
                    : 0,
            },
        };
    }
    formatCategory(Category) {
        return {
            ID: Category.ID,
            Code: Category.Code,
            Name: Category.Name,
            Description: Category.Description,
            DefaultLaborCost: Category.DefaultLaborCost ? Number(Category.DefaultLaborCost) : null,
            IsActive: Category.IsActive,
            createdAt: Category.CreatedAt,
        };
    }
    formatPackage(pkg) {
        return {
            ID: pkg.ID,
            Code: pkg.Code,
            Name: pkg.Name,
            CategoryId: pkg.ServiceCategoryID,
            Category: pkg.ServiceCategory?.Name,
            estimatedDuration: pkg.EstimatedDuration,
            sellingPrice: (0, number_1.number)(pkg.SellingPrice),
            CostPrice: (0, number_1.number)(pkg.CostPrice),
            profit: (0, number_1.number)(pkg.SellingPrice) - Number(pkg.CostPrice),
            profitMargin: Number(pkg.SellingPrice) > 0
                ? ((Number(pkg.SellingPrice) - Number(pkg.CostPrice)) / Number(pkg.SellingPrice)) * 100
                : 0,
            Description: pkg.Description,
            IsActive: pkg.IsActive,
            createdAt: pkg.CreatedAt,
            items: pkg.PackageItems?.map((item) => ({
                ID: item.ID,
                ProductId: item.ProductID,
                ProductName: item.Product?.Name || item.ItemName,
                ProductCode: item.Product?.Code,
                Quantity: (0, number_1.number)(item.Quantity),
                UnitPrice: (0, number_1.number)(item.UnitPrice),
                subTotal: (0, number_1.number)(item.Subtotal),
            })) || [],
        };
    }
};
exports.ServicePackageService = ServicePackageService;
exports.ServicePackageService = ServicePackageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServicePackageService);
