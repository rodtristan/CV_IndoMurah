// ================================================================
// auth-service.ts — Logika Bisnis Autentikasi
// ================================================================

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { MenuService } from '../menu/menu-service';
import { LoginDto, RegisterDto } from './dto/auth-dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
    private menuService: MenuService,
    private configService: ConfigService,
  ) {}

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

    const token = this.jwtService.sign({
      id: user.ID,
      companyId: company.ID,
      username: user.Username,
      roleId: mainRole?.RoleID ?? 1,
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

  // ── REGISTER ────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // Find company by companyCode
    const company = await this.prisma.company.findUnique({
      where: { CompanyCode: dto.companyCode },
    });

    if (!company) {
      throw new ConflictException('Kode perusahaan tidak valid');
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

    const hashedPassword = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: this.configService.get<number>('security.argon2MemoryCost', 65536),
      timeCost: this.configService.get<number>('security.argon2TimeCost', 3),
      parallelism: this.configService.get<number>('security.argon2Parallelism', 4),
    });

    const roleId = dto.roleId ?? 1;

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

    await this.menuService.provisionUserMenusFromRole(user.ID, roleId);

    await this.redis.invalidatePattern('users:*');

    return user;
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
