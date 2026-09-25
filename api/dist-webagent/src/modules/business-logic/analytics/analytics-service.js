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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const number_1 = require("../../../common/utils/number");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardSummary(dto) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        const startDate = dto.StartDate ? new Date(dto.StartDate) : startOfDay;
        const endDate = dto.EndDate ? new Date(dto.EndDate) : endOfDay;
        const todaySales = await this.prisma.sale.aggregate({
            where: { Date: { gte: startOfDay, lte: endOfDay } },
            _count: true,
            _sum: { Total: true },
        });
        const todayTransactions = await this.prisma.sale.count({
            where: { Date: { gte: startOfDay, lte: endOfDay } },
        });
        const lowStockCount = await this.prisma.product.count({
            where: {
                IsActive: true,
                Stock: { lte: 10 },
                ...(dto.WarehouseId ? { WarehouseID: dto.WarehouseId } : {}),
            },
        });
        const outOfStockCount = await this.prisma.product.count({
            where: {
                IsActive: true,
                Stock: { lte: 0 },
                ...(dto.WarehouseId ? { WarehouseID: dto.WarehouseId } : {}),
            },
        });
        const overdueReceivables = await this.prisma.customer.aggregate({
            where: { TotalReceivable: { gt: 0 } },
            _sum: { TotalReceivable: true },
        });
        const recentSales = await this.prisma.sale.findMany({
            where: { Date: { gte: startOfDay, lte: endOfDay } },
            include: {
                Customer: true,
                SaleItems: { include: { Product: true } },
            },
            orderBy: { Date: 'desc' },
            take: 10,
        });
        const bestSellers = await this.prisma.saleItem.groupBy({
            by: ['ProductID'],
            where: {
                Sale: { Date: { gte: startOfDay, lte: endOfDay } },
            },
            _sum: { Quantity: true, Subtotal: true },
            orderBy: { _sum: { Quantity: 'desc' } },
            take: 5,
        });
        const bestSellerDetails = await Promise.all(bestSellers.map(async (item) => {
            const Product = await this.prisma.product.findUnique({
                where: { ID: item.ProductID },
                include: { Unit: true },
            });
            return {
                Product: Product
                    ? {
                        ID: Product.ID,
                        Code: Product.Code,
                        Name: Product.Name,
                        Unit: Product.Unit?.Name,
                    }
                    : null,
                QuantitySold: (0, number_1.number)(item._sum?.Quantity || 0),
                revenue: (0, number_1.number)(item._sum?.Subtotal || 0),
            };
        }));
        return {
            period: { startDate, endDate },
            Summary: {
                todaySales: (0, number_1.number)(todaySales._sum?.Total || 0),
                todayTransactions,
                lowStockCount,
                outOfStockCount,
                overdueReceivables: (0, number_1.number)(overdueReceivables._sum?.TotalReceivable || 0),
            },
            recentSales: recentSales.map((s) => ({
                ID: s.ID,
                Code: s.Code,
                Customer: s.Customer?.Name || 'Guest',
                Total: (0, number_1.number)(s.Total),
                itemCount: s.SaleItems?.length || 0,
                Date: s.Date,
            })),
            bestSellers: bestSellerDetails.filter((b) => b.Product !== null),
        };
    }
    async getSalesReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : this.getStartOfMonth();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        const whereClause = {
            Date: { gte: startDate, lte: endDate },
        };
        if (dto.WarehouseId) {
            whereClause.WarehouseID = dto.WarehouseId;
        }
        if (dto.CustomerId) {
            whereClause.CustomerID = dto.CustomerId;
        }
        if (dto.ProductId) {
            whereClause.SaleItems = { some: { ProductID: dto.ProductId } };
        }
        const Sales = await this.prisma.sale.findMany({
            where: whereClause,
            include: {
                Customer: { include: { CustomerGroup: true } },
                SaleItems: {
                    include: {
                        Product: dto.CategoryId ? { include: { Category: true } } : true,
                        Unit: true,
                    },
                },
                SalePayments: { include: { Method: true } },
                Creator: true,
            },
            orderBy: { Date: 'desc' },
        });
        let filteredSales = Sales;
        if (dto.CategoryId) {
            filteredSales = Sales.filter((s) => s.SaleItems.some((item) => item.Product.CategoryID === dto.CategoryId));
        }
        const Totals = {
            TotalTransactions: filteredSales.length,
            TotalRevenue: filteredSales.reduce((sum, s) => sum + Number(s.Total), 0),
            TotalItems: filteredSales.reduce((sum, s) => sum + s.SaleItems.reduce((iSum, i) => iSum + Number(i.Quantity), 0), 0),
            TotalDiscount: filteredSales.reduce((sum, s) => sum + Number(s.DiscountAmount), 0),
            averageTransaction: filteredSales.length > 0
                ? filteredSales.reduce((sum, s) => sum + Number(s.Total), 0) / filteredSales.length
                : 0,
        };
        return {
            period: { startDate, endDate },
            Totals,
            Sales: filteredSales.map((s) => ({
                ID: s.ID,
                Code: s.Code,
                Date: s.Date,
                Customer: {
                    ID: s.Customer?.ID,
                    Name: s.Customer?.Name,
                    Group: s.Customer?.CustomerGroup?.Name,
                },
                items: s.SaleItems.map((i) => ({
                    Product: i.Product.Name,
                    Quantity: (0, number_1.number)(i.Quantity),
                    Unit: i.Unit?.Name,
                    UnitPrice: (0, number_1.number)(i.UnitPrice),
                    subTotal: (0, number_1.number)(i.Subtotal),
                })),
                subTotal: (0, number_1.number)(s.Subtotal),
                discount: (0, number_1.number)(s.DiscountAmount),
                tax: (0, number_1.number)(s.TaxAmount),
                Total: (0, number_1.number)(s.Total),
                PaymentMethod: s.SalePayments[0]?.Method?.Name || 'N/A',
                createdBy: s.Creator?.Name || 'System',
            })),
        };
    }
    async getSalesByCategory(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : this.getStartOfMonth();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        const Sales = await this.prisma.sale.findMany({
            where: {
                Date: { gte: startDate, lte: endDate },
                ...(dto.WarehouseId ? { WarehouseID: dto.WarehouseId } : {}),
            },
            include: {
                SaleItems: {
                    include: { Product: { include: { Category: true } } },
                },
            },
        });
        const CategoryData = {};
        for (const Sale of Sales) {
            for (const item of Sale.SaleItems || []) {
                const Product = item.Product;
                const CategoryName = Product?.Category?.Name || 'Uncategorized';
                const CategoryId = Product?.CategoryID || 0;
                if (!CategoryData[CategoryName]) {
                    CategoryData[CategoryName] = {
                        CategoryId,
                        CategoryName,
                        TotalQuantity: 0,
                        TotalRevenue: 0,
                        transactionCount: 0,
                        ProductCount: new Set(),
                    };
                }
                CategoryData[CategoryName].TotalQuantity += Number(item.Quantity);
                CategoryData[CategoryName].TotalRevenue += Number(item.Subtotal);
                CategoryData[CategoryName].transactionCount += 1;
                CategoryData[CategoryName].ProductCount.add(item.ProductID);
            }
        }
        const Categories = Object.values(CategoryData).map((c) => ({
            ...c,
            ProductCount: c.ProductCount.size,
            ProductCountDisplay: undefined,
        }));
        return {
            period: { startDate, endDate },
            Categories: Categories.sort((a, b) => b.TotalRevenue - a.TotalRevenue),
        };
    }
    async getProfitReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : this.getStartOfMonth();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        const Sales = await this.prisma.sale.findMany({
            where: {
                Date: { gte: startDate, lte: endDate },
                ...(dto.WarehouseId ? { WarehouseID: dto.WarehouseId } : {}),
            },
            include: {
                SaleItems: { include: { Product: true } },
            },
        });
        let TotalRevenue = 0;
        let TotalCost = 0;
        for (const Sale of Sales) {
            TotalRevenue += Number(Sale.Total);
            for (const item of Sale.SaleItems || []) {
                const Product = item.Product;
                const CostPrice = Number(Product?.PurchasePrice || 0) * Number(item.Quantity);
                TotalCost += CostPrice || Number(item.Subtotal) * 0.7;
            }
        }
        const grossProfit = TotalRevenue - TotalCost;
        const grossMargin = TotalRevenue > 0 ? (grossProfit / TotalRevenue) * 100 : 0;
        return {
            period: { startDate, endDate },
            TotalRevenue,
            TotalCost,
            grossProfit,
            grossMargin,
        };
    }
    async getTopProducts(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : this.getStartOfMonth();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        const topProducts = await this.prisma.saleItem.groupBy({
            by: ['ProductID'],
            where: {
                Sale: {
                    Date: { gte: startDate, lte: endDate },
                    ...(dto.WarehouseId ? { WarehouseID: dto.WarehouseId } : {}),
                },
            },
            _sum: { Quantity: true, Subtotal: true },
            _count: true,
            orderBy: { _sum: { Subtotal: 'desc' } },
            take: dto.Limit || 10,
        });
        const Products = await Promise.all(topProducts.map(async (item) => {
            const Product = await this.prisma.product.findUnique({
                where: { ID: item.ProductID },
                include: { Category: true, Unit: true },
            });
            return {
                ProductId: item.ProductID,
                ProductCode: Product?.Code,
                ProductName: Product?.Name,
                Category: Product?.Category?.Name,
                Unit: Product?.Unit?.Name,
                TotalQuantity: (0, number_1.number)(item._sum?.Quantity || 0),
                TotalRevenue: (0, number_1.number)(item._sum?.Subtotal || 0),
                transactionCount: item._count,
            };
        }));
        return {
            period: { startDate, endDate },
            Products: Products.filter((p) => p.ProductName),
        };
    }
    async getTopCustomers(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : this.getStartOfMonth();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        const topCustomers = await this.prisma.sale.groupBy({
            by: ['CustomerID'],
            where: {
                Date: { gte: startDate, lte: endDate },
                ...(dto.WarehouseId ? { WarehouseID: dto.WarehouseId } : {}),
            },
            _sum: { Total: true, Subtotal: true },
            _count: true,
            orderBy: { _sum: { Total: 'desc' } },
            take: dto.Limit || 10,
        });
        const Customers = await Promise.all(topCustomers.map(async (item) => {
            const Customer = await this.prisma.customer.findUnique({
                where: { ID: item.CustomerID },
                include: { CustomerGroup: true },
            });
            return {
                CustomerId: item.CustomerID,
                CustomerCode: Customer?.Code,
                CustomerName: Customer?.Name,
                Group: Customer?.CustomerGroup?.Name,
                TotalRevenue: (0, number_1.number)(item._sum?.Total || 0),
                TotalItems: (0, number_1.number)(item._sum?.Subtotal || 0),
                transactionCount: item._count,
            };
        }));
        return {
            period: { startDate, endDate },
            Customers: Customers.filter((c) => c.CustomerName),
        };
    }
    async getInventoryReport(dto) {
        const WarehouseFilter = dto.WarehouseId ? { WarehouseID: dto.WarehouseId } : {};
        const Products = await this.prisma.product.findMany({
            where: {
                IsActive: true,
                ...WarehouseFilter,
            },
            include: { Category: true, Unit: true, Brand: true },
        });
        const inventoryData = Products.map((p) => ({
            ProductId: p.ID,
            ProductCode: p.Code,
            ProductName: p.Name,
            Category: p.Category?.Name,
            Brand: p.Brand?.Name,
            Unit: p.Unit?.Name,
            Stock: (0, number_1.number)(p.Stock),
            PurchasePrice: (0, number_1.number)(p.PurchasePrice),
            sellingPrice: (0, number_1.number)(p.SellingPrice),
            StockValue: (0, number_1.number)(p.Stock) * Number(p.PurchasePrice),
        }));
        const Totals = {
            TotalProducts: inventoryData.length,
            TotalStock: inventoryData.reduce((sum, p) => sum + p.Stock, 0),
            TotalValue: inventoryData.reduce((sum, p) => sum + p.StockValue, 0),
        };
        return {
            WarehouseId: dto.WarehouseId,
            inventory: inventoryData,
            Totals,
        };
    }
    async getCashFlowReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : this.getStartOfMonth();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        const CashIns = await this.prisma.cashIn.aggregate({
            where: { Date: { gte: startDate, lte: endDate } },
            _sum: { Amount: true },
            _count: true,
        });
        const CashOuts = await this.prisma.cashOut.aggregate({
            where: { Date: { gte: startDate, lte: endDate } },
            _sum: { Amount: true },
            _count: true,
        });
        const Transfers = await this.prisma.cashTransfer.aggregate({
            where: { Date: { gte: startDate, lte: endDate } },
            _sum: { Amount: true },
            _count: true,
        });
        return {
            period: { startDate, endDate },
            CashIn: {
                Total: (0, number_1.number)(CashIns._sum?.Amount || 0),
                Count: CashIns._count,
            },
            CashOut: {
                Total: (0, number_1.number)(CashOuts._sum?.Amount || 0),
                Count: CashOuts._count,
            },
            Transfers: {
                Total: (0, number_1.number)(Transfers._sum?.Amount || 0),
                Count: Transfers._count,
            },
            netFlow: (0, number_1.number)(CashIns._sum?.Amount || 0) - Number(CashOuts._sum?.Amount || 0),
        };
    }
    async getTaxReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : this.getStartOfMonth();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        const Sales = await this.prisma.sale.findMany({
            where: { Date: { gte: startDate, lte: endDate } },
            include: { SalePayments: { include: { Method: true } } },
        });
        let TotalSales = 0;
        let TotalTax = 0;
        for (const Sale of Sales) {
            TotalSales += Number(Sale.Subtotal);
            TotalTax += Number(Sale.TaxAmount);
        }
        return {
            period: { startDate, endDate },
            TotalSales,
            TotalTax,
            effectiveTaxRate: TotalSales > 0 ? (TotalTax / TotalSales) * 100 : 0,
        };
    }
    async getSalesTrend(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : this.getStartOfMonth();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        const Sales = await this.prisma.sale.findMany({
            where: { Date: { gte: startDate, lte: endDate } },
            select: {
                Date: true,
                Total: true,
                Subtotal: true,
                TaxAmount: true,
                DiscountAmount: true,
            },
        });
        const Grouped = this.GroupSalesByPeriod(Sales, 'day');
        return {
            period: { startDate, endDate },
            granularity: 'day',
            trend: Grouped,
        };
    }
    getStartOfMonth() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    GroupSalesByPeriod(Sales, period) {
        const Grouped = {};
        for (const Sale of Sales) {
            let key;
            const d = new Date(Sale.Date);
            if (period === 'day') {
                key = d.toISOString().split('T')[0];
            }
            else if (period === 'week') {
                const weekNum = Math.ceil((d.getDate()) / 7);
                key = `${d.getFullYear()}-W${weekNum}`;
            }
            else {
                key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            }
            if (!Grouped[key]) {
                Grouped[key] = {
                    period: key,
                    TotalRevenue: 0,
                    TotalTransactions: 0,
                    TotalTax: 0,
                    TotalDiscount: 0,
                };
            }
            Grouped[key].TotalRevenue += Number(Sale.Total);
            Grouped[key].TotalTransactions += 1;
            Grouped[key].TotalTax += Number(Sale.TaxAmount);
            Grouped[key].TotalDiscount += Number(Sale.DiscountAmount);
        }
        return Object.values(Grouped);
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
