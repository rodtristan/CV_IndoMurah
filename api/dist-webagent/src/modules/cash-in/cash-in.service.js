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
exports.CashInService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const base_service_1 = require("../../common/templates/base.service");
const auto_journal_service_1 = require("../../common/accounting/auto-journal.service");
const cash_doc_helper_1 = require("../../common/accounting/cash-doc.helper");
let CashInService = class CashInService extends base_service_1.BaseService {
    constructor(prisma, redis, queryService, autoJournal) {
        super(prisma, redis, queryService, {
            modelName: 'cashIn',
            primaryKey: 'ID',
            searchableFields: ['*'],
            allowedIncludes: ['*'],
            allowedSortFields: ['*'],
            allowedSelectFields: ['*'],
            defaultOrderBy: { CreatedAt: 'desc' },
            maxTake: 100,
            defaultTake: 20,
            cacheTtl: 60,
            softDelete: false,
        });
        this.prisma = prisma;
        this.redis = redis;
        this.queryService = queryService;
        this.autoJournal = autoJournal;
        this.doc = new cash_doc_helper_1.CashDocHelper(prisma, autoJournal, 'in');
    }
    async createDoc(dto, userId) {
        const r = await this.doc.create(dto, userId);
        await this.afterWrite();
        return r;
    }
    async updateDoc(id, dto, userId) {
        const r = await this.doc.update(id, dto, userId);
        await this.afterWrite();
        return r;
    }
    async deleteDoc(id) {
        const r = await this.doc.remove(id);
        await this.afterWrite();
        return r;
    }
    lines(id) {
        return this.doc.lines(id);
    }
    async afterWrite() {
        await this.invalidateCache();
        await this.redis.invalidatePattern('journal:*');
    }
};
exports.CashInService = CashInService;
exports.CashInService = CashInService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService,
        auto_journal_service_1.AutoJournalService])
], CashInService);
