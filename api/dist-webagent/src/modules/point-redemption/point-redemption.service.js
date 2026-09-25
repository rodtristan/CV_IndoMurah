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
exports.PointRedemptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const base_service_1 = require("../../common/templates/base.service");
let PointRedemptionService = class PointRedemptionService extends base_service_1.BaseService {
    constructor(prisma, redis, queryService) {
        super(prisma, redis, queryService, {
            modelName: 'pointRedemption',
            primaryKey: 'ID',
            searchableFields: ['*'],
            allowedIncludes: ['*'],
            allowedSortFields: ['*'],
            allowedSelectFields: ['*'],
            defaultOrderBy: { CreatedAt: 'desc' },
            maxTake: 100,
            defaultTake: 20,
            cacheTtl: 60,
            softDelete: false,
        });
    }
    async create(dto) {
        return this.prisma.$transaction(async (tx) => {
            const customer = await tx.customer.findUnique({ where: { ID: dto.customerId } });
            if (!customer)
                throw new common_1.BadRequestException('Pelanggan tidak ditemukan');
            if (customer.PointBalance < dto.pointsRedeemed) {
                throw new common_1.BadRequestException('Point pelanggan tidak cukup');
            }
            const result = await tx.pointRedemption.create({
                data: {
                    CustomerID: dto.customerId,
                    Code: dto.code,
                    PointsRedeemed: dto.pointsRedeemed,
                    RewardName: dto.rewardName,
                    RewardValue: dto.rewardValue,
                    Date: dto.date,
                    CreatedByID: dto.createdById,
                },
            });
            await tx.customer.update({
                where: { ID: dto.customerId },
                data: { PointBalance: { decrement: dto.pointsRedeemed } },
            });
            await this.invalidateCache();
            await this.redis.invalidatePattern('customer:*');
            return result;
        });
    }
    async deleteById(id) {
        return this.prisma.$transaction(async (tx) => {
            const redemption = await tx.pointRedemption.findUnique({ where: { ID: Number(id) } });
            if (!redemption)
                throw new common_1.BadRequestException('Data point redemption tidak ditemukan');
            const result = await tx.pointRedemption.delete({ where: { ID: Number(id) } });
            await tx.customer.update({
                where: { ID: redemption.CustomerID },
                data: { PointBalance: { increment: redemption.PointsRedeemed } },
            });
            await this.invalidateCache();
            await this.redis.invalidatePattern('customer:*');
            return result;
        });
    }
};
exports.PointRedemptionService = PointRedemptionService;
exports.PointRedemptionService = PointRedemptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService])
], PointRedemptionService);
