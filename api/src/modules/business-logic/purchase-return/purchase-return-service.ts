import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client';
import { number } from '../../../common/utils/number';
import {
  CreatePurchaseReturnDto,
  UpDatePurchaseReturnDto,
  PurchaseReturnQueryDto,
  ApprovePurchaseReturnDto,
  CancelPurchaseReturnDto,
} from './purchase-return.dto';

// Maps the business-logic status vocabulary onto the real TransactionStatus codes
// seeded in prisma/seed.ts (DRAFT, CONFIRMED, PROCESSING, COMPLETED, CANCELLED, REJECTED).
const STATUS_CODE_MAP: Record<string, string> = {
  PENDING: 'DRAFT',
  APPROVED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

@Injectable()
export class PurchaseReturnService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new Purchase return (Retur Pembelian)
   * Flow: Admin buat retur -> pilih Purchase -> input produk & Qty -> sistem buat credit Note
   */
  async create(dto: CreatePurchaseReturnDto) {
    // Validate Purchase exists
    const Purchase = await this.prisma.purchase.findUnique({
      where: { ID: dto.PurchaseId },
      include: { PurchaseItems: true },
    });

    if (!Purchase) {
      throw new NotFoundException('Purchase not found');
    }

    // Validate items against Purchase
    for (const item of dto.Items) {
      const PurchaseItem = Purchase.PurchaseItems.find((pi) => pi.ID === item.PurchaseItemId);
      if (!PurchaseItem) {
        throw new BadRequestException(`Purchase item ${item.PurchaseItemId} not found in Purchase`);
      }

      // Check max return Quantity. Note: PurchaseReturnItem has no PurchaseItemID column
      // in schema.prisma, so already-returned quantity is tracked via ProductID instead.
      const existingReturns = await this.prisma.purchaseReturnItem.aggregate({
        where: {
          ProductID: item.ProductId,
          PurchaseReturn: { PurchaseID: dto.PurchaseId },
        },
        _sum: { Quantity: true },
      });

      const alreadyReturned = existingReturns._sum?.Quantity ? Number(existingReturns._sum.Quantity) : 0;
      const maxReturn = Number(PurchaseItem.Quantity) - alreadyReturned;

      if (item.Quantity > maxReturn) {
        throw new BadRequestException(
          `Return Quantity ${item.Quantity} exceeds available ${maxReturn} for item ${item.PurchaseItemId}`,
        );
      }
    }

    // generate Code
    const Code = await this.generateCode();
    const draftStatus = await this.getStatusByCode('DRAFT');

    const TotalReturn = dto.Items.reduce((sum, item) => sum + item.Quantity * item.UnitPrice, 0);

    const PurchaseReturn = await this.prisma.$transaction(async (tx) => {
      return tx.purchaseReturn.create({
        data: {
          Code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          PurchaseID: dto.PurchaseId,
          SupplierID: dto.SupplierId,
          WarehouseID: dto.WarehouseId,
          Reason: dto.Reason,
          StatusID: draftStatus.ID,
          TotalReturn: new Prisma.Decimal(TotalReturn),
          CreatedByID: dto.CreatedById?.toString() ?? 'system',
          ReturnItems: {
            create: dto.Items.map((item) => {
              const PurchaseItem = Purchase.PurchaseItems.find((pi) => pi.ID === item.PurchaseItemId)!;
              return {
                ProductID: item.ProductId,
                UnitID: PurchaseItem.UnitID,
                Quantity: new Prisma.Decimal(item.Quantity),
                UnitPrice: new Prisma.Decimal(item.UnitPrice),
                Subtotal: new Prisma.Decimal(item.Quantity * item.UnitPrice),
              };
            }),
          },
        },
        include: {
          Supplier: true,
          Purchase: true,
          Status: true,
          ReturnItems: { include: { Product: true } },
        },
      });
    });

    return { ...PurchaseReturn, TotalReturn };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUERY
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Find all Purchase returns with pagination
   */
  async findAll(query: PurchaseReturnQueryDto) {
    const { Search, Page = 1, Limit = 20, SupplierId, PurchaseId, Status, StartDate, EndDate } = query;

    const where: Prisma.PurchaseReturnWhereInput = {};

    if (Search) {
      where.OR = [
        { Code: { contains: Search, mode: 'insensitive' } },
        { Reason: { contains: Search, mode: 'insensitive' } },
      ];
    }

    if (SupplierId) where.SupplierID = SupplierId;
    if (PurchaseId) where.PurchaseID = PurchaseId;
    if (Status) {
      const mappedCode = STATUS_CODE_MAP[Status.toUpperCase()] || Status.toUpperCase();
      const status = await this.prisma.transactionStatus.findUnique({ where: { Code: mappedCode } });
      where.StatusID = status?.ID ?? -1;
    }

    if (StartDate || EndDate) {
      where.Date = {};
      if (StartDate) where.Date.gte = new Date(StartDate);
      if (EndDate) where.Date.lte = new Date(EndDate);
    }

    const skip = (Page - 1) * Limit;

    const [data, Total] = await Promise.all([
      this.prisma.purchaseReturn.findMany({
        where,
        include: {
          Supplier: true,
          Purchase: true,
          Status: true,
          ReturnItems: { include: { Product: true } },
        },
        skip,
        take: Limit,
        orderBy: { CreatedAt: 'desc' },
      }),
      this.prisma.purchaseReturn.count({ where }),
    ]);

    // Calculate Totals for each return
    const dataWithTotals = data.map((r) => ({
      ...r,
      TotalReturn: number(r.TotalReturn),
    }));

    return {
      data: dataWithTotals,
      pagination: { page: Page, limit: Limit, Total, TotalPages: Math.ceil(Total / Limit) },
    };
  }

  /**
   * Find Purchase return by ID
   */
  async findById(ID: number) {
    const PurchaseReturn = await this.prisma.purchaseReturn.findUnique({
      where: { ID },
      include: {
        Supplier: true,
        Purchase: true,
        Status: true,
        ReturnItems: { include: { Product: true } },
      },
    });

    if (!PurchaseReturn) {
      throw new NotFoundException('Purchase return not found');
    }

    return { ...PurchaseReturn, TotalReturn: number(PurchaseReturn.TotalReturn) };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * UpDate Purchase return (pending only)
   */
  async update(ID: number, dto: UpDatePurchaseReturnDto) {
    const existing = await this.findById(ID);

    if (existing.Status?.Code !== 'DRAFT') {
      throw new BadRequestException('Can only update pending Purchase return');
    }

    const data: Prisma.PurchaseReturnUpdateInput = {
      Date: dto.Date ? new Date(dto.Date) : undefined,
      Reason: dto.Reason,
    };

    if (dto.Status) {
      const mappedCode = STATUS_CODE_MAP[dto.Status.toUpperCase()] || dto.Status.toUpperCase();
      const status = await this.getStatusByCode(mappedCode);
      data.Status = { connect: { ID: status.ID } };
    }

    return this.prisma.purchaseReturn.update({
      where: { ID },
      data,
      include: {
        Supplier: true,
        Purchase: true,
        Status: true,
        ReturnItems: { include: { Product: true } },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Approve Purchase return (Buat credit Note Supplier)
   */
  async approve(ID: number, _dto: ApprovePurchaseReturnDto) {
    const PurchaseReturn = await this.findById(ID);

    if (PurchaseReturn.Status?.Code === 'CONFIRMED' || PurchaseReturn.Status?.Code === 'COMPLETED') {
      throw new ConflictException('Purchase return already approved/completed');
    }

    if (PurchaseReturn.Status?.Code === 'CANCELLED') {
      throw new ConflictException('Cannot approve cancelled Purchase return');
    }

    const confirmedStatus = await this.getStatusByCode('CONFIRMED');

    await this.prisma.$transaction(async (tx) => {
      // UpDate Status to approved
      await tx.purchaseReturn.update({
        where: { ID },
        data: { StatusID: confirmedStatus.ID },
      });

      // Reduce Supplier debt by the returned amount.
      // Note: no CreditNote model exists in schema.prisma, so a formal credit note
      // record cannot be persisted here; only the Supplier balance is adjusted.
      await tx.supplier.update({
        where: { ID: PurchaseReturn.SupplierID },
        data: { TotalDebt: { decrement: new Prisma.Decimal(PurchaseReturn.TotalReturn) } },
      });
    });

    return this.findById(ID);
  }

  /**
   * Complete Purchase return (after refund or Stock return)
   */
  async complete(ID: number) {
    const PurchaseReturn = await this.findById(ID);

    if (PurchaseReturn.Status?.Code !== 'CONFIRMED') {
      throw new BadRequestException('Can only complete approved Purchase return');
    }

    const completedStatus = await this.getStatusByCode('COMPLETED');

    await this.prisma.$transaction(async (tx) => {
      // UpDate Status
      await tx.purchaseReturn.update({
        where: { ID },
        data: { StatusID: completedStatus.ID },
      });

      // Return Stock to Warehouse if Warehouse specified
      if (PurchaseReturn.WarehouseID) {
        for (const item of PurchaseReturn.ReturnItems) {
          await tx.productStock
            .update({
              where: {
                ProductID_WarehouseID: {
                  ProductID: item.ProductID,
                  WarehouseID: PurchaseReturn.WarehouseID,
                },
              },
              data: { Quantity: { increment: item.Quantity } },
            })
            .catch(() => {
              return tx.productStock.create({
                data: {
                  ProductID: item.ProductID,
                  WarehouseID: PurchaseReturn.WarehouseID!,
                  Quantity: item.Quantity,
                },
              });
            });

          // UpDate general Product Stock
          await tx.product.update({
            where: { ID: item.ProductID },
            data: { Stock: { increment: item.Quantity } },
          });
        }
      }
    });

    return this.findById(ID);
  }

  /**
   * Cancel Purchase return
   */
  async cancel(ID: number, dto: CancelPurchaseReturnDto) {
    const PurchaseReturn = await this.findById(ID);

    if (PurchaseReturn.Status?.Code === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed Purchase return');
    }

    const cancelledStatus = await this.getStatusByCode('CANCELLED');

    // If was approved, reverse the Supplier Balance
    if (PurchaseReturn.Status?.Code === 'CONFIRMED') {
      await this.prisma.$transaction(async (tx) => {
        await tx.supplier.update({
          where: { ID: PurchaseReturn.SupplierID },
          data: { TotalDebt: { increment: new Prisma.Decimal(PurchaseReturn.TotalReturn) } },
        });

        await tx.purchaseReturn.update({
          where: { ID },
          data: {
            StatusID: cancelledStatus.ID,
            Reason: `${PurchaseReturn.Reason || ''}\nCancellation: ${dto.Reason}`,
          },
        });
      });
    } else {
      await this.prisma.purchaseReturn.update({
        where: { ID },
        data: {
          StatusID: cancelledStatus.ID,
          Reason: `${PurchaseReturn.Reason || ''}\nCancellation: ${dto.Reason}`,
        },
      });
    }

    return this.findById(ID);
  }

  /**
   * Delete pending Purchase return
   */
  async delete(ID: number) {
    const PurchaseReturn = await this.findById(ID);

    if (PurchaseReturn.Status?.Code !== 'DRAFT') {
      throw new BadRequestException('Can only delete pending Purchase return');
    }

    return this.prisma.purchaseReturn.delete({ where: { ID } });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async getStatusByCode(code: string) {
    const status = await this.prisma.transactionStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Status '${code}' tidak ditemukan`);
    return status;
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const prefix = `PR-${year}${month}${day}`;

    const lastReturn = await this.prisma.purchaseReturn.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastReturn) {
      const lastSeq = parseInt(lastReturn.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
