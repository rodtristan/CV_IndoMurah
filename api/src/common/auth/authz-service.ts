// ================================================================
// authz-service.ts — Status akses user (aktif? administrator?)
// ================================================================
//
// Dipakai oleh:
//   - JwtStrategy.validate  → tolak token milik user yang sudah dinonaktifkan/dihapus
//   - AdminRouteGuard       → batasi route sensitif hanya untuk Administrator
//
// Hasil di-cache di Redis selama ACCESS_TTL detik supaya tidak ada query DB
// per request. Perubahan user/role memanggil invalidate() agar efeknya segera.
//
// Administrator = punya UserRole aktif ke Role aktif bernama "Administrator"
// (atau "admin"), ATAU kolom legacy User.Role === 'admin'.
// ================================================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma-service';
import { RedisService } from '../redis/redis-service';

export interface UserAccess {
  exists: boolean;
  isActive: boolean;
  isAdmin: boolean;
}

const ACCESS_TTL = 30; // detik
export const ADMIN_ROLE_NAMES = ['administrator', 'admin'];

@Injectable()
export class AuthzService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private key(userId: string) {
    return `authz:user:${userId}`;
  }

  async getAccess(userId: string): Promise<UserAccess> {
    const cached = await this.redis.get<UserAccess>(this.key(userId));
    if (cached && typeof cached.isActive === 'boolean') return cached;

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

    const access: UserAccess = user
      ? {
          exists: true,
          isActive: !!user.IsActive,
          isAdmin:
            String(user.Role ?? '').toLowerCase() === 'admin' ||
            user.UserRoles.some((ur) => ADMIN_ROLE_NAMES.includes(String(ur.Role?.RoleName ?? '').trim().toLowerCase())),
        }
      : { exists: false, isActive: false, isAdmin: false };

    await this.redis.set(this.key(userId), access, ACCESS_TTL);
    return access;
  }

  async invalidate(userId?: string): Promise<void> {
    if (userId) await this.redis.del(this.key(userId));
    else await this.redis.invalidatePattern('authz:user:*');
  }
}
