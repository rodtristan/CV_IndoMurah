import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreatePurchaseReturnDto,
  UpDatePurchaseReturnDto,
  PurchaseReturnQueryDto,
  ApprovePurchaseReturnDto,
  CancelPurchaseReturnDto,
} from './Purchase-return.dto';

@Injectable()
export class PurchaseReturnService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new Purchase return (Retur Pembelian)
   * Flow: Admin buat retur → pilih Purchase → input produk & Qty → sistem buat credit Note
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
      const PurchaseItem = Purchase.PurchaseItems.find(pi => pi.ID === item.PurchaseItemId);
      if (!PurchaseItem) {
        throw new BadRequestException(`Purchase item ${item.PurchaseItemId} not found in Purchase`);
      }

      // Check max return Quantity
      const existingReturns = await this.prisma.purchaseReturnItem.aggregate({
        where: { PurchaseItemId: item.PurchaseItemId },
        _sum: { Quantity: true },
      });

      const alreadyReturned = existingReturns._sum.Quantity ? Number(existingReturns._sum.Quantity) : 0;
      const maxReturn = Number(PurchaseItem.Quantity) - alreadyReturned;

      if (item.Quantity > maxReturn) {
        throw new BadRequestException(`Return Quantity ${item.Quantity} exceeds available ${maxReturn} for item ${item.PurchaseItemId}`);
      }
    }

    // generate Code
    const Code = await this.generateCode();

    const returnData = await this.prisma.$transaction(async (tx) => {
      // Create Purchase return header
      const PurchaseReturn = await tx.purchaseReturn.create({
        data: {
          Code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          PurchaseId: dto.PurchaseId,
          SupplierId: dto.SupplierId,
          WarehouseId: dto.WarehouseId,
          referenceNumber: dto.ReferenceNumber,
          reason: dto.Reason,
          Status: 'PENDING',
          Notes: dto.Notes,
          createdByID: dto.createdById?.toString(),
          PurchaseReturnItems: {
            create: dto.Items.map((item) => ({
              PurchaseItemId: item.PurchaseItemId,
              ProductId: item.ProductId,
              Quantity: new Prisma.Decimal(item.Quantity),
              UnitPrice: new Prisma.Decimal(item.UnitPrice),
              reason: item.reason,
              Notes: item.Notes,
            })),
          },
        },
        include: {
          Supplier: true,
          Purchase: true,
          PurchaseReturnItems: { include: { Product: true, PurchaseItem: true } },
        },
      });

      // Calculate Total return Amount
      const TotalReturn = dto.Items.reduce((sum, item) => sum + (item.Quantity * item.UnitPrice), 0);

      return { ...PurchaseReturn, TotalReturn };
    });

    return returnData;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUERY
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Find all Purchase returns with pagination
   */
  async findAll(query: PurchaseReturnQueryDto) {
    const { search, page = 1, limit = 20, SupplierId, PurchaseId, Status, startDate, endDate } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { Code: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (SupplierId) where.SupplierId = SupplierId;
    if (PurchaseId) where.PurchaseId = PurchaseId;
    if (Status) where.Status = Status;

    if (startDate || endDate) {
      where.Date = {};
      if (startDate) where.Date.gte = new Date(startDate);
      if (endDate) where.Date.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [data, Total] = await Promise.all([
      this.prisma.purchaseReturn.findMany({
        where,
        include: {
          Supplier: true,
          Purchase: true,
          PurchaseReturnItems: { include: { Product: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.purchaseReturn.Count({ where }),
    ]);

    // Calculate Totals for each return
    const dataWithTotals = data.map((r) => ({
      ...r,
      TotalReturn: r.PurchaseReturnItems.reduce(
        (sum, item) => sum + Number(item.Quantity) * Number(item.UnitPrice),
        0
      ),
    }));

    return {
      data: dataWithTotals,
      pagination: { page, limit, Total, TotalPages: Math.ceil(Total / limit) },
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
        PurchaseReturnItems: { include: { Product: true, PurchaseItem: true } },
      },
    });

    if (!PurchaseReturn) {
      throw new NotFoundException('Purchase return not found');
    }

    const TotalReturn = PurchaseReturn.PurchaseReturnItems.reduce(
      (sum, item) => sum + Number(item.Quantity) * Number(item.UnitPrice),
      0
    );

    return { ...PurchaseReturn, TotalReturn };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * UpDate Purchase return (pending only)
   */
  async update(ID: number, dto: UpDatePurchaseReturnDto) {
    const existing = await this.findById(ID);

    if (existing.Status !== 'PENDING') {
      throw new BadRequestException('Can only update pending Purchase return');
    }

    return this.prisma.purchaseReturn.update({
      where: { ID },
      data: {
        Date: dto.Date ? new Date(dto.Date) : undefined,
        reason: dto.Reason,
        Notes: dto.Notes,
        Status: dto.status,
      },
      include: {
        Supplier: true,
        Purchase: true,
        PurchaseReturnItems: { include: { Product: true } },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Approve Purchase return (Buat credit Note Supplier)
   */
  async approve(ID: number, dto: ApprovePurchaseReturnDto) {
    const PurchaseReturn = await this.findById(ID);

    if (PurchaseReturn.Status === 'APPROVED' || PurchaseReturn.Status === 'COMPLETED') {
      throw new ConflictException('Purchase return already approved/completed');
    }

    if (PurchaseReturn.Status === 'CANCELLED') {
      throw new ConflictException('Cannot approve cancelled Purchase return');
    }

    await this.prisma.$transaction(async (tx) => {
      // UpDate Status to approved
      await tx.purchaseReturn.update({
        where: { ID },
        data: { Status: 'APPROVED' },
      });

      // Create Supplier credit/debt Record
      await tx.supplier.update({
        where: { ID: PurchaseReturn.SupplierId },
        data: { TotalPayable: { increment: new Prisma.Decimal(PurchaseReturn.TotalReturn) } },
      });

      // Create credit Note or Payment Record
      if (dto.creditNoteNumber) {
        // Create credit Note
        await tx.creditNote.create({
          data: {
            Code: dto.creditNoteNumber,
            Date: new Date(),
            Type: 'PURCHASE_RETURN',
            referenceId: ID,
            SupplierId: PurchaseReturn.SupplierId,
            Amount: new Prisma.Decimal(PurchaseReturn.TotalReturn),
            Notes: `Credit from return ${PurchaseReturn.Code}`,
          },
        });
      }
    });

    return this.findById(ID);
  }

  /**
   * Complete Purchase return (after refund or Stock return)
   */
  async complete(ID: number) {
    const PurchaseReturn = await this.findById(ID);

    if (PurchaseReturn.Status !== 'APPROVED') {
      throw new BadRequestException('Can only complete approved Purchase return');
    }

    await this.prisma.$transaction(async (tx) => {
      // UpDate Status
      await tx.purchaseReturn.update({
        where: { ID },
        data: { Status: 'COMPLETED' },
      });

      // Return Stock to Warehouse if Warehouse specified
      if (PurchaseReturn.WarehouseId) {
        for (const item of PurchaseReturn.PurchaseReturnItems) {
          await tx.productStock.update({
            where: {
              ProductId_WarehouseId: {
                ProductId: item.ProductId,
                WarehouseId: PurchaseReturn.WarehouseId,
              },
            },
            data: { Quantity: { increment: item.Quantity } },
          }).catch(() => {
            return tx.productStock.create({
              data: {
                ProductId: item.ProductId,
                WarehouseId: PurchaseReturn.WarehouseId!,
                Quantity: item.Quantity,
              },
            });
          });

          // UpDate general Product Stock
          await tx.product.update({
            where: { ID: item.ProductId },
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

    if (PurchaseReturn.Status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed Purchase return');
    }

    // If was approved, reverse the Supplier Balance
    if (PurchaseReturn.Status === 'APPROVED') {
      await this.prisma.$transaction(async (tx) => {
        await tx.supplier.update({
          where: { ID: PurchaseReturn.SupplierId },
          data: { TotalPayable: { decrement: new Prisma.Decimal(PurchaseReturn.TotalReturn) } },
        });

        await tx.purchaseReturn.update({
          where: { ID },
          data: {
            Status: 'CANCELLED',
            Notes: `${PurchaseReturn.Notes || ''}\nCancellation: ${dto.Reason}`,
          },
        });
      });
    } else {
      await this.prisma.purchaseReturn.update({
        where: { ID },
        data: {
          Status: 'CANCELLED',
          Notes: `${PurchaseReturn.Notes || ''}\nCancellation: ${dto.Reason}`,
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

    if (PurchaseReturn.Status !== 'PENDING') {
      throw new BadRequestException('Can only delete pending Purchase return');
    }

    return this.prisma.purchaseReturn.delete({ where: { ID } });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

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
