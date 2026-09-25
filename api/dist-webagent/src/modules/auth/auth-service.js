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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const menu_service_1 = require("../menu/menu-service");
const authz_service_1 = require("../../common/auth/authz-service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, redis, menuService, configService, authz) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.redis = redis;
        this.menuService = menuService;
        this.configService = configService;
        this.authz = authz;
    }
    hashPassword(plain) {
        return argon2.hash(plain, {
            type: argon2.argon2id,
            memoryCost: this.configService.get('security.argon2MemoryCost', 65536),
            timeCost: this.configService.get('security.argon2TimeCost', 3),
            parallelism: this.configService.get('security.argon2Parallelism', 4),
        });
    }
    async login(dto) {
        const company = await this.prisma.company.findUnique({
            where: { CompanyCode: dto.companyCode },
        });
        if (!company || !company.IsActive) {
            throw new common_1.UnauthorizedException('Kode perusahaan tidak valid');
        }
        const user = await this.prisma.user.findFirst({
            where: {
                CompanyID: company.ID,
                Username: dto.username,
            },
            omit: { Password: false },
        });
        if (!user || !user.IsActive) {
            throw new common_1.UnauthorizedException('Username atau password salah');
        }
        const isValid = await argon2.verify(user.Password, dto.password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Username atau password salah');
        }
        const mainRole = await this.prisma.userRole.findFirst({
            where: { UserID: user.ID, IsActive: true },
            select: { RoleID: true },
        });
        const token = this.jwtService.sign({
            id: user.ID,
            companyId: company.ID,
            username: user.Username,
            ...(mainRole?.RoleID ? { roleId: mainRole.RoleID } : {}),
        });
        const menus = await this.menuService.getAccessibleMenus(user.ID, mainRole?.RoleID ?? null);
        return {
            token,
            user: {
                id: user.ID,
                username: user.Username,
                name: user.Name,
                role: user.Role,
                company: {
                    id: company.ID,
                    companyCode: company.CompanyCode,
                    name: company.Name,
                },
            },
            menus,
        };
    }
    async register(dto, actor) {
        const company = await this.prisma.company.findUnique({
            where: { CompanyCode: dto.companyCode },
        });
        if (!company) {
            throw new common_1.ConflictException('Kode perusahaan tidak valid');
        }
        if (actor?.companyId && company.ID !== actor.companyId) {
            throw new common_1.ForbiddenException('Tidak boleh membuat user untuk perusahaan lain');
        }
        let roleId = null;
        if (dto.roleId !== undefined && dto.roleId !== null) {
            const role = await this.prisma.role.findUnique({ where: { ID: dto.roleId } });
            if (!role || !role.IsActive)
                throw new common_1.BadRequestException('Role tidak ditemukan / tidak aktif');
            roleId = role.ID;
        }
        const exists = await this.prisma.user.count({
            where: {
                CompanyID: company.ID,
                Username: dto.username,
            },
        });
        if (exists > 0) {
            throw new common_1.ConflictException('Username sudah terdaftar di perusahaan ini');
        }
        const hashedPassword = await this.hashPassword(dto.password);
        const user = await this.prisma.user.create({
            data: {
                CompanyID: company.ID,
                Username: dto.username,
                Email: dto.email,
                Password: hashedPassword,
                Name: dto.name,
                Role: 'cashier',
                IsActive: true,
            },
            select: {
                ID: true,
                Name: true,
                Username: true,
                Email: true,
                Role: true,
                IsActive: true,
                CreatedAt: true,
                Company: {
                    select: {
                        ID: true,
                        CompanyCode: true,
                        Name: true,
                    },
                },
            },
        });
        if (roleId !== null) {
            await this.prisma.userRole.upsert({
                where: { UserID_RoleID: { UserID: user.ID, RoleID: roleId } },
                create: { UserID: user.ID, RoleID: roleId, IsActive: true },
                update: { IsActive: true },
            });
            await this.menuService.provisionUserMenusFromRole(user.ID, roleId);
        }
        await this.redis.invalidatePattern('users:*');
        return user;
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { ID: userId },
            select: { ID: true, IsActive: true, Password: true },
        });
        if (!user || !user.IsActive)
            throw new common_1.NotFoundException('User tidak ditemukan');
        let valid = false;
        try {
            valid = await argon2.verify(user.Password, dto.currentPassword);
        }
        catch {
            valid = false;
        }
        if (!valid)
            throw new common_1.BadRequestException('Password saat ini salah');
        if (dto.currentPassword === dto.newPassword) {
            throw new common_1.BadRequestException('Password baru harus berbeda dari password saat ini');
        }
        const hashed = await this.hashPassword(dto.newPassword);
        await this.prisma.user.update({ where: { ID: userId }, data: { Password: hashed } });
        await this.redis.del(`user:me:${userId}`);
        await this.authz.invalidate(userId);
        return { changed: true };
    }
    async getMe(userId) {
        const cacheKey = `user:me:${userId}`;
        return this.redis.getOrSet(cacheKey, async () => {
            const user = await this.prisma.user.findUnique({
                where: { ID: userId },
                include: {
                    Company: {
                        select: {
                            ID: true,
                            CompanyCode: true,
                            Name: true,
                        },
                    },
                    UserRoles: {
                        where: { IsActive: true },
                        include: {
                            Role: {
                                select: { ID: true, RoleName: true },
                            },
                        },
                    },
                },
            });
            if (!user)
                return null;
            const menus = await this.menuService.getAccessibleMenus(userId);
            return {
                id: user.ID,
                username: user.Username,
                name: user.Name,
                email: user.Email,
                role: user.Role,
                isActive: user.IsActive,
                createdAt: user.CreatedAt,
                updatedAt: user.UpdatedAt,
                company: user.Company,
                extraRoles: user.UserRoles.map((ur) => ur.Role),
                menus,
            };
        }, 120);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        redis_service_1.RedisService,
        menu_service_1.MenuService,
        config_1.ConfigService,
        authz_service_1.AuthzService])
], AuthService);
