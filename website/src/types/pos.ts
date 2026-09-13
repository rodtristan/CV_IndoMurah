// ============================================================
// POS TypeScript Types for CV IndoMurah
// ============================================================

// ─── User & Auth ───────────────────────────────────────────
export interface POSUser {
  id: number;
  companyId: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  photoUrl?: string;
}

export interface LoginRequest {
  companyId: string;
  userId: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
  user: POSUser;
  expiresAt: string;
}

// ─── Menu ───────────────────────────────────────────────────
export interface MenuItem {
  id: number;
  name: string;
  icon?: string;
  href?: string;
  children?: MenuItem[];
  isActive?: boolean;
}

// ─── Master Data ────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Unit {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  contactPerson?: string;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: number;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  customerType: "retail" | "wholesale" | "vip";
  pointBalance: number;
  notes?: string;
  createdAt: string;
}

export interface SalesPerson {
  id: number;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  address?: string;
  isDefault: boolean;
}

export interface Product {
  id: number;
  code: string;
  barcode?: string;
  sku?: string;
  name: string;
  categoryId?: number;
  categoryName?: string;
  unitId: number;
  unitName: string;
  brandId?: number;
  brandName?: string;
  itemType?: string; // Jenis item
  rack?: string; // Rak location
  purchasePrice: number;
  costPrice?: number; // Harga Pokok
  hppAverage?: number; // HPP Rata-rata (AVG)
  sellPrice: number;
  stock: number;
  minStock: number;
  warehouseId?: number;
  warehouseName?: string;
  imageUrl?: string;
  notes?: string; // Keterangan
  isActive: boolean;
  isDiscontinued?: boolean; // Tidak Dijual / Discontinued
  createdAt: string;
}

// ─── Transactions ───────────────────────────────────────────
export interface PurchaseOrder {
  id: number;
  code: string;
  supplierId: number;
  supplierName: string;
  date: string;
  dueDate?: string;
  total: number;
  status: "draft" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  unitName: string;
  price: number;
  discount: number;
  subtotal: number;
}

export interface Purchase {
  id: number;
  code: string;
  purchaseOrderId?: number;
  supplierId: number;
  supplierName: string;
  date: string;
  dueDate?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paid: number;
  remaining: number;
  status: "pending" | "partial" | "paid" | "cancelled";
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface SaleOrder {
  id: number;
  code: string;
  customerId: number;
  customerName: string;
  date: string;
  dueDate?: string;
  total: number;
  status: "draft" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Sale {
  id: number;
  code: string;
  saleOrderId?: number;
  customerId: number;
  customerName: string;
  salesPersonId?: number;
  salesPersonName?: string;
  date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paid: number;
  remaining: number;
  paymentMethod?: "cash" | "debit" | "credit" | "qris" | "transfer";
  status: "pending" | "partial" | "paid" | "cancelled";
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface SaleItem {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  unitName: string;
  price: number;
  discount: number;
  subtotal: number;
}

// ─── Inventory ─────────────────────────────────────────────
export interface StockIn {
  id: number;
  code: string;
  date: string;
  warehouseId: number;
  warehouseName: string;
  reference?: string;
  notes?: string;
  total: number;
  createdBy: string;
  createdAt: string;
}

export interface StockOut {
  id: number;
  code: string;
  date: string;
  warehouseId: number;
  warehouseName: string;
  reference?: string;
  notes?: string;
  total: number;
  createdBy: string;
  createdAt: string;
}

export interface StockTransfer {
  id: number;
  code: string;
  date: string;
  fromWarehouseId: number;
  fromWarehouseName: string;
  toWarehouseId: number;
  toWarehouseName: string;
  notes?: string;
  total: number;
  status: "draft" | "sent" | "received" | "cancelled";
  createdBy: string;
  createdAt: string;
}

export interface StockOpname {
  id: number;
  code: string;
  date: string;
  warehouseId: number;
  warehouseName: string;
  notes?: string;
  status: "draft" | "completed";
  createdBy: string;
  createdAt: string;
}

export interface MinimumStockItem {
  productId: number;
  productCode: string;
  productName: string;
  warehouseName: string;
  currentStock: number;
  minStock: number;
  shortage: number;
}

// ─── Accounting ────────────────────────────────────────────
export interface Account {
  id: number;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  parentId?: number;
  isActive: boolean;
}

export interface CashIn {
  id: number;
  code: string;
  date: string;
  accountId: number;
  accountName: string;
  description: string;
  amount: number;
  reference?: string;
  createdBy: string;
  createdAt: string;
}

export interface CashOut {
  id: number;
  code: string;
  date: string;
  accountId: number;
  accountName: string;
  description: string;
  amount: number;
  reference?: string;
  createdBy: string;
  createdAt: string;
}

export interface CashTransfer {
  id: number;
  code: string;
  date: string;
  fromAccountId: number;
  fromAccountName: string;
  toAccountId: number;
  toAccountName: string;
  amount: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface JournalEntry {
  id: number;
  code: string;
  date: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  createdBy: string;
  createdAt: string;
}

export interface JournalItem {
  accountId: number;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

// ─── Reports ────────────────────────────────────────────────
export interface ReportFilter {
  startDate: string;
  endDate: string;
  warehouseId?: number;
  categoryId?: number;
  supplierId?: number;
  customerId?: number;
  status?: string;
}

export interface ReportSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  transactionCount: number;
}

export interface InventorySummary {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

// ─── Common ─────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableSort {
  key: string;
  direction: "asc" | "desc";
}

export interface TableFilter {
  search?: string;
  status?: string;
  warehouseId?: number;
  [key: string]: unknown;
}
