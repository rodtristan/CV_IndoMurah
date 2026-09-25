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
exports.ProductStockService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const stock_document_service_1 = require("../../common/stock/stock-document.service");
const stock_ledger_service_1 = require("../../common/stock/stock-ledger.service");
const client_1 = require("@prisma/client");
const pick = (dto, camel, pascal) => (dto[camel] !== undefined ? dto[camel] : dto[pascal]);
let ProductStockService = class ProductStockService extends stock_document_service_1.StockDocumentService {
    constructor(prisma, redis, queryService, ledger) {
        super(prisma, redis, queryService, {
            modelName: 'productStock',
            primaryKey: 'ID',
            searchableFields: ['*'],
            allowedIncludes: ['*'],
            allowedSortFields: ['*'],
            allowedSelectFields: ['*'],
            defaultOrderBy: { UpdatedAt: 'desc' },
            maxTake: 100,
            defaultTake: 20,
            cacheTtl: 60,
            softDelete: false,
        });
        this.prisma = prisma;
        this.redis = redis;
        this.queryService = queryService;
        this.ledger = ledger;
    }
    async createOpening(dto, userId) {
        const d = dto;
        const productId = Number(pick(d, 'productId', 'ProductID'));
        const warehouseId = Number(pick(d, 'warehouseId', 'WarehouseID'));
        if (!productId || !warehouseId)
            throw new common_1.BadRequestException('Produk dan gudang wajib diisi');
        const row = await this.prisma.$transaction((tx) => this.setQuantity(tx, productId, warehouseId, pick(d, 'quantity', 'Quantity'), pick(d, 'minimumStock', 'MinimumStock'), d, userId));
        await this.afterWrite();
        return row;
    }
    async patchById(id, dto, userId) {
        const d = dto;
        const row = await this.prisma.productStock.findUnique({ where: { ID: Number(id) } });
        if (!row)
            throw new common_1.NotFoundException('Data stok tidak ditemukan');
        const pid = pick(d, 'productId', 'ProductID');
        const wid = pick(d, 'warehouseId', 'WarehouseID');
        if ((pid !== undefined && Number(pid) !== row.ProductID) || (wid !== undefined && Number(wid) !== row.WarehouseID)) {
            throw new common_1.BadRequestException('Produk/gudang tidak dapat diubah. Hapus baris lalu tambahkan di gudang yang benar.');
        }
        const result = await this.prisma.$transaction((tx) => this.setQuantity(tx, row.ProductID, row.WarehouseID, pick(d, 'quantity', 'Quantity'), pick(d, 'minimumStock', 'MinimumStock'), d, userId));
        await this.afterWrite();
        return result;
    }
    async deleteById(id, userId) {
        const row = await this.prisma.productStock.findUnique({ where: { ID: Number(id) } });
        if (!row)
            throw new common_1.NotFoundException('Data stok tidak ditemukan');
        await this.prisma.$transaction(async (tx) => {
            await this.ledger.move(tx, {
                productId: row.ProductID,
                warehouseId: row.WarehouseID,
                qty: new client_1.Prisma.Decimal(row.Quantity).neg(),
                refType: 'OPENING',
                userId,
                notes: 'Hapus saldo stok gudang',
                allowNegative: true,
            });
            await tx.productStock.delete({ where: { ID: row.ID } });
            await this.ledger.syncProductTotal(tx, row.ProductID);
        });
        await this.afterWrite();
        return row;
    }
    async setQuantity(tx, productId, warehouseId, quantity, minimumStock, d, userId) {
        const product = await tx.product.findUnique({ where: { ID: productId }, select: { ID: true } });
        if (!product)
            throw new common_1.BadRequestException(`Produk dengan ID ${productId} tidak ditemukan`);
        const wh = await this.ledger.resolveWarehouseId(tx, warehouseId);
        await this.ledger.ensureWarehouseRows(tx, productId, userId);
        if (quantity !== undefined && quantity !== null && quantity !== '') {
            const target = new client_1.Prisma.Decimal(quantity);
            if (target.lt(0))
                throw new common_1.BadRequestException('Saldo stok tidak boleh minus');
            const cur = await tx.productStock.findUnique({ where: { ProductID_WarehouseID: { ProductID: productId, WarehouseID: wh } } });
            const delta = target.minus(cur?.Quantity ?? 0);
            const price = Number(pick(d, 'unitPrice', 'UnitPrice') ?? 0);
            const date = pick(d, 'date', 'Date');
            if (!delta.isZero()) {
                if (delta.gt(0) && price > 0)
                    await this.ledger.applyAverageCostIn(tx, productId, delta, price);
                await this.ledger.move(tx, {
                    productId,
                    warehouseId: wh,
                    qty: delta,
                    refType: 'OPENING',
                    unitCost: price > 0 ? price : undefined,
                    userId,
                    date: date ? new Date(date) : undefined,
                    notes: 'Saldo awal / koreksi saldo gudang',
                    allowNegative: true,
                });
            }
        }
        const data = {};
        if (minimumStock !== undefined && minimumStock !== null && minimumStock !== '')
            data.MinimumStock = new client_1.Prisma.Decimal(minimumStock);
        return tx.productStock.upsert({
            where: { ProductID_WarehouseID: { ProductID: productId, WarehouseID: wh } },
            create: { ProductID: productId, WarehouseID: wh, Quantity: new client_1.Prisma.Decimal(0), MinimumStock: data.MinimumStock ?? new client_1.Prisma.Decimal(0) },
            update: data,
        });
    }
    async afterWrite() {
        await this.invalidateCache();
        await this.ledger.invalidateCaches();
    }
};
exports.ProductStockService = ProductStockService;
exports.ProductStockService = ProductStockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService,
        stock_ledger_service_1.StockLedgerService])
], ProductStockService);
