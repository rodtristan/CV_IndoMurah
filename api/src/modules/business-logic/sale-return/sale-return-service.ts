import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateSaleReturnDto,
  SaleReturnFilterDto,
  LookupSaleDto,
  GetSaleItemsDto,
  ApproveSaleReturnDto,
  RejectSaleReturnDto,
} from './sale-return.dto';

@Injectable()
export class SaleReturnService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // LOOKUP - Find Sale for Return
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Search/lookup Sales that are eligible for return
   * Flow: Kasir cari transaksi yang bisa diretur
   */
  async lookupSales(dto: LookupSaleDto) {
    const where: any = {
      IsReturn: false, // Only non-return Sales
    };

    if (dto.Search) {
      where.OR = [
        { Code: { contains: dto.Search, mode: 'insensitive' } },
        { Customer: { Name: { contains: dto.Search, mode: 'insensitive' } } },
      ];
    }

    if (dto.CustomerId) {
      where.CustomerID = dto.CustomerId;
    }

    if (dto.SalesPersonId) {
      where.SalesPersonID = dto.SalesPersonId;
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

    // Only show PAID or PARTIAL Sales (not pending)
    where.PaymentStatus = {
      Code: { in: ['PAID', 'PARTIAL'] },
    };

    const Sales = await this.prisma.sale.findMany({
      where,
      include: {
        Customer: true,
        SalesPerson: true,
        PaymentStatus: true,
        SaleItems: {
          include: {
            Product: { include: { Unit: true } },
            Unit: true,
          },
        },
      },
      orderBy: { Date: 'desc' },
      take: 50,
    });

    return Sales.map((Sale) => ({
      ID: Sale.ID,
      Code: Sale.Code,
      Date: Sale.Date,
      Customer: {
        ID: Sale.Customer.ID,
        Name: Sale.Customer.Name,
        Code: Sale.Customer.Code,
      },
      SalesPerson: Sale.SalesPerson ? {
        ID: Sale.SalesPerson.ID,
        Name: Sale.SalesPerson.Name,
      } : null,
      subTotal: number(Sale.SubTotal),
      discountAmount: number(Sale.DiscountAmount),
      taxAmount: number(Sale.TaxAmount),
      Total: number(Sale.Total),
      CashAmount: number(Sale.CashAmount),
      changeAmount: number(Sale.ChangeAmount),
      PaymentStatus: Sale.PaymentStatus.Name,
      itemCount: Sale.SaleItems.length,
      items: Sale.SaleItems.map((item) => ({
        ID: item.ID,
        ProductId: item.ProductID,
        ProductCode: item.Product.Code,
        ProductName: item.Product.Name,
        Unit: item.Unit?.Name || item.Product.Unit?.Name,
        Quantity: number(item.Quantity),
        UnitPrice: number(item.UnitPrice),
        subTotal: number(item.SubTotal),
        // Calculate max returnable Quantity
        maxReturnable: number(item.Quantity), // Will be reduced by existing returns
      })),
    }));
  }

  /**
   * Get Sale items for return selection
   * Flow: Pilih transaksi → tampilkan item yang bisa diretur
   */
  async getSaleItemsForReturn(SaleId: number) {
    const Sale = await this.prisma.sale.findUnique({
      where: { ID: SaleId },
      include: {
        Customer: true,
        SalesPerson: true,
        PaymentStatus: true,
        SaleItems: {
          include: {
            Product: { include: { Unit: true } },
            Unit: true,
          },
        },
        SaleReturns: {
          where: { IsReturn: false },
          include: {
            ReturnItems: true,
          },
        },
      },
    });

    if (!Sale) {
      throw new NotFoundException('Sale not found');
    }

    // Calculate already returned quantities
    const returnedQuantities: Record<number, number> = {};
    for (const returnDoc of Sale.SaleReturns) {
      for (const returnItem of returnDoc.ReturnItems) {
        if (!returnedQuantities[returnItem.ProductID]) {
          returnedQuantities[returnItem.ProductID] = 0;
        }
        returnedQuantities[returnItem.ProductID] += Number(returnItem.Quantity);
      }
    }

    return {
      Sale: {
        ID: Sale.ID,
        Code: Sale.Code,
        Date: Sale.Date,
        Customer: Sale.Customer,
        SalesPerson: Sale.SalesPerson,
        Total: number(Sale.Total),
        PaymentStatus: Sale.PaymentStatus,
      },
      items: Sale.SaleItems.map((item) => {
        const alreadyReturned = returnedQuantities[item.ProductID] || 0;
        const originalQty = Number(item.Quantity);
        const maxReturnable = Math.max(0, originalQty - alreadyReturned);

        return {
          SaleItemId: item.ID,
          ProductId: item.ProductID,
          ProductCode: item.Product.Code,
          ProductName: item.Product.Name,
          Unit: item.Unit?.Name || item.Product.Unit?.Name,
          originalQuantity: originalQty,
          alreadyReturned,
          maxReturnable,
          UnitPrice: number(item.UnitPrice),
          subTotal: number(item.SubTotal),
        };
      }),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SALE RETURN MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Sale return
   * Flow: Pelanggan retur barang → Kasir proses retur → Stock bertambah
   */
  async createSaleReturn(dto: CreateSaleReturnDto, UserId: string) {
    // Validate Sale
    const Sale = await this.prisma.sale.findUnique({
      where: { ID: dto.SaleId },
      include: {
        SaleItems: true,
        Customer: true,
      },
    });

    if (!Sale) {
      throw new NotFoundException('Sale not found');
    }

    if (Sale.IsReturn) {
      throw new BadRequestException('Cannot return a return transaction');
    }

    // Validate Customer matches
    if (Sale.CustomerID !== dto.CustomerId) {
      throw new BadRequestException('Customer does not match the original Sale');
    }

    // Validate and calculate return items
    let TotalReturn = 0;
    const validatedItems = [];

    for (const returnItem of dto.Items) {
      const SaleItem = Sale.SaleItems.find((si) => si.ProductID === returnItem.ProductId);

      if (!SaleItem) {
        throw new BadRequestException(
          `Product ${returnItem.ProductId} not found in original Sale`,
        );
      }

      const maxReturnable = Number(SaleItem.Quantity);
      if (returnItem.Quantity > maxReturnable) {
        throw new BadRequestException(
          `Return Quantity for Product ${returnItem.ProductId} exceeds sold Quantity`,
        );
      }

      const UnitPrice = returnItem.UnitPrice || Number(SaleItem.UnitPrice);
      const itemSubTotal = UnitPrice * returnItem.Quantity;
      TotalReturn += itemSubTotal;

      validatedItems.push({
        ProductId: returnItem.ProductId,
        SaleItemId: SaleItem.ID,
        Quantity: returnItem.Quantity,
        UnitId: returnItem.UnitId || SaleItem.UnitID || null,
        UnitPrice,
        subTotal: itemSubTotal,
        reason: returnItem.reason || dto.Reason,
      });
    }

    // generate return Code
    const Code = await this.generateReturnCode();

    // Get pending Status
    const pendingStatus = await this.prisma.transactionStatus.findFirst({
      where: { Code: 'PENDING' },
    });

    // Create return with pending Status
    const SaleReturn = await this.prisma.$transaction(async (tx) => {
      const newReturn = await tx.saleReturn.create({
        data: {
          Code: Code,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          SaleID: dto.SaleId,
          CustomerID: dto.CustomerId,
          WarehouseID: dto.WarehouseId || null,
          TotalReturn: new Prisma.Decimal(TotalReturn),
          Reason: dto.Reason,
          StatusID: pendingStatus?.ID || 1,
          CreatedByID: UserId,
          IsReturn: dto.IsExchange || false,
          ReturnItems: {
            create: validatedItems.map((item) => ({
              ProductID: item.ProductId,
              SaleItemID: item.SaleItemId,
              Quantity: new Prisma.Decimal(item.Quantity),
              UnitID: item.UnitId || 1,
              UnitPrice: new Prisma.Decimal(item.UnitPrice),
              SubTotal: new Prisma.Decimal(item.subTotal),
            })),
          },
        },
        include: {
          Customer: true,
          Sale: true,
          ReturnItems: { include: { Product: true, Unit: true } },
        },
      });

      return newReturn;
    });

    return {
      success: true,
      SaleReturn: {
        ID: SaleReturn.ID,
        Code: SaleReturn.Code,
        Date: SaleReturn.Date,
        originalSaleCode: Sale.Code,
        Customer: SaleReturn.Customer.Name,
        TotalReturn,
        reason: SaleReturn.Reason,
        Status: pendingStatus?.Name || 'Pending',
        items: SaleReturn.ReturnItems.map((item) => ({
          ProductId: item.ProductID,
          ProductName: item.Product.Name,
          Quantity: number(item.Quantity),
          Unit: item.Unit?.Name,
          UnitPrice: number(item.UnitPrice),
          subTotal: number(item.SubTotal),
        })),
      },
    };
  }

  /**
   * Get Sale return by ID
   */
  async getSaleReturn(returnId: number) {
    const SaleReturn = await this.prisma.saleReturn.findUnique({
      where: { ID: returnId },
      include: {
        Customer: true,
        Sale: { include: { Customer: true } },
        Warehouse: true,
        Status: true,
        ReturnItems: {
          include: {
            Product: true,
            Unit: true,
            SaleItem: true,
          },
        },
      },
    });

    if (!SaleReturn) {
      throw new NotFoundException('Sale return not found');
    }

    return {
      ID: SaleReturn.ID,
      Code: SaleReturn.Code,
      Date: SaleReturn.Date,
      originalSale: {
        ID: SaleReturn.Sale.ID,
        Code: SaleReturn.Sale.Code,
        Date: SaleReturn.Sale.Date,
        Customer: SaleReturn.Sale.Customer.Name,
        Total: number(SaleReturn.Sale.Total),
      },
      Customer: SaleReturn.Customer,
      Warehouse: SaleReturn.Warehouse,
      TotalReturn: number(SaleReturn.TotalReturn),
      reason: SaleReturn.Reason,
      Status: SaleReturn.Status,
      isExchange: SaleReturn.IsReturn,
      Notes: SaleReturn.Notes,
      items: SaleReturn.ReturnItems.map((item) => ({
        ID: item.ID,
        ProductId: item.ProductID,
        ProductCode: item.Product.Code,
        ProductName: item.Product.Name,
        Quantity: number(item.Quantity),
        Unit: item.Unit?.Name,
        UnitPrice: number(item.UnitPrice),
        subTotal: number(item.SubTotal),
        originalQuantity: item.SaleItem ? Number(item.SaleItem.Quantity) : null,
      })),
    };
  }

  /**
   * List Sale returns
   */
  async listSaleReturns(dto: SaleReturnFilterDto) {
    const where: any = {};

    if (dto.CustomerId) {
      where.CustomerID = dto.CustomerId;
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

    const returns = await this.prisma.saleReturn.findMany({
      where,
      include: {
        Customer: true,
        Sale: true,
        Status: true,
        ReturnItems: true,
      },
      orderBy: { Date: 'desc' },
    });

    return returns.map((r) => ({
      ID: r.ID,
      Code: r.Code,
      Date: r.Date,
      originalSaleCode: r.Sale.Code,
      Customer: r.Customer.Name,
      TotalReturn: number(r.TotalReturn),
      reason: r.Reason,
      Status: r.Status.Name,
      StatusColor: r.Status.Color,
      itemCount: r.ReturnItems.length,
      isExchange: r.IsReturn,
    }));
  }

  /**
   * Approve Sale return
   * Flow: Manager approve → Stock bertambah → Refund diproses
   */
  async approveSaleReturn(returnId: number, dto: ApproveSaleReturnDto, UserId: string) {
    const SaleReturn = await this.prisma.saleReturn.findUnique({
      where: { ID: returnId },
      include: {
        ReturnItems: true,
        Sale: true,
        Customer: true,
      },
    });

    if (!SaleReturn) {
      throw new NotFoundException('Sale return not found');
    }

    // Get completed Status
    const completedStatus = await this.prisma.transactionStatus.findFirst({
      where: { Code: 'COMPLETED' },
    });

    await this.prisma.$transaction(async (tx) => {
      // UpDate return Status
      await tx.saleReturn.update({
        where: { ID: returnId },
        data: {
          StatusID: completedStatus?.ID || 2,
          Notes: dto.Notes,
        },
      });

      // Increase Stock for each returned item
      for (const item of SaleReturn.ReturnItems) {
        await tx.product.update({
          where: { ID: item.ProductID },
          data: { Stock: { increment: new Prisma.Decimal(item.Quantity) } },
        });

        if (SaleReturn.WarehouseID) {
          await tx.productStock.update({
            where: {
              ProductID_WarehouseID: {
                ProductID: item.ProductID,
                WarehouseID: SaleReturn.WarehouseID,
              },
            },
            data: { Quantity: { increment: new Prisma.Decimal(item.Quantity) } },
          });
        }
      }

      // Process refund based on original Payment Method
      const refundAmount = Number(SaleReturn.TotalReturn);

      if (SaleReturn.IsReturn) {
        // If exchange, reduce Customer receivable
        await tx.customer.update({
          where: { ID: SaleReturn.CustomerID },
          data: { TotalReceivable: { increment: new Prisma.Decimal(refundAmount) } },
        });
      }

      // Log activity
      await tx.activityLog.create({
        data: {
          Type: 'SALE_RETURN',
          Title: 'Sale Return Approved',
          Description: `Return ${SaleReturn.Code} approved. Amount: ${refundAmount}. Original Sale: ${SaleReturn.Sale.Code}`,
          ReferenceType: 'SALE_RETURN',
          ReferenceID: returnId,
          Amount: new Prisma.Decimal(refundAmount),
          CreatedByID: UserId,
        },
      });
    });

    return {
      success: true,
      SaleReturnId: returnId,
      Code: SaleReturn.Code,
      TotalReturn: number(SaleReturn.TotalReturn),
      Status: 'APPROVED',
      message: 'Return approved and Stock has been updated',
    };
  }

  /**
   * Reject Sale return
   */
  async rejectSaleReturn(returnId: number, dto: RejectSaleReturnDto, UserId: string) {
    const SaleReturn = await this.prisma.saleReturn.findUnique({
      where: { ID: returnId },
    });

    if (!SaleReturn) {
      throw new NotFoundException('Sale return not found');
    }

    // Get rejected Status
    const rejectedStatus = await this.prisma.transactionStatus.findFirst({
      where: { Code: 'CANCELLED' },
    });

    await this.prisma.saleReturn.update({
      where: { ID: returnId },
      data: {
        StatusID: rejectedStatus?.ID || 3,
        Notes: `Rejected: ${dto.Reason}`,
      },
    });

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        Type: 'SALE_RETURN_REJECTED',
        Title: 'Sale Return Rejected',
        Description: `Return ${SaleReturn.Code} rejected. Reason: ${dto.Reason}`,
        ReferenceType: 'SALE_RETURN',
        ReferenceID: returnId,
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      SaleReturnId: returnId,
      Code: SaleReturn.Code,
      Status: 'REJECTED',
      reason: dto.Reason,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get Sale return Summary
   */
  async getSaleReturnSummary(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.Date = {};
      if (startDate) {
        where.Date.gte = new Date(startDate);
      }
      if (endDate) {
        where.Date.lte = new Date(endDate);
      }
    }

    const returns = await this.prisma.saleReturn.findMany({
      where,
      include: {
        Customer: true,
        Status: true,
        ReturnItems: { include: { Product: true } },
      },
    });

    const completedStatus = await this.prisma.transactionStatus.findFirst({
      where: { Code: 'COMPLETED' },
    });

    const pendingStatus = await this.prisma.transactionStatus.findFirst({
      where: { Code: 'PENDING' },
    });

    const byProduct: Record<string, any> = {};
    let TotalReturnAmount = 0;
    let approvedAmount = 0;
    let pendingAmount = 0;

    for (const returnDoc of returns) {
      const Amount = Number(returnDoc.TotalReturn);
      TotalReturnAmount += Amount;

      if (returnDoc.StatusID === completedStatus?.ID) {
        approvedAmount += Amount;
      } else if (returnDoc.StatusID === pendingStatus?.ID) {
        pendingAmount += Amount;
      }

      for (const item of returnDoc.ReturnItems) {
        const ProductName = item.Product.Name;
        if (!byProduct[ProductName]) {
          byProduct[ProductName] = {
            ProductName,
            ProductCode: item.Product.Code,
            returnCount: 0,
            TotalQuantity: 0,
            TotalAmount: 0,
          };
        }
        byProduct[ProductName].returnCount++;
        byProduct[ProductName].TotalQuantity += Number(item.Quantity);
        byProduct[ProductName].TotalAmount += Number(item.SubTotal);
      }
    }

    return {
      period: { startDate, endDate },
      Summary: {
        TotalReturns: returns.length,
        TotalReturnAmount,
        approvedAmount,
        pendingAmount,
        averageReturnAmount: returns.length > 0 ? TotalReturnAmount / returns.length : 0,
      },
      byProduct: Object.values(byProduct).sort((a: any, b: any) => b.TotalAmount - a.TotalAmount),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateReturnCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `RET-JUAL-${year}${month}`;

    const lastReturn = await this.prisma.saleReturn.findFirst({
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
