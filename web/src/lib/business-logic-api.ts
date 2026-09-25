// ============================================================
// Business Logic API Client
// Endpoints for business-logic modules
// ============================================================

import { api } from './api-client';
import type { ApiResponse } from './api-client';

// ─── Type Definitions ─────────────────────────────────────────

// Dashboard & Analytics
export interface DashboardSummary {
  summary: {
    totalSales: number;
    totalPurchases: number;
    grossProfit: number;
    netProfit: number;
  };
  topProducts: Array<{
    productId: number;
    productCode: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  lowStockItems: Array<{
    productId: number;
    productName: string;
    currentStock: number;
    minimumStock: number;
  }>;
  outOfStockItems: Array<{
    productId: number;
    productName: string;
  }>;
  salesByBranch: Array<{
    salePointId: number;
    salePointName: string;
    totalSales: number;
    transactionCount: number;
  }>;
}

export interface SalesReport {
  summary: {
    totalSales: number;
    totalTransactions: number;
    totalItems: number;
    averageTransaction: number;
  };
  byDate: Array<{
    date: string;
    totalSales: number;
    totalTransactions: number;
    totalItems: number;
  }>;
  byCustomer?: Array<{
    customerId: number;
    customerName: string;
    totalSales: number;
    totalTransactions: number;
  }>;
  byProduct: Array<{
    productId: number;
    productName: string;
    quantity: number;
    totalSales: number;
  }>;
}

export interface ProfitReport {
  period: { startDate: string; endDate: string };
  income: { total: number; items: Array<{ description: string; amount: number }> };
  expenses: { total: number; items: Array<{ accountName: string; amount: number }> };
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

export interface CashFlowReport {
  period: { startDate: string; endDate: string };
  cashIns: number;
  cashOuts: number;
  netCash: number;
  byAccount: Array<{
    accountId: number;
    accountName: string;
    cashIn: number;
    cashOut: number;
    balance: number;
  }>;
}

// Customer
export interface Customer {
  ID: number;
  Code: string;
  Name: string;
  Phone?: string;
  Email?: string;
  Address?: string;
  TotalReceivable: number;
  CustomerGroupID?: number;
  CustomerGroup?: { ID: number; Name: string };
  PointBalance: number;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
}

export interface CustomerSummary {
  totalCustomers: number;
  totalReceivable: number;
  topCustomers: Array<{
    customerId: number;
    customerName: string;
    totalReceivable: number;
  }>;
}

// Supplier
export interface Supplier {
  ID: number;
  Code: string;
  Name: string;
  ContactPerson?: string;
  Phone?: string;
  Email?: string;
  Address?: string;
  TotalDebt: number;
  IsActive: boolean;
  CreatedAt: string;
}

// Product
export interface Product {
  ID: number;
  Code: string;
  Barcode?: string;
  Name: string;
  CategoryID?: number;
  Category?: { ID: number; Name: string };
  BrandID?: number;
  Brand?: { ID: number; Name: string };
  UnitID: number;
  Unit?: { ID: number; Code: string; Name: string };
  WarehouseID?: number;
  Warehouse?: { ID: number; Name: string };
  PurchasePrice: number;
  SellingPrice: number;
  Stock: number;
  MinimumStock: number;
  IsActive: boolean;
  CreatedAt: string;
}

// POS
export interface POSCartItem {
  productId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
}

export interface POSCart {
  items: POSCartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  customer?: Customer;
  paymentMethod?: { id: number; name: string };
  cashAmount?: number;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
}

// Stock Alert
export interface StockAlert {
  ID: number;
  ProductID: number;
  Product?: Product;
  AlertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED' | 'REORDER';
  CurrentStock: number;
  MinimumStock: number;
  IsRead: boolean;
  IsResolved: boolean;
  CreatedAt: string;
}

// ─── Analytics API ──────────────────────────────────────────

export const analyticsApi = {
  /**
   * GET /business-logic/analytics/dashboard
   * Get comprehensive dashboard summary
   */
  getDashboard: async (params?: { startDate?: string; endDate?: string; warehouseId?: number }) => {
    return api.get<DashboardSummary>('business-logic/analytics/dashboard', params as any);
  },

  /**
   * GET /business-logic/analytics/sales-report
   * Get detailed sales report
   */
  getSalesReport: async (params?: {
    startDate?: string;
    endDate?: string;
    warehouseId?: number;
    customerId?: number;
  }) => {
    return api.get<SalesReport>('business-logic/analytics/sales-report', params as any);
  },

  /**
   * GET /business-logic/analytics/profit-report
   * Get profit/loss report
   */
  getProfitReport: async (params?: {
    startDate?: string;
    endDate?: string;
    warehouseId?: number;
  }) => {
    return api.get<ProfitReport>('business-logic/analytics/profit-report', params as any);
  },

  /**
   * GET /business-logic/analytics/top-products
   * Get top selling products
   */
  getTopProducts: async (params?: { startDate?: string; endDate?: string; limit?: number }) => {
    return api.get<Array<{ productId: number; productName: string; quantity: number; totalSales: number }>>(
      'business-logic/analytics/top-products',
      params as any
    );
  },

  /**
   * GET /business-logic/analytics/top-customers
   * Get top customers by revenue
   */
  getTopCustomers: async (params?: { startDate?: string; endDate?: string; limit?: number }) => {
    return api.get<Array<{ customerId: number; customerName: string; totalSales: number }>>(
      'business-logic/analytics/top-customers',
      params as any
    );
  },

  /**
   * GET /business-logic/analytics/cash-flow
   * Get cash flow report
   */
  getCashFlow: async (params?: { startDate?: string; endDate?: string; accountId?: number }) => {
    return api.get<CashFlowReport>('business-logic/analytics/cash-flow', params as any);
  },
};

// ─── Reports API ─────────────────────────────────────────────

export const reportsApi = {
  /**
   * GET /business-logic/reports/dashboard
   * Get dashboard summary
   */
  getDashboard: async (params?: { startDate?: string; endDate?: string }) => {
    return api.get<DashboardSummary>('business-logic/reports/dashboard', params as any);
  },

  /**
   * GET /business-logic/reports/sales
   * Get sales report
   */
  getSales: async (params?: {
    startDate?: string;
    endDate?: string;
    warehouseId?: number;
    customerId?: number;
  }) => {
    return api.get<SalesReport>('business-logic/reports/sales', params as any);
  },

  /**
   * GET /business-logic/reports/sales/summary
   * Get sales summary for charts
   */
  getSalesSummary: async (params?: {
    startDate?: string;
    endDate?: string;
    warehouseId?: number;
  }) => {
    return api.get<Array<{ label: string; sales: number; purchases: number }>>(
      'business-logic/reports/sales/summary',
      params as any
    );
  },

  /**
   * GET /business-logic/reports/profit-loss
   * Get profit and loss report
   */
  getProfitLoss: async (params?: { startDate?: string; endDate?: string }) => {
    return api.get<ProfitReport>('business-logic/reports/profit-loss', params as any);
  },

  /**
   * GET /business-logic/reports/inventory
   * Get inventory report
   */
  getInventory: async (params?: { warehouseId?: number }) => {
    return api.get<{
      totalItems: number;
      totalValue: number;
      lowStockItems: number;
      outOfStockItems: number;
    }>('business-logic/reports/inventory', params as any);
  },

  /**
   * GET /business-logic/reports/expense
   * Get expense report
   */
  getExpense: async (params?: { startDate?: string; endDate?: string; categoryId?: number }) => {
    return api.get<{
      summary: { totalExpense: number };
      byCategory: Array<{ categoryId: number; categoryName: string; total: number }>;
    }>('business-logic/reports/expense', params as any);
  },

  /**
   * GET /business-logic/reports/receivable-aging
   * Get receivable aging report
   */
  getReceivableAging: async (params?: { asOfDate?: string }) => {
    return api.get<{
      customers: Array<{
        customerId: number;
        customerName: string;
        current: number;
        days1to30: number;
        days31to60: number;
        days61to90: number;
        over90: number;
        total: number;
      }>;
      totalReceivable: number;
    }>('business-logic/reports/receivable-aging', params as any);
  },

  /**
   * GET /business-logic/reports/deposit-balance
   * Get deposit balance report (customer & supplier deposits)
   */
  getDepositBalance: async (params?: { asOfDate?: string; customerId?: number; supplierId?: number }) => {
    return api.get<{
      asOfDate: string;
      customerDeposits: Array<{
        customerId: number;
        customerCode: string;
        customerName: string;
        totalDeposit: number;
        used: number;
        remaining: number;
      }>;
      supplierDeposits: Array<{
        supplierId: number;
        supplierCode: string;
        supplierName: string;
        totalDeposit: number;
        used: number;
        remaining: number;
      }>;
      summary: {
        totalCustomerDeposits: number;
        totalCustomerUsed: number;
        totalCustomerRemaining: number;
        totalSupplierDeposits: number;
        totalSupplierUsed: number;
        totalSupplierRemaining: number;
        grandTotalDeposit: number;
        grandTotalRemaining: number;
      };
    }>('business-logic/reports/deposit-balance', params as any);
  },
};

// ─── Customers API ────────────────────────────────────────────

export const customersApi = {
  /**
   * GET /business-logic/customers
   * List customers with filters
   */
  list: async (params?: {
    search?: string;
    categoryId?: number;
    isActive?: boolean;
    $skip?: number;
    $take?: number;
  }) => {
    return api.get<Customer[]>('business-logic/customers', params as any);
  },

  /**
   * GET /business-logic/customers/summary
   * Get customer summary
   */
  getSummary: async () => {
    return api.get<CustomerSummary>('business-logic/customers/summary');
  },

  /**
   * GET /business-logic/customers/top-revenue
   * Get top customers by revenue
   */
  getTopRevenue: async (params?: { limit?: number; startDate?: string; endDate?: string }) => {
    return api.get<Array<{ customerId: number; customerName: string; totalSales: number }>>(
      'business-logic/customers/top-revenue',
      params as any
    );
  },

  /**
   * GET /business-logic/customers/:id
   * Get customer by ID
   */
  getById: async (id: number) => {
    return api.getOne<Customer>('business-logic/customers', id);
  },

  /**
   * POST /business-logic/customers
   * Create new customer
   */
  create: async (data: Partial<Customer>) => {
    return api.post<Customer>('business-logic/customers', data);
  },

  /**
   * PATCH /business-logic/customers/:id
   * Update customer
   */
  update: async (id: number, data: Partial<Customer>) => {
    return api.patch<Customer>('business-logic/customers', id, data);
  },

  /**
   * DELETE /business-logic/customers/:id
   * Delete customer
   */
  delete: async (id: number) => {
    return api.delete<Customer>('business-logic/customers', id);
  },

  /**
   * GET /business-logic/customers/:id/receivable
   * Get customer receivable details
   */
  getReceivable: async (id: number) => {
    return api.get<{
      customerId: number;
      customerName: string;
      totalReceivable: number;
      transactions: Array<{
        id: number;
        date: string;
        amount: number;
        remaining: number;
        status: string;
      }>;
    }>(`business-logic/customers/${id}/receivable`);
  },

  /**
   * POST /business-logic/customers/receivable/add
   * Add receivable
   */
  addReceivable: async (data: { customerId: number; amount: number; referenceType?: string; referenceId?: number; notes?: string }) => {
    return api.post('business-logic/customers/receivable/add', data);
  },

  /**
   * POST /business-logic/customers/receivable/payment
   * Record payment for receivable
   */
  paymentReceivable: async (data: { customerId: number; saleId?: number; amount: number; paymentMethodId?: number; notes?: string }) => {
    return api.post('business-logic/customers/receivable/payment', data);
  },

  /**
   * GET /business-logic/customers/:id/statement
   * Get customer statement
   */
  getStatement: async (id: number, params?: { startDate?: string; endDate?: string }) => {
    return api.get(`business-logic/customers/${id}/statement`, params as any);
  },
};

// ─── POS API ────────────────────────────────────────────────

export const posApi = {
  /**
   * GET /business-logic/pos/products/search
   * Search products for POS display
   */
  searchProducts: async (params: { search?: string; warehouseId?: number; categoryId?: number }) => {
    return api.get<ProductSearchResult>('business-logic/pos/products/search', params as any);
  },

  /**
   * GET /business-logic/pos/products/barcode
   * Search product by barcode
   */
  searchByBarcode: async (barcode: string) => {
    return api.get<Product>('business-logic/pos/products/barcode', { barcode } as any);
  },

  /**
   * GET /business-logic/pos/products/price-check
   * Quick price check
   */
  priceCheck: async (params: { productId: number; quantity?: number; customerId?: number }) => {
    return api.get<{ productId: number; unitPrice: number; totalPrice: number }>(
      'business-logic/pos/products/price-check',
      params as any
    );
  },

  /**
   * POST /business-logic/pos/cart/open
   * Open new POS cart session
   */
  openCart: async (data: { warehouseId: number; customerId?: number; salesPersonId?: number }) => {
    return api.post<POSCart>('business-logic/pos/cart/open', data);
  },

  /**
   * POST /business-logic/pos/cart/add
   * Add item to cart
   */
  addToCart: async (data: { productId: number; quantity: number; unitPrice?: number; notes?: string }) => {
    return api.post<POSCart>('business-logic/pos/cart/add', data);
  },

  /**
   * PUT /business-logic/pos/cart/item/:productId
   * Update cart item
   */
  updateCartItem: async (productId: number, data: { quantity?: number; unitPrice?: number }) => {
    return api.put<POSCart>('business-logic/pos/cart/item', productId, data);
  },

  /**
   * DELETE /business-logic/pos/cart/item/:productId
   * Remove item from cart
   */
  removeFromCart: async (productId: number) => {
    return api.delete('business-logic/pos/cart/item', productId);
  },

  /**
   * GET /business-logic/pos/cart
   * Get current cart
   */
  getCart: async () => {
    return api.get<POSCart>('business-logic/pos/cart');
  },

  /**
   * DELETE /business-logic/pos/cart
   * Clear cart
   */
  clearCart: async () => {
    return api.request('DELETE', 'business-logic/pos/cart');
  },

  /**
   * POST /business-logic/pos/voucher/apply
   * Apply voucher
   */
  applyVoucher: async (data: { voucherCode: string }) => {
    return api.post<{ isValid: boolean; discount: number; message?: string }>('business-logic/pos/voucher/apply', data);
  },

  /**
   * POST /business-logic/pos/transaction/complete
   * Complete POS transaction
   */
  completeTransaction: async (data: {
    paymentMethodId: number;
    cashAmount: number;
    notes?: string;
    useCustomerDeposit?: boolean;
  }) => {
    return api.post<{ saleId: number; code: string; changeAmount: number }>('business-logic/pos/transaction/complete', data);
  },
};

// ─── Stock Alert API ─────────────────────────────────────────

export const stockAlertApi = {
  /**
   * GET /business-logic/stock-alert
   * List stock alerts
   */
  list: async (params?: { isRead?: boolean; isResolved?: boolean; warehouseId?: number }) => {
    return api.get<StockAlert[]>('business-logic/stock-alert', params as any);
  },

  /**
   * GET /business-logic/stock-alert/summary
   * Get alert summary for dashboard
   */
  getSummary: async () => {
    return api.get<{ total: number; unread: number; lowStock: number; outOfStock: number }>(
      'business-logic/stock-alert/summary'
    );
  },

  /**
   * PUT /business-logic/stock-alert/:id/read
   * Mark alert as read
   */
  markAsRead: async (id: number) => {
    return api.put('business-logic/stock-alert', id, {});
  },

  /**
   * PUT /business-logic/stock-alert/:id/resolve
   * Resolve alert
   */
  resolve: async (id: number) => {
    return api.put('business-logic/stock-alert', id, { isResolved: true });
  },

  /**
   * GET /business-logic/stock-alert/products-needing-reorder
   * Get products that need reorder
   */
  getProductsNeedingReorder: async (params?: { warehouseId?: number }) => {
    return api.get<Array<{ productId: number; productName: string; currentStock: number; minimumStock: number; suggestedOrder: number }>>(
      'business-logic/stock-alert/products-needing-reorder',
      params as any
    );
  },
};

// ─── Inventory API ───────────────────────────────────────────

export const inventoryApi = {
  /**
   * GET /business-logic/inventory/stock-report
   * Get stock movement report
   */
  getStockReport: async (params?: { startDate?: string; endDate?: string; warehouseId?: number; productId?: number }) => {
    return api.get('business-logic/inventory/stock-report', params as any);
  },

  /**
   * GET /business-logic/inventory/valuation-report
   * Get stock valuation report
   */
  getValuationReport: async (params?: { warehouseId?: number }) => {
    return api.get('business-logic/inventory/valuation-report', params as any);
  },

  /**
   * POST /business-logic/inventory/opening-stock
   * Initialize opening stock for products
   */
  createOpeningStock: async (data: {
    warehouseId: number;
    items: Array<{
      productId: number;
      quantity: number;
      unitCost: number;
      expiryDate?: string;
      batchNumber?: string;
    }>;
    notes?: string;
  }) => {
    return api.post('business-logic/inventory/opening-stock', data);
  },

  /**
   * POST /business-logic/inventory/fix-balance
   * Fix stock balance discrepancies
   */
  fixBalance: async (data: {
    warehouseId: number;
    items: Array<{
      productId: number;
      currentStock: number;
      actualStock: number;
      notes?: string;
    }>;
    notes?: string;
  }) => {
    return api.post('business-logic/inventory/fix-balance', data);
  },
};

// ─── Expense API ─────────────────────────────────────────────

export const expenseApi = {
  /**
   * GET /business-logic/expense
   * List expenses
   */
  list: async (params?: {
    startDate?: string;
    endDate?: string;
    categoryId?: number;
    isApproved?: boolean;
  }) => {
    return api.get('business-logic/expense', params as any);
  },

  /**
   * POST /business-logic/expense
   * Create expense
   */
  create: async (data: any) => {
    return api.post('business-logic/expense', data);
  },

  /**
   * PUT /business-logic/expense/:id/approve
   * Approve expense
   */
  approve: async (id: number) => {
    return api.put('business-logic/expense', id, { status: 'APPROVED' });
  },
};

// ─── Cash API ────────────────────────────────────────────────

export const cashApi = {
  /**
   * GET /business-logic/cash/balance
   * Get cash balance
   */
  getBalance: async (params?: { accountId?: number }) => {
    return api.get<{ accountId: number; accountName: string; balance: number }>(
      'business-logic/cash/balance',
      params as any
    );
  },

  /**
   * POST /business-logic/cash/in
   * Record cash in
   */
  cashIn: async (data: { accountId: number; amount: number; description?: string; referenceType?: string; referenceId?: number }) => {
    return api.post('business-logic/cash/in', data);
  },

  /**
   * POST /business-logic/cash/out
   * Record cash out
   */
  cashOut: async (data: { accountId: number; amount: number; description?: string; referenceType?: string; referenceId?: number }) => {
    return api.post('business-logic/cash/out', data);
  },

  /**
   * POST /business-logic/cash/transfer
   * Transfer cash between accounts
   */
  transfer: async (data: { fromAccountId: number; toAccountId: number; amount: number; description?: string }) => {
    return api.post('business-logic/cash/transfer', data);
  },
};

// ─── Voucher API ─────────────────────────────────────────────

export const voucherApi = {
  /**
   * GET /business-logic/voucher
   * List vouchers
   */
  list: async (params?: { isActive?: boolean; type?: string }) => {
    return api.get('business-logic/voucher', params as any);
  },

  /**
   * POST /business-logic/voucher
   * Create voucher
   */
  create: async (data: any) => {
    return api.post('business-logic/voucher', data);
  },

  /**
   * POST /business-logic/voucher/validate
   * Validate voucher code
   */
  validate: async (code: string, amount?: number) => {
    return api.post<{ isValid: boolean; discount: number; message?: string }>('business-logic/voucher/validate', {
      code,
      amount,
    });
  },
};

// ─── Loyalty API ─────────────────────────────────────────────

export const loyaltyApi = {
  /**
   * GET /business-logic/loyalty/settings
   * Get loyalty point settings
   */
  getSettings: async () => {
    return api.get('business-logic/loyalty/settings');
  },

  /**
   * PATCH /business-logic/loyalty/settings
   * Update loyalty point settings
   */
  updateSettings: async (data: { pointsPerRupiah?: number; minimumRedeemPoints?: number; expiryDays?: number }) => {
    return api.patch('business-logic/loyalty/settings', 0, data);
  },

  /**
   * POST /business-logic/loyalty/calculate
   * Calculate points for transaction
   */
  calculatePoints: async (amount: number) => {
    return api.post<{ points: number; estimatedValue: number }>('business-logic/loyalty/calculate', { amount });
  },

  /**
   * GET /business-logic/loyalty/customer/:customerId
   * Get customer points summary
   */
  getCustomerPoints: async (customerId: number) => {
    return api.get<{ customerId: number; points: number; lifetimePoints: number; redemptionCount: number }>(
      `business-logic/loyalty/customer/${customerId}`
    );
  },

  /**
   * POST /business-logic/loyalty/customer/:customerId/redeem
   * Redeem customer points
   */
  redeemPoints: async (customerId: number, points: number, rewardId?: number) => {
    return api.post(`business-logic/loyalty/customer/${customerId}/redeem`, { points, rewardId });
  },
};

// ─── HRM API ────────────────────────────────────────────────

export const hrmApi = {
  // Employees
  listEmployees: async (params?: { departmentId?: number; isActive?: boolean }) => {
    return api.get('business-logic/hrm/employees', params as any);
  },
  getEmployee: async (id: number) => {
    return api.getOne('business-logic/hrm/employees', id);
  },
  createEmployee: async (data: any) => {
    return api.post('business-logic/hrm/employees', data);
  },
  updateEmployee: async (id: number, data: any) => {
    return api.patch('business-logic/hrm/employees', id, data);
  },

  // Attendance
  listAttendance: async (params?: { employeeId?: number; startDate?: string; endDate?: string }) => {
    return api.get('business-logic/hrm/attendance', params as any);
  },
  recordAttendance: async (data: { employeeId: number; date: string; status: string; notes?: string }) => {
    return api.post('business-logic/hrm/attendance', data);
  },

  // Leaves
  listLeaves: async (params?: { employeeId?: number; status?: string }) => {
    return api.get('business-logic/hrm/leaves', params as any);
  },
  createLeave: async (data: any) => {
    return api.post('business-logic/hrm/leaves', data);
  },
  approveLeave: async (id: number) => {
    return api.put('business-logic/hrm/leaves', id, { status: 'APPROVED' });
  },

  // Payroll
  listPayroll: async (params?: { period?: string; employeeId?: number }) => {
    return api.get('business-logic/hrm/payroll', params as any);
  },
  createPayroll: async (data: any) => {
    return api.post('business-logic/hrm/payroll', data);
  },
  markPayrollPaid: async (id: number) => {
    return api.put('business-logic/hrm/payroll', id, { status: 'PAID' });
  },
};

// ─── Cheque Payment API ───────────────────────────────────────

export interface ChequePayment {
  id: number;
  code: string;
  type: 'SALE' | 'PURCHASE';
  referenceType?: string;
  referenceId?: number;
  bankId?: number;
  bank?: { id: number; code: string; name: string };
  chequeNumber: string;
  chequeDate: string;
  dueDate?: string;
  amount: number;
  status: 'PENDING' | 'CLEARED' | 'BOUNCED' | 'CANCELLED';
  clearedDate?: string;
  bouncedDate?: string;
  notes?: string;
  createdAt: string;
}

export const chequePaymentApi = {
  /**
   * GET /cheque-payment
   * List cheque payments with filters
   */
  list: async (params?: {
    type?: 'SALE' | 'PURCHASE';
    status?: 'PENDING' | 'CLEARED' | 'BOUNCED' | 'CANCELLED';
    bankId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    return api.get<{ count: number; cheques: ChequePayment[] }>('cheque-payment', params as any);
  },

  /**
   * GET /cheque-payment/:id
   * Get cheque payment by ID
   */
  getById: async (id: number) => {
    return api.getOne<ChequePayment>('cheque-payment', id);
  },

  /**
   * POST /cheque-payment
   * Create new cheque payment
   */
  create: async (data: {
    type: 'SALE' | 'PURCHASE';
    referenceType?: string;
    referenceId?: number;
    bankId?: number;
    chequeNumber: string;
    chequeDate: string;
    dueDate?: string;
    amount: number;
    notes?: string;
  }) => {
    return api.post<{ success: boolean; cheque: ChequePayment }>('cheque-payment', data);
  },

  /**
   * PATCH /cheque-payment/:id
   * Update cheque payment
   */
  update: async (id: number, data: {
    bankId?: number;
    chequeNumber?: string;
    dueDate?: string;
    notes?: string;
  }) => {
    return api.patch<{ success: boolean; cheque: ChequePayment }>('cheque-payment', id, data);
  },

  /**
   * PUT /cheque-payment/:id/clear
   * Mark cheque as cleared
   */
  clear: async (id: number, data?: { clearedDate?: string; notes?: string }) => {
    return api.request<{ success: boolean; cheque: ChequePayment }>('PUT', `cheque-payment/${id}/clear`, data || {});
  },

  /**
   * PUT /cheque-payment/:id/bounce
   * Mark cheque as bounced
   */
  bounce: async (id: number, data: { reason: string; bouncedDate?: string }) => {
    return api.request<{ success: boolean; cheque: ChequePayment }>('PUT', `cheque-payment/${id}/bounce`, data);
  },

  /**
   * PUT /cheque-payment/:id/cancel
   * Cancel cheque payment
   */
  cancel: async (id: number, reason: string) => {
    return api.request<{ success: boolean; cheque: ChequePayment }>('PUT', `cheque-payment/${id}/cancel`, { reason });
  },

  /**
   * DELETE /cheque-payment/:id
   * Delete cheque payment
   */
  delete: async (id: number) => {
    return api.request('DELETE', `cheque-payment/${id}`);
  },
};

// ─── Export all APIs ─────────────────────────────────────────

export const businessLogicApi = {
  analytics: analyticsApi,
  reports: reportsApi,
  customers: customersApi,
  pos: posApi,
  stockAlert: stockAlertApi,
  inventory: inventoryApi,
  expense: expenseApi,
  cash: cashApi,
  voucher: voucherApi,
  loyalty: loyaltyApi,
  hrm: hrmApi,
  chequePayment: chequePaymentApi,
};

export default businessLogicApi;
