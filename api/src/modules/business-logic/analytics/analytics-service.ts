import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  DashboardSummaryDto,
  SalesReportDto,
  ProfitReportDto,
  TopProductsDto,
  TopCustomersDto,
  InventoryReportDto,
  CashFlowReportDto,
  TaxReportDto,
  PeriodicReportDto,
  SalesTrendDto,
} from './analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // DASHBOARD SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get comprehensive dashboard Summary
   * Flow: Owner membuka dashboard → sistem tampilkan statistik utama
   */
  async getDashboardSummary(dto: DashboardSummaryDto) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const startDate = dto.StartDate ? new Date(dto.StartDate) : startOfDay;
    const endDate = dto.EndDate ? new Date(dto.EndDate) : endOfDay;

    // Get today's Sales
    const todaySales = await this.prisma.sale.aggregate({
      where: { Date: { gte: startOfDay, lte: endOfDay } },
      _count: true,
      _sum: { Total: true },
    });

    // Get today's transactions Count
    const todayTransactions = await this.prisma.sale.count({
      where: { Date: { gte: startOfDay, lte: endOfDay } },
    });

    // Get low Stock Count
    const lowStockCount = await this.prisma.product.count({
      where: {
        IsActive: true,
        Stock: { lte: 10 }, // Default minimum Stock threshold
        ...(dto.WarehouseId ? { WarehouseID: dto.WarehouseId } : {}),
      },
    });

    // Get out of Stock Count
    const outOfStockCount = await this.prisma.product.count({
      where: {
        IsActive: true,
        Stock: { lte: 0 },
        ...(dto.WarehouseId ? { WarehouseID: dto.WarehouseId } : {}),
      },
    });

    // Get overdue receivables Total
    const overdueReceivables = await this.prisma.customer.aggregate({
      where: { TotalReceivable: { gt: 0 } },
      _sum: { TotalReceivable: true },
    });

    // Get recent Sales
    const recentSales = await this.prisma.sale.findMany({
      where: { Date: { gte: startOfDay, lte: endOfDay } },
      include: {
        Customer: true,
        SaleItems: { include: { Product: true } },
      },
      orderBy: { Date: 'desc' },
      take: 10,
    });

    // Calculate best selling Products today
    const bestSellers = await this.prisma.saleItem.groupBy({
      by: ['ProductID'],
      where: {
        Sale: { Date: { gte: startOfDay, lte: endOfDay } },
      },
      _sum: { Quantity: true, Subtotal: true },
      orderBy: { _sum: { Quantity: 'desc' } },
      take: 5,
    });

    // Get Product details for best sellers
    const bestSellerDetails = await Promise.all(
      bestSellers.map(async (item) => {
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
          QuantitySold: number(item._sum?.Quantity || 0),
          revenue: number(item._sum?.Subtotal || 0),
        };
      }),
    );

    return {
      period: { startDate, endDate },
      Summary: {
        todaySales: number(todaySales._sum?.Total || 0),
        todayTransactions,
        lowStockCount,
        outOfStockCount,
        overdueReceivables: number(overdueReceivables._sum?.TotalReceivable || 0),
      },
      recentSales: recentSales.map((s) => ({
        ID: s.ID,
        Code: s.Code,
        Customer: s.Customer?.Name || 'Guest',
        Total: number(s.Total),
        itemCount: s.SaleItems?.length || 0,
        Date: s.Date,
      })),
      bestSellers: bestSellerDetails.filter((b) => b.Product !== null),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SALES REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * generate detailed Sales Report
   * Flow: Owner/CFO minta laporan penjualan
   */
  async getSalesReport(dto: SalesReportDto) {
    const startDate = dto.StartDate ? new Date(dto.StartDate) : this.getStartOfMonth();
    const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();

    const whereClause: any = {
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

    // Filter by Category if needed
    let filteredSales = Sales;
    if (dto.CategoryId) {
      filteredSales = Sales.filter((s) =>
        s.SaleItems.some((item) => (item.Product as any).CategoryID === dto.CategoryId),
      );
    }

    // Calculate Totals
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
          Product: (i.Product as any).Name,
          Quantity: number(i.Quantity),
          Unit: (i.Unit as any)?.Name,
          UnitPrice: number(i.UnitPrice),
          subTotal: number(i.Subtotal),
        })),
        subTotal: number(s.Subtotal),
        discount: number(s.DiscountAmount),
        tax: number(s.TaxAmount),
        Total: number(s.Total),
        PaymentMethod: s.SalePayments[0]?.Method?.Name || 'N/A',
        createdBy: (s.Creator as any)?.Name || 'System',
      })),
    };
  }

  /**
   * generate Sales by Category Report
   */
  async getSalesByCategory(dto: SalesReportDto) {
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

    const CategoryData: Record<string, any> = {};

    for (const Sale of Sales) {
      for (const item of Sale.SaleItems || []) {
        const Product = item.Product as any;
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

    const Categories = Object.values(CategoryData).map((c: any) => ({
      ...c,
      ProductCount: c.ProductCount.size,
      ProductCountDisplay: undefined,
    }));

    return {
      period: { startDate, endDate },
      Categories: Categories.sort((a: any, b: any) => b.TotalRevenue - a.TotalRevenue),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PROFIT REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get profit and margin analysis
   */
  async getProfitReport(dto: ProfitReportDto) {
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
        const Product = item.Product as any;
        // Assume Cost is 70% of selling Price if not available
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

  // ─────────────────────────────────────────────────────────────────────────────
  // TOP PRODUCTS REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get top selling Products
   */
  async getTopProducts(dto: TopProductsDto) {
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

    const Products = await Promise.all(
      topProducts.map(async (item) => {
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
          TotalQuantity: number(item._sum?.Quantity || 0),
          TotalRevenue: number(item._sum?.Subtotal || 0),
          transactionCount: item._count,
        };
      }),
    );

    return {
      period: { startDate, endDate },
      Products: Products.filter((p) => p.ProductName),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TOP CUSTOMERS REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get top Customers by revenue
   */
  async getTopCustomers(dto: TopCustomersDto) {
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

    const Customers = await Promise.all(
      topCustomers.map(async (item) => {
        const Customer = await this.prisma.customer.findUnique({
          where: { ID: item.CustomerID },
          include: { CustomerGroup: true },
        });
        return {
          CustomerId: item.CustomerID,
          CustomerCode: Customer?.Code,
          CustomerName: Customer?.Name,
          Group: Customer?.CustomerGroup?.Name,
          TotalRevenue: number(item._sum?.Total || 0),
          TotalItems: number(item._sum?.Subtotal || 0),
          transactionCount: item._count,
        };
      }),
    );

    return {
      period: { startDate, endDate },
      Customers: Customers.filter((c) => c.CustomerName),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // INVENTORY REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get inventory valuation Report
   */
  async getInventoryReport(dto: InventoryReportDto) {
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
      Stock: number(p.Stock),
      PurchasePrice: number(p.PurchasePrice),
      sellingPrice: number(p.SellingPrice),
      StockValue: number(p.Stock) * Number(p.PurchasePrice),
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

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH FLOW REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get Cash Flow Summary
   */
  async getCashFlowReport(dto: CashFlowReportDto) {
    const startDate = dto.StartDate ? new Date(dto.StartDate) : this.getStartOfMonth();
    const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();

    // Get all Cash transactions
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
        Total: number(CashIns._sum?.Amount || 0),
        Count: CashIns._count,
      },
      CashOut: {
        Total: number(CashOuts._sum?.Amount || 0),
        Count: CashOuts._count,
      },
      Transfers: {
        Total: number(Transfers._sum?.Amount || 0),
        Count: Transfers._count,
      },
      netFlow: number(CashIns._sum?.Amount || 0) - Number(CashOuts._sum?.Amount || 0),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TAX REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get tax Summary Report
   */
  async getTaxReport(dto: TaxReportDto) {
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

  // ─────────────────────────────────────────────────────────────────────────────
  // SALES TREND
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get Sales trend over time
   */
  async getSalesTrend(dto: SalesTrendDto) {
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

    // Group by day/week/month - use 'day' as Default
    const Grouped = this.GroupSalesByPeriod(Sales, 'day');

    return {
      period: { startDate, endDate },
      granularity: 'day',
      trend: Grouped,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private getStartOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private GroupSalesByPeriod(Sales: any[], period: 'day' | 'week' | 'month') {
    const Grouped: Record<string, any> = {};

    for (const Sale of Sales) {
      let key: string;
      const d = new Date(Sale.Date);

      if (period === 'day') {
        key = d.toISOString().split('T')[0];
      } else if (period === 'week') {
        const weekNum = Math.ceil((d.getDate()) / 7);
        key = `${d.getFullYear()}-W${weekNum}`;
      } else {
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
}
