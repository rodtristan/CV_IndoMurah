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
exports.SaleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
const stock_ledger_service_1 = require("../../common/stock/stock-ledger.service");
const party_balance_service_1 = require("../../common/stock/party-balance.service");
const auto_journal_service_1 = require("../../common/accounting/auto-journal.service");
const notification_service_1 = require("../notification/notification.service");
const client_1 = require("@prisma/client");
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const idr = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;
let SaleService = class SaleService {
    constructor(prisma, redis, queryService, notificationService, ledger, party, journal) {
        this.prisma = prisma;
        this.redis = redis;
        this.queryService = queryService;
        this.notificationService = notificationService;
        this.ledger = ledger;
        this.party = party;
        this.journal = journal;
    }
    async findAll(query) {
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
            this.prisma.sale.findMany(findArgs),
            this.prisma.sale.count({ where: prismaQuery.where }),
        ]);
        return {
            data: data.map((item) => this.serialize(item)),
            total,
            skip: prismaQuery.skip,
            take: prismaQuery.take,
        };
    }
    async findOne(id, query = {}) {
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
        const data = await this.prisma.sale.findUnique(findArgs);
        if (!data)
            throw new common_1.NotFoundException('Sale not found');
        return this.serialize(data);
    }
    async create(dto, userId) {
        if (!dto.Items || dto.Items.length === 0)
            throw new common_1.BadRequestException('Item penjualan tidak boleh kosong');
        if (dto.Items.some((i) => !(Number(i.Quantity) > 0)))
            throw new common_1.BadRequestException('Jumlah item harus lebih dari 0');
        const customer = await this.prisma.customer.findUnique({ where: { ID: dto.CustomerID } });
        if (!customer)
            throw new common_1.BadRequestException(`Pelanggan dengan ID ${dto.CustomerID} tidak ditemukan`);
        const saleDate = dto.Date ? new Date(dto.Date) : new Date();
        if (Number.isNaN(saleDate.getTime()))
            throw new common_1.BadRequestException('Tanggal penjualan tidak valid');
        const code = await this.generateCode();
        const subtotal = r2(dto.Items.reduce((sum, item) => sum + (item.UnitPrice * item.Quantity - (item.DiscountAmount || 0)), 0));
        const discountAmount = r2(dto.DiscountAmount || 0);
        const cashAmount = r2(dto.CashAmount || 0);
        const paymentMethodId = dto.PaymentMethodID ?? dto.paymentMethodId ?? (await this.getCashMethodId(this.prisma));
        const requestedWarehouse = dto.WarehouseID ?? dto.warehouseId;
        const sale = await this.prisma.$transaction(async (tx) => {
            const warehouseId = await this.ledger.resolveWarehouseId(tx, requestedWarehouse);
            let voucherId = null;
            let voucherDiscount = 0;
            if (dto.VoucherID || dto.VoucherCode) {
                const v = await this.claimVoucher(tx, dto.VoucherID, dto.VoucherCode, Math.max(subtotal - discountAmount, 0));
                voucherId = v.id;
                voucherDiscount = v.discount;
            }
            const afterDiscount = Math.max(r2(subtotal - discountAmount - voucherDiscount), 0);
            const taxAmount = dto.TaxPercent ? r2(afterDiscount * (dto.TaxPercent / 100)) : 0;
            const total = r2(afterDiscount + taxAmount);
            const changeAmount = cashAmount > total ? r2(cashAmount - total) : 0;
            const paid = cashAmount >= total ? total : cashAmount;
            const unpaid = r2(total - paid);
            const creditLimit = Number(customer.CreditLimit ?? 0);
            if (unpaid > 0.005 && creditLimit > 0) {
                const outstanding = await this.party.customerOutstanding(tx, customer.ID);
                if (outstanding + unpaid > creditLimit + 0.005) {
                    throw new common_1.BadRequestException(`Melebihi batas kredit pelanggan ${customer.Name}: limit ${idr(creditLimit)}, piutang berjalan ${idr(outstanding)}, transaksi ini belum dibayar ${idr(unpaid)}`);
                }
            }
            let dueDate = null;
            if (dto.DueDate) {
                dueDate = new Date(dto.DueDate);
                if (Number.isNaN(dueDate.getTime()))
                    throw new common_1.BadRequestException('Tanggal jatuh tempo tidak valid');
            }
            else if (unpaid > 0.005 && customer.DueDays > 0) {
                dueDate = new Date(saleDate.getTime() + customer.DueDays * 86400000);
            }
            const paymentStatus = await this.getPaymentStatusByCode(tx, paid >= total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING');
            const itemsData = [];
            for (const item of dto.Items) {
                const product = await tx.product.findUnique({ where: { ID: item.ProductID }, select: { ID: true, UnitID: true, PurchasePrice: true } });
                if (!product)
                    throw new common_1.BadRequestException(`Produk dengan ID ${item.ProductID} tidak ditemukan`);
                const unitId = item.UnitID ?? product.UnitID;
                const baseQty = await this.ledger.toBaseQty(tx, product.ID, unitId, item.Quantity);
                const itemDiscount = item.DiscountAmount || 0;
                itemsData.push({
                    Product: { connect: { ID: product.ID } },
                    Unit: { connect: { ID: unitId } },
                    Quantity: new client_1.Prisma.Decimal(item.Quantity),
                    BaseQuantity: baseQty,
                    CostPrice: new client_1.Prisma.Decimal(product.PurchasePrice),
                    UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice),
                    DiscountPercent: new client_1.Prisma.Decimal(item.DiscountPercent || 0),
                    DiscountAmount: new client_1.Prisma.Decimal(itemDiscount),
                    Subtotal: new client_1.Prisma.Decimal(r2(item.UnitPrice * item.Quantity - itemDiscount)),
                });
            }
            const newSale = await tx.sale.create({
                data: {
                    Code: code,
                    Date: saleDate,
                    DueDate: dueDate,
                    CustomerID: dto.CustomerID,
                    SalesPersonID: dto.SalesPersonID,
                    SalePointID: dto.SalePointID,
                    WarehouseID: warehouseId,
                    Subtotal: new client_1.Prisma.Decimal(subtotal),
                    DiscountPercent: new client_1.Prisma.Decimal(dto.DiscountPercent || 0),
                    DiscountAmount: new client_1.Prisma.Decimal(discountAmount),
                    VoucherID: voucherId,
                    VoucherDiscount: new client_1.Prisma.Decimal(voucherDiscount),
                    TaxPercent: new client_1.Prisma.Decimal(dto.TaxPercent || 0),
                    TaxAmount: new client_1.Prisma.Decimal(taxAmount),
                    Total: new client_1.Prisma.Decimal(total),
                    CashAmount: new client_1.Prisma.Decimal(cashAmount),
                    ChangeAmount: new client_1.Prisma.Decimal(changeAmount),
                    PaymentStatusID: paymentStatus.ID,
                    PaymentMethodID: paymentMethodId,
                    Notes: dto.Notes,
                    CreatedByID: userId,
                    SaleItems: { create: itemsData },
                },
                include: { SaleItems: true },
            });
            for (const it of newSale.SaleItems) {
                await this.ledger.move(tx, {
                    productId: it.ProductID,
                    warehouseId,
                    qty: new client_1.Prisma.Decimal(it.BaseQuantity).neg(),
                    refType: 'SALE',
                    refId: newSale.ID,
                    refCode: newSale.Code,
                    unitCost: it.CostPrice,
                    userId,
                    date: saleDate,
                });
            }
            if (paid > 0 && paymentMethodId) {
                await tx.salePayment.create({
                    data: {
                        SaleID: newSale.ID,
                        MethodID: paymentMethodId,
                        Amount: new client_1.Prisma.Decimal(paid),
                        Date: saleDate,
                        ReferenceNumber: null,
                        CreatedByID: userId,
                    },
                });
                await this.addPoints(tx, dto.CustomerID, newSale.ID, total);
            }
            await this.journal.postSale(tx, newSale.ID, userId);
            await this.party.recalcCustomer(tx, customer.ID);
            return tx.sale.findUniqueOrThrow({
                where: { ID: newSale.ID },
                include: {
                    Customer: true,
                    SalesPerson: true,
                    SalePoint: true,
                    Warehouse: true,
                    SaleItems: { include: { Product: true, Unit: true } },
                },
            });
        }, { timeout: 30000 });
        await this.afterWrite();
        await this.notificationService.notify({
            title: 'Penjualan Baru',
            message: `Transaksi ${sale.Code} sebesar ${idr(Number(sale.Total))} telah dibuat`,
            typeCode: 'SALE',
            referenceType: 'Sale',
            referenceId: sale.ID,
        });
        for (const item of sale.SaleItems) {
            const product = await this.prisma.product.findUnique({ where: { ID: item.ProductID } });
            if (product && Number(product.Stock) <= Number(product.MinimumStock)) {
                await this.notificationService.notify({
                    title: Number(product.Stock) <= 0 ? 'Stok Habis' : 'Stok Menipis',
                    message: `${product.Name} (${product.Code}) sisa stok ${Number(product.Stock)}`,
                    typeCode: 'STOCK',
                    referenceType: 'Product',
                    referenceId: product.ID,
                });
            }
        }
        return this.serialize(sale);
    }
    async update(id, dto, userId) {
        const sale = await this.prisma.sale.findUnique({
            where: { ID: id },
            include: { PaymentStatus: true },
        });
        if (!sale)
            throw new common_1.NotFoundException('Sale not found');
        const statusCode = sale.PaymentStatus?.Code?.toUpperCase();
        if (statusCode === 'PAID' || statusCode === 'CANCELLED') {
            throw new common_1.BadRequestException('Penjualan yang sudah lunas atau dibatalkan tidak dapat diubah');
        }
        const updateData = {};
        if (dto.CustomerID !== undefined)
            updateData.CustomerID = dto.CustomerID;
        if (dto.SalesPersonID !== undefined)
            updateData.SalesPersonID = dto.SalesPersonID;
        if (dto.SalePointID !== undefined)
            updateData.SalePointID = dto.SalePointID;
        if (dto.Date)
            updateData.Date = new Date(dto.Date);
        if (dto.DueDate !== undefined)
            updateData.DueDate = dto.DueDate ? new Date(dto.DueDate) : null;
        if (dto.DiscountPercent !== undefined)
            updateData.DiscountPercent = new client_1.Prisma.Decimal(dto.DiscountPercent);
        if (dto.DiscountAmount !== undefined)
            updateData.DiscountAmount = new client_1.Prisma.Decimal(dto.DiscountAmount);
        if (dto.TaxPercent !== undefined)
            updateData.TaxPercent = new client_1.Prisma.Decimal(dto.TaxPercent);
        if (dto.PaymentMethodID !== undefined)
            updateData.PaymentMethodID = dto.PaymentMethodID;
        if (dto.Notes !== undefined)
            updateData.Notes = dto.Notes;
        const updated = await this.prisma.$transaction(async (tx) => {
            if (dto.WarehouseID !== undefined && dto.WarehouseID !== null) {
                const newWh = await this.ledger.resolveWarehouseId(tx, dto.WarehouseID);
                if (newWh !== sale.WarehouseID) {
                    await this.ledger.relocateRef(tx, ['SALE'], id, newWh, { refCode: sale.Code, userId });
                    updateData.WarehouseID = newWh;
                }
            }
            const u = await tx.sale.update({ where: { ID: id }, data: updateData });
            await this.journal.postSale(tx, id, userId);
            await this.party.recalcCustomer(tx, u.CustomerID);
            if (u.CustomerID !== sale.CustomerID)
                await this.party.recalcCustomer(tx, sale.CustomerID);
            return tx.sale.findUniqueOrThrow({
                where: { ID: id },
                include: {
                    Customer: true,
                    SalesPerson: true,
                    SalePoint: true,
                    Warehouse: true,
                    SaleItems: { include: { Product: true, Unit: true } },
                },
            });
        }, { timeout: 30000 });
        await this.afterWrite();
        return this.serialize(updated);
    }
    async updateShipping(id, dto) {
        const sale = await this.prisma.sale.findUnique({ where: { ID: id } });
        if (!sale)
            throw new common_1.NotFoundException('Sale not found');
        const updateData = {};
        if (dto.ShippingStatus !== undefined)
            updateData.ShippingStatus = dto.ShippingStatus;
        if (dto.ShippingDate !== undefined)
            updateData.ShippingDate = dto.ShippingDate ? new Date(dto.ShippingDate) : null;
        if (dto.TrackingNumber !== undefined)
            updateData.TrackingNumber = dto.TrackingNumber;
        const updated = await this.prisma.sale.update({
            where: { ID: id },
            data: updateData,
            include: { Customer: true },
        });
        return this.serialize(updated);
    }
    async payment(id, dto, userId) {
        const sale = await this.prisma.sale.findUnique({
            where: { ID: id },
            include: { SalePayments: true, PaymentStatus: true },
        });
        if (!sale)
            throw new common_1.NotFoundException('Sale not found');
        const statusCode = sale.PaymentStatus?.Code?.toUpperCase();
        if (statusCode === 'CANCELLED') {
            throw new common_1.BadRequestException('Tidak dapat menambah pembayaran pada penjualan yang dibatalkan');
        }
        if (!(dto.Amount > 0))
            throw new common_1.BadRequestException('Jumlah pembayaran harus lebih dari 0');
        const outstanding = await this.party.saleOutstanding(this.prisma, id);
        const open = outstanding ? r2(outstanding.total - outstanding.returns - outstanding.committed) : 0;
        if (dto.Amount > open + 0.005) {
            throw new common_1.BadRequestException(`Jumlah pembayaran (${idr(dto.Amount)}) melebihi sisa tagihan (${idr(Math.max(open, 0))})`);
        }
        const currentPaid = sale.SalePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
        const paymentMethodId = dto.PaymentMethodID ?? sale.PaymentMethodID ?? (await this.getCashMethodId(this.prisma));
        if (!paymentMethodId)
            throw new common_1.BadRequestException('Metode pembayaran wajib diisi');
        await this.prisma.$transaction(async (tx) => {
            const p = await tx.salePayment.create({
                data: {
                    SaleID: id,
                    MethodID: paymentMethodId,
                    Amount: new client_1.Prisma.Decimal(dto.Amount),
                    ReferenceNumber: dto.ReferenceNumber,
                    Notes: dto.Notes,
                    CreatedByID: userId,
                },
            });
            await tx.sale.update({ where: { ID: id }, data: { PaymentMethodID: paymentMethodId } });
            const after = await this.party.recalcSale(tx, id);
            await this.journal.postSalePayment(tx, p.ID, userId);
            await this.party.recalcCustomer(tx, sale.CustomerID);
            if (after && after.remaining <= 0.005 && currentPaid === 0) {
                await this.addPoints(tx, sale.CustomerID, id, Number(sale.Total));
            }
        });
        await this.afterWrite();
        return this.findOne(id, {});
    }
    async updateStatus(id, dto, userId) {
        const sale = await this.prisma.sale.findUnique({
            where: { ID: id },
            include: { PaymentStatus: true, SaleReturns: { include: { Status: true } } },
        });
        if (!sale)
            throw new common_1.NotFoundException('Sale not found');
        const currentStatus = sale.PaymentStatus?.Code?.toUpperCase() || 'PENDING';
        const newStatus = dto.PaymentStatusCode.toUpperCase();
        const validTransitions = {
            PENDING: ['PARTIAL', 'PAID', 'CANCELLED'],
            PARTIAL: ['PAID', 'CANCELLED'],
            INSTALMENT: ['PARTIAL', 'PAID', 'CANCELLED'],
        };
        const allowed = validTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`Status tidak dapat diubah dari '${currentStatus}' ke '${newStatus}'`);
        }
        if (newStatus === 'CANCELLED' && sale.SaleReturns.some((r) => r.Status?.Code?.toUpperCase() !== 'CANCELLED')) {
            throw new common_1.BadRequestException('Penjualan memiliki retur aktif. Batalkan returnya terlebih dahulu.');
        }
        const newPaymentStatus = await this.getPaymentStatusByCode(this.prisma, newStatus);
        const updated = await this.prisma.$transaction(async (tx) => {
            if (newStatus === 'CANCELLED') {
                await this.ledger.reverseRef(tx, ['SALE'], id, { refCode: sale.Code, userId, notes: `Pembatalan penjualan ${sale.Code}` });
                await this.releaseVoucher(tx, sale.VoucherID);
                await this.journal.reverseSale(tx, id);
            }
            const u = await tx.sale.update({
                where: { ID: id },
                data: { PaymentStatusID: newPaymentStatus.ID },
                include: {
                    Customer: true,
                    SalesPerson: true,
                    SaleItems: { include: { Product: true, Unit: true } },
                },
            });
            await this.party.recalcCustomer(tx, sale.CustomerID);
            return u;
        }, { timeout: 30000 });
        await this.afterWrite();
        return this.serialize(updated);
    }
    async cancel(id, userId) {
        return this.updateStatus(id, { PaymentStatusCode: 'CANCELLED' }, userId);
    }
    async delete(id, userId) {
        const sale = await this.prisma.sale.findUnique({
            where: { ID: id },
            include: { SalePayments: true, SaleReturns: true, SaleItems: true, PaymentStatus: true },
        });
        if (!sale)
            throw new common_1.NotFoundException('Sale not found');
        if (sale.SalePayments && sale.SalePayments.length > 0) {
            throw new common_1.BadRequestException('Penjualan yang sudah memiliki pembayaran tidak dapat dihapus (batalkan saja)');
        }
        if (sale.SaleReturns && sale.SaleReturns.length > 0) {
            throw new common_1.BadRequestException('Penjualan yang sudah memiliki retur tidak dapat dihapus');
        }
        const statusCode = sale.PaymentStatus?.Code?.toUpperCase();
        if (statusCode && statusCode !== 'PENDING' && statusCode !== 'CANCELLED') {
            throw new common_1.BadRequestException('Hanya penjualan berstatus PENDING atau CANCELLED yang dapat dihapus');
        }
        await this.prisma.$transaction(async (tx) => {
            await this.ledger.reverseRef(tx, ['SALE'], id, { refCode: sale.Code, userId, notes: `Hapus penjualan ${sale.Code}` });
            if (statusCode !== 'CANCELLED')
                await this.releaseVoucher(tx, sale.VoucherID);
            await this.journal.reverseSale(tx, id);
            await tx.sale.delete({ where: { ID: id } });
            await this.party.recalcCustomer(tx, sale.CustomerID);
        }, { timeout: 30000 });
        await this.afterWrite();
        return { id };
    }
    async claimVoucher(tx, voucherId, voucherCode, base) {
        const v = await tx.voucher.findFirst({
            where: voucherId ? { ID: voucherId } : { Code: { equals: String(voucherCode).trim(), mode: 'insensitive' } },
            include: { Type: true },
        });
        if (!v)
            throw new common_1.BadRequestException('Voucher tidak ditemukan');
        if (!v.IsActive)
            throw new common_1.BadRequestException(`Voucher ${v.Code} tidak aktif`);
        const now = new Date();
        if (now < v.StartDate)
            throw new common_1.BadRequestException(`Voucher ${v.Code} belum berlaku`);
        const end = new Date(v.EndDate);
        if (end.getUTCHours() === 0 && end.getUTCMinutes() === 0 && end.getUTCSeconds() === 0)
            end.setUTCDate(end.getUTCDate() + 1);
        if (now >= end)
            throw new common_1.BadRequestException(`Voucher ${v.Code} sudah kedaluwarsa`);
        if (v.UsageLimit !== null && v.UsedCount >= v.UsageLimit)
            throw new common_1.BadRequestException(`Kuota voucher ${v.Code} sudah habis`);
        const minPurchase = Number(v.MinPurchaseAmount ?? 0);
        if (base < minPurchase)
            throw new common_1.BadRequestException(`Voucher ${v.Code} berlaku untuk minimal belanja ${idr(minPurchase)}`);
        const typeCode = (v.Type?.Code ?? '').toUpperCase();
        const value = Number(v.Value);
        let discount = typeCode.startsWith('PERC') ? (base * value) / 100 : value;
        const maxDisc = Number(v.MaxDiscountAmount ?? 0);
        if (typeCode.startsWith('PERC') && maxDisc > 0)
            discount = Math.min(discount, maxDisc);
        discount = r2(Math.max(0, Math.min(discount, base)));
        const claimed = await tx.$executeRaw `UPDATE "Vouchers" SET "UsedCount" = "UsedCount" + 1, "UpdatedAt" = NOW()
      WHERE "ID" = ${v.ID} AND ("UsageLimit" IS NULL OR "UsedCount" < "UsageLimit")`;
        if (claimed === 0)
            throw new common_1.BadRequestException(`Kuota voucher ${v.Code} sudah habis`);
        return { id: v.ID, discount };
    }
    async releaseVoucher(tx, voucherId) {
        if (!voucherId)
            return;
        await tx.$executeRaw `UPDATE "Vouchers" SET "UsedCount" = GREATEST("UsedCount" - 1, 0), "UpdatedAt" = NOW() WHERE "ID" = ${voucherId}`;
    }
    async afterWrite() {
        await Promise.all([
            this.ledger.invalidateCaches(),
            this.redis.invalidatePattern('sales:*'),
            this.redis.invalidatePattern('customer:*'),
            this.redis.invalidatePattern('voucher:*'),
        ]);
    }
    async addPoints(tx, customerId, saleId, totalAmount) {
        const setting = await tx.pointSetting.findFirst({ where: { IsActive: true } });
        if (!setting)
            return;
        const minimumTransaction = Number(setting.MinimumTransaction);
        if (totalAmount < minimumTransaction)
            return;
        const pointsPerRupiah = Number(setting.PointsPerRupiah);
        const points = Math.floor(totalAmount * pointsPerRupiah);
        if (points <= 0)
            return;
        await tx.customer.update({
            where: { ID: customerId },
            data: { PointBalance: { increment: points } },
        });
    }
    async getCashMethodId(client) {
        const cashMethod = await client.paymentMethod.findUnique({ where: { Code: 'CASH' } });
        return cashMethod?.ID;
    }
    async getPaymentStatusByCode(client, code) {
        const status = await client.paymentStatus.findUnique({ where: { Code: code } });
        if (!status)
            throw new common_1.BadRequestException(`Payment status '${code}' tidak ditemukan`);
        return status;
    }
    async generateCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `SA-${year}${month}`;
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
        if (data.SaleItems && Array.isArray(data.SaleItems)) {
            result.SaleItems = data.SaleItems.map((item) => this.serialize(item));
        }
        return result;
    }
};
exports.SaleService = SaleService;
exports.SaleService = SaleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService,
        notification_service_1.NotificationService,
        stock_ledger_service_1.StockLedgerService,
        party_balance_service_1.PartyBalanceService,
        auto_journal_service_1.AutoJournalService])
], SaleService);
