// ================================================================
// auth-service.ts — Logika Bisnis Autentikasi
// ================================================================
//
// AuthService menangani:
//   1. login()    — Verifikasi email + password, kembalikan JWT token
//   2. register() — Buat user baru dengan password yang di-hash
//   3. getMe()    — Ambil data profil user yang sedang login
//
// JWT payload / req.user memakai field `role_id` (bukan `main_role_id`)
// — konsisten dengan JwtStrategy & CurrentUser yang sudah ada.
// Field database tetap `main_role_id` (lihat schema.prisma).
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
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      // password di-omit secara global (lihat prisma-service.ts); login
      // butuh hash-nya untuk verifikasi, jadi di-override eksplisit di sini.
      omit: { password: false },
      include: {
        role: { select: { id: true, role_name: true, role_description: true } },
      },
    });

    // Pesan error generik (email & password) supaya tidak membocorkan
    // field mana yang salah.
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isValid = await argon2.verify(user.password ?? '', dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role_id: user.main_role_id,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    const menus = await this.menuService.getAccessibleMenus(user.id, user.main_role_id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        photo_url: user.photo_url,
        main_role_id: user.main_role_id,
        role: user.role?.role_name ?? null,
      },
      menus,
    };
  }

  // ── REGISTER ────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.count({ where: { email: dto.email } });
    if (exists > 0) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Argon2id: memory-hard, aman terhadap GPU/ASIC cracking.
    // Parameter diambil dari .env (ARGON2_MEMORY_COST/TIME_COST/PARALLELISM).
    const hashedPassword = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: this.configService.get<number>('security.argon2MemoryCost', 65536),
      timeCost: this.configService.get<number>('security.argon2TimeCost', 3),
      parallelism: this.configService.get<number>('security.argon2Parallelism', 4),
    });

    const roleId = dto.main_role_id ?? 1;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        full_name: dto.full_name,
        phone_number: dto.phone_number,
        photo_url: dto.photo_url,
        main_role_id: roleId,
        is_active: true,
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        photo_url: true,
        phone_number: true,
        main_role_id: true,
        is_active: true,
        createdAt: true,
        role: { select: { id: true, role_name: true } },
      },
    });

    // Berikan akses menu default berdasarkan role user yang baru dibuat.
    await this.menuService.provisionUserMenusFromRole(user.id, roleId);

    await this.redis.invalidatePattern('users:*');

    return user;
  }

  // ── GET ME ──────────────────────────────────────────────────────────────
  async getMe(userId: number) {
    const cacheKey = `user:me:${userId}`;
    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            full_name: true,
            email: true,
            photo_url: true,
            phone_number: true,
            main_role_id: true,
            last_login: true,
            is_active: true,
            createdAt: true,
            updatedAt: true,
            role: { select: { id: true, role_name: true, role_description: true } },
            userRoles: {
              where: { is_active: true },
              select: { role: { select: { id: true, role_name: true } } },
            },
          },
        });

        if (!user) return null;

        const menus = await this.menuService.getAccessibleMenus(userId, user.main_role_id);

        return {
          ...user,
          role: user.role?.role_name ?? null,
          extraRoles: user.userRoles.map((ur) => ur.role),
          userRoles: undefined,
          menus,
        };
      },
      120,
    );
  }
}
