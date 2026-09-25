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
exports.AssemblyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
const date_range_1 = require("../shared/date-range");
let AssemblyService = class AssemblyService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAssembly(dto, UserId) {
        const assemblyNumber = await this.generateAssemblyNumber();
        let TotalComponentCost = 0;
        const ComponentsWithDetails = [];
        for (const Component of dto.Components) {
            const Product = await this.prisma.product.findUnique({
                where: { ID: Component.ProductId },
                include: { Unit: true },
            });
            if (!Product) {
                throw new common_1.NotFoundException(`Product ${Component.ProductId} not found`);
            }
            const availableStock = Number(Product.Stock);
            if (availableStock < Component.Quantity) {
                throw new common_1.BadRequestException(`Insufficient Stock for ${Product.Name}. Available: ${availableStock}, Required: ${Component.Quantity}`);
            }
            const UnitPrice = Component.UnitPrice ?? Number(Product.PurchasePrice);
            const subTotal = UnitPrice * Component.Quantity;
            TotalComponentCost += subTotal;
            ComponentsWithDetails.push({
                productId: Component.ProductId,
                productName: Product.Name,
                productCode: Product.Code,
                quantity: Component.Quantity,
                unitId: Component.UnitId || Product.UnitID,
                unitPrice: UnitPrice,
                subTotal,
            });
        }
        const completedStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'COMPLETED' },
        });
        const Assembly = await this.prisma.$transaction(async (tx) => {
            const newAssembly = await tx.assembly.create({
                data: {
                    AssemblyNumber: assemblyNumber,
                    AssemblyDate: new Date(dto.AssemblyDate),
                    WarehouseID: dto.WarehouseId || null,
                    Description: dto.Description,
                    ReferenceNumber: dto.ReferenceNumber,
                    TotalComponentCost: new client_1.Prisma.Decimal(TotalComponentCost),
                    StatusID: completedStatus?.ID || 2,
                    Notes: dto.Notes,
                    CreatedByID: UserId,
                },
            });
            await tx.assemblyComponent.createMany({
                data: ComponentsWithDetails.map((c, index) => ({
                    AssemblyID: newAssembly.ID,
                    ProductID: c.productId,
                    ProductName: c.productName,
                    Quantity: new client_1.Prisma.Decimal(c.quantity),
                    UnitID: c.unitId,
                    UnitPrice: new client_1.Prisma.Decimal(c.unitPrice),
                    SubTotal: new client_1.Prisma.Decimal(c.subTotal),
                    SortOrder: index + 1,
                })),
            });
            for (const Component of ComponentsWithDetails) {
                await tx.product.update({
                    where: { ID: Component.productId },
                    data: { Stock: { decrement: new client_1.Prisma.Decimal(Component.quantity) } },
                });
                if (dto.WarehouseId) {
                    await tx.productStock.update({
                        where: {
                            ProductID_WarehouseID: {
                                ProductID: Component.productId,
                                WarehouseID: dto.WarehouseId,
                            },
                        },
                        data: { Quantity: { decrement: new client_1.Prisma.Decimal(Component.Quantity) } },
                    });
                }
            }
            return newAssembly;
        });
        return {
            success: true,
            Assembly: {
                ID: Assembly.ID,
                AssemblyNumber: Assembly.AssemblyNumber,
                AssemblyDate: Assembly.AssemblyDate,
                WarehouseId: Assembly.WarehouseID,
                Description: Assembly.Description,
                TotalComponentCost,
                Status: completedStatus?.Name || 'Completed',
                ComponentCount: dto.Components.length,
                Components: ComponentsWithDetails,
            },
        };
    }
    async getAssembly(AssemblyId) {
        const Assembly = await this.prisma.assembly.findUnique({
            where: { ID: AssemblyId },
            include: {
                Warehouse: true,
                Status: true,
                Components: {
                    include: { Product: true, Unit: true },
                    orderBy: { SortOrder: 'asc' },
                },
            },
        });
        if (!Assembly) {
            throw new common_1.NotFoundException('Assembly not found');
        }
        return {
            ID: Assembly.ID,
            AssemblyNumber: Assembly.AssemblyNumber,
            AssemblyDate: Assembly.AssemblyDate,
            Warehouse: Assembly.Warehouse,
            Description: Assembly.Description,
            referenceNumber: Assembly.ReferenceNumber,
            TotalComponentCost: (0, number_1.number)(Assembly.TotalComponentCost),
            UnitCost: Assembly.Components.length > 0
                ? Number(Assembly.TotalComponentCost) / Assembly.Components.length
                : 0,
            Status: Assembly.Status,
            Notes: Assembly.Notes,
            createdBy: Assembly.CreatedByID || 'System',
            createdAt: Assembly.CreatedAt,
            Components: Assembly.Components.map((c) => ({
                ID: c.ID,
                ProductId: c.ProductID,
                ProductName: c.Product?.Name || c.ProductName,
                ProductCode: c.Product?.Code,
                Quantity: (0, number_1.number)(c.Quantity),
                Unit: c.Unit?.Name,
                UnitPrice: (0, number_1.number)(c.UnitPrice),
                subTotal: (0, number_1.number)(c.Subtotal),
            })),
        };
    }
    async listAssemblies(dto) {
        const where = {};
        if (dto.StartDate || dto.EndDate) {
            where.AssemblyDate = {};
            if (dto.StartDate) {
                where.AssemblyDate.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.AssemblyDate.lte = new Date(dto.EndDate);
            }
        }
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        if (dto.status) {
            where.Status = { Code: dto.status };
        }
        if (dto.Search) {
            where.OR = [
                { AssemblyNumber: { contains: dto.Search, mode: 'insensitive' } },
                { Description: { contains: dto.Search, mode: 'insensitive' } },
            ];
        }
        const Assemblies = await this.prisma.assembly.findMany({
            where,
            include: {
                Warehouse: true,
                Status: true,
                Components: true,
            },
            orderBy: { AssemblyDate: 'desc' },
        });
        return Assemblies.map((a) => ({
            ID: a.ID,
            AssemblyNumber: a.AssemblyNumber,
            AssemblyDate: a.AssemblyDate,
            Warehouse: a.Warehouse?.Name,
            Description: a.Description,
            TotalComponentCost: (0, number_1.number)(a.TotalComponentCost),
            Status: a.Status?.Name,
            StatusColor: a.Status?.Color,
            ComponentCount: a.Components.length,
        }));
    }
    async updateAssembly(AssemblyId, dto, UserId) {
        const Assembly = await this.prisma.assembly.findUnique({
            where: { ID: AssemblyId },
            include: { Status: true },
        });
        if (!Assembly) {
            throw new common_1.NotFoundException('Assembly not found');
        }
        if (Assembly.Status?.IsTerminal) {
            throw new common_1.BadRequestException('Cannot update completed Assembly');
        }
        const updated = await this.prisma.assembly.update({
            where: { ID: AssemblyId },
            data: {
                Description: dto.Description,
                WarehouseID: dto.WarehouseId,
                Notes: dto.Notes,
            },
        });
        return {
            success: true,
            Assembly: {
                ID: updated.ID,
                AssemblyNumber: updated.AssemblyNumber,
                Description: updated.Description,
            },
        };
    }
    async cancelAssembly(AssemblyId, reason, UserId) {
        const Assembly = await this.prisma.assembly.findUnique({
            where: { ID: AssemblyId },
            include: {
                Status: true,
                Components: true,
            },
        });
        if (!Assembly) {
            throw new common_1.NotFoundException('Assembly not found');
        }
        if (Assembly.Status?.IsTerminal) {
            throw new common_1.BadRequestException('Cannot cancel completed Assembly');
        }
        const cancelledStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'CANCELLED' },
        });
        await this.prisma.$transaction(async (tx) => {
            for (const Component of Assembly.Components) {
                await tx.product.update({
                    where: { ID: Component.ProductID },
                    data: { Stock: { increment: new client_1.Prisma.Decimal(Component.Quantity) } },
                });
                if (Assembly.WarehouseID) {
                    await tx.productStock.update({
                        where: {
                            ProductID_WarehouseID: {
                                ProductID: Component.ProductID,
                                WarehouseID: Assembly.WarehouseID,
                            },
                        },
                        data: { Quantity: { increment: new client_1.Prisma.Decimal(Component.Quantity) } },
                    });
                }
            }
            await tx.assembly.update({
                where: { ID: AssemblyId },
                data: {
                    StatusID: cancelledStatus?.ID,
                    Notes: `Cancelled: ${reason}. ${Assembly.Notes || ''}`,
                },
            });
        });
        return {
            success: true,
            AssemblyId,
            Status: 'CANCELLED',
            returnedStock: Assembly.Components.length,
        };
    }
    async createBOM(dto, UserId) {
        const Code = dto.Code || (await this.generateBOMCode());
        const existing = await this.prisma.bOM.findFirst({
            where: {
                OR: [
                    { Code: Code },
                    { Name: dto.Name },
                ],
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('BOM with this Code or Name already exists');
        }
        let TotalCost = 0;
        let TotalWaste = 0;
        const itemsWithDetails = [];
        for (const item of dto.Items) {
            const Product = await this.prisma.product.findUnique({
                where: { ID: item.ProductId },
                include: { Unit: true },
            });
            if (!Product) {
                throw new common_1.NotFoundException(`Product ${item.ProductId} not found`);
            }
            const UnitPrice = Number(Product.PurchasePrice);
            const QuantityNeeded = item.Quantity * (1 + (item.WastePercent || 0) / 100);
            const subTotal = UnitPrice * QuantityNeeded;
            TotalCost += subTotal;
            TotalWaste += UnitPrice * item.Quantity * ((item.WastePercent || 0) / 100);
            itemsWithDetails.push({
                ProductId: item.ProductId,
                ProductName: Product.Name,
                ProductCode: Product.Code,
                Quantity: item.Quantity,
                wastePercent: item.WastePercent || 0,
                UnitId: item.UnitId || Product.UnitID,
                UnitPrice,
                subTotal,
            });
        }
        const UnitCost = dto.QuantityProduced ? TotalCost / dto.QuantityProduced : TotalCost;
        const BOM = await this.prisma.bOM.create({
            data: {
                Code: Code,
                Name: dto.Name,
                ProductID: dto.ProductId || null,
                QuantityProduced: dto.QuantityProduced || 1,
                WarehouseID: dto.WarehouseId || null,
                Description: dto.Description,
                TotalCost: new client_1.Prisma.Decimal(TotalCost),
                UnitCost: new client_1.Prisma.Decimal(UnitCost),
                IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
                CreatedByID: UserId,
                BOMItems: {
                    create: itemsWithDetails.map((item, index) => ({
                        ProductID: item.ProductId,
                        ProductName: item.ProductName,
                        Quantity: new client_1.Prisma.Decimal(item.Quantity),
                        WastePercent: new client_1.Prisma.Decimal(item.wastePercent),
                        UnitID: item.UnitId,
                        UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice),
                        SubTotal: new client_1.Prisma.Decimal(item.subTotal),
                        SortOrder: index + 1,
                    })),
                },
            },
            include: {
                Product: true,
                Warehouse: true,
                BOMItems: { include: { Product: true, Unit: true }, orderBy: { SortOrder: 'asc' } },
            },
        });
        return {
            success: true,
            BOM: this.formatBOM(BOM),
        };
    }
    async getBOM(BOMId) {
        const BOM = await this.prisma.bOM.findUnique({
            where: { ID: BOMId },
            include: {
                Product: true,
                Warehouse: true,
                BOMItems: {
                    include: { Product: true, Unit: true },
                    orderBy: { SortOrder: 'asc' },
                },
            },
        });
        if (!BOM) {
            throw new common_1.NotFoundException('BOM not found');
        }
        return this.formatBOM(BOM);
    }
    async listBOMs(dto) {
        const where = {};
        if (dto.IsActive !== undefined) {
            where.IsActive = dto.IsActive;
        }
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        if (dto.ProductId) {
            where.ProductID = dto.ProductId;
        }
        if (dto.Search) {
            where.OR = [
                { Name: { contains: dto.Search, mode: 'insensitive' } },
                { Code: { contains: dto.Search, mode: 'insensitive' } },
            ];
        }
        const BOMs = await this.prisma.bOM.findMany({
            where,
            include: {
                Product: true,
                Warehouse: true,
                BOMItems: true,
            },
            orderBy: { Name: 'asc' },
        });
        return BOMs.map((BOM) => ({
            ID: BOM.ID,
            Code: BOM.Code,
            Name: BOM.Name,
            ProductName: BOM.Product?.Name,
            ProductCode: BOM.Product?.Code,
            QuantityProduced: BOM.QuantityProduced,
            Warehouse: BOM.Warehouse?.Name,
            TotalCost: (0, number_1.number)(BOM.TotalCost),
            UnitCost: (0, number_1.number)(BOM.UnitCost),
            IsActive: BOM.IsActive,
            itemCount: BOM.BOMItems.length,
            createdAt: BOM.CreatedAt,
        }));
    }
    async updateBOM(BOMId, dto, UserId) {
        const BOM = await this.prisma.bOM.findUnique({
            where: { ID: BOMId },
        });
        if (!BOM) {
            throw new common_1.NotFoundException('BOM not found');
        }
        let TotalCost = 0;
        if (dto.Items) {
            for (const item of dto.Items) {
                const Product = await this.prisma.product.findUnique({
                    where: { ID: item.ProductId },
                });
                if (Product) {
                    const QuantityNeeded = item.Quantity * (1 + (item.WastePercent || 0) / 100);
                    TotalCost += Number(Product.PurchasePrice) * QuantityNeeded;
                }
            }
        }
        const updated = await this.prisma.bOM.update({
            where: { ID: BOMId },
            data: {
                Name: dto.Name,
                ProductID: dto.ProductId,
                QuantityProduced: dto.QuantityProduced,
                WarehouseID: dto.WarehouseId,
                Description: dto.Description,
                DefaultCost: dto.DefaultCost ? new client_1.Prisma.Decimal(dto.DefaultCost) : undefined,
                TotalCost: TotalCost > 0 ? new client_1.Prisma.Decimal(TotalCost) : undefined,
                IsActive: dto.IsActive,
            },
            include: {
                Product: true,
                Warehouse: true,
                BOMItems: { include: { Product: true, Unit: true } },
            },
        });
        return {
            success: true,
            BOM: this.formatBOM(updated),
        };
    }
    async deleteBOM(BOMId) {
        const BOM = await this.prisma.bOM.findUnique({
            where: { ID: BOMId },
            include: { BOMItems: true },
        });
        if (!BOM) {
            throw new common_1.NotFoundException('BOM not found');
        }
        await this.prisma.bOMItem.deleteMany({
            where: { BOMID: BOMId },
        });
        await this.prisma.bOM.delete({
            where: { ID: BOMId },
        });
        return {
            success: true,
            deletedBOM: BOM.Name,
        };
    }
    async cloneBOM(BOMId, newName, UserId) {
        const originalBOM = await this.prisma.bOM.findUnique({
            where: { ID: BOMId },
            include: { BOMItems: true },
        });
        if (!originalBOM) {
            throw new common_1.NotFoundException('BOM not found');
        }
        const newCode = await this.generateBOMCode();
        const clonedBOM = await this.prisma.bOM.create({
            data: {
                Code: newCode,
                Name: newName,
                ProductID: originalBOM.ProductID,
                QuantityProduced: originalBOM.QuantityProduced,
                WarehouseID: originalBOM.WarehouseID,
                Description: originalBOM.Description,
                TotalCost: originalBOM.TotalCost,
                UnitCost: originalBOM.UnitCost,
                IsActive: true,
                CreatedByID: UserId,
                BOMItems: {
                    create: originalBOM.BOMItems.map((item) => ({
                        ProductID: item.ProductID,
                        ProductName: item.ProductName,
                        Quantity: item.Quantity,
                        WastePercent: item.WastePercent,
                        UnitID: item.UnitID,
                        UnitPrice: item.UnitPrice,
                        SubTotal: item.Subtotal,
                        SortOrder: item.SortOrder,
                    })),
                },
            },
            include: {
                Product: true,
                Warehouse: true,
                BOMItems: { include: { Product: true, Unit: true } },
            },
        });
        return {
            success: true,
            BOM: this.formatBOM(clonedBOM),
        };
    }
    async assembleFromBOM(dto, UserId) {
        const BOM = await this.prisma.bOM.findUnique({
            where: { ID: dto.BOMId },
            include: {
                BOMItems: { include: { Product: true } },
                Product: true,
            },
        });
        if (!BOM) {
            throw new common_1.NotFoundException('BOM not found');
        }
        if (!BOM.IsActive) {
            throw new common_1.BadRequestException('BOM is not Active');
        }
        const assemblyNumber = await this.generateAssemblyNumber();
        const QuantityMultiplier = dto.Quantity / Number(BOM.QuantityProduced || 1);
        let TotalComponentCost = 0;
        const ComponentsWithDetails = [];
        for (const item of BOM.BOMItems) {
            const requiredQty = Number(item.Quantity) * QuantityMultiplier;
            const availableStock = Number(item.Product?.Stock || 0);
            if (availableStock < requiredQty) {
                throw new common_1.BadRequestException(`Insufficient Stock for ${item.Product?.Name || item.ProductName}. ` +
                    `Available: ${availableStock}, Required: ${requiredQty.toFixed(2)}`);
            }
            const UnitPrice = Number(item.UnitPrice);
            const subTotal = UnitPrice * requiredQty;
            TotalComponentCost += subTotal;
            ComponentsWithDetails.push({
                ProductId: item.ProductID,
                ProductName: item.Product?.Name || item.ProductName,
                ProductCode: item.Product?.Code,
                Quantity: requiredQty,
                UnitId: item.UnitID,
                UnitPrice,
                subTotal,
                wastePercent: (0, number_1.number)(item.WastePercent),
            });
        }
        const UnitCost = TotalComponentCost / dto.Quantity;
        const completedStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'COMPLETED' },
        });
        const Assembly = await this.prisma.$transaction(async (tx) => {
            const newAssembly = await tx.assembly.create({
                data: {
                    AssemblyNumber: assemblyNumber,
                    AssemblyDate: new Date(dto.AssemblyDate),
                    WarehouseID: dto.WarehouseId || BOM.WarehouseID,
                    Description: `Assembly from BOM: ${BOM.Name}`,
                    ReferenceNumber: `BOM-${BOM.Code}`,
                    TotalComponentCost: new client_1.Prisma.Decimal(TotalComponentCost),
                    StatusID: completedStatus?.ID || 2,
                    Notes: dto.Notes,
                    CreatedByID: UserId,
                    BOMID: BOM.ID,
                },
            });
            await tx.assemblyComponent.createMany({
                data: ComponentsWithDetails.map((c, index) => ({
                    AssemblyID: newAssembly.ID,
                    ProductID: c.productId,
                    ProductName: c.productName,
                    Quantity: new client_1.Prisma.Decimal(c.quantity),
                    UnitID: c.unitId,
                    UnitPrice: new client_1.Prisma.Decimal(c.unitPrice),
                    SubTotal: new client_1.Prisma.Decimal(c.subTotal),
                    SortOrder: index + 1,
                })),
            });
            for (const Component of ComponentsWithDetails) {
                await tx.product.update({
                    where: { ID: Component.ProductId },
                    data: { Stock: { decrement: new client_1.Prisma.Decimal(Component.Quantity) } },
                });
                if (dto.WarehouseId || BOM.WarehouseID) {
                    await tx.productStock.update({
                        where: {
                            ProductID_WarehouseID: {
                                ProductID: Component.ProductId,
                                WarehouseID: dto.WarehouseId || BOM.WarehouseID,
                            },
                        },
                        data: { Quantity: { decrement: new client_1.Prisma.Decimal(Component.Quantity) } },
                    });
                }
            }
            if (BOM.ProductID && dto.AutoAssembly) {
                await tx.product.update({
                    where: { ID: BOM.ProductID },
                    data: { Stock: { increment: new client_1.Prisma.Decimal(dto.Quantity) } },
                });
                if (dto.WarehouseId || BOM.WarehouseID) {
                    await tx.productStock.upsert({
                        where: {
                            ProductID_WarehouseID: {
                                ProductID: BOM.ProductID,
                                WarehouseID: dto.WarehouseId || BOM.WarehouseID,
                            },
                        },
                        create: {
                            ProductID: BOM.ProductID,
                            WarehouseID: dto.WarehouseId || BOM.WarehouseID,
                            Quantity: new client_1.Prisma.Decimal(dto.Quantity),
                        },
                        update: {
                            Quantity: { increment: new client_1.Prisma.Decimal(dto.Quantity) },
                        },
                    });
                }
            }
            return newAssembly;
        });
        return {
            success: true,
            Assembly: {
                ID: Assembly.ID,
                AssemblyNumber: Assembly.AssemblyNumber,
                AssemblyDate: Assembly.AssemblyDate,
                BOMId: BOM.ID,
                BOMName: BOM.Name,
                outputProduct: BOM.Product?.Name,
                QuantityProduced: dto.Quantity,
                WarehouseId: Assembly.WarehouseID,
                TotalComponentCost,
                UnitCost,
                Status: completedStatus?.Name || 'Completed',
                Components: ComponentsWithDetails,
            },
        };
    }
    async calculateBOMCost(dto) {
        if (dto.BOMId) {
            const BOM = await this.prisma.bOM.findUnique({
                where: { ID: dto.BOMId },
                include: { BOMItems: { include: { Product: true, Unit: true } } },
            });
            if (!BOM) {
                throw new common_1.NotFoundException('BOM not found');
            }
            const QuantityMultiplier = (dto.Quantity || 1) / Number(BOM.QuantityProduced || 1);
            const items = BOM.BOMItems.map((item) => {
                const requiredQty = Number(item.Quantity) * QuantityMultiplier;
                const Cost = Number(item.UnitPrice) * requiredQty;
                return {
                    ProductId: item.ProductID,
                    ProductName: item.Product?.Name || item.ProductName,
                    baseQuantity: (0, number_1.number)(item.Quantity),
                    wastePercent: (0, number_1.number)(item.WastePercent),
                    requiredQuantity: requiredQty,
                    Unit: item.Unit?.Name,
                    UnitPrice: (0, number_1.number)(item.UnitPrice),
                    Cost,
                };
            });
            const TotalCost = items.reduce((sum, item) => sum + item.Cost, 0);
            return {
                BOMId: BOM.ID,
                BOMName: BOM.Name,
                BOMQuantity: BOM.QuantityProduced,
                RequestedQuantity: dto.Quantity || 1,
                TotalCost,
                UnitCost: TotalCost / (dto.Quantity || 1),
                items,
                canProduce: true,
            };
        }
        if (dto.ProductId) {
            const BOMs = await this.prisma.bOM.findMany({
                where: { ProductID: dto.ProductId, IsActive: true },
                include: { BOMItems: { include: { Product: true } } },
            });
            if (BOMs.length === 0) {
                return {
                    ProductId: dto.ProductId,
                    hasBOM: false,
                    message: 'No BOM found for this Product',
                };
            }
            const QuantityMultiplier = (dto.Quantity || 1) / Number(BOMs[0].QuantityProduced || 1);
            const BOM = BOMs[0];
            const items = BOM.BOMItems.map((item) => {
                const requiredQty = Number(item.Quantity) * QuantityMultiplier;
                const Cost = Number(item.UnitPrice) * requiredQty;
                return {
                    ProductId: item.ProductID,
                    ProductName: item.Product?.Name || item.ProductName,
                    requiredQuantity: requiredQty,
                    Cost,
                };
            });
            const TotalCost = items.reduce((sum, item) => sum + item.Cost, 0);
            return {
                ProductId: dto.ProductId,
                hasBOM: true,
                DefaultBOMId: BOM.ID,
                TotalCost,
                UnitCost: TotalCost / (dto.Quantity || 1),
                items,
            };
        }
        throw new common_1.BadRequestException('Must provIDe either BOMId or ProductId');
    }
    async compareBOMs(BOMId1, BOMId2) {
        BOMId1 = (0, date_range_1.requireIntParam)(BOMId1, 'bomId1');
        BOMId2 = (0, date_range_1.requireIntParam)(BOMId2, 'bomId2');
        const [BOM1, BOM2] = await Promise.all([
            this.prisma.bOM.findUnique({
                where: { ID: BOMId1 },
                include: { BOMItems: { include: { Product: true } } },
            }),
            this.prisma.bOM.findUnique({
                where: { ID: BOMId2 },
                include: { BOMItems: { include: { Product: true } } },
            }),
        ]);
        if (!BOM1 || !BOM2) {
            throw new common_1.NotFoundException('One or both BOMs not found');
        }
        const BOM1Items = new Map(BOM1.BOMItems.map((i) => [i.ProductID, i]));
        const BOM2Items = new Map(BOM2.BOMItems.map((i) => [i.ProductID, i]));
        const allProductIds = new Set([
            ...BOM1.BOMItems.map((i) => i.ProductID),
            ...BOM2.BOMItems.map((i) => i.ProductID),
        ]);
        const comparisons = [];
        for (const ProductId of allProductIds) {
            const item1 = BOM1Items.get(ProductId);
            const item2 = BOM2Items.get(ProductId);
            comparisons.push({
                ProductId,
                ProductName: item1?.Product?.Name || item2?.Product?.Name || 'Unknown',
                BOM1: item1 ? {
                    Quantity: (0, number_1.number)(item1.Quantity),
                    Cost: (0, number_1.number)(item1.Subtotal),
                } : null,
                BOM2: item2 ? {
                    Quantity: (0, number_1.number)(item2.Quantity),
                    Cost: (0, number_1.number)(item2.Subtotal),
                } : null,
            });
        }
        return {
            BOM1: {
                ID: BOM1.ID,
                Name: BOM1.Name,
                TotalCost: (0, number_1.number)(BOM1.TotalCost),
            },
            BOM2: {
                ID: BOM2.ID,
                Name: BOM2.Name,
                TotalCost: (0, number_1.number)(BOM2.TotalCost),
            },
            CostDifference: (0, number_1.number)(BOM1.TotalCost) - Number(BOM2.TotalCost),
            comparison: comparisons,
        };
    }
    async getAssemblyAnalytics(startDate, endDate) {
        const { start, end } = (0, date_range_1.resolveDateRange)(startDate, endDate);
        const Assemblies = await this.prisma.assembly.findMany({
            where: {
                AssemblyDate: { gte: start, lte: end },
            },
            include: {
                Status: true,
                Components: { include: { Product: true } },
            },
        });
        const TotalAssemblies = Assemblies.length;
        const TotalComponentCost = Assemblies.reduce((sum, a) => sum + Number(a.TotalComponentCost), 0);
        const byStatus = {};
        for (const Assembly of Assemblies) {
            const StatusName = Assembly.Status?.Name || 'Unknown';
            byStatus[StatusName] = (byStatus[StatusName] || 0) + 1;
        }
        const ComponentUsage = new Map();
        for (const Assembly of Assemblies) {
            for (const Component of Assembly.Components) {
                const existing = ComponentUsage.get(Component.ProductID);
                if (existing) {
                    existing.Quantity += Number(Component.Quantity);
                    existing.Cost += Number(Component.Subtotal);
                }
                else {
                    ComponentUsage.set(Component.ProductID, {
                        Name: Component.Product?.Name || Component.ProductName,
                        Quantity: (0, number_1.number)(Component.Quantity),
                        Cost: (0, number_1.number)(Component.Subtotal),
                    });
                }
            }
        }
        const topComponents = Array.from(ComponentUsage.entries())
            .sort((a, b) => b[1].Cost - a[1].Cost)
            .slice(0, 10)
            .map(([ID, data]) => ({
            ProductId: ID,
            ProductName: data.Name,
            TotalQuantity: data.Quantity,
            TotalCost: data.Cost,
        }));
        return {
            period: { startDate, endDate },
            Summary: {
                TotalAssemblies,
                TotalComponentCost,
                averageCostPerAssembly: TotalAssemblies > 0 ? TotalComponentCost / TotalAssemblies : 0,
            },
            byStatus: Object.entries(byStatus).map(([Status, Count]) => ({ Status, Count })),
            topComponents,
        };
    }
    formatBOM(BOM) {
        return {
            ID: BOM.ID,
            Code: BOM.Code,
            Name: BOM.Name,
            ProductId: BOM.ProductID,
            ProductName: BOM.Product?.Name,
            ProductCode: BOM.Product?.Code,
            QuantityProduced: BOM.QuantityProduced,
            WarehouseId: BOM.WarehouseID,
            Warehouse: BOM.Warehouse?.Name,
            Description: BOM.Description,
            TotalCost: (0, number_1.number)(BOM.TotalCost),
            UnitCost: (0, number_1.number)(BOM.UnitCost),
            DefaultCost: BOM.DefaultCost ? Number(BOM.DefaultCost) : null,
            IsActive: BOM.IsActive,
            createdBy: BOM.Creator?.Name,
            createdAt: BOM.CreatedAt,
            items: BOM.BOMItems?.map((item) => ({
                ID: item.ID,
                ProductId: item.ProductID,
                ProductName: item.Product?.Name || item.ProductName,
                ProductCode: item.Product?.Code,
                Quantity: (0, number_1.number)(item.Quantity),
                wastePercent: (0, number_1.number)(item.WastePercent),
                Unit: item.Unit?.Name,
                UnitPrice: (0, number_1.number)(item.UnitPrice),
                subTotal: (0, number_1.number)(item.SubTotal),
            })) || [],
        };
    }
    async generateAssemblyNumber() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `ASSY-${year}${month}`;
        const lastAssembly = await this.prisma.assembly.findFirst({
            where: { AssemblyNumber: { startsWith: prefix } },
            orderBy: { AssemblyNumber: 'desc' },
            select: { AssemblyNumber: true },
        });
        let nextNumber = 1;
        if (lastAssembly) {
            const lastSeq = parseInt(lastAssembly.AssemblyNumber.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    async generateBOMCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `BOM-${year}${month}`;
        const lastBOM = await this.prisma.bOM.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastBOM) {
            const lastSeq = parseInt(lastBOM.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.AssemblyService = AssemblyService;
exports.AssemblyService = AssemblyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssemblyService);
