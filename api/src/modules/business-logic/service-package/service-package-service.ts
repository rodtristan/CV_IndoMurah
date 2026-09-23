import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateServiceCategoryDto,
  UpDateServiceCategoryDto,
  CreateServicePackageDto,
  UpDateServicePackageDto,
  ServicePackageFilterDto,
  CalculatePackageQuoteDto,
  ComparePackagesDto,
} from './service-package.dto';

@Injectable()
export class ServicePackageService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // SERVICE CATEGORY MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create service Category
   * Flow: Admin membuat kategori layanan (e.g., Service HP, Service Laptop)
   */
  async createServiceCategory(dto: CreateServiceCategoryDto, UserId: string) {
    // Check for duplicate Code
    const existing = await this.prisma.serviceCategory.findFirst({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException(`Category with Code '${dto.Code}' already exists`);
    }

    const Category = await this.prisma.serviceCategory.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Description: dto.Description,
        DefaultLaborCost: dto.DefaultLaborCost
          ? new Prisma.Decimal(dto.DefaultLaborCost)
          : null,
        IsActive: true,
      },
    });

    return {
      success: true,
      Category: this.formatCategory(Category),
    };
  }

  /**
   * Get service Category by ID
   */
  async getServiceCategory(CategoryId: number) {
    const Category = await this.prisma.serviceCategory.findUnique({
      where: { ID: CategoryId },
      include: { _Count: { select: { Packages: true } } },
    });

    if (!Category) {
      throw new NotFoundException('Service Category not found');
    }

    return {
      ...this.formatCategory(Category),
      PackageCount: Category._Count.Packages,
    };
  }

  /**
   * List service Categories
   */
  async listServiceCategories(IsActive?: boolean) {
    const where: any = {};
    if (IsActive !== undefined) {
      where.IsActive = IsActive;
    }

    const Categories = await this.prisma.serviceCategory.findMany({
      where,
      include: {
        _Count: { select: { Packages: true } },
      },
      orderBy: { Name: 'asc' },
    });

    return Categories.map((c) => ({
      ...this.formatCategory(c),
      PackageCount: c._Count.Packages,
    }));
  }

  /**
   * UpDate service Category
   */
  async updateServiceCategory(CategoryId: number, dto: UpDateServiceCategoryDto) {
    const Category = await this.prisma.serviceCategory.findUnique({
      where: { ID: CategoryId },
    });

    if (!Category) {
      throw new NotFoundException('Service Category not found');
    }

    const updated = await this.prisma.serviceCategory.update({
      where: { ID: CategoryId },
      data: {
        Name: dto.Name,
        Description: dto.Description,
        DefaultLaborCost: dto.DefaultLaborCost
          ? new Prisma.Decimal(dto.DefaultLaborCost)
          : undefined,
        IsActive: dto.IsActive,
      },
    });

    return {
      success: true,
      Category: this.formatCategory(updated),
    };
  }

  /**
   * Delete service Category
   */
  async deleteServiceCategory(CategoryId: number) {
    const Category = await this.prisma.serviceCategory.findUnique({
      where: { ID: CategoryId },
      include: { _Count: { select: { Packages: true } } },
    });

    if (!Category) {
      throw new NotFoundException('Service Category not found');
    }

    if (Category._Count.Packages > 0) {
      throw new BadRequestException('Cannot delete Category with existing Packages');
    }

    await this.prisma.serviceCategory.delete({
      where: { ID: CategoryId },
    });

    return {
      success: true,
      message: 'Service Category deleted successfully',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SERVICE PACKAGE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create service Package
   * Flow: Admin membuat paket layanan (e.g., Paket Service LCD)
   */
  async createServicePackage(dto: CreateServicePackageDto, UserId: string) {
    // Check for duplicate Code
    const existing = await this.prisma.servicePackage.findFirst({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException(`Package with Code '${dto.Code}' already exists`);
    }

    // Validate Category
    const Category = await this.prisma.serviceCategory.findUnique({
      where: { ID: dto.ServiceCategoryId },
    });

    if (!Category) {
      throw new NotFoundException('Service Category not found');
    }

    // Calculate Cost from items
    let TotalCost = dto.CostPrice || 0;

    if (dto.Items && dto.Items.length > 0) {
      for (const item of dto.Items) {
        if (item.ProductId) {
          const Product = await this.prisma.product.findUnique({
            where: { ID: item.ProductId },
          });
          if (Product) {
            TotalCost += Number(Product.PurchasePrice) * item.Quantity;
          }
        } else if (item.UnitPrice) {
          TotalCost += item.UnitPrice * item.Quantity;
        }
      }
    }

    // Create Package
    const pkg = await this.prisma.servicePackage.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        ServiceCategoryID: dto.ServiceCategoryId,
        EstimatedDuration: dto.EstimatedDuration || 0,
        SellingPrice: new Prisma.Decimal(dto.SellingPrice || 0),
        CostPrice: new Prisma.Decimal(TotalCost),
        Description: dto.Description,
        IsActive: true,
        PackageItems: dto.Items
          ? {
              create: await Promise.all(
                dto.Items.map(async (item, index) => {
                  let UnitPrice = item.UnitPrice || 0;

                  if (item.ProductId) {
                    const Product = await this.prisma.product.findUnique({
                      where: { ID: item.ProductId },
                    });
                    if (Product) {
                      UnitPrice = Number(Product.PurchasePrice);
                    }
                  }

                  return {
                    ProductID: item.ProductId || null,
                    ItemName: item.itemName,
                    Quantity: new Prisma.Decimal(item.Quantity),
                    UnitPrice: new Prisma.Decimal(UnitPrice),
                    SubTotal: new Prisma.Decimal(UnitPrice * item.Quantity),
                    SortOrder: index + 1,
                  };
                }),
              ),
            }
          : undefined,
      },
      include: {
        ServiceCategory: true,
        PackageItems: {
          include: { Product: true },
          orderBy: { SortOrder: 'asc' },
        },
      },
    });

    return {
      success: true,
      Package: this.formatPackage(pkg),
    };
  }

  /**
   * Get service Package by ID
   */
  async getServicePackage(PackageId: number) {
    const pkg = await this.prisma.servicePackage.findUnique({
      where: { ID: PackageId },
      include: {
        ServiceCategory: true,
        PackageItems: {
          include: { Product: true },
          orderBy: { SortOrder: 'asc' },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException('Service Package not found');
    }

    return this.formatPackage(pkg);
  }

  /**
   * List service Packages
   */
  async listServicePackages(dto: ServicePackageFilterDto) {
    const where: any = {};

    if (dto.ServiceCategoryId) {
      where.ServiceCategoryID = dto.ServiceCategoryId;
    }

    if (dto.IsActive !== undefined) {
      where.IsActive = dto.IsActive;
    }

    if (dto.Search) {
      where.OR = [
        { Name: { contains: dto.Search, mode: 'insensitive' } },
        { Code: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    const Packages = await this.prisma.servicePackage.findMany({
      where,
      include: {
        ServiceCategory: true,
        PackageItems: true,
      },
      orderBy: { Name: 'asc' },
    });

    return Packages.map((p) => this.formatPackage(p));
  }

  /**
   * UpDate service Package
   */
  async updateServicePackage(PackageId: number, dto: UpDateServicePackageDto, UserId: string) {
    const pkg = await this.prisma.servicePackage.findUnique({
      where: { ID: PackageId },
      include: { PackageItems: true },
    });

    if (!pkg) {
      throw new NotFoundException('Service Package not found');
    }

    // Recalculate Cost if items changed
    let TotalCost = Number(pkg.CostPrice);

    if (dto.Items) {
      TotalCost = 0;
      for (const item of dto.Items) {
        let UnitPrice = item.UnitPrice || 0;

        if (item.ProductId) {
          const Product = await this.prisma.product.findUnique({
            where: { ID: item.ProductId },
          });
          if (Product) {
            UnitPrice = Number(Product.PurchasePrice);
          }
        }

        TotalCost += UnitPrice * item.Quantity;
      }
    }

    const updated = await this.prisma.servicePackage.update({
      where: { ID: PackageId },
      data: {
        Name: dto.Name,
        ServiceCategoryID: dto.ServiceCategoryId,
        EstimatedDuration: dto.EstimatedDuration,
        SellingPrice: dto.SellingPrice
          ? new Prisma.Decimal(dto.SellingPrice)
          : undefined,
        CostPrice: dto.Items
          ? new Prisma.Decimal(TotalCost)
          : undefined,
        Description: dto.Description,
        IsActive: dto.IsActive,
      },
      include: {
        ServiceCategory: true,
        PackageItems: {
          include: { Product: true },
          orderBy: { SortOrder: 'asc' },
        },
      },
    });

    // UpDate items if provided
    if (dto.Items) {
      // Delete existing items
      await this.prisma.PackageItem.deleteMany({
        where: { ServicePackageID: PackageId },
      });

      // Create new items
      for (let i = 0; i < dto.Items.length; i++) {
        const item = dto.Items[i];
        let UnitPrice = item.UnitPrice || 0;

        if (item.ProductId) {
          const Product = await this.prisma.product.findUnique({
            where: { ID: item.ProductId },
          });
          if (Product) {
            UnitPrice = Number(Product.PurchasePrice);
          }
        }

        await this.prisma.PackageItem.create({
          data: {
            ServicePackageID: PackageId,
            ProductID: item.ProductId || null,
            ItemName: item.itemName,
            Quantity: new Prisma.Decimal(item.Quantity),
            UnitPrice: new Prisma.Decimal(UnitPrice),
            SubTotal: new Prisma.Decimal(UnitPrice * item.Quantity),
            SortOrder: i + 1,
          },
        });
      }
    }

    return {
      success: true,
      Package: this.formatPackage(updated),
    };
  }

  /**
   * Delete service Package
   */
  async deleteServicePackage(PackageId: number) {
    const pkg = await this.prisma.servicePackage.findUnique({
      where: { ID: PackageId },
    });

    if (!pkg) {
      throw new NotFoundException('Service Package not found');
    }

    await this.prisma.PackageItem.deleteMany({
      where: { ServicePackageID: PackageId },
    });

    await this.prisma.servicePackage.delete({
      where: { ID: PackageId },
    });

    return {
      success: true,
      message: 'Service Package deleted successfully',
    };
  }

  /**
   * Clone/duplicate service Package
   */
  async cloneServicePackage(PackageId: number, newCode: string, newName: string, UserId: string) {
    const original = await this.prisma.servicePackage.findUnique({
      where: { ID: PackageId },
      include: { PackageItems: true },
    });

    if (!original) {
      throw new NotFoundException('Service Package not found');
    }

    // Check for duplicate Code
    const existing = await this.prisma.servicePackage.findFirst({
      where: { Code: newCode },
    });

    if (existing) {
      throw new BadRequestException(`Package with Code '${newCode}' already exists`);
    }

    const cloned = await this.prisma.servicePackage.create({
      data: {
        Code: newCode,
        Name: newName,
        ServiceCategoryID: original.ServiceCategoryID,
        EstimatedDuration: original.EstimatedDuration,
        SellingPrice: original.SellingPrice,
        CostPrice: original.CostPrice,
        Description: original.Description,
        IsActive: true,
        PackageItems: {
          create: original.PackageItems.map((item, index) => ({
            ProductID: item.ProductID,
            ItemName: item.ItemName,
            Quantity: item.Quantity,
            UnitPrice: item.UnitPrice,
            SubTotal: item.SubTotal,
            SortOrder: index + 1,
          })),
        },
      },
      include: {
        ServiceCategory: true,
        PackageItems: {
          include: { Product: true },
          orderBy: { SortOrder: 'asc' },
        },
      },
    });

    return {
      success: true,
      Package: this.formatPackage(cloned),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SERVICE PACKAGE QUOTE & CALCULATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Calculate Package quote
   * Flow: Staff/service advisor calculate harga paket layanan
   */
  async calculatePackageQuote(dto: CalculatePackageQuoteDto) {
    const pkg = await this.prisma.servicePackage.findUnique({
      where: { ID: dto.PackageId },
      include: {
        ServiceCategory: true,
        PackageItems: {
          include: { Product: true },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException('Service Package not found');
    }

    const Quantity = dto.Quantity || 1;

    // Calculate item Costs
    const items = pkg.PackageItems.map((item) => {
      const requiredQty = Number(item.Quantity) * Quantity;
      return {
        ID: item.ID,
        ProductId: item.ProductID,
        ProductName: item.Product?.Name || item.ItemName,
        baseQuantity: number(item.Quantity),
        requiredQuantity: requiredQty,
        UnitPrice: number(item.UnitPrice),
        subTotal: number(item.UnitPrice) * requiredQty,
      };
    });

    // Calculate Totals
    const itemSubTotal = items.reduce((sum, item) => sum + item.subTotal, 0);
    const laborCost = Number(pkg.ServiceCategory?.DefaultLaborCost || 0) * Quantity;
    const TotalCost = itemSubTotal + laborCost;
    const sellingPrice = Number(pkg.SellingPrice) * Quantity;
    const discountAmount = dto.DiscountPercent
      ? sellingPrice * (dto.DiscountPercent / 100)
      : 0;
    const finalPrice = sellingPrice - discountAmount;

    return {
      PackageId: pkg.ID,
      PackageCode: pkg.Code,
      PackageName: pkg.Name,
      Category: pkg.ServiceCategory?.Name,
      estimatedDuration: pkg.EstimatedDuration * Quantity,
      Quantity,
      items,
      calculation: {
        itemSubTotal,
        laborCost,
        TotalCost,
        suggestedPrice: sellingPrice,
        discountPercent: dto.DiscountPercent || 0,
        discountAmount,
        finalPrice,
        profit: finalPrice - TotalCost,
        profitMargin: finalPrice > 0 ? ((finalPrice - TotalCost) / finalPrice) * 100 : 0,
      },
    };
  }

  /**
   * Compare multiple Packages
   */
  async comparePackages(dto: ComparePackagesDto) {
    const Packages = await this.prisma.servicePackage.findMany({
      where: { ID: { in: dto.PackageIds } },
      include: {
        ServiceCategory: true,
        PackageItems: {
          include: { Product: true },
        },
      },
    });

    if (Packages.length === 0) {
      throw new NotFoundException('No Packages found');
    }

    const comparisons = Packages.map((pkg) => {
      const itemCost = pkg.PackageItems.reduce(
        (sum, item) => sum + Number(item.UnitPrice) * Number(item.Quantity),
        0,
      );
      const laborCost = Number(pkg.ServiceCategory?.DefaultLaborCost || 0);
      const TotalCost = itemCost + laborCost;
      const sellingPrice = Number(pkg.SellingPrice);

      return {
        ID: pkg.ID,
        Code: pkg.Code,
        Name: pkg.Name,
        Category: pkg.ServiceCategory?.Name,
        estimatedDuration: pkg.EstimatedDuration,
        itemCount: pkg.PackageItems.length,
        itemCost,
        laborCost,
        TotalCost,
        sellingPrice,
        profit: sellingPrice - TotalCost,
        profitMargin: sellingPrice > 0 ? ((sellingPrice - TotalCost) / sellingPrice) * 100 : 0,
        items: pkg.PackageItems.map((item) => ({
          Name: item.Product?.Name || item.ItemName,
          Quantity: number(item.Quantity),
          UnitPrice: number(item.UnitPrice),
        })),
      };
    });

    // Sort by profit margin
    const sortedByMargin = [...comparisons].sort(
      (a, b) => b.profitMargin - a.profitMargin,
    );

    return {
      comparison: comparisons,
      bestValue: sortedByMargin[0],
      sortedByMargin,
    };
  }

  /**
   * Get Packages by Category with quick quote
   */
  async getPackagesByCategory(CategoryId: number) {
    const Category = await this.prisma.serviceCategory.findUnique({
      where: { ID: CategoryId },
      include: {
        Packages: {
          where: { IsActive: true },
          include: { PackageItems: true },
          orderBy: { SellingPrice: 'asc' },
        },
      },
    });

    if (!Category) {
      throw new NotFoundException('Service Category not found');
    }

    const Packages = Category.Packages.map((pkg) => {
      const itemCost = pkg.PackageItems.reduce(
        (sum, item) => sum + Number(item.UnitPrice) * Number(item.Quantity),
        0,
      );
      const laborCost = Number(Category.DefaultLaborCost || 0);
      const TotalCost = itemCost + laborCost;
      const sellingPrice = Number(pkg.SellingPrice);

      return {
        ID: pkg.ID,
        Code: pkg.Code,
        Name: pkg.Name,
        estimatedDuration: pkg.EstimatedDuration,
        CostPrice: TotalCost,
        sellingPrice,
        profit: sellingPrice - TotalCost,
        profitMargin: sellingPrice > 0 ? ((sellingPrice - TotalCost) / sellingPrice) * 100 : 0,
        itemCount: pkg.PackageItems.length,
      };
    });

    return {
      CategoryId: Category.ID,
      CategoryName: Category.Name,
      DefaultLaborCost: number(Category.DefaultLaborCost || 0),
      Packages,
      Summary: {
        TotalPackages: Packages.length,
        avgPrice:
          Packages.length > 0
            ? Packages.reduce((sum, p) => sum + p.sellingPrice, 0) / Packages.length
            : 0,
        avgProfitMargin:
          Packages.length > 0
            ? Packages.reduce((sum, p) => sum + p.profitMargin, 0) / Packages.length
            : 0,
      },
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
      DefaultLaborCost: Category.DefaultLaborCost ? Number(Category.DefaultLaborCost) : null,
      IsActive: Category.IsActive,
      createdAt: Category.CreatedAt,
    };
  }

  private formatPackage(pkg: any) {
    return {
      ID: pkg.ID,
      Code: pkg.Code,
      Name: pkg.Name,
      CategoryId: pkg.ServiceCategoryID,
      Category: pkg.ServiceCategory?.Name,
      estimatedDuration: pkg.EstimatedDuration,
      sellingPrice: number(pkg.SellingPrice),
      CostPrice: number(pkg.CostPrice),
      profit: number(pkg.SellingPrice) - Number(pkg.CostPrice),
      profitMargin:
        Number(pkg.SellingPrice) > 0
          ? ((Number(pkg.SellingPrice) - Number(pkg.CostPrice)) / Number(pkg.SellingPrice)) * 100
          : 0,
      Description: pkg.Description,
      IsActive: pkg.IsActive,
      createdAt: pkg.CreatedAt,
      items: pkg.PackageItems?.map((item: any) => ({
        ID: item.ID,
        ProductId: item.ProductID,
        ProductName: item.Product?.Name || item.ItemName,
        ProductCode: item.Product?.Code,
        Quantity: number(item.Quantity),
        UnitPrice: number(item.UnitPrice),
        subTotal: number(item.SubTotal),
      })) || [],
    };
  }
}
