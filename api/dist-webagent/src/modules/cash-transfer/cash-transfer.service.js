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
exports.CashTransferService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const base_service_1 = require("../../common/templates/base.service");
const auto_journal_service_1 = require("../../common/accounting/auto-journal.service");
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
let CashTransferService = class CashTransferService extends base_service_1.BaseService {
    constructor(prisma, redis, queryService, autoJournal) {
        super(prisma, redis, queryService, {
            modelName: 'cashTransfer',
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
    }
    async validate(fromId, toId, amount) {
        if (!fromId || !toId)
            throw new common_1.BadRequestException('Akun asal dan tujuan wajib dipilih');
        if (fromId === toId)
            throw new common_1.BadRequestException('Akun asal dan tujuan tidak boleh sama');
        if (!(amount > 0))
            throw new common_1.BadRequestException('Jumlah harus lebih dari 0');
        const found = await this.prisma.account.count({ where: { ID: { in: [fromId, toId] } } });
        if (found !== 2)
            throw new common_1.BadRequestException('Ada perkiraan yang tidak ditemukan');
    }
    async post(tx, doc, userId) {
        const desc = `Kas Transfer ${doc.Code}${doc.Description ? ` - ${doc.Description}` : ''}`;
        await this.autoJournal.post(tx, {
            referenceType: auto_journal_service_1.REF.CASH_TRANSFER, referenceId: doc.ID, date: doc.Date, description: desc, userId, referenceNumber: doc.Code,
            lines: [
                { accountId: doc.ToAccountID, debit: Number(doc.Amount) },
                { accountId: doc.FromAccountID, credit: Number(doc.Amount) },
            ],
        });
    }
    async createDoc(dto, userId) {
        const amount = r2(dto.amount);
        await this.validate(dto.fromAccountId, dto.toAccountId, amount);
        const date = dto.date ? new Date(dto.date) : new Date();
        const doc = await this.prisma.$transaction(async (tx) => {
            const d = await tx.cashTransfer.create({
                data: {
                    Code: dto.code || `KT-${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`,
                    Date: date, FromAccountID: dto.fromAccountId, ToAccountID: dto.toAccountId,
                    Amount: new client_1.Prisma.Decimal(amount.toFixed(2)), Description: dto.description ?? null, CreatedByID: userId,
                },
            });
            await this.post(tx, d, userId);
            return d;
        });
        await this.afterWrite();
        return doc;
    }
    async updateDoc(id, dto, userId) {
        const ex = await this.prisma.cashTransfer.findUnique({ where: { ID: id } });
        if (!ex)
            throw new common_1.NotFoundException('Kas Transfer tidak ditemukan');
        const fromId = dto.fromAccountId ?? ex.FromAccountID;
        const toId = dto.toAccountId ?? ex.ToAccountID;
        const amount = dto.amount !== undefined ? r2(dto.amount) : Number(ex.Amount);
        await this.validate(fromId, toId, amount);
        const doc = await this.prisma.$transaction(async (tx) => {
            const d = await tx.cashTransfer.update({
                where: { ID: id },
                data: {
                    ...(dto.code ? { Code: dto.code } : {}),
                    ...(dto.date ? { Date: new Date(dto.date) } : {}),
                    FromAccountID: fromId, ToAccountID: toId, Amount: new client_1.Prisma.Decimal(amount.toFixed(2)),
                    ...(dto.description !== undefined ? { Description: dto.description } : {}),
                },
            });
            await this.post(tx, d, userId);
            return d;
        });
        await this.afterWrite();
        return doc;
    }
    async deleteDoc(id) {
        const ex = await this.prisma.cashTransfer.findUnique({ where: { ID: id } });
        if (!ex)
            throw new common_1.NotFoundException('Kas Transfer tidak ditemukan');
        const r = await this.prisma.$transaction(async (tx) => {
            await this.autoJournal.reverse(tx, auto_journal_service_1.REF.CASH_TRANSFER, id);
            return tx.cashTransfer.delete({ where: { ID: id } });
        });
        await this.afterWrite();
        return r;
    }
    async afterWrite() {
        await this.invalidateCache();
        await this.redis.invalidatePattern('journal:*');
    }
};
exports.CashTransferService = CashTransferService;
exports.CashTransferService = CashTransferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService,
        auto_journal_service_1.AutoJournalService])
], CashTransferService);
