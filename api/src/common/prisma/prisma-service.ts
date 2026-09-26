// ================================================================
// prisma-service.ts — Koneksi dan Akses Database
// ================================================================
//
// PrismaService adalah jembatan antara aplikasi dengan database.
// Setiap kali kita menulis `this.prisma.someModel.findMany()` di service,
// itu artinya kita menggunakan PrismaService ini.
//
// ── Cara Prisma Bekerja ──────────────────────────────────────────
//
//  Aplikasi NestJS
//      ↓
//  PrismaService (file ini)
//      ↓
//  PrismaClient (dari paket @prisma/client)
//      ↓
//  PrismaPg Adapter (translate query Prisma → SQL PostgreSQL)
//      ↓
//  pg.Pool (connection pool ke PostgreSQL)
//      ↓
//  Database PostgreSQL
//
// ── Apa itu Connection Pool? ─────────────────────────────────────
//  Membuat koneksi baru ke database itu mahal (butuh waktu).
//  Connection pool = sekumpulan koneksi yang sudah siap pakai.
//  - max: 20 → simpan maks 20 koneksi sekaligus
//  - Jika ada request, pakai koneksi yang sudah ada
//  - Jika semua koneksi sibuk dan ada request baru, tunggu
//
// ── Lifecycle NestJS ─────────────────────────────────────────────
//  OnModuleInit    → dipanggil saat aplikasi START
//  OnModuleDestroy → dipanggil saat aplikasi STOP (misal: Ctrl+C)
// ================================================================

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') {
    const { DB_PRD_USER, DB_PRD_PASS, DB_PRD_HOST, DB_PRD_PORT, DB_PRD } = process.env;
    return `postgresql://${DB_PRD_USER}:${DB_PRD_PASS}@${DB_PRD_HOST}:${DB_PRD_PORT}/${DB_PRD}?schema=public`;
  }

  if (env === 'testing') {
    const { DB_TEST_USER, DB_TEST_PASS, DB_TEST_HOST, DB_TEST_PORT, DB_TEST } = process.env;
    return `postgresql://${DB_TEST_USER}:${DB_TEST_PASS}@${DB_TEST_HOST}:${DB_TEST_PORT}/${DB_TEST}?schema=public`;
  }

  const { DB_DEV_USER, DB_DEV_PASS, DB_DEV_HOST, DB_DEV_PORT, DB_DEV } = process.env;
  return `postgresql://${DB_DEV_USER}:${DB_DEV_PASS}@${DB_DEV_HOST}:${DB_DEV_PORT}/${DB_DEV}?schema=public`;
}

// @Injectable() → class ini bisa di-inject ke service lain via constructor
// extends PrismaClient → PrismaService ADALAH PrismaClient dengan tambahan fitur NestJS
// implements OnModuleInit, OnModuleDestroy → hook ke lifecycle NestJS
import { AUDITED_MODELS, currentContext } from '../context/request-context';

/** Isi Device (create) dan UpdatedBy + Device (update) dari konteks request. */
function stampAudit(model: string | undefined, data: any, op: 'create' | 'update') {
  if (!model || !AUDITED_MODELS.has(model) || !data || typeof data !== 'object' || Array.isArray(data)) return;
  const ctx = currentContext();
  if (!ctx) return;
  if (ctx.device && data.Device === undefined) data.Device = ctx.device;
  if (op === 'update' && ctx.username && data.UpdatedBy === undefined) data.UpdatedBy = ctx.username;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = buildDatabaseUrl();

    // ── Setup Connection Pool ─────────────────────────────────────
    // Pool = kumpulan koneksi database yang siap pakai
    // connectionString dibaca dari .env (DATABASE_URL)
    const pool = new Pool({
      connectionString,
      max: 20,                        // Maks 20 koneksi bersamaan
      idleTimeoutMillis: 30000,       // Tutup koneksi idle setelah 30 detik
      connectionTimeoutMillis: 5000,  // Timeout jika tidak bisa konek dalam 5 detik
    });

    // ── Setup Prisma Adapter ──────────────────────────────────────
    // Adapter ini menghubungkan Prisma Client ke pg (PostgreSQL driver)
    // Prisma 7 membutuhkan adapter ini untuk koneksi database
    const adapter = new PrismaPg(pool);

    // Panggil super() untuk inisialisasi PrismaClient
    super({
      adapter,
      // Log query tergantung environment:
      // - development: tampilkan error + warning
      // - production: hanya tampilkan error
      log: process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
      // `password` di-omit secara global supaya tidak pernah bocor lewat
      // select/include/query polos. AuthService.login meng-override ini
      // secara eksplisit (`omit: { Password: false }`) karena login butuh
      // hash-nya untuk verifikasi.
      omit: { user: { Password: true }, employee: { PasswordHash: true } },
    });

    // Kolom audit transaksi (User Ubah / Komputer) diisi terpusat untuk semua create/update,
    // termasuk di dalam $transaction. Klien hasil $extends tetap memuat method kelas ini.
    const extended = this.$extends({
      query: {
        $allModels: {
          async create({ model, args, query }) { stampAudit(model, (args as any).data, 'create'); return query(args); },
          async update({ model, args, query }) { stampAudit(model, (args as any).data, 'update'); return query(args); },
          async upsert({ model, args, query }) {
            stampAudit(model, (args as any).create, 'create');
            stampAudit(model, (args as any).update, 'update');
            return query(args);
          },
        },
      },
    });
    // eslint-disable-next-line no-constructor-return
    return extended as unknown as PrismaService;
  }

  // ── Dipanggil saat aplikasi NestJS START ──────────────────────────
  // $connect() membuka koneksi ke database
  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Prisma connected to database');
  }

  // ── Dipanggil saat aplikasi NestJS STOP ──────────────────────────
  // $disconnect() menutup koneksi dengan bersih (graceful shutdown)
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected');
  }
}
