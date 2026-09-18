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
  ID: string;
  Username?: string;
  Email?: string;
  Name: string;
  Role: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
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
  ID: number;
  Code: string;
  Name: string;
  Icon?: string;
  Image?: string;
  Description?: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
  _count?: { Products: number };
}

export interface Brand {
  ID: number;
  Code: string;
  Name: string;
  Description?: string;
  LogoUrl?: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
  _count?: { Products: number };
}

export interface Unit {
  ID: number;
  Code: string;
  Name: string;
  Abbreviation?: string;
  Description?: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
}

export interface Warehouse {
  ID: number;
  Code: string;
  Name: string;
  Address?: string;
  Phone?: string;
  IsDefault: boolean;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
}

export interface Supplier {
  ID: number;
  Code: string;
  Name: string;
  ContactPerson?: string;
  Phone?: string;
  Email?: string;
  Address?: string;
  TotalDebt: number;
  Notes?: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
}

export interface Customer {
  ID: number;
  Code: string;
  Name: string;
  Phone?: string;
  Email?: string;
  Address?: string;
  TotalReceivable: number;
  CustomerGroupID: number;
  CustomerGroup?: { ID: number; Name: string; [key: string]: unknown };
  PointBalance: number;
  Notes?: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
}

export interface SalesPerson {
  ID: number;
  Code: string;
  Name: string;
  Phone?: string;
  Email?: string;
  Address?: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
}

export interface SalePoint {
  ID: number;
  Code: string;
  Name: string;
  WarehouseID?: number;
  Warehouse?: Warehouse;
  Description?: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
}

export interface Product {
  ID: number;
  Code: string;
  Barcode?: string;
  Name: string;
  CategoryID?: number;
  Category?: Category;
  BrandID?: number;
  Brand?: Brand;
  UnitID: number;
  Unit?: Unit;
  WarehouseID?: number;
  Warehouse?: Warehouse;
  ProductGroupID?: number;
  ProductGroup?: { ID: number; Name: string; [key: string]: unknown };
  PurchasePrice: number;
  SellingPrice: number;
  DiscountPercent: number;
  Stock: number;
  MinimumStock: number;
  Image?: string;
  Description?: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
}

// ─── Sales ────────────────────────────────────────────────────

export interface Sale {
  ID: number;
  Code: string;
  Date: string;
  CustomerID: number;
  Customer?: Customer;
  SalesPersonID?: number;
  SalesPerson?: SalesPerson;
  SalePointID?: number;
  SalePoint?: SalePoint;
  WarehouseID?: number;
  Warehouse?: Warehouse;
  Subtotal: number;
  DiscountPercent: number;
  DiscountAmount: number;
  TaxPercent: number;
  TaxAmount: number;
  Total: number;
  CashAmount: number;
  ChangeAmount: number;
  PaymentStatusID: number;
  PaymentStatus?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  IsReturn: boolean;
  ReturnedAt?: string;
  PaymentMethodID?: number;
  PaymentMethod?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  Notes?: string;
  ShippingStatus?: string;
  ShippingDate?: string;
  TrackingNumber?: string;
  CreatedByID: string;
  Creator?: User;
  CreatedAt: string;
  UpdatedAt?: string;
  SaleItems?: SaleItem[];
  SalePayments?: SalePayment[];
}

export interface SaleItem {
  ID: number;
  SaleID: number;
  ProductID: number;
  Product?: Product;
  UnitID?: number;
  Unit?: Unit;
  Quantity: number;
  UnitPrice: number;
  DiscountPercent: number;
  DiscountAmount: number;
  Subtotal: number;
  CreatedAt: string;
}

export interface SalePayment {
  ID: number;
  SaleID: number;
  MethodID: number;
  Method?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  Amount: number;
  ReferenceNumber?: string;
  Date: string;
  Notes?: string;
  CreatedByID: string;
  Creator?: User;
  CreatedAt: string;
}

export interface SaleReturn {
  ID: number;
  Code: string;
  Date: string;
  SaleID: number;
  Sale?: Sale;
  CustomerID: number;
  Customer?: Customer;
  WarehouseID?: number;
  Warehouse?: Warehouse;
  TotalReturn: number;
  Reason?: string;
  StatusID: number;
  Status?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  CreatedByID: string;
  CreatedAt: string;
  UpdatedAt?: string;
  ReturnItems?: SaleReturnItem[];
}

