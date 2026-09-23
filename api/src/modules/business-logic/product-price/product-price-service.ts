import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import { CreateProductPriceDto, ProductPriceFilterDto, GetPriceDto } from './Product-Price.dto';

@Injectable()
export class ProductPriceService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCT PRICE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Set Product Price
   */
  async setProductPrice(dto: CreateProductPriceDto, UserId: string) {
    // Validate Product
    const Product = await this.prisma.product.findUnique({
      where: { ID: dto.ProductId },
    });

    if (!Product) {
      throw new NotFoundException(`Product ${dto.ProductId} not found`);
    }

    // Validate Unit
    const Unit = await this.prisma.unit.findUnique({
      where: { ID: dto.UnitId },
    });

    if (!Unit) {
      throw new NotFoundException(`Unit ${dto.UnitId} not found`);
    }

    // Check if Price already exists for this Product/Unit/Type
    const existing = await this.prisma.productPrice.findFirst({
      where: {
        ProductID: dto.ProductId,
        UnitID: dto.UnitId,
        PriceType: dto.PriceType.toUpperCase(),
      },
    });

    let Price;
    if (existing) {
      // Update existing
      Price = await this.prisma.productPrice.update({
        where: { ID: existing.ID },
        data: {
          Price: new Prisma.Decimal(dto.Price),
          MinQuantity: dto.MinQuantity ? new Prisma.Decimal(dto.MinQuantity) : null,
          MaxQuantity: dto.MaxQuantity ? new Prisma.Decimal(dto.MaxQuantity) : null,
          StartDate: dto.StartDate ? new Date(dto.StartDate) : null,
          EndDate: dto.EndDate ? new Date(dto.EndDate) : null,
          IsActive: dto.IsActive ?? 1,
        },
      });
    } else {
      // Create new
      Price = await this.prisma.productPrice.create({
        data: {
          ProductID: dto.ProductId,
          UnitID: dto.UnitId,
          PriceType: dto.PriceType.toUpperCase(),
          Price: new Prisma.Decimal(dto.Price),
          MinQuantity: dto.MinQuantity ? new Prisma.Decimal(dto.MinQuantity) : null,
          MaxQuantity: dto.MaxQuantity ? new Prisma.Decimal(dto.MaxQuantity) : null,
          StartDate: dto.StartDate ? new Date(dto.StartDate) : null,
          EndDate: dto.EndDate ? new Date(dto.EndDate) : null,
          IsActive: dto.IsActive ?? 1,
        },
      });
    }

    return {
      success: true,
      Price: {
        ID: Price.ID,
        ProductId: Price.ProductID,
        ProductName: Product.Name,
        UnitId: Price.UnitID,
        UnitName: Unit.Name,
        PriceType: Price.PriceType,
        Price: number(Price.Price),
        minQuantity: Price.MinQuantity ? Number(Price.MinQuantity) : null,
        maxQuantity: Price.MaxQuantity ? Number(Price.MaxQuantity) : null,
        startDate: Price.StartDate,
        endDate: Price.EndDate,
        IsActive: Price.IsActive === 1,
      },
    };
  }

  /**
   * Get Product Prices
   */
  async getProductPrices(ProductId: number) {
    const Product = await this.prisma.product.findUnique({
      where: { ID: ProductId },
    });

    if (!Product) {
      throw new NotFoundException(`Product ${ProductId} not found`);
    }

    const Prices = await this.prisma.productPrice.findMany({
      where: { ProductID: ProductId },
      include: { Unit: true },
      orderBy: [
        { Unit: { Name: 'asc' } },
        { PriceType: 'asc' },
      ],
    });

    return {
      ProductId,
      ProductName: Product.Name,
      basePrice: number(Product.SellingPrice),
      Prices: Prices.map((p) => ({
        ID: p.ID,
        UnitId: p.UnitID,
        UnitName: p.Unit?.Name,
        PriceType: p.PriceType,
        Price: number(p.Price),
        minQuantity: p.MinQuantity ? Number(p.MinQuantity) : null,
        maxQuantity: p.MaxQuantity ? Number(p.MaxQuantity) : null,
        startDate: p.StartDate,
        endDate: p.EndDate,
        IsActive: p.IsActive === 1,
      })),
    };
  }

  /**
   * Get applicable Price for a Product
   * Flow: POS/Cashier pilih produk → sistem cek harga berdasarkan tipe/kuantitas/pelanggan
   */
  async getApplicablePrice(dto: GetPriceDto) {
    const now = new Date();

    const where: any = {
      ProductID: dto.ProductId,
      IsActive: 1,
    };

    if (dto.UnitId) {
      where.UnitID = dto.UnitId;
    }

    if (dto.PriceType) {
      where.PriceType = dto.PriceType.toUpperCase();
    }

    // Date validity
    where.OR = [
      { StartDate: null, EndDate: null },
      { StartDate: { lte: now }, EndDate: null },
      { StartDate: null, EndDate: { gte: now } },
      { StartDate: { lte: now }, EndDate: { gte: now } },
    ];

    // Quantity filter
    if (dto.Quantity) {
      where.AND = [
        {
          OR: [
            { MinQuantity: null, MaxQuantity: null },
            { MinQuantity: { lte: dto.Quantity }, MaxQuantity: null },
            { MinQuantity: null, MaxQuantity: { gte: dto.Quantity } },
            { MinQuantity: { lte: dto.Quantity }, MaxQuantity: { gte: dto.Quantity } },
          ],
        },
      ];
    }

    const Prices = await this.prisma.productPrice.findMany({
      where,
      include: { Unit: true },
      orderBy: [
        { MinQuantity: 'desc' },
        { PriceType: 'asc' },
      ],
    });

    if (Prices.length === 0) {
      // Fall back to Product's base Price
      const Product = await this.prisma.product.findUnique({
        where: { ID: dto.ProductId },
        include: { Unit: true },
      });

      return {
        ProductId: dto.ProductId,
        ProductName: Product?.Name,
        Price: number(Product?.SellingPrice) || 0,
        UnitId: Product?.UnitID,
        UnitName: Product?.Unit?.Name,
        PriceType: 'STANDARD',
        isFromBasePrice: true,
      };
    }

    // Return the most specific Price (highest minQuantity)
    const applicablePrice = Prices[0];

    return {
      ProductId: dto.ProductId,
      ProductName: (await this.prisma.product.findUnique({ where: { ID: dto.ProductId } }))?.Name,
      Price: number(applicablePrice.Price),
      UnitId: applicablePrice.UnitID,
      UnitName: applicablePrice.Unit?.Name,
      PriceType: applicablePrice.PriceType,
      minQuantity: applicablePrice.MinQuantity ? Number(applicablePrice.MinQuantity) : null,
      maxQuantity: applicablePrice.MaxQuantity ? Number(applicablePrice.MaxQuantity) : null,
      isFromBasePrice: false,
    };
  }

  /**
   * List Prices with filters
   */
  async listPrices(dto: ProductPriceFilterDto) {
    const where: any = {};

    if (dto.ProductId) {
      where.ProductID = dto.ProductId;
    }

    if (dto.UnitId) {
      where.UnitID = dto.UnitId;
    }

    if (dto.PriceType) {
      where.PriceType = dto.PriceType.toUpperCase();
    }

    if (dto.ActiveOnly) {
      where.IsActive = 1;
    }

    const Prices = await this.prisma.productPrice.findMany({
      where,
      include: {
        Product: { select: { ID: true, Code: true, Name: true } },
        Unit: true,
      },
      orderBy: [
        { Product: { Code: 'asc' } },
        { Unit: { Name: 'asc' } },
      ],
    });

    return Prices.map((p) => ({
      ID: p.ID,
      ProductId: p.ProductID,
      ProductCode: p.Product?.Code,
      ProductName: p.Product?.Name,
      UnitId: p.UnitID,
      UnitName: p.Unit?.Name,
      PriceType: p.PriceType,
      Price: number(p.Price),
      minQuantity: p.MinQuantity ? Number(p.MinQuantity) : null,
      maxQuantity: p.MaxQuantity ? Number(p.MaxQuantity) : null,
      startDate: p.StartDate,
      endDate: p.EndDate,
      IsActive: p.IsActive === 1,
    }));
  }

  /**
   * Delete Price
   */
  async deletePrice(ID: number) {
    const Price = await this.prisma.productPrice.findUnique({
      where: { ID: ID },
    });

    if (!Price) {
      throw new NotFoundException(`Price ${ID} not found`);
    }

    await this.prisma.productPrice.delete({
      where: { ID: ID },
    });

    return {
      success: true,
      message: 'Price deleted successfully',
    };
  }
}
