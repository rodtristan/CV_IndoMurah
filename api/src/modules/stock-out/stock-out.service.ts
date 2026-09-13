import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '.prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateStockOutDto, UpdateStockOutDto, UpdateStatusDto } from './dto/stock-out.dto';

@Injectable()
export class StockOutService {
  private readonly CACHE_PREFIX = 'stock_outs';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
  ) {}

  async findAll(query: Record<string, any>) {
    const cacheKey = this.queryService.generateCacheKey(this.CACHE_PREFIX, query);

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          searchableFields: ['code', 'description'],
          allowedIncludes: ['warehouse', 'creator', 'stockOutItems', 'stockOutItems.product'],
          defaultOrderBy: { createdAt: 'desc' },
        });

        const findArgs: any = {
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
          this.prisma.stockOut.findMany(findArgs),
          this.prisma.stockOut.count({ where: prismaQuery.where }),
        ]);

        const serializedData = data.map((item) => this.serialize(item));
        return { data: serializedData, total, skip: prismaQuery.skip, take: prismaQuery.take };
      },
      this.CACHE_TTL,
    );
  }

  async findOne(id: number, query: Record<string, any> = {}) {
    const cacheKey = `${this.CACHE_PREFIX}:${id}`;

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          allowedIncludes: ['warehouse', 'creator', 'stockOutItems', 'stockOutItems.product', 'stockOutItems.unit'],
        });

        const findArgs: any = { where: { id } };

        if (prismaQuery.select) {
          findArgs.select = prismaQuery.select;
        } else if (prismaQuery.include) {
          findArgs.include = prismaQuery.include;
        }

        const data = await this.prisma.stockOut.findUnique(findArgs);
        return data ? this.serialize(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreateStockOutDto, userId: string) {
    // Verify warehouse exists
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: dto.warehouse_id } });
    if (!warehouse) throw new NotFoundException('Warehouse not found');

    const code = await this.generateCode();

    // Calculate total items
    const itemsData = dto.items.map((item) => {
      const unitPrice = item.unit_price || 0;
      const subtotal = unitPrice * item.quantity;
      return {
        product_id: item.product_id,
        quantity: new Prisma.Decimal(item.quantity.toString()),
        unit_id: item.unit_id,
        unit_price: new Prisma.Decimal(unitPrice.toString()),
        subtotal: new Prisma.Decimal(subtotal.toString()),
      };
    });

    const totalItems = itemsData.reduce((sum, item) => sum + Number(item.quantity), 0);

    const stockOut = await this.prisma.stockOut.create({
      data: {
        code,
        warehouse_id: dto.warehouse_id,
        reference_type: dto.reference_type as any,
        reference_id: dto.reference_id,
        date: dto.date ? new Date(dto.date) : new Date(),
        total_items: new Prisma.Decimal(totalItems.toString()),
        description: dto.description,
        status: 'DRAFT',
        createdById: userId,
        stockOutItems: {
          create: itemsData,
        },
      },
      include: {
        warehouse: true,
        stockOutItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(stockOut);
  }

  async update(id: number, dto: UpdateStockOutDto) {
    const stockOut = await this.prisma.stockOut.findUnique({ where: { id } });
    if (!stockOut) throw new NotFoundException('Stock out not found');
    if (stockOut.status !== 'DRAFT') {
      throw new BadRequestException('Can only update draft stock outs');
    }

    const updateData: any = {};
    if (dto.warehouse_id !== undefined) updateData.warehouse_id = dto.warehouse_id;
    if (dto.date) updateData.date = new Date(dto.date);
    if (dto.description !== undefined) updateData.description = dto.description;

    const updated = await this.prisma.stockOut.update({
      where: { id },
      data: updateData,
      include: {
        warehouse: true,
        stockOutItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(updated);
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const stockOut = await this.prisma.stockOut.findUnique({
      where: { id },
      include: { stockOutItems: true },
    });
    if (!stockOut) throw new NotFoundException('Stock out not found');

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[stockOut.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from '${stockOut.status}' to '${dto.status}'`);
    }

    // If completing, update product stock (subtract)
    if (dto.status === 'COMPLETED') {
      // Check stock availability first
      for (const item of stockOut.stockOutItems) {
        const availableStock = await this.getAvailableStock(item.product_id, stockOut.warehouse_id);
        if (availableStock < Number(item.quantity)) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.product_id}. Available: ${availableStock}, Requested: ${item.quantity}`,
          );
        }
      }
      await this.updateProductStock(stockOut.stockOutItems, stockOut.warehouse_id, 'subtract');
    }

    const updated = await this.prisma.stockOut.update({
      where: { id },
      data: { status: dto.status },
      include: {
        warehouse: true,
        stockOutItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(updated);
  }

  async delete(id: number) {
    const stockOut = await this.prisma.stockOut.findUnique({ where: { id } });
    if (!stockOut) throw new NotFoundException('Stock out not found');
    if (stockOut.status !== 'DRAFT') {
      throw new BadRequestException('Can only delete draft stock outs');
    }

    await this.prisma.stockOut.delete({ where: { id } });
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return { id };
  }

  async getReport(query: Record<string, any>) {
    const { startDate, endDate, warehouseId, productId } = query;

    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (warehouseId) where.warehouseId = parseInt(warehouseId);

    const stockOuts = await this.prisma.stockOut.findMany({
      where,
      include: {
        warehouse: true,
        stockOutItems: {
          include: { product: true },
          where: productId ? { productId: parseInt(productId) } : undefined,
        },
      },
      orderBy: { date: 'desc' },
    });

    const summary = {
      totalTransactions: stockOuts.length,
      totalItems: stockOuts.reduce((sum, s) => sum + Number(s.total_items), 0),
    };

    return {
      data: stockOuts.map((s) => this.serialize(s)),
      summary,
    };
  }

  private async getAvailableStock(productId: number, warehouseId: number): Promise<number> {
    const productStock = await this.prisma.productStock.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
    });
    return productStock ? Number(productStock.quantity) : 0;
  }

  private async updateProductStock(items: any[], warehouseId: number, operation: 'add' | 'subtract') {
    for (const item of items) {
      // Update ProductStock
      const existingStock = await this.prisma.productStock.findUnique({
        where: {
          productId_warehouseId: {
            productId: item.product_id,
            warehouseId: warehouseId,
          },
        },
      });

      if (existingStock) {
        const newQuantity = operation === 'add'
          ? Number(existingStock.quantity) + Number(item.quantity)
          : Number(existingStock.quantity) - Number(item.quantity);

        await this.prisma.productStock.update({
          where: {
            productId_warehouseId: {
              productId: item.product_id,
              warehouseId: warehouseId,
            },
          },
          data: { quantity: new Prisma.Decimal(newQuantity.toString()) },
        });
      }

      // Update Product stock field
      const product = await this.prisma.product.findUnique({ where: { id: item.product_id } });
      if (product) {
        const newStock = operation === 'add'
          ? Number(product.stock) + Number(item.quantity)
          : Number(product.stock) - Number(item.quantity);

        await this.prisma.product.update({
          where: { id: item.product_id },
          data: { stock: new Prisma.Decimal(newStock.toString()) },
        });
      }
    }
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SO-${year}${month}`;

    const lastStockOut = await this.prisma.stockOut.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });

    let nextNumber = 1;
    if (lastStockOut) {
      const lastSeq = parseInt(lastStockOut.code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private serialize(data: any): any {
    if (!data) return null;

    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Decimal) {
        result[key] = Number(value);
      } else if (value instanceof Date) {
        result[key] = value.toISOString();
      } else {
        result[key] = value;
      }
    }

    if (data.stockOutItems && Array.isArray(data.stockOutItems)) {
      result.stockOutItems = data.stockOutItems.map((item: any) => this.serialize(item));
    }

    return result;
  }
}
