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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const number_1 = require("../../../common/utils/number");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardSummary(dto) {
        const reportDate = dto.Date ? new Date(dto.Date) : new Date();
        const startOfDay = new Date(reportDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(reportDate);
        endOfDay.setHours(23, 59, 59, 999);
        const whereClause = {
            Date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        };
        if (dto.WarehouseId) {
            whereClause.WarehouseID = dto.WarehouseId;
        }
        const SalesData = await this.prisma.sale.findMany({
            where: whereClause,
            include: {
                SaleItems: { include: { Product: true } },
            },
        });
        const lowStockCount = await this.prisma.product.count({
            where: {
                Stock: { lte: 10 },
                IsActive: true,
            },
        });
        const outOfStockCount = await this.prisma.product.count({
            where: {
                Stock: { lte: 0 },
                IsActive: true,
            },
        });
        const overdueReceivables = await this.prisma.customer.findMany({
            where: {
                TotalReceivable: { gt: 0 },
            },
            select: {
                TotalReceivable: true,
            },
        });
        const recentSales = await this.prisma.sale.findMany({
            where: whereClause,
            include: {
                Customer: true,
            },
            orderBy: { CreatedAt: 'desc' },
            take: 10,
        });
        const ProductSales = {};
        for (const Sale of SalesData) {
            for (const item of Sale.SaleItems) {
                if (!ProductSales[item.ProductID]) {
                    ProductSales[item.ProductID] = {
                        ProductId: item.ProductID,
                        ProductName: item.Product?.Name || 'Unknown',
                        ProductCode: item.Product?.Code || '',
                        Quantity: 0,
                        revenue: 0,
                    };
                }
                ProductSales[item.ProductID].Quantity += Number(item.Quantity);
                ProductSales[item.ProductID].revenue += Number(item.Subtotal);
            }
        }
        const bestSellers = Object.values(ProductSales)
            .sort((a, b) => b.Quantity - a.Quantity)
            .slice(0, 5);
        const TotalSales = SalesData.reduce((sum, s) => sum + Number(s.Total), 0);
        const TotalProfit = SalesData.reduce((sum, s) => {
            const Cost = s.SaleItems.reduce((sCost, item) => sCost + Number(item.Quantity) * Number(item.Product?.PurchasePrice || 0), 0);
            return sum + (Number(s.Total) - Cost);
        }, 0);
        return {
            Date: reportDate.toISOString().split('T')[0],
            Summary: {
                todaySales: TotalSales,
                todayTransactions: SalesData.length,
                todayProfit: TotalProfit,
                lowStockCount,
                outOfStockCount,
                overdueReceivables: overdueReceivables.reduce((sum, c) => sum + Number(c.TotalReceivable), 0),
            },
            recentSales: recentSales.map((s) => ({
                ID: s.ID,
                Code: s.Code,
                Customer: s.Customer?.Name,
                Total: (0, number_1.number)(s.Total),
                Date: s.CreatedAt,
            })),
            bestSellers,
        };
    }
    async getSalesReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : new Date();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        endDate.setHours(23, 59, 59, 999);
        const where = {
            Date: { gte: startDate, lte: endDate },
            IsReturn: false,
        };
        if (dto.WarehouseId)
            where.WarehouseID = dto.WarehouseId;
        if (dto.SalesPersonId)
            where.SalesPersonID = dto.SalesPersonId;
        if (dto.CustomerId)
            where.CustomerID = dto.CustomerId;
        const Sales = await this.prisma.sale.findMany({
            where,
            include: {
                Customer: true,
                SalesPerson: true,
                SaleItems: { include: { Product: { include: { Category: true } } } },
                Warehouse: true,
            },
        });
        const byCategory = {};
        const byProduct = {};
        const byCustomer = {};
        let TotalRevenue = 0;
        let TotalCost = 0;
        let TotalProfit = 0;
        for (const Sale of Sales) {
            TotalRevenue += Number(Sale.Total);
            for (const item of Sale.SaleItems) {
                const Cost = Number(item.Quantity) * Number(item.Product?.PurchasePrice || 0);
                const profit = Number(item.Subtotal) - Cost;
                TotalCost += Cost;
                TotalProfit += profit;
                const CategoryName = item.Product?.Category?.Name || 'Uncategorized';
                if (!byCategory[CategoryName]) {
                    byCategory[CategoryName] = { Category: CategoryName, Quantity: 0, revenue: 0, Cost: 0, profit: 0 };
                }
                byCategory[CategoryName].Quantity += Number(item.Quantity);
                byCategory[CategoryName].revenue += Number(item.Subtotal);
                byCategory[CategoryName].Cost += Cost;
                byCategory[CategoryName].profit += profit;
                if (!byProduct[item.ProductID]) {
                    byProduct[item.ProductID] = {
                        ProductId: item.ProductID,
                        ProductName: item.Product?.Name || 'Unknown',
                        ProductCode: item.Product?.Code || '',
                        Quantity: 0,
                        revenue: 0,
                        Cost: 0,
                        profit: 0,
                    };
                }
                byProduct[item.ProductID].Quantity += Number(item.Quantity);
                byProduct[item.ProductID].revenue += Number(item.Subtotal);
                byProduct[item.ProductID].Cost += Cost;
                byProduct[item.ProductID].profit += profit;
                if (!byCustomer[Sale.CustomerID]) {
                    byCustomer[Sale.CustomerID] = {
                        CustomerId: Sale.CustomerID,
                        CustomerName: Sale.Customer?.Name || 'Unknown',
                        transactionCount: 0,
                        revenue: 0,
                    };
                }
                byCustomer[Sale.CustomerID].transactionCount++;
                byCustomer[Sale.CustomerID].revenue += Number(Sale.Total);
            }
        }
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            Summary: {
                TotalTransactions: Sales.length,
                TotalRevenue,
                TotalCost,
                TotalProfit,
                profitMargin: TotalRevenue > 0 ? (TotalProfit / TotalRevenue) * 100 : 0,
            },
            byCategory: Object.values(byCategory),
            byProduct: Object.values(byProduct).sort((a, b) => b.revenue - a.revenue).slice(0, 20),
            byCustomer: Object.values(byCustomer).sort((a, b) => b.revenue - a.revenue).slice(0, 20),
        };
    }
    async getInventoryReport(dto) {
        const where = { IsActive: true };
        if (dto.CategoryId)
            where.CategoryID = dto.CategoryId;
        if (dto.BrandId)
            where.BrandID = dto.BrandId;
        if (dto.lowStockOnly) {
            where.Stock = { gt: 0, lte: 10 };
        }
        if (dto.OutOfStockOnly) {
            where.Stock = { lte: 0 };
        }
        const Products = await this.prisma.product.findMany({
            where,
            include: {
                Category: true,
                Brand: true,
                Unit: true,
            },
            orderBy: { Name: 'asc' },
        });
        const items = Products.map((p) => ({
            ID: p.ID,
            Code: p.Code,
            Name: p.Name,
            Barcode: p.Barcode,
            Category: p.Category?.Name,
            Brand: p.Brand?.Name,
            Unit: p.Unit?.Name,
            Stock: (0, number_1.number)(p.Stock),
            minimumStock: (0, number_1.number)(p.MinimumStock),
            PurchasePrice: (0, number_1.number)(p.PurchasePrice),
            sellingPrice: (0, number_1.number)(p.SellingPrice),
            StockValue: (0, number_1.number)(p.Stock) * Number(p.PurchasePrice),
            retailValue: (0, number_1.number)(p.Stock) * Number(p.SellingPrice),
            isLowStock: (0, number_1.number)(p.Stock) <= Number(p.MinimumStock) && Number(p.Stock) > 0,
            isOutOfStock: (0, number_1.number)(p.Stock) <= 0,
        }));
        const Summary = {
            TotalProducts: items.length,
            TotalStock: items.reduce((sum, i) => sum + i.Stock, 0),
            TotalStockValue: items.reduce((sum, i) => sum + i.StockValue, 0),
            TotalRetailValue: items.reduce((sum, i) => sum + i.retailValue, 0),
            lowStockCount: items.filter((i) => i.isLowStock).length,
            outOfStockCount: items.filter((i) => i.isOutOfStock).length,
        };
        return { Summary, items };
    }
    async getStockMovementReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : new Date();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        endDate.setHours(23, 59, 59, 999);
        const movements = [];
        if (!dto.MovementType || dto.MovementType === 'STOCK_IN') {
            const StockIns = await this.prisma.stockIn.findMany({
                where: {
                    Date: { gte: startDate, lte: endDate },
                    ...(dto.WarehouseId ? { WarehouseID: dto.WarehouseId } : {}),
                },
                include: {
                    StockInItems: { include: { Product: true } },
                    Warehouse: true,
                    Supplier: true,
                },
            });
            for (const si of StockIns) {
                for (const item of si.StockInItems) {
                    if (dto.ProductId && item.ProductID !== dto.ProductId)
                        continue;
                    movements.push({
                        Date: si.Date,
                        Type: 'STOCK_IN',
                        reference: si.Code,
                        ProductName: item.Product?.Name,
                        Warehouse: si.Warehouse?.Name,
                        Quantity: (0, number_1.number)(item.Quantity),
                        UnitPrice: (0, number_1.number)(item.UnitPrice),
                        subTotal: (0, number_1.number)(item.Subtotal),
                        Notes: si.Description,
                    });
                }
            }
        }
        if (!dto.MovementType || dto.MovementType === 'STOCK_OUT') {
            const StockOuts = await this.prisma.stockOut.findMany({
                where: {
                    Date: { gte: startDate, lte: endDate },
                    ...(dto.WarehouseId ? { WarehouseID: dto.WarehouseId } : {}),
                },
                include: {
                    StockOutItems: { include: { Product: true } },
                    Warehouse: true,
                },
            });
            for (const so of StockOuts) {
                for (const item of so.StockOutItems) {
                    if (dto.ProductId && item.ProductID !== dto.ProductId)
                        continue;
                    movements.push({
                        Date: so.Date,
                        Type: 'STOCK_OUT',
                        reference: so.Code,
                        ProductName: item.Product?.Name,
                        Warehouse: so.Warehouse?.Name,
                        Quantity: -Number(item.Quantity),
                        UnitPrice: (0, number_1.number)(item.UnitPrice),
                        subTotal: -Number(item.Subtotal),
                        Notes: so.Description,
                    });
                }
            }
        }
        movements.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
        const Summary = {
            TotalIn: movements.filter((m) => m.Type === 'STOCK_IN').reduce((sum, m) => sum + m.Quantity, 0),
            TotalOut: movements.filter((m) => m.Type === 'STOCK_OUT').reduce((sum, m) => sum + Math.abs(m.Quantity), 0),
            netMovement: movements.reduce((sum, m) => sum + m.Quantity, 0),
        };
        return { period: { startDate: dto.StartDate, endDate: dto.EndDate }, Summary, movements };
    }
    async getReceivableAgingReport(dto) {
        const asOfDate = dto.AsOfDate ? new Date(dto.AsOfDate) : new Date();
        const where = { TotalReceivable: { gt: 0 } };
        if (dto.CustomerId)
            where.ID = dto.CustomerId;
        if (dto.CustomerGroupId)
            where.CustomerGroupID = dto.CustomerGroupId;
        const Customers = await this.prisma.customer.findMany({
            where,
            include: {
                CustomerGroup: true,
                Sales: {
                    where: {
                        Date: { lte: asOfDate },
                        PaymentStatusID: 2,
                    },
                    include: { SalePayments: true },
                },
            },
        });
        const buckets = {
            'CURRENT (0-30)': { Amount: 0, Count: 0, Customers: [] },
            '31-60 DAYS': { Amount: 0, Count: 0, Customers: [] },
            '61-90 DAYS': { Amount: 0, Count: 0, Customers: [] },
            '91-180 DAYS': { Amount: 0, Count: 0, Customers: [] },
            '180+ DAYS': { Amount: 0, Count: 0, Customers: [] },
        };
        const CustomerDetails = [];
        for (const Customer of Customers) {
            const TotalReceivable = Number(Customer.TotalReceivable);
            if (TotalReceivable <= 0)
                continue;
            const lastSale = Customer.Sales[0];
            const daysSince = lastSale
                ? Math.floor((asOfDate.getTime() - new Date(lastSale.Date).getTime()) / (1000 * 60 * 60 * 24))
                : 365;
            let bucket;
            if (daysSince <= 30)
                bucket = 'CURRENT (0-30)';
            else if (daysSince <= 60)
                bucket = '31-60 DAYS';
            else if (daysSince <= 90)
                bucket = '61-90 DAYS';
            else if (daysSince <= 180)
                bucket = '91-180 DAYS';
            else
                bucket = '180+ DAYS';
            buckets[bucket].Amount += TotalReceivable;
            buckets[bucket].Count++;
            buckets[bucket].Customers.push({
                CustomerId: Customer.ID,
                CustomerName: Customer.Name,
                CustomerCode: Customer.Code,
                Group: Customer.CustomerGroup?.Name,
                receivableAmount: TotalReceivable,
                daysOutstanding: daysSince,
            });
            CustomerDetails.push({
                CustomerId: Customer.ID,
                CustomerName: Customer.Name,
                CustomerCode: Customer.Code,
                Group: Customer.CustomerGroup?.Name,
                receivableAmount: TotalReceivable,
                daysOutstanding: daysSince,
                bucket,
            });
        }
        const Summary = {
            TotalCustomers: Object.values(buckets).reduce((sum, b) => sum + b.Count, 0),
            TotalReceivable: Object.values(buckets).reduce((sum, b) => sum + b.Amount, 0),
            buckets,
        };
        return { asOfDate: asOfDate.toISOString().split('T')[0], Summary, Customers: CustomerDetails };
    }
    async getPayableAgingReport(dto) {
        const asOfDate = dto.AsOfDate ? new Date(dto.AsOfDate) : new Date();
        const where = { TotalDebt: { gt: 0 } };
        if (dto.SupplierId)
            where.ID = dto.SupplierId;
        const Suppliers = await this.prisma.supplier.findMany({
            where,
            include: {
                Purchases: {
                    where: {
                        Date: { lte: asOfDate },
                    },
                },
            },
        });
        const buckets = {
            'CURRENT (0-30)': { Amount: 0, Count: 0, Suppliers: [] },
            '31-60 DAYS': { Amount: 0, Count: 0, Suppliers: [] },
            '61-90 DAYS': { Amount: 0, Count: 0, Suppliers: [] },
            '91-180 DAYS': { Amount: 0, Count: 0, Suppliers: [] },
            '180+ DAYS': { Amount: 0, Count: 0, Suppliers: [] },
        };
        for (const Supplier of Suppliers) {
            const TotalDebt = Number(Supplier.TotalDebt);
            if (TotalDebt <= 0)
                continue;
            const lastPurchase = Supplier.Purchases[0];
            const daysSince = lastPurchase
                ? Math.floor((asOfDate.getTime() - new Date(lastPurchase.Date).getTime()) / (1000 * 60 * 60 * 24))
                : 365;
            let bucket;
            if (daysSince <= 30)
                bucket = 'CURRENT (0-30)';
            else if (daysSince <= 60)
                bucket = '31-60 DAYS';
            else if (daysSince <= 90)
                bucket = '61-90 DAYS';
            else if (daysSince <= 180)
                bucket = '91-180 DAYS';
            else
                bucket = '180+ DAYS';
            buckets[bucket].Amount += TotalDebt;
            buckets[bucket].Count++;
            buckets[bucket].Suppliers.push({
                SupplierId: Supplier.ID,
                SupplierName: Supplier.Name,
                SupplierCode: Supplier.Code,
                payableAmount: TotalDebt,
                daysOutstanding: daysSince,
            });
        }
        const Summary = {
            TotalSuppliers: Object.values(buckets).reduce((sum, b) => sum + b.Count, 0),
            TotalPayable: Object.values(buckets).reduce((sum, b) => sum + b.Amount, 0),
            buckets,
        };
        return { asOfDate: asOfDate.toISOString().split('T')[0], Summary };
    }
    async getCashFlowReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : new Date();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        endDate.setHours(23, 59, 59, 999);
        const where = {
            Date: { gte: startDate, lte: endDate },
        };
        if (dto.AccountId)
            where.AccountID = dto.AccountId;
        const CashIns = await this.prisma.cashIn.findMany({
            where,
            include: { Account: true },
        });
        const CashOuts = await this.prisma.cashOut.findMany({
            where,
            include: { Account: true },
        });
        const Transfers = await this.prisma.cashTransfer.findMany({
            where: {
                Date: { gte: startDate, lte: endDate },
                ...(dto.AccountId ? { OR: [{ FromAccountID: dto.AccountId }, { ToAccountID: dto.AccountId }] } : {}),
            },
        });
        const TotalCashIn = CashIns.reduce((sum, c) => sum + Number(c.Amount), 0);
        const TotalCashOut = CashOuts.reduce((sum, c) => sum + Number(c.Amount), 0);
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            CashIn: {
                Total: TotalCashIn,
                transactions: CashIns.map((c) => ({
                    Date: c.Date,
                    account: c.Account?.Name,
                    Amount: (0, number_1.number)(c.Amount),
                    Description: c.Description,
                    reference: c.ReferenceType,
                })),
            },
            CashOut: {
                Total: TotalCashOut,
                transactions: CashOuts.map((c) => ({
                    Date: c.Date,
                    account: c.Account?.Name,
                    Amount: (0, number_1.number)(c.Amount),
                    Description: c.Description,
                    reference: c.ReferenceType,
                })),
            },
            Transfers: Transfers.map((t) => ({
                Date: t.Date,
                fromAccount: t.FromAccountID,
                toAccount: t.ToAccountID,
                Amount: (0, number_1.number)(t.Amount),
                Description: t.Description,
            })),
            Summary: {
                TotalCashIn,
                TotalCashOut,
                netFlow: TotalCashIn - TotalCashOut,
            },
        };
    }
    async getProfitLossReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : new Date();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        endDate.setHours(23, 59, 59, 999);
        const where = {
            Date: { gte: startDate, lte: endDate },
            IsReturn: false,
        };
        if (dto.WarehouseId)
            where.WarehouseID = dto.WarehouseId;
        const Sales = await this.prisma.sale.findMany({
            where,
            include: { SaleItems: { include: { Product: true } } },
        });
        const expenses = await this.prisma.expense.findMany({
            where: {
                Date: { gte: startDate, lte: endDate },
                IsApproved: true,
            },
            include: { ExpenseCategory: true },
        });
        let TotalRevenue = 0;
        let TotalCost = 0;
        let grossProfit = 0;
        let TotalExpenses = 0;
        for (const Sale of Sales) {
            TotalRevenue += Number(Sale.Total);
            for (const item of Sale.SaleItems) {
                const Cost = Number(item.Quantity) * Number(item.Product?.PurchasePrice || 0);
                TotalCost += Cost;
            }
        }
        grossProfit = TotalRevenue - TotalCost;
        for (const expense of expenses) {
            TotalExpenses += Number(expense.Amount);
        }
        const netProfit = grossProfit - TotalExpenses;
        const expenseByCategory = {};
        for (const expense of expenses) {
            const cat = expense.ExpenseCategory?.Name || 'Uncategorized';
            expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(expense.Amount);
        }
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            income: {
                SalesRevenue: TotalRevenue,
            },
            CostOfGoodsSold: {
                Total: TotalCost,
            },
            grossProfit: {
                Value: grossProfit,
                margin: TotalRevenue > 0 ? (grossProfit / TotalRevenue) * 100 : 0,
            },
            expenses: {
                Total: TotalExpenses,
                byCategory: expenseByCategory,
            },
            netProfit: {
                Value: netProfit,
                margin: TotalRevenue > 0 ? (netProfit / TotalRevenue) * 100 : 0,
            },
        };
    }
    async getAttendanceSummaryReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : new Date();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        endDate.setHours(23, 59, 59, 999);
        const where = {
            Date: { gte: startDate, lte: endDate },
        };
        if (dto.EmployeeId)
            where.EmployeeID = dto.EmployeeId;
        if (dto.DepartmentId)
            where.Employee = { DepartmentID: dto.DepartmentId };
        const attendance = await this.prisma.attendance.findMany({
            where,
            include: {
                Employee: { include: { Department: true, Position: true } },
                Status: true,
            },
        });
        const byEmployee = {};
        for (const Record of attendance) {
            if (!byEmployee[Record.EmployeeID]) {
                byEmployee[Record.EmployeeID] = {
                    EmployeeId: Record.EmployeeID,
                    EmployeeName: Record.Employee.Name,
                    EmployeeCode: Record.Employee.Code,
                    Department: Record.Employee.Department?.Name,
                    Position: Record.Employee.Position?.Name,
                    present: 0,
                    sick: 0,
                    Leave: 0,
                    absent: 0,
                    late: 0,
                    TotalHours: 0,
                };
            }
            const StatusCode = Record.Status?.Code || '';
            if (StatusCode === 'PRESENT')
                byEmployee[Record.EmployeeID].present++;
            else if (StatusCode === 'SICK')
                byEmployee[Record.EmployeeID].sick++;
            else if (StatusCode === 'LEAVE')
                byEmployee[Record.EmployeeID].Leave++;
            else if (StatusCode === 'ABSENT')
                byEmployee[Record.EmployeeID].absent++;
            else if (StatusCode === 'LATE')
                byEmployee[Record.EmployeeID].late++;
            if (Record.CheckIn && Record.CheckOut) {
                const hours = (new Date(Record.CheckOut).getTime() - new Date(Record.CheckIn).getTime()) / (1000 * 60 * 60);
                byEmployee[Record.EmployeeID].TotalHours += hours;
            }
        }
        const Summary = {
            TotalEmployees: Object.keys(byEmployee).length,
            TotalRecords: attendance.length,
            TotalPresent: attendance.filter((a) => a.Status?.Code === 'PRESENT').length,
            TotalAbsent: attendance.filter((a) => a.Status?.Code === 'ABSENT').length,
            TotalLate: attendance.filter((a) => a.Status?.Code === 'LATE').length,
        };
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            Summary,
            Employees: Object.values(byEmployee),
        };
    }
    async getTopProductsReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : new Date();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        endDate.setHours(23, 59, 59, 999);
        const where = {
            Date: { gte: startDate, lte: endDate },
            IsReturn: false,
        };
        if (dto.WarehouseId)
            where.WarehouseID = dto.WarehouseId;
        const Sales = await this.prisma.sale.findMany({
            where,
            include: {
                SaleItems: {
                    include: {
                        Product: { include: { Category: true, Brand: true } },
                    },
                },
            },
        });
        const ProductData = {};
        for (const Sale of Sales) {
            for (const item of Sale.SaleItems) {
                if (dto.CategoryId && item.Product?.CategoryID !== dto.CategoryId)
                    continue;
                if (!ProductData[item.ProductID]) {
                    ProductData[item.ProductID] = {
                        ProductId: item.ProductID,
                        ProductName: item.Product?.Name || 'Unknown',
                        ProductCode: item.Product?.Code || '',
                        Category: item.Product?.Category?.Name,
                        Brand: item.Product?.Brand?.Name,
                        PurchasePrice: (0, number_1.number)(item.Product?.PurchasePrice || 0),
                        Quantity: 0,
                        revenue: 0,
                        Cost: 0,
                        profit: 0,
                    };
                }
                const Qty = Number(item.Quantity);
                const Price = Number(item.UnitPrice);
                const Cost = Qty * Number(item.Product?.PurchasePrice || 0);
                ProductData[item.ProductID].Quantity += Qty;
                ProductData[item.ProductID].revenue += Number(item.Subtotal);
                ProductData[item.ProductID].Cost += Cost;
                ProductData[item.ProductID].profit += Number(item.Subtotal) - Cost;
            }
        }
        const Products = Object.values(ProductData);
        const sortBy = dto.SortBy || 'revenue';
        Products.sort((a, b) => b[sortBy] - a[sortBy]);
        const limit = dto.Limit || 10;
        const topProducts = Products.slice(0, limit);
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            topProducts,
        };
    }
    async getCustomerRevenueReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : new Date();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        endDate.setHours(23, 59, 59, 999);
        const Sales = await this.prisma.sale.findMany({
            where: {
                Date: { gte: startDate, lte: endDate },
                IsReturn: false,
            },
            include: {
                Customer: { include: { CustomerGroup: true } },
                SaleItems: { include: { Product: true } },
            },
        });
        const CustomerData = {};
        for (const Sale of Sales) {
            if (!CustomerData[Sale.CustomerID]) {
                CustomerData[Sale.CustomerID] = {
                    CustomerId: Sale.CustomerID,
                    CustomerName: Sale.Customer?.Name || 'Unknown',
                    CustomerCode: Sale.Customer?.Code || '',
                    Group: Sale.Customer?.CustomerGroup?.Name,
                    transactionCount: 0,
                    TotalQuantity: 0,
                    revenue: 0,
                    Cost: 0,
                    profit: 0,
                };
            }
            CustomerData[Sale.CustomerID].transactionCount++;
            let SaleCost = 0;
            for (const item of Sale.SaleItems) {
                CustomerData[Sale.CustomerID].TotalQuantity += Number(item.Quantity);
                const Cost = Number(item.Quantity) * Number(item.Product?.PurchasePrice || 0);
                SaleCost += Cost;
                CustomerData[Sale.CustomerID].profit += Number(item.Subtotal) - Cost;
            }
            CustomerData[Sale.CustomerID].revenue += Number(Sale.Total);
            CustomerData[Sale.CustomerID].Cost += SaleCost;
        }
        const Customers = Object.values(CustomerData);
        const sortBy = dto.SortBy || 'revenue';
        Customers.sort((a, b) => b[sortBy] - a[sortBy]);
        const limit = dto.Limit || 20;
        const topCustomers = Customers.slice(0, limit);
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            Summary: {
                TotalCustomers: Customers.length,
                TotalTransactions: Customers.reduce((sum, c) => sum + c.transactionCount, 0),
                TotalRevenue: Customers.reduce((sum, c) => sum + c.revenue, 0),
            },
            topCustomers,
        };
    }
    async getSupplierPurchaseReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : new Date();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        endDate.setHours(23, 59, 59, 999);
        const where = {
            Date: { gte: startDate, lte: endDate },
            IsReturn: false,
        };
        if (dto.SupplierId)
            where.SupplierID = dto.SupplierId;
        const Purchases = await this.prisma.purchase.findMany({
            where,
            include: { Supplier: true },
        });
        const SupplierData = {};
        for (const Purchase of Purchases) {
            if (!SupplierData[Purchase.SupplierID]) {
                SupplierData[Purchase.SupplierID] = {
                    SupplierId: Purchase.SupplierID,
                    SupplierName: Purchase.Supplier?.Name || 'Unknown',
                    SupplierCode: Purchase.Supplier?.Code || '',
                    transactionCount: 0,
                    TotalPurchase: 0,
                    TotalPaid: 0,
                    TotalDebt: 0,
                };
            }
            SupplierData[Purchase.SupplierID].transactionCount++;
            SupplierData[Purchase.SupplierID].TotalPurchase += Number(Purchase.Total);
            SupplierData[Purchase.SupplierID].TotalPaid += Number(Purchase.Paid);
            SupplierData[Purchase.SupplierID].TotalDebt += Number(Purchase.Remaining);
        }
        const Suppliers = Object.values(SupplierData);
        const sortBy = dto.SortBy || 'TotalPurchase';
        Suppliers.sort((a, b) => b[sortBy] - a[sortBy]);
        const limit = dto.Limit || 20;
        const topSuppliers = Suppliers.slice(0, limit);
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            Summary: {
                TotalSuppliers: Suppliers.length,
                TotalPurchases: Suppliers.reduce((sum, s) => sum + s.TotalPurchase, 0),
                TotalPaid: Suppliers.reduce((sum, s) => sum + s.TotalPaid, 0),
                TotalDebt: Suppliers.reduce((sum, s) => sum + s.TotalDebt, 0),
            },
            topSuppliers,
        };
    }
    async getExpenseReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : new Date();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        endDate.setHours(23, 59, 59, 999);
        const where = {
            Date: { gte: startDate, lte: endDate },
            IsActive: true,
        };
        if (dto.CategoryId)
            where.ExpenseCategoryID = dto.CategoryId;
        const expenses = await this.prisma.expense.findMany({
            where,
            include: { ExpenseCategory: true },
        });
        const byCategory = {};
        let TotalExpense = 0;
        for (const expense of expenses) {
            const cat = expense.ExpenseCategory?.Name || 'Uncategorized';
            if (!byCategory[cat]) {
                byCategory[cat] = { Category: cat, Count: 0, Total: 0 };
            }
            byCategory[cat].Count++;
            byCategory[cat].Total += Number(expense.Amount);
            TotalExpense += Number(expense.Amount);
        }
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            Summary: {
                TotalExpenses: TotalExpense,
                TotalTransactions: expenses.length,
            },
            byCategory: Object.values(byCategory),
            expenses: expenses.map((e) => ({
                ID: e.ID,
                Code: e.Code,
                Date: e.Date,
                Category: e.ExpenseCategory?.Name,
                Amount: (0, number_1.number)(e.Amount),
                Description: e.Description,
                referenceNumber: e.ReferenceNumber,
                IsApproved: e.IsApproved,
            })),
        };
    }
    async getDepositBalanceReport(dto) {
        const asOfDate = dto.AsOfDate ? new Date(dto.AsOfDate) : new Date();
        const customerWhere = { IsActive: true };
        if (dto.CustomerId)
            customerWhere.ID = dto.CustomerId;
        const supplierWhere = { IsActive: true };
        if (dto.SupplierId)
            supplierWhere.ID = dto.SupplierId;
        const customers = await this.prisma.customer.findMany({
            where: customerWhere,
            include: {
                CustomerDeposits: {
                    where: {
                        Date: { lte: asOfDate },
                    },
                },
            },
            orderBy: { Name: 'asc' },
        });
        const suppliers = await this.prisma.supplier.findMany({
            where: supplierWhere,
            include: {
                SupplierDeposits: {
                    where: {
                        Date: { lte: asOfDate },
                    },
                },
            },
            orderBy: { Name: 'asc' },
        });
        const customerDeposits = customers.map((c) => {
            const totalDeposit = c.CustomerDeposits
                .filter((d) => d.Type === 'DEPOSIT')
                .reduce((sum, d) => sum + Number(d.Amount), 0);
            const totalUsed = c.CustomerDeposits
                .filter((d) => d.Type === 'USAGE')
                .reduce((sum, d) => sum + Number(d.Amount), 0);
            return {
                customerId: c.ID,
                customerCode: c.Code,
                customerName: c.Name,
                totalDeposit,
                used: totalUsed,
                remaining: totalDeposit - totalUsed,
            };
        }).filter((c) => c.totalDeposit > 0 || c.used > 0);
        const supplierDeposits = suppliers.map((s) => {
            const totalDeposit = s.SupplierDeposits
                .reduce((sum, d) => sum + Number(d.Amount), 0);
            const totalRemaining = s.SupplierDeposits
                .reduce((sum, d) => sum + Number(d.RemainingAmount), 0);
            const totalUsed = totalDeposit - totalRemaining;
            return {
                supplierId: s.ID,
                supplierCode: s.Code,
                supplierName: s.Name,
                totalDeposit,
                used: totalUsed,
                remaining: totalRemaining,
            };
        }).filter((s) => s.totalDeposit > 0 || s.used > 0);
        const totalCustomerDeposits = customerDeposits.reduce((sum, c) => sum + c.totalDeposit, 0);
        const totalCustomerUsed = customerDeposits.reduce((sum, c) => sum + c.used, 0);
        const totalCustomerRemaining = customerDeposits.reduce((sum, c) => sum + c.remaining, 0);
        const totalSupplierDeposits = supplierDeposits.reduce((sum, s) => sum + s.totalDeposit, 0);
        const totalSupplierUsed = supplierDeposits.reduce((sum, s) => sum + s.used, 0);
        const totalSupplierRemaining = supplierDeposits.reduce((sum, s) => sum + s.remaining, 0);
        return {
            asOfDate: dto.AsOfDate || new Date().toISOString().split('T')[0],
            customerDeposits,
            supplierDeposits,
            summary: {
                totalCustomerDeposits,
                totalCustomerUsed,
                totalCustomerRemaining,
                totalSupplierDeposits,
                totalSupplierUsed,
                totalSupplierRemaining,
                grandTotalDeposit: totalCustomerDeposits + totalSupplierDeposits,
                grandTotalRemaining: totalCustomerRemaining + totalSupplierRemaining,
            },
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
