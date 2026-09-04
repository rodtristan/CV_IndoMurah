// ================================================================
// app-module.ts — Modul Utama Aplikasi
// ================================================================
//
// AppModule adalah "induk" dari semua modul di aplikasi ini.
// Di sinilah semua modul didaftarkan agar bisa saling terhubung.
//
// Struktur modul dibagi menjadi tiga kelompok:
//
//  [1] INFRASTRUKTUR — Modul teknis yang dipakai oleh semua fitur:
//      - ConfigModule   : baca nilai dari file .env
//      - ThrottlerModule: batasi jumlah request (rate limiting)
//      - PrismaModule   : koneksi ke database PostgreSQL
//      - RedisModule    : koneksi ke cache Redis
//      - QueryModule    : helper untuk query database yang fleksibel
//      - HashIdModule   : encode/decode ID di URL (keamanan)
//      - PassportModule + JwtModule + JwtStrategy : infrastruktur JWT auth,
//        siap dipakai oleh modul fitur (mis. AuthModule) yang akan ditambahkan
//
//  [2] FITUR — Modul bisnis sesuai domain aplikasi (Product, Order, Attendance,
//      User, dll). BELUM ditambahkan di scaffold ini — tambahkan sesuai
//      kebutuhan Toko CV IndoMurah.
//
//  [3] PROVIDER GLOBAL — Dijalankan untuk setiap request:
//      - ThrottlerGuard    : cek rate limit
//      - LoggingInterceptor: catat setiap request ke tabel logs
//
// ================================================================

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

// Configs — membaca semua konfigurasi dari .env
import { appConfig, databaseConfig, jwtConfig, redisConfig, securityConfig } from './config';

// ── Infrastruktur ──────────────────────────────────────────────────────
import { PrismaModule } from './common/prisma/prisma-module';
import { RedisModule } from './common/redis/redis-module';
import { QueryModule } from './common/query/query-module';
import { HashIdModule } from './common/utils/hash-id-module';
import { JwtStrategy } from './common/strategies/jwt-strategy';

// ── Fitur ──────────────────────────────────────────────────────────────
import { HealthModule } from './modules/health/health-module';

// ── Provider Global ────────────────────────────────────────────────────
import { LoggingInterceptor } from './common/interceptors/logging-interceptor';

@Module({
  imports: [
    // ── [1] Konfigurasi Environment (.env) ── ─────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      cache: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, securityConfig],
    }),

    // ── [2] Rate Limiting — Batasi Jumlah Request ─────────────────────
    //   short : maks 10 request per detik
    //   medium: maks 50 request per 10 detik
    //   long  : maks 200 request per menit
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 10  },
      { name: 'medium', ttl: 10000, limit: 50  },
      { name: 'long',   ttl: 60000, limit: 200 },
    ]),

    // ── [3] Infrastruktur Core ────────────────────────────────────────
    PrismaModule,   // Database ORM (PostgreSQL)
    RedisModule,    // Cache layer
    QueryModule,    // Smart query builder ($select, $where, $orderBy, dll)
    HashIdModule,   // Obfuscate integer ID di URL

    // ── [4] Infrastruktur JWT Auth ─────────────────────────────────────
    // Siap dipakai modul fitur (mis. AuthModule) via @UseGuards(JwtAuthGuard)
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<JwtModuleOptions> => ({
        secret: config.get<string>('JWT_SECRET') || config.get<string>('jwt.secret') || 'fallback-secret',
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || config.get<string>('jwt.expiresIn') || '8h',
        } as any,
      }),
    }),

    // ── [5] Modul Fitur ───────────────────────────────────────────────
    HealthModule,   // Health check endpoint (untuk Docker/monitoring)
  ],
  providers: [
    JwtStrategy,

    // ── [6] Guard & Interceptor Global ───────────────────────────────
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Cek rate limit sebelum request masuk
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // Catat semua request ke tabel `logs`
    },
  ],
})
export class AppModule {}
