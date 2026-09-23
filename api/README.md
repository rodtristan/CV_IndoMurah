# Toko CV IndoMurah - POS API Documentation

Backend API untuk sistem Point of Sale (POS) Toko CV IndoMurah berbasis NestJS dengan dukungan OData Query.

## Table of Contents

1. [Overview](#1-overview)
2. [Database Schema](#2-database-schema)
3. [Module Categories](#3-module-categories)
4. [Business Logic API](#4-business-logic-api)
5. [All Modules Reference](#5-all-modules-reference)
6. [OData Query Support](#6-odata-query-support)
7. [Status & Type Reference](#7-status--type-reference)
8. [Technology Stack](#8-technology-stack)
9. [Getting Started](#9-getting-started)
10. [API Examples](#10-api-examples)
11. [Project Structure](#11-project-structure)

---

## 1. Overview

Toko CV IndoMurah adalah sistem Point of Sale (POS) lengkap untuk toko retail yang mencakup:

- **Manajemen Produk** - Master data produk dengan multi-barcode dan gambar
- **Transaksi Penjualan** - POS dengan berbagai metode pembayaran
- **Transaksi Pembelian** - Purchase order dan purchase dengan hutang supplier
- **Manajemen Inventori** - Stock in, stock out, transfer, dan stock opname
- **Akuntansi** - Chart of accounts, jurnal, dan laporan keuangan
- **HRM** - Manajemen karyawan, absensi, cuti, dan penggajian
- **Produksi** - Manufacturing dan Bill of Materials
- **Loyalty Program** - Poin dan reward pelanggan
- **Pelaporan** - Dashboard dan laporan lengkap

### Arsitektur Sistem

```
+-----------------+     +-----------------+     +-----------------+
|    Frontend     |---->|   NestJS API    |---->|   PostgreSQL    |
|   (Web/Mobile)  |     |   (Backend)    |     |   (Database)   |
+-----------------+     +--------+--------+     +-----------------+
                                |
                                v
                        +-----------------+
                        |     Redis       |
                        |    (Cache)      |
                        +-----------------+
```

---

## 2. Database Schema

### 2.1 Primary Key Types

| Type | Usage | Format |
|------|-------|--------|
| `UUID` | User, Transactions | `uuid()` - 36 char hex |
| `Int` | Master Data, Settings | `autoincrement()` |

**Contoh:**

```typescript
// UUID Primary Key (User, Transactions)
model User {
  id String @id @default(uuid())
}

// Int Primary Key (Master Data)
model Category {
  id Int @id @default(autoincrement())
}
```

### 2.2 Common Fields Pattern

Semua model memiliki field standar berikut:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `Int/String` | Primary key |
| `isActive` | `Boolean` | Soft delete flag (default: true) |
| `createdAt` | `DateTime` | Tanggal dibuat (auto) |
| `updatedAt` | `DateTime` | Tanggal update (auto) |

### 2.3 Enums Database

| Enum Name | Values | Usage |
|-----------|--------|-------|
| **PaymentMethod** | CASH, TRANSFER, DEBIT, QRIS, CREDIT | Metode pembayaran |
| **PaymentStatus** | PENDING, PAID, INSTALMENT, PARTIAL, CANCELLED | Status pembayaran |
| **TransactionStatus** | DRAFT, PENDING, CONFIRMED, SENT, RECEIVED, COMPLETED, APPROVED, CANCELLED | Status transaksi |
| **StockOpnameStatus** | PENDING, APPROVED, COMPLETED | Status stock opname |
| **AccountType** | ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE | Tipe akun |
| **ReferenceType** | PURCHASE, RETURN, ADJUSTMENT, MANUAL | Tipe referensi |
| **CustomerGroup** | RETAIL, WHOLESALE, VIP, GENERAL | Grup pelanggan |
| **EmployeeStatus** | ACTIVE, INACTIVE, RESIGNED, TERMINATED | Status karyawan |
| **AttendanceStatus** | PRESENT, LATE, ABSENT, SICK, LEAVE | Status absensi |
| **LeaveType** | ANNUAL, SICK, MATERNITY, PATERNITY, UNPAID, EMERGENCY, OTHER | Tipe cuti |
| **LeaveStatus** | PENDING, APPROVED, REJECTED, CANCELLED | Status cuti |
| **LoanStatus** | PENDING, APPROVED, ACTIVE, COMPLETED, REJECTED, CANCELLED | Status pinjaman |
| **AssetStatus** | ACTIVE, MAINTENANCE, DISPOSED | Status aset |
| **RepairStatus** | PENDING, IN_PROGRESS, COMPLETED, CANCELLED | Status servis |
| **ProductionStatus** | PLANNING, IN_PROGRESS, COMPLETED, CANCELLED | Status produksi |
| **VoucherType** | DISCOUNT_PERCENT, DISCOUNT_AMOUNT, BUY_X_GET_Y | Tipe voucher |
| **NotificationType** | INFO, WARNING, ERROR, SUCCESS | Tipe notifikasi |

---

## 3. Module Categories

### Kategori Modul

| No | Kategori | Jumlah Modul | Deskripsi |
|----|----------|--------------|-----------|
| 1 | Authentication & User | 7 | Login, user, role, menu RBAC |
| 2 | Master Data | 17 | Produk, supplier, customer, warehouse |
| 3 | Transaksi Penjualan | 7 | Sale, payment, return |
| 4 | Transaksi Pembelian | 5 | Purchase, payment, return |
| 5 | Inventori | 9 | Stock in/out/transfer/opname |
| 6 | Akuntansi | 8 | Account, journal, cash |
| 7 | HRM | 9 | Employee, attendance, payroll |
| 8 | Produksi | 2 | Production, BOM |
| 9 | Aset & Servis | 4 | Asset, service |
| 10 | Settings | 6 | Points, voucher, tax |
| 11 | Notifikasi | 2 | Notification, settings |
| 12 | Laporan | 5 | Reports, dashboard |
| 13 | Logging | 2 | Logs, health |

**Total: 100+ Modul**

---

## 4. Business Logic API

Dokumentasi lengkap tersedia di [BusinessLogic.md](./BusinessLogic.md)

### 4.1 Module Categories

Business Logic API terdiri dari 5 modul utama yang menangani alur bisnis kompleks:

| Module | Description | Endpoint Prefix |
|--------|-------------|----------------|
| **POS** | Point of Sale transactions, cart management, hold/resume | `/api/business-logic/pos` |
| **Receivable** | Customer piutang management, payment recording, aging | `/api/business-logic/receivable` |
| **Stock Alert** | Inventory alerts, reorder suggestions, stock monitoring | `/api/business-logic/stock-alert` |
| **Analytics** | Dashboard, sales reports, profit analysis, trends | `/api/business-logic/analytics` |
| **Inventory** | Stock transfer, adjustment, opname, valuation | `/api/business-logic/inventory` |

### 4.2 Quick Reference

#### POS Endpoints

```
POST   /business-logic/pos/cart/open           - Open cart session
POST   /business-logic/pos/cart/add            - Add product to cart
PUT    /business-logic/pos/cart/item/:id       - Update cart item
DELETE /business-logic/pos/cart/item/:id        - Remove from cart
POST   /business-logic/pos/cart/hold            - Hold transaction
POST   /business-logic/pos/cart/resume          - Resume held transaction
POST   /business-logic/pos/voucher/apply       - Apply voucher
POST   /business-logic/pos/transaction/complete - Complete transaction
GET    /business-logic/pos/products/search      - Search products
GET    /business-logic/pos/products/barcode     - Barcode lookup
```

#### Receivable Endpoints

```
GET    /business-logic/receivable/overview              - Get all receivables
GET    /business-logic/receivable/customer/:id          - Customer receivable history
GET    /business-logic/receivable/aging-report          - Aging analysis
POST   /business-logic/receivable/sale/:id/payment      - Record payment
POST   /business-logic/receivable/bulk-payment          - Bulk payment
POST   /business-logic/receivable/customer/:id/deposit  - Add customer deposit
GET    /business-logic/receivable/customer/:id/credit-check - Check credit
PUT    /business-logic/receivable/customer/:id/credit-limit - Update credit limit
```

#### Stock Alert Endpoints

```
GET    /business-logic/stock-alert                   - List all alerts
GET    /business-logic/stock-alert/summary           - Alert summary
PUT    /business-logic/stock-alert/:id/read          - Mark as read
PUT    /business-logic/stock-alert/:id/resolve       - Resolve alert
GET    /business-logic/stock-alert/reorder-suggestion/:productId - Reorder suggestion
GET    /business-logic/stock-alert/products-needing-reorder - Products to reorder
POST   /business-logic/stock-alert/create-purchase-order - Create PO from suggestion
```

#### Analytics Endpoints

```
GET    /business-logic/analytics/dashboard         - Dashboard summary
GET    /business-logic/analytics/sales-report      - Sales report
GET    /business-logic/analytics/sales-by-category  - Sales by category
GET    /business-logic/analytics/profit-report      - Profit analysis
GET    /business-logic/analytics/top-products      - Top selling products
GET    /business-logic/analytics/top-customers     - Top customers
GET    /business-logic/analytics/cash-flow         - Cash flow report
GET    /business-logic/analytics/tax-report        - Tax report
GET    /business-logic/analytics/sales-trend        - Sales trend analysis
```

#### Inventory Endpoints

```
POST   /business-logic/inventory/transfer           - Transfer between warehouses
POST   /business-logic/inventory/adjustment        - Stock adjustment
POST   /business-logic/inventory/opname             - Stock opname
GET    /business-logic/inventory/stock-report       - Movement report
GET    /business-logic/inventory/valuation-report  - Valuation report
```

### 4.3 Common Flow Examples

#### POS Transaction Flow

```
1. GET  /pos/products/search → Search products
2. POST /pos/cart/open → Open cart with customer
3. POST /pos/cart/add → Add items to cart
4. POST /pos/voucher/apply → Apply discount (optional)
5. POST /pos/transaction/complete → Finalize sale
```

#### Receivable Payment Flow

```
1. GET  /receivable/customer/:id → Check outstanding
2. POST /receivable/sale/:id/payment → Record payment
3. GET  /receivable/aging-report → View aging
```

#### Reorder Flow

```
1. GET  /stock-alert/products-needing-reorder → View suggestions
2. GET  /stock-alert/reorder-suggestion/:id → Get details
3. POST /stock-alert/create-purchase-order → Create PO
```

---

## 5. All Modules Reference

### 4.1 Authentication & User Management

#### Auth Module (`/api/auth`)

| Field | Type | PK | FK | Description |
|-------|------|----|----|-------------|
| id | String | Yes | - | UUID |
| username | String | - | - | Unique per company |
| email | String? | - | - | Unique |
| password | String | - | - | bcrypt hashed |
| name | String | - | - | Full name |
| role | String | - | - | admin, cashier, manager |
| companyId | Int | - | Yes | FK to Company |
| isActive | Boolean | - | - | Default: true |
| createdAt | DateTime | - | - | Auto |
| updatedAt | DateTime | - | - | Auto |

**Relations:** User (1)---(N) UserRole, User (1)---(N) Sale, Purchase, Journal

---

#### Role Module (`/api/roles`)

| Field | Type | PK | Description |
|-------|------|----|-------------|
| id | Int | Yes | autoincrement |
| roleName | String | - | Unique |
| roleDescription | String? | - | |
| isActive | Boolean | - | Default: true |
| createdAt | DateTime | - | Auto |
| updatedAt | DateTime | - | Auto |

**Relations:** Role (1)---(N) UserRole, Role (1)---(N) RoleMenu

---

#### Menu Module (`/api/menus`)

| Field | Type | PK | FK | Description |
|-------|------|----|----|-------------|
| id | Int | Yes | - | |
| menuName | String | - | - | Display name |
| menuType | String? | - | - | menu, header, separator |
| icon | String? | - | - | Icon class |
| route | String? | - | - | URL path |
| parentMenuId | Int? | - | Yes | Self-reference |
| isActive | Boolean | - | - | |
| sortOrder | Int | - | - | Display order |

**Relations:** Menu (1)---(N) Menu (self), Menu (1)---(N) RoleMenu, Menu (1)---(N) UserMenu

---

#### UserRole Module (`/api/user-roles`)

| Field | Type | PK | FK | Unique |
|-------|------|----|----|--------|
| id | Int | Yes | - | |
| userId | String | - | Yes | |
| roleId | Int | - | Yes | |
| isActive | Boolean | - | - | |
| createdAt | DateTime | - | - | |
| updatedAt | DateTime | - | - | |

**Unique Constraint:** [userId, roleId]

---

#### RoleMenu Module (`/api/role-menus`)

| Field | Type | PK | FK | Unique |
|-------|------|----|----|--------|
| id | Int | Yes | - | |
| roleId | Int | - | Yes | |
| menuId | Int | - | Yes | |
| isActive | Boolean | - | - | |
| createdAt | DateTime | - | - | |
| updatedAt | DateTime | - | - | |

**Unique Constraint:** [roleId, menuId]

---

#### UserMenu Module (`/api/user-menus`)

| Field | Type | PK | FK | Unique |
|-------|------|----|----|--------|
| id | Int | Yes | - | |
| userId | String | - | Yes | |
| menuId | Int | - | Yes | |
| isActive | Boolean | - | - | |
| createdAt | DateTime | - | - | |
| updatedAt | DateTime | - | - | |

**Unique Constraint:** [userId, menuId]

---

### 4.2 Master Data

#### Company Module (`/api/companies`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| companyCode | String | - | Yes |
| name | String | - | |
| address | String? | - | |
| phone | String? | - | |
| email | String? | - | |
| city | String? | - | |
| province | String? | - | |
| postalCode | String? | - | |
| taxId | String? | - | NPWP |
| logoUrl | String? | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Relations:** Company (1)---(N) User

---

#### Category Module (`/api/categories`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| code | String | - | Yes |
| name | String | - | |
| icon | String? | - | |
| image | String? | - | |
| description | String? | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Relations:** Category (1)---(N) Product

---

#### Brand Module (`/api/brands`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| code | String | - | Yes |
| name | String | - | |
| description | String? | - | |
| logoUrl | String? | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Relations:** Brand (1)---(N) Product, Brand (1)---(N) BrandLogo

---

#### BrandLogo Module (`/api/brand-logos`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| brandId | Int? | - | Yes |
| name | String | - | |
| logoUrl | String | - | |
| website | String? | - | |
| sortOrder | Int | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

---

#### Unit Module (`/api/units`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| code | String | - | Yes |
| name | String | - | |
| abbreviation | String? | - | e.g., "pcs" |
| description | String? | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Relations:** Unit (1)---(N) Product, Unit (1)---(N) all transaction items

---

#### Warehouse Module (`/api/warehouses`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| code | String | - | Yes |
| name | String | - | |
| address | String? | - | |
| phone | String? | - | |
| isDefault | Boolean | - | Default warehouse |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Relations:** Warehouse (1)---(N) Product, Warehouse (1)---(N) ProductStock, Warehouse (1)---(N) StockIn/Out/Transfer, Warehouse (1)---(N) Shelf

---

#### Shelf Module (`/api/shelves`)

| Field | Type | PK | FK | Unique |
|-------|------|----|----|--------|
| id | Int | Yes | | |
| warehouseId | Int | - | Yes | |
| code | String | - | - | Yes |
| name | String | - | | |
| description | String? | - | | |
| isActive | Boolean | - | | |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

**Relations:** Shelf (N)---(1) Warehouse, Shelf (1)---(N) ShelfProduct

---

#### ShelfProduct Module (`/api/shelf-products`)

| Field | Type | PK | FK | Unique |
|-------|------|----|----|--------|
| id | Int | Yes | | |
| shelfId | Int | - | Yes | |
| productId | Int | - | Yes | |
| quantity | Decimal | - | | |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

**Unique Constraint:** [shelfId, productId]

---

#### ProductGroup Module (`/api/product-groups`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| code | String | - | Yes |
| name | String | - | |
| description | String? | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Relations:** ProductGroup (1)---(N) Product

---

#### Product Module (`/api/products`)

| Field | Type | PK | FK | Unique |
|-------|------|----|----|--------|
| id | Int | Yes | | |
| code | String | - | | Yes SKU |
| barcode | String? | - | | Yes |
| name | String | - | | |
| categoryId | Int? | - | Yes | |
| brandId | Int? | - | Yes | |
| productGroupId | Int? | - | Yes | |
| unitId | Int | - | Yes | |
| warehouseId | Int? | - | Yes | |
| purchasePrice | Decimal | - | | |
| sellingPrice | Decimal | - | | |
| discountPercent | Decimal | - | | |
| stock | Decimal | - | | |
| minimumStock | Decimal | - | | |
| image | String? | - | | |
| description | String? | - | | |
| isActive | Boolean | - | | |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

**Relations:** Product (N)---(1) Category, Brand, Unit, Warehouse, ProductGroup
**Relations:** Product (1)---(N) ProductStock, ProductImage, ProductBarcode, SaleItem, PurchaseItem, etc.

---

#### ProductStock Module (`/api/product-stocks`)

| Field | Type | PK | FK | Unique |
|-------|------|----|----|--------|
| id | Int | Yes | | |
| productId | Int | - | Yes | |
| warehouseId | Int | - | Yes | |
| quantity | Decimal | - | | |
| minimumStock | Decimal | - | | |
| updatedAt | DateTime | - | | |

**Unique Constraint:** [productId, warehouseId]

---

#### ProductImage Module (`/api/product-images`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| productId | Int | - | Yes |
| url | String | - | |
| caption | String? | - | |
| sortOrder | Int | - | |
| isPrimary | Boolean | - | |
| createdAt | DateTime | - | |

---

#### ProductBarcode Module (`/api/product-barcodes`)

| Field | Type | PK | FK | Unique |
|-------|------|----|----|--------|
| id | Int | Yes | | |
| productId | Int | - | Yes | |
| barcode | String | - | | Yes |
| isDefault | Boolean | - | | |
| isActive | Boolean | - | | |
| createdAt | DateTime | - | | |

---

#### Supplier Module (`/api/suppliers`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| code | String | - | Yes |
| name | String | - | |
| contactPerson | String? | - | |
| phone | String? | - | |
| email | String? | - | |
| address | String? | - | |
| totalDebt | Decimal | - | |
| notes | String? | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Relations:** Supplier (1)---(N) Purchase, Supplier (1)---(N) SupplierDeposit

---

#### Customer Module (`/api/customers`)

| Field | Type | PK | FK | Unique |
|-------|------|----|----|--------|
| id | Int | Yes | | |
| code | String | - | | Yes |
| name | String | - | | |
| phone | String? | - | | |
| email | String? | - | | |
| address | String? | - | | |
| totalReceivable | Decimal | - | | |
| customerGroup | Enum | - | | CustomerGroup |
| pointBalance | Int | - | | |
| notes | String? | - | | |
| isActive | Boolean | - | | |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

**Type:** customerGroup (CustomerGroup Enum: RETAIL, WHOLESALE, VIP, GENERAL)
**Relations:** Customer (1)---(N) Sale, Customer (1)---(N) CustomerDeposit, Customer (1)---(N) PointRedemption

---

#### SalesPerson Module (`/api/sales-persons`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| code | String | - | Yes |
| name | String | - | |
| phone | String? | - | |
| email | String? | - | |
| address | String? | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Relations:** SalesPerson (1)---(N) Sale

---

### 4.3 Transaksi Penjualan

#### Sale Module (`/api/sales`)

| Field | Type | PK | FK | Type/Enum |
|-------|------|----|----|-----------|
| id | Int | Yes | | |
| code | String | - | | | Unique invoice |
| date | DateTime | - | | |
| customerId | Int | - | Yes | |
| salesPersonId | Int? | - | Yes | |
| salePointId | Int? | - | Yes | |
| warehouseId | Int? | - | Yes | |
| subtotal | Decimal | - | | |
| discountPercent | Decimal | - | | |
| discountAmount | Decimal | - | | |
| taxPercent | Decimal | - | | |
| taxAmount | Decimal | - | | |
| total | Decimal | - | | |
| cashAmount | Decimal | - | | |
| changeAmount | Decimal | - | | |
| paymentStatus | Enum | - | | PaymentStatus |
| isReturn | Boolean | - | | |
| returnedAt | DateTime? | - | | |
| paymentMethod | Enum? | - | | PaymentMethod |
| notes | String? | - | | |
| createdById | String | - | Yes | FK to User |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

**Type:** paymentStatus (PaymentStatus Enum: PENDING, PAID, INSTALMENT, PARTIAL, CANCELLED)
**Type:** paymentMethod (PaymentMethod Enum: CASH, TRANSFER, DEBIT, QRIS, CREDIT)
**Relations:** Sale (N)---(1) Customer, Sale (1)---(N) SaleItem, Sale (1)---(N) SalePayment, Sale (1)---(N) SaleReturn

---

#### SaleItem Module (`/api/sale-items`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| saleId | Int | - | Yes |
| productId | Int | - | Yes |
| quantity | Decimal | - | |
| unitPrice | Decimal | - | |
| discountPercent | Decimal | - | |
| discountAmount | Decimal | - | |
| subtotal | Decimal | - | |
| unitId | Int? | - | Yes |
| createdAt | DateTime | - | |

---

#### SalePayment Module (`/api/sale-payments`)

| Field | Type | PK | FK | Type |
|-------|------|----|----|-------|
| id | Int | Yes | | |
| saleId | Int | - | Yes | |
| method | Enum | - | | PaymentMethod |
| amount | Decimal | - | | |
| referenceNumber | String? | - | | |
| date | DateTime | - | | |
| notes | String? | - | | |
| createdById | String | - | Yes | FK to User |
| createdAt | DateTime | - | | |

---

#### SaleReturn Module (`/api/sale-returns`)

| Field | Type | PK | FK | StatusID |
|-------|------|----|----|----------|
| id | Int | Yes | | |
| code | String | - | | Unique |
| date | DateTime | - | | |
| saleId | Int | - | Yes | |
| customerId | Int | - | Yes | |
| warehouseId | Int? | - | Yes | |
| totalReturn | Decimal | - | | |
| reason | String? | - | | |
| status | Enum | - | | TransactionStatus |
| createdById | String | - | Yes | FK to User |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

**StatusID:** status (TransactionStatus Enum)
**Relations:** SaleReturn (N)---(1) Sale, Customer, Warehouse

---

#### SalePoint Module (`/api/sale-points`)

| Field | Type | PK | FK | Unique |
|-------|------|----|----|--------|
| id | Int | Yes | | |
| code | String | - | | Yes |
| name | String | - | | |
| warehouseId | Int? | - | Yes | |
| description | String? | - | | |
| isActive | Boolean | - | | |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

---

### 4.4 Transaksi Pembelian

#### Purchase Module (`/api/purchases`)

| Field | Type | PK | FK | Type/Enum |
|-------|------|----|----|-----------|
| id | Int | Yes | | |
| code | String | - | | | Unique |
| date | DateTime | - | | |
| supplierId | Int | - | Yes | |
| warehouseId | Int? | - | Yes | |
| subtotal | Decimal | - | | |
| discountPercent | Decimal | - | | |
| discountAmount | Decimal | - | | |
| taxPercent | Decimal | - | | |
| taxAmount | Decimal | - | | |
| total | Decimal | - | | |
| paid | Decimal | - | | |
| remaining | Decimal | - | | |
| paymentStatus | Enum | - | | PaymentStatus |
| paymentMethod | Enum? | - | | PaymentMethod |
| dueDate | DateTime? | - | | |
| isReturn | Boolean | - | | |
| status | Enum | - | | TransactionStatus |
| notes | String? | - | | |
| createdById | String | - | Yes | FK to User |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

**Type:** paymentStatus, status, paymentMethod
**Relations:** Purchase (N)---(1) Supplier, Purchase (1)---(N) PurchaseItem, Purchase (1)---(N) PurchasePayment

---

#### PurchaseItem Module (`/api/purchase-items`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| purchaseId | Int | - | Yes |
| productId | Int | - | Yes |
| quantity | Decimal | - | |
| unitId | Int | - | Yes |
| unitPrice | Decimal | - | |
| discountPercent | Decimal | - | |
| discountAmount | Decimal | - | |
| subtotal | Decimal | - | |
| createdAt | DateTime | - | |

---

#### PurchasePayment Module (`/api/purchase-payments`)

| Field | Type | PK | FK | Type |
|-------|------|----|----|-------|
| id | Int | Yes | | |
| purchaseId | Int | - | Yes | |
| method | Enum | - | | PaymentMethod |
| amount | Decimal | - | | |
| referenceNumber | String? | - | | |
| date | DateTime | - | | |
| notes | String? | - | | |
| createdById | String | - | Yes | FK to User |
| createdAt | DateTime | - | | |

---

#### PurchaseReturn Module (`/api/purchase-returns`)

| Field | Type | PK | FK | StatusID |
|-------|------|----|----|----------|
| id | Int | Yes | | |
| code | String | - | | Unique |
| date | DateTime | - | | |
| purchaseId | Int | - | Yes | |
| supplierId | Int | - | Yes | |
| warehouseId | Int? | - | Yes | |
| totalReturn | Decimal | - | | |
| reason | String? | - | | |
| status | Enum | - | | TransactionStatus |
| createdById | String | - | Yes | FK to User |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

---

#### PurchaseOrder Module (`/api/purchase-orders`)

| Field | Type | PK | FK | Type |
|-------|------|----|----|-------|
| id | Int | Yes | | |
| code | String | - | | Unique |
| date | DateTime | - | | |
| supplierId | Int | - | Yes | |
| warehouseId | Int? | - | Yes | |
| subtotal | Decimal | - | | |
| discountPercent | Decimal | - | | |
| discountAmount | Decimal | - | | |
| taxPercent | Decimal | - | | |
| taxAmount | Decimal | - | | |
| total | Decimal | - | | |
| downPayment | Decimal | - | | |
| paymentStatus | Enum | - | | PaymentStatus |
| dueDate | DateTime? | - | | |
| isInvoice | Boolean | - | | |
| purchaseId | Int? | - | | FK to Purchase |
| status | Enum | - | | TransactionStatus |
| notes | String? | - | | |
| createdById | String | - | Yes | FK to User |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

---

### 4.5 Inventori

#### StockIn Module (`/api/stock-ins`)

| Field | Type | PK | FK | Type | StatusID |
|-------|------|----|----|------|----------|
| id | Int | Yes | | | |
| code | String | - | | | Unique |
| date | DateTime | - | | | |
| warehouseId | Int | - | Yes | | |
| supplierId | Int? | - | Yes | | |
| referenceType | Enum? | - | | ReferenceType | |
| referenceId | Int? | - | | | |
| totalItems | Decimal | - | | | |
| description | String? | - | | | |
| status | Enum | - | | | TransactionStatus |
| createdById | String | - | Yes | | FK to User |
| createdAt | DateTime | - | | | |
| updatedAt | DateTime | - | | | |

**Type:** referenceType (ReferenceType Enum: PURCHASE, RETURN, ADJUSTMENT, MANUAL)
**StatusID:** status (TransactionStatus Enum)
**Relations:** StockIn (N)---(1) Warehouse, Supplier

---

#### StockInItem Module (`/api/stock-in-items`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| stockInId | Int | - | Yes |
| productId | Int | - | Yes |
| quantity | Decimal | - | |
| unitId | Int | - | Yes |
| unitPrice | Decimal | - | |
| subtotal | Decimal | - | |
| createdAt | DateTime | - | |

---

#### StockOut Module (`/api/stock-outs`)

| Field | Type | PK | FK | Type | StatusID |
|-------|------|----|----|------|----------|
| id | Int | Yes | | | |
| code | String | - | | | Unique |
| date | DateTime | - | | | |
| warehouseId | Int | - | Yes | | |
| referenceType | Enum? | - | | ReferenceType | |
| referenceId | Int? | - | | | |
| totalItems | Decimal | - | | | |
| description | String? | - | | | |
| status | Enum | - | | | TransactionStatus |
| createdById | String | - | Yes | | FK to User |
| createdAt | DateTime | - | | | |
| updatedAt | DateTime | - | | | |

---

#### StockOutItem Module (`/api/stock-out-items`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| stockOutId | Int | - | Yes |
| productId | Int | - | Yes |
| quantity | Decimal | - | |
| unitId | Int | - | Yes |
| unitPrice | Decimal | - | |
| subtotal | Decimal | - | |
| createdAt | DateTime | - | |

---

#### StockTransfer Module (`/api/stock-transfers`)

| Field | Type | PK | FK | StatusID |
|-------|------|----|----|----------|
| id | Int | Yes | | |
| code | String | - | | Unique |
| date | DateTime | - | | |
| fromWarehouseId | Int | - | Yes | |
| toWarehouseId | Int | - | Yes | |
| totalItems | Decimal | - | | |
| status | Enum | - | | TransactionStatus |
| notes | String? | - | | |
| createdById | String | - | Yes | FK to User |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

**StatusID:** status (TransactionStatus Enum)
**Relations:** StockTransfer (N)---(1) Warehouse (from), StockTransfer (N)---(1) Warehouse (to)

---

#### StockTransferItem Module (`/api/stock-transfer-items`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| stockTransferId | Int | - | Yes |
| productId | Int | - | Yes |
| quantity | Decimal | - | |
| unitId | Int | - | Yes |
| unitPrice | Decimal | - | |
| subtotal | Decimal | - | |
| createdAt | DateTime | - | |

---

#### StockOpname Module (`/api/stock-opnames`)

| Field | Type | PK | FK | StatusID |
|-------|------|----|----|----------|
| id | Int | Yes | | |
| code | String | - | | Unique |
| date | DateTime | - | | |
| warehouseId | Int | - | Yes | |
| totalItems | Decimal | - | | |
| status | Enum | - | | StockOpnameStatus |
| notes | String? | - | | |
| createdById | String | - | Yes | FK to User |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

**StatusID:** status (StockOpnameStatus Enum: PENDING, APPROVED, COMPLETED)
**Relations:** StockOpname (N)---(1) Warehouse

---

#### StockOpnameItem Module (`/api/stock-opname-items`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| stockOpnameId | Int | - | Yes |
| productId | Int | - | Yes |
| systemStock | Decimal | - | |
| countedStock | Decimal | - | |
| difference | Decimal | - | |
| unitId | Int | - | Yes |
| unitPrice | Decimal | - | |
| note | String? | - | |
| createdAt | DateTime | - | |

---

#### StockAlert Module (`/api/stock-alerts`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| productId | Int | - | Yes |
| alertType | String | - | LOW_STOCK, OUT_OF_STOCK, EXPIRED |
| threshold | Decimal | - | |
| currentStock | Decimal | - | |
| isRead | Boolean | - | |
| isResolved | Boolean | - | |
| resolvedAt | DateTime? | - | |
| notes | String? | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

---

### 4.6 Akuntansi

#### Account Module (`/api/accounts`)

| Field | Type | PK | FK | Type |
|-------|------|----|----|-------|
| id | Int | Yes | | |
| code | String | - | | Unique |
| name | String | - | | |
| type | Enum | - | | AccountType |
| parentId | Int? | - | Yes | Self-reference |
| isActive | Boolean | - | | |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

**Type:** type (AccountType Enum: ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
**Relations:** Account (1)---(N) Account (self), Account (1)---(N) JournalEntry

---

#### Journal Module (`/api/journals`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| code | String | - | Unique |
| date | DateTime | - | |
| description | String? | - | |
| referenceType | String? | - | |
| referenceId | Int? | - | |
| isPosted | Boolean | - | |
| postedAt | DateTime? | - | |
| createdById | String | - | Yes FK to User |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Relations:** Journal (1)---(N) JournalEntry

---

#### JournalEntry Module (`/api/journal-entries`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| journalId | Int | - | Yes |
| accountId | Int | - | Yes |
| debit | Decimal | - | |
| credit | Decimal | - | |
| memo | String? | - | |
| userId | String? | - | Yes FK to User |
| createdAt | DateTime | - | |

---

#### CashIn Module (`/api/cash-ins`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| code | String | - | Unique |
| date | DateTime | - | |
| accountId | Int | - | Yes |
| amount | Decimal | - | |
| description | String? | - | |
| referenceType | String? | - | |
| referenceId | Int? | - | |
| createdById | String | - | Yes FK to User |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

---

#### CashOut Module (`/api/cash-outs`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| code | String | - | Unique |
| date | DateTime | - | |
| accountId | Int | - | Yes |
| amount | Decimal | - | |
| description | String? | - | |
| referenceType | String? | - | |
| referenceId | Int? | - | |
| createdById | String | - | Yes FK to User |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

---

#### CashTransfer Module (`/api/cash-transfers`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| code | String | - | Unique |
| date | DateTime | - | |
| fromAccountId | Int | - | Yes |
| toAccountId | Int | - | Yes |
| amount | Decimal | - | |
| description | String? | - | |
| createdById | String | - | Yes FK to User |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

---

#### CustomerDeposit Module (`/api/customer-deposits`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| code | String | - | Unique |
| date | DateTime | - | |
| customerId | Int | - | Yes |
| amount | Decimal | - | |
| remainingAmount | Decimal | - | |
| description | String? | - | |
| createdById | String | - | Yes FK to User |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

---

#### SupplierDeposit Module (`/api/supplier-deposits`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| code | String | - | Unique |
| date | DateTime | - | |
| supplierId | Int | - | Yes |
| amount | Decimal | - | |
| remainingAmount | Decimal | - | |
| description | String? | - | |
| createdById | String | - | Yes FK to User |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

---

### 4.7 HRM

#### Department Module (`/api/departments`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| code | String | - | Yes |
| name | String | - | |
| description | String? | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Relations:** Department (1)---(N) Employee

---

#### Position Module (`/api/positions`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| code | String | - | Yes |
| name | String | - | |
| description | String? | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Relations:** Position (1)---(N) Employee

---

#### Employee Module (`/api/employees`)

| Field | Type | PK | FK | StatusID |
|-------|------|----|----|----------|
| id | Int | Yes | | |
| code | String | - | | Unique |
| name | String | - | | |
| departmentId | Int? | - | Yes | |
| positionId | Int? | - | Yes | |
| joinDate | DateTime? | - | | |
| endDate | DateTime? | - | | |
| birthDate | DateTime? | - | | |
| gender | String? | - | | Male, Female |
| phone | String? | - | | |
| email | String? | - | | |
| address | String? | - | | |
| emergencyContact | String? | - | | |
| emergencyPhone | String? | - | | |
| basicSalary | Decimal | - | | |
| status | Enum | - | | EmployeeStatus |
| isActive | Boolean | - | | |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

**StatusID:** status (EmployeeStatus Enum: ACTIVE, INACTIVE, RESIGNED, TERMINATED)
**Relations:** Employee (N)---(1) Department, Position

---

#### Attendance Module (`/api/attendances`)

| Field | Type | PK | FK | StatusID | Unique |
|-------|------|----|----|----------|--------|
| id | Int | Yes | | | |
| employeeId | Int | - | Yes | | |
| date | DateTime | - | | | |
| checkIn | DateTime? | - | | | |
| checkOut | DateTime? | - | | | |
| status | Enum | - | | AttendanceStatus | |
| notes | String? | - | | | |
| isActive | Boolean | - | | | |
| createdAt | DateTime | - | | | |
| updatedAt | DateTime | - | | | |

**StatusID:** status (AttendanceStatus Enum: PRESENT, LATE, ABSENT, SICK, LEAVE)
**Unique Constraint:** [employeeId, date]

---

#### Payroll Module (`/api/payrolls`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| code | String | - | Unique |
| employeeId | Int | - | Yes |
| period | String | - | e.g., "2024-01" |
| basicSalary | Decimal | - | |
| allowances | Decimal | - | |
| deductions | Decimal | - | |
| overtimePay | Decimal | - | |
| totalSalary | Decimal | - | |
| paymentDate | DateTime? | - | |
| notes | String? | - | |
| isPaid | Boolean | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Relations:** Payroll (N)---(1) Employee

---

#### Loan Module (`/api/loans`)

| Field | Type | PK | FK | Type | StatusID |
|-------|------|----|----|------|----------|
| id | Int | Yes | | | |
| code | String | - | | | Unique |
| employeeId | Int | - | Yes | | |
| loanType | String | - | | PERSONAL, EMERGENCY, HOUSING, VEHICLE | |
| principalAmount | Decimal | - | | | |
| interestRate | Decimal | - | | | |
| tenorMonths | Int | - | | | |
| installmentAmount | Decimal | - | | | |
| totalAmount | Decimal | - | | | |
| remainingAmount | Decimal | - | | | |
| startDate | DateTime? | - | | | |
| status | Enum | - | | | LoanStatus |
| notes | String? | - | | | |
| isActive | Boolean | - | | | |
| createdAt | DateTime | - | | | |
| updatedAt | DateTime | - | | | |

**Type:** loanType (String: PERSONAL, EMERGENCY, HOUSING, VEHICLE)
**StatusID:** status (LoanStatus Enum: PENDING, APPROVED, ACTIVE, COMPLETED, REJECTED, CANCELLED)
**Relations:** Loan (N)---(1) Employee, Loan (1)---(N) LoanInstallment

---

#### LoanInstallment Module (`/api/loan-installments`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| loanId | Int | - | Yes |
| period | String | - | e.g., "2024-01" |
| amount | Decimal | - | |
| principal | Decimal | - | |
| interest | Decimal | - | |
| remainingBefore | Decimal | - | |
| remainingAfter | Decimal | - | |
| paymentDate | DateTime? | - | |
| status | String | - | PAID, UNPAID |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |

---

#### Leave Module (`/api/leaves`)

| Field | Type | PK | FK | Type | StatusID |
|-------|------|----|----|------|----------|
| id | Int | Yes | | | |
| code | String | - | | | Unique |
| employeeId | Int | - | Yes | | |
| type | Enum | - | | LeaveType | |
| startDate | DateTime | - | | | |
| endDate | DateTime | - | | | |
| totalDays | Int | - | | | |
| reason | String? | - | | | |
| status | Enum | - | | | LeaveStatus |
| approvedById | String? | - | Yes | | FK to User |
| approvedAt | DateTime? | - | | | |
| rejectedReason | String? | - | | | |
| notes | String? | - | | | |
| isActive | Boolean | - | | | |
| createdAt | DateTime | - | | | |
| updatedAt | DateTime | - | | | |

**Type:** type (LeaveType Enum: ANNUAL, SICK, MATERNITY, PATERNITY, UNPAID, EMERGENCY, OTHER)
**StatusID:** status (LeaveStatus Enum: PENDING, APPROVED, REJECTED, CANCELLED)
**Relations:** Leave (N)---(1) Employee

---

#### LeaveBalance Module (`/api/leave-balances`)

| Field | Type | PK | FK | Type | Unique |
|-------|------|----|----|------|--------|
| id | Int | Yes | | | |
| employeeId | Int | - | Yes | | |
| year | Int | - | | | |
| leaveType | Enum | - | | LeaveType | |
| totalDays | Int | - | | | |
| usedDays | Int | - | | | |
| remainingDays | Int | - | | | |
| isActive | Boolean | - | | | |
| createdAt | DateTime | - | | | |
| updatedAt | DateTime | - | | | |

**Type:** leaveType (LeaveType Enum)
**Unique Constraint:** [employeeId, year, leaveType]

---

### 4.8 Produksi

#### Production Module (`/api/productions`)

| Field | Type | PK | FK | StatusID |
|-------|------|----|----|----------|
| id | Int | Yes | | |
| code | String | - | | Unique |
| date | DateTime | - | | |
| productId | Int? | - | Yes | |
| productName | String? | - | | |
| quantity | Decimal | - | | |
| warehouseId | Int? | - | Yes | |
| rawMaterialCost | Decimal | - | | |
| laborCost | Decimal | - | | |
| overheadCost | Decimal | - | | |
| totalCost | Decimal | - | | |
| status | Enum | - | | ProductionStatus |
| notes | String? | - | | |
| isActive | Boolean | - | | |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

**StatusID:** status (ProductionStatus Enum: PLANNING, IN_PROGRESS, COMPLETED, CANCELLED)
**Relations:** Production (N)---(1) Warehouse, Product, Production (1)---(N) ProductionItem

---

#### ProductionItem Module (`/api/production-items`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| productionId | Int | - | Yes |
| productId | Int | - | Yes |
| productName | String | - | |
| quantity | Decimal | - | |
| unitId | Int? | - | Yes |
| unitPrice | Decimal | - | |
| subtotal | Decimal | - | |
| createdAt | DateTime | - | |

---

### 4.9 Aset & Servis

#### AssetCategory Module (`/api/asset-categories`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| code | String | - | Yes |
| name | String | - | |
| description | String? | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Relations:** AssetCategory (1)---(N) Asset

---

#### Asset Module (`/api/assets`)

| Field | Type | PK | FK | Type | StatusID |
|-------|------|----|----|------|----------|
| id | Int | Yes | | | |
| code | String | - | | | Unique |
| name | String | - | | | |
| assetCategoryId | Int? | - | Yes | | |
| purchaseDate | DateTime? | - | | | |
| purchasePrice | Decimal | - | | | |
| currentValue | Decimal | - | | | |
| depreciationMethod | Enum? | - | | DepreciationMethod | |
| usefulLifeYears | Int | - | | | |
| location | String? | - | | | |
| assignedTo | String? | - | | | |
| serialNumber | String? | - | | | |
| description | String? | - | | | |
| status | Enum | - | | | AssetStatus |
| isActive | Boolean | - | | | |
| createdAt | DateTime | - | | | |
| updatedAt | DateTime | - | | | |

**Type:** depreciationMethod (DepreciationMethod Enum: STRAIGHT_LINE, DECLINING_BALANCE, UNITS_OF_PRODUCTION)
**StatusID:** status (AssetStatus Enum: ACTIVE, MAINTENANCE, DISPOSED)

---

#### Service Module (`/api/services`)

| Field | Type | PK | FK | StatusID |
|-------|------|----|----|----------|
| id | Int | Yes | | |
| code | String | - | | Unique |
| date | DateTime | - | | |
| customerId | Int? | - | Yes | |
| customerName | String? | - | | |
| customerPhone | String? | - | | |
| customerAddress | String? | - | | |
| productName | String? | - | | |
| serialNumber | String? | - | | |
| problem | String? | - | | |
| diagnosis | String? | - | | |
| repairStatus | Enum | - | | RepairStatus |
| technician | String? | - | | |
| warrantyUntil | DateTime? | - | | |
| subtotal | Decimal | - | | |
| laborCost | Decimal | - | | |
| totalAmount | Decimal | - | | |
| notes | String? | - | | |
| isActive | Boolean | - | | |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

**StatusID:** repairStatus (RepairStatus Enum: PENDING, IN_PROGRESS, COMPLETED, CANCELLED)

---

#### ServiceItem Module (`/api/service-items`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| serviceId | Int | - | Yes |
| productId | Int? | - | Yes |
| productName | String | - | |
| quantity | Decimal | - | |
| unitPrice | Decimal | - | |
| subtotal | Decimal | - | |
| createdAt | DateTime | - | |

---

### 4.10 Settings & Loyalty

#### PointSetting Module (`/api/point-settings`)

| Field | Type | PK |
|-------|------|----|
| id | Int | Yes |
| name | String | - |
| pointsPerRupiah | Decimal | - |
| minimumTransaction | Decimal | - |
| isActive | Boolean | - |
| createdAt | DateTime | - |
| updatedAt | DateTime | - |

---

#### PointRedemption Module (`/api/point-redemptions`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| customerId | Int | - | Yes |
| code | String | - | Unique |
| pointsRedeemed | Int | - | |
| rewardName | String | - | |
| rewardValue | Decimal | - | |
| date | DateTime | - | |
| createdById | String | - | Yes FK to User |
| createdAt | DateTime | - | |

---

#### PriceHistory Module (`/api/price-histories`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| productId | Int | - | Yes |
| type | String | - | PURCHASE, SELLING |
| oldPrice | Decimal | - | |
| newPrice | Decimal | - | |
| changedBy | String? | - | |
| changedAt | DateTime | - | |
| createdAt | DateTime | - | |

---

#### Voucher Module (`/api/vouchers`)

| Field | Type | PK | Type |
|-------|------|----|-------|
| id | Int | Yes | |
| code | String | - | Unique |
| name | String | - | |
| type | Enum | - | VoucherType |
| value | Decimal | - | |
| minPurchaseAmount | Decimal | - | |
| maxDiscountAmount | Decimal? | - | |
| startDate | DateTime | - | |
| endDate | DateTime | - | |
| usageLimit | Int? | - | null = unlimited |
| usedCount | Int | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Type:** type (VoucherType Enum: DISCOUNT_PERCENT, DISCOUNT_AMOUNT, BUY_X_GET_Y)

---

#### Tax Module (`/api/taxes`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| code | String | - | Yes |
| name | String | - | |
| rate | Decimal | - | |
| description | String? | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

---

#### ExpenseCategory Module (`/api/expense-categories`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| code | String | - | Yes |
| name | String | - | |
| description | String? | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

---

#### Expense Module (`/api/expenses`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| code | String | - | Unique |
| date | DateTime | - | |
| expenseCategoryId | Int | - | Yes |
| amount | Decimal | - | |
| description | String? | - | |
| referenceNumber | String? | - | |
| isApproved | Boolean | - | |
| approvedById | String? | - | Yes FK to User |
| approvedAt | DateTime? | - | |
| notes | String? | - | |
| isActive | Boolean | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

---

#### Transfer Module (`/api/transfers`)

| Field | Type | PK | FK | StatusID |
|-------|------|----|----|----------|
| id | Int | Yes | | |
| code | String | - | | Unique |
| date | DateTime | - | | |
| fromAccountId | Int? | - | Yes | |
| toAccountId | Int? | - | Yes | |
| fromWarehouseId | Int? | - | Yes | |
| toWarehouseId | Int? | - | Yes | |
| amount | Decimal | - | | |
| description | String? | - | | |
| status | Enum | - | | TransactionStatus |
| notes | String? | - | | |
| isActive | Boolean | - | | |
| createdAt | DateTime | - | | |
| updatedAt | DateTime | - | | |

---

### 4.11 Notifikasi

#### Notification Module (`/api/notifications`)

| Field | Type | PK | FK | Type |
|-------|------|----|----|-------|
| id | Int | Yes | | |
| userId | String? | - | Yes | |
| title | String | - | | |
| message | String | - | | |
| type | Enum | - | | NotificationType |
| isRead | Boolean | - | | |
| referenceType | String? | - | | |
| referenceId | Int? | - | | |
| isActive | Boolean | - | | |
| createdAt | DateTime | - | | |

**Type:** type (NotificationType Enum: INFO, WARNING, ERROR, SUCCESS)

---

#### NotificationSetting Module (`/api/notification-settings`)

| Field | Type | PK | FK |
|-------|------|----|----|
| id | Int | Yes | |
| userId | String | - | Yes |
| type | String | - | SALE, PURCHASE, STOCK, PAYMENT, REPORT, SYSTEM |
| emailEnabled | Boolean | - | |
| pushEnabled | Boolean | - | |
| inAppEnabled | Boolean | - | |
| threshold | Decimal? | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Unique Constraint:** [userId, type]

---

### 4.12 Laporan & Analitik

#### Report Module (`/api/reports`)

Report module menyediakan berbagai endpoint untuk laporan:
- `/reports/sales` - Laporan penjualan
- `/reports/inventory` - Laporan inventori
- `/reports/financial` - Laporan keuangan
- `/reports/profit-loss` - Laba/Rugi
- `/reports/aging-receivable` - Umur piutang
- `/reports/aging-payable` - Umur hutang

---

#### Dashboard Module (`/api/dashboard`)

Dashboard module menyediakan data untuk dashboard utama:
- `/dashboard` - Data ringkasan
- `/dashboard/sales-today` - Penjualan hari ini
- `/dashboard/top-products` - Produk terlaris
- `/dashboard/low-stock` - Stock rendah

---

#### DailySalesSummary Module (`/api/daily-sales-summaries`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| date | DateTime | - | Yes (date only) |
| totalTransactions | Int | - | |
| totalCost | Decimal | - | |
| totalSales | Decimal | - | |
| totalProfit | Decimal | - | |
| totalReturns | Decimal | - | |
| totalExpenses | Decimal | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Unique Constraint:** [date]

---

#### MonthlySalesSummary Module (`/api/monthly-sales-summaries`)

| Field | Type | PK | Unique |
|-------|------|----|--------|
| id | Int | Yes | |
| year | Int | - | |
| month | Int | - | |
| totalTransactions | Int | - | |
| totalCost | Decimal | - | |
| totalSales | Decimal | - | |
| totalProfit | Decimal | - | |
| totalReturns | Decimal | - | |
| totalExpenses | Decimal | - | |
| createdAt | DateTime | - | |
| updatedAt | DateTime | - | |

**Unique Constraint:** [year, month]

---

#### ActivityLog Module (`/api/activity-logs`)

| Field | Type | PK |
|-------|------|----|
| id | Int | Yes |
| type | String | - |
| title | String | - |
| description | String? | - |
| referenceType | String? | - |
| referenceId | Int? | - |
| amount | Decimal? | - |
| createdById | String? | - |
| createdAt | DateTime | - |

---

### 4.13 Logging & Monitoring

#### Log Module (`/api/logs`)

| Field | Type | PK |
|-------|------|----|
| id | Int | Yes |
| method | String? | - |
| endpoint | String? | - |
| headers | Json? | - |
| payload | Json? | - |
| responseStatus | Int? | - |
| message | String? | - |
| requesterLoginId | Int? | - |
| requesterFullName | String? | - |
| ipAddress | String? | - |
| userAgent | String? | - |
| durationMs | Int? | - |
| logDatetime | DateTime | - |
| createdAt | DateTime | - |

---

#### Health Module (`/api/health`)

Endpoint untuk health check:
- `/health` - Full health status
- `/health/live` - Liveness probe
- `/health/ready` - Readiness probe

---

## 6. OData Query Support

Semua endpoint mendukung OData query untuk filtering, sorting, dan pagination.

### 5.1 Query Parameters

| Parameter | Deskripsi | Contoh |
|-----------|-----------|--------|
| `$select` | Pilih field | `$select=id,name,code` |
| `$filter` | Filter data | `$filter=stock gt 0` |
| `$orderBy` | Sorting | `$orderBy=createdAt desc` |
| `$top` | Limit hasil | `$top=20` |
| `$skip` | Offset | `$skip=40` |
| `$expand` | Include relasi | `$expand=category` |
| `$count` | Include count | `$count=true` |

### 5.2 Filter Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal | `name eq 'Samsung'` |
| `ne` | Not Equal | `isActive ne false` |
| `gt` | Greater Than | `price gt 100000` |
| `gte` | Greater Than or Equal | `stock gte 10` |
| `lt` | Less Than | `stock lt minimumStock` |
| `lte` | Less Than or Equal | `price lte 500000` |
| `contains` | Contains (like) | `name contains 'TV'` |
| `startswith` | Starts with | `code startswith 'ELEC'` |
| `endswith` | Ends with | `code endswith '/2024'` |
| `and` | Logical AND | `stock gt 0 and isActive eq true` |
| `or` | Logical OR | `status eq 'PENDING' or status eq 'DRAFT'` |

### 5.3 Examples

```
# Get products with stock > 0, sorted by name
GET /api/products?$filter=stock gt 0&$orderBy=name asc

# Get sales with customer info
GET /api/sales?$expand=customer&$filter=paymentStatus eq 'PAID'

# Get products by category with pagination
GET /api/products?$filter=categoryId eq 1&$top=10&$skip=0&$count=true

# Get low stock products
GET /api/products?$filter=stock lte minimumStock

# Get pending leaves
GET /api/leaves?$filter=status eq 'PENDING'&$expand=employee

# Get active employees
GET /api/employees?$filter=status eq 'ACTIVE'
```

---

## 7. Status & Type Reference

### 6.1 PaymentStatus Enum
```
PENDING     - Belum dibayar
PAID        - Lunas
INSTALMENT  - Cicilan
PARTIAL     - Bayar sebagian
CANCELLED   - Dibatalkan
```

### 6.2 PaymentMethod Enum
```
CASH        - Tunai
TRANSFER    - Transfer bank
DEBIT       - Kartu debit
QRIS        - QRIS
CREDIT      - Kartu kredit
```

### 6.3 TransactionStatus Enum
```
DRAFT       - Draft/survey
PENDING     - Menunggu
CONFIRMED   - Dikonfirmasi
SENT        - Dikirim
RECEIVED    - Diterima
COMPLETED   - Selesai
APPROVED    - Disetujui
CANCELLED   - Dibatalkan
```

### 6.4 StockOpnameStatus Enum
```
PENDING     - Sedang di-opname
APPROVED    - Disetujui
COMPLETED   - Selesai
```

### 6.5 AccountType Enum
```
ASSET       - Aktiva
LIABILITY   - Kewajiban
EQUITY      - Modal
REVENUE     - Pendapatan
EXPENSE     - Beban
```

### 6.6 ReferenceType Enum
```
PURCHASE    - Dari pembelian
RETURN      - Retur
ADJUSTMENT  - Penyesuaian
MANUAL      - Manual
```

### 6.7 CustomerGroup Enum
```
RETAIL      - Pelanggan umum
WHOLESALE   - Grosir
VIP         - Prioritas
GENERAL     - Default
```

### 6.8 EmployeeStatus Enum
```
ACTIVE      - Aktif bekerja
INACTIVE    - Tidak aktif
RESIGNED    - Mengundurkan diri
TERMINATED  - Diberhentikan
```

### 6.9 AttendanceStatus Enum
```
PRESENT     - Hadir
LATE        - Terlambat
ABSENT      - Tidak hadir
SICK        - Sakit
LEAVE       - Cuti/Izin
```

### 6.10 LeaveType Enum
```
ANNUAL      - Cuti tahunan
SICK        - Sakit
MATERNITY   - Melahirkan
PATERNITY   - Cuti ayah
UNPAID      - Tanpa gaji
EMERGENCY   - Mendesak
OTHER       - Lainnya
```

### 6.11 LeaveStatus Enum
```
PENDING     - Menunggu persetujuan
APPROVED    - Disetujui
REJECTED    - Ditolak
CANCELLED   - Dibatalkan
```

### 6.12 LoanStatus Enum
```
PENDING     - Menunggu
APPROVED    - Disetujui
ACTIVE      - Aktif (sedang angsur)
COMPLETED   - Lunas
REJECTED    - Ditolak
CANCELLED   - Dibatalkan
```

### 6.13 AssetStatus Enum
```
ACTIVE      - Aktif
MAINTENANCE - Perbaikan
DISPOSED    - Dijual/dibuang
```

### 6.14 DepreciationMethod Enum
```
STRAIGHT_LINE       - Garis lurus
DECLINING_BALANCE   - Saldo menurun
UNITS_OF_PRODUCTION - Unit produksi
```

### 6.15 RepairStatus Enum
```
PENDING     - Menunggu
IN_PROGRESS - Sedang dikerjakan
COMPLETED   - Selesai
CANCELLED   - Dibatalkan
```

### 6.16 ProductionStatus Enum
```
PLANNING    - Perencanaan
IN_PROGRESS - Sedang produksi
COMPLETED   - Selesai
CANCELLED   - Dibatalkan
```

### 6.17 VoucherType Enum
```
DISCOUNT_PERCENT   - Diskon persen
DISCOUNT_AMOUNT    - Diskon nominal
BUY_X_GET_Y        - Beli X gratis Y
```

### 6.18 NotificationType Enum
```
INFO        - Informasi
WARNING     - Peringatan
ERROR       - Error
SUCCESS     - Berhasil
```

---

## 8. Technology Stack

### 7.1 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| NestJS | 10.x | Framework |
| TypeScript | 5.x | Language |
| Prisma | 5.x | ORM |
| PostgreSQL | 15+ | Database |
| Redis | 7.x | Cache |
| JWT | - | Authentication |
| Passport | - | Auth strategies |

### 7.2 Key Libraries

| Library | Purpose |
|---------|---------|
| @nestjs/passport | Authentication |
| @nestjs/throttler | Rate limiting |
| class-validator | DTO validation |
| class-transformer | Data transformation |
| @nestjs/swagger | API documentation |
| @nestjs/cache-manager | Caching |

---

## 9. Getting Started

### 8.1 Prerequisites
```bash
Node.js 18+
PostgreSQL 15+
Redis 7.x
npm or yarn
```

### 8.2 Installation
```bash
# Clone repository
git clone <repo-url>
cd api

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your settings

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

### 8.3 Environment Variables
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/toko
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
```

---

## 10. API Examples

### 9.1 Authentication

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@1234"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": "uuid",
      "username": "admin",
      "name": "Administrator",
      "role": "admin"
    }
  }
}
```

### 9.2 Products

#### Create Product
```bash
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "ELEC-SAM-001",
  "barcode": "8901234567890",
  "name": "Samsung LED TV 43 Inch",
  "categoryId": 1,
  "brandId": 1,
  "unitId": 1,
  "warehouseId": 1,
  "purchasePrice": 3500000,
  "sellingPrice": 4200000,
  "minimumStock": 5
}
```

#### Get Products with Filter
```bash
GET /api/products?$filter=stock gt 0&$orderBy=name asc&$top=10
Authorization: Bearer <token>
```

### 9.3 Sales

#### Create Sale
```bash
POST /api/sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": 1,
  "warehouseId": 1,
  "paymentMethod": "CASH",
  "discountPercent": 5,
  "taxPercent": 11,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 4200000
    }
  ]
}
```

#### Process Payment
```bash
POST /api/sales/1/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "method": "CASH",
  "amount": 10000000
}
```

### 9.4 Employees

#### Record Attendance
```bash
POST /api/attendances
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": 1,
  "date": "2024-09-16",
  "checkIn": "2024-09-16T08:45:00Z",
  "checkOut": "2024-09-16T17:30:00Z",
  "status": "LATE"
}
```

#### Request Leave
```bash
POST /api/leaves
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": 1,
  "type": "ANNUAL",
  "startDate": "2024-09-20",
  "endDate": "2024-09-24",
  "reason": "Liburan keluarga"
}
```

---

## 11. Project Structure

```
api/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── main.ts               # Entry point
│   ├── app.module.ts         # Root module
│   ├── config/               # Configuration
│   ├── common/               # Shared utilities
│   │   ├── prisma/          # Prisma service
│   │   ├── redis/           # Redis service
│   │   ├── guards/          # Auth guards
│   │   ├── interceptors/     # Logging, transform
│   │   └── decorators/      # Custom decorators
│   └── modules/             # Feature modules
│       ├── auth/
│       ├── user/
│       ├── product/
│       ├── sale/
│       ├── purchase/
│       ├── inventory/
│       ├── accounting/
│       ├── hrm/
│       └── ...
├── test/                    # Tests
└── scripts/                 # Utility scripts
```

---

*Last Updated: September 2026*
*Total Modules: 100+*
*Documentation Version: 1.0*
