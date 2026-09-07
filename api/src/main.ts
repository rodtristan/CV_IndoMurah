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
import { AppModule } from './app-module';
import { SanitizePipe } from './common/pipes/sanitize-pipe';
import { PathService } from './common/utils/path-service';

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
      bodyLimit: 10 * 1024 * 1024, // 10MB
      routerOptions: {
        caseSensitive: false,      // /Products dan /products dianggap sama
      },
    }),
    {
      bufferLogs: true,
    },
  );

  const configService = app.get(ConfigService);

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
  const rawOrigin = configService.get<string>('CORS_ORIGIN', '');
  const corsOrigin: string | string[] = rawOrigin
    ? rawOrigin.split(',').map((o) => o.trim()).filter(Boolean)
    : '*';

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
    credentials: true,
  });

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

  // ── Langkah 7: Swagger Documentation ─────────────────────────────
  // URL: http://localhost:5000/docs
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

  // ── Langkah 8: Jalankan server ────────────────────────────────────
  const port = configService.get<number>('PORT', 5000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);

  logger.log(`🚀 Toko CV IndoMurah API berjalan di http://${host}:${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/docs`);
  logger.log(`🔧 Environment: ${configService.get('NODE_ENV', 'development')}`);
  logger.log(`🔒 CORS allowed origins: ${typeof corsOrigin === 'string' ? corsOrigin : corsOrigin.join(', ')}`);
}

bootstrap();
