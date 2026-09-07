// ================================================================
// menu-access-guard.ts — Penjaga Akses Berbasis Menu
// ================================================================
//
// Mengecek apakah user yang login punya akses ke menu tertentu
// sebelum request masuk ke controller.
//
// Alur:
//   [1] Baca @MenuKey('nama.menu') dari controller/method.
//       Tidak ada @MenuKey → endpoint terbuka, lanjutkan.
//   [2] Pastikan user sudah login (req.user dari JwtAuthGuard).
//   [3] Cari menu di database berdasarkan nama menu.
//       Menu tidak ditemukan → izinkan (supaya tidak lockout).
//   [4] Cek UserMenu (override personal, prioritas tertinggi).
//   [5] Cek RoleMenu (default berdasarkan role user).
//   [6] Tidak ada akses di keduanya → 403 Forbidden.
//
// Cara pakai:
//   @UseGuards(JwtAuthGuard, MenuAccessGuard)
//   @MenuKey('users.view')
//   @Get()
//   findAll() { ... }
//
// Guard ini membutuhkan JwtAuthGuard dijalankan LEBIH DULU agar
// req.user sudah terisi.
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
    const user = req.user as { id?: number; role_id?: number } | undefined;

    if (!user?.id) {
      throw new UnauthorizedException('Kamu harus login terlebih dahulu');
    }

    const userId = user.id;
    const roleId = user.role_id;

    const menu = await this.prisma.menu.findFirst({
      where: { menu_name: menuKey, is_active: true },
      select: { id: true },
    });

    // Menu belum dikonfigurasi → izinkan agar developer tidak lockout
    if (!menu) return true;

    // Akses personal (UserMenu) — override, prioritas tertinggi
    const userMenu = await this.prisma.userMenu.findFirst({
      where: { user_id: userId, menu_id: menu.id, is_active: true },
    });
    if (userMenu) return true;

    // Akses berdasarkan role — main_role_id DAN setiap role tambahan
    // yang diberikan lewat UserRole.
    const extraRoles = await this.prisma.userRole.findMany({
      where: { user_id: userId, is_active: true },
      select: { role_id: true },
    });
    const roleIds = new Set<number>(extraRoles.map((r) => r.role_id));
    if (roleId) roleIds.add(roleId);

    if (roleIds.size) {
      const roleMenu = await this.prisma.roleMenu.findFirst({
        where: { role_id: { in: [...roleIds] }, menu_id: menu.id, is_active: true },
      });
      if (roleMenu) return true;
    }

    throw new ForbiddenException(
      `Akses ditolak. Kamu tidak memiliki izin untuk mengakses menu "${menuKey}"`,
    );
  }
}
