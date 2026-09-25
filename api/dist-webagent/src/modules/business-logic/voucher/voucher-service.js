"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoucherService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let VoucherService = class VoucherService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createVoucher(dto, UserId) {
        const existing = await this.prisma.voucher.findUnique({
            where: { Code: dto.Code },
        });
        if (existing) {
            throw new common_1.BadRequestException('Voucher Code already exists');
        }
        const VoucherType = await this.prisma.voucherType.findUnique({
            where: { ID: dto.TypeId },
        });
        if (!VoucherType) {
            throw new common_1.NotFoundException('Voucher Type not found');
        }
        const Voucher = await this.prisma.voucher.create({
            data: {
                Code: dto.Code,
                Name: dto.Name,
                TypeID: dto.TypeId,
                Value: new client_1.Prisma.Decimal(dto.Value),
                MinPurchaseAmount: new client_1.Prisma.Decimal(dto.MinPurchaseAmount || 0),
                MaxDiscountAmount: dto.MaxDiscountAmount ? new client_1.Prisma.Decimal(dto.MaxDiscountAmount) : null,
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
                Value: (0, number_1.number)(Voucher.Value),
                minPurchaseAmount: (0, number_1.number)(Voucher.MinPurchaseAmount),
                maxDiscountAmount: Voucher.MaxDiscountAmount ? Number(Voucher.MaxDiscountAmount) : null,
                startDate: Voucher.StartDate,
                endDate: Voucher.EndDate,
                usageLimit: Voucher.UsageLimit,
                usedCount: Voucher.UsedCount,
                IsActive: Voucher.IsActive,
            },
        };
    }
    async updateVoucher(VoucherId, dto, UserId) {
        const Voucher = await this.prisma.voucher.findUnique({
            where: { ID: VoucherId },
        });
        if (!Voucher) {
            throw new common_1.NotFoundException('Voucher not found');
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
    async getVoucher(VoucherId) {
        const Voucher = await this.prisma.voucher.findUnique({
            where: { ID: VoucherId },
            include: { Type: true },
        });
        if (!Voucher) {
            throw new common_1.NotFoundException('Voucher not found');
        }
        return {
            ID: Voucher.ID,
            Code: Voucher.Code,
            Name: Voucher.Name,
            Type: Voucher.Type,
            Value: (0, number_1.number)(Voucher.Value),
            minPurchaseAmount: (0, number_1.number)(Voucher.MinPurchaseAmount),
            maxDiscountAmount: Voucher.MaxDiscountAmount ? Number(Voucher.MaxDiscountAmount) : null,
            startDate: Voucher.StartDate,
            endDate: Voucher.EndDate,
            usageLimit: Voucher.UsageLimit,
            usedCount: Voucher.UsedCount,
            remainingUses: Voucher.UsageLimit ? Voucher.UsageLimit - Voucher.UsedCount : null,
            IsActive: Voucher.IsActive,
        };
    }
    async listVouchers(dto) {
        const where = {};
        if (dto.ActiveOnly) {
            where.IsActive = true;
        }
        if (dto.ValidOnly) {
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
            Value: (0, number_1.number)(v.Value),
            minPurchaseAmount: (0, number_1.number)(v.MinPurchaseAmount),
            startDate: v.StartDate,
            endDate: v.EndDate,
            usageLimit: v.UsageLimit,
            usedCount: v.UsedCount,
            IsActive: v.IsActive,
            isExpired: v.EndDate < new Date(),
        }));
    }
    async validateVoucher(dto) {
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
        let discountAmount = 0;
        if (Voucher.Type.Code === 'PERCENT') {
            discountAmount = dto.PurchaseAmount * (Number(Voucher.Value) / 100);
            if (Voucher.MaxDiscountAmount && discountAmount > Number(Voucher.MaxDiscountAmount)) {
                discountAmount = Number(Voucher.MaxDiscountAmount);
            }
        }
        else {
            discountAmount = Number(Voucher.Value);
        }
        discountAmount = Math.min(discountAmount, dto.PurchaseAmount);
        return {
            valID: true,
            Voucher: {
                ID: Voucher.ID,
                Code: Voucher.Code,
                Name: Voucher.Name,
                Type: Voucher.Type.Name,
                TypeCode: Voucher.Type.Code,
                Value: (0, number_1.number)(Voucher.Value),
                maxDiscountAmount: Voucher.MaxDiscountAmount ? Number(Voucher.MaxDiscountAmount) : null,
            },
            calculation: {
                PurchaseAmount: dto.PurchaseAmount,
                discountAmount: Math.round(discountAmount),
                finalAmount: Math.round(dto.PurchaseAmount - discountAmount),
            },
        };
    }
    async useVoucher(VoucherId, UserId) {
        const Voucher = await this.prisma.voucher.findUnique({
            where: { ID: VoucherId },
        });
        if (!Voucher) {
            throw new common_1.NotFoundException('Voucher not found');
        }
        if (!Voucher.IsActive) {
            throw new common_1.BadRequestException('Voucher is not Active');
        }
        const now = new Date();
        if (Voucher.EndDate < now) {
            throw new common_1.BadRequestException('Voucher has expired');
        }
        if (Voucher.UsageLimit && Voucher.UsedCount >= Voucher.UsageLimit) {
            throw new common_1.BadRequestException('Voucher usage limit reached');
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
    async deleteVoucher(VoucherId, UserId) {
        const Voucher = await this.prisma.voucher.findUnique({
            where: { ID: VoucherId },
        });
        if (!Voucher) {
            throw new common_1.NotFoundException('Voucher not found');
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
};
exports.VoucherService = VoucherService;
exports.VoucherService = VoucherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VoucherService);
