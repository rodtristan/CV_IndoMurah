"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const menu_service_1 = require("../menu/menu-service");
const authz_service_1 = require("../../common/auth/authz-service");
let UserService = class UserService {
    constructor(prisma, redis, queryService, menuService, authz) {
        this.prisma = prisma;
        this.redis = redis;
        this.queryService = queryService;
        this.menuService = menuService;
        this.authz = authz;
        this.CACHE_PREFIX = 'users';
        this.CACHE_TTL = 60;
    }
    async findAll(query) {
        const cacheKey = this.queryService.generateCacheKey(this.CACHE_PREFIX, query);
        return this.redis.getOrSet(cacheKey, async () => {
            const prismaQuery = this.queryService.buildPrismaQuery(query, {
                searchableFields: ['Name', 'Email'],
                allowedIncludes: ['UserRoles'],
                defaultOrderBy: { CreatedAt: 'desc' },
            });
            const findArgs = {
                where: prismaQuery.where,
                orderBy: prismaQuery.orderBy,
                skip: prismaQuery.skip,
                take: prismaQuery.take,
            };
            if (prismaQuery.select) {
                findArgs.select = prismaQuery.select;
            }
            else if (prismaQuery.include) {
                findArgs.include = prismaQuery.include;
            }
            const [data, total] = await Promise.all([
                this.prisma.user.findMany(findArgs),
                this.prisma.user.count({ where: prismaQuery.where }),
            ]);
            return { data, total, skip: prismaQuery.skip, take: prismaQuery.take };
        }, this.CACHE_TTL);
    }
    async findOne(id, query = {}) {
        const cacheKey = `${this.CACHE_PREFIX}:${id}:${this.queryService.generateCacheKey('q', query)}`;
        return this.redis.getOrSet(cacheKey, async () => {
            const prismaQuery = this.queryService.buildPrismaQuery(query, {
                allowedIncludes: ['UserRoles', 'UserMenus'],
            });
            const findArgs = { where: { ID: id } };
            if (prismaQuery.select) {
                findArgs.select = prismaQuery.select;
            }
            else if (prismaQuery.include) {
                findArgs.include = prismaQuery.include;
            }
            return this.prisma.user.findUnique(findArgs);
        }, this.CACHE_TTL);
    }
    async create(dto) {
        const exists = await this.prisma.user.count({
            where: { CompanyID: dto.companyId, Username: dto.username },
        });
        if (exists > 0) {
            throw new common_1.ConflictException('Username sudah terdaftar di perusahaan ini');
        }
        const hashedPassword = await argon2.hash(dto.password, { type: argon2.argon2id });
        const user = await this.prisma.user.create({
            data: {
                CompanyID: dto.companyId,
                Username: dto.username,
                Email: dto.email,
                Password: hashedPassword,
                Name: dto.name,
                Role: 'cashier',
                IsActive: true,
            },
        });
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        return user;
    }
    async update(id, dto) {
        const user = await this.prisma.user.findUnique({ where: { ID: id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const data = {};
        if (dto.username !== undefined)
            data.Username = dto.username;
        if (dto.email !== undefined)
            data.Email = dto.email;
        if (dto.name !== undefined)
            data.Name = dto.name;
        if (dto.isActive !== undefined)
            data.IsActive = dto.isActive;
        const updated = await this.prisma.user.update({ where: { ID: id }, data });
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        await this.redis.del(`user:me:${id}`);
        await this.authz.invalidate(id);
        return updated;
    }
    async softDelete(id) {
        const user = await this.prisma.user.findUnique({ where: { ID: id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const updated = await this.prisma.user.update({
            where: { ID: id },
            data: { IsActive: false },
        });
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        await this.redis.del(`user:me:${id}`);
        await this.authz.invalidate(id);
        return updated;
    }
    async getRoles(userId) {
        const user = await this.prisma.user.findUnique({
            where: { ID: userId },
            select: { Role: true, UserRoles: { where: { IsActive: true }, include: { Role: true } } },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return { mainRole: user.Role, extraRoles: user.UserRoles.map((ur) => ur.Role) };
    }
    async assignRole(userId, roleId) {
        const [user, role] = await Promise.all([
            this.prisma.user.findUnique({ where: { ID: userId } }),
            this.prisma.role.findUnique({ where: { ID: roleId } }),
        ]);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        const existing = await this.prisma.userRole.findUnique({
            where: { UserID_RoleID: { UserID: userId, RoleID: roleId } },
        });
        if (existing?.IsActive) {
            throw new common_1.ConflictException('User already has this role');
        }
        const userRole = await this.prisma.userRole.upsert({
            where: { UserID_RoleID: { UserID: userId, RoleID: roleId } },
            create: { UserID: userId, RoleID: roleId, IsActive: true },
            update: { IsActive: true },
        });
        await this.menuService.provisionUserMenusFromRole(userId, roleId);
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        await this.redis.del(`user:me:${userId}`);
        await this.authz.invalidate(userId);
        return userRole;
    }
    async revokeRole(userId, roleId) {
        const existing = await this.prisma.userRole.findUnique({
            where: { UserID_RoleID: { UserID: userId, RoleID: roleId } },
        });
        if (!existing)
            throw new common_1.NotFoundException('User does not have this role');
        const userRole = await this.prisma.userRole.update({
            where: { UserID_RoleID: { UserID: userId, RoleID: roleId } },
            data: { IsActive: false },
        });
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        await this.redis.del(`user:me:${userId}`);
        await this.authz.invalidate(userId);
        return userRole;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService,
        menu_service_1.MenuService,
        authz_service_1.AuthzService])
], UserService);
