import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateStockOpnameDto, UpdateStockOpnameDto, AddStockOpnameItemDto } from './dto/stock-opname.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StockOpnameService {
  private readonly CACHE_PREFIX = 'stock-opnames';

  constructor(
    private prisma: PrismaService,
    private queryService: QueryService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['code', 'notes'],
      allowedIncludes: ['warehouse', 'creator', 'opnameItems', 'opnameItems.product', 'opnameItems.unit'],
      defaultOrderBy: { createdAt: 'desc' },
    });

    const findArgs: Prisma.StockOpnameFindManyArgs = {
      where: prismaQuery.where as Prisma.StockOpnameWhereInput,
      orderBy: prismaQuery.orderBy as Prisma.StockOpnameOrderByWithRelationInput,
      skip: prismaQuery.skip,
      take: prismaQuery.take,
    };

    if (prismaQuery.select) {
      findArgs.select = prismaQuery.select as Prisma.StockOpnameSelect;
    } else if (prismaQuery.include) {
      findArgs.include = prismaQuery.include as Prisma.StockOpnameInclude;
    }

    const [data, total] = await Promise.all([
      this.prisma.stockOpname.findMany(findArgs),
      this.prisma.stockOpname.count({ where: prismaQuery.where }),
    ]);

    return { data, total, skip: prismaQuery.skip, take: prismaQuery.take };
  }

  async findOne(id: number) {
    const stockOpname = await this.prisma.stockOpname.findUnique({
      where: { id },
      include: {
        warehouse: true,
        creator: true,
        opnameItems: {
          include: {
            product: true,
            unit: true,
          },
        },
      },
    });
    if (!stockOpname) throw new NotFoundException('Stock Opname not found');
    return stockOpname;
  }

  async create(dto: CreateStockOpnameDto, userId: string) {
    // Generate code
    const code = await this.generateCode();

    // Calculate difference and create items
    const itemsData = dto.items.map((item) => ({
      productId: item.product_id,
      systemStock: item.system_stock,
      countedStock: item.actual_stock,
      difference: item.actual_stock - item.system_stock,
      unitId: item.unit_id,
      unitPrice: item.price || 0,
      note: item.description,
    }));

    // Create stock opname with items
    const stockOpname = await this.prisma.stockOpname.create({
      data: {
        code,
        date: dto.date ? new Date(dto.date) : new Date(),
        warehouseId: dto.warehouse_id,
        notes: dto.notes,
        status: 'PENDING',
        createdById: userId,
        opnameItems: {
          create: itemsData,
        },
      },
      include: {
        warehouse: true,
        opnameItems: {
          include: {
            product: true,
            unit: true,
          },
        },
      },
    });

    return stockOpname;
  }

  async update(id: number, dto: UpdateStockOpnameDto) {
    const stockOpname = await this.prisma.stockOpname.findUnique({
      where: { id },
    });
    if (!stockOpname) throw new NotFoundException('Stock Opname not found');
    if (stockOpname.status !== 'PENDING') {
      throw new BadRequestException('Can only update pending stock opnames');
    }

    return this.prisma.stockOpname.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        warehouseId: dto.warehouse_id,
        notes: dto.notes,
      },
      include: {
        warehouse: true,
        opnameItems: {
          include: {
            product: true,
            unit: true,
          },
        },
      },
    });
  }

  async addItem(id: number, dto: AddStockOpnameItemDto) {
    const stockOpname = await this.prisma.stockOpname.findUnique({
      where: { id },
      include: { opnameItems: true },
    });
    if (!stockOpname) throw new NotFoundException('Stock Opname not found');
    if (stockOpname.status !== 'PENDING') {
      throw new BadRequestException('Can only add items to pending stock opnames');
    }

    // Get current stock for the product
    const productStock = await this.prisma.productStock.findUnique({
      where: {
        productId_warehouseId: {
          productId: dto.product_id,
          warehouseId: stockOpname.warehouseId,
        },
      },
    });

    const systemStock = productStock ? Number(productStock.quantity) : 0;
    const difference = dto.actual_stock - systemStock;

    return this.prisma.stockOpnameItem.create({
      data: {
        stockOpnameId: id,
        productId: dto.product_id,
        systemStock: systemStock,
        countedStock: dto.actual_stock,
        difference,
        unitId: dto.unit_id,
        unitPrice: dto.price || 0,
        note: dto.description,
      },
      include: {
        product: true,
        unit: true,
      },
    });
  }

  async remove(id: number) {
    const stockOpname = await this.prisma.stockOpname.findUnique({ where: { id } });
    if (!stockOpname) throw new NotFoundException('Stock Opname not found');
    if (stockOpname.status !== 'PENDING') {
      throw new BadRequestException('Can only delete pending stock opnames');
    }

    return this.prisma.stockOpname.delete({ where: { id } });
  }

  async complete(id: number, userId: string) {
    const stockOpname = await this.prisma.stockOpname.findUnique({
      where: { id },
      include: { opnameItems: true },
    });
    if (!stockOpname) throw new NotFoundException('Stock Opname not found');
    if (stockOpname.status !== 'PENDING') {
      throw new BadRequestException('Stock Opname already completed');
    }

    // Adjust stock for each item based on difference
    await this.adjustStock(stockOpname.warehouseId, stockOpname.opnameItems);

    // Update status to completed
    return this.prisma.stockOpname.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        warehouse: true,
        opnameItems: {
          include: {
            product: true,
            unit: true,
          },
        },
      },
    });
  }

  private async adjustStock(warehouseId: number, items: any[]) {
    for (const item of items) {
      const difference = Number(item.difference);

      if (difference === 0) continue;

      // Update warehouse stock
      const productStock = await this.prisma.productStock.findUnique({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: warehouseId,
          },
        },
      });

      if (productStock) {
        await this.prisma.productStock.update({
          where: { id: productStock.id },
          data: {
            quantity: productStock.quantity.add(difference),
          },
        });
      } else {
        await this.prisma.productStock.create({
          data: {
            productId: item.productId,
            warehouseId: warehouseId,
            quantity: item.countedStock,
          },
        });
      }

      // Update product global stock
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (product) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: product.stock.add(difference),
          },
        });
      }
    }
  }

  private async generateCode(): Promise<string> {
    const prefix = 'SO';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    const lastOpname = await this.prisma.stockOpname.findFirst({
      where: {
        code: { startsWith: `${prefix}/${year}${month}` },
      },
      orderBy: { code: 'desc' },
    });

    let nextNumber = 1;
    if (lastOpname) {
      const lastNumber = parseInt(lastOpname.code.split('/').pop() || '0', 10);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}/${year}${month}/${nextNumber.toString().padStart(4, '0')}`;
  }
}
