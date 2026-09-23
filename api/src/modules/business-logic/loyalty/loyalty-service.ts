import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  UpDatePointSettingsDto,
  CreatePointRedemptionDto,
  RedeemPointsDto,
  CalculatePointsDto,
  AwardPointsDto,
  RedemptionFilterDto,
} from './loyalty.dto';

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // POINT SETTINGS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get current Point settings
   */
  async getPointSettings() {
    let settings = await this.prisma.pointSetting.findFirst({
      where: { IsActive: true },
    });

    // Create Default settings if not exists
    if (!settings) {
      settings = await this.prisma.pointSetting.create({
        data: {
          Name: 'Default Loyalty Program',
          PointsPerRupiah: new Prisma.Decimal(0.001), // 1 Point per 1000 Rupiah
          MinimumTransaction: new Prisma.Decimal(1000),
          IsActive: true,
        },
      });
    }

    return {
      ID: settings.ID,
      Name: settings.Name,
      PointsPerRupiah: number(settings.PointsPerRupiah),
      MinimumTransaction: number(settings.MinimumTransaction),
      IsActive: settings.IsActive,
    };
  }

  /**
   * UpDate Point settings
   */
  async updatePointSettings(dto: UpDatePointSettingsDto, UserId: string) {
    let settings = await this.prisma.pointSetting.findFirst({
      where: { IsActive: true },
    });

    if (!settings) {
      settings = await this.prisma.pointSetting.create({
        data: {
          Name: 'Loyalty Program',
          PointsPerRupiah: new Prisma.Decimal(dto.PointsPerRupiah),
          MinimumTransaction: new Prisma.Decimal(dto.MinimumTransaction),
          IsActive: true,
        },
      });
    } else {
      await this.prisma.pointSetting.update({
        where: { ID: settings.ID },
        data: {
          PointsPerRupiah: new Prisma.Decimal(dto.PointsPerRupiah),
          MinimumTransaction: new Prisma.Decimal(dto.MinimumTransaction),
        },
      });
    }

    return {
      success: true,
      settings: {
        PointsPerRupiah: dto.PointsPerRupiah,
        MinimumTransaction: dto.MinimumTransaction,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POINT CALCULATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Calculate Points for a transaction
   * Flow: Setelah transaksi → hitung berapa poin yang dIDapat
   */
  async calculatePoints(dto: CalculatePointsDto) {
    const settings = await this.getPointSettings();

    if (dto.Amount < Number(settings.MinimumTransaction)) {
      return {
        eligible: false,
        Amount: dto.Amount,
        MinimumRequired: number(settings.MinimumTransaction),
        PointsEarned: 0,
        message: `Minimum Purchase of ${settings.MinimumTransaction} required to earn Points`,
      };
    }

    const PointsEarned = Math.floor(dto.Amount * Number(settings.PointsPerRupiah));

    return {
      eligible: true,
      Amount: dto.Amount,
      PointsPerRupiah: number(settings.PointsPerRupiah),
      PointsEarned,
      message: `You will earn ${PointsEarned} Points from this Purchase`,
    };
  }

  /**
   * Award Points to Customer
   * Flow: Setelah transaksi sukses → tambahkan poin ke Customer
   */
  async awardPoints(dto: AwardPointsDto, UserId: string) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: dto.CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.prisma.customer.update({
      where: { ID: dto.CustomerId },
      data: {
        PointBalance: { increment: dto.Points },
      },
    });

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        Type: 'POINT_EARNED',
        Title: 'Points Awarded',
        Description: `${dto.Points} Points awarded to ${Customer.Name}. ${dto.Reason || ''}`,
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
      PointsAwarded: dto.Points,
      newBalance: Customer.PointBalance + dto.Points,
      reason: dto.Reason,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOMER POINTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get Customer Points Summary
   */
  async getCustomerPoints(CustomerId: number) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: CustomerId },
      include: {
        CustomerGroup: true,
        PointRedemptions: {
          orderBy: { Date: 'desc' },
          take: 10,
        },
      },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    const settings = await this.getPointSettings();

    return {
      CustomerId: Customer.ID,
      CustomerName: Customer.Name,
      CustomerCode: Customer.Code,
      CustomerGroup: Customer.CustomerGroup?.Name || 'Default',
      CurrentPoints: Customer.PointBalance,
      PointsPerRupiah: number(settings.PointsPerRupiah),
      MinimumTransaction: number(settings.MinimumTransaction),
      recentRedemptions: Customer.PointRedemptions.map((r) => ({
        ID: r.ID,
        Code: r.Code,
        PointsRedeemed: r.PointsRedeemed,
        rewardName: r.RewardName,
        rewardValue: number(r.RewardValue),
        Date: r.Date,
      })),
    };
  }

  /**
   * Redeem Customer Points
   * Flow: Pelanggan tukar poin → dapat reward
   */
  async redeemPoints(CustomerId: number, dto: RedeemPointsDto, UserId: string) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    if (Customer.PointBalance < dto.Points) {
      throw new BadRequestException(
        `Insufficient Points. Available: ${Customer.PointBalance}, Required: ${dto.Points}`,
      );
    }

    // generate redemption Code
    const Code = await this.generateRedemptionCode();

    await this.prisma.$transaction(async (tx) => {
      // Create redemption Record
      await tx.pointRedemption.create({
        data: {
          CustomerID: CustomerId,
          Code: Code,
          PointsRedeemed: dto.Points,
          RewardName: dto.RewardName,
          RewardValue: new Prisma.Decimal(0), // Default value
          CreatedByID: UserId,
        },
      });

      // Deduct Points from Customer
      await tx.customer.update({
        where: { ID: CustomerId },
        data: {
          PointBalance: { decrement: dto.Points },
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          Type: 'POINT_REDEEMED',
          Title: 'Points Redeemed',
          Description: `${dto.Points} Points redeemed by ${Customer.Name} for ${dto.RewardName}`,
          ReferenceType: 'CUSTOMER',
          ReferenceID: CustomerId,
          Amount: new Prisma.Decimal(dto.Points),
          CreatedByID: UserId,
        },
      });
    });

    return {
      success: true,
      redemption: {
        Code,
        CustomerId,
        CustomerName: Customer.Name,
        PointsRedeemed: dto.Points,
        RewardName: dto.RewardName,
        RemainingPoints: Customer.PointBalance - dto.Points,
      },
    };
  }

  /**
   * List Point redemptions
   */
  async listRedemptions(dto: RedemptionFilterDto) {
    const where: any = {};

    if (dto.CustomerId) {
      where.CustomerID = dto.CustomerId;
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

    const redemptions = await this.prisma.pointRedemption.findMany({
      where,
      include: {
        Customer: true,
      },
      orderBy: { Date: 'desc' },
    });

    return redemptions.map((r) => ({
      ID: r.ID,
      Code: r.Code,
      CustomerId: r.CustomerID,
      CustomerName: r.Customer.Name,
      CustomerCode: r.Customer.Code,
      PointsRedeemed: r.PointsRedeemed,
      rewardName: r.RewardName,
      rewardValue: number(r.RewardValue),
      Date: r.Date,
    }));
  }

  /**
   * Get loyalty program statistics
   */
  async getLoyaltyStats(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.Date = {};
      if (startDate) {
        where.Date.gte = new Date(startDate);
      }
      if (endDate) {
        where.Date.lte = new Date(endDate);
      }
    }

    const redemptions = await this.prisma.pointRedemption.findMany({
      where,
    });

    const CustomersWithPoints = await this.prisma.customer.findMany({
      where: { PointBalance: { gt: 0 } },
    });

    const settings = await this.getPointSettings();

    return {
      period: { startDate, endDate },
      TotalActiveMembers: CustomersWithPoints.length,
      TotalPointsOutstanding: CustomersWithPoints.reduce((sum, c) => sum + c.PointBalance, 0),
      TotalRedemptions: redemptions.length,
      TotalPointsRedeemed: redemptions.reduce((sum, r) => sum + r.PointsRedeemed, 0),
      TotalRewardValue: redemptions.reduce((sum, r) => sum + Number(r.RewardValue), 0),
      settings,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateRedemptionCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `REDEEM-${year}${month}`;

    const lastRedemption = await this.prisma.pointRedemption.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastRedemption) {
      const lastSeq = parseInt(lastRedemption.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
