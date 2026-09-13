// ============================================================
// POS TypeScript Types for CV IndoMurah
// Generated from Prisma Schema
// ============================================================

import type React from 'react';

// ─── Enums ────────────────────────────────────────────────

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'DEBIT' | 'QRIS' | 'CREDIT';

export type PaymentStatus = 'PENDING' | 'PAID' | 'INSTALMENT' | 'PARTIAL' | 'CANCELLED';

export type TransactionStatus = 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'SENT' | 'RECEIVED' | 'COMPLETED' | 'APPROVED' | 'CANCELLED';

export type StockOpnameStatus = 'PENDING' | 'APPROVED' | 'COMPLETED';

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export type ReferenceType = 'PURCHASE' | 'RETURN' | 'ADJUSTMENT' | 'MANUAL';

export type CustomerGroup = 'RETAIL' | 'WHOLESALE' | 'VIP' | 'GENERAL';

// ─── User & Auth ───────────────────────────────────────────

export interface POSUser {
  id: string;
  companyId?: string;
  userId?: string;
  email: string;
  name: string;
  role: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
  user: POSUser;
  expiresAt: string;
}

// ─── Menu ───────────────────────────────────────────────────

export interface Menu {
  id: number;
  menuName: string;
  menuType?: string;
  icon?: string;
  route?: string;
  parentMenuId?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
  childMenus?: Menu[];
}

export interface Role {
  id: number;
  roleName: string;
  roleDescription?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserRole {
  id: number;
  userId: string;
  roleId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface RoleMenu {
  id: number;
  roleId: number;
  menuId: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserMenu {
  id: number;
  userId: string;
  menuId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Company & Settings ─────────────────────────────────────

export interface Company {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  taxId?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PointSetting {
  id: number;
  name: string;
  pointsPerRupiah: number;
  minimumTransaction: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Master Data: Category ───────────────────────────────────

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
  productCount?: number;
}

// ─── Master Data: Brand ─────────────────────────────────────

export interface Brand {
  id: number;
  code: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  productCount?: number;
}

// ─── Master Data: Unit ──────────────────────────────────────

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

// ─── Master Data: Warehouse ──────────────────────────────────

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

// ─── Master Data: Supplier ───────────────────────────────────

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

// ─── Master Data: Customer ──────────────────────────────────

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

// ─── Master Data: SalesPerson ────────────────────────────────

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

// ─── Master Data: SalePoint ─────────────────────────────────

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

// ─── Master Data: Product ───────────────────────────────────

export interface Product {
  id: number;
  code: string;
  barcode?: string;
  sku?: string;
  name: string;
  categoryId?: number;
  category?: Category;
  brandId?: number;
  brand?: Brand;
  brandName?: string; // Ketoko: brand name for display
  itemType?: string; // Ketoko: Jenis item
  rack?: string; // Ketoko: Rak location
  unitId: number;
  unit?: Unit;
  purchasePrice: number;
  sellingPrice: number; // alias for sellPrice for compatibility
  sellPrice: number; // alias for sellingPrice
  costPrice?: number; // Ketoko: Harga Pokok
  hppAverage?: number; // Ketoko: HPP Rata-rata (AVG)
  discountPercent: number;
  stock: number;
  minStock: number; // alias for minimumStock
  minimumStock: number;
  warehouseId?: number;
  warehouse?: Warehouse;
  warehouseName?: string; // Ketoko: warehouse name for display
  imageUrl?: string; // Ketoko: image URL
  image?: string; // alias for imageUrl
  description?: string; // alias for notes
  notes?: string; // Ketoko: Keterangan
  isActive: boolean;
  isDiscontinued?: boolean; // Tidak Dijual / Discontinued
  createdAt: string;
  updatedAt?: string;
}

// ─── Master Data: ProductStock ───────────────────────────────

export interface ProductStock {
  id: number;
  productId: number;
  product?: Product;
  warehouseId: number;
  warehouse?: Warehouse;
  quantity: number;
  minimumStock: number;
  updatedAt?: string;
}

// ─── Point Redemption ────────────────────────────────────────

export interface PointRedemption {
  id: number;
  customerId: number;
  customer?: Customer;
  code: string;
  pointsRedeemed: number;
  rewardName: string;
  rewardValue: number;
  date: string;
  createdById: string;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SALE TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Sale ───────────────────────────────────────────────────

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
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
  saleItems?: SaleItem[];
  salePayments?: SalePayment[];
  saleReturns?: SaleReturn[];
}

// ─── Sale Item ──────────────────────────────────────────────

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

// ─── Sale Payment ────────────────────────────────────────────

export interface SalePayment {
  id: number;
  saleId: number;
  sale?: Sale;
  method: PaymentMethod;
  amount: number;
  referenceNumber?: string;
  date: string;
  notes?: string;
  createdById: string;
  creator?: POSUser;
  createdAt: string;
}

// ─── Sale Return ────────────────────────────────────────────

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
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
  returnItems?: SaleReturnItem[];
}

// ─── Sale Return Item ───────────────────────────────────────

export interface SaleReturnItem {
  id: number;
  saleReturnId: number;
  saleReturn?: SaleReturn;
  productId: number;
  product?: Product;
  unitId?: number;
  unit?: Unit;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PURCHASE TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Purchase Order ─────────────────────────────────────────

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
  purchaseId?: number;
  status: TransactionStatus;
  notes?: string;
  createdById: string;
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
  purchaseOrderItems?: PurchaseOrderItem[];
}

// ─── Purchase Order Item ────────────────────────────────────

export interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  purchaseOrder?: PurchaseOrder;
  productId: number;
  product?: Product;
  quantity: number;
  unitId: number;
  unit?: Unit;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  createdAt: string;
}

// ─── Purchase ───────────────────────────────────────────────

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
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
  purchaseItems?: PurchaseItem[];
  purchasePayments?: PurchasePayment[];
  purchaseReturns?: PurchaseReturn[];
}

// ─── Purchase Item ──────────────────────────────────────────

export interface PurchaseItem {
  id: number;
  purchaseId: number;
  purchase?: Purchase;
  productId: number;
  product?: Product;
  quantity: number;
  unitId: number;
  unit?: Unit;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  createdAt: string;
}

// ─── Purchase Payment ───────────────────────────────────────

export interface PurchasePayment {
  id: number;
  purchaseId: number;
  purchase?: Purchase;
  method: PaymentMethod;
  amount: number;
  referenceNumber?: string;
  date: string;
  notes?: string;
  createdById: string;
  creator?: POSUser;
  createdAt: string;
}

// ─── Purchase Return ────────────────────────────────────────

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
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
  returnItems?: PurchaseReturnItem[];
}

// ─── Purchase Return Item ───────────────────────────────────

export interface PurchaseReturnItem {
  id: number;
  purchaseReturnId: number;
  purchaseReturn?: PurchaseReturn;
  productId: number;
  product?: Product;
  quantity: number;
  unitId: number;
  unit?: Unit;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Stock In ───────────────────────────────────────────────

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
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
  stockInItems?: StockInItem[];
}

// ─── Stock In Item ───────────────────────────────────────────

export interface StockInItem {
  id: number;
  stockInId: number;
  stockIn?: StockIn;
  productId: number;
  product?: Product;
  quantity: number;
  unitId: number;
  unit?: Unit;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
}

// ─── Stock Out ───────────────────────────────────────────────

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
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
  stockOutItems?: StockOutItem[];
}

