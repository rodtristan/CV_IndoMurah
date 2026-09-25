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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require(".prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
function buildDatabaseUrl() {
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
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        const connectionString = buildDatabaseUrl();
        const pool = new pg_1.Pool({
            connectionString,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });
        const adapter = new adapter_pg_1.PrismaPg(pool);
        super({
            adapter,
            log: process.env.NODE_ENV === 'development'
                ? ['error', 'warn']
                : ['error'],
            omit: { user: { Password: true }, employee: { PasswordHash: true } },
        });
        this.logger = new common_1.Logger(PrismaService_1.name);
    }
    async onModuleInit() {
        await this.$connect();
        this.logger.log('✅ Prisma connected to database');
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Prisma disconnected');
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
