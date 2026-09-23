import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  PurchaseOrderFilterDto,
  CreatePurchaseDto,
  PurchaseFilterDto,
  RecordPurchasePaymentDto,
  RecordBulkPurchasePaymentDto,
  CreatePurchaseReturnDto,
  AddSupplierDepositDto,
} from './Purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PURCHASE ORDER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new Purchase Order
   * Flow: Buyer buat PO → kirim ke Supplier → barang还没到
   */
  async createPurchaseOrder(dto: CreatePurchaseOrderDto, UserId: string) {
    // Validate Supplier
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: dto.SupplierId },
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // generate PO Code
    const Code = await this.generatePOCode();

    // Calculate Totals
    let subTotal = 0;
    for (const item of dto.Items) {
      const Product = await this.prisma.product.findUnique({
        where: { ID: item.ProductId },
      });

      if (!Product) {
        throw new NotFoundException(`Product ${item.ProductId} not found`);
      }

      const itemPrice = item.UnitPrice || Number(Product.PurchasePrice);
      const itemDiscount = item.DiscountPercent || 0;
      const itemSubTotal = itemPrice * item.Quantity * (1 - itemDiscount / 100);
      subTotal += itemSubTotal;
    }

    const discountAmount = dto.DiscountPercent ? subTotal * (dto.DiscountPercent / 100) : 0;
    const afterDiscount = subTotal - discountAmount;
    const taxAmount = dto.TaxPercent ? afterDiscount * (dto.TaxPercent / 100) : 0;
    const Total = afterDiscount + taxAmount;

    // Get initial Status
    const pendingStatus = await this.prisma.transactionStatus.findFirst({
      where: { Code: 'PENDING' },
    });

    const pendingStatusId = pendingStatus?.ID || 1;

    // Get Payment Status
    const PaymentStatus = await this.prisma.paymentStatus.findFirst({
      where: { Code: 'PENDING' },
    });

    const PaymentStatusId = PaymentStatus?.ID || 1;

    const PurchaseOrder = await this.prisma.purchaseOrder.create({
      data: {
        Code: Code,
        Date: dto.Date ? new Date(dto.Date) : new Date(),
        SupplierID: dto.SupplierId,
        WarehouseID: dto.WarehouseId || null,
        Subtotal: new Prisma.Decimal(subTotal),
        DiscountPercent: new Prisma.Decimal(dto.DiscountPercent || 0),
        DiscountAmount: new Prisma.Decimal(discountAmount),
        TaxPercent: new Prisma.Decimal(dto.TaxPercent || 0),
        TaxAmount: new Prisma.Decimal(taxAmount),
        Total: new Prisma.Decimal(Total),
        DownPayment: new Prisma.Decimal(dto.DownPayment || 0),
        DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
        PaymentStatusID: PaymentStatusId,
        StatusID: pendingStatusId,
        Notes: dto.Notes,
        CreatedByID: UserId,
        PurchaseOrderItems: {
          create: await Promise.all(
            dto.Items.map(async (item) => {
              const Product = await this.prisma.product.findUnique({
                where: { ID: item.ProductId },
                include: { Unit: true },
              });

              const UnitPrice = item.UnitPrice || Number(Product?.PurchasePrice || 0);
              const itemDiscount = item.DiscountPercent || 0;
              const itemSubTotal = UnitPrice * item.Quantity * (1 - itemDiscount / 100);

              return {
                ProductID: item.ProductId,
                Quantity: new Prisma.Decimal(item.Quantity),
                UnitID: item.UnitId,
                UnitPrice: new Prisma.Decimal(UnitPrice),
                DiscountPercent: new Prisma.Decimal(itemDiscount),
                DiscountAmount: new Prisma.Decimal(0),
                Subtotal: new Prisma.Decimal(itemSubTotal),
              };
            }),
          ),
        },
      },
      include: {
        Supplier: true,
        Warehouse: true,
        PurchaseOrderItems: {
          include: { Product: true, Unit: true },
        },
      },
    });

    return {
      success: true,
      PurchaseOrder: {
        ID: PurchaseOrder.ID,
        Code: PurchaseOrder.Code,
        Date: PurchaseOrder.Date,
        Supplier: PurchaseOrder.Supplier.Name,
        Warehouse: PurchaseOrder.Warehouse?.Name || null,
        itemCount: PurchaseOrder.PurchaseOrderItems.length,
        subTotal,
        discountAmount,
        taxAmount,
        Total,
        Status: pendingStatus?.Name || 'Pending',
        items: PurchaseOrder.PurchaseOrderItems.map((item) => ({
          ProductId: item.ProductID,
          ProductName: item.Product.Name,
          Quantity: number(item.Quantity),
          Unit: item.Unit.Name,
          UnitPrice: number(item.UnitPrice),
          subTotal: number(item.Subtotal),
        })),
      },
    };
  }

  /**
   * Get Purchase Order by ID
   */
  async getPurchaseOrder(PurchaseOrderId: number) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { ID: PurchaseOrderId },
      include: {
        Supplier: true,
        Warehouse: true,
        Status: true,
        PurchaseOrderItems: {
          include: { Product: true, Unit: true },
        },
      },
    });

    if (!po) {
      throw new NotFoundException('Purchase Order not found');
    }

    return {
      ID: po.ID,
      Code: po.Code,
      Date: po.Date,
      Supplier: po.Supplier,
      Warehouse: po.Warehouse,
      subTotal: number(po.Subtotal),
      discountPercent: number(po.DiscountPercent),
      discountAmount: number(po.DiscountAmount),
      taxPercent: number(po.TaxPercent),
      taxAmount: number(po.TaxAmount),
      Total: number(po.Total),
      downPayment: number(po.DownPayment),
      dueDate: po.DueDate,
      Status: po.Status,
      Notes: po.Notes,
      items: po.PurchaseOrderItems.map((item) => ({
        ID: item.ID,
        ProductId: item.ProductID,
        ProductName: item.Product.Name,
        ProductCode: item.Product.Code,
        Quantity: number(item.Quantity),
        UnitId: item.UnitID,
        Unit: item.Unit.Name,
        UnitPrice: number(item.UnitPrice),
        discountPercent: number(item.DiscountPercent),
        subTotal: number(item.Subtotal),
      })),
    };
  }

  /**
   * List Purchase Orders with filters
   */
  async listPurchaseOrders(dto: PurchaseOrderFilterDto) {
    const where: any = {};

    if (dto.SupplierId) {
      where.SupplierID = dto.SupplierId;
    }

    if (dto.WarehouseId) {
      where.WarehouseID = dto.WarehouseId;
    }

    if (dto.StatusId) {
      where.StatusID = dto.StatusId;
    }

    if (dto.PendingOnly) {
      where.Status = { IsTerminal: false };
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
        Supplier: true,
        Warehouse: true,
        Status: true,
        PurchaseOrderItems: true,
      },
      orderBy: { Date: 'desc' },
    });

    return Orders.map((po) => ({
      ID: po.ID,
      Code: po.Code,
      Date: po.Date,
      Supplier: po.Supplier.Name,
      Warehouse: po.Warehouse?.Name || null,
      itemCount: po.PurchaseOrderItems.length,
      subTotal: number(po.Subtotal),
      Total: number(po.Total),
      downPayment: number(po.DownPayment),
      Status: po.Status.Name,
      StatusColor: po.Status.Color,
    }));
  }

  /**
   * UpDate Purchase Order
   */
  async updatePurchaseOrder(PurchaseOrderId: number, dto: UpdatePurchaseOrderDto, UserId: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { ID: PurchaseOrderId },
      include: { Status: true },
    });

    if (!po) {
      throw new NotFoundException('Purchase Order not found');
    }

    if (po.Status.IsTerminal) {
      throw new BadRequestException('Cannot update terminal Purchase Order');
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { ID: PurchaseOrderId },
      data: {
        DueDate: dto.DueDate ? new Date(dto.DueDate) : undefined,
        DownPayment: dto.DownPayment ? new Prisma.Decimal(dto.DownPayment) : undefined,
        DiscountPercent: dto.DiscountPercent ? new Prisma.Decimal(dto.DiscountPercent) : undefined,
        Notes: dto.Notes,
      },
    });

    return {
      success: true,
      PurchaseOrder: {
        ID: updated.ID,
        Code: updated.Code,
        dueDate: updated.DueDate,
        downPayment: number(updated.DownPayment),
      },
    };
  }

  /**
   * Approve/Cancel Purchase Order
   */
  async updatePurchaseOrderStatus(PurchaseOrderId: number, StatusCode: string, UserId: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { ID: PurchaseOrderId },
    });

    if (!po) {
      throw new NotFoundException('Purchase Order not found');
    }

    const newStatus = await this.prisma.transactionStatus.findFirst({
      where: { Code: StatusCode },
    });

    if (!newStatus) {
      throw new NotFoundException(`Status '${StatusCode}' not found`);
    }

    await this.prisma.purchaseOrder.update({
      where: { ID: PurchaseOrderId },
      data: { StatusID: newStatus.ID },
    });

    return {
      success: true,
      PurchaseOrderId,
      newStatus: newStatus.Name,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PURCHASE (PENERIMAAN BARANG) MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Purchase (Goods Receipt)
   * Flow: Barang datang dari Supplier → Buyer terima barang → update stok
   */
  async createPurchase(dto: CreatePurchaseDto, UserId: string) {
    // Validate Supplier
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: dto.SupplierId },
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // generate Purchase Code
    const Code = await this.generatePurchaseCode();

    // Calculate Totals
    let subTotal = 0;
    for (const item of dto.Items) {
      const itemDiscount = item.DiscountPercent || 0;
      const itemSubTotal = item.UnitPrice * item.Quantity * (1 - itemDiscount / 100);
      subTotal += itemSubTotal;
    }

    const discountAmount = dto.DiscountPercent ? subTotal * (dto.DiscountPercent / 100) : 0;
    const afterDiscount = subTotal - discountAmount;
    const taxAmount = dto.TaxPercent ? afterDiscount * (dto.TaxPercent / 100) : 0;
    const Total = afterDiscount + taxAmount;

    // Determine Payment Status
    let PaymentStatusId = 1;
    let paid = 0;
    let remaining = Total;

    if (dto.PaymentAmount) {
      paid = Math.min(dto.PaymentAmount, Total);
      remaining = Total - paid;
      if (remaining <= 0) {
        const paidStatus = await this.prisma.paymentStatus.findFirst({ where: { Code: 'PAID' } });
        PaymentStatusId = paidStatus?.ID || 2;
      } else {
        const partialStatus = await this.prisma.paymentStatus.findFirst({ where: { Code: 'PARTIAL' } });
        PaymentStatusId = partialStatus?.ID || 3;
      }
    }

    // Get completed Status
    const completedStatus = await this.prisma.transactionStatus.findFirst({
      where: { Code: 'COMPLETED' },
    });

    // Execute Purchase
    const Purchase = await this.prisma.$transaction(async (tx) => {
      const newPurchase = await tx.purchase.create({
        data: {
          Code: Code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          SupplierID: dto.SupplierId,
          WarehouseID: dto.WarehouseId || null,
          Subtotal: new Prisma.Decimal(subTotal),
          DiscountPercent: new Prisma.Decimal(dto.DiscountPercent || 0),
          DiscountAmount: new Prisma.Decimal(discountAmount),
          TaxPercent: new Prisma.Decimal(dto.TaxPercent || 0),
          TaxAmount: new Prisma.Decimal(taxAmount),
          Total: new Prisma.Decimal(Total),
          Paid: new Prisma.Decimal(paid),
          Remaining: new Prisma.Decimal(remaining),
          PaymentStatusID: PaymentStatusId,
          PaymentMethodID: dto.PaymentMethodId || null,
          DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
          PurchaseOrderID: dto.PurchaseOrderId || null,
          StatusID: completedStatus?.ID || 2,
          Notes: dto.Notes,
          CreatedByID: UserId,
          PurchaseItems: {
            create: dto.Items.map((item) => ({
              ProductID: item.ProductId,
              Quantity: new Prisma.Decimal(item.Quantity),
              UnitID: item.UnitId,
              UnitPrice: new Prisma.Decimal(item.UnitPrice),
              DiscountPercent: new Prisma.Decimal(item.DiscountPercent || 0),
              DiscountAmount: new Prisma.Decimal(0),
              Subtotal: new Prisma.Decimal(
                item.UnitPrice * item.Quantity * (1 - (item.DiscountPercent || 0) / 100),
              ),
            })),
          },
        },
        include: {
          Supplier: true,
          Warehouse: true,
          PurchaseItems: { include: { Product: true, Unit: true } },
        },
      });

      // UpDate Stock
      for (const item of dto.Items) {
        // UpDate main Product Stock
        await tx.product.update({
          where: { ID: item.ProductId },
          data: { Stock: { increment: new Prisma.Decimal(item.Quantity) } },
        });

        // UpDate Warehouse Stock if applicable
        if (dto.WarehouseId) {
          await tx.productStock.upsert({
            where: {
              ProductID_WarehouseID: {
                ProductID: item.ProductId,
                WarehouseID: dto.WarehouseId,
              },
            },
            create: {
              ProductID: item.ProductId,
              WarehouseID: dto.WarehouseId,
              Quantity: new Prisma.Decimal(item.Quantity),
            },
            update: {
              Quantity: { increment: new Prisma.Decimal(item.Quantity) },
            },
          });
        }
      }

      // Record Payment if provided
      if (dto.PaymentAmount && dto.PaymentAmount > 0) {
        await tx.purchasePayment.create({
          data: {
            PurchaseID: newPurchase.ID,
            MethodID: dto.PaymentMethodId || 1,
            Amount: new Prisma.Decimal(paid),
            ReferenceNumber: null,
            Notes: dto.Notes,
            CreatedByID: UserId,
          },
        });
      }

      // UpDate Supplier debt
      if (remaining > 0) {
        await tx.supplier.update({
          where: { ID: dto.SupplierId },
          data: { TotalDebt: { increment: new Prisma.Decimal(remaining) } },
        });
      }

      return newPurchase;
    });

    return {
      success: true,
      Purchase: {
        ID: Purchase.ID,
        Code: Purchase.Code,
        Date: Purchase.Date,
        Supplier: Purchase.Supplier.Name,
        Warehouse: Purchase.Warehouse?.Name || null,
        itemCount: Purchase.PurchaseItems.length,
        subTotal,
        discountAmount,
        taxAmount,
        Total,
        paid,
        remaining,
        PaymentStatus: PaymentStatusId === 2 ? 'PAID' : PaymentStatusId === 3 ? 'PARTIAL' : 'PENDING',
        items: Purchase.PurchaseItems.map((item) => ({
          ProductId: item.ProductID,
          ProductName: item.Product.Name,
          Quantity: number(item.Quantity),
          Unit: item.Unit.Name,
          UnitPrice: number(item.UnitPrice),
          subTotal: number(item.Subtotal),
        })),
      },
    };
  }

  /**
   * Get Purchase by ID
   */
  async getPurchase(PurchaseId: number) {
    const Purchase = await this.prisma.purchase.findUnique({
      where: { ID: PurchaseId },
      include: {
        Supplier: true,
        Warehouse: true,
        PaymentStatus: true,
        Status: true,
        PurchaseItems: { include: { Product: true, Unit: true } },
        PurchasePayments: { include: { Method: true } },
      },
    });

    if (!Purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return {
      ID: Purchase.ID,
      Code: Purchase.Code,
      Date: Purchase.Date,
      Supplier: Purchase.Supplier,
      Warehouse: Purchase.Warehouse,
      subTotal: number(Purchase.Subtotal),
      discountPercent: number(Purchase.DiscountPercent),
      discountAmount: number(Purchase.DiscountAmount),
      taxPercent: number(Purchase.TaxPercent),
      taxAmount: number(Purchase.TaxAmount),
      Total: number(Purchase.Total),
      Paid: number(Purchase.Paid),
      remaining: number(Purchase.Remaining),
      dueDate: Purchase.DueDate,
      PaymentStatus: Purchase.PaymentStatus,
      Status: Purchase.Status,
      Notes: Purchase.Notes,
      items: Purchase.PurchaseItems.map((item) => ({
        ID: item.ID,
        ProductId: item.ProductID,
        ProductName: item.Product.Name,
        ProductCode: item.Product.Code,
        Quantity: number(item.Quantity),
        UnitId: item.UnitID,
        Unit: item.Unit.Name,
        UnitPrice: number(item.UnitPrice),
        subTotal: number(item.Subtotal),
      })),
      Payments: Purchase.PurchasePayments.map((p) => ({
        ID: p.ID,
        Amount: number(p.Amount),
        Method: p.Method.Name,
        Date: p.CreatedAt,
        referenceNumber: p.ReferenceNumber,
      })),
    };
  }

  /**
   * List Purchases with filters
   */
  async listPurchases(dto: PurchaseFilterDto) {
    const where: any = {};

    if (dto.SupplierId) {
      where.SupplierID = dto.SupplierId;
    }

    if (dto.WarehouseId) {
      where.WarehouseID = dto.WarehouseId;
    }

    if (dto.PaymentStatus) {
      where.PaymentStatus = { Code: dto.PaymentStatus };
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

    const Purchases = await this.prisma.purchase.findMany({
      where,
      include: {
        Supplier: true,
        Warehouse: true,
        PaymentStatus: true,
        Status: true,
        PurchaseItems: true,
      },
      orderBy: { Date: 'desc' },
    });

    return Purchases.map((p) => ({
      ID: p.ID,
      Code: p.Code,
      Date: p.Date,
      Supplier: p.Supplier.Name,
      Warehouse: p.Warehouse?.Name || null,
      itemCount: p.PurchaseItems.length,
      Total: number(p.Total),
      Paid: number(p.Paid),
      remaining: number(p.Remaining),
      PaymentStatus: p.PaymentStatus.Name,
      PaymentStatusColor: p.PaymentStatus.Color,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PURCHASE PAYMENT MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Record Payment for Purchase (pelunasan hutang Supplier)
   * Flow: Owner bayar hutang Supplier → sistem catat pembayaran
   */
  async RecordPurchasePayment(PurchaseId: number, dto: RecordPurchasePaymentDto, UserId: string) {
    const Purchase = await this.prisma.purchase.findUnique({
      where: { ID: PurchaseId },
      include: { Supplier: true, PurchasePayments: true },
    });

    if (!Purchase) {
      throw new NotFoundException('Purchase not found');
    }

    const currentPaid = Purchase.PurchasePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
    const remainingAmount = Number(Purchase.Total) - currentPaid;

    if (dto.Amount > remainingAmount) {
      throw new BadRequestException(
        `Payment exceeds remaining Amount. Remaining: ${remainingAmount}`,
      );
    }

    const Result = await this.prisma.$transaction(async (tx) => {
      // Create Payment Record
      await tx.purchasePayment.create({
        data: {
          PurchaseID: PurchaseId,
          MethodID: dto.PaymentMethodId,
          Amount: new Prisma.Decimal(dto.Amount),
          ReferenceNumber: dto.ReferenceNumber,
          Date: dto.PaymentDate ? new Date(dto.PaymentDate) : new Date(),
          Notes: dto.Notes,
          CreatedByID: UserId,
        },
      });

      // Calculate new Totals
      const newPaid = currentPaid + dto.Amount;
      const newRemaining = Number(Purchase.Total) - newPaid;

      // UpDate Payment Status
      let newStatusId = Purchase.PaymentStatusID;
      if (newPaid >= Number(Purchase.Total)) {
        const paidStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PAID' } });
        if (paidStatus) newStatusId = paidStatus.ID;
      } else if (newPaid > 0) {
        const partialStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PARTIAL' } });
        if (partialStatus) newStatusId = partialStatus.ID;
      }

      await tx.purchase.update({
        where: { ID: PurchaseId },
        data: {
          Paid: new Prisma.Decimal(newPaid),
          Remaining: new Prisma.Decimal(newRemaining),
          PaymentStatusID: newStatusId,
        },
      });

      // UpDate Supplier debt
      if (newRemaining <= 0) {
        await tx.supplier.update({
          where: { ID: Purchase.SupplierID },
          data: { TotalDebt: { decrement: new Prisma.Decimal(dto.Amount) } },
        });
      }

      return { newPaid, newRemaining, newStatusId };
    });

    return {
      success: true,
      PurchaseId,
      PurchaseCode: Purchase.Code,
      previousPaid: currentPaid,
      PaymentAmount: dto.Amount,
      newPaid: Result.newPaid,
      remainingAmount: Result.newRemaining,
      Status: Result.newStatusId === 2 ? 'PAID' : 'PARTIAL',
    };
  }

  /**
   * Record bulk Payment for multiple Purchases
   * Flow: Owner bayar beberapa invoice Supplier sekaligus
   */
  async RecordBulkPurchasePayment(dto: RecordBulkPurchasePaymentDto, UserId: string) {
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: dto.SupplierId },
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Get Purchases to be paid
    const Purchases = await this.prisma.purchase.findMany({
      where: { ID: { in: dto.PurchaseIds }, SupplierID: dto.SupplierId },
      include: { PurchasePayments: true },
    });

    if (Purchases.length !== dto.PurchaseIds.length) {
      throw new NotFoundException('Some Purchases not found or do not belong to this Supplier');
    }

    // Calculate Total remaining
    const PurchasesWithRemaining = Purchases.map((Purchase) => {
      const paid = Purchase.PurchasePayments.reduce((sum, p) => sum + Number(p.Amount), 0);
      const remaining = Number(Purchase.Total) - paid;
      return { ...Purchase, remaining };
    });

    const TotalRemaining = PurchasesWithRemaining.reduce((sum, s) => sum + s.remaining, 0);

    if (dto.Amount > TotalRemaining) {
      throw new BadRequestException(
        `Payment exceeds Total remaining Amount. Total remaining: ${TotalRemaining}`,
      );
    }

    // Distribute Payment (FIFO - oldest first)
    const Result = await this.prisma.$transaction(async (tx) => {
      let remainingPayment = dto.Amount;
      const PaymentResults: Array<{ PurchaseId: number; PurchaseCode: string; Paid: number; remaining: number }> = [];

      for (const Purchase of PurchasesWithRemaining.sort(
        (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime(),
      )) {
        if (remainingPayment <= 0) break;

        const PaymentForThisPurchase = Math.min(remainingPayment, Purchase.remaining);

        await tx.purchasePayment.create({
          data: {
            PurchaseID: Purchase.ID,
            MethodID: dto.PaymentMethodId,
            Amount: new Prisma.Decimal(PaymentForThisPurchase),
            ReferenceNumber: dto.ReferenceNumber,
            Notes: `Bulk Payment: ${dto.Notes || 'Multiple invoices'}`,
            CreatedByID: UserId,
          },
        });

        // UpDate Purchase Totals and Status
        const newPaid = Purchase.PurchasePayments.reduce((sum, p) => sum + Number(p.Amount), 0) + PaymentForThisPurchase;
        const newRemaining = Purchase.remaining - PaymentForThisPurchase;

        let newStatusId = Purchase.PaymentStatusID;
        if (newRemaining <= 0) {
          const paidStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PAID' } });
          if (paidStatus) newStatusId = paidStatus.ID;
        } else {
          const partialStatus = await tx.paymentStatus.findFirst({ where: { Code: 'PARTIAL' } });
          if (partialStatus) newStatusId = partialStatus.ID;
        }

        await tx.purchase.update({
          where: { ID: Purchase.ID },
          data: {
            Paid: new Prisma.Decimal(newPaid),
            Remaining: new Prisma.Decimal(newRemaining),
            PaymentStatusID: newStatusId,
          },
        });

        PaymentResults.push({
          PurchaseId: Purchase.ID,
          PurchaseCode: Purchase.Code,
          Paid: PaymentForThisPurchase,
          remaining: newRemaining,
        });

        remainingPayment -= PaymentForThisPurchase;
      }

      // UpDate Supplier debt
      if (dto.Amount > remainingPayment) {
        const AmountApplied = dto.Amount - remainingPayment;
        await tx.supplier.update({
          where: { ID: dto.SupplierId },
          data: { TotalDebt: { decrement: new Prisma.Decimal(AmountApplied) } },
        });
      }

      return PaymentResults;
    });

    return {
      success: true,
      SupplierId: dto.SupplierId,
      SupplierName: Supplier.Name,
      TotalPayment: dto.Amount,
      Payments: Result,
      TotalApplied: Result.reduce((sum, p) => sum + p.Paid, 0),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PURCHASE RETURN MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Purchase Return (Retur Barang)
   * Flow: Barang rusak/salah → retur ke Supplier → dapat refund
   */
  async createPurchaseReturn(dto: CreatePurchaseReturnDto, UserId: string) {
    const Purchase = await this.prisma.purchase.findUnique({
      where: { ID: dto.PurchaseId },
      include: { PurchaseItems: true, Supplier: true },
    });

    if (!Purchase) {
      throw new NotFoundException('Purchase not found');
    }

    // Validate return items against Purchase
    for (const returnItem of dto.Items) {
      const PurchaseItem = Purchase.PurchaseItems.find((pi) => pi.ProductID === returnItem.ProductId);
      if (!PurchaseItem) {
        throw new BadRequestException(`Product ${returnItem.ProductId} not in original Purchase`);
      }

      const originalQty = Number(PurchaseItem.Quantity);
      if (returnItem.Quantity > originalQty) {
        throw new BadRequestException(
          `Return Quantity for Product ${returnItem.ProductId} exceeds original Quantity`,
        );
      }
    }

    // Calculate return Total
    let TotalReturn = 0;
    for (const item of dto.Items) {
      const UnitPrice = item.UnitPrice || Number(
        Purchase.PurchaseItems.find((pi) => pi.ProductID === item.ProductId)?.UnitPrice || 0,
      );
      TotalReturn += UnitPrice * item.Quantity;
    }

    // generate return Code
    const Code = await this.generateReturnCode();

    // Get pending Status
    const pendingStatus = await this.prisma.transactionStatus.findFirst({
      where: { Code: 'PENDING' },
    });

    const PurchaseReturn = await this.prisma.$transaction(async (tx) => {
      const newReturn = await tx.purchaseReturn.create({
        data: {
          Code: Code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          PurchaseID: dto.PurchaseId,
          SupplierID: Purchase.SupplierID,
          WarehouseID: dto.WarehouseId || null,
          TotalReturn: new Prisma.Decimal(TotalReturn),
          Reason: dto.Reason,
          StatusID: pendingStatus?.ID || 1,
          CreatedByID: UserId,
          ReturnItems: {
            create: dto.Items.map((item) => {
              const PurchaseItem = Purchase.PurchaseItems.find((pi) => pi.ProductID === item.ProductId);
              return {
                ProductID: item.ProductId,
                Quantity: new Prisma.Decimal(item.Quantity),
                UnitID: item.UnitId,
                UnitPrice: new Prisma.Decimal(item.UnitPrice || Number(PurchaseItem?.UnitPrice || 0)),
                Subtotal: new Prisma.Decimal(
                  (item.UnitPrice || Number(PurchaseItem?.UnitPrice || 0)) * item.Quantity,
                ),
              };
            }),
          },
        },
        include: {
          Supplier: true,
          ReturnItems: { include: { Product: true, Unit: true } },
        },
      });

      // Decrease Stock
      for (const item of dto.Items) {
        await tx.product.update({
          where: { ID: item.ProductId },
          data: { Stock: { decrement: new Prisma.Decimal(item.Quantity) } },
        });

        if (dto.WarehouseId) {
          await tx.productStock.update({
            where: {
              ProductID_WarehouseID: {
                ProductID: item.ProductId,
                WarehouseID: dto.WarehouseId,
              },
            },
            data: { Quantity: { decrement: new Prisma.Decimal(item.Quantity) } },
          });
        }
      }

      return newReturn;
    });

    return {
      success: true,
      PurchaseReturn: {
        ID: PurchaseReturn.ID,
        Code: PurchaseReturn.Code,
        Date: PurchaseReturn.Date,
        Supplier: PurchaseReturn.Supplier.Name,
        reason: PurchaseReturn.Reason,
        TotalReturn,
        Status: pendingStatus?.Name || 'Pending',
        items: PurchaseReturn.ReturnItems.map((item) => ({
          ProductId: item.ProductID,
          ProductName: item.Product.Name,
          Quantity: number(item.Quantity),
          Unit: item.Unit?.Name,
          UnitPrice: number(item.UnitPrice),
          subTotal: number(item.Subtotal),
        })),
      },
    };
  }

  /**
   * Approve Purchase Return
   */
  async approvePurchaseReturn(returnId: number, UserId: string) {
    const PurchaseReturn = await this.prisma.purchaseReturn.findUnique({
      where: { ID: returnId },
      include: { Supplier: true },
    });

    if (!PurchaseReturn) {
      throw new NotFoundException('Purchase return not found');
    }

    const completedStatus = await this.prisma.transactionStatus.findFirst({
      where: { Code: 'COMPLETED' },
    });

    await this.prisma.$transaction(async (tx) => {
      // UpDate Status
      await tx.purchaseReturn.update({
        where: { ID: returnId },
        data: { StatusID: completedStatus?.ID || 2 },
      });

      // Reduce Supplier debt
      await tx.supplier.update({
        where: { ID: PurchaseReturn.SupplierID },
        data: { TotalDebt: { decrement: new Prisma.Decimal(PurchaseReturn.TotalReturn) } },
      });
    });

    return {
      success: true,
      PurchaseReturnId: returnId,
      Code: PurchaseReturn.Code,
      TotalReturn: number(PurchaseReturn.TotalReturn),
      Status: 'COMPLETED',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUPPLIER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get Supplier debt Summary
   * Flow: Owner ingin lihat Total hutang ke Supplier
   */
  async getSupplierDebtSummary(SupplierId: number) {
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: SupplierId },
      include: {
        Purchases: {
          include: { PaymentStatus: true },
        },
      },
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const unpaidPurchases = Supplier.Purchases.filter(
      (p) => p.PaymentStatus.Code !== 'PAID',
    );

    const TotalDebt = unpaidPurchases.reduce((sum, p) => sum + Number(p.Remaining), 0);
    const PurchaseCount = unpaidPurchases.length;

    return {
      SupplierId,
      SupplierName: Supplier.Name,
      SupplierCode: Supplier.Code,
      TotalDebt,
      PurchaseCount,
      unpaidPurchases: unpaidPurchases.map((p) => ({
        ID: p.ID,
        Code: p.Code,
        Date: p.Date,
        Total: number(p.Total),
        Paid: number(p.Paid),
        remaining: number(p.Remaining),
        dueDate: p.DueDate,
        Status: p.PaymentStatus.Name,
      })),
    };
  }

  /**
   * Add Supplier Deposit (uang muka ke Supplier)
   * Flow: Owner bayar uang muka ke Supplier
   */
  async addSupplierDeposit(SupplierId: number, dto: AddSupplierDepositDto, UserId: string) {
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: SupplierId },
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const Code = await this.generateSupplierDepositCode();

    const Deposit = await this.prisma.$transaction(async (tx) => {
      const newDeposit = await tx.supplierDeposit.create({
        data: {
          Code: Code,
          Date: new Date(),
          SupplierID: SupplierId,
          Amount: new Prisma.Decimal(dto.Amount),
          RemainingAmount: new Prisma.Decimal(dto.Amount),
          Description: dto.Notes,
          CreatedByID: UserId,
        },
      });

      // Reduce Supplier debt (Deposit can be used for future Purchases)
      // Or increase if debt tracking is different

      return newDeposit;
    });

    return {
      success: true,
      Deposit: {
        ID: Deposit.ID,
        Code: Deposit.Code,
        Amount: number(Deposit.Amount),
        remainingAmount: number(Deposit.RemainingAmount),
        Date: Deposit.Date,
      },
    };
  }

  /**
   * Use Supplier Deposit for Purchase Payment
   */
  async useSupplierDeposit(SupplierId: number, PurchaseId: number, Amount: number, UserId: string) {
    const Supplier = await this.prisma.supplier.findUnique({
      where: { ID: SupplierId },
      include: {
        SupplierDeposits: {
          where: { RemainingAmount: { gt: 0 } },
          orderBy: { Date: 'asc' },
        },
      },
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const TotalAvailable = Supplier.SupplierDeposits.reduce(
      (sum, d) => sum + Number(d.RemainingAmount),
      0,
    );

    if (Amount > TotalAvailable) {
      throw new BadRequestException(
        `Insufficient Deposit. Available: ${TotalAvailable}, Requested: ${Amount}`,
      );
    }

    const Result = await this.prisma.$transaction(async (tx) => {
      let remainingAmount = Amount;
      const usedDeposits: Array<{ DepositId: number; DepositCode: string; used: number }> = [];

      for (const Deposit of Supplier.SupplierDeposits) {
        if (remainingAmount <= 0) break;

        const usedFromThis = Math.min(remainingAmount, Number(Deposit.RemainingAmount));

        await tx.supplierDeposit.update({
          where: { ID: Deposit.ID },
          data: { RemainingAmount: { decrement: new Prisma.Decimal(usedFromThis) } },
        });

        usedDeposits.push({
          DepositId: Deposit.ID,
          DepositCode: Deposit.Code,
          used: usedFromThis,
        });

        remainingAmount -= usedFromThis;
      }

      // Record as Purchase Payment
      await tx.purchasePayment.create({
        data: {
          PurchaseID: PurchaseId,
          MethodID: 1, // Default Cash
          Amount: new Prisma.Decimal(Amount),
          ReferenceNumber: `SUP-DEP-${Supplier.Code}`,
          Notes: 'Payment from Supplier Deposit',
          CreatedByID: UserId,
        },
      });

      return usedDeposits;
    });

    return {
      success: true,
      SupplierId,
      PurchaseId,
      TotalUsed: Amount,
      Deposits: Result,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generatePOCode(): Promise<string> {
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

  private async generatePurchaseCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `BELI-${year}${month}`;

    const lastPurchase = await this.prisma.purchase.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastPurchase) {
      const lastSeq = parseInt(lastPurchase.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private async generateReturnCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `RET-BELI-${year}${month}`;

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

  private async generateSupplierDepositCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SUP-DEP-${year}${month}`;

    const lastDeposit = await this.prisma.supplierDeposit.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastDeposit) {
      const lastSeq = parseInt(lastDeposit.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
