"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const qs = __importStar(require("qs"));
const app_module_1 = require("./app-module");
const sanitize_pipe_1 = require("./common/pipes/sanitize-pipe");
const path_service_1 = require("./common/utils/path-service");
const jwt_config_1 = require("./config/jwt-config");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    path_service_1.PathService.ensureAllDirs();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({
        logger: false,
        trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
        bodyLimit: 10 * 1024 * 1024,
        routerOptions: {
            caseSensitive: false,
        },
        querystringParser: (str) => qs.parse(str),
    }), {
        bufferLogs: true,
    });
    const configService = app.get(config_1.ConfigService);
    const isProd = process.env.NODE_ENV === 'production';
    (0, jwt_config_1.resolveJwtSecret)();
    if (!isProd && !process.env.JWT_SECRET) {
        logger.warn('JWT_SECRET tidak di-set — memakai secret development. JANGAN dipakai di production.');
    }
    app.setGlobalPrefix('api/v1');
    const rawOrigin = (configService.get('CORS_ORIGIN', '') ?? '').trim();
    const originList = rawOrigin && rawOrigin !== '*'
        ? rawOrigin.split(',').map((o) => o.trim()).filter((o) => o && o !== '*')
        : [];
    if (isProd && originList.length === 0) {
        throw new Error('CORS_ORIGIN harus berisi daftar origin eksplisit (bukan "*") saat NODE_ENV=production.');
    }
    const corsOrigin = originList.length ? originList : '*';
    app.enableCors({
        origin: corsOrigin,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
        exposedHeaders: 'Content-Disposition',
        credentials: originList.length > 0,
    });
    await app.register(require('@fastify/multipart'), { limits: { fileSize: 10 * 1024 * 1024, files: 1 } });
    await app.register(require('@fastify/helmet'), {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: [],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
        frameguard: { action: 'deny' },
        noSniff: true,
        xssFilter: true,
        hidePoweredBy: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    });
    app.useGlobalPipes(new sanitize_pipe_1.SanitizePipe(), new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    if (!isProd) {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('Toko CV IndoMurah API')
            .setDescription(`## Toko CV IndoMurah API

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
        `)
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('Auth', 'Login, register, profil (JWT)')
            .addTag('Users', 'Manajemen akun & UserRole (role tambahan per user)')
            .addTag('Roles', 'Role/jabatan')
            .addTag('Menus', 'Menu sidebar & kontrol akses (RoleMenu/UserMenu)')
            .addTag('Health', 'Health check endpoint')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                docExpansion: 'none',
                filter: true,
                showRequestDuration: true,
            },
        });
    }
    const port = configService.get('PORT', 5000);
    const host = configService.get('HOST', '0.0.0.0');
    await app.listen(port, host);
    logger.log(`🚀 Toko CV IndoMurah API berjalan di http://${host}:${port}`);
    if (!isProd)
        logger.log(`📚 Swagger docs: http://localhost:${port}/docs`);
    logger.log(`🔧 Environment: ${configService.get('NODE_ENV', 'development')}`);
    logger.log(`🔒 CORS allowed origins: ${typeof corsOrigin === 'string' ? corsOrigin : corsOrigin.join(', ')}`);
}
function parseTrustProxy(raw) {
    const v = (raw ?? '').trim();
    if (!v || v.toLowerCase() === 'true')
        return true;
    if (v.toLowerCase() === 'false')
        return false;
    if (/^\d+$/.test(v))
        return parseInt(v, 10);
    return v;
}
bootstrap();
