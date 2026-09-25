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
exports.SalePaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const client_1 = require("@prisma/client");
const auto_journal_service_1 = require("../../common/accounting/auto-journal.service");
const deposit_ledger_service_1 = require("../../common/accounting/deposit-ledger.service");
const payment_link_1 = require("../../common/accounting/payment-link");
let SalePaymentService = class SalePaymentService {
    constructor(prisma, redis, queryService, autoJournal, deposits) {
        this.prisma = prisma;
        this.redis = redis;
        this.queryService = queryService;
        this.autoJournal = autoJournal;
        this.deposits = deposits;
        this.CACHE_PREFIX = 'sale_payments';
        this.CACHE_TTL = 60;
    }
    async findAll(query) {
        const cacheKey = this.queryService.generateCacheKey(this.CACHE_PREFIX, query);
        return this.redis.getOrSet(cacheKey, async () => {
            const prismaQuery = this.queryService.buildPrismaQuery(query, {
                searchableFields: ['*'],
                allowedIncludes: ['*'],
                defaultOrderBy: { CreatedAt: 'desc' },
            });
            const findArgs = {
                where: prismaQuery.where,
                orderBy: prismaQuery.orderBy,
                skip: prismaQuery.skip,
                take: prismaQuery.take,
            };
            if (prismaQuery.select) {
                findArgs.select = prismaQuery.select;
            }
            else if (prismaQuery.include) {
                findArgs.include = prismaQuery.include;
            }
            const [data, total] = await Promise.all([
                this.prisma.salePayment.findMany(findArgs),
                this.prisma.salePayment.count({ where: prismaQuery.where }),
            ]);
            const serializedData = data.map((item) => this.serialize(item));
            return { data: serializedData, total, skip: prismaQuery.skip, take: prismaQuery.take };
        }, this.CACHE_TTL);
    }
    async findOne(id, query = {}) {
        const cacheKey = Object.keys(query).length
            ? `${this.CACHE_PREFIX}:${id}:${this.queryService.generateCacheKey('q', query)}`
            : `${this.CACHE_PREFIX}:${id}`;
        return this.redis.getOrSet(cacheKey, async () => {
            const prismaQuery = this.queryService.buildPrismaQuery(query, {
                allowedIncludes: ['*'],
            });
            const findArgs = { where: { ID: id } };
            if (prismaQuery.select) {
                findArgs.select = prismaQuery.select;
            }
            else if (prismaQuery.include) {
                findArgs.include = prismaQuery.include;
            }
            const data = await this.prisma.salePayment.findUnique(findArgs);
            return data ? this.serialize(data) : null;
        }, this.CACHE_TTL);
    }
    async resolveInstrument(tx, methodId, instrument, useDeposit) {
        let inst = useDeposit ? 'DEPOSIT' : instrument ?? 'CASH';
        let method = methodId ? await tx.paymentMethod.findUnique({ where: { ID: methodId } }) : null;
        if (methodId && !method)
            throw new common_1.BadRequestException('Metode pembayaran tidak ditemukan');
        if (method?.Code === 'DEPOSIT')
            inst = 'DEPOSIT';
        if (inst === 'DEPOSIT')
            method = await (0, payment_link_1.ensureDepositMethod)(tx);
        if (!method)
            throw new common_1.BadRequestException('Metode pembayaran wajib dipilih');
        return { inst, methodId: method.ID };
    }
    async afterPaymentWrite(tx, paymentId, userId) {
        const p = await tx.salePayment.findUniqueOrThrow({ where: { ID: paymentId }, include: { Sale: { select: { CustomerID: true, Code: true } } } });
        if (p.InstrumentType === 'DEPOSIT') {
            await this.deposits.useCustomerDeposit(tx, {
                customerId: p.Sale.CustomerID, salePaymentId: p.ID, amount: Number(p.Amount), date: p.Date, userId,
                note: `Pembayaran penjualan ${p.Sale.Code} memakai deposit`,
            });
        }
        else {
            await this.deposits.releaseCustomerDeposit(tx, p.ID);
        }
        await (0, payment_link_1.syncChequeMirror)(tx, 'SALE_PAYMENT', p);
        await this.autoJournal.postSalePayment(tx, p.ID, userId);
        await this.updateSalePaymentStatus(tx, p.SaleID);
    }
    async create(dto, userId) {
        const parent = await this.prisma.sale.findUnique({ where: { ID: dto.SaleID } });
        if (!parent)
            throw new common_1.NotFoundException('Sale not found');
        const existing = await this.prisma.salePayment.findMany({ where: { SaleID: dto.SaleID } });
        const committed = existing.reduce((sum, p) => sum + Number(p.Amount), 0);
        const remaining = Number(parent.Total) - committed;
        if (dto.Amount <= 0)
            throw new common_1.BadRequestException('Jumlah pembayaran harus lebih dari 0');
        if (dto.Amount > remaining + 0.005) {
            throw new common_1.BadRequestException(`Payment amount (${dto.Amount}) exceeds remaining amount (${remaining})`);
        }
        const payment = await this.prisma.$transaction(async (tx) => {
            const { inst, methodId } = await this.resolveInstrument(tx, dto.MethodID, dto.InstrumentType, dto.UseDeposit);
            const cleared = !(0, payment_link_1.isChequeInstrument)(inst);
            const created = await tx.salePayment.create({
                data: {
                    SaleID: dto.SaleID,
                    MethodID: methodId,
                    Amount: new client_1.Prisma.Decimal(dto.Amount.toString()),
                    ReferenceNumber: dto.ReferenceNumber,
                    Date: dto.Date ? new Date(dto.Date) : new Date(),
                    Notes: dto.Notes,
                    InstrumentType: inst,
                    DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
                    IsCleared: cleared,
                    ClearedAt: cleared ? new Date() : null,
                    CreatedByID: userId,
                },
            });
            await this.afterPaymentWrite(tx, created.ID, userId);
            return tx.salePayment.findUniqueOrThrow({ where: { ID: created.ID }, include: { Sale: true, Creator: true } });
        });
        await this.invalidate(dto.SaleID);
        return this.serialize(payment);
    }
    async update(id, dto, userId) {
        const payment = await this.prisma.salePayment.findUnique({ where: { ID: id } });
        if (!payment)
            throw new common_1.NotFoundException('Sale payment not found');
        if (dto.Amount !== undefined) {
            const parent = await this.prisma.sale.findUnique({ where: { ID: payment.SaleID } });
            const others = await this.prisma.salePayment.findMany({ where: { SaleID: payment.SaleID, NOT: { ID: id } } });
            const committed = others.reduce((sum, p) => sum + Number(p.Amount), 0);
            if (dto.Amount <= 0)
                throw new common_1.BadRequestException('Jumlah pembayaran harus lebih dari 0');
            if (parent && dto.Amount + committed > Number(parent.Total) + 0.005) {
                throw new common_1.BadRequestException('Payment amount exceeds remaining amount');
            }
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const target = dto.UseDeposit ? 'DEPOSIT' : dto.InstrumentType ?? (dto.UseDeposit === false && payment.InstrumentType === 'DEPOSIT' ? 'CASH' : payment.InstrumentType);
            const leavingDeposit = target !== 'DEPOSIT' && payment.InstrumentType === 'DEPOSIT';
            const { inst, methodId } = await this.resolveInstrument(tx, dto.MethodID ?? (leavingDeposit ? undefined : payment.MethodID), target, dto.UseDeposit);
            const updateData = { MethodID: methodId, InstrumentType: inst };
            if (dto.Amount !== undefined)
                updateData.Amount = new client_1.Prisma.Decimal(dto.Amount.toString());
            if (dto.ReferenceNumber !== undefined)
                updateData.ReferenceNumber = dto.ReferenceNumber;
            if (dto.Date)
                updateData.Date = new Date(dto.Date);
            if (dto.Notes !== undefined)
                updateData.Notes = dto.Notes;
            if (dto.DueDate !== undefined)
                updateData.DueDate = dto.DueDate ? new Date(dto.DueDate) : null;
            if (!(0, payment_link_1.isChequeInstrument)(inst)) {
                updateData.IsCleared = true;
                updateData.ClearedAt = payment.ClearedAt ?? new Date();
            }
            else if (!(0, payment_link_1.isChequeInstrument)(payment.InstrumentType)) {
                updateData.IsCleared = false;
                updateData.ClearedAt = null;
            }
            await tx.salePayment.update({ where: { ID: id }, data: updateData });
            await this.afterPaymentWrite(tx, id, userId ?? payment.CreatedByID);
            return tx.salePayment.findUniqueOrThrow({ where: { ID: id }, include: { Sale: true, Creator: true } });
        });
        await this.invalidate(payment.SaleID);
        return this.serialize(updated);
    }
    async clearTx(tx, id, userId, clearedAt) {
        const payment = await tx.salePayment.findUnique({ where: { ID: id } });
        if (!payment)
            throw new common_1.NotFoundException('Sale payment not found');
        if (payment.IsCleared)
            throw new common_1.BadRequestException('Pembayaran sudah lunas/cair');
        await tx.salePayment.update({ where: { ID: id }, data: { IsCleared: true, ClearedAt: clearedAt ?? new Date() } });
        await this.afterPaymentWrite(tx, id, userId ?? payment.CreatedByID);
        return tx.salePayment.findUniqueOrThrow({ where: { ID: id } });
    }
    async clear(id, userId) {
        const updated = await this.prisma.$transaction((tx) => this.clearTx(tx, id, userId));
        await this.invalidate(updated.SaleID);
        return this.serialize(updated);
    }
    async deleteTx(tx, id) {
        const payment = await tx.salePayment.findUnique({ where: { ID: id } });
        if (!payment)
            throw new common_1.NotFoundException('Sale payment not found');
        await this.autoJournal.reverse(tx, auto_journal_service_1.REF.SALE_PAYMENT, id);
        await tx.chequePayment.deleteMany({ where: { ReferenceType: 'SALE_PAYMENT', ReferenceID: id, Status: { in: ['PENDING', 'CLEARED'] } } });
        await tx.salePayment.delete({ where: { ID: id } });
        await this.deposits.releaseCustomerDeposit(tx, id);
        await this.updateSalePaymentStatus(tx, payment.SaleID);
        return payment;
    }
    async delete(id) {
        const payment = await this.prisma.$transaction((tx) => this.deleteTx(tx, id));
        await this.invalidate(payment.SaleID);
        return { id };
    }
    async invalidateFor(parentId) {
        await this.invalidate(parentId);
    }
    async list(query) {
        const where = {};
        if (query.from || query.to) {
            where.Date = {};
            if (query.from)
                where.Date.gte = new Date(query.from);
            if (query.to) {
                const to = new Date(query.to);
                to.setHours(23, 59, 59, 999);
                where.Date.lte = to;
            }
        }
        if (query.methodId)
            where.MethodID = Number(query.methodId);
        if (query.instrumentType)
            where.InstrumentType = String(query.instrumentType);
        else if (query.chequeOnly === 'true')
            where.InstrumentType = { in: ['CEK', 'BG'] };
        if (query.cleared === 'true')
            where.IsCleared = true;
        if (query.cleared === 'false')
            where.IsCleared = false;
        if (query.search) {
            const s = String(query.search);
            where.OR = [
                { ReferenceNumber: { contains: s, mode: 'insensitive' } },
                { Sale: { Code: { contains: s, mode: 'insensitive' } } },
                { Sale: { Customer: { Name: { contains: s, mode: 'insensitive' } } } },
            ];
        }
        const skip = Number(query.skip) || 0;
        const take = Math.min(Number(query.take) || 50, 500);
        const [data, total] = await Promise.all([
            this.prisma.salePayment.findMany({
                where,
                include: { Sale: { include: { Customer: true } }, Method: true },
                orderBy: [{ Date: 'desc' }, { ID: 'desc' }],
                skip,
                take,
            }),
            this.prisma.salePayment.count({ where }),
        ]);
        return { data: data.map((d) => this.serializeDeep(d)), total, skip, take };
    }
    async invalidate(parentId) {
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        await this.redis.invalidatePattern(`sales:${parentId}*`);
        await this.redis.invalidatePattern('reports:*');
        await this.redis.invalidatePattern('journal:*');
        await this.redis.invalidatePattern('customer*');
    }
    serializeDeep(v) {
        if (v instanceof client_1.Prisma.Decimal)
            return Number(v);
        if (v instanceof Date)
            return v.toISOString();
        if (Array.isArray(v))
            return v.map((x) => this.serializeDeep(x));
        if (v && typeof v === 'object') {
            const r = {};
            for (const [k, x] of Object.entries(v))
                r[k] = this.serializeDeep(x);
            return r;
        }
        return v;
    }
    async findBySale(saleId, query = {}) {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
            allowedIncludes: ['*'],
            defaultOrderBy: { CreatedAt: 'desc' },
        });
        const findArgs = {
            where: { SaleID: saleId, ...prismaQuery.where },
            orderBy: prismaQuery.orderBy,
            skip: prismaQuery.skip,
            take: prismaQuery.take,
        };
        if (prismaQuery.include) {
            findArgs.include = prismaQuery.include;
        }
        const [data, total] = await Promise.all([
            this.prisma.salePayment.findMany(findArgs),
            this.prisma.salePayment.count({ where: { SaleID: saleId } }),
        ]);
        const serializedData = data.map((item) => this.serialize(item));
        return { data: serializedData, total, skip: prismaQuery.skip, take: prismaQuery.take };
    }
    async updateSalePaymentStatus(tx, saleId) {
        const sale = await tx.sale.findUnique({
            where: { ID: saleId },
            include: { SalePayments: true },
        });
        if (!sale)
            return;
        const paidAmount = sale.SalePayments.filter((p) => p.IsCleared).reduce((sum, p) => sum + Number(p.Amount), 0);
        const totalAmount = Number(sale.Total);
        let code = 'PENDING';
        if (paidAmount > 0 && paidAmount < totalAmount)
            code = 'PARTIAL';
        else if (paidAmount >= totalAmount && totalAmount > 0)
            code = 'PAID';
        const status = await tx.paymentStatus.findUnique({ where: { Code: code } });
        if (!status)
            throw new common_1.BadRequestException(`Payment status '${code}' tidak ditemukan`);
        await tx.sale.update({ where: { ID: saleId }, data: { PaymentStatusID: status.ID } });
    }
    serialize(data) {
        if (!data)
            return null;
        const result = {};
        for (const [key, value] of Object.entries(data)) {
            if (value instanceof client_1.Prisma.Decimal) {
                result[key] = Number(value);
            }
            else if (value instanceof Date) {
                result[key] = value.toISOString();
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
};
exports.SalePaymentService = SalePaymentService;
exports.SalePaymentService = SalePaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService,
        auto_journal_service_1.AutoJournalService,
        deposit_ledger_service_1.DepositLedgerService])
], SalePaymentService);
