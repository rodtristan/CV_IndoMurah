import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateSupplierDto,
  UpDateSupplierDto,
  SupplierFilterDto,
  SupplierStatementDto,
  AddSupplierDebtDto,
  PaymentSupplierDebtDto,
} from './Supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // SUPPLIER CRUD
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new Supplier
   */
  async createSupplier(dto: CreateSupplierDto, UserId: string) {
    const existing = await this.prisma.supplier.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException(`Supplier Code '${dto.Code}' already exists`);
    }

    const Supplier = await this.prisma.supplier.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        ContactPerson: dto.ContactPerson,
        Phone: dto.Phone,
        Email: dto.Email,
        Address: dto.Address,
        TotalDebt: new Prisma.Decimal(dto.TotalDebt || 0),
        Notes: dto.Notes,
        IsActive: true,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        Type: 'SUPPLIER_CREATED',
        Title: 'Supplier Created',
        Description: `New Supplier ${Supplier.Name} (${Supplier.Code}) created`,
        ReferenceType: 'SUPPLIER',
        ReferenceID: Supplier.ID,
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      Supplier: this.formatSupplier(Supplier),
    };
  }

  /**
   * UpDate Supplier
   */
  async updateSupplier(SupplierId: number, dto: UpDateSupplierDto, UserId: string) {
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: SupplierId },
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const updated = await this.prisma.supplier.update({
      where: { ID: SupplierId },
      data: {
        Name: dto.Name,
        ContactPerson: dto.ContactPerson,
        Phone: dto.Phone,
        Email: dto.Email,
        Address: dto.Address,
        Notes: dto.Notes,
        IsActive: dto.IsActive,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        Type: 'SUPPLIER_UPDATED',
        Title: 'Supplier UpDated',
        Description: `Supplier ${updated.Name} (${updated.Code}) updated`,
        ReferenceType: 'SUPPLIER',
        ReferenceID: updated.ID,
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      Supplier: this.formatSupplier(updated),
    };
  }

  /**
   * Get Supplier by ID
   */
  async getSupplier(SupplierId: number) {
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: SupplierId },
      include: {
        Purchases: {
          take: 5,
          orderBy: { Date: 'desc' },
        },
        PurchaseReturns: {
          take: 5,
          orderBy: { Date: 'desc' },
        },
      },
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return {
      ...this.formatSupplier(Supplier),
      TotalPurchases: Supplier.Purchases.length,
      TotalReturns: Supplier.PurchaseReturns.length,
    };
  }

  /**
   * List Suppliers
   */
  async listSuppliers(dto: SupplierFilterDto) {
    const where: any = {};

    if (dto.Search) {
      where.OR = [
        { Name: { contains: dto.Search, mode: 'insensitive' } },
        { Code: { contains: dto.Search, mode: 'insensitive' } },
        { Phone: { contains: dto.Search, mode: 'insensitive' } },
        { ContactPerson: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    if (dto.IsActive !== undefined) {
      where.IsActive = dto.IsActive;
    }

    if (dto.HasDebt) {
      where.TotalDebt = { gt: 0 };
    }

    const page = dto.Page || 1;
    const limit = dto.Limit || 20;
    const skip = (page - 1) * limit;

    const [Suppliers, Total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        include: {
          _count: {
            select: {
              Purchases: true,
              PurchaseOrders: true,
            },
          },
        },
        orderBy: { Name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data: Suppliers.map((s) => ({
        ...this.formatSupplier(s),
        PurchaseCount: s._count.Purchases,
        OrderCount: s._count.PurchaseOrders,
      })),
      pagination: {
        page,
        limit,
        Total,
        TotalPages: Math.ceil(Total / limit),
      },
    };
  }

  /**
   * Delete Supplier
   */
  async deleteSupplier(SupplierId: number, UserId: string) {
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: SupplierId },
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const PurchaseCount = await this.prisma.purchase.count({
      where: { SupplierID: SupplierId },
    });

    if (PurchaseCount > 0) {
      await this.prisma.supplier.update({
        where: { ID: SupplierId },
        data: { IsActive: false },
      });
    } else {
      await this.prisma.supplier.delete({
        where: { ID: SupplierId },
      });
    }

    return {
      success: true,
      message: PurchaseCount > 0 ? 'Supplier deactivated' : 'Supplier deleted',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUPPLIER DEBT MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Add debt to Supplier
   */
  async addDebt(dto: AddSupplierDebtDto, UserId: string) {
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: dto.SupplierId },
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const updated = await this.prisma.supplier.update({
      where: { ID: dto.SupplierId },
      data: {
        TotalDebt: { increment: new Prisma.Decimal(dto.Amount) },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        Type: 'SUPPLIER_DEBT_ADDED',
        Title: 'Supplier Debt Added',
        Description: `Added ${dto.Amount} to ${Supplier.Name}'s debt`,
        ReferenceType: dto.ReferenceType,
        ReferenceID: dto.ReferenceId,
        Amount: new Prisma.Decimal(dto.Amount),
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      SupplierId: dto.SupplierId,
      SupplierName: Supplier.Name,
      previousDebt: number(Supplier.TotalDebt),
      addedAmount: dto.Amount,
      newDebt: number(updated.TotalDebt),
    };
  }

  /**
   * Record Payment for Supplier debt
   */
  async paymentDebt(dto: PaymentSupplierDebtDto, UserId: string) {
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: dto.SupplierId },
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier not found');
    }

    if (Number(Supplier.TotalDebt) < dto.Amount) {
      throw new BadRequestException(
        `Payment exceeds debt. Available: ${Supplier.TotalDebt}, Payment: ${dto.Amount}`,
      );
    }

    const updated = await this.prisma.supplier.update({
      where: { ID: dto.SupplierId },
      data: {
        TotalDebt: { decrement: new Prisma.Decimal(dto.Amount) },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        Type: 'SUPPLIER_DEBT_PAID',
        Title: 'Supplier Debt Payment',
        Description: `${Supplier.Name} paid ${dto.Amount}`,
        ReferenceType: 'SUPPLIER_PAYMENT',
        Amount: new Prisma.Decimal(dto.Amount),
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      SupplierId: dto.SupplierId,
      SupplierName: Supplier.Name,
      previousDebt: number(Supplier.TotalDebt),
      PaymentAmount: dto.Amount,
      newDebt: number(updated.TotalDebt),
    };
  }

  /**
   * Get Supplier debt details
   */
  async getSupplierDebt(SupplierId: number) {
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: SupplierId },
      include: {
        Purchases: {
          where: {
            PaymentStatus: {
              Code: { in: ['PARTIAL', 'UNPAID'] },
            },
          },
          orderBy: { Date: 'desc' },
          include: {
            PurchasePayments: true,
          },
        },
      },
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const outstandingPurchases = Supplier.Purchases.map((p) => ({
      ID: p.ID,
      Code: p.Code,
      Date: p.Date,
      Total: number(p.Total),
      Paid: p.PurchasePayments.reduce((sum, pay) => sum + Number(pay.Amount), 0),
      outstanding: number(p.Total) - p.PurchasePayments.reduce((sum, pay) => sum + Number(pay.Amount), 0),
    }));

    return {
      Supplier: this.formatSupplier(Supplier),
      currentDebt: number(Supplier.TotalDebt),
      outstandingPurchases,
      TotalOutstanding: outstandingPurchases.reduce((sum, inv) => sum + inv.outstanding, 0),
    };
  }

  /**
   * Get Supplier statement
   */
  async getSupplierStatement(dto: SupplierStatementDto) {
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: dto.SupplierId },
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const startDate = new Date(dto.StartDate);
    const endDate = new Date(dto.EndDate);
    endDate.setHours(23, 59, 59, 999);

    const Purchases = await this.prisma.purchase.findMany({
      where: {
        SupplierID: dto.SupplierId,
        Date: { gte: startDate, lte: endDate },
      },
      orderBy: { Date: 'asc' },
      include: {
        PurchasePayments: true,
      },
    });

    const returns = await this.prisma.purchaseReturn.findMany({
      where: {
        SupplierID: dto.SupplierId,
        Date: { gte: startDate, lte: endDate },
      },
      orderBy: { Date: 'asc' },
    });

    const Deposits = await this.prisma.supplierDeposit.findMany({
      where: {
        SupplierID: dto.SupplierId,
        Date: { gte: startDate, lte: endDate },
      },
      orderBy: { Date: 'asc' },
    });

    const transactions = [
      ...Purchases.map((p) => ({
        Date: p.Date,
        Type: 'PURCHASE',
        reference: p.Code,
        Description: 'Pembelian',
        debit: number(p.Total),
        credit: p.PurchasePayments.reduce((sum, pay) => sum + Number(pay.Amount), 0),
      })),
      ...returns.map((r) => ({
        Date: r.Date,
        Type: 'RETURN',
        reference: r.Code,
        Description: 'Retur Pembelian',
        debit: 0,
        credit: number(r.TotalReturn),
      })),
      ...Deposits.map((d) => ({
        Date: d.Date,
        Type: 'PAYMENT',
        reference: d.Code,
        Description: 'Pembayaran Hutang',
        debit: 0,
        credit: number(d.Amount),
      })),
    ].sort((a, b) => a.Date.getTime() - b.Date.getTime());

    const TotalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
    const TotalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);

    return {
      Supplier: this.formatSupplier(Supplier),
      period: { startDate: dto.StartDate, endDate: dto.EndDate },
      openingBalance: number(Supplier.TotalDebt),
      transactions,
      closingBalance: number(Supplier.TotalDebt) + TotalDebit - TotalCredit,
      Summary: {
        TotalPurchases: TotalDebit,
        TotalPayments: TotalCredit,
        netChange: TotalDebit - TotalCredit,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUPPLIER ANALYTICS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get Supplier Summary statistics
   */
  async getSupplierSummary() {
    const [
      TotalSuppliers,
      ActiveSuppliers,
      SuppliersWithDebt,
    ] = await Promise.all([
      this.prisma.supplier.count(),
      this.prisma.supplier.count({ where: { IsActive: true } }),
      this.prisma.supplier.count({ where: { TotalDebt: { gt: 0 } } }),
    ]);

    const TotalDebt = await this.prisma.supplier.aggregate({
      where: { TotalDebt: { gt: 0 } },
      _sum: { TotalDebt: true },
    });

    return {
      TotalSuppliers,
      ActiveSuppliers,
      SuppliersWithDebt,
      TotalOutstandingDebt: number(TotalDebt._sum.TotalDebt || 0),
    };
  }

  /**
   * Get top Suppliers by Purchases
   */
  async getTopSuppliers(limit: number = 10) {
    const Suppliers = await this.prisma.supplier.findMany({
      include: {
        Purchases: {
          select: {
            Total: true,
          },
        },
      },
    });

    return Suppliers
      .map((s) => ({
        SupplierId: s.ID,
        SupplierCode: s.Code,
        SupplierName: s.Name,
        contactPerson: s.ContactPerson,
        TotalPurchases: s.Purchases.reduce((sum, p) => sum + Number(p.Total), 0),
        transactionCount: s.Purchases.length,
      }))
      .filter((s) => s.TotalPurchases > 0)
      .sort((a, b) => b.TotalPurchases - a.TotalPurchases)
      .slice(0, limit);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private formatSupplier(Supplier: any) {
    return {
      ID: Supplier.ID,
      Code: Supplier.Code,
      Name: Supplier.Name,
      contactPerson: Supplier.ContactPerson,
      phone: Supplier.Phone,
      email: Supplier.Email,
      address: Supplier.Address,
      TotalDebt: number(Supplier.TotalDebt),
      Notes: Supplier.Notes,
      IsActive: Supplier.IsActive,
      createdAt: Supplier.CreatedAt,
      updatedAt: Supplier.UpdatedAt,
    };
  }
}
