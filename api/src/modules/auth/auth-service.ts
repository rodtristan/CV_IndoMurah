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
      where: { companyCode: dto.companyCode },
    });

    if (!company || !company.isActive) {
      throw new UnauthorizedException('Kode perusahaan tidak valid');
    }

    // Find user by companyId + username
    const user = await this.prisma.user.findFirst({
      where: {
        companyId: company.id,
        username: dto.username,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const isValid = await argon2.verify(user.password, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Username atau password salah');
    }

    // Determine main role from UserRole
    const mainRole = await this.prisma.userRole.findFirst({
      where: { userId: user.id, isActive: true },
      select: { roleId: true },
    });

    const token = this.jwtService.sign({
      id: user.id,
      companyId: company.id,
      username: user.username,
      roleId: mainRole?.roleId ?? 1,
    });

    const menus = await this.menuService.getAccessibleMenus(user.id, mainRole?.roleId ?? null);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        company: {
          id: company.id,
          companyCode: company.companyCode,
          name: company.name,
        },
      },
      menus,
    };
  }

  // ── REGISTER ────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // Find company by companyCode
    const company = await this.prisma.company.findUnique({
      where: { companyCode: dto.companyCode },
    });

    if (!company) {
      throw new ConflictException('Kode perusahaan tidak valid');
    }

    // Check if username already exists in this company
    const exists = await this.prisma.user.count({
      where: {
        companyId: company.id,
        username: dto.username,
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
        companyId: company.id,
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: 'cashier',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            companyCode: true,
            name: true,
          },
        },
      },
    });

    await this.menuService.provisionUserMenusFromRole(user.id, roleId);

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
          where: { id: userId },
          include: {
            company: {
              select: {
                id: true,
                companyCode: true,
                name: true,
              },
            },
            userRoles: {
              where: { isActive: true },
              include: {
                role: {
                  select: { id: true, roleName: true },
                },
              },
            },
          },
        });

        if (!user) return null;

        const menus = await this.menuService.getAccessibleMenus(userId);

        return {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          company: user.company,
          extraRoles: user.userRoles.map((ur) => ur.role),
          menus,
        };
      },
      120,
    );
  }
}
