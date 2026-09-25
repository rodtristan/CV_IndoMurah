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
exports.ProductionService = void 0;
const common_1 = require("@nestjs/common");
const date_range_1 = require("../shared/date-range");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let ProductionService = class ProductionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProduction(dto, UserId) {
        let rawMaterialCost = 0;
        const itemsWithCost = [];
        for (const item of dto.Items) {
            const Product = await this.prisma.product.findUnique({
                where: { ID: item.ProductId },
            });
            if (!Product) {
                throw new common_1.NotFoundException(`Product ${item.ProductId} not found`);
            }
            const availableStock = Number(Product.Stock);
            if (availableStock < item.Quantity) {
                throw new common_1.BadRequestException(`Insufficient Stock for ${Product.Name}. Available: ${availableStock}, Needed: ${item.Quantity}`);
            }
            const UnitPrice = item.UnitPrice ?? Number(Product.PurchasePrice);
            const subTotal = UnitPrice * item.Quantity;
            rawMaterialCost += subTotal;
            itemsWithCost.push({
                ProductId: item.ProductId,
                ProductName: Product.Name,
                Quantity: item.Quantity,
                UnitId: item.UnitId || Product.UnitID,
                UnitPrice,
                subTotal,
            });
        }
        const laborCost = dto.LaborCost || 0;
        const overheadCost = dto.OverheadCost || 0;
        const TotalCost = rawMaterialCost + laborCost + overheadCost;
        const Code = await this.generateProductionCode();
        const completedStatus = await this.prisma.productionStatus.findFirst({
            where: { Code: 'COMPLETED' },
        });
        const Production = await this.prisma.$transaction(async (tx) => {
            const newProduction = await tx.production.create({
                data: {
                    Code: Code,
                    Date: dto.Date ? new Date(dto.Date) : new Date(),
                    ProductID: dto.ProductId || null,
                    ProductName: dto.ProductName || 'Produk Olahan',
                    Quantity: new client_1.Prisma.Decimal(dto.Quantity),
                    WarehouseID: dto.WarehouseId || null,
                    RawMaterialCost: new client_1.Prisma.Decimal(rawMaterialCost),
                    LaborCost: new client_1.Prisma.Decimal(laborCost),
                    OverheadCost: new client_1.Prisma.Decimal(overheadCost),
                    TotalCost: new client_1.Prisma.Decimal(TotalCost),
                    StatusID: completedStatus?.ID || 2,
                    Notes: dto.Notes,
                },
            });
            await tx.productionItem.createMany({
                data: itemsWithCost.map((item) => ({
                    ProductionID: newProduction.ID,
                    ProductID: item.ProductId,
                    ProductName: item.ProductName,
                    Quantity: new client_1.Prisma.Decimal(item.Quantity),
                    UnitID: item.UnitId,
                    UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice),
                    SubTotal: new client_1.Prisma.Decimal(item.subTotal),
                })),
            });
            for (const item of itemsWithCost) {
                await tx.product.update({
                    where: { ID: item.ProductId },
                    data: { Stock: { decrement: new client_1.Prisma.Decimal(item.Quantity) } },
                });
                if (dto.WarehouseId) {
                    await tx.productStock.update({
                        where: {
                            ProductID_WarehouseID: {
                                ProductID: item.ProductId,
                                WarehouseID: dto.WarehouseId,
                            },
                        },
                        data: { Quantity: { decrement: new client_1.Prisma.Decimal(item.Quantity) } },
                    });
                }
            }
            return newProduction;
        });
        return {
            success: true,
            Production: {
                ID: Production.ID,
                Code: Production.Code,
                Date: Production.Date,
                ProductName: Production.ProductName,
                Quantity: (0, number_1.number)(Production.Quantity),
                WarehouseId: Production.WarehouseID,
                rawMaterialCost,
                laborCost,
                overheadCost,
                TotalCost,
                UnitCost: TotalCost / dto.Quantity,
                Status: completedStatus?.Name || 'Completed',
                items: itemsWithCost,
            },
        };
    }
    async getProduction(ProductionId) {
        const Production = await this.prisma.production.findUnique({
            where: { ID: ProductionId },
            include: {
                Warehouse: true,
                Product: true,
                Status: true,
                Items: {
                    include: { Product: true, Unit: true },
                },
            },
        });
        if (!Production) {
            throw new common_1.NotFoundException('Production not found');
        }
        return {
            ID: Production.ID,
            Code: Production.Code,
            Date: Production.Date,
            ProductId: Production.ProductID,
            ProductName: Production.ProductName,
            Quantity: (0, number_1.number)(Production.Quantity),
            Warehouse: Production.Warehouse,
            rawMaterialCost: (0, number_1.number)(Production.RawMaterialCost),
            laborCost: (0, number_1.number)(Production.LaborCost),
            overheadCost: (0, number_1.number)(Production.OverheadCost),
            TotalCost: (0, number_1.number)(Production.TotalCost),
            UnitCost: (0, number_1.number)(Production.TotalCost) / Number(Production.Quantity),
            Status: Production.Status,
            Notes: Production.Notes,
            items: Production.Items.map((item) => ({
                ID: item.ID,
                ProductId: item.ProductID,
                ProductName: item.Product?.Name || item.ProductName,
                ProductCode: item.Product?.Code,
                Quantity: (0, number_1.number)(item.Quantity),
                Unit: item.Unit?.Name,
                UnitPrice: (0, number_1.number)(item.UnitPrice),
                subTotal: (0, number_1.number)(item.Subtotal),
            })),
        };
    }
    async listProductions(dto) {
        const where = {};
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        if (dto.StatusId) {
            where.StatusID = dto.StatusId;
        }
        if (dto.PendingOnly) {
            where.Status = { IsTerminal: false };
        }
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.Date.lte = new Date(dto.EndDate);
            }
        }
        const Productions = await this.prisma.production.findMany({
            where,
            include: {
                Warehouse: true,
                Product: true,
                Status: true,
                Items: true,
            },
            orderBy: { Date: 'desc' },
        });
        return Productions.map((p) => ({
            ID: p.ID,
            Code: p.Code,
            Date: p.Date,
            ProductName: p.ProductName,
            ProductCode: p.Product?.Code,
            Warehouse: p.Warehouse?.Name,
            Quantity: (0, number_1.number)(p.Quantity),
            TotalCost: (0, number_1.number)(p.TotalCost),
            UnitCost: (0, number_1.number)(p.TotalCost) / Number(p.Quantity),
            Status: p.Status.Name,
            StatusColor: p.Status.Color,
            itemCount: p.Items.length,
        }));
    }
    async getProductionCostReport(startDate, endDate, WarehouseId) {
        const { start, end } = (0, date_range_1.resolveDateRange)(startDate, endDate);
        const where = {
            Date: {
                gte: start,
                lte: end,
            },
        };
        if (WarehouseId) {
            where.WarehouseID = Number(WarehouseId);
        }
        const Productions = await this.prisma.production.findMany({
            where,
            include: {
                Warehouse: true,
                Status: true,
            },
            orderBy: { Date: 'desc' },
        });
        const Summary = {
            TotalProductions: Productions.length,
            TotalQuantity: Productions.reduce((sum, p) => sum + Number(p.Quantity), 0),
            TotalRawMaterialCost: Productions.reduce((sum, p) => sum + Number(p.RawMaterialCost), 0),
            TotalLaborCost: Productions.reduce((sum, p) => sum + Number(p.LaborCost), 0),
            TotalOverheadCost: Productions.reduce((sum, p) => sum + Number(p.OverheadCost), 0),
            TotalCost: Productions.reduce((sum, p) => sum + Number(p.TotalCost), 0),
            averageCostPerUnit: Productions.reduce((sum, p) => sum + Number(p.TotalCost), 0) /
                Math.max(1, Productions.reduce((sum, p) => sum + Number(p.Quantity), 0)),
        };
        return {
            period: { startDate, endDate },
            Summary,
            Productions: Productions.map((p) => ({
                ID: p.ID,
                Code: p.Code,
                Date: p.Date,
                ProductName: p.ProductName,
                Warehouse: p.Warehouse?.Name,
                Quantity: (0, number_1.number)(p.Quantity),
                rawMaterialCost: (0, number_1.number)(p.RawMaterialCost),
                laborCost: (0, number_1.number)(p.LaborCost),
                overheadCost: (0, number_1.number)(p.OverheadCost),
                TotalCost: (0, number_1.number)(p.TotalCost),
                Status: p.Status.Name,
            })),
        };
    }
    async getBOM(ProductId) {
        const Productions = await this.prisma.production.findMany({
            where: {
                ProductID: ProductId,
                Status: { IsTerminal: true },
            },
            include: {
                Items: { include: { Product: true, Unit: true } },
            },
            orderBy: { Date: 'desc' },
        });
        if (Productions.length === 0) {
            return {
                ProductId,
                hasBOM: false,
                message: 'No BOM found. Create a Production to establish BOM.',
                items: [],
            };
        }
        const latestProduction = Productions[0];
        const TotalQuantity = Productions.reduce((sum, p) => sum + Number(p.Quantity), 0);
        const BOMItems = latestProduction.Items.map((item) => ({
            ProductId: item.ProductID,
            ProductName: item.Product?.Name || item.ProductName,
            ProductCode: item.Product?.Code,
            QuantityPerUnit: (0, number_1.number)(item.Quantity) / Number(latestProduction.Quantity),
            TotalQuantity: (0, number_1.number)(item.Quantity),
            Unit: item.Unit?.Name,
            UnitPrice: (0, number_1.number)(item.UnitPrice),
            CostPerUnit: (Number(item.Quantity) * Number(item.UnitPrice)) / Number(latestProduction.Quantity),
        }));
        const TotalMaterialCost = BOMItems.reduce((sum, item) => sum + item.CostPerUnit, 0);
        return {
            ProductId,
            ProductName: latestProduction.ProductName,
            hasBOM: true,
            basedOnProduction: latestProduction.Code,
            QuantityProduced: (0, number_1.number)(latestProduction.Quantity),
            items: BOMItems,
            TotalMaterialCostPerUnit: TotalMaterialCost,
        };
    }
    async calculateProductionCost(ProductId, Quantity, WarehouseId) {
        const BOM = await this.getBOM(ProductId);
        if (!BOM.hasBOM) {
            throw new common_1.BadRequestException('No BOM found for this Product');
        }
        const rawMaterialCost = (BOM.TotalMaterialCostPerUnit || 0) * Quantity;
        const itemsNeeded = BOM.items.map((item) => ({
            ProductId: item.ProductId,
            ProductName: item.ProductName,
            QuantityNeeded: item.QuantityPerUnit * Quantity,
            UnitPrice: item.UnitPrice,
            subTotal: item.CostPerUnit * Quantity,
        }));
        const StockChecks = [];
        let allAvailable = true;
        for (const item of itemsNeeded) {
            const Product = await this.prisma.product.findUnique({
                where: { ID: item.ProductId },
            });
            const available = Number(Product?.Stock || 0);
            const sufficient = available >= item.QuantityNeeded;
            StockChecks.push({
                ProductId: item.ProductId,
                ProductName: item.ProductName,
                available,
                needed: item.QuantityNeeded,
                sufficient,
            });
            if (!sufficient) {
                allAvailable = false;
            }
        }
        return {
            ProductId,
            ProductName: BOM.ProductName,
            Quantity,
            rawMaterialCost,
            laborCost: 0,
            overheadCost: 0,
            TotalEstimatedCost: rawMaterialCost,
            UnitCost: rawMaterialCost / Quantity,
            itemsNeeded,
            StockChecks,
            canProduce: allAvailable,
        };
    }
    async generateProductionCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `PROD-${year}${month}`;
        const lastProduction = await this.prisma.production.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastProduction) {
            const lastSeq = parseInt(lastProduction.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.ProductionService = ProductionService;
exports.ProductionService = ProductionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductionService);
