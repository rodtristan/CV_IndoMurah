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
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
const STATUS_CODE_MAP = {
    PENDING: 'DRAFT',
    APPROVED: 'CONFIRMED',
    RECEIVED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};
let PurchaseOrderService = class PurchaseOrderService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPurchaseOrder(dto, UserId) {
        const Supplier = await this.prisma.supplier.findUnique({
            where: { ID: dto.SupplierId },
        });
        if (!Supplier) {
            throw new common_1.NotFoundException(`Supplier ${dto.SupplierId} not found`);
        }
        const code = await this.generatePONumber();
        const draftStatus = await this.getStatusByCode('DRAFT');
        const pendingPaymentStatus = await this.getPaymentStatusByCode('PENDING');
        const paidPaymentStatus = await this.getPaymentStatusByCode('PAID');
        let subTotal = 0;
        let TotalDiscount = 0;
        let TotalTax = 0;
        const itemsWithCalculations = [];
        for (const item of dto.Items) {
            const Product = await this.prisma.product.findUnique({
                where: { ID: item.ProductId },
            });
            if (!Product) {
                throw new common_1.NotFoundException(`Product ${item.ProductId} not found`);
            }
            const itemSubTotal = item.Price * item.Quantity;
            const discountAmount = (itemSubTotal * (item.DiscountPercent || 0)) / 100;
            const afterDiscount = itemSubTotal - discountAmount;
            const taxAmount = (afterDiscount * (item.TaxPercent || 0)) / 100;
            const itemTotal = afterDiscount + taxAmount;
            subTotal += itemSubTotal;
            TotalDiscount += discountAmount;
            TotalTax += taxAmount;
            itemsWithCalculations.push({
                ProductId: item.ProductId,
                ProductName: Product.Name,
                WarehouseId: item.WarehouseId || dto.WarehouseId,
                UnitId: item.UnitId || Product.UnitID,
                Quantity: item.Quantity,
                Price: item.Price,
                discountPercent: item.DiscountPercent || 0,
                discountAmount,
                taxPercent: item.TaxPercent || 0,
                taxAmount,
                subTotal: itemTotal,
                Notes: item.Notes,
            });
        }
        const TotalAmount = subTotal - TotalDiscount + TotalTax;
        const downPayment = dto.DownPayment || 0;
        const remainingAmount = TotalAmount - downPayment;
        const PurchaseOrder = await this.prisma.$transaction(async (tx) => {
            const newPO = await tx.purchaseOrder.create({
                data: {
                    Code: code,
                    SupplierID: dto.SupplierId,
                    WarehouseID: dto.WarehouseId,
                    Date: dto.OrderDate ? new Date(dto.OrderDate) : new Date(),
                    DueDate: dto.ExpectedDate ? new Date(dto.ExpectedDate) : null,
                    StatusID: draftStatus.ID,
                    Subtotal: new client_1.Prisma.Decimal(subTotal),
                    DiscountAmount: new client_1.Prisma.Decimal(TotalDiscount),
                    TaxAmount: new client_1.Prisma.Decimal(TotalTax),
                    Total: new client_1.Prisma.Decimal(TotalAmount),
                    DownPayment: new client_1.Prisma.Decimal(downPayment),
                    PaymentStatusID: remainingAmount <= 0 ? paidPaymentStatus.ID : pendingPaymentStatus.ID,
                    Notes: dto.Notes,
                    CreatedByID: UserId,
                },
            });
            await tx.purchaseOrderItem.createMany({
                data: itemsWithCalculations.map((item) => ({
                    PurchaseOrderID: newPO.ID,
                    ProductID: item.ProductId,
                    UnitID: item.UnitId,
                    Quantity: new client_1.Prisma.Decimal(item.Quantity),
                    UnitPrice: new client_1.Prisma.Decimal(item.Price),
                    DiscountPercent: new client_1.Prisma.Decimal(item.discountPercent || 0),
                    DiscountAmount: new client_1.Prisma.Decimal(item.discountAmount),
                    Subtotal: new client_1.Prisma.Decimal(item.subTotal),
                })),
            });
            return newPO;
        });
        return {
            success: true,
            PurchaseOrder: {
                ID: PurchaseOrder.ID,
                poNumber: PurchaseOrder.Code,
                SupplierId: PurchaseOrder.SupplierID,
                SupplierName: Supplier.Name,
                WarehouseId: PurchaseOrder.WarehouseID,
                OrderDate: PurchaseOrder.Date,
                expectedDate: PurchaseOrder.DueDate,
                Status: 'PENDING',
                subTotal,
                TotalDiscount,
                taxAmount: TotalTax,
                TotalAmount,
                downPayment,
                remainingAmount,
                PaymentStatus: remainingAmount <= 0 ? 'PAID' : 'PENDING',
                itemCount: dto.Items.length,
                items: itemsWithCalculations,
            },
        };
    }
    async getPurchaseOrder(ID) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { ID: ID },
            include: {
                Supplier: true,
                Warehouse: true,
                Status: true,
                PaymentStatus: true,
                PurchaseOrderItems: {
                    include: {
                        Product: true,
                        Unit: true,
                    },
                },
            },
        });
        if (!po) {
            throw new common_1.NotFoundException(`Purchase Order ${ID} not found`);
        }
        return {
            ID: po.ID,
            poNumber: po.Code,
            SupplierId: po.SupplierID,
            SupplierName: po.Supplier?.Name,
            WarehouseId: po.WarehouseID,
            WarehouseName: po.Warehouse?.Name,
            OrderDate: po.Date,
            expectedDate: po.DueDate,
            Status: po.Status?.Code,
            subTotal: (0, number_1.number)(po.Subtotal),
            TotalDiscount: (0, number_1.number)(po.DiscountAmount),
            taxAmount: (0, number_1.number)(po.TaxAmount),
            TotalAmount: (0, number_1.number)(po.Total),
            downPayment: (0, number_1.number)(po.DownPayment),
            remainingAmount: (0, number_1.number)(po.Total) - (0, number_1.number)(po.DownPayment),
            PaymentStatus: po.PaymentStatus?.Code,
            Notes: po.Notes,
            createdBy: po.CreatedByID,
            approvedBy: null,
            createdAt: po.CreatedAt,
            items: po.PurchaseOrderItems.map((item) => ({
                ID: item.ID,
                ProductId: item.ProductID,
                ProductName: item.Product?.Name,
                ProductCode: item.Product?.Code,
                UnitId: item.UnitID,
                UnitName: item.Unit?.Name,
                Quantity: (0, number_1.number)(item.Quantity),
                Price: (0, number_1.number)(item.UnitPrice),
                discountPercent: (0, number_1.number)(item.DiscountPercent),
                discountAmount: (0, number_1.number)(item.DiscountAmount),
                subTotal: (0, number_1.number)(item.Subtotal),
            })),
        };
    }
    async listPurchaseOrders(dto) {
        const where = {};
        if (dto.SupplierId) {
            where.SupplierID = dto.SupplierId;
        }
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        if (dto.Status) {
            const mappedCode = STATUS_CODE_MAP[dto.Status.toUpperCase()] || dto.Status.toUpperCase();
            const status = await this.prisma.transactionStatus.findUnique({ where: { Code: mappedCode } });
            where.StatusID = status?.ID ?? -1;
        }
        if (dto.PaymentStatus) {
            const paymentStatus = await this.prisma.paymentStatus.findUnique({
                where: { Code: dto.PaymentStatus.toUpperCase() },
            });
            where.PaymentStatusID = paymentStatus?.ID ?? -1;
        }
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.Date.lte = new Date(dto.EndDate);
            }
        }
        const Orders = await this.prisma.purchaseOrder.findMany({
            where,
            include: {
                Supplier: { select: { ID: true, Name: true } },
                Warehouse: { select: { ID: true, Name: true } },
                Status: true,
                PaymentStatus: true,
                PurchaseOrderItems: true,
            },
            orderBy: { Date: 'desc' },
        });
        return Orders.map((po) => ({
            ID: po.ID,
            poNumber: po.Code,
            SupplierId: po.SupplierID,
            SupplierName: po.Supplier?.Name,
            WarehouseId: po.WarehouseID,
            WarehouseName: po.Warehouse?.Name,
            OrderDate: po.Date,
            expectedDate: po.DueDate,
            Status: po.Status?.Code,
            TotalAmount: (0, number_1.number)(po.Total),
            downPayment: (0, number_1.number)(po.DownPayment),
            remainingAmount: (0, number_1.number)(po.Total) - (0, number_1.number)(po.DownPayment),
            PaymentStatus: po.PaymentStatus?.Code,
            itemCount: po.PurchaseOrderItems.length,
            createdAt: po.CreatedAt,
        }));
    }
    async approvePurchaseOrder(ID, _UserId) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { ID: ID },
            include: { Status: true },
        });
        if (!po) {
            throw new common_1.NotFoundException(`PO ${ID} not found`);
        }
        if (po.Status?.Code !== 'DRAFT') {
            throw new common_1.BadRequestException('Only pending Orders can be approved');
        }
        const confirmedStatus = await this.getStatusByCode('CONFIRMED');
        const updated = await this.prisma.purchaseOrder.update({
            where: { ID: ID },
            data: {
                StatusID: confirmedStatus.ID,
            },
            include: { Status: true },
        });
        return {
            success: true,
            poNumber: updated.Code,
            Status: updated.Status?.Code,
            message: 'Purchase Order approved',
        };
    }
    async cancelPurchaseOrder(ID, _UserId, reason) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { ID: ID },
            include: { Status: true },
        });
        if (!po) {
            throw new common_1.NotFoundException(`PO ${ID} not found`);
        }
        if (po.Status?.Code === 'COMPLETED' || po.Status?.Code === 'CANCELLED') {
            throw new common_1.BadRequestException('Cannot cancel received or already cancelled Orders');
        }
        const cancelledStatus = await this.getStatusByCode('CANCELLED');
        const updated = await this.prisma.purchaseOrder.update({
            where: { ID: ID },
            data: {
                StatusID: cancelledStatus.ID,
                Notes: reason ? `${po.Notes || ''}\nCancelled: ${reason}` : po.Notes,
            },
            include: { Status: true },
        });
        return {
            success: true,
            poNumber: updated.Code,
            Status: updated.Status?.Code,
            message: 'Purchase Order cancelled',
        };
    }
    async recordDelivery(ID, deliveredItems, _UserId) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { ID: ID },
            include: { PurchaseOrderItems: true, Status: true },
        });
        if (!po) {
            throw new common_1.NotFoundException(`PO ${ID} not found`);
        }
        if (po.Status?.Code === 'CANCELLED') {
            throw new common_1.BadRequestException('Cannot deliver to cancelled Order');
        }
        const allReceived = po.PurchaseOrderItems.every((item) => {
            const delivery = deliveredItems.find((d) => d.itemId === item.ID);
            return delivery && delivery.quantity >= Number(item.Quantity);
        });
        if (allReceived) {
            const completedStatus = await this.getStatusByCode('COMPLETED');
            await this.prisma.purchaseOrder.update({
                where: { ID: ID },
                data: { StatusID: completedStatus.ID },
            });
        }
        return {
            success: true,
            Status: allReceived ? 'RECEIVED' : 'PARTIAL',
            message: allReceived ? 'Full delivery Recorded' : 'Partial delivery Recorded',
        };
    }
    async getStatusByCode(code) {
        const status = await this.prisma.transactionStatus.findUnique({ where: { Code: code } });
        if (!status)
            throw new common_1.BadRequestException(`Status '${code}' tidak ditemukan`);
        return status;
    }
    async getPaymentStatusByCode(code) {
        const status = await this.prisma.paymentStatus.findUnique({ where: { Code: code } });
        if (!status)
            throw new common_1.BadRequestException(`Payment status '${code}' tidak ditemukan`);
        return status;
    }
    async generatePONumber() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `PO-${year}${month}`;
        const lastPO = await this.prisma.purchaseOrder.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastPO) {
            const lastSeq = parseInt(lastPO.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.PurchaseOrderService = PurchaseOrderService;
exports.PurchaseOrderService = PurchaseOrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseOrderService);
