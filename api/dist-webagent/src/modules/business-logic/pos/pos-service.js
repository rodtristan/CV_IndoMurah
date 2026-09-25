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
exports.POSService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const redis_service_1 = require("../../../common/redis/redis-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let POSService = class POSService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
        this.CART_PREFIX = 'pos:cart:';
        this.HOLD_PREFIX = 'pos:hold:';
        this.CART_TTL = 3600;
    }
    async searchByBarcode(dto) {
        let product = await this.prisma.product.findFirst({
            where: {
                IsActive: true,
                OR: [
                    { Barcode: dto.barcode },
                    { ProductBarcodes: { some: { Barcode: dto.barcode, IsActive: true } } },
                ],
            },
            include: {
                Category: true,
                Brand: true,
                Unit: true,
                ProductStocks: dto.warehouseId
                    ? { where: { WarehouseID: dto.warehouseId } }
                    : undefined,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with barcode '${dto.barcode}' not found`);
        }
        const stockInWarehouse = dto.warehouseId
            ? product.ProductStocks?.[0]?.Quantity || product.Stock
            : product.Stock;
        return {
            id: product.ID,
            code: product.Code,
            barcode: product.Barcode,
            name: product.Name,
            category: product.Category ? { id: product.Category.ID, name: product.Category.Name } : null,
            brand: product.Brand ? { id: product.Brand.ID, name: product.Brand.Name } : null,
            unit: { id: product.Unit.ID, name: product.Unit.Name, abbreviation: product.Unit.Abbreviation },
            sellingPrice: (0, number_1.number)(product.SellingPrice),
            stock: (0, number_1.number)(stockInWarehouse),
            minimumStock: (0, number_1.number)(product.MinimumStock),
            hasEnoughStock: (0, number_1.number)(stockInWarehouse) > 0,
        };
    }
    async searchProducts(dto) {
        const where = { IsActive: true };
        if (dto.search) {
            where.OR = [
                { Name: { contains: dto.search, mode: 'insensitive' } },
                { Code: { contains: dto.search, mode: 'insensitive' } },
                { Barcode: { contains: dto.search, mode: 'insensitive' } },
                { ProductBarcodes: { some: { Barcode: { contains: dto.search }, IsActive: true } } },
            ];
        }
        if (dto.categoryId) {
            where.CategoryID = dto.categoryId;
        }
        if (dto.brandId) {
            where.BrandID = dto.brandId;
        }
        if (dto.inStockOnly) {
            where.Stock = { gt: 0 };
        }
        const products = await this.prisma.product.findMany({
            where,
            include: {
                Category: true,
                Brand: true,
                Unit: true,
                ProductStocks: dto.warehouseId
                    ? { where: { WarehouseID: dto.warehouseId } }
                    : undefined,
            },
            orderBy: { Name: 'asc' },
            take: dto.limit || 50,
        });
        return products.map((p) => {
            const stockInWarehouse = dto.warehouseId
                ? p.ProductStocks?.[0]?.Quantity || p.Stock
                : p.Stock;
            return {
                id: p.ID,
                code: p.Code,
                name: p.Name,
                barcode: p.Barcode,
                category: p.Category ? { id: p.Category.ID, name: p.Category.Name } : null,
                brand: p.Brand ? { id: p.Brand.ID, name: p.Brand.Name } : null,
                unit: { id: p.Unit.ID, name: p.Unit.Name, abbreviation: p.Unit.Abbreviation },
                sellingPrice: (0, number_1.number)(p.SellingPrice),
                stock: (0, number_1.number)(stockInWarehouse),
                minimumStock: (0, number_1.number)(p.MinimumStock),
            };
        });
    }
    async quickPriceCheck(dto) {
        const product = await this.prisma.product.findUnique({
            where: { ID: dto.productId },
            include: {
                Category: true,
                Brand: true,
                Unit: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const customer = await this.prisma.customer.findUnique({
            where: { ID: dto.customerId },
            include: { CustomerGroup: true },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        let unitPrice = Number(product.SellingPrice);
        const groupDiscount = customer.CustomerGroup?.DiscountPercent
            ? Number(customer.CustomerGroup.DiscountPercent)
            : 0;
        if (groupDiscount > 0) {
            unitPrice = unitPrice * (1 - groupDiscount / 100);
        }
        const subTotal = unitPrice * dto.quantity;
        const discountAmount = 0;
        const total = subTotal;
        return {
            productId: product.ID,
            productCode: product.Code,
            productName: product.Name,
            unitPrice: Math.round(unitPrice * 100) / 100,
            quantity: dto.quantity,
            groupDiscount,
            subTotal: Math.round(subTotal * 100) / 100,
            customerGroup: customer.CustomerGroup?.Name || 'Default',
        };
    }
    async openCart(sessionId, dto) {
        const customer = await this.prisma.customer.findUnique({
            where: { ID: dto.customerId },
            include: { CustomerGroup: true },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const cart = {
            id: sessionId,
            customerId: dto.customerId,
            customerName: customer.Name,
            salePointId: dto.salePointId,
            warehouseId: dto.warehouseId,
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await this.redis.set(`${this.CART_PREFIX}${sessionId}`, cart, this.CART_TTL);
        return {
            sessionId,
            customer: {
                id: customer.ID,
                code: customer.Code,
                name: customer.Name,
                customerGroup: customer.CustomerGroup?.Name || 'Default',
                pointBalance: customer.PointBalance,
            },
            items: [],
            itemCount: 0,
            subTotal: 0,
        };
    }
    async addToCart(sessionId, dto) {
        const cartData = await this.redis.get(`${this.CART_PREFIX}${sessionId}`);
        if (!cartData) {
            throw new common_1.BadRequestException('Cart session not found. Please open a new cart.');
        }
        const cart = JSON.parse(cartData);
        const product = await this.prisma.product.findUnique({
            where: { ID: dto.productId },
            include: { Unit: true },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const stock = cart.warehouseId
            ? await this.prisma.productStock.findUnique({
                where: { ProductID_WarehouseID: { ProductID: dto.productId, WarehouseID: cart.warehouseId } },
            })
            : null;
        const availableStock = stock ? Number(stock.Quantity) : (0, number_1.number)(product.Stock);
        const existingItem = cart.items.find((i) => i.productId === dto.productId);
        const currentQtyInCart = existingItem ? existingItem.quantity : 0;
        const totalQtyNeeded = currentQtyInCart + dto.quantity;
        if (totalQtyNeeded > availableStock) {
            throw new common_1.BadRequestException(`Insufficient stock. Available: ${availableStock}, Requested: ${totalQtyNeeded}`);
        }
        const unitPrice = dto.unitPrice || Number(product.SellingPrice);
        const itemSubTotal = unitPrice * dto.quantity;
        if (existingItem) {
            existingItem.quantity += dto.quantity;
            existingItem.subTotal = existingItem.quantity * existingItem.unitPrice;
            if (dto.notes)
                existingItem.notes = dto.notes;
        }
        else {
            cart.items.push({
                productId: product.ID,
                productCode: product.Code,
                productName: product.Name,
                barcode: product.Barcode || undefined,
                quantity: dto.quantity,
                unitId: product.Unit.ID,
                unitName: product.Unit.Name,
                unitPrice,
                discountPercent: 0,
                discountAmount: 0,
                subTotal: itemSubTotal,
                maxQuantity: availableStock,
                notes: dto.notes,
            });
        }
        cart.updatedAt = new Date().toISOString();
        await this.redis.set(`${this.CART_PREFIX}${sessionId}`, cart, this.CART_TTL);
        return this.getCartSummary(cart);
    }
    async updateCartItem(sessionId, productId, dto) {
        const cartData = await this.redis.get(`${this.CART_PREFIX}${sessionId}`);
        if (!cartData) {
            throw new common_1.BadRequestException('Cart session not found');
        }
        const cart = JSON.parse(cartData);
        const item = cart.items.find((i) => i.productId === productId);
        if (!item) {
            throw new common_1.NotFoundException('Item not found in cart');
        }
        if (dto.quantity === 0) {
            cart.items = cart.items.filter((i) => i.productId !== productId);
        }
        else {
            if (dto.quantity > item.maxQuantity) {
                throw new common_1.BadRequestException(`Quantity exceeds available stock: ${item.maxQuantity}`);
            }
            item.quantity = dto.quantity;
            if (dto.unitPrice !== undefined)
                item.unitPrice = dto.unitPrice;
            if (dto.discountPercent !== undefined)
                item.discountPercent = dto.discountPercent;
            if (dto.discountAmount !== undefined)
                item.discountAmount = dto.discountAmount;
            item.subTotal = item.quantity * item.unitPrice - item.discountAmount;
        }
        cart.updatedAt = new Date().toISOString();
        await this.redis.set(`${this.CART_PREFIX}${sessionId}`, cart, this.CART_TTL);
        return this.getCartSummary(cart);
    }
    async removeFromCart(sessionId, productId) {
        return this.updateCartItem(sessionId, productId, { quantity: 0 });
    }
    async getCart(sessionId) {
        const cartData = await this.redis.get(`${this.CART_PREFIX}${sessionId}`);
        if (!cartData) {
            throw new common_1.NotFoundException('Cart session not found');
        }
        const cart = JSON.parse(cartData);
        return this.getCartSummary(cart);
    }
    async clearCart(sessionId) {
        await this.redis.del(`${this.CART_PREFIX}${sessionId}`);
        return { message: 'Cart cleared' };
    }
    async holdTransaction(sessionId, dto) {
        const cartData = await this.redis.get(`${this.CART_PREFIX}${sessionId}`);
        if (!cartData) {
            throw new common_1.BadRequestException('Cart session not found');
        }
        const cart = JSON.parse(cartData);
        if (cart.items.length === 0) {
            throw new common_1.BadRequestException('Cannot hold empty cart');
        }
        const existingHold = await this.redis.get(`${this.HOLD_PREFIX}${dto.holdNumber}`);
        if (existingHold) {
            throw new common_1.ConflictException('Hold number already exists');
        }
        cart.id = dto.holdNumber;
        cart.updatedAt = new Date().toISOString();
        await this.redis.set(`${this.HOLD_PREFIX}${dto.holdNumber}`, cart, 86400);
        await this.redis.del(`${this.CART_PREFIX}${sessionId}`);
        return {
            holdNumber: dto.holdNumber,
            itemCount: cart.items.length,
            message: `Transaction held with number ${dto.holdNumber}`,
        };
    }
    async resumeTransaction(sessionId, dto) {
        const holdData = await this.redis.get(`${this.HOLD_PREFIX}${dto.holdNumber}`);
        if (!holdData) {
            throw new common_1.NotFoundException('Held transaction not found');
        }
        const cart = JSON.parse(holdData);
        cart.id = sessionId;
        cart.updatedAt = new Date().toISOString();
        await this.redis.set(`${this.CART_PREFIX}${sessionId}`, cart, this.CART_TTL);
        await this.redis.del(`${this.HOLD_PREFIX}${dto.holdNumber}`);
        return this.getCartSummary(cart);
    }
    async listHeldTransactions() {
        return [];
    }
    async applyVoucher(dto) {
        const voucher = await this.prisma.voucher.findFirst({
            where: {
                Code: dto.code,
                IsActive: true,
                StartDate: { lte: new Date() },
                EndDate: { gte: new Date() },
            },
            include: { Type: true },
        });
        if (!voucher) {
            throw new common_1.NotFoundException('Voucher not found or expired');
        }
        if (voucher.UsageLimit && voucher.UsedCount >= voucher.UsageLimit) {
            throw new common_1.BadRequestException('Voucher usage limit reached');
        }
        if (voucher.MinPurchaseAmount && dto.subtotal < Number(voucher.MinPurchaseAmount)) {
            throw new common_1.BadRequestException(`Minimum purchase ${voucher.MinPurchaseAmount} required for this voucher`);
        }
        let discountAmount = 0;
        if (voucher.Type.Code === 'PERCENT') {
            discountAmount = dto.subtotal * (Number(voucher.Value) / 100);
            if (voucher.MaxDiscountAmount && discountAmount > Number(voucher.MaxDiscountAmount)) {
                discountAmount = Number(voucher.MaxDiscountAmount);
            }
        }
        else {
            discountAmount = Number(voucher.Value);
        }
        return {
            voucherCode: voucher.Code,
            voucherName: voucher.Name,
            discountType: voucher.Type.Code,
            discountValue: (0, number_1.number)(voucher.Value),
            discountAmount: Math.round(discountAmount * 100) / 100,
            newSubTotal: Math.round((dto.subtotal - discountAmount) * 100) / 100,
        };
    }
    async completeTransaction(sessionId, dto) {
        const cartData = await this.redis.get(`${this.CART_PREFIX}${sessionId}`);
        if (!cartData) {
            throw new common_1.NotFoundException('Cart session not found');
        }
        const cart = JSON.parse(cartData);
        if (cart.items.length === 0) {
            throw new common_1.BadRequestException('Cannot complete empty transaction');
        }
        const subTotal = cart.items.reduce((sum, i) => sum + i.subTotal, 0);
        const total = subTotal;
        const cashAmount = dto.cashAmount;
        if (cashAmount < total) {
            throw new common_1.BadRequestException(`Insufficient payment. Total: ${total}, Received: ${cashAmount}`);
        }
        const changeAmount = cashAmount - total;
        const customer = await this.prisma.customer.findUnique({
            where: { ID: cart.customerId },
            include: { CustomerGroup: true },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const code = await this.generateCode();
        const paymentStatusCode = cashAmount >= total ? 'PAID' : 'PARTIAL';
        const status = await this.prisma.paymentStatus.findFirst({ where: { Code: paymentStatusCode } });
        const paymentStatusId = status?.ID || 1;
        const sale = await this.prisma.$transaction(async (tx) => {
            const newSale = await tx.sale.create({
                data: {
                    Code: code,
                    Date: new Date(),
                    CustomerID: cart.customerId,
                    SalePointID: cart.salePointId,
                    WarehouseID: cart.warehouseId,
                    Subtotal: new client_1.Prisma.Decimal(subTotal),
                    DiscountAmount: new client_1.Prisma.Decimal(0),
                    DiscountPercent: new client_1.Prisma.Decimal(0),
                    TaxAmount: new client_1.Prisma.Decimal(0),
                    TaxPercent: new client_1.Prisma.Decimal(0),
                    Total: new client_1.Prisma.Decimal(total),
                    CashAmount: new client_1.Prisma.Decimal(cashAmount),
                    ChangeAmount: new client_1.Prisma.Decimal(changeAmount),
                    PaymentStatusID: paymentStatusId,
                    PaymentMethodID: dto.paymentMethodId,
                    Notes: dto.notes,
                    CreatedByID: 'system',
                    SaleItems: {
                        create: cart.items.map((item) => ({
                            ProductID: item.productId,
                            Quantity: new client_1.Prisma.Decimal(item.quantity),
                            UnitID: item.unitId,
                            UnitPrice: new client_1.Prisma.Decimal(item.unitPrice),
                            DiscountPercent: new client_1.Prisma.Decimal(item.discountPercent),
                            DiscountAmount: new client_1.Prisma.Decimal(item.discountAmount),
                            Subtotal: new client_1.Prisma.Decimal(item.subTotal),
                        })),
                    },
                },
                include: {
                    Customer: true,
                    SaleItems: { include: { Product: true, Unit: true } },
                },
            });
            if (status) {
                await tx.sale.update({
                    where: { ID: newSale.ID },
                    data: { PaymentStatusID: status.ID },
                });
            }
            for (const item of cart.items) {
                await tx.product.update({
                    where: { ID: item.productId },
                    data: { Stock: { decrement: new client_1.Prisma.Decimal(item.quantity) } },
                });
                if (cart.warehouseId) {
                    await tx.productStock.update({
                        where: {
                            ProductID_WarehouseID: {
                                ProductID: item.productId,
                                WarehouseID: cart.warehouseId,
                            },
                        },
                        data: { Quantity: { decrement: new client_1.Prisma.Decimal(item.quantity) } },
                    }).catch(() => {
                        return tx.productStock.create({
                            data: {
                                ProductID: item.productId,
                                WarehouseID: cart.warehouseId,
                                Quantity: new client_1.Prisma.Decimal(0),
                            },
                        });
                    });
                }
            }
            await tx.salePayment.create({
                data: {
                    SaleID: newSale.ID,
                    MethodID: dto.paymentMethodId,
                    Amount: new client_1.Prisma.Decimal(cashAmount >= total ? total : cashAmount),
                    ReferenceNumber: null,
                    Notes: dto.notes,
                    CreatedByID: 'system',
                },
            });
            if (cashAmount < total) {
                const remainingAmount = total - cashAmount;
                await tx.customer.update({
                    where: { ID: cart.customerId },
                    data: { TotalReceivable: { increment: new client_1.Prisma.Decimal(remainingAmount) } },
                });
            }
            const pointSetting = await tx.pointSetting.findFirst({ where: { IsActive: true } });
            if (pointSetting && cashAmount >= Number(pointSetting.MinimumTransaction)) {
                const points = Math.floor(cashAmount * Number(pointSetting.PointsPerRupiah));
                await tx.customer.update({
                    where: { ID: cart.customerId },
                    data: { PointBalance: { increment: points } },
                });
            }
            return newSale;
        });
        await this.redis.del(`${this.CART_PREFIX}${sessionId}`);
        return {
            success: true,
            transaction: {
                id: sale.ID,
                code: sale.Code,
                date: sale.Date,
                customer: sale.Customer.Name,
                itemCount: cart.items.length,
                subTotal,
                total,
                cashAmount,
                changeAmount,
                paymentStatus: paymentStatusCode,
            },
            receipt: {
                header: 'Toko CV IndoMurah',
                transactionCode: sale.Code,
                date: sale.Date,
                customer: sale.Customer.Name,
                items: cart.items.map((i) => ({
                    name: i.productName,
                    qty: i.quantity,
                    price: i.unitPrice,
                    subTotal: i.subTotal,
                })),
                subTotal,
                total,
                cash: cashAmount,
                change: changeAmount,
            },
        };
    }
    async generateCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const prefix = `TRX-${year}${month}${day}`;
        const lastSale = await this.prisma.sale.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastSale) {
            const lastSeq = parseInt(lastSale.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    getCartSummary(cart) {
        const subTotal = cart.items.reduce((sum, i) => sum + i.subTotal, 0);
        const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
        return {
            sessionId: cart.id,
            customer: {
                id: cart.customerId,
                name: cart.customerName,
            },
            items: cart.items,
            itemCount,
            subTotal: Math.round(subTotal * 100) / 100,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
        };
    }
};
exports.POSService = POSService;
exports.POSService = POSService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], POSService);
