import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateAssemblyDto,
  UpdateAssemblyDto,
  AssemblyFilterDto,
  CreateBOMDto,
  UpdateBOMDto,
  BOMFilterDto,
  AssembleFromBOMDto,
  CalculateBOMCostDto,
} from './assembly.dto';

@Injectable()
export class AssemblyService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // ASSEMBLY / RAKITAN MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new Assembly (Rakit Barang)
   * Flow: Operator merakit komponen menjadi barang jadi
   */
  async createAssembly(dto: CreateAssemblyDto, UserId: string) {
    // generate Assembly Number
    const assemblyNumber = await this.generateAssemblyNumber();

    // Validate and calculate Component Costs
    let TotalComponentCost = 0;
    const ComponentsWithDetails: any[] = [];

    for (const Component of dto.Components) {
      const Product = await this.prisma.product.findUnique({
        where: { ID: Component.ProductId },
        include: { Unit: true },
      });

      if (!Product) {
        throw new NotFoundException(`Product ${Component.ProductId} not found`);
      }

      // Check Stock availability
      const availableStock = Number(Product.Stock);
      if (availableStock < Component.Quantity) {
        throw new BadRequestException(
          `Insufficient Stock for ${Product.Name}. Available: ${availableStock}, Required: ${Component.Quantity}`,
        );
      }

      const UnitPrice = Component.UnitPrice ?? Number(Product.PurchasePrice);
      const subTotal = UnitPrice * Component.Quantity;
      TotalComponentCost += subTotal;

      ComponentsWithDetails.push({
        productId: Component.ProductId,
        productName: Product.Name,
        productCode: Product.Code,
        quantity: Component.Quantity,
        unitId: Component.UnitId || Product.UnitID,
        unitPrice: UnitPrice,
        subTotal,
      });
    }

    // Get completed Status
    const completedStatus = await this.prisma.transactionStatus.findFirst({
      where: { Code: 'COMPLETED' },
    });

    // Execute Assembly in transaction
    const Assembly = await this.prisma.$transaction(async (tx) => {
      // Create Assembly Record
      const newAssembly = await tx.assembly.create({
        data: {
          AssemblyNumber: assemblyNumber,
          AssemblyDate: new Date(dto.AssemblyDate),
          WarehouseID: dto.WarehouseId || null,
          Description: dto.Description,
          ReferenceNumber: dto.ReferenceNumber,
          TotalComponentCost: new Prisma.Decimal(TotalComponentCost),
          StatusID: completedStatus?.ID || 2,
          Notes: dto.Notes,
          CreatedByID: UserId,
        },
      });

      // Create Assembly Components
      await tx.assemblyComponent.createMany({
        data: ComponentsWithDetails.map((c, index) => ({
          AssemblyID: newAssembly.ID,
          ProductID: c.productId,
          ProductName: c.productName,
          Quantity: new Prisma.Decimal(c.quantity),
          UnitID: c.unitId,
          UnitPrice: new Prisma.Decimal(c.unitPrice),
          SubTotal: new Prisma.Decimal(c.subTotal),
          SortOrder: index + 1,
        })),
      });

      // Decrease Component Stock
      for (const Component of ComponentsWithDetails) {
        await tx.product.update({
          where: { ID: Component.productId },
          data: { Stock: { decrement: new Prisma.Decimal(Component.quantity) } },
        });

        // Update Warehouse Stock if applicable
        if (dto.WarehouseId) {
          await tx.productStock.update({
            where: {
              ProductID_WarehouseID: {
                ProductID: Component.productId,
                WarehouseID: dto.WarehouseId,
              },
            },
            data: { Quantity: { decrement: new Prisma.Decimal(Component.Quantity) } },
          });
        }
      }

      return newAssembly;
    });

    return {
      success: true,
      Assembly: {
        ID: Assembly.ID,
        AssemblyNumber: Assembly.AssemblyNumber,
        AssemblyDate: Assembly.AssemblyDate,
        WarehouseId: Assembly.WarehouseID,
        Description: Assembly.Description,
        TotalComponentCost,
        Status: completedStatus?.Name || 'Completed',
        ComponentCount: dto.Components.length,
        Components: ComponentsWithDetails,
      },
    };
  }

  /**
   * Get Assembly by ID
   */
  async getAssembly(AssemblyId: number) {
    const Assembly = await this.prisma.assembly.findUnique({
      where: { ID: AssemblyId },
      include: {
        Warehouse: true,
        Status: true,
        Components: {
          include: { Product: true, Unit: true },
          orderBy: { SortOrder: 'asc' },
        },
      },
    });

    if (!Assembly) {
      throw new NotFoundException('Assembly not found');
    }

    return {
      ID: Assembly.ID,
      AssemblyNumber: Assembly.AssemblyNumber,
      AssemblyDate: Assembly.AssemblyDate,
      Warehouse: Assembly.Warehouse,
      Description: Assembly.Description,
      referenceNumber: Assembly.ReferenceNumber,
      TotalComponentCost: number(Assembly.TotalComponentCost),
      UnitCost: Assembly.Components.length > 0
        ? Number(Assembly.TotalComponentCost) / Assembly.Components.length
        : 0,
      Status: Assembly.Status,
      Notes: Assembly.Notes,
      createdBy: Assembly.CreatedByID || 'System',
      createdAt: Assembly.CreatedAt,
      Components: Assembly.Components.map((c) => ({
        ID: c.ID,
        ProductId: c.ProductID,
        ProductName: c.Product?.Name || c.ProductName,
        ProductCode: c.Product?.Code,
        Quantity: number(c.Quantity),
        Unit: c.Unit?.Name,
        UnitPrice: number(c.UnitPrice),
        subTotal: number(c.Subtotal),
      })),
    };
  }

  /**
   * List Assemblies
   */
  async listAssemblies(dto: AssemblyFilterDto) {
    const where: any = {};

    if (dto.StartDate || dto.EndDate) {
      where.AssemblyDate = {};
      if (dto.StartDate) {
        where.AssemblyDate.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.AssemblyDate.lte = new Date(dto.EndDate);
      }
    }

    if (dto.WarehouseId) {
      where.WarehouseID = dto.WarehouseId;
    }

    if (dto.status) {
      where.Status = { Code: dto.status };
    }

    if (dto.Search) {
      where.OR = [
        { AssemblyNumber: { contains: dto.Search, mode: 'insensitive' } },
        { Description: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    const Assemblies = await this.prisma.assembly.findMany({
      where,
      include: {
        Warehouse: true,
        Status: true,
        Components: true,
      },
      orderBy: { AssemblyDate: 'desc' },
    });

    return Assemblies.map((a) => ({
      ID: a.ID,
      AssemblyNumber: a.AssemblyNumber,
      AssemblyDate: a.AssemblyDate,
      Warehouse: a.Warehouse?.Name,
      Description: a.Description,
      TotalComponentCost: number(a.TotalComponentCost),
      Status: a.Status?.Name,
      StatusColor: a.Status?.Color,
      ComponentCount: a.Components.length,
    }));
  }

  /**
   * UpDate Assembly
   */
  async updateAssembly(AssemblyId: number, dto: UpdateAssemblyDto, UserId: string) {
    const Assembly = await this.prisma.assembly.findUnique({
      where: { ID: AssemblyId },
      include: { Status: true },
    });

    if (!Assembly) {
      throw new NotFoundException('Assembly not found');
    }

    if (Assembly.Status?.IsTerminal) {
      throw new BadRequestException('Cannot update completed Assembly');
    }

    const updated = await this.prisma.assembly.update({
      where: { ID: AssemblyId },
      data: {
        Description: dto.Description,
        WarehouseID: dto.WarehouseId,
        Notes: dto.Notes,
      },
    });

    return {
      success: true,
      Assembly: {
        ID: updated.ID,
        AssemblyNumber: updated.AssemblyNumber,
        Description: updated.Description,
      },
    };
  }

  /**
   * Cancel Assembly
   * Flow: Jika rakitan dibatalkan, Stock komponen dikembalikan
   */
  async cancelAssembly(AssemblyId: number, reason: string, UserId: string) {
    const Assembly = await this.prisma.assembly.findUnique({
      where: { ID: AssemblyId },
      include: {
        Status: true,
        Components: true,
      },
    });

    if (!Assembly) {
      throw new NotFoundException('Assembly not found');
    }

    if (Assembly.Status?.IsTerminal) {
      throw new BadRequestException('Cannot cancel completed Assembly');
    }

    const cancelledStatus = await this.prisma.transactionStatus.findFirst({
      where: { Code: 'CANCELLED' },
    });

    await this.prisma.$transaction(async (tx) => {
      // Return Component Stock
      for (const Component of Assembly.Components) {
        await tx.product.update({
          where: { ID: Component.ProductID },
          data: { Stock: { increment: new Prisma.Decimal(Component.Quantity) } },
        });

        if (Assembly.WarehouseID) {
          await tx.productStock.update({
            where: {
              ProductID_WarehouseID: {
                ProductID: Component.ProductID,
                WarehouseID: Assembly.WarehouseID,
              },
            },
            data: { Quantity: { increment: new Prisma.Decimal(Component.Quantity) } },
          });
        }
      }

      // UpDate Assembly Status
      await tx.assembly.update({
        where: { ID: AssemblyId },
        data: {
          StatusID: cancelledStatus?.ID,
          Notes: `Cancelled: ${reason}. ${Assembly.Notes || ''}`,
        },
      });
    });

    return {
      success: true,
      AssemblyId,
      Status: 'CANCELLED',
      returnedStock: Assembly.Components.length,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BILL OF MATERIALS (BOM) / KOMPOSISI MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create BOM (Bill of Materials)
   * Flow: Manager membuat standar komposisi untuk produksi
   */
  async createBOM(dto: CreateBOMDto, UserId: string) {
    // generate BOM Code if not provided
    const Code = dto.Code || (await this.generateBOMCode());

    // Check for duplicate Name/Code
    const existing = await this.prisma.bOM.findFirst({
      where: {
        OR: [
          { Code: Code },
          { Name: dto.Name },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('BOM with this Code or Name already exists');
    }

    // Validate and calculate BOM Costs
    let TotalCost = 0;
    let TotalWaste = 0;
    const itemsWithDetails: any[] = [];

    for (const item of dto.Items) {
      const Product = await this.prisma.product.findUnique({
        where: { ID: item.ProductId },
        include: { Unit: true },
      });

      if (!Product) {
        throw new NotFoundException(`Product ${item.ProductId} not found`);
      }

      const UnitPrice = Number(Product.PurchasePrice);
      const QuantityNeeded = item.Quantity * (1 + (item.WastePercent || 0) / 100);
      const subTotal = UnitPrice * QuantityNeeded;
      TotalCost += subTotal;
      TotalWaste += UnitPrice * item.Quantity * ((item.WastePercent || 0) / 100);

      itemsWithDetails.push({
        ProductId: item.ProductId,
        ProductName: Product.Name,
        ProductCode: Product.Code,
        Quantity: item.Quantity,
        wastePercent: item.WastePercent || 0,
        UnitId: item.UnitId || Product.UnitID,
        UnitPrice,
        subTotal,
      });
    }

    const UnitCost = dto.QuantityProduced ? TotalCost / dto.QuantityProduced : TotalCost;

    const BOM = await this.prisma.bOM.create({
      data: {
        Code: Code,
        Name: dto.Name,
        ProductID: dto.ProductId || null,
        QuantityProduced: dto.QuantityProduced || 1,
        WarehouseID: dto.WarehouseId || null,
        Description: dto.Description,
        TotalCost: new Prisma.Decimal(TotalCost),
        UnitCost: new Prisma.Decimal(UnitCost),
        IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
        CreatedByID: UserId,
        BOMItems: {
          create: itemsWithDetails.map((item, index) => ({
            ProductID: item.ProductId,
            ProductName: item.ProductName,
            Quantity: new Prisma.Decimal(item.Quantity),
            WastePercent: new Prisma.Decimal(item.wastePercent),
            UnitID: item.UnitId,
            UnitPrice: new Prisma.Decimal(item.UnitPrice),
            SubTotal: new Prisma.Decimal(item.subTotal),
            SortOrder: index + 1,
          })),
        },
      },
      include: {
        Product: true,
        Warehouse: true,
        BOMItems: { include: { Product: true, Unit: true }, orderBy: { SortOrder: 'asc' } },
      },
    });

    return {
      success: true,
      BOM: this.formatBOM(BOM),
    };
  }

  /**
   * Get BOM by ID
   */
  async getBOM(BOMId: number) {
    const BOM = await this.prisma.bOM.findUnique({
      where: { ID: BOMId },
      include: {
        Product: true,
        Warehouse: true,
        BOMItems: {
          include: { Product: true, Unit: true },
          orderBy: { SortOrder: 'asc' },
        },
      },
    });

    if (!BOM) {
      throw new NotFoundException('BOM not found');
    }

    return this.formatBOM(BOM);
  }

  /**
   * List BOMs
   */
  async listBOMs(dto: BOMFilterDto) {
    const where: any = {};

    if (dto.IsActive !== undefined) {
      where.IsActive = dto.IsActive;
    }

    if (dto.WarehouseId) {
      where.WarehouseID = dto.WarehouseId;
    }

    if (dto.ProductId) {
      where.ProductID = dto.ProductId;
    }

    if (dto.Search) {
      where.OR = [
        { Name: { contains: dto.Search, mode: 'insensitive' } },
        { Code: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    const BOMs = await this.prisma.bOM.findMany({
      where,
      include: {
        Product: true,
        Warehouse: true,
        BOMItems: true,
      },
      orderBy: { Name: 'asc' },
    });

    return BOMs.map((BOM) => ({
      ID: BOM.ID,
      Code: BOM.Code,
      Name: BOM.Name,
      ProductName: BOM.Product?.Name,
      ProductCode: BOM.Product?.Code,
      QuantityProduced: BOM.QuantityProduced,
      Warehouse: BOM.Warehouse?.Name,
      TotalCost: number(BOM.TotalCost),
      UnitCost: number(BOM.UnitCost),
      IsActive: BOM.IsActive,
      itemCount: BOM.BOMItems.length,
      createdAt: BOM.CreatedAt,
    }));
  }

  /**
   * UpDate BOM
   */
  async updateBOM(BOMId: number, dto: UpdateBOMDto, UserId: string) {
    const BOM = await this.prisma.bOM.findUnique({
      where: { ID: BOMId },
    });

    if (!BOM) {
      throw new NotFoundException('BOM not found');
    }

    // Recalculate if items or Quantity changed
    let TotalCost = 0;
    if (dto.Items) {
      for (const item of dto.Items) {
        const Product = await this.prisma.product.findUnique({
          where: { ID: item.ProductId },
        });
        if (Product) {
          const QuantityNeeded = item.Quantity * (1 + (item.WastePercent || 0) / 100);
          TotalCost += Number(Product.PurchasePrice) * QuantityNeeded;
        }
      }
    }

    const updated = await this.prisma.bOM.update({
      where: { ID: BOMId },
      data: {
        Name: dto.Name,
        ProductID: dto.ProductId,
        QuantityProduced: dto.QuantityProduced,
        WarehouseID: dto.WarehouseId,
        Description: dto.Description,
        DefaultCost: dto.DefaultCost ? new Prisma.Decimal(dto.DefaultCost) : undefined,
        TotalCost: TotalCost > 0 ? new Prisma.Decimal(TotalCost) : undefined,
        IsActive: dto.IsActive,
      },
      include: {
        Product: true,
        Warehouse: true,
        BOMItems: { include: { Product: true, Unit: true } },
      },
    });

    return {
      success: true,
      BOM: this.formatBOM(updated),
    };
  }

  /**
   * Delete BOM
   */
  async deleteBOM(BOMId: number) {
    const BOM = await this.prisma.bOM.findUnique({
      where: { ID: BOMId },
      include: { BOMItems: true },
    });

    if (!BOM) {
      throw new NotFoundException('BOM not found');
    }

    // Delete items first
    await this.prisma.bOMItem.deleteMany({
      where: { BOMID: BOMId },
    });

    // Delete BOM
    await this.prisma.bOM.delete({
      where: { ID: BOMId },
    });

    return {
      success: true,
      deletedBOM: BOM.Name,
    };
  }

  /**
   * Copy/Clone BOM
   */
  async cloneBOM(BOMId: number, newName: string, UserId: string) {
    const originalBOM = await this.prisma.bOM.findUnique({
      where: { ID: BOMId },
      include: { BOMItems: true },
    });

    if (!originalBOM) {
      throw new NotFoundException('BOM not found');
    }

    const newCode = await this.generateBOMCode();

    const clonedBOM = await this.prisma.bOM.create({
      data: {
        Code: newCode,
        Name: newName,
        ProductID: originalBOM.ProductID,
        QuantityProduced: originalBOM.QuantityProduced,
        WarehouseID: originalBOM.WarehouseID,
        Description: originalBOM.Description,
        TotalCost: originalBOM.TotalCost,
        UnitCost: originalBOM.UnitCost,
        IsActive: true,
        CreatedByID: UserId,
        BOMItems: {
          create: originalBOM.BOMItems.map((item) => ({
            ProductID: item.ProductID,
            ProductName: item.ProductName,
            Quantity: item.Quantity,
            WastePercent: item.WastePercent,
            UnitID: item.UnitID,
            UnitPrice: item.UnitPrice,
            SubTotal: item.Subtotal,
            SortOrder: item.SortOrder,
          })),
        },
      },
      include: {
        Product: true,
        Warehouse: true,
        BOMItems: { include: { Product: true, Unit: true } },
      },
    });

    return {
      success: true,
      BOM: this.formatBOM(clonedBOM),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ASSEMBLY FROM BOM
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Perform Assembly using BOM
   * Flow: Operator Assembly dengan memilih BOM, sistem auto-calculate komponen
   */
  async assembleFromBOM(dto: AssembleFromBOMDto, UserId: string) {
    const BOM = await this.prisma.bOM.findUnique({
      where: { ID: dto.BOMId },
      include: {
        BOMItems: { include: { Product: true } },
        Product: true,
      },
    });

    if (!BOM) {
      throw new NotFoundException('BOM not found');
    }

    if (!BOM.IsActive) {
      throw new BadRequestException('BOM is not Active');
    }

    // generate Assembly Number
    const assemblyNumber = await this.generateAssemblyNumber();

    // Calculate required Components based on Quantity
    const QuantityMultiplier = dto.Quantity / Number(BOM.QuantityProduced || 1);
    let TotalComponentCost = 0;
    const ComponentsWithDetails: any[] = [];

    // Validate Stock availability for all Components
    for (const item of BOM.BOMItems) {
      const requiredQty = Number(item.Quantity) * QuantityMultiplier;
      const availableStock = Number(item.Product?.Stock || 0);

      if (availableStock < requiredQty) {
        throw new BadRequestException(
          `Insufficient Stock for ${item.Product?.Name || item.ProductName}. ` +
          `Available: ${availableStock}, Required: ${requiredQty.toFixed(2)}`,
        );
      }

      const UnitPrice = Number(item.UnitPrice);
      const subTotal = UnitPrice * requiredQty;
      TotalComponentCost += subTotal;

      ComponentsWithDetails.push({
        ProductId: item.ProductID,
        ProductName: item.Product?.Name || item.ProductName,
        ProductCode: item.Product?.Code,
        Quantity: requiredQty,
        UnitId: item.UnitID,
        UnitPrice,
        subTotal,
        wastePercent: number(item.WastePercent),
      });
    }

    const UnitCost = TotalComponentCost / dto.Quantity;

    // Get completed Status
    const completedStatus = await this.prisma.transactionStatus.findFirst({
      where: { Code: 'COMPLETED' },
    });

    // Execute Assembly
    const Assembly = await this.prisma.$transaction(async (tx) => {
      // Create Assembly Record
      const newAssembly = await tx.assembly.create({
        data: {
          AssemblyNumber: assemblyNumber,
          AssemblyDate: new Date(dto.AssemblyDate),
          WarehouseID: dto.WarehouseId || BOM.WarehouseID,
          Description: `Assembly from BOM: ${BOM.Name}`,
          ReferenceNumber: `BOM-${BOM.Code}`,
          TotalComponentCost: new Prisma.Decimal(TotalComponentCost),
          StatusID: completedStatus?.ID || 2,
          Notes: dto.Notes,
          CreatedByID: UserId,
          BOMID: BOM.ID,
        },
      });

      // Create Assembly Components
      await tx.assemblyComponent.createMany({
        data: ComponentsWithDetails.map((c, index) => ({
          AssemblyID: newAssembly.ID,
          ProductID: c.productId,
          ProductName: c.productName,
          Quantity: new Prisma.Decimal(c.quantity),
          UnitID: c.unitId,
          UnitPrice: new Prisma.Decimal(c.unitPrice),
          SubTotal: new Prisma.Decimal(c.subTotal),
          SortOrder: index + 1,
        })),
      });

      // Decrease Component Stock
      for (const Component of ComponentsWithDetails) {
        await tx.product.update({
          where: { ID: Component.ProductId },
          data: { Stock: { decrement: new Prisma.Decimal(Component.Quantity) } },
        });

        if (dto.WarehouseId || BOM.WarehouseID) {
          await tx.productStock.update({
            where: {
              ProductID_WarehouseID: {
                ProductID: Component.ProductId,
                WarehouseID: dto.WarehouseId || BOM.WarehouseID!,
              },
            },
            data: { Quantity: { decrement: new Prisma.Decimal(Component.Quantity) } },
          });
        }
      }

      // If BOM has output Product, create it as finished goods
      if (BOM.ProductID && dto.AutoAssembly) {
        await tx.product.update({
          where: { ID: BOM.ProductID },
          data: { Stock: { increment: new Prisma.Decimal(dto.Quantity) } },
        });

        if (dto.WarehouseId || BOM.WarehouseID) {
          await tx.productStock.upsert({
            where: {
              ProductID_WarehouseID: {
                ProductID: BOM.ProductID,
                WarehouseID: dto.WarehouseId || BOM.WarehouseID!,
              },
            },
            create: {
              ProductID: BOM.ProductID,
              WarehouseID: dto.WarehouseId || BOM.WarehouseID!,
              Quantity: new Prisma.Decimal(dto.Quantity),
            },
            update: {
              Quantity: { increment: new Prisma.Decimal(dto.Quantity) },
            },
          });
        }
      }

      return newAssembly;
    });

    return {
      success: true,
      Assembly: {
        ID: Assembly.ID,
        AssemblyNumber: Assembly.AssemblyNumber,
        AssemblyDate: Assembly.AssemblyDate,
        BOMId: BOM.ID,
        BOMName: BOM.Name,
        outputProduct: BOM.Product?.Name,
        QuantityProduced: dto.Quantity,
        WarehouseId: Assembly.WarehouseID,
        TotalComponentCost,
        UnitCost,
        Status: completedStatus?.Name || 'Completed',
        Components: ComponentsWithDetails,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BOM COSTING & ANALYTICS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Calculate BOM Cost
   * Flow: Sistem calculate harga pokok produksi dari BOM
   */
  async calculateBOMCost(dto: CalculateBOMCostDto) {
    if (dto.BOMId) {
      const BOM = await this.prisma.bOM.findUnique({
        where: { ID: dto.BOMId },
        include: { BOMItems: { include: { Product: true, Unit: true } } },
      });

      if (!BOM) {
        throw new NotFoundException('BOM not found');
      }

      const QuantityMultiplier = (dto.Quantity || 1) / Number(BOM.QuantityProduced || 1);

      const items = BOM.BOMItems.map((item) => {
        const requiredQty = Number(item.Quantity) * QuantityMultiplier;
        const Cost = Number(item.UnitPrice) * requiredQty;

        return {
          ProductId: item.ProductID,
          ProductName: item.Product?.Name || item.ProductName,
          baseQuantity: number(item.Quantity),
          wastePercent: number(item.WastePercent),
          requiredQuantity: requiredQty,
          Unit: item.Unit?.Name,
          UnitPrice: number(item.UnitPrice),
          Cost,
        };
      });

      const TotalCost = items.reduce((sum, item) => sum + item.Cost, 0);

      return {
        BOMId: BOM.ID,
        BOMName: BOM.Name,
        BOMQuantity: BOM.QuantityProduced,
        RequestedQuantity: dto.Quantity || 1,
        TotalCost,
        UnitCost: TotalCost / (dto.Quantity || 1),
        items,
        canProduce: true, // Stock Check should be done sepaRately
      };
    }

    if (dto.ProductId) {
      // Find BOMs for this Product
      const BOMs = await this.prisma.bOM.findMany({
        where: { ProductID: dto.ProductId, IsActive: true },
        include: { BOMItems: { include: { Product: true } } },
      });

      if (BOMs.length === 0) {
        return {
          ProductId: dto.ProductId,
          hasBOM: false,
          message: 'No BOM found for this Product',
        };
      }

      const QuantityMultiplier = (dto.Quantity || 1) / Number(BOMs[0].QuantityProduced || 1);
      const BOM = BOMs[0];

      const items = BOM.BOMItems.map((item) => {
        const requiredQty = Number(item.Quantity) * QuantityMultiplier;
        const Cost = Number(item.UnitPrice) * requiredQty;

        return {
          ProductId: item.ProductID,
          ProductName: item.Product?.Name || item.ProductName,
          requiredQuantity: requiredQty,
          Cost,
        };
      });

      const TotalCost = items.reduce((sum, item) => sum + item.Cost, 0);

      return {
        ProductId: dto.ProductId,
        hasBOM: true,
        DefaultBOMId: BOM.ID,
        TotalCost,
        UnitCost: TotalCost / (dto.Quantity || 1),
        items,
      };
    }

    throw new BadRequestException('Must provIDe either BOMId or ProductId');
  }

  /**
   * Get BOM comparison
   * Flow: Owner membandingkan 2 BOM untuk optimasi biaya
   */
  async compareBOMs(BOMId1: number, BOMId2: number) {
    const [BOM1, BOM2] = await Promise.all([
      this.prisma.bOM.findUnique({
        where: { ID: BOMId1 },
        include: { BOMItems: { include: { Product: true } } },
      }),
      this.prisma.bOM.findUnique({
        where: { ID: BOMId2 },
        include: { BOMItems: { include: { Product: true } } },
      }),
    ]);

    if (!BOM1 || !BOM2) {
      throw new NotFoundException('One or both BOMs not found');
    }

    // Group items by Product
    const BOM1Items = new Map(BOM1.BOMItems.map((i) => [i.ProductID, i]));
    const BOM2Items = new Map(BOM2.BOMItems.map((i) => [i.ProductID, i]));

    // Get all unique Products
    const allProductIds = new Set([
      ...BOM1.BOMItems.map((i) => i.ProductID),
      ...BOM2.BOMItems.map((i) => i.ProductID),
    ]);

    const comparisons: any[] = [];

    for (const ProductId of allProductIds) {
      const item1 = BOM1Items.get(ProductId);
      const item2 = BOM2Items.get(ProductId);

      comparisons.push({
        ProductId,
        ProductName: item1?.Product?.Name || item2?.Product?.Name || 'Unknown',
        BOM1: item1 ? {
          Quantity: number(item1.Quantity),
          Cost: number(item1.Subtotal),
        } : null,
        BOM2: item2 ? {
          Quantity: number(item2.Quantity),
          Cost: number(item2.Subtotal),
        } : null,
      });
    }

    return {
      BOM1: {
        ID: BOM1.ID,
        Name: BOM1.Name,
        TotalCost: number(BOM1.TotalCost),
      },
      BOM2: {
        ID: BOM2.ID,
        Name: BOM2.Name,
        TotalCost: number(BOM2.TotalCost),
      },
      CostDifference: number(BOM1.TotalCost) - Number(BOM2.TotalCost),
      comparison: comparisons,
    };
  }

  /**
   * Get Assembly analytics
   */
  async getAssemblyAnalytics(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const Assemblies = await this.prisma.assembly.findMany({
      where: {
        AssemblyDate: { gte: start, lte: end },
      },
      include: {
        Status: true,
        Components: { include: { Product: true } },
      },
    });

    const TotalAssemblies = Assemblies.length;
    const TotalComponentCost = Assemblies.reduce((sum, a) => sum + Number(a.TotalComponentCost), 0);

    // By Status
    const byStatus: Record<string, number> = {};
    for (const Assembly of Assemblies) {
      const StatusName = Assembly.Status?.Name || 'Unknown';
      byStatus[StatusName] = (byStatus[StatusName] || 0) + 1;
    }

    // Top used Components
    const ComponentUsage = new Map<Number, { Name: string; Quantity: number; Cost: number }>();

    for (const Assembly of Assemblies) {
      for (const Component of Assembly.Components) {
        const existing = ComponentUsage.get(Component.ProductID);
        if (existing) {
          existing.Quantity += Number(Component.Quantity);
          existing.Cost += Number(Component.Subtotal);
        } else {
          ComponentUsage.set(Component.ProductID, {
            Name: Component.Product?.Name || Component.ProductName,
            Quantity: number(Component.Quantity),
            Cost: number(Component.Subtotal),
          });
        }
      }
    }

    const topComponents = Array.from(ComponentUsage.entries())
      .sort((a, b) => b[1].Cost - a[1].Cost)
      .slice(0, 10)
      .map(([ID, data]) => ({
        ProductId: ID,
        ProductName: data.Name,
        TotalQuantity: data.Quantity,
        TotalCost: data.Cost,
      }));

    return {
      period: { startDate, endDate },
      Summary: {
        TotalAssemblies,
        TotalComponentCost,
        averageCostPerAssembly: TotalAssemblies > 0 ? TotalComponentCost / TotalAssemblies : 0,
      },
      byStatus: Object.entries(byStatus).map(([Status, Count]) => ({ Status, Count })),
      topComponents,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private formatBOM(BOM: any) {
    return {
      ID: BOM.ID,
      Code: BOM.Code,
      Name: BOM.Name,
      ProductId: BOM.ProductID,
      ProductName: BOM.Product?.Name,
      ProductCode: BOM.Product?.Code,
      QuantityProduced: BOM.QuantityProduced,
      WarehouseId: BOM.WarehouseID,
      Warehouse: BOM.Warehouse?.Name,
      Description: BOM.Description,
      TotalCost: number(BOM.TotalCost),
      UnitCost: number(BOM.UnitCost),
      DefaultCost: BOM.DefaultCost ? Number(BOM.DefaultCost) : null,
      IsActive: BOM.IsActive,
      createdBy: (BOM.Creator as any)?.Name,
      createdAt: BOM.CreatedAt,
      items: BOM.BOMItems?.map((item: any) => ({
        ID: item.ID,
        ProductId: item.ProductID,
        ProductName: item.Product?.Name || item.ProductName,
        ProductCode: item.Product?.Code,
        Quantity: number(item.Quantity),
        wastePercent: number(item.WastePercent),
        Unit: item.Unit?.Name,
        UnitPrice: number(item.UnitPrice),
        subTotal: number(item.SubTotal),
      })) || [],
    };
  }

  private async generateAssemblyNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `ASSY-${year}${month}`;

    const lastAssembly = await this.prisma.assembly.findFirst({
      where: { AssemblyNumber: { startsWith: prefix } },
      orderBy: { AssemblyNumber: 'desc' },
      select: { AssemblyNumber: true },
    });

    let nextNumber = 1;
    if (lastAssembly) {
      const lastSeq = parseInt(lastAssembly.AssemblyNumber.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private async generateBOMCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `BOM-${year}${month}`;

    const lastBOM = await this.prisma.bOM.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastBOM) {
      const lastSeq = parseInt(lastBOM.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
