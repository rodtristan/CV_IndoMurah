import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { RedisService } from '../../../common/redis/redis-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreatePOSTransactionDto,
  BarcodeSearchDto,
  ProductSearchDto,
  QuickPriceCheckDto,
  OpenTransactionDto,
  UpdateCartItemDto,
  ApplyVoucherDto,
  HoldTransactionDto,
  ResumeTransactionDto,
} from './pos.dto';

export interface CartItem {
  productId: number;
  productCode: string;
  productName: string;
  barcode?: string;
  quantity: number;
  unitId: number;
  unitName: string;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  subTotal: number;
  maxQuantity: number;
  notes?: string;
}

export interface CartSession {
  id: string;
  customerId: number;
  customerName: string;
  salePointId?: number;
  warehouseId?: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class POSService {
  private readonly CART_PREFIX = 'pos:cart:';
  private readonly HOLD_PREFIX = 'pos:hold:';
  private readonly CART_TTL = 3600; // 1 hour

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCT SEARCH & BARCODE LOOKUP
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Search Product by Barcode for POS
   * Flow: Kasir scan barcode → sistem cari produk → tampilkan info produk
   */
  async searchByBarcode(dto: BarcodeSearchDto) {
    // First try exact barcode match
    let product = await this.prisma.product.findFirst({
      where: {
        IsActive: true,
        OR: [
          { Barcode: dto.barcode },
          { ProductBarcodes: { some: { Barcode: dto.barcode, IsActive: true } } },
        ],
      },
      include: {
        Category: true,
        Brand: true,
        Unit: true,
        ProductStocks: dto.warehouseId
          ? { where: { WarehouseID: dto.warehouseId } }
          : undefined,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with barcode '${dto.barcode}' not found`);
    }

    // Calculate available stock
    const stockInWarehouse = dto.warehouseId
      ? product.ProductStocks?.[0]?.Quantity || product.Stock
      : product.Stock;

    return {
      id: product.ID,
      code: product.Code,
      barcode: product.Barcode,
      name: product.Name,
      category: product.Category ? { id: product.Category.ID, name: product.Category.Name } : null,
      brand: product.Brand ? { id: product.Brand.ID, name: product.Brand.Name } : null,
      unit: { id: product.Unit.ID, name: product.Unit.Name, abbreviation: product.Unit.Abbreviation },
      sellingPrice: number(product.SellingPrice),
      stock: number(stockInWarehouse),
      minimumStock: number(product.MinimumStock),
      hasEnoughStock: number(stockInWarehouse) > 0,
    };
  }

  /**
   * Search Products for POS display/selection
   * Flow: Kasir ketik nama produk → sistem tampilkan daftar produk
   */
  async searchProducts(dto: ProductSearchDto) {
    const where: any = { IsActive: true };

    if (dto.search) {
      where.OR = [
        { Name: { contains: dto.search, mode: 'insensitive' } },
        { Code: { contains: dto.search, mode: 'insensitive' } },
        { Barcode: { contains: dto.search, mode: 'insensitive' } },
        { ProductBarcodes: { some: { Barcode: { contains: dto.search }, IsActive: true } } },
      ];
    }

    if (dto.categoryId) {
      where.CategoryID = dto.categoryId;
    }

    if (dto.brandId) {
      where.BrandID = dto.brandId;
    }

    if (dto.inStockOnly) {
      where.Stock = { gt: 0 };
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        Category: true,
        Brand: true,
        Unit: true,
        ProductStocks: dto.warehouseId
          ? { where: { WarehouseID: dto.warehouseId } }
          : undefined,
      },
      orderBy: { Name: 'asc' },
      take: dto.limit || 50,
    });

    return products.map((p) => {
      const stockInWarehouse = dto.warehouseId
        ? p.ProductStocks?.[0]?.Quantity || p.Stock
        : p.Stock;

      return {
        id: p.ID,
        code: p.Code,
        name: p.Name,
        barcode: p.Barcode,
        category: p.Category ? { id: p.Category.ID, name: p.Category.Name } : null,
        brand: p.Brand ? { id: p.Brand.ID, name: p.Brand.Name } : null,
        unit: { id: p.Unit.ID, name: p.Unit.Name, abbreviation: p.Unit.Abbreviation },
        sellingPrice: number(p.SellingPrice),
        stock: number(stockInWarehouse),
        minimumStock: number(p.MinimumStock),
      };
    });
  }

  /**
   * Quick Price Check with Quantity and Customer Group pricing
   * Flow: Kasir input quantity → sistem hitung harga dengan diskon
   */
  async quickPriceCheck(dto: QuickPriceCheckDto) {
    const product = await this.prisma.product.findUnique({
      where: { ID: dto.productId },
      include: {
        Category: true,
        Brand: true,
        Unit: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get Customer for Price Group
    const customer = await this.prisma.customer.findUnique({
      where: { ID: dto.customerId },
      include: { CustomerGroup: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Calculate base Price
    let unitPrice = Number(product.SellingPrice);

    // Apply Customer Group discount if exists
    const groupDiscount = customer.CustomerGroup?.DiscountPercent
      ? Number(customer.CustomerGroup.DiscountPercent)
      : 0;

    if (groupDiscount > 0) {
      unitPrice = unitPrice * (1 - groupDiscount / 100);
    }

    // Calculate Line Totals
    const subTotal = unitPrice * dto.quantity;
    const discountAmount = 0;
    const total = subTotal;

    return {
      productId: product.ID,
      productCode: product.Code,
      productName: product.Name,
      unitPrice: Math.round(unitPrice * 100) / 100,
      quantity: dto.quantity,
      groupDiscount,
      subTotal: Math.round(subTotal * 100) / 100,
      customerGroup: customer.CustomerGroup?.Name || 'Default',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CART MANAGEMENT (In-Memory Session)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Open new cart session for POS
   * Flow: Kasir mulai transaksi → sistem buat session cart
   */
  async openCart(sessionId: string, dto: OpenTransactionDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { ID: dto.customerId },
      include: { CustomerGroup: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const cart: CartSession = {
      id: sessionId,
      customerId: dto.customerId,
      customerName: customer.Name,
      salePointId: dto.salePointId,
      warehouseId: dto.warehouseId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.redis.set(`${this.CART_PREFIX}${sessionId}`, cart, this.CART_TTL);

    return {
      sessionId,
      customer: {
        id: customer.ID,
        code: customer.Code,
        name: customer.Name,
        customerGroup: customer.CustomerGroup?.Name || 'Default',
        pointBalance: customer.PointBalance,
      },
      items: [],
      itemCount: 0,
      subTotal: 0,
    };
  }

  /**
   * Add item to cart
   * Flow: Kasir scan/add produk → item masuk ke cart
   */
  async addToCart(sessionId: string, dto: { productId: number; quantity: number; unitPrice?: number; notes?: string }) {
    const cartData = await this.redis.get(`${this.CART_PREFIX}${sessionId}`);
    if (!cartData) {
      throw new BadRequestException('Cart session not found. Please open a new cart.');
    }

    const cart: CartSession = JSON.parse(cartData);

    // Get Product details
    const product = await this.prisma.product.findUnique({
      where: { ID: dto.productId },
      include: { Unit: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check Stock
    const stock = cart.warehouseId
      ? await this.prisma.productStock.findUnique({
          where: { ProductID_WarehouseID: { ProductID: dto.productId, WarehouseID: cart.warehouseId } },
        })
      : null;

    const availableStock = stock ? Number(stock.Quantity) : number(product.Stock);

    // Check if item already in cart
    const existingItem = cart.items.find((i) => i.productId === dto.productId);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const totalQtyNeeded = currentQtyInCart + dto.quantity;

    if (totalQtyNeeded > availableStock) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${availableStock}, Requested: ${totalQtyNeeded}`,
      );
    }

    const unitPrice = dto.unitPrice || Number(product.SellingPrice);
    const itemSubTotal = unitPrice * dto.quantity;

    if (existingItem) {
      // Update existing item
      existingItem.quantity += dto.quantity;
      existingItem.subTotal = existingItem.quantity * existingItem.unitPrice;
      if (dto.notes) existingItem.notes = dto.notes;
    } else {
      // Add new item
      cart.items.push({
        productId: product.ID,
        productCode: product.Code,
        productName: product.Name,
        barcode: product.Barcode || undefined,
        quantity: dto.quantity,
        unitId: product.Unit.ID,
        unitName: product.Unit.Name,
        unitPrice,
        discountPercent: 0,
        discountAmount: 0,
        subTotal: itemSubTotal,
        maxQuantity: availableStock,
        notes: dto.notes,
      });
    }

    cart.updatedAt = new Date().toISOString();
    await this.redis.set(`${this.CART_PREFIX}${sessionId}`, cart, this.CART_TTL);

    return this.getCartSummary(cart);
  }

  /**
   * Update cart item quantity
   * Flow: Kasir ubah jumlah produk
   */
  async updateCartItem(sessionId: string, productId: number, dto: UpdateCartItemDto) {
    const cartData = await this.redis.get(`${this.CART_PREFIX}${sessionId}`);
    if (!cartData) {
      throw new BadRequestException('Cart session not found');
    }

    const cart: CartSession = JSON.parse(cartData);
    const item = cart.items.find((i) => i.productId === productId);

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    if (dto.quantity === 0) {
      // Remove item
      cart.items = cart.items.filter((i) => i.productId !== productId);
    } else {
      if (dto.quantity > item.maxQuantity) {
        throw new BadRequestException(`Quantity exceeds available stock: ${item.maxQuantity}`);
      }

      item.quantity = dto.quantity;
      if (dto.unitPrice !== undefined) item.unitPrice = dto.unitPrice;
      if (dto.discountPercent !== undefined) item.discountPercent = dto.discountPercent;
      if (dto.discountAmount !== undefined) item.discountAmount = dto.discountAmount;
      item.subTotal = item.quantity * item.unitPrice - item.discountAmount;
    }

    cart.updatedAt = new Date().toISOString();
    await this.redis.set(`${this.CART_PREFIX}${sessionId}`, cart, this.CART_TTL);

    return this.getCartSummary(cart);
  }

  /**
   * Remove item from cart
   * Flow: Kasir hapus produk dari cart
   */
  async removeFromCart(sessionId: string, productId: number) {
    return this.updateCartItem(sessionId, productId, { quantity: 0 });
  }

  /**
   * Get current cart summary
   */
  async getCart(sessionId: string) {
    const cartData = await this.redis.get(`${this.CART_PREFIX}${sessionId}`);
    if (!cartData) {
      throw new NotFoundException('Cart session not found');
    }

    const cart: CartSession = JSON.parse(cartData);
    return this.getCartSummary(cart);
  }

  /**
   * Clear cart
   */
  async clearCart(sessionId: string) {
    await this.redis.del(`${this.CART_PREFIX}${sessionId}`);
    return { message: 'Cart cleared' };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HOLD & RESUME TRANSACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Hold current transaction (Simpan transaksi sementara)
   * Flow: Pelanggan belum mau bayar → kasir simpan transaksi
   */
  async holdTransaction(sessionId: string, dto: HoldTransactionDto) {
    const cartData = await this.redis.get(`${this.CART_PREFIX}${sessionId}`);
    if (!cartData) {
      throw new BadRequestException('Cart session not found');
    }

    const cart: CartSession = JSON.parse(cartData);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot hold empty cart');
    }

    // Check if hold number already exists
    const existingHold = await this.redis.get(`${this.HOLD_PREFIX}${dto.holdNumber}`);
    if (existingHold) {
      throw new ConflictException('Hold number already exists');
    }

    // Store cart with hold number as key
    cart.id = dto.holdNumber;
    cart.updatedAt = new Date().toISOString();

    // Store with longer TTL (24 hours)
    await this.redis.set(`${this.HOLD_PREFIX}${dto.holdNumber}`, cart, 86400);

    // Clear current cart
    await this.redis.del(`${this.CART_PREFIX}${sessionId}`);

    return {
      holdNumber: dto.holdNumber,
      itemCount: cart.items.length,
      message: `Transaction held with number ${dto.holdNumber}`,
    };
  }

  /**
   * Resume held transaction
   * Flow: Pelanggan kembali → kasir panggil transaksi tersimpan
   */
  async resumeTransaction(sessionId: string, dto: ResumeTransactionDto) {
    const holdData = await this.redis.get(`${this.HOLD_PREFIX}${dto.holdNumber}`);
    if (!holdData) {
      throw new NotFoundException('Held transaction not found');
    }

    const cart: CartSession = JSON.parse(holdData);

    // Create new session with the held cart data
    cart.id = sessionId;
    cart.updatedAt = new Date().toISOString();

    await this.redis.set(`${this.CART_PREFIX}${sessionId}`, cart, this.CART_TTL);
    await this.redis.del(`${this.HOLD_PREFIX}${dto.holdNumber}`);

    return this.getCartSummary(cart);
  }

  /**
   * List all held transactions
   * Note: This requires SCAN command which may not be available in all Redis clients
   */
  async listHeldTransactions() {
    // Since Redis service may not have keys method, return empty array
    // In production, implement proper Redis SCAN or maintain a separate list
    return [];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VOUCHER & DISCOUNT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Apply Voucher to transaction
   * Flow: Pelanggan punya voucher → kasir input kode voucher
   */
  async applyVoucher(dto: ApplyVoucherDto) {
    const voucher = await this.prisma.voucher.findFirst({
      where: {
        Code: dto.code,
        IsActive: true,
        StartDate: { lte: new Date() },
        EndDate: { gte: new Date() },
      },
      include: { Type: true },
    });

    if (!voucher) {
      throw new NotFoundException('Voucher not found or expired');
    }

    // Check usage limit
    if (voucher.UsageLimit && voucher.UsedCount >= voucher.UsageLimit) {
      throw new BadRequestException('Voucher usage limit reached');
    }

    // Check minimum Purchase
    if (voucher.MinPurchaseAmount && dto.subtotal < Number(voucher.MinPurchaseAmount)) {
      throw new BadRequestException(
        `Minimum purchase ${voucher.MinPurchaseAmount} required for this voucher`,
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.Type.Code === 'PERCENT') {
      discountAmount = dto.subtotal * (Number(voucher.Value) / 100);
      if (voucher.MaxDiscountAmount && discountAmount > Number(voucher.MaxDiscountAmount)) {
        discountAmount = Number(voucher.MaxDiscountAmount);
      }
    } else {
      discountAmount = Number(voucher.Value);
    }

    return {
      voucherCode: voucher.Code,
      voucherName: voucher.Name,
      discountType: voucher.Type.Code,
      discountValue: number(voucher.Value),
      discountAmount: Math.round(discountAmount * 100) / 100,
      newSubTotal: Math.round((dto.subtotal - discountAmount) * 100) / 100,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPLETE TRANSACTION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Complete POS transaction (Finalize Sale)
   * Flow: Kasir selesai input → hitung total → pelanggan bayar → transaksi selesai
   */
  async completeTransaction(sessionId: string, dto: { paymentMethodId: number; cashAmount: number; notes?: string; useCustomerDeposit?: boolean }) {
    const cartData = await this.redis.get(`${this.CART_PREFIX}${sessionId}`);
    if (!cartData) {
      throw new NotFoundException('Cart session not found');
    }

    const cart: CartSession = JSON.parse(cartData);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot complete empty transaction');
    }

    // Calculate Totals
    const subTotal = cart.items.reduce((sum, i) => sum + i.subTotal, 0);
    const total = subTotal; // Discount already applied in items

    // Validate Payment
    const cashAmount = dto.cashAmount;
    if (cashAmount < total) {
      throw new BadRequestException(`Insufficient payment. Total: ${total}, Received: ${cashAmount}`);
    }

    const changeAmount = cashAmount - total;

    // Get Customer for receivable tracking
    const customer = await this.prisma.customer.findUnique({
      where: { ID: cart.customerId },
      include: { CustomerGroup: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Generate transaction Code
    const code = await this.generateCode();

    // Determine Payment Status
    const paymentStatusCode = cashAmount >= total ? 'PAID' : 'PARTIAL';

    // Get PaymentStatus ID
    const status = await this.prisma.paymentStatus.findFirst({ where: { Code: paymentStatusCode } });
    const paymentStatusId = status?.ID || 1;

    // Execute transaction
    const sale = await this.prisma.$transaction(async (tx) => {
      // Create Sale
      const newSale = await tx.sale.create({
        data: {
          Code: code,
          Date: new Date(),
          CustomerID: cart.customerId,
          SalePointID: cart.salePointId,
          WarehouseID: cart.warehouseId,
          Subtotal: new Prisma.Decimal(subTotal),
          DiscountAmount: new Prisma.Decimal(0),
          DiscountPercent: new Prisma.Decimal(0),
          TaxAmount: new Prisma.Decimal(0),
          TaxPercent: new Prisma.Decimal(0),
          Total: new Prisma.Decimal(total),
          CashAmount: new Prisma.Decimal(cashAmount),
          ChangeAmount: new Prisma.Decimal(changeAmount),
          PaymentStatusID: paymentStatusId,
          PaymentMethodID: dto.paymentMethodId,
          Notes: dto.notes,
          CreatedByID: 'system', // Will be replaced with actual User
          SaleItems: {
            create: cart.items.map((item) => ({
              ProductID: item.productId,
              Quantity: new Prisma.Decimal(item.quantity),
              UnitID: item.unitId,
              UnitPrice: new Prisma.Decimal(item.unitPrice),
              DiscountPercent: new Prisma.Decimal(item.discountPercent),
              DiscountAmount: new Prisma.Decimal(item.discountAmount),
              Subtotal: new Prisma.Decimal(item.subTotal),
            })),
          },
        },
        include: {
          Customer: true,
          SaleItems: { include: { Product: true, Unit: true } },
        },
      });

      // Update Payment Status (already set, but confirm)
      if (status) {
        await tx.sale.update({
          where: { ID: newSale.ID },
          data: { PaymentStatusID: status.ID },
        });
      }

      // Decrease Stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { ID: item.productId },
          data: { Stock: { decrement: new Prisma.Decimal(item.quantity) } },
        });

        // Update Warehouse Stock if applicable
        if (cart.warehouseId) {
          await tx.productStock.update({
            where: {
              ProductID_WarehouseID: {
                ProductID: item.productId,
                WarehouseID: cart.warehouseId,
              },
            },
            data: { Quantity: { decrement: new Prisma.Decimal(item.quantity) } },
          }).catch(() => {
            // Create if not exists
            return tx.productStock.create({
              data: {
                ProductID: item.productId,
                WarehouseID: cart.warehouseId!,
                Quantity: new Prisma.Decimal(0),
              },
            });
          });
        }
      }

      // Record Payment
      await tx.salePayment.create({
        data: {
          SaleID: newSale.ID,
          MethodID: dto.paymentMethodId,
          Amount: new Prisma.Decimal(cashAmount >= total ? total : cashAmount),
          ReferenceNumber: null,
          Notes: dto.notes,
          CreatedByID: 'system',
        },
      });

      // Update Customer receivable if partial Payment
      if (cashAmount < total) {
        const remainingAmount = total - cashAmount;
        await tx.customer.update({
          where: { ID: cart.customerId },
          data: { TotalReceivable: { increment: new Prisma.Decimal(remainingAmount) } },
        });
      }

      // Add loyalty Points
      const pointSetting = await tx.pointSetting.findFirst({ where: { IsActive: true } });
      if (pointSetting && cashAmount >= Number(pointSetting.MinimumTransaction)) {
        const points = Math.floor(cashAmount * Number(pointSetting.PointsPerRupiah));
        await tx.customer.update({
          where: { ID: cart.customerId },
          data: { PointBalance: { increment: points } },
        });
      }

      return newSale;
    });

    // Clear cart
    await this.redis.del(`${this.CART_PREFIX}${sessionId}`);

    return {
      success: true,
      transaction: {
        id: sale.ID,
        code: sale.Code,
        date: sale.Date,
        customer: sale.Customer.Name,
        itemCount: cart.items.length,
        subTotal,
        total,
        cashAmount,
        changeAmount,
        paymentStatus: paymentStatusCode,
      },
      receipt: {
        header: 'Toko CV IndoMurah',
        transactionCode: sale.Code,
        date: sale.Date,
        customer: sale.Customer.Name,
        items: cart.items.map((i) => ({
          name: i.productName,
          qty: i.quantity,
          price: i.unitPrice,
          subTotal: i.subTotal,
        })),
        subTotal,
        total,
        cash: cashAmount,
        change: changeAmount,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const prefix = `TRX-${year}${month}${day}`;

    const lastSale = await this.prisma.sale.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastSale) {
      const lastSeq = parseInt(lastSale.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private getCartSummary(cart: CartSession) {
    const subTotal = cart.items.reduce((sum, i) => sum + i.subTotal, 0);
    const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

    return {
      sessionId: cart.id,
      customer: {
        id: cart.customerId,
        name: cart.customerName,
      },
      items: cart.items,
      itemCount,
      subTotal: Math.round(subTotal * 100) / 100,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}
