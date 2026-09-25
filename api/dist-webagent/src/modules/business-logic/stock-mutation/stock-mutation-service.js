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
exports.StockMutationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let StockMutationService = class StockMutationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createMutationCategory(dto, UserId) {
        const existing = await this.prisma.mutationCategory.findFirst({
            where: { Code: dto.Code },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Category with Code '${dto.Code}' already exists`);
        }
        const Category = await this.prisma.mutationCategory.create({
            data: {
                Code: dto.Code,
                Name: dto.Name,
                Description: dto.Description,
                Color: dto.Color,
                MutationType: dto.MutationType,
                IsActive: true,
            },
        });
        return {
            success: true,
            Category: this.formatCategory(Category),
        };
    }
    async getMutationCategory(CategoryId) {
        const Category = await this.prisma.mutationCategory.findUnique({
            where: { ID: CategoryId },
            include: { Mutations: { take: 5, orderBy: { Date: 'desc' } } },
        });
        if (!Category) {
            throw new common_1.NotFoundException('Mutation Category not found');
        }
        return this.formatCategory(Category);
    }
    async listMutationCategories(IsActive) {
        const where = {};
        if (IsActive !== undefined) {
            where.IsActive = IsActive;
        }
        const Categories = await this.prisma.mutationCategory.findMany({
            where,
            include: { _count: { select: { Mutations: true } } },
            orderBy: { Name: 'asc' },
        });
        return Categories.map((c) => ({
            ...this.formatCategory(c),
            MutationCount: c._count.Mutations,
        }));
    }
    async updateMutationCategory(CategoryId, dto) {
        const Category = await this.prisma.mutationCategory.findUnique({
            where: { ID: CategoryId },
        });
        if (!Category) {
            throw new common_1.NotFoundException('Mutation Category not found');
        }
        const updated = await this.prisma.mutationCategory.update({
            where: { ID: CategoryId },
            data: {
                Name: dto.Name,
                Description: dto.Description,
                Color: dto.Color,
                IsActive: dto.IsActive,
            },
        });
        return {
            success: true,
            Category: this.formatCategory(updated),
        };
    }
    async deleteMutationCategory(CategoryId) {
        const Category = await this.prisma.mutationCategory.findUnique({
            where: { ID: CategoryId },
            include: { _count: { select: { Mutations: true } } },
        });
        if (!Category) {
            throw new common_1.NotFoundException('Mutation Category not found');
        }
        if (Category._count.Mutations > 0) {
            throw new common_1.BadRequestException('Cannot delete Category with existing Mutations');
        }
        await this.prisma.mutationCategory.delete({
            where: { ID: CategoryId },
        });
        return {
            success: true,
            message: 'Mutation Category deleted successfully',
        };
    }
    async createStockMutation(dto, UserId) {
        const Warehouse = await this.prisma.warehouse.findUnique({
            where: { ID: dto.WarehouseId },
        });
        if (!Warehouse) {
            throw new common_1.NotFoundException('Warehouse not found');
        }
        const Category = await this.prisma.mutationCategory.findUnique({
            where: { ID: dto.MutationCategoryId },
        });
        if (!Category) {
            throw new common_1.NotFoundException('Mutation Category not found');
        }
        if (!Category.IsActive) {
            throw new common_1.BadRequestException('Mutation Category is not Active');
        }
        const Code = await this.generateMutationCode(Category.MutationType || 'ADJ');
        let TotalAmount = 0;
        for (const item of dto.Items) {
            const Product = await this.prisma.product.findUnique({
                where: { ID: item.ProductId },
            });
            if (!Product) {
                throw new common_1.NotFoundException(`Product ${item.ProductId} not found`);
            }
            const UnitPrice = item.UnitPrice ?? Number(Product.PurchasePrice);
            TotalAmount += item.Quantity * UnitPrice;
        }
        const isStockIn = ['IN', 'TRANSFER'].includes(Category.MutationType || '');
        const Mutation = await this.prisma.$transaction(async (tx) => {
            const newMutation = await tx.stockMutation.create({
                data: {
                    Code: Code,
                    Date: new Date(dto.MutationDate),
                    MutationCategoryID: dto.MutationCategoryId,
                    WarehouseID: dto.WarehouseId,
                    MutationType: Category.MutationType || 'ADJUSTMENT',
                    ReferenceNumber: dto.ReferenceNumber,
                    TotalAmount: new client_1.Prisma.Decimal(TotalAmount),
                    Notes: dto.Notes,
                    CreatedByID: UserId,
                },
                include: {
                    MutationCategory: true,
                    Warehouse: true,
                },
            });
            for (const item of dto.Items) {
                const Product = await tx.product.findUnique({
                    where: { ID: item.ProductId },
                });
                const UnitPrice = item.UnitPrice ?? Number(Product?.PurchasePrice || 0);
                const subTotal = item.Quantity * UnitPrice;
                await tx.stockMutationItem.create({
                    data: {
                        StockMutationID: newMutation.ID,
                        ProductID: item.ProductId,
                        ProductName: Product?.Name || 'Unknown',
                        Quantity: new client_1.Prisma.Decimal(item.Quantity),
                        UnitID: item.UnitId || Product?.UnitID || 1,
                        UnitPrice: new client_1.Prisma.Decimal(UnitPrice),
                        Subtotal: new client_1.Prisma.Decimal(subTotal),
                        Notes: item.Notes,
                    },
                });
                if (isStockIn) {
                    await tx.product.update({
                        where: { ID: item.ProductId },
                        data: { Stock: { increment: new client_1.Prisma.Decimal(item.Quantity) } },
                    });
                    await tx.productStock.upsert({
                        where: {
                            ProductID_WarehouseID: {
                                ProductID: item.ProductId,
                                WarehouseID: dto.WarehouseId,
                            },
                        },
                        create: {
                            ProductID: item.ProductId,
                            WarehouseID: dto.WarehouseId,
                            Quantity: new client_1.Prisma.Decimal(item.Quantity),
                            MinimumStock: new client_1.Prisma.Decimal(0),
                        },
                        update: {
                            Quantity: { increment: new client_1.Prisma.Decimal(item.Quantity) },
                        },
                    });
                }
                else {
                    await tx.product.update({
                        where: { ID: item.ProductId },
                        data: { Stock: { decrement: new client_1.Prisma.Decimal(item.Quantity) } },
                    });
                    await tx.productStock.upsert({
                        where: {
                            ProductID_WarehouseID: {
                                ProductID: item.ProductId,
                                WarehouseID: dto.WarehouseId,
                            },
                        },
                        create: {
                            ProductID: item.ProductId,
                            WarehouseID: dto.WarehouseId,
                            Quantity: new client_1.Prisma.Decimal(0),
                            MinimumStock: new client_1.Prisma.Decimal(0),
                        },
                        update: {
                            Quantity: { decrement: new client_1.Prisma.Decimal(item.Quantity) },
                        },
                    });
                }
            }
            return newMutation;
        });
        return {
            success: true,
            Mutation: {
                ID: Mutation.ID,
                Code: Mutation.Code,
                Date: Mutation.Date,
                Category: Mutation.MutationCategory.Name,
                MutationType: Mutation.MutationType,
                Warehouse: Mutation.Warehouse.Name,
                referenceNumber: Mutation.ReferenceNumber,
                TotalAmount,
                itemCount: dto.Items.length,
                Status: 'COMPLETED',
            },
        };
    }
    async getStockMutation(MutationId) {
        const Mutation = await this.prisma.stockMutation.findUnique({
            where: { ID: MutationId },
            include: {
                MutationCategory: true,
                Warehouse: true,
                Items: {
                    include: { Product: true, Unit: true },
                    orderBy: { SortOrder: 'asc' },
                },
                Creator: true,
            },
        });
        if (!Mutation) {
            throw new common_1.NotFoundException('Stock Mutation not found');
        }
        return {
            ID: Mutation.ID,
            Code: Mutation.Code,
            Date: Mutation.Date,
            CategoryId: Mutation.MutationCategoryID,
            Category: Mutation.MutationCategory.Name,
            CategoryCode: Mutation.MutationCategory.Code,
            MutationType: Mutation.MutationType,
            WarehouseId: Mutation.WarehouseID,
            Warehouse: Mutation.Warehouse.Name,
            referenceNumber: Mutation.ReferenceNumber,
            TotalAmount: (0, number_1.number)(Mutation.TotalAmount),
            Notes: Mutation.Notes,
            createdBy: Mutation.Creator?.Name || 'System',
            createdAt: Mutation.CreatedAt,
            items: Mutation.Items.map((item) => ({
                ID: item.ID,
                ProductId: item.ProductID,
                ProductName: item.Product?.Name || item.ProductName,
                ProductCode: item.Product?.Code,
                Quantity: (0, number_1.number)(item.Quantity),
                Unit: item.Unit?.Name,
                UnitPrice: (0, number_1.number)(item.UnitPrice),
                subTotal: (0, number_1.number)(item.Subtotal),
                Notes: item.Notes,
            })),
        };
    }
    async listStockMutations(dto) {
        const where = {};
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.Date.lte = new Date(dto.EndDate);
            }
        }
        if (dto.MutationCategoryId) {
            where.MutationCategoryID = dto.MutationCategoryId;
        }
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        if (dto.MutationType) {
            where.MutationType = dto.MutationType;
        }
        if (dto.Search) {
            where.OR = [
                { Code: { contains: dto.Search, mode: 'insensitive' } },
                { ReferenceNumber: { contains: dto.Search, mode: 'insensitive' } },
            ];
        }
        const Mutations = await this.prisma.stockMutation.findMany({
            where,
            include: {
                MutationCategory: true,
                Warehouse: true,
                Items: true,
            },
            orderBy: { Date: 'desc' },
        });
        return Mutations.map((m) => ({
            ID: m.ID,
            Code: m.Code,
            Date: m.Date,
            Category: m.MutationCategory.Name,
            CategoryColor: m.MutationCategory.Color,
            MutationType: m.MutationType,
            Warehouse: m.Warehouse.Name,
            referenceNumber: m.ReferenceNumber,
            TotalAmount: (0, number_1.number)(m.TotalAmount),
            itemCount: m.Items.length,
        }));
    }
    async updateStockMutation(MutationId, dto) {
        const Mutation = await this.prisma.stockMutation.findUnique({
            where: { ID: MutationId },
        });
        if (!Mutation) {
            throw new common_1.NotFoundException('Stock Mutation not found');
        }
        const updated = await this.prisma.stockMutation.update({
            where: { ID: MutationId },
            data: {
                ReferenceNumber: dto.ReferenceNumber,
                Notes: dto.Notes,
            },
            include: { MutationCategory: true, Warehouse: true },
        });
        return {
            success: true,
            Mutation: {
                ID: updated.ID,
                Code: updated.Code,
                referenceNumber: updated.ReferenceNumber,
                Notes: updated.Notes,
            },
        };
    }
    async reverseStockMutation(MutationId, reason, UserId) {
        const original = await this.prisma.stockMutation.findUnique({
            where: { ID: MutationId },
            include: { MutationCategory: true, Items: true },
        });
        if (!original) {
            throw new common_1.NotFoundException('Stock Mutation not found');
        }
        const reverseType = ['IN', 'TRANSFER'].includes(original.MutationType)
            ? 'OUT'
            : 'IN';
        let reverseCategory = await this.prisma.mutationCategory.findFirst({
            where: {
                MutationType: reverseType,
                IsActive: true,
            },
        });
        if (!reverseCategory) {
            reverseCategory = await this.prisma.mutationCategory.create({
                data: {
                    Code: `REV-${reverseType}`,
                    Name: `Reverse ${reverseType}`,
                    MutationType: reverseType,
                    IsActive: true,
                },
            });
        }
        const reverseCode = await this.generateMutationCode(`REV-${reverseType}`);
        const reverseMutation = await this.prisma.$transaction(async (tx) => {
            const newMutation = await tx.stockMutation.create({
                data: {
                    Code: reverseCode,
                    Date: new Date(),
                    MutationCategoryID: reverseCategory.ID,
                    WarehouseID: original.WarehouseID,
                    MutationType: reverseType,
                    ReferenceNumber: `REVERSE-${original.Code}`,
                    TotalAmount: original.TotalAmount,
                    Notes: `Reversal of ${original.Code}: ${reason}`,
                    CreatedByID: UserId,
                },
            });
            for (const item of original.Items) {
                await tx.stockMutationItem.create({
                    data: {
                        StockMutationID: newMutation.ID,
                        ProductID: item.ProductID,
                        ProductName: item.ProductName,
                        Quantity: item.Quantity,
                        UnitID: item.UnitID,
                        UnitPrice: item.UnitPrice,
                        Subtotal: item.Subtotal,
                        Notes: `Reversal: ${item.Notes || ''}`,
                    },
                });
                const isReverseIn = ['IN', 'TRANSFER'].includes(reverseType);
                if (isReverseIn) {
                    await tx.product.update({
                        where: { ID: item.ProductID },
                        data: { Stock: { increment: item.Quantity } },
                    });
                }
                else {
                    await tx.product.update({
                        where: { ID: item.ProductID },
                        data: { Stock: { decrement: item.Quantity } },
                    });
                }
            }
            return newMutation;
        });
        return {
            success: true,
            originalMutation: original.Code,
            reverseMutation: {
                ID: reverseMutation.ID,
                Code: reverseMutation.Code,
                Date: reverseMutation.Date,
            },
        };
    }
    async getMutationSummary(dto) {
        const where = {};
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.Date.lte = new Date(dto.EndDate);
            }
        }
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        const Mutations = await this.prisma.stockMutation.findMany({
            where,
            include: {
                MutationCategory: true,
                Items: true,
            },
            orderBy: { Date: 'desc' },
        });
        const Summary = {
            IN: { Type: 'IN', label: 'Stock In', Count: 0, TotalAmount: 0, TotalItems: 0 },
            OUT: { Type: 'OUT', label: 'Stock Out', Count: 0, TotalAmount: 0, TotalItems: 0 },
            ADJUSTMENT: { Type: 'ADJUSTMENT', label: 'Adjustment', Count: 0, TotalAmount: 0, TotalItems: 0 },
            TRANSFER: { Type: 'TRANSFER', label: 'Transfer', Count: 0, TotalAmount: 0, TotalItems: 0 },
        };
        for (const Mutation of Mutations) {
            const Type = Mutation.MutationType || 'ADJUSTMENT';
            if (Summary[Type]) {
                Summary[Type].Count++;
                Summary[Type].TotalAmount += Number(Mutation.TotalAmount);
                Summary[Type].TotalItems += Mutation.Items.length;
            }
        }
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            WarehouseId: dto.WarehouseId,
            TotalMutations: Mutations.length,
            Summary: Object.values(Summary).filter((s) => s.Count > 0),
        };
    }
    async getMutationReport(dto) {
        const where = {};
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.Date.lte = new Date(dto.EndDate);
            }
        }
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        const Mutations = await this.prisma.stockMutation.findMany({
            where,
            include: {
                MutationCategory: true,
                Items: { include: { Product: true } },
            },
            orderBy: { Date: 'desc' },
        });
        const byCategory = {};
        for (const Mutation of Mutations) {
            if (!byCategory[Mutation.MutationCategoryID]) {
                byCategory[Mutation.MutationCategoryID] = {
                    CategoryId: Mutation.MutationCategoryID,
                    CategoryName: Mutation.MutationCategory.Name,
                    CategoryCode: Mutation.MutationCategory.Code,
                    color: Mutation.MutationCategory.Color,
                    MutationType: Mutation.MutationType,
                    Mutations: [],
                    TotalAmount: 0,
                    TotalItems: 0,
                };
            }
            byCategory[Mutation.MutationCategoryID].Mutations.push({
                ID: Mutation.ID,
                Code: Mutation.Code,
                Date: Mutation.Date,
                referenceNumber: Mutation.ReferenceNumber,
                itemCount: Mutation.Items.length,
                Amount: (0, number_1.number)(Mutation.TotalAmount),
            });
            byCategory[Mutation.MutationCategoryID].TotalAmount += Number(Mutation.TotalAmount);
            byCategory[Mutation.MutationCategoryID].TotalItems += Mutation.Items.length;
        }
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            WarehouseId: dto.WarehouseId,
            GroupBy: dto.GroupBy || 'Category',
            TotalMutations: Mutations.length,
            Categories: Object.values(byCategory),
        };
    }
    async getProductMutationHistory(ProductId, startDate, endDate) {
        const where = {
            Items: { some: { ProductID: ProductId } },
        };
        if (startDate || endDate) {
            where.Date = {};
            if (startDate) {
                where.Date.gte = new Date(startDate);
            }
            if (endDate) {
                where.Date.lte = new Date(endDate);
            }
        }
        const Mutations = await this.prisma.stockMutation.findMany({
            where,
            include: {
                MutationCategory: true,
                Items: { where: { ProductID: ProductId } },
            },
            orderBy: { Date: 'desc' },
        });
        let TotalIn = 0;
        let TotalOut = 0;
        const history = Mutations
            .filter((m) => m.Items.length > 0)
            .map((m) => {
            const item = m.Items[0];
            const Quantity = Number(item.Quantity);
            const isIn = ['IN', 'TRANSFER'].includes(m.MutationType);
            if (isIn) {
                TotalIn += Quantity;
            }
            else {
                TotalOut += Quantity;
            }
            return {
                ID: m.ID,
                Code: m.Code,
                Date: m.Date,
                Category: m.MutationCategory.Name,
                MutationType: m.MutationType,
                referenceNumber: m.ReferenceNumber,
                Quantity,
                UnitPrice: (0, number_1.number)(item.UnitPrice),
                subTotal: (0, number_1.number)(item.Subtotal),
            };
        });
        return {
            ProductId,
            period: { startDate, endDate },
            TotalIn,
            TotalOut,
            netChange: TotalIn - TotalOut,
            history,
        };
    }
    formatCategory(Category) {
        return {
            ID: Category.ID,
            Code: Category.Code,
            Name: Category.Name,
            Description: Category.Description,
            color: Category.Color,
            MutationType: Category.MutationType,
            IsActive: Category.IsActive,
            createdAt: Category.CreatedAt,
        };
    }
    async generateMutationCode(Type) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const TypeCode = Type.substring(0, 3).toUpperCase();
        const prefix = `MUT-${TypeCode}-${year}${month}`;
        const lastMutation = await this.prisma.stockMutation.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastMutation) {
            const lastSeq = parseInt(lastMutation.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.StockMutationService = StockMutationService;
exports.StockMutationService = StockMutationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockMutationService);
