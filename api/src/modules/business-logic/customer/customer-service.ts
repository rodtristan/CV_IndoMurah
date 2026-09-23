import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerFilterDto,
  CustomerTopDto,
  CustomerSummaryDto,
  CustomerStatementDto,
  CreateCustomerGroupDto,
  UpdateCustomerGroupDto,
  AddReceivableDto,
  PaymentReceivableDto,
  AdjustPointsDto,
} from './Customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOMER CRUD
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new Customer
   * Flow: Admin buat pelanggan baru → sistem generate kode unik
   */
  async createCustomer(dto: CreateCustomerDto, UserId: string) {
    // Check if Code already exists
    const existing = await this.prisma.customer.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException(`Customer Code '${dto.Code}' already exists`);
    }

    // Verify Customer Group exists
    const Group = await this.prisma.customerGroup.findUnique({
      where: { ID: dto.CustomerGroupId },
    });

    if (!Group) {
      throw new NotFoundException(`Customer Group not found`);
    }

    const Customer = await this.prisma.customer.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Phone: dto.Phone,
        Email: dto.Email,
        Address: dto.Address,
        CustomerGroupID: dto.CustomerGroupId,
        PointBalance: dto.PointBalance || 0,
        TotalReceivable: new Prisma.Decimal(dto.TotalReceivable || 0),
        Notes: dto.Notes,
        IsActive: true,
      },
      include: {
        CustomerGroup: true,
      },
    });

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        Type: 'CUSTOMER_CREATED',
        Title: 'Customer Created',
        Description: `New Customer ${Customer.Name} (${Customer.Code}) created`,
        ReferenceType: 'CUSTOMER',
        ReferenceID: Customer.ID,
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      Customer: this.formatCustomer(Customer),
    };
  }

  /**
   * UpDate Customer
   * Flow: Admin edit data pelanggan → sistem update informasi
   */
  async updateCustomer(CustomerId: number, dto: UpdateCustomerDto, UserId: string) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    const updated = await this.prisma.customer.update({
      where: { ID: CustomerId },
      data: {
        Name: dto.Name,
        Phone: dto.Phone,
        Email: dto.Email,
        Address: dto.Address,
        CustomerGroupID: dto.CustomerGroupId,
        Notes: dto.Notes,
        IsActive: dto.IsActive,
      },
      include: {
        CustomerGroup: true,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        Type: 'CUSTOMER_UPDATED',
        Title: 'Customer UpDated',
        Description: `Customer ${updated.Name} (${updated.Code}) updated`,
        ReferenceType: 'CUSTOMER',
        ReferenceID: updated.ID,
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      Customer: this.formatCustomer(updated),
    };
  }

  /**
   * Get Customer by ID
   */
  async getCustomer(CustomerId: number) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: CustomerId },
      include: {
        CustomerGroup: true,
        Sales: {
          take: 5,
          orderBy: { Date: 'desc' },
          include: {
            SaleItems: true,
          },
        },
        CustomerDeposits: {
          take: 5,
          orderBy: { Date: 'desc' },
        },
        PointRedemptions: {
          take: 5,
          orderBy: { Date: 'desc' },
        },
      },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    // Calculate Total transaction Value
    const TotalTransaction = Customer.Sales.reduce((sum, Sale) => {
      return sum + Number(Sale.Total);
    }, 0);

    // Get Active Deposit
    const ActiveDeposit = await this.prisma.customerDeposit.aggregate({
      where: { CustomerID: CustomerId },
      _sum: { RemainingAmount: true },
    });

    return {
      ...this.formatCustomer(Customer),
      TotalTransaction,
      TotalTransactions: Customer.Sales.length,
      recentSales: Customer.Sales.map((s) => ({
        ID: s.ID,
        Code: s.Code,
        Date: s.Date,
        Total: number(s.Total),
        Status: s.PaymentStatusID,
      })),
      ActiveDeposit: number(ActiveDeposit._sum.RemainingAmount || 0),
    };
  }

  /**
   * List Customers with filters and pagination
   */
  async listCustomers(dto: CustomerFilterDto) {
    const where: any = {};

    if (dto.Search) {
      where.OR = [
        { Name: { contains: dto.Search, mode: 'insensitive' } },
        { Code: { contains: dto.Search, mode: 'insensitive' } },
        { Phone: { contains: dto.Search, mode: 'insensitive' } },
        { Email: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    if (dto.CustomerGroupId) {
      where.CustomerGroupID = dto.CustomerGroupId;
    }

    if (dto.IsActive !== undefined) {
      where.IsActive = dto.IsActive;
    }

    if (dto.HasReceivable) {
      where.TotalReceivable = { gt: 0 };
    }

    if (dto.HasPoints) {
      where.PointBalance = { gt: 0 };
    }

    if (dto.StartDate || dto.EndDate) {
      where.CreatedAt = {};
      if (dto.StartDate) {
        where.CreatedAt.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.CreatedAt.lte = new Date(dto.EndDate);
      }
    }

    const page = dto.Page || 1;
    const limit = dto.Limit || 20;
    const skip = (page - 1) * limit;

    const [Customers, Total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          CustomerGroup: true,
        },
        orderBy: { Name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    const CustomersWithCount = await Promise.all(
      Customers.map(async (c) => ({
        ...this.formatCustomer(c),
        TotalSales: await this.prisma.sale.count({ where: { CustomerID: c.ID } }),
      }))
    );

    return {
      data: CustomersWithCount,
      pagination: {
        page,
        limit,
        Total,
        TotalPages: Math.ceil(Total / limit),
      },
    };
  }

  /**
   * Delete Customer (soft delete - set inActive)
   */
  async deleteCustomer(CustomerId: number, UserId: string) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check if Customer has transactions
    const SalesCount = await this.prisma.sale.count({
      where: { CustomerID: CustomerId },
    });

    if (SalesCount > 0) {
      // Soft delete - just set inActive
      await this.prisma.customer.update({
        where: { ID: CustomerId },
        data: { IsActive: false },
      });
    } else {
      // Hard delete if no transactions
      await this.prisma.customer.delete({
        where: { ID: CustomerId },
      });
    }

    return {
      success: true,
      message: SalesCount > 0
        ? 'Customer deactivated (has existing transactions)'
        : 'Customer deleted successfully',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOMER GROUP MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Customer Group
   */
  async createCustomerGroup(dto: CreateCustomerGroupDto) {
    const existing = await this.prisma.customerGroup.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException(`Group Code '${dto.Code}' already exists`);
    }

    const Group = await this.prisma.customerGroup.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Description: dto.Description,
        DiscountPercent: new Prisma.Decimal(dto.DiscountPercent || 0),
        PointMultiplier: new Prisma.Decimal(dto.PointMultiplier || 1),
      },
    });

    return {
      success: true,
      Group: this.formatCustomerGroup(Group),
    };
  }

  /**
   * UpDate Customer Group
   */
  async updateCustomerGroup(GroupId: number, dto: UpdateCustomerGroupDto) {
    const Group = await this.prisma.customerGroup.findUnique({
      where: { ID: GroupId },
    });

    if (!Group) {
      throw new NotFoundException('Customer Group not found');
    }

    const updated = await this.prisma.customerGroup.update({
      where: { ID: GroupId },
      data: {
        Name: dto.Name,
        Description: dto.Description,
        DiscountPercent: dto.DiscountPercent !== undefined
          ? new Prisma.Decimal(dto.DiscountPercent)
          : undefined,
        PointMultiplier: dto.PointMultiplier !== undefined
          ? new Prisma.Decimal(dto.PointMultiplier)
          : undefined,
        IsActive: dto.IsActive,
      },
    });

    return {
      success: true,
      Group: this.formatCustomerGroup(updated),
    };
  }

  /**
   * List Customer Groups
   */
  async listCustomerGroups() {
    const Groups = await this.prisma.customerGroup.findMany({
      orderBy: { SortOrder: 'asc' },
    });

    const GroupsWithCount = await Promise.all(
      Groups.map(async (g) => ({
        ...this.formatCustomerGroup(g),
        CustomerCount: await this.prisma.customer.count({ where: { CustomerGroupID: g.ID } }),
      }))
    );

    return GroupsWithCount;
  }

  /**
   * Delete Customer Group
   */
  async deleteCustomerGroup(GroupId: number) {
    const Group = await this.prisma.customerGroup.findUnique({
      where: { ID: GroupId },
    });

    if (!Group) {
      throw new NotFoundException('Customer Group not found');
    }

    const CustomerCount = await this.prisma.customer.count({ where: { CustomerGroupID: GroupId } });

    if (CustomerCount > 0) {
      throw new BadRequestException('Cannot delete Group with existing Customers');
    }

    await this.prisma.customerGroup.delete({
      where: { ID: GroupId },
    });

    return { success: true, message: 'Group deleted successfully' };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOMER RECEIVABLE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Add receivable to Customer
   * Flow: Pelanggan beli kredit → tambah piutang
   */
  async addReceivable(dto: AddReceivableDto, UserId: string) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: dto.CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    const updated = await this.prisma.customer.update({
      where: { ID: dto.CustomerId },
      data: {
        TotalReceivable: { increment: new Prisma.Decimal(dto.Amount) },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        Type: 'RECEIVABLE_ADDED',
        Title: 'Receivable Added',
        Description: `Added ${dto.Amount} to ${Customer.Name}'s receivable. ${dto.Notes || ''}`,
        ReferenceType: dto.ReferenceType,
        ReferenceID: dto.ReferenceId,
        Amount: new Prisma.Decimal(dto.Amount),
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      CustomerId: dto.CustomerId,
      CustomerName: Customer.Name,
      previousReceivable: number(Customer.TotalReceivable),
      addedAmount: dto.Amount,
      newReceivable: number(updated.TotalReceivable),
    };
  }

  /**
   * Record Payment for Customer receivable
   * Flow: Pelanggan bayar piutang → kurangi saldo piutang
   */
  async paymentReceivable(dto: PaymentReceivableDto, UserId: string) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: dto.CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    if (Number(Customer.TotalReceivable) < dto.Amount) {
      throw new BadRequestException(
        `Payment exceeds receivable. Available: ${Customer.TotalReceivable}, Payment: ${dto.Amount}`,
      );
    }

    const updated = await this.prisma.customer.update({
      where: { ID: dto.CustomerId },
      data: {
        TotalReceivable: { decrement: new Prisma.Decimal(dto.Amount) },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        Type: 'RECEIVABLE_PAID',
        Title: 'Receivable Payment',
        Description: `${Customer.Name} paid ${dto.Amount}. ${dto.Notes || ''}`,
        ReferenceType: 'RECEIVABLE_PAYMENT',
        Amount: new Prisma.Decimal(dto.Amount),
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      CustomerId: dto.CustomerId,
      CustomerName: Customer.Name,
      previousReceivable: number(Customer.TotalReceivable),
      PaymentAmount: dto.Amount,
      newReceivable: number(updated.TotalReceivable),
    };
  }

  /**
   * Get Customer receivable details
   */
  async getCustomerReceivable(CustomerId: number) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: CustomerId },
      include: {
        CustomerGroup: true,
        Sales: {
          where: {
            PaymentStatus: {
              Code: { in: ['PARTIAL', 'UNPAID'] },
            },
          },
          orderBy: { Date: 'desc' },
          include: {
            SalePayments: true,
          },
        },
      },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    const outstandingSales = Customer.Sales.map((Sale) => ({
      ID: Sale.ID,
      Code: Sale.Code,
      Date: Sale.Date,
      Total: number(Sale.Total),
      Paid: Sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0),
      outstanding: number(Sale.Total) - Sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0),
    }));

    return {
      Customer: this.formatCustomer(Customer),
      currentReceivable: number(Customer.TotalReceivable),
      outstandingInvoices: outstandingSales,
      TotalOutstanding: outstandingSales.reduce((sum, inv) => sum + inv.outstanding, 0),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOMER POINTS MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Adjust Customer loyalty Points
   * Flow: Admin adjust poin manual (bonus/koreksi)
   */
  async adjustPoints(dto: AdjustPointsDto, UserId: string) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: dto.CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    const newBalance = Customer.PointBalance + dto.Points;

    if (newBalance < 0) {
      throw new BadRequestException(
        `Cannot reduce Points below zero. Current: ${Customer.PointBalance}, Adjustment: ${dto.Points}`,
      );
    }

    await this.prisma.customer.update({
      where: { ID: dto.CustomerId },
      data: { PointBalance: newBalance },
    });

    await this.prisma.activityLog.create({
      data: {
        Type: dto.Points > 0 ? 'POINTS_ADDED' : 'POINTS_DEDUCTED',
        Title: dto.Points > 0 ? 'Points Added' : 'Points Deducted',
        Description: `${Math.abs(dto.Points)} Points ${dto.Points > 0 ? 'added to' : 'deducted from'} ${Customer.Name}. Reason: ${dto.Reason}`,
        ReferenceType: 'CUSTOMER',
        ReferenceID: dto.CustomerId,
        Amount: new Prisma.Decimal(dto.Points),
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      CustomerId: dto.CustomerId,
      CustomerName: Customer.Name,
      previousBalance: Customer.PointBalance,
      adjustment: dto.Points,
      newBalance,
      reason: dto.Reason,
    };
  }

  /**
   * Get Customer loyalty history
   */
  async getCustomerLoyaltyHistory(CustomerId: number) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: CustomerId },
      include: {
        CustomerGroup: true,
        PointRedemptions: {
          orderBy: { Date: 'desc' },
        },
        Sales: {
          where: {
            PaymentStatus: {
              Code: 'PAID',
            },
          },
          orderBy: { Date: 'desc' },
        },
      },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    // Calculate Total earned from Sales
    const TotalEarned = Customer.Sales.reduce((sum, Sale) => sum + Number(Sale.Total), 0);
    const TotalRedeemed = Customer.PointRedemptions.reduce((sum, r) => sum + r.PointsRedeemed, 0);

    return {
      Customer: this.formatCustomer(Customer),
      currentBalance: Customer.PointBalance,
      TotalEarned,
      TotalRedeemed,
      redemptionHistory: Customer.PointRedemptions.map((r) => ({
        ID: r.ID,
        Code: r.Code,
        PointsRedeemed: r.PointsRedeemed,
        rewardName: r.RewardName,
        rewardValue: number(r.RewardValue),
        Date: r.Date,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOMER ANALYTICS & REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get top Customers by revenue
   */
  async getTopCustomersByRevenue(dto: CustomerTopDto) {
    const limit = dto.Limit || 10;
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

    const Customers = await this.prisma.customer.findMany({
      include: {
        CustomerGroup: true,
        Sales: {
          where,
          select: {
            Total: true,
          },
        },
      },
    });

    const topCustomers = Customers
      .map((c) => ({
        CustomerId: c.ID,
        CustomerCode: c.Code,
        CustomerName: c.Name,
        CustomerGroup: c.CustomerGroup?.Name,
        TotalRevenue: c.Sales.reduce((sum, s) => sum + Number(s.Total), 0),
        transactionCount: c.Sales.length,
      }))
      .filter((c) => c.TotalRevenue > 0)
      .sort((a, b) => b.TotalRevenue - a.TotalRevenue)
      .slice(0, limit);

    return {
      period: { startDate: dto.StartDate, endDate: dto.EndDate },
      topCustomers,
    };
  }

  /**
   * Get Customer Summary statistics
   */
  async getCustomerSummary() {
    const [
      TotalCustomers,
      ActiveCustomers,
      InactiveCustomers,
      CustomersWithReceivable,
      CustomersWithPoints,
    ] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { IsActive: true } }),
      this.prisma.customer.count({ where: { IsActive: false } }),
      this.prisma.customer.count({ where: { TotalReceivable: { gt: 0 } } }),
      this.prisma.customer.count({ where: { PointBalance: { gt: 0 } } }),
    ]);

    const TotalReceivable = await this.prisma.customer.aggregate({
      where: { TotalReceivable: { gt: 0 } },
      _sum: { TotalReceivable: true },
    });

    const TotalPoints = await this.prisma.customer.aggregate({
      where: { PointBalance: { gt: 0 } },
      _sum: { PointBalance: true },
    });

    return {
      TotalCustomers,
      ActiveCustomers,
      InactiveCustomers,
      CustomersWithReceivable,
      CustomersWithPoints,
      TotalOutstandingReceivable: number(TotalReceivable._sum.TotalReceivable || 0),
      TotalLoyaltyPoints: number(TotalPoints._sum.PointBalance || 0),
    };
  }

  /**
   * Get Customer statement (transaction history)
   */
  async getCustomerStatement(dto: CustomerStatementDto) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: dto.CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    const startDate = new Date(dto.StartDate);
    const endDate = new Date(dto.EndDate);
    endDate.setHours(23, 59, 59, 999);

    // Get opening Balance (Total receivable before start Date)
    const openingReceivable = Number(Customer.TotalReceivable);

    // Get Sales in period
    const Sales = await this.prisma.sale.findMany({
      where: {
        CustomerID: dto.CustomerId,
        Date: { gte: startDate, lte: endDate },
      },
      orderBy: { Date: 'asc' },
      include: {
        SalePayments: true,
      },
    });

    // Get Payments in period
    const Deposits = await this.prisma.customerDeposit.findMany({
      where: {
        CustomerID: dto.CustomerId,
        Date: { gte: startDate, lte: endDate },
      },
      orderBy: { Date: 'asc' },
    });

    const transactions = [
      ...Sales.map((s) => ({
        Date: s.Date,
        Type: 'SALE',
        reference: s.Code,
        Description: 'Penjualan',
        debit: number(s.Total),
        credit: s.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0),
      })),
      ...Deposits.map((d) => ({
        Date: d.Date,
        Type: 'PAYMENT',
        reference: d.Code,
        Description: 'Pembayaran Piutang',
        debit: 0,
        credit: number(d.Amount),
      })),
    ].sort((a, b) => a.Date.getTime() - b.Date.getTime());

    const TotalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
    const TotalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);

    return {
      Customer: this.formatCustomer(Customer),
      period: { startDate: dto.StartDate, endDate: dto.EndDate },
      openingBalance: openingReceivable,
      transactions,
      closingBalance: openingReceivable + TotalDebit - TotalCredit,
      Summary: {
        TotalSales: TotalDebit,
        TotalPayments: TotalCredit,
        netChange: TotalDebit - TotalCredit,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private formatCustomer(Customer: any) {
    return {
      ID: Customer.ID,
      Code: Customer.Code,
      Name: Customer.Name,
      phone: Customer.Phone,
      email: Customer.Email,
      address: Customer.Address,
      CustomerGroupId: Customer.CustomerGroupID,
      CustomerGroup: Customer.CustomerGroup
        ? {
            ID: Customer.CustomerGroup.ID,
            Code: Customer.CustomerGroup.Code,
            Name: Customer.CustomerGroup.Name,
            discountPercent: number(Customer.CustomerGroup.DiscountPercent),
          }
        : null,
      TotalReceivable: number(Customer.TotalReceivable),
      PointBalance: Customer.PointBalance,
      Notes: Customer.Notes,
      IsActive: Customer.IsActive,
      createdAt: Customer.CreatedAt,
      updatedAt: Customer.UpDatedAt,
    };
  }

  private formatCustomerGroup(Group: any) {
    return {
      ID: Group.ID,
      Code: Group.Code,
      Name: Group.Name,
      Description: Group.Description,
      discountPercent: number(Group.DiscountPercent),
      PointMultiplier: number(Group.PointMultiplier),
      IsActive: Group.IsActive,
      sortOrder: Group.SortOrder,
    };
  }
}