// ─── Stock Out Item ──────────────────────────────────────────

export interface StockOutItem {
  id: number;
  stockOutId: number;
  stockOut?: StockOut;
  productId: number;
  product?: Product;
  quantity: number;
  unitId: number;
  unit?: Unit;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
}

// ─── Stock Transfer ──────────────────────────────────────────

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
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
  transferItems?: StockTransferItem[];
}

// ─── Stock Transfer Item ─────────────────────────────────────

export interface StockTransferItem {
  id: number;
  stockTransferId: number;
  stockTransfer?: StockTransfer;
  productId: number;
  product?: Product;
  quantity: number;
  unitId: number;
  unit?: Unit;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
}

// ─── Stock Opname ────────────────────────────────────────────

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
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
  opnameItems?: StockOpnameItem[];
}

// ─── Stock Opname Item ───────────────────────────────────────

export interface StockOpnameItem {
  id: number;
  stockOpnameId: number;
  stockOpname?: StockOpname;
  productId: number;
  product?: Product;
  systemStock: number;
  countedStock: number;
  difference: number;
  unitId: number;
  unit?: Unit;
  unitPrice: number;
  note?: string;
  createdAt: string;
}

// ─── Minimum Stock Item ──────────────────────────────────────

export interface MinimumStockItem {
  productId: number;
  productCode: string;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  currentStock: number;
  minimumStock: number;
  shortage: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACCOUNTING
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Account ────────────────────────────────────────────────

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
}

