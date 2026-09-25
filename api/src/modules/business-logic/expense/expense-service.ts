import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { resolveDateRange } from '../shared/date-range';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateExpenseDto,
  BulkCreateExpenseDto,
  ApproveExpenseDto,
  ExpenseFilterDto,
  CreateExpenseCategoryDto,
} from './expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // EXPENSE CATEGORY MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create expense Category
   */
  async createCategory(dto: CreateExpenseCategoryDto) {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException('Category Code already exists');
    }

    const Category = await this.prisma.expenseCategory.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Description: dto.Description,
      },
    });

    return {
      success: true,
      Category: {
        ID: Category.ID,
        Code: Category.Code,
        Name: Category.Name,
        Description: Category.Description,
      },
    };
  }

  /**
   * List expense Categories
   */
  async listCategories() {
    const Categories = await this.prisma.expenseCategory.findMany({
      where: { IsActive: true },
      orderBy: { Name: 'asc' },
    });

    return Categories.map((c) => ({
      ID: c.ID,
      Code: c.Code,
      Name: c.Name,
      Description: c.Description,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EXPENSE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create expense
   * Flow: Karyawan/administrasi catat pengeluaran
   */
  async createExpense(dto: CreateExpenseDto, UserId: string) {
    // Validate Category
    const Category = await this.prisma.expenseCategory.findUnique({
      where: { ID: dto.CategoryId },
    });

    if (!Category) {
      throw new NotFoundException('Expense Category not found');
    }

    // generate expense Code
    const Code = await this.generateExpenseCode();

    const expense = await this.prisma.expense.create({
      data: {
        Code: Code,
        Date: new Date(dto.Date),
        ExpenseCategoryID: dto.CategoryId,
        Amount: new Prisma.Decimal(dto.Amount),
        Description: dto.Description,
        ReferenceNumber: dto.ReferenceNumber,
        Notes: dto.Notes,
        IsApproved: false,
      },
      include: {
        ExpenseCategory: true,
      },
    });

    return {
      success: true,
      expense: {
        ID: expense.ID,
        Code: expense.Code,
        Date: expense.Date,
        Category: expense.ExpenseCategory.Name,
        Amount: number(expense.Amount),
        Description: expense.Description,
        referenceNumber: expense.ReferenceNumber,
        IsApproved: expense.IsApproved,
      },
    };
  }

  /**
   * Bulk create expenses
   */
  async bulkCreateExpenses(dto: BulkCreateExpenseDto, UserId: string) {
    const Results: any[] = [];

    for (const expenseDto of dto.Expenses) {
      try {
        const Result = await this.createExpense(expenseDto, UserId);
        Results.push({ success: true, ...Result.expense });
      } catch (error) {
        Results.push({
          success: false,
          description: expenseDto.Description,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: true,
      Total: dto.Expenses.length,
      succeeded: Results.filter((r) => r.success).length,
      failed: Results.filter((r) => !r.success).length,
      Results,
    };
  }

  /**
   * Approve expense
   * Flow: Owner/Manager approve pengeluaran
   */
  async approveExpense(expenseId: number, dto: ApproveExpenseDto, UserId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { ID: expenseId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.IsApproved) {
      throw new BadRequestException('Expense already approved');
    }

    await this.prisma.expense.update({
      where: { ID: expenseId },
      data: {
        IsApproved: true,
        ApprovedByID: UserId,
        ApprovedAt: new Date(),
        Notes: dto.Notes || expense.Notes,
      },
    });

    return {
      success: true,
      expenseId,
      Code: expense.Code,
      Amount: number(expense.Amount),
      approvedBy: UserId,
    };
  }

  /**
   * Bulk approve expenses
   */
  async bulkApproveExpenses(expenseIds: number[], UserId: string) {
    const Results: any[] = [];

    for (const ID of expenseIds) {
      try {
        const expense = await this.prisma.expense.findUnique({
          where: { ID: ID },
        });

        if (!expense) {
          Results.push({ success: false, ID, error: 'Not found' });
          continue;
        }

        if (expense.IsApproved) {
          Results.push({ success: false, ID, error: 'Already approved' });
          continue;
        }

        await this.prisma.expense.update({
          where: { ID: ID },
          data: {
            IsApproved: true,
            ApprovedByID: UserId,
            ApprovedAt: new Date(),
          },
        });

        Results.push({ success: true, ID, Code: expense.Code });
      } catch (error) {
        Results.push({
          success: false,
          ID,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: true,
      Total: expenseIds.length,
      succeeded: Results.filter((r) => r.success).length,
      failed: Results.filter((r) => !r.success).length,
      Results,
    };
  }

  /**
   * List expenses
   */
  async listExpenses(dto: ExpenseFilterDto) {
    const where: any = {};

    if (dto.CategoryId) {
      where.ExpenseCategoryID = dto.CategoryId;
    }

    if (dto.ApprovedOnly) {
      where.IsApproved = true;
    }

    if (dto.PendingOnly) {
      where.IsApproved = false;
    }

    if (dto.StartDate || dto.EndDate) {
      where.Date = {};
      if (dto.StartDate) {
        where.Date.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.Date.lte = new Date(dto.EndDate);
      }
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      include: {
        ExpenseCategory: true,
        Approver: true,
      },
      orderBy: { Date: 'desc' },
    });

    return expenses.map((e) => ({
      ID: e.ID,
      Code: e.Code,
      Date: e.Date,
      Category: e.ExpenseCategory.Name,
      Amount: number(e.Amount),
      Description: e.Description,
      referenceNumber: e.ReferenceNumber,
      IsApproved: e.IsApproved,
      approvedBy: e.Approver?.Name || null,
      approvedAt: e.ApprovedAt,
      Notes: e.Notes,
    }));
  }

  /**
   * Get expense by ID
   */
  async getExpense(expenseId: number) {
    const expense = await this.prisma.expense.findUnique({
      where: { ID: expenseId },
      include: {
        ExpenseCategory: true,
        Approver: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return {
      ID: expense.ID,
      Code: expense.Code,
      Date: expense.Date,
      Category: expense.ExpenseCategory,
      Amount: number(expense.Amount),
      Description: expense.Description,
      referenceNumber: expense.ReferenceNumber,
      IsApproved: expense.IsApproved,
      approvedBy: expense.Approver,
      approvedAt: expense.ApprovedAt,
      Notes: expense.Notes,
    };
  }

  /**
   * Get expense Summary by Category
   */
  async getExpenseSummary(startDate?: string, endDate?: string) {
    const { start, end } = resolveDateRange(startDate, endDate);
    const where: any = {
      Date: {
        gte: start,
        lte: end,
      },
    };

    const expenses = await this.prisma.expense.findMany({
      where,
      include: { ExpenseCategory: true },
    });

    const byCategory: Record<string, any> = {};
    let TotalAmount = 0;
    let approvedAmount = 0;
    let pendingAmount = 0;

    for (const expense of expenses) {
      const CategoryName = expense.ExpenseCategory.Name;
      if (!byCategory[CategoryName]) {
        byCategory[CategoryName] = {
          Category: CategoryName,
          Count: 0,
          TotalAmount: 0,
          approvedAmount: 0,
          pendingAmount: 0,
        };
      }

      const Amount = Number(expense.Amount);
      byCategory[CategoryName].Count++;
      byCategory[CategoryName].TotalAmount += Amount;
      TotalAmount += Amount;

      if (expense.IsApproved) {
        byCategory[CategoryName].approvedAmount += Amount;
        approvedAmount += Amount;
      } else {
        byCategory[CategoryName].pendingAmount += Amount;
        pendingAmount += Amount;
      }
    }

    return {
      period: { startDate, endDate },
      Summary: {
        TotalCount: expenses.length,
        TotalAmount,
        approvedAmount,
        pendingAmount,
      },
      byCategory: Object.values(byCategory),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateExpenseCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `EXP-${year}${month}`;

    const lastExpense = await this.prisma.expense.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastExpense) {
      const lastSeq = parseInt(lastExpense.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
