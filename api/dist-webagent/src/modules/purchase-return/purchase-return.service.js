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
exports.PurchaseReturnService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const client_1 = require("@prisma/client");
const stock_ledger_service_1 = require("../../common/stock/stock-ledger.service");
const party_balance_service_1 = require("../../common/stock/party-balance.service");
const auto_journal_service_1 = require("../../common/accounting/auto-journal.service");
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
let PurchaseReturnService = class PurchaseReturnService {
    constructor(prisma, redis, queryService, ledger, party, journal) {
        this.prisma = prisma;
        this.redis = redis;
        this.queryService = queryService;
        this.ledger = ledger;
        this.party = party;
        this.journal = journal;
        this.CACHE_PREFIX = 'purchase_returns';
        this.CACHE_TTL = 60;
        this.fullInclude = {
            Purchase: true,
            Supplier: true,
            Warehouse: true,
            Status: true,
            ReturnItems: { include: { Product: true, Unit: true } },
        };
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
                this.prisma.purchaseReturn.findMany(findArgs),
                this.prisma.purchaseReturn.count({ where: prismaQuery.where }),
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
            const data = await this.prisma.purchaseReturn.findUnique(findArgs);
            return data ? this.serialize(data) : null;
        }, this.CACHE_TTL);
    }
    async create(dto, userId) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { ID: dto.PurchaseID },
            include: {
                Status: true,
                PaymentStatus: true,
                PurchaseItems: { include: { Product: { select: { Name: true } } } },
                PurchaseReturns: { include: { Status: true, ReturnItems: true } },
            },
        });
        if (!purchase)
            throw new common_1.NotFoundException('Faktur pembelian tidak ditemukan');
        if (purchase.Status?.Code === 'CANCELLED' || purchase.PaymentStatus?.Code === 'CANCELLED') {
            throw new common_1.BadRequestException('Faktur pembelian sudah dibatalkan');
        }
        const lines = (dto.Items ?? []).filter((i) => Number(i.Quantity) !== 0);
        if (lines.length === 0)
            throw new common_1.BadRequestException('Isi jumlah retur minimal satu item');
        if (lines.some((i) => !(Number(i.Quantity) > 0)))
            throw new common_1.BadRequestException('Jumlah retur harus lebih dari 0');
        const code = await this.generateCode();
        const draftStatus = await this.getStatusByCode('DRAFT');
        const returnDate = dto.Date ? new Date(dto.Date) : new Date();
        const purchaseReturn = await this.prisma.$transaction(async (tx) => {
            const warehouseId = await this.ledger.resolveWarehouseId(tx, dto.WarehouseID ?? purchase.WarehouseID);
            const sub = Number(purchase.Subtotal);
            const factor = sub > 0 ? Math.max(sub - Number(purchase.DiscountAmount), 0) / sub : 1;
            const bought = new Map();
            for (const it of purchase.PurchaseItems) {
                const base = Number(it.BaseQuantity) > 0 ? Number(it.BaseQuantity) : Number(await this.ledger.toBaseQty(tx, it.ProductID, it.UnitID, it.Quantity));
                const cur = bought.get(it.ProductID) ?? { qty: 0, value: 0, name: it.Product?.Name ?? `#${it.ProductID}` };
                cur.qty += base;
                cur.value += Number(it.Subtotal) * factor;
                bought.set(it.ProductID, cur);
            }
            const returned = new Map();
            let prevTotal = 0;
            for (const r of purchase.PurchaseReturns) {
                if (r.Status?.Code === 'CANCELLED')
                    continue;
                prevTotal += Number(r.TotalReturn);
                for (const it of r.ReturnItems) {
                    const base = Number(it.BaseQuantity) > 0 ? Number(it.BaseQuantity) : Number(await this.ledger.toBaseQty(tx, it.ProductID, it.UnitID, it.Quantity));
                    returned.set(it.ProductID, (returned.get(it.ProductID) ?? 0) + base);
                }
            }
            const itemsData = [];
            const requested = new Map();
            for (const item of lines) {
                if (!bought.has(item.ProductID))
                    throw new common_1.BadRequestException(`Produk ID ${item.ProductID} tidak ada pada faktur ${purchase.Code}`);
                const base = Number(await this.ledger.toBaseQty(tx, item.ProductID, item.UnitID, item.Quantity));
                requested.set(item.ProductID, (requested.get(item.ProductID) ?? 0) + base);
                itemsData.push({
                    ProductID: item.ProductID,
                    Quantity: new client_1.Prisma.Decimal(item.Quantity),
                    BaseQuantity: new client_1.Prisma.Decimal(base),
                    UnitID: item.UnitID,
                    UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice),
                    Subtotal: new client_1.Prisma.Decimal(r2(item.UnitPrice * item.Quantity)),
                });
            }
            for (const [pid, q] of requested) {
                const b = bought.get(pid);
                const left = b.qty - (returned.get(pid) ?? 0);
                if (q > left + 0.0005) {
                    throw new common_1.BadRequestException(`Jumlah retur ${b.name} melebihi jumlah dibeli (sisa yang dapat diretur ${Math.max(left, 0)})`);
                }
            }
            const totalReturn = r2(itemsData.reduce((a, i) => a + Number(i.Subtotal), 0));
            if (prevTotal + totalReturn > Number(purchase.Total) + 0.005) {
                throw new common_1.BadRequestException(`Nilai retur melebihi sisa nilai faktur ${purchase.Code} (maksimal ${r2(Number(purchase.Total) - prevTotal)})`);
            }
            const created = await tx.purchaseReturn.create({
                data: {
                    Code: code,
                    PurchaseID: dto.PurchaseID,
                    SupplierID: purchase.SupplierID,
                    WarehouseID: warehouseId,
                    Date: returnDate,
                    TotalReturn: new client_1.Prisma.Decimal(totalReturn),
                    Reason: dto.Reason,
                    StatusID: draftStatus.ID,
                    CreatedByID: userId,
                    ReturnItems: { create: itemsData },
                },
            });
            for (const [pid, q] of requested) {
                const b = bought.get(pid);
                const unitCost = b.qty > 0 ? b.value / b.qty : 0;
                await this.ledger.applyAverageCostOut(tx, pid, q, unitCost);
                await this.ledger.move(tx, {
                    productId: pid,
                    warehouseId,
                    qty: -q,
                    refType: 'PURCHASE_RETURN',
                    refId: created.ID,
                    refCode: created.Code,
                    unitCost,
                    userId,
                    date: returnDate,
                });
            }
            await tx.purchase.update({ where: { ID: purchase.ID }, data: { IsReturn: true } });
            await this.party.recalcPurchase(tx, purchase.ID);
            await this.party.recalcSupplier(tx, purchase.SupplierID);
            await this.journal.postPurchaseReturn(tx, created.ID, userId);
            return tx.purchaseReturn.findUniqueOrThrow({ where: { ID: created.ID }, include: this.fullInclude });
        }, { timeout: 30000 });
        await this.afterWrite();
        return this.serialize(purchaseReturn);
    }
    async update(id, dto, userId) {
        const purchaseReturn = await this.prisma.purchaseReturn.findUnique({ where: { ID: id } });
        if (!purchaseReturn)
            throw new common_1.NotFoundException('Purchase return not found');
        const status = await this.getStatusById(purchaseReturn.StatusID);
        if (status?.Code !== 'DRAFT') {
            throw new common_1.BadRequestException('Hanya retur berstatus DRAFT yang dapat diubah');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            let warehouseId;
            if (dto.WarehouseID) {
                warehouseId = await this.ledger.resolveWarehouseId(tx, dto.WarehouseID);
                if (warehouseId !== purchaseReturn.WarehouseID) {
                    await this.ledger.relocateRef(tx, ['PURCHASE_RETURN'], id, warehouseId, { refCode: purchaseReturn.Code, userId });
                }
            }
            await tx.purchaseReturn.update({
                where: { ID: id },
                data: { WarehouseID: warehouseId, Date: dto.Date ? new Date(dto.Date) : undefined, Reason: dto.Reason },
            });
            if (dto.Date)
                await this.journal.postPurchaseReturn(tx, id, userId);
            return tx.purchaseReturn.findUniqueOrThrow({ where: { ID: id }, include: this.fullInclude });
        });
        await this.afterWrite();
        return this.serialize(updated);
    }
    async updateStatus(id, dto, userId) {
        const purchaseReturn = await this.prisma.purchaseReturn.findUnique({
            where: { ID: id },
            include: { ReturnItems: true },
        });
        if (!purchaseReturn)
            throw new common_1.NotFoundException('Purchase return not found');
        const currentStatus = await this.getStatusById(purchaseReturn.StatusID);
        const currentCode = currentStatus?.Code ?? 'DRAFT';
        const validTransitions = {
            DRAFT: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['COMPLETED', 'CANCELLED'],
        };
        const allowed = validTransitions[currentCode] || [];
        if (!allowed.includes(dto.StatusCode)) {
            throw new common_1.BadRequestException(`Status tidak dapat diubah dari '${currentCode}' ke '${dto.StatusCode}'`);
        }
        const newStatus = await this.getStatusByCode(dto.StatusCode);
        const updated = await this.prisma.$transaction(async (tx) => {
            await tx.purchaseReturn.update({ where: { ID: id }, data: { StatusID: newStatus.ID } });
            if (dto.StatusCode === 'CANCELLED')
                await this.undoEffects(tx, purchaseReturn, userId, `Pembatalan retur ${purchaseReturn.Code}`);
            return tx.purchaseReturn.findUniqueOrThrow({ where: { ID: id }, include: this.fullInclude });
        }, { timeout: 30000 });
        await this.afterWrite();
        return this.serialize(updated);
    }
    async delete(id, userId) {
        const purchaseReturn = await this.prisma.purchaseReturn.findUnique({ where: { ID: id } });
        if (!purchaseReturn)
            throw new common_1.NotFoundException('Purchase return not found');
        const status = await this.getStatusById(purchaseReturn.StatusID);
        if (status?.Code !== 'DRAFT' && status?.Code !== 'CANCELLED') {
            throw new common_1.BadRequestException('Hanya retur berstatus DRAFT atau CANCELLED yang dapat dihapus');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.purchaseReturn.delete({ where: { ID: id } });
            await this.undoEffects(tx, purchaseReturn, userId, `Hapus retur ${purchaseReturn.Code}`);
        }, { timeout: 30000 });
        await this.afterWrite();
        return { id };
    }
    async undoEffects(tx, r, userId, notes) {
        const rows = await tx.stockLedger.findMany({ where: { RefType: 'PURCHASE_RETURN', RefID: r.ID, QtyOut: { gt: 0 } }, select: { ProductID: true, QtyOut: true, UnitCost: true } });
        const cost = new Map();
        for (const x of rows) {
            const c = cost.get(x.ProductID) ?? { q: 0, v: 0 };
            c.q += Number(x.QtyOut);
            c.v += Number(x.QtyOut) * Number(x.UnitCost);
            cost.set(x.ProductID, c);
        }
        const nets = await this.ledger.netByRef(tx, ['PURCHASE_RETURN'], r.ID);
        for (const n of nets) {
            const c = cost.get(n.productId);
            const unitCost = c && c.q > 0 ? c.v / c.q : undefined;
            if (n.net.lt(0) && unitCost !== undefined)
                await this.ledger.applyAverageCostIn(tx, n.productId, n.net.neg(), unitCost);
            await this.ledger.move(tx, {
                productId: n.productId,
                warehouseId: n.warehouseId,
                qty: n.net.neg(),
                refType: 'PURCHASE_RETURN',
                refId: r.ID,
                refCode: r.Code,
                unitCost,
                userId,
                notes,
            });
        }
        await this.journal.reversePurchaseReturn(tx, r.ID);
        const active = await tx.purchaseReturn.count({ where: { PurchaseID: r.PurchaseID, NOT: { Status: { Code: 'CANCELLED' } } } });
        if (active === 0)
            await tx.purchase.update({ where: { ID: r.PurchaseID }, data: { IsReturn: false } });
        await this.party.recalcPurchase(tx, r.PurchaseID);
        await this.party.recalcSupplier(tx, r.SupplierID);
    }
    async afterWrite() {
        await Promise.all([
            this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`),
            this.redis.invalidatePattern('purchases:*'),
            this.redis.invalidatePattern('supplier:*'),
            this.ledger.invalidateCaches(),
        ]);
    }
    async getStatusByCode(code) {
        const status = await this.prisma.transactionStatus.findUnique({ where: { Code: code } });
        if (!status)
            throw new common_1.BadRequestException(`Status '${code}' tidak ditemukan`);
        return status;
    }
    async getStatusById(id) {
        return this.prisma.transactionStatus.findUnique({ where: { ID: id } });
    }
    async generateCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `PR-${year}${month}`;
        const lastReturn = await this.prisma.purchaseReturn.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastReturn) {
            const lastSeq = parseInt(lastReturn.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
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
        if (data.ReturnItems && Array.isArray(data.ReturnItems)) {
            result.ReturnItems = data.ReturnItems.map((item) => this.serialize(item));
        }
        return result;
    }
};
exports.PurchaseReturnService = PurchaseReturnService;
exports.PurchaseReturnService = PurchaseReturnService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService,
        stock_ledger_service_1.StockLedgerService,
        party_balance_service_1.PartyBalanceService,
        auto_journal_service_1.AutoJournalService])
], PurchaseReturnService);
