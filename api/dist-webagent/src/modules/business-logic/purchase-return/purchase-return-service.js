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
exports.PurchaseReturnService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
const STATUS_CODE_MAP = {
    PENDING: 'DRAFT',
    APPROVED: 'CONFIRMED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};
let PurchaseReturnService = class PurchaseReturnService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const Purchase = await this.prisma.purchase.findUnique({
            where: { ID: dto.PurchaseId },
            include: { PurchaseItems: true },
        });
        if (!Purchase) {
            throw new common_1.NotFoundException('Purchase not found');
        }
        for (const item of dto.Items) {
            const PurchaseItem = Purchase.PurchaseItems.find((pi) => pi.ID === item.PurchaseItemId);
            if (!PurchaseItem) {
                throw new common_1.BadRequestException(`Purchase item ${item.PurchaseItemId} not found in Purchase`);
            }
            const existingReturns = await this.prisma.purchaseReturnItem.aggregate({
                where: {
                    ProductID: item.ProductId,
                    PurchaseReturn: { PurchaseID: dto.PurchaseId },
                },
                _sum: { Quantity: true },
            });
            const alreadyReturned = existingReturns._sum?.Quantity ? Number(existingReturns._sum.Quantity) : 0;
            const maxReturn = Number(PurchaseItem.Quantity) - alreadyReturned;
            if (item.Quantity > maxReturn) {
                throw new common_1.BadRequestException(`Return Quantity ${item.Quantity} exceeds available ${maxReturn} for item ${item.PurchaseItemId}`);
            }
        }
        const Code = await this.generateCode();
        const draftStatus = await this.getStatusByCode('DRAFT');
        const TotalReturn = dto.Items.reduce((sum, item) => sum + item.Quantity * item.UnitPrice, 0);
        const PurchaseReturn = await this.prisma.$transaction(async (tx) => {
            return tx.purchaseReturn.create({
                data: {
                    Code,
                    Date: dto.Date ? new Date(dto.Date) : new Date(),
                    PurchaseID: dto.PurchaseId,
                    SupplierID: dto.SupplierId,
                    WarehouseID: dto.WarehouseId,
                    Reason: dto.Reason,
                    StatusID: draftStatus.ID,
                    TotalReturn: new client_1.Prisma.Decimal(TotalReturn),
                    CreatedByID: dto.CreatedById?.toString() ?? 'system',
                    ReturnItems: {
                        create: dto.Items.map((item) => {
                            const PurchaseItem = Purchase.PurchaseItems.find((pi) => pi.ID === item.PurchaseItemId);
                            return {
                                ProductID: item.ProductId,
                                UnitID: PurchaseItem.UnitID,
                                Quantity: new client_1.Prisma.Decimal(item.Quantity),
                                UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice),
                                Subtotal: new client_1.Prisma.Decimal(item.Quantity * item.UnitPrice),
                            };
                        }),
                    },
                },
                include: {
                    Supplier: true,
                    Purchase: true,
                    Status: true,
                    ReturnItems: { include: { Product: true } },
                },
            });
        });
        return { ...PurchaseReturn, TotalReturn };
    }
    async findAll(query) {
        const { Search, Page = 1, Limit = 20, SupplierId, PurchaseId, Status, StartDate, EndDate } = query;
        const where = {};
        if (Search) {
            where.OR = [
                { Code: { contains: Search, mode: 'insensitive' } },
                { Reason: { contains: Search, mode: 'insensitive' } },
            ];
        }
        if (SupplierId)
            where.SupplierID = SupplierId;
        if (PurchaseId)
            where.PurchaseID = PurchaseId;
        if (Status) {
            const mappedCode = STATUS_CODE_MAP[Status.toUpperCase()] || Status.toUpperCase();
            const status = await this.prisma.transactionStatus.findUnique({ where: { Code: mappedCode } });
            where.StatusID = status?.ID ?? -1;
        }
        if (StartDate || EndDate) {
            where.Date = {};
            if (StartDate)
                where.Date.gte = new Date(StartDate);
            if (EndDate)
                where.Date.lte = new Date(EndDate);
        }
        const skip = (Page - 1) * Limit;
        const [data, Total] = await Promise.all([
            this.prisma.purchaseReturn.findMany({
                where,
                include: {
                    Supplier: true,
                    Purchase: true,
                    Status: true,
                    ReturnItems: { include: { Product: true } },
                },
                skip,
                take: Limit,
                orderBy: { CreatedAt: 'desc' },
            }),
            this.prisma.purchaseReturn.count({ where }),
        ]);
        const dataWithTotals = data.map((r) => ({
            ...r,
            TotalReturn: (0, number_1.number)(r.TotalReturn),
        }));
        return {
            data: dataWithTotals,
            pagination: { page: Page, limit: Limit, Total, TotalPages: Math.ceil(Total / Limit) },
        };
    }
    async findById(ID) {
        const PurchaseReturn = await this.prisma.purchaseReturn.findUnique({
            where: { ID },
            include: {
                Supplier: true,
                Purchase: true,
                Status: true,
                ReturnItems: { include: { Product: true } },
            },
        });
        if (!PurchaseReturn) {
            throw new common_1.NotFoundException('Purchase return not found');
        }
        return { ...PurchaseReturn, TotalReturn: (0, number_1.number)(PurchaseReturn.TotalReturn) };
    }
    async update(ID, dto) {
        const existing = await this.findById(ID);
        if (existing.Status?.Code !== 'DRAFT') {
            throw new common_1.BadRequestException('Can only update pending Purchase return');
        }
        const data = {
            Date: dto.Date ? new Date(dto.Date) : undefined,
            Reason: dto.Reason,
        };
        if (dto.Status) {
            const mappedCode = STATUS_CODE_MAP[dto.Status.toUpperCase()] || dto.Status.toUpperCase();
            const status = await this.getStatusByCode(mappedCode);
            data.Status = { connect: { ID: status.ID } };
        }
        return this.prisma.purchaseReturn.update({
            where: { ID },
            data,
            include: {
                Supplier: true,
                Purchase: true,
                Status: true,
                ReturnItems: { include: { Product: true } },
            },
        });
    }
    async approve(ID, _dto) {
        const PurchaseReturn = await this.findById(ID);
        if (PurchaseReturn.Status?.Code === 'CONFIRMED' || PurchaseReturn.Status?.Code === 'COMPLETED') {
            throw new common_1.ConflictException('Purchase return already approved/completed');
        }
        if (PurchaseReturn.Status?.Code === 'CANCELLED') {
            throw new common_1.ConflictException('Cannot approve cancelled Purchase return');
        }
        const confirmedStatus = await this.getStatusByCode('CONFIRMED');
        await this.prisma.$transaction(async (tx) => {
            await tx.purchaseReturn.update({
                where: { ID },
                data: { StatusID: confirmedStatus.ID },
            });
            await tx.supplier.update({
                where: { ID: PurchaseReturn.SupplierID },
                data: { TotalDebt: { decrement: new client_1.Prisma.Decimal(PurchaseReturn.TotalReturn) } },
            });
        });
        return this.findById(ID);
    }
    async complete(ID) {
        const PurchaseReturn = await this.findById(ID);
        if (PurchaseReturn.Status?.Code !== 'CONFIRMED') {
            throw new common_1.BadRequestException('Can only complete approved Purchase return');
        }
        const completedStatus = await this.getStatusByCode('COMPLETED');
        await this.prisma.$transaction(async (tx) => {
            await tx.purchaseReturn.update({
                where: { ID },
                data: { StatusID: completedStatus.ID },
            });
            if (PurchaseReturn.WarehouseID) {
                for (const item of PurchaseReturn.ReturnItems) {
                    await tx.productStock
                        .update({
                        where: {
                            ProductID_WarehouseID: {
                                ProductID: item.ProductID,
                                WarehouseID: PurchaseReturn.WarehouseID,
                            },
                        },
                        data: { Quantity: { increment: item.Quantity } },
                    })
                        .catch(() => {
                        return tx.productStock.create({
                            data: {
                                ProductID: item.ProductID,
                                WarehouseID: PurchaseReturn.WarehouseID,
                                Quantity: item.Quantity,
                            },
                        });
                    });
                    await tx.product.update({
                        where: { ID: item.ProductID },
                        data: { Stock: { increment: item.Quantity } },
                    });
                }
            }
        });
        return this.findById(ID);
    }
    async cancel(ID, dto) {
        const PurchaseReturn = await this.findById(ID);
        if (PurchaseReturn.Status?.Code === 'COMPLETED') {
            throw new common_1.BadRequestException('Cannot cancel completed Purchase return');
        }
        const cancelledStatus = await this.getStatusByCode('CANCELLED');
        if (PurchaseReturn.Status?.Code === 'CONFIRMED') {
            await this.prisma.$transaction(async (tx) => {
                await tx.supplier.update({
                    where: { ID: PurchaseReturn.SupplierID },
                    data: { TotalDebt: { increment: new client_1.Prisma.Decimal(PurchaseReturn.TotalReturn) } },
                });
                await tx.purchaseReturn.update({
                    where: { ID },
                    data: {
                        StatusID: cancelledStatus.ID,
                        Reason: `${PurchaseReturn.Reason || ''}\nCancellation: ${dto.Reason}`,
                    },
                });
            });
        }
        else {
            await this.prisma.purchaseReturn.update({
                where: { ID },
                data: {
                    StatusID: cancelledStatus.ID,
                    Reason: `${PurchaseReturn.Reason || ''}\nCancellation: ${dto.Reason}`,
                },
            });
        }
        return this.findById(ID);
    }
    async delete(ID) {
        const PurchaseReturn = await this.findById(ID);
        if (PurchaseReturn.Status?.Code !== 'DRAFT') {
            throw new common_1.BadRequestException('Can only delete pending Purchase return');
        }
        return this.prisma.purchaseReturn.delete({ where: { ID } });
    }
    async getStatusByCode(code) {
        const status = await this.prisma.transactionStatus.findUnique({ where: { Code: code } });
        if (!status)
            throw new common_1.BadRequestException(`Status '${code}' tidak ditemukan`);
        return status;
    }
    async generateCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const prefix = `PR-${year}${month}${day}`;
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
};
exports.PurchaseReturnService = PurchaseReturnService;
exports.PurchaseReturnService = PurchaseReturnService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseReturnService);
