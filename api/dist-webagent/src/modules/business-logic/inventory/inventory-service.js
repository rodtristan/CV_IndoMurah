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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOpeningStock(dto, UserId) {
        const warehouse = await this.prisma.warehouse.findUnique({
            where: { ID: dto.WarehouseId },
        });
        if (!warehouse)
            throw new common_1.NotFoundException('Warehouse not found');
        const code = await this.generateOpeningStockCode();
        const totalValue = dto.Items.reduce((sum, item) => sum + (item.Quantity * item.UnitCost), 0);
        const inventoryAccountSetting = await this.prisma.accountSetting.findUnique({
            where: { Key: 'inventory' },
        });
        if (!inventoryAccountSetting?.AccountID) {
            throw new common_1.BadRequestException('Account Setting "inventory" belum dikonfigurasi. Silakan setup di Pengaturan Akun.');
        }
        const stockInAccountSetting = await this.prisma.accountSetting.findUnique({
            where: { Key: 'stockIn' },
        });
        const result = await this.prisma.$transaction(async (tx) => {
            const stockIn = await tx.stockIn.create({
                data: {
                    Code: code,
                    Date: new Date(),
                    WarehouseID: dto.WarehouseId,
                    SupplierID: null,
                    TotalItems: new client_1.Prisma.Decimal(totalValue),
                    Description: dto.Notes || `Opening Stock - ${warehouse.Name}`,
                    StatusID: 1,
                    CreatedByID: UserId,
                    StockInItems: {
                        create: dto.Items.map((item, index) => ({
                            ProductID: item.ProductId,
                            Quantity: new client_1.Prisma.Decimal(item.Quantity),
                            UnitID: 1,
                            UnitPrice: new client_1.Prisma.Decimal(item.UnitCost),
                            Subtotal: new client_1.Prisma.Decimal(item.Quantity * item.UnitCost),
                        })),
                    },
                },
                include: {
                    StockInItems: { include: { Product: true } },
                },
            });
            for (const item of dto.Items) {
                await tx.productStock.upsert({
                    where: {
                        ProductID_WarehouseID: {
                            ProductID: item.ProductId,
                            WarehouseID: dto.WarehouseId,
                        },
                    },
                    update: {
                        Quantity: { increment: new client_1.Prisma.Decimal(item.Quantity) },
                    },
                    create: {
                        ProductID: item.ProductId,
                        WarehouseID: dto.WarehouseId,
                        Quantity: new client_1.Prisma.Decimal(item.Quantity),
                        MinimumStock: new client_1.Prisma.Decimal(0),
                    },
                });
            }
            let journalCode = null;
            if (inventoryAccountSetting?.AccountID && stockInAccountSetting?.AccountID) {
                const journalNumber = await this.generateJournalCode(tx);
                const journalEntry = await tx.journalEntry.create({
                    data: {
                        JournalNumber: journalNumber,
                        Date: new Date(),
                        Reference: code,
                        Description: dto.Notes || `Opening Stock - ${warehouse.Name}`,
                        SourceDocumentID: stockIn.ID,
                        SourceDocumentType: 'STOCK_IN',
                        TotalDebit: new client_1.Prisma.Decimal(totalValue),
                        TotalCredit: new client_1.Prisma.Decimal(totalValue),
                        CreatedByID: UserId,
                        Lines: {
                            create: [
                                {
                                    AccountID: inventoryAccountSetting.AccountID,
                                    DebitCredit: 'DEBIT',
                                    Amount: new client_1.Prisma.Decimal(totalValue),
                                    Description: `Persediaan Barang - ${warehouse.Name}`,
                                    LineNumber: 1,
                                },
                                {
                                    AccountID: stockInAccountSetting.AccountID,
                                    DebitCredit: 'KREDIT',
                                    Amount: new client_1.Prisma.Decimal(totalValue),
                                    Description: `Opening Stock - ${warehouse.Name}`,
                                    LineNumber: 2,
                                },
                            ],
                        },
                    },
                });
                journalCode = journalNumber;
            }
            return { stockIn, journalCode };
        });
        return {
            success: true,
            openingStock: {
                code: code,
                warehouse: warehouse.Name,
                itemCount: dto.Items.length,
                totalValue: totalValue,
                journalCode: result.journalCode,
                items: result.stockIn.StockInItems.map((item) => ({
                    productCode: item.Product.Code,
                    productName: item.Product.Name,
                    quantity: Number(item.Quantity),
                    unitCost: Number(item.UnitPrice),
                    subtotal: Number(item.Subtotal),
                })),
            },
        };
    }
    async TransferStock(dto, UserId) {
        const [fromWarehouse, toWarehouse] = await Promise.all([
            this.prisma.warehouse.findUnique({ where: { ID: dto.FromWarehouseId } }),
            this.prisma.warehouse.findUnique({ where: { ID: dto.ToWarehouseId } }),
        ]);
        if (!fromWarehouse)
            throw new common_1.NotFoundException('Source Warehouse not found');
        if (!toWarehouse)
            throw new common_1.NotFoundException('Destination Warehouse not found');
        if (dto.FromWarehouseId === dto.ToWarehouseId) {
            throw new common_1.BadRequestException('Source and destination Warehouse cannot be the same');
        }
        const Code = await this.generateTransferCode();
        const TotalItems = dto.TransferItems.reduce((sum, item) => sum + item.Quantity, 0);
        await this.prisma.$transaction(async (tx) => {
            await tx.stockTransfer.create({
                data: {
                    Code: Code,
                    Date: new Date(),
                    FromWarehouseID: dto.FromWarehouseId,
                    ToWarehouseID: dto.ToWarehouseId,
                    TotalItems: new client_1.Prisma.Decimal(TotalItems),
                    StatusID: 1,
                    Notes: null,
                    CreatedByID: UserId,
                    TransferItems: {
                        create: dto.TransferItems.map((item) => ({
                            ProductID: item.ProductId,
                            Quantity: new client_1.Prisma.Decimal(item.Quantity),
                            UnitID: 1,
                            UnitPrice: new client_1.Prisma.Decimal(0),
                            Subtotal: new client_1.Prisma.Decimal(0),
                        })),
                    },
                },
            });
            for (const item of dto.TransferItems) {
                await tx.productStock.upsert({
                    where: {
                        ProductID_WarehouseID: {
                            ProductID: item.ProductId,
                            WarehouseID: dto.FromWarehouseId,
                        },
                    },
                    update: { Quantity: { decrement: new client_1.Prisma.Decimal(item.Quantity) } },
                    create: {
                        ProductID: item.ProductId,
                        WarehouseID: dto.FromWarehouseId,
                        Quantity: new client_1.Prisma.Decimal(-item.Quantity),
                        MinimumStock: new client_1.Prisma.Decimal(0),
                    },
                });
                await tx.productStock.upsert({
                    where: {
                        ProductID_WarehouseID: {
                            ProductID: item.ProductId,
                            WarehouseID: dto.ToWarehouseId,
                        },
                    },
                    update: { Quantity: { increment: new client_1.Prisma.Decimal(item.Quantity) } },
                    create: {
                        ProductID: item.ProductId,
                        WarehouseID: dto.ToWarehouseId,
                        Quantity: new client_1.Prisma.Decimal(item.Quantity),
                        MinimumStock: new client_1.Prisma.Decimal(0),
                    },
                });
            }
        });
        return {
            success: true,
            Transfer: {
                Code: Code,
                FromWarehouse: fromWarehouse.Name,
                ToWarehouse: toWarehouse.Name,
                TotalItems: TotalItems,
                ItemCount: dto.TransferItems.length,
                Status: 'COMPLETED',
            },
        };
    }
    async adjustStock(dto, UserId) {
        const Warehouse = await this.prisma.warehouse.findUnique({
            where: { ID: dto.WarehouseId },
        });
        if (!Warehouse)
            throw new common_1.NotFoundException('Warehouse not found');
        const Code = await this.generateAdjustmentCode(dto.AdjustmentType);
        const isStockIn = dto.AdjustmentType === 'STOCK_IN';
        await this.prisma.$transaction(async (tx) => {
            const Record = isStockIn
                ? await tx.stockIn.create({
                    data: {
                        Code: Code,
                        Date: new Date(),
                        WarehouseID: dto.WarehouseId,
                        SupplierID: null,
                        TotalItems: new client_1.Prisma.Decimal(0),
                        Description: dto.Notes,
                        StatusID: 1,
                        CreatedByID: UserId,
                    },
                })
                : await tx.stockOut.create({
                    data: {
                        Code: Code,
                        Date: new Date(),
                        WarehouseID: dto.WarehouseId,
                        TotalItems: new client_1.Prisma.Decimal(0),
                        Description: dto.Notes,
                        StatusID: 1,
                        CreatedByID: UserId,
                    },
                });
            for (const item of dto.AdjustmentItems) {
                if (isStockIn) {
                    await tx.stockInItem.create({
                        data: {
                            StockInID: Record.ID,
                            ProductID: item.ProductId,
                            Quantity: new client_1.Prisma.Decimal(Math.abs(item.Quantity)),
                            UnitID: 1,
                            UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice || 0),
                            Subtotal: new client_1.Prisma.Decimal((item.UnitPrice || 0) * Math.abs(item.Quantity)),
                        },
                    });
                    await tx.productStock.update({
                        where: {
                            ProductID_WarehouseID: {
                                ProductID: item.ProductId,
                                WarehouseID: dto.WarehouseId,
                            },
                        },
                        data: { Quantity: { increment: new client_1.Prisma.Decimal(Math.abs(item.Quantity)) } },
                    }).catch(() => {
                        return tx.productStock.create({
                            data: {
                                ProductID: item.ProductId,
                                WarehouseID: dto.WarehouseId,
                                Quantity: new client_1.Prisma.Decimal(Math.abs(item.Quantity)),
                                MinimumStock: new client_1.Prisma.Decimal(0),
                            },
                        });
                    });
                }
                else {
                    await tx.stockOutItem.create({
                        data: {
                            StockOutID: Record.ID,
                            ProductID: item.ProductId,
                            Quantity: new client_1.Prisma.Decimal(Math.abs(item.Quantity)),
                            UnitID: 1,
                            UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice || 0),
                            Subtotal: new client_1.Prisma.Decimal((item.UnitPrice || 0) * Math.abs(item.Quantity)),
                        },
                    });
                    await tx.productStock.update({
                        where: {
                            ProductID_WarehouseID: {
                                ProductID: item.ProductId,
                                WarehouseID: dto.WarehouseId,
                            },
                        },
                        data: { Quantity: { decrement: new client_1.Prisma.Decimal(Math.abs(item.Quantity)) } },
                    }).catch(() => {
                        return tx.productStock.create({
                            data: {
                                ProductID: item.ProductId,
                                WarehouseID: dto.WarehouseId,
                                Quantity: new client_1.Prisma.Decimal(0),
                                MinimumStock: new client_1.Prisma.Decimal(0),
                            },
                        });
                    });
                }
            }
        });
        return {
            success: true,
            adjustment: {
                Code: Code,
                Type: dto.AdjustmentType,
                Warehouse: Warehouse.Name,
                ItemCount: dto.AdjustmentItems.length,
                Notes: dto.Notes,
            },
        };
    }
    async performStockOpName(dto, UserId) {
        const Warehouse = await this.prisma.warehouse.findUnique({
            where: { ID: dto.WarehouseId },
        });
        if (!Warehouse)
            throw new common_1.NotFoundException('Warehouse not found');
        const Code = await this.generateOpNameCode();
        const OpNameDate = dto.OpNameDate ? new Date(dto.OpNameDate) : new Date();
        await this.prisma.$transaction(async (tx) => {
            const newOpName = await tx.stockOpname.create({
                data: {
                    Code: Code,
                    Date: OpNameDate,
                    WarehouseID: dto.WarehouseId,
                    TotalItems: new client_1.Prisma.Decimal(dto.OpNameItems.length),
                    StatusID: 1,
                    Notes: dto.Notes,
                    CreatedByID: UserId,
                },
            });
            for (const item of dto.OpNameItems) {
                const ProductStock = await tx.productStock.findUnique({
                    where: {
                        ProductID_WarehouseID: {
                            ProductID: item.ProductId,
                            WarehouseID: dto.WarehouseId,
                        },
                    },
                });
                const systemStock = ProductStock ? Number(ProductStock.Quantity) : 0;
                const difference = item.CountedStock - systemStock;
                await tx.stockOpnameItem.create({
                    data: {
                        StockOpnameID: newOpName.ID,
                        ProductID: item.ProductId,
                        SystemStock: new client_1.Prisma.Decimal(systemStock),
                        CountedStock: new client_1.Prisma.Decimal(item.CountedStock),
                        Difference: new client_1.Prisma.Decimal(difference),
                        UnitID: 1,
                        UnitPrice: new client_1.Prisma.Decimal(0),
                        Note: item.Notes,
                    },
                });
                await tx.productStock.update({
                    where: {
                        ProductID_WarehouseID: {
                            ProductID: item.ProductId,
                            WarehouseID: dto.WarehouseId,
                        },
                    },
                    data: { Quantity: new client_1.Prisma.Decimal(item.CountedStock) },
                }).catch(() => {
                    return tx.productStock.create({
                        data: {
                            ProductID: item.ProductId,
                            WarehouseID: dto.WarehouseId,
                            Quantity: new client_1.Prisma.Decimal(item.CountedStock),
                            MinimumStock: new client_1.Prisma.Decimal(0),
                        },
                    });
                });
            }
        });
        let TotalPositive = 0;
        let TotalNegative = 0;
        for (const item of dto.OpNameItems) {
            const ProductStock = await this.prisma.productStock.findUnique({
                where: {
                    ProductID_WarehouseID: {
                        ProductID: item.ProductId,
                        WarehouseID: dto.WarehouseId,
                    },
                },
            });
            const systemStock = ProductStock ? Number(ProductStock.Quantity) : 0;
            const difference = item.CountedStock - systemStock;
            if (difference > 0)
                TotalPositive += difference;
            else
                TotalNegative += Math.abs(difference);
        }
        return {
            success: true,
            opName: {
                Code: Code,
                Warehouse: Warehouse.Name,
                OpNameDate: OpNameDate,
                ItemCount: dto.OpNameItems.length,
                TotalPositive: TotalPositive,
                TotalNegative: TotalNegative,
                Status: 'COMPLETED',
            },
        };
    }
    async getStockReport(dto) {
        const where = {};
        if (dto.WarehouseId)
            where.WarehouseID = dto.WarehouseId;
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate)
                where.Date.gte = new Date(dto.StartDate);
            if (dto.EndDate)
                where.Date.lte = new Date(dto.EndDate);
        }
        const [StockIns, StockOuts, Transfers] = await Promise.all([
            this.prisma.stockIn.findMany({
                where,
                include: { StockInItems: { include: { Product: true } }, Warehouse: true },
                orderBy: { Date: 'desc' },
            }),
            this.prisma.stockOut.findMany({
                where,
                include: { StockOutItems: { include: { Product: true } }, Warehouse: true },
                orderBy: { Date: 'desc' },
            }),
            this.prisma.stockTransfer.findMany({
                where: {
                    Date: where.Date,
                    OR: dto.WarehouseId ? [
                        { FromWarehouseID: dto.WarehouseId },
                        { ToWarehouseID: dto.WarehouseId },
                    ] : undefined,
                },
                include: {
                    FromWarehouse: true,
                    ToWarehouse: true,
                    TransferItems: { include: { Product: true } },
                },
                orderBy: { Date: 'desc' },
            }),
        ]);
        return {
            period: { StartDate: dto.StartDate, EndDate: dto.EndDate },
            Summary: {
                TotalStockIns: StockIns.length,
                TotalStockOuts: StockOuts.length,
                TotalTransfers: Transfers.length,
                StockInItems: StockIns.reduce((sum, s) => sum + s.StockInItems.length, 0),
                StockOutItems: StockOuts.reduce((sum, s) => sum + s.StockOutItems.length, 0),
                TransferItems: Transfers.reduce((sum, t) => sum + t.TransferItems.length, 0),
            },
            StockIns: StockIns.map((s) => ({
                ID: s.ID,
                Code: s.Code,
                Date: s.Date,
                Warehouse: s.Warehouse.Name,
                ItemCount: s.StockInItems.length,
                Description: s.Description,
            })),
            StockOuts: StockOuts.map((s) => ({
                ID: s.ID,
                Code: s.Code,
                Date: s.Date,
                Warehouse: s.Warehouse.Name,
                ItemCount: s.StockOutItems.length,
                Description: s.Description,
            })),
            Transfers: Transfers.map((t) => ({
                ID: t.ID,
                Code: t.Code,
                Date: t.Date,
                FromWarehouse: t.FromWarehouse.Name,
                ToWarehouse: t.ToWarehouse.Name,
                ItemCount: t.TransferItems.length,
            })),
        };
    }
    async getStockValuation(dto) {
        const where = { IsActive: true };
        if (dto.WarehouseId)
            where.WarehouseID = dto.WarehouseId;
        if (dto.CategoryId)
            where.CategoryID = dto.CategoryId;
        const Products = await this.prisma.product.findMany({
            where,
            include: {
                Category: true,
                Brand: true,
                Unit: true,
                ProductStocks: dto.WarehouseId
                    ? { where: { WarehouseID: dto.WarehouseId } }
                    : undefined,
            },
            orderBy: { Name: 'asc' },
        });
        const items = Products.map((p) => {
            const Stock = dto.WarehouseId
                ? Number(p.ProductStocks?.[0]?.Quantity || p.Stock)
                : (0, number_1.number)(p.Stock);
            const PurchasePrice = Number(p.PurchasePrice);
            const sellingPrice = Number(p.SellingPrice);
            return {
                ID: p.ID,
                Code: p.Code,
                Name: p.Name,
                Category: p.Category?.Name,
                Brand: p.Brand?.Name,
                Unit: p.Unit?.Name,
                CurrentStock: Stock,
                PurchasePrice: PurchasePrice,
                SellingPrice: sellingPrice,
                CostValue: Stock * PurchasePrice,
                RetailValue: Stock * sellingPrice,
                GrossProfit: Stock * (sellingPrice - PurchasePrice),
            };
        });
        const Summary = {
            TotalProducts: items.length,
            TotalCostValue: items.reduce((sum, i) => sum + i.CostValue, 0),
            TotalRetailValue: items.reduce((sum, i) => sum + i.RetailValue, 0),
            TotalGrossProfit: items.reduce((sum, i) => sum + i.GrossProfit, 0),
        };
        return { Summary, items };
    }
    async fixBalance(dto, UserId) {
        const warehouse = await this.prisma.warehouse.findUnique({
            where: { ID: dto.WarehouseId },
        });
        if (!warehouse)
            throw new common_1.NotFoundException('Warehouse not found');
        const Code = await this.generateFixBalanceCode();
        const fixedItems = [];
        const totalAdjustment = { positive: 0, negative: 0 };
        await this.prisma.$transaction(async (tx) => {
            const stockOut = await tx.stockOut.create({
                data: {
                    Code: Code,
                    Date: new Date(),
                    WarehouseID: dto.WarehouseId,
                    TotalItems: new client_1.Prisma.Decimal(0),
                    Description: dto.Notes || 'Stock Balance Correction',
                    StatusID: 1,
                    CreatedByID: UserId,
                },
            });
            for (const item of dto.Items) {
                const difference = item.ActualStock - item.CurrentStock;
                if (difference === 0)
                    continue;
                const product = await tx.product.findUnique({
                    where: { ID: item.ProductId },
                });
                if (!product)
                    continue;
                await tx.productStock.update({
                    where: {
                        ProductID_WarehouseID: {
                            ProductID: item.ProductId,
                            WarehouseID: dto.WarehouseId,
                        },
                    },
                    data: { Quantity: new client_1.Prisma.Decimal(item.ActualStock) },
                }).catch(() => {
                    return tx.productStock.create({
                        data: {
                            ProductID: item.ProductId,
                            WarehouseID: dto.WarehouseId,
                            Quantity: new client_1.Prisma.Decimal(item.ActualStock),
                            MinimumStock: new client_1.Prisma.Decimal(product.MinimumStock || 0),
                        },
                    });
                });
                if (difference !== 0) {
                    await tx.stockOutItem.create({
                        data: {
                            StockOutID: stockOut.ID,
                            ProductID: item.ProductId,
                            Quantity: new client_1.Prisma.Decimal(Math.abs(difference)),
                            UnitID: 1,
                            UnitPrice: new client_1.Prisma.Decimal(product.PurchasePrice || 0),
                            Subtotal: new client_1.Prisma.Decimal(Math.abs(difference) * Number(product.PurchasePrice || 0)),
                        },
                    });
                }
                if (difference > 0)
                    totalAdjustment.positive += difference;
                else
                    totalAdjustment.negative += Math.abs(difference);
                fixedItems.push({
                    productId: item.ProductId,
                    productCode: product.Code,
                    productName: product.Name,
                    previousStock: item.CurrentStock,
                    newStock: item.ActualStock,
                    adjustment: difference,
                    notes: item.Notes,
                });
            }
        });
        return {
            success: true,
            fixBalance: {
                code: Code,
                warehouse: warehouse.Name,
                itemCount: fixedItems.length,
                totalPositive: totalAdjustment.positive,
                totalNegative: totalAdjustment.negative,
                notes: dto.Notes,
                items: fixedItems,
            },
        };
    }
    async generateTransferCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `TRF-${year}${month}`;
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
    async generateAdjustmentCode(Type) {
        const prefix = Type === 'STOCK_IN' ? 'SI' : 'SO';
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const CodePrefix = `${prefix}-${year}${month}`;
        const lastRecord = Type === 'STOCK_IN'
            ? await this.prisma.stockIn.findFirst({
                where: { Code: { startsWith: CodePrefix } },
                orderBy: { Code: 'desc' },
                select: { Code: true },
            })
            : await this.prisma.stockOut.findFirst({
                where: { Code: { startsWith: CodePrefix } },
                orderBy: { Code: 'desc' },
                select: { Code: true },
            });
        let nextNumber = 1;
        if (lastRecord) {
            const lastSeq = parseInt(lastRecord.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${CodePrefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    async generateOpNameCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `OPN-${year}${month}`;
        const lastOpName = await this.prisma.stockOpname.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastOpName) {
            const lastSeq = parseInt(lastOpName.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    async generateOpeningStockCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `OPS-${year}${month}`;
        const lastRecord = await this.prisma.stockIn.findFirst({
            where: {
                Code: { startsWith: prefix },
                Description: { contains: 'Opening Stock' },
            },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastRecord) {
            const lastSeq = parseInt(lastRecord.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    async generateJournalCode(tx) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `JE-${year}${month}`;
        const lastEntry = await tx.journalEntry.findFirst({
            where: { JournalNumber: { startsWith: prefix } },
            orderBy: { JournalNumber: 'desc' },
            select: { JournalNumber: true },
        });
        let nextNumber = 1;
        if (lastEntry) {
            const lastSeq = parseInt(lastEntry.JournalNumber.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    async generateFixBalanceCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `FIX-${year}${month}`;
        const lastRecord = await this.prisma.stockOut.findFirst({
            where: {
                Code: { startsWith: prefix },
                Description: { contains: 'Stock Balance Correction' },
            },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastRecord) {
            const lastSeq = parseInt(lastRecord.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
