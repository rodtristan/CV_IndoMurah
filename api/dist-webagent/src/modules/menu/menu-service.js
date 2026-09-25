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
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const query_service_1 = require("../../common/query/query-service");
let MenuService = class MenuService {
    constructor(prisma, queryService) {
        this.prisma = prisma;
        this.queryService = queryService;
    }
    async findAll(query) {
        const q = this.queryService.buildPrismaQuery(query, {
            searchableFields: ['MenuName'],
            defaultOrderBy: { ID: 'asc' },
        });
        const findArgs = {
            where: q.where,
            orderBy: q.orderBy,
            skip: q.skip,
            take: q.take,
        };
        if (q.select) {
            findArgs.select = q.select;
        }
        else if (q.include) {
            findArgs.include = q.include;
        }
        const [data, total] = await Promise.all([
            this.prisma.menu.findMany(findArgs),
            this.prisma.menu.count({ where: q.where }),
        ]);
        return { data, total, skip: q.skip, take: q.take };
    }
    async findOne(id) {
        const menu = await this.prisma.menu.findUnique({
            where: { ID: id },
            include: { ChildMenus: true, RoleMenus: true },
        });
        if (!menu)
            throw new common_1.NotFoundException('Menu not found');
        return menu;
    }
    async create(dto) {
        return this.prisma.menu.create({ data: dto });
    }
    async update(id, dto) {
        return this.prisma.menu.update({ where: { ID: id }, data: dto });
    }
    async remove(id) {
        return this.prisma.menu.update({ where: { ID: id }, data: { IsActive: false } });
    }
    async getRoleMenus(roleId) {
        return this.prisma.roleMenu.findMany({
            where: { RoleID: roleId, IsActive: true },
            include: { Menu: true },
        });
    }
    async assignMenuToRole(roleId, menuId) {
        return this.prisma.roleMenu.upsert({
            where: { RoleID_MenuID: { RoleID: roleId, MenuID: menuId } },
            create: { RoleID: roleId, MenuID: menuId, IsActive: true },
            update: { IsActive: true },
        });
    }
    async revokeMenuFromRole(roleId, menuId) {
        return this.prisma.roleMenu.update({
            where: { RoleID_MenuID: { RoleID: roleId, MenuID: menuId } },
            data: { IsActive: false },
        });
    }
    async getUserMenus(userId) {
        return this.prisma.userMenu.findMany({
            where: { UserID: userId, IsActive: true },
            include: { Menu: true },
        });
    }
    async assignMenuToUser(userId, menuId) {
        return this.prisma.userMenu.upsert({
            where: { UserID_MenuID: { UserID: userId, MenuID: menuId } },
            create: { UserID: userId, MenuID: menuId, IsActive: true },
            update: { IsActive: true },
        });
    }
    async revokeMenuFromUser(userId, menuId) {
        return this.prisma.userMenu.update({
            where: { UserID_MenuID: { UserID: userId, MenuID: menuId } },
            data: { IsActive: false },
        });
    }
    async provisionUserMenusFromRole(userId, roleId) {
        const roleMenus = await this.prisma.roleMenu.findMany({
            where: { RoleID: roleId, IsActive: true },
            select: { MenuID: true },
        });
        if (!roleMenus.length)
            return;
        await Promise.all(roleMenus.map((rm) => this.prisma.userMenu.upsert({
            where: { UserID_MenuID: { UserID: userId, MenuID: rm.MenuID } },
            create: { UserID: userId, MenuID: rm.MenuID, IsActive: true },
            update: { IsActive: true },
        })));
    }
    async resolveRoleIds(userId, mainRoleId) {
        const extraRoles = await this.prisma.userRole.findMany({
            where: { UserID: userId, IsActive: true },
            select: { RoleID: true },
        });
        const ids = new Set(extraRoles.map((r) => r.RoleID));
        if (mainRoleId)
            ids.add(mainRoleId);
        return [...ids];
    }
    async checkUserAccess(userId, mainRoleId, menuName) {
        const menu = await this.prisma.menu.findFirst({
            where: { MenuName: menuName, IsActive: true },
            select: { ID: true },
        });
        if (!menu)
            return true;
        const userMenu = await this.prisma.userMenu.findFirst({
            where: { UserID: userId, MenuID: menu.ID, IsActive: true },
        });
        if (userMenu)
            return true;
        const roleIds = await this.resolveRoleIds(userId, mainRoleId);
        if (!roleIds.length)
            return false;
        const roleMenu = await this.prisma.roleMenu.findFirst({
            where: { RoleID: { in: roleIds }, MenuID: menu.ID, IsActive: true },
        });
        return !!roleMenu;
    }
    async getAccessibleMenus(userId, mainRoleId) {
        const roleIds = await this.resolveRoleIds(userId, mainRoleId);
        const roleMenuIds = roleIds.length
            ? await this.prisma.roleMenu.findMany({
                where: { RoleID: { in: roleIds }, IsActive: true },
                select: { MenuID: true },
            })
            : [];
        const userMenus = await this.prisma.userMenu.findMany({
            where: { UserID: userId, IsActive: true },
            select: { MenuID: true },
        });
        const allMenuIds = new Set([
            ...roleMenuIds.map((r) => r.MenuID),
            ...userMenus.map((u) => u.MenuID),
        ]);
        return this.prisma.menu.findMany({
            where: { ID: { in: [...allMenuIds] }, IsActive: true },
            orderBy: { ID: 'asc' },
        });
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        query_service_1.QueryService])
], MenuService);
