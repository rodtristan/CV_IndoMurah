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
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let PurchaseService = class PurchaseService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPurchaseOrder(dto, UserId) {
        const Supplier = await this.prisma.supplier.findUnique({
            where: { ID: dto.SupplierId },
        });
        if (!Supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
        const Code = await this.generatePOCode();
        let subTotal = 0;
        for (const item of dto.Items) {
            const Product = await this.prisma.product.findUnique({
                where: { ID: item.ProductId },
            });
            if (!Product) {
                throw new common_1.NotFoundException(`Product ${item.ProductId} not found`);
            }
            const itemPrice = item.UnitPrice || Number(Product.PurchasePrice);
            const itemDiscount = item.DiscountPercent || 0;
            const itemSubTotal = itemPrice * item.Quantity * (1 - itemDiscount / 100);
            subTotal += itemSubTotal;
        }
        const discountAmount = dto.DiscountPercent ? subTotal * (dto.DiscountPercent / 100) : 0;
        const afterDiscount = subTotal - discountAmount;
        const taxAmount = dto.TaxPercent ? afterDiscount * (dto.TaxPercent / 100) : 0;
        const Total = afterDiscount + taxAmount;
        const pendingStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'PENDING' },
        });
        const pendingStatusId = pendingStatus?.ID || 1;
        const PaymentStatus = await this.prisma.paymentStatus.findFirst({
            where: { Code: 'PENDING' },
        });
        const PaymentStatusId = PaymentStatus?.ID || 1;
        const PurchaseOrder = await this.prisma.purchaseOrder.create({
            data: {
                Code: Code,
                Date: dto.Date ? new Date(dto.Date) : new Date(),
                SupplierID: dto.SupplierId,
                WarehouseID: dto.WarehouseId || null,
                Subtotal: new client_1.Prisma.Decimal(subTotal),
                DiscountPercent: new client_1.Prisma.Decimal(dto.DiscountPercent || 0),
                DiscountAmount: new client_1.Prisma.Decimal(discountAmount),
                TaxPercent: new client_1.Prisma.Decimal(dto.TaxPercent || 0),
                TaxAmount: new client_1.Prisma.Decimal(taxAmount),
                Total: new client_1.Prisma.Decimal(Total),
                DownPayment: new client_1.Prisma.Decimal(dto.DownPayment || 0),
                DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
                PaymentStatusID: PaymentStatusId,
                StatusID: pendingStatusId,
                Notes: dto.Notes,
                CreatedByID: UserId,
                PurchaseOrderItems: {
                    create: await Promise.all(dto.Items.map(async (item) => {
                        const Product = await this.prisma.product.findUnique({
                            where: { ID: item.ProductId },
                            include: { Unit: true },
                        });
                        const UnitPrice = item.UnitPrice || Number(Product?.PurchasePrice || 0);
                        const itemDiscount = item.DiscountPercent || 0;
                        const itemSubTotal = UnitPrice * item.Quantity * (1 - itemDiscount / 100);
                        return {
                            ProductID: item.ProductId,
                            Quantity: new client_1.Prisma.Decimal(item.Quantity),
                            UnitID: item.UnitId,
                            UnitPrice: new client_1.Prisma.Decimal(UnitPrice),
                            DiscountPercent: new client_1.Prisma.Decimal(itemDiscount),
                            DiscountAmount: new client_1.Prisma.Decimal(0),
                            Subtotal: new client_1.Prisma.Decimal(itemSubTotal),
                        };
                    })),
                },
            },
            include: {
                Supplier: true,
                Warehouse: true,
                PurchaseOrderItems: {
                    include: { Product: true, Unit: true },
                },
            },
        });
        return {
            success: true,
            PurchaseOrder: {
                ID: PurchaseOrder.ID,
                Code: PurchaseOrder.Code,
                Date: PurchaseOrder.Date,
                Supplier: PurchaseOrder.Supplier.Name,
                Warehouse: PurchaseOrder.Warehouse?.Name || null,
                itemCount: PurchaseOrder.PurchaseOrderItems.length,
                subTotal,
                discountAmount,
                taxAmount,
                Total,
                Status: pendingStatus?.Name || 'Pending',
                items: PurchaseOrder.PurchaseOrderItems.map((item) => ({
                    ProductId: item.ProductID,
                    ProductName: item.Product.Name,
                    Quantity: (0, number_1.number)(item.Quantity),
                    Unit: item.Unit.Name,
                    UnitPrice: (0, number_1.number)(item.UnitPrice),
                    subTotal: (0, number_1.number)(item.Subtotal),
                })),
            },
        };
    }
    async getPurchaseOrder(PurchaseOrderId) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { ID: PurchaseOrderId },
            include: {
                Supplier: true,
                Warehouse: true,
                Status: true,
                PurchaseOrderItems: {
                    include: { Product: true, Unit: true },
                },
            },
        });
        if (!po) {
            throw new common_1.NotFoundException('Purchase Order not found');
        }
        return {
            ID: po.ID,
            Code: po.Code,
            Date: po.Date,
            Supplier: po.Supplier,
            Warehouse: po.Warehouse,
            subTotal: (0, number_1.number)(po.Subtotal),
            discountPercent: (0, number_1.number)(po.DiscountPercent),
            discountAmount: (0, number_1.number)(po.DiscountAmount),
            taxPercent: (0, number_1.number)(po.TaxPercent),
            taxAmount: (0, number_1.number)(po.TaxAmount),
            Total: (0, number_1.number)(po.Total),
            downPayment: (0, number_1.number)(po.DownPayment),
            dueDate: po.DueDate,
            Status: po.Status,
            Notes: po.Notes,
            items: po.PurchaseOrderItems.map((item) => ({
                ID: item.ID,
                ProductId: item.ProductID,
                ProductName: item.Product.Name,
                ProductCode: item.Product.Code,
                Quantity: (0, number_1.number)(item.Quantity),
                UnitId: item.UnitID,
                Unit: item.Unit.Name,
                UnitPrice: (0, number_1.number)(item.UnitPrice),
                discountPercent: (0, number_1.number)(item.DiscountPercent),
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
        if (dto.StatusId) {
            where.StatusID = dto.StatusId;
        }
        if (dto.PendingOnly) {
            where.Status = { IsTerminal: false };
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
                Supplier: true,
                Warehouse: true,
                Status: true,
                PurchaseOrderItems: true,
            },
            orderBy: { Date: 'desc' },
        });
        return Orders.map((po) => ({
            ID: po.ID,
            Code: po.Code,
            Date: po.Date,
            Supplier: po.Supplier.Name,
            Warehouse: po.Warehouse?.Name || null,
            itemCount: po.PurchaseOrderItems.length,
            subTotal: (0, number_1.number)(po.Subtotal),
            Total: (0, number_1.number)(po.Total),
            downPayment: (0, number_1.number)(po.DownPayment),
            Status: po.Status.Name,
            StatusColor: po.Status.Color,
        }));
    }
    async updatePurchaseOrder(PurchaseOrderId, dto, UserId) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { ID: PurchaseOrderId },
            include: { Status: true },
        });
        if (!po) {
            throw new common_1.NotFoundException('Purchase Order not found');
        }
        if (po.Status.IsTerminal) {
            throw new common_1.BadRequestException('Cannot update terminal Purchase Order');
        }
        const updated = await this.prisma.purchaseOrder.update({
            where: { ID: PurchaseOrderId },
            data: {
                DueDate: dto.DueDate ? new Date(dto.DueDate) : undefined,
                DownPayment: dto.DownPayment ? new client_1.Prisma.Decimal(dto.DownPayment) : undefined,
                DiscountPercent: dto.DiscountPercent ? new client_1.Prisma.Decimal(dto.DiscountPercent) : undefined,
                Notes: dto.Notes,
            },
        });
        return {
            success: true,
            PurchaseOrder: {
                ID: updated.ID,
                Code: updated.Code,
                dueDate: updated.DueDate,
                downPayment: (0, number_1.number)(updated.DownPayment),
            },
        };
    }
    async updatePurchaseOrderStatus(PurchaseOrderId, StatusCode, UserId) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { ID: PurchaseOrderId },
        });
        if (!po) {
            throw new common_1.NotFoundException('Purchase Order not found');
        }
        const newStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: StatusCode },
        });
        if (!newStatus) {
            throw new common_1.NotFoundException(`Status '${StatusCode}' not found`);
        }
        await this.prisma.purchaseOrder.update({
            where: { ID: PurchaseOrderId },
            data: { StatusID: newStatus.ID },
        });
        return {
            success: true,
            PurchaseOrderId,
            newStatus: newStatus.Name,
        };
    }
    async createPurchase(dto, UserId) {
        const Supplier = await this.prisma.supplier.findUnique({
            where: { ID: dto.SupplierId },
        });
        if (!Supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
        const Code = await this.generatePurchaseCode();
        let subTotal = 0;
        for (const item of dto.Items) {
            const itemDiscount = item.DiscountPercent || 0;
            const itemSubTotal = item.UnitPrice * item.Quantity * (1 - itemDiscount / 100);
            subTotal += itemSubTotal;
        }
        const discountAmount = dto.DiscountPercent ? subTotal * (dto.DiscountPercent / 100) : 0;
        const afterDiscount = subTotal - discountAmount;
        const taxAmount = dto.TaxPercent ? afterDiscount * (dto.TaxPercent / 100) : 0;
        const Total = afterDiscount + taxAmount;
        let PaymentStatusId = 1;
        let paid = 0;
        let remaining = Total;
        if (dto.PaymentAmount) {
            paid = Math.min(dto.PaymentAmount, Total);
            remaining = Total - paid;
            if (remaining <= 0) {
                const paidStatus = await this.prisma.paymentStatus.findFirst({ where: { Code: 'PAID' } });
                PaymentStatusId = paidStatus?.ID || 2;
            }
            else {
                const partialStatus = await this.prisma.paymentStatus.findFirst({ where: { Code: 'PARTIAL' } });
                PaymentStatusId = partialStatus?.ID || 3;
            }
        }
        const completedStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'COMPLETED' },
        });
        const Purchase = await this.prisma.$transaction(async (tx) => {
            const newPurchase = await tx.purchase.create({
                data: {
                    Code: Code,
                    Date: dto.Date ? new Date(dto.Date) : new Date(),
                    SupplierID: dto.SupplierId,
                    WarehouseID: dto.WarehouseId || null,
                    Subtotal: new client_1.Prisma.Decimal(subTotal),
                    DiscountPercent: new client_1.Prisma.Decimal(dto.DiscountPercent || 0),
                    DiscountAmount: new client_1.Prisma.Decimal(discountAmount),
                    TaxPercent: new client_1.Prisma.Decimal(dto.TaxPercent || 0),
                    TaxAmount: new client_1.Prisma.Decimal(taxAmount),
                    Total: new client_1.Prisma.Decimal(Total),
                    Paid: new client_1.Prisma.Decimal(paid),
                    Remaining: new client_1.Prisma.Decimal(remaining),
                    PaymentStatusID: PaymentStatusId,
                    PaymentMethodID: dto.PaymentMethodId || null,
                    DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
                    PurchaseOrderID: dto.PurchaseOrderId || null,
                    StatusID: completedStatus?.ID || 2,
                    Notes: dto.Notes,
                    CreatedByID: UserId,
                    PurchaseItems: {
                        create: dto.Items.map((item) => ({
                            ProductID: item.ProductId,
                            Quantity: new client_1.Prisma.Decimal(item.Quantity),
                            UnitID: item.UnitId,
                            UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice),
                            DiscountPercent: new client_1.Prisma.Decimal(item.DiscountPercent || 0),
                            DiscountAmount: new client_1.Prisma.Decimal(0),
                            Subtotal: new client_1.Prisma.Decimal(item.UnitPrice * item.Quantity * (1 - (item.DiscountPercent || 0) / 100)),
                        })),
                    },
                },
                include: {
                    Supplier: true,
                    Warehouse: true,
                    PurchaseItems: { include: { Product: true, Unit: true } },
                },
            });
            for (const item of dto.Items) {
                await tx.product.update({
                    where: { ID: item.ProductId },
                    data: { Stock: { increment: new client_1.Prisma.Decimal(item.Quantity) } },
                });
                if (dto.WarehouseId) {
                    await tx.productStock.upsert({
                        where: {
                            ProductID_WarehouseID: {
                                ProductID: item.ProductId,
                                WarehouseID: dto.WarehouseId,
                            },
                        },
                        create: {
                            ProductID: item.ProductId,
                            WarehouseID: dto.WarehouseId,
                            Quantity: new client_1.Prisma.Decimal(item.Quantity),
                        },
                        update: {
                            Quantity: { increment: new client_1.Prisma.Decimal(item.Quantity) },
                        },
                    });
                }
            }
            if (dto.PaymentAmount && dto.PaymentAmount > 0) {
                await tx.purchasePayment.create({
                    data: {
                        PurchaseID: newPurchase.ID,
                        MethodID: dto.PaymentMethodId || 1,
                        Amount: new client_1.Prisma.Decimal(paid),
                        ReferenceNumber: null,
                        Notes: dto.Notes,
                        CreatedByID: UserId,
                    },
                });
            }
            if (remaining > 0) {
                await tx.supplier.update({
                    where: { ID: dto.SupplierId },
                    data: { TotalDebt: { increment: new client_1.Prisma.Decimal(remaining) } },
                });
            }
            return newPurchase;
        });
        return {
            success: true,
            Purchase: {
                ID: Purchase.ID,
                Code: Purchase.Code,
                Date: Purchase.Date,
                Supplier: Purchase.Supplier.Name,
                Warehouse: Purchase.Warehouse?.Name || null,
                itemCount: Purchase.PurchaseItems.length,
                subTotal,
                discountAmount,
                taxAmount,
                Total,
                paid,
                remaining,
                PaymentStatus: PaymentStatusId === 2 ? 'PAID' : PaymentStatusId === 3 ? 'PARTIAL' : 'PENDING',
                items: Purchase.PurchaseItems.map((item) => ({
                    ProductId: item.ProductID,
                    ProductName: item.Product.Name,
                    Quantity: (0, number_1.number)(item.Quantity),
                    Unit: item.Unit.Name,
                    UnitPrice: (0, number_1.number)(item.UnitPrice),
                    subTotal: (0, number_1.number)(item.Subtotal),
                })),
            },
        };
    }
    async getPurchase(PurchaseId) {
        const Purchase = await this.prisma.purchase.findUnique({
            where: { ID: PurchaseId },
            include: {
                Supplier: true,
                Warehouse: true,
                PaymentStatus: true,
                Status: true,
                PurchaseItems: { include: { Product: true, Unit: true } },
                PurchasePayments: { include: { Method: true } },
            },
        });
        if (!Purchase) {
            throw new common_1.NotFoundException('Purchase not found');
        }
        return {
            ID: Purchase.ID,
            Code: Purchase.Code,
            Date: Purchase.Date,
            Supplier: Purchase.Supplier,
            Warehouse: Purchase.Warehouse,
            subTotal: (0, number_1.number)(Purchase.Subtotal),
            discountPercent: (0, number_1.number)(Purchase.DiscountPercent),
            discountAmount: (0, number_1.number)(Purchase.DiscountAmount),
            taxPercent: (0, number_1.number)(Purchase.TaxPercent),
            taxAmount: (0, number_1.number)(Purchase.TaxAmount),
            Total: (0, number_1.number)(Purchase.Total),
            Paid: (0, number_1.number)(Purchase.Paid),
            remaining: (0, number_1.number)(Purchase.Remaining),
            dueDate: Purchase.DueDate,
            PaymentStatus: Purchase.PaymentStatus,
            Status: Purchase.Status,
            Notes: Purchase.Notes,
            items: Purchase.PurchaseItems.map((item) => ({
                ID: item.ID,
                ProductId: item.ProductID,
                ProductName: item.Product.Name,
                ProductCode: item.Product.Code,
                Quantity: (0, number_1.number)(item.Quantity),
                UnitId: item.UnitID,
                Unit: item.Unit.Name,
                UnitPrice: (0, number_1.number)(item.UnitPrice),
                subTotal: (0, number_1.number)(item.Subtotal),
            })),
            Payments: Purchase.PurchasePayments.map((p) => ({
                ID: p.ID,
                Amount: (0, number_1.number)(p.Amount),
                Method: p.Method.Name,
                Date: p.CreatedAt,
                referenceNumber: p.ReferenceNumber,
            })),
        };
    }
    async listPurchases(dto) {
        const where = {};
        if (dto.SupplierId) {
            where.SupplierID = dto.SupplierId;
        }
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        if (dto.PaymentStatus) {
            where.PaymentStatus = { Code: dto.PaymentStatus };
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
        const Purchases = await this.prisma.purchase.findMany({
            where,
            include: {
                Supplier: true,
                Warehouse: true,
                PaymentStatus: true,
                Status: true,
                PurchaseItems: true,
            },
            orderBy: { Date: 'desc' },
        });
        return Purchases.map((p) => ({
            ID: p.ID,
            Code: p.Code,
            Date: p.Date,
            Supplier: p.Supplier.Name,
            Warehouse: p.Warehouse?.Name || null,
            itemCount: p.PurchaseItems.length,
            Total: (0, number_1.number)(p.Total),
            Paid: (0, number_1.number)(p.Paid),
            remaining: (0, number_1.number)(p.Remaining),
            PaymentStatus: p.PaymentStatus.Name,
            PaymentStatusColor: p.PaymentStatus.Color,
        }));
    }
    async RecordPurchasePayment(PurchaseId, dto, UserId) {
        const Purchase = await this.prisma.purchase.findUnique({
            where: { ID: PurchaseId },
            include: { Supplier: true, PurchasePayments: true },
        });
        if (!Purchase) {
            throw new common_1.NotFoundException('Purchase not found');
        }
        const currentPaid = Purchase.PurchasePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
        const remainingAmount = Number(Purchase.Total) - currentPaid;
        if (dto.Amount > remainingAmount) {
            throw new common_1.BadRequestException(`Payment exceeds remaining Amount. Remaining: ${remainingAmount}`);
        }
        const Result = await this.prisma.$transaction(async (tx) => {
            await tx.purchasePayment.create({
                data: {
                    PurchaseID: PurchaseId,
                    MethodID: dto.PaymentMethodId,
                    Amount: new client_1.Prisma.Decimal(dto.Amount),
                    ReferenceNumber: dto.ReferenceNumber,
                    Date: dto.PaymentDate ? new Date(dto.PaymentDate) : new Date(),
                    Notes: dto.Notes,
                    CreatedByID: UserId,
                },
            });
            const newPaid = currentPaid + dto.Amount;
            const newRemaining = Number(Purchase.Total) - newPaid;
            let newStatusId = Purchase.PaymentStatusID;
            if (newPaid >= Number(Purchase.Total)) {
                const paidStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PAID' } });
                if (paidStatus)
                    newStatusId = paidStatus.ID;
            }
            else if (newPaid > 0) {
                const partialStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PARTIAL' } });
                if (partialStatus)
                    newStatusId = partialStatus.ID;
            }
            await tx.purchase.update({
                where: { ID: PurchaseId },
                data: {
                    Paid: new client_1.Prisma.Decimal(newPaid),
                    Remaining: new client_1.Prisma.Decimal(newRemaining),
                    PaymentStatusID: newStatusId,
                },
            });
            if (newRemaining <= 0) {
                await tx.supplier.update({
                    where: { ID: Purchase.SupplierID },
                    data: { TotalDebt: { decrement: new client_1.Prisma.Decimal(dto.Amount) } },
                });
            }
            return { newPaid, newRemaining, newStatusId };
        });
        return {
            success: true,
            PurchaseId,
            PurchaseCode: Purchase.Code,
            previousPaid: currentPaid,
            PaymentAmount: dto.Amount,
            newPaid: Result.newPaid,
            remainingAmount: Result.newRemaining,
            Status: Result.newStatusId === 2 ? 'PAID' : 'PARTIAL',
        };
    }
    async RecordBulkPurchasePayment(dto, UserId) {
        const Supplier = await this.prisma.supplier.findUnique({
            where: { ID: dto.SupplierId },
        });
        if (!Supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
        const Purchases = await this.prisma.purchase.findMany({
            where: { ID: { in: dto.PurchaseIds }, SupplierID: dto.SupplierId },
            include: { PurchasePayments: true },
        });
        if (Purchases.length !== dto.PurchaseIds.length) {
            throw new common_1.NotFoundException('Some Purchases not found or do not belong to this Supplier');
        }
        const PurchasesWithRemaining = Purchases.map((Purchase) => {
            const paid = Purchase.PurchasePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
            const remaining = Number(Purchase.Total) - paid;
            return { ...Purchase, remaining };
        });
        const TotalRemaining = PurchasesWithRemaining.reduce((sum, s) => sum + s.remaining, 0);
        if (dto.Amount > TotalRemaining) {
            throw new common_1.BadRequestException(`Payment exceeds Total remaining Amount. Total remaining: ${TotalRemaining}`);
        }
        const Result = await this.prisma.$transaction(async (tx) => {
            let remainingPayment = dto.Amount;
            const PaymentResults = [];
            for (const Purchase of PurchasesWithRemaining.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())) {
                if (remainingPayment <= 0)
                    break;
                const PaymentForThisPurchase = Math.min(remainingPayment, Purchase.remaining);
                await tx.purchasePayment.create({
                    data: {
                        PurchaseID: Purchase.ID,
                        MethodID: dto.PaymentMethodId,
                        Amount: new client_1.Prisma.Decimal(PaymentForThisPurchase),
                        ReferenceNumber: dto.ReferenceNumber,
                        Notes: `Bulk Payment: ${dto.Notes || 'Multiple invoices'}`,
                        CreatedByID: UserId,
                    },
                });
                const newPaid = Purchase.PurchasePayments.reduce((sum, p) => sum + Number(p.Amount), 0) + PaymentForThisPurchase;
                const newRemaining = Purchase.remaining - PaymentForThisPurchase;
                let newStatusId = Purchase.PaymentStatusID;
                if (newRemaining <= 0) {
                    const paidStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PAID' } });
                    if (paidStatus)
                        newStatusId = paidStatus.ID;
                }
                else {
                    const partialStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PARTIAL' } });
                    if (partialStatus)
                        newStatusId = partialStatus.ID;
                }
                await tx.purchase.update({
                    where: { ID: Purchase.ID },
                    data: {
                        Paid: new client_1.Prisma.Decimal(newPaid),
                        Remaining: new client_1.Prisma.Decimal(newRemaining),
                        PaymentStatusID: newStatusId,
                    },
                });
                PaymentResults.push({
                    PurchaseId: Purchase.ID,
                    PurchaseCode: Purchase.Code,
                    Paid: PaymentForThisPurchase,
                    remaining: newRemaining,
                });
                remainingPayment -= PaymentForThisPurchase;
            }
            if (dto.Amount > remainingPayment) {
                const AmountApplied = dto.Amount - remainingPayment;
                await tx.supplier.update({
                    where: { ID: dto.SupplierId },
                    data: { TotalDebt: { decrement: new client_1.Prisma.Decimal(AmountApplied) } },
                });
            }
            return PaymentResults;
        });
        return {
            success: true,
            SupplierId: dto.SupplierId,
            SupplierName: Supplier.Name,
            TotalPayment: dto.Amount,
            Payments: Result,
            TotalApplied: Result.reduce((sum, p) => sum + p.Paid, 0),
        };
    }
    async createPurchaseReturn(dto, UserId) {
        const Purchase = await this.prisma.purchase.findUnique({
            where: { ID: dto.PurchaseId },
            include: { PurchaseItems: true, Supplier: true },
        });
        if (!Purchase) {
            throw new common_1.NotFoundException('Purchase not found');
        }
        for (const returnItem of dto.Items) {
            const PurchaseItem = Purchase.PurchaseItems.find((pi) => pi.ProductID === returnItem.ProductId);
            if (!PurchaseItem) {
                throw new common_1.BadRequestException(`Product ${returnItem.ProductId} not in original Purchase`);
            }
            const originalQty = Number(PurchaseItem.Quantity);
            if (returnItem.Quantity > originalQty) {
                throw new common_1.BadRequestException(`Return Quantity for Product ${returnItem.ProductId} exceeds original Quantity`);
            }
        }
        let TotalReturn = 0;
        for (const item of dto.Items) {
            const UnitPrice = item.UnitPrice || Number(Purchase.PurchaseItems.find((pi) => pi.ProductID === item.ProductId)?.UnitPrice || 0);
            TotalReturn += UnitPrice * item.Quantity;
        }
        const Code = await this.generateReturnCode();
        const pendingStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'PENDING' },
        });
        const PurchaseReturn = await this.prisma.$transaction(async (tx) => {
            const newReturn = await tx.purchaseReturn.create({
                data: {
                    Code: Code,
                    Date: dto.Date ? new Date(dto.Date) : new Date(),
                    PurchaseID: dto.PurchaseId,
                    SupplierID: Purchase.SupplierID,
                    WarehouseID: dto.WarehouseId || null,
                    TotalReturn: new client_1.Prisma.Decimal(TotalReturn),
                    Reason: dto.Reason,
                    StatusID: pendingStatus?.ID || 1,
                    CreatedByID: UserId,
                    ReturnItems: {
                        create: dto.Items.map((item) => {
                            const PurchaseItem = Purchase.PurchaseItems.find((pi) => pi.ProductID === item.ProductId);
                            return {
                                ProductID: item.ProductId,
                                Quantity: new client_1.Prisma.Decimal(item.Quantity),
                                UnitID: item.UnitId,
                                UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice || Number(PurchaseItem?.UnitPrice || 0)),
                                Subtotal: new client_1.Prisma.Decimal((item.UnitPrice || Number(PurchaseItem?.UnitPrice || 0)) * item.Quantity),
                            };
                        }),
                    },
                },
                include: {
                    Supplier: true,
                    ReturnItems: { include: { Product: true, Unit: true } },
                },
            });
            for (const item of dto.Items) {
                await tx.product.update({
                    where: { ID: item.ProductId },
                    data: { Stock: { decrement: new client_1.Prisma.Decimal(item.Quantity) } },
                });
                if (dto.WarehouseId) {
                    await tx.productStock.update({
                        where: {
                            ProductID_WarehouseID: {
                                ProductID: item.ProductId,
                                WarehouseID: dto.WarehouseId,
                            },
                        },
                        data: { Quantity: { decrement: new client_1.Prisma.Decimal(item.Quantity) } },
                    });
                }
            }
            return newReturn;
        });
        return {
            success: true,
            PurchaseReturn: {
                ID: PurchaseReturn.ID,
                Code: PurchaseReturn.Code,
                Date: PurchaseReturn.Date,
                Supplier: PurchaseReturn.Supplier.Name,
                reason: PurchaseReturn.Reason,
                TotalReturn,
                Status: pendingStatus?.Name || 'Pending',
                items: PurchaseReturn.ReturnItems.map((item) => ({
                    ProductId: item.ProductID,
                    ProductName: item.Product.Name,
                    Quantity: (0, number_1.number)(item.Quantity),
                    Unit: item.Unit?.Name,
                    UnitPrice: (0, number_1.number)(item.UnitPrice),
                    subTotal: (0, number_1.number)(item.Subtotal),
                })),
            },
        };
    }
    async approvePurchaseReturn(returnId, UserId) {
        const PurchaseReturn = await this.prisma.purchaseReturn.findUnique({
            where: { ID: returnId },
            include: { Supplier: true },
        });
        if (!PurchaseReturn) {
            throw new common_1.NotFoundException('Purchase return not found');
        }
        const completedStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'COMPLETED' },
        });
        await this.prisma.$transaction(async (tx) => {
            await tx.purchaseReturn.update({
                where: { ID: returnId },
                data: { StatusID: completedStatus?.ID || 2 },
            });
            await tx.supplier.update({
                where: { ID: PurchaseReturn.SupplierID },
                data: { TotalDebt: { decrement: new client_1.Prisma.Decimal(PurchaseReturn.TotalReturn) } },
            });
        });
        return {
            success: true,
            PurchaseReturnId: returnId,
            Code: PurchaseReturn.Code,
            TotalReturn: (0, number_1.number)(PurchaseReturn.TotalReturn),
            Status: 'COMPLETED',
        };
    }
    async getSupplierDebtSummary(SupplierId) {
        const Supplier = await this.prisma.supplier.findUnique({
            where: { ID: SupplierId },
            include: {
                Purchases: {
                    include: { PaymentStatus: true },
                },
            },
        });
        if (!Supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
        const unpaidPurchases = Supplier.Purchases.filter((p) => p.PaymentStatus.Code !== 'PAID');
        const TotalDebt = unpaidPurchases.reduce((sum, p) => sum + Number(p.Remaining), 0);
        const PurchaseCount = unpaidPurchases.length;
        return {
            SupplierId,
            SupplierName: Supplier.Name,
            SupplierCode: Supplier.Code,
            TotalDebt,
            PurchaseCount,
            unpaidPurchases: unpaidPurchases.map((p) => ({
                ID: p.ID,
                Code: p.Code,
                Date: p.Date,
                Total: (0, number_1.number)(p.Total),
                Paid: (0, number_1.number)(p.Paid),
                remaining: (0, number_1.number)(p.Remaining),
                dueDate: p.DueDate,
                Status: p.PaymentStatus.Name,
            })),
        };
    }
    async addSupplierDeposit(SupplierId, dto, UserId) {
        const Supplier = await this.prisma.supplier.findUnique({
            where: { ID: SupplierId },
        });
        if (!Supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
        const Code = await this.generateSupplierDepositCode();
        const Deposit = await this.prisma.$transaction(async (tx) => {
            const newDeposit = await tx.supplierDeposit.create({
                data: {
                    Code: Code,
                    Date: new Date(),
                    SupplierID: SupplierId,
                    Amount: new client_1.Prisma.Decimal(dto.Amount),
                    RemainingAmount: new client_1.Prisma.Decimal(dto.Amount),
                    Description: dto.Notes,
                    CreatedByID: UserId,
                },
            });
            return newDeposit;
        });
        return {
            success: true,
            Deposit: {
                ID: Deposit.ID,
                Code: Deposit.Code,
                Amount: (0, number_1.number)(Deposit.Amount),
                remainingAmount: (0, number_1.number)(Deposit.RemainingAmount),
                Date: Deposit.Date,
            },
        };
    }
    async useSupplierDeposit(SupplierId, PurchaseId, Amount, UserId) {
        const Supplier = await this.prisma.supplier.findUnique({
            where: { ID: SupplierId },
            include: {
                SupplierDeposits: {
                    where: { RemainingAmount: { gt: 0 } },
                    orderBy: { Date: 'asc' },
                },
            },
        });
        if (!Supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
        const TotalAvailable = Supplier.SupplierDeposits.reduce((sum, d) => sum + Number(d.RemainingAmount), 0);
        if (Amount > TotalAvailable) {
            throw new common_1.BadRequestException(`Insufficient Deposit. Available: ${TotalAvailable}, Requested: ${Amount}`);
        }
        const Result = await this.prisma.$transaction(async (tx) => {
            let remainingAmount = Amount;
            const usedDeposits = [];
            for (const Deposit of Supplier.SupplierDeposits) {
                if (remainingAmount <= 0)
                    break;
                const usedFromThis = Math.min(remainingAmount, Number(Deposit.RemainingAmount));
                await tx.supplierDeposit.update({
                    where: { ID: Deposit.ID },
                    data: { RemainingAmount: { decrement: new client_1.Prisma.Decimal(usedFromThis) } },
                });
                usedDeposits.push({
                    DepositId: Deposit.ID,
                    DepositCode: Deposit.Code,
                    used: usedFromThis,
                });
                remainingAmount -= usedFromThis;
            }
            await tx.purchasePayment.create({
                data: {
                    PurchaseID: PurchaseId,
                    MethodID: 1,
                    Amount: new client_1.Prisma.Decimal(Amount),
                    ReferenceNumber: `SUP-DEP-${Supplier.Code}`,
                    Notes: 'Payment from Supplier Deposit',
                    CreatedByID: UserId,
                },
            });
            return usedDeposits;
        });
        return {
            success: true,
            SupplierId,
            PurchaseId,
            TotalUsed: Amount,
            Deposits: Result,
        };
    }
    async generatePOCode() {
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
    async generatePurchaseCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `BELI-${year}${month}`;
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
    async generateReturnCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `RET-BELI-${year}${month}`;
        const lastReturn = await this.prisma.purchaseReturn.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastReturn) {
            const lastSeq = parseInt(lastReturn.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    async generateSupplierDepositCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `SUP-DEP-${year}${month}`;
        const lastDeposit = await this.prisma.supplierDeposit.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastDeposit) {
            const lastSeq = parseInt(lastDeposit.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.PurchaseService = PurchaseService;
exports.PurchaseService = PurchaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseService);
