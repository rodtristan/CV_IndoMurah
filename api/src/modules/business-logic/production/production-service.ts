import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { resolveDateRange } from '../shared/date-range';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateProductionDto,
  ProductionFilterDto,
  CreateBOMDto,
} from './Production.dto';

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCTION MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new Production Order
   * Flow: Production manager buat produksi → sistem cek stok bahan baku → kurangi stok
   */
  async createProduction(dto: CreateProductionDto, UserId: string) {
    // Calculate raw Material Cost
    let rawMaterialCost = 0;
    const itemsWithCost: Array<{
      ProductId: number;
      ProductName: string;
      Quantity: number;
      UnitId: number;
      UnitPrice: number;
      subTotal: number;
    }> = [];

    for (const item of dto.Items) {
      const Product = await this.prisma.product.findUnique({
        where: { ID: item.ProductId },
      });

      if (!Product) {
        throw new NotFoundException(`Product ${item.ProductId} not found`);
      }

      // Check Stock availability
      const availableStock = Number(Product.Stock);
      if (availableStock < item.Quantity) {
        throw new BadRequestException(
          `Insufficient Stock for ${Product.Name}. Available: ${availableStock}, Needed: ${item.Quantity}`,
        );
      }

      const UnitPrice = item.UnitPrice ?? Number(Product.PurchasePrice);
      const subTotal = UnitPrice * item.Quantity;
      rawMaterialCost += subTotal;

      itemsWithCost.push({
        ProductId: item.ProductId,
        ProductName: Product.Name,
        Quantity: item.Quantity,
        UnitId: item.UnitId || Product.UnitID,
        UnitPrice,
        subTotal,
      });
    }

    const laborCost = dto.LaborCost || 0;
    const overheadCost = dto.OverheadCost || 0;
    const TotalCost = rawMaterialCost + laborCost + overheadCost;

    // generate Production Code
    const Code = await this.generateProductionCode();

    // Get completed Status
    const completedStatus = await this.prisma.productionStatus.findFirst({
      where: { Code: 'COMPLETED' },
    });

    const Production = await this.prisma.$transaction(async (tx) => {
      // Create Production Record
      const newProduction = await tx.production.create({
        data: {
          Code: Code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          ProductID: dto.ProductId || null,
          ProductName: dto.ProductName || 'Produk Olahan',
          Quantity: new Prisma.Decimal(dto.Quantity),
          WarehouseID: dto.WarehouseId || null,
          RawMaterialCost: new Prisma.Decimal(rawMaterialCost),
          LaborCost: new Prisma.Decimal(laborCost),
          OverheadCost: new Prisma.Decimal(overheadCost),
          TotalCost: new Prisma.Decimal(TotalCost),
          StatusID: completedStatus?.ID || 2,
          Notes: dto.Notes,
        },
      });

      // Create Production items (BOM detail)
      await tx.productionItem.createMany({
        data: itemsWithCost.map((item) => ({
          ProductionID: newProduction.ID,
          ProductID: item.ProductId,
          ProductName: item.ProductName,
          Quantity: new Prisma.Decimal(item.Quantity),
          UnitID: item.UnitId,
          UnitPrice: new Prisma.Decimal(item.UnitPrice),
          SubTotal: new Prisma.Decimal(item.subTotal),
        })),
      });

      // Decrease raw Material Stock
      for (const item of itemsWithCost) {
        await tx.product.update({
          where: { ID: item.ProductId },
          data: { Stock: { decrement: new Prisma.Decimal(item.Quantity) } },
        });

        if (dto.WarehouseId) {
          await tx.productStock.update({
            where: {
              ProductID_WarehouseID: {
                ProductID: item.ProductId,
                WarehouseID: dto.WarehouseId,
              },
            },
            data: { Quantity: { decrement: new Prisma.Decimal(item.Quantity) } },
          });
        }
      }

      return newProduction;
    });

    return {
      success: true,
      Production: {
        ID: Production.ID,
        Code: Production.Code,
        Date: Production.Date,
        ProductName: Production.ProductName,
        Quantity: number(Production.Quantity),
        WarehouseId: Production.WarehouseID,
        rawMaterialCost,
        laborCost,
        overheadCost,
        TotalCost,
        UnitCost: TotalCost / dto.Quantity,
        Status: completedStatus?.Name || 'Completed',
        items: itemsWithCost,
      },
    };
  }

  /**
   * Get Production by ID
   */
  async getProduction(ProductionId: number) {
    const Production = await this.prisma.production.findUnique({
      where: { ID: ProductionId },
      include: {
        Warehouse: true,
        Product: true,
        Status: true,
        Items: {
          include: { Product: true, Unit: true },
        },
      },
    });

    if (!Production) {
      throw new NotFoundException('Production not found');
    }

    return {
      ID: Production.ID,
      Code: Production.Code,
      Date: Production.Date,
      ProductId: Production.ProductID,
      ProductName: Production.ProductName,
      Quantity: number(Production.Quantity),
      Warehouse: Production.Warehouse,
      rawMaterialCost: number(Production.RawMaterialCost),
      laborCost: number(Production.LaborCost),
      overheadCost: number(Production.OverheadCost),
      TotalCost: number(Production.TotalCost),
      UnitCost: number(Production.TotalCost) / Number(Production.Quantity),
      Status: Production.Status,
      Notes: Production.Notes,
      items: Production.Items.map((item) => ({
        ID: item.ID,
        ProductId: item.ProductID,
        ProductName: item.Product?.Name || item.ProductName,
        ProductCode: item.Product?.Code,
        Quantity: number(item.Quantity),
        Unit: item.Unit?.Name,
        UnitPrice: number(item.UnitPrice),
        subTotal: number(item.Subtotal),
      })),
    };
  }

  /**
   * List Productions
   */
  async listProductions(dto: ProductionFilterDto) {
    const where: any = {};

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

    const Productions = await this.prisma.production.findMany({
      where,
      include: {
        Warehouse: true,
        Product: true,
        Status: true,
        Items: true,
      },
      orderBy: { Date: 'desc' },
    });

    return Productions.map((p) => ({
      ID: p.ID,
      Code: p.Code,
      Date: p.Date,
      ProductName: p.ProductName,
      ProductCode: p.Product?.Code,
      Warehouse: p.Warehouse?.Name,
      Quantity: number(p.Quantity),
      TotalCost: number(p.TotalCost),
      UnitCost: number(p.TotalCost) / Number(p.Quantity),
      Status: p.Status.Name,
      StatusColor: p.Status.Color,
      itemCount: p.Items.length,
    }));
  }

  /**
   * Get Production Cost Report
   */
  async getProductionCostReport(startDate?: string, endDate?: string, WarehouseId?: number) {
    const { start, end } = resolveDateRange(startDate, endDate);
    const where: any = {
      Date: {
        gte: start,
        lte: end,
      },
    };

    if (WarehouseId) {
      where.WarehouseID = Number(WarehouseId);
    }

    const Productions = await this.prisma.production.findMany({
      where,
      include: {
        Warehouse: true,
        Status: true,
      },
      orderBy: { Date: 'desc' },
    });

    const Summary = {
      TotalProductions: Productions.length,
      TotalQuantity: Productions.reduce((sum, p) => sum + Number(p.Quantity), 0),
      TotalRawMaterialCost: Productions.reduce((sum, p) => sum + Number(p.RawMaterialCost), 0),
      TotalLaborCost: Productions.reduce((sum, p) => sum + Number(p.LaborCost), 0),
      TotalOverheadCost: Productions.reduce((sum, p) => sum + Number(p.OverheadCost), 0),
      TotalCost: Productions.reduce((sum, p) => sum + Number(p.TotalCost), 0),
      averageCostPerUnit:
        Productions.reduce((sum, p) => sum + Number(p.TotalCost), 0) /
        Math.max(1, Productions.reduce((sum, p) => sum + Number(p.Quantity), 0)),
    };

    return {
      period: { startDate, endDate },
      Summary,
      Productions: Productions.map((p) => ({
        ID: p.ID,
        Code: p.Code,
        Date: p.Date,
        ProductName: p.ProductName,
        Warehouse: p.Warehouse?.Name,
        Quantity: number(p.Quantity),
        rawMaterialCost: number(p.RawMaterialCost),
        laborCost: number(p.LaborCost),
        overheadCost: number(p.OverheadCost),
        TotalCost: number(p.TotalCost),
        Status: p.Status.Name,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BOM (Bill of Materials) MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get BOM for a Product
   * Flow: Sistem lookup BOM untuk produk tertentu
   */
  async getBOM(ProductId: number) {
    // Get all Productions that use this Product as finished Product
    const Productions = await this.prisma.production.findMany({
      where: {
        ProductID: ProductId,
        Status: { IsTerminal: true },
      },
      include: {
        Items: { include: { Product: true, Unit: true } },
      },
      orderBy: { Date: 'desc' },
    });

    if (Productions.length === 0) {
      // No BOM found, try to construct from most recent Production
      return {
        ProductId,
        hasBOM: false,
        message: 'No BOM found. Create a Production to establish BOM.',
        items: [],
      };
    }

    // Use most recent Production to derive BOM
    const latestProduction = Productions[0];

    // Calculate average Material usage per Unit
    const TotalQuantity = Productions.reduce((sum, p) => sum + Number(p.Quantity), 0);

    const BOMItems = latestProduction.Items.map((item) => ({
      ProductId: item.ProductID,
      ProductName: item.Product?.Name || item.ProductName,
      ProductCode: item.Product?.Code,
      QuantityPerUnit: number(item.Quantity) / Number(latestProduction.Quantity),
      TotalQuantity: number(item.Quantity),
      Unit: item.Unit?.Name,
      UnitPrice: number(item.UnitPrice),
      CostPerUnit: (Number(item.Quantity) * Number(item.UnitPrice)) / Number(latestProduction.Quantity),
    }));

    const TotalMaterialCost = BOMItems.reduce((sum, item) => sum + item.CostPerUnit, 0);

    return {
      ProductId,
      ProductName: latestProduction.ProductName,
      hasBOM: true,
      basedOnProduction: latestProduction.Code,
      QuantityProduced: number(latestProduction.Quantity),
      items: BOMItems,
      TotalMaterialCostPerUnit: TotalMaterialCost,
    };
  }

  /**
   * Calculate Production Cost from BOM
   */
  async calculateProductionCost(ProductId: number, Quantity: number, WarehouseId?: number) {
    const BOM = await this.getBOM(ProductId);

    if (!BOM.hasBOM) {
      throw new BadRequestException('No BOM found for this Product');
    }

    // chance
    const rawMaterialCost = (BOM.TotalMaterialCostPerUnit || 0) * Quantity;
    const itemsNeeded = BOM.items.map((item) => ({
      ProductId: item.ProductId,
      ProductName: item.ProductName,
      QuantityNeeded: item.QuantityPerUnit * Quantity,
      UnitPrice: item.UnitPrice,
      subTotal: item.CostPerUnit * Quantity,
    }));

    // Check Stock availability
    const StockChecks: Array<{
      ProductId: number;
      ProductName: string;
      available: number;
      needed: number;
      sufficient: boolean;
    }> = [];
    let allAvailable = true;

    for (const item of itemsNeeded) {
      const Product = await this.prisma.product.findUnique({
        where: { ID: item.ProductId },
      });

      const available = Number(Product?.Stock || 0);
      const sufficient = available >= item.QuantityNeeded;

      StockChecks.push({
        ProductId: item.ProductId,
        ProductName: item.ProductName,
        available,
        needed: item.QuantityNeeded,
        sufficient,
      });

      if (!sufficient) {
        allAvailable = false;
      }
    }

    return {
      ProductId,
      ProductName: BOM.ProductName,
      Quantity,
      rawMaterialCost,
      laborCost: 0,
      overheadCost: 0,
      TotalEstimatedCost: rawMaterialCost,
      UnitCost: rawMaterialCost / Quantity,
      itemsNeeded,
      StockChecks,
      canProduce: allAvailable,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateProductionCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `PROD-${year}${month}`;

    const lastProduction = await this.prisma.production.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastProduction) {
      const lastSeq = parseInt(lastProduction.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
