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
exports.PriceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let PriceService = class PriceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateSellingPrice(ProductId, dto, UserId) {
        const Product = await this.prisma.product.findUnique({
            where: { ID: ProductId },
        });
        if (!Product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const oldPrice = Number(Product.SellingPrice);
        const newPrice = dto.SellingPrice;
        if (oldPrice === newPrice) {
            throw new common_1.BadRequestException('New Price is the same as current Price');
        }
        const [updatedProduct] = await this.prisma.$transaction([
            this.prisma.product.update({
                where: { ID: ProductId },
                data: { SellingPrice: new client_1.Prisma.Decimal(newPrice) },
            }),
            this.prisma.priceHistory.create({
                data: {
                    ProductID: ProductId,
                    Type: 'SELLING',
                    OldPrice: new client_1.Prisma.Decimal(oldPrice),
                    NewPrice: new client_1.Prisma.Decimal(newPrice),
                    ChangedBy: UserId,
                },
            }),
        ]);
        const PercentChange = oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0;
        return {
            success: true,
            Product: {
                ID: updatedProduct.ID,
                Code: updatedProduct.Code,
                Name: updatedProduct.Name,
                oldPrice,
                newPrice,
                changeAmount: newPrice - oldPrice,
                changePercent: Math.round(PercentChange * 100) / 100,
                Reason: dto.Reason,
            },
        };
    }
    async updatePurchasePrice(ProductId, dto, UserId) {
        const Product = await this.prisma.product.findUnique({
            where: { ID: ProductId },
        });
        if (!Product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const oldPrice = Number(Product.PurchasePrice);
        const newPrice = dto.PurchasePrice;
        if (oldPrice === newPrice) {
            throw new common_1.BadRequestException('New Price is the same as current Price');
        }
        const [updatedProduct] = await this.prisma.$transaction([
            this.prisma.product.update({
                where: { ID: ProductId },
                data: { PurchasePrice: new client_1.Prisma.Decimal(newPrice) },
            }),
            this.prisma.priceHistory.create({
                data: {
                    ProductID: ProductId,
                    Type: 'PURCHASE',
                    OldPrice: new client_1.Prisma.Decimal(oldPrice),
                    NewPrice: new client_1.Prisma.Decimal(newPrice),
                    ChangedBy: UserId,
                },
            }),
        ]);
        const PercentChange = oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0;
        return {
            success: true,
            Product: {
                ID: updatedProduct.ID,
                Code: updatedProduct.Code,
                Name: updatedProduct.Name,
                oldPrice,
                newPrice,
                changeAmount: newPrice - oldPrice,
                changePercent: Math.round(PercentChange * 100) / 100,
                Reason: dto.Reason,
            },
        };
    }
    async bulkUpdatePrices(dto, UserId) {
        const Results = [];
        for (const update of dto.Updates) {
            try {
                const Product = await this.prisma.product.findUnique({
                    where: { ID: update.ProductId },
                });
                if (!Product) {
                    Results.push({
                        ProductId: update.ProductId,
                        success: false,
                        error: 'Product not found',
                    });
                    continue;
                }
                const oldPrice = Number(Product.SellingPrice);
                const newPrice = update.SellingPrice;
                if (oldPrice === newPrice) {
                    Results.push({
                        ProductId: update.ProductId,
                        success: true,
                        skipped: true,
                        reason: 'Same Price',
                    });
                    continue;
                }
                await this.prisma.$transaction([
                    this.prisma.product.update({
                        where: { ID: update.ProductId },
                        data: { SellingPrice: new client_1.Prisma.Decimal(newPrice) },
                    }),
                    this.prisma.priceHistory.create({
                        data: {
                            ProductID: update.ProductId,
                            Type: 'SELLING',
                            OldPrice: new client_1.Prisma.Decimal(oldPrice),
                            NewPrice: new client_1.Prisma.Decimal(newPrice),
                            ChangedBy: UserId,
                        },
                    }),
                ]);
                Results.push({
                    ProductId: update.ProductId,
                    success: true,
                    ProductName: Product.Name,
                    oldPrice,
                    newPrice,
                    change: newPrice - oldPrice,
                });
            }
            catch (error) {
                Results.push({
                    ProductId: update.ProductId,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        const succeeded = Results.filter((r) => r.success && !r.skipped).length;
        const failed = Results.filter((r) => !r.success).length;
        const skipped = Results.filter((r) => r.skipped).length;
        return {
            success: true,
            Summary: {
                Total: dto.Updates.length,
                succeeded,
                failed,
                skipped,
            },
            Results,
            Reason: dto.Reason,
        };
    }
    async adjustPricesByPercent(dto, UserId) {
        const where = { IsActive: true };
        if (dto.CategoryId) {
            where.CategoryID = dto.CategoryId;
        }
        if (dto.ProductIds && dto.ProductIds.length > 0) {
            where.ID = { in: dto.ProductIds };
        }
        const Products = await this.prisma.product.findMany({
            where,
        });
        const Results = [];
        const multiplier = dto.adjustmentType === 'INCREASE'
            ? 1 + dto.adjustmentPercent / 100
            : 1 - dto.adjustmentPercent / 100;
        for (const Product of Products) {
            const oldPrice = Number(Product.SellingPrice);
            const newPrice = Math.round(oldPrice * multiplier);
            if (oldPrice === newPrice)
                continue;
            await this.prisma.$transaction([
                this.prisma.product.update({
                    where: { ID: Product.ID },
                    data: { SellingPrice: new client_1.Prisma.Decimal(newPrice) },
                }),
                this.prisma.priceHistory.create({
                    data: {
                        ProductID: Product.ID,
                        Type: 'SELLING',
                        OldPrice: new client_1.Prisma.Decimal(oldPrice),
                        NewPrice: new client_1.Prisma.Decimal(newPrice),
                        ChangedBy: UserId,
                    },
                }),
            ]);
            Results.push({
                ProductId: Product.ID,
                ProductName: Product.Name,
                oldPrice,
                newPrice,
                change: newPrice - oldPrice,
                changePercent: oldPrice > 0 ? Math.round(((newPrice - oldPrice) / oldPrice) * 10000) / 100 : 0,
            });
        }
        return {
            success: true,
            adjustment: {
                Type: dto.adjustmentType,
                Percent: dto.adjustmentPercent,
                Reason: dto.Reason,
            },
            TotalAdjusted: Results.length,
            Results,
        };
    }
    async getPriceHistory(dto) {
        const where = {};
        if (dto.ProductId) {
            where.ProductID = dto.ProductId;
        }
        if (dto.CategoryId) {
            where.Product = { CategoryID: dto.CategoryId };
        }
        if (dto.Type) {
            where.Type = dto.Type;
        }
        if (dto.StartDate || dto.EndDate) {
            where.ChangedAt = {};
            if (dto.StartDate)
                where.ChangedAt.gte = new Date(dto.StartDate);
            if (dto.EndDate)
                where.ChangedAt.lte = new Date(dto.EndDate);
        }
        const history = await this.prisma.priceHistory.findMany({
            where,
            include: {
                Product: {
                    include: { Category: true },
                },
            },
            orderBy: { ChangedAt: 'desc' },
            take: dto.Limit || 100,
        });
        return history.map((h) => ({
            ID: h.ID,
            ProductId: h.ProductID,
            ProductCode: h.Product.Code,
            ProductName: h.Product.Name,
            Category: h.Product.Category?.Name || null,
            Type: h.Type,
            oldPrice: (0, number_1.number)(h.OldPrice),
            newPrice: (0, number_1.number)(h.NewPrice),
            changeAmount: (0, number_1.number)(h.NewPrice) - Number(h.OldPrice),
            changePercent: Number(h.OldPrice) > 0
                ? Math.round(((Number(h.NewPrice) - Number(h.OldPrice)) / Number(h.OldPrice)) * 10000) / 100
                : 0,
            changedBy: h.ChangedBy,
            changedAt: h.ChangedAt,
        }));
    }
    async getProductPriceHistory(ProductId) {
        const Product = await this.prisma.product.findUnique({
            where: { ID: ProductId },
            include: { Category: true, Brand: true },
        });
        if (!Product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const history = await this.prisma.priceHistory.findMany({
            where: { ProductID: ProductId },
            orderBy: { ChangedAt: 'desc' },
        });
        const currentPrice = Number(Product.SellingPrice);
        const lastChange = history[0];
        return {
            Product: {
                ID: Product.ID,
                Code: Product.Code,
                Name: Product.Name,
                Category: Product.Category?.Name || null,
                Brand: Product.Brand?.Name || null,
                currentPrice,
                PurchasePrice: (0, number_1.number)(Product.PurchasePrice),
            },
            currentPrice,
            lastPriceChange: lastChange
                ? {
                    Date: lastChange.ChangedAt,
                    Type: lastChange.Type,
                    oldPrice: (0, number_1.number)(lastChange.OldPrice),
                    newPrice: (0, number_1.number)(lastChange.NewPrice),
                    changedBy: lastChange.ChangedBy,
                }
                : null,
            history: history.map((h) => ({
                ID: h.ID,
                Type: h.Type,
                oldPrice: (0, number_1.number)(h.OldPrice),
                newPrice: (0, number_1.number)(h.NewPrice),
                change: (0, number_1.number)(h.NewPrice) - Number(h.OldPrice),
                changedBy: h.ChangedBy,
                changedAt: h.ChangedAt,
            })),
        };
    }
    async getPriceChangeReport(dto) {
        const startDate = dto.StartDate ? new Date(dto.StartDate) : this.getStartOfMonth();
        const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();
        const where = {
            ChangedAt: { gte: startDate, lte: endDate },
        };
        if (dto.CategoryId) {
            where.Product = { CategoryID: dto.CategoryId };
        }
        const history = await this.prisma.priceHistory.findMany({
            where,
            include: {
                Product: { include: { Category: true } },
            },
            orderBy: { ChangedAt: 'desc' },
        });
        const byType = {};
        for (const h of history) {
            const change = Number(h.NewPrice) - Number(h.OldPrice);
            if (!byType[h.Type]) {
                byType[h.Type] = { Type: h.Type, Count: 0, TotalIncrease: 0, TotalDecrease: 0 };
            }
            byType[h.Type].Count++;
            if (change > 0) {
                byType[h.Type].TotalIncrease += change;
            }
            else {
                byType[h.Type].TotalDecrease += Math.abs(change);
            }
        }
        const PriceIncreases = history
            .filter((h) => Number(h.NewPrice) > Number(h.OldPrice))
            .slice(0, 10)
            .map((h) => ({
            ProductCode: h.Product.Code,
            ProductName: h.Product.Name,
            Category: h.Product.Category?.Name || null,
            oldPrice: (0, number_1.number)(h.OldPrice),
            newPrice: (0, number_1.number)(h.NewPrice),
            increase: (0, number_1.number)(h.NewPrice) - Number(h.OldPrice),
            increasePercent: Number(h.OldPrice) > 0 ? Math.round(((Number(h.NewPrice) - Number(h.OldPrice)) / Number(h.OldPrice)) * 10000) / 100 : 0,
            Date: h.ChangedAt,
        }));
        const PriceDecreases = history
            .filter((h) => Number(h.NewPrice) < Number(h.OldPrice))
            .slice(0, 10)
            .map((h) => ({
            ProductCode: h.Product.Code,
            ProductName: h.Product.Name,
            Category: h.Product.Category?.Name || null,
            oldPrice: (0, number_1.number)(h.OldPrice),
            newPrice: (0, number_1.number)(h.NewPrice),
            decrease: Number(h.OldPrice) - Number(h.NewPrice),
            decreasePercent: Number(h.OldPrice) > 0 ? Math.round(((Number(h.OldPrice) - Number(h.NewPrice)) / Number(h.OldPrice)) * 10000) / 100 : 0,
            Date: h.ChangedAt,
        }));
        return {
            period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
            Summary: {
                TotalChanges: history.length,
                increases: history.filter((h) => Number(h.NewPrice) > Number(h.OldPrice)).length,
                decreases: history.filter((h) => Number(h.NewPrice) < Number(h.OldPrice)).length,
            },
            byType: Object.values(byType),
            topIncreases: PriceIncreases,
            topDecreases: PriceDecreases,
            allChanges: history.map((h) => ({
                ProductCode: h.Product.Code,
                ProductName: h.Product.Name,
                Type: h.Type,
                oldPrice: (0, number_1.number)(h.OldPrice),
                newPrice: (0, number_1.number)(h.NewPrice),
                change: (0, number_1.number)(h.NewPrice) - Number(h.OldPrice),
                Date: h.ChangedAt,
            })),
        };
    }
    async getPriceAnalysis(dto) {
        const where = { IsActive: true };
        if (dto.ProductId) {
            where.ID = dto.ProductId;
        }
        if (dto.CategoryId) {
            where.CategoryID = dto.CategoryId;
        }
        const Products = await this.prisma.product.findMany({
            where,
            include: {
                Category: true,
                Brand: true,
                PriceHistories: {
                    orderBy: { ChangedAt: 'desc' },
                    take: 10,
                },
            },
        });
        const analysis = Products.map((p) => {
            const history = p.PriceHistories;
            const currentPrice = Number(p.SellingPrice);
            const PurchasePrice = Number(p.PurchasePrice);
            const grossMargin = currentPrice > 0 ? ((currentPrice - PurchasePrice) / currentPrice) * 100 : 0;
            const markup = PurchasePrice > 0 ? ((currentPrice - PurchasePrice) / PurchasePrice) * 100 : 0;
            let PriceTrend = 'STABLE';
            if (history.length >= 2) {
                const oldPrice = Number(history[history.length - 1].OldPrice);
                if (currentPrice > oldPrice)
                    PriceTrend = 'INCREASING';
                else if (currentPrice < oldPrice)
                    PriceTrend = 'DECREASING';
            }
            const increaseCount = history.filter((h) => Number(h.NewPrice) > Number(h.OldPrice)).length;
            const decreaseCount = history.filter((h) => Number(h.NewPrice) < Number(h.OldPrice)).length;
            return {
                ProductId: p.ID,
                ProductCode: p.Code,
                ProductName: p.Name,
                Category: p.Category?.Name || null,
                Brand: p.Brand?.Name || null,
                currentPrice,
                PurchasePrice,
                grossMargin: Math.round(grossMargin * 100) / 100,
                markup: Math.round(markup * 100) / 100,
                PriceTrend,
                PriceChangeCount: history.length,
                increaseCount,
                decreaseCount,
                lastPriceChange: history[0]
                    ? {
                        Date: history[0].ChangedAt,
                        Type: history[0].Type,
                        oldPrice: (0, number_1.number)(history[0].OldPrice),
                        newPrice: (0, number_1.number)(history[0].NewPrice),
                    }
                    : null,
            };
        });
        const avgMargin = analysis.length > 0
            ? analysis.reduce((sum, a) => sum + a.grossMargin, 0) / analysis.length
            : 0;
        const increasingProducts = analysis.filter((a) => a.PriceTrend === 'INCREASING').length;
        const decreasingProducts = analysis.filter((a) => a.PriceTrend === 'DECREASING').length;
        return {
            Summary: {
                TotalProducts: analysis.length,
                averageMargin: Math.round(avgMargin * 100) / 100,
                increasingCount: increasingProducts,
                decreasingCount: decreasingProducts,
                stableCount: analysis.length - increasingProducts - decreasingProducts,
            },
            Products: analysis,
        };
    }
    getStartOfMonth() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
};
exports.PriceService = PriceService;
exports.PriceService = PriceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PriceService);
