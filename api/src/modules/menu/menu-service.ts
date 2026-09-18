// ================================================================
// menu-service.ts — Logika Bisnis Menu & Kontrol Akses
// ================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu-dto';

@Injectable()
export class MenuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryService: QueryService,
  ) {}

  // ─── CRUD ───────────────────────────────────────────────

  async findAll(query: Record<string, unknown>) {
    const q = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['MenuName'],
      defaultOrderBy: { ID: 'asc' },
    });

    const findArgs: Record<string, unknown> = {
      where: q.where,
      orderBy: q.orderBy,
      skip: q.skip,
      take: q.take,
    };

    if (q.select) {
      findArgs.select = q.select;
    } else if (q.include) {
      findArgs.include = q.include;
    }

    const [data, total] = await Promise.all([
      this.prisma.menu.findMany(findArgs as Parameters<typeof this.prisma.menu.findMany>[0]),
      this.prisma.menu.count({ where: q.where }),
    ]);

    return { data, total, skip: q.skip, take: q.take };
  }

  async findOne(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { ID: id },
      include: { ChildMenus: true, RoleMenus: true },
    });
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async create(dto: CreateMenuDto) {
    return this.prisma.menu.create({
      data: {
        MenuName: dto.menuName,
        MenuType: dto.menuType,
        Icon: dto.icon,
        Route: dto.route,
        ParentMenuID: dto.parentMenuId,
        IsActive: dto.isActive,
        SortOrder: dto.sortOrder,
      },
    });
  }

  async update(id: number, dto: UpdateMenuDto) {
    const data: Record<string, unknown> = {};
    if (dto.menuName !== undefined) data.MenuName = dto.menuName;
    if (dto.menuType !== undefined) data.MenuType = dto.menuType;
    if (dto.icon !== undefined) data.Icon = dto.icon;
    if (dto.route !== undefined) data.Route = dto.route;
    if (dto.parentMenuId !== undefined) data.ParentMenuID = dto.parentMenuId;
    if (dto.isActive !== undefined) data.IsActive = dto.isActive;
    if (dto.sortOrder !== undefined) data.SortOrder = dto.sortOrder;

    return this.prisma.menu.update({ where: { ID: id }, data });
  }

  async remove(id: number) {
    return this.prisma.menu.update({ where: { ID: id }, data: { IsActive: false } });
  }

  // ─── Role Menu ───────────────────────────────────────────

  async getRoleMenus(roleId: number) {
    return this.prisma.roleMenu.findMany({
      where: { RoleID: roleId, IsActive: true },
      include: { Menu: true },
    });
  }

  async assignMenuToRole(roleId: number, menuId: number) {
    return this.prisma.roleMenu.upsert({
      where: { RoleID_MenuID: { RoleID: roleId, MenuID: menuId } },
      create: { RoleID: roleId, MenuID: menuId, IsActive: true },
      update: { IsActive: true },
    });
  }

  async revokeMenuFromRole(roleId: number, menuId: number) {
    return this.prisma.roleMenu.update({
      where: { RoleID_MenuID: { RoleID: roleId, MenuID: menuId } },
      data: { IsActive: false },
    });
  }

  // ─── User Menu ───────────────────────────────────────────

  async getUserMenus(userId: string) {
    return this.prisma.userMenu.findMany({
      where: { UserID: userId, IsActive: true },
      include: { Menu: true },
    });
  }

  async assignMenuToUser(userId: string, menuId: number) {
    return this.prisma.userMenu.upsert({
      where: { UserID_MenuID: { UserID: userId, MenuID: menuId } },
      create: { UserID: userId, MenuID: menuId, IsActive: true },
      update: { IsActive: true },
    });
  }

  async revokeMenuFromUser(userId: string, menuId: number) {
    return this.prisma.userMenu.update({
      where: { UserID_MenuID: { UserID: userId, MenuID: menuId } },
      data: { IsActive: false },
    });
  }

  /**
   * Provision default menus for a user based on their role.
   * Called on account creation (register) and role assignment.
   */
  async provisionUserMenusFromRole(userId: string, roleId: number): Promise<void> {
    const roleMenus = await this.prisma.roleMenu.findMany({
      where: { RoleID: roleId, IsActive: true },
      select: { MenuID: true },
    });

    if (!roleMenus.length) return;

    await Promise.all(
      roleMenus.map((rm) =>
        this.prisma.userMenu.upsert({
          where: { UserID_MenuID: { UserID: userId, MenuID: rm.MenuID } },
          create: { UserID: userId, MenuID: rm.MenuID, IsActive: true },
          update: { IsActive: true },
        }),
      ),
    );
  }

  /**
   * Resolve all role IDs for a user (main role + extra roles from UserRole).
   */
  async resolveRoleIds(userId: string, mainRoleId?: number | null): Promise<number[]> {
    const extraRoles = await this.prisma.userRole.findMany({
      where: { UserID: userId, IsActive: true },
      select: { RoleID: true },
    });

    const ids = new Set<number>(extraRoles.map((r) => r.RoleID));
    if (mainRoleId) ids.add(mainRoleId);
    return [...ids];
  }

  /**
   * Check if a user has access to a specific menu.
   */
  async checkUserAccess(userId: string, mainRoleId: number | undefined, menuName: string): Promise<boolean> {
    const menu = await this.prisma.menu.findFirst({
      where: { MenuName: menuName, IsActive: true },
      select: { ID: true },
    });

    if (!menu) return true; // Menu not configured = open

    const userMenu = await this.prisma.userMenu.findFirst({
      where: { UserID: userId, MenuID: menu.ID, IsActive: true },
    });

    if (userMenu) return true;

    const roleIds = await this.resolveRoleIds(userId, mainRoleId);
    if (!roleIds.length) return false;

    const roleMenu = await this.prisma.roleMenu.findFirst({
      where: { RoleID: { in: roleIds }, MenuID: menu.ID, IsActive: true },
    });

    return !!roleMenu;
  }

  /**
   * Get all accessible menus for a user (merged UserMenu + RoleMenu fallback).
   */
  async getAccessibleMenus(userId: string, mainRoleId?: number | null) {
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
}
