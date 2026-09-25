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
exports.MenuAccessGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../prisma/prisma-service");
const menu_key_decorator_1 = require("../decorators/menu-key-decorator");
let MenuAccessGuard = class MenuAccessGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const menuKey = this.reflector.getAllAndOverride(menu_key_decorator_1.MENU_KEY_METADATA, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!menuKey)
            return true;
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        if (!user?.id) {
            throw new common_1.UnauthorizedException('Kamu harus login terlebih dahulu');
        }
        const userId = user.id;
        const roleId = user.roleId;
        const menu = await this.prisma.menu.findFirst({
            where: { MenuName: menuKey, IsActive: true },
            select: { ID: true },
        });
        if (!menu)
            return true;
        const userMenu = await this.prisma.userMenu.findFirst({
            where: { UserID: userId, MenuID: menu.ID, IsActive: true },
        });
        if (userMenu)
            return true;
        const extraRoles = await this.prisma.userRole.findMany({
            where: { UserID: userId, IsActive: true },
            select: { RoleID: true },
        });
        const roleIds = new Set(extraRoles.map((r) => r.RoleID));
        if (roleId)
            roleIds.add(roleId);
        if (roleIds.size) {
            const roleMenu = await this.prisma.roleMenu.findFirst({
                where: { RoleID: { in: [...roleIds] }, MenuID: menu.ID, IsActive: true },
            });
            if (roleMenu)
                return true;
        }
        throw new common_1.ForbiddenException(`Akses ditolak. Kamu tidak memiliki izin untuk mengakses menu "${menuKey}"`);
    }
};
exports.MenuAccessGuard = MenuAccessGuard;
exports.MenuAccessGuard = MenuAccessGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], MenuAccessGuard);
