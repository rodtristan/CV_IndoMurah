import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateMemberCardDto,
  UpdateMemberCardDto,
  CardTopUpDto,
  CardWithdrawDto,
  CardTransferDto,
  ReplaceCardDto,
  MemberCardFilterDto,
  CardTransactionFilterDto,
  CardBalanceReportDto,
} from './member-card.dto';

@Injectable()
export class MemberCardService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CARD MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new member card
   * Flow: Admin buat kartu anggota baru → kartu diaktifkan → Deposit awal
   */
  async createCard(dto: CreateMemberCardDto, UserId: string) {
    // Check if card number already exists
    const existingCard = await this.prisma.memberCard.findUnique({
      where: { CardNumber: dto.CardNumber },
    });

    if (existingCard) {
      throw new ConflictException('Card number already exists');
    }

    // Check if Customer already has a card
    const existingCustomerCard = await this.prisma.memberCard.findFirst({
      where: { CustomerID: dto.CustomerId, IsActive: true },
    });

    if (existingCustomerCard) {
      throw new ConflictException('Customer already has an Active card');
    }

    // Validate Customer exists
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: dto.CustomerId },
      include: { CustomerGroup: true },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    // Determine card Type based on Customer Group if not specified
    const CardType = dto.CardType || this.getCardTypeFromGroup(Customer.CustomerGroup?.Name);

    // Get Active Status
    const ActiveStatus = await this.prisma.memberCardStatus.findFirst({
      where: { Code: 'ACTIVE' },
    });

    // Generate card Code
    const Code = await this.generateCardCode();

    const card = await this.prisma.memberCard.create({
      data: {
        Code: Code,
        CardNumber: dto.CardNumber,
        CustomerID: dto.CustomerId,
        CardType: CardType,
        Balance: new Prisma.Decimal(dto.InitialDeposit || 0),
        MinimumBalance: this.getMinimumBalanceByType(CardType),
        StatusID: ActiveStatus?.ID || 1,
        Notes: dto.Notes,
      },
      include: {
        Customer: { include: { CustomerGroup: true } },
        Status: true,
      },
    });

    // Create initial Deposit transaction if Amount > 0
    if (dto.InitialDeposit && dto.InitialDeposit > 0) {
      await this.recordTransaction(
        card.ID,
        'TOP_UP',
        dto.InitialDeposit,
        0,
        dto.InitialDeposit,
        'Initial Deposit',
        null,
        UserId,
      );
    }

    return {
      success: true,
      card: this.formatCard(card),
    };
  }

  /**
   * Get card by ID
   */
  async getCard(CardId: number) {
    const card = await this.prisma.memberCard.findUnique({
      where: { ID: CardId },
      include: {
        Customer: { include: { CustomerGroup: true } },
        Status: true,
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return {
      ...this.formatCard(card),
      Customer: {
        ID: card.Customer.ID,
        Code: card.Customer.Code,
        Name: card.Customer.Name,
        Phone: card.Customer.Phone,
        Group: card.Customer.CustomerGroup?.Name || null,
      },
    };
  }

  /**
   * Get card by card Number
   */
  async getCardByNumber(CardNumber: string) {
    const card = await this.prisma.memberCard.findUnique({
      where: { CardNumber: CardNumber },
      include: {
        Customer: { include: { CustomerGroup: true } },
        Status: true,
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return this.formatCard(card);
  }

  /**
   * List cards with filters
   */
  async listCards(dto: MemberCardFilterDto) {
    const where: any = {};

    if (dto.ActiveOnly !== false) {
      where.IsActive = true;
    }

    if (dto.CardType) {
      where.CardType = dto.CardType;
    }

    if (dto.Search) {
      where.OR = [
        { CardNumber: { contains: dto.Search, mode: 'insensitive' } },
        { Customer: { Name: { contains: dto.Search, mode: 'insensitive' } } },
        { Customer: { Code: { contains: dto.Search, mode: 'insensitive' } } },
      ];
    }

    if (dto.LowBalanceOnly) {
      where.Balance = { lt: dto.MinBalance || 50000 };
    }

    if (dto.CustomerGroupId) {
      where.Customer = { CustomerGroupID: dto.CustomerGroupId };
    }

    const Page = dto.Page || 1;
    const Limit = dto.Limit || 20;
    const skip = (Page - 1) * Limit;

    const [cards, Total] = await Promise.all([
      this.prisma.memberCard.findMany({
        where,
        include: {
          Customer: { include: { CustomerGroup: true } },
          Status: true,
        },
        orderBy: { CreatedAt: 'desc' },
        skip,
        take: Limit,
      }),
      this.prisma.memberCard.count({ where }),
    ]);

    return {
      data: cards.map((c) => this.formatCard(c)),
      pagination: {
        Page,
        Limit,
        Total,
        TotalPages: Math.ceil(Total / Limit),
      },
    };
  }

  /**
   * Update card
   */
  async updateCard(CardId: number, dto: UpdateMemberCardDto, UserId: string) {
    const card = await this.prisma.memberCard.findUnique({
      where: { ID: CardId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    const updateData: any = {};

    if (dto.CardType) {
      updateData.CardType = dto.CardType;
      updateData.MinimumBalance = this.getMinimumBalanceByType(dto.CardType);
    }

    if (dto.IsActive !== undefined) {
      updateData.IsActive = dto.IsActive;
    }

    if (dto.Notes !== undefined) {
      updateData.Notes = dto.Notes;
    }

    const updated = await this.prisma.memberCard.update({
      where: { ID: CardId },
      data: updateData,
      include: {
        Customer: { include: { CustomerGroup: true } },
        Status: true,
      },
    });

    return {
      success: true,
      card: this.formatCard(updated),
    };
  }

  /**
   * Activate card
   */
  async activateCard(CardId: number, UserId: string) {
    const card = await this.prisma.memberCard.findUnique({
      where: { ID: CardId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    const ActiveStatus = await this.prisma.memberCardStatus.findFirst({
      where: { Code: 'ACTIVE' },
    });

    await this.prisma.memberCard.update({
      where: { ID: CardId },
      data: {
        IsActive: true,
        StatusID: ActiveStatus?.ID || 1,
      },
    });

    return {
      success: true,
      message: 'Card activated successfully',
    };
  }

  /**
   * Deactivate card
   */
  async deactivateCard(CardId: number, UserId: string) {
    const card = await this.prisma.memberCard.findUnique({
      where: { ID: CardId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    const InactiveStatus = await this.prisma.memberCardStatus.findFirst({
      where: { Code: 'INACTIVE' },
    });

    await this.prisma.memberCard.update({
      where: { ID: CardId },
      data: {
        IsActive: false,
        StatusID: InactiveStatus?.ID || 2,
      },
    });

    return {
      success: true,
      message: 'Card deactivated successfully',
    };
  }

  /**
   * Replace card (lost/damaged)
   */
  async replaceCard(CardId: number, dto: ReplaceCardDto, UserId: string) {
    const oldCard = await this.prisma.memberCard.findUnique({
      where: { ID: CardId },
      include: { Customer: true },
    });

    if (!oldCard) {
      throw new NotFoundException('Card not found');
    }

    // Generate new card Number
    const newCardNumber = await this.generateNewCardNumber();

    // Update old card as replaced
    await this.prisma.memberCard.update({
      where: { ID: CardId },
      data: {
        IsActive: false,
        Notes: `Replaced on ${new Date().toISOString()}: ${dto.Reason}. New card: ${newCardNumber}`,
      },
    });

    // Create new card with same Customer and Balance
    const ActiveStatus = await this.prisma.memberCardStatus.findFirst({
      where: { Code: 'ACTIVE' },
    });

    const newCard = await this.prisma.memberCard.create({
      data: {
        Code: await this.generateCardCode(),
        CardNumber: newCardNumber,
        CustomerID: oldCard.CustomerID,
        CardType: oldCard.CardType,
        Balance: oldCard.Balance,
        MinimumBalance: oldCard.MinimumBalance,
        StatusID: ActiveStatus?.ID || 1,
        Notes: `Replacement card for ${oldCard.CardNumber}. Reason: ${dto.Reason}`,
        ReplacedFromID: oldCard.ID,
      },
      include: {
        Customer: { include: { CustomerGroup: true } },
        Status: true,
      },
    });

    return {
      success: true,
      oldCard: {
        ID: oldCard.ID,
        CardNumber: oldCard.CardNumber,
        Status: 'REPLACED',
      },
      newCard: this.formatCard(newCard),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CARD TRANSACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Top-up card Balance
   * Flow: Pelanggan isi saldo kartu → sistem catat transaksi
   */
  async topUp(CardId: number, dto: CardTopUpDto, UserId: string) {
    const card = await this.prisma.memberCard.findUnique({
      where: { ID: CardId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (!card.IsActive) {
      throw new BadRequestException('Card is not Active');
    }

    const BalanceBefore = Number(card.Balance);
    const BalanceAfter = BalanceBefore + dto.Amount;

    // Update card Balance
    await this.prisma.memberCard.update({
      where: { ID: CardId },
      data: { Balance: { increment: new Prisma.Decimal(dto.Amount) } },
    });

    // Record transaction
    const transaction = await this.recordTransaction(
      CardId,
      'TOP_UP',
      dto.Amount,
      BalanceBefore,
      BalanceAfter,
      dto.Notes || 'Card top-up',
      dto.ReferenceNumber || null,
      UserId,
    );

    return {
      success: true,
      transaction: {
        ID: transaction.ID,
        CardNumber: card.CardNumber,
        Type: 'TOP_UP',
        Amount: dto.Amount,
        BalanceBefore,
        BalanceAfter,
        ReferenceNumber: dto.ReferenceNumber,
        CreatedAt: transaction.CreatedAt,
      },
    };
  }

  /**
   * Withdraw from card
   * Flow: Pelanggan tarik saldo → sistem kurangi Balance
   */
  async withdraw(CardId: number, dto: CardWithdrawDto, UserId: string) {
    const card = await this.prisma.memberCard.findUnique({
      where: { ID: CardId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (!card.IsActive) {
      throw new BadRequestException('Card is not Active');
    }

    const BalanceBefore = Number(card.Balance);
    const BalanceAfter = BalanceBefore - dto.Amount;

    if (BalanceAfter < 0) {
      throw new BadRequestException(`Insufficient Balance. Available: ${BalanceBefore}`);
    }

    // Update card Balance
    await this.prisma.memberCard.update({
      where: { ID: CardId },
      data: { Balance: { decrement: new Prisma.Decimal(dto.Amount) } },
    });

    // Record transaction
    const transaction = await this.recordTransaction(
      CardId,
      'WITHDRAW',
      dto.Amount,
      BalanceBefore,
      BalanceAfter,
      dto.Notes || 'Card withdrawal',
      dto.ReferenceNumber || null,
      UserId,
    );

    return {
      success: true,
      transaction: {
        ID: transaction.ID,
        CardNumber: card.CardNumber,
        Type: 'WITHDRAW',
        Amount: dto.Amount,
        BalanceBefore,
        BalanceAfter,
        ReferenceNumber: dto.ReferenceNumber,
        CreatedAt: transaction.CreatedAt,
      },
    };
  }

  /**
   * Transfer between cards
   * Flow: Pelanggan Transfer saldo ke kartu lain
   */
  async transfer(CardId: number, dto: CardTransferDto, UserId: string) {
    const sourceCard = await this.prisma.memberCard.findUnique({
      where: { ID: CardId },
    });

    if (!sourceCard) {
      throw new NotFoundException('Source card not found');
    }

    const targetCard = await this.prisma.memberCard.findUnique({
      where: { ID: dto.TargetCardId },
    });

    if (!targetCard) {
      throw new NotFoundException('Target card not found');
    }

    if (!sourceCard.IsActive || !targetCard.IsActive) {
      throw new BadRequestException('One or both cards are not Active');
    }

    const sourceBalanceBefore = Number(sourceCard.Balance);
    const sourceBalanceAfter = sourceBalanceBefore - dto.Amount;

    if (sourceBalanceAfter < 0) {
      throw new BadRequestException(`Insufficient Balance. Available: ${sourceBalanceBefore}`);
    }

    await this.prisma.$transaction(async (tx) => {
      // Debit source card
      await tx.memberCard.update({
        where: { ID: CardId },
        data: { Balance: { decrement: new Prisma.Decimal(dto.Amount) } },
      });

      // Credit Target card
      await tx.memberCard.update({
        where: { ID: dto.TargetCardId },
        data: { Balance: { increment: new Prisma.Decimal(dto.Amount) } },
      });

      // Record Transfer out from source
      await this.recordTransactionInternal(
        tx,
        CardId,
        'TRANSFER_OUT',
        dto.Amount,
        sourceBalanceBefore,
        sourceBalanceAfter,
        `Transfer to ${targetCard.CardNumber}`,
        null,
        UserId,
      );

      // Record Transfer in to Target
      await this.recordTransactionInternal(
        tx,
        dto.TargetCardId,
        'TRANSFER_IN',
        dto.Amount,
        Number(targetCard.Balance),
        Number(targetCard.Balance) + dto.Amount,
        `Transfer from ${sourceCard.CardNumber}`,
        null,
        UserId,
      );
    });

    return {
      success: true,
      transfer: {
        SourceCard: sourceCard.CardNumber,
        TargetCard: targetCard.CardNumber,
        Amount: dto.Amount,
        SourceBalanceBefore: sourceBalanceBefore,
        SourceBalanceAfter: sourceBalanceAfter,
        TargetBalanceBefore: number(targetCard.Balance),
        TargetBalanceAfter: number(targetCard.Balance) + dto.Amount,
      },
    };
  }

  /**
   * Get card Balance
   */
  async getBalance(CardId: number) {
    const card = await this.prisma.memberCard.findUnique({
      where: { ID: CardId },
      include: { Customer: true },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return {
      CardId: card.ID,
      CardNumber: card.CardNumber,
      CustomerName: card.Customer?.Name,
      Balance: number(card.Balance),
      MinimumBalance: number(card.MinimumBalance),
      IsLowBalance: number(card.Balance) < Number(card.MinimumBalance),
      CardType: card.CardType,
      IsActive: card.IsActive,
    };
  }

  /**
   * Get card transaction history
   */
  async getTransactions(CardId: number, dto: CardTransactionFilterDto) {
    const card = await this.prisma.memberCard.findUnique({
      where: { ID: CardId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    const where: any = { MemberCardID: CardId };

    if (dto.TransactionType) {
      where.TransactionType = dto.TransactionType;
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

    const transactions = await this.prisma.memberCardTransaction.findMany({
      where,
      orderBy: { CreatedAt: 'desc' },
      take: 100,
    });

    return {
      CardNumber: card.CardNumber,
      CurrentBalance: number(card.Balance),
      transactions: transactions.map((t) => ({
        ID: t.ID,
        Type: t.TransactionType,
        Amount: number(t.Amount),
        BalanceBefore: number(t.BalanceBefore),
        BalanceAfter: number(t.BalanceAfter),
        ReferenceNumber: t.ReferenceNumber,
        Notes: t.Notes,
        CreatedAt: t.CreatedAt,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get card Balance Report
   */
  async getBalanceReport(dto: CardBalanceReportDto) {
    const where: any = { IsActive: true };

    if (dto.CustomerGroupId) {
      where.Customer = { CustomerGroupID: dto.CustomerGroupId };
    }

    const cards = await this.prisma.memberCard.findMany({
      where,
      include: {
        Customer: { include: { CustomerGroup: true } },
      },
    });

    const Report = cards.map((c) => ({
      CardId: c.ID,
      CardNumber: c.CardNumber,
      CustomerName: c.Customer?.Name,
      CustomerCode: c.Customer?.Code,
      CustomerGroup: c.Customer?.CustomerGroup?.Name,
      CardType: c.CardType,
      Balance: number(c.Balance),
      MinimumBalance: number(c.MinimumBalance),
      IsLowBalance: number(c.Balance) < Number(c.MinimumBalance),
    }));

    const Summary = {
      TotalCards: Report.length,
      TotalBalance: Report.reduce((sum, r) => sum + r.Balance, 0),
      TotalMinimumRequired: Report.reduce((sum, r) => sum + r.MinimumBalance, 0),
      LowBalanceCount: Report.filter((r) => r.IsLowBalance).length,
      ZeroBalanceCount: Report.filter((r) => r.Balance === 0).length,
    };

    return {
      AsOfDate: dto.AsOfDate || new Date().toISOString(),
      Summary,
      cards: Report,
    };
  }

  /**
   * Get card Summary statistics
   */
  async getCardStats() {
    const [TotalCards, ActiveCards, TotalBalance] = await Promise.all([
      this.prisma.memberCard.count({ where: { IsActive: true } }),
      this.prisma.memberCard.count({ where: { IsActive: true, Balance: { gt: 0 } } }),
      this.prisma.memberCard.aggregate({
        where: { IsActive: true },
        _sum: { Balance: true },
      }),
    ]);

    // Get top up transactions this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const topUps = await this.prisma.memberCardTransaction.aggregate({
      where: {
        TransactionType: 'TOP_UP',
        CreatedAt: { gte: startOfMonth },
      },
      _sum: { Amount: true },
      _count: true,
    });

    return {
      TotalActiveCards: TotalCards,
      CardsWithBalance: ActiveCards,
      TotalBalance: number(TotalBalance._sum.Balance) || 0,
      ThisMonthTopUps: {
        Count: topUps._count || 0,
        TotalAmount: number(topUps._sum.Amount) || 0,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async recordTransaction(
    CardId: number,
    Type: string,
    Amount: number,
    BalanceBefore: number,
    BalanceAfter: number,
    Notes: string | null,
    ReferenceNumber: string | null,
    UserId: string,
  ) {
    const transaction = await this.prisma.memberCardTransaction.create({
      data: {
        MemberCardID: CardId,
        TransactionType: Type,
        Amount: new Prisma.Decimal(Amount),
        BalanceBefore: new Prisma.Decimal(BalanceBefore),
        BalanceAfter: new Prisma.Decimal(BalanceAfter),
        ReferenceNumber: ReferenceNumber,
        Notes: Notes,
        CreatedByID: UserId,
      },
    });

    return {
      ID: transaction.ID,
      CreatedAt: transaction.CreatedAt,
    };
  }

  private async recordTransactionInternal(
    tx: any,
    CardId: number,
    Type: string,
    Amount: number,
    BalanceBefore: number,
    BalanceAfter: number,
    Notes: string | null,
    ReferenceNumber: string | null,
    UserId: string,
  ) {
    return tx.memberCardTransaction.create({
      data: {
        MemberCardID: CardId,
        TransactionType: Type,
        Amount: new Prisma.Decimal(Amount),
        BalanceBefore: new Prisma.Decimal(BalanceBefore),
        BalanceAfter: new Prisma.Decimal(BalanceAfter),
        ReferenceNumber: ReferenceNumber,
        Notes: Notes,
        CreatedByID: UserId,
      },
    });
  }

  private formatCard(card: any) {
    return {
      ID: card.ID,
      Code: card.Code,
      CardNumber: card.CardNumber,
      CustomerId: card.CustomerID,
      CustomerName: card.Customer?.Name,
      CustomerCode: card.Customer?.Code,
      CardType: card.CardType,
      Balance: number(card.Balance),
      MinimumBalance: number(card.MinimumBalance),
      IsLowBalance: number(card.Balance) < Number(card.MinimumBalance),
      IsActive: card.IsActive,
      Status: card.Status?.Name,
      Notes: card.Notes,
      CreatedAt: card.CreatedAt,
      UpdatedAt: card.UpdatedAt,
    };
  }

  private getCardTypeFromGroup(GroupName: string | undefined): string {
    if (!GroupName) return 'STANDARD';

    const lowerName = GroupName.toLowerCase();
    if (lowerName.includes('platinum')) return 'PLATINUM';
    if (lowerName.includes('gold')) return 'GOLD';
    if (lowerName.includes('silver')) return 'SILVER';
    return 'STANDARD';
  }

  private getMinimumBalanceByType(CardType: string): Prisma.Decimal {
    switch (CardType) {
      case 'PLATINUM':
        return new Prisma.Decimal(500000);
      case 'GOLD':
        return new Prisma.Decimal(250000);
      case 'SILVER':
        return new Prisma.Decimal(100000);
      default:
        return new Prisma.Decimal(50000);
    }
  }

  private async generateCardCode(): Promise<string> {
    const prefix = 'CARD';
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    const lastCard = await this.prisma.memberCard.findFirst({
      where: { Code: { startsWith: `${prefix}-${year}${month}` } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastCard) {
      const lastSeq = parseInt(lastCard.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${year}${month}-${String(nextNumber).padStart(4, '0')}`;
  }

  private async generateNewCardNumber(): Promise<string> {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `MC${timestamp}${random}`;
  }
}
