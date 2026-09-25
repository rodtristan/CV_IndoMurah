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
exports.StockLedgerService = exports.STOCK_REF_LABEL = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma-service");
const redis_service_1 = require("../redis/redis-service");
exports.STOCK_REF_LABEL = {
    SALE: 'Penjualan',
    SALE_RETURN: 'Retur Penjualan',
    PURCHASE: 'Pembelian',
    PURCHASE_RETURN: 'Retur Pembelian',
    STOCK_IN: 'Barang Masuk',
    STOCK_OUT: 'Barang Keluar',
    TRANSFER_IN: 'Transfer Masuk',
    TRANSFER_OUT: 'Transfer Keluar',
    OPNAME: 'Stock Opname',
    OPENING: 'Saldo Awal',
    ADJUST: 'Penyesuaian',
};
const D = (v) => new client_1.Prisma.Decimal(v === null || v === undefined || v === '' ? 0 : v);
const fmtQty = (d) => {
    const n = Number(d);
    return Number.isInteger(n) ? n.toLocaleString('id-ID') : n.toLocaleString('id-ID', { maximumFractionDigits: 3 });
};
let StockLedgerService = class StockLedgerService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async getDefaultWarehouseId(tx = this.prisma) {
        const def = (await tx.warehouse.findFirst({ where: { IsDefault: true, IsActive: true }, orderBy: { ID: 'asc' }, select: { ID: true } })) ??
            (await tx.warehouse.findFirst({ where: { IsActive: true }, orderBy: { ID: 'asc' }, select: { ID: true } })) ??
            (await tx.warehouse.findFirst({ orderBy: { ID: 'asc' }, select: { ID: true } }));
        if (!def)
            throw new common_1.BadRequestException('Belum ada gudang. Tambahkan data gudang terlebih dahulu.');
        return def.ID;
    }
    async resolveWarehouseId(tx, warehouseId) {
        if (warehouseId) {
            const wh = await tx.warehouse.findUnique({ where: { ID: warehouseId }, select: { ID: true } });
            if (!wh)
                throw new common_1.BadRequestException(`Gudang dengan ID ${warehouseId} tidak ditemukan`);
            return wh.ID;
        }
        return this.getDefaultWarehouseId(tx);
    }
    async conversion(tx, productId, unitId) {
        if (!unitId)
            return new client_1.Prisma.Decimal(1);
        const pu = await tx.productUnit.findUnique({
            where: { ProductID_UnitID: { ProductID: productId, UnitID: unitId } },
            select: { ConversionValue: true },
        });
        const c = pu ? new client_1.Prisma.Decimal(pu.ConversionValue) : new client_1.Prisma.Decimal(1);
        return c.lte(0) ? new client_1.Prisma.Decimal(1) : c;
    }
    async toBaseQty(tx, productId, unitId, qty) {
        const c = await this.conversion(tx, productId, unitId);
        return D(qty).mul(c).toDecimalPlaces(3);
    }
    async move(tx, input) {
        const qty = D(input.qty).toDecimalPlaces(3);
        if (qty.isZero())
            return null;
        const product = await tx.product.findUnique({
            where: { ID: input.productId },
            select: { ID: true, Code: true, Name: true, PurchasePrice: true },
        });
        if (!product)
            throw new common_1.BadRequestException(`Produk dengan ID ${input.productId} tidak ditemukan`);
        const warehouseId = await this.resolveWarehouseId(tx, input.warehouseId);
        await this.ensureWarehouseRows(tx, product.ID, input.userId);
        const ps = await tx.productStock.upsert({
            where: { ProductID_WarehouseID: { ProductID: product.ID, WarehouseID: warehouseId } },
            create: { ProductID: product.ID, WarehouseID: warehouseId, Quantity: qty, MinimumStock: new client_1.Prisma.Decimal(0) },
            update: { Quantity: { increment: qty } },
        });
        const balance = new client_1.Prisma.Decimal(ps.Quantity);
        if (!input.allowNegative && qty.lt(0) && balance.lt(0)) {
            const wh = await tx.warehouse.findUnique({ where: { ID: warehouseId }, select: { Name: true } });
            const before = balance.minus(qty);
            throw new common_1.BadRequestException(`Stok ${product.Name} di ${wh?.Name ?? `gudang #${warehouseId}`} tidak cukup (sisa ${fmtQty(before)}, dibutuhkan ${fmtQty(qty.neg())})`);
        }
        const total = await this.syncProductTotal(tx, product.ID);
        const ledger = await tx.stockLedger.create({
            data: {
                Date: input.date ?? new Date(),
                ProductID: product.ID,
                WarehouseID: warehouseId,
                RefType: input.refType,
                RefID: input.refId ?? null,
                RefCode: input.refCode ?? null,
                QtyIn: qty.gt(0) ? qty : new client_1.Prisma.Decimal(0),
                QtyOut: qty.lt(0) ? qty.neg() : new client_1.Prisma.Decimal(0),
                BalanceAfter: balance,
                UnitCost: D(input.unitCost ?? product.PurchasePrice).toDecimalPlaces(2),
                Notes: input.notes ? String(input.notes).slice(0, 500) : null,
                CreatedByID: input.userId ?? null,
            },
            select: { ID: true },
        });
        return { ledgerId: ledger.ID, warehouseId, balanceAfter: balance, productStock: total };
    }
    async netByRef(tx, refTypes, refId) {
        const rows = await tx.stockLedger.groupBy({
            by: ['ProductID', 'WarehouseID', 'RefType'],
            where: { RefType: { in: refTypes }, RefID: refId },
            _sum: { QtyIn: true, QtyOut: true },
        });
        return rows
            .map((r) => ({
            productId: r.ProductID,
            warehouseId: r.WarehouseID,
            refType: r.RefType,
            net: D(r._sum.QtyIn ?? 0).minus(D(r._sum.QtyOut ?? 0)),
        }))
            .filter((r) => !r.net.isZero());
    }
    async reverseRef(tx, refTypes, refId, opts = {}) {
        const nets = await this.netByRef(tx, refTypes, refId);
        nets.sort((a, b) => Number(b.net.gt(0)) - Number(a.net.gt(0)));
        const out = [];
        for (const n of nets) {
            await this.move(tx, {
                productId: n.productId,
                warehouseId: n.warehouseId,
                qty: n.net.neg(),
                refType: n.refType,
                refId,
                refCode: opts.refCode,
                userId: opts.userId,
                notes: opts.notes ?? `Pembatalan ${opts.refCode ?? ''}`.trim(),
                allowNegative: opts.allowNegative,
                unitCost: opts.unitCost?.(n.productId),
            });
            out.push({ productId: n.productId, warehouseId: n.warehouseId, qty: n.net.neg(), refType: n.refType });
        }
        return out;
    }
    async relocateRef(tx, refTypes, refId, toWarehouseId, opts = {}) {
        const nets = (await this.netByRef(tx, refTypes, refId)).filter((n) => n.warehouseId !== toWarehouseId);
        const plan = [];
        for (const n of nets) {
            const note = `Pindah gudang ${opts.refCode ?? ''}`.trim();
            plan.push({ productId: n.productId, warehouseId: n.warehouseId, qty: n.net.neg(), refType: n.refType, refId, refCode: opts.refCode, userId: opts.userId, notes: note });
            plan.push({ productId: n.productId, warehouseId: toWarehouseId, qty: n.net, refType: n.refType, refId, refCode: opts.refCode, userId: opts.userId, notes: note, date: opts.date });
        }
        plan.sort((a, b) => Number(D(b.qty).gt(0)) - Number(D(a.qty).gt(0)));
        for (const m of plan)
            await this.move(tx, m);
        return plan.length;
    }
    async applyAverageCostIn(tx, productId, qty, unitCost) {
        const q = D(qty);
        const c = D(unitCost);
        if (q.lte(0) || c.lt(0))
            return;
        const p = await tx.product.findUnique({ where: { ID: productId }, select: { Stock: true, PurchasePrice: true } });
        if (!p)
            return;
        const oldQty = client_1.Prisma.Decimal.max(D(p.Stock), 0);
        const oldCost = D(p.PurchasePrice);
        const newQty = oldQty.plus(q);
        const avg = oldQty.isZero() || oldCost.isZero() ? c : oldQty.mul(oldCost).plus(q.mul(c)).div(newQty);
        await tx.product.update({ where: { ID: productId }, data: { PurchasePrice: avg.toDecimalPlaces(2) } });
    }
    async applyAverageCostOut(tx, productId, qty, unitCost) {
        const q = D(qty);
        const c = D(unitCost);
        if (q.lte(0))
            return;
        const p = await tx.product.findUnique({ where: { ID: productId }, select: { Stock: true, PurchasePrice: true } });
        if (!p)
            return;
        const curQty = D(p.Stock);
        const rest = curQty.minus(q);
        if (rest.lte(0))
            return;
        const avg = curQty.mul(D(p.PurchasePrice)).minus(q.mul(c)).div(rest);
        if (avg.lte(0))
            return;
        await tx.product.update({ where: { ID: productId }, data: { PurchasePrice: avg.toDecimalPlaces(2) } });
    }
    async syncProductTotal(tx, productId) {
        const agg = await tx.productStock.aggregate({ where: { ProductID: productId }, _sum: { Quantity: true } });
        const total = D(agg._sum.Quantity ?? 0);
        await tx.product.update({ where: { ID: productId }, data: { Stock: total } });
        return total;
    }
    async ensureWarehouseRows(tx, productId, userId) {
        const count = await tx.productStock.count({ where: { ProductID: productId } });
        if (count > 0)
            return;
        const p = await tx.product.findUnique({ where: { ID: productId }, select: { Stock: true, PurchasePrice: true } });
        const legacy = D(p?.Stock ?? 0);
        if (legacy.isZero())
            return;
        const wh = await this.getDefaultWarehouseId(tx);
        await tx.productStock.create({ data: { ProductID: productId, WarehouseID: wh, Quantity: legacy, MinimumStock: new client_1.Prisma.Decimal(0) } });
        await tx.stockLedger.create({
            data: {
                ProductID: productId,
                WarehouseID: wh,
                RefType: 'OPENING',
                QtyIn: legacy.gt(0) ? legacy : new client_1.Prisma.Decimal(0),
                QtyOut: legacy.lt(0) ? legacy.neg() : new client_1.Prisma.Decimal(0),
                BalanceAfter: legacy,
                UnitCost: D(p?.PurchasePrice ?? 0),
                Notes: 'Saldo awal otomatis dari stok global (data lama)',
                CreatedByID: userId ?? null,
            },
        });
    }
    async invalidateCaches() {
        await Promise.all([
            this.redis.invalidatePattern('product:*'),
            this.redis.invalidatePattern('productStock:*'),
            this.redis.invalidatePattern('stockLedger:*'),
            this.redis.invalidatePattern('reports:*'),
        ]);
    }
};
exports.StockLedgerService = StockLedgerService;
exports.StockLedgerService = StockLedgerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], StockLedgerService);
