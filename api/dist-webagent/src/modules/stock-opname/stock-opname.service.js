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
exports.StockOpnameService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const stock_document_service_1 = require("../../common/stock/stock-document.service");
const stock_ledger_service_1 = require("../../common/stock/stock-ledger.service");
const client_1 = require("@prisma/client");
let StockOpnameService = class StockOpnameService extends stock_document_service_1.StockDocumentService {
    constructor(prisma, redis, queryService, ledger) {
        super(prisma, redis, queryService, {
            modelName: 'stockOpname',
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
    async createStockOpname(dto, userId) {
        if (!dto.Items || dto.Items.length === 0) {
            throw new common_1.BadRequestException('Item stock opname tidak boleh kosong');
        }
        if (dto.Items.some((i) => Number(i.CountedStock) < 0))
            throw new common_1.BadRequestException('Stok fisik tidak boleh minus');
        const seen = new Set();
        for (const i of dto.Items) {
            if (seen.has(i.ProductID))
                throw new common_1.BadRequestException(`Produk ID ${i.ProductID} muncul lebih dari sekali dalam opname`);
            seen.add(i.ProductID);
        }
        const code = await this.generateCode();
        const completedStatus = await this.getStockOpnameStatusByCode('COMPLETED');
        const docDate = dto.Date ? new Date(dto.Date) : new Date();
        const totalItems = dto.Items.reduce((sum, item) => sum + Number(item.CountedStock), 0);
        const stockOpname = await this.prisma.$transaction(async (tx) => {
            const warehouseId = await this.ledger.resolveWarehouseId(tx, dto.WarehouseID);
            const plan = [];
            for (const item of dto.Items) {
                const conv = await this.ledger.conversion(tx, item.ProductID, item.UnitID);
                const ps = await tx.productStock.findUnique({
                    where: { ProductID_WarehouseID: { ProductID: item.ProductID, WarehouseID: warehouseId } },
                    select: { Quantity: true },
                });
                let currentBase = new client_1.Prisma.Decimal(ps?.Quantity ?? 0);
                if (!ps && (await tx.productStock.count({ where: { ProductID: item.ProductID } })) === 0) {
                    if ((await this.ledger.getDefaultWarehouseId(tx)) === warehouseId) {
                        const p = await tx.product.findUnique({ where: { ID: item.ProductID }, select: { Stock: true } });
                        currentBase = new client_1.Prisma.Decimal(p?.Stock ?? 0);
                    }
                }
                const countedBase = new client_1.Prisma.Decimal(item.CountedStock).mul(conv);
                plan.push({
                    item,
                    conv,
                    system: currentBase.div(conv).toDecimalPlaces(3),
                    diff: new client_1.Prisma.Decimal(item.CountedStock).minus(currentBase.div(conv)).toDecimalPlaces(3),
                    diffBase: countedBase.minus(currentBase),
                });
            }
            const created = await tx.stockOpname.create({
                data: {
                    Code: code,
                    Date: docDate,
                    Warehouse: { connect: { ID: warehouseId } },
                    TotalItems: new client_1.Prisma.Decimal(totalItems),
                    Notes: dto.Notes,
                    Status: { connect: { ID: completedStatus.ID } },
                    Creator: { connect: { ID: userId } },
                    OpnameItems: {
                        create: plan.map((p) => ({
                            ProductID: p.item.ProductID,
                            SystemStock: p.system,
                            CountedStock: new client_1.Prisma.Decimal(p.item.CountedStock),
                            Difference: p.diff,
                            UnitID: p.item.UnitID,
                            UnitPrice: new client_1.Prisma.Decimal(p.item.UnitPrice ?? 0),
                            Note: p.item.Note,
                        })),
                    },
                },
            });
            for (const p of plan) {
                if (p.diffBase.isZero())
                    continue;
                const price = Number(p.item.UnitPrice ?? 0);
                await this.ledger.move(tx, {
                    productId: p.item.ProductID,
                    warehouseId,
                    qty: p.diffBase,
                    refType: 'OPNAME',
                    refId: created.ID,
                    refCode: created.Code,
                    unitCost: price > 0 ? new client_1.Prisma.Decimal(price).div(p.conv) : undefined,
                    userId,
                    date: docDate,
                    notes: p.item.Note ?? dto.Notes,
                });
            }
            return tx.stockOpname.findUniqueOrThrow({
                where: { ID: created.ID },
                include: { Warehouse: true, Status: true, Creator: true, OpnameItems: { include: { Product: true, Unit: true } } },
            });
        }, { timeout: 30000 });
        await this.afterWrite();
        return this.serializeStockOpname(stockOpname);
    }
    async patchById(id, dto) {
        const doc = await this.prisma.stockOpname.findUnique({ where: { ID: Number(id) } });
        if (!doc)
            throw new common_1.NotFoundException('Stock opname tidak ditemukan');
        if (dto.WarehouseID && Number(dto.WarehouseID) !== doc.WarehouseID) {
            throw new common_1.BadRequestException('Gudang stock opname tidak dapat diubah. Hapus dan buat ulang opname di gudang yang benar.');
        }
        const data = {};
        if (dto.Date)
            data.Date = new Date(dto.Date);
        if (dto.Notes !== undefined)
            data.Notes = dto.Notes;
        const result = await this.prisma.stockOpname.update({ where: { ID: doc.ID }, data });
        await this.afterWrite();
        return this.serializeStockOpname(result);
    }
    async deleteById(id, userId) {
        const doc = await this.prisma.stockOpname.findUnique({ where: { ID: Number(id) } });
        if (!doc)
            throw new common_1.NotFoundException('Stock opname tidak ditemukan');
        await this.prisma.$transaction(async (tx) => {
            await this.ledger.reverseRef(tx, ['OPNAME'], doc.ID, { refCode: doc.Code, userId, notes: `Hapus opname ${doc.Code}` });
            await tx.stockOpname.delete({ where: { ID: doc.ID } });
        }, { timeout: 30000 });
        await this.afterWrite();
        return this.serializeStockOpname(doc);
    }
    async afterWrite() {
        await this.invalidateCache();
        await this.ledger.invalidateCaches();
    }
    async getStockOpnameStatusByCode(code) {
        const status = await this.prisma.stockOpnameStatus.findUnique({ where: { Code: code } });
        if (!status)
            throw new common_1.BadRequestException(`Stock opname status '${code}' tidak ditemukan`);
        return status;
    }
    async generateCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `OP-${year}${month}`;
        const lastStockOpname = await this.prisma.stockOpname.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastStockOpname) {
            const lastSeq = parseInt(lastStockOpname.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    serializeStockOpname(data) {
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
        if (data.OpnameItems && Array.isArray(data.OpnameItems)) {
            result.OpnameItems = data.OpnameItems.map((item) => this.serializeStockOpname(item));
        }
        return result;
    }
};
exports.StockOpnameService = StockOpnameService;
exports.StockOpnameService = StockOpnameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService,
        stock_ledger_service_1.StockLedgerService])
], StockOpnameService);
