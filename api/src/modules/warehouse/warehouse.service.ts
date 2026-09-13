import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';

@Injectable()
export class WarehouseService {
  private readonly CACHE_PREFIX = 'warehouses';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private queryService: QueryService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['code', 'name', 'address', 'phone'],
      allowedIncludes: ['productStocks', 'stockIns', 'stockOuts', 'stockTransfersFrom', 'stockTransfersTo', 'stockOpnames', 'sales', 'purchases'],
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
      this.prisma.warehouse.findMany(findArgs as Parameters<typeof this.prisma.warehouse.findMany>[0]),
      this.prisma.warehouse.count({ where: prismaQuery.where }),
    ]);

    return { data, total, skip: prismaQuery.skip, take: prismaQuery.take };
  }

  async findOne(id: number) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        productStocks: { include: { product: true } },
        stockIns: { orderBy: { createdAt: 'desc' }, take: 20 },
        stockOuts: { orderBy: { createdAt: 'desc' }, take: 20 },
        stockTransfersFrom: { orderBy: { createdAt: 'desc' }, take: 20 },
        stockTransfersTo: { orderBy: { createdAt: 'desc' }, take: 20 },
        stockOpnames: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  async create(dto: CreateWarehouseDto) {
    const existing = await this.prisma.warehouse.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Warehouse code already exists');

    // If this warehouse is default, unset other default warehouses
    if (dto.isDefault) {
      await this.prisma.warehouse.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.warehouse.create({ data: dto });
  }

  async update(id: number, dto: UpdateWarehouseDto) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) throw new NotFoundException('Warehouse not found');

    if (dto.code && dto.code !== warehouse.code) {
      const existing = await this.prisma.warehouse.findUnique({ where: { code: dto.code } });
      if (existing) throw new ConflictException('Warehouse code already exists');
    }

    // If this warehouse is being set as default, unset other default warehouses
    if (dto.isDefault === true) {
      await this.prisma.warehouse.updateMany({
        where: { id: { not: id }, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.warehouse.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) throw new NotFoundException('Warehouse not found');

    return this.prisma.warehouse.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getDefaultWarehouse() {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { isDefault: true, isActive: true },
    });
    if (!warehouse) {
      // Return first active warehouse if no default is set
      return this.prisma.warehouse.findFirst({
        where: { isActive: true },
        orderBy: { id: 'asc' },
      });
    }
    return warehouse;
  }

  async getProductStocks(warehouseId: number) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: warehouseId } });
    if (!warehouse) throw new NotFoundException('Warehouse not found');

    return this.prisma.productStock.findMany({
      where: { warehouseId: warehouseId },
      include: { product: { include: { category: true, unit: true } } },
      orderBy: { product: { name: 'asc' } },
    });
  }

  async getStats(id: number) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) throw new NotFoundException('Warehouse not found');

    const [productStocks, stockIns, stockOuts, stockTransfers, sales, purchases] = await Promise.all([
      this.prisma.productStock.findMany({
        where: { warehouseId: id },
        include: { product: true },
      }),
      this.prisma.stockIn.findMany({ where: { warehouseId: id } }),
      this.prisma.stockOut.findMany({ where: { warehouseId: id } }),
      this.prisma.stockTransfer.findMany({
        where: { OR: [{ fromWarehouseId: id }, { toWarehouseId: id }] },
      }),
      this.prisma.sale.findMany({ where: { warehouseId: id } }),
      this.prisma.purchase.findMany({ where: { warehouseId: id } }),
    ]);

    const totalStockValue = productStocks.reduce(
      (sum, ps) => sum + Number(ps.quantity) * Number(ps.product?.purchasePrice || 0),
      0,
    );

    return {
      warehouse,
      stats: {
        totalProducts: productStocks.length,
        totalStockQuantity: productStocks.reduce((sum, ps) => sum + Number(ps.quantity), 0),
        totalStockValue,
        totalStockIns: stockIns.length,
        totalStockOuts: stockOuts.length,
        totalTransfers: stockTransfers.length,
        totalSales: sales.length,
        totalPurchases: purchases.length,
      },
    };
  }
}
