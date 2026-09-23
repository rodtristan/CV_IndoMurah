import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateWarehouseDto,
  UpDateWarehouseDto,
  WarehouseFilterDto,
  WarehouseStockDto,
  CreateShelfDto,
  UpDateShelfDto,
} from './Warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // WAREHOUSE CRUD
  // ─────────────────────────────────────────────────────────────────────────────

  async createWarehouse(dto: CreateWarehouseDto, UserId: string) {
    const existing = await this.prisma.warehouse.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException(`Warehouse Code '${dto.Code}' already exists`);
    }

    // If setting as Default, unset other Defaults
    if (dto.IsDefault) {
      await this.prisma.warehouse.updateMany({
        where: { IsDefault: true },
        data: { IsDefault: false },
      });
    }

    const Warehouse = await this.prisma.warehouse.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Address: dto.address,
        Phone: dto.phone,
        IsDefault: dto.IsDefault || false,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        Type: 'WAREHOUSE_CREATED',
        Title: 'Warehouse Created',
        Description: `New Warehouse ${Warehouse.Name} created`,
        ReferenceType: 'WAREHOUSE',
        ReferenceID: Warehouse.ID,
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      Warehouse: this.formatWarehouse(Warehouse),
    };
  }

  async updateWarehouse(WarehouseId: number, dto: UpDateWarehouseDto, UserId: string) {
    const Warehouse = await this.prisma.warehouse.findUnique({
      where: { ID: WarehouseId },
    });

    if (!Warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    if (dto.IsDefault) {
      await this.prisma.warehouse.updateMany({
        where: { ID: { not: WarehouseId }, IsDefault: true },
        data: { IsDefault: false },
      });
    }

    const updated = await this.prisma.warehouse.update({
      where: { ID: WarehouseId },
      data: {
        Name: dto.Name,
        Address: dto.address,
        Phone: dto.phone,
        IsDefault: dto.IsDefault,
        IsActive: dto.IsActive,
      },
    });

    return {
      success: true,
      Warehouse: this.formatWarehouse(updated),
    };
  }

  async getWarehouse(WarehouseId: number) {
    const Warehouse = await this.prisma.warehouse.findUnique({
      where: { ID: WarehouseId },
      include: {
        Shelves: true,
        _Count: {
          select: {
            Products: true,
            ProductStocks: true,
          },
        },
      },
    });

    if (!Warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    return {
      ...this.formatWarehouse(Warehouse),
      Shelves: Warehouse.Shelves.map((s) => ({
        ID: s.ID,
        Code: s.Code,
        Name: s.Name,
        Description: s.Description,
      })),
      ProductCount: Warehouse._Count.Products,
      StockCount: Warehouse._Count.ProductStocks,
    };
  }

  async listWarehouses(dto: WarehouseFilterDto) {
    const where: any = {};

    if (dto.Search) {
      where.OR = [
        { Name: { contains: dto.Search, mode: 'insensitive' } },
        { Code: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    if (!dto.includeInActive) {
      where.IsActive = true;
    }

    const Warehouses = await this.prisma.warehouse.findMany({
      where,
      include: {
        _Count: {
          select: {
            Products: true,
            Sales: true,
            Purchases: true,
            Productions: true,
          },
        },
      },
      orderBy: [{ IsDefault: 'desc' }, { Name: 'asc' }],
    });

    return Warehouses.map((w) => ({
      ...this.formatWarehouse(w),
      ProductCount: w._Count.Products,
      SalesCount: w._Count.Sales,
      PurchaseCount: w._Count.Purchases,
      ProductionCount: w._Count.Productions,
    }));
  }

  async deleteWarehouse(WarehouseId: number) {
    const Warehouse = await this.prisma.warehouse.findUnique({
      where: { ID: WarehouseId },
    });

    if (!Warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    if (Warehouse.IsDefault) {
      throw new BadRequestException('Cannot delete Default Warehouse');
    }

    const transactionCount = await this.prisma.sale.Count({
      where: { WarehouseID: WarehouseId },
    });

    if (transactionCount > 0) {
      await this.prisma.warehouse.update({
        where: { ID: WarehouseId },
        data: { IsActive: false },
      });
      return { success: true, message: 'Warehouse deactivated (has transactions)' };
    }

    await this.prisma.warehouse.delete({
      where: { ID: WarehouseId },
    });

    return { success: true, message: 'Warehouse deleted' };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // WAREHOUSE STOCK
  // ─────────────────────────────────────────────────────────────────────────────

  async getWarehouseStock(WarehouseId: number, dto: WarehouseStockDto) {
    const Warehouse = await this.prisma.warehouse.findUnique({
      where: { ID: WarehouseId },
    });

    if (!Warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const where: any = { WarehouseID: WarehouseId };
    const ProductWhere: any = {};

    if (dto.ProductId) {
      ProductWhere.ID = dto.ProductId;
    }

    if (dto.CategoryId) {
      ProductWhere.CategoryID = dto.CategoryId;
    }

    if (dto.lowStockOnly) {
      ProductWhere.AND = [
        { ProductStocks: { some: { WarehouseID: WarehouseId } } },
      ];
    }

    const page = dto.page || 1;
    const limit = dto.limit || 50;
    const skip = (page - 1) * limit;

    const [Stocks, Total] = await Promise.all([
      this.prisma.productStock.findMany({
        where,
        include: {
          Product: {
            include: {
              Category: true,
              Unit: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.productStock.Count({ where }),
    ]);

    const StockData = Stocks
      .map((s) => {
        const Product = s.Product;
        const Quantity = Number(s.Quantity);
        const minimumStock = Number(s.MinimumStock);

        return {
          ProductId: Product.ID,
          ProductCode: Product.Code,
          ProductName: Product.Name,
          Category: Product.Category?.Name,
          Unit: Product.Unit?.Name,
          systemStock: Quantity,
          minimumStock,
          physicalStock: Quantity,
          difference: 0,
          isLowStock: Quantity <= minimumStock,
          location: Warehouse.Name,
        };
      })
      .filter((s) => {
        if (dto.lowStockOnly) {
          return s.isLowStock;
        }
        return true;
      });

    return {
      Warehouse: this.formatWarehouse(Warehouse),
      Stocks: StockData,
      pagination: {
        page,
        limit,
        Total,
        TotalPages: Math.ceil(Total / limit),
      },
    };
  }

  async getWarehouseSummary() {
    const [TotalWarehouses, ActiveWarehouses, DefaultWarehouse] = await Promise.all([
      this.prisma.warehouse.Count(),
      this.prisma.warehouse.Count({ where: { IsActive: true } }),
      this.prisma.warehouse.findFirst({
        where: { IsDefault: true },
      }),
    ]);

    const TotalStockValue = await this.prisma.productStock.aggregate({
      _sum: { Quantity: true },
    });

    const lowStockCount = await this.prisma.productStock.Count({
      where: {
        Quantity: { lte: 10 }, // Default minimum Stock threshold
      },
    });

    return {
      TotalWarehouses,
      ActiveWarehouses,
      DefaultWarehouse: DefaultWarehouse ? this.formatWarehouse(DefaultWarehouse) : null,
      TotalStockQuantity: number(TotalStockValue._sum.Quantity || 0),
      lowStockProductCount: lowStockCount,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SHELF MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  async createShelf(dto: CreateShelfDto, UserId: string) {
    const Warehouse = await this.prisma.warehouse.findUnique({
      where: { ID: dto.WarehouseId },
    });

    if (!Warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const existing = await this.prisma.shelf.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException(`Shelf Code '${dto.Code}' already exists`);
    }

    const Shelf = await this.prisma.shelf.create({
      data: {
        WarehouseID: dto.WarehouseId,
        Code: dto.Code,
        Name: dto.Name,
        Description: dto.Description,
      },
    });

    return {
      success: true,
      Shelf: this.formatShelf(Shelf),
    };
  }

  async updateShelf(ShelfId: number, dto: UpDateShelfDto) {
    const Shelf = await this.prisma.shelf.findUnique({
      where: { ID: ShelfId },
    });

    if (!Shelf) {
      throw new NotFoundException('Shelf not found');
    }

    const updated = await this.prisma.shelf.update({
      where: { ID: ShelfId },
      data: {
        Name: dto.Name,
        Description: dto.Description,
        IsActive: dto.IsActive,
      },
    });

    return {
      success: true,
      Shelf: this.formatShelf(updated),
    };
  }

  async listShelves(WarehouseId: number) {
    const Shelves = await this.prisma.shelf.findMany({
      where: { WarehouseID: WarehouseId, IsActive: true },
      include: {
        _Count: {
          select: { ShelfProducts: true },
        },
      },
    });

    return Shelves.map((s) => ({
      ...this.formatShelf(s),
      ProductCount: s._Count.ShelfProducts,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private formatWarehouse(Warehouse: any) {
    return {
      ID: Warehouse.ID,
      Code: Warehouse.Code,
      Name: Warehouse.Name,
      address: Warehouse.Address,
      phone: Warehouse.Phone,
      IsDefault: Warehouse.IsDefault,
      IsActive: Warehouse.IsActive,
      createdAt: Warehouse.CreatedAt,
    };
  }

  private formatShelf(Shelf: any) {
    return {
      ID: Shelf.ID,
      WarehouseId: Shelf.WarehouseID,
      Code: Shelf.Code,
      Name: Shelf.Name,
      Description: Shelf.Description,
      IsActive: Shelf.IsActive,
    };
  }
}
