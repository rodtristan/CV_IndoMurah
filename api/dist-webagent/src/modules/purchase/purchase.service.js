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
exports.PurchaseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const notification_service_1 = require("../notification/notification.service");
const stock_ledger_service_1 = require("../../common/stock/stock-ledger.service");
const party_balance_service_1 = require("../../common/stock/party-balance.service");
const auto_journal_service_1 = require("../../common/accounting/auto-journal.service");
const client_1 = require("@prisma/client");
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
let PurchaseService = class PurchaseService {
    constructor(prisma, redis, queryService, notificationService, ledger, party, journal) {
        this.prisma = prisma;
        this.redis = redis;
        this.queryService = queryService;
        this.notificationService = notificationService;
        this.ledger = ledger;
        this.party = party;
        this.journal = journal;
        this.CACHE_PREFIX = 'purchases';
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
                this.prisma.purchase.findMany(findArgs),
                this.prisma.purchase.count({ where: prismaQuery.where }),
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
            const data = await this.prisma.purchase.findUnique(findArgs);
            return data ? this.serialize(data) : null;
        }, this.CACHE_TTL);
    }
    async create(dto, userId) {
        const supplier = await this.prisma.supplier.findUnique({ where: { ID: dto.SupplierID } });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier tidak ditemukan');
        if (dto.Items?.some((i) => !(Number(i.Quantity) > 0)))
            throw new common_1.BadRequestException('Jumlah item harus lebih dari 0');
        const code = await this.generateCode();
        const draftStatus = await this.getStatusByCode('DRAFT');
        const paymentStatus = await this.getPaymentStatusByCode('PENDING');
        const purchaseDate = dto.Date ? new Date(dto.Date) : new Date();
        const purchase = await this.prisma.$transaction(async (tx) => {
            const warehouseId = await this.ledger.resolveWarehouseId(tx, dto.WarehouseID);
            const hasItems = !!dto.Items && dto.Items.length > 0;
            const items = hasItems ? await this.buildItems(tx, dto.Items) : [];
            const t = this.totals(hasItems ? items.reduce((s, i) => s + Number(i.Subtotal), 0) : dto.Subtotal || 0, dto.DiscountAmount || 0, dto.TaxPercent || 0);
            const created = await tx.purchase.create({
                data: {
                    Code: code,
                    SupplierID: dto.SupplierID,
                    WarehouseID: warehouseId,
                    PurchaseOrderID: dto.PurchaseOrderID,
                    Date: purchaseDate,
                    DueDate: dto.DueDate
                        ? new Date(dto.DueDate)
                        : supplier.DueDays > 0
                            ? new Date(purchaseDate.getTime() + supplier.DueDays * 86400000)
                            : null,
                    PaymentMethodID: dto.PaymentMethodID,
                    Subtotal: new client_1.Prisma.Decimal(t.subtotal),
                    DiscountPercent: new client_1.Prisma.Decimal(dto.DiscountPercent || 0),
                    DiscountAmount: new client_1.Prisma.Decimal(t.discount),
                    TaxPercent: new client_1.Prisma.Decimal(dto.TaxPercent || 0),
                    TaxAmount: new client_1.Prisma.Decimal(t.tax),
                    Total: new client_1.Prisma.Decimal(t.total),
                    Paid: new client_1.Prisma.Decimal(0),
                    Remaining: new client_1.Prisma.Decimal(t.total),
                    PaymentStatusID: paymentStatus.ID,
                    StatusID: draftStatus.ID,
                    Notes: dto.Notes,
                    CreatedByID: userId,
                    ...(hasItems ? { PurchaseItems: { create: items } } : {}),
                },
            });
            await this.applyStock(tx, created.ID, userId);
            await this.journal.postPurchase(tx, created.ID, userId);
            await this.party.recalcSupplier(tx, supplier.ID);
            return tx.purchase.findUniqueOrThrow({
                where: { ID: created.ID },
                include: { Supplier: true, Warehouse: true, PurchaseItems: { include: { Product: true, Unit: true } } },
            });
        }, { timeout: 30000 });
        await this.afterWrite();
        await this.notificationService.notify({
            title: 'Pembelian Baru',
            message: `Transaksi ${purchase.Code} dari ${supplier.Name} sebesar Rp ${Number(purchase.Total).toLocaleString('id-ID')}`,
            typeCode: 'PURCHASE',
            referenceType: 'Purchase',
            referenceId: purchase.ID,
        });
        return this.serialize(purchase);
    }
    async update(id, dto, userId) {
        const purchase = await this.prisma.purchase.findUnique({ where: { ID: id }, include: { PurchaseItems: true } });
        if (!purchase)
            throw new common_1.NotFoundException('Purchase not found');
        const status = await this.getStatusById(purchase.StatusID);
        if (status?.Code !== 'DRAFT') {
            throw new common_1.BadRequestException('Hanya pembelian berstatus DRAFT yang dapat diubah');
        }
        if (dto.Items?.some((i) => !(Number(i.Quantity) > 0)))
            throw new common_1.BadRequestException('Jumlah item harus lebih dari 0');
        const updated = await this.prisma.$transaction(async (tx) => {
            const newWh = dto.WarehouseID ? await this.ledger.resolveWarehouseId(tx, dto.WarehouseID) : purchase.WarehouseID;
            const discount = dto.DiscountAmount !== undefined ? dto.DiscountAmount : Number(purchase.DiscountAmount);
            const taxPercent = dto.TaxPercent !== undefined ? dto.TaxPercent : Number(purchase.TaxPercent);
            const stockChanged = !!dto.Items ||
                newWh !== purchase.WarehouseID ||
                Math.abs(discount - Number(purchase.DiscountAmount)) > 0.004;
            const hadLedger = (await tx.stockLedger.count({ where: { RefType: 'PURCHASE', RefID: id } })) > 0;
            if (stockChanged && hadLedger)
                await this.reverseStock(tx, id, userId, `Ubah pembelian ${purchase.Code}`);
            const data = {};
            if (newWh !== purchase.WarehouseID)
                data.WarehouseID = newWh;
            if (dto.Date)
                data.Date = new Date(dto.Date);
            if (dto.DueDate !== undefined)
                data.DueDate = dto.DueDate ? new Date(dto.DueDate) : null;
            if (dto.PaymentMethodID !== undefined)
                data.PaymentMethodID = dto.PaymentMethodID;
            if (dto.DiscountPercent !== undefined)
                data.DiscountPercent = new client_1.Prisma.Decimal(dto.DiscountPercent);
            if (dto.TaxPercent !== undefined)
                data.TaxPercent = new client_1.Prisma.Decimal(dto.TaxPercent);
            if (dto.Notes !== undefined)
                data.Notes = dto.Notes;
            let subtotal = Number(purchase.Subtotal);
            if (dto.Items) {
                const items = await this.buildItems(tx, dto.Items);
                await tx.purchaseItem.deleteMany({ where: { PurchaseID: id } });
                data.PurchaseItems = { create: items };
                subtotal = items.reduce((s, i) => s + Number(i.Subtotal), 0);
            }
            const t = this.totals(subtotal, discount, taxPercent);
            Object.assign(data, {
                Subtotal: new client_1.Prisma.Decimal(t.subtotal),
                DiscountAmount: new client_1.Prisma.Decimal(t.discount),
                TaxAmount: new client_1.Prisma.Decimal(t.tax),
                Total: new client_1.Prisma.Decimal(t.total),
            });
            await tx.purchase.update({ where: { ID: id }, data });
            if (stockChanged && (hadLedger || !!dto.Items))
                await this.applyStock(tx, id, userId);
            await this.party.recalcPurchase(tx, id);
            await this.journal.postPurchase(tx, id, userId);
            await this.party.recalcSupplier(tx, purchase.SupplierID);
            return tx.purchase.findUniqueOrThrow({
                where: { ID: id },
                include: { Supplier: true, Warehouse: true, PurchaseItems: { include: { Product: true, Unit: true } } },
            });
        }, { timeout: 30000 });
        await this.afterWrite();
        return this.serialize(updated);
    }
    async updateStatus(id, dto, userId) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { ID: id },
            include: { PurchaseItems: true, PurchaseReturns: { include: { Status: true } } },
        });
        if (!purchase)
            throw new common_1.NotFoundException('Purchase not found');
        const currentStatus = await this.getStatusById(purchase.StatusID);
        const currentCode = currentStatus?.Code ?? 'DRAFT';
        const validTransitions = {
            DRAFT: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['COMPLETED', 'CANCELLED'],
        };
        const allowed = validTransitions[currentCode] || [];
        if (!allowed.includes(dto.StatusCode)) {
            throw new common_1.BadRequestException(`Status tidak dapat diubah dari '${currentCode}' ke '${dto.StatusCode}'`);
        }
        if (dto.StatusCode === 'CANCELLED' && purchase.PurchaseReturns.some((r) => r.Status?.Code !== 'CANCELLED')) {
            throw new common_1.BadRequestException('Pembelian memiliki retur aktif. Batalkan returnya terlebih dahulu.');
        }
        const newStatus = await this.getStatusByCode(dto.StatusCode);
        const updated = await this.prisma.$transaction(async (tx) => {
            if (dto.StatusCode === 'CANCELLED') {
                await this.reverseStock(tx, id, userId, `Pembatalan pembelian ${purchase.Code}`);
                await this.journal.reversePurchase(tx, id);
            }
            await tx.purchase.update({ where: { ID: id }, data: { StatusID: newStatus.ID } });
            await this.party.recalcSupplier(tx, purchase.SupplierID);
            return tx.purchase.findUniqueOrThrow({
                where: { ID: id },
                include: { Supplier: true, Warehouse: true, PurchaseItems: { include: { Product: true, Unit: true } } },
            });
        }, { timeout: 30000 });
        await this.afterWrite();
        return this.serialize(updated);
    }
    async delete(id, userId) {
        const purchase = await this.prisma.purchase.findUnique({ where: { ID: id } });
        if (!purchase)
            throw new common_1.NotFoundException('Purchase not found');
        const status = await this.getStatusById(purchase.StatusID);
        if (status?.Code !== 'DRAFT' && status?.Code !== 'CANCELLED') {
            throw new common_1.BadRequestException('Hanya pembelian berstatus DRAFT atau CANCELLED yang dapat dihapus');
        }
        const [returns, payments] = await Promise.all([
            this.prisma.purchaseReturn.count({ where: { PurchaseID: id } }),
            this.prisma.purchasePayment.count({ where: { PurchaseID: id } }),
        ]);
        if (returns > 0)
            throw new common_1.BadRequestException('Pembelian tidak dapat dihapus karena sudah memiliki retur pembelian');
        if (payments > 0)
            throw new common_1.BadRequestException('Pembelian tidak dapat dihapus karena sudah memiliki pembayaran');
        await this.prisma.$transaction(async (tx) => {
            await this.reverseStock(tx, id, userId, `Hapus pembelian ${purchase.Code}`);
            await this.journal.reversePurchase(tx, id);
            await tx.purchase.delete({ where: { ID: id } });
            await this.party.recalcSupplier(tx, purchase.SupplierID);
        }, { timeout: 30000 });
        await this.afterWrite();
        return { id };
    }
    totals(subtotal, discount, taxPercent) {
        const sub = r2(subtotal);
        const disc = r2(Math.min(Math.max(discount, 0), sub));
        const tax = r2((sub - disc) * (taxPercent / 100));
        return { subtotal: sub, discount: disc, tax, total: r2(sub - disc + tax) };
    }
    async buildItems(tx, items) {
        const out = [];
        for (const item of items) {
            const product = await tx.product.findUnique({ where: { ID: item.ProductID }, select: { ID: true } });
            if (!product)
                throw new common_1.BadRequestException(`Produk dengan ID ${item.ProductID} tidak ditemukan`);
            const gross = item.UnitPrice * item.Quantity;
            const disc = item.DiscountAmount || (gross * (item.DiscountPercent || 0)) / 100;
            out.push({
                ProductID: item.ProductID,
                Quantity: new client_1.Prisma.Decimal(item.Quantity),
                BaseQuantity: await this.ledger.toBaseQty(tx, item.ProductID, item.UnitID, item.Quantity),
                UnitID: item.UnitID,
                UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice),
                DiscountPercent: new client_1.Prisma.Decimal(item.DiscountPercent || 0),
                DiscountAmount: new client_1.Prisma.Decimal(r2(disc)),
                Subtotal: new client_1.Prisma.Decimal(r2(gross - disc)),
            });
        }
        return out;
    }
    async lineCosts(tx, purchaseId) {
        const p = await tx.purchase.findUniqueOrThrow({ where: { ID: purchaseId }, include: { PurchaseItems: true } });
        const sub = Number(p.Subtotal);
        const factor = sub > 0 ? Math.max(sub - Number(p.DiscountAmount), 0) / sub : 1;
        const agg = new Map();
        for (const it of p.PurchaseItems) {
            const base = Number(it.BaseQuantity) > 0 ? Number(it.BaseQuantity) : Number(it.Quantity);
            const cur = agg.get(it.ProductID) ?? { qty: 0, value: 0 };
            cur.qty += base;
            cur.value += Number(it.Subtotal) * factor;
            agg.set(it.ProductID, cur);
        }
        return { purchase: p, agg };
    }
    async applyStock(tx, purchaseId, userId) {
        const { purchase, agg } = await this.lineCosts(tx, purchaseId);
        for (const [productId, a] of agg) {
            if (a.qty <= 0)
                continue;
            const unitCost = a.value / a.qty;
            await this.ledger.applyAverageCostIn(tx, productId, a.qty, unitCost);
            await this.ledger.move(tx, {
                productId,
                warehouseId: purchase.WarehouseID,
                qty: a.qty,
                refType: 'PURCHASE',
                refId: purchase.ID,
                refCode: purchase.Code,
                unitCost,
                userId,
                date: purchase.Date,
            });
        }
    }
    async reverseStock(tx, purchaseId, userId, notes) {
        const { purchase, agg } = await this.lineCosts(tx, purchaseId);
        const nets = await this.ledger.netByRef(tx, ['PURCHASE'], purchaseId);
        for (const n of nets) {
            const a = agg.get(n.productId);
            const unitCost = a && a.qty > 0 ? a.value / a.qty : undefined;
            if (n.net.gt(0) && unitCost !== undefined)
                await this.ledger.applyAverageCostOut(tx, n.productId, n.net, unitCost);
            await this.ledger.move(tx, {
                productId: n.productId,
                warehouseId: n.warehouseId,
                qty: n.net.neg(),
                refType: 'PURCHASE',
                refId: purchaseId,
                refCode: purchase.Code,
                unitCost,
                userId,
                notes,
            });
        }
    }
    async afterWrite() {
        await Promise.all([
            this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`),
            this.redis.invalidatePattern('supplier:*'),
            this.ledger.invalidateCaches(),
        ]);
    }
    async getReport(query) {
        const { startDate, endDate, supplierId } = query;
        const where = {};
        if (startDate || endDate) {
            where.Date = {};
            if (startDate)
                where.Date.gte = new Date(startDate);
            if (endDate)
                where.Date.lte = new Date(endDate);
        }
        if (supplierId)
            where.SupplierID = parseInt(supplierId);
        const purchases = await this.prisma.purchase.findMany({
            where,
            include: {
                Supplier: true,
                PurchaseItems: { include: { Product: true } },
            },
            orderBy: { Date: 'desc' },
        });
        const summary = {
            totalPurchases: purchases.length,
            totalAmount: purchases.reduce((sum, p) => sum + Number(p.Total), 0),
            totalPaid: purchases.reduce((sum, p) => sum + Number(p.Paid), 0),
            totalRemaining: purchases.reduce((sum, p) => sum + Number(p.Remaining), 0),
        };
        return {
            data: purchases.map((p) => this.serialize(p)),
            summary,
        };
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
    async getPaymentStatusByCode(code) {
        const status = await this.prisma.paymentStatus.findUnique({ where: { Code: code } });
        if (!status)
            throw new common_1.BadRequestException(`Payment status '${code}' tidak ditemukan`);
        return status;
    }
    async generateCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `BP-${year}${month}`;
        const lastPurchase = await this.prisma.purchase.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastPurchase) {
            const lastSeq = parseInt(lastPurchase.Code.split('-').pop() || '0', 10);
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
        if (data.PurchaseItems && Array.isArray(data.PurchaseItems)) {
            result.PurchaseItems = data.PurchaseItems.map((item) => this.serialize(item));
        }
        return result;
    }
};
exports.PurchaseService = PurchaseService;
exports.PurchaseService = PurchaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService,
        notification_service_1.NotificationService,
        stock_ledger_service_1.StockLedgerService,
        party_balance_service_1.PartyBalanceService,
        auto_journal_service_1.AutoJournalService])
], PurchaseService);
