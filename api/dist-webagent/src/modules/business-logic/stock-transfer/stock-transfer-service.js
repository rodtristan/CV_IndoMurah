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
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let StockTransferService = class StockTransferService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createStockTransfer(dto, UserId) {
        const [fromWarehouse, toWarehouse] = await Promise.all([
            this.prisma.warehouse.findUnique({ where: { ID: dto.FromWarehouseId } }),
            this.prisma.warehouse.findUnique({ where: { ID: dto.ToWarehouseId } }),
        ]);
        if (!fromWarehouse) {
            throw new common_1.NotFoundException('Source Warehouse not found');
        }
        if (!toWarehouse) {
            throw new common_1.NotFoundException('Destination Warehouse not found');
        }
        if (fromWarehouse.ID === toWarehouse.ID) {
            throw new common_1.BadRequestException('Cannot Transfer to the same Warehouse');
        }
        const itemsWithValIDation = [];
        let TotalValue = 0;
        for (const item of dto.Items) {
            const Product = await this.prisma.product.findUnique({
                where: { ID: item.ProductId },
            });
            if (!Product) {
                throw new common_1.NotFoundException(`Product ${item.ProductId} not found`);
            }
            const sourceStock = await this.prisma.productStock.findUnique({
                where: {
                    ProductID_WarehouseID: {
                        ProductID: item.ProductId,
                        WarehouseID: dto.FromWarehouseId,
                    },
                },
            });
            const availableStock = Number(sourceStock?.Quantity || Product.Stock);
            if (availableStock < item.Quantity) {
                throw new common_1.BadRequestException(`Insufficient Stock for ${Product.Name}. Available: ${availableStock}, Requested: ${item.Quantity}`);
            }
            const UnitPrice = Number(Product.PurchasePrice);
            const subTotal = UnitPrice * item.Quantity;
            TotalValue += subTotal;
            itemsWithValIDation.push({
                ProductId: item.ProductId,
                ProductName: Product.Name,
                ProductCode: Product.Code,
                Quantity: item.Quantity,
                UnitId: item.UnitId || Product.UnitID,
                UnitPrice,
                subTotal,
                Notes: item.Notes,
            });
        }
        const Code = await this.generateStockTransferCode();
        const pendingStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'PENDING' },
        });
        const Transfer = await this.prisma.$transaction(async (tx) => {
            const newTransfer = await tx.stockTransfer.create({
                data: {
                    Code: Code,
                    Date: new Date(dto.Date),
                    FromWarehouseID: dto.FromWarehouseId,
                    ToWarehouseID: dto.ToWarehouseId,
                    TotalItems: new client_1.Prisma.Decimal(TotalValue),
                    StatusID: pendingStatus?.ID || 1,
                    Notes: dto.Notes,
                    CreatedByID: UserId,
                },
            });
            await tx.stockTransferItem.createMany({
                data: itemsWithValIDation.map((item) => ({
                    StockTransferID: newTransfer.ID,
                    ProductID: item.ProductId,
                    Quantity: new client_1.Prisma.Decimal(item.Quantity),
                    UnitID: item.UnitId,
                    UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice),
                    Subtotal: new client_1.Prisma.Decimal(item.subTotal),
                })),
            });
            return newTransfer;
        });
        await this.prisma.activityLog.create({
            data: {
                Type: 'STOCK_TRANSFER_CREATED',
                Title: 'Stock Transfer Created',
                Description: `Stock Transfer ${Code} created from ${fromWarehouse.Name} to ${toWarehouse.Name}`,
                ReferenceType: 'STOCK_TRANSFER',
                ReferenceID: Transfer.ID,
                Amount: new client_1.Prisma.Decimal(TotalValue),
                CreatedByID: UserId,
            },
        });
        return {
            success: true,
            Transfer: await this.getStockTransfer(Transfer.ID),
        };
    }
    async getStockTransfer(TransferId) {
        const Transfer = await this.prisma.stockTransfer.findUnique({
            where: { ID: TransferId },
            include: {
                FromWarehouse: true,
                ToWarehouse: true,
                Status: true,
                TransferItems: {
                    include: {
                        Product: true,
                        Unit: true,
                    },
                },
            },
        });
        if (!Transfer) {
            throw new common_1.NotFoundException('Stock Transfer not found');
        }
        return this.formatStockTransfer(Transfer);
    }
    async listStockTransfers(dto) {
        const where = {};
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                const endDate = new Date(dto.EndDate);
                endDate.setHours(23, 59, 59, 999);
                where.Date.lte = endDate;
            }
        }
        if (dto.FromWarehouseId) {
            where.FromWarehouseID = dto.FromWarehouseId;
        }
        if (dto.ToWarehouseId) {
            where.ToWarehouseID = dto.ToWarehouseId;
        }
        if (dto.StatusId) {
            where.StatusID = dto.StatusId;
        }
        const page = dto.Page || 1;
        const limit = dto.Limit || 20;
        const skip = (page - 1) * limit;
        const [Transfers, Total] = await Promise.all([
            this.prisma.stockTransfer.findMany({
                where,
                include: {
                    FromWarehouse: true,
                    ToWarehouse: true,
                    Status: true,
                    TransferItems: true,
                },
                orderBy: { Date: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.stockTransfer.count({ where }),
        ]);
        return {
            data: Transfers.map((t) => this.formatStockTransfer(t)),
            pagination: {
                page,
                limit,
                Total,
                TotalPages: Math.ceil(Total / limit),
            },
        };
    }
    async completeStockTransfer(TransferId, UserId) {
        const Transfer = await this.prisma.stockTransfer.findUnique({
            where: { ID: TransferId },
            include: {
                TransferItems: true,
                FromWarehouse: true,
                ToWarehouse: true,
            },
        });
        if (!Transfer) {
            throw new common_1.NotFoundException('Stock Transfer not found');
        }
        const completedStatus = await this.prisma.transactionStatus.findFirst({
            where: { IsTerminal: true },
        });
        await this.prisma.$transaction(async (tx) => {
            for (const item of Transfer.TransferItems) {
                await tx.productStock.upsert({
                    where: {
                        ProductID_WarehouseID: {
                            ProductID: item.ProductID,
                            WarehouseID: Transfer.FromWarehouseID,
                        },
                    },
                    update: {
                        Quantity: { decrement: item.Quantity },
                    },
                    create: {
                        ProductID: item.ProductID,
                        WarehouseID: Transfer.FromWarehouseID,
                        Quantity: new client_1.Prisma.Decimal(-item.Quantity),
                    },
                });
                await tx.productStock.upsert({
                    where: {
                        ProductID_WarehouseID: {
                            ProductID: item.ProductID,
                            WarehouseID: Transfer.ToWarehouseID,
                        },
                    },
                    create: {
                        ProductID: item.ProductID,
                        WarehouseID: Transfer.ToWarehouseID,
                        Quantity: item.Quantity,
                    },
                    update: {
                        Quantity: { increment: item.Quantity },
                    },
                });
                await tx.product.update({
                    where: { ID: item.ProductID },
                    data: {
                        Stock: { decrement: item.Quantity },
                    },
                });
            }
            await tx.stockTransfer.update({
                where: { ID: TransferId },
                data: {
                    StatusID: completedStatus?.ID || 3,
                },
            });
        });
        await this.prisma.activityLog.create({
            data: {
                Type: 'STOCK_TRANSFER_COMPLETED',
                Title: 'Stock Transfer Completed',
                Description: `Stock Transfer ${Transfer.Code} completed`,
                ReferenceType: 'STOCK_TRANSFER',
                ReferenceID: Transfer.ID,
                Amount: new client_1.Prisma.Decimal(Number(Transfer.TotalItems)),
                CreatedByID: UserId,
            },
        });
        return {
            success: true,
            Transfer: await this.getStockTransfer(TransferId),
        };
    }
    async cancelStockTransfer(TransferId, UserId) {
        const Transfer = await this.prisma.stockTransfer.findUnique({
            where: { ID: TransferId },
        });
        if (!Transfer) {
            throw new common_1.NotFoundException('Stock Transfer not found');
        }
        const cancelledStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'CANCELLED' },
        });
        const updated = await this.prisma.stockTransfer.update({
            where: { ID: TransferId },
            data: {
                StatusID: cancelledStatus?.ID || 4,
            },
            include: {
                FromWarehouse: true,
                ToWarehouse: true,
                Status: true,
                TransferItems: {
                    include: {
                        Product: true,
                        Unit: true,
                    },
                },
            },
        });
        return {
            success: true,
            Transfer: this.formatStockTransfer(updated),
        };
    }
    async getStockTransferSummary(dto) {
        const where = {};
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                const endDate = new Date(dto.EndDate);
                endDate.setHours(23, 59, 59, 999);
                where.Date.lte = endDate;
            }
        }
        const [pending, completed, cancelled, all] = await Promise.all([
            this.prisma.stockTransfer.findMany({
                where: { ...where, Status: { Code: 'PENDING' } },
            }),
            this.prisma.stockTransfer.findMany({
                where: { ...where, Status: { IsTerminal: true, Code: { not: 'CANCELLED' } } },
            }),
            this.prisma.stockTransfer.findMany({
                where: { ...where, Status: { Code: 'CANCELLED' } },
            }),
            this.prisma.stockTransfer.findMany({ where }),
        ]);
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            TotalTransfers: all.length,
            pending: {
                Count: pending.length,
                TotalValue: pending.reduce((sum, t) => sum + Number(t.TotalItems), 0),
            },
            completed: {
                Count: completed.length,
                TotalValue: completed.reduce((sum, t) => sum + Number(t.TotalItems), 0),
            },
            cancelled: {
                Count: cancelled.length,
                TotalValue: cancelled.reduce((sum, t) => sum + Number(t.TotalItems), 0),
            },
        };
    }
    async generateStockTransferCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const prefix = `ST-${year}${month}${day}`;
        const lastTransfer = await this.prisma.stockTransfer.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastTransfer) {
            const lastSeq = parseInt(lastTransfer.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    formatStockTransfer(Transfer) {
        return {
            ID: Transfer.ID,
            Code: Transfer.Code,
            Date: Transfer.Date,
            fromWarehouse: Transfer.FromWarehouse
                ? { ID: Transfer.FromWarehouse.ID, Code: Transfer.FromWarehouse.Code, Name: Transfer.FromWarehouse.Name }
                : null,
            toWarehouse: Transfer.ToWarehouse
                ? { ID: Transfer.ToWarehouse.ID, Code: Transfer.ToWarehouse.Code, Name: Transfer.ToWarehouse.Name }
                : null,
            TotalValue: (0, number_1.number)(Transfer.TotalItems),
            Status: Transfer.Status
                ? { ID: Transfer.Status.ID, Code: Transfer.Status.Code, Name: Transfer.Status.Name, color: Transfer.Status.Color }
                : null,
            Notes: Transfer.Notes,
            itemCount: Transfer.TransferItems?.length || 0,
            items: Transfer.TransferItems?.map((i) => ({
                ID: i.ID,
                ProductId: i.ProductID,
                ProductName: i.Product?.Name || i.ProductName,
                ProductCode: i.Product?.Code,
                Quantity: (0, number_1.number)(i.Quantity),
                Unit: i.Unit?.Name,
                UnitPrice: (0, number_1.number)(i.UnitPrice),
                subTotal: (0, number_1.number)(i.SubTotal),
            })),
            createdAt: Transfer.CreatedAt,
        };
    }
};
exports.StockTransferService = StockTransferService;
exports.StockTransferService = StockTransferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockTransferService);
