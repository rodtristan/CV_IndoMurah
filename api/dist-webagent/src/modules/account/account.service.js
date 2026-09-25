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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const base_service_1 = require("../../common/templates/base.service");
const ledger_1 = require("../../common/accounting/ledger");
let AccountService = class AccountService extends base_service_1.BaseService {
    constructor(prisma, redis, queryService) {
        super(prisma, redis, queryService, {
            modelName: 'account',
            primaryKey: 'ID',
            searchableFields: ['*'],
            allowedIncludes: ['*'],
            allowedSortFields: ['*'],
            allowedSelectFields: ['*'],
            defaultOrderBy: { CreatedAt: 'desc' },
            maxTake: 100,
            defaultTake: 20,
            cacheTtl: 60,
            softDelete: true,
            softDeleteField: 'IsActive',
        });
        this.prisma = prisma;
        this.redis = redis;
        this.queryService = queryService;
    }
    async balances(asOf) {
        const map = await (0, ledger_1.accountBalances)(this.prisma, asOf);
        return [...map.values()];
    }
    async overlayBalance(rows) {
        const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
        if (!list.some((r) => r && typeof r === 'object' && 'ID' in r))
            return rows;
        const map = await (0, ledger_1.accountBalances)(this.prisma);
        for (const r of list) {
            if (r && typeof r === 'object' && 'ID' in r)
                r.Balance = map.get(r.ID)?.balance ?? 0;
        }
        return rows;
    }
};
exports.AccountService = AccountService;
exports.AccountService = AccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService])
], AccountService);
