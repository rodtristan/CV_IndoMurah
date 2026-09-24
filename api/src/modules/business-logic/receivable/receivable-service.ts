import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  RecordPaymentDto,
  RecordBulkPaymentDto,
  ReceivableFilterDto,
  CustomerCreditLimitDto,
  SendReminderDto,
  AgingReportDto,
  WriteOffReceivableDto,
} from './receivable.dto';

export interface ReceivableSummary {
  CustomerId: number;
  CustomerName: string;
  CustomerCode: string;
  TotalReceivable: number;
  TotalPaid: number;
  RemainingBalance: number;
  OverdueAmount: number;
  OldestDueDate: Date | null;
  SalesCount: number;
}

@Injectable()
export class ReceivableService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOMER RECEIVABLE OVERVIEW
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get all Customers with outstanding receivables
   * Flow: Owner/CFO ingin lihat siapa saja yang punya piutang
   */
  async getReceivablesOverview(dto: ReceivableFilterDto) {
    const where: any = {};

    if (dto.CustomerId) {
      where.CustomerId = dto.CustomerId;
    }

    // Get paid Status ID
    const paidStatus = await this.prisma.paymentStatus.findFirst({ where: { Code: 'PAID' } });
    const paidStatusId = paidStatus?.ID || 2;

    // Get all Customers with receivables
    const Customers = await this.prisma.customer.findMany({
      where: { ...where, TotalReceivable: { gt: 0 } },
      include: {
        CustomerGroup: true,
        Sales: {
          where: {
            PaymentStatusID: { not: paidStatusId },
          },
          include: {
            SalePayments: true,
          },
        },
      },
    });

    const today = new Date();

    const Summaries: ReceivableSummary[] = Customers.map((Customer) => {
      const TotalReceivable = Number(Customer.TotalReceivable);
      const TotalPaid = Customer.Sales.reduce(
        (sum, Sale) => sum + Sale.SalePayments.reduce((pSum, p) => pSum + Number(p.Amount), 0),
        0,
      );
      const remainingBalance = TotalReceivable;
      const overdueAmount = Customer.Sales.reduce((sum, Sale) => {
        const isOverdue = Sale.SalePayments.length === 0 && new Date(Sale.Date) < today;
        return isOverdue ? sum + Number(Sale.Total) : sum;
      }, 0);

      const oldestDueDate = Customer.Sales.length > 0
        ? new Date(Math.min(...Customer.Sales.map((s) => new Date(s.Date).getTime())))
        : null;

      return {
        CustomerId: Customer.ID,
        CustomerName: Customer.Name,
        CustomerCode: Customer.Code,
        TotalReceivable: TotalReceivable,
        TotalPaid: TotalPaid,
        RemainingBalance: remainingBalance,
        OverdueAmount: overdueAmount,
        OldestDueDate: oldestDueDate,
        SalesCount: Customer.Sales.length,
      };
    });

    // Filter overdue if Requested
    let filtered = Summaries;
    if (dto.OverdueOnly) {
      filtered = Summaries.filter((s) => s.OverdueAmount > 0);
    }

    // Calculate Totals
    const Totals = {
      TotalCustomers: filtered.length,
      TotalReceivable: filtered.reduce((sum, s) => sum + s.RemainingBalance, 0),
      TotalOverdue: filtered.reduce((sum, s) => sum + s.OverdueAmount, 0),
    };

    return { Summaries: filtered, Totals };
  }

  /**
   * Get detailed receivable history for a Customer
   * Flow: Kasir ingin lihat history piutang pelanggan
   */
  async getCustomerReceivables(CustomerId: number) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: CustomerId },
      include: {
        CustomerGroup: true,
        Sales: {
          where: {
            PaymentStatusID: { not: 2 }, // Not PAID
          },
          include: {
            SalePayments: { orderBy: { CreatedAt: 'asc' } },
          },
          orderBy: { Date: 'desc' },
        },
        CustomerDeposits: {
          orderBy: { Date: 'desc' },
        },
      },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    const today = new Date();
    const Sales = Customer.Sales.map((Sale) => {
      const paid = Sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
      const remaining = Number(Sale.Total) - paid;
      const isOverdue = paid < Number(Sale.Total) && new Date(Sale.Date) < today;

      return {
        ID: Sale.ID,
        Code: Sale.Code,
        Date: Sale.Date,
        Total: number(Sale.Total),
        Paid: paid,
        Remaining: remaining,
        IsOverdue: isOverdue,
        DaysOverdue: isOverdue
          ? Math.floor((today.getTime() - new Date(Sale.Date).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
        Payments: Sale.SalePayments.map((p) => ({
          ID: p.ID,
          Amount: number(p.Amount),
          Date: p.CreatedAt,
          MethodID: p.MethodID,
        })),
      };
    });

    const Deposits = Customer.CustomerDeposits.map((d) => ({
      ID: d.ID,
      Code: d.Code,
      Amount: number(d.Amount),
      Remaining: number(d.RemainingAmount),
      Date: d.Date,
    }));

    return {
      Customer: {
        ID: Customer.ID,
        Code: Customer.Code,
        Name: Customer.Name,
        CustomerGroup: Customer.CustomerGroup?.Name || 'Default',
        TotalReceivable: number(Customer.TotalReceivable),
        PointBalance: Customer.PointBalance,
      },
      Sales,
      Deposits,
      Summary: {
        TotalSales: Sales.length,
        TotalBilled: Sales.reduce((sum, s) => sum + s.Total, 0),
        TotalPaid: Sales.reduce((sum, s) => sum + s.Paid, 0),
        TotalRemaining: Sales.reduce((sum, s) => sum + s.Remaining, 0),
        OverdueCount: Sales.filter((s) => s.IsOverdue).length,
        TotalOverdue: Sales.filter((s) => s.IsOverdue).reduce((sum, s) => sum + s.Remaining, 0),
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PAYMENT RECORDING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Record Payment for a Sale (Customer paying their receivable)
   * Flow: Pelanggan bayar piutang → kasir catat pembayaran
   */
  async RecordPayment(SaleId: number, dto: RecordPaymentDto, UserId: string) {
    const Sale = await this.prisma.sale.findUnique({
      where: { ID: SaleId },
      include: {
        SalePayments: true,
        Customer: true,
      },
    });

    if (!Sale) {
      throw new NotFoundException('Sale not found');
    }

    // Calculate current paid Amount
    const currentPaID = Sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
    const TotalAmount = Number(Sale.Total);
    const remainingAmount = TotalAmount - currentPaID;

    if (dto.Amount > remainingAmount) {
      throw new BadRequestException(
        `Payment exceeds remaining Amount. Remaining: ${remainingAmount}`,
      );
    }

    // Create Payment and update Sale
    const Result = await this.prisma.$transaction(async (tx) => {
      // Create Payment Record
      await tx.salePayment.create({
        data: {
          SaleID: SaleId,
          MethodID: dto.PaymentMethodId,
          Amount: new Prisma.Decimal(dto.Amount),
          ReferenceNumber: dto.ReferenceNumber,
          Date: dto.PaymentDate ? new Date(dto.PaymentDate) : new Date(),
          Notes: dto.Notes,
          CreatedByID: UserId,
        },
      });

      // Calculate new Totals
      const newPaID = currentPaID + dto.Amount;
      const newRemaining = TotalAmount - newPaID;

      // UpDate Payment Status
      let newStatusId = Sale.PaymentStatusID;
      if (newPaID >= TotalAmount) {
        const paidStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PAID' } });
        if (paidStatus) newStatusId = paidStatus.ID;
      } else if (newPaID > 0) {
        const partialStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PARTIAL' } });
        if (partialStatus) newStatusId = partialStatus.ID;
      }

      await tx.sale.update({
        where: { ID: SaleId },
        data: { PaymentStatusID: newStatusId },
      });

      // UpDate Customer receivable
      if (newPaID >= TotalAmount) {
        await tx.customer.update({
          where: { ID: Sale.CustomerID },
          data: { TotalReceivable: { decrement: new Prisma.Decimal(remainingAmount) } },
        });
      }

      return { newPaID, newRemaining, newStatusId };
    });

    return {
      success: true,
      SaleId,
      SaleCode: Sale.Code,
      PreviousPaid: currentPaID,
      PaymentAmount: dto.Amount,
      NewPaid: Result.newPaID,
      RemainingAmount: Result.newRemaining,
      Status: Result.newStatusId === 2 ? 'PAID' : 'PARTIAL',
    };
  }

  /**
   * Record bulk Payment for multiple Sales
   * Flow: Pelanggan bayar beberapa invoice sekaligus
   */
  async RecordBulkPayment(dto: RecordBulkPaymentDto, UserId: string) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: dto.CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    // Get Sales to be paid
    const Sales = await this.prisma.sale.findMany({
      where: { ID: { in: dto.SaleIds }, CustomerID: dto.CustomerId },
      include: { SalePayments: true },
    });

    if (Sales.length !== dto.SaleIds.length) {
      throw new NotFoundException('Some Sales not found or do not belong to this Customer');
    }

    // Calculate Total remaining
    const SalesWithRemaining = Sales.map((Sale) => {
      const paid = Sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
      const remaining = Number(Sale.Total) - paid;
      return { ...Sale, remaining };
    });

    const TotalRemaining = SalesWithRemaining.reduce((sum, s) => sum + s.remaining, 0);

    if (dto.Amount > TotalRemaining) {
      throw new BadRequestException(
        `Payment exceeds Total remaining Amount. Total remaining: ${TotalRemaining}`,
      );
    }

    // Distribute Payment (FIFO - oldest first)
    const Result = await this.prisma.$transaction(async (tx) => {
      let remainingPayment = dto.Amount;
      const PaymentResults: Array<{SaleId: number; SaleCode: string; Paid: number; Remaining: number}> = [];

      for (const Sale of SalesWithRemaining.sort(
        (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime(),
      )) {
        if (remainingPayment <= 0) break;

        const PaymentForThisSale = Math.min(remainingPayment, Sale.remaining);

        await tx.salePayment.create({
          data: {
            SaleID: Sale.ID,
            MethodID: dto.PaymentMethodId,
            Amount: new Prisma.Decimal(PaymentForThisSale),
            ReferenceNumber: dto.ReferenceNumber,
            Notes: `Bulk Payment: ${dto.Notes || 'Multiple invoices'}`,
            CreatedByID: UserId,
          },
        });

        // UpDate Sale Status if fully paid
        if (Sale.remaining <= PaymentForThisSale) {
          const paidStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PAID' } });
          if (paidStatus) {
            await tx.sale.update({
              where: { ID: Sale.ID },
              data: { PaymentStatusID: paidStatus.ID },
            });
          }
        }

        PaymentResults.push({
          SaleId: Sale.ID,
          SaleCode: Sale.Code,
          Paid: PaymentForThisSale,
          Remaining: Sale.remaining - PaymentForThisSale,
        });

        remainingPayment -= PaymentForThisSale;
      }

      // UpDate Customer receivable
      if (dto.Amount > remainingPayment) {
        const AmountApplied = dto.Amount - remainingPayment;
        await tx.customer.update({
          where: { ID: dto.CustomerId },
          data: { TotalReceivable: { decrement: new Prisma.Decimal(AmountApplied) } },
        });
      }

      return PaymentResults;
    });

    return {
      success: true,
      CustomerId: dto.CustomerId,
      CustomerName: Customer.Name,
      TotalPayment: dto.Amount,
      Payments: Result,
      TotalApplied: Result.reduce((sum, p) => sum + p.Paid, 0),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOMER DEPOSIT (UANG MUKA PELANGGAN)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Add Customer Deposit (pelanggan bayar uang muka)
   * Flow: Pelanggan Deposit uang → bisa dipakai untuk pembelian
   */
  async addCustomerDeposit(CustomerId: number, dto: { Amount: number; Notes?: string }, UserId: string) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    const Code = await this.generateDepositCode();

    const Deposit = await this.prisma.$transaction(async (tx) => {
      const newDeposit = await tx.customerDeposit.create({
        data: {
          Code: Code,
          Date: new Date(),
          CustomerID: CustomerId,
          Amount: new Prisma.Decimal(dto.Amount),
          RemainingAmount: new Prisma.Decimal(dto.Amount),
          Description: dto.Notes,
          CreatedByID: UserId,
        },
      });

      return newDeposit;
    });

    return {
      success: true,
      Deposit: {
        ID: Deposit.ID,
        Code: Deposit.Code,
        Amount: number(Deposit.Amount),
        RemainingAmount: number(Deposit.RemainingAmount),
        Date: Deposit.Date,
      },
    };
  }

  /**
   * Use Customer Deposit for Payment
   * Flow: Pelanggan gunakan Deposit untuk bayar pembelian
   */
  async useCustomerDeposit(CustomerId: number, SaleId: number, Amount: number, UserId: string) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: CustomerId },
      include: {
        CustomerDeposits: {
          where: { RemainingAmount: { gt: 0 } },
          orderBy: { Date: 'asc' },
        },
      },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    const TotalAvailable = Customer.CustomerDeposits.reduce(
      (sum, d) => sum + Number(d.RemainingAmount),
      0,
    );

    if (Amount > TotalAvailable) {
      throw new BadRequestException(
        `Insufficient Deposit. Available: ${TotalAvailable}, Requested: ${Amount}`,
      );
    }

    // FIFO: use oldest Deposits first
    const Result = await this.prisma.$transaction(async (tx) => {
      let remainingAmount = Amount;
      const usedDeposits: Array<{DepositId: number; DepositCode: string; Used: number}> = [];

      for (const Deposit of Customer.CustomerDeposits) {
        if (remainingAmount <= 0) break;

        const usedFromThis = Math.min(remainingAmount, Number(Deposit.RemainingAmount));

        await tx.customerDeposit.update({
          where: { ID: Deposit.ID },
          data: { RemainingAmount: { decrement: new Prisma.Decimal(usedFromThis) } },
        });

        usedDeposits.push({
          DepositId: Deposit.ID,
          DepositCode: Deposit.Code,
          Used: usedFromThis,
        });

        remainingAmount -= usedFromThis;
      }

      // Record as Sale Payment
      await tx.salePayment.create({
        data: {
          SaleID: SaleId,
          MethodID: 1, // Default Cash/acCount
          Amount: new Prisma.Decimal(Amount),
          ReferenceNumber: `DEP-${Customer.Code}`,
          Notes: 'Payment from Customer Deposit',
          CreatedByID: UserId,
        },
      });

      return usedDeposits;
    });

    return {
      success: true,
      CustomerId,
      SaleId,
      TotalUsed: Amount,
      Deposits: Result,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AGING REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * generate aging Report for receivables
   * Flow: Owner/CFO ingin lihat aging piutang (berapa lama piutang belum lunas)
   */
  async getAgingReport(dto: AgingReportDto) {
    const asOfDate = dto.AsOfDate ? new Date(dto.AsOfDate) : new Date();

    // Get paid Status
    const paidStatus = await this.prisma.paymentStatus.findFirst({ where: { Code: 'PAID' } });
    const paidStatusId = paidStatus?.ID || 2;

    const Customers = await this.prisma.customer.findMany({
      where: { TotalReceivable: { gt: 0 } },
      include: {
        CustomerGroup: true,
        Sales: {
          where: {
            PaymentStatusID: { not: paidStatusId },
          },
          include: { SalePayments: true },
        },
      },
    });

    const agingBuckets: Record<string, { Amount: number; Count: number }> = {
      'CURRENT (0-30)': { Amount: 0, Count: 0 },
      '31-60 DAYS': { Amount: 0, Count: 0 },
      '61-90 DAYS': { Amount: 0, Count: 0 },
      '91-180 DAYS': { Amount: 0, Count: 0 },
      '180+ DAYS': { Amount: 0, Count: 0 },
    };

    const CustomerDetails: Array<{CustomerId: number; CustomerCode: string; CustomerName: string; CustomerGroup: string; TotalReceivable: number; Sales: any[]}> = [];

    for (const Customer of Customers) {
      let TotalRemaining = 0;
      const SalesByAge: Array<{SaleId: number; SaleCode: string; Date: Date; Total: number; Paid: number; Remaining: number; DaysOverdue: number; AgeBucket: string}> = [];

      for (const Sale of Customer.Sales) {
        const paid = Sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
        const remaining = Number(Sale.Total) - paid;
        if (remaining <= 0) continue;

        TotalRemaining += remaining;

        const daysOverdue = Math.floor(
          (asOfDate.getTime() - new Date(Sale.Date).getTime()) / (1000 * 60 * 60 * 24),
        );

        let ageBucket = '180+ DAYS';
        if (daysOverdue <= 30) ageBucket = 'CURRENT (0-30)';
        else if (daysOverdue <= 60) ageBucket = '31-60 DAYS';
        else if (daysOverdue <= 90) ageBucket = '61-90 DAYS';
        else if (daysOverdue <= 180) ageBucket = '91-180 DAYS';

        agingBuckets[ageBucket as keyof typeof agingBuckets].Amount += remaining;
        agingBuckets[ageBucket as keyof typeof agingBuckets].Count += 1;

        SalesByAge.push({
          SaleId: Sale.ID,
          SaleCode: Sale.Code,
          Date: Sale.Date,
          Total: number(Sale.Total),
          Paid: paid,
          Remaining: remaining,
          DaysOverdue: daysOverdue,
          AgeBucket: ageBucket,
        });
      }

      if (TotalRemaining > 0) {
        CustomerDetails.push({
          CustomerId: Customer.ID,
          CustomerCode: Customer.Code,
          CustomerName: Customer.Name,
          CustomerGroup: Customer.CustomerGroup?.Name || 'Default',
          TotalReceivable: TotalRemaining,
          Sales: SalesByAge,
        });
      }
    }

    return {
      AsOfDate: asOfDate,
      Summary: {
        TotalCustomers: CustomerDetails.length,
        TotalReceivable: Object.values(agingBuckets).reduce((sum, b) => sum + b.Amount, 0),
        buckets: agingBuckets,
      },
      Customers: CustomerDetails.sort((a, b) => b.TotalReceivable - a.TotalReceivable),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CREDIT LIMIT MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * UpDate Customer credit limit
   * Flow: Owner mengatur limit hutang pelanggan
   */
  async updateCreditLimit(CustomerId: number, dto: CustomerCreditLimitDto, UserId: string) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    const oldLimit = Number(Customer.TotalReceivable);

    // UpDate Customer's Total receivable as credit limit tracking
    await this.prisma.customer.update({
      where: { ID: CustomerId },
      data: { Notes: `Credit limit updated from ${oldLimit} to ${dto.CreditLimit}. ${dto.Reason || ''}` },
    });

    return {
      success: true,
      CustomerId,
      CustomerName: Customer.Name,
      OldCreditLimit: oldLimit,
      NewCreditLimit: dto.CreditLimit,
      ChangedBy: UserId,
    };
  }

  /**
   * Check if Customer can make Purchase on credit
   * Flow: Sistem cek apakah pelanggan boleh beli secara kredit
   */
  async CheckCreditAvailability(CustomerId: number, Amount: number) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: CustomerId },
      include: { CustomerGroup: true },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    const currentReceivable = Number(Customer.TotalReceivable);
    const availableCredit = 1000000 - currentReceivable; // Assuming 1M Default credit limit
    const canPurchase = availableCredit >= Amount;

    return {
      CustomerId,
      CustomerName: Customer.Name,
      CurrentReceivable: currentReceivable,
      RequestedAmount: Amount,
      AvailableCredit: availableCredit,
      CanPurchase: canPurchase,
      Message: canPurchase
        ? 'Credit available'
        : `Insufficient credit. Available: ${availableCredit}, Requested: ${Amount}`,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REMINDER & NOTIFICATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Send Payment reminder to Customer
   * Flow: Sistem kirim notifikasi/pengingat bayar ke pelanggan
   */
  async sendPaymentReminder(dto: SendReminderDto, UserId: string) {
    const paidStatus = await this.prisma.paymentStatus.findFirst({ where: { Code: 'PAID' } });
    const paidStatusId = paidStatus?.ID || 2;

    const Customer = await this.prisma.customer.findUnique({
      where: { ID: dto.CustomerId },
      include: {
        Sales: {
          where: {
            PaymentStatusID: { not: paidStatusId },
          },
        },
      },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    // Create notification
    const notification = await this.prisma.notification.create({
      data: {
        UserID: UserId,
        Title: `Payment Reminder - ${Customer.Name}`,
        Message: dto.Message,
        TypeID: 1,
        ReferenceType: 'CUSTOMER',
        ReferenceID: dto.CustomerId,
      },
    });

    return {
      success: true,
      CustomerId: dto.CustomerId,
      CustomerName: Customer.Name,
      OutstandingInvoices: Customer.Sales.length,
      TotalOutstanding: Customer.Sales.reduce((sum, s) => sum + Number(s.Total), 0),
      NotificationId: notification.ID,
      Channel: dto.Channel || 'IN_APP',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // WRITE-OFF BAD DEBT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Write off uncollectible receivable
   * Flow: Piutang yang tIDak bisa ditagih → di-write off
   */
  async writeOffReceivable(dto: WriteOffReceivableDto, UserId: string) {
    const Sale = await this.prisma.sale.findUnique({
      where: { ID: dto.ReceivableId },
      include: { Customer: true },
    });

    if (!Sale) {
      throw new NotFoundException('Receivable not found');
    }

    const writeOffAmount = dto.Amount || Number(Sale.Total);

    await this.prisma.$transaction(async (tx) => {
      // UpDate Customer receivable
      await tx.customer.update({
        where: { ID: Sale.CustomerID },
        data: { TotalReceivable: { decrement: new Prisma.Decimal(writeOffAmount) } },
      });

      // Log the action
      await tx.activityLog.create({
        data: {
          Type: 'RECEIVABLE_WRITEOFF',
          Title: 'Receivable Written Off',
          Description: `Customer: ${Sale.Customer.Name}, Amount: ${writeOffAmount}, Reason: ${dto.Reason}`,
          ReferenceType: 'SALE',
          ReferenceID: dto.ReceivableId,
          Amount: new Prisma.Decimal(writeOffAmount),
          CreatedByID: UserId,
        },
      });
    });

    return {
      success: true,
      ReceivableId: dto.ReceivableId,
      SaleCode: Sale.Code,
      CustomerName: Sale.Customer.Name,
      WrittenOffAmount: writeOffAmount,
      Reason: dto.Reason,
      WrittenOffBy: UserId,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateDepositCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `DEP-${year}${month}`;

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
