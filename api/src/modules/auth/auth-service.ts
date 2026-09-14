// ================================================================
// auth-service.ts — Logika Bisnis Autentikasi
// ================================================================
//
// AuthService menangani:
//   1. login()    — Verifikasi email + password, kembalikan JWT token
//   2. register() — Buat user baru dengan password yang di-hash
//   3. getMe()    — Ambil data profil user yang sedang login
//
// Catatan: User model saat ini (lihat schema.prisma) adalah model FLAT
// (id uuid, email, password, name, role: string, isActive) — bukan
// model RBAC bertingkat (main_role_id → Role → RoleMenu/UserMenu) yang
// dideskripsikan di README. Modul role/menu masih ada di repo tapi
// tidak terhubung ke User; auth di sini sengaja tidak memakainya.
// ================================================================

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/prisma/prisma-service';
import { LoginDto, RegisterDto } from './dto/auth-dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ── LOGIN ──────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      // password di-omit secara global (lihat prisma-service.ts); login
      // butuh hash-nya untuk verifikasi, jadi di-override eksplisit di sini.
      omit: { password: false },
    });

    // Pesan error generik (email & password) supaya tidak membocorkan
    // field mana yang salah.
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isValid = await argon2.verify(user.password, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
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

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role ?? 'cashier',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  // ── GET ME ──────────────────────────────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}
