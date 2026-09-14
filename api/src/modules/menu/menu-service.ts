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
      searchableFields: ['menuName'],
      defaultOrderBy: { id: 'asc' },
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
      where: { id },
      include: { childMenus: true, roleMenus: true },
    });
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async create(dto: CreateMenuDto) {
    return this.prisma.menu.create({ data: dto });
  }

  async update(id: number, dto: UpdateMenuDto) {
    return this.prisma.menu.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    return this.prisma.menu.update({ where: { id }, data: { isActive: false } });
  }

  // ─── Role Menu ───────────────────────────────────────────

  async getRoleMenus(roleId: number) {
    return this.prisma.roleMenu.findMany({
      where: { roleId, isActive: true },
      include: { menu: true },
    });
  }

  async assignMenuToRole(roleId: number, menuId: number) {
    return this.prisma.roleMenu.upsert({
      where: { roleId_menuId: { roleId, menuId } },
      create: { roleId, menuId, isActive: true },
      update: { isActive: true },
    });
  }

  async revokeMenuFromRole(roleId: number, menuId: number) {
    return this.prisma.roleMenu.update({
      where: { roleId_menuId: { roleId, menuId } },
      data: { isActive: false },
    });
  }

  // ─── User Menu ───────────────────────────────────────────

  async getUserMenus(userId: string) {
    return this.prisma.userMenu.findMany({
      where: { userId, isActive: true },
      include: { menu: true },
    });
  }

  async assignMenuToUser(userId: string, menuId: number) {
    return this.prisma.userMenu.upsert({
      where: { userId_menuId: { userId, menuId } },
      create: { userId, menuId, isActive: true },
      update: { isActive: true },
    });
  }

  async revokeMenuFromUser(userId: string, menuId: number) {
    return this.prisma.userMenu.update({
      where: { userId_menuId: { userId, menuId } },
      data: { isActive: false },
    });
  }

  /**
   * Provision default menus for a user based on their role.
   * Called on account creation (register) and role assignment.
   */
  async provisionUserMenusFromRole(userId: string, roleId: number): Promise<void> {
    const roleMenus = await this.prisma.roleMenu.findMany({
      where: { roleId, isActive: true },
      select: { menuId: true },
    });

    if (!roleMenus.length) return;

    await Promise.all(
      roleMenus.map((rm) =>
        this.prisma.userMenu.upsert({
          where: { userId_menuId: { userId, menuId: rm.menuId } },
          create: { userId, menuId: rm.menuId, isActive: true },
          update: { isActive: true },
        }),
      ),
    );
  }

  /**
   * Resolve all role IDs for a user (main role + extra roles from UserRole).
   */
  async resolveRoleIds(userId: string, mainRoleId?: number | null): Promise<number[]> {
    const extraRoles = await this.prisma.userRole.findMany({
      where: { userId, isActive: true },
      select: { roleId: true },
    });

    const ids = new Set<number>(extraRoles.map((r) => r.roleId));
    if (mainRoleId) ids.add(mainRoleId);
    return [...ids];
  }

  /**
   * Check if a user has access to a specific menu.
   */
  async checkUserAccess(userId: string, mainRoleId: number | undefined, menuName: string): Promise<boolean> {
    const menu = await this.prisma.menu.findFirst({
      where: { menuName, isActive: true },
      select: { id: true },
    });

    if (!menu) return true; // Menu not configured = open

    const userMenu = await this.prisma.userMenu.findFirst({
      where: { userId, menuId: menu.id, isActive: true },
    });

    if (userMenu) return true;

    const roleIds = await this.resolveRoleIds(userId, mainRoleId);
    if (!roleIds.length) return false;

    const roleMenu = await this.prisma.roleMenu.findFirst({
      where: { roleId: { in: roleIds }, menuId: menu.id, isActive: true },
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
          where: { roleId: { in: roleIds }, isActive: true },
          select: { menuId: true },
        })
      : [];

    const userMenus = await this.prisma.userMenu.findMany({
      where: { userId, isActive: true },
      select: { menuId: true },
    });

    const allMenuIds = new Set([
      ...roleMenuIds.map((r) => r.menuId),
      ...userMenus.map((u) => u.menuId),
    ]);

    return this.prisma.menu.findMany({
      where: { id: { in: [...allMenuIds] }, isActive: true },
      orderBy: { id: 'asc' },
    });
  }
}
