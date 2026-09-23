import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import { CreateProductUnitDto, ProductUnitFilterDto, ConvertUnitDto } from './product-unit.dto';

@Injectable()
export class ProductUnitService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCT UNIT MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Set up Product Units (create or update Unit configurations)
   * Flow: Admin set Unit konversi untuk produk → sistem simpan/update konfigurasi
   */
  async setProductUnits(dto: CreateProductUnitDto, UserId: string) {
    // Validate Product exists
    const Product = await this.prisma.product.findUnique({
      where: { ID: dto.ProductId },
    });

    if (!Product) {
      throw new NotFoundException(`Product ${dto.ProductId} not found`);
    }

    // Validate all Unit IDs exist
    const UnitIds = dto.Units.map(u => u.UnitId);
    const Units = await this.prisma.unit.findMany({
      where: { ID: { in: UnitIds } },
    });

    if (Units.length !== UnitIds.length) {
      throw new BadRequestException('One or more Unit IDs are invalid');
    }

    // Check if only one is base
    const baseUnits = dto.Units.filter(u => u.isBase);
    if (baseUnits.length > 1) {
      throw new BadRequestException('Only one Unit can be the base Unit');
    }

    const Result = await this.prisma.$transaction(async (tx) => {
      // Delete existing Product Units for this Product
      await tx.productUnit.deleteMany({
        where: { ProductID: dto.ProductId },
      });

      // Create new Product Units
      const createdUnits = await tx.productUnit.createMany({
        data: dto.Units.map((Unit) => ({
          ProductID: dto.ProductId,
          UnitID: Unit.UnitId,
          IsBase: Unit.isBase || false,
          ConversionValue: new Prisma.Decimal(Unit.ConversionValue || 1),
          IsPrimary: Unit.isPrimary || false,
          IsSell: Unit.isSell ?? true,
          IsPurchase: Unit.isPurchase ?? true,
        })),
      });

      return createdUnits;
    });

    return {
      success: true,
      ProductId: dto.ProductId,
      ProductName: Product.Name,
      UnitsCreated: Result.count,
      message: 'Product Units configured successfully',
    };
  }

  /**
   * Get Product Units by Product ID
   */
  async getProductUnits(ProductId: number) {
    const ProductUnits = await this.prisma.productUnit.findMany({
      where: { ProductID: ProductId },
      include: {
        Product: true,
        Unit: true,
      },
      orderBy: [
        { IsBase: 'desc' },
        { IsPrimary: 'desc' },
      ],
    });

    if (ProductUnits.length === 0) {
      // Try to get from Product's Default Unit
      const Product = await this.prisma.product.findUnique({
        where: { ID: ProductId },
        include: { Unit: true },
      });

      if (!Product) {
        throw new NotFoundException(`Product ${ProductId} not found`);
      }

      return {
        ProductId,
        ProductName: Product.Name,
        DefaultUnit: Product.Unit?.Name || 'Default',
        DefaultUnitId: Product.UnitID,
        Units: [],
      };
    }

    return {
      ProductId,
      ProductName: ProductUnits[0].Product?.Name,
      baseUnit: ProductUnits.find(u => u.IsBase)?.Unit?.Name || ProductUnits[0].Unit?.Name,
      Units: ProductUnits.map((pu) => ({
        ID: pu.ID,
        UnitId: pu.UnitID,
        UnitName: pu.Unit?.Name,
        isBase: pu.IsBase,
        conversionValue: number(pu.ConversionValue),
        isPrimary: pu.IsPrimary,
        isSell: pu.IsSell,
        isPurchase: pu.IsPurchase,
      })),
    };
  }

  /**
   * List all Product Units with filters
   */
  async listProductUnits(dto: ProductUnitFilterDto) {
    const where: any = {};

    if (dto.ProductId) {
      where.ProductID = dto.ProductId;
    }

    if (dto.UnitId) {
      where.UnitID = dto.UnitId;
    }

    if (dto.PrimaryOnly) {
      where.IsPrimary = true;
    }

    const ProductUnits = await this.prisma.productUnit.findMany({
      where,
      include: {
        Product: { select: { ID: true, Code: true, Name: true } },
        Unit: true,
      },
      orderBy: [
        { Product: { Code: 'asc' } },
        { IsBase: 'desc' },
      ],
    });

    return ProductUnits.map((pu) => ({
      ID: pu.ID,
      ProductId: pu.ProductID,
      ProductCode: pu.Product?.Code,
      ProductName: pu.Product?.Name,
      UnitId: pu.UnitID,
      UnitName: pu.Unit?.Name,
      isBase: pu.IsBase,
      conversionValue: number(pu.ConversionValue),
      isPrimary: pu.IsPrimary,
      isSell: pu.IsSell,
      isPurchase: pu.IsPurchase,
    }));
  }

  /**
   * Convert Quantity between Units
   */
  async convertUnit(dto: ConvertUnitDto) {
    const ProductUnits = await this.prisma.productUnit.findMany({
      where: { ProductID: dto.ProductId },
      include: { Unit: true },
    });

    if (ProductUnits.length === 0) {
      throw new BadRequestException('No Unit configuration found for this Product');
    }

    const fromUnit = ProductUnits.find(u => u.UnitID === dto.FromUnitId);
    const toUnit = ProductUnits.find(u => u.UnitID === dto.ToUnitId);

    if (!fromUnit) {
      throw new NotFoundException(`Source Unit ${dto.FromUnitId} not configured for this Product`);
    }

    if (!toUnit) {
      throw new NotFoundException(`Target Unit ${dto.ToUnitId} not configured for this Product`);
    }

    // Convert to base Unit, then to Target Unit
    const baseUnit = ProductUnits.find(u => u.IsBase);

    // Calculate conversion
    let convertedQuantity: number;

    if (dto.FromUnitId === baseUnit?.UnitID) {
      // From base to Target
      convertedQuantity = dto.Quantity / Number(toUnit.ConversionValue);
    } else if (dto.ToUnitId === baseUnit?.UnitID) {
      // From source to base
      convertedQuantity = dto.Quantity * Number(fromUnit.ConversionValue);
    } else {
      // From source to base to Target
      const inBase = dto.Quantity * Number(fromUnit.ConversionValue);
      convertedQuantity = inBase / Number(toUnit.ConversionValue);
    }

    return {
      ProductId: dto.ProductId,
      fromUnitId: dto.FromUnitId,
      fromUnitName: fromUnit.Unit?.Name,
      toUnitId: dto.ToUnitId,
      toUnitName: toUnit.Unit?.Name,
      originalQuantity: dto.Quantity,
      convertedQuantity: Math.round(convertedQuantity * 10000) / 10000,
      conversionRate: number(toUnit.ConversionValue) / Number(fromUnit.ConversionValue),
    };
  }

  /**
   * Get Unit options for a Product (for dropdown)
   */
  async getProductUnitOptions(ProductId: number, Type: 'sell' | 'purchase' = 'sell') {
    const where: any = { ProductID: ProductId };

    if (Type === 'sell') {
      where.IsSell = true;
    } else {
      where.IsPurchase = true;
    }

    const ProductUnits = await this.prisma.productUnit.findMany({
      where,
      include: { Unit: true },
      orderBy: [
        { IsPrimary: 'desc' },
        { ConversionValue: 'asc' },
      ],
    });

    return {
      ProductId,
      Units: ProductUnits.map((pu) => ({
        UnitId: pu.UnitID,
        UnitName: pu.Unit?.Name,
        conversionValue: number(pu.ConversionValue),
        isPrimary: pu.IsPrimary,
        isBase: pu.IsBase,
      })),
    };
  }
}
