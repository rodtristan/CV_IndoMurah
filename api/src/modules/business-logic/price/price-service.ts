import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  UpdateProductPriceDto,
  BulkUpdatePriceDto,
  PriceHistoryFilterDto,
  PriceChangeReportDto,
  PriceAnalysisDto,
} from './price.dto';

@Injectable()
export class PriceService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRICE UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Update Product selling Price
   * Flow: Owner ubah harga jual → sistem catat perubahan harga
   */
  async updateSellingPrice(ProductId: number, dto: UpdateProductPriceDto, UserId: string) {
    const Product = await this.prisma.product.findUnique({
      where: { ID: ProductId },
    });

    if (!Product) {
      throw new NotFoundException('Product not found');
    }

    const oldPrice = Number(Product.SellingPrice);
    const newPrice = dto.SellingPrice;

    if (oldPrice === newPrice) {
      throw new BadRequestException('New Price is the same as current Price');
    }

    // Update Product Price and Record history
    const [updatedProduct] = await this.prisma.$transaction([
      this.prisma.product.update({
        where: { ID: ProductId },
        data: { SellingPrice: new Prisma.Decimal(newPrice) },
      }),
      this.prisma.priceHistory.create({
        data: {
          ProductID: ProductId,
          Type: 'SELLING',
          OldPrice: new Prisma.Decimal(oldPrice),
          NewPrice: new Prisma.Decimal(newPrice),
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

  /**
   * Update Product Purchase Price
   */
  async updatePurchasePrice(ProductId: number, dto: { PurchasePrice: number; Reason?: string }, UserId: string) {
    const Product = await this.prisma.product.findUnique({
      where: { ID: ProductId },
    });

    if (!Product) {
      throw new NotFoundException('Product not found');
    }

    const oldPrice = Number(Product.PurchasePrice);
    const newPrice = dto.PurchasePrice;

    if (oldPrice === newPrice) {
      throw new BadRequestException('New Price is the same as current Price');
    }

    const [updatedProduct] = await this.prisma.$transaction([
      this.prisma.product.update({
        where: { ID: ProductId },
        data: { PurchasePrice: new Prisma.Decimal(newPrice) },
      }),
      this.prisma.priceHistory.create({
        data: {
          ProductID: ProductId,
          Type: 'PURCHASE',
          OldPrice: new Prisma.Decimal(oldPrice),
          NewPrice: new Prisma.Decimal(newPrice),
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

  /**
   * Bulk update Prices
   * Flow: Owner ubah harga banyak produk sekaligus (misal: naikkan 10%)
   */
  async bulkUpdatePrices(dto: BulkUpdatePriceDto, UserId: string) {
    const Results: any[] = [];

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
            data: { SellingPrice: new Prisma.Decimal(newPrice) },
          }),
          this.prisma.priceHistory.create({
            data: {
              ProductID: update.ProductId,
              Type: 'SELLING',
              OldPrice: new Prisma.Decimal(oldPrice),
              NewPrice: new Prisma.Decimal(newPrice),
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
      } catch (error) {
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

  /**
   * Adjust Prices by Percentage
   */
  async adjustPricesByPercent(
    dto: {
      CategoryId?: number;
      ProductIds?: number[];
      adjustmentPercent: number;
      adjustmentType: 'INCREASE' | 'DECREASE';
      Reason?: string;
    },
    UserId: string,
  ) {
    const where: any = { IsActive: true };

    if (dto.CategoryId) {
      where.CategoryID = dto.CategoryId;
    }

    if (dto.ProductIds && dto.ProductIds.length > 0) {
      where.ID = { in: dto.ProductIds };
    }

    const Products = await this.prisma.product.findMany({
      where,
    });

    const Results: any[] = [];
    const multiplier = dto.adjustmentType === 'INCREASE'
      ? 1 + dto.adjustmentPercent / 100
      : 1 - dto.adjustmentPercent / 100;

    for (const Product of Products) {
      const oldPrice = Number(Product.SellingPrice);
      const newPrice = Math.round(oldPrice * multiplier);

      if (oldPrice === newPrice) continue;

      await this.prisma.$transaction([
        this.prisma.product.update({
          where: { ID: Product.ID },
          data: { SellingPrice: new Prisma.Decimal(newPrice) },
        }),
        this.prisma.priceHistory.create({
          data: {
            ProductID: Product.ID,
            Type: 'SELLING',
            OldPrice: new Prisma.Decimal(oldPrice),
            NewPrice: new Prisma.Decimal(newPrice),
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

  // ─────────────────────────────────────────────────────────────────────────────
  // PRICE HISTORY
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get Price history
   */
  async getPriceHistory(dto: PriceHistoryFilterDto) {
    const where: any = {};

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
      if (dto.StartDate) where.ChangedAt.gte = new Date(dto.StartDate);
      if (dto.EndDate) where.ChangedAt.lte = new Date(dto.EndDate);
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
      oldPrice: number(h.OldPrice),
      newPrice: number(h.NewPrice),
      changeAmount: number(h.NewPrice) - Number(h.OldPrice),
      changePercent: Number(h.OldPrice) > 0
        ? Math.round(((Number(h.NewPrice) - Number(h.OldPrice)) / Number(h.OldPrice)) * 10000) / 100
        : 0,
      changedBy: h.ChangedBy,
      changedAt: h.ChangedAt,
    }));
  }

  /**
   * Get Price history for single Product
   */
  async getProductPriceHistory(ProductId: number) {
    const Product = await this.prisma.product.findUnique({
      where: { ID: ProductId },
      include: { Category: true, Brand: true },
    });

    if (!Product) {
      throw new NotFoundException('Product not found');
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
        PurchasePrice: number(Product.PurchasePrice),
      },
      currentPrice,
      lastPriceChange: lastChange
        ? {
            Date: lastChange.ChangedAt,
            Type: lastChange.Type,
            oldPrice: number(lastChange.OldPrice),
            newPrice: number(lastChange.NewPrice),
            changedBy: lastChange.ChangedBy,
          }
        : null,
      history: history.map((h) => ({
        ID: h.ID,
        Type: h.Type,
        oldPrice: number(h.OldPrice),
        newPrice: number(h.NewPrice),
        change: number(h.NewPrice) - Number(h.OldPrice),
        changedBy: h.ChangedBy,
        changedAt: h.ChangedAt,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRICE ANALYSIS & REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get Price change Report
   */
  async getPriceChangeReport(dto: PriceChangeReportDto) {
    const startDate = dto.StartDate ? new Date(dto.StartDate) : this.getStartOfMonth();
    const endDate = dto.EndDate ? new Date(dto.EndDate) : new Date();

    const where: any = {
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

    // Group by Type
    const byType: Record<string, { Type: string; Count: number; TotalIncrease: number; TotalDecrease: number }> = {};

    for (const h of history) {
      const change = Number(h.NewPrice) - Number(h.OldPrice);
      if (!byType[h.Type]) {
        byType[h.Type] = { Type: h.Type, Count: 0, TotalIncrease: 0, TotalDecrease: 0 };
      }
      byType[h.Type].Count++;
      if (change > 0) {
        byType[h.Type].TotalIncrease += change;
      } else {
        byType[h.Type].TotalDecrease += Math.abs(change);
      }
    }

    // Top Price increases
    const PriceIncreases = history
      .filter((h) => Number(h.NewPrice) > Number(h.OldPrice))
      .slice(0, 10)
      .map((h) => ({
        ProductCode: h.Product.Code,
        ProductName: h.Product.Name,
        Category: h.Product.Category?.Name || null,
        oldPrice: number(h.OldPrice),
        newPrice: number(h.NewPrice),
        increase: number(h.NewPrice) - Number(h.OldPrice),
        increasePercent: Number(h.OldPrice) > 0 ? Math.round(((Number(h.NewPrice) - Number(h.OldPrice)) / Number(h.OldPrice)) * 10000) / 100 : 0,
        Date: h.ChangedAt,
      }));

    // Top Price decreases
    const PriceDecreases = history
      .filter((h) => Number(h.NewPrice) < Number(h.OldPrice))
      .slice(0, 10)
      .map((h) => ({
        ProductCode: h.Product.Code,
        ProductName: h.Product.Name,
        Category: h.Product.Category?.Name || null,
        oldPrice: number(h.OldPrice),
        newPrice: number(h.NewPrice),
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
        oldPrice: number(h.OldPrice),
        newPrice: number(h.NewPrice),
        change: number(h.NewPrice) - Number(h.OldPrice),
        Date: h.ChangedAt,
      })),
    };
  }

  /**
   * Get Price analysis
   */
  async getPriceAnalysis(dto: PriceAnalysisDto) {
    const where: any = { IsActive: true };

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

      // Calculate margin
      const grossMargin = currentPrice > 0 ? ((currentPrice - PurchasePrice) / currentPrice) * 100 : 0;
      const markup = PurchasePrice > 0 ? ((currentPrice - PurchasePrice) / PurchasePrice) * 100 : 0;

      // Get Price trend
      let PriceTrend: 'STABLE' | 'INCREASING' | 'DECREASING' = 'STABLE';
      if (history.length >= 2) {
        const oldPrice = Number(history[history.length - 1].OldPrice);
        if (currentPrice > oldPrice) PriceTrend = 'INCREASING';
        else if (currentPrice < oldPrice) PriceTrend = 'DECREASING';
      }

      // Count changes
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
              oldPrice: number(history[0].OldPrice),
              newPrice: number(history[0].NewPrice),
            }
          : null,
      };
    });

    // Summary stats
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

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private getStartOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}
