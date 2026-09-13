import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import {
  SalesReportFilterDto,
  PurchaseReportFilterDto,
  InventoryReportFilterDto,
  DateRangeFilterDto,
  SalesReportResponseDto,
  PurchaseReportResponseDto,
  InventoryReportResponseDto,
  CashReportResponseDto,
  FinancialReportResponseDto,
  ProfitLossReportResponseDto,
  DebtReportResponseDto,
  ReceivableReportResponseDto,
} from './dto/report.dto';

@Injectable()
export class ReportService {
  private readonly CACHE_PREFIX = 'reports';
  private readonly CACHE_TTL = 60; // 1 minute cache for reports

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ─── Sales Report ──────────────────────────────────────────────────────────

  async salesReport(filter: SalesReportFilterDto): Promise<SalesReportResponseDto> {
    const cacheKey = `${this.CACHE_PREFIX}:sales:${JSON.stringify(filter)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const whereClause: any = {
      paymentStatus: { in: ['PAID', 'PARTIAL'] },
    };

    if (filter.startDate) {
      whereClause.date = { ...whereClause.date, gte: new Date(filter.startDate) };
    }
    if (filter.endDate) {
      whereClause.date = { ...whereClause.date, lte: new Date(filter.endDate + 'T23:59:59') };
    }
    if (filter.customerId) {
      whereClause.customerId = filter.customerId;
    }

    // Get sales data with items
    const sales = await this.prisma.sale.findMany({
      where: whereClause,
      include: {
        saleItems: true,
        customer: { select: { id: true, name: true } },
      },
      orderBy: { date: 'asc' },
    });

    // Calculate summary
    const totalSales = sales.reduce((sum, s) => sum + Number(s.total), 0);
    const totalItems = sales.reduce((sum, s) => sum + s.saleItems.reduce((is, i) => is + Number(i.quantity), 0), 0);

    // Group by date
    const byDateMap = new Map<string, { totalSales: number; transactions: number; items: number }>();
    for (const sale of sales) {
      const dateKey = sale.date.toISOString().split('T')[0];
      const existing = byDateMap.get(dateKey) || { totalSales: 0, transactions: 0, items: 0 };
      existing.totalSales += Number(sale.total);
      existing.transactions += 1;
      existing.items += sale.saleItems.reduce((sum, i) => sum + Number(i.quantity), 0);
      byDateMap.set(dateKey, existing);
    }

    const byDate = Array.from(byDateMap.entries()).map(([date, data]) => ({
      date,
      totalSales: data.totalSales,
      totalTransactions: data.transactions,
      totalItems: data.items,
      averageTransaction: data.transactions > 0 ? data.totalSales / data.transactions : 0,
    }));

    // Group by customer
    const byCustomerMap = new Map<number, { name: string; totalSales: number; transactions: number }>();
    for (const sale of sales) {
      const existing = byCustomerMap.get(sale.customerId) || {
        name: sale.customer.name,
        totalSales: 0,
        transactions: 0,
      };
      existing.totalSales += Number(sale.total);
      existing.transactions += 1;
      byCustomerMap.set(sale.customerId, existing);
    }

    const byCustomer = filter.customerId ? undefined : Array.from(byCustomerMap.entries()).map(([id, data]) => ({
      customerId: id,
      customerName: data.name,
      totalSales: data.totalSales,
      totalTransactions: data.transactions,
    }));

    // Group by product
    const byProductMap = new Map<number, { name: string; quantity: number; totalSales: number }>();
    for (const sale of sales) {
      for (const item of sale.saleItems) {
        const existing = byProductMap.get(item.productId) || {
          name: '',
          quantity: 0,
          totalSales: 0,
        };
        existing.name = item.productId.toString();
        existing.quantity += Number(item.quantity);
        existing.totalSales += Number(item.subtotal);
        byProductMap.set(item.productId, existing);
      }
    }

    const byProduct = Array.from(byProductMap.entries()).map(([id, data]) => ({
      productId: id,
      productName: data.name,
      quantity: data.quantity,
      totalSales: data.totalSales,
    }));

    const result: SalesReportResponseDto = {
      summary: {
        totalSales,
        totalTransactions: sales.length,
        totalItems,
        averageTransaction: sales.length > 0 ? totalSales / sales.length : 0,
      },
      byDate,
      byCustomer,
      byProduct,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    return result;
  }

  // ─── Purchase Report ───────────────────────────────────────────────────────

  async purchaseReport(filter: PurchaseReportFilterDto): Promise<PurchaseReportResponseDto> {
    const cacheKey = `${this.CACHE_PREFIX}:purchase:${JSON.stringify(filter)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const whereClause: any = {
      paymentStatus: { in: ['PAID', 'PARTIAL'] },
    };

    if (filter.startDate) {
      whereClause.date = { ...whereClause.date, gte: new Date(filter.startDate) };
    }
    if (filter.endDate) {
      whereClause.date = { ...whereClause.date, lte: new Date(filter.endDate + 'T23:59:59') };
    }
    if (filter.supplierId) {
      whereClause.supplierId = filter.supplierId;
    }

    const purchases = await this.prisma.purchase.findMany({
      where: whereClause,
      include: {
        purchaseItems: true,
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { date: 'asc' },
    });

    const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.total), 0);
    const totalItems = purchases.reduce((sum, p) => sum + p.purchaseItems.reduce((is, i) => is + Number(i.quantity), 0), 0);

    // Group by date
    const byDateMap = new Map<string, { totalPurchases: number; transactions: number; items: number }>();
    for (const purchase of purchases) {
      const dateKey = purchase.date.toISOString().split('T')[0];
      const existing = byDateMap.get(dateKey) || { totalPurchases: 0, transactions: 0, items: 0 };
      existing.totalPurchases += Number(purchase.total);
      existing.transactions += 1;
      existing.items += purchase.purchaseItems.reduce((sum, i) => sum + Number(i.quantity), 0);
      byDateMap.set(dateKey, existing);
    }

    const byDate = Array.from(byDateMap.entries()).map(([date, data]) => ({
      date,
      totalPurchases: data.totalPurchases,
      totalTransactions: data.transactions,
      totalItems: data.items,
      averageTransaction: data.transactions > 0 ? data.totalPurchases / data.transactions : 0,
    }));

    // Group by supplier
    const bySupplierMap = new Map<number, { name: string; totalPurchases: number; transactions: number }>();
    for (const purchase of purchases) {
      const existing = bySupplierMap.get(purchase.supplierId) || {
        name: purchase.supplier.name,
        totalPurchases: 0,
        transactions: 0,
      };
      existing.totalPurchases += Number(purchase.total);
      existing.transactions += 1;
      bySupplierMap.set(purchase.supplierId, existing);
    }

    const bySupplier = filter.supplierId ? undefined : Array.from(bySupplierMap.entries()).map(([id, data]) => ({
      supplierId: id,
      supplierName: data.name,
      totalPurchases: data.totalPurchases,
      totalTransactions: data.transactions,
    }));

    // Group by product
    const byProductMap = new Map<number, { name: string; quantity: number; totalPurchases: number }>();
    for (const purchase of purchases) {
      for (const item of purchase.purchaseItems) {
        const existing = byProductMap.get(item.productId) || {
          name: '',
          quantity: 0,
          totalPurchases: 0,
        };
        existing.quantity += Number(item.quantity);
        existing.totalPurchases += Number(item.subtotal);
        byProductMap.set(item.productId, existing);
      }
    }

    const byProduct = Array.from(byProductMap.entries()).map(([id, data]) => ({
      productId: id,
      productName: data.name,
      quantity: data.quantity,
      totalPurchases: data.totalPurchases,
    }));

    const result: PurchaseReportResponseDto = {
      summary: {
        totalPurchases,
        totalTransactions: purchases.length,
        totalItems,
        averageTransaction: purchases.length > 0 ? totalPurchases / purchases.length : 0,
      },
      byDate,
      bySupplier,
      byProduct,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    return result;
  }

  // ─── Inventory Report ──────────────────────────────────────────────────────

  async inventoryReport(filter: InventoryReportFilterDto): Promise<InventoryReportResponseDto> {
    const cacheKey = `${this.CACHE_PREFIX}:inventory:${JSON.stringify(filter)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const whereClause: any = { isActive: true };
    if (filter.categoryId) {
      whereClause.categoryId = filter.categoryId;
    }
    if (filter.warehouseId) {
      whereClause.warehouseId = filter.warehouseId;
    }

    const products = await this.prisma.product.findMany({
      where: whereClause,
      include: {
        category: { select: { name: true } },
        warehouse: { select: { name: true } },
        productStocks: filter.warehouseId ? undefined : true,
      },
    });

    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const items = products.map((product) => {
      const quantity = filter.warehouseId
        ? Number(product.stock)
        : product.productStocks?.reduce((sum, ps) => sum + Number(ps.quantity), 0) || 0;
      const stockValue = quantity * Number(product.purchasePrice);
      const isLowStock = quantity > 0 && quantity <= Number(product.minimumStock);
      const isOutOfStock = quantity <= 0;

      if (isLowStock) lowStockCount++;
      if (isOutOfStock) outOfStockCount++;
      totalValue += stockValue;

      return {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        categoryName: product.category?.name,
        warehouseName: product.warehouse?.name,
        quantity,
        minStock: Number(product.minimumStock),
        purchasePrice: Number(product.purchasePrice),
        sellPrice: Number(product.sellingPrice),
        stockValue,
        isLowStock,
        isOutOfStock,
      };
    });

    const result: InventoryReportResponseDto = {
      summary: {
        totalProducts: products.length,
        totalValue,
        lowStockCount,
        outOfStockCount,
      },
      items,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    return result;
  }

  // ─── Cash Report ────────────────────────────────────────────────────────────

  async cashReport(filter: DateRangeFilterDto): Promise<CashReportResponseDto> {
    const cacheKey = `${this.CACHE_PREFIX}:cash:${JSON.stringify(filter)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const dateWhere: any = {};
    if (filter.startDate) {
      dateWhere.gte = new Date(filter.startDate);
    }
    if (filter.endDate) {
      dateWhere.lte = new Date(filter.endDate + 'T23:59:59');
    }

    const dateFilter = Object.keys(dateWhere).length > 0 ? dateWhere : undefined;

    // Get cash in
    const cashIns = await this.prisma.cashIn.findMany({
      where: dateFilter ? { date: dateFilter } : undefined,
      orderBy: { date: 'asc' },
      select: { date: true, description: true, amount: true, referenceId: true },
    });

    // Get cash out
    const cashOuts = await this.prisma.cashOut.findMany({
      where: dateFilter ? { date: dateFilter } : undefined,
      orderBy: { date: 'asc' },
      select: { date: true, description: true, amount: true, referenceId: true },
    });

    // Get sale payments (cash payments from sales)
    const salePayments = await this.prisma.salePayment.findMany({
      where: {
        date: dateFilter,
        method: 'CASH',
      },
      orderBy: { date: 'asc' },
      select: { date: true, amount: true, method: true },
    });

    // Get purchase payments (cash payments for purchases)
    const purchasePayments = await this.prisma.purchasePayment.findMany({
      where: {
        date: dateFilter,
        method: 'CASH',
      },
      orderBy: { date: 'asc' },
      select: { date: true, amount: true, method: true },
    });

    const totalCashIn = cashIns.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalCashOut = cashOuts.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalSalePayments = salePayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPurchasePayments = purchasePayments.reduce((sum, p) => sum + Number(p.amount), 0);

    const result: CashReportResponseDto = {
      summary: {
        beginningBalance: 0, // Would need historical calculation
        totalCashIn: totalCashIn + totalSalePayments,
        totalCashOut: totalCashOut + totalPurchasePayments,
        endingBalance: (totalCashIn + totalSalePayments) - (totalCashOut + totalPurchasePayments),
      },
      cashIns: cashIns.map((c) => ({
        date: c.date.toISOString().split('T')[0],
        description: c.description || '',
        amount: Number(c.amount),
        reference: c.referenceId?.toString() || undefined,
      })),
      cashOuts: cashOuts.map((c) => ({
        date: c.date.toISOString().split('T')[0],
        description: c.description || '',
        amount: Number(c.amount),
        reference: c.referenceId?.toString() || undefined,
      })),
      salePayments: salePayments.map((p) => ({
        date: p.date.toISOString().split('T')[0],
        amount: Number(p.amount),
        paymentMethod: p.method || undefined,
      })),
      purchasePayments: purchasePayments.map((p) => ({
        date: p.date.toISOString().split('T')[0],
        amount: Number(p.amount),
        paymentMethod: p.method || undefined,
      })),
    };

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    return result;
  }

  // ─── Financial Report ───────────────────────────────────────────────────────

  async financialReport(filter: DateRangeFilterDto): Promise<FinancialReportResponseDto> {
    const cacheKey = `${this.CACHE_PREFIX}:financial:${JSON.stringify(filter)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const whereClause: any = {};
    if (filter.startDate) {
      whereClause.date = { ...whereClause.date, gte: new Date(filter.startDate) };
    }
    if (filter.endDate) {
      whereClause.date = { ...whereClause.date, lte: new Date(filter.endDate + 'T23:59:59') };
    }

    // Get sales (revenue)
    const sales = await this.prisma.sale.findMany({
      where: { ...whereClause, paymentStatus: { in: ['PAID', 'PARTIAL'] } },
      select: { date: true, total: true },
    });

    // Get purchases (cost of goods sold)
    const purchases = await this.prisma.purchase.findMany({
      where: { ...whereClause, paymentStatus: { in: ['PAID', 'PARTIAL'] } },
      select: { date: true, total: true },
    });

    // Get expenses (cash outs)
    const expenses = await this.prisma.cashOut.findMany({
      where: whereClause.date ? { date: whereClause.date } : undefined,
      include: { account: { select: { name: true } } },
    });

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
    const totalCOGS = purchases.reduce((sum, p) => sum + Number(p.total), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Group revenue by date
    const revenueByDate = new Map<string, number>();
    for (const sale of sales) {
      const dateKey = sale.date.toISOString().split('T')[0];
      revenueByDate.set(dateKey, (revenueByDate.get(dateKey) || 0) + Number(sale.total));
    }

    // Group COGS by date
    const cogsByDate = new Map<string, number>();
    for (const purchase of purchases) {
      const dateKey = purchase.date.toISOString().split('T')[0];
      cogsByDate.set(dateKey, (cogsByDate.get(dateKey) || 0) + Number(purchase.total));
    }

    // Group expenses by account
    const expensesByAccount = new Map<string, number>();
    for (const expense of expenses) {
      const accountName = expense.account.name;
      expensesByAccount.set(accountName, (expensesByAccount.get(accountName) || 0) + Number(expense.amount));
    }

    const result: FinancialReportResponseDto = {
      summary: {
        totalRevenue,
        totalCostOfGoodsSold: totalCOGS,
        grossProfit: totalRevenue - totalCOGS,
        totalExpenses,
        netProfit: totalRevenue - totalCOGS - totalExpenses,
      },
      revenue: Array.from(revenueByDate.entries()).map(([date, amount]) => ({ date, amount })),
      costOfGoodsSold: Array.from(cogsByDate.entries()).map(([date, amount]) => ({ date, amount })),
      expenses: Array.from(expensesByAccount.entries()).map(([accountName, total]) => ({ accountName, total })),
    };

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    return result;
  }

  // ─── Profit & Loss Report ───────────────────────────────────────────────────

  async profitLossReport(filter: DateRangeFilterDto): Promise<ProfitLossReportResponseDto> {
    const cacheKey = `${this.CACHE_PREFIX}:profit-loss:${JSON.stringify(filter)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const whereClause: any = {};
    if (filter.startDate) {
      whereClause.date = { ...whereClause.date, gte: new Date(filter.startDate) };
    }
    if (filter.endDate) {
      whereClause.date = { ...whereClause.date, lte: new Date(filter.endDate + 'T23:59:59') };
    }

    // Sales revenue
    const sales = await this.prisma.sale.findMany({
      where: { ...whereClause, paymentStatus: { in: ['PAID', 'PARTIAL'] } },
      select: { subtotal: true, taxAmount: true, discountAmount: true },
    });

    // Purchase costs
    const purchases = await this.prisma.purchase.findMany({
      where: { ...whereClause, paymentStatus: { in: ['PAID', 'PARTIAL'] } },
      select: { subtotal: true },
    });

    // Returns reduce revenue
    const saleReturns = await this.prisma.saleReturn.findMany({
      where: whereClause.date ? { date: whereClause.date } : undefined,
      select: { totalReturn: true },
    });

    const purchaseReturns = await this.prisma.purchaseReturn.findMany({
      where: whereClause.date ? { date: whereClause.date } : undefined,
      select: { totalReturn: true },
    });

    // Expenses
    const expenses = await this.prisma.cashOut.findMany({
      where: whereClause.date ? { date: whereClause.date } : undefined,
      include: { account: { select: { name: true } } },
    });

    const totalSales = sales.reduce((sum, s) => sum + Number(s.subtotal), 0);
    const totalSalesTax = sales.reduce((sum, s) => sum + Number(s.taxAmount), 0);
    const totalSalesDiscount = sales.reduce((sum, s) => sum + Number(s.discountAmount), 0);
    const totalSaleReturns = saleReturns.reduce((sum, r) => sum + Number(r.totalReturn), 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.subtotal), 0);
    const totalPurchaseReturns = purchaseReturns.reduce((sum, r) => sum + Number(r.totalReturn), 0);
    const totalExpensesAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const grossProfit = (totalSales - totalSaleReturns) - (totalPurchases - totalPurchaseReturns);
    const netProfit = grossProfit - totalExpensesAmount;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    // Group expenses by account
    const expensesByAccount = new Map<string, number>();
    for (const expense of expenses) {
      const accountName = expense.account.name;
      expensesByAccount.set(accountName, (expensesByAccount.get(accountName) || 0) + Number(expense.amount));
    }

    const result: ProfitLossReportResponseDto = {
      period: {
        startDate: filter.startDate || 'All time',
        endDate: filter.endDate || 'Present',
      },
      income: {
        total: totalSales - totalSaleReturns,
        items: [
          { description: 'Sales Revenue', amount: totalSales },
          { description: 'Sales Tax', amount: totalSalesTax },
          { description: 'Sales Discount', amount: -totalSalesDiscount },
          { description: 'Sales Returns', amount: -totalSaleReturns },
        ],
      },
      expenses: {
        total: totalExpensesAmount,
        items: Array.from(expensesByAccount.entries()).map(([accountName, amount]) => ({ accountName, amount })),
      },
      grossProfit,
      netProfit,
      profitMargin,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    return result;
  }

  // ─── Debt Report (Unpaid Purchases) ────────────────────────────────────────

  async debtReport(): Promise<DebtReportResponseDto> {
    const cacheKey = `${this.CACHE_PREFIX}:debt`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const purchases = await this.prisma.purchase.findMany({
      where: {
        paymentStatus: { in: ['PENDING', 'PARTIAL'] },
      },
      include: {
        supplier: { select: { name: true } },
        purchasePayments: true,
      },
      orderBy: { date: 'asc' },
    });

    const debts = purchases.map((purchase) => {
      const totalPaid = purchase.purchasePayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const remaining = Number(purchase.total) - totalPaid;

      return {
        purchaseId: purchase.id,
        code: purchase.code,
        supplierName: purchase.supplier.name,
        date: purchase.date.toISOString().split('T')[0],
        total: Number(purchase.total),
        paid: totalPaid,
        remaining,
      };
    });

    const totalDebt = debts.reduce((sum, d) => sum + d.total, 0);
    const totalPaid = debts.reduce((sum, d) => sum + d.paid, 0);
    const remainingDebt = debts.reduce((sum, d) => sum + d.remaining, 0);

    const result: DebtReportResponseDto = {
      summary: {
        totalDebt,
        totalPaid,
        remainingDebt,
        overdueCount: 0,
      },
      debts,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    return result;
  }

  // ─── Receivable Report (Unpaid Sales) ──────────────────────────────────────

  async receivableReport(): Promise<ReceivableReportResponseDto> {
    const cacheKey = `${this.CACHE_PREFIX}:receivable`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const sales = await this.prisma.sale.findMany({
      where: {
        paymentStatus: { in: ['PENDING', 'PARTIAL'] },
      },
      include: {
        customer: { select: { name: true } },
        salePayments: true,
      },
      orderBy: { date: 'asc' },
    });

    const receivables = sales.map((sale) => {
      const totalPaid = sale.salePayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const remaining = Number(sale.total) - totalPaid;

      return {
        saleId: sale.id,
        code: sale.code,
        customerName: sale.customer.name,
        date: sale.date.toISOString().split('T')[0],
        total: Number(sale.total),
        paid: totalPaid,
        remaining,
      };
    });

    const totalReceivable = receivables.reduce((sum, r) => sum + r.total, 0);
    const totalPaid = receivables.reduce((sum, r) => sum + r.paid, 0);
    const remainingReceivable = receivables.reduce((sum, r) => sum + r.remaining, 0);

    const result: ReceivableReportResponseDto = {
      summary: {
        totalReceivable,
        totalPaid,
        remainingReceivable,
        overdueCount: 0,
      },
      receivables,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    return result;
  }
}
