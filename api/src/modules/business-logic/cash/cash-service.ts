import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  RecordCashInDto,
  RecordCashOutDto,
  TransferCashDto,
  CashFlowFilterDto,
  CashBalanceDto,
  CashSummaryDto,
} from './Cash.dto';

interface CashFlowItem {
  ID: number;
  Type: 'IN' | 'OUT' | 'TRANSFER';
  Date: Date;
  Code: string;
  Description: string;
  Amount: number;
  acCountFrom?: string;
  acCountTo?: string;
  referenceType?: string;
  referenceId?: number;
  Balance: number;
}

@Injectable()
export class CashService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH IN
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Record Cash in (pemasukan kas)
   * Flow: Kasir/owner catat pemasukan kas → sistem update saldo
   */
  async recordCashIn(dto: RecordCashInDto, UserId: string) {
    // Validate acCount
    const account = await this.prisma.account.findUnique({
      where: { ID: dto.AccountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // generate Code
    const Code = await this.generateCashInCode();

    const CashIn = await this.prisma.$transaction(async (tx) => {
      const newCashIn = await tx.cashIn.create({
        data: {
          Code: Code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          AccountID: dto.AccountId,
          Amount: new Prisma.Decimal(dto.Amount),
          Description: dto.Description,
          ReferenceType: dto.ReferenceType,
          ReferenceID: dto.ReferenceId,
          CreatedByID: UserId,
        },
        include: {
          Account: true,
        },
      });

      // Note: Account Balance should be updated via JournalEntry
      // This is simplified for CashIn tracking

      return newCashIn;
    });

    return {
      success: true,
      CashIn: {
        ID: CashIn.ID,
        Code: CashIn.Code,
        Date: CashIn.Date,
        account: CashIn.Account.Name,
        Amount: number(CashIn.Amount),
        Description: CashIn.Description,
        referenceType: CashIn.ReferenceType,
        referenceId: CashIn.ReferenceID,
      },
    };
  }

  /**
   * List Cash in Records
   */
  async listCashIn(dto: CashFlowFilterDto) {
    const where: any = {};

    if (dto.AccountId) {
      where.AccountID = dto.AccountId;
    }

    if (dto.ReferenceType) {
      where.ReferenceType = dto.ReferenceType;
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

    const CashIns = await this.prisma.cashIn.findMany({
      where,
      include: { Account: true },
      orderBy: { Date: 'desc' },
      take: dto.Limit || 100,
    });

    return CashIns.map((ci) => ({
      ID: ci.ID,
      Code: ci.Code,
      Date: ci.Date,
      account: ci.Account.Name,
      Amount: number(ci.Amount),
      Description: ci.Description,
      referenceType: ci.ReferenceType,
      referenceId: ci.ReferenceID,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH OUT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Record Cash out (pengeluaran kas)
   * Flow: Kasir/owner catat pengeluaran kas → sistem update saldo
   */
  async recordCashOut(dto: RecordCashOutDto, UserId: string) {
    // Validate acCount
    const account = await this.prisma.account.findUnique({
      where: { ID: dto.AccountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // generate Code
    const Code = await this.generateCashOutCode();

    const CashOut = await this.prisma.$transaction(async (tx) => {
      const newCashOut = await tx.cashOut.create({
        data: {
          Code: Code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          AccountID: dto.AccountId,
          Amount: new Prisma.Decimal(dto.Amount),
          Description: dto.Description,
          ReferenceType: dto.ReferenceType,
          ReferenceID: dto.ReferenceId,
          CreatedByID: UserId,
        },
        include: {
          Account: true,
        },
      });

      return newCashOut;
    });

    return {
      success: true,
      CashOut: {
        ID: CashOut.ID,
        Code: CashOut.Code,
        Date: CashOut.Date,
        account: CashOut.Account.Name,
        Amount: number(CashOut.Amount),
        Description: CashOut.Description,
        referenceType: CashOut.ReferenceType,
        referenceId: CashOut.ReferenceID,
      },
    };
  }

  /**
   * List Cash out Records
   */
  async listCashOut(dto: CashFlowFilterDto) {
    const where: any = {};

    if (dto.AccountId) {
      where.AccountID = dto.AccountId;
    }

    if (dto.ReferenceType) {
      where.ReferenceType = dto.ReferenceType;
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

    const CashOuts = await this.prisma.cashOut.findMany({
      where,
      include: { Account: true },
      orderBy: { Date: 'desc' },
      take: dto.Limit || 100,
    });

    return CashOuts.map((co) => ({
      ID: co.ID,
      Code: co.Code,
      Date: co.Date,
      account: co.Account.Name,
      Amount: number(co.Amount),
      Description: co.Description,
      referenceType: co.ReferenceType,
      referenceId: co.ReferenceID,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH TRANSFER
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Transfer Cash between Accounts
   * Flow: Pindahkan dana dari kas A ke kas B
   */
  async transferCash(dto: TransferCashDto, UserId: string) {
    if (dto.FromAccountId === dto.ToAccountId) {
      throw new BadRequestException('Source and destination Accounts cannot be the same');
    }

    // Validate Accounts
    const [fromAccount, toAccount] = await Promise.all([
      this.prisma.account.findUnique({ where: { ID: dto.FromAccountId } }),
      this.prisma.account.findUnique({ where: { ID: dto.ToAccountId } }),
    ]);

    if (!fromAccount) {
      throw new NotFoundException('Source account not found');
    }

    if (!toAccount) {
      throw new NotFoundException('Destination account not found');
    }

    // generate Code
    const Code = await this.generateCashTransferCode();

    const Transfer = await this.prisma.$transaction(async (tx) => {
      const newTransfer = await tx.cashTransfer.create({
        data: {
          Code: Code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          FromAccountID: dto.FromAccountId,
          ToAccountID: dto.ToAccountId,
          Amount: new Prisma.Decimal(dto.Amount),
          Description: dto.Description,
          CreatedByID: UserId,
        },
        include: {
          FromAccount: true,
          ToAccount: true,
        },
      });

      return newTransfer;
    });

    return {
      success: true,
      Transfer: {
        ID: Transfer.ID,
        Code: Transfer.Code,
        Date: Transfer.Date,
        fromAccount: Transfer.FromAccount.Name,
        toAccount: Transfer.ToAccount.Name,
        Amount: number(Transfer.Amount),
        Description: Transfer.Description,
      },
    };
  }

  /**
   * List Cash Transfers
   */
  async listCashTransfers(dto: CashFlowFilterDto) {
    const where: any = {};

    if (dto.AccountId) {
      where.OR = [
        { FromAccountID: dto.AccountId },
        { ToAccountID: dto.AccountId },
      ];
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

    const Transfers = await this.prisma.cashTransfer.findMany({
      where,
      include: {
        FromAccount: true,
        ToAccount: true,
      },
      orderBy: { Date: 'desc' },
      take: dto.Limit || 100,
    });

    return Transfers.map((t) => ({
      ID: t.ID,
      Code: t.Code,
      Date: t.Date,
      fromAccount: t.FromAccount.Name,
      toAccount: t.ToAccount.Name,
      Amount: number(t.Amount),
      Description: t.Description,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH FLOW & BALANCE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get Cash Balance for Accounts
   * Flow: Owner/CFO ingin lihat saldo kas saat ini
   */
  async getCashBalance(dto: CashBalanceDto) {
    const asOfDate = dto.AsOfDate ? new Date(dto.AsOfDate) : new Date();

    const where: any = { IsActive: true };
    if (dto.AccountId) {
      where.ID = dto.AccountId;
    }

    // Get Cash Accounts (assuming AccountType Code = 'CASH')
    const CashType = await this.prisma.accountType.findFirst({
      where: { Code: 'CASH' },
    });

    if (CashType) {
      where.TypeID = CashType.ID;
    }

    const Accounts = await this.prisma.account.findMany({
      where,
      include: { Type: true },
    });

    const Balances: any[] = [];

    for (const account of Accounts) {
      // Calculate Balance from Cash in/out/Transfer
      const [CashIns, CashOuts, TransfersOut, TransfersIn] = await Promise.all([
        this.prisma.cashIn.findMany({
          where: {
            AccountID: account.ID,
            Date: { lte: asOfDate },
          },
        }),
        this.prisma.cashOut.findMany({
          where: {
            AccountID: account.ID,
            Date: { lte: asOfDate },
          },
        }),
        this.prisma.cashTransfer.findMany({
          where: {
            FromAccountID: account.ID,
            Date: { lte: asOfDate },
          },
        }),
        this.prisma.cashTransfer.findMany({
          where: {
            ToAccountID: account.ID,
            Date: { lte: asOfDate },
          },
        }),
      ]);

      const CashInTotal = CashIns.reduce((sum, ci) => sum + Number(ci.Amount), 0);
      const CashOutTotal = CashOuts.reduce((sum, co) => sum + Number(co.Amount), 0);
      const TransferredOut = TransfersOut.reduce((sum, t) => sum + Number(t.Amount), 0);
      const TransferredIn = TransfersIn.reduce((sum, t) => sum + Number(t.Amount), 0);

      const Balance = CashInTotal + TransferredIn - CashOutTotal - TransferredOut;

      Balances.push({
        ID: account.ID,
        Code: account.Code,
        Name: account.Name,
        AccountType: account.Type?.Name || 'Unknown',
        CashIn: CashInTotal,
        CashOut: CashOutTotal,
        TransferredIn: TransferredIn,
        TransferredOut: TransferredOut,
        Balance,
      });
    }

    const Summary = {
      TotalBalance: Balances.reduce((sum, b) => sum + b.Balance, 0),
      TotalCashIn: Balances.reduce((sum, b) => sum + b.CashIn, 0),
      TotalCashOut: Balances.reduce((sum, b) => sum + b.CashOut, 0),
    };

    return {
      asOfDate: asOfDate.toISOString(),
      Accounts: Balances,
      Summary,
    };
  }

  /**
   * Get Cash Flow Report
   * Flow: Owner ingin laporan arus kas (Cash Flow statement)
   */
  async getCashFlowReport(dto: CashSummaryDto) {
    const startDate = dto.StartDate ? new Date(dto.StartDate) : this.getStartOfMonth();
    const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();

    const where: any = {
      Date: { gte: startDate, lte: endDate },
    };

    if (dto.AccountId) {
      where.AccountID = dto.AccountId;
    }

    const [CashIns, CashOuts, Transfers] = await Promise.all([
      this.prisma.cashIn.findMany({
        where,
        include: { Account: true },
        orderBy: { Date: 'asc' },
      }),
      this.prisma.cashOut.findMany({
        where,
        include: { Account: true },
        orderBy: { Date: 'asc' },
      }),
      this.prisma.cashTransfer.findMany({
        where: {
          Date: { gte: startDate, lte: endDate },
        },
        include: { FromAccount: true, ToAccount: true },
        orderBy: { Date: 'asc' },
      }),
    ]);

    // Calculate daily Flows
    const dailyFlows: Record<string, { Date: string; CashIn: number; CashOut: number; net: number }> = {};

    for (const ci of CashIns) {
      const DateKey = ci.Date.toISOString().split('T')[0];
      if (!dailyFlows[DateKey]) {
        dailyFlows[DateKey] = { Date: DateKey, CashIn: 0, CashOut: 0, net: 0 };
      }
      dailyFlows[DateKey].CashIn += Number(ci.Amount);
    }

    for (const co of CashOuts) {
      const DateKey = co.Date.toISOString().split('T')[0];
      if (!dailyFlows[DateKey]) {
        dailyFlows[DateKey] = { Date: DateKey, CashIn: 0, CashOut: 0, net: 0 };
      }
      dailyFlows[DateKey].CashOut += Number(co.Amount);
    }

    for (const Flow of Object.values(dailyFlows)) {
      Flow.net = Flow.CashIn - Flow.CashOut;
    }

    // Group by reference Type
    const byReferenceType: Record<string, { Type: string; TotalIn: number; TotalOut: number; Count: number }> = {};

    for (const ci of CashIns) {
      const Type = ci.ReferenceType || 'OTHER';
      if (!byReferenceType[Type]) {
        byReferenceType[Type] = { Type, TotalIn: 0, TotalOut: 0, Count: 0 };
      }
      byReferenceType[Type].TotalIn += Number(ci.Amount);
      byReferenceType[Type].Count++;
    }

    for (const co of CashOuts) {
      const Type = co.ReferenceType || 'OTHER';
      if (!byReferenceType[Type]) {
        byReferenceType[Type] = { Type, TotalIn: 0, TotalOut: 0, Count: 0 };
      }
      byReferenceType[Type].TotalOut += Number(co.Amount);
      byReferenceType[Type].Count++;
    }

    const TotalCashIn = CashIns.reduce((sum, ci) => sum + Number(ci.Amount), 0);
    const TotalCashOut = CashOuts.reduce((sum, co) => sum + Number(co.Amount), 0);
    const netCashFlow = TotalCashIn - TotalCashOut;

    return {
      period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      Summary: {
        TotalCashIn,
        TotalCashOut,
        netCashFlow,
        transactionCount: CashIns.length + CashOuts.length,
      },
      byReferenceType: Object.values(byReferenceType),
      dailyFlows: Object.values(dailyFlows).sort((a, b) => a.Date.localeCompare(b.Date)),
      transactions: {
        CashIns: CashIns.map((ci) => ({
          ID: ci.ID,
          Code: ci.Code,
          Date: ci.Date,
          account: ci.Account.Name,
          Amount: number(ci.Amount),
          Description: ci.Description,
          referenceType: ci.ReferenceType,
        })),
        CashOuts: CashOuts.map((co) => ({
          ID: co.ID,
          Code: co.Code,
          Date: co.Date,
          account: co.Account.Name,
          Amount: number(co.Amount),
          Description: co.Description,
          referenceType: co.ReferenceType,
        })),
        Transfers: Transfers.map((t) => ({
          ID: t.ID,
          Code: t.Code,
          Date: t.Date,
          fromAccount: t.FromAccount.Name,
          toAccount: t.ToAccount.Name,
          Amount: number(t.Amount),
          Description: t.Description,
        })),
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private getStartOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private async generateCashInCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `CI-${year}${month}`;

    const lastRecord = await this.prisma.cashIn.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastRecord) {
      const lastSeq = parseInt(lastRecord.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private async generateCashOutCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `CO-${year}${month}`;

    const lastRecord = await this.prisma.cashOut.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastRecord) {
      const lastSeq = parseInt(lastRecord.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private async generateCashTransferCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `CT-${year}${month}`;

    const lastRecord = await this.prisma.cashTransfer.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastRecord) {
      const lastSeq = parseInt(lastRecord.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
