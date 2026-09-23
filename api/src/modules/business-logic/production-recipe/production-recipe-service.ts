import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import { CreateRecipeDto, RecipeFilterDto, CalculateRecipeDto } from './production-recipe.dto';

@Injectable()
export class ProductionRecipeService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCTION RECIPE (BOM) MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create or update Production Recipe
   * Flow: Engineer buat resep produksi → sistem simpan daftar Material + Qty
   */
  async createRecipe(dto: CreateRecipeDto, CreatedBy: string) {
    // Validate Product exists
    const Product = await this.prisma.product.findUnique({
      where: { ID: dto.ProductId },
    });

    if (!Product) {
      throw new NotFoundException(`Product ${dto.ProductId} not found`);
    }

    // Validate all Material Products exist
    for (const item of dto.Items) {
      const Material = await this.prisma.product.findUnique({
        where: { ID: item.ProductId },
      });

      if (!Material) {
        throw new NotFoundException(`Material Product ${item.ProductId} not found`);
      }
    }

    const Result = await this.prisma.$transaction(async (tx) => {
      // Check if Recipe exists for this Product
      let Recipe = await tx.productionRecipe.findFirst({
        where: { ProductID: dto.ProductId },
      });

      if (Recipe) {
        // Delete existing items
        await tx.productionRecipeItem.deleteMany({
          where: { ProductionRecipeID: Recipe.ID },
        });

        // Update Recipe
        Recipe = await tx.productionRecipe.update({
          where: { ID: Recipe.ID },
          data: {
            Name: dto.Name,
            Description: dto.Description,
          },
        });
      } else {
        // Create new Recipe
        Recipe = await tx.productionRecipe.create({
          data: {
            ProductID: dto.ProductId,
            Name: dto.Name,
            Description: dto.Description,
            IsActive: true,
            CreatedByID: CreatedBy,
          },
        });
      }

      // Create Recipe items
      let TotalCost = 0;
      const items: Array<{
        ID: number;
        ProductId: number;
        ProductName: string;
        WarehouseId: number | undefined;
        UnitId: number;
        Quantity: number;
        Price: number;
        subTotal: number;
      }> = [];

      for (const item of dto.Items) {
        const Material = await tx.product.findUnique({
          where: { ID: item.ProductId },
        });

        if (!Material) {
          throw new NotFoundException(`Material Product ${item.ProductId} not found`);
        }

        const Price = item.Price ?? Number(Material.PurchasePrice);
        const subTotal = Price * item.Quantity;
        TotalCost += subTotal;

        const createdItem = await tx.productionRecipeItem.create({
          data: {
            ProductionRecipeID: Recipe.ID,
            ProductID: item.ProductId,
            WarehouseID: item.WarehouseId,
            UnitID: item.UnitId || Material.UnitID,
            Quantity: new Prisma.Decimal(item.Quantity),
            Price: new Prisma.Decimal(Price),
            IsActive: item.IsActive ?? true,
          },
        });

        items.push({
          ID: createdItem.ID,
          ProductId: item.ProductId,
          ProductName: Material.Name,
          WarehouseId: item.WarehouseId,
          UnitId: item.UnitId || Material.UnitID,
          Quantity: item.Quantity,
          Price,
          subTotal,
        });
      }

      return { Recipe, items, TotalCost };
    });

    return {
      success: true,
      Recipe: {
        ID: Result.Recipe.ID,
        ProductId: Result.Recipe.ProductID,
        ProductName: Product.Name,
        Name: Result.Recipe.Name,
        Description: Result.Recipe.Description,
        TotalCost: Result.TotalCost,
        itemCount: Result.items.length,
        items: Result.items,
      },
    };
  }

  /**
   * Get Recipe by Product ID
   */
  async getRecipeByProduct(ProductId: number) {
    const Recipe = await this.prisma.productionRecipe.findFirst({
      where: { ProductID: ProductId },
      include: {
        Product: true,
        Items: {
          include: {
            Product: true,
            Unit: true,
            Warehouse: true,
          },
          where: { IsActive: true },
        },
      },
    });

    if (!Recipe) {
      return {
        ProductId,
        hasRecipe: false,
        message: 'No Recipe found for this Product',
        items: [],
      };
    }

    const TotalCost = Recipe.Items.reduce((sum: number, item: { Quantity: { toNumber(): number }; Price: { toNumber(): number } }) => {
      return sum + Number(item.Quantity) * Number(item.Price);
    }, 0);

    return {
      ProductId,
      hasRecipe: true,
      Recipe: {
        ID: Recipe.ID,
        Name: Recipe.Name,
        Description: Recipe.Description,
        ProductName: Recipe.Product?.Name,
        TotalCost,
        CostPerUnit: TotalCost,
        items: Recipe.Items.map((item: { ID: number; ProductID: number; Product?: { Name?: string; Code?: string } | null; WarehouseID: number | null; Warehouse?: { Name?: string } | null; UnitID: number | null; Unit?: { Name?: string } | null; Quantity: { toNumber(): number }; Price: { toNumber(): number } }) => ({
          ID: item.ID,
          ProductId: item.ProductID,
          ProductName: item.Product?.Name,
          ProductCode: item.Product?.Code,
          WarehouseId: item.WarehouseID,
          WarehouseName: item.Warehouse?.Name,
          UnitId: item.UnitID,
          UnitName: item.Unit?.Name,
          Quantity: number(item.Quantity),
          Price: number(item.Price),
          subTotal: number(item.Quantity) * Number(item.Price),
        })),
      },
    };
  }

  /**
   * List Recipes
   */
  async listRecipes(dto: RecipeFilterDto) {
    const where: { ProductID?: number; IsActive?: boolean } = {};

    if (dto.ProductId) {
      where.ProductID = dto.ProductId;
    }

    if (dto.ActiveOnly) {
      where.IsActive = true;
    }

    const Recipes = await this.prisma.productionRecipe.findMany({
      where,
      include: {
        Product: { select: { ID: true, Code: true, Name: true } },
        Items: {
          where: { IsActive: true },
        },
      },
      orderBy: { CreatedAt: 'desc' },
    });

    return Recipes.map((r: { ID: number; ProductID: number; Product?: { ID: number; Code: string; Name: string } | null; Name: string; Description: string | null; IsActive: boolean; Items: Array<{ Quantity: { toNumber(): number }; Price: { toNumber(): number } }> }) => ({
      ID: r.ID,
      ProductId: r.ProductID,
      ProductCode: r.Product?.Code,
      ProductName: r.Product?.Name,
      Name: r.Name,
      Description: r.Description,
      IsActive: r.IsActive,
      itemCount: r.Items.length,
      TotalCost: r.Items.reduce((sum: number, item: { Quantity: { toNumber(): number }; Price: { toNumber(): number } }) => sum + Number(item.Quantity) * Number(item.Price), 0),
    }));
  }

  /**
   * Calculate Recipe Cost for Production
   */
  async calculateRecipe(dto: CalculateRecipeDto) {
    const Recipe = await this.prisma.productionRecipe.findUnique({
      where: { ID: dto.RecipeId },
      include: {
        Product: true,
        Items: {
          where: { IsActive: true },
          include: {
            Product: true,
            Unit: true,
          },
        },
      },
    });

    if (!Recipe) {
      throw new NotFoundException(`Recipe ${dto.RecipeId} not found`);
    }

    const itemsNeeded: Array<{
      ProductId: number;
      ProductName: string | undefined;
      UnitName: string | undefined;
      QuantityPerBatch: number;
      QuantityNeeded: number;
      Price: number;
      subTotal: number;
    }> = [];
    let TotalMaterialCost = 0;
    let allStockAvailable = true;
    const StockChecks: Array<{
      ProductId: number;
      ProductName: string | undefined;
      available: number;
      needed: number;
      sufficient: boolean;
    }> = [];

    for (const item of Recipe.Items) {
      const QuantityNeeded = Number(item.Quantity) * dto.Quantity;
      const subTotal = Number(item.Price) * QuantityNeeded;
      TotalMaterialCost += subTotal;

      itemsNeeded.push({
        ProductId: item.ProductID,
        ProductName: item.Product?.Name,
        UnitName: item.Unit?.Name,
        QuantityPerBatch: number(item.Quantity),
        QuantityNeeded,
        Price: number(item.Price),
        subTotal,
      });

      // Stock Check if Warehouse specified
      if (dto.WarehouseId) {
        const Stock = await this.prisma.productStock.findUnique({
          where: {
            ProductID_WarehouseID: {
              ProductID: item.ProductID,
              WarehouseID: dto.WarehouseId,
            },
          },
        });

        const available = Stock ? Number(Stock.Quantity) : 0;
        const sufficient = available >= QuantityNeeded;

        if (!sufficient) allStockAvailable = false;

        StockChecks.push({
          ProductId: item.ProductID,
          ProductName: item.Product?.Name,
          available,
          needed: QuantityNeeded,
          sufficient,
        });
      }
    }

    return {
      RecipeId: Recipe.ID,
      RecipeName: Recipe.Name,
      ProductId: Recipe.ProductID,
      ProductName: Recipe.Product?.Name,
      batchQuantity: dto.Quantity,
      TotalMaterialCost,
      UnitCost: TotalMaterialCost / dto.Quantity,
      itemsNeeded,
      StockChecks: dto.WarehouseId ? StockChecks : undefined,
      canProduce: !dto.WarehouseId || allStockAvailable,
    };
  }

  /**
   * Delete Recipe
   */
  async deleteRecipe(ID: number) {
    const Recipe = await this.prisma.productionRecipe.findUnique({
      where: { ID: ID },
    });

    if (!Recipe) {
      throw new NotFoundException(`Recipe ${ID} not found`);
    }

    // Delete items first
    await this.prisma.productionRecipeItem.deleteMany({
      where: { ProductionRecipeID: ID },
    });

    await this.prisma.productionRecipe.delete({
      where: { ID: ID },
    });

    return {
      success: true,
      message: `Recipe '${Recipe.Name}' deleted successfully`,
    };
  }
}
