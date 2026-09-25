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
exports.ProductionRecipeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let ProductionRecipeService = class ProductionRecipeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRecipe(dto, CreatedBy) {
        const Product = await this.prisma.product.findUnique({
            where: { ID: dto.ProductId },
        });
        if (!Product) {
            throw new common_1.NotFoundException(`Product ${dto.ProductId} not found`);
        }
        for (const item of dto.Items) {
            const Material = await this.prisma.product.findUnique({
                where: { ID: item.ProductId },
            });
            if (!Material) {
                throw new common_1.NotFoundException(`Material Product ${item.ProductId} not found`);
            }
        }
        const Result = await this.prisma.$transaction(async (tx) => {
            let Recipe = await tx.productionRecipe.findFirst({
                where: { ProductID: dto.ProductId },
            });
            if (Recipe) {
                await tx.productionRecipeItem.deleteMany({
                    where: { ProductionRecipeID: Recipe.ID },
                });
                Recipe = await tx.productionRecipe.update({
                    where: { ID: Recipe.ID },
                    data: {
                        Name: dto.Name,
                        Description: dto.Description,
                    },
                });
            }
            else {
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
            let TotalCost = 0;
            const items = [];
            for (const item of dto.Items) {
                const Material = await tx.product.findUnique({
                    where: { ID: item.ProductId },
                });
                if (!Material) {
                    throw new common_1.NotFoundException(`Material Product ${item.ProductId} not found`);
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
                        Quantity: new client_1.Prisma.Decimal(item.Quantity),
                        Price: new client_1.Prisma.Decimal(Price),
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
    async getRecipeByProduct(ProductId) {
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
        const TotalCost = Recipe.Items.reduce((sum, item) => {
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
                items: Recipe.Items.map((item) => ({
                    ID: item.ID,
                    ProductId: item.ProductID,
                    ProductName: item.Product?.Name,
                    ProductCode: item.Product?.Code,
                    WarehouseId: item.WarehouseID,
                    WarehouseName: item.Warehouse?.Name,
                    UnitId: item.UnitID,
                    UnitName: item.Unit?.Name,
                    Quantity: (0, number_1.number)(item.Quantity),
                    Price: (0, number_1.number)(item.Price),
                    subTotal: (0, number_1.number)(item.Quantity) * Number(item.Price),
                })),
            },
        };
    }
    async listRecipes(dto) {
        const where = {};
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
        return Recipes.map((r) => ({
            ID: r.ID,
            ProductId: r.ProductID,
            ProductCode: r.Product?.Code,
            ProductName: r.Product?.Name,
            Name: r.Name,
            Description: r.Description,
            IsActive: r.IsActive,
            itemCount: r.Items.length,
            TotalCost: r.Items.reduce((sum, item) => sum + Number(item.Quantity) * Number(item.Price), 0),
        }));
    }
    async calculateRecipe(dto) {
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
            throw new common_1.NotFoundException(`Recipe ${dto.RecipeId} not found`);
        }
        const itemsNeeded = [];
        let TotalMaterialCost = 0;
        let allStockAvailable = true;
        const StockChecks = [];
        for (const item of Recipe.Items) {
            const QuantityNeeded = Number(item.Quantity) * dto.Quantity;
            const subTotal = Number(item.Price) * QuantityNeeded;
            TotalMaterialCost += subTotal;
            itemsNeeded.push({
                ProductId: item.ProductID,
                ProductName: item.Product?.Name,
                UnitName: item.Unit?.Name,
                QuantityPerBatch: (0, number_1.number)(item.Quantity),
                QuantityNeeded,
                Price: (0, number_1.number)(item.Price),
                subTotal,
            });
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
                if (!sufficient)
                    allStockAvailable = false;
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
    async deleteRecipe(ID) {
        const Recipe = await this.prisma.productionRecipe.findUnique({
            where: { ID: ID },
        });
        if (!Recipe) {
            throw new common_1.NotFoundException(`Recipe ${ID} not found`);
        }
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
};
exports.ProductionRecipeService = ProductionRecipeService;
exports.ProductionRecipeService = ProductionRecipeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductionRecipeService);