export interface SaleReturnItem {
  ID: number;
  SaleReturnID: number;
  ProductID: number;
  Product?: Product;
  Quantity: number;
  UnitPrice: number;
  Subtotal: number;
}

// ─── Purchases ───────────────────────────────────────────────

export interface PurchaseOrder {
  ID: number;
  Code: string;
  Date: string;
  SupplierID: number;
  Supplier?: Supplier;
  WarehouseID?: number;
  Warehouse?: Warehouse;
  Subtotal: number;
  DiscountPercent: number;
  DiscountAmount: number;
  TaxPercent: number;
  TaxAmount: number;
  Total: number;
  DownPayment: number;
  PaymentStatusID: number;
  PaymentStatus?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  DueDate?: string;
  IsInvoice: boolean;
  PurchaseID?: number;
  StatusID: number;
  Status?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  Notes?: string;
  CreatedByID: string;
  CreatedAt: string;
  UpdatedAt?: string;
  PurchaseOrderItems?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  ID: number;
  PurchaseOrderID: number;
  ProductID: number;
  Product?: Product;
  UnitID: number;
  Unit?: Unit;
  Quantity: number;
  UnitPrice: number;
  DiscountPercent: number;
  DiscountAmount: number;
  Subtotal: number;
}

export interface Purchase {
  ID: number;
  Code: string;
  Date: string;
  SupplierID: number;
  Supplier?: Supplier;
  WarehouseID?: number;
  Warehouse?: Warehouse;
  Subtotal: number;
  DiscountPercent: number;
  DiscountAmount: number;
  TaxPercent: number;
  TaxAmount: number;
  Total: number;
  Paid: number;
  Remaining: number;
  PaymentStatusID: number;
  PaymentStatus?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  PaymentMethodID?: number;
  PaymentMethod?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  DueDate?: string;
  IsReturn: boolean;
  StatusID: number;
  Status?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  Notes?: string;
  CreatedByID: string;
  CreatedAt: string;
  UpdatedAt?: string;
  PurchaseItems?: PurchaseItem[];
  PurchasePayments?: PurchasePayment[];
}

export interface PurchaseItem {
  ID: number;
  PurchaseID: number;
  ProductID: number;
  Product?: Product;
  UnitID: number;
  Unit?: Unit;
  Quantity: number;
  UnitPrice: number;
  DiscountPercent: number;
  DiscountAmount: number;
  Subtotal: number;
}

export interface PurchasePayment {
  ID: number;
  PurchaseID: number;
  MethodID: number;
  Method?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  Amount: number;
  ReferenceNumber?: string;
  Date: string;
  Notes?: string;
  CreatedByID: string;
  CreatedAt: string;
}

export interface PurchaseReturn {
  ID: number;
  Code: string;
  Date: string;
  PurchaseID: number;
  Purchase?: Purchase;
  SupplierID: number;
  Supplier?: Supplier;
  WarehouseID?: number;
  Warehouse?: Warehouse;
  TotalReturn: number;
  Reason?: string;
  StatusID: number;
  Status?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  CreatedByID: string;
  CreatedAt: string;
  UpdatedAt?: string;
  ReturnItems?: PurchaseReturnItem[];
}

export interface PurchaseReturnItem {
  ID: number;
  PurchaseReturnID: number;
  ProductID: number;
  Product?: Product;
  Quantity: number;
  UnitPrice: number;
  Subtotal: number;
}

// ─── Inventory ────────────────────────────────────────────────

export interface StockIn {
  ID: number;
  Code: string;
  Date: string;
  WarehouseID: number;
  Warehouse?: Warehouse;
  SupplierID?: number;
  Supplier?: Supplier;
  ReferenceTypeID?: number;
  ReferenceType?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  ReferenceID?: number;
  TotalItems: number;
  Description?: string;
  StatusID: number;
  Status?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  CreatedByID: string;
  CreatedAt: string;
  UpdatedAt?: string;
  StockInItems?: StockInItem[];
}

export interface StockInItem {
  ID: number;
  StockInID: number;
  ProductID: number;
  Product?: Product;
  Quantity: number;
  UnitID: number;
  Unit?: Unit;
  UnitPrice: number;
  Subtotal: number;
}

