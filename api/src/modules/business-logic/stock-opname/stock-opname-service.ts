import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateStockOpnameDto,
  UpdateStockOpnameDto,
  StockOpnameQueryDto,
  ApproveStockOpnameDto,
  CancelStockOpnameDto,
  GenerateOpnameListDto,
} from './stock-opname.dto';

@Injectable()
export class StockOpnameService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new Stock Opname (Stock Taking)
   * Flow: Admin buat Stock Opname → input stok fisik → sistem hitung selisih
   *
   * Schema gaps: CreateStockOpnameDto.Type (FULL/PARTIAL) and .ReferenceNumber
   * have no corresponding column on the real StockOpname model, so they are
   * accepted by the DTO but not persisted.
   */
  async create(dto: CreateStockOpnameDto) {
    // generate Code
    const Code = await this.generateCode();

    const draftStatusId = await this.getStatusIdByCode('DRAFT', 1);
    const CreatedByID = dto.CreatedById ? String(dto.CreatedById) : 'system';

    const opname = await this.prisma.$transaction(async (tx) => {
      // Resolve system stock + Unit per item before creating the header
      const itemsData = await Promise.all(
        dto.Items.map(async (item) => {
          const Product = await tx.product.findUnique({ where: { ID: item.ProductId } });

          if (!Product) {
            throw new NotFoundException(`Product ${item.ProductId} not found`);
          }

          const ProductStock = await tx.productStock.findUnique({
            where: {
              ProductID_WarehouseID: {
                ProductID: item.ProductId,
                WarehouseID: dto.WarehouseId,
              },
            },
          });

          const systemQty = ProductStock ? Number(ProductStock.Quantity) : Number(Product.Stock);
          const physicalQty = item.PhysicalQuantity;
          const variance = physicalQty - systemQty;

          return {
            ProductID: item.ProductId,
            SystemStock: new Prisma.Decimal(systemQty),
            CountedStock: new Prisma.Decimal(physicalQty),
            Difference: new Prisma.Decimal(variance),
            UnitID: Product.UnitID,
            UnitPrice: new Prisma.Decimal(0),
            Note: item.VarianceReason || item.Notes || null,
          };
        }),
      );

      // Create Stock Opname header + items
      const header = await tx.stockOpname.create({
        data: {
          Code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          WarehouseID: dto.WarehouseId,
          TotalItems: new Prisma.Decimal(itemsData.length),
          StatusID: draftStatusId,
          Notes: dto.Notes,
          CreatedByID,
          OpnameItems: {
            create: itemsData,
          },
        },
        include: {
          Warehouse: true,
          Status: true,
          OpnameItems: { include: { Product: true } },
        },
      });

      return header;
    });

    return opname;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUERY
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Find all Stock Opnames with pagination
   */
  async findAll(query: StockOpnameQueryDto) {
    const { Search, Page = 1, Limit = 20, WarehouseId, Status, StartDate, EndDate } = query;

    const where: any = {};

    if (Search) {
      where.OR = [{ Code: { contains: Search, mode: 'insensitive' } }];
    }

    if (WarehouseId) where.WarehouseID = WarehouseId;
    if (Status) where.Status = { Code: Status };

    if (StartDate || EndDate) {
      where.Date = {};
      if (StartDate) where.Date.gte = new Date(StartDate);
      if (EndDate) where.Date.lte = new Date(EndDate);
    }

    const page = Page;
    const limit = Limit;
    const skip = (page - 1) * limit;

    const [data, Total] = await Promise.all([
      this.prisma.stockOpname.findMany({
        where,
        include: {
          Warehouse: true,
          Status: true,
          OpnameItems: { include: { Product: true } },
        },
        skip,
        take: limit,
        orderBy: { CreatedAt: 'desc' },
      }),
      this.prisma.stockOpname.count({ where }),
    ]);

    return {
      data,
      pagination: { page, limit, Total, TotalPages: Math.ceil(Total / limit) },
    };
  }

  /**
   * Find Stock Opname by ID
   */
  async findById(ID: number) {
    const opname = await this.prisma.stockOpname.findUnique({
      where: { ID },
      include: {
        Warehouse: true,
        Status: true,
        OpnameItems: { include: { Product: true } },
      },
    });

    if (!opname) {
      throw new NotFoundException('Stock Opname not found');
    }

    return opname;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Update Stock Opname (draft only)
   *
   * Schema gap: UpdateStockOpnameDto.ReferenceNumber has no matching column on
   * StockOpname, so it is accepted but not persisted.
   */
  async update(ID: number, dto: UpdateStockOpnameDto) {
    const existing = await this.findById(ID);

    if (existing.Status.Code !== 'DRAFT') {
      throw new BadRequestException('Can only update draft Stock Opname');
    }

    const data: Prisma.StockOpnameUpdateInput = {
      Date: dto.Date ? new Date(dto.Date) : undefined,
      Notes: dto.Notes,
    };

    if (dto.Status) {
      const statusId = await this.getStatusIdByCode(dto.Status);
      if (statusId) {
        data.Status = { connect: { ID: statusId } };
      }
    }

    return this.prisma.stockOpname.update({
      where: { ID },
      data,
      include: {
        Warehouse: true,
        Status: true,
        OpnameItems: { include: { Product: true } },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Approve Stock Opname and apply adjustments
   */
  async approve(ID: number, dto: ApproveStockOpnameDto) {
    const opname = await this.findById(ID);

    if (opname.Status.Code === 'COMPLETED') {
      throw new ConflictException('Stock Opname already completed');
    }

    if (opname.Status.Code === 'CANCELLED') {
      throw new ConflictException('Cannot approve cancelled Stock Opname');
    }

    const applyAdjustment = dto.ApplyAdjustment === 'true' || (dto.ApplyAdjustment as any) === true;
    const completedStatusId = await this.getStatusIdByCode('COMPLETED', opname.StatusID);

    await this.prisma.$transaction(async (tx) => {
      // Update Status
      await tx.stockOpname.update({
        where: { ID },
        data: { StatusID: completedStatusId },
      });

      // Apply Stock adjustments if requested
      if (applyAdjustment) {
        for (const item of opname.OpnameItems) {
          const difference = Number(item.Difference);
          if (difference !== 0) {
            // Update Warehouse Stock
            await tx.productStock
              .update({
                where: {
                  ProductID_WarehouseID: {
                    ProductID: item.ProductID,
                    WarehouseID: opname.WarehouseID,
                  },
                },
                data: { Quantity: item.CountedStock },
              })
              .catch(() => {
                // Create if not exists
                return tx.productStock.create({
                  data: {
                    ProductID: item.ProductID,
                    WarehouseID: opname.WarehouseID,
                    Quantity: item.CountedStock,
                  },
                });
              });

            // Update general Product Stock
            await tx.product.update({
              where: { ID: item.ProductID },
              data: { Stock: item.CountedStock },
            });

            // NOTE (schema gap): a StockMutation record documenting this
            // adjustment is intentionally not created here — StockMutation
            // requires a MutationCategoryID (FK to MutationCategory) that
            // this module has no safe default for. Only ProductStock/Product
            // are updated.
          }
        }
      }
    });

    return this.findById(ID);
  }

  /**
   * Cancel Stock Opname
   */
  async cancel(ID: number, dto: CancelStockOpnameDto) {
    const opname = await this.findById(ID);

    if (opname.Status.Code === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed Stock Opname');
    }

    const cancelledStatusId = await this.getStatusIdByCode('CANCELLED', opname.StatusID);

    return this.prisma.stockOpname.update({
      where: { ID },
      data: {
        StatusID: cancelledStatusId,
        Notes: `${opname.Notes || ''}\nCancellation: ${dto.Reason}`,
      },
      include: {
        Warehouse: true,
        Status: true,
        OpnameItems: { include: { Product: true } },
      },
    });
  }

  /**
   * Delete draft Stock Opname
   */
  async delete(ID: number) {
    const opname = await this.findById(ID);

    if (opname.Status.Code !== 'DRAFT') {
      throw new BadRequestException('Can only delete draft Stock Opname');
    }

    return this.prisma.stockOpname.delete({ where: { ID } });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GENERATE OPNAME LIST
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Generate Stock Opname list for a Warehouse
   */
  async generateOpnameList(dto: GenerateOpnameListDto) {
    const where: any = { IsActive: true };

    if (dto.CategoryId) {
      where.CategoryID = dto.CategoryId;
    }

    if (dto.InStockOnly === 'true' || (dto.InStockOnly as any) === true) {
      where.Stock = { gt: 0 };
    }

    const Products = await this.prisma.product.findMany({
      where,
      include: { Category: true },
    });

    const items: Array<{
      ProductId: number;
      ProductCode: string;
      ProductName: string;
      Category: string | undefined;
      systemQuantity: number;
      physicalQuantity: number;
      variance: number;
    }> = [];

    for (const Product of Products) {
      const ProductStock = await this.prisma.productStock.findUnique({
        where: {
          ProductID_WarehouseID: {
            ProductID: Product.ID,
            WarehouseID: dto.WarehouseId,
          },
        },
      });

      items.push({
        ProductId: Product.ID,
        ProductCode: Product.Code,
        ProductName: Product.Name,
        Category: Product.Category?.Name,
        systemQuantity: ProductStock ? Number(ProductStock.Quantity) : Number(Product.Stock),
        physicalQuantity: 0,
        variance: 0,
      });
    }

    return { WarehouseId: dto.WarehouseId, items, TotalProducts: items.length };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async getStatusIdByCode(code: string, fallback?: number): Promise<number> {
    const Status = await this.prisma.stockOpnameStatus.findFirst({ where: { Code: code } });
    if (Status) return Status.ID;
    if (fallback !== undefined) return fallback;
    throw new BadRequestException(`Stock Opname status '${code}' not configured`);
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const prefix = `SO-${year}${month}${day}`;

    const lastOpname = await this.prisma.stockOpname.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastOpname) {
      const lastSeq = parseInt(lastOpname.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
