import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateMutationCategoryDto,
  UpDateMutationCategoryDto,
  CreateStockMutationDto,
  UpDateStockMutationDto,
  StockMutationFilterDto,
  MutationReportDto,
  MutationSummaryDto,
} from './Stock-Mutation.dto';

@Injectable()
export class StockMutationService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // MUTATION CATEGORY MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Mutation Category
   * Flow: Admin membuat kategori mutasi baru (e.g., Penyusutan, Rusak, Adjustment)
   */
  async createMutationCategory(dto: CreateMutationCategoryDto, UserId: string) {
    // Check for duplicate Code
    const existing = await this.prisma.mutationCategory.findFirst({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException(`Category with Code '${dto.Code}' already exists`);
    }

    const Category = await this.prisma.mutationCategory.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Description: dto.Description,
        Color: dto.color,
        MutationType: dto.MutationType,
        IsActive: true,
      },
    });

    return {
      success: true,
      Category: this.formatCategory(Category),
    };
  }

  /**
   * Get Mutation Category by ID
   */
  async getMutationCategory(CategoryId: number) {
    const Category = await this.prisma.mutationCategory.findUnique({
      where: { ID: CategoryId },
      include: { Mutations: { take: 5, orderBy: { Date: 'desc' } } },
    });

    if (!Category) {
      throw new NotFoundException('Mutation Category not found');
    }

    return this.formatCategory(Category);
  }

  /**
   * List Mutation Categories
   */
  async listMutationCategories(IsActive?: boolean) {
    const where: any = {};
    if (IsActive !== undefined) {
      where.IsActive = IsActive;
    }

    const Categories = await this.prisma.mutationCategory.findMany({
      where,
      include: { _Count: { select: { Mutations: true } } },
      orderBy: { SortOrder: 'asc' },
    });

    return Categories.map((c) => ({
      ...this.formatCategory(c),
      MutationCount: c._Count.Mutations,
    }));
  }

  /**
   * UpDate Mutation Category
   */
  async updateMutationCategory(CategoryId: number, dto: UpDateMutationCategoryDto) {
    const Category = await this.prisma.mutationCategory.findUnique({
      where: { ID: CategoryId },
    });

    if (!Category) {
      throw new NotFoundException('Mutation Category not found');
    }

    const updated = await this.prisma.mutationCategory.update({
      where: { ID: CategoryId },
      data: {
        Name: dto.Name,
        Description: dto.Description,
        Color: dto.color,
        IsActive: dto.IsActive,
      },
    });

    return {
      success: true,
      Category: this.formatCategory(updated),
    };
  }

  /**
   * Delete Mutation Category
   */
  async deleteMutationCategory(CategoryId: number) {
    const Category = await this.prisma.mutationCategory.findUnique({
      where: { ID: CategoryId },
      include: { _Count: { select: { Mutations: true } } },
    });

    if (!Category) {
      throw new NotFoundException('Mutation Category not found');
    }

    if (Category._Count.Mutations > 0) {
      throw new BadRequestException('Cannot delete Category with existing Mutations');
    }

    await this.prisma.mutationCategory.delete({
      where: { ID: CategoryId },
    });

    return {
      success: true,
      message: 'Mutation Category deleted successfully',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK MUTATION MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Stock Mutation
   * Flow: Admin/Stocker input mutasi stok → sistem update stok produk
   */
  async createStockMutation(dto: CreateStockMutationDto, UserId: string) {
    // Validate Warehouse
    const Warehouse = await this.prisma.warehouse.findUnique({
      where: { ID: dto.WarehouseId },
    });

    if (!Warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    // Validate Mutation Category
    const Category = await this.prisma.mutationCategory.findUnique({
      where: { ID: dto.MutationCategoryId },
    });

    if (!Category) {
      throw new NotFoundException('Mutation Category not found');
    }

    if (!Category.IsActive) {
      throw new BadRequestException('Mutation Category is not Active');
    }

    // generate Mutation Code
    const Code = await this.generateMutationCode(Category.MutationType || 'ADJ');

    // Calculate Total Amount
    let TotalAmount = 0;
    for (const item of dto.Items) {
      const Product = await this.prisma.product.findUnique({
        where: { ID: item.ProductId },
      });

      if (!Product) {
        throw new NotFoundException(`Product ${item.ProductId} not found`);
      }

      const UnitPrice = item.UnitPrice ?? Number(Product.PurchasePrice);
      TotalAmount += item.Quantity * UnitPrice;
    }

    // Determine Mutation Type for Stock adjustment
    const isStockIn = ['IN', 'TRANSFER'].includes(Category.MutationType || '');

    // Execute Mutation in transaction
    const Mutation = await this.prisma.$transaction(async (tx) => {
      // Create Mutation Record
      const newMutation = await tx.stockMutation.create({
        data: {
          Code: Code,
          Date: new Date(dto.MutationDate),
          MutationCategoryID: dto.MutationCategoryId,
          WarehouseID: dto.WarehouseId,
          MutationType: Category.MutationType || 'ADJUSTMENT',
          ReferenceNumber: dto.ReferenceNumber,
          TotalAmount: new Prisma.Decimal(TotalAmount),
          Notes: dto.Notes,
          CreatedByID: UserId,
        },
        include: {
          MutationCategory: true,
          Warehouse: true,
        },
      });

      // Create Mutation items and update Stock
      for (const item of dto.Items) {
        const Product = await tx.product.findUnique({
          where: { ID: item.ProductId },
        });

        const UnitPrice = item.UnitPrice ?? Number(Product?.PurchasePrice || 0);
        const subTotal = item.Quantity * UnitPrice;

        // Create Mutation item
        await tx.stockMutationItem.create({
          data: {
            StockMutationID: newMutation.ID,
            ProductID: item.ProductId,
            ProductName: Product?.Name || 'Unknown',
            Quantity: new Prisma.Decimal(item.Quantity),
            UnitID: item.UnitId || Product?.UnitID || 1,
            UnitPrice: new Prisma.Decimal(UnitPrice),
            SubTotal: new Prisma.Decimal(subTotal),
            Notes: item.Notes,
          },
        });

        // UpDate Product Stock based on Mutation Type
        if (isStockIn) {
          // Increase Stock
          await tx.product.update({
            where: { ID: item.ProductId },
            data: { Stock: { increment: new Prisma.Decimal(item.Quantity) } },
          });

          // UpDate Warehouse Stock
          await tx.productStock.upsert({
            where: {
              ProductID_WarehouseID: {
                ProductID: item.ProductId,
                WarehouseID: dto.WarehouseId,
              },
            },
            create: {
              ProductID: item.ProductId,
              WarehouseID: dto.WarehouseId,
              Quantity: new Prisma.Decimal(item.Quantity),
              MinimumStock: new Prisma.Decimal(0),
            },
            update: {
              Quantity: { increment: new Prisma.Decimal(item.Quantity) },
            },
          });
        } else {
          // Decrease Stock
          await tx.product.update({
            where: { ID: item.ProductId },
            data: { Stock: { decrement: new Prisma.Decimal(item.Quantity) } },
          });

          // UpDate Warehouse Stock
          await tx.productStock.upsert({
            where: {
              ProductID_WarehouseID: {
                ProductID: item.ProductId,
                WarehouseID: dto.WarehouseId,
              },
            },
            create: {
              ProductID: item.ProductId,
              WarehouseID: dto.WarehouseId,
              Quantity: new Prisma.Decimal(0),
              MinimumStock: new Prisma.Decimal(0),
            },
            update: {
              Quantity: { decrement: new Prisma.Decimal(item.Quantity) },
            },
          });
        }
      }

      return newMutation;
    });

    return {
      success: true,
      Mutation: {
        ID: Mutation.ID,
        Code: Mutation.Code,
        Date: Mutation.Date,
        Category: Mutation.MutationCategory.Name,
        MutationType: Mutation.MutationType,
        Warehouse: Mutation.Warehouse.Name,
        referenceNumber: Mutation.ReferenceNumber,
        TotalAmount,
        itemCount: dto.Items.length,
        Status: 'COMPLETED',
      },
    };
  }

  /**
   * Get Stock Mutation by ID
   */
  async getStockMutation(MutationId: number) {
    const Mutation = await this.prisma.stockMutation.findUnique({
      where: { ID: MutationId },
      include: {
        MutationCategory: true,
        Warehouse: true,
        Items: {
          include: { Product: true, Unit: true },
          orderBy: { SortOrder: 'asc' },
        },
        Creator: true,
      },
    });

    if (!Mutation) {
      throw new NotFoundException('Stock Mutation not found');
    }

    return {
      ID: Mutation.ID,
      Code: Mutation.Code,
      Date: Mutation.Date,
      CategoryId: Mutation.MutationCategoryID,
      Category: Mutation.MutationCategory.Name,
      CategoryCode: Mutation.MutationCategory.Code,
      MutationType: Mutation.MutationType,
      WarehouseId: Mutation.WarehouseID,
      Warehouse: Mutation.Warehouse.Name,
      referenceNumber: Mutation.ReferenceNumber,
      TotalAmount: number(Mutation.TotalAmount),
      Notes: Mutation.Notes,
      createdBy: (Mutation.Creator as any)?.Name || 'System',
      createdAt: Mutation.CreatedAt,
      items: Mutation.Items.map((item) => ({
        ID: item.ID,
        ProductId: item.ProductID,
        ProductName: item.Product?.Name || item.ProductName,
        ProductCode: item.Product?.Code,
        Quantity: number(item.Quantity),
        Unit: item.Unit?.Name,
        UnitPrice: number(item.UnitPrice),
        subTotal: number(item.SubTotal),
        Notes: item.Notes,
      })),
    };
  }

  /**
   * List Stock Mutations
   */
  async listStockMutations(dto: StockMutationFilterDto) {
    const where: any = {};

    if (dto.StartDate || dto.EndDate) {
      where.Date = {};
      if (dto.StartDate) {
        where.Date.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.Date.lte = new Date(dto.EndDate);
      }
    }

    if (dto.MutationCategoryId) {
      where.MutationCategoryID = dto.MutationCategoryId;
    }

    if (dto.WarehouseId) {
      where.WarehouseID = dto.WarehouseId;
    }

    if (dto.MutationType) {
      where.MutationType = dto.MutationType;
    }

    if (dto.Search) {
      where.OR = [
        { Code: { contains: dto.Search, mode: 'insensitive' } },
        { ReferenceNumber: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    const Mutations = await this.prisma.stockMutation.findMany({
      where,
      include: {
        MutationCategory: true,
        Warehouse: true,
        Items: true,
      },
      orderBy: { Date: 'desc' },
    });

    return Mutations.map((m) => ({
      ID: m.ID,
      Code: m.Code,
      Date: m.Date,
      Category: m.MutationCategory.Name,
      CategoryColor: m.MutationCategory.Color,
      MutationType: m.MutationType,
      Warehouse: m.Warehouse.Name,
      referenceNumber: m.ReferenceNumber,
      TotalAmount: number(m.TotalAmount),
      itemCount: m.Items.length,
    }));
  }

  /**
   * UpDate Stock Mutation
   */
  async updateStockMutation(MutationId: number, dto: UpDateStockMutationDto) {
    const Mutation = await this.prisma.stockMutation.findUnique({
      where: { ID: MutationId },
    });

    if (!Mutation) {
      throw new NotFoundException('Stock Mutation not found');
    }

    const updated = await this.prisma.stockMutation.update({
      where: { ID: MutationId },
      data: {
        ReferenceNumber: dto.ReferenceNumber,
        Notes: dto.Notes,
      },
      include: { MutationCategory: true, Warehouse: true },
    });

    return {
      success: true,
      Mutation: {
        ID: updated.ID,
        Code: updated.Code,
        referenceNumber: updated.ReferenceNumber,
        Notes: updated.Notes,
      },
    };
  }

  /**
   * Reverse Stock Mutation (creates opposite Mutation)
   * Flow: Admin reverse mutasi → sistem buat mutasi sebaliknya
   */
  async reverseStockMutation(MutationId: number, reason: string, UserId: string) {
    const original = await this.prisma.stockMutation.findUnique({
      where: { ID: MutationId },
      include: { MutationCategory: true, Items: true },
    });

    if (!original) {
      throw new NotFoundException('Stock Mutation not found');
    }

    // Determine reverse Mutation Type
    const reverseType = ['IN', 'TRANSFER'].includes(original.MutationType)
      ? 'OUT'
      : 'IN';

    // Find or create reverse Category
    let reverseCategory = await this.prisma.mutationCategory.findFirst({
      where: {
        MutationType: reverseType,
        IsActive: true,
      },
    });

    if (!reverseCategory) {
      // Create reverse Category if not exists
      reverseCategory = await this.prisma.mutationCategory.create({
        data: {
          Code: `REV-${reverseType}`,
          Name: `Reverse ${reverseType}`,
          MutationType: reverseType as any,
          IsActive: true,
        },
      });
    }

    // generate reverse Mutation Code
    const reverseCode = await this.generateMutationCode(`REV-${reverseType}`);

    const reverseMutation = await this.prisma.$transaction(async (tx) => {
      // Create reverse Mutation
      const newMutation = await tx.stockMutation.create({
        data: {
          Code: reverseCode,
          Date: new Date(),
          MutationCategoryID: reverseCategory!.ID,
          WarehouseID: original.WarehouseID,
          MutationType: reverseType as any,
          ReferenceNumber: `REVERSE-${original.Code}`,
          TotalAmount: original.TotalAmount,
          Notes: `Reversal of ${original.Code}: ${reason}`,
          CreatedByID: UserId,
        },
      });

      // Create reverse items and adjust Stock
      for (const item of original.Items) {
        await tx.stockMutationItem.create({
          data: {
            StockMutationID: newMutation.ID,
            ProductID: item.ProductID,
            ProductName: item.ProductName,
            Quantity: item.Quantity,
            UnitID: item.UnitID,
            UnitPrice: item.UnitPrice,
            SubTotal: item.SubTotal,
            Notes: `Reversal: ${item.Notes || ''}`,
          },
        });

        // Adjust Stock (opposite direction)
        const isReverseIn = ['IN', 'TRANSFER'].includes(reverseType);
        if (isReverseIn) {
          await tx.product.update({
            where: { ID: item.ProductID },
            data: { Stock: { increment: item.Quantity } },
          });
        } else {
          await tx.product.update({
            where: { ID: item.ProductID },
            data: { Stock: { decrement: item.Quantity } },
          });
        }
      }

      return newMutation;
    });

    return {
      success: true,
      originalMutation: original.Code,
      reverseMutation: {
        ID: reverseMutation.ID,
        Code: reverseMutation.Code,
        Date: reverseMutation.Date,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MUTATION REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get Mutation Summary Report
   * Flow: Owner ingin Summary mutasi stok per kategori/periode
   */
  async getMutationSummary(dto: MutationSummaryDto) {
    const where: any = {};

    if (dto.StartDate || dto.EndDate) {
      where.Date = {};
      if (dto.StartDate) {
        where.Date.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.Date.lte = new Date(dto.EndDate);
      }
    }

    if (dto.WarehouseId) {
      where.WarehouseID = dto.WarehouseId;
    }

    // Get Mutations Grouped by Category
    const Mutations = await this.prisma.stockMutation.findMany({
      where,
      include: {
        MutationCategory: true,
        Items: true,
      },
      orderBy: { Date: 'desc' },
    });

    // Group by Mutation Type
    const Summary: Record<string, any> = {
      IN: { Type: 'IN', label: 'Stock In', Count: 0, TotalAmount: 0, TotalItems: 0 },
      OUT: { Type: 'OUT', label: 'Stock Out', Count: 0, TotalAmount: 0, TotalItems: 0 },
      ADJUSTMENT: { Type: 'ADJUSTMENT', label: 'Adjustment', Count: 0, TotalAmount: 0, TotalItems: 0 },
      TRANSFER: { Type: 'TRANSFER', label: 'Transfer', Count: 0, TotalAmount: 0, TotalItems: 0 },
    };

    for (const Mutation of Mutations) {
      const Type = Mutation.MutationType || 'ADJUSTMENT';
      if (Summary[Type]) {
        Summary[Type].Count++;
        Summary[Type].TotalAmount += Number(Mutation.TotalAmount);
        Summary[Type].TotalItems += Mutation.Items.length;
      }
    }

    return {
      period: { startDate: dto.StartDate, endDate: dto.EndDate },
      WarehouseId: dto.WarehouseId,
      TotalMutations: Mutations.length,
      Summary: Object.values(Summary).filter((s) => s.Count > 0),
    };
  }

  /**
   * Get Mutation Report by Category
   */
  async getMutationReport(dto: MutationReportDto) {
    const where: any = {};

    if (dto.StartDate || dto.EndDate) {
      where.Date = {};
      if (dto.StartDate) {
        where.Date.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.Date.lte = new Date(dto.EndDate);
      }
    }

    if (dto.WarehouseId) {
      where.WarehouseID = dto.WarehouseId;
    }

    const Mutations = await this.prisma.stockMutation.findMany({
      where,
      include: {
        MutationCategory: true,
        Items: { include: { Product: true } },
      },
      orderBy: { Date: 'desc' },
    });

    // Group by Category
    const byCategory: Record<number, any> = {};

    for (const Mutation of Mutations) {
      if (!byCategory[Mutation.MutationCategoryID]) {
        byCategory[Mutation.MutationCategoryID] = {
          CategoryId: Mutation.MutationCategoryID,
          CategoryName: Mutation.MutationCategory.Name,
          CategoryCode: Mutation.MutationCategory.Code,
          color: Mutation.MutationCategory.Color,
          MutationType: Mutation.MutationType,
          Mutations: [],
          TotalAmount: 0,
          TotalItems: 0,
        };
      }

      byCategory[Mutation.MutationCategoryID].Mutations.push({
        ID: Mutation.ID,
        Code: Mutation.Code,
        Date: Mutation.Date,
        referenceNumber: Mutation.ReferenceNumber,
        itemCount: Mutation.Items.length,
        Amount: number(Mutation.TotalAmount),
      });

      byCategory[Mutation.MutationCategoryID].TotalAmount += Number(Mutation.TotalAmount);
      byCategory[Mutation.MutationCategoryID].TotalItems += Mutation.Items.length;
    }

    return {
      period: { startDate: dto.StartDate, endDate: dto.EndDate },
      WarehouseId: dto.WarehouseId,
      GroupBy: dto.GroupBy || 'Category',
      TotalMutations: Mutations.length,
      Categories: Object.values(byCategory),
    };
  }

  /**
   * Get Product Mutation history
   */
  async getProductMutationHistory(ProductId: number, startDate?: string, endDate?: string) {
    const where: any = {
      Items: { some: { ProductID: ProductId } },
    };

    if (startDate || endDate) {
      where.Date = {};
      if (startDate) {
        where.Date.gte = new Date(startDate);
      }
      if (endDate) {
        where.Date.lte = new Date(endDate);
      }
    }

    const Mutations = await this.prisma.stockMutation.findMany({
      where,
      include: {
        MutationCategory: true,
        Items: { where: { ProductID: ProductId } },
      },
      orderBy: { Date: 'desc' },
    });

    let TotalIn = 0;
    let TotalOut = 0;

    const history = Mutations
      .filter((m) => m.Items.length > 0)
      .map((m) => {
        const item = m.Items[0];
        const Quantity = Number(item.Quantity);
        const isIn = ['IN', 'TRANSFER'].includes(m.MutationType);

        if (isIn) {
          TotalIn += Quantity;
        } else {
          TotalOut += Quantity;
        }

        return {
          ID: m.ID,
          Code: m.Code,
          Date: m.Date,
          Category: m.MutationCategory.Name,
          MutationType: m.MutationType,
          referenceNumber: m.ReferenceNumber,
          Quantity,
          UnitPrice: number(item.UnitPrice),
          subTotal: number(item.SubTotal),
        };
      });

    return {
      ProductId,
      period: { startDate, endDate },
      TotalIn,
      TotalOut,
      netChange: TotalIn - TotalOut,
      history,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private formatCategory(Category: any) {
    return {
      ID: Category.ID,
      Code: Category.Code,
      Name: Category.Name,
      Description: Category.Description,
      color: Category.Color,
      MutationType: Category.MutationType,
      IsActive: Category.IsActive,
      createdAt: Category.CreatedAt,
    };
  }

  private async generateMutationCode(Type: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const TypeCode = Type.substring(0, 3).toUpperCase();
    const prefix = `MUT-${TypeCode}-${year}${month}`;

    const lastMutation = await this.prisma.stockMutation.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastMutation) {
      const lastSeq = parseInt(lastMutation.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
