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
exports.AuthzService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma-service");
const redis_service_1 = require("../redis/redis-service");
const ACCESS_TTL = 30;
const ADMIN_ROLE_NAMES = ['administrator', 'admin'];
let AuthzService = class AuthzService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    key(userId) {
        return `authz:user:${userId}`;
    }
    async getAccess(userId) {
        const cached = await this.redis.get(this.key(userId));
        if (cached && typeof cached.isActive === 'boolean')
            return cached;
        const user = await this.prisma.user.findUnique({
            where: { ID: userId },
            select: {
                IsActive: true,
                Role: true,
                UserRoles: {
                    where: { IsActive: true, Role: { IsActive: true } },
                    select: { Role: { select: { RoleName: true } } },
                },
            },
        });
        const access = user
            ? {
                exists: true,
                isActive: !!user.IsActive,
                isAdmin: String(user.Role ?? '').toLowerCase() === 'admin' ||
                    user.UserRoles.some((ur) => ADMIN_ROLE_NAMES.includes(String(ur.Role?.RoleName ?? '').trim().toLowerCase())),
            }
            : { exists: false, isActive: false, isAdmin: false };
        await this.redis.set(this.key(userId), access, ACCESS_TTL);
        return access;
    }
    async invalidate(userId) {
        if (userId)
            await this.redis.del(this.key(userId));
        else
            await this.redis.invalidatePattern('authz:user:*');
    }
};
exports.AuthzService = AuthzService;
exports.AuthzService = AuthzService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], AuthzService);
