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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisService_1.name);
    }
    async onModuleInit() {
        this.client = new ioredis_1.default({
            host: this.configService.get('REDIS_HOST', '127.0.0.1'),
            port: this.configService.get('REDIS_PORT', 6379),
            password: this.configService.get('REDIS_PASSWORD', ''),
            db: this.configService.get('REDIS_DB', 0),
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                if (times > 3) {
                    this.logger.warn('Redis retry limit reached, running without cache');
                    return null;
                }
                return Math.min(times * 200, 2000);
            },
            lazyConnect: true,
        });
        this.client.on('error', (err) => {
            if (!['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET'].includes(err.code ?? '')) {
                this.logger.error(`Redis error: ${err.message}`);
            }
        });
        try {
            await this.client.connect();
            this.logger.log('✅ Redis connected');
        }
        catch {
            this.logger.warn('⚠️ Redis not available, running without cache');
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
            this.logger.log('🔌 Redis disconnected');
        }
    }
    getClient() {
        return this.client;
    }
    async ping() {
        try {
            if (!this.client || this.client.status !== 'ready')
                return false;
            return (await this.client.ping()) === 'PONG';
        }
        catch {
            return false;
        }
    }
    async get(key) {
        try {
            if (!this.client || this.client.status !== 'ready')
                return null;
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttl = 60) {
        try {
            if (!this.client || this.client.status !== 'ready')
                return;
            await this.client.setex(key, ttl, JSON.stringify(value));
        }
        catch {
        }
    }
    async del(key) {
        try {
            if (!this.client || this.client.status !== 'ready')
                return;
            await this.client.del(key);
        }
        catch {
        }
    }
    async invalidatePattern(pattern) {
        try {
            if (!this.client || this.client.status !== 'ready')
                return;
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(...keys);
            }
        }
        catch {
        }
    }
    async getOrSet(key, factory, ttl = 60) {
        const cached = await this.get(key);
        if (cached !== null)
            return cached;
        const value = await factory();
        await this.set(key, value, ttl);
        return value;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
