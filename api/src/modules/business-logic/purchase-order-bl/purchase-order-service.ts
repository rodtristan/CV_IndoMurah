import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import { CreatePurchaseOrderDto, PurchaseOrderFilterDto } from './Purchase-Order.dto';

@Injectable()
export class PurchaseOrderService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PURCHASE ORDER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Purchase Order
   * Flow: Purchaser buat PO → sistem hitung Total, diskon, pajak → simpan
   */
  async createPurchaseOrder(dto: CreatePurchaseOrderDto, UserId: string) {
    // Validate Supplier
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: dto.SupplierId },
    });

    if (!Supplier) {
      throw new NotFoundException(`Supplier ${dto.SupplierId} not found`);
    }

    // generate PO Number
    const ponumber = await this.generatePONumber();

    // Calculate Totals
    let subTotal = 0;
    let TotalDiscount = 0;
    let TotalTax = 0;
    const itemsWithCalculations = [];

    for (const item of dto.Items) {
      // Get Product info
      const Product = await this.prisma.product.findUnique({
        where: { ID: item.ProductId },
      });

      if (!Product) {
        throw new NotFoundException(`Product ${item.ProductId} not found`);
      }

      const itemSubTotal = item.Price * item.Quantity;
      const discountAmount = (itemSubTotal * (item.discountPercent || 0)) / 100;
      const afterDiscount = itemSubTotal - discountAmount;
      const taxAmount = (afterDiscount * (item.taxPercent || 0)) / 100;
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
        discountPercent: item.discountPercent || 0,
        discountAmount,
        taxPercent: item.taxPercent || 0,
        taxAmount,
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
          SupplierID: dto.SupplierId,
          WarehouseID: dto.WarehouseId,
          OrderDate: dto.OrderDate ? new Date(dto.OrderDate) : new Date(),
          ExpectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
          Status: 'PENDING',
          SubTotal: new Prisma.Decimal(subTotal),
          TotalDiscount: new Prisma.Decimal(TotalDiscount),
          TaxAmount: new Prisma.Decimal(TotalTax),
          TotalAmount: new Prisma.Decimal(TotalAmount),
          DownPayment: new Prisma.Decimal(downPayment),
          RemainingAmount: new Prisma.Decimal(remainingAmount),
          DownPaymentStatus: downPayment > 0 ? 'PARTIAL' : 'NONE',
          PaymentStatus: remainingAmount === 0 ? 'PAID' : 'UNPAID',
          Notes: dto.Notes,
          CreatedBy: UserId,
        },
      });

      // Create PO items
      await tx.purchaseOrderItem.createMany({
        data: itemsWithCalculations.map((item) => ({
          PurchaseOrderID: newPO.ID,
          ProductID: item.ProductId,
          WarehouseID: item.WarehouseId,
          UnitID: item.UnitId,
          Quantity: new Prisma.Decimal(item.Quantity),
          Price: new Prisma.Decimal(item.Price),
          DiscountPercent: new Prisma.Decimal(item.discountPercent || 0),
          DiscountAmount: new Prisma.Decimal(item.discountAmount),
          TaxPercent: new Prisma.Decimal(item.taxPercent || 0),
          TaxAmount: new Prisma.Decimal(item.taxAmount),
          SubTotal: new Prisma.Decimal(item.subTotal),
          Notes: item.Notes,
        })),
      });

      return newPO;
    });

    return {
      success: true,
      PurchaseOrder: {
        ID: PurchaseOrder.ID,
        poNumber: PurchaseOrder.PurchaseOrderNumber,
        SupplierId: PurchaseOrder.SupplierID,
        SupplierName: Supplier.Name,
        WarehouseId: PurchaseOrder.WarehouseID,
        OrderDate: PurchaseOrder.OrderDate,
        expectedDate: PurchaseOrder.ExpectedDate,
        Status: PurchaseOrder.Status,
        subTotal,
        TotalDiscount,
        taxAmount: TotalTax,
        TotalAmount,
        downPayment,
        remainingAmount,
        PaymentStatus: PurchaseOrder.PaymentStatus,
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
        Items: {
          include: {
            Product: true,
            Unit: true,
            Warehouse: true,
          },
        },
      },
    });

    if (!po) {
      throw new NotFoundException(`Purchase Order ${ID} not found`);
    }

    return {
      ID: po.ID,
      poNumber: po.PurchaseOrderNumber,
      SupplierId: po.SupplierID,
      SupplierName: po.Supplier?.Name,
      WarehouseId: po.WarehouseID,
      WarehouseName: po.Warehouse?.Name,
      OrderDate: po.OrderDate,
      expectedDate: po.ExpectedDate,
      Status: po.Status,
      subTotal: number(po.SubTotal),
      TotalDiscount: number(po.TotalDiscount),
      taxAmount: number(po.TaxAmount),
      TotalAmount: number(po.TotalAmount),
      downPayment: number(po.DownPayment),
      remainingAmount: number(po.RemainingAmount),
      PaymentStatus: po.PaymentStatus,
      PaymentDate: po.PaymentDate,
      Notes: po.Notes,
      createdBy: po.CreatedBy,
      approvedBy: po.ApprovedBy,
      createdAt: po.CreatedAt,
      items: po.Items.map((item) => ({
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
        discountPercent: number(item.DiscountPercent),
        discountAmount: number(item.DiscountAmount),
        taxPercent: number(item.TaxPercent),
        taxAmount: number(item.TaxAmount),
        subTotal: number(item.SubTotal),
        Notes: item.Notes,
      })),
    };
  }

  /**
   * List Purchase Orders
   */
  async listPurchaseOrders(dto: PurchaseOrderFilterDto) {
    const where: any = {};

    if (dto.SupplierId) {
      where.SupplierID = dto.SupplierId;
    }

    if (dto.WarehouseId) {
      where.WarehouseID = dto.WarehouseId;
    }

    if (dto.status) {
      where.Status = dto.status.toUpperCase();
    }

    if (dto.PaymentStatus) {
      where.PaymentStatus = dto.PaymentStatus.toUpperCase();
    }

    if (dto.StartDate || dto.EndDate) {
      where.OrderDate = {};
      if (dto.StartDate) {
        where.OrderDate.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.OrderDate.lte = new Date(dto.EndDate);
      }
    }

    const Orders = await this.prisma.purchaseOrder.findMany({
      where,
      include: {
        Supplier: { select: { ID: true, Name: true } },
        Warehouse: { select: { ID: true, Name: true } },
        Items: true,
      },
      orderBy: { OrderDate: 'desc' },
    });

    return Orders.map((po) => ({
      ID: po.ID,
      poNumber: po.PurchaseOrderNumber,
      SupplierId: po.SupplierID,
      SupplierName: po.Supplier?.Name,
      WarehouseId: po.WarehouseID,
      WarehouseName: po.Warehouse?.Name,
      OrderDate: po.OrderDate,
      expectedDate: po.ExpectedDate,
      Status: po.Status,
      TotalAmount: number(po.TotalAmount),
      downPayment: number(po.DownPayment),
      remainingAmount: number(po.RemainingAmount),
      PaymentStatus: po.PaymentStatus,
      itemCount: po.Items.length,
      createdAt: po.CreatedAt,
    }));
  }

  /**
   * Approve PO
   */
  async approvePurchaseOrder(ID: number, UserId: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { ID: ID },
    });

    if (!po) {
      throw new NotFoundException(`PO ${ID} not found`);
    }

    if (po.Status !== 'PENDING') {
      throw new BadRequestException('Only pending Orders can be approved');
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { ID: ID },
      data: {
        Status: 'APPROVED',
        ApprovedBy: UserId,
      },
    });

    return {
      success: true,
      poNumber: updated.PurchaseOrderNumber,
      Status: updated.Status,
      message: 'Purchase Order approved',
    };
  }

  /**
   * Cancel PO
   */
  async cancelPurchaseOrder(ID: number, UserId: string, reason?: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { ID: ID },
    });

    if (!po) {
      throw new NotFoundException(`PO ${ID} not found`);
    }

    if (po.Status === 'RECEIVED' || po.Status === 'CANCELLED') {
      throw new BadRequestException('Cannot cancel received or already cancelled Orders');
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { ID: ID },
      data: {
        Status: 'CANCELLED',
        Notes: reason ? `${po.Notes || ''}\nCancelled: ${reason}` : po.Notes,
      },
    });

    return {
      success: true,
      poNumber: updated.PurchaseOrderNumber,
      Status: updated.Status,
      message: 'Purchase Order cancelled',
    };
  }

  /**
   * Record partial delivery
   */
  async RecordDelivery(ID: number, deliveredItems: { itemId: number; Quantity: number }[], UserId: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { ID: ID },
      include: { Items: true },
    });

    if (!po) {
      throw new NotFoundException(`PO ${ID} not found`);
    }

    if (po.Status === 'CANCELLED') {
      throw new BadRequestException('Cannot deliver to cancelled Order');
    }

    // UpDate items with delivered Quantity
    await this.prisma.$transaction(async (tx) => {
      for (const delivery of deliveredItems) {
        await tx.purchaseOrderItem.update({
          where: { ID: delivery.itemId },
          data: {
            ReceivedQuantity: new Prisma.Decimal(delivery.Quantity),
          },
        });
      }
    });

    // Check if fully received
    const allReceived = po.Items.every((item) => {
      const delivery = deliveredItems.find((d) => d.itemId === item.ID);
      return delivery && delivery.Quantity >= Number(item.Quantity);
    });

    if (allReceived) {
      await this.prisma.purchaseOrder.update({
        where: { ID: ID },
        data: { Status: 'RECEIVED' },
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

  private async generatePONumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `PO-${year}${month}`;

    const lastPO = await this.prisma.purchaseOrder.findFirst({
      where: { PurchaseOrderNumber: { startsWith: prefix } },
      orderBy: { PurchaseOrderNumber: 'desc' },
      select: { PurchaseOrderNumber: true },
    });

    let nextNumber = 1;
    if (lastPO) {
      const lastSeq = parseInt(lastPO.PurchaseOrderNumber.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
