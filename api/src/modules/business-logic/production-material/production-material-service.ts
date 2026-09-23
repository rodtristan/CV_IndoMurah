import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateProductionCategoryDto,
  UpdateProductionCategoryDto,
  CreateProductionMaterialDto,
  UpdateProductionMaterialDto,
  ProductionMaterialFilterDto,
} from './Production-Material.dto';

@Injectable()
export class ProductionMaterialService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCTION CATEGORY MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Production Category
   */
  async createProductionCategory(dto: CreateProductionCategoryDto) {
    const existing = await this.prisma.productionCategory.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException('Category Code already exists');
    }

    const Category = await this.prisma.productionCategory.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Description: dto.Description,
        IsRawMaterial: dto.isRawMaterial ?? false,
      },
    });

    return { success: true, Category: this.formatCategory(Category) };
  }

  /**
   * List Production Categories
   */
  async listProductionCategories(includeInActive = false) {
    const where = includeInActive ? {} : { IsActive: true };

    const Categories = await this.prisma.productionCategory.findMany({
      where,
      include: { _count: { select: { Materials: true } } },
      orderBy: { Name: 'asc' },
    });

    return Categories.map((c) => ({
      ...this.formatCategory(c),
      MaterialCount: c._count.Materials,
    }));
  }

  /**
   * Get Production Category by ID
   */
  async getProductionCategory(ID: number) {
    const Category = await this.prisma.productionCategory.findUnique({
      where: { ID: ID },
      include: { Materials: true },
    });

    if (!Category) throw new NotFoundException('Category not found');
    return {
      ...this.formatCategory(Category),
      Materials: Category.Materials.map((m) => this.formatMaterial(m)),
    };
  }

  /**
   * UpDate Production Category (PATCH)
   */
  async updateProductionCategory(ID: number, dto: UpdateProductionCategoryDto) {
    const Category = await this.prisma.productionCategory.findUnique({ where: { ID: ID } });
    if (!Category) throw new NotFoundException('Category not found');

    const updated = await this.prisma.productionCategory.update({
      where: { ID: ID },
      data: {
        Name: dto.Name ?? Category.Name,
        Description: dto.Description ?? Category.Description,
        IsActive: dto.IsActive ?? Category.IsActive,
      },
    });

    return { success: true, Category: this.formatCategory(updated) };
  }

  /**
   * Delete Production Category
   */
  async deleteProductionCategory(ID: number) {
    const Category = await this.prisma.productionCategory.findUnique({
      where: { ID: ID },
      include: { _count: { select: { Materials: true } } },
    });
    if (!Category) throw new NotFoundException('Category not found');
    if (Category._count.Materials > 0) {
      throw new BadRequestException('Cannot delete Category with existing Materials');
    }

    await this.prisma.productionCategory.delete({ where: { ID: ID } });
    return { success: true, message: 'Category deleted' };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCTION MATERIAL MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Production Material
   */
  async createProductionMaterial(dto: CreateProductionMaterialDto, UserId: string) {
    // Validate Category
    const Category = await this.prisma.productionCategory.findUnique({
      where: { ID: dto.CategoryId },
    });
    if (!Category) throw new NotFoundException('Category not found');

    // Validate Unit
    const Unit = await this.prisma.unit.findUnique({ where: { ID: dto.UnitId } });
    if (!Unit) throw new NotFoundException('Unit not found');

    // generate Material Code
    const Code = await this.generateMaterialCode();

    const Material = await this.prisma.productionMaterial.create({
      data: {
        Code: Code,
        Name: dto.Name,
        ProductionCategoryID: dto.CategoryId,
        UnitID: dto.UnitId,
        PurchasePrice: dto.PurchasePrice,
        MinimumStock: dto.MinimumStock,
        Description: dto.Description,
        IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
      },
      include: { ProductionCategory: true, Unit: true },
    });

    return { success: true, Material: this.formatMaterial(Material) };
  }

  /**
   * List Production Materials
   */
  async listProductionMaterials(dto: ProductionMaterialFilterDto) {
    const where: any = {};

    if (dto.CategoryId) where.ProductionCategoryID = dto.CategoryId;
    if (dto.IsActive !== undefined) where.IsActive = dto.IsActive;
    if (dto.Search) {
      where.OR = [
        { Name: { contains: dto.Search, mode: 'insensitive' } },
        { Code: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    const Materials = await this.prisma.productionMaterial.findMany({
      where,
      include: { ProductionCategory: true, Unit: true },
      orderBy: { Name: 'asc' },
    });

    return Materials.map((m) => this.formatMaterial(m));
  }

  /**
   * Get Production Material by ID
   */
  async getProductionMaterial(ID: number) {
    const Material = await this.prisma.productionMaterial.findUnique({
      where: { ID: ID },
      include: { ProductionCategory: true, Unit: true },
    });

    if (!Material) throw new NotFoundException('Material not found');
    return this.formatMaterial(Material);
  }

  /**
   * UpDate Production Material (PATCH)
   */
  async updateProductionMaterial(ID: number, dto: UpdateProductionMaterialDto, UserId: string) {
    const Material = await this.prisma.productionMaterial.findUnique({ where: { ID: ID } });
    if (!Material) throw new NotFoundException('Material not found');

    const updated = await this.prisma.productionMaterial.update({
      where: { ID: ID },
      data: {
        Name: dto.Name ?? Material.Name,
        ProductionCategoryID: dto.CategoryId ?? Material.ProductionCategoryID,
        UnitID: dto.UnitId ?? Material.UnitID,
        PurchasePrice: dto.PurchasePrice ?? Material.PurchasePrice,
        MinimumStock: dto.MinimumStock ?? Material.MinimumStock,
        Description: dto.Description ?? Material.Description,
        IsActive: dto.IsActive ?? Material.IsActive,
      },
      include: { ProductionCategory: true, Unit: true },
    });

    return { success: true, Material: this.formatMaterial(updated) };
  }

  /**
   * Delete Production Material
   */
  async deleteProductionMaterial(ID: number) {
    const Material = await this.prisma.productionMaterial.findUnique({ where: { ID: ID } });
    if (!Material) throw new NotFoundException('Material not found');

    await this.prisma.productionMaterial.delete({ where: { ID: ID } });
    return { success: true, message: 'Material deleted' };
  }

  /**
   * Get low Stock Materials
   */
  async getLowStockMaterials() {
    const Materials = await this.prisma.productionMaterial.findMany({
      where: {
        IsActive: true,
        MinimumStock: { gt: 0 },
      },
      include: { ProductionCategory: true, Unit: true },
    });

    const lowStock = Materials.filter(
      (m) => m.MinimumStock && Number(m.CurrentStock || 0) < Number(m.MinimumStock),
    );

    return lowStock.map((m) => ({
      ...this.formatMaterial(m),
      currentStock: number(m.CurrentStock || 0),
      minimumStock: number(m.MinimumStock),
      deficit: number(m.MinimumStock) - Number(m.CurrentStock || 0),
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateMaterialCode(): Promise<string> {
    const prefix = 'MAT';
    const lastMaterial = await this.prisma.productionMaterial.findFirst({
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastMaterial) {
      const lastSeq = parseInt(lastMaterial.Code.replace(prefix, ''), 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  }

  private formatCategory(Category: any) {
    return {
      ID: Category.ID,
      Code: Category.Code,
      Name: Category.Name,
      Description: Category.Description,
      isRawMaterial: Category.IsRawMaterial,
      IsActive: Category.IsActive,
    };
  }

  private formatMaterial(Material: any) {
    return {
      ID: Material.ID,
      Code: Material.Code,
      Name: Material.Name,
      Category: Material.ProductionCategory?.Name,
      CategoryId: Material.ProductionCategoryID,
      Unit: Material.Unit?.Name,
      UnitId: Material.UnitID,
      PurchasePrice: Material.PurchasePrice ? Number(Material.PurchasePrice) : null,
      minimumStock: Material.MinimumStock ? Number(Material.MinimumStock) : null,
      currentStock: Material.CurrentStock ? Number(Material.CurrentStock) : 0,
      Description: Material.Description,
      IsActive: Material.IsActive,
    };
  }
}
