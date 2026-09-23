import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { CreateProductTypeDto, UpDateProductTypeDto, ProductTypeFilterDto } from './product-type.dto';

@Injectable()
export class ProductTypeService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCT TYPE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new Product Type
   */
  async createProductType(dto: CreateProductTypeDto, UserId: string) {
    // Check for duplicate Name
    const existing = await this.prisma.productType.findFirst({
      where: { Name: dto.Name },
    });

    if (existing) {
      throw new BadRequestException(`Product Type '${dto.Name}' already exists`);
    }

    const productType = await this.prisma.productType.create({
      data: {
        Name: dto.Name,
        Description: dto.Description,
        IsActive: dto.IsActive ?? true,
      },
    });

    return {
      success: true,
      ProductType: {
        ID: productType.ID,
        Name: productType.Name,
        Description: productType.Description,
        IsActive: productType.IsActive,
        createdAt: productType.CreatedAt,
      },
    };
  }

  /**
   * Update Product Type
   */
  async updateProductType(ID: number, dto: UpDateProductTypeDto, UserId: string) {
    const productType = await this.prisma.productType.findUnique({
      where: { ID: ID },
    });

    if (!productType) {
      throw new NotFoundException(`Product Type ${ID} not found`);
    }

    // Check for duplicate Name if changing
    if (dto.Name && dto.Name !== productType.Name) {
      const existing = await this.prisma.productType.findFirst({
        where: { Name: dto.Name, ID: { not: ID } },
      });

      if (existing) {
        throw new BadRequestException(`Product Type '${dto.Name}' already exists`);
      }
    }

    const updated = await this.prisma.productType.update({
      where: { ID: ID },
      data: {
        Name: dto.Name,
        Description: dto.Description,
        IsActive: dto.IsActive,
      },
    });

    return {
      success: true,
      ProductType: {
        ID: updated.ID,
        Name: updated.Name,
        Description: updated.Description,
        IsActive: updated.IsActive,
        updatedAt: updated.UpdatedAt,
      },
    };
  }

  /**
   * Get Product Type by ID
   */
  async getProductType(ID: number) {
    const productType = await this.prisma.productType.findUnique({
      where: { ID: ID },
      include: {
        Products: {
          select: { ID: true, Code: true, Name: true },
          take: 10,
        },
      },
    });

    if (!productType) {
      throw new NotFoundException(`Product Type ${ID} not found`);
    }

    const TotalProducts = await this.prisma.product.count({
      where: { ProductTypeID: ID },
    });

    return {
      ID: productType.ID,
      Name: productType.Name,
      Description: productType.Description,
      IsActive: productType.IsActive,
      createdAt: productType.CreatedAt,
      updatedAt: productType.UpdatedAt,
      ProductCount: TotalProducts,
      sampleProducts: productType.Products,
    };
  }

  /**
   * List Product Types
   */
  async listProductTypes(dto: ProductTypeFilterDto) {
    const where: any = {};

    if (dto.ActiveOnly) {
      where.IsActive = true;
    }

    if (dto.Search) {
      where.OR = [
        { Name: { contains: dto.Search, mode: 'insensitive' } },
        { Description: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    const ProductTypes = await this.prisma.productType.findMany({
      where,
      include: {
        _count: {
          select: { Products: true },
        },
      },
      orderBy: { Name: 'asc' },
    });

    return ProductTypes.map((pt) => ({
      ID: pt.ID,
      Name: pt.Name,
      Description: pt.Description,
      IsActive: pt.IsActive,
      ProductCount: pt._count.Products,
      createdAt: pt.CreatedAt,
    }));
  }

  /**
   * Delete Product Type
   */
  async deleteProductType(ID: number) {
    const productType = await this.prisma.productType.findUnique({
      where: { ID: ID },
    });

    if (!productType) {
      throw new NotFoundException(`Product Type ${ID} not found`);
    }

    // Check if any Products use this Type
    const ProductCount = await this.prisma.product.count({
      where: { ProductTypeID: ID },
    });

    if (ProductCount > 0) {
      throw new BadRequestException(
        `Cannot delete Product Type. ${ProductCount} Product(s) are using this Type.`,
      );
    }

    await this.prisma.productType.delete({
      where: { ID: ID },
    });

    return {
      success: true,
      message: `Product Type '${productType.Name}' deleted successfully`,
    };
  }

  /**
   * Get Product Type statistics
   */
  async getProductTypeStats() {
    const stats = await this.prisma.productType.findMany({
      include: {
        _count: {
          select: { Products: true },
        },
      },
    });

    const TotalProducts = await this.prisma.product.count();

    return {
      TotalTypes: stats.length,
      TotalProducts,
      Types: stats.map((pt) => ({
        ID: pt.ID,
        Name: pt.Name,
        ProductCount: pt._count.Products,
        Percentage: TotalProducts > 0 ? Math.round((pt._count.Products / TotalProducts) * 10000) / 100 : 0,
      })),
    };
  }
}
