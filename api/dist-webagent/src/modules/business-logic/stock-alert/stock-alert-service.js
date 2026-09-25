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
exports.StockAlertService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let StockAlertService = class StockAlertService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStockAlerts(dto) {
        const where = {};
        if (dto.UnreadOnly) {
            where.IsRead = false;
        }
        if (dto.UnresolvedOnly) {
            where.IsResolved = false;
        }
        if (dto.AlertTypeId) {
            where.AlertTypeID = dto.AlertTypeId;
        }
        const Alerts = await this.prisma.stockAlert.findMany({
            where,
            include: {
                Product: {
                    include: {
                        Category: true,
                        Brand: true,
                        Unit: true,
                    },
                },
                AlertType: true,
            },
            orderBy: { CreatedAt: 'desc' },
        });
        let filteredAlerts = Alerts;
        if (dto.WarehouseId || dto.CategoryId) {
            filteredAlerts = Alerts.filter((Alert) => {
                if (dto.WarehouseId && Alert.Product.WarehouseID !== dto.WarehouseId) {
                    return false;
                }
                if (dto.CategoryId && Alert.Product.CategoryID !== dto.CategoryId) {
                    return false;
                }
                return true;
            });
        }
        const Summary = {
            Total: filteredAlerts.length,
            unread: filteredAlerts.filter((a) => !a.IsRead).length,
            resolved: filteredAlerts.filter((a) => a.IsResolved).length,
            byType: {},
        };
        for (const Alert of filteredAlerts) {
            const TypeName = Alert.AlertType.Name;
            Summary.byType[TypeName] = (Summary.byType[TypeName] || 0) + 1;
        }
        return {
            Summary,
            Alerts: filteredAlerts.map((a) => ({
                ID: a.ID,
                Product: {
                    ID: a.Product.ID,
                    Code: a.Product.Code,
                    Name: a.Product.Name,
                    Category: a.Product.Category?.Name,
                    Brand: a.Product.Brand?.Name,
                    Unit: a.Product.Unit?.Name,
                    CurrentStock: (0, number_1.number)(a.CurrentStock),
                },
                AlertType: {
                    ID: a.AlertType.ID,
                    Code: a.AlertType.Code,
                    Name: a.AlertType.Name,
                    Color: a.AlertType.Color,
                },
                Threshold: (0, number_1.number)(a.Threshold),
                IsRead: a.IsRead,
                IsResolved: a.IsResolved,
                ResolvedAt: a.ResolvedAt,
                Notes: a.Notes,
                CreatedAt: a.CreatedAt,
            })),
        };
    }
    async getStockAlertSummary(WarehouseId) {
        const lowStockProducts = await this.prisma.product.findMany({
            where: {
                IsActive: true,
                Stock: { lte: 10 },
                ...(WarehouseId ? { WarehouseID: WarehouseId } : {}),
            },
            include: {
                Category: true,
                Brand: true,
                Unit: true,
            },
            take: 20,
            orderBy: { Stock: 'asc' },
        });
        const outOfStockProducts = await this.prisma.product.findMany({
            where: {
                IsActive: true,
                Stock: { lte: 0 },
                ...(WarehouseId ? { WarehouseID: WarehouseId } : {}),
            },
            include: {
                Category: true,
                Brand: true,
                Unit: true,
            },
            take: 10,
            orderBy: { UpdatedAt: 'desc' },
        });
        const unreadCount = await this.prisma.stockAlert.count({
            where: { IsRead: false, IsResolved: false },
        });
        return {
            lowStock: {
                Count: lowStockProducts.length,
                items: lowStockProducts.map((p) => ({
                    ID: p.ID,
                    Code: p.Code,
                    Name: p.Name,
                    Category: p.Category?.Name,
                    CurrentStock: (0, number_1.number)(p.Stock),
                    MinimumStock: (0, number_1.number)(p.MinimumStock),
                    Unit: p.Unit?.Name,
                })),
            },
            outOfStock: {
                Count: outOfStockProducts.length,
                items: outOfStockProducts.map((p) => ({
                    ID: p.ID,
                    Code: p.Code,
                    Name: p.Name,
                    Category: p.Category?.Name,
                    CurrentStock: (0, number_1.number)(p.Stock),
                    Unit: p.Unit?.Name,
                })),
            },
            unreadAlerts: unreadCount,
        };
    }
    async markAsRead(AlertId) {
        const Alert = await this.prisma.stockAlert.findUnique({
            where: { ID: AlertId },
        });
        if (!Alert) {
            throw new common_1.NotFoundException('Alert not found');
        }
        await this.prisma.stockAlert.update({
            where: { ID: AlertId },
            data: { IsRead: true },
        });
        return { success: true, AlertId, IsRead: true };
    }
    async markMultipleAsRead(AlertIds) {
        await this.prisma.stockAlert.updateMany({
            where: { ID: { in: AlertIds } },
            data: { IsRead: true },
        });
        return { success: true, Count: AlertIds.length };
    }
    async resolveAlert(AlertId, dto) {
        const Alert = await this.prisma.stockAlert.findUnique({
            where: { ID: AlertId },
            include: { Product: true },
        });
        if (!Alert) {
            throw new common_1.NotFoundException('Alert not found');
        }
        await this.prisma.stockAlert.update({
            where: { ID: AlertId },
            data: {
                IsResolved: true,
                ResolvedAt: new Date(),
                Notes: dto.Notes,
            },
        });
        return {
            success: true,
            AlertId,
            ProductName: Alert.Product.Name,
            ResolvedAt: new Date(),
        };
    }
    async bulkResolveAlerts(dto) {
        const Alerts = await this.prisma.stockAlert.findMany({
            where: { ID: { in: dto.AlertIds }, IsResolved: false },
        });
        if (Alerts.length !== dto.AlertIds.length) {
            throw new common_1.BadRequestException('Some Alerts not found or already resolved');
        }
        await this.prisma.stockAlert.updateMany({
            where: { ID: { in: dto.AlertIds } },
            data: {
                IsResolved: true,
                ResolvedAt: new Date(),
                Notes: dto.Notes,
            },
        });
        return {
            success: true,
            resolvedCount: Alerts.length,
            ResolvedAt: new Date(),
        };
    }
    async getStockLevelReport(dto) {
        const where = { IsActive: true };
        if (dto.CategoryId) {
            where.CategoryID = dto.CategoryId;
        }
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        const Products = await this.prisma.product.findMany({
            where,
            include: {
                Category: true,
                Brand: true,
                Unit: true,
                ProductStocks: dto.WarehouseId
                    ? { where: { WarehouseID: dto.WarehouseId } }
                    : undefined,
            },
            orderBy: [{ Category: { Name: 'asc' } }, { Name: 'asc' }],
        });
        const items = Products.map((p) => {
            const Stock = dto.WarehouseId
                ? Number(p.ProductStocks?.[0]?.Quantity || p.Stock)
                : (0, number_1.number)(p.Stock);
            const minimumStock = dto.WarehouseId
                ? Number(p.ProductStocks?.[0]?.MinimumStock || p.MinimumStock)
                : (0, number_1.number)(p.MinimumStock);
            let Status = 'OK';
            if (Stock <= 0)
                Status = 'OUT';
            else if (Stock <= minimumStock)
                Status = 'LOW';
            return {
                ID: p.ID,
                Code: p.Code,
                Name: p.Name,
                Category: p.Category?.Name,
                Brand: p.Brand?.Name,
                Unit: p.Unit?.Name,
                CurrentStock: Stock,
                MinimumStock: minimumStock,
                SellingPrice: (0, number_1.number)(p.SellingPrice),
                StockValue: Stock * Number(p.SellingPrice),
                Status: Status,
                StockPercentage: minimumStock > 0 ? Math.round((Stock / minimumStock) * 100) : 100,
            };
        });
        let filteredItems = items;
        if (dto.LowStockOnly) {
            filteredItems = items.filter((i) => i.Status === 'LOW');
        }
        if (dto.OutOfStockOnly) {
            filteredItems = items.filter((i) => i.Status === 'OUT');
        }
        const Summary = {
            TotalProducts: items.length,
            OkStock: items.filter((i) => i.Status === 'OK').length,
            LowStock: items.filter((i) => i.Status === 'LOW').length,
            OutOfStock: items.filter((i) => i.Status === 'OUT').length,
            TotalStockValue: items.reduce((sum, i) => sum + i.StockValue, 0),
        };
        return { Summary, items: filteredItems };
    }
    async createReOrderSuggestion(ProductId) {
        const Product = await this.prisma.product.findUnique({
            where: { ID: ProductId },
            include: {
                Category: true,
                Unit: true,
            },
        });
        if (!Product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const currentStock = Number(Product.Stock);
        const minimumStock = Number(Product.MinimumStock);
        const PurchasePrice = Number(Product.PurchasePrice);
        const TargetStock = minimumStock * 2;
        const suggestedQuantity = Math.max(0, TargetStock - currentStock);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const SalesData = await this.prisma.saleItem.aggregate({
            where: {
                ProductID: ProductId,
                Sale: { Date: { gte: thirtyDaysAgo } },
            },
            _sum: { Quantity: true },
            _count: true,
        });
        const avgMonthlySales = SalesData._sum.Quantity
            ? Number(SalesData._sum.Quantity) / 1
            : 0;
        const daysUntilStockout = avgMonthlySales > 0
            ? Math.round(currentStock / (avgMonthlySales / 30))
            : 999;
        return {
            Product: {
                ID: Product.ID,
                Code: Product.Code,
                Name: Product.Name,
                Category: Product.Category?.Name,
                Unit: Product.Unit?.Name,
                PurchasePrice: PurchasePrice,
            },
            CurrentStock: currentStock,
            MinimumStock: minimumStock,
            SuggestedQuantity: suggestedQuantity,
            TargetStock: TargetStock,
            EstimatedCost: suggestedQuantity * PurchasePrice,
            AvgMonthlySales: (0, number_1.number)(avgMonthlySales),
            DaysUntilStockout: daysUntilStockout === 999 ? 'Unknown' : daysUntilStockout,
            UrgencyLevel: daysUntilStockout <= 7 ? 'CRITICAL' : daysUntilStockout <= 14 ? 'HIGH' : 'NORMAL',
        };
    }
    async generateReOrderPurchaseOrder(dto) {
        const [Product, Supplier] = await Promise.all([
            this.prisma.product.findUnique({ where: { ID: dto.ProductId } }),
            this.prisma.supplier.findUnique({ where: { ID: dto.SupplierId } }),
        ]);
        if (!Product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (!Supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
        const UnitPrice = Number(Product.PurchasePrice);
        const subTotal = dto.ReorderQuantity * UnitPrice;
        const Code = await this.generatePurchaseOrderCode();
        const PurchaseOrder = await this.prisma.$transaction(async (tx) => {
            const newOrder = await tx.purchaseOrder.create({
                data: {
                    Code: Code,
                    Date: new Date(),
                    SupplierID: dto.SupplierId,
                    Subtotal: new client_1.Prisma.Decimal(subTotal),
                    DiscountAmount: new client_1.Prisma.Decimal(0),
                    DiscountPercent: new client_1.Prisma.Decimal(0),
                    TaxAmount: new client_1.Prisma.Decimal(0),
                    TaxPercent: new client_1.Prisma.Decimal(0),
                    Total: new client_1.Prisma.Decimal(subTotal),
                    DownPayment: new client_1.Prisma.Decimal(0),
                    PaymentStatusID: 1,
                    StatusID: 1,
                    Notes: dto.Notes,
                    CreatedByID: 'system',
                    PurchaseOrderItems: {
                        create: {
                            ProductID: dto.ProductId,
                            Quantity: new client_1.Prisma.Decimal(dto.ReorderQuantity),
                            UnitID: Product.UnitID,
                            UnitPrice: new client_1.Prisma.Decimal(UnitPrice),
                            Subtotal: new client_1.Prisma.Decimal(subTotal),
                        },
                    },
                },
                include: {
                    Supplier: true,
                    PurchaseOrderItems: { include: { Product: true, Unit: true } },
                },
            });
            await tx.activityLog.create({
                data: {
                    Type: 'AUTO_REORDER',
                    Title: 'Auto ReOrder Created',
                    Description: `ReOrder for ${Product.Name} (Qty: ${dto.ReorderQuantity}) from ${Supplier.Name}`,
                    ReferenceType: 'PURCHASE_ORDER',
                    ReferenceID: newOrder.ID,
                    Amount: new client_1.Prisma.Decimal(subTotal),
                    CreatedByID: 'system',
                },
            });
            return newOrder;
        });
        return {
            success: true,
            PurchaseOrder: {
                ID: PurchaseOrder.ID,
                Code: PurchaseOrder.Code,
                Supplier: {
                    ID: Supplier.ID,
                    Name: Supplier.Name,
                },
                Items: PurchaseOrder.PurchaseOrderItems.map((item) => ({
                    ProductName: item.Product.Name,
                    Quantity: (0, number_1.number)(item.Quantity),
                    UnitPrice: (0, number_1.number)(item.UnitPrice),
                    Subtotal: (0, number_1.number)(item.Subtotal),
                })),
                Total: (0, number_1.number)(PurchaseOrder.Total),
            },
        };
    }
    async getProductsNeedingReOrder(WarehouseId) {
        const where = {
            IsActive: true,
            Stock: { lte: 10 },
        };
        if (WarehouseId) {
            where.WarehouseID = WarehouseId;
        }
        const Products = await this.prisma.product.findMany({
            where,
            include: {
                Category: true,
                Brand: true,
                Unit: true,
            },
            orderBy: { Stock: 'asc' },
        });
        const suggestions = await Promise.all(Products.map(async (p) => {
            const suggestion = await this.createReOrderSuggestion(p.ID);
            return suggestion;
        }));
        return {
            Count: suggestions.length,
            items: suggestions.filter((s) => s.SuggestedQuantity > 0),
        };
    }
    async CheckAndCreateAlerts(WarehouseId) {
        const where = { IsActive: true };
        if (WarehouseId) {
            where.WarehouseID = WarehouseId;
        }
        const Products = await this.prisma.product.findMany({
            where,
            include: {
                ProductStocks: WarehouseId ? { where: { WarehouseID: WarehouseId } } : undefined,
                StockAlerts: { where: { IsResolved: false } },
            },
        });
        let lowStockType = await this.prisma.alertType.findFirst({ where: { Code: 'LOW_STOCK' } });
        if (!lowStockType) {
            lowStockType = await this.prisma.alertType.create({
                data: {
                    Code: 'LOW_STOCK',
                    Name: 'Low Stock',
                    Color: '#FFA500',
                    IsActive: true,
                },
            });
        }
        let outOfStockType = await this.prisma.alertType.findFirst({ where: { Code: 'OUT_OF_STOCK' } });
        if (!outOfStockType) {
            outOfStockType = await this.prisma.alertType.create({
                data: {
                    Code: 'OUT_OF_STOCK',
                    Name: 'Out of Stock',
                    Color: '#FF0000',
                    IsActive: true,
                },
            });
        }
        const createdAlerts = [];
        for (const Product of Products) {
            const currentStock = WarehouseId
                ? Number(Product.ProductStocks?.[0]?.Quantity || Product.Stock)
                : (0, number_1.number)(Product.Stock);
            const minimumStock = WarehouseId
                ? Number(Product.ProductStocks?.[0]?.MinimumStock || Product.MinimumStock)
                : (0, number_1.number)(Product.MinimumStock);
            if (Product.StockAlerts.length > 0)
                continue;
            let AlertTypeId;
            if (currentStock <= 0) {
                AlertTypeId = outOfStockType.ID;
            }
            else if (currentStock <= minimumStock) {
                AlertTypeId = lowStockType.ID;
            }
            else {
                continue;
            }
            const Alert = await this.prisma.stockAlert.create({
                data: {
                    ProductID: Product.ID,
                    AlertTypeID: AlertTypeId,
                    Threshold: minimumStock,
                    CurrentStock: new client_1.Prisma.Decimal(currentStock),
                    IsRead: false,
                    IsResolved: false,
                },
            });
            createdAlerts.push(Alert);
        }
        return {
            Checked: Products.length,
            AlertsCreated: createdAlerts.length,
            AlertIds: createdAlerts.map((a) => a.ID),
        };
    }
    async generatePurchaseOrderCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `PO-${year}${month}`;
        const lastOrder = await this.prisma.purchaseOrder.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastOrder) {
            const lastSeq = parseInt(lastOrder.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.StockAlertService = StockAlertService;
exports.StockAlertService = StockAlertService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockAlertService);
