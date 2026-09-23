import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client';
import { number } from '../../../common/utils/number';
import { CreatePurchaseOrderDto, PurchaseOrderFilterDto } from './purchase-order.dto';

// Maps the business-logic status vocabulary onto the real TransactionStatus codes
// seeded in prisma/seed.ts (DRAFT, CONFIRMED, PROCESSING, COMPLETED, CANCELLED, REJECTED).
const STATUS_CODE_MAP: Record<string, string> = {
  PENDING: 'DRAFT',
  APPROVED: 'CONFIRMED',
  RECEIVED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

@Injectable()
export class PurchaseOrderService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PURCHASE ORDER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Purchase Order
   * Flow: Purchaser buat PO -> sistem hitung Total, diskon, pajak -> simpan
   */
  async createPurchaseOrder(dto: CreatePurchaseOrderDto, UserId: string) {
    // Validate Supplier
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: dto.SupplierId },
    });

    if (!Supplier) {
      throw new NotFoundException(`Supplier ${dto.SupplierId} not found`);
    }

    // generate PO Code
    const code = await this.generatePONumber();

    const draftStatus = await this.getStatusByCode('DRAFT');
    const pendingPaymentStatus = await this.getPaymentStatusByCode('PENDING');
    const paidPaymentStatus = await this.getPaymentStatusByCode('PAID');

    // Calculate Totals
    let subTotal = 0;
    let TotalDiscount = 0;
    let TotalTax = 0;
    const itemsWithCalculations: Array<{
      ProductId: number;
      ProductName: string;
      WarehouseId: number | undefined;
      UnitId: number;
      Quantity: number;
      Price: number;
      discountPercent: number;
      discountAmount: number;
      taxPercent: number;
      taxAmount: number;
      subTotal: number;
      Notes: string | undefined;
    }> = [];

    for (const item of dto.Items) {
      // Get Product info
      const Product = await this.prisma.product.findUnique({
        where: { ID: item.ProductId },
      });

      if (!Product) {
        throw new NotFoundException(`Product ${item.ProductId} not found`);
      }

      const itemSubTotal = item.Price * item.Quantity;
      const discountAmount = (itemSubTotal * (item.DiscountPercent || 0)) / 100;
      const afterDiscount = itemSubTotal - discountAmount;
      const taxAmount = (afterDiscount * (item.TaxPercent || 0)) / 100;
      const itemTotal = afterDiscount + taxAmount;

      subTotal += itemSubTotal;
      TotalDiscount += discountAmount;
      TotalTax += taxAmount;

      itemsWithCalculations.push({
        ProductId: item.ProductId,
        ProductName: Product.Name,
        WarehouseId: item.WarehouseId || dto.WarehouseId,
        UnitId: item.UnitId || Product.UnitID,
        Quantity: item.Quantity,
        Price: item.Price,
        discountPercent: item.DiscountPercent || 0,
        discountAmount,
        taxPercent: item.TaxPercent || 0,
        taxAmount,
        // Note: PurchaseOrderItem has no dedicated tax column in schema.prisma,
        // so the tax amount is folded into the persisted Subtotal (matches the
        // header-level Total which also includes TaxAmount).
        subTotal: itemTotal,
        Notes: item.Notes,
      });
    }

    const TotalAmount = subTotal - TotalDiscount + TotalTax;
    const downPayment = dto.DownPayment || 0;
    const remainingAmount = TotalAmount - downPayment;

    const PurchaseOrder = await this.prisma.$transaction(async (tx) => {
      // Create PO
      const newPO = await tx.purchaseOrder.create({
        data: {
          Code: code,
          SupplierID: dto.SupplierId,
          WarehouseID: dto.WarehouseId,
          Date: dto.OrderDate ? new Date(dto.OrderDate) : new Date(),
          // ExpectedDate does not exist on PurchaseOrder in schema.prisma; DueDate
          // is the closest real column and is reused for the expected delivery date.
          DueDate: dto.ExpectedDate ? new Date(dto.ExpectedDate) : null,
          StatusID: draftStatus.ID,
          Subtotal: new Prisma.Decimal(subTotal),
          DiscountAmount: new Prisma.Decimal(TotalDiscount),
          TaxAmount: new Prisma.Decimal(TotalTax),
          Total: new Prisma.Decimal(TotalAmount),
          DownPayment: new Prisma.Decimal(downPayment),
          PaymentStatusID: remainingAmount <= 0 ? paidPaymentStatus.ID : pendingPaymentStatus.ID,
          Notes: dto.Notes,
          CreatedByID: UserId,
        },
      });

      // Create PO items (only columns that exist on PurchaseOrderItem are persisted;
      // WarehouseID/TaxPercent/TaxAmount/Notes are not columns on this model).
      await tx.purchaseOrderItem.createMany({
        data: itemsWithCalculations.map((item) => ({
          PurchaseOrderID: newPO.ID,
          ProductID: item.ProductId,
          UnitID: item.UnitId,
          Quantity: new Prisma.Decimal(item.Quantity),
          UnitPrice: new Prisma.Decimal(item.Price),
          DiscountPercent: new Prisma.Decimal(item.discountPercent || 0),
          DiscountAmount: new Prisma.Decimal(item.discountAmount),
          Subtotal: new Prisma.Decimal(item.subTotal),
        })),
      });

      return newPO;
    });

    return {
      success: true,
      PurchaseOrder: {
        ID: PurchaseOrder.ID,
        poNumber: PurchaseOrder.Code,
        SupplierId: PurchaseOrder.SupplierID,
        SupplierName: Supplier.Name,
        WarehouseId: PurchaseOrder.WarehouseID,
        OrderDate: PurchaseOrder.Date,
        expectedDate: PurchaseOrder.DueDate,
        Status: 'PENDING',
        subTotal,
        TotalDiscount,
        taxAmount: TotalTax,
        TotalAmount,
        downPayment,
        remainingAmount,
        PaymentStatus: remainingAmount <= 0 ? 'PAID' : 'PENDING',
        itemCount: dto.Items.length,
        items: itemsWithCalculations,
      },
    };
  }

  /**
   * Get PO by ID
   */
  async getPurchaseOrder(ID: number) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { ID: ID },
      include: {
        Supplier: true,
        Warehouse: true,
        Status: true,
        PaymentStatus: true,
        PurchaseOrderItems: {
          include: {
            Product: true,
            Unit: true,
          },
        },
      },
    });

    if (!po) {
      throw new NotFoundException(`Purchase Order ${ID} not found`);
    }

    return {
      ID: po.ID,
      poNumber: po.Code,
      SupplierId: po.SupplierID,
      SupplierName: po.Supplier?.Name,
      WarehouseId: po.WarehouseID,
      WarehouseName: po.Warehouse?.Name,
      OrderDate: po.Date,
      expectedDate: po.DueDate,
      Status: po.Status?.Code,
      subTotal: number(po.Subtotal),
      TotalDiscount: number(po.DiscountAmount),
      taxAmount: number(po.TaxAmount),
      TotalAmount: number(po.Total),
      downPayment: number(po.DownPayment),
      remainingAmount: number(po.Total) - number(po.DownPayment),
      PaymentStatus: po.PaymentStatus?.Code,
      Notes: po.Notes,
      createdBy: po.CreatedByID,
      // ApprovedBy does not exist on PurchaseOrder in schema.prisma; stubbed as null.
      approvedBy: null,
      createdAt: po.CreatedAt,
      items: po.PurchaseOrderItems.map((item) => ({
        ID: item.ID,
        ProductId: item.ProductID,
        ProductName: item.Product?.Name,
        ProductCode: item.Product?.Code,
        UnitId: item.UnitID,
        UnitName: item.Unit?.Name,
        Quantity: number(item.Quantity),
        Price: number(item.UnitPrice),
        discountPercent: number(item.DiscountPercent),
        discountAmount: number(item.DiscountAmount),
        subTotal: number(item.Subtotal),
      })),
    };
  }

  /**
   * List Purchase Orders
   */
  async listPurchaseOrders(dto: PurchaseOrderFilterDto) {
    const where: Prisma.PurchaseOrderWhereInput = {};

    if (dto.SupplierId) {
      where.SupplierID = dto.SupplierId;
    }

    if (dto.WarehouseId) {
      where.WarehouseID = dto.WarehouseId;
    }

    if (dto.Status) {
      const mappedCode = STATUS_CODE_MAP[dto.Status.toUpperCase()] || dto.Status.toUpperCase();
      const status = await this.prisma.transactionStatus.findUnique({ where: { Code: mappedCode } });
      where.StatusID = status?.ID ?? -1;
    }

    if (dto.PaymentStatus) {
      const paymentStatus = await this.prisma.paymentStatus.findUnique({
        where: { Code: dto.PaymentStatus.toUpperCase() },
      });
      where.PaymentStatusID = paymentStatus?.ID ?? -1;
    }

    if (dto.StartDate || dto.EndDate) {
      where.Date = {};
      if (dto.StartDate) {
        where.Date.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.Date.lte = new Date(dto.EndDate);
      }
    }

    const Orders = await this.prisma.purchaseOrder.findMany({
      where,
      include: {
        Supplier: { select: { ID: true, Name: true } },
        Warehouse: { select: { ID: true, Name: true } },
        Status: true,
        PaymentStatus: true,
        PurchaseOrderItems: true,
      },
      orderBy: { Date: 'desc' },
    });

    return Orders.map((po) => ({
      ID: po.ID,
      poNumber: po.Code,
      SupplierId: po.SupplierID,
      SupplierName: po.Supplier?.Name,
      WarehouseId: po.WarehouseID,
      WarehouseName: po.Warehouse?.Name,
      OrderDate: po.Date,
      expectedDate: po.DueDate,
      Status: po.Status?.Code,
      TotalAmount: number(po.Total),
      downPayment: number(po.DownPayment),
      remainingAmount: number(po.Total) - number(po.DownPayment),
      PaymentStatus: po.PaymentStatus?.Code,
      itemCount: po.PurchaseOrderItems.length,
      createdAt: po.CreatedAt,
    }));
  }

  /**
   * Approve PO
   */
  async approvePurchaseOrder(ID: number, _UserId: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { ID: ID },
      include: { Status: true },
    });

    if (!po) {
      throw new NotFoundException(`PO ${ID} not found`);
    }

    if (po.Status?.Code !== 'DRAFT') {
      throw new BadRequestException('Only pending Orders can be approved');
    }

    const confirmedStatus = await this.getStatusByCode('CONFIRMED');

    const updated = await this.prisma.purchaseOrder.update({
      where: { ID: ID },
      data: {
        StatusID: confirmedStatus.ID,
        // ApprovedBy does not exist on PurchaseOrder in schema.prisma; not persisted.
      },
      include: { Status: true },
    });

    return {
      success: true,
      poNumber: updated.Code,
      Status: updated.Status?.Code,
      message: 'Purchase Order approved',
    };
  }

  /**
   * Cancel PO
   */
  async cancelPurchaseOrder(ID: number, _UserId: string, reason?: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { ID: ID },
      include: { Status: true },
    });

    if (!po) {
      throw new NotFoundException(`PO ${ID} not found`);
    }

    if (po.Status?.Code === 'COMPLETED' || po.Status?.Code === 'CANCELLED') {
      throw new BadRequestException('Cannot cancel received or already cancelled Orders');
    }

    const cancelledStatus = await this.getStatusByCode('CANCELLED');

    const updated = await this.prisma.purchaseOrder.update({
      where: { ID: ID },
      data: {
        StatusID: cancelledStatus.ID,
        Notes: reason ? `${po.Notes || ''}\nCancelled: ${reason}` : po.Notes,
      },
      include: { Status: true },
    });

    return {
      success: true,
      poNumber: updated.Code,
      Status: updated.Status?.Code,
      message: 'Purchase Order cancelled',
    };
  }

  /**
   * Record partial delivery
   */
  async recordDelivery(
    ID: number,
    deliveredItems: { itemId: number; quantity: number }[],
    _UserId: string,
  ) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { ID: ID },
      include: { PurchaseOrderItems: true, Status: true },
    });

    if (!po) {
      throw new NotFoundException(`PO ${ID} not found`);
    }

    if (po.Status?.Code === 'CANCELLED') {
      throw new BadRequestException('Cannot deliver to cancelled Order');
    }

    // Note: PurchaseOrderItem has no ReceivedQuantity column in schema.prisma, so
    // delivered quantities cannot be persisted per item. Only the aggregate
    // "fully received" check (against the requested items/quantities) drives the
    // PO status transition below.
    const allReceived = po.PurchaseOrderItems.every((item) => {
      const delivery = deliveredItems.find((d) => d.itemId === item.ID);
      return delivery && delivery.quantity >= Number(item.Quantity);
    });

    if (allReceived) {
      const completedStatus = await this.getStatusByCode('COMPLETED');
      await this.prisma.purchaseOrder.update({
        where: { ID: ID },
        data: { StatusID: completedStatus.ID },
      });
    }

    return {
      success: true,
      Status: allReceived ? 'RECEIVED' : 'PARTIAL',
      message: allReceived ? 'Full delivery Recorded' : 'Partial delivery Recorded',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async getStatusByCode(code: string) {
    const status = await this.prisma.transactionStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Status '${code}' tidak ditemukan`);
    return status;
  }

  private async getPaymentStatusByCode(code: string) {
    const status = await this.prisma.paymentStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Payment status '${code}' tidak ditemukan`);
    return status;
  }

  private async generatePONumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `PO-${year}${month}`;

    const lastPO = await this.prisma.purchaseOrder.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastPO) {
      const lastSeq = parseInt(lastPO.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
