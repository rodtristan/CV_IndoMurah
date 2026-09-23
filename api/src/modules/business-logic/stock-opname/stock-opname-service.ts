import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateStockOpNameDto,
  UpDateStockOpNameDto,
  StockOpNameQueryDto,
  ApproveStockOpNameDto,
  CancelStockOpNameDto,
  generateOpNameListDto,
} from './Stock-opName.dto';

@Injectable()
export class StockOpNameService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new Stock opName (Stock OpName / Stock Taking)
   * Flow: Admin buat Stock opName → input stok fisik → sistem hitung selisih
   */
  async create(dto: CreateStockOpNameDto) {
    // generate Code
    const Code = await this.generateCode();

    const opName = await this.prisma.$transaction(async (tx) => {
      // Create Stock opName header
      const header = await tx.stockOpname.create({
        data: {
          Code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          WarehouseId: dto.WarehouseId,
          referenceNumber: dto.ReferenceNumber,
          Type: dto.Type || 'PARTIAL',
          Status: 'DRAFT',
          Notes: dto.Notes,
          createdByID: dto.createdById?.toString(),
          StockOpNameItems: {
            create: await Promise.all(
              dto.Items.map(async (item) => {
                // Get system Stock
                const ProductStock = await tx.productStock.findUnique({
                  where: {
                    ProductId_WarehouseId: {
                      ProductId: item.ProductId,
                      WarehouseId: dto.WarehouseId,
                    },
                  },
                });

                const systemQty = ProductStock ? Number(ProductStock.Quantity) : 0;
                const physicalQty = item.physicalQuantity;
                const variance = physicalQty - systemQty;

                return {
                  ProductId: item.ProductId,
                  systemQuantity: systemQty,
                  physicalQuantity: physicalQty,
                  variance: variance,
                  varianceReason: item.varianceReason,
                  Notes: item.Notes,
                };
              })
            ),
          },
        },
        include: {
          Warehouse: true,
          StockOpNameItems: { include: { Product: true } },
        },
      });

      return header;
    });

    return opName;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUERY
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Find all Stock opNames with pagination
   */
  async findAll(query: StockOpNameQueryDto) {
    const { search, page = 1, limit = 20, WarehouseId, Status, Type, startDate, endDate } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { Code: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (WarehouseId) where.WarehouseId = WarehouseId;
    if (Status) where.Status = Status;
    if (Type) where.Type = Type;

    if (startDate || endDate) {
      where.Date = {};
      if (startDate) where.Date.gte = new Date(startDate);
      if (endDate) where.Date.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [data, Total] = await Promise.all([
      this.prisma.stockOpname.findMany({
        where,
        include: {
          Warehouse: true,
          StockOpNameItems: { include: { Product: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockOpname.Count({ where }),
    ]);

    return {
      data,
      pagination: { page, limit, Total, TotalPages: Math.ceil(Total / limit) },
    };
  }

  /**
   * Find Stock opName by ID
   */
  async findById(ID: number) {
    const opName = await this.prisma.stockOpname.findUnique({
      where: { ID },
      include: {
        Warehouse: true,
        StockOpNameItems: { include: { Product: true } },
      },
    });

    if (!opName) {
      throw new NotFoundException('Stock opName not found');
    }

    return opName;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * UpDate Stock opName (draft only)
   */
  async update(ID: number, dto: UpDateStockOpNameDto) {
    const existing = await this.findById(ID);

    if (existing.Status !== 'DRAFT') {
      throw new BadRequestException('Can only update draft Stock opName');
    }

    return this.prisma.stockOpname.update({
      where: { ID },
      data: {
        Date: dto.Date ? new Date(dto.Date) : undefined,
        referenceNumber: dto.ReferenceNumber,
        Notes: dto.Notes,
        Status: dto.status,
      },
      include: {
        Warehouse: true,
        StockOpNameItems: { include: { Product: true } },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Approve Stock opName and apply adjustments
   */
  async approve(ID: number, dto: ApproveStockOpNameDto) {
    const opName = await this.findById(ID);

    if (opName.Status === 'COMPLETED') {
      throw new ConflictException('Stock opName already completed');
    }

    if (opName.Status === 'CANCELLED') {
      throw new ConflictException('Cannot approve cancelled Stock opName');
    }

    const applyAdjustment = dto.applyAdjustment === 'true' || dto.applyAdjustment === true;

    await this.prisma.$transaction(async (tx) => {
      // UpDate Status
      await tx.stockOpname.update({
        where: { ID },
        data: { Status: 'COMPLETED' },
      });

      // Apply Stock adjustments if Requested
      if (applyAdjustment) {
        for (const item of opName.StockOpNameItems) {
          if (item.variance !== 0) {
            // UpDate Warehouse Stock
            await tx.productStock.update({
              where: {
                ProductId_WarehouseId: {
                  ProductId: item.ProductId,
                  WarehouseId: opName.WarehouseId,
                },
              },
              data: { Quantity: new Prisma.Decimal(item.physicalQuantity) },
            }).catch(() => {
              // Create if not exists
              return tx.productStock.create({
                data: {
                  ProductId: item.ProductId,
                  WarehouseId: opName.WarehouseId,
                  Quantity: new Prisma.Decimal(item.physicalQuantity),
                },
              });
            });

            // UpDate general Product Stock
            await tx.product.update({
              where: { ID: item.ProductId },
              data: { Stock: new Prisma.Decimal(item.physicalQuantity) },
            });

            // Create Stock Mutation Record
            await tx.stockMutation.create({
              data: {
                Code: `ADJ-${opName.Code}`,
                Date: new Date(),
                fromWarehouseId: opName.WarehouseId,
                toWarehouseId: opName.WarehouseId,
                reason: 'Stock Adjustment from OpName',
                referenceType: 'STOCK_OPNAME',
                referenceId: ID,
                Status: 'COMPLETED',
                Notes: `Adjustment: ${item.variance > 0 ? '+' : ''}${item.variance} (${item.varianceReason || 'No reason'})`,
                StockMutationItems: {
                  create: {
                    ProductId: item.ProductId,
                    Quantity: Math.abs(item.variance),
                    Notes: item.varianceReason,
                  },
                },
              },
            });
          }
        }
      }
    });

    return this.findById(ID);
  }

  /**
   * Cancel Stock opName
   */
  async cancel(ID: number, dto: CancelStockOpNameDto) {
    const opName = await this.findById(ID);

    if (opName.Status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed Stock opName');
    }

    return this.prisma.stockOpname.update({
      where: { ID },
      data: { Status: 'CANCELLED', Notes: `${opName.Notes || ''}\nCancellation: ${dto.Reason}` },
      include: {
        Warehouse: true,
        StockOpNameItems: { include: { Product: true } },
      },
    });
  }

  /**
   * Delete draft Stock opName
   */
  async delete(ID: number) {
    const opName = await this.findById(ID);

    if (opName.Status !== 'DRAFT') {
      throw new BadRequestException('Can only delete draft Stock opName');
    }

    return this.prisma.stockOpname.delete({ where: { ID } });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GENERATE OPNAME LIST
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * generate Stock opName list for a Warehouse
   */
  async generateOpNameList(dto: generateOpNameListDto) {
    const where: any = { IsActive: true };

    if (dto.CategoryId) {
      where.CategoryId = dto.CategoryId;
    }

    if (dto.inStockOnly === 'true' || dto.inStockOnly === true) {
      where.Stock = { gt: 0 };
    }

    const Products = await this.prisma.product.findMany({
      where,
      include: { Category: true },
    });

    const items = [];

    for (const Product of Products) {
      const ProductStock = await this.prisma.productStock.findUnique({
        where: {
          ProductId_WarehouseId: {
            ProductId: Product.ID,
            WarehouseId: dto.WarehouseId,
          },
        },
      });

      items.push({
        ProductId: Product.ID,
        ProductCode: Product.Code,
        ProductName: Product.Name,
        Category: Product.Category?.Name,
        systemQuantity: ProductStock ? Number(ProductStock.Quantity) : 0,
        physicalQuantity: 0,
        variance: 0,
      });
    }

    return { WarehouseId: dto.WarehouseId, items, TotalProducts: items.length };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const prefix = `SO-${year}${month}${day}`;

    const lastOpName = await this.prisma.stockOpname.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastOpName) {
      const lastSeq = parseInt(lastOpName.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
