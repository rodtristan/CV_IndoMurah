// ============================================================
// Ketoko POS TypeScript Types
// Complete type definitions matching Prisma schema + UI
// ============================================================

// ─── Enums ──────────────────────────────────────────────────

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'DEBIT' | 'QRIS' | 'CREDIT';
export type PaymentStatus = 'PENDING' | 'PAID' | 'INSTALMENT' | 'PARTIAL' | 'CANCELLED';
export type TransactionStatus = 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'SENT' | 'RECEIVED' | 'COMPLETED' | 'APPROVED' | 'CANCELLED';
export type StockOpnameStatus = 'PENDING' | 'APPROVED' | 'COMPLETED';
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type ReferenceType = 'PURCHASE' | 'RETURN' | 'ADJUSTMENT' | 'MANUAL';
export type CustomerGroup = 'RETAIL' | 'WHOLESALE' | 'VIP' | 'GENERAL';

// ─── Auth ────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ─── Master Data ─────────────────────────────────────────────

export interface Category {
  id: number;
  code: string;
  name: string;
  icon?: string;
  image?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: { products: number };
}

export interface Brand {
  id: number;
  code: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: { products: number };
}

export interface Unit {
  id: number;
  code: string;
  name: string;
  abbreviation?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  totalDebt: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: number;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  totalReceivable: number;
  customerGroup: CustomerGroup;
  pointBalance: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SalesPerson {
  id: number;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SalePoint {
  id: number;
  code: string;
  name: string;
  warehouseId?: number;
  warehouse?: Warehouse;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  code: string;
  barcode?: string;
  name: string;
  categoryId?: number;
  category?: Category;
  brandId?: number;
  brand?: Brand;
  unitId: number;
  unit?: Unit;
  warehouseId?: number;
  warehouse?: Warehouse;
  purchasePrice: number;
  sellingPrice: number;
  discountPercent: number;
  stock: number;
  minimumStock: number;
  image?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Sales ────────────────────────────────────────────────────

export interface Sale {
  id: number;
  code: string;
  date: string;
  customerId: number;
  customer?: Customer;
  salesPersonId?: number;
  salesPerson?: SalesPerson;
  salePointId?: number;
  salePoint?: SalePoint;
  warehouseId?: number;
  warehouse?: Warehouse;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  cashAmount: number;
  changeAmount: number;
  paymentStatus: PaymentStatus;
  isReturn: boolean;
  returnedAt?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdById: string;
  creator?: User;
  createdAt: string;
  updatedAt?: string;
  saleItems?: SaleItem[];
  salePayments?: SalePayment[];
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  product?: Product;
  unitId?: number;
  unit?: Unit;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  createdAt: string;
}

export interface SalePayment {
  id: number;
  saleId: number;
  method: PaymentMethod;
  amount: number;
  referenceNumber?: string;
  date: string;
  notes?: string;
  createdById: string;
  creator?: User;
  createdAt: string;
}

export interface SaleReturn {
  id: number;
  code: string;
  date: string;
  saleId: number;
  sale?: Sale;
  customerId: number;
  customer?: Customer;
  warehouseId?: number;
  warehouse?: Warehouse;
  totalReturn: number;
  reason?: string;
  status: TransactionStatus;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
  returnItems?: SaleReturnItem[];
}

export interface SaleReturnItem {
  id: number;
  saleReturnId: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// ─── Purchases ───────────────────────────────────────────────

export interface PurchaseOrder {
  id: number;
  code: string;
  date: string;
  supplierId: number;
  supplier?: Supplier;
  warehouseId?: number;
  warehouse?: Warehouse;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  downPayment: number;
  paymentStatus: PaymentStatus;
  dueDate?: string;
  isInvoice: boolean;
  status: TransactionStatus;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
  purchaseOrderItems?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  productId: number;
  product?: Product;
  unitId: number;
  unit?: Unit;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
}

export interface Purchase {
  id: number;
  code: string;
  date: string;
  supplierId: number;
  supplier?: Supplier;
  warehouseId?: number;
  warehouse?: Warehouse;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  paid: number;
  remaining: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  dueDate?: string;
  isReturn: boolean;
  status: TransactionStatus;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
  purchaseItems?: PurchaseItem[];
  purchasePayments?: PurchasePayment[];
}

export interface PurchaseItem {
  id: number;
  purchaseId: number;
  productId: number;
  product?: Product;
  unitId: number;
  unit?: Unit;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
}

export interface PurchasePayment {
  id: number;
  purchaseId: number;
  method: PaymentMethod;
  amount: number;
  referenceNumber?: string;
  date: string;
  notes?: string;
  createdById: string;
  createdAt: string;
}

export interface PurchaseReturn {
  id: number;
  code: string;
  date: string;
  purchaseId: number;
  purchase?: Purchase;
  supplierId: number;
  supplier?: Supplier;
  warehouseId?: number;
  warehouse?: Warehouse;
  totalReturn: number;
  reason?: string;
  status: TransactionStatus;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
  returnItems?: PurchaseReturnItem[];
}

export interface PurchaseReturnItem {
  id: number;
  purchaseReturnId: number;
  productId: number;
  product?: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

// ─── Inventory ────────────────────────────────────────────────

export interface StockIn {
  id: number;
  code: string;
  date: string;
  warehouseId: number;
  warehouse?: Warehouse;
  supplierId?: number;
  supplier?: Supplier;
  referenceType?: ReferenceType;
  referenceId?: number;
  totalItems: number;
  description?: string;
  status: TransactionStatus;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
  stockInItems?: StockInItem[];
}

export interface StockInItem {
  id: number;
  stockInId: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitId: number;
  unit?: Unit;
  unitPrice: number;
  subtotal: number;
}

export interface StockOut {
  id: number;
  code: string;
  date: string;
  warehouseId: number;
  warehouse?: Warehouse;
  referenceType?: ReferenceType;
  referenceId?: number;
  totalItems: number;
  description?: string;
  status: TransactionStatus;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
  stockOutItems?: StockOutItem[];
}

export interface StockOutItem {
  id: number;
  stockOutId: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitId: number;
  unit?: Unit;
  unitPrice: number;
  subtotal: number;
}

export interface StockTransfer {
  id: number;
  code: string;
  date: string;
  fromWarehouseId: number;
  fromWarehouse?: Warehouse;
  toWarehouseId: number;
  toWarehouse?: Warehouse;
  totalItems: number;
  status: TransactionStatus;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
  transferItems?: StockTransferItem[];
}

export interface StockTransferItem {
  id: number;
  stockTransferId: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitId: number;
  unit?: Unit;
  unitPrice: number;
  subtotal: number;
}

export interface StockOpname {
  id: number;
  code: string;
  date: string;
  warehouseId: number;
  warehouse?: Warehouse;
  totalItems: number;
  status: StockOpnameStatus;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
  opnameItems?: StockOpnameItem[];
}

export interface StockOpnameItem {
  id: number;
  stockOpnameId: number;
  productId: number;
  product?: Product;
  systemStock: number;
  countedStock: number;
  difference: number;
  unitId: number;
  unit?: Unit;
  unitPrice: number;
  note?: string;
}

// ─── Accounting ──────────────────────────────────────────────

export interface Account {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  parentId?: number;
  parent?: Account;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  children?: Account[];
}

export interface Journal {
  id: number;
  code: string;
  date: string;
  description?: string;
  referenceType?: string;
  referenceId?: number;
  isPosted: boolean;
  postedAt?: string;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
  journalEntries?: JournalEntry[];
}

export interface JournalEntry {
  id: number;
  journalId: number;
  accountId: number;
  account?: Account;
  debit: number;
  credit: number;
  memo?: string;
}

export interface CashIn {
  id: number;
  code: string;
  date: string;
  accountId: number;
  account?: Account;
  amount: number;
  description?: string;
  referenceType?: string;
  referenceId?: number;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CashOut {
  id: number;
  code: string;
  date: string;
  accountId: number;
  account?: Account;
  amount: number;
  description?: string;
  referenceType?: string;
  referenceId?: number;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CashTransfer {
  id: number;
  code: string;
  date: string;
  fromAccountId: number;
  fromAccount?: Account;
  toAccountId: number;
  toAccount?: Account;
  amount: number;
  description?: string;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerDeposit {
  id: number;
  code: string;
  date: string;
  customerId: number;
  customer?: Customer;
  amount: number;
  remainingAmount: number;
  description?: string;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SupplierDeposit {
  id: number;
  code: string;
  date: string;
  supplierId: number;
  supplier?: Supplier;
  amount: number;
  remainingAmount: number;
  description?: string;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Reports ──────────────────────────────────────────────────

export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  grossProfit: number;
  netProfit: number;
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalSuppliers: number;
  newOrders: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalReceivable: number;
  totalPayable: number;
}

export interface ChartDataPoint {
  label: string;
  sales: number;
  purchases: number;
  profit: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  quantity: number;
  totalSales: number;
}

export interface SalesReport {
  summary: {
    totalSales: number;
    totalTransactions: number;
    totalItems: number;
    averageTransaction: number;
  };
  byDate: { date: string; totalSales: number; totalTransactions: number; totalItems: number; averageTransaction: number }[];
  byCustomer?: { customerId: number; customerName: string; totalSales: number; totalTransactions: number }[];
  byProduct: TopProduct[];
}

export interface InventoryReport {
  totalItems: number;
  totalValue: number;
  totalCost: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface ProfitLossReport {
  period: { startDate: string; endDate: string };
  income: { total: number; items: { description: string; amount: number }[] };
  expenses: { total: number; items: { accountName: string; amount: number }[] };
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

export interface CashReport {
  cashIns: number;
  cashOuts: number;
  netCash: number;
  byAccount: Array<{ accountId: number; accountName: string; cashIn: number; cashOut: number; balance: number }>;
}

export interface DebtReport {
  suppliers: Array<{ supplierId: number; supplierName: string; totalDebt: number; purchaseCount: number }>;
  totalDebt: number;
}

export interface ReceivableReport {
  customers: Array<{ customerId: number; customerName: string; totalReceivable: number; transactionCount: number }>;
  totalReceivable: number;
}

// ─── UI Types ────────────────────────────────────────────────

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  data?: Record<string, unknown>;
}

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  format?: (value: unknown, row: T) => string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterParams {
  search?: string;
  status?: string;
  warehouseId?: number;
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: unknown;
}

// ─── POS Context ─────────────────────────────────────────────

export interface CartItem {
  productId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
}

export interface POSState {
  cart: CartItem[];
  customer: Customer | null;
  salesPerson: SalesPerson | null;
  salePoint: SalePoint | null;
  warehouse: Warehouse | null;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  paymentMethod: PaymentMethod;
  cashAmount: number;
  notes: string;
}
