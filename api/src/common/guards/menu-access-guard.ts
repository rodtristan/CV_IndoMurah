// ================================================================
// menu-access-guard.ts — Penjaga Akses Berbasis Menu
// ================================================================

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma-service';
import { MENU_KEY_METADATA } from '../decorators/menu-key-decorator';

@Injectable()
export class MenuAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const menuKey = this.reflector.getAllAndOverride<string | undefined>(MENU_KEY_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Tidak ada @MenuKey = endpoint terbuka untuk semua yang sudah login
    if (!menuKey) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as { id?: string; roleId?: number } | undefined;

    if (!user?.id) {
      throw new UnauthorizedException('Kamu harus login terlebih dahulu');
    }

    const userId = user.id;
    const roleId = user.roleId;

    const menu = await this.prisma.menu.findFirst({
      where: { menuName: menuKey, isActive: true },
      select: { id: true },
    });

    // Menu belum dikonfigurasi → izinkan agar developer tidak lockout
    if (!menu) return true;

    // Akses personal (UserMenu) — override, prioritas tertinggi
    const userMenu = await this.prisma.userMenu.findFirst({
      where: { userId: userId, menuId: menu.id, isActive: true },
    });
    if (userMenu) return true;

    // Akses berdasarkan role
    const extraRoles = await this.prisma.userRole.findMany({
      where: { userId: userId, isActive: true },
      select: { roleId: true },
    });
    const roleIds = new Set<number>(extraRoles.map((r) => r.roleId));
    if (roleId) roleIds.add(roleId);

    if (roleIds.size) {
      const roleMenu = await this.prisma.roleMenu.findFirst({
        where: { roleId: { in: [...roleIds] }, menuId: menu.id, isActive: true },
      });
      if (roleMenu) return true;
    }

    throw new ForbiddenException(
      `Akses ditolak. Kamu tidak memiliki izin untuk mengakses menu "${menuKey}"`,
    );
  }
}
