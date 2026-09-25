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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
let DashboardService = class DashboardService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
        this.CACHE_KEY = 'dashboard:summary';
        this.CACHE_TTL = 60;
    }
    async getDashboard() {
        const cached = await this.redis.get(this.CACHE_KEY);
        if (cached)
            return JSON.parse(cached);
        const [summary, topProducts, topCustomers, topSuppliers, lowStockItems, outOfStockItems, recentTransactions, salesByBranch] = await Promise.all([
            this.getSummary(),
            this.getTopProducts(),
            this.getTopCustomers(),
            this.getTopSuppliers(),
            this.getLowStockItems(),
            this.getOutOfStockItems(),
            this.getRecentTransactions(),
            this.getSalesByBranch(),
        ]);
        const result = {
            summary,
            topProducts,
            topCustomers,
            topSuppliers,
            lowStockItems,
            outOfStockItems,
            recentTransactions,
            salesByBranch,
        };
        await this.redis.set(this.CACHE_KEY, JSON.stringify(result), this.CACHE_TTL);
        return result;
    }
    async getSummary() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const paidStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PAID' } });
        const partialStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PARTIAL' } });
        const statusIds = [paidStatus?.ID, partialStatus?.ID].filter(Boolean);
        const sales = await this.prisma.sale.aggregate({
            where: {
                Date: { gte: startOfMonth },
                PaymentStatusID: { in: statusIds },
            },
            _sum: { Total: true },
            _count: true,
        });
        const purchases = await this.prisma.purchase.aggregate({
            where: {
                Date: { gte: startOfMonth },
                PaymentStatusID: { in: statusIds },
            },
            _sum: { Total: true },
            _count: true,
        });
        const expenses = await this.prisma.cashOut.aggregate({
            where: { Date: { gte: startOfMonth } },
            _sum: { Amount: true },
        });
        const totalSales = Number(sales._sum.Total) || 0;
        const totalPurchases = Number(purchases._sum.Total) || 0;
        const totalExpenses = Number(expenses._sum.Amount) || 0;
        const grossProfit = totalSales - totalPurchases;
        const netProfit = grossProfit - totalExpenses;
        return {
            totalSales,
            totalPurchases,
            grossProfit,
            netProfit,
            salesCount: sales._count || 0,
            purchasesCount: purchases._count || 0,
        };
    }
    async getTopProducts(limit = 5) {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const paidStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PAID' } });
        const partialStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PARTIAL' } });
        const statusIds = [paidStatus?.ID, partialStatus?.ID].filter(Boolean);
        const salesItems = await this.prisma.saleItem.groupBy({
            by: ['ProductID'],
            where: {
                Sale: {
                    Date: { gte: startOfMonth },
                    PaymentStatusID: { in: statusIds },
                },
            },
            _sum: { Quantity: true, Subtotal: true },
            orderBy: { _sum: { Subtotal: 'desc' } },
            take: limit,
        });
        const productIds = salesItems.map((item) => item.ProductID);
        const products = await this.prisma.product.findMany({
            where: { ID: { in: productIds } },
            select: { ID: true, Code: true, Name: true },
        });
        const productMap = new Map(products.map((p) => [p.ID, p]));
        return salesItems.map((item) => {
            const product = productMap.get(item.ProductID);
            return {
                productId: item.ProductID,
                productCode: product.Code,
                productName: product.Name,
                totalQuantity: Number(item._sum.Quantity) || 0,
                totalRevenue: Number(item._sum.Subtotal) || 0,
            };
        });
    }
    async getSalesByBranch() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const paidStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PAID' } });
        const partialStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PARTIAL' } });
        const statusIds = [paidStatus?.ID, partialStatus?.ID].filter(Boolean);
        const grouped = await this.prisma.sale.groupBy({
            by: ['SalePointID'],
            where: {
                Date: { gte: startOfMonth },
                PaymentStatusID: { in: statusIds },
                SalePointID: { not: null },
            },
            _sum: { Total: true },
            _count: true,
            orderBy: { _sum: { Total: 'desc' } },
        });
        const salePointIds = grouped.map((g) => g.SalePointID).filter((id) => id !== null);
        const salePoints = await this.prisma.salePoint.findMany({
            where: { ID: { in: salePointIds } },
            select: { ID: true, Name: true },
        });
        const nameMap = new Map(salePoints.map((s) => [s.ID, s.Name]));
        return grouped.map((g) => ({
            salePointId: g.SalePointID,
            salePointName: nameMap.get(g.SalePointID) || `Cabang #${g.SalePointID}`,
            totalSales: Number(g._sum.Total) || 0,
            transactionCount: g._count,
        }));
    }
    async getTopCustomers(limit = 5) {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const paidStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PAID' } });
        const partialStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PARTIAL' } });
        const statusIds = [paidStatus?.ID, partialStatus?.ID].filter(Boolean);
        const customerSales = await this.prisma.sale.groupBy({
            by: ['CustomerID'],
            where: {
                Date: { gte: startOfMonth },
                PaymentStatusID: { in: statusIds },
            },
            _sum: { Total: true },
            _count: true,
            orderBy: { _sum: { Total: 'desc' } },
            take: limit,
        });
        const customerIds = customerSales.map((item) => item.CustomerID);
        const customers = await this.prisma.customer.findMany({
            where: { ID: { in: customerIds } },
            select: { ID: true, Name: true },
        });
        const customerMap = new Map(customers.map((c) => [c.ID, c]));
        return customerSales.map((item) => {
            const customer = customerMap.get(item.CustomerID);
            return {
                customerId: item.CustomerID,
                customerName: customer.Name,
                totalTransactions: item._count || 0,
                totalAmount: Number(item._sum.Total) || 0,
            };
        });
    }
    async getTopSuppliers(limit = 5) {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const paidStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PAID' } });
        const partialStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PARTIAL' } });
        const statusIds = [paidStatus?.ID, partialStatus?.ID].filter(Boolean);
        const supplierPurchases = await this.prisma.purchase.groupBy({
            by: ['SupplierID'],
            where: {
                Date: { gte: startOfMonth },
                PaymentStatusID: { in: statusIds },
            },
            _sum: { Total: true },
            _count: true,
            orderBy: { _sum: { Total: 'desc' } },
            take: limit,
        });
        const supplierIds = supplierPurchases.map((item) => item.SupplierID);
        const suppliers = await this.prisma.supplier.findMany({
            where: { ID: { in: supplierIds } },
            select: { ID: true, Name: true },
        });
        const supplierMap = new Map(suppliers.map((s) => [s.ID, s]));
        return supplierPurchases.map((item) => {
            const supplier = supplierMap.get(item.SupplierID);
            return {
                supplierId: item.SupplierID,
                supplierName: supplier.Name,
                totalTransactions: item._count || 0,
                totalAmount: Number(item._sum.Total) || 0,
            };
        });
    }
    async getLowStockItems(limit = 10) {
        const products = await this.prisma.product.findMany({
            where: {
                IsActive: true,
                Stock: { gt: 0 },
            },
            include: {
                Warehouse: { select: { Name: true } },
            },
            orderBy: { Stock: 'asc' },
            take: limit * 2,
        });
        return products
            .filter((p) => Number(p.Stock) <= Number(p.MinimumStock) && Number(p.Stock) > 0)
            .slice(0, limit)
            .map((product) => ({
            productId: product.ID,
            productCode: product.Code,
            productName: product.Name,
            currentStock: Number(product.Stock),
            minStock: Number(product.MinimumStock),
            warehouseName: product.Warehouse?.Name,
        }));
    }
    async getOutOfStockItems(limit = 10) {
        const products = await this.prisma.product.findMany({
            where: {
                IsActive: true,
                Stock: { lte: 0 },
            },
            include: {
                Warehouse: { select: { Name: true } },
            },
            take: limit,
        });
        return products.map((product) => ({
            productId: product.ID,
            productCode: product.Code,
            productName: product.Name,
            currentStock: Number(product.Stock),
            minStock: Number(product.MinimumStock),
            warehouseName: product.Warehouse?.Name,
        }));
    }
    async getRecentTransactions(limit = 10) {
        const paidStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PAID' } });
        const partialStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PARTIAL' } });
        const statusIds = [paidStatus?.ID, partialStatus?.ID].filter(Boolean);
        const [recentSales, recentPurchases] = await Promise.all([
            this.prisma.sale.findMany({
                where: { PaymentStatusID: { in: statusIds } },
                orderBy: { Date: 'desc' },
                take: limit,
                select: {
                    ID: true,
                    Code: true,
                    Date: true,
                    Total: true,
                    CustomerID: true,
                },
            }),
            this.prisma.purchase.findMany({
                where: { PaymentStatusID: { in: statusIds } },
                orderBy: { Date: 'desc' },
                take: limit,
                select: {
                    ID: true,
                    Code: true,
                    Date: true,
                    Total: true,
                    SupplierID: true,
                },
            }),
        ]);
        const customerIds = recentSales.map((s) => s.CustomerID);
        const supplierIds = recentPurchases.map((p) => p.SupplierID);
        const [customers, suppliers] = await Promise.all([
            this.prisma.customer.findMany({ where: { ID: { in: customerIds } }, select: { ID: true, Name: true } }),
            this.prisma.supplier.findMany({ where: { ID: { in: supplierIds } }, select: { ID: true, Name: true } }),
        ]);
        const customerMap = new Map(customers.map((c) => [c.ID, c.Name]));
        const supplierMap = new Map(suppliers.map((s) => [s.ID, s.Name]));
        const transactions = [
            ...recentSales.map((s) => ({
                id: s.ID,
                code: s.Code,
                type: 'sale',
                date: s.Date.toISOString().split('T')[0],
                amount: Number(s.Total),
                counterpartyName: customerMap.get(s.CustomerID) || 'Unknown',
            })),
            ...recentPurchases.map((p) => ({
                id: p.ID,
                code: p.Code,
                type: 'purchase',
                date: p.Date.toISOString().split('T')[0],
                amount: Number(p.Total),
                counterpartyName: supplierMap.get(p.SupplierID) || 'Unknown',
            })),
        ];
        return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], DashboardService);
