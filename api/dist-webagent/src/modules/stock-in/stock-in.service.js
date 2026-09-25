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
exports.StockInService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const stock_document_service_1 = require("../../common/stock/stock-document.service");
const stock_ledger_service_1 = require("../../common/stock/stock-ledger.service");
const client_1 = require("@prisma/client");
let StockInService = class StockInService extends stock_document_service_1.StockDocumentService {
    constructor(prisma, redis, queryService, ledger) {
        super(prisma, redis, queryService, {
            modelName: 'stockIn',
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
        this.ledger = ledger;
    }
    async createStockIn(dto, userId) {
        if (!dto.Items || dto.Items.length === 0) {
            throw new common_1.BadRequestException('Item barang masuk tidak boleh kosong');
        }
        if (dto.Items.some((i) => !(Number(i.Quantity) > 0)))
            throw new common_1.BadRequestException('Jumlah item harus lebih dari 0');
        const code = await this.generateCode();
        const completedStatus = await this.getTransactionStatusByCode('COMPLETED');
        const docDate = dto.Date ? new Date(dto.Date) : new Date();
        const totalItems = dto.Items.reduce((sum, item) => sum + Number(item.Quantity), 0);
        const itemsData = dto.Items.map((item) => {
            const unitPrice = item.UnitPrice ?? 0;
            const subtotal = item.Subtotal !== undefined ? item.Subtotal : item.Quantity * unitPrice;
            return {
                ProductID: item.ProductID,
                Quantity: new client_1.Prisma.Decimal(item.Quantity),
                UnitID: item.UnitID,
                UnitPrice: new client_1.Prisma.Decimal(unitPrice),
                Subtotal: new client_1.Prisma.Decimal(subtotal),
            };
        });
        const stockIn = await this.prisma.$transaction(async (tx) => {
            const warehouseId = await this.ledger.resolveWarehouseId(tx, dto.WarehouseID);
            const created = await tx.stockIn.create({
                data: {
                    Code: code,
                    Date: docDate,
                    Warehouse: { connect: { ID: warehouseId } },
                    ...(dto.SupplierID ? { Supplier: { connect: { ID: dto.SupplierID } } } : {}),
                    ...(dto.ReferenceTypeID ? { ReferenceType: { connect: { ID: dto.ReferenceTypeID } } } : {}),
                    ReferenceID: dto.ReferenceID,
                    TotalItems: new client_1.Prisma.Decimal(totalItems),
                    Description: dto.Description,
                    Status: { connect: { ID: completedStatus.ID } },
                    Creator: { connect: { ID: userId } },
                    StockInItems: { create: itemsData },
                },
                include: { StockInItems: true },
            });
            for (const it of created.StockInItems) {
                const conv = await this.ledger.conversion(tx, it.ProductID, it.UnitID);
                const base = new client_1.Prisma.Decimal(it.Quantity).mul(conv);
                const price = Number(it.UnitPrice);
                const unitCost = price > 0 ? new client_1.Prisma.Decimal(price).div(conv) : undefined;
                if (unitCost)
                    await this.ledger.applyAverageCostIn(tx, it.ProductID, base, unitCost);
                await this.ledger.move(tx, {
                    productId: it.ProductID,
                    warehouseId,
                    qty: base,
                    refType: 'STOCK_IN',
                    refId: created.ID,
                    refCode: created.Code,
                    unitCost,
                    userId,
                    date: docDate,
                    notes: dto.Description,
                });
            }
            return tx.stockIn.findUniqueOrThrow({
                where: { ID: created.ID },
                include: { Warehouse: true, Supplier: true, Status: true, Creator: true, StockInItems: { include: { Product: true, Unit: true } } },
            });
        }, { timeout: 30000 });
        await this.afterWrite();
        return this.serializeStockIn(stockIn);
    }
    async patchById(id, dto, userId) {
        const doc = await this.prisma.stockIn.findUnique({ where: { ID: Number(id) } });
        if (!doc)
            throw new common_1.NotFoundException('Barang masuk tidak ditemukan');
        const result = await this.prisma.$transaction(async (tx) => {
            const data = {};
            if (dto.WarehouseID && Number(dto.WarehouseID) !== doc.WarehouseID) {
                const wh = await this.ledger.resolveWarehouseId(tx, Number(dto.WarehouseID));
                await this.ledger.relocateRef(tx, ['STOCK_IN'], doc.ID, wh, { refCode: doc.Code, userId });
                data.WarehouseID = wh;
            }
            if (dto.SupplierID !== undefined)
                data.SupplierID = dto.SupplierID || null;
            if (dto.Date)
                data.Date = new Date(dto.Date);
            if (dto.Description !== undefined)
                data.Description = dto.Description;
            return tx.stockIn.update({ where: { ID: doc.ID }, data });
        });
        await this.afterWrite();
        return this.serializeStockIn(result);
    }
    async deleteById(id, userId) {
        const doc = await this.prisma.stockIn.findUnique({ where: { ID: Number(id) }, include: { StockInItems: true } });
        if (!doc)
            throw new common_1.NotFoundException('Barang masuk tidak ditemukan');
        await this.prisma.$transaction(async (tx) => {
            const priced = new Map();
            for (const it of doc.StockInItems) {
                if (Number(it.UnitPrice) > 0)
                    priced.set(it.ProductID, new client_1.Prisma.Decimal(it.UnitPrice).div(await this.ledger.conversion(tx, it.ProductID, it.UnitID)));
            }
            const nets = await this.ledger.netByRef(tx, ['STOCK_IN'], doc.ID);
            for (const n of nets) {
                const cost = priced.get(n.productId);
                if (cost && n.net.gt(0))
                    await this.ledger.applyAverageCostOut(tx, n.productId, n.net, cost);
                await this.ledger.move(tx, {
                    productId: n.productId,
                    warehouseId: n.warehouseId,
                    qty: n.net.neg(),
                    refType: 'STOCK_IN',
                    refId: doc.ID,
                    refCode: doc.Code,
                    unitCost: cost,
                    userId,
                    notes: `Hapus barang masuk ${doc.Code}`,
                });
            }
            await tx.stockIn.delete({ where: { ID: doc.ID } });
        }, { timeout: 30000 });
        await this.afterWrite();
        return this.serializeStockIn(doc);
    }
    async afterWrite() {
        await this.invalidateCache();
        await this.ledger.invalidateCaches();
    }
    async getTransactionStatusByCode(code) {
        const status = await this.prisma.transactionStatus.findUnique({ where: { Code: code } });
        if (!status)
            throw new common_1.BadRequestException(`Transaction status '${code}' tidak ditemukan`);
        return status;
    }
    async generateCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `SI-${year}${month}`;
        const lastStockIn = await this.prisma.stockIn.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastStockIn) {
            const lastSeq = parseInt(lastStockIn.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    serializeStockIn(data) {
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
        if (data.StockInItems && Array.isArray(data.StockInItems)) {
            result.StockInItems = data.StockInItems.map((item) => this.serializeStockIn(item));
        }
        return result;
    }
};
exports.StockInService = StockInService;
exports.StockInService = StockInService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService,
        stock_ledger_service_1.StockLedgerService])
], StockInService);
