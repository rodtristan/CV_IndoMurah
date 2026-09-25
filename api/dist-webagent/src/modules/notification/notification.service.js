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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const base_service_1 = require("../../common/templates/base.service");
let NotificationService = class NotificationService extends base_service_1.BaseService {
    constructor(prisma, redis, queryService) {
        super(prisma, redis, queryService, {
            modelName: 'notification',
            primaryKey: 'ID',
            searchableFields: ['*'],
            allowedIncludes: ['*'],
            allowedSortFields: ['*'],
            allowedSelectFields: ['*'],
            defaultOrderBy: { CreatedAt: 'desc' },
            maxTake: 100,
            defaultTake: 20,
            cacheTtl: 10,
            softDelete: true,
            softDeleteField: 'IsActive',
        });
        this.prisma = prisma;
        this.redis = redis;
        this.queryService = queryService;
    }
    async resolveTypeId(typeCode, fallbackCode) {
        const type = await this.prisma.notificationType.findUnique({
            where: { Code: typeCode || fallbackCode },
        });
        if (!type)
            throw new common_1.BadRequestException(`Tipe notifikasi '${typeCode || fallbackCode}' tidak ditemukan`);
        return type.ID;
    }
    async createNotification(dto) {
        const typeId = await this.resolveTypeId(dto.typeCode, 'REMINDER');
        const result = await this.prisma.notification.create({
            data: {
                UserID: dto.userId,
                Title: dto.title,
                Message: dto.message,
                TypeID: typeId,
                ReferenceType: dto.referenceType,
                ReferenceID: dto.referenceId,
            },
            include: { Type: true },
        });
        await this.invalidateCache();
        return result;
    }
    async notify(params) {
        try {
            const typeId = await this.resolveTypeId(params.typeCode, 'REMINDER');
            await this.prisma.notification.create({
                data: {
                    UserID: params.userId,
                    Title: params.title,
                    Message: params.message,
                    TypeID: typeId,
                    ReferenceType: params.referenceType,
                    ReferenceID: params.referenceId,
                },
            });
            await this.invalidateCache();
        }
        catch {
        }
    }
    async unreadCount(userId) {
        return this.prisma.notification.count({
            where: {
                IsRead: false,
                IsActive: true,
                OR: [{ UserID: null }, { UserID: userId }],
            },
        });
    }
    async markRead(id) {
        const result = await this.prisma.notification.update({
            where: { ID: id },
            data: { IsRead: true },
        });
        await this.invalidateCache();
        return result;
    }
    async markAllRead(userId) {
        const result = await this.prisma.notification.updateMany({
            where: {
                IsRead: false,
                OR: [{ UserID: null }, { UserID: userId }],
            },
            data: { IsRead: true },
        });
        await this.invalidateCache();
        return { count: result.count };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService])
], NotificationService);
