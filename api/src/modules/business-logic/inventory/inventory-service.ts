import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  StockTransferDto,
  StockAdjustmentDto,
  StockOpNameDto,
  StockReportDto,
  ValuationReportDto,
} from './inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK TRANSFER
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Transfer Stock between Warehouses
   * Flow: Owner/pengelola pindahkan stok dari gudang A ke gudang B
   */
  async TransferStock(dto: StockTransferDto, UserId: string) {
    // Validate Warehouses
    const [fromWarehouse, toWarehouse] = await Promise.all([
      this.prisma.warehouse.findUnique({ where: { ID: dto.FromWarehouseId } }),
      this.prisma.warehouse.findUnique({ where: { ID: dto.ToWarehouseId } }),
    ]);

    if (!fromWarehouse) throw new NotFoundException('Source Warehouse not found');
    if (!toWarehouse) throw new NotFoundException('Destination Warehouse not found');

    if (dto.FromWarehouseId === dto.ToWarehouseId) {
      throw new BadRequestException('Source and destination Warehouse cannot be the same');
    }

    // generate Transfer Code
    const Code = await this.generateTransferCode();

    // Calculate Total items
    const TotalItems = dto.TransferItems.reduce((sum, item) => sum + item.Quantity, 0);

    // Execute Transfer
    await this.prisma.$transaction(async (tx) => {
      // Create Transfer Record
      await tx.stockTransfer.create({
        data: {
          Code: Code,
          Date: new Date(),
          FromWarehouseID: dto.FromWarehouseId,
          ToWarehouseID: dto.ToWarehouseId,
          TotalItems: new Prisma.Decimal(TotalItems),
          StatusID: 1,
          Notes: null,
          CreatedByID: UserId,
          TransferItems: {
            create: dto.TransferItems.map((item) => ({
              ProductID: item.ProductId,
              Quantity: new Prisma.Decimal(item.Quantity),
              UnitID: 1,
              UnitPrice: new Prisma.Decimal(0),
              Subtotal: new Prisma.Decimal(0),
            })),
          },
        },
      });

      // Update Stock in source Warehouse (decrease)
      for (const item of dto.TransferItems) {
        // Decrease from source Warehouse Stock (use upsert for safety)
        await tx.productStock.upsert({
          where: {
            ProductID_WarehouseID: {
              ProductID: item.ProductId,
              WarehouseID: dto.FromWarehouseId,
            },
          },
          update: { Quantity: { decrement: new Prisma.Decimal(item.Quantity) } },
          create: {
            ProductID: item.ProductId,
            WarehouseID: dto.FromWarehouseId,
            Quantity: new Prisma.Decimal(-item.Quantity),
            MinimumStock: new Prisma.Decimal(0),
          },
        });

        // Increase in destination Warehouse
        await tx.productStock.upsert({
          where: {
            ProductID_WarehouseID: {
              ProductID: item.ProductId,
              WarehouseID: dto.ToWarehouseId,
            },
          },
          update: { Quantity: { increment: new Prisma.Decimal(item.Quantity) } },
          create: {
            ProductID: item.ProductId,
            WarehouseID: dto.ToWarehouseId,
            Quantity: new Prisma.Decimal(item.Quantity),
            MinimumStock: new Prisma.Decimal(0),
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

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK ADJUSTMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Adjust Stock (Stock In / Stock Out / Correction)
   * Flow: Owner/pengelola koreksi stok (barang masuk/keluar/dikoreksi)
   */
  async adjustStock(dto: StockAdjustmentDto, UserId: string) {
    // Validate Warehouse
    const Warehouse = await this.prisma.warehouse.findUnique({
      where: { ID: dto.WarehouseId },
    });

    if (!Warehouse) throw new NotFoundException('Warehouse not found');

    const Code = await this.generateAdjustmentCode(dto.AdjustmentType);

    const isStockIn = dto.AdjustmentType === 'STOCK_IN';

    await this.prisma.$transaction(async (tx) => {
      // Create Stock in or out Record
      const Record = isStockIn
        ? await tx.stockIn.create({
            data: {
              Code: Code,
              Date: new Date(),
              WarehouseID: dto.WarehouseId,
              SupplierID: null,
              TotalItems: new Prisma.Decimal(0),
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
              TotalItems: new Prisma.Decimal(0),
              Description: dto.Notes,
              StatusID: 1,
              CreatedByID: UserId,
            },
          });

      // Create items and update Stock
      for (const item of dto.AdjustmentItems) {
        if (isStockIn) {
          await tx.stockInItem.create({
            data: {
              StockInID: Record.ID,
              ProductID: item.ProductId,
              Quantity: new Prisma.Decimal(Math.abs(item.Quantity)),
              UnitID: 1,
              UnitPrice: new Prisma.Decimal(item.UnitPrice || 0),
              Subtotal: new Prisma.Decimal((item.UnitPrice || 0) * Math.abs(item.Quantity)),
            },
          });

          // Increase Stock
          await tx.productStock.update({
            where: {
              ProductID_WarehouseID: {
                ProductID: item.ProductId,
                WarehouseID: dto.WarehouseId,
              },
            },
            data: { Quantity: { increment: new Prisma.Decimal(Math.abs(item.Quantity)) } },
          }).catch(() => {
            return tx.productStock.create({
              data: {
                ProductID: item.ProductId,
                WarehouseID: dto.WarehouseId,
                Quantity: new Prisma.Decimal(Math.abs(item.Quantity)),
                MinimumStock: new Prisma.Decimal(0),
              },
            });
          });
        } else {
          await tx.stockOutItem.create({
            data: {
              StockOutID: Record.ID,
              ProductID: item.ProductId,
              Quantity: new Prisma.Decimal(Math.abs(item.Quantity)),
              UnitID: 1,
              UnitPrice: new Prisma.Decimal(item.UnitPrice || 0),
              Subtotal: new Prisma.Decimal((item.UnitPrice || 0) * Math.abs(item.Quantity)),
            },
          });

          // Decrease Stock
          await tx.productStock.update({
            where: {
              ProductID_WarehouseID: {
                ProductID: item.ProductId,
                WarehouseID: dto.WarehouseId,
              },
            },
            data: { Quantity: { decrement: new Prisma.Decimal(Math.abs(item.Quantity)) } },
          }).catch(() => {
            return tx.productStock.create({
              data: {
                ProductID: item.ProductId,
                WarehouseID: dto.WarehouseId,
                Quantity: new Prisma.Decimal(0),
                MinimumStock: new Prisma.Decimal(0),
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

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK OPNAME
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Perform Stock opName (Stock take)
   * Flow: Owner/pengelola lakukan Stock opName untuk cek kesesuaian stok
   */
  async performStockOpName(dto: StockOpNameDto, UserId: string) {
    // Validate Warehouse
    const Warehouse = await this.prisma.warehouse.findUnique({
      where: { ID: dto.WarehouseId },
    });

    if (!Warehouse) throw new NotFoundException('Warehouse not found');

    const Code = await this.generateOpNameCode();
    const OpNameDate = dto.OpNameDate ? new Date(dto.OpNameDate) : new Date();

    await this.prisma.$transaction(async (tx) => {
      // Create opName Record
      const newOpName = await tx.stockOpname.create({
        data: {
          Code: Code,
          Date: OpNameDate,
          WarehouseID: dto.WarehouseId,
          TotalItems: new Prisma.Decimal(dto.OpNameItems.length),
          StatusID: 1,
          Notes: dto.Notes,
          CreatedByID: UserId,
        },
      });

      // Create opName items
      for (const item of dto.OpNameItems) {
        // Get current system Stock
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
            SystemStock: new Prisma.Decimal(systemStock),
            CountedStock: new Prisma.Decimal(item.CountedStock),
            Difference: new Prisma.Decimal(difference),
            UnitID: 1,
            UnitPrice: new Prisma.Decimal(0),
            Note: item.Notes,
          },
        });

        // Update system Stock to match Counted (adjustment)
        await tx.productStock.update({
          where: {
            ProductID_WarehouseID: {
              ProductID: item.ProductId,
              WarehouseID: dto.WarehouseId,
            },
          },
          data: { Quantity: new Prisma.Decimal(item.CountedStock) },
        }).catch(() => {
          return tx.productStock.create({
            data: {
              ProductID: item.ProductId,
              WarehouseID: dto.WarehouseId,
              Quantity: new Prisma.Decimal(item.CountedStock),
              MinimumStock: new Prisma.Decimal(0),
            },
          });
        });
      }
    });

    // Calculate Summary
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
      if (difference > 0) TotalPositive += difference;
      else TotalNegative += Math.abs(difference);
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

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get Stock movement Report
   * Flow: Owner ingin laporan movement stok
   */
  async getStockReport(dto: StockReportDto) {
    const where: any = {};
    if (dto.WarehouseId) where.WarehouseID = dto.WarehouseId;
    if (dto.StartDate || dto.EndDate) {
      where.Date = {};
      if (dto.StartDate) where.Date.gte = new Date(dto.StartDate);
      if (dto.EndDate) where.Date.lte = new Date(dto.EndDate);
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

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK VALUATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get Stock valuation Report
   * Flow: Owner ingin tahu nilai stok saat ini
   */
  async getStockValuation(dto: ValuationReportDto) {
    const where: any = { IsActive: true };
    if (dto.WarehouseId) where.WarehouseID = dto.WarehouseId;
    if (dto.CategoryId) where.CategoryID = dto.CategoryId;

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
        : number(p.Stock);
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

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateTransferCode(): Promise<string> {
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

  private async generateAdjustmentCode(Type: string): Promise<string> {
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

  private async generateOpNameCode(): Promise<string> {
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
}
