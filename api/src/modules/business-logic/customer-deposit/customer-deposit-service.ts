import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateCustomerDepositDto,
  UpdateCustomerDepositDto,
  CustomerDepositQueryDto,
  UseCustomerDepositDto,
  CustomerDepositSummaryDto,
} from './customer-deposit.dto';

@Injectable()
export class CustomerDepositService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE DEPOSIT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new Customer Deposit
   */
  async create(dto: CreateCustomerDepositDto) {
    // Validate Customer
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: dto.CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    // generate Code
    const Code = await this.generateCode();

    // Create Deposit with transaction
    const Deposit = await this.prisma.$transaction(async (tx) => {
      // Create Deposit Record
      const newDeposit = await tx.customerDeposit.create({
        data: {
          Code: Code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          CustomerID: dto.CustomerId,
          Amount: new Prisma.Decimal(dto.Amount),
          RemainingAmount: new Prisma.Decimal(dto.Amount),
          ReferenceNumber: dto.ReferenceNumber,
          Type: dto.Type || 'DEPOSIT',
          PaymentMethodID: dto.PaymentMethodId,
          Description: dto.Notes,
          ...(dto.CreatedById && { CreatedByID: dto.CreatedById.toString() }),
        },
        include: {
          Customer: true,
        },
      });

      // UpDate Customer Deposit Balance
      await tx.customer.update({
        where: { ID: dto.CustomerId },
        data: { DepositBalance: { increment: new Prisma.Decimal(dto.Amount) } },
      });

      return newDeposit;
    });

    return {
      ID: Deposit.ID,
      Code: Deposit.Code,
      Date: Deposit.Date,
      Customer: {
        ID: Deposit.Customer.ID,
        Name: Deposit.Customer.Name,
        DepositBalance: number(Customer.DepositBalance) + dto.Amount,
      },
      Amount: number(Deposit.Amount),
      RemainingAmount: number(Deposit.RemainingAmount),
      Description: Deposit.Description,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE DEPOSIT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Update Deposit Description
   */
  async update(ID: number, dto: UpdateCustomerDepositDto) {
    const Deposit = await this.prisma.customerDeposit.findUnique({
      where: { ID: ID },
    });

    if (!Deposit) {
      throw new NotFoundException('Deposit not found');
    }

    const updated = await this.prisma.customerDeposit.update({
      where: { ID: ID },
      data: { Description: dto.Notes },
    });

    return {
      ID: updated.ID,
      Code: updated.Code,
      Description: updated.Description,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // USE DEPOSIT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Use Customer Deposit for Payment
   */
  async useDeposit(dto: UseCustomerDepositDto) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: dto.CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    const DepositBalance = Number(Customer.DepositBalance);
    if (DepositBalance < dto.Amount) {
      throw new BadRequestException(
        `Insufficient Deposit Balance. Available: ${DepositBalance}, Requested: ${dto.Amount}`,
      );
    }

    // generate Code
    const Code = await this.generateCode();

    // Create withdrawal Record
    const withdrawal = await this.prisma.$transaction(async (tx) => {
      // Create Deposit usage Record (negative Amount)
      const newWithdrawal = await tx.customerDeposit.create({
        data: {
          Code: Code,
          Date: new Date(),
          CustomerID: dto.CustomerId,
          Amount: new Prisma.Decimal(-dto.Amount),
          RemainingAmount: new Prisma.Decimal(0),
          ReferenceNumber: dto.ReferenceNumber,
          Type: 'USED',
          Description: dto.Notes || `Used for Sale ${dto.SaleId}`,
          CreatedByID: dto.CreatedById?.toString(),
        },
        include: { Customer: true },
      });

      // Decrease Customer Deposit Balance
      await tx.customer.update({
        where: { ID: dto.CustomerId },
        data: { DepositBalance: { decrement: new Prisma.Decimal(dto.Amount) } },
      });

      return newWithdrawal;
    });

    return {
      ID: withdrawal.ID,
      Code: withdrawal.Code,
      Date: withdrawal.Date,
      Customer: {
        ID: withdrawal.Customer.ID,
        Name: withdrawal.Customer.Name,
        DepositBalance: number(withdrawal.Customer.DepositBalance),
      },
      Amount: number(withdrawal.Amount),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REFUND DEPOSIT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Refund Customer Deposit (return money to Customer)
   */
  async refundDeposit(ID: number, dto: { Amount?: number; Notes?: string; createdById?: number }) {
    const Deposit = await this.prisma.customerDeposit.findUnique({
      where: { ID: ID },
      include: { Customer: true },
    });

    if (!Deposit) {
      throw new NotFoundException('Deposit not found');
    }

    const refundAmount = dto.Amount || Number(Deposit.Amount);

    if (refundAmount > Number(Deposit.Amount)) {
      throw new BadRequestException('Refund Amount cannot exceed Deposit Amount');
    }

    // generate Code
    const Code = await this.generateCode();

    // Process refund
    await this.prisma.$transaction(async (tx) => {
      // Create refund Record (negative Amount)
      await tx.customerDeposit.create({
        data: {
          Code: Code,
          Date: new Date(),
          CustomerID: Deposit.CustomerID,
          Amount: new Prisma.Decimal(-refundAmount),
          RemainingAmount: new Prisma.Decimal(0),
          Type: 'REFUND',
          Description: dto.Notes || `Refund from Deposit ${Deposit.Code}`,
          CreatedByID: dto.createdById?.toString(),
        },
      });

      // UpDate original Deposit Description
      await tx.customerDeposit.update({
        where: { ID: ID },
        data: { Description: `${Deposit.Description || ''}\nRefunded: ${refundAmount}` },
      });

      // Decrease Customer Deposit Balance
      await tx.customer.update({
        where: { ID: Deposit.CustomerID },
        data: { DepositBalance: { decrement: new Prisma.Decimal(refundAmount) } },
      });
    });

    return {
      ID: ID,
      Code: Deposit.Code,
      RefundAmount: refundAmount,
      Status: 'REFUNDED',
      Message: 'Deposit refunded successfully',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUERY & LIST
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Find Deposit by ID
   */
  async findById(ID: number) {
    const Deposit = await this.prisma.customerDeposit.findUnique({
      where: { ID: ID },
      include: {
        Customer: true,
        Creator: true,
      },
    });

    if (!Deposit) {
      throw new NotFoundException('Deposit not found');
    }

    return {
      ID: Deposit.ID,
      Code: Deposit.Code,
      Date: Deposit.Date,
      Customer: {
        ID: Deposit.Customer.ID,
        Name: Deposit.Customer.Name,
        DepositBalance: number(Deposit.Customer.DepositBalance),
      },
      Amount: number(Deposit.Amount),
      RemainingAmount: number(Deposit.RemainingAmount),
      Description: Deposit.Description,
      CreatedBy: Deposit.Creator?.Name,
      CreatedAt: Deposit.CreatedAt,
    };
  }

  /**
   * List Deposits with filters
   */
  async findAll(dto: CustomerDepositQueryDto) {
    const where: any = {};

    if (dto.Search) {
      where.OR = [
        { Code: { contains: dto.Search, mode: 'insensitive' } },
        { Description: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    if (dto.CustomerId) {
      where.CustomerID = dto.CustomerId;
    }

    if (dto.StartDate || dto.EndDate) {
      where.Date = {};
      if (dto.StartDate) {
        where.Date.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        const endDate = new Date(dto.EndDate);
        endDate.setHours(23, 59, 59, 999);
        where.Date.lte = endDate;
      }
    }

    const page = dto.Page || 1;
    const limit = dto.Limit || 20;
    const skip = (page - 1) * limit;

    const [Deposits, Total] = await Promise.all([
      this.prisma.customerDeposit.findMany({
        where,
        include: {
          Customer: true,
        },
        orderBy: { CreatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.customerDeposit.count({ where }),
    ]);

    return {
      data: Deposits.map((d) => ({
        ID: d.ID,
        Code: d.Code,
        Date: d.Date,
        Customer: d.Customer.Name,
        Amount: number(d.Amount),
        RemainingAmount: number(d.RemainingAmount),
        Description: d.Description,
      })),
      meta: {
        page,
        limit,
        Total,
        TotalPages: Math.ceil(Total / limit),
      },
    };
  }

  /**
   * Get Customer Deposit Summary/Balance
   */
  async getCustomerSummary(dto: CustomerDepositSummaryDto) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: dto.CustomerId },
      include: {
        CustomerDeposits: {
          orderBy: { Date: 'desc' },
          take: 10,
        },
      },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    // Calculate Totals
    const Deposits = await this.prisma.customerDeposit.findMany({
      where: { CustomerID: dto.CustomerId },
    });

    const TotalDeposit = Deposits
      .filter(d => Number(d.Amount) > 0)
      .reduce((sum, d) => sum + Number(d.Amount), 0);

    const TotalUsed = Deposits
      .filter(d => Number(d.Amount) < 0)
      .reduce((sum, d) => sum + Math.abs(Number(d.Amount)), 0);

    return {
      Customer: {
        ID: Customer.ID,
        Name: Customer.Name,
        Code: Customer.Code,
      },
      Balance: number(Customer.DepositBalance),
      Summary: {
        TotalDeposit: TotalDeposit,
        TotalUsed: TotalUsed,
      },
      RecentTransactions: Customer.CustomerDeposits.map((d) => ({
        ID: d.ID,
        Code: d.Code,
        Date: d.Date,
        Amount: number(d.Amount),
        Description: d.Description,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `DP-CUST-${year}${month}`;

    const lastDeposit = await this.prisma.customerDeposit.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastDeposit) {
      const lastSeq = parseInt(lastDeposit.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
