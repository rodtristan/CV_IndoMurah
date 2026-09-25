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
exports.PurchaseOrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const client_1 = require("@prisma/client");
let PurchaseOrderService = class PurchaseOrderService {
    constructor(prisma, redis, queryService) {
        this.prisma = prisma;
        this.redis = redis;
        this.queryService = queryService;
        this.CACHE_PREFIX = 'purchase_orders';
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
                this.prisma.purchaseOrder.findMany(findArgs),
                this.prisma.purchaseOrder.count({ where: prismaQuery.where }),
            ]);
            const serializedData = data.map((item) => this.serializePurchaseOrder(item));
            return { data: serializedData, total, skip: prismaQuery.skip, take: prismaQuery.take };
        }, this.CACHE_TTL);
    }
    async findOne(id, query = {}) {
        const cacheKey = `${this.CACHE_PREFIX}:${id}:${this.queryService.generateCacheKey('q', query)}`;
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
            const data = await this.prisma.purchaseOrder.findUnique(findArgs);
            return data ? this.serializePurchaseOrder(data) : null;
        }, this.CACHE_TTL);
    }
    async create(dto, userId) {
        const code = await this.generateCode();
        const draftStatus = await this.getStatusByCode('DRAFT');
        const paymentStatus = await this.getPaymentStatusByCode('PENDING');
        const itemsData = dto.Items.map((item) => {
            const subtotal = item.UnitPrice * item.Quantity - (item.DiscountAmount || 0);
            return {
                ProductID: item.ProductID,
                Quantity: new client_1.Prisma.Decimal(item.Quantity.toString()),
                UnitID: item.UnitID,
                UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice.toString()),
                DiscountAmount: new client_1.Prisma.Decimal((item.DiscountAmount || 0).toString()),
                Subtotal: new client_1.Prisma.Decimal(subtotal.toString()),
            };
        });
        const total = itemsData.reduce((sum, item) => sum + Number(item.Subtotal), 0);
        const purchaseOrder = await this.prisma.purchaseOrder.create({
            data: {
                Code: code,
                SupplierID: dto.SupplierID,
                Date: dto.Date ? new Date(dto.Date) : new Date(),
                DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
                Notes: dto.Notes,
                Total: new client_1.Prisma.Decimal(total.toString()),
                StatusID: draftStatus.ID,
                PaymentStatusID: paymentStatus.ID,
                CreatedByID: String(userId),
                PurchaseOrderItems: {
                    create: itemsData,
                },
            },
            include: {
                Supplier: true,
                PurchaseOrderItems: { include: { Product: true, Unit: true } },
            },
        });
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        return this.serializePurchaseOrder(purchaseOrder);
    }
    async update(id, dto) {
        const purchaseOrder = await this.prisma.purchaseOrder.findUnique({ where: { ID: id } });
        if (!purchaseOrder)
            throw new common_1.NotFoundException('Purchase order not found');
        const status = await this.getStatusById(purchaseOrder.StatusID);
        if (status?.Code !== 'DRAFT') {
            throw new common_1.BadRequestException('Can only update draft purchase orders');
        }
        const updated = await this.prisma.purchaseOrder.update({
            where: { ID: id },
            data: {
                SupplierID: dto.SupplierID,
                Date: dto.Date ? new Date(dto.Date) : undefined,
                DueDate: dto.DueDate ? new Date(dto.DueDate) : undefined,
                Notes: dto.Notes,
            },
            include: {
                Supplier: true,
                PurchaseOrderItems: { include: { Product: true, Unit: true } },
            },
        });
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        return this.serializePurchaseOrder(updated);
    }
    async addItem(id, dto) {
        const purchaseOrder = await this.prisma.purchaseOrder.findUnique({ where: { ID: id } });
        if (!purchaseOrder)
            throw new common_1.NotFoundException('Purchase order not found');
        const status = await this.getStatusById(purchaseOrder.StatusID);
        if (status?.Code !== 'DRAFT') {
            throw new common_1.BadRequestException('Can only add items to draft purchase orders');
        }
        const subtotal = dto.UnitPrice * dto.Quantity - (dto.DiscountAmount || 0);
        await this.prisma.purchaseOrderItem.create({
            data: {
                PurchaseOrderID: id,
                ProductID: dto.ProductID,
                Quantity: new client_1.Prisma.Decimal(dto.Quantity.toString()),
                UnitID: dto.UnitID,
                UnitPrice: new client_1.Prisma.Decimal(dto.UnitPrice.toString()),
                DiscountAmount: new client_1.Prisma.Decimal((dto.DiscountAmount || 0).toString()),
                Subtotal: new client_1.Prisma.Decimal(subtotal.toString()),
            },
        });
        await this.recalculateTotal(id);
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        return this.findOne(id, {});
    }
    async removeItem(id, itemId) {
        const purchaseOrder = await this.prisma.purchaseOrder.findUnique({ where: { ID: id } });
        if (!purchaseOrder)
            throw new common_1.NotFoundException('Purchase order not found');
        const status = await this.getStatusById(purchaseOrder.StatusID);
        if (status?.Code !== 'DRAFT') {
            throw new common_1.BadRequestException('Can only remove items from draft purchase orders');
        }
        const item = await this.prisma.purchaseOrderItem.findFirst({
            where: { ID: itemId, PurchaseOrderID: id },
        });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        await this.prisma.purchaseOrderItem.delete({ where: { ID: itemId } });
        await this.recalculateTotal(id);
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        return this.findOne(id, {});
    }
    async updateStatus(id, dto) {
        const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
            where: { ID: id },
            include: { PurchaseOrderItems: true },
        });
        if (!purchaseOrder)
            throw new common_1.NotFoundException('Purchase order not found');
        const currentStatus = await this.getStatusById(purchaseOrder.StatusID);
        const currentCode = currentStatus?.Code ?? 'DRAFT';
        const validTransitions = {
            DRAFT: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['COMPLETED', 'CANCELLED'],
        };
        const allowed = validTransitions[currentCode] || [];
        if (!allowed.includes(dto.StatusCode)) {
            throw new common_1.BadRequestException(`Cannot transition from '${currentCode}' to '${dto.StatusCode}'`);
        }
        const newStatus = await this.getStatusByCode(dto.StatusCode);
        const updated = await this.prisma.purchaseOrder.update({
            where: { ID: id },
            data: { StatusID: newStatus.ID },
            include: {
                Supplier: true,
                PurchaseOrderItems: { include: { Product: true, Unit: true } },
            },
        });
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        return this.serializePurchaseOrder(updated);
    }
    async delete(id) {
        const purchaseOrder = await this.prisma.purchaseOrder.findUnique({ where: { ID: id } });
        if (!purchaseOrder)
            throw new common_1.NotFoundException('Purchase order not found');
        const status = await this.getStatusById(purchaseOrder.StatusID);
        if (status?.Code !== 'DRAFT') {
            throw new common_1.BadRequestException('Can only delete draft purchase orders');
        }
        await this.prisma.purchaseOrder.delete({ where: { ID: id } });
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        return { id };
    }
    async recalculateTotal(purchaseOrderId) {
        const items = await this.prisma.purchaseOrderItem.findMany({
            where: { PurchaseOrderID: purchaseOrderId },
        });
        const total = items.reduce((sum, item) => {
            const unitPrice = Number(item.UnitPrice);
            const quantity = Number(item.Quantity);
            const discountAmount = Number(item.DiscountAmount);
            return sum + unitPrice * quantity - discountAmount;
        }, 0);
        await this.prisma.purchaseOrder.update({
            where: { ID: purchaseOrderId },
            data: { Total: new client_1.Prisma.Decimal(total.toString()) },
        });
    }
    async generateCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `PO-${year}${month}`;
        const lastOrder = await this.prisma.purchaseOrder.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastOrder) {
            const lastSeq = parseInt(lastOrder.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
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
    serializePurchaseOrder(data) {
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
        if (data.PurchaseOrderItems && Array.isArray(data.PurchaseOrderItems)) {
            result.PurchaseOrderItems = data.PurchaseOrderItems.map((item) => this.serializePurchaseOrderItem(item));
        }
        return result;
    }
    serializePurchaseOrderItem(data) {
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
exports.PurchaseOrderService = PurchaseOrderService;
exports.PurchaseOrderService = PurchaseOrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService])
], PurchaseOrderService);
