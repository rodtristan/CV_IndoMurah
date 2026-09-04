import 'dotenv/config';
// ================================================================
// prisma.config.ts — Konfigurasi Prisma CLI
// ================================================================
//
// File ini dipakai oleh Prisma CLI (bukan oleh app NestJS):
//   - npx prisma migrate dev
//   - npx prisma migrate deploy
//   - npx prisma generate
//   - npx prisma studio
//
// ┌─────────────────────────────────────────────────────────┐
// │  GANTI ENVIRONMENT DI SINI: ubah NODE_ENV di .env       │
// │    NODE_ENV=development → pakai DB: development          │
// │    NODE_ENV=production  → pakai DB: production           │
// └─────────────────────────────────────────────────────────┘
//
// Agar prisma CLI juga tahu environment, jalankan:
//   NODE_ENV=production npx prisma migrate deploy
// ================================================================

import path from 'node:path';
import { defineConfig } from 'prisma/config';

/**
 * Bangun database URL berdasarkan NODE_ENV.
 * Logika ini sama dengan database-config.ts di NestJS.
 * Duplikasi ini diperlukan karena prisma.config.ts berjalan
 * di luar konteks NestJS (tidak ada DI, tidak ada ConfigModule).
 */
function buildDatabaseUrl(): string {
  const env = process.env.NODE_ENV || 'development';

  // Jika DATABASE_URL diset eksplisit di .env → gunakan langsung
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Production → DB_PRD_*
  if (env === 'production') {
    const { DB_PRD_USER, DB_PRD_PASS, DB_PRD_HOST, DB_PRD_PORT, DB_PRD } = process.env;
    return `postgresql://${DB_PRD_USER}:${DB_PRD_PASS}@${DB_PRD_HOST}:${DB_PRD_PORT}/${DB_PRD}?schema=public`;
  }

  // Testing → DB_TEST_*
  if (env === 'testing') {
    const { DB_TEST_USER, DB_TEST_PASS, DB_TEST_HOST, DB_TEST_PORT, DB_TEST } = process.env;
    return `postgresql://${DB_TEST_USER}:${DB_TEST_PASS}@${DB_TEST_HOST}:${DB_TEST_PORT}/${DB_TEST}?schema=public`;
  }

  // Development (default) → DB_DEV_*
  const { DB_DEV_USER, DB_DEV_PASS, DB_DEV_HOST, DB_DEV_PORT, DB_DEV } = process.env;
  return `postgresql://${DB_DEV_USER}:${DB_DEV_PASS}@${DB_DEV_HOST}:${DB_DEV_PORT}/${DB_DEV}?schema=public`;
}

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),

  // datasource.url: dipakai Prisma CLI untuk migrate, generate, studio
  // Adapter runtime (PrismaPg) ada di PrismaService di NestJS — bukan di sini
  datasource: {
    url: buildDatabaseUrl(),
  },
});
