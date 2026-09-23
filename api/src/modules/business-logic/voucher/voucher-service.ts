import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateVoucherDto,
  UpDateVoucherDto,
  ValidateVoucherDto,
  VoucherFilterDto,
} from './Voucher.dto';

@Injectable()
export class VoucherService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // VOUCHER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new Voucher
   * Flow: Marketing buat Voucher promosi
   */
  async createVoucher(dto: CreateVoucherDto, UserId: string) {
    // Check for duplicate Code
    const existing = await this.prisma.voucher.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException('Voucher Code already exists');
    }

    // Validate Voucher Type
    const VoucherType = await this.prisma.voucherType.findUnique({
      where: { ID: dto.TypeId },
    });

    if (!VoucherType) {
      throw new NotFoundException('Voucher Type not found');
    }

    const Voucher = await this.prisma.voucher.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        TypeID: dto.TypeId,
        Value: new Prisma.Decimal(dto.Value),
        MinPurchaseAmount: new Prisma.Decimal(dto.MinPurchaseAmount || 0),
        MaxDiscountAmount: dto.MaxDiscountAmount ? new Prisma.Decimal(dto.MaxDiscountAmount) : null,
        StartDate: new Date(dto.StartDate),
        EndDate: new Date(dto.EndDate),
        UsageLimit: dto.UsageLimit,
        UsedCount: 0,
        IsActive: true,
      },
      include: { Type: true },
    });

    return {
      success: true,
      Voucher: {
        ID: Voucher.ID,
        Code: Voucher.Code,
        Name: Voucher.Name,
        Type: Voucher.Type.Name,
        TypeCode: Voucher.Type.Code,
        Value: number(Voucher.Value),
        minPurchaseAmount: number(Voucher.MinPurchaseAmount),
        maxDiscountAmount: Voucher.MaxDiscountAmount ? Number(Voucher.MaxDiscountAmount) : null,
        startDate: Voucher.StartDate,
        endDate: Voucher.EndDate,
        usageLimit: Voucher.UsageLimit,
        usedCount: Voucher.UsedCount,
        IsActive: Voucher.IsActive,
      },
    };
  }

  /**
   * UpDate Voucher
   */
  async updateVoucher(VoucherId: number, dto: UpDateVoucherDto, UserId: string) {
    const Voucher = await this.prisma.voucher.findUnique({
      where: { ID: VoucherId },
    });

    if (!Voucher) {
      throw new NotFoundException('Voucher not found');
    }

    const updated = await this.prisma.voucher.update({
      where: { ID: VoucherId },
      data: {
        Name: dto.Name,
        EndDate: dto.EndDate ? new Date(dto.EndDate) : undefined,
        UsageLimit: dto.UsageLimit,
        IsActive: dto.IsActive,
      },
      include: { Type: true },
    });

    return {
      success: true,
      Voucher: {
        ID: updated.ID,
        Code: updated.Code,
        Name: updated.Name,
        endDate: updated.EndDate,
        usageLimit: updated.UsageLimit,
        usedCount: updated.UsedCount,
        IsActive: updated.IsActive,
      },
    };
  }

  /**
   * Get Voucher by ID
   */
  async getVoucher(VoucherId: number) {
    const Voucher = await this.prisma.voucher.findUnique({
      where: { ID: VoucherId },
      include: { Type: true },
    });

    if (!Voucher) {
      throw new NotFoundException('Voucher not found');
    }

    return {
      ID: Voucher.ID,
      Code: Voucher.Code,
      Name: Voucher.Name,
      Type: Voucher.Type,
      Value: number(Voucher.Value),
      minPurchaseAmount: number(Voucher.MinPurchaseAmount),
      maxDiscountAmount: Voucher.MaxDiscountAmount ? Number(Voucher.MaxDiscountAmount) : null,
      startDate: Voucher.StartDate,
      endDate: Voucher.EndDate,
      usageLimit: Voucher.UsageLimit,
      usedCount: Voucher.UsedCount,
      remainingUses: Voucher.UsageLimit ? Voucher.UsageLimit - Voucher.UsedCount : null,
      IsActive: Voucher.IsActive,
    };
  }

  /**
   * List Vouchers
   */
  async listVouchers(dto: VoucherFilterDto) {
    const where: any = {};

    if (dto.ActiveOnly) {
      where.IsActive = true;
    }

    if (dto.valIDOnly) {
      const now = new Date();
      where.StartDate = { lte: now };
      where.EndDate = { gte: now };
    }

    const Vouchers = await this.prisma.voucher.findMany({
      where,
      include: { Type: true },
      orderBy: { CreatedAt: 'desc' },
    });

    return Vouchers.map((v) => ({
      ID: v.ID,
      Code: v.Code,
      Name: v.Name,
      Type: v.Type.Name,
      TypeCode: v.Type.Code,
      Value: number(v.Value),
      minPurchaseAmount: number(v.MinPurchaseAmount),
      startDate: v.StartDate,
      endDate: v.EndDate,
      usageLimit: v.UsageLimit,
      usedCount: v.UsedCount,
      IsActive: v.IsActive,
      isExpired: v.EndDate < new Date(),
    }));
  }

  /**
   * Validate Voucher
   * Flow: Kasir input Voucher → sistem valIDasi
   */
  async valIDateVoucher(dto: ValidateVoucherDto) {
    const Voucher = await this.prisma.voucher.findFirst({
      where: { Code: dto.Code },
      include: { Type: true },
    });

    if (!Voucher) {
      return {
        valID: false,
        error: 'VOUCHER_NOT_FOUND',
        message: 'Voucher not found',
      };
    }

    if (!Voucher.IsActive) {
      return {
        valID: false,
        error: 'VOUCHER_INACTIVE',
        message: 'Voucher is no longer Active',
      };
    }

    const now = new Date();
    if (Voucher.StartDate > now) {
      return {
        valID: false,
        error: 'VOUCHER_NOT_STARTED',
        message: 'Voucher is not yet valID',
      };
    }

    if (Voucher.EndDate < now) {
      return {
        valID: false,
        error: 'VOUCHER_EXPIRED',
        message: 'Voucher has expired',
      };
    }

    if (Voucher.UsageLimit && Voucher.UsedCount >= Voucher.UsageLimit) {
      return {
        valID: false,
        error: 'VOUCHER_LIMIT_REACHED',
        message: 'Voucher usage limit reached',
      };
    }

    if (dto.PurchaseAmount < Number(Voucher.MinPurchaseAmount)) {
      return {
        valID: false,
        error: 'MIN_PURCHASE_NOT_MET',
        message: `Minimum Purchase of ${Voucher.MinPurchaseAmount} required`,
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (Voucher.Type.Code === 'PERCENT') {
      discountAmount = dto.PurchaseAmount * (Number(Voucher.Value) / 100);
      if (Voucher.MaxDiscountAmount && discountAmount > Number(Voucher.MaxDiscountAmount)) {
        discountAmount = Number(Voucher.MaxDiscountAmount);
      }
    } else {
      discountAmount = Number(Voucher.Value);
    }

    // Ensure discount doesn't exceed Purchase Amount
    discountAmount = Math.min(discountAmount, dto.PurchaseAmount);

    return {
      valID: true,
      Voucher: {
        ID: Voucher.ID,
        Code: Voucher.Code,
        Name: Voucher.Name,
        Type: Voucher.Type.Name,
        TypeCode: Voucher.Type.Code,
        Value: number(Voucher.Value),
        maxDiscountAmount: Voucher.MaxDiscountAmount ? Number(Voucher.MaxDiscountAmount) : null,
      },
      calculation: {
        PurchaseAmount: dto.PurchaseAmount,
        discountAmount: Math.round(discountAmount),
        finalAmount: Math.round(dto.PurchaseAmount - discountAmount),
      },
    };
  }

  /**
   * Use Voucher (increment used Count)
   * Flow: Voucher digunakan saat Checkout
   */
  async useVoucher(VoucherId: number, UserId: string) {
    const Voucher = await this.prisma.voucher.findUnique({
      where: { ID: VoucherId },
    });

    if (!Voucher) {
      throw new NotFoundException('Voucher not found');
    }

    if (!Voucher.IsActive) {
      throw new BadRequestException('Voucher is not Active');
    }

    const now = new Date();
    if (Voucher.EndDate < now) {
      throw new BadRequestException('Voucher has expired');
    }

    if (Voucher.UsageLimit && Voucher.UsedCount >= Voucher.UsageLimit) {
      throw new BadRequestException('Voucher usage limit reached');
    }

    const updated = await this.prisma.voucher.update({
      where: { ID: VoucherId },
      data: {
        UsedCount: { increment: 1 },
      },
    });

    return {
      success: true,
      VoucherId,
      Code: updated.Code,
      usedCount: updated.UsedCount,
      remainingUses: updated.UsageLimit ? updated.UsageLimit - updated.UsedCount : null,
    };
  }

  /**
   * Delete Voucher (soft delete - set inActive)
   */
  async deleteVoucher(VoucherId: number, UserId: string) {
    const Voucher = await this.prisma.voucher.findUnique({
      where: { ID: VoucherId },
    });

    if (!Voucher) {
      throw new NotFoundException('Voucher not found');
    }

    await this.prisma.voucher.update({
      where: { ID: VoucherId },
      data: { IsActive: false },
    });

    return {
      success: true,
      VoucherId,
      Code: Voucher.Code,
      message: 'Voucher deactivated',
    };
  }
}
