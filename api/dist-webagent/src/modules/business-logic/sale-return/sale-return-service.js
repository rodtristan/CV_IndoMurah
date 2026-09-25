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
exports.SaleReturnService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let SaleReturnService = class SaleReturnService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async lookupSales(dto) {
        const where = {
            IsReturn: false,
        };
        if (dto.Search) {
            where.OR = [
                { Code: { contains: dto.Search, mode: 'insensitive' } },
                { Customer: { Name: { contains: dto.Search, mode: 'insensitive' } } },
            ];
        }
        if (dto.CustomerId) {
            where.CustomerID = dto.CustomerId;
        }
        if (dto.SalesPersonId) {
            where.SalesPersonID = dto.SalesPersonId;
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
        where.PaymentStatus = {
            Code: { in: ['PAID', 'PARTIAL'] },
        };
        const Sales = await this.prisma.sale.findMany({
            where,
            include: {
                Customer: true,
                SalesPerson: true,
                PaymentStatus: true,
                SaleItems: {
                    include: {
                        Product: { include: { Unit: true } },
                        Unit: true,
                    },
                },
            },
            orderBy: { Date: 'desc' },
            take: 50,
        });
        return Sales.map((Sale) => ({
            ID: Sale.ID,
            Code: Sale.Code,
            Date: Sale.Date,
            Customer: {
                ID: Sale.Customer.ID,
                Name: Sale.Customer.Name,
                Code: Sale.Customer.Code,
            },
            SalesPerson: Sale.SalesPerson ? {
                ID: Sale.SalesPerson.ID,
                Name: Sale.SalesPerson.Name,
            } : null,
            subTotal: (0, number_1.number)(Sale.Subtotal),
            discountAmount: (0, number_1.number)(Sale.DiscountAmount),
            taxAmount: (0, number_1.number)(Sale.TaxAmount),
            Total: (0, number_1.number)(Sale.Total),
            CashAmount: (0, number_1.number)(Sale.CashAmount),
            changeAmount: (0, number_1.number)(Sale.ChangeAmount),
            PaymentStatus: Sale.PaymentStatus.Name,
            itemCount: Sale.SaleItems.length,
            items: Sale.SaleItems.map((item) => ({
                ID: item.ID,
                ProductId: item.ProductID,
                ProductCode: item.Product.Code,
                ProductName: item.Product.Name,
                Unit: item.Unit?.Name || item.Product.Unit?.Name,
                Quantity: (0, number_1.number)(item.Quantity),
                UnitPrice: (0, number_1.number)(item.UnitPrice),
                subTotal: (0, number_1.number)(item.Subtotal),
                maxReturnable: (0, number_1.number)(item.Quantity),
            })),
        }));
    }
    async getSaleItemsForReturn(SaleId) {
        const Sale = await this.prisma.sale.findUnique({
            where: { ID: SaleId },
            include: {
                Customer: true,
                SalesPerson: true,
                PaymentStatus: true,
                SaleItems: {
                    include: {
                        Product: { include: { Unit: true } },
                        Unit: true,
                    },
                },
                SaleReturns: {
                    where: { Status: { Code: { not: 'CANCELLED' } } },
                    include: {
                        ReturnItems: true,
                    },
                },
            },
        });
        if (!Sale) {
            throw new common_1.NotFoundException('Sale not found');
        }
        const returnedQuantities = {};
        for (const returnDoc of Sale.SaleReturns) {
            for (const returnItem of returnDoc.ReturnItems) {
                if (!returnedQuantities[returnItem.ProductID]) {
                    returnedQuantities[returnItem.ProductID] = 0;
                }
                returnedQuantities[returnItem.ProductID] += Number(returnItem.Quantity);
            }
        }
        return {
            Sale: {
                ID: Sale.ID,
                Code: Sale.Code,
                Date: Sale.Date,
                Customer: Sale.Customer,
                SalesPerson: Sale.SalesPerson,
                Total: (0, number_1.number)(Sale.Total),
                PaymentStatus: Sale.PaymentStatus,
            },
            items: Sale.SaleItems.map((item) => {
                const alreadyReturned = returnedQuantities[item.ProductID] || 0;
                const originalQty = Number(item.Quantity);
                const maxReturnable = Math.max(0, originalQty - alreadyReturned);
                return {
                    SaleItemId: item.ID,
                    ProductId: item.ProductID,
                    ProductCode: item.Product.Code,
                    ProductName: item.Product.Name,
                    Unit: item.Unit?.Name || item.Product.Unit?.Name,
                    originalQuantity: originalQty,
                    alreadyReturned,
                    maxReturnable,
                    UnitPrice: (0, number_1.number)(item.UnitPrice),
                    subTotal: (0, number_1.number)(item.Subtotal),
                };
            }),
        };
    }
    async createSaleReturn(dto, UserId) {
        const Sale = await this.prisma.sale.findUnique({
            where: { ID: dto.SaleId },
            include: {
                SaleItems: true,
                Customer: true,
            },
        });
        if (!Sale) {
            throw new common_1.NotFoundException('Sale not found');
        }
        if (Sale.IsReturn) {
            throw new common_1.BadRequestException('Cannot return a return transaction');
        }
        if (Sale.CustomerID !== dto.CustomerId) {
            throw new common_1.BadRequestException('Customer does not match the original Sale');
        }
        let TotalReturn = 0;
        const validatedItems = [];
        for (const returnItem of dto.Items) {
            const SaleItem = Sale.SaleItems.find((si) => si.ProductID === returnItem.ProductId);
            if (!SaleItem) {
                throw new common_1.BadRequestException(`Product ${returnItem.ProductId} not found in original Sale`);
            }
            const maxReturnable = Number(SaleItem.Quantity);
            if (returnItem.Quantity > maxReturnable) {
                throw new common_1.BadRequestException(`Return Quantity for Product ${returnItem.ProductId} exceeds sold Quantity`);
            }
            const UnitPrice = returnItem.UnitPrice || Number(SaleItem.UnitPrice);
            const itemSubTotal = UnitPrice * returnItem.Quantity;
            TotalReturn += itemSubTotal;
            validatedItems.push({
                ProductId: returnItem.ProductId,
                SaleItemId: SaleItem.ID,
                Quantity: returnItem.Quantity,
                UnitId: returnItem.UnitId || SaleItem.UnitID || null,
                UnitPrice,
                subTotal: itemSubTotal,
                reason: returnItem.Reason || dto.Reason,
            });
        }
        const Code = await this.generateReturnCode();
        const pendingStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'PENDING' },
        });
        const SaleReturn = await this.prisma.$transaction(async (tx) => {
            const newReturn = await tx.saleReturn.create({
                data: {
                    Code: Code,
                    Date: dto.Date ? new Date(dto.Date) : new Date(),
                    SaleID: dto.SaleId,
                    CustomerID: dto.CustomerId,
                    WarehouseID: dto.WarehouseId || null,
                    TotalReturn: new client_1.Prisma.Decimal(TotalReturn),
                    Reason: dto.Reason,
                    StatusID: pendingStatus?.ID || 1,
                    CreatedByID: UserId,
                    ReturnItems: {
                        create: validatedItems.map((item) => ({
                            ProductID: item.ProductId,
                            Quantity: new client_1.Prisma.Decimal(item.Quantity),
                            UnitID: item.UnitId || undefined,
                            UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice),
                            Subtotal: new client_1.Prisma.Decimal(item.subTotal),
                        })),
                    },
                },
                include: {
                    Customer: true,
                    Sale: true,
                    ReturnItems: { include: { Product: true, Unit: true } },
                },
            });
            return newReturn;
        });
        return {
            success: true,
            SaleReturn: {
                ID: SaleReturn.ID,
                Code: SaleReturn.Code,
                Date: SaleReturn.Date,
                originalSaleCode: Sale.Code,
                Customer: SaleReturn.Customer.Name,
                TotalReturn,
                reason: SaleReturn.Reason,
                Status: pendingStatus?.Name || 'Pending',
                items: SaleReturn.ReturnItems.map((item) => ({
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
    async getSaleReturn(returnId) {
        const SaleReturn = await this.prisma.saleReturn.findUnique({
            where: { ID: returnId },
            include: {
                Customer: true,
                Sale: { include: { Customer: true } },
                Warehouse: true,
                Status: true,
                ReturnItems: {
                    include: {
                        Product: true,
                        Unit: true,
                    },
                },
            },
        });
        if (!SaleReturn) {
            throw new common_1.NotFoundException('Sale return not found');
        }
        return {
            ID: SaleReturn.ID,
            Code: SaleReturn.Code,
            Date: SaleReturn.Date,
            originalSale: {
                ID: SaleReturn.Sale.ID,
                Code: SaleReturn.Sale.Code,
                Date: SaleReturn.Sale.Date,
                Customer: SaleReturn.Sale.Customer.Name,
                Total: (0, number_1.number)(SaleReturn.Sale.Total),
            },
            Customer: SaleReturn.Customer,
            Warehouse: SaleReturn.Warehouse,
            TotalReturn: (0, number_1.number)(SaleReturn.TotalReturn),
            reason: SaleReturn.Reason,
            Status: SaleReturn.Status,
            isExchange: false,
            Notes: SaleReturn.Reason,
            items: SaleReturn.ReturnItems.map((item) => ({
                ID: item.ID,
                ProductId: item.ProductID,
                ProductCode: item.Product.Code,
                ProductName: item.Product.Name,
                Quantity: (0, number_1.number)(item.Quantity),
                Unit: item.Unit?.Name,
                UnitPrice: (0, number_1.number)(item.UnitPrice),
                subTotal: (0, number_1.number)(item.Subtotal),
                originalQuantity: null,
            })),
        };
    }
    async listSaleReturns(dto) {
        const where = {};
        if (dto.CustomerId) {
            where.CustomerID = dto.CustomerId;
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
        const returns = await this.prisma.saleReturn.findMany({
            where,
            include: {
                Customer: true,
                Sale: true,
                Status: true,
                ReturnItems: true,
            },
            orderBy: { Date: 'desc' },
        });
        return returns.map((r) => ({
            ID: r.ID,
            Code: r.Code,
            Date: r.Date,
            originalSaleCode: r.Sale.Code,
            Customer: r.Customer.Name,
            TotalReturn: (0, number_1.number)(r.TotalReturn),
            reason: r.Reason,
            Status: r.Status.Name,
            StatusColor: r.Status.Color,
            itemCount: r.ReturnItems.length,
            isExchange: false,
        }));
    }
    async approveSaleReturn(returnId, dto, UserId) {
        const SaleReturn = await this.prisma.saleReturn.findUnique({
            where: { ID: returnId },
            include: {
                ReturnItems: true,
                Sale: true,
                Customer: true,
            },
        });
        if (!SaleReturn) {
            throw new common_1.NotFoundException('Sale return not found');
        }
        const completedStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'COMPLETED' },
        });
        await this.prisma.$transaction(async (tx) => {
            await tx.saleReturn.update({
                where: { ID: returnId },
                data: {
                    StatusID: completedStatus?.ID || 2,
                    Reason: dto.Notes ? `${SaleReturn.Reason || ''}\nApproved: ${dto.Notes}` : SaleReturn.Reason,
                },
            });
            for (const item of SaleReturn.ReturnItems) {
                await tx.product.update({
                    where: { ID: item.ProductID },
                    data: { Stock: { increment: new client_1.Prisma.Decimal(item.Quantity) } },
                });
                if (SaleReturn.WarehouseID) {
                    await tx.productStock.update({
                        where: {
                            ProductID_WarehouseID: {
                                ProductID: item.ProductID,
                                WarehouseID: SaleReturn.WarehouseID,
                            },
                        },
                        data: { Quantity: { increment: new client_1.Prisma.Decimal(item.Quantity) } },
                    });
                }
            }
            const refundAmount = Number(SaleReturn.TotalReturn);
            const isExchange = false;
            if (isExchange) {
                await tx.customer.update({
                    where: { ID: SaleReturn.CustomerID },
                    data: { TotalReceivable: { increment: new client_1.Prisma.Decimal(refundAmount) } },
                });
            }
            await tx.activityLog.create({
                data: {
                    Type: 'SALE_RETURN',
                    Title: 'Sale Return Approved',
                    Description: `Return ${SaleReturn.Code} approved. Amount: ${refundAmount}. Original Sale: ${SaleReturn.Sale.Code}`,
                    ReferenceType: 'SALE_RETURN',
                    ReferenceID: returnId,
                    Amount: new client_1.Prisma.Decimal(refundAmount),
                    CreatedByID: UserId,
                },
            });
        });
        return {
            success: true,
            SaleReturnId: returnId,
            Code: SaleReturn.Code,
            TotalReturn: (0, number_1.number)(SaleReturn.TotalReturn),
            Status: 'APPROVED',
            message: 'Return approved and Stock has been updated',
        };
    }
    async rejectSaleReturn(returnId, dto, UserId) {
        const SaleReturn = await this.prisma.saleReturn.findUnique({
            where: { ID: returnId },
        });
        if (!SaleReturn) {
            throw new common_1.NotFoundException('Sale return not found');
        }
        const rejectedStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'CANCELLED' },
        });
        await this.prisma.saleReturn.update({
            where: { ID: returnId },
            data: {
                StatusID: rejectedStatus?.ID || 3,
                Reason: `${SaleReturn.Reason || ''}\nRejected: ${dto.Reason}`,
            },
        });
        await this.prisma.activityLog.create({
            data: {
                Type: 'SALE_RETURN_REJECTED',
                Title: 'Sale Return Rejected',
                Description: `Return ${SaleReturn.Code} rejected. Reason: ${dto.Reason}`,
                ReferenceType: 'SALE_RETURN',
                ReferenceID: returnId,
                CreatedByID: UserId,
            },
        });
        return {
            success: true,
            SaleReturnId: returnId,
            Code: SaleReturn.Code,
            Status: 'REJECTED',
            reason: dto.Reason,
        };
    }
    async getSaleReturnSummary(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.Date = {};
            if (startDate) {
                where.Date.gte = new Date(startDate);
            }
            if (endDate) {
                where.Date.lte = new Date(endDate);
            }
        }
        const returns = await this.prisma.saleReturn.findMany({
            where,
            include: {
                Customer: true,
                Status: true,
                ReturnItems: { include: { Product: true } },
            },
        });
        const completedStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'COMPLETED' },
        });
        const pendingStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'PENDING' },
        });
        const byProduct = {};
        let TotalReturnAmount = 0;
        let approvedAmount = 0;
        let pendingAmount = 0;
        for (const returnDoc of returns) {
            const Amount = Number(returnDoc.TotalReturn);
            TotalReturnAmount += Amount;
            if (returnDoc.StatusID === completedStatus?.ID) {
                approvedAmount += Amount;
            }
            else if (returnDoc.StatusID === pendingStatus?.ID) {
                pendingAmount += Amount;
            }
            for (const item of returnDoc.ReturnItems) {
                const ProductName = item.Product.Name;
                if (!byProduct[ProductName]) {
                    byProduct[ProductName] = {
                        ProductName,
                        ProductCode: item.Product.Code,
                        returnCount: 0,
                        TotalQuantity: 0,
                        TotalAmount: 0,
                    };
                }
                byProduct[ProductName].returnCount++;
                byProduct[ProductName].TotalQuantity += Number(item.Quantity);
                byProduct[ProductName].TotalAmount += Number(item.Subtotal);
            }
        }
        return {
            period: { startDate, endDate },
            Summary: {
                TotalReturns: returns.length,
                TotalReturnAmount,
                approvedAmount,
                pendingAmount,
                averageReturnAmount: returns.length > 0 ? TotalReturnAmount / returns.length : 0,
            },
            byProduct: Object.values(byProduct).sort((a, b) => b.TotalAmount - a.TotalAmount),
        };
    }
    async generateReturnCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `RET-JUAL-${year}${month}`;
        const lastReturn = await this.prisma.saleReturn.findFirst({
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
};
exports.SaleReturnService = SaleReturnService;
exports.SaleReturnService = SaleReturnService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SaleReturnService);
