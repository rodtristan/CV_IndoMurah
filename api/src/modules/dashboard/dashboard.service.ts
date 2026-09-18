import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import {
  DashboardResponseDto,
  TopProductDto,
  TopCustomerDto,
  TopSupplierDto,
  LowStockItemDto,
  RecentTransactionDto,
} from './dashboard.dto';

@Injectable()
export class DashboardService {
  private readonly CACHE_KEY = 'dashboard:summary';
  private readonly CACHE_TTL = 60; // 1 minute cache

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getDashboard(): Promise<DashboardResponseDto> {
    const cached = await this.redis.get(this.CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const [summary, topProducts, topCustomers, topSuppliers, lowStockItems, outOfStockItems, recentTransactions] =
      await Promise.all([
        this.getSummary(),
        this.getTopProducts(),
        this.getTopCustomers(),
        this.getTopSuppliers(),
        this.getLowStockItems(),
        this.getOutOfStockItems(),
        this.getRecentTransactions(),
      ]);

    const result: DashboardResponseDto = {
      summary,
      topProducts,
      topCustomers,
      topSuppliers,
      lowStockItems,
      outOfStockItems,
      recentTransactions,
    };

    await this.redis.set(this.CACHE_KEY, JSON.stringify(result), this.CACHE_TTL);
    return result;
  }

  private async getSummary() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get status IDs for PAID and PARTIAL
    const paidStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PAID' } });
    const partialStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PARTIAL' } });
    const statusIds = [paidStatus?.ID, partialStatus?.ID].filter(Boolean) as number[];

    // Get monthly sales
    const sales = await this.prisma.sale.aggregate({
      where: {
        Date: { gte: startOfMonth },
        PaymentStatusID: { in: statusIds },
      },
      _sum: { Total: true },
      _count: true,
    });

    // Get monthly purchases
    const purchases = await this.prisma.purchase.aggregate({
      where: {
        Date: { gte: startOfMonth },
        PaymentStatusID: { in: statusIds },
      },
      _sum: { Total: true },
      _count: true,
    });

    // Get monthly expenses
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

  private async getTopProducts(limit: number = 5): Promise<TopProductDto[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get status IDs for PAID and PARTIAL
    const paidStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PAID' } });
    const partialStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PARTIAL' } });
    const statusIds = [paidStatus?.ID, partialStatus?.ID].filter(Boolean) as number[];

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
      const product = productMap.get(item.ProductID)!;
      return {
        productId: item.ProductID,
        productCode: product.Code,
        productName: product.Name,
        totalQuantity: Number(item._sum.Quantity) || 0,
        totalRevenue: Number(item._sum.Subtotal) || 0,
      };
    });
  }

  private async getTopCustomers(limit: number = 5): Promise<TopCustomerDto[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get status IDs for PAID and PARTIAL
    const paidStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PAID' } });
    const partialStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PARTIAL' } });
    const statusIds = [paidStatus?.ID, partialStatus?.ID].filter(Boolean) as number[];

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
      const customer = customerMap.get(item.CustomerID)!;
      return {
        customerId: item.CustomerID,
        customerName: customer.Name,
        totalTransactions: item._count || 0,
        totalAmount: Number(item._sum.Total) || 0,
      };
    });
  }

  private async getTopSuppliers(limit: number = 5): Promise<TopSupplierDto[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get status IDs for PAID and PARTIAL
    const paidStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PAID' } });
    const partialStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PARTIAL' } });
    const statusIds = [paidStatus?.ID, partialStatus?.ID].filter(Boolean) as number[];

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
      const supplier = supplierMap.get(item.SupplierID)!;
      return {
        supplierId: item.SupplierID,
        supplierName: supplier.Name,
        totalTransactions: item._count || 0,
        totalAmount: Number(item._sum.Total) || 0,
      };
    });
  }

  private async getLowStockItems(limit: number = 10): Promise<LowStockItemDto[]> {
    const products = await this.prisma.product.findMany({
      where: {
        IsActive: true,
        Stock: { gt: 0 },
      },
      include: {
        Warehouse: { select: { Name: true } },
      },
      orderBy: { Stock: 'asc' },
      take: limit * 2, // Get more to filter properly
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

  private async getOutOfStockItems(limit: number = 10): Promise<LowStockItemDto[]> {
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

  private async getRecentTransactions(limit: number = 10): Promise<RecentTransactionDto[]> {
    // Get status IDs for PAID and PARTIAL
    const paidStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PAID' } });
    const partialStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PARTIAL' } });
    const statusIds = [paidStatus?.ID, partialStatus?.ID].filter(Boolean) as number[];

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

    // Get customer and supplier names
    const customerIds = recentSales.map((s) => s.CustomerID);
    const supplierIds = recentPurchases.map((p) => p.SupplierID);
    const [customers, suppliers] = await Promise.all([
      this.prisma.customer.findMany({ where: { ID: { in: customerIds } }, select: { ID: true, Name: true } }),
      this.prisma.supplier.findMany({ where: { ID: { in: supplierIds } }, select: { ID: true, Name: true } }),
    ]);
    const customerMap = new Map(customers.map((c) => [c.ID, c.Name]));
    const supplierMap = new Map(suppliers.map((s) => [s.ID, s.Name]));

    const transactions: RecentTransactionDto[] = [
      ...recentSales.map((s) => ({
        id: s.ID,
        code: s.Code,
        type: 'sale' as const,
        date: s.Date.toISOString().split('T')[0],
        amount: Number(s.Total),
        counterpartyName: customerMap.get(s.CustomerID) || 'Unknown',
      })),
      ...recentPurchases.map((p) => ({
        id: p.ID,
        code: p.Code,
        type: 'purchase' as const,
        date: p.Date.toISOString().split('T')[0],
        amount: Number(p.Total),
        counterpartyName: supplierMap.get(p.SupplierID) || 'Unknown',
      })),
    ];

    // Sort by date descending and take top N
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
  }
}
