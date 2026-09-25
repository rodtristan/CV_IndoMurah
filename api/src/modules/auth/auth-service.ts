// ================================================================
// auth-service.ts — Logika Bisnis Autentikasi
// ================================================================

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { MenuService } from '../menu/menu-service';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth-dto';
import { AuthzService } from '../../common/auth/authz-service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
    private menuService: MenuService,
    private configService: ConfigService,
    private authz: AuthzService,
  ) {}

  private hashPassword(plain: string) {
    return argon2.hash(plain, {
      type: argon2.argon2id,
      memoryCost: this.configService.get<number>('security.argon2MemoryCost', 65536),
      timeCost: this.configService.get<number>('security.argon2TimeCost', 3),
      parallelism: this.configService.get<number>('security.argon2Parallelism', 4),
    });
  }

  // ── LOGIN ──────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    // Find company by companyCode
    const company = await this.prisma.company.findUnique({
      where: { CompanyCode: dto.companyCode },
    });

    if (!company || !company.IsActive) {
      throw new UnauthorizedException('Kode perusahaan tidak valid');
    }

    // Find user by companyId + username
    // `Password` di-omit secara global (lihat prisma-service.ts) — override di
    // sini karena login butuh hash-nya untuk verifikasi.
    const user = await this.prisma.user.findFirst({
      where: {
        CompanyID: company.ID,
        Username: dto.username,
      },
      omit: { Password: false },
    });

    if (!user || !user.IsActive) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const isValid = await argon2.verify(user.Password, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Username atau password salah');
    }

    // Determine main role from UserRole
    const mainRole = await this.prisma.userRole.findFirst({
      where: { UserID: user.ID, IsActive: true },
      select: { RoleID: true },
    });

    // Tidak ada default role: user tanpa UserRole aktif tidak mendapat roleId
    // (dulu default 1 = Administrator).
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

  // ── REGISTER (khusus Administrator — dijaga JwtAuthGuard + AdminRouteGuard) ──
  async register(dto: RegisterDto, actor: { id: string; companyId: number }) {
    const company = await this.prisma.company.findUnique({
      where: { CompanyCode: dto.companyCode },
    });

    if (!company) {
      throw new ConflictException('Kode perusahaan tidak valid');
    }
    // Admin hanya boleh membuat user di perusahaannya sendiri.
    if (actor?.companyId && company.ID !== actor.companyId) {
      throw new ForbiddenException('Tidak boleh membuat user untuk perusahaan lain');
    }

    // roleId opsional & tanpa default; bila diisi harus role yang ada & aktif.
    let roleId: number | null = null;
    if (dto.roleId !== undefined && dto.roleId !== null) {
      const role = await this.prisma.role.findUnique({ where: { ID: dto.roleId } });
      if (!role || !role.IsActive) throw new BadRequestException('Role tidak ditemukan / tidak aktif');
      roleId = role.ID;
    }

    // Check if username already exists in this company
    const exists = await this.prisma.user.count({
      where: {
        CompanyID: company.ID,
        Username: dto.username,
      },
    });
    if (exists > 0) {
      throw new ConflictException('Username sudah terdaftar di perusahaan ini');
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

  // ── GANTI PASSWORD (user yang sedang login) ─────────────────────────────
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { ID: userId },
      select: { ID: true, IsActive: true, Password: true },
    });
    if (!user || !user.IsActive) throw new NotFoundException('User tidak ditemukan');

    let valid = false;
    try {
      valid = await argon2.verify(user.Password, dto.currentPassword);
    } catch {
      valid = false;
    }
    if (!valid) throw new BadRequestException('Password saat ini salah');
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Password baru harus berbeda dari password saat ini');
    }

    const hashed = await this.hashPassword(dto.newPassword);
    await this.prisma.user.update({ where: { ID: userId }, data: { Password: hashed } });
    await this.redis.del(`user:me:${userId}`);
    await this.authz.invalidate(userId);

    return { changed: true };
  }

  // ── GET ME ──────────────────────────────────────────────────────────────
  async getMe(userId: string) {
    const cacheKey = `user:me:${userId}`;
    return this.redis.getOrSet(
      cacheKey,
      async () => {
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

        if (!user) return null;

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
      },
      120,
    );
  }
}
