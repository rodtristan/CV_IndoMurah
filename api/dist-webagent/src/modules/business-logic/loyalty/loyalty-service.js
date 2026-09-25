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
exports.LoyaltyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let LoyaltyService = class LoyaltyService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPointSettings() {
        let settings = await this.prisma.pointSetting.findFirst({
            where: { IsActive: true },
        });
        if (!settings) {
            settings = await this.prisma.pointSetting.create({
                data: {
                    Name: 'Default Loyalty Program',
                    PointsPerRupiah: new client_1.Prisma.Decimal(0.001),
                    MinimumTransaction: new client_1.Prisma.Decimal(1000),
                    IsActive: true,
                },
            });
        }
        return {
            ID: settings.ID,
            Name: settings.Name,
            PointsPerRupiah: (0, number_1.number)(settings.PointsPerRupiah),
            MinimumTransaction: (0, number_1.number)(settings.MinimumTransaction),
            IsActive: settings.IsActive,
        };
    }
    async updatePointSettings(dto, UserId) {
        let settings = await this.prisma.pointSetting.findFirst({
            where: { IsActive: true },
        });
        if (!settings) {
            settings = await this.prisma.pointSetting.create({
                data: {
                    Name: 'Loyalty Program',
                    PointsPerRupiah: new client_1.Prisma.Decimal(dto.PointsPerRupiah),
                    MinimumTransaction: new client_1.Prisma.Decimal(dto.MinimumTransaction),
                    IsActive: true,
                },
            });
        }
        else {
            await this.prisma.pointSetting.update({
                where: { ID: settings.ID },
                data: {
                    PointsPerRupiah: new client_1.Prisma.Decimal(dto.PointsPerRupiah),
                    MinimumTransaction: new client_1.Prisma.Decimal(dto.MinimumTransaction),
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
    async calculatePoints(dto) {
        const settings = await this.getPointSettings();
        if (dto.Amount < Number(settings.MinimumTransaction)) {
            return {
                eligible: false,
                Amount: dto.Amount,
                MinimumRequired: (0, number_1.number)(settings.MinimumTransaction),
                PointsEarned: 0,
                message: `Minimum Purchase of ${settings.MinimumTransaction} required to earn Points`,
            };
        }
        const PointsEarned = Math.floor(dto.Amount * Number(settings.PointsPerRupiah));
        return {
            eligible: true,
            Amount: dto.Amount,
            PointsPerRupiah: (0, number_1.number)(settings.PointsPerRupiah),
            PointsEarned,
            message: `You will earn ${PointsEarned} Points from this Purchase`,
        };
    }
    async awardPoints(dto, UserId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: dto.CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        await this.prisma.customer.update({
            where: { ID: dto.CustomerId },
            data: {
                PointBalance: { increment: dto.Points },
            },
        });
        await this.prisma.activityLog.create({
            data: {
                Type: 'POINT_EARNED',
                Title: 'Points Awarded',
                Description: `${dto.Points} Points awarded to ${Customer.Name}. ${dto.Reason || ''}`,
                ReferenceType: 'CUSTOMER',
                ReferenceID: dto.CustomerId,
                Amount: new client_1.Prisma.Decimal(dto.Points),
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
    async getCustomerPoints(CustomerId) {
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
            throw new common_1.NotFoundException('Customer not found');
        }
        const settings = await this.getPointSettings();
        return {
            CustomerId: Customer.ID,
            CustomerName: Customer.Name,
            CustomerCode: Customer.Code,
            CustomerGroup: Customer.CustomerGroup?.Name || 'Default',
            CurrentPoints: Customer.PointBalance,
            PointsPerRupiah: (0, number_1.number)(settings.PointsPerRupiah),
            MinimumTransaction: (0, number_1.number)(settings.MinimumTransaction),
            recentRedemptions: Customer.PointRedemptions.map((r) => ({
                ID: r.ID,
                Code: r.Code,
                PointsRedeemed: r.PointsRedeemed,
                rewardName: r.RewardName,
                rewardValue: (0, number_1.number)(r.RewardValue),
                Date: r.Date,
            })),
        };
    }
    async redeemPoints(CustomerId, dto, UserId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        if (Customer.PointBalance < dto.Points) {
            throw new common_1.BadRequestException(`Insufficient Points. Available: ${Customer.PointBalance}, Required: ${dto.Points}`);
        }
        const Code = await this.generateRedemptionCode();
        await this.prisma.$transaction(async (tx) => {
            await tx.pointRedemption.create({
                data: {
                    CustomerID: CustomerId,
                    Code: Code,
                    PointsRedeemed: dto.Points,
                    RewardName: dto.RewardName,
                    RewardValue: new client_1.Prisma.Decimal(0),
                    CreatedByID: UserId,
                },
            });
            await tx.customer.update({
                where: { ID: CustomerId },
                data: {
                    PointBalance: { decrement: dto.Points },
                },
            });
            await tx.activityLog.create({
                data: {
                    Type: 'POINT_REDEEMED',
                    Title: 'Points Redeemed',
                    Description: `${dto.Points} Points redeemed by ${Customer.Name} for ${dto.RewardName}`,
                    ReferenceType: 'CUSTOMER',
                    ReferenceID: CustomerId,
                    Amount: new client_1.Prisma.Decimal(dto.Points),
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
    async listRedemptions(dto) {
        const where = {};
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
            rewardValue: (0, number_1.number)(r.RewardValue),
            Date: r.Date,
        }));
    }
    async getLoyaltyStats(startDate, endDate) {
        const where = {};
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
    async generateRedemptionCode() {
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
};
exports.LoyaltyService = LoyaltyService;
exports.LoyaltyService = LoyaltyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoyaltyService);
