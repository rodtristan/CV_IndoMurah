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
exports.JournalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const base_service_1 = require("../../common/templates/base.service");
const client_1 = require("@prisma/client");
const auto_journal_service_1 = require("../../common/accounting/auto-journal.service");
let JournalService = class JournalService extends base_service_1.BaseService {
    constructor(prisma, redis, queryService, autoJournal) {
        super(prisma, redis, queryService, {
            modelName: 'journal',
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
    async createJournal(dto, userId) {
        if (!dto.entries || dto.entries.length === 0) {
            throw new common_1.BadRequestException('Jurnal harus memiliki minimal 1 baris debit/kredit');
        }
        const totalDebit = dto.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
        const totalCredit = dto.entries.reduce((sum, e) => sum + (e.credit || 0), 0);
        if (Math.round(totalDebit * 100) !== Math.round(totalCredit * 100)) {
            throw new common_1.BadRequestException(`Jurnal tidak balance: total debit ${totalDebit} tidak sama dengan total kredit ${totalCredit}`);
        }
        const date = dto.date ? new Date(dto.date) : new Date();
        if (isNaN(date.getTime()))
            throw new common_1.BadRequestException('Tanggal tidak valid');
        const journal = await this.prisma.$transaction(async (tx) => {
            await this.autoJournal.assertOpenPeriod(tx, date);
            const code = await this.autoJournal.nextCode(tx, date);
            return tx.journal.create({
                data: {
                    Code: code,
                    Date: date,
                    Description: dto.description,
                    ReferenceType: dto.referenceType,
                    ReferenceID: dto.referenceId,
                    IsPosted: true,
                    PostedAt: new Date(),
                    CreatedByID: userId,
                    JournalEntries: {
                        create: {
                            JournalNumber: code,
                            Date: date,
                            Description: dto.description,
                            TotalDebit: new client_1.Prisma.Decimal(totalDebit),
                            TotalCredit: new client_1.Prisma.Decimal(totalCredit),
                            Status: 'POSTED',
                            CreatedByID: userId,
                            Lines: {
                                create: dto.entries.map((e, index) => ({
                                    AccountID: e.accountId,
                                    Debit: new client_1.Prisma.Decimal(e.debit || 0),
                                    Credit: new client_1.Prisma.Decimal(e.credit || 0),
                                    Description: e.memo,
                                    LineNumber: index + 1,
                                    CreatedByID: userId,
                                })),
                            },
                        },
                    },
                },
                include: { JournalEntries: { include: { Lines: { include: { Account: true } } } }, Creator: true },
            });
        });
        await this.invalidateCache();
        return journal;
    }
    async updateJournal(id, dto, userId) {
        const existing = await this.prisma.journal.findUnique({ where: { ID: id } });
        if (!existing)
            throw new common_1.BadRequestException('Jurnal tidak ditemukan');
        if (existing.ReferenceType) {
            throw new common_1.BadRequestException('Jurnal otomatis dari sistem tidak dapat diubah');
        }
        if (dto.entries && dto.entries.length > 0) {
            const entries = dto.entries;
            const totalDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
            const totalCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
            if (Math.round(totalDebit * 100) !== Math.round(totalCredit * 100)) {
                throw new common_1.BadRequestException(`Jurnal tidak balance: total debit ${totalDebit} tidak sama dengan total kredit ${totalCredit}`);
            }
            const journal = await this.prisma.$transaction(async (tx) => {
                await this.autoJournal.assertOpenPeriod(tx, existing.Date);
                await tx.journalEntry.deleteMany({ where: { JournalID: id } });
                await tx.journalEntry.create({
                    data: {
                        JournalNumber: existing.Code,
                        Date: existing.Date,
                        Description: dto.description ?? existing.Description,
                        TotalDebit: new client_1.Prisma.Decimal(totalDebit),
                        TotalCredit: new client_1.Prisma.Decimal(totalCredit),
                        Status: 'POSTED',
                        CreatedByID: userId,
                        JournalID: id,
                        Lines: {
                            create: entries.map((e, index) => ({
                                AccountID: e.accountId,
                                Debit: new client_1.Prisma.Decimal(e.debit || 0),
                                Credit: new client_1.Prisma.Decimal(e.credit || 0),
                                Description: e.memo,
                                LineNumber: index + 1,
                                CreatedByID: userId,
                            })),
                        },
                    },
                });
                return tx.journal.update({
                    where: { ID: id },
                    data: { Description: dto.description ?? existing.Description },
                    include: { JournalEntries: { include: { Lines: { include: { Account: true } } } }, Creator: true },
                });
            });
            await this.invalidateCache();
            return journal;
        }
        const journal = await this.prisma.journal.update({
            where: { ID: id },
            data: { Description: dto.description ?? existing.Description },
            include: { JournalEntries: { include: { Lines: { include: { Account: true } } } }, Creator: true },
        });
        await this.invalidateCache();
        return journal;
    }
    async deleteJournal(id) {
        const existing = await this.prisma.journal.findUnique({ where: { ID: id } });
        if (!existing)
            throw new common_1.BadRequestException('Jurnal tidak ditemukan');
        if (existing.ReferenceType) {
            throw new common_1.BadRequestException('Jurnal otomatis dari sistem tidak dapat dihapus');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            await this.autoJournal.assertOpenPeriod(tx, existing.Date);
            await tx.journalEntry.deleteMany({ where: { JournalID: id } });
            return tx.journal.delete({ where: { ID: id } });
        });
        await this.invalidateCache();
        return result;
    }
};
exports.JournalService = JournalService;
exports.JournalService = JournalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService,
        auto_journal_service_1.AutoJournalService])
], JournalService);
