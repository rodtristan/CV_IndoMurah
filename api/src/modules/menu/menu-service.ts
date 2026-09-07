// ================================================================
// menu-service.ts — Logika Bisnis Menu & Kontrol Akses
// ================================================================
//
// Mengelola:
//   1. CRUD menu (item sidebar dashboard, bisa berupa tree)
//   2. RoleMenu — menu default yang bisa diakses semua user dengan role X
//   3. UserMenu — override akses menu per user (prioritas > RoleMenu)
//   4. Provisioning otomatis UserMenu dari RoleMenu saat register
//   5. Resolusi menu yang bisa diakses user (dipakai saat login)
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

  // ─── CRUD ────────────────────────────────────────────────

  async findAll(query: Record<string, unknown>) {
    const q = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['menu_name'],
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
    return this.prisma.menu.update({ where: { id }, data: { is_active: false } });
  }

  // ─── Role Menu ───────────────────────────────────────────

  async getRoleMenus(roleId: number) {
    return this.prisma.roleMenu.findMany({
      where: { role_id: roleId, is_active: true },
      include: { menu: true },
    });
  }

  async assignMenuToRole(roleId: number, menuId: number) {
    return this.prisma.roleMenu.upsert({
      where: { role_id_menu_id: { role_id: roleId, menu_id: menuId } },
      create: { role_id: roleId, menu_id: menuId, is_active: true },
      update: { is_active: true },
    });
  }

  async revokeMenuFromRole(roleId: number, menuId: number) {
    return this.prisma.roleMenu.update({
      where: { role_id_menu_id: { role_id: roleId, menu_id: menuId } },
      data: { is_active: false },
    });
  }

  // ─── User Menu ───────────────────────────────────────────

  async getUserMenus(userId: number) {
    return this.prisma.userMenu.findMany({
      where: { user_id: userId, is_active: true },
      include: { menu: true },
    });
  }

  async assignMenuToUser(userId: number, menuId: number) {
    return this.prisma.userMenu.upsert({
      where: { user_id_menu_id: { user_id: userId, menu_id: menuId } },
      create: { user_id: userId, menu_id: menuId, is_active: true },
      update: { is_active: true },
    });
  }

  async revokeMenuFromUser(userId: number, menuId: number) {
    return this.prisma.userMenu.update({
      where: { user_id_menu_id: { user_id: userId, menu_id: menuId } },
      data: { is_active: false },
    });
  }

  /**
   * Provision default menus for a user based on their role.
   * Called on account creation (register) and role assignment.
   * RoleMenu → seed into UserMenu (if UserMenu entry does not already exist).
   */
  async provisionUserMenusFromRole(userId: number, roleId: number): Promise<void> {
    const roleMenus = await this.prisma.roleMenu.findMany({
      where: { role_id: roleId, is_active: true },
      select: { menu_id: true },
    });

    if (!roleMenus.length) return;

    await Promise.all(
      roleMenus.map((rm) =>
        this.prisma.userMenu.upsert({
          where: { user_id_menu_id: { user_id: userId, menu_id: rm.menu_id } },
          create: { user_id: userId, menu_id: rm.menu_id, is_active: true },
          update: { is_active: true },
        }),
      ),
    );
  }

  /**
   * A user's effective roles = main_role_id (User.main_role_id) + every
   * active UserRole (extra roles). Both feed into RoleMenu resolution.
   */
  async resolveRoleIds(userId: number, mainRoleId?: number | null): Promise<number[]> {
    const extraRoles = await this.prisma.userRole.findMany({
      where: { user_id: userId, is_active: true },
      select: { role_id: true },
    });

    const ids = new Set<number>(extraRoles.map((r) => r.role_id));
    if (mainRoleId) ids.add(mainRoleId);
    return [...ids];
  }

  /**
   * Check if a user has access to a specific menu.
   * UserMenu overrides RoleMenu (UserMenu = highest priority).
   */
  async checkUserAccess(userId: number, mainRoleId: number | undefined, menuName: string): Promise<boolean> {
    const menu = await this.prisma.menu.findFirst({
      where: { menu_name: menuName, is_active: true },
      select: { id: true },
    });

    if (!menu) return true; // Menu not configured = open

    const userMenu = await this.prisma.userMenu.findFirst({
      where: { user_id: userId, menu_id: menu.id, is_active: true },
    });

    if (userMenu) return true;

    const roleIds = await this.resolveRoleIds(userId, mainRoleId);
    if (!roleIds.length) return false;

    const roleMenu = await this.prisma.roleMenu.findFirst({
      where: { role_id: { in: roleIds }, menu_id: menu.id, is_active: true },
    });

    return !!roleMenu;
  }

  /**
   * Get all accessible menus for a user (merged UserMenu + RoleMenu fallback,
   * across the main role AND every extra role granted via UserRole).
   * Used during login to return the menu tree.
   */
  async getAccessibleMenus(userId: number, mainRoleId: number | undefined | null) {
    const roleIds = await this.resolveRoleIds(userId, mainRoleId);

    const roleMenuIds = roleIds.length
      ? await this.prisma.roleMenu.findMany({
          where: { role_id: { in: roleIds }, is_active: true },
          select: { menu_id: true },
        })
      : [];

    const userMenus = await this.prisma.userMenu.findMany({
      where: { user_id: userId, is_active: true },
      select: { menu_id: true },
    });

    const allMenuIds = new Set([
      ...roleMenuIds.map((r) => r.menu_id),
      ...userMenus.map((u) => u.menu_id),
    ]);

    return this.prisma.menu.findMany({
      where: { id: { in: [...allMenuIds] }, is_active: true },
      orderBy: { id: 'asc' },
    });
  }
}
