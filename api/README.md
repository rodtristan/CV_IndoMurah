# Toko CV IndoMurah API

Backend NestJS (Fastify + Prisma + Redis), konfigurasi infrastruktur/tooling-nya mengikuti persis proyek `hris2/api` (package.json, tsconfig, nest-cli, eslint/prettier, Dockerfile, prisma.config.ts, struktur `common/` & `config/`, main.ts bootstrap).

Modul bisnis (Product, Order, User, Attendance, dll) **belum ditambahkan** — scaffold ini baru berisi layer infrastruktur siap pakai:

- `common/prisma` — PrismaService (Prisma 7 + adapter-pg + connection pool)
- `common/redis` — RedisService (cache get/set/getOrSet/invalidatePattern)
- `common/query` — QueryService (smart query engine: `$select`, `$include`, `$where`, `$orderBy`, `$skip`, `$take`, `$search`)
- `common/utils` — HashIdService (obfuscate ID di URL), PathService (folder upload)
- `common/pipes` — SanitizePipe (anti XSS/SQL injection, global)
- `common/interceptors` — LoggingInterceptor (audit log ke tabel `logs`, global)
- `common/strategies` + `common/guards` — JwtStrategy + JwtAuthGuard (JWT sudah diregister di `AppModule`, tinggal dipakai `@UseGuards(JwtAuthGuard)` begitu modul Auth dibuat)
- `modules/health` — endpoint `GET /api/v1/health` untuk Docker healthcheck

## Menjalankan

```bash
npm install
cp .env.example .env      # lalu sesuaikan kredensial DB/Redis
npx prisma generate
npx prisma migrate dev    # setelah menambahkan model ke prisma/schema.prisma
npm run start:dev
```

Swagger docs: `http://localhost:5000/docs`

> **Catatan ESLint 9**: konfigurasi ini memakai `.eslintrc.js` (format legacy), sama persis dengan `hris2/api`. Versi `eslint` terbaru (9.x) butuh flat config (`eslint.config.js`) secara default, jadi `npm run lint` / `npm run lint:check` akan error "couldn't find eslint.config.js" kecuali dijalankan dengan `ESLINT_USE_FLAT_CONFIG=false`, misalnya:
> `ESLINT_USE_FLAT_CONFIG=false npm run lint:check` (PowerShell: `$env:ESLINT_USE_FLAT_CONFIG='false'; npm run lint:check`). Ini adalah kuirk yang sama persis di proyek sumbernya, bukan hal yang diubah di sini.

## Langkah lanjutan

1. Tambahkan model bisnis ke `prisma/schema.prisma` (mis. `User`, `Product`, `Order`, `Attendance` — dipakai juga oleh app mobile absensi).
2. Setelah ada model `User` dengan field password, tambahkan `omit: { user: { password: true } }` di `PrismaService` (lihat komentar TODO di file tsb).
3. Buat modul fitur (`src/modules/<nama>/`) mengikuti pola `modules/health` — controller + module, tambahkan service/DTO sesuai kebutuhan.
4. Buat `AuthModule` (login/register) yang memakai `JwtStrategy` & `JwtAuthGuard` yang sudah disiapkan.