// ─── Journal ─────────────────────────────────────────────────

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
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
  journalEntries?: JournalEntry[];
}

// ─── Journal Entry ───────────────────────────────────────────

export interface JournalEntry {
  id: number;
  journalId: number;
  journal?: Journal;
  accountId: number;
  account?: Account;
  debit: number;
  credit: number;
  memo?: string;
  userId?: string;
  createdAt: string;
}

// ─── Cash In ─────────────────────────────────────────────────

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
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
}

// ─── Cash Out ────────────────────────────────────────────────

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
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
}

// ─── Cash Transfer ───────────────────────────────────────────

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
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
}

// ─── Customer Deposit ────────────────────────────────────────

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
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
}

// ─── Supplier Deposit ────────────────────────────────────────

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
  creator?: POSUser;
  createdAt: string;
  updatedAt?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

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
  productCode: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface RecentTransaction {
  id: number;
  code: string;
  type: 'sale' | 'purchase' | 'return' | 'payment';
  date: string;
  total: number;
  status: TransactionStatus | PaymentStatus;
  customerName?: string;
  supplierName?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  warehouseId?: number;
  categoryId?: number;
  supplierId?: number;
  customerId?: number;
  productId?: number;
  salesPersonId?: number;
  paymentMethod?: PaymentMethod;
  status?: string;
  search?: string;
}

export interface ReportSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  transactionCount: number;
  averageTransaction: number;
}

export interface InventorySummary {
  totalItems: number;
  totalValue: number;
  totalCost: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface SalesReport {
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  topProducts: TopProduct[];
  salesByPaymentMethod: Record<PaymentMethod, number>;
  salesByDate: ChartDataPoint[];
}

export interface ProfitLossReport {
  totalRevenue: number;
  totalCostOfGoodsSold: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMON TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
  render?: (value: unknown, row: T, index?: number) => React.ReactNode;
  format?: (value: unknown, row: T) => string | number;
}

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TableFilter {
  search?: string;
  status?: string;
  warehouseId?: number;
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: unknown;
}

// ─── Form Types ──────────────────────────────────────────────

export interface FormFieldBase {
  name: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
}

export interface FormFieldText extends FormFieldBase {
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface FormFieldSelect<T = SelectOption> extends FormFieldBase {
  type: 'select';
  options: T[];
  defaultValue?: string | number;
  allowClear?: boolean;
  allowSearch?: boolean;
}

export interface FormFieldDate extends FormFieldBase {
  type: 'date' | 'datetime' | 'time';
  defaultValue?: string;
  minDate?: string;
  maxDate?: string;
}

export interface FormFieldSwitch extends FormFieldBase {
  type: 'switch';
  defaultChecked?: boolean;
  checkedChildren?: string;
  unCheckedChildren?: string;
}

export interface FormFieldTextarea extends FormFieldBase {
  type: 'textarea';
  defaultValue?: string;
  rows?: number;
  autoSize?: boolean;
}

export interface FormFieldCurrency extends FormFieldBase {
  type: 'currency';
  defaultValue?: number;
  min?: number;
  max?: number;
  prefix?: string;
  decimalPlaces?: number;
}

export type FormField =
  | FormFieldText
  | FormFieldSelect
  | FormFieldDate
  | FormFieldSwitch
  | FormFieldTextarea
  | FormFieldCurrency;

// ─── Modal & Dialog Types ─────────────────────────────────────

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  onOk?: () => void;
  title?: string;
  width?: number | string;
  footer?: React.ReactNode;
  closable?: boolean;
  maskClosable?: boolean;
  destroyOnClose?: boolean;
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  content: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  okType?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

// ─── Numbering ───────────────────────────────────────────────

export interface Numbering {
  id: number;
  type: string;
  prefix: string;
  lastNumber: number;
  suffix: string;
  digitCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Log ─────────────────────────────────────────────────────

export interface Log {
  id: number;
  method?: string;
  endpoint?: string;
  headers?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  responseStatus?: number;
  message?: string;
  requesterLoginId?: number;
  requesterFullName?: string;
  ipAddress?: string;
  userAgent?: string;
  durationMs?: number;
  logDatetime: string;
  createdAt: string;
}

// ─── Utility Types ───────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

export type EntityId = string | number;

export type CreatedUpdated = {
  createdAt: string;
  updatedAt?: string;
};

export type WithRelations<T> = T & {
  [K in keyof T as K extends `${infer R}Id` ? never : K]?: T[K];
};
