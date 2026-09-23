import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilterDto,
  CreateBrandDto,
  UpdateBrandDto,
  BrandFilterDto,
  CreateUnitDto,
  UpdateUnitDto,
  CreateProductGroupDto,
  UpdateProductGroupDto,
} from './Category-Brand.dto';

@Injectable()
export class CategoryBrandService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CATEGORY MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException(`Category Code '${dto.Code}' already exists`);
    }

    const Category = await this.prisma.category.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Icon: dto.Icon,
        Image: dto.Image,
        Description: dto.Description,
      },
    });

    return {
      success: true,
      Category: this.formatCategory(Category),
    };
  }

  async updateCategory(CategoryId: number, dto: UpdateCategoryDto) {
    const Category = await this.prisma.category.findUnique({
      where: { ID: CategoryId },
    });

    if (!Category) {
      throw new NotFoundException('Category not found');
    }

    const updated = await this.prisma.category.update({
      where: { ID: CategoryId },
      data: {
        Name: dto.Name,
        Icon: dto.Icon,
        Image: dto.Image,
        Description: dto.Description,
        IsActive: dto.IsActive,
      },
    });

    return {
      success: true,
      Category: this.formatCategory(updated),
    };
  }

  async getCategory(CategoryId: number) {
    const Category = await this.prisma.category.findUnique({
      where: { ID: CategoryId },
    });

    if (!Category) {
      throw new NotFoundException('Category not found');
    }

    const productCount = await this.prisma.product.count({ where: { CategoryID: CategoryId } });

    return {
      ...this.formatCategory(Category),
      ProductCount: productCount,
    };
  }

  async listCategories(dto: CategoryFilterDto) {
    const where: any = {};

    if (dto.Search) {
      where.OR = [
        { Name: { contains: dto.Search, mode: 'insensitive' } },
        { Code: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    if (!dto.IncludeInactive) {
      where.IsActive = true;
    }

    const Categories = await this.prisma.category.findMany({
      where,
      orderBy: { Name: 'asc' },
    });

    const CategoriesWithCount = await Promise.all(
      Categories.map(async (c) => {
        const productCount = await this.prisma.product.count({ where: { CategoryID: c.ID } });
        return {
          ...this.formatCategory(c),
          ProductCount: productCount,
        };
      })
    );

    return CategoriesWithCount;
  }

  async deleteCategory(CategoryId: number) {
    const Category = await this.prisma.category.findUnique({
      where: { ID: CategoryId },
    });

    if (!Category) {
      throw new NotFoundException('Category not found');
    }

    const productCount = await this.prisma.product.count({ where: { CategoryID: CategoryId } });

    if (productCount > 0) {
      await this.prisma.category.update({
        where: { ID: CategoryId },
        data: { IsActive: false },
      });
      return { success: true, message: 'Category deactivated (has Products)' };
    }

    await this.prisma.category.delete({
      where: { ID: CategoryId },
    });

    return { success: true, message: 'Category deleted' };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BRAND MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  async createBrand(dto: CreateBrandDto) {
    const existing = await this.prisma.brand.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException(`Brand Code '${dto.Code}' already exists`);
    }

    const Brand = await this.prisma.brand.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Description: dto.Description,
        LogoUrl: dto.LogoUrl,
      },
    });

    return {
      success: true,
      Brand: this.formatBrand(Brand),
    };
  }

  async updateBrand(BrandId: number, dto: UpdateBrandDto) {
    const Brand = await this.prisma.brand.findUnique({
      where: { ID: BrandId },
    });

    if (!Brand) {
      throw new NotFoundException('Brand not found');
    }

    const updated = await this.prisma.brand.update({
      where: { ID: BrandId },
      data: {
        Name: dto.Name,
        Description: dto.Description,
        LogoUrl: dto.LogoUrl,
        IsActive: dto.IsActive,
      },
    });

    return {
      success: true,
      Brand: this.formatBrand(updated),
    };
  }

  async getBrand(BrandId: number) {
    const Brand = await this.prisma.brand.findUnique({
      where: { ID: BrandId },
    });

    if (!Brand) {
      throw new NotFoundException('Brand not found');
    }

    const productCount = await this.prisma.product.count({ where: { BrandID: BrandId } });

    return {
      ...this.formatBrand(Brand),
      ProductCount: productCount,
    };
  }

  async listBrands(dto: BrandFilterDto) {
    const where: any = {};

    if (dto.Search) {
      where.OR = [
        { Name: { contains: dto.Search, mode: 'insensitive' } },
        { Code: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    if (!dto.IncludeInactive) {
      where.IsActive = true;
    }

    const Brands = await this.prisma.brand.findMany({
      where,
      orderBy: { Name: 'asc' },
    });

    const BrandsWithCount = await Promise.all(
      Brands.map(async (b) => {
        const productCount = await this.prisma.product.count({ where: { BrandID: b.ID } });
        return {
          ...this.formatBrand(b),
          ProductCount: productCount,
        };
      })
    );

    return BrandsWithCount;
  }

  async deleteBrand(BrandId: number) {
    const Brand = await this.prisma.brand.findUnique({
      where: { ID: BrandId },
    });

    if (!Brand) {
      throw new NotFoundException('Brand not found');
    }

    const productCount = await this.prisma.product.count({ where: { BrandID: BrandId } });

    if (productCount > 0) {
      await this.prisma.brand.update({
        where: { ID: BrandId },
        data: { IsActive: false },
      });
      return { success: true, message: 'Brand deactivated (has Products)' };
    }

    await this.prisma.brand.delete({
      where: { ID: BrandId },
    });

    return { success: true, message: 'Brand deleted' };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UNIT MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  async createUnit(dto: CreateUnitDto) {
    const existing = await this.prisma.unit.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException(`Unit Code '${dto.Code}' already exists`);
    }

    const Unit = await this.prisma.unit.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Abbreviation: dto.Abbreviation,
        Description: dto.Description,
      },
    });

    return {
      success: true,
      Unit: this.formatUnit(Unit),
    };
  }

  async updateUnit(UnitId: number, dto: UpdateUnitDto) {
    const Unit = await this.prisma.unit.findUnique({
      where: { ID: UnitId },
    });

    if (!Unit) {
      throw new NotFoundException('Unit not found');
    }

    const updated = await this.prisma.unit.update({
      where: { ID: UnitId },
      data: {
        Name: dto.Name,
        Abbreviation: dto.Abbreviation,
        Description: dto.Description,
        IsActive: dto.IsActive,
      },
    });

    return {
      success: true,
      Unit: this.formatUnit(updated),
    };
  }

  async listUnits() {
    const Units = await this.prisma.unit.findMany({
      where: { IsActive: true },
      orderBy: { Name: 'asc' },
    });

    return Units.map((u) => this.formatUnit(u));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCT GROUP MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  async createProductGroup(dto: CreateProductGroupDto) {
    const existing = await this.prisma.productGroup.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException(`Product Group Code '${dto.Code}' already exists`);
    }

    const Group = await this.prisma.productGroup.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Description: dto.Description,
      },
    });

    return {
      success: true,
      ProductGroup: this.formatProductGroup(Group),
    };
  }

  async updateProductGroup(GroupId: number, dto: UpdateProductGroupDto) {
    const Group = await this.prisma.productGroup.findUnique({
      where: { ID: GroupId },
    });

    if (!Group) {
      throw new NotFoundException('Product Group not found');
    }

    const updated = await this.prisma.productGroup.update({
      where: { ID: GroupId },
      data: {
        Name: dto.Name,
        Description: dto.Description,
        IsActive: dto.IsActive,
      },
    });

    return {
      success: true,
      ProductGroup: this.formatProductGroup(updated),
    };
  }

  async listProductGroups() {
    const Groups = await this.prisma.productGroup.findMany({
      where: { IsActive: true },
      orderBy: { Name: 'asc' },
    });

    const GroupsWithCount = await Promise.all(
      Groups.map(async (g) => {
        const productCount = await this.prisma.product.count({ where: { ProductGroupID: g.ID } });
        return {
          ...this.formatProductGroup(g),
          ProductCount: productCount,
        };
      })
    );

    return GroupsWithCount;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MASTER DATA SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────

  async getMasterDataSummary() {
    const [Categories, Brands, Units, ProductGroups] = await Promise.all([
      this.prisma.category.count({ where: { IsActive: true } }),
      this.prisma.brand.count({ where: { IsActive: true } }),
      this.prisma.unit.count({ where: { IsActive: true } }),
      this.prisma.productGroup.count({ where: { IsActive: true } }),
    ]);

    return {
      Categories,
      Brands,
      Units,
      ProductGroups,
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
      Icon: Category.Icon,
      Image: Category.Image,
      Description: Category.Description,
      IsActive: Category.IsActive,
      createdAt: Category.CreatedAt,
    };
  }

  private formatBrand(Brand: any) {
    return {
      ID: Brand.ID,
      Code: Brand.Code,
      Name: Brand.Name,
      Description: Brand.Description,
      LogoUrl: Brand.LogoUrl,
      IsActive: Brand.IsActive,
      createdAt: Brand.CreatedAt,
    };
  }

  private formatUnit(Unit: any) {
    return {
      ID: Unit.ID,
      Code: Unit.Code,
      Name: Unit.Name,
      Abbreviation: Unit.Abbreviation,
      Description: Unit.Description,
      IsActive: Unit.IsActive,
    };
  }

  private formatProductGroup(Group: any) {
    return {
      ID: Group.ID,
      Code: Group.Code,
      Name: Group.Name,
      Description: Group.Description,
      IsActive: Group.IsActive,
    };
  }
}
