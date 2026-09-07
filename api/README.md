# Toko CV IndoMurah API

Backend NestJS (Fastify + Prisma + Redis), konfigurasi infrastruktur/tooling-nya mengikuti persis proyek `hris2/api` (package.json, tsconfig, nest-cli, eslint/prettier, Dockerfile, prisma.config.ts, struktur `common/` & `config/`, main.ts bootstrap).

Auth + kontrol akses (User/Role/Menu) sudah diimplementasikan, mengikuti pola persis `hris2/api`:

- `common/prisma` — PrismaService (Prisma 7 + adapter-pg + connection pool, `password` di-omit global)
- `common/redis` — RedisService (cache get/set/getOrSet/invalidatePattern)
- `common/query` — QueryService (smart query engine: `$select`, `$include`, `$where`, `$orderBy`, `$skip`, `$take`, `$search`)
- `common/utils` — HashIdService (obfuscate ID di URL), PathService (folder upload)
- `common/pipes` — SanitizePipe (anti XSS/SQL injection, global)
- `common/interceptors` — LoggingInterceptor (audit log ke tabel `logs`, global)
- `common/strategies` + `common/guards` — JwtStrategy + JwtAuthGuard (wajib login) + MenuAccessGuard (`@MenuKey('menu.name')`, cek RoleMenu/UserMenu)
- `modules/auth` — `POST /auth/login`, `POST /auth/register` (argon2id, rate-limited 5x/menit), `GET /auth/me`
- `modules/user` — CRUD user + `GET/POST/DELETE /users/:id/roles` (kelola role tambahan lewat `UserRole`)
- `modules/role` — CRUD role
- `modules/menu` — CRUD menu (tree via `parent_menu_id`) + assign/revoke menu ke role (`RoleMenu`) atau user (`UserMenu`) + `GET /menus/my-menus`
- `modules/health` — endpoint `GET /api/v1/health` untuk Docker healthcheck

Model akses: `User.main_role_id` = role utama; `UserRole` = role tambahan (opsional, di luar main role). Menu yang bisa diakses seorang user = union dari `RoleMenu` semua role-nya (main + UserRole) dengan `UserMenu` (override personal, prioritas tertinggi).

## Menjalankan

```bash
npm install
cp .env.example .env      # lalu sesuaikan kredensial DB/Redis
npx prisma generate
npx prisma migrate deploy # terapkan migration yang sudah ada di prisma/migrations/ ke DB kamu
npm run prisma:seed       # buat role Admin + menu dasar + user admin@tokocvindomurah.com / admin123
npm run start:dev
```

Swagger docs: `http://localhost:5000/docs`

> Ganti password admin default setelah login pertama — lihat output `npm run prisma:seed`.
>
> Migration baru? Setelah mengubah `prisma/schema.prisma`, jalankan
> `npx prisma migrate dev --name <nama>` untuk generate migration SQL baru
> — lalu **commit folder `prisma/migrations/` ke git**. `migrate deploy`
> (dipakai Docker/Railway saat start, lihat `Dockerfile`) tidak pernah
> generate migration baru dari schema diff, hanya menerapkan yang sudah ada.

> **Catatan ESLint 9**: konfigurasi ini memakai `.eslintrc.js` (format legacy), sama persis dengan `hris2/api`. Versi `eslint` terbaru (9.x) butuh flat config (`eslint.config.js`) secara default, jadi `npm run lint` / `npm run lint:check` akan error "couldn't find eslint.config.js" kecuali dijalankan dengan `ESLINT_USE_FLAT_CONFIG=false`, misalnya:
> `ESLINT_USE_FLAT_CONFIG=false npm run lint:check` (PowerShell: `$env:ESLINT_USE_FLAT_CONFIG='false'; npm run lint:check`). Ini adalah kuirk yang sama persis di proyek sumbernya, bukan hal yang diubah di sini.

## Deploy ke Railway

Repo ini monorepo, jadi buat service baru di Railway lalu di service settings:

1. **Root Directory** = `api` — Railway lalu otomatis memakai `api/railway.toml` + `api/Dockerfile`.
2. Set environment variables di tab **Variables**:
   - `DATABASE_URL` — connection string Postgres kamu (kalau pakai Postgres plugin Railway di project yang sama, biasanya sudah otomatis tersedia sebagai reference variable; kalau DB-nya di project/plugin lain, isi manual)
   - `JWT_SECRET`, `AUTH_SECRET_KEY`, `HASH_ID_SALT` — string random yang panjang
   - `CORS_ORIGIN` — `https://cvindomurah.vercel.app` (domain dashboard di Vercel)
   - `NODE_ENV` — `production`
3. Deploy. Domain default Railway berbentuk `<nama-service>.up.railway.app` — beri nama service `cvindomurah` agar URL-nya `cvindomurah.up.railway.app` (atau set custom domain di tab **Settings -> Networking**).

Migration jalan otomatis setiap kali container start/redeploy — lihat `Dockerfile`: `CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]`. Tidak perlu jalankan migration manual di Railway; cukup pastikan `prisma/migrations/` sudah ter-commit ke git sebelum push.

## Langkah lanjutan

1. Tambahkan model bisnis ke `prisma/schema.prisma` (mis. `Product`, `Order`, `Attendance` — dipakai juga oleh app mobile absensi) lalu `prisma migrate dev`.
2. Buat modul fitur (`src/modules/<nama>/`) mengikuti pola `modules/menu` / `modules/role` — controller + service + module, lindungi endpoint dengan `@UseGuards(JwtAuthGuard)` dan (opsional) `@UseGuards(JwtAuthGuard, MenuAccessGuard)` + `@MenuKey('nama.aksi')` jika perlu kontrol akses per menu.
3. Tambahkan menu baru lewat `POST /menus`, lalu hubungkan ke role via `POST /menus/role/:roleId/assign` supaya otomatis ter-provision ke user yang punya role tersebut.