export interface StockOut {
  ID: number;
  Code: string;
  Date: string;
  WarehouseID: number;
  Warehouse?: Warehouse;
  ReferenceTypeID?: number;
  ReferenceType?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  ReferenceID?: number;
  TotalItems: number;
  Description?: string;
  StatusID: number;
  Status?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  CreatedByID: string;
  CreatedAt: string;
  UpdatedAt?: string;
  StockOutItems?: StockOutItem[];
}

export interface StockOutItem {
  ID: number;
  StockOutID: number;
  ProductID: number;
  Product?: Product;
  Quantity: number;
  UnitID: number;
  Unit?: Unit;
  UnitPrice: number;
  Subtotal: number;
}

export interface StockTransfer {
  ID: number;
  Code: string;
  Date: string;
  FromWarehouseID: number;
  FromWarehouse?: Warehouse;
  ToWarehouseID: number;
  ToWarehouse?: Warehouse;
  TotalItems: number;
  StatusID: number;
  Status?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  Notes?: string;
  CreatedByID: string;
  CreatedAt: string;
  UpdatedAt?: string;
  TransferItems?: StockTransferItem[];
}

export interface StockTransferItem {
  ID: number;
  StockTransferID: number;
  ProductID: number;
  Product?: Product;
  Quantity: number;
  UnitID: number;
  Unit?: Unit;
  UnitPrice: number;
  Subtotal: number;
}

export interface StockOpname {
  ID: number;
  Code: string;
  Date: string;
  WarehouseID: number;
  Warehouse?: Warehouse;
  TotalItems: number;
  StatusID: number;
  Status?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  Notes?: string;
  CreatedByID: string;
  CreatedAt: string;
  UpdatedAt?: string;
  OpnameItems?: StockOpnameItem[];
}

export interface StockOpnameItem {
  ID: number;
  StockOpnameID: number;
  ProductID: number;
  Product?: Product;
  SystemStock: number;
  CountedStock: number;
  Difference: number;
  UnitID: number;
  Unit?: Unit;
  UnitPrice: number;
  Note?: string;
}

// ─── Accounting ──────────────────────────────────────────────

export interface Account {
  ID: number;
  Code: string;
  Name: string;
  TypeID: number;
  Type?: { ID: number; Code: string; Name?: string; [key: string]: unknown };
  ParentID?: number;
  Parent?: Account;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
  Children?: Account[];
}

export interface Journal {
  ID: number;
  Code: string;
  Date: string;
  Description?: string;
  ReferenceType?: string;
  ReferenceID?: number;
  IsPosted: boolean;
  PostedAt?: string;
  CreatedByID: string;
  CreatedAt: string;
  UpdatedAt?: string;
  JournalEntries?: JournalEntry[];
}

export interface JournalEntry {
  ID: number;
  JournalID: number;
  AccountID: number;
  Account?: Account;
  Debit: number;
  Credit: number;
  Memo?: string;
}

export interface CashIn {
  ID: number;
  Code: string;
  Date: string;
  AccountID: number;
  Account?: Account;
  Amount: number;
  Description?: string;
  ReferenceType?: string;
  ReferenceID?: number;
  CreatedByID: string;
  CreatedAt: string;
  UpdatedAt?: string;
}

export interface CashOut {
  ID: number;
  Code: string;
  Date: string;
  AccountID: number;
  Account?: Account;
  Amount: number;
  Description?: string;
  ReferenceType?: string;
  ReferenceID?: number;
  CreatedByID: string;
  CreatedAt: string;
  UpdatedAt?: string;
}

export interface CashTransfer {
  ID: number;
  Code: string;
  Date: string;
  FromAccountID: number;
  FromAccount?: Account;
  ToAccountID: number;
  ToAccount?: Account;
  Amount: number;
  Description?: string;
  CreatedByID: string;
  CreatedAt: string;
  UpdatedAt?: string;
}

export interface CustomerDeposit {
  ID: number;
  Code: string;
  Date: string;
  CustomerID: number;
  Customer?: Customer;
  Amount: number;
  RemainingAmount: number;
  Description?: string;
  CreatedByID: string;
  CreatedAt: string;
  UpdatedAt?: string;
}

export interface SupplierDeposit {
  ID: number;
  Code: string;
  Date: string;
  SupplierID: number;
  Supplier?: Supplier;
  Amount: number;
  RemainingAmount: number;
  Description?: string;
  CreatedByID: string;
  CreatedAt: string;
  UpdatedAt?: string;
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
