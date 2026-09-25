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
exports.StockTransferService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const stock_document_service_1 = require("../../common/stock/stock-document.service");
const stock_ledger_service_1 = require("../../common/stock/stock-ledger.service");
const client_1 = require("@prisma/client");
let StockTransferService = class StockTransferService extends stock_document_service_1.StockDocumentService {
    constructor(prisma, redis, queryService, ledger) {
        super(prisma, redis, queryService, {
            modelName: 'stockTransfer',
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
    async createStockTransfer(dto, userId) {
        if (!dto.Items || dto.Items.length === 0) {
            throw new common_1.BadRequestException('Stock transfer items tidak boleh kosong');
        }
        if (dto.FromWarehouseID === dto.ToWarehouseID) {
            throw new common_1.BadRequestException('Gudang asal dan tujuan tidak boleh sama');
        }
        const code = await this.generateCode();
        const completedStatus = await this.getTransactionStatusByCode('COMPLETED');
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
        if (dto.Items.some((i) => !(Number(i.Quantity) > 0)))
            throw new common_1.BadRequestException('Jumlah item harus lebih dari 0');
        const docDate = dto.Date ? new Date(dto.Date) : new Date();
        const stockTransfer = await this.prisma.$transaction(async (tx) => {
            const fromId = await this.ledger.resolveWarehouseId(tx, dto.FromWarehouseID);
            const toId = await this.ledger.resolveWarehouseId(tx, dto.ToWarehouseID);
            const created = await tx.stockTransfer.create({
                data: {
                    Code: code,
                    Date: docDate,
                    FromWarehouse: { connect: { ID: fromId } },
                    ToWarehouse: { connect: { ID: toId } },
                    TotalItems: new client_1.Prisma.Decimal(totalItems),
                    Notes: dto.Notes,
                    Status: { connect: { ID: completedStatus.ID } },
                    Creator: { connect: { ID: userId } },
                    TransferItems: { create: itemsData },
                },
                include: { TransferItems: true },
            });
            for (const it of created.TransferItems) {
                const base = await this.ledger.toBaseQty(tx, it.ProductID, it.UnitID, it.Quantity);
                const common = { productId: it.ProductID, refId: created.ID, refCode: created.Code, userId, date: docDate, notes: dto.Notes };
                await this.ledger.move(tx, { ...common, warehouseId: fromId, qty: base.neg(), refType: 'TRANSFER_OUT' });
                await this.ledger.move(tx, { ...common, warehouseId: toId, qty: base, refType: 'TRANSFER_IN' });
            }
            return tx.stockTransfer.findUniqueOrThrow({
                where: { ID: created.ID },
                include: {
                    FromWarehouse: true,
                    ToWarehouse: true,
                    Status: true,
                    Creator: true,
                    TransferItems: { include: { Product: true, Unit: true } },
                },
            });
        }, { timeout: 30000 });
        await this.afterWrite();
        return this.serializeStockTransfer(stockTransfer);
    }
    async patchById(id, dto, userId) {
        const doc = await this.prisma.stockTransfer.findUnique({ where: { ID: Number(id) } });
        if (!doc)
            throw new common_1.NotFoundException('Transfer tidak ditemukan');
        const from = dto.FromWarehouseID ? Number(dto.FromWarehouseID) : doc.FromWarehouseID;
        const to = dto.ToWarehouseID ? Number(dto.ToWarehouseID) : doc.ToWarehouseID;
        if (from === to)
            throw new common_1.BadRequestException('Gudang asal dan tujuan tidak boleh sama');
        const result = await this.prisma.$transaction(async (tx) => {
            const data = {};
            if (to !== doc.ToWarehouseID) {
                const wh = await this.ledger.resolveWarehouseId(tx, to);
                await this.ledger.relocateRef(tx, ['TRANSFER_IN'], doc.ID, wh, { refCode: doc.Code, userId });
                data.ToWarehouseID = wh;
            }
            if (from !== doc.FromWarehouseID) {
                const wh = await this.ledger.resolveWarehouseId(tx, from);
                await this.ledger.relocateRef(tx, ['TRANSFER_OUT'], doc.ID, wh, { refCode: doc.Code, userId });
                data.FromWarehouseID = wh;
            }
            if (dto.Date)
                data.Date = new Date(dto.Date);
            if (dto.Notes !== undefined)
                data.Notes = dto.Notes;
            return tx.stockTransfer.update({ where: { ID: doc.ID }, data });
        });
        await this.afterWrite();
        return this.serializeStockTransfer(result);
    }
    async deleteById(id, userId) {
        const doc = await this.prisma.stockTransfer.findUnique({ where: { ID: Number(id) } });
        if (!doc)
            throw new common_1.NotFoundException('Transfer tidak ditemukan');
        await this.prisma.$transaction(async (tx) => {
            await this.ledger.reverseRef(tx, ['TRANSFER_IN', 'TRANSFER_OUT'], doc.ID, { refCode: doc.Code, userId, notes: `Hapus transfer ${doc.Code}` });
            await tx.stockTransfer.delete({ where: { ID: doc.ID } });
        }, { timeout: 30000 });
        await this.afterWrite();
        return this.serializeStockTransfer(doc);
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
        const prefix = `TR-${year}${month}`;
        const lastStockTransfer = await this.prisma.stockTransfer.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastStockTransfer) {
            const lastSeq = parseInt(lastStockTransfer.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    serializeStockTransfer(data) {
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
        if (data.TransferItems && Array.isArray(data.TransferItems)) {
            result.TransferItems = data.TransferItems.map((item) => this.serializeStockTransfer(item));
        }
        return result;
    }
};
exports.StockTransferService = StockTransferService;
exports.StockTransferService = StockTransferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService,
        stock_ledger_service_1.StockLedgerService])
], StockTransferService);
