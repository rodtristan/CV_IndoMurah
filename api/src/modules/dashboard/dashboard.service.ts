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

    // Get monthly sales
    const sales = await this.prisma.sale.aggregate({
      where: {
        date: { gte: startOfMonth },
        paymentStatus: { in: ['PAID', 'PARTIAL'] },
      },
      _sum: { total: true },
      _count: true,
    });

    // Get monthly purchases
    const purchases = await this.prisma.purchase.aggregate({
      where: {
        date: { gte: startOfMonth },
        paymentStatus: { in: ['PAID', 'PARTIAL'] },
      },
      _sum: { total: true },
      _count: true,
    });

    // Get monthly expenses
    const expenses = await this.prisma.cashOut.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amount: true },
    });

    const totalSales = Number(sales._sum.total) || 0;
    const totalPurchases = Number(purchases._sum.total) || 0;
    const totalExpenses = Number(expenses._sum.amount) || 0;
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

    const salesItems = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: {
          date: { gte: startOfMonth },
          paymentStatus: { in: ['PAID', 'PARTIAL'] },
        },
      },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { subtotal: 'desc' } },
      take: limit,
    });

    const productIds = salesItems.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, code: true, name: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return salesItems.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        productId: item.productId,
        productCode: product.code,
        productName: product.name,
        totalQuantity: Number(item._sum.quantity) || 0,
        totalRevenue: Number(item._sum.subtotal) || 0,
      };
    });
  }

  private async getTopCustomers(limit: number = 5): Promise<TopCustomerDto[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const customerSales = await this.prisma.sale.groupBy({
      by: ['customerId'],
      where: {
        date: { gte: startOfMonth },
        paymentStatus: { in: ['PAID', 'PARTIAL'] },
      },
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });

    const customerIds = customerSales.map((item) => item.customerId);
    const customers = await this.prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, name: true },
    });

    const customerMap = new Map(customers.map((c) => [c.id, c]));

    return customerSales.map((item) => {
      const customer = customerMap.get(item.customerId)!;
      return {
        customerId: item.customerId,
        customerName: customer.name,
        totalTransactions: item._count || 0,
        totalAmount: Number(item._sum.total) || 0,
      };
    });
  }

  private async getTopSuppliers(limit: number = 5): Promise<TopSupplierDto[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const supplierPurchases = await this.prisma.purchase.groupBy({
      by: ['supplierId'],
      where: {
        date: { gte: startOfMonth },
        paymentStatus: { in: ['PAID', 'PARTIAL'] },
      },
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });

    const supplierIds = supplierPurchases.map((item) => item.supplierId);
    const suppliers = await this.prisma.supplier.findMany({
      where: { id: { in: supplierIds } },
      select: { id: true, name: true },
    });

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    return supplierPurchases.map((item) => {
      const supplier = supplierMap.get(item.supplierId)!;
      return {
        supplierId: item.supplierId,
        supplierName: supplier.name,
        totalTransactions: item._count || 0,
        totalAmount: Number(item._sum.total) || 0,
      };
    });
  }

  private async getLowStockItems(limit: number = 10): Promise<LowStockItemDto[]> {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
      },
      include: {
        warehouse: { select: { name: true } },
      },
      orderBy: { stock: 'asc' },
      take: limit * 2, // Get more to filter properly
    });

    return products
      .filter((p) => Number(p.stock) <= Number(p.minimumStock) && Number(p.stock) > 0)
      .slice(0, limit)
      .map((product) => ({
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        currentStock: Number(product.stock),
        minStock: Number(product.minimumStock),
        warehouseName: product.warehouse?.name,
      }));
  }

  private async getOutOfStockItems(limit: number = 10): Promise<LowStockItemDto[]> {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: 0 },
      },
      include: {
        warehouse: { select: { name: true } },
      },
      take: limit,
    });

    return products.map((product) => ({
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      currentStock: Number(product.stock),
      minStock: Number(product.minimumStock),
      warehouseName: product.warehouse?.name,
    }));
  }

  private async getRecentTransactions(limit: number = 10): Promise<RecentTransactionDto[]> {
    const [recentSales, recentPurchases] = await Promise.all([
      this.prisma.sale.findMany({
        where: { paymentStatus: { in: ['PAID', 'PARTIAL'] } },
        orderBy: { date: 'desc' },
        take: limit,
        select: {
          id: true,
          code: true,
          date: true,
          total: true,
          customer: { select: { name: true } },
        },
      }),
      this.prisma.purchase.findMany({
        where: { paymentStatus: { in: ['PAID', 'PARTIAL'] } },
        orderBy: { date: 'desc' },
        take: limit,
        select: {
          id: true,
          code: true,
          date: true,
          total: true,
          supplier: { select: { name: true } },
        },
      }),
    ]);

    const transactions: RecentTransactionDto[] = [
      ...recentSales.map((s) => ({
        id: s.id,
        code: s.code,
        type: 'sale' as const,
        date: s.date.toISOString().split('T')[0],
        amount: Number(s.total),
        counterpartyName: s.customer.name,
      })),
      ...recentPurchases.map((p) => ({
        id: p.id,
        code: p.code,
        type: 'purchase' as const,
        date: p.date.toISOString().split('T')[0],
        amount: Number(p.total),
        counterpartyName: p.supplier.name,
      })),
    ];

    // Sort by date descending and take top N
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
  }
}
