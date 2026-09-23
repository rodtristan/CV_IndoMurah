import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateCashFlowCategoryDto,
  UpdateCashFlowCategoryDto,
  CreateCashFlowTransactionDto,
  UpdateCashFlowTransactionDto,
  CashFlowFilterDto,
  CashFlowReportDto,
  CashFlowSummaryDto,
  CashFlowProjectionDto,
} from './Cash-Flow.dto';

@Injectable()
export class CashFlowService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH FLOW CATEGORY MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Cash Flow Category
   * Flow: Admin membuat kategori arus kas (e.g., Penjualan, Pembelian, Beban Operasional)
   */
  async createCashFlowCategory(dto: CreateCashFlowCategoryDto, UserId: string) {
    // Check for duplicate Name
    const existing = await this.prisma.cashFlowCategory.findFirst({
      where: { Name: dto.Name },
    });

    if (existing) {
      throw new BadRequestException(`Category with Name '${dto.Name}' already exists`);
    }

    const Category = await this.prisma.cashFlowCategory.create({
      data: {
        Name: dto.Name,
        Type: dto.Type,
        Description: dto.Description,
        Color: dto.Color,
        IsActive: true,
      },
    });

    return {
      success: true,
      Category: this.formatCategory(Category),
    };
  }

  /**
   * Get Cash Flow Category by ID
   */
  async getCashFlowCategory(CategoryId: number) {
    const Category = await this.prisma.cashFlowCategory.findUnique({
      where: { ID: CategoryId },
      include: { _count: { select: { Transactions: true } } },
    });

    if (!Category) {
      throw new NotFoundException('Cash Flow Category not found');
    }

    return {
      ...this.formatCategory(Category),
      transactionCount: Category._count.Transactions,
    };
  }

  /**
   * List Cash Flow Categories
   */
  async listCashFlowCategories(IsActive?: boolean) {
    const where: any = {};
    if (IsActive !== undefined) {
      where.IsActive = IsActive;
    }

    const Categories = await this.prisma.cashFlowCategory.findMany({
      where,
      include: {
        _count: { select: { Transactions: true } },
      },
      orderBy: { Name: 'asc' },
    });

    return Categories.map((c) => ({
      ...this.formatCategory(c),
      transactionCount: c._count.Transactions,
    }));
  }

  /**
   * Update Cash Flow Category
   */
  async updateCashFlowCategory(CategoryId: number, dto: UpdateCashFlowCategoryDto) {
    const Category = await this.prisma.cashFlowCategory.findUnique({
      where: { ID: CategoryId },
    });

    if (!Category) {
      throw new NotFoundException('Cash Flow Category not found');
    }

    const updated = await this.prisma.cashFlowCategory.update({
      where: { ID: CategoryId },
      data: {
        Name: dto.Name,
        Description: dto.Description,
        Color: dto.Color,
        IsActive: dto.IsActive,
      },
    });

    return {
      success: true,
      Category: this.formatCategory(updated),
    };
  }

  /**
   * Delete Cash Flow Category
   */
  async deleteCashFlowCategory(CategoryId: number) {
    const Category = await this.prisma.cashFlowCategory.findUnique({
      where: { ID: CategoryId },
      include: { _count: { select: { Transactions: true } } },
    });

    if (!Category) {
      throw new NotFoundException('Cash Flow Category not found');
    }

    if (Category._count.Transactions > 0) {
      throw new BadRequestException('Cannot delete Category with existing transactions');
    }

    await this.prisma.cashFlowCategory.delete({
      where: { ID: CategoryId },
    });

    return {
      success: true,
      message: 'Cash Flow Category deleted successfully',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH FLOW TRANSACTION MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Cash Flow transaction
   * Flow: Admin/Staf keuangan input transaksi arus kas
   */
  async createCashFlowTransaction(dto: CreateCashFlowTransactionDto, UserId: string) {
    // Validate Category
    const Category = await this.prisma.cashFlowCategory.findUnique({
      where: { ID: dto.CategoryId },
    });

    if (!Category) {
      throw new NotFoundException('Cash Flow Category not found');
    }

    if (!Category.IsActive) {
      throw new BadRequestException('Cash Flow Category is not Active');
    }

    // Validate Account
    const account = await this.prisma.account.findUnique({
      where: { ID: dto.AccountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Generate transaction Number
    const Code = await this.generateTransactionCode();

    // Create transaction
    const transaction = await this.prisma.cashFlowTransaction.create({
      data: {
        Code: Code,
        CashFlowCategoryID: dto.CategoryId,
        AccountID: dto.AccountId,
        Amount: new Prisma.Decimal(dto.Amount),
        Date: new Date(dto.TransactionDate),
        Description: dto.Description,
        ReferenceNumber: dto.ReferenceNumber,
        SaleId: dto.SaleId,
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      transaction: {
        ID: transaction.ID,
        Code: transaction.Code,
        Date: transaction.Date,
        CategoryId: transaction.CashFlowCategoryID,
        Category: Category.Name,
        CategoryType: Category.Type,
        AccountId: transaction.AccountID,
        Account: account.Name,
        Amount: dto.Amount,
        referenceNumber: transaction.ReferenceNumber,
        Description: transaction.Description,
      },
    };
  }

  /**
   * Get Cash Flow transaction by ID
   */
  async getCashFlowTransaction(transactionId: number) {
    const transaction = await this.prisma.cashFlowTransaction.findUnique({
      where: { ID: transactionId },
      include: {
        CashFlowCategory: true,
        Account: true,
        Creator: true,
        Sale: { select: { ID: true, Code: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Cash Flow transaction not found');
    }

    return {
      ID: transaction.ID,
      Code: transaction.Code,
      Date: transaction.Date,
      CategoryId: transaction.CashFlowCategoryID,
      Category: transaction.CashFlowCategory.Name,
      CategoryType: transaction.CashFlowCategory.Type,
      AccountId: transaction.AccountID,
      Account: transaction.Account.Name,
      AccountCode: transaction.Account.Code,
      Amount: number(transaction.Amount),
      referenceNumber: transaction.ReferenceNumber,
      Description: transaction.Description,
      linkedSale: transaction.Sale?.Code,
      createdBy: (transaction.Creator as any)?.Name || 'System',
      createdAt: transaction.CreatedAt,
    };
  }

  /**
   * List Cash Flow transactions
   */
  async listCashFlowTransactions(dto: CashFlowFilterDto) {
    const where: any = {};

    if (dto.StartDate || dto.EndDate) {
      where.Date = {};
      if (dto.StartDate) {
        where.Date.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.Date.lte = new Date(dto.EndDate);
      }
    }

    if (dto.CategoryId) {
      where.CashFlowCategoryID = dto.CategoryId;
    }

    if (dto.AccountId) {
      where.AccountID = dto.AccountId;
    }

    if (dto.Type) {
      where.CashFlowCategory = { Type: dto.Type };
    }

    if (dto.Search) {
      where.OR = [
        { Code: { contains: dto.Search, mode: 'insensitive' } },
        { ReferenceNumber: { contains: dto.Search, mode: 'insensitive' } },
        { Description: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    const transactions = await this.prisma.cashFlowTransaction.findMany({
      where,
      include: {
        CashFlowCategory: true,
        Account: true,
      },
      orderBy: { Date: 'desc' },
    });

    return transactions.map((t) => ({
      ID: t.ID,
      Code: t.Code,
      Date: t.Date,
      Category: t.CashFlowCategory.Name,
      CategoryType: t.CashFlowCategory.Type,
      CategoryColor: t.CashFlowCategory.Color,
      account: t.Account.Name,
      Amount: number(t.Amount),
      referenceNumber: t.ReferenceNumber,
      Description: t.Description,
    }));
  }

  /**
   * Update Cash Flow transaction
   */
  async updateCashFlowTransaction(transactionId: number, dto: UpdateCashFlowTransactionDto) {
    const transaction = await this.prisma.cashFlowTransaction.findUnique({
      where: { ID: transactionId },
      include: { CashFlowCategory: true, Account: true },
    });

    if (!transaction) {
      throw new NotFoundException('Cash Flow transaction not found');
    }

    const updated = await this.prisma.cashFlowTransaction.update({
      where: { ID: transactionId },
      data: {
        ReferenceNumber: dto.ReferenceNumber,
        Description: dto.Description,
      },
    });

    return {
      success: true,
      transaction: {
        ID: updated.ID,
        Code: updated.Code,
        referenceNumber: updated.ReferenceNumber,
        Description: updated.Description,
        Category: transaction.CashFlowCategory.Name,
        Account: transaction.Account.Name,
      },
    };
  }

  /**
   * Delete Cash Flow transaction
   */
  async deleteCashFlowTransaction(transactionId: number) {
    const transaction = await this.prisma.cashFlowTransaction.findUnique({
      where: { ID: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Cash Flow transaction not found');
    }

    await this.prisma.cashFlowTransaction.delete({
      where: { ID: transactionId },
    });

    return {
      success: true,
      message: 'Cash Flow transaction deleted successfully',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH FLOW REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get Cash Flow Summary
   * Flow: Owner/Staf keuangan ingin Summary arus kas
   */
  async getCashFlowSummary(dto: CashFlowSummaryDto) {
    const where: any = {};

    if (dto.StartDate || dto.EndDate) {
      where.Date = {};
      if (dto.StartDate) {
        where.Date.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.Date.lte = new Date(dto.EndDate);
      }
    }

    if (dto.AccountId) {
      where.AccountID = dto.AccountId;
    }

    const transactions = await this.prisma.cashFlowTransaction.findMany({
      where,
      include: {
        CashFlowCategory: true,
        Account: true,
      },
    });

    let TotalInFlow = 0;
    let TotalOutFlow = 0;
    const byCategory: Record<string, any> = {};

    for (const t of transactions) {
      const Amount = Number(t.Amount);

      if (t.CashFlowCategory.Type === 'INFLOW') {
        TotalInFlow += Amount;
      } else {
        TotalOutFlow += Amount;
      }

      const CategoryName = t.CashFlowCategory.Name;
      if (!byCategory[CategoryName]) {
        byCategory[CategoryName] = {
          CategoryId: t.CashFlowCategoryID,
          CategoryName,
          CategoryType: t.CashFlowCategory.Type,
          color: t.CashFlowCategory.Color,
          Count: 0,
          Total: 0,
        };
      }
      byCategory[CategoryName].Count++;
      byCategory[CategoryName].Total += Amount;
    }

    // Get account Balances
    const Accounts = await this.prisma.account.findMany({
      where: dto.AccountId ? { ID: dto.AccountId } : {},
      orderBy: { Name: 'asc' },
    });

    const accountBalances = Accounts.map((a) => ({
      AccountId: a.ID,
      AccountName: a.Name,
      AccountCode: a.Code,
    }));

    return {
      period: { startDate: dto.StartDate, endDate: dto.EndDate },
      Summary: {
        TotalInFlow,
        TotalOutFlow,
        netCashFlow: TotalInFlow - TotalOutFlow,
        transactionCount: transactions.length,
      },
      byCategory: Object.values(byCategory),
      accountBalances,
    };
  }

  /**
   * Get Cash Flow Report
   */
  async getCashFlowReport(dto: CashFlowReportDto) {
    const where: any = {};

    if (dto.StartDate || dto.EndDate) {
      where.Date = {};
      if (dto.StartDate) {
        where.Date.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.Date.lte = new Date(dto.EndDate);
      }
    }

    if (dto.AccountId) {
      where.AccountID = dto.AccountId;
    }

    const transactions = await this.prisma.cashFlowTransaction.findMany({
      where,
      include: {
        CashFlowCategory: true,
        Account: true,
      },
      orderBy: { Date: 'desc' },
    });

    let TotalInFlow = 0;
    let TotalOutFlow = 0;
    const byDate: Record<string, any> = {};
    const byCategory: Record<string, any> = {};

    for (const t of transactions) {
      const Amount = Number(t.Amount);
      const DateKey = new Date(t.Date).toISOString().split('T')[0];
      const CategoryName = t.CashFlowCategory.Name;

      if (t.CashFlowCategory.Type === 'INFLOW') {
        TotalInFlow += Amount;
      } else {
        TotalOutFlow += Amount;
      }

      // Group by Date
      if (!byDate[DateKey]) {
        byDate[DateKey] = {
          Date: DateKey,
          inFlow: 0,
          outFlow: 0,
          net: 0,
        };
      }
      if (t.CashFlowCategory.Type === 'INFLOW') {
        byDate[DateKey].inFlow += Amount;
      } else {
        byDate[DateKey].outFlow += Amount;
      }
      byDate[DateKey].net = byDate[DateKey].inFlow - byDate[DateKey].outFlow;

      // Group by Category
      if (!byCategory[CategoryName]) {
        byCategory[CategoryName] = {
          CategoryId: t.CashFlowCategoryID,
          CategoryName,
          Type: t.CashFlowCategory.Type,
          color: t.CashFlowCategory.Color,
          Total: 0,
          Count: 0,
        };
      }
      byCategory[CategoryName].Total += Amount;
      byCategory[CategoryName].Count++;
    }

    return {
      period: { startDate: dto.StartDate, endDate: dto.EndDate },
      GroupBy: dto.GroupBy || 'day',
      Summary: {
        TotalInFlow,
        TotalOutFlow,
        netCashFlow: TotalInFlow - TotalOutFlow,
        transactionCount: transactions.length,
      },
      byDate: Object.values(byDate).sort((a: any, b: any) => a.Date.localeCompare(b.Date)),
      byCategory: Object.values(byCategory).sort((a: any, b: any) => b.Total - a.Total),
    };
  }

  /**
   * Get Cash Flow projection
   */
  async getCashFlowProjection(dto: CashFlowProjectionDto) {
    const now = new Date();
    const startDate = dto.StartDate ? new Date(dto.StartDate) : now;
    const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date(now.setMonth(now.getMonth() + 1));

    // Get transactions in projection period
    const transactions = await this.prisma.cashFlowTransaction.findMany({
      where: {
        Date: {
          gte: startDate,
          lte: endDate,
        },
        ...(dto.AccountId ? { AccountID: dto.AccountId } : {}),
      },
      include: {
        CashFlowCategory: true,
      },
    });

    // Calculate monthly averages
    const monthlyTotals: Record<string, { inFlow: number; outFlow: number }> = {};

    for (const t of transactions) {
      const monthKey = new Date(t.Date).toISOString().substring(0, 7);
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { inFlow: 0, outFlow: 0 };
      }
      if (t.CashFlowCategory.Type === 'INFLOW') {
        monthlyTotals[monthKey].inFlow += Number(t.Amount);
      } else {
        monthlyTotals[monthKey].outFlow += Number(t.Amount);
      }
    }

    // Calculate projections
    const avgInFlow = Object.values(monthlyTotals).reduce((sum, m) => sum + m.inFlow, 0) /
      Math.max(Object.keys(monthlyTotals).length, 1);
    const avgOutFlow = Object.values(monthlyTotals).reduce((sum, m) => sum + m.outFlow, 0) /
      Math.max(Object.keys(monthlyTotals).length, 1);

    // Get current Balance (simplified - would be calculated from journal entries in production)
    const currentBalance = 0;

    // Generate projection for each month
    const projections: any[] = [];
    let runningBalance = currentBalance;
    const months = Math.ceil((endDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000));

    for (let i = 0; i < months; i++) {
      const monthDate = new Date(startDate);
      monthDate.setMonth(monthDate.getMonth() + i);
      const monthKey = monthDate.toISOString().substring(0, 7);

      const actual = monthlyTotals[monthKey];
      const projectedInFlow = avgInFlow;
      const projectedOutFlow = avgOutFlow;
      const netFlow = projectedInFlow - projectedOutFlow;
      runningBalance += netFlow;

      projections.push({
        month: monthKey,
        actual: actual ? {
          inFlow: actual.inFlow,
          outFlow: actual.outFlow,
          net: actual.inFlow - actual.outFlow,
        } : null,
        projected: {
          inFlow: projectedInFlow,
          outFlow: projectedOutFlow,
          net: netFlow,
        },
        runningBalance,
      });
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      currentBalance,
      averages: {
        monthlyInFlow: avgInFlow,
        monthlyOutFlow: avgOutFlow,
        monthlyNet: avgInFlow - avgOutFlow,
      },
      projections,
    };
  }

  /**
   * Get Cash Flow by acCount
   */
  async getCashFlowByAccount(accountId: number, startDate?: string, endDate?: string) {
    const where: any = { AccountID: accountId };

    if (startDate || endDate) {
      where.Date = {};
      if (startDate) {
        where.Date.gte = new Date(startDate);
      }
      if (endDate) {
        where.Date.lte = new Date(endDate);
      }
    }

    const transactions = await this.prisma.cashFlowTransaction.findMany({
      where,
      include: {
        CashFlowCategory: true,
      },
      orderBy: { Date: 'desc' },
    });

    const accountInfo = await this.prisma.account.findUnique({
      where: { ID: accountId },
    });

    let TotalInFlow = 0;
    let TotalOutFlow = 0;
    const byMonth: Record<string, any> = {};

    for (const t of transactions) {
      const Amount = Number(t.Amount);
      const monthKey = new Date(t.Date).toISOString().substring(0, 7);

      if (t.CashFlowCategory.Type === 'INFLOW') {
        TotalInFlow += Amount;
      } else {
        TotalOutFlow += Amount;
      }

      if (!byMonth[monthKey]) {
        byMonth[monthKey] = {
          month: monthKey,
          inFlow: 0,
          outFlow: 0,
          net: 0,
          transactions: 0,
        };
      }
      if (t.CashFlowCategory.Type === 'INFLOW') {
        byMonth[monthKey].inFlow += Amount;
      } else {
        byMonth[monthKey].outFlow += Amount;
      }
      byMonth[monthKey].net = byMonth[monthKey].inFlow - byMonth[monthKey].outFlow;
      byMonth[monthKey].transactions++;
    }

    return {
      AccountId: accountId,
      AccountName: accountInfo?.Name,
      AccountCode: accountInfo?.Code,
      period: { startDate, endDate },
      Summary: {
        TotalInFlow,
        TotalOutFlow,
        netCashFlow: TotalInFlow - TotalOutFlow,
        transactionCount: transactions.length,
      },
      byMonth: Object.values(byMonth).sort((a: any, b: any) => a.month.localeCompare(b.month)),
      transactions: transactions.map((t) => ({
        ID: t.ID,
        Code: t.Code,
        Date: t.Date,
        Category: t.CashFlowCategory.Name,
        CategoryType: t.CashFlowCategory.Type,
        Amount: number(t.Amount),
        Description: t.Description,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private formatCategory(Category: any) {
    return {
      ID: Category.ID,
      Name: Category.Name,
      Type: Category.Type,
      Description: Category.Description,
      color: Category.Color,
      IsActive: Category.IsActive,
      createdAt: Category.CreatedAt,
    };
  }

  private async generateTransactionCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `CF-${year}${month}`;

    const lastTransaction = await this.prisma.cashFlowTransaction.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastTransaction) {
      const lastSeq = parseInt(lastTransaction.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
