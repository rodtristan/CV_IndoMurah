import { requestContext, clientLabel } from './common/context/request-context';
// ================================================================
// main.ts — Titik masuk aplikasi Toko CV IndoMurah API
// ================================================================
//
// File ini adalah file PERTAMA yang dijalankan saat server start.
// Urutan setup yang terjadi di sini:
//   1. Buat folder upload jika belum ada
//   2. Buat aplikasi NestJS dengan engine Fastify (lebih cepat dari Express)
//   3. Set global prefix: semua endpoint akan mulai dengan /api/v1/...
//   4. Konfigurasi CORS: siapa saja yang boleh akses API ini dari browser
//   5. Pasang Helmet: security header HTTP agar lebih aman
//   6. Pasang Sanitize Pipe: bersihkan input dari XSS / SQL injection
//   7. Setup Swagger: dokumentasi API otomatis
//   8. Jalankan server di port yang sudah dikonfigurasi
//
// Untuk menjalankan tanpa Docker:
//   npm run start:dev
// ================================================================

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as qs from 'qs';
import { AppModule } from './app-module';
import { SanitizePipe } from './common/pipes/sanitize-pipe';
import { PathService } from './common/utils/path-service';
import { resolveJwtSecret } from './config/jwt-config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  // ── Langkah 1: Pastikan folder uploads sudah ada ──────────────
  PathService.ensureAllDirs();

  // ── Langkah 2: Buat aplikasi NestJS ──────────────────────────────
  // FastifyAdapter dipakai karena 2-3x lebih cepat dari Express.
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      // Di belakang proxy (Railway / Docker / Nginx): percayai X-Forwarded-For
      // supaya req.ip = IP klien asli. Tanpa ini semua user berbagi satu
      // bucket rate-limit (IP proxy). Bisa diatur lewat TRUST_PROXY
      // (true/false/jumlah hop/daftar IP); default true.
      trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
      bodyLimit: 10 * 1024 * 1024, // 10MB
      routerOptions: {
        caseSensitive: false,      // /Products dan /products dianggap sama
      },
      // Fastify's default query parser is flat (no bracket nesting), but
      // the Smart Query engine (common/query/query-service.ts) needs
      // `$where[field]=value` / `$orderBy[field]=asc` to arrive as real
      // nested objects — that's what `qs` (the same parser Express uses)
      // gives us. Without this, $where/$orderBy/$include silently no-op.
      querystringParser: (str) => qs.parse(str),
    }),
    {
      bufferLogs: true,
    },
  );

  const configService = app.get(ConfigService);
  // Dibaca SETELAH app dibuat supaya nilai dari file .env (ConfigModule) ikut terbaca.
  const isProd = process.env.NODE_ENV === 'production';

  // ── Langkah 0: Validasi konfigurasi kritis (fail fast di production) ──
  // Throw bila JWT_SECRET kosong / < 32 karakter saat NODE_ENV=production
  // (jwt-config & JwtStrategy juga memanggil ini, jadi app gagal start lebih awal).
  resolveJwtSecret();
  if (!isProd && !process.env.JWT_SECRET) {
    logger.warn('JWT_SECRET tidak di-set — memakai secret development. JANGAN dipakai di production.');
  }

  // ── Langkah 3: Global prefix ──────────────────────────────────────
  // Semua endpoint otomatis diawali dengan /api/v1
  app.setGlobalPrefix('api/v1');

  // ── CORS (Cross-Origin Resource Sharing) ──────────────────────────────────
  // Cara kerja parsing origins:
  //   CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
  //   → akan diizinkan dua origin sekaligus
  //
  // Untuk mobile (Flutter), CORS tidak berlaku karena mobile bukan browser.
  // ────────────────────────────────────────────────────────────────────────────
  // Tanpa CORS_ORIGIN (hanya boleh di non-production): izinkan semua origin
  // TANPA credentials — kombinasi '*' + credentials tidak aman. Autentikasi
  // memakai header Authorization (bukan cookie), jadi credentials tidak dibutuhkan.
  const rawOrigin = (configService.get<string>('CORS_ORIGIN', '') ?? '').trim();
  const originList = rawOrigin && rawOrigin !== '*'
    ? rawOrigin.split(',').map((o) => o.trim()).filter((o) => o && o !== '*')
    : [];
  if (isProd && originList.length === 0) {
    throw new Error('CORS_ORIGIN harus berisi daftar origin eksplisit (bukan "*") saat NODE_ENV=production.');
  }
  const corsOrigin: string | string[] = originList.length ? originList : '*';

  // Konteks per request (username + "Komputer") untuk kolom audit transaksi.
  app.getHttpAdapter().getInstance().addHook('onRequest', (req: any, _reply: any, done: () => void) => {
    requestContext.run({ device: clientLabel(req.headers ?? {}) }, done);
  });

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With,X-Client',
    exposedHeaders: 'Content-Disposition',
    credentials: originList.length > 0,
  });

  // Upload file (Report Design: gambar/logo → Google Drive), batas global 10 MB (CSV import); gambar dibatasi 2 MB di FileStorageController
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  await app.register(require('@fastify/multipart'), { limits: { fileSize: 10 * 1024 * 1024, files: 1 } });

  // ── Langkah 5: Security headers via Helmet ────────────────────────
  await app.register(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports
    require('@fastify/helmet'),
    {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true,
      hidePoweredBy: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    },
  );

  // ── Langkah 6: Global Pipes ────────────────────────────────────────
  //   [1] SanitizePipe — bersihkan semua input dari karakter berbahaya
  //   [2] ValidationPipe — validasi DTO (Data Transfer Object)
  app.useGlobalPipes(
    new SanitizePipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Langkah 7: Swagger Documentation (hanya di luar production) ──
  // URL: http://localhost:5000/docs
  if (!isProd) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Toko CV IndoMurah API')
      .setDescription(
        `## Toko CV IndoMurah API

  Built with NestJS + Fastify + Prisma + Redis.

  ### Query Engine (Smart Query)
  All GET endpoints support a powerful query syntax via query parameters:

  - **\`$select\`** — Choose fields: \`?$select=id,name,price\`
  - **\`$include\`** — Include relations: \`?$include=category,variants\`
  - **\`$where\`** — Filter: \`?$where[is_active]=true&$where[category_id]=1\`
  - **\`$orderBy\`** — Sort: \`?$orderBy[createdAt]=desc\`
  - **\`$skip\`** — Pagination offset: \`?$skip=0\`
  - **\`$take\`** — Page size: \`?$take=20\`
  - **\`$search\`** — Full-text search: \`?$search=keyword\`
  - **\`$searchFields\`** — Fields to search: \`?$searchFields=name,description\`
        `,
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Login, register, profil (JWT)')
      .addTag('Users', 'Manajemen akun & UserRole (role tambahan per user)')
      .addTag('Roles', 'Role/jabatan')
      .addTag('Menus', 'Menu sidebar & kontrol akses (RoleMenu/UserMenu)')
      .addTag('Health', 'Health check endpoint')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });
  }

  // ── Langkah 8: Jalankan server ────────────────────────────────────
  const port = configService.get<number>('PORT', 5000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);

  logger.log(`🚀 Toko CV IndoMurah API berjalan di http://${host}:${port}`);
  if (!isProd) logger.log(`📚 Swagger docs: http://localhost:${port}/docs`);
  logger.log(`🔧 Environment: ${configService.get('NODE_ENV', 'development')}`);
  logger.log(`🔒 CORS allowed origins: ${typeof corsOrigin === 'string' ? corsOrigin : corsOrigin.join(', ')}`);
}

/** TRUST_PROXY: kosong/'true' → true, 'false' → false, angka → jumlah hop, selain itu daftar IP/CIDR. */
function parseTrustProxy(raw: string | undefined): boolean | number | string {
  const v = (raw ?? '').trim();
  if (!v || v.toLowerCase() === 'true') return true;
  if (v.toLowerCase() === 'false') return false;
  if (/^\d+$/.test(v)) return parseInt(v, 10);
  return v;
}

bootstrap();
