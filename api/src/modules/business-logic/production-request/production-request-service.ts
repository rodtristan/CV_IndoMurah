import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import { CreateProductionRequestDto, ProductionRequestFilterDto } from './production-request.dto';

@Injectable()
export class ProductionRequestService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCTION REQUEST MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Production Request
   * Flow: Produksi team minta Material → sistem buat Request untuk approval
   */
  async createRequest(dto: CreateProductionRequestDto, UserId: string) {
    // generate Request Number
    const requestNumber = await this.generateRequestNumber();

    // Validate Supplier if provided
    if (dto.SupplierId) {
      const Supplier = await this.prisma.supplier.findUnique({
        where: { ID: dto.SupplierId },
      });
      if (!Supplier) {
        throw new NotFoundException(`Supplier ${dto.SupplierId} not found`);
      }
    }

    // Validate all Products exist
    for (const item of dto.Items) {
      const Product = await this.prisma.product.findUnique({
        where: { ID: item.ProductId },
      });
      if (!Product) {
        throw new NotFoundException(`Product ${item.ProductId} not found`);
      }
    }

    const Request = await this.prisma.$transaction(async (tx) => {
      // Create Request
      const newRequest = await tx.productionRequest.create({
        data: {
          ...(dto.SupplierId && { SupplierID: dto.SupplierId }),
          ...(dto.WarehouseId && { WarehouseID: dto.WarehouseId }),
          RequestDate: dto.RequestDate ? new Date(dto.RequestDate) : new Date(),
          Status: dto.Status || 'PENDING',
          Notes: dto.Notes ?? null,
          CreatedBy: UserId,
        } as any,
      });

      // Create Request items
      let TotalQuantity = 0;
      const items: Array<{
        ID: number;
        ProductId: number;
        ProductName: string;
        WarehouseId: number | undefined;
        UnitId: number;
        Quantity: number;
        Price: number;
      }> = [];

      for (const item of dto.Items) {
        const Product = await tx.product.findUnique({
          where: { ID: item.ProductId },
        });

        if (!Product) {
          throw new NotFoundException(`Product ${item.ProductId} not found`);
        }

        const Price = item.Price ?? Number(Product.PurchasePrice);
        const subTotal = Price * item.Quantity;
        TotalQuantity += item.Quantity;

        const createdItem = await tx.productionRequestItem.create({
          data: {
            ProductionRequestID: newRequest.ID,
            ProductID: item.ProductId,
            WarehouseID: item.WarehouseId,
            UnitID: item.UnitId || Product.UnitID,
            Quantity: new Prisma.Decimal(item.Quantity),
            Price: new Prisma.Decimal(Price),
          },
        });

        items.push({
          ID: createdItem.ID,
          ProductId: item.ProductId,
          ProductName: Product.Name,
          WarehouseId: item.WarehouseId,
          UnitId: item.UnitId || Product.UnitID,
          Quantity: item.Quantity,
          Price,
        });
      }

      return { Request: newRequest, items, TotalQuantity };
    });

    return {
      success: true,
      Request: {
        ID: Request.Request.ID,
        RequestNumber: Request.Request.RequestNumber,
        SupplierId: Request.Request.SupplierID,
        WarehouseId: Request.Request.WarehouseID,
        RequestDate: Request.Request.RequestDate,
        Status: Request.Request.Status,
        Notes: Request.Request.Notes,
        TotalQuantity: Request.TotalQuantity,
        itemCount: Request.items.length,
        items: Request.items,
      },
    };
  }

  /**
   * Get Request by ID
   */
  async getRequest(ID: number) {
    const Request = await this.prisma.productionRequest.findUnique({
      where: { ID: ID },
      include: {
        Supplier: true,
        Warehouse: true,
        Items: {
          include: {
            Product: true,
            Unit: true,
            Warehouse: true,
          },
        },
      },
    });

    if (!Request) {
      throw new NotFoundException(`Request ${ID} not found`);
    }

    return {
      ID: Request.ID,
      RequestNumber: Request.RequestNumber,
      SupplierId: Request.SupplierID,
      SupplierName: Request.Supplier?.Name,
      WarehouseId: Request.WarehouseID,
      WarehouseName: Request.Warehouse?.Name,
      RequestDate: Request.RequestDate,
      Status: Request.Status,
      Notes: Request.Notes,
      createdBy: Request.CreatedBy,
      createdAt: Request.CreatedAt,
      items: Request.Items.map((item: { ID: number; ProductID: number; Product?: { Name?: string; Code?: string } | null; WarehouseID: number | null; Warehouse?: { Name?: string } | null; UnitID: number | null; Unit?: { Name?: string } | null; Quantity: { toNumber(): number }; Price: { toNumber(): number } }) => ({
        ID: item.ID,
        ProductId: item.ProductID,
        ProductName: item.Product?.Name,
        ProductCode: item.Product?.Code,
        WarehouseId: item.WarehouseID,
        WarehouseName: item.Warehouse?.Name,
        UnitId: item.UnitID,
        UnitName: item.Unit?.Name,
        Quantity: number(item.Quantity),
        Price: number(item.Price),
        subTotal: number(item.Quantity) * Number(item.Price),
      })),
    };
  }

  /**
   * List Requests
   */
  async listRequests(dto: ProductionRequestFilterDto) {
    const where: { SupplierID?: number; WarehouseID?: number; Status?: string; RequestDate?: { gte?: Date; lte?: Date } } = {};

    if (dto.SupplierId) {
      where.SupplierID = dto.SupplierId;
    }

    if (dto.WarehouseId) {
      where.WarehouseID = dto.WarehouseId;
    }

    if (dto.Status) {
      where.Status = dto.Status.toUpperCase();
    }

    if (dto.StartDate || dto.EndDate) {
      where.RequestDate = {};
      if (dto.StartDate) {
        where.RequestDate.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.RequestDate.lte = new Date(dto.EndDate);
      }
    }

    const Requests = await this.prisma.productionRequest.findMany({
      where,
      include: {
        Supplier: { select: { ID: true, Name: true } },
        Warehouse: { select: { ID: true, Name: true } },
        Items: true,
      },
      orderBy: { RequestDate: 'desc' },
    });

    return Requests.map((r: { ID: number; RequestNumber: string; SupplierID: number | null; Supplier?: { ID: number; Name: string } | null; WarehouseID: number | null; Warehouse?: { ID: number; Name: string } | null; RequestDate: Date; Status: string; Items: Array<{ Quantity: { toNumber(): number } }>; Notes: string | null; CreatedAt: Date }) => ({
      ID: r.ID,
      RequestNumber: r.RequestNumber,
      SupplierId: r.SupplierID,
      SupplierName: r.Supplier?.Name,
      WarehouseId: r.WarehouseID,
      WarehouseName: r.Warehouse?.Name,
      RequestDate: r.RequestDate,
      Status: r.Status,
      itemCount: r.Items.length,
      TotalQuantity: r.Items.reduce((sum, item) => sum + Number(item.Quantity), 0),
      Notes: r.Notes,
      createdAt: r.CreatedAt,
    }));
  }

  /**
   * Approve Request
   */
  async approveRequest(ID: number, UserId: string) {
    const Request = await this.prisma.productionRequest.findUnique({
      where: { ID: ID },
    });

    if (!Request) {
      throw new NotFoundException(`Request ${ID} not found`);
    }

    if (Request.Status !== 'PENDING') {
      throw new BadRequestException('Only pending Requests can be approved');
    }

    const updated = await this.prisma.productionRequest.update({
      where: { ID: ID },
      data: { Status: 'APPROVED' },
    });

    return {
      success: true,
      RequestNumber: updated.RequestNumber,
      Status: updated.Status,
      message: 'Request approved successfully',
    };
  }

  /**
   * Reject Request
   */
  async rejectRequest(ID: number, UserId: string, reason?: string) {
    const Request = await this.prisma.productionRequest.findUnique({
      where: { ID: ID },
    });

    if (!Request) {
      throw new NotFoundException(`Request ${ID} not found`);
    }

    if (Request.Status !== 'PENDING') {
      throw new BadRequestException('Only pending Requests can be rejected');
    }

    const updated = await this.prisma.productionRequest.update({
      where: { ID: ID },
      data: {
        Status: 'REJECTED',
        Notes: reason ? `${Request.Notes || ''}\nRejected: ${reason}` : Request.Notes,
      },
    });

    return {
      success: true,
      RequestNumber: updated.RequestNumber,
      Status: updated.Status,
      message: 'Request rejected',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateRequestNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const prefix = `PRQ-${year}${month}${day}`;

    const lastRequest = await this.prisma.productionRequest.findFirst({
      where: { RequestNumber: { startsWith: prefix } },
      orderBy: { RequestNumber: 'desc' },
      select: { RequestNumber: true },
    });

    let nextNumber = 1;
    if (lastRequest) {
      const lastSeq = parseInt(lastRequest.RequestNumber.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
