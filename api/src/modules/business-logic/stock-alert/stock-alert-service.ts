import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  StockAlertFilterDto,
  ResolveStockAlertDto,
  BulkResolveAlertDto,
  ReOrderStockDto,
  StockLevelReportDto,
} from './Stock-Alert.dto';

@Injectable()
export class StockAlertService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK ALERT LISTING & OVERVIEW
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get all Stock Alerts with filters
   * Flow: Owner/kasir lihat daftar produk yang stoknya rendah
   */
  async getStockAlerts(dto: StockAlertFilterDto) {
    const where: any = {};

    if (dto.UnreadOnly) {
      where.IsRead = false;
    }

    if (dto.unresolvedOnly) {
      where.IsResolved = false;
    }

    if (dto.AlertTypeId) {
      where.AlertTypeID = dto.AlertTypeId;
    }

    const Alerts = await this.prisma.stockAlert.findMany({
      where,
      include: {
        Product: {
          include: {
            Category: true,
            Brand: true,
            Unit: true,
          },
        },
        AlertType: true,
      },
      orderBy: { CreatedAt: 'desc' },
    });

    // Filter by Warehouse and Category if needed
    let filteredAlerts = Alerts;

    if (dto.WarehouseId || dto.CategoryId) {
      filteredAlerts = Alerts.filter((Alert) => {
        if (dto.WarehouseId && Alert.Product.WarehouseID !== dto.WarehouseId) {
          return false;
        }
        if (dto.CategoryId && Alert.Product.CategoryID !== dto.CategoryId) {
          return false;
        }
        return true;
      });
    }

    // Group by severity
    const Summary = {
      Total: filteredAlerts.length,
      unread: filteredAlerts.filter((a) => !a.IsRead).length,
      resolved: filteredAlerts.filter((a) => a.IsResolved).length,
      byType: {} as Record<string, Number>,
    };

    for (const Alert of filteredAlerts) {
      const TypeName = Alert.AlertType.Name;
      Summary.byType[TypeName] = (Summary.byType[TypeName] || 0) + 1;
    }

    return {
      Summary,
      Alerts: filteredAlerts.map((a) => ({
        ID: a.ID,
        Product: {
          ID: a.Product.ID,
          Code: a.Product.Code,
          Name: a.Product.Name,
          Category: a.Product.Category?.Name,
          Brand: a.Product.Brand?.Name,
          Unit: a.Product.Unit?.Name,
          CurrentStock: number(a.CurrentStock),
        },
        AlertType: {
          ID: a.AlertType.ID,
          Code: a.AlertType.Code,
          Name: a.AlertType.Name,
          Color: a.AlertType.Color,
        },
        Threshold: number(a.Threshold),
        IsRead: a.IsRead,
        IsResolved: a.IsResolved,
        ResolvedAt: a.ResolvedAt,
        Notes: a.Notes,
        CreatedAt: a.CreatedAt,
      })),
    };
  }

  /**
   * Get dashboard Summary of Stock Alerts
   * Flow: Dashboard tampilkan ringkasan stok rendah
   */
  async getStockAlertSummary(WarehouseId?: number) {
    // Get Products with Stock below minimum
    const lowStockProducts = await this.prisma.product.findMany({
      where: {
        IsActive: true,
        Stock: { lte: 10 }, // Default minimum Stock threshold
        ...(WarehouseId ? { WarehouseID: WarehouseId } : {}),
      },
      include: {
        Category: true,
        Brand: true,
        Unit: true,
      },
      take: 20,
      orderBy: { Stock: 'asc' },
    });

    // Get out of Stock Products
    const outOfStockProducts = await this.prisma.product.findMany({
      where: {
        IsActive: true,
        Stock: { lte: 0 },
        ...(WarehouseId ? { WarehouseID: WarehouseId } : {}),
      },
      include: {
        Category: true,
        Brand: true,
        Unit: true,
      },
      take: 10,
      orderBy: { UpDatedAt: 'desc' },
    });

    // Get unread Alerts Count
    const unreadCount = await this.prisma.stockAlert.Count({
      where: { IsRead: false, IsResolved: false },
    });

    return {
      lowStock: {
        Count: lowStockProducts.length,
        items: lowStockProducts.map((p) => ({
          ID: p.ID,
          Code: p.Code,
          Name: p.Name,
          Category: p.Category?.Name,
          CurrentStock: number(p.Stock),
          MinimumStock: number(p.MinimumStock),
          Unit: p.Unit?.Name,
        })),
      },
      outOfStock: {
        Count: outOfStockProducts.length,
        items: outOfStockProducts.map((p) => ({
          ID: p.ID,
          Code: p.Code,
          Name: p.Name,
          Category: p.Category?.Name,
          CurrentStock: number(p.Stock),
          Unit: p.Unit?.Name,
        })),
      },
      unreadAlerts: unreadCount,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ALERT MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Mark Alert as read
   * Flow: Kasir/admin sudah lihat Alert → tandai sebagai sudah dibaca
   */
  async markAsRead(AlertId: number) {
    const Alert = await this.prisma.stockAlert.findUnique({
      where: { ID: AlertId },
    });

    if (!Alert) {
      throw new NotFoundException('Alert not found');
    }

    await this.prisma.stockAlert.update({
      where: { ID: AlertId },
      data: { IsRead: true },
    });

    return { success: true, AlertId, IsRead: true };
  }

  /**
   * Mark multiple Alerts as read
   */
  async markMultipleAsRead(AlertIds: number[]) {
    await this.prisma.stockAlert.updateMany({
      where: { ID: { in: AlertIds } },
      data: { IsRead: true },
    });

    return { success: true, Count: AlertIds.length };
  }

  /**
   * Resolve an Alert
   * Flow: Stok sudah diisi → Alert ditandai resolved
   */
  async resolveAlert(AlertId: number, dto: ResolveStockAlertDto) {
    const Alert = await this.prisma.stockAlert.findUnique({
      where: { ID: AlertId },
      include: { Product: true },
    });

    if (!Alert) {
      throw new NotFoundException('Alert not found');
    }

    await this.prisma.stockAlert.update({
      where: { ID: AlertId },
      data: {
        IsResolved: true,
        ResolvedAt: new Date(),
        Notes: dto.Notes,
      },
    });

    return {
      success: true,
      AlertId,
      ProductName: Alert.Product.Name,
      ResolvedAt: new Date(),
    };
  }

  /**
   * Bulk resolve Alerts
   * Flow: Owner resolve beberapa Alert sekaligus
   */
  async bulkResolveAlerts(dto: BulkResolveAlertDto) {
    const Alerts = await this.prisma.stockAlert.findMany({
      where: { ID: { in: dto.AlertIds }, IsResolved: false },
    });

    if (Alerts.length !== dto.AlertIds.length) {
      throw new BadRequestException('Some Alerts not found or already resolved');
    }

    await this.prisma.stockAlert.updateMany({
      where: { ID: { in: dto.AlertIds } },
      data: {
        IsResolved: true,
        ResolvedAt: new Date(),
        Notes: dto.Notes,
      },
    });

    return {
      success: true,
      resolvedCount: Alerts.length,
      ResolvedAt: new Date(),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK LEVEL REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * generate Stock level Report
   * Flow: Owner ingin laporan lengkap stok semua produk
   */
  async getStockLevelReport(dto: StockLevelReportDto) {
    const where: any = { IsActive: true };

    if (dto.CategoryId) {
      where.CategoryID = dto.CategoryId;
    }

    if (dto.WarehouseId) {
      where.WarehouseID = dto.WarehouseId;
    }

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
      orderBy: [{ Category: { Name: 'asc' } }, { Name: 'asc' }],
    });

    const items = Products.map((p) => {
      const Stock = dto.WarehouseId
        ? Number(p.ProductStocks?.[0]?.Quantity || p.Stock)
        : number(p.Stock);
      const minimumStock = dto.WarehouseId
        ? Number(p.ProductStocks?.[0]?.MinimumStock || p.MinimumStock)
        : number(p.MinimumStock);

      let Status: 'OK' | 'LOW' | 'OUT' = 'OK';
      if (Stock <= 0) Status = 'OUT';
      else if (Stock <= minimumStock) Status = 'LOW';

      return {
        ID: p.ID,
        Code: p.Code,
        Name: p.Name,
        Category: p.Category?.Name,
        Brand: p.Brand?.Name,
        Unit: p.Unit?.Name,
        CurrentStock: Stock,
        MinimumStock: minimumStock,
        SellingPrice: number(p.SellingPrice),
        StockValue: Stock * Number(p.SellingPrice),
        Status: Status,
        StockPercentage: minimumStock > 0 ? Math.round((Stock / minimumStock) * 100) : 100,
      };
    });

    // Filter based on Status
    let filteredItems = items;
    if (dto.lowStockOnly) {
      filteredItems = items.filter((i) => i.Status === 'LOW');
    }
    if (dto.outOfStockOnly) {
      filteredItems = items.filter((i) => i.Status === 'OUT');
    }

    const Summary = {
      TotalProducts: items.length,
      OkStock: items.filter((i) => i.Status === 'OK').length,
      LowStock: items.filter((i) => i.Status === 'LOW').length,
      OutOfStock: items.filter((i) => i.Status === 'OUT').length,
      TotalStockValue: items.reduce((sum, i) => sum + i.StockValue, 0),
    };

    return { Summary, items: filteredItems };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REORDER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create reOrder suggestion for low Stock Product
   * Flow: Sistem suggest berapa jumlah yang harus diOrder ulang
   */
  async createReOrderSuggestion(ProductId: number) {
    const Product = await this.prisma.product.findUnique({
      where: { ID: ProductId },
      include: {
        Category: true,
        Unit: true,
      },
    });

    if (!Product) {
      throw new NotFoundException('Product not found');
    }

    const currentStock = Number(Product.Stock);
    const minimumStock = Number(Product.MinimumStock);
    const PurchasePrice = Number(Product.PurchasePrice);

    // Calculate suggested reOrder Quantity (bring back to 2x minimum)
    const TargetStock = minimumStock * 2;
    const suggestedQuantity = Math.max(0, TargetStock - currentStock);

    // Get average monthly Sales (simplified - would need Sales history)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const SalesData = await this.prisma.saleItem.aggregate({
      where: {
        ProductID: ProductId,
        Sale: { Date: { gte: thirtyDaysAgo } },
      },
      _sum: { Quantity: true },
      _Count: true,
    });

    const avgMonthlySales = SalesData._sum.Quantity
      ? Number(SalesData._sum.Quantity) / 1
      : 0;

    // Calculate days until Stockout
    const daysUntilStockout = avgMonthlySales > 0
      ? Math.round(currentStock / (avgMonthlySales / 30))
      : 999;

    return {
      Product: {
        ID: Product.ID,
        Code: Product.Code,
        Name: Product.Name,
        Category: Product.Category?.Name,
        Unit: Product.Unit?.Name,
        PurchasePrice: PurchasePrice,
      },
      CurrentStock: currentStock,
      MinimumStock: minimumStock,
      SuggestedQuantity: suggestedQuantity,
      TargetStock: TargetStock,
      EstimatedCost: suggestedQuantity * PurchasePrice,
      AvgMonthlySales: number(avgMonthlySales),
      DaysUntilStockout: daysUntilStockout === 999 ? 'Unknown' : daysUntilStockout,
      UrgencyLevel: daysUntilStockout <= 7 ? 'CRITICAL' : daysUntilStockout <= 14 ? 'HIGH' : 'NORMAL',
    };
  }

  /**
   * generate Purchase Order from reOrder suggestions
   * Flow: Owner approve suggestion → sistem buat Purchase Order
   */
  async generateReOrderPurchaseOrder(dto: ReOrderStockDto) {
    const [Product, Supplier] = await Promise.all([
      this.prisma.product.findUnique({ where: { ID: dto.ProductId } }),
      this.prisma.supplier.findUnique({ where: { ID: dto.SupplierId } }),
    ]);

    if (!Product) {
      throw new NotFoundException('Product not found');
    }

    if (!Supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const UnitPrice = Number(Product.PurchasePrice);
    const subTotal = dto.reOrderQuantity * UnitPrice;

    // generate Purchase Order Code
    const Code = await this.generatePurchaseOrderCode();

    // Create Purchase Order
    const PurchaseOrder = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.purchaseOrder.create({
        data: {
          Code: Code,
          Date: new Date(),
          SupplierID: dto.SupplierId,
          SubTotal: new Prisma.Decimal(subTotal),
          DiscountAmount: new Prisma.Decimal(0),
          DiscountPercent: new Prisma.Decimal(0),
          TaxAmount: new Prisma.Decimal(0),
          TaxPercent: new Prisma.Decimal(0),
          Total: new Prisma.Decimal(subTotal),
          DownPayment: new Prisma.Decimal(0),
          PaymentStatusID: 1, // PENDING
          StatusID: 1, // DRAFT
          Notes: dto.Notes,
          CreatedByID: 'system',
          PurchaseOrderItems: {
            create: {
              ProductID: dto.ProductId,
              Quantity: new Prisma.Decimal(dto.reOrderQuantity),
              UnitID: Product.UnitID,
              UnitPrice: new Prisma.Decimal(UnitPrice),
              SubTotal: new Prisma.Decimal(subTotal),
            },
          },
        },
        include: {
          Supplier: true,
          PurchaseOrderItems: { include: { Product: true, Unit: true } },
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          Type: 'AUTO_REORDER',
          Title: 'Auto ReOrder Created',
          Description: `ReOrder for ${Product.Name} (Qty: ${dto.reOrderQuantity}) from ${Supplier.Name}`,
          ReferenceType: 'PURCHASE_ORDER',
          ReferenceID: newOrder.ID,
          Amount: new Prisma.Decimal(subTotal),
          CreatedByID: 'system',
        },
      });

      return newOrder;
    });

    return {
      success: true,
      PurchaseOrder: {
        ID: PurchaseOrder.ID,
        Code: PurchaseOrder.Code,
        Supplier: {
          ID: Supplier.ID,
          Name: Supplier.Name,
        },
        Items: PurchaseOrder.PurchaseOrderItems.map((item) => ({
          ProductName: item.Product.Name,
          Quantity: number(item.Quantity),
          UnitPrice: number(item.UnitPrice),
          SubTotal: number(item.SubTotal),
        })),
        Total: number(PurchaseOrder.Total),
      },
    };
  }

  /**
   * Get list of Products that need reOrder
   * Flow: Owner/CFO lihat daftar produk yang perlu reOrder
   */
  async getProductsNeedingReOrder(WarehouseId?: number) {
    const where: any = {
      IsActive: true,
      Stock: { lte: 10 }, // Default minimum Stock threshold
    };

    if (WarehouseId) {
      where.WarehouseID = WarehouseId;
    }

    const Products = await this.prisma.product.findMany({
      where,
      include: {
        Category: true,
        Brand: true,
        Unit: true,
      },
      orderBy: { Stock: 'asc' },
    });

    const suggestions = await Promise.all(
      Products.map(async (p) => {
        const suggestion = await this.createReOrderSuggestion(p.ID);
        return suggestion;
      }),
    );

    return {
      Count: suggestions.length,
      items: suggestions.filter((s) => s.SuggestedQuantity > 0),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTO-STOCK CHECK (Can be called by Scheduler)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Check all Products and create Alerts for low Stock
   * Flow: Scheduler/system auto Check stok → buat Alert jika rendah
   */
  async CheckAndCreateAlerts(WarehouseId?: number) {
    const where: any = { IsActive: true };
    if (WarehouseId) {
      where.WarehouseID = WarehouseId;
    }

    const Products = await this.prisma.product.findMany({
      where,
      include: {
        ProductStocks: WarehouseId ? { where: { WarehouseID: WarehouseId } } : undefined,
        StockAlerts: { where: { IsResolved: false } },
      },
    });

    // Get or create Alert Types
    let lowStockType = await this.prisma.alertType.findFirst({ where: { Code: 'LOW_STOCK' } });
    if (!lowStockType) {
      lowStockType = await this.prisma.alertType.create({
        data: {
          Code: 'LOW_STOCK',
          Name: 'Low Stock',
          Color: '#FFA500',
          IsActive: true,
        },
      });
    }

    let outOfStockType = await this.prisma.alertType.findFirst({ where: { Code: 'OUT_OF_STOCK' } });
    if (!outOfStockType) {
      outOfStockType = await this.prisma.alertType.create({
        data: {
          Code: 'OUT_OF_STOCK',
          Name: 'Out of Stock',
          Color: '#FF0000',
          IsActive: true,
        },
      });
    }

    const createdAlerts: Array<{ID: number}> = [];

    for (const Product of Products) {
      const currentStock = WarehouseId
        ? Number(Product.ProductStocks?.[0]?.Quantity || Product.Stock)
        : number(Product.Stock);
      const minimumStock = WarehouseId
        ? Number(Product.ProductStocks?.[0]?.MinimumStock || Product.MinimumStock)
        : number(Product.MinimumStock);

      // Skip if no Active unresolved Alerts
      if (Product.StockAlerts.length > 0) continue;

      // Determine Alert Type
      let AlertTypeId: number;
      if (currentStock <= 0) {
        AlertTypeId = outOfStockType.ID;
      } else if (currentStock <= minimumStock) {
        AlertTypeId = lowStockType.ID;
      } else {
        continue;
      }

      const Alert = await this.prisma.stockAlert.create({
        data: {
          ProductID: Product.ID,
          AlertTypeID: AlertTypeId,
          Threshold: minimumStock,
          CurrentStock: new Prisma.Decimal(currentStock),
          IsRead: false,
          IsResolved: false,
        },
      });

      createdAlerts.push(Alert);
    }

    return {
      Checked: Products.length,
      AlertsCreated: createdAlerts.length,
      AlertIds: createdAlerts.map((a) => a.ID),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generatePurchaseOrderCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `PO-${year}${month}`;

    const lastOrder = await this.prisma.purchaseOrder.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
