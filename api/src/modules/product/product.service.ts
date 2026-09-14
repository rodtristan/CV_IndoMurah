import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateProductDto, UpdateProductDto, AdjustStockDto } from './dto/product.dto';
import { Prisma } from '.prisma/client';

@Injectable()
export class ProductService {
  private readonly CACHE_PREFIX = 'products';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private queryService: QueryService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['code', 'barcode', 'name', 'description'],
      allowedIncludes: ['category', 'unit', 'brand', 'warehouse', 'productStocks'],
      defaultOrderBy: { id: 'asc' },
    });

    const findArgs: Record<string, unknown> = {
      where: prismaQuery.where,
      orderBy: prismaQuery.orderBy,
      skip: prismaQuery.skip,
      take: prismaQuery.take,
    };

    if (prismaQuery.select) {
      findArgs.select = prismaQuery.select;
    } else if (prismaQuery.include) {
      findArgs.include = prismaQuery.include;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany(findArgs as Parameters<typeof this.prisma.product.findMany>[0]),
      this.prisma.product.count({ where: prismaQuery.where }),
    ]);

    return { data, total, skip: prismaQuery.skip, take: prismaQuery.take };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        unit: true,
        brand: true,
        warehouse: true,
        productStocks: { include: { warehouse: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByBarcode(barcode: string) {
    const product = await this.prisma.product.findFirst({
      where: { barcode, isActive: true },
      include: {
        category: true,
        unit: true,
        brand: true,
        warehouse: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Product code already exists');

    if (dto.barcode) {
      const existingBarcode = await this.prisma.product.findFirst({ where: { barcode: dto.barcode } });
      if (existingBarcode) throw new ConflictException('Product barcode already exists');
    }

    return this.prisma.product.create({
      data: {
        code: dto.code,
        barcode: dto.barcode,
        name: dto.name,
        categoryId: dto.categoryId,
        unitId: dto.unitId,
        brandId: dto.brandId,
        warehouseId: dto.warehouseId,
        purchasePrice: new Prisma.Decimal(dto.purchasePrice),
        sellingPrice: new Prisma.Decimal(dto.sellingPrice),
        stock: new Prisma.Decimal(dto.stock ?? 0),
        minimumStock: new Prisma.Decimal(dto.minimumStock ?? 0),
        discountPercent: new Prisma.Decimal(dto.discountPercent ?? 0),
        image: dto.image,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
      include: {
        category: true,
        unit: true,
        brand: true,
        warehouse: true,
      },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    if (dto.code && dto.code !== product.code) {
      const existing = await this.prisma.product.findUnique({ where: { code: dto.code } });
      if (existing) throw new ConflictException('Product code already exists');
    }

    if (dto.barcode && dto.barcode !== product.barcode) {
      const existingBarcode = await this.prisma.product.findFirst({ where: { barcode: dto.barcode } });
      if (existingBarcode) throw new ConflictException('Product barcode already exists');
    }

    const updateData: Record<string, unknown> = { ...dto };
    if (dto.purchasePrice !== undefined) {
      updateData.purchasePrice = new Prisma.Decimal(dto.purchasePrice);
    }
    if (dto.sellingPrice !== undefined) {
      updateData.sellingPrice = new Prisma.Decimal(dto.sellingPrice);
    }
    if (dto.minimumStock !== undefined) {
      updateData.minimumStock = new Prisma.Decimal(dto.minimumStock);
    }
    if (dto.discountPercent !== undefined) {
      updateData.discountPercent = new Prisma.Decimal(dto.discountPercent);
    }

    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        unit: true,
        brand: true,
        warehouse: true,
      },
    });
  }

  async remove(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async adjustStock(id: number, dto: AdjustStockDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    if (dto.warehouseId) {
      const warehouse = await this.prisma.warehouse.findUnique({ where: { id: dto.warehouseId } });
      if (!warehouse) throw new NotFoundException('Warehouse not found');

      const existingStock = await this.prisma.productStock.findUnique({
        where: { productId_warehouseId: { productId: id, warehouseId: dto.warehouseId } },
      });

      const currentQty = existingStock ? parseFloat(existingStock.quantity.toString()) : 0;
      const newQty = currentQty + dto.quantity;

      if (newQty < 0) {
        throw new BadRequestException('Warehouse stock cannot be negative');
      }

      if (existingStock) {
        await this.prisma.productStock.update({
          where: { productId_warehouseId: { productId: id, warehouseId: dto.warehouseId } },
          data: { quantity: new Prisma.Decimal(newQty) },
        });
      } else {
        await this.prisma.productStock.create({
          data: {
            productId: id,
            warehouseId: dto.warehouseId,
            quantity: new Prisma.Decimal(dto.quantity),
          },
        });
      }
    }

    const currentStock = parseFloat(product.stock.toString());
    const newStock = currentStock + dto.quantity;

    if (newStock < 0) {
      throw new BadRequestException('Product stock cannot be negative');
    }

    return this.prisma.product.update({
      where: { id },
      data: { stock: new Prisma.Decimal(newStock) },
      include: {
        category: true,
        unit: true,
        brand: true,
        warehouse: true,
        productStocks: { include: { warehouse: true } },
      },
    });
  }

  async getStockByWarehouse(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, code: true, name: true, stock: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const productStocks = await this.prisma.productStock.findMany({
      where: { productId: productId },
      include: { warehouse: true },
    });

    return {
      ...product,
      productStocks,
    };
  }

  async getLowStockProducts() {
    // Get products where stock < minimumStock using raw comparison
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        unit: true,
        brand: true,
        warehouse: true,
      },
      orderBy: { stock: 'asc' },
    });

    return products.filter((p) => parseFloat(p.stock.toString()) < parseFloat(p.minimumStock.toString()));
  }
}
