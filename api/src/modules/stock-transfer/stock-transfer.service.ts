import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma, TransactionStatus } from '.prisma/client';
import { CreateStockTransferDto, UpdateStockTransferDto, UpdateStatusDto } from './dto/stock-transfer.dto';

@Injectable()
export class StockTransferService {
  private readonly CACHE_PREFIX = 'stock_transfers';
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
          searchableFields: ['code', 'notes'],
          allowedIncludes: ['fromWarehouse', 'toWarehouse', 'creator', 'transferItems', 'transferItems.product'],
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
          this.prisma.stockTransfer.findMany(findArgs),
          this.prisma.stockTransfer.count({ where: prismaQuery.where }),
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
          allowedIncludes: ['fromWarehouse', 'toWarehouse', 'creator', 'transferItems', 'transferItems.product', 'transferItems.unit'],
        });

        const findArgs: any = { where: { id } };

        if (prismaQuery.select) {
          findArgs.select = prismaQuery.select;
        } else if (prismaQuery.include) {
          findArgs.include = prismaQuery.include;
        }

        const data = await this.prisma.stockTransfer.findUnique(findArgs);
        return data ? this.serialize(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreateStockTransferDto, userId: string) {
    // Verify warehouses exist
    const [fromWarehouse, toWarehouse] = await Promise.all([
      this.prisma.warehouse.findUnique({ where: { id: dto.from_warehouse_id } }),
      this.prisma.warehouse.findUnique({ where: { id: dto.to_warehouse_id } }),
    ]);

    if (!fromWarehouse) throw new NotFoundException('From warehouse not found');
    if (!toWarehouse) throw new NotFoundException('To warehouse not found');
    if (dto.from_warehouse_id === dto.to_warehouse_id) {
      throw new BadRequestException('From and to warehouse cannot be the same');
    }

    const code = await this.generateCode();

    // Calculate total items
    const itemsData = dto.items.map((item) => {
      const unitPrice = item.unit_price || 0;
      const subtotal = unitPrice * item.quantity;
      return {
        productId: item.product_id,
        quantity: new Prisma.Decimal(item.quantity.toString()),
        unitId: item.unit_id,
        unitPrice: new Prisma.Decimal(unitPrice.toString()),
        subtotal: new Prisma.Decimal(subtotal.toString()),
      };
    });

    const totalItems = itemsData.reduce((sum, item) => sum + Number(item.quantity), 0);

    const stockTransfer = await this.prisma.stockTransfer.create({
      data: {
        code,
        fromWarehouseId: dto.from_warehouse_id,
        toWarehouseId: dto.to_warehouse_id,
        date: dto.date ? new Date(dto.date) : new Date(),
        totalItems: new Prisma.Decimal(totalItems.toString()),
        notes: dto.notes,
        status: TransactionStatus.DRAFT,
        createdById: userId,
        transferItems: {
          create: itemsData,
        },
      },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        transferItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(stockTransfer);
  }

  async update(id: number, dto: UpdateStockTransferDto) {
    const stockTransfer = await this.prisma.stockTransfer.findUnique({ where: { id } });
    if (!stockTransfer) throw new NotFoundException('Stock transfer not found');
    if (stockTransfer.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException('Can only update draft stock transfers');
    }

    const updateData: any = {};
    if (dto.from_warehouse_id !== undefined) updateData.fromWarehouseId = dto.from_warehouse_id;
    if (dto.to_warehouse_id !== undefined) updateData.toWarehouseId = dto.to_warehouse_id;
    if (dto.date) updateData.date = new Date(dto.date);
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await this.prisma.stockTransfer.update({
      where: { id },
      data: updateData,
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        transferItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(updated);
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const stockTransfer = await this.prisma.stockTransfer.findUnique({
      where: { id },
      include: { transferItems: true },
    });
    if (!stockTransfer) throw new NotFoundException('Stock transfer not found');

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[stockTransfer.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from '${stockTransfer.status}' to '${dto.status}'`);
    }

    // If completing, update product stock (subtract from source, add to destination)
    if (dto.status === 'COMPLETED') {
      // Check stock availability in source warehouse first
      for (const item of stockTransfer.transferItems) {
        const availableStock = await this.getAvailableStock(item.productId, stockTransfer.fromWarehouseId);
        if (availableStock < Number(item.quantity)) {
          throw new BadRequestException(
            `Insufficient stock in source warehouse for product ${item.productId}. Available: ${availableStock}, Requested: ${item.quantity}`,
          );
        }
      }

      // Subtract from source warehouse
      await this.updateProductStock(stockTransfer.transferItems, stockTransfer.fromWarehouseId, 'subtract');
      // Add to destination warehouse
      await this.updateProductStock(stockTransfer.transferItems, stockTransfer.toWarehouseId, 'add');
    }

    const updated = await this.prisma.stockTransfer.update({
      where: { id },
      data: { status: dto.status as TransactionStatus },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        transferItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(updated);
  }

  async delete(id: number) {
    const stockTransfer = await this.prisma.stockTransfer.findUnique({ where: { id } });
    if (!stockTransfer) throw new NotFoundException('Stock transfer not found');
    if (stockTransfer.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft stock transfers');
    }

    await this.prisma.stockTransfer.delete({ where: { id } });
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return { id };
  }

  async getReport(query: Record<string, any>) {
    const { startDate, endDate, fromWarehouseId, toWarehouseId, productId } = query;

    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (fromWarehouseId) where.fromWarehouseId = parseInt(fromWarehouseId);
    if (toWarehouseId) where.toWarehouseId = parseInt(toWarehouseId);

    const stockTransfers = await this.prisma.stockTransfer.findMany({
      where,
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        transferItems: {
          include: { product: true },
          where: productId ? { productId: parseInt(productId) } : undefined,
        },
      },
      orderBy: { date: 'desc' },
    });

    const summary = {
      totalTransactions: stockTransfers.length,
      totalItems: stockTransfers.reduce((sum, s) => sum + Number(s.totalItems), 0),
    };

    return {
      data: stockTransfers.map((s) => this.serialize(s)),
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
            productId: item.productId,
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
              productId: item.productId,
              warehouseId: warehouseId,
            },
          },
          data: { quantity: new Prisma.Decimal(newQuantity.toString()) },
        });
      } else if (operation === 'add') {
        await this.prisma.productStock.create({
          data: {
            productId: item.productId,
            warehouseId: warehouseId,
            quantity: item.quantity,
          },
        });
      }

      // Update Product stock field (only for single-warehouse products)
      if (operation === 'subtract') {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        if (product) {
          const newStock = Number(product.stock) - Number(item.quantity);
          await this.prisma.product.update({
            where: { id: item.productId },
            data: { stock: new Prisma.Decimal(newStock.toString()) },
          });
        }
      }
    }
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `ST-${year}${month}`;

    const lastTransfer = await this.prisma.stockTransfer.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });

    let nextNumber = 1;
    if (lastTransfer) {
      const lastSeq = parseInt(lastTransfer.code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private serialize(data: any): any {
    if (!data) return null;

    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Prisma.Decimal) {
        result[key] = Number(value);
      } else if (value instanceof Date) {
        result[key] = value.toISOString();
      } else {
        result[key] = value;
      }
    }

    if (data.transferItems && Array.isArray(data.transferItems)) {
      result.transferItems = data.transferItems.map((item: any) => this.serialize(item));
    }

    return result;
  }
}
