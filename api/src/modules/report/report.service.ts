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

  // Helper method to get payment status IDs
  private async getPaidStatusIds(): Promise<number[]> {
    const paidStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PAID' } });
    const partialStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PARTIAL' } });
    return [paidStatus?.ID, partialStatus?.ID].filter(Boolean) as number[];
  }

  // Helper method to get pending status IDs
  private async getPendingStatusIds(): Promise<number[]> {
    const pendingStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PENDING' } });
    const partialStatus = await this.prisma.paymentStatus.findUnique({ where: { Code: 'PARTIAL' } });
    return [pendingStatus?.ID, partialStatus?.ID].filter(Boolean) as number[];
  }

  // ─── Sales Report ──────────────────────────────────────────────────────────

  async salesReport(filter: SalesReportFilterDto): Promise<SalesReportResponseDto> {
    const cacheKey = `${this.CACHE_PREFIX}:sales:${JSON.stringify(filter)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const paidStatusIds = await this.getPaidStatusIds();

    const whereClause: any = {
      PaymentStatusID: { in: paidStatusIds },
    };

    if (filter.startDate) {
      whereClause.Date = { ...whereClause.Date, gte: new Date(filter.startDate) };
    }
    if (filter.endDate) {
      whereClause.Date = { ...whereClause.Date, lte: new Date(filter.endDate + 'T23:59:59') };
    }
    if (filter.customerId) {
      whereClause.CustomerID = filter.customerId;
    }

    // Get sales data with items
    const sales = await this.prisma.sale.findMany({
      where: whereClause,
      include: {
        SaleItems: true,
        Customer: { select: { ID: true, Name: true } },
      },
      orderBy: { Date: 'asc' },
    });

    // Calculate summary
    const totalSales = sales.reduce((sum, s) => sum + Number(s.Total), 0);
    const totalItems = sales.reduce((sum, s) => sum + s.SaleItems.reduce((is, i) => is + Number(i.Quantity), 0), 0);

    // Group by date
    const byDateMap = new Map<string, { totalSales: number; transactions: number; items: number }>();
    for (const sale of sales) {
      const dateKey = sale.Date.toISOString().split('T')[0];
      const existing = byDateMap.get(dateKey) || { totalSales: 0, transactions: 0, items: 0 };
      existing.totalSales += Number(sale.Total);
      existing.transactions += 1;
      existing.items += sale.SaleItems.reduce((sum, i) => sum + Number(i.Quantity), 0);
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
      const existing = byCustomerMap.get(sale.CustomerID) || {
        name: sale.Customer.Name,
        totalSales: 0,
        transactions: 0,
      };
      existing.totalSales += Number(sale.Total);
      existing.transactions += 1;
      byCustomerMap.set(sale.CustomerID, existing);
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
      for (const item of sale.SaleItems) {
        const existing = byProductMap.get(item.ProductID) || {
          name: '',
          quantity: 0,
          totalSales: 0,
        };
        existing.name = item.ProductID.toString();
        existing.quantity += Number(item.Quantity);
        existing.totalSales += Number(item.Subtotal);
        byProductMap.set(item.ProductID, existing);
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

    const paidStatusIds = await this.getPaidStatusIds();

    const whereClause: any = {
      PaymentStatusID: { in: paidStatusIds },
    };

    if (filter.startDate) {
      whereClause.Date = { ...whereClause.Date, gte: new Date(filter.startDate) };
    }
    if (filter.endDate) {
      whereClause.Date = { ...whereClause.Date, lte: new Date(filter.endDate + 'T23:59:59') };
    }
    if (filter.supplierId) {
      whereClause.SupplierID = filter.supplierId;
    }

    const purchases = await this.prisma.purchase.findMany({
      where: whereClause,
      include: {
        PurchaseItems: true,
        Supplier: { select: { ID: true, Name: true } },
      },
      orderBy: { Date: 'asc' },
    });

    const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.Total), 0);
    const totalItems = purchases.reduce((sum, p) => sum + p.PurchaseItems.reduce((is, i) => is + Number(i.Quantity), 0), 0);

    // Group by date
    const byDateMap = new Map<string, { totalPurchases: number; transactions: number; items: number }>();
    for (const purchase of purchases) {
      const dateKey = purchase.Date.toISOString().split('T')[0];
      const existing = byDateMap.get(dateKey) || { totalPurchases: 0, transactions: 0, items: 0 };
      existing.totalPurchases += Number(purchase.Total);
      existing.transactions += 1;
      existing.items += purchase.PurchaseItems.reduce((sum, i) => sum + Number(i.Quantity), 0);
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
      const existing = bySupplierMap.get(purchase.SupplierID) || {
        name: purchase.Supplier.Name,
        totalPurchases: 0,
        transactions: 0,
      };
      existing.totalPurchases += Number(purchase.Total);
      existing.transactions += 1;
      bySupplierMap.set(purchase.SupplierID, existing);
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
      for (const item of purchase.PurchaseItems) {
        const existing = byProductMap.get(item.ProductID) || {
          name: '',
          quantity: 0,
          totalPurchases: 0,
        };
        existing.quantity += Number(item.Quantity);
        existing.totalPurchases += Number(item.Subtotal);
        byProductMap.set(item.ProductID, existing);
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

    const whereClause: any = { IsActive: true };
    if (filter.categoryId) {
      whereClause.CategoryID = filter.categoryId;
    }
    if (filter.warehouseId) {
      whereClause.WarehouseID = filter.warehouseId;
    }

    const products = await this.prisma.product.findMany({
      where: whereClause,
      include: {
        Category: { select: { Name: true } },
        Warehouse: { select: { Name: true } },
        ProductStocks: filter.warehouseId ? undefined : true,
      },
    });

    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const items = products.map((product) => {
      const quantity = filter.warehouseId
        ? Number(product.Stock)
        : product.ProductStocks?.reduce((sum, ps) => sum + Number(ps.Quantity), 0) || 0;
      const stockValue = quantity * Number(product.PurchasePrice);
      const isLowStock = quantity > 0 && quantity <= Number(product.MinimumStock);
      const isOutOfStock = quantity <= 0;

      if (isLowStock) lowStockCount++;
      if (isOutOfStock) outOfStockCount++;
      totalValue += stockValue;

      return {
        productId: product.ID,
        productCode: product.Code,
        productName: product.Name,
        categoryName: product.Category?.Name,
        warehouseName: product.Warehouse?.Name,
        quantity,
        minStock: Number(product.MinimumStock),
        purchasePrice: Number(product.PurchasePrice),
        sellPrice: Number(product.SellingPrice),
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

  // ─── Cash Report ───────────────────────────────────────────────────────────

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
      where: dateFilter ? { Date: dateFilter } : undefined,
      orderBy: { Date: 'asc' },
      select: { Date: true, Description: true, Amount: true, ReferenceID: true },
    });

    // Get cash out
    const cashOuts = await this.prisma.cashOut.findMany({
      where: dateFilter ? { Date: dateFilter } : undefined,
      orderBy: { Date: 'asc' },
      select: { Date: true, Description: true, Amount: true, ReferenceID: true },
    });

    // Get cash method ID
    const cashMethod = await this.prisma.paymentMethod.findUnique({ where: { Code: 'CASH' } });

    // Get sale payments (cash payments from sales)
    const salePayments = await this.prisma.salePayment.findMany({
      where: {
        Date: dateFilter,
        MethodID: cashMethod?.ID,
      },
      orderBy: { Date: 'asc' },
      select: { Date: true, Amount: true, MethodID: true },
    });

    // Get purchase payments (cash payments for purchases)
    const purchasePayments = await this.prisma.purchasePayment.findMany({
      where: {
        Date: dateFilter,
        MethodID: cashMethod?.ID,
      },
      orderBy: { Date: 'asc' },
      select: { Date: true, Amount: true, MethodID: true },
    });

    const totalCashIn = cashIns.reduce((sum, c) => sum + Number(c.Amount), 0);
    const totalCashOut = cashOuts.reduce((sum, c) => sum + Number(c.Amount), 0);
    const totalSalePayments = salePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
    const totalPurchasePayments = purchasePayments.reduce((sum, p) => sum + Number(p.Amount), 0);

    const result: CashReportResponseDto = {
      summary: {
        beginningBalance: 0, // Would need historical calculation
        totalCashIn: totalCashIn + totalSalePayments,
        totalCashOut: totalCashOut + totalPurchasePayments,
        endingBalance: (totalCashIn + totalSalePayments) - (totalCashOut + totalPurchasePayments),
      },
      cashIns: cashIns.map((c) => ({
        date: c.Date.toISOString().split('T')[0],
        description: c.Description || '',
        amount: Number(c.Amount),
        reference: c.ReferenceID?.toString() || undefined,
      })),
      cashOuts: cashOuts.map((c) => ({
        date: c.Date.toISOString().split('T')[0],
        description: c.Description || '',
        amount: Number(c.Amount),
        reference: c.ReferenceID?.toString() || undefined,
      })),
      salePayments: salePayments.map((p) => ({
        date: p.Date.toISOString().split('T')[0],
        amount: Number(p.Amount),
        paymentMethod: cashMethod?.Name || 'CASH',
      })),
      purchasePayments: purchasePayments.map((p) => ({
        date: p.Date.toISOString().split('T')[0],
        amount: Number(p.Amount),
        paymentMethod: cashMethod?.Name || 'CASH',
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

    const paidStatusIds = await this.getPaidStatusIds();

    const whereClause: any = {};
    if (filter.startDate) {
      whereClause.Date = { ...whereClause.Date, gte: new Date(filter.startDate) };
    }
    if (filter.endDate) {
      whereClause.Date = { ...whereClause.Date, lte: new Date(filter.endDate + 'T23:59:59') };
    }

    // Get sales (revenue)
    const sales = await this.prisma.sale.findMany({
      where: { ...whereClause, PaymentStatusID: { in: paidStatusIds } },
      select: { Date: true, Total: true },
    });

    // Get purchases (cost of goods sold)
    const purchases = await this.prisma.purchase.findMany({
      where: { ...whereClause, PaymentStatusID: { in: paidStatusIds } },
      select: { Date: true, Total: true },
    });

    // Get expenses (cash outs)
    const expenses = await this.prisma.cashOut.findMany({
      where: whereClause.Date ? { Date: whereClause.Date } : undefined,
      include: { Account: { select: { Name: true } } },
    });

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.Total), 0);
    const totalCOGS = purchases.reduce((sum, p) => sum + Number(p.Total), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.Amount), 0);

    // Group revenue by date
    const revenueByDate = new Map<string, number>();
    for (const sale of sales) {
      const dateKey = sale.Date.toISOString().split('T')[0];
      revenueByDate.set(dateKey, (revenueByDate.get(dateKey) || 0) + Number(sale.Total));
    }

    // Group COGS by date
    const cogsByDate = new Map<string, number>();
    for (const purchase of purchases) {
      const dateKey = purchase.Date.toISOString().split('T')[0];
      cogsByDate.set(dateKey, (cogsByDate.get(dateKey) || 0) + Number(purchase.Total));
    }

    // Group expenses by account
    const expensesByAccount = new Map<string, number>();
    for (const expense of expenses) {
      const accountName = expense.Account.Name;
      expensesByAccount.set(accountName, (expensesByAccount.get(accountName) || 0) + Number(expense.Amount));
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

    const paidStatusIds = await this.getPaidStatusIds();

    const whereClause: any = {};
    if (filter.startDate) {
      whereClause.Date = { ...whereClause.Date, gte: new Date(filter.startDate) };
    }
    if (filter.endDate) {
      whereClause.Date = { ...whereClause.Date, lte: new Date(filter.endDate + 'T23:59:59') };
    }

    // Sales revenue
    const sales = await this.prisma.sale.findMany({
      where: { ...whereClause, PaymentStatusID: { in: paidStatusIds } },
      select: { Subtotal: true, TaxAmount: true, DiscountAmount: true },
    });

    // Purchase costs
    const purchases = await this.prisma.purchase.findMany({
      where: { ...whereClause, PaymentStatusID: { in: paidStatusIds } },
      select: { Subtotal: true },
    });

    // Returns reduce revenue
    const saleReturns = await this.prisma.saleReturn.findMany({
      where: whereClause.Date ? { Date: whereClause.Date } : undefined,
      select: { TotalReturn: true },
    });

    const purchaseReturns = await this.prisma.purchaseReturn.findMany({
      where: whereClause.Date ? { Date: whereClause.Date } : undefined,
      select: { TotalReturn: true },
    });

    // Expenses
    const expenses = await this.prisma.cashOut.findMany({
      where: whereClause.Date ? { Date: whereClause.Date } : undefined,
      include: { Account: { select: { Name: true } } },
    });

    const totalSales = sales.reduce((sum, s) => sum + Number(s.Subtotal), 0);
    const totalSalesTax = sales.reduce((sum, s) => sum + Number(s.TaxAmount), 0);
    const totalSalesDiscount = sales.reduce((sum, s) => sum + Number(s.DiscountAmount), 0);
    const totalSaleReturns = saleReturns.reduce((sum, r) => sum + Number(r.TotalReturn), 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.Subtotal), 0);
    const totalPurchaseReturns = purchaseReturns.reduce((sum, r) => sum + Number(r.TotalReturn), 0);
    const totalExpensesAmount = expenses.reduce((sum, e) => sum + Number(e.Amount), 0);

    const grossProfit = (totalSales - totalSaleReturns) - (totalPurchases - totalPurchaseReturns);
    const netProfit = grossProfit - totalExpensesAmount;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    // Group expenses by account
    const expensesByAccount = new Map<string, number>();
    for (const expense of expenses) {
      const accountName = expense.Account.Name;
      expensesByAccount.set(accountName, (expensesByAccount.get(accountName) || 0) + Number(expense.Amount));
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

    const pendingStatusIds = await this.getPendingStatusIds();

    const purchases = await this.prisma.purchase.findMany({
      where: {
        PaymentStatusID: { in: pendingStatusIds },
      },
      include: {
        Supplier: { select: { ID: true, Name: true } },
        PurchasePayments: true,
      },
      orderBy: { Date: 'asc' },
    });

    const debts = purchases.map((purchase) => {
      const totalPaid = purchase.PurchasePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
      const remaining = Number(purchase.Total) - totalPaid;

      return {
        purchaseId: purchase.ID,
        code: purchase.Code,
        supplierName: purchase.Supplier.Name,
        date: purchase.Date.toISOString().split('T')[0],
        total: Number(purchase.Total),
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

    const pendingStatusIds = await this.getPendingStatusIds();

    const sales = await this.prisma.sale.findMany({
      where: {
        PaymentStatusID: { in: pendingStatusIds },
      },
      include: {
        Customer: { select: { ID: true, Name: true } },
        SalePayments: true,
      },
      orderBy: { Date: 'asc' },
    });

    const receivables = sales.map((sale) => {
      const totalPaid = sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
      const remaining = Number(sale.Total) - totalPaid;

      return {
        saleId: sale.ID,
        code: sale.Code,
        customerName: sale.Customer.Name,
        date: sale.Date.toISOString().split('T')[0],
        total: Number(sale.Total),
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
