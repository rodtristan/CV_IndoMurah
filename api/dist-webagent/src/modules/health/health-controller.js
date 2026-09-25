"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const DB_TIMEOUT_MS = 3000;
let HealthController = class HealthController {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async check(reply) {
        const [database, redis] = await Promise.all([this.checkDb(), this.redis.ping()]);
        const status = !database ? 'error' : redis ? 'ok' : 'degraded';
        if (!database)
            reply.status(common_1.HttpStatus.SERVICE_UNAVAILABLE);
        return {
            status,
            checks: { database: database ? 'up' : 'down', redis: redis ? 'up' : 'down' },
            timestamp: new Date().toISOString(),
        };
    }
    async checkDb() {
        try {
            await Promise.race([
                this.prisma.$queryRaw `SELECT 1`,
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), DB_TIMEOUT_MS)),
            ]);
            return true;
        }
        catch {
            return false;
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health Check — cek API, database (SELECT 1) & Redis' }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], HealthController);
