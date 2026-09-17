# Modul API Toko CV IndoMurah - Dokumentasi Lengkap Business Logic

> Dokumen ini menjelaskan detail business logic untuk setiap modul dalam sistem POS Toko CV IndoMurah

---

# Daftar Isi

1. [Autentikasi & User Management](#1-autentikasi--user-management)
2. [Master Data](#2-master-data)
3. [Transaksi Penjualan](#3-transaksi-penjualan)
4. [Transaksi Pembelian](#4-transaksi-pembelian)
5. [Manajemen Inventori](#5-manajemen-inventori)
6. [Akuntansi](#6-akuntansi)
7. [HRM - SDM](#7-hrm---sdm)
8. [Produksi](#8-produksi)
9. [Aset & Servis](#9-aset--servis)
10. [Pengaturan & Loyalty](#10-pengaturan--loyalty)
11. [Notifikasi](#11-notifikasi)
12. [Laporan & Analitik](#12-laporan--analitik)
13. [Logging & Monitoring](#13-logging--monitoring)

---

# 1. AUTENTIKASI & USER MANAGEMENT

## 1.1 Auth Module (`/api/auth`)

### Purpose
Modul autentikasi utama untuk login, register, dan manajemen JWT token.

### Business Logic

#### Login Flow
```
1. User提交 username + password
2. System验证 username ada di database
3. System验证 password (bcrypt hash comparison)
4. System检查 user.isActive = true
5. Jika semua validasi berhasil:
   - Generate JWT token (accessToken + refreshToken)
   - Simpan refreshToken di database/Redis
   - Return user data + tokens
6. Jika gagal:
   - Return error dengan reason yang aman
```

#### Token Structure
```typescript
// Access Token Payload
{
  sub: string,           // User ID
  username: string,       // Username
  companyId: number,     // Company ID
  role: string,          // User role
  iat: number,           // Issued at
  exp: number            // Expiration
}

// Token Expiration
- Access Token: 15 minutes
- Refresh Token: 7 days
```

#### Registration Flow
```
1. Validate input (username, email, password, companyId)
2. Check username uniqueness (per company)
3. Check email uniqueness (if provided)
4. Hash password dengan bcrypt (salt rounds: 10)
5. Create user dengan role default "cashier"
6. Return user data (tanpa password)
```

#### Password Validation Rules
```
- Minimum 8 characters
- Minimum 1 uppercase letter
- Minimum 1 lowercase letter
- Minimum 1 number
- Minimum 1 special character
```

#### JWT Strategy
```typescript
// Passport JWT Configuration
{
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: process.env.JWT_SECRET,
  issuer: 'toko-cv-indomurah',
  audience: 'toko-cv-indomurah-api'
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login user |
| POST | `/auth/register` | Register user baru |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout dan invalidate token |
| GET | `/auth/profile` | Get current user profile |
| POST | `/auth/change-password` | Ubah password |

### Validation Rules

#### Login Request
```typescript
{
  username: string,  // required, min 3 chars
  password: string  // required
}
```

#### Register Request
```typescript
{
  username: string,   // required, unique per company, 3-100 chars
  email: string,      // optional, valid email format
  password: string,   // required, min 8 chars
  name: string,       // required, 1-255 chars
  companyId: number,  // required, must exist
  role: string        // optional, default "cashier"
}
```

### Error Codes
```
AUTH001: Invalid credentials
AUTH002: Account disabled
AUTH003: Token expired
AUTH004: Token invalid
AUTH005: Username already exists
AUTH006: Email already exists
AUTH007: Company not found
```

---

## 1.2 User Module (`/api/users`)

### Purpose
Manajemen data user yang terikat dengan company. Setiap user hanya bisa melihat data company-nya sendiri.

### Business Logic

#### User-Company Relationship
```
1. User dimiliki oleh satu Company
2. Company bisa memiliki banyak User
3. Username uniqueness enforced per company
   - Same username bisa ada di company berbeda
   - Unique constraint: (companyId, username)
4. Company isolation: user hanya bisa akses data company-nya
```

#### User Profile
```typescript
// Core Fields
interface User {
  id: string;           // UUID
  companyId: number;    // Foreign key ke Company
  username: string;      // Login username
  email?: string;       // Optional email
  password: string;     // Bcrypt hashed
  name: string;         // Full name
  role: string;         // Role name (cashier, manager, admin)
  isActive: boolean;    // Active status
  createdAt: Date;
  updatedAt: Date;
}
```

#### Role-Based Access Control (RBAC)
```
DEFAULT ROLES:
- admin: Full access
- manager: Management access
- cashier: POS transaction access
- viewer: Read-only access

Role permissions ditentukan oleh RoleMenu association
```

#### User Status Management
```
1. isActive = true:
   - User bisa login
   - User bisa akses API sesuai role
   
2. isActive = false:
   - User tidak bisa login
   - Token yang ada langsung diinvalidasi
   - Historical records tetap ada (soft delete pattern)
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List semua user (company-scoped) |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create user baru |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Soft delete user (isActive = false) |
| PATCH | `/users/:id/activate` | Activate user |
| PATCH | `/users/:id/deactivate` | Deactivate user |

### Validation Rules
```typescript
{
  username: [
    { required: true },
    { minLength: 3 },
    { maxLength: 100 },
    { pattern: /^[a-zA-Z0-9_]+$/ }
  ],
  email: [
    { validEmail: true }
  ],
  name: [
    { required: true },
    { minLength: 1 },
    { maxLength: 255 }
  ],
  role: [
    { required: true },
    { enum: ['admin', 'manager', 'cashier', 'viewer'] }
  ]
}
```

### Relationships
```
User (1) -----> (N) UserRole      // User bisa punya banyak role
User (1) -----> (N) UserMenu      // User bisa punya menu custom
User (1) -----> (N) Sale          // Created sales
User (1) -----> (N) Purchase      // Created purchases
User (1) -----> (N) Journal       // Created journals
User (N) <----- (1) Company       // User belongs to Company
```

---

## 1.3 Role Module (`/api/roles`)

### Purpose
Manajemen role/jabatan yang menentukan akses user ke menu dan fitur.

### Business Logic

#### Role Definition
```typescript
interface Role {
  id: number;
  roleName: string;        // Unique role identifier
  roleDescription?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Predefined Roles
```
1. Admin
   - Full system access
   - Can manage users, roles, menus
   - Can access all transactions
   - Can view all reports

2. Manager
   - Can manage master data
   - Can approve transactions
   - Can view reports
   - Cannot manage users/roles

3. Cashier
   - Can process sales
   - Can process simple purchases
   - Cannot access reports
   - Limited to POS operations

4. Viewer
   - Read-only access
   - Can view transactions
   - Cannot modify any data
```

#### Role-Menu Association
```
Role (1) -----> (N) RoleMenu
Menu (1) -----> (N) RoleMenu
Composite unique: (roleId, menuId)
```

#### Permission Check Flow
```
1. Request datang ke endpoint
2. Guard cek apakah endpoint butuh autentikasi
3. Guard cek apakah user punya role yang diizinkan
4. Guard cek apakah user punya akses ke menu terkait
5. Jika semua validasi berhasil, request diproses
6. Jika gagal, return 403 Forbidden
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roles` | List semua role |
| GET | `/roles/:id` | Get role by ID |
| GET | `/roles/:id/menus` | Get menu access untuk role |
| POST | `/roles` | Create role baru |
| PATCH | `/roles/:id` | Update role |
| DELETE | `/roles/:id` | Soft delete role |
| POST | `/roles/:id/menus` | Assign menus ke role |
| DELETE | `/roles/:id/menus/:menuId` | Remove menu dari role |

---

## 1.4 Menu Module (`/api/menus`)

### Purpose
Manajemen struktur menu sidebar aplikasi dan kontrol akses.

### Business Logic

#### Menu Structure
```typescript
interface Menu {
  id: number;
  menuName: string;      // Display name
  menuType?: string;     // 'menu', 'header', 'separator'
  icon?: string;         // Icon class/name
  route?: string;        // URL route
  parentMenuId?: number; // Parent menu for nested menus
  isActive: boolean;
  sortOrder: number;     // For ordering in sidebar
  createdAt: Date;
  updatedAt: Date;
}
```

#### Menu Hierarchy
```
Menu Tree Structure:
- Parent Menu
  - Child Menu 1
    - Grandchild Menu
  - Child Menu 2
  - Child Menu 3
```

#### Menu Types
```
1. Header
   - Tidak punya route
   - Hanya untuk grouping menu
   - Contoh: "Master Data", "Transaksi"

2. Menu Item
   - Punya route
   - Bisa diakses user
   - Contoh: "/products", "/sales"

3. Separator
   - Pembatas visual
   - Tidak punya route
```

#### Access Control Flow
```
1. User login
2. System fetch semua RoleUser user
3. System fetch semua RoleMenu untuk setiap role
4. System fetch semua Menu yang terkait
5. Build sidebar menu sesuai akses
6. Frontend render menu sesuai permission
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/menus` | List semua menu (tree structure) |
| GET | `/menus/:id` | Get menu by ID |
| POST | `/menus` | Create menu baru |
| PATCH | `/menus/:id` | Update menu |
| DELETE | `/menus/:id` | Delete menu |
| GET | `/menus/tree` | Get menu as tree structure |
| PATCH | `/menus/:id/reorder` | Change sort order |

### Menu Tree Example
```json
{
  "menuName": "Master Data",
  "menuType": "header",
  "children": [
    {
      "menuName": "Products",
      "icon": "product",
      "route": "/products",
      "sortOrder": 1
    },
    {
      "menuName": "Categories",
      "icon": "category",
      "route": "/categories",
      "sortOrder": 2
    }
  ]
}
```

---

## 1.5 UserRole Module (`/api/user-roles`)

### Purpose
Relasi many-to-many antara User dan Role. User bisa memiliki lebih dari satu role.

### Business Logic

#### User-Role Assignment
```typescript
interface UserRole {
  id: number;
  userId: string;       // Foreign key ke User
  roleId: number;       // Foreign key ke Role
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user: User;
  role: Role;
}
```

#### Assignment Rules
```
1. User bisa punya multiple roles
   - Admin: Can manage all
   - Cashier + Manager: Can do POS + view reports

2. Role check dengan OR logic
   - User punya akses jika punya MINIMAL SATU role yang diizinkan

3. Same user-role pair hanya sekali
   - Unique constraint: (userId, roleId)

4. Deactivation tidak delete record
   - isActive = false berarti role tidak aktif untuk user tersebut
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user-roles` | List semua user-role assignments |
| GET | `/user-roles/user/:userId` | Get roles untuk user |
| GET | `/user-roles/role/:roleId` | Get users untuk role |
| POST | `/user-roles` | Assign role ke user |
| DELETE | `/user-roles/:id` | Remove role dari user |
| PATCH | `/user-roles/:id/toggle` | Toggle active status |

---

## 1.6 RoleMenu Module (`/api/role-menus`)

### Purpose
Relasi many-to-many antara Role dan Menu. Menentukan menu apa saja yang bisa diakses oleh role tertentu.

### Business Logic

#### Role-Menu Assignment
```typescript
interface RoleMenu {
  id: number;
  roleId: number;       // Foreign key ke Role
  menuId: number;       // Foreign key ke Menu
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  role: Role;
  menu: Menu;
}
```

#### Permission Inheritance
```
1. Parent Menu Access
   - Jika user punya akses ke parent menu
   - User otomatis punya akses ke semua child menu
   
2. Example:
   - User punya akses ke "Master Data" (header)
   - User otomatis bisa akses semua menu di bawahnya
   - Products, Categories, Brands, etc.
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/role-menus` | List semua role-menu assignments |
| GET | `/role-menus/role/:roleId` | Get menus untuk role |
| POST | `/role-menus` | Assign menu ke role |
| DELETE | `/role-menus/:id` | Remove menu dari role |
| POST | `/role-menus/bulk` | Assign multiple menus sekaligus |

---

## 1.7 UserMenu Module (`/api/user-menus`)

### Purpose
Custom menu access per user. Override atau tambahkan akses menu spesifik untuk user tertentu.

### Business Logic

#### Custom Menu Access
```typescript
interface UserMenu {
  id: number;
  userId: string;       // Foreign key ke User
  menuId: number;       // Foreign key ke Menu
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Access Resolution Order
```
1. Check UserMenu first (custom access)
   - Jika ada dan isActive = true: ACCESS GRANTED
   
2. Check RoleMenu (role-based access)
   - Cek semua role user
   - Jika ada role yang punya menu: ACCESS GRANTED
   
3. Default deny
   - Jika tidak ada di UserMenu atau RoleMenu: ACCESS DENIED
```

#### Use Cases
```
1. Custom permissions untuk VIP user
2. Temporary access grants
3. Exceptions to role-based rules
```

---

# 2. MASTER DATA

## 2.1 Company Module (`/api/companies`)

### Purpose
Master data untuk perusahaan/toko. Setiap data dalam sistem terikat dengan company.

### Business Logic

#### Company Structure
```typescript
interface Company {
  id: number;
  companyCode: string;    // Unique company identifier
  name: string;           // Company name
  address?: string;        // Alamat
  phone?: string;          // Telepon
  email?: string;          // Email
  city?: string;           // Kota
  province?: string;       // Provinsi
  postalCode?: string;     // Kode pos
  taxId?: string;          // NPWP
  logoUrl?: string;        // Logo URL
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Company Isolation
```
1. Semua data memiliki companyId
2. User hanya bisa melihat data company-nya
3. Query selalu include companyId filter
4. Cannot cross-company data access
```

#### Company Settings
```
- Numbering format
- Tax rate default
- Currency
- Date format
- Time zone
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/companies` | List semua company |
| GET | `/companies/:id` | Get company by ID |
| POST | `/companies` | Create company baru |
| PATCH | `/companies/:id` | Update company |
| DELETE | `/companies/:id` | Soft delete company |

---

## 2.2 Category Module (`/api/categories`)

### Purpose
Kategori produk untuk mengelompokkan produk. Contoh: Elektronik, Fashion, Makanan, dll.

### Business Logic

#### Category Structure
```typescript
interface Category {
  id: number;
  code: string;        // Unique category code
  name: string;        // Category name
  icon?: string;       // Icon identifier
  image?: string;      // Category image URL
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Category Tree
```typescript
// Same table hierarchy
interface Category {
  // ... existing fields
  parentId?: number;  // Parent category
  level: number;       // Nesting level (0 = root)
  
  // Relations
  parent?: Category;
  children?: Category[];
  products?: Product[];
}
```

#### Validation Rules
```
1. Code uniqueness
   - Category code harus unique
   
2. Parent-child validation
   - Category tidak bisa jadi parent dari dirinya sendiri
   - Maximum nesting level: 3
   
3. Deletion rules
   - Category dengan products tidak bisa dihapus
   - Must reassign/delete products first
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List semua category |
| GET | `/categories/:id` | Get category by ID |
| GET | `/categories/tree` | Get category as tree |
| GET | `/categories/:id/products` | Get products dalam category |
| POST | `/categories` | Create category baru |
| PATCH | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

### Business Rules
```
1. Default category untuk produk tanpa category
2. Category tidak aktif tidak muncul di dropdown
3. Category count untuk reporting
```

---

## 2.3 Brand Module (`/api/brands`)

### Purpose
Merek produk. Contoh: Samsung, Apple, Sony, dll.

### Business Logic

#### Brand Structure
```typescript
interface Brand {
  id: number;
  code: string;        // Unique brand code
  name: string;        // Brand name
  description?: string;
  logoUrl?: string;    // Brand logo URL
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Brand Usage
```
1. Products bisa punya brand atau null
2. Brand filter di product list
3. Brand statistics:
   - Total products
   - Total sales
   - Total revenue
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/brands` | List semua brand |
| GET | `/brands/:id` | Get brand by ID |
| GET | `/brands/:id/products` | Get products dalam brand |
| POST | `/brands` | Create brand baru |
| PATCH | `/brands/:id` | Update brand |
| DELETE | `/brands/:id` | Delete brand |

---

## 2.4 BrandLogo Module (`/api/brand-logos`)

### Purpose
Galeri logo dan informasi tambahan untuk brand.

### Business Logic

#### BrandLogo Structure
```typescript
interface BrandLogo {
  id: number;
  brandId?: number;      // Optional: link to Brand
  name: string;          // Logo name/title
  logoUrl: string;       // Logo image URL
  website?: string;      // Brand website
  sortOrder: number;     // Display order
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Use Cases
```
1. Multiple logos untuk brand yang sama
2. Brand tanpa produk tapi punya logo (promosi)
3. Different logo sizes/formats
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/brand-logos` | List semua brand logos |
| GET | `/brand-logos/:id` | Get logo by ID |
| GET | `/brand-logos/brand/:brandId` | Get logos untuk brand |
| POST | `/brand-logos` | Create logo baru |
| PATCH | `/brand-logos/:id` | Update logo |
| DELETE | `/brand-logos/:id` | Delete logo |

---

## 2.5 Unit Module (`/api/units`)

### Purpose
Satuan produk. Contoh: pcs, kg, meter, liter, dll.

### Business Logic

#### Unit Structure
```typescript
interface Unit {
  id: number;
  code: string;          // Unique unit code
  name: string;          // Unit name (e.g., "Piece")
  abbreviation?: string; // Short form (e.g., "pcs")
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Common Units
```
1. pcs - Pieces
2. kg - Kilogram
3. g - Gram
4. liter - Liter
5. ml - Milliliter
6. meter - Meter
7. cm - Centimeter
8. roll - Roll
9. box - Box
10. pack - Pack
```

#### Unit in Transactions
```
1. Purchase: Beli dalam unit tertentu
2. Stock: Simpan dalam unit tertentu
3. Sale: Jual dalam unit tertentu

Note: Unit conversion perlu tracking terpisah
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/units` | List semua unit |
| GET | `/units/:id` | Get unit by ID |
| POST | `/units` | Create unit baru |
| PATCH | `/units/:id` | Update unit |
| DELETE | `/units/:id` | Delete unit |

---

## 2.6 Product Module (`/api/products`)

### Purpose
Master data produk dengan lengkap termasuk harga, stock, dan informasi lainnya.

### Business Logic

#### Product Structure
```typescript
interface Product {
  id: number;
  code: string;              // Unique product code/SKU
  barcode?: string;         // Primary barcode
  name: string;             // Product name
  categoryId?: number;       // Category foreign key
  brandId?: number;         // Brand foreign key
  productGroupId?: number;   // Product group foreign key
  unitId: number;           // Base unit
  warehouseId?: number;      // Default warehouse
  purchasePrice: Decimal;    // Harga beli
  sellingPrice: Decimal;     // Harga jual
  discountPercent: Decimal;  // Diskon %
  stock: Decimal;            // Current stock
  minimumStock: Decimal;     // Minimum stock alert
  image?: string;            // Product image URL
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Product Code Generation
```
Format: {CATEGORY_PREFIX}-{BRAND_PREFIX}{SEQUENCE}
Example: ELEC-SAM-00001

Auto-generated jika tidak diisi
Numbering sesuai Numbering config
```

#### Price Calculation
```typescript
// Selling Price dengan Discount
interface PriceCalculation {
  basePrice: number;           // sellingPrice dari database
  discountPercent: number;      // discountPercent dari database
  discountAmount: number;      // basePrice * discountPercent / 100
  finalPrice: number;          // basePrice - discountAmount
  
  // Tax calculation
  taxPercent: number;          // dari transaction
  taxAmount: number;           // finalPrice * taxPercent / 100
  totalPrice: number;          // finalPrice + taxAmount
}
```

#### Stock Management
```
1. Initial Stock: 0
2. Stock Updates via:
   - Stock In: +
   - Stock Out: -
   - Stock Transfer: +/-
   - Stock Opname: Adjustment
   - Sale: -
   - Purchase: +
   
3. Stock Alert Trigger
   - Jika stock <= minimumStock
   - Create StockAlert record
   - Send notification ke manager
```

#### Product Images
```
1. Primary image di Product.image
2. Gallery di ProductImage table
3. Multiple images dengan sort order
4. Satu image bisa ditandai isPrimary = true
```

#### Product Barcodes
```
1. Primary barcode di Product.barcode
2. Alternative barcodes di ProductBarcode table
3. Multiple barcodes per product (different packaging)
4. Barcode uniqueness check
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List semua product |
| GET | `/products/:id` | Get product by ID |
| GET | `/products/:id/stock` | Get stock info |
| GET | `/products/barcode/:barcode` | Get by barcode |
| GET | `/products/low-stock` | Get low stock products |
| POST | `/products` | Create product baru |
| PATCH | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| POST | `/products/:id/price-history` | Log price change |

### Validation Rules
```typescript
{
  code: [
    { required: true },
    { unique: true },
    { maxLength: 50 }
  ],
  name: [
    { required: true },
    { minLength: 1 },
    { maxLength: 255 }
  ],
  unitId: [
    { required: true },
    { exists: 'units' }
  ],
  purchasePrice: [
    { required: true },
    { min: 0 }
  ],
  sellingPrice: [
    { required: true },
    { min: 0 }
  ],
  stock: [
    { min: 0 }
  ]
}
```

### Business Rules
```
1. Product aktif tidak bisa dihapus
2. Price change logged ke PriceHistory
3. Stock tidak boleh negatif
4. Barcode uniqueness check
```

---

## 2.7 ProductGroup Module (`/api/product-groups`)

### Purpose
Golongan produk untuk pengelompokan tambahan. Contoh: Premium, Standard, Economy.

### Business Logic

#### ProductGroup Structure
```typescript
interface ProductGroup {
  id: number;
  code: string;        // Unique group code
  name: string;        // Group name
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Use Cases
```
1. Product tier classification
2. Marketing segmentation
3. Pricing group
4. Report grouping
```

---

## 2.8 ProductImage Module (`/api/product-images`)

### Purpose
Galeri foto produk untuk e-commerce dan katalog.

### Business Logic

#### ProductImage Structure
```typescript
interface ProductImage {
  id: number;
  productId: number;      // Foreign key ke Product
  url: string;           // Image URL
  caption?: string;      // Image caption
  sortOrder: number;     // Display order
  isPrimary: boolean;     // Primary image flag
  createdAt: Date;
}
```

#### Primary Image Rules
```
1. Hanya satu image per product dengan isPrimary = true
2. Jika image baru di-set primary, image lama auto di-unset
3. Jika tidak ada primary, image dengan sortOrder = 0 jadi primary
4. Jika semua image dihapus, Product.image jadi null
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/product-images` | List semua product images |
| GET | `/product-images/:id` | Get image by ID |
| GET | `/product-images/product/:productId` | Get images untuk product |
| POST | `/product-images` | Create image baru |
| PATCH | `/product-images/:id` | Update image |
| DELETE | `/product-images/:id` | Delete image |
| PATCH | `/product-images/:id/set-primary` | Set sebagai primary image |

---

## 2.9 ProductBarcode Module (`/api/product-barcodes`)

### Purpose
Multiple barcode per produk untuk mengakomodasi berbagai kemasan/varian.

### Business Logic

#### ProductBarcode Structure
```typescript
interface ProductBarcode {
  id: number;
  productId: number;      // Foreign key ke Product
  barcode: string;        // Barcode value
  isDefault: boolean;      // Default barcode
  isActive: boolean;
  createdAt: Date;
}
```

#### Barcode Rules
```
1. Barcode uniqueness (global)
2. Multiple barcodes per product
3. Satu barcode bisa jadi default
4. Inactive barcode tetap ada tapi tidak digunakan
```

#### Lookup Flow
```
1. Scan barcode
2. Check Product.barcode (primary)
3. Check ProductBarcode.barcode (alternatives)
4. Return product if found
5. Return error if not found
```

---

## 2.10 ProductStock Module (`/api/product-stocks`)

### Purpose
Stock produk per gudang. Memungkinkan tracking stock di multiple warehouse.

### Business Logic

#### ProductStock Structure
```typescript
interface ProductStock {
  id: number;
  productId: number;       // Foreign key ke Product
  warehouseId: number;      // Foreign key ke Warehouse
  quantity: Decimal;        // Current quantity
  minimumStock: Decimal;    // Minimum stock alert
  updatedAt: Date;
  
  // Composite unique: (productId, warehouseId)
}
```

#### Stock Update Flow
```typescript
async function updateStock(productId, warehouseId, delta) {
  // 1. Get or create stock record
  let stock = await prisma.productStock.findUnique({
    where: { productId_warehouseId: { productId, warehouseId } }
  });
  
  if (!stock) {
    stock = await prisma.productStock.create({
      data: { productId, warehouseId, quantity: 0 }
    });
  }
  
  // 2. Calculate new quantity
  const newQuantity = stock.quantity + delta;
  
  // 3. Validate tidak negatif
  if (newQuantity < 0) {
    throw new Error('Insufficient stock');
  }
  
  // 4. Update stock
  await prisma.productStock.update({
    where: { id: stock.id },
    data: { quantity: newQuantity }
  });
  
  // 5. Check low stock alert
  if (newQuantity <= stock.minimumStock) {
    await createStockAlert(productId, warehouseId, newQuantity);
  }
  
  // 6. Update Product.stock (aggregate)
  await recalculateProductStock(productId);
}
```

#### Aggregate Stock
```typescript
// Product.stock adalah SUM dari semua ProductStock
async function recalculateProductStock(productId) {
  const totalStock = await prisma.productStock.aggregate({
    where: { productId },
    _sum: { quantity: true }
  });
  
  await prisma.product.update({
    where: { id: productId },
    data: { stock: totalStock._sum.quantity || 0 }
  });
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/product-stocks` | List semua stock |
| GET | `/product-stocks/:id` | Get stock by ID |
| GET | `/product-stocks/product/:productId` | Get stock untuk product |
| GET | `/product-stocks/warehouse/:warehouseId` | Get stock di warehouse |
| GET | `/product-stocks/low-stock` | Get low stock items |
| PATCH | `/product-stocks/:id` | Update stock quantity |
| POST | `/product-stocks/adjust` | Adjust stock (stock opname) |

---

## 2.11 Supplier Module (`/api/suppliers`)

### Purpose
Master data supplier/pemasok untuk transaksi pembelian.

### Business Logic

#### Supplier Structure
```typescript
interface Supplier {
  id: number;
  code: string;            // Unique supplier code
  name: string;            // Supplier name
  contactPerson?: string;   // Nama kontak
  phone?: string;           // Telepon
  email?: string;           // Email
  address?: string;         // Alamat
  totalDebt: Decimal;       // Total hutang ke supplier
  notes?: string;           // Catatan
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Supplier Debt Tracking
```typescript
// Total hutang dihitung dari:
interface SupplierDebt {
  // From Purchase
  totalPurchases: number;      // SUM dari semua Purchase.total
  totalPaid: number;           // SUM dari semua PurchasePayment
  totalDebt: number;           // totalPurchases - totalPaid
  
  // From PurchaseReturn
  totalReturns: number;       // SUM dari semua PurchaseReturn
  returnsPaid: number;         // Pengurangan hutang
}
```

#### Supplier Balance Calculation
```
TotalDebt = 
  SUM(Purchase.total) 
  - SUM(PurchasePayment.amount) 
  - SUM(PurchaseReturn.totalReturn)
  + Adjustment
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/suppliers` | List semua supplier |
| GET | `/suppliers/:id` | Get supplier by ID |
| GET | `/suppliers/:id/balance` | Get hutang supplier |
| GET | `/suppliers/:id/purchases` | Get history pembelian |
| POST | `/suppliers` | Create supplier baru |
| PATCH | `/suppliers/:id` | Update supplier |
| DELETE | `/suppliers/:id` | Delete supplier |

---

## 2.12 Customer Module (`/api/customers`)

### Purpose
Master data pelanggan dengan support loyalty program dan group pricing.

### Business Logic

#### Customer Structure
```typescript
interface Customer {
  id: number;
  code: string;              // Unique customer code
  name: string;              // Customer name
  phone?: string;            // Telepon
  email?: string;            // Email
  address?: string;          // Alamat
  totalReceivable: Decimal;  // Total piutang
  customerGroup: CustomerGroup; // RETAIL, WHOLESALE, VIP, GENERAL
  pointBalance: number;       // Loyalty points
  notes?: string;            // Catatan
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum CustomerGroup {
  RETAIL;      // Pelanggan umum
  WHOLESALE;   // Pelanggan grosir
  VIP;         // Pelanggan prioritas
  GENERAL;     // Default group
}
```

#### Customer Balance Tracking
```typescript
// Total piutang dihitung dari:
interface CustomerReceivable {
  totalSales: number;      // SUM dari semua Sale.total
  totalPaid: number;      // SUM dari semua SalePayment
  totalReceivable: number; // totalSales - totalPaid - deposits
  
  // Deposits mengurangi receivable
  totalDeposits: number;  // SUM dari CustomerDeposit
  usedDeposits: number;    // Deposits yang sudah digunakan
}
```

#### Loyalty Points System
```typescript
// Points calculation
interface PointCalculation {
  // Earn points
  pointsEarned = transactionAmount * pointsPerRupiah;
  
  // Redeem points
  rewardValue = pointsRedeemed / pointsPerRupiah;
}

// PointSetting
interface PointSetting {
  pointsPerRupiah: number;      // e.g., 0.01 = 1 point per Rp 100
  minimumTransaction: number;  // Min transaction untuk earn points
}
```

#### Customer Group Benefits
```
RETAIL:
- Standard pricing
- Basic loyalty points

WHOLESALE:
- Discounted pricing
- Higher points multiplier
- Credit terms available

VIP:
- Special pricing
- Highest points multiplier
- Priority service
- Extended credit terms
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List semua customer |
| GET | `/customers/:id` | Get customer by ID |
| GET | `/customers/:id/balance` | Get piutang customer |
| GET | `/customers/:id/points` | Get loyalty points |
| GET | `/customers/:id/history` | Get transaction history |
| POST | `/customers` | Create customer baru |
| PATCH | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |
| POST | `/customers/:id/add-points` | Add loyalty points |
| POST | `/customers/:id/redeem-points` | Redeem points |

---

## 2.13 SalesPerson Module (`/api/sales-persons`)

### Purpose
Data sales person untuk tracking penjualan dan komisi.

### Business Logic

#### SalesPerson Structure
```typescript
interface SalesPerson {
  id: number;
  code: string;        // Unique code
  name: string;        // Full name
  phone?: string;      // Telepon
  email?: string;      // Email
  address?: string;    // Alamat
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Sales Tracking
```typescript
// Statistics per sales person
interface SalesPersonStats {
  totalSales: number;           // Total transaksi
  totalRevenue: Decimal;        // Total penjualan
  totalTransactions: number;   // Jumlah transaksi
  averageTransaction: number;  // Rata-rata transaksi
  topProducts: Product[];      // Produk terlaris
  period: {
    startDate: Date;
    endDate: Date;
  };
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sales-persons` | List semua sales person |
| GET | `/sales-persons/:id` | Get sales person by ID |
| GET | `/sales-persons/:id/stats` | Get sales statistics |
| POST | `/sales-persons` | Create sales person baru |
| PATCH | `/sales-persons/:id` | Update sales person |
| DELETE | `/sales-persons/:id` | Delete sales person |

---

## 2.14 Warehouse Module (`/api/warehouses`)

### Purpose
Master data gudang untuk manajemen inventori multi-location.

### Business Logic

#### Warehouse Structure
```typescript
interface Warehouse {
  id: number;
  code: string;        // Unique warehouse code
  name: string;        // Warehouse name
  address?: string;     // Alamat
  phone?: string;       // Telepon
  isDefault: boolean;   // Default warehouse
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Default Warehouse
```
1. Satu warehouse dengan isDefault = true
2. Saat create Product tanpa warehouseId, gunakan default
3. Saat create transaction tanpa warehouseId, gunakan default
4. Default warehouse tidak bisa di-delete
```

#### Warehouse Usage
```
1. Stock management per location
2. Stock transfer antar warehouse
3. Stock opname per warehouse
4. Report per warehouse
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/warehouses` | List semua warehouse |
| GET | `/warehouses/:id` | Get warehouse by ID |
| GET | `/warehouses/:id/stock` | Get stock di warehouse |
| GET | `/warehouses/default` | Get default warehouse |
| POST | `/warehouses` | Create warehouse baru |
| PATCH | `/warehouses/:id` | Update warehouse |
| DELETE | `/warehouses/:id` | Delete warehouse |

---

## 2.15 Shelf Module (`/api/shelves`)

### Purpose
Rak di dalam gudang untuk penempatan produk yang lebih detail.

### Business Logic

#### Shelf Structure
```typescript
interface Shelf {
  id: number;
  warehouseId: number;   // Foreign key ke Warehouse
  code: string;          // Unique shelf code (e.g., A-01-03)
  name: string;          // Shelf name
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Shelf Code Format
```
Format: {ZONE}-{AISLE}-{LEVEL}
Example: A-01-03

A = Zone A
01 = Aisle 1
03 = Level 3
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shelves` | List semua shelf |
| GET | `/shelves/:id` | Get shelf by ID |
| GET | `/shelves/warehouse/:warehouseId` | Get shelves di warehouse |
| POST | `/shelves` | Create shelf baru |
| PATCH | `/shelves/:id` | Update shelf |
| DELETE | `/shelves/:id` | Delete shelf |

---

## 2.16 ShelfProduct Module (`/api/shelf-products`)

### Purpose
Posisi produk di rak. Track dimana produk ditempatkan.

### Business Logic

#### ShelfProduct Structure
```typescript
interface ShelfProduct {
  id: number;
  shelfId: number;       // Foreign key ke Shelf
  productId: number;      // Foreign key ke Product
  quantity: Decimal;       // Quantity di rak ini
  createdAt: Date;
  updatedAt: Date;
  
  // Composite unique: (shelfId, productId)
}
```

#### Product Placement Flow
```typescript
// Place product to shelf
async function placeProductToShelf(shelfId, productId, quantity) {
  // 1. Check shelf exists
  const shelf = await prisma.shelf.findUnique({ where: { id: shelfId } });
  
  // 2. Check product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  
  // 3. Create or update shelf product
  await prisma.shelfProduct.upsert({
    where: {
      shelfId_productId: { shelfId, productId }
    },
    create: { shelfId, productId, quantity },
    update: { quantity }
  });
  
  // 4. Update warehouse stock
  await updateWarehouseStock(shelf.warehouseId, productId);
}
```

---

## 2.17 Numbering Module (`/api/numberings`)

### Purpose
Konfigurasi format penomoran dokumen otomatis.

### Business Logic

#### Numbering Structure
```typescript
interface Numbering {
  id: number;
  type: string;          // Document type (e.g., 'SALE', 'PURCHASE')
  prefix: string;         // Prefix (e.g., 'INV-')
  lastNumber: number;     // Last used number
  suffix: string;         // Suffix (e.g., '/2024')
  digitCount: number;     // Number of digits (e.g., 4 = 0001)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Number Generation
```typescript
// Generate next number
async function generateNumber(type: string): Promise<string> {
  const numbering = await prisma.numbering.findUnique({
    where: { type }
  });
  
  if (!numbering) {
    throw new Error(`Numbering config not found for type: ${type}`);
  }
  
  // Increment
  const nextNumber = numbering.lastNumber + 1;
  
  // Update last number
  await prisma.numbering.update({
    where: { id: numbering.id },
    data: { lastNumber: nextNumber }
  });
  
  // Format
  const numStr = nextNumber.toString().padStart(numbering.digitCount, '0');
  return `${numbering.prefix}${numStr}${numbering.suffix}`;
}

// Usage example:
// type = 'SALE', prefix = 'INV-', lastNumber = 1234, suffix = '/2024'
// Result: "INV-1235/2024"
```

#### Default Numbering Types
```
SALE: Invoice penjualan
PURCHASE: Invoice pembelian
STOCK_IN: Barang masuk
STOCK_OUT: Barang keluar
STOCK_TRANSFER: Transfer stock
PAYMENT_IN: Pembayaran masuk
PAYMENT_OUT: Pembayaran keluar
EXPENSE: Pengeluaran
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/numberings` | List semua numbering config |
| GET | `/numberings/:id` | Get numbering by ID |
| GET | `/numberings/type/:type` | Get by document type |
| POST | `/numberings` | Create numbering config |
| PATCH | `/numberings/:id` | Update numbering config |
| POST | `/numberings/generate/:type` | Generate next number |

---

# 3. TRANSAKSI PENJUALAN

## 3.1 Sale Module (`/api/sales`)

### Purpose
Transaksi penjualan utama. Mencatat semua penjualan barang/jasa ke pelanggan.

### Business Logic

#### Sale Structure
```typescript
interface Sale {
  id: number;
  code: string;                  // Sale invoice number
  date: Date;                    // Transaction date
  customerId: number;            // Customer foreign key
  salesPersonId?: number;         // Sales person foreign key
  salePointId?: number;           // POS/Terminal ID
  warehouseId?: number;           // Warehouse foreign key
  subtotal: Decimal;             // Subtotal (before tax)
  discountPercent: Decimal;       // Discount %
  discountAmount: Decimal;        // Discount amount
  taxPercent: Decimal;            // Tax %
  taxAmount: Decimal;             // Tax amount
  total: Decimal;                // Grand total
  cashAmount: Decimal;           // Cash paid
  changeAmount: Decimal;          // Change given
  paymentStatus: PaymentStatus;   // Payment status
  isReturn: boolean;              // Is this a return transaction?
  returnedAt?: Date;              // Return timestamp
  paymentMethod?: PaymentMethod;  // Payment method
  notes?: string;                 // Notes
  createdById: string;            // User who created
  createdAt: Date;
  updatedAt: Date;
}

enum PaymentStatus {
  PENDING;     // Belum dibayar
  PAID;        // Lunas
  INSTALMENT;  // Cicilan
  PARTIAL;     // Bayar sebagian
  CANCELLED;   // Dibatalkan
}

enum PaymentMethod {
  CASH;        // Tunai
  TRANSFER;    // Transfer bank
  DEBIT;       // Kartu debit
  QRIS;        // QRIS
  CREDIT;      // Kartu kredit
}
```

#### Sale Creation Flow
```typescript
async function createSale(data: CreateSaleDto) {
  // 1. Validate customer
  const customer = await prisma.customer.findUnique({ 
    where: { id: data.customerId } 
  });
  
  // 2. Calculate totals
  const subtotal = calculateSubtotal(data.items);
  const discountAmount = subtotal * (data.discountPercent / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (data.taxPercent / 100);
  const total = afterDiscount + taxAmount;
  
  // 3. Generate code
  const code = await generateNumber('SALE');
  
  // 4. Create sale
  const sale = await prisma.sale.create({
    data: {
      code,
      customerId: data.customerId,
      salesPersonId: data.salesPersonId,
      salePointId: data.salePointId,
      warehouseId: data.warehouseId || getDefaultWarehouseId(),
      subtotal,
      discountPercent: data.discountPercent,
      discountAmount,
      taxPercent: data.taxPercent,
      taxAmount,
      total,
      paymentStatus: 'PENDING',
      createdById: data.userId,
      items: {
        create: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent || 0,
          discountAmount: calculateItemDiscount(item),
          subtotal: calculateItemSubtotal(item)
        }))
      }
    },
    include: { items: true }
  });
  
  // 5. Update customer receivable
  await updateCustomerReceivable(customer.id, total);
  
  // 6. Log activity
  await createActivityLog({
    type: 'SALE',
    title: `Penjualan ${code}`,
    referenceType: 'Sale',
    referenceId: sale.id,
    amount: total
  });
  
  return sale;
}
```

#### Payment Processing
```typescript
async function processPayment(saleId: number, paymentData: PaymentData) {
  const sale = await prisma.sale.findUnique({ 
    where: { id: saleId } 
  });
  
  // 1. Calculate total paid
  const existingPayments = await prisma.salePayment.aggregate({
    where: { saleId },
    _sum: { amount: true }
  });
  
  const totalPaid = (existingPayments._sum.amount || 0) + paymentData.amount;
  
  // 2. Determine payment status
  let paymentStatus: PaymentStatus;
  if (totalPaid >= sale.total) {
    paymentStatus = 'PAID';
  } else if (totalPaid > 0) {
    paymentStatus = 'PARTIAL';
  } else {
    paymentStatus = 'PENDING';
  }
  
  // 3. Create payment record
  const payment = await prisma.salePayment.create({
    data: {
      saleId,
      method: paymentData.method,
      amount: paymentData.amount,
      referenceNumber: paymentData.referenceNumber,
      date: paymentData.date || new Date(),
      notes: paymentData.notes,
      createdById: paymentData.userId
    }
  });
  
  // 4. Update sale status
  await prisma.sale.update({
    where: { id: saleId },
    data: { 
      paymentStatus,
      cashAmount: paymentData.method === 'CASH' ? paymentData.amount : undefined,
      changeAmount: paymentData.method === 'CASH' && totalPaid > sale.total 
        ? totalPaid - sale.total 
        : undefined
    }
  });
  
  // 5. If fully paid, update customer receivable
  if (paymentStatus === 'PAID') {
    await updateCustomerReceivable(sale.customerId, -sale.total);
  }
  
  return { payment, paymentStatus };
}
```

#### Stock Deduction
```typescript
async function deductStock(sale: Sale) {
  for (const item of sale.items) {
    // 1. Deduct from warehouse stock
    await prisma.productStock.update({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: sale.warehouseId
        }
      },
      data: {
        quantity: { decrement: item.quantity }
      }
    });
    
    // 2. Deduct from product aggregate stock
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: { decrement: item.quantity }
      }
    });
    
    // 3. Check low stock alert
    await checkStockAlert(item.productId, sale.warehouseId);
  }
}
```

#### Point Calculation
```typescript
async function calculateLoyaltyPoints(sale: Sale) {
  const pointSetting = await prisma.pointSetting.findFirst();
  
  if (!pointSetting || sale.total < pointSetting.minimumTransaction) {
    return 0;
  }
  
  // Calculate points based on customer group
  const customer = await prisma.customer.findUnique({
    where: { id: sale.customerId }
  });
  
  let multiplier = 1;
  switch (customer.customerGroup) {
    case 'VIP': multiplier = 3; break;
    case 'WHOLESALE': multiplier = 2; break;
    case 'RETAIL': multiplier = 1; break;
    default: multiplier = 1;
  }
  
  const points = Math.floor(sale.total * pointSetting.pointsPerRupiah * multiplier);
  
  // Update customer points
  await prisma.customer.update({
    where: { id: sale.customerId },
    data: { pointBalance: { increment: points } }
  });
  
  return points;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sales` | List semua penjualan |
| GET | `/sales/:id` | Get penjualan by ID |
| GET | `/sales/code/:code` | Get by code |
| GET | `/sales/customer/:customerId` | Get by customer |
| GET | `/sales/date/:date` | Get by date |
| GET | `/sales/pending` | Get pending payments |
| POST | `/sales` | Create penjualan baru |
| PATCH | `/sales/:id` | Update penjualan |
| DELETE | `/sales/:id` | Cancel penjualan |
| POST | `/sales/:id/payment` | Add payment |
| GET | `/sales/:id/payments` | Get payments |

### Business Rules
```
1. Sale dengan isReturn = true tidak mengurangi stock
2. Sale dengan status CANCELLED tidak mengurangi stock
3. Partial payment tidak mengurangi customer receivable
4. Full payment mengurangi customer receivable
5. Points dihitung dari total setelah diskon dan pajak
```

---

## 3.2 SaleItem Module (`/api/sale-items`)

### Purpose
Item-item dalam transaksi penjualan.

### Business Logic

#### SaleItem Structure
```typescript
interface SaleItem {
  id: number;
  saleId: number;             // Foreign key ke Sale
  productId: number;          // Foreign key ke Product
  quantity: Decimal;          // Quantity sold
  unitPrice: Decimal;         // Price per unit
  discountPercent: Decimal;   // Item discount %
  discountAmount: Decimal;    // Item discount amount
  subtotal: Decimal;         // Line total
  unitId?: number;            // Unit (optional override)
  createdAt: Date;
}
```

#### Item Calculation
```typescript
// Calculate item subtotal
const subtotal = quantity * unitPrice;
const discountAmount = subtotal * (discountPercent / 100);
const finalSubtotal = subtotal - discountAmount;
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sale-items` | List semua sale items |
| GET | `/sale-items/:id` | Get item by ID |
| GET | `/sale-items/sale/:saleId` | Get items by sale |
| POST | `/sale-items` | Create sale item |
| PATCH | `/sale-items/:id` | Update sale item |
| DELETE | `/sale-items/:id` | Delete sale item |

---

## 3.3 SalePayment Module (`/api/sale-payments`)

### Purpose
Pembayaran untuk transaksi penjualan.

### Business Logic

#### SalePayment Structure
```typescript
interface SalePayment {
  id: number;
  saleId: number;             // Foreign key ke Sale
  method: PaymentMethod;      // Payment method
  amount: Decimal;            // Payment amount
  referenceNumber?: string;   // Reference (e.g., bank transfer number)
  date: Date;                 // Payment date
  notes?: string;            // Notes
  createdById: string;       // User who created
  createdAt: Date;
}
```

#### Payment Flow
```typescript
async function addPayment(saleId: number, data: AddPaymentDto) {
  const sale = await prisma.sale.findUnique({ where: { id: saleId } });
  
  // 1. Get existing payments total
  const paidAmount = await getTotalPaid(saleId);
  
  // 2. Check if overpayment
  const remaining = sale.total - paidAmount;
  if (data.amount > remaining) {
    // Allow overpayment, calculate change
    const change = data.amount - remaining;
    
    await prisma.sale.update({
      where: { id: saleId },
      data: { 
        cashAmount: sale.cashAmount + data.amount,
        changeAmount: change,
        paymentStatus: 'PAID'
      }
    });
  }
  
  // 3. Create payment record
  const payment = await prisma.salePayment.create({
    data: {
      saleId,
      method: data.method,
      amount: data.amount,
      referenceNumber: data.referenceNumber,
      date: data.date || new Date(),
      notes: data.notes,
      createdById: data.userId
    }
  });
  
  // 4. Update sale status
  await updateSalePaymentStatus(saleId);
  
  // 5. Update customer receivable if fully paid
  if (await isFullyPaid(saleId)) {
    await updateCustomerReceivable(sale.customerId, -sale.total);
  }
  
  return payment;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sale-payments` | List semua payments |
| GET | `/sale-payments/:id` | Get payment by ID |
| GET | `/sale-payments/sale/:saleId` | Get payments by sale |
| POST | `/sale-payments` | Create payment |
| DELETE | `/sale-payments/:id` | Delete/refund payment |

---

## 3.4 SaleReturn Module (`/api/sale-returns`)

### Purpose
Retur/pengembalian barang dari pelanggan.

### Business Logic

#### SaleReturn Structure
```typescript
interface SaleReturn {
  id: number;
  code: string;              // Return code
  date: Date;               // Return date
  saleId: number;            // Original sale
  customerId: number;       // Customer
  warehouseId?: number;       // Return destination
  totalReturn: Decimal;      // Total refund amount
  reason?: string;           // Return reason
  status: TransactionStatus; // DRAFT, APPROVED, CANCELLED
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

enum TransactionStatus {
  DRAFT;      // Draft, belum diproses
  PENDING;    // Menunggu approval
  CONFIRMED;  // Dikonfirmasi
  SENT;       // Dikirim
  RECEIVED;   // Diterima
  COMPLETED;  // Selesai
  APPROVED;   // Disetujui
  CANCELLED;  // Dibatalkan
}
```

#### Return Flow
```typescript
async function createSaleReturn(data: CreateSaleReturnDto) {
  // 1. Validate original sale exists
  const originalSale = await prisma.sale.findUnique({
    where: { id: data.saleId }
  });
  
  // 2. Validate items are from original sale
  for (const item of data.items) {
    const originalItem = originalSale.items.find(
      i => i.productId === item.productId
    );
    
    if (!originalItem) {
      throw new Error(`Product ${item.productId} not in original sale`);
    }
    
    if (item.quantity > originalItem.quantity) {
      throw new Error(`Return quantity exceeds sold quantity`);
    }
  }
  
  // 3. Generate return code
  const code = await generateNumber('SALE_RETURN');
  
  // 4. Calculate total return
  const totalReturn = calculateReturnTotal(data.items);
  
  // 5. Create return
  const saleReturn = await prisma.saleReturn.create({
    data: {
      code,
      saleId: data.saleId,
      customerId: originalSale.customerId,
      warehouseId: data.warehouseId || getDefaultWarehouseId(),
      totalReturn,
      reason: data.reason,
      status: 'DRAFT',
      createdById: data.userId,
      returnItems: {
        create: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice
        }))
      }
    }
  });
  
  return saleReturn;
}
```

#### Return Stock Update
```typescript
async function processReturnApproval(returnId: number) {
  const saleReturn = await prisma.saleReturn.findUnique({
    where: { id: returnId },
    include: { returnItems: true }
  });
  
  // 1. Update return status
  await prisma.saleReturn.update({
    where: { id: returnId },
    data: { status: 'COMPLETED' }
  });
  
  // 2. Return stock to warehouse
  for (const item of saleReturn.returnItems) {
    // Add back to warehouse stock
    await prisma.productStock.update({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: saleReturn.warehouseId
        }
      },
      data: { quantity: { increment: item.quantity } }
    });
    
    // Add back to product aggregate stock
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } }
    });
  }
  
  // 3. Add customer receivable (refund)
  await updateCustomerReceivable(saleReturn.customerId, saleReturn.totalReturn);
  
  // 4. Create refund payment if needed
  // (can be cash refund or credit to customer account)
  
  return saleReturn;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sale-returns` | List semua returns |
| GET | `/sale-returns/:id` | Get return by ID |
| GET | `/sale-returns/sale/:saleId` | Get returns by sale |
| POST | `/sale-returns` | Create return |
| PATCH | `/sale-returns/:id` | Update return |
| POST | `/sale-returns/:id/approve` | Approve return |
| POST | `/sale-returns/:id/reject` | Reject return |
| DELETE | `/sale-returns/:id` | Cancel return |

---

## 3.5 SaleReturnItem Module (`/api/sale-return-items`)

### Purpose
Item-item dalam retur penjualan.

### Business Logic

#### SaleReturnItem Structure
```typescript
interface SaleReturnItem {
  id: number;
  saleReturnId: number;      // Foreign key ke SaleReturn
  productId: number;         // Foreign key ke Product
  quantity: Decimal;         // Return quantity
  unitPrice: Decimal;        // Original unit price
  subtotal: Decimal;         // Line total
  unitId?: number;           // Unit
  createdAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sale-return-items` | List semua return items |
| GET | `/sale-return-items/:id` | Get item by ID |
| GET | `/sale-return-items/return/:returnId` | Get items by return |
| POST | `/sale-return-items` | Create return item |
| PATCH | `/sale-return-items/:id` | Update return item |
| DELETE | `/sale-return-items/:id` | Delete return item |

---

## 3.6 SalePoint Module (`/api/sale-points`)

### Purpose
Titik penjualan/POS terminal. Untuk tracking transaksi per kasir/terminal.

### Business Logic

#### SalePoint Structure
```typescript
interface SalePoint {
  id: number;
  code: string;          // Terminal code
  name: string;           // Terminal name
  warehouseId?: number;   // Associated warehouse
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Use Cases
```
1. Multi-terminal POS
2. Report per kasir/terminal
3. Shift tracking
4. Cash drawer management
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sale-points` | List semua sale points |
| GET | `/sale-points/:id` | Get sale point by ID |
| GET | `/sale-points/:id/sales` | Get sales di point ini |
| POST | `/sale-points` | Create sale point |
| PATCH | `/sale-points/:id` | Update sale point |
| DELETE | `/sale-points/:id` | Delete sale point |

---

## 3.7 SaleOrder Module (`/api/sale-orders`)

### Purpose
Order/quotation penjualan sebelum jadi transaksi actual.

### Business Logic

#### SaleOrder vs Sale
```
SaleOrder (Quotation):
- Draft/Survey harga
- Belum mengurangi stock
- Bisa dikonversi ke Sale
- Expired date untuk validity

Sale (Actual Transaction):
- Resmi mengurangi stock
- Mencatat payment
- Update customer receivable
```

#### SaleOrder Structure
```typescript
interface SaleOrder {
  id: number;
  code: string;              // Order number
  date: Date;
  customerId: number;
  salesPersonId?: number;
  warehouseId?: number;
  subtotal: Decimal;
  discountPercent: Decimal;
  discountAmount: Decimal;
  taxPercent: Decimal;
  taxAmount: Decimal;
  total: Decimal;
  validUntil: Date;          // Quotation expiry
  status: TransactionStatus;
  notes?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Convert to Sale
```typescript
async function convertOrderToSale(orderId: number) {
  const order = await prisma.saleOrder.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
  
  // 1. Check validity
  if (new Date() > order.validUntil) {
    throw new Error('Quotation has expired');
  }
  
  // 2. Check stock availability
  for (const item of order.items) {
    const available = await getAvailableStock(
      item.productId, 
      order.warehouseId
    );
    if (available < item.quantity) {
      throw new Error(`Insufficient stock for product ${item.productId}`);
    }
  }
  
  // 3. Create sale from order
  const sale = await createSale({
    customerId: order.customerId,
    salesPersonId: order.salesPersonId,
    warehouseId: order.warehouseId,
    subtotal: order.subtotal,
    discountPercent: order.discountPercent,
    taxPercent: order.taxPercent,
    items: order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })),
    userId: order.createdById
  });
  
  // 4. Update order status
  await prisma.saleOrder.update({
    where: { id: orderId },
    data: { status: 'COMPLETED' }
  });
  
  return sale;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sale-orders` | List semua orders |
| GET | `/sale-orders/:id` | Get order by ID |
| POST | `/sale-orders` | Create order |
| PATCH | `/sale-orders/:id` | Update order |
| POST | `/sale-orders/:id/convert` | Convert to sale |
| DELETE | `/sale-orders/:id` | Cancel order |

---

# 4. TRANSAKSI PEMBELIAN

## 4.1 Purchase Module (`/api/purchases`)

### Purpose
Transaksi pembelian barang dari supplier.

### Business Logic

#### Purchase Structure
```typescript
interface Purchase {
  id: number;
  code: string;                  // Purchase invoice number
  date: Date;                    // Transaction date
  supplierId: number;            // Supplier foreign key
  warehouseId?: number;           // Destination warehouse
  subtotal: Decimal;             // Subtotal
  discountPercent: Decimal;       // Discount %
  discountAmount: Decimal;        // Discount amount
  taxPercent: Decimal;            // Tax %
  taxAmount: Decimal;             // Tax amount
  total: Decimal;                // Grand total
  paid: Decimal;                 // Amount paid
  remaining: Decimal;            // Remaining payment
  paymentStatus: PaymentStatus;   // Payment status
  paymentMethod?: PaymentMethod;  // Payment method
  dueDate?: Date;                // Payment due date
  isReturn: boolean;              // Is return transaction
  status: TransactionStatus;
  notes?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Purchase Creation Flow
```typescript
async function createPurchase(data: CreatePurchaseDto) {
  // 1. Validate supplier
  const supplier = await prisma.supplier.findUnique({
    where: { id: data.supplierId }
  });
  
  // 2. Calculate totals
  const subtotal = calculateSubtotal(data.items);
  const discountAmount = subtotal * (data.discountPercent / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (data.taxPercent / 100);
  const total = afterDiscount + taxAmount;
  
  // 3. Generate code
  const code = await generateNumber('PURCHASE');
  
  // 4. Create purchase
  const purchase = await prisma.purchase.create({
    data: {
      code,
      supplierId: data.supplierId,
      warehouseId: data.warehouseId || getDefaultWarehouseId(),
      subtotal,
      discountPercent: data.discountPercent,
      discountAmount,
      taxPercent: data.taxPercent,
      taxAmount,
      total,
      paid: 0,
      remaining: total,
      paymentStatus: 'PENDING',
      paymentMethod: data.paymentMethod,
      dueDate: data.dueDate,
      status: 'DRAFT',
      createdById: data.userId,
      items: {
        create: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitId: item.unitId,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent || 0,
          discountAmount: calculateItemDiscount(item),
          subtotal: calculateItemSubtotal(item)
        }))
      }
    },
    include: { items: true }
  });
  
  // 5. Update supplier debt
  await updateSupplierDebt(supplier.id, total);
  
  // 6. Log activity
  await createActivityLog({
    type: 'PURCHASE',
    title: `Pembelian ${code}`,
    referenceType: 'Purchase',
    referenceId: purchase.id,
    amount: total
  });
  
  return purchase;
}
```

#### Stock Addition
```typescript
async function processPurchaseApproval(purchaseId: number) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { items: true }
  });
  
  // 1. Update purchase status
  await prisma.purchase.update({
    where: { id: purchaseId },
    data: { status: 'COMPLETED' }
  });
  
  // 2. Add stock to warehouse
  for (const item of purchase.items) {
    // Add to warehouse stock
    await prisma.productStock.upsert({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: purchase.warehouseId
        }
      },
      create: {
        productId: item.productId,
        warehouseId: purchase.warehouseId,
        quantity: item.quantity
      },
      update: {
        quantity: { increment: item.quantity }
      }
    });
    
    // Update product aggregate stock
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } }
    });
    
    // Update product purchase price
    await prisma.product.update({
      where: { id: item.productId },
      data: { purchasePrice: item.unitPrice }
    });
  }
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/purchases` | List semua purchases |
| GET | `/purchases/:id` | Get purchase by ID |
| GET | `/purchases/code/:code` | Get by code |
| GET | `/purchases/supplier/:supplierId` | Get by supplier |
| GET | `/purchases/pending` | Get pending payments |
| POST | `/purchases` | Create purchase baru |
| PATCH | `/purchases/:id` | Update purchase |
| POST | `/purchases/:id/approve` | Approve purchase |
| DELETE | `/purchases/:id` | Cancel purchase |
| POST | `/purchases/:id/payment` | Add payment |

---

## 4.2 PurchaseItem Module (`/api/purchase-items`)

### Purpose
Item-item dalam transaksi pembelian.

### Business Logic

#### PurchaseItem Structure
```typescript
interface PurchaseItem {
  id: number;
  purchaseId: number;         // Foreign key ke Purchase
  productId: number;          // Foreign key ke Product
  quantity: Decimal;          // Quantity purchased
  unitId: number;             // Unit
  unitPrice: Decimal;         // Price per unit
  discountPercent: Decimal;  // Item discount %
  discountAmount: Decimal;    // Item discount amount
  subtotal: Decimal;         // Line total
  createdAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/purchase-items` | List semua purchase items |
| GET | `/purchase-items/:id` | Get item by ID |
| GET | `/purchase-items/purchase/:purchaseId` | Get items by purchase |
| POST | `/purchase-items` | Create purchase item |
| PATCH | `/purchase-items/:id` | Update purchase item |
| DELETE | `/purchase-items/:id` | Delete purchase item |

---

## 4.3 PurchasePayment Module (`/api/purchase-payments`)

### Purpose
Pembayaran untuk transaksi pembelian (hutang supplier).

### Business Logic

#### PurchasePayment Structure
```typescript
interface PurchasePayment {
  id: number;
  purchaseId: number;           // Foreign key ke Purchase
  method: PaymentMethod;         // Payment method
  amount: Decimal;               // Payment amount
  referenceNumber?: string;      // Bank transfer reference
  date: Date;                   // Payment date
  notes?: string;
  createdById: string;
  createdAt: Date;
}
```

#### Payment Flow
```typescript
async function addPurchasePayment(purchaseId: number, data: AddPaymentDto) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId }
  });
  
  // 1. Get existing payments
  const paidAmount = await getTotalPurchasePaid(purchaseId);
  
  // 2. Calculate new totals
  const newPaid = paidAmount + data.amount;
  const newRemaining = purchase.total - newPaid;
  
  // 3. Determine payment status
  let paymentStatus: PaymentStatus;
  if (newRemaining <= 0) {
    paymentStatus = 'PAID';
  } else if (newPaid > 0) {
    paymentStatus = 'PARTIAL';
  } else {
    paymentStatus = 'PENDING';
  }
  
  // 4. Create payment
  const payment = await prisma.purchasePayment.create({
    data: {
      purchaseId,
      method: data.method,
      amount: data.amount,
      referenceNumber: data.referenceNumber,
      date: data.date || new Date(),
      notes: data.notes,
      createdById: data.userId
    }
  });
  
  // 5. Update purchase
  await prisma.purchase.update({
    where: { id: purchaseId },
    data: {
      paid: newPaid,
      remaining: Math.max(0, newRemaining),
      paymentStatus
    }
  });
  
  // 6. Update supplier debt
  if (paymentStatus === 'PAID') {
    await updateSupplierDebt(purchase.supplierId, -purchase.total);
  } else {
    await updateSupplierDebt(purchase.supplierId, -data.amount);
  }
  
  return payment;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/purchase-payments` | List semua payments |
| GET | `/purchase-payments/:id` | Get payment by ID |
| GET | `/purchase-payments/purchase/:purchaseId` | Get payments by purchase |
| POST | `/purchase-payments` | Create payment |
| DELETE | `/purchase-payments/:id` | Delete/refund payment |

---

## 4.4 PurchaseReturn Module (`/api/purchase-returns`)

### Purpose
Retur/pengembalian barang ke supplier.

### Business Logic

#### PurchaseReturn Structure
```typescript
interface PurchaseReturn {
  id: number;
  code: string;              // Return code
  date: Date;
  purchaseId: number;        // Original purchase
  supplierId: number;       // Supplier
  warehouseId?: number;       // Return from warehouse
  totalReturn: Decimal;      // Total refund
  reason?: string;
  status: TransactionStatus;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Return Flow
```typescript
async function createPurchaseReturn(data: CreatePurchaseReturnDto) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: data.purchaseId }
  });
  
  // 1. Validate items
  for (const item of data.items) {
    const originalItem = purchase.items.find(
      i => i.productId === item.productId
    );
    
    if (!originalItem) {
      throw new Error(`Product ${item.productId} not in original purchase`);
    }
    
    // Check return quantity (considering existing returns)
    const existingReturns = await getExistingReturnQty(
      data.purchaseId, 
      item.productId
    );
    
    if (item.quantity > originalItem.quantity - existingReturns) {
      throw new Error(`Return quantity exceeds available`);
    }
  }
  
  // 2. Create return
  const code = await generateNumber('PURCHASE_RETURN');
  
  const purchaseReturn = await prisma.purchaseReturn.create({
    data: {
      code,
      purchaseId: data.purchaseId,
      supplierId: purchase.supplierId,
      warehouseId: data.warehouseId,
      totalReturn: calculateReturnTotal(data.items),
      reason: data.reason,
      status: 'DRAFT',
      createdById: data.userId,
      returnItems: {
        create: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitId: item.unitId,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice
        }))
      }
    }
  });
  
  return purchaseReturn;
}
```

#### Return Stock Deduction
```typescript
async function processReturnApproval(returnId: number) {
  const purchaseReturn = await prisma.purchaseReturn.findUnique({
    where: { id: returnId },
    include: { returnItems: true }
  });
  
  // 1. Update status
  await prisma.purchaseReturn.update({
    where: { id: returnId },
    data: { status: 'COMPLETED' }
  });
  
  // 2. Deduct stock from warehouse
  for (const item of purchaseReturn.returnItems) {
    await prisma.productStock.update({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: purchaseReturn.warehouseId
        }
      },
      data: { quantity: { decrement: item.quantity } }
    });
    
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } }
    });
  }
  
  // 3. Reduce supplier debt
  await updateSupplierDebt(
    purchaseReturn.supplierId, 
    -purchaseReturn.totalReturn
  );
  
  return purchaseReturn;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/purchase-returns` | List semua returns |
| GET | `/purchase-returns/:id` | Get return by ID |
| GET | `/purchase-returns/purchase/:purchaseId` | Get returns by purchase |
| POST | `/purchase-returns` | Create return |
| POST | `/purchase-returns/:id/approve` | Approve return |
| DELETE | `/purchase-returns/:id` | Cancel return |

---

## 4.5 PurchaseOrder Module (`/api/purchase-orders`)

### Purpose
Purchase order ke supplier sebelum barang datang.

### Business Logic

#### PurchaseOrder Structure
```typescript
interface PurchaseOrder {
  id: number;
  code: string;              // PO number
  date: Date;
  supplierId: number;
  warehouseId?: number;
  subtotal: Decimal;
  discountPercent: Decimal;
  discountAmount: Decimal;
  taxPercent: Decimal;
  taxAmount: Decimal;
  total: Decimal;
  downPayment: Decimal;       // DP yang sudah dibayar
  paymentStatus: PaymentStatus;
  dueDate?: Date;
  isInvoice: boolean;        // Apakah sudah invoice
  purchaseId?: number;       // Link ke Purchase jika sudah di-create
  status: TransactionStatus;
  notes?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Convert to Purchase
```typescript
async function convertOrderToPurchase(orderId: number) {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
  
  // 1. Create purchase
  const purchase = await createPurchase({
    supplierId: order.supplierId,
    warehouseId: order.warehouseId,
    subtotal: order.subtotal,
    discountPercent: order.discountPercent,
    taxPercent: order.taxPercent,
    dueDate: order.dueDate,
    items: order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitId: item.unitId,
      unitPrice: item.unitPrice
    })),
    userId: order.createdById
  });
  
  // 2. Link to order
  await prisma.purchaseOrder.update({
    where: { id: orderId },
    data: { 
      status: 'COMPLETED',
      purchaseId: purchase.id
    }
  });
  
  return purchase;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/purchase-orders` | List semua orders |
| GET | `/purchase-orders/:id` | Get order by ID |
| POST | `/purchase-orders` | Create order |
| PATCH | `/purchase-orders/:id` | Update order |
| POST | `/purchase-orders/:id/convert` | Convert to purchase |
| DELETE | `/purchase-orders/:id` | Cancel order |

---

# 5. MANAJEMEN INVENTORI

## 5.1 StockIn Module (`/api/stock-ins`)

### Purpose
Pencatatan barang masuk ke gudang dari berbagai sumber.

### Business Logic

#### StockIn Structure
```typescript
interface StockIn {
  id: number;
  code: string;              // Stock in number
  date: Date;                // Entry date
  warehouseId: number;       // Destination warehouse
  supplierId?: number;        // Source supplier (if from purchase)
  referenceType?: ReferenceType; // PURCHASE, RETURN, ADJUSTMENT, MANUAL
  referenceId?: number;       // Reference document ID
  totalItems: Decimal;        // Total quantity
  description?: string;
  status: TransactionStatus;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

enum ReferenceType {
  PURCHASE;    // From purchase
  RETURN;      // From customer return
  ADJUSTMENT;  // Stock adjustment
  MANUAL;      // Manual entry
}
```

#### StockIn Creation
```typescript
async function createStockIn(data: CreateStockInDto) {
  // 1. Validate warehouse exists
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: data.warehouseId }
  });
  
  // 2. Generate code
  const code = await generateNumber('STOCK_IN');
  
  // 3. Calculate total items
  const totalItems = data.items.reduce(
    (sum, item) => sum + item.quantity, 
    0
  );
  
  // 4. Create stock in
  const stockIn = await prisma.stockIn.create({
    data: {
      code,
      date: data.date || new Date(),
      warehouseId: data.warehouseId,
      supplierId: data.supplierId,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      totalItems,
      description: data.description,
      status: 'DRAFT',
      createdById: data.userId,
      items: {
        create: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitId: item.unitId,
          unitPrice: item.unitPrice || 0,
          subtotal: (item.quantity || 0) * (item.unitPrice || 0)
        }))
      }
    }
  });
  
  return stockIn;
}
```

#### Process StockIn
```typescript
async function processStockIn(stockInId: number) {
  const stockIn = await prisma.stockIn.findUnique({
    where: { id: stockInId },
    include: { items: true }
  });
  
  // 1. Update status
  await prisma.stockIn.update({
    where: { id: stockInId },
    data: { status: 'COMPLETED' }
  });
  
  // 2. Add stock to warehouse
  for (const item of stockIn.items) {
    await prisma.productStock.upsert({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: stockIn.warehouseId
        }
      },
      create: {
        productId: item.productId,
        warehouseId: stockIn.warehouseId,
        quantity: item.quantity
      },
      update: {
        quantity: { increment: item.quantity }
      }
    });
    
    // Update product aggregate
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } }
    });
  }
  
  // 3. If from purchase, update purchase reference
  if (stockIn.referenceType === 'PURCHASE' && stockIn.referenceId) {
    await prisma.purchase.update({
      where: { id: stockIn.referenceId },
      data: { status: 'RECEIVED' }
    });
  }
  
  // 4. Create journal entry if needed
  await createJournalEntry({
    type: 'STOCK_IN',
    referenceType: 'StockIn',
    referenceId: stockInId,
    warehouseId: stockIn.warehouseId,
    items: stockIn.items
  });
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stock-ins` | List semua stock ins |
| GET | `/stock-ins/:id` | Get stock in by ID |
| GET | `/stock-ins/warehouse/:warehouseId` | Get by warehouse |
| POST | `/stock-ins` | Create stock in |
| PATCH | `/stock-ins/:id` | Update stock in |
| POST | `/stock-ins/:id/approve` | Approve stock in |
| DELETE | `/stock-ins/:id` | Cancel stock in |

---

## 5.2 StockOut Module (`/api/stock-outs`)

### Purpose
Pencatatan barang keluar dari gudang.

### Business Logic

#### StockOut Structure
```typescript
interface StockOut {
  id: number;
  code: string;
  date: Date;
  warehouseId: number;
  referenceType?: ReferenceType; // SALE, DAMAGED, EXPIRED, ADJUSTMENT
  referenceId?: number;
  totalItems: Decimal;
  description?: string;
  status: TransactionStatus;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Process StockOut
```typescript
async function processStockOut(stockOutId: number) {
  const stockOut = await prisma.stockOut.findUnique({
    where: { id: stockOutId },
    include: { items: true }
  });
  
  // 1. Check stock availability
  for (const item of stockOut.items) {
    const available = await getAvailableStock(
      item.productId, 
      stockOut.warehouseId
    );
    
    if (available < item.quantity) {
      throw new Error(
        `Insufficient stock for product ${item.productId}. 
         Available: ${available}, Requested: ${item.quantity}`
      );
    }
  }
  
  // 2. Update status
  await prisma.stockOut.update({
    where: { id: stockOutId },
    data: { status: 'COMPLETED' }
  });
  
  // 3. Deduct stock
  for (const item of stockOut.items) {
    await prisma.productStock.update({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: stockOut.warehouseId
        }
      },
      data: { quantity: { decrement: item.quantity } }
    });
    
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } }
    });
  }
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stock-outs` | List semua stock outs |
| GET | `/stock-outs/:id` | Get stock out by ID |
| POST | `/stock-outs` | Create stock out |
| POST | `/stock-outs/:id/approve` | Approve stock out |
| DELETE | `/stock-outs/:id` | Cancel stock out |

---

## 5.3 StockTransfer Module (`/api/stock-transfers`)

### Purpose
Transfer stock antar gudang.

### Business Logic

#### StockTransfer Structure
```typescript
interface StockTransfer {
  id: number;
  code: string;
  date: Date;
  fromWarehouseId: number;
  toWarehouseId: number;
  totalItems: Decimal;
  status: TransactionStatus;
  notes?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Transfer Flow
```typescript
async function processStockTransfer(transferId: number) {
  const transfer = await prisma.stockTransfer.findUnique({
    where: { id: transferId },
    include: { items: true }
  });
  
  // 1. Check stock availability in source warehouse
  for (const item of transfer.items) {
    const available = await getAvailableStock(
      item.productId, 
      transfer.fromWarehouseId
    );
    
    if (available < item.quantity) {
      throw new Error(
        `Insufficient stock in source warehouse. 
         Product: ${item.productId}, Available: ${available}`
      );
    }
  }
  
  // 2. Update status
  await prisma.stockTransfer.update({
    where: { id: transferId },
    data: { status: 'COMPLETED' }
  });
  
  // 3. Deduct from source warehouse
  for (const item of transfer.items) {
    await prisma.productStock.update({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: transfer.fromWarehouseId
        }
      },
      data: { quantity: { decrement: item.quantity } }
    });
  }
  
  // 4. Add to destination warehouse
  for (const item of transfer.items) {
    await prisma.productStock.upsert({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: transfer.toWarehouseId
        }
      },
      create: {
        productId: item.productId,
        warehouseId: transfer.toWarehouseId,
        quantity: item.quantity
      },
      update: {
        quantity: { increment: item.quantity }
      }
    });
  }
  
  // 5. Update product aggregate (total stock unchanged)
  // Note: Product.stock is aggregate, not directly updated
}
```

### Business Rules
```
1. Source dan destination warehouse harus berbeda
2. Stock harus tersedia di source warehouse
3. Total stock produk tidak berubah
4. Transfer bisa dari draft -> completed
5. Tidak ada partial approval
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stock-transfers` | List semua transfers |
| GET | `/stock-transfers/:id` | Get transfer by ID |
| POST | `/stock-transfers` | Create transfer |
| POST | `/stock-transfers/:id/approve` | Approve transfer |
| DELETE | `/stock-transfers/:id` | Cancel transfer |

---

## 5.4 StockOpname Module (`/api/stock-opnames`)

### Purpose
Stock opname/penyusutan untuk mencocokkan stock fisik dengan sistem.

### Business Logic

#### StockOpname Structure
```typescript
interface StockOpname {
  id: number;
  code: string;
  date: Date;
  warehouseId: number;
  totalItems: Decimal;
  status: StockOpnameStatus;
  notes?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

enum StockOpnameStatus {
  PENDING;    // Sedang di-opname
  APPROVED;   // Disetujui manager
  COMPLETED;   // Selesai diproses
}
```

#### Stock Opname Flow
```typescript
async function createStockOpname(data: CreateStockOpnameDto) {
  // 1. Generate code
  const code = await generateNumber('STOCK_OPNAME');
  
  // 2. Get all products with stock in warehouse
  const productStocks = await prisma.productStock.findMany({
    where: { warehouseId: data.warehouseId },
    include: { product: true }
  });
  
  // 3. Create opname with items (system stock only, counting to be done later)
  const opname = await prisma.stockOpname.create({
    data: {
      code,
      date: data.date || new Date(),
      warehouseId: data.warehouseId,
      status: 'PENDING',
      notes: data.notes,
      createdById: data.userId,
      opnameItems: {
        create: productStocks.map(ps => ({
          productId: ps.productId,
          systemStock: ps.quantity,
          countedStock: 0,  // To be filled during counting
          difference: 0,
          unitId: ps.product.unitId,
          unitPrice: ps.product.sellingPrice
        }))
      }
    },
    include: { opnameItems: true }
  });
  
  return opname;
}
```

#### Process Opname Results
```typescript
async function submitOpnameResults(opnameId: number, countedItems: CountedItem[]) {
  const opname = await prisma.stockOpname.findUnique({
    where: { id: opnameId },
    include: { opnameItems: true }
  });
  
  // 1. Update counted quantities and calculate differences
  for (const counted of countedItems) {
    const item = opname.opnameItems.find(
      i => i.productId === counted.productId
    );
    
    if (item) {
      const difference = counted.countedStock - item.systemStock;
      
      await prisma.stockOpnameItem.update({
        where: { id: item.id },
        data: {
          countedStock: counted.countedStock,
          difference,
          note: counted.note
        }
      });
    }
  }
  
  // 2. Calculate total adjustment
  const totalAdjustment = opname.opnameItems.reduce(
    (sum, item) => sum + item.difference * item.unitPrice,
    0
  );
  
  await prisma.stockOpname.update({
    where: { id: opnameId },
    data: { 
      totalItems: totalAdjustment,
      status: 'APPROVED'
    }
  });
}
```

#### Approve and Apply Opname
```typescript
async function approveAndApplyOpname(opnameId: number, approverId: string) {
  const opname = await prisma.stockOpname.findUnique({
    where: { id: opnameId },
    include: { opnameItems: true }
  });
  
  // 1. Update status
  await prisma.stockOpname.update({
    where: { id: opnameId },
    data: { 
      status: 'COMPLETED',
      approvedById: approverId,
      approvedAt: new Date()
    }
  });
  
  // 2. Apply adjustments to warehouse stock
  for (const item of opname.opnameItems) {
    if (item.difference !== 0) {
      await prisma.productStock.update({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: opname.warehouseId
          }
        },
        data: { quantity: item.countedStock }
      });
      
      // Update product aggregate
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.difference } }
      });
    }
  }
  
  // 3. Create journal entry for adjustments
  await createStockAdjustmentJournal(opname);
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stock-opnames` | List semua opnames |
| GET | `/stock-opnames/:id` | Get opname by ID |
| POST | `/stock-opnames` | Create opname (auto-populate products) |
| PATCH | `/stock-opnames/:id/results` | Submit counted results |
| POST | `/stock-opnames/:id/approve` | Approve opname |
| POST | `/stock-opnames/:id/apply` | Apply adjustments |
| DELETE | `/stock-opnames/:id` | Cancel opname |

---

## 5.5 StockAlert Module (`/api/stock-alerts`)

### Purpose
Notifikasi untuk stock rendah atau habis.

### Business Logic

#### StockAlert Structure
```typescript
interface StockAlert {
  id: number;
  productId: number;
  alertType: string;          // LOW_STOCK, OUT_OF_STOCK, EXPIRED
  threshold: Decimal;
  currentStock: Decimal;
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

enum StockAlertType {
  LOW_STOCK;     // Stock di bawah minimum
  OUT_OF_STOCK;  // Stock = 0
  EXPIRED;       // Product expired (if tracking expiry)
}
```

#### Alert Creation
```typescript
async function checkStockAlert(productId: number, warehouseId: number) {
  const stock = await prisma.productStock.findUnique({
    where: {
      productId_warehouseId: { productId, warehouseId }
    },
    include: { product: true }
  });
  
  if (!stock) return;
  
  // Determine alert type
  let alertType: string;
  if (stock.quantity <= 0) {
    alertType = 'OUT_OF_STOCK';
  } else if (stock.quantity <= stock.minimumStock) {
    alertType = 'LOW_STOCK';
  } else {
    // Clear existing alerts if stock is back to normal
    await prisma.stockAlert.updateMany({
      where: { productId, warehouseId, isResolved: false },
      data: { isResolved: true, resolvedAt: new Date() }
    });
    return;
  }
  
  // Check if alert already exists
  const existingAlert = await prisma.stockAlert.findFirst({
    where: {
      productId,
      alertType,
      isResolved: false
    }
  });
  
  if (!existingAlert) {
    // Create new alert
    await prisma.stockAlert.create({
      data: {
        productId,
        warehouseId,
        alertType,
        threshold: stock.minimumStock,
        currentStock: stock.quantity
      }
    });
    
    // Send notification
    await createNotification({
      type: 'WARNING',
      title: `Stock Alert: ${stock.product.name}`,
      message: `${alertType} - Current: ${stock.quantity}, Min: ${stock.minimumStock}`
    });
  }
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stock-alerts` | List semua alerts |
| GET | `/stock-alerts/unread` | Get unread alerts |
| GET | `/stock-alerts/product/:productId` | Get alerts for product |
| PATCH | `/stock-alerts/:id/read` | Mark as read |
| PATCH | `/stock-alerts/:id/resolve` | Resolve alert |
| POST | `/stock-alerts/:id/reorder` | Create PO dari alert |

---

# 6. AKUNTANSI

## 6.1 Account Module (`/api/accounts`)

### Purpose
Chart of Accounts untuk akuntansi double-entry.

### Business Logic

#### Account Structure
```typescript
interface Account {
  id: number;
  code: string;          // Account code (e.g., 1-1000)
  name: string;          // Account name
  type: AccountType;     // Account type
  parentId?: number;     // Parent account for hierarchy
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum AccountType {
  ASSET;      // Aktiva
  LIABILITY;  // Kewajiban
  EQUITY;     // Modal
  REVENUE;    // Pendapatan
  EXPENSE;    // Beban
}
```

#### Default Chart of Accounts
```
ASSET (1-xxxx)
├── 1-1000 Kas
├── 1-1100 Bank
├── 1-1200 Piutang Dagang
├── 1-1300 Persediaan
├── 1-1400 Perlengkapan
├── 1-1500 Tanah
├── 1-1600 Bangunan
├── 1-1700 Kendaraan
└── 1-1800 Akumulasi Penyusutan

LIABILITY (2-xxxx)
├── 2-2000 Hutang Dagang
├── 2-2100 Hutang Bank
├── 2-2200 Hutang Gaji
├── 2-2300 Pajak Dibayar Dimuka
└── 2-2400 Pendapatan Diterima Dimuka

EQUITY (3-xxxx)
├── 3-3000 Modal Saham
├── 3-3100 Laba Ditahan
└── 3-3200 Prive

REVENUE (4-xxxx)
├── 4-4000 Penjualan
├── 4-4100 Retur Penjualan
├── 4-4200 Diskon Penjualan
└── 4-4300 Pendapatan Lain

EXPENSE (5-xxxx)
├── 5-5000 Harga Pokok Penjualan
├── 5-5100 Beban Gaji
├── 5-5200 Beban Sewa
├── 5-5300 Beban Listrik & Air
├── 5-5400 Beban Penyusutan
├── 5-5500 Beban Operasional
└── 5-5600 Beban Lain-lain
```

#### Account Balance Calculation
```typescript
async function getAccountBalance(accountId: number) {
  const entries = await prisma.journalEntry.findMany({
    where: { accountId },
    include: { journal: true }
  });
  
  const account = await prisma.account.findUnique({
    where: { id: accountId }
  });
  
  let debitTotal = 0;
  let creditTotal = 0;
  
  for (const entry of entries) {
    if (entry.journal.isPosted) {
      debitTotal += entry.debit;
      creditTotal += entry.credit;
    }
  }
  
  // Balance based on account type
  switch (account.type) {
    case 'ASSET':
    case 'EXPENSE':
      return { 
        debit: debitTotal - creditTotal,
        credit: 0 
      };
    case 'LIABILITY':
    case 'EQUITY':
    case 'REVENUE':
      return { 
        debit: 0,
        credit: creditTotal - debitTotal 
      };
  }
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accounts` | List semua accounts |
| GET | `/accounts/:id` | Get account by ID |
| GET | `/accounts/:id/balance` | Get account balance |
| GET | `/accounts/tree` | Get accounts as tree |
| POST | `/accounts` | Create account |
| PATCH | `/accounts/:id` | Update account |
| DELETE | `/accounts/:id` | Delete account |

---

## 6.2 Journal Module (`/api/journals`)

### Purpose
Jurnal umum untuk pencatatan transaksi akuntansi double-entry.

### Business Logic

#### Journal Structure
```typescript
interface Journal {
  id: number;
  code: string;              // Journal number
  date: Date;                // Transaction date
  description?: string;      // Journal description
  referenceType?: string;    // Source document type
  referenceId?: number;      // Source document ID
  isPosted: boolean;          // Posted to ledger
  postedAt?: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  
  entries: JournalEntry[];
}
```

#### Double-Entry Validation
```typescript
async function createJournal(data: CreateJournalDto) {
  // 1. Validate double-entry
  const totalDebit = data.entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = data.entries.reduce((sum, e) => sum + e.credit, 0);
  
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(
      `Journal entries not balanced. Debit: ${totalDebit}, Credit: ${totalCredit}`
    );
  }
  
  // 2. Validate all accounts exist and are active
  for (const entry of data.entries) {
    const account = await prisma.account.findUnique({
      where: { id: entry.accountId }
    });
    
    if (!account) {
      throw new Error(`Account ${entry.accountId} not found`);
    }
    
    if (!account.isActive) {
      throw new Error(`Account ${account.name} is not active`);
    }
  }
  
  // 3. Generate code
  const code = await generateNumber('JOURNAL');
  
  // 4. Create journal with entries
  const journal = await prisma.journal.create({
    data: {
      code,
      date: data.date || new Date(),
      description: data.description,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      isPosted: data.isPosted || false,
      postedAt: data.isPosted ? new Date() : null,
      createdById: data.userId,
      entries: {
        create: data.entries.map(e => ({
          accountId: e.accountId,
          debit: e.debit,
          credit: e.credit,
          memo: e.memo
        }))
      }
    },
    include: { entries: true }
  });
  
  return journal;
}
```

#### Auto-Journal from Sales
```typescript
async function createSalesJournal(sale: Sale) {
  const journalEntries = [];
  
  // 1. Kas/Piutang (Debit)
  if (sale.paymentStatus === 'PAID') {
    journalEntries.push({
      accountCode: '1-1000',  // Kas
      debit: sale.total,
      credit: 0
    });
  } else {
    journalEntries.push({
      accountCode: '1-1200',  // Piutang Dagang
      debit: sale.total,
      credit: 0
    });
  }
  
  // 2. Penjualan (Credit)
  journalEntries.push({
    accountCode: '4-4000',  // Penjualan
    debit: 0,
    credit: sale.subtotal
  });
  
  // 3. Pajak Keluaran (Credit)
  if (sale.taxAmount > 0) {
    journalEntries.push({
      accountCode: '2-2300',  // Pajak Keluaran
      debit: 0,
      credit: sale.taxAmount
    });
  }
  
  // 4. HPP (Debit)
  journalEntries.push({
    accountCode: '5-5000',  // HPP
    debit: calculateCOGS(sale.items),
    credit: 0
  });
  
  // 5. Persediaan (Credit)
  journalEntries.push({
    accountCode: '1-1300',  // Persediaan
    debit: 0,
    credit: calculateCOGS(sale.items)
  });
  
  return journalEntries;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/journals` | List semua journals |
| GET | `/journals/:id` | Get journal by ID |
| GET | `/journals/date/:start/:end` | Get by date range |
| POST | `/journals` | Create journal |
| POST | `/journals/:id/post` | Post journal |
| POST | `/journals/:id/unpost` | Unpost journal |
| DELETE | `/journals/:id` | Delete journal |

---

## 6.3 CashIn Module (`/api/cash-ins`)

### Purpose
Pencatatan kas masuk non-sales (bukan dari penjualan).

### Business Logic

#### CashIn Structure
```typescript
interface CashIn {
  id: number;
  code: string;
  date: Date;
  accountId: number;         // Cash/Bank account
  amount: Decimal;
  description?: string;
  referenceType?: string;    // e.g., 'CUSTOMER_DEPOSIT', 'SALE_PAYMENT'
  referenceId?: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Use Cases
```
1. Pelunasan piutang customer
2. Pendapatan non-sales
3. Penjualan aset
4. Pendapatan bunga
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cash-ins` | List semua cash ins |
| GET | `/cash-ins/:id` | Get cash in by ID |
| POST | `/cash-ins` | Create cash in |
| DELETE | `/cash-ins/:id` | Delete cash in |

---

## 6.4 CashOut Module (`/api/cash-outs`)

### Purpose
Pencatatan kas keluar non-purchase (bukan dari pembelian).

### Business Logic

#### CashOut Structure
```typescript
interface CashOut {
  id: number;
  code: string;
  date: Date;
  accountId: number;
  amount: Decimal;
  description?: string;
  referenceType?: string;    // e.g., 'SUPPLIER_PAYMENT', 'EXPENSE'
  referenceId?: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Use Cases
```
1. Pelunasan hutang supplier
2. Pembayaran biaya operasional
3. Pembelian aset
4. Biaya bunga
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cash-outs` | List semua cash outs |
| GET | `/cash-outs/:id` | Get cash out by ID |
| POST | `/cash-outs` | Create cash out |
| DELETE | `/cash-outs/:id` | Delete cash out |

---

## 6.5 CashTransfer Module (`/api/cash-transfers`)

### Purpose
Transfer antar rekening bank/kas.

### Business Logic

#### CashTransfer Structure
```typescript
interface CashTransfer {
  id: number;
  code: string;
  date: Date;
  fromAccountId: number;
  toAccountId: number;
  amount: Decimal;
  description?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Transfer Flow
```typescript
async function createCashTransfer(data: CreateCashTransferDto) {
  // 1. Validate accounts
  const fromAccount = await prisma.account.findUnique({
    where: { id: data.fromAccountId }
  });
  
  const toAccount = await prisma.account.findUnique({
    where: { id: data.toAccountId }
  });
  
  // 2. Create transfer
  const code = await generateNumber('CASH_TRANSFER');
  
  const transfer = await prisma.cashTransfer.create({
    data: {
      code,
      date: data.date || new Date(),
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: data.amount,
      description: data.description,
      createdById: data.userId
    }
  });
  
  // 3. Create journal entries
  await createJournal({
    description: `Transfer dari ${fromAccount.name} ke ${toAccount.name}`,
    referenceType: 'CASH_TRANSFER',
    referenceId: transfer.id,
    entries: [
      { accountId: data.toAccountId, debit: data.amount, credit: 0 },
      { accountId: data.fromAccountId, debit: 0, credit: data.amount }
    ],
    userId: data.userId
  });
  
  return transfer;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cash-transfers` | List semua transfers |
| GET | `/cash-transfers/:id` | Get transfer by ID |
| POST | `/cash-transfers` | Create transfer |
| DELETE | `/cash-transfers/:id` | Delete transfer |

---

## 6.6 CustomerDeposit Module (`/api/customer-deposits`)

### Purpose
Deposito/DP dari customer yang bisa digunakan untuk pembayaran.

### Business Logic

#### CustomerDeposit Structure
```typescript
interface CustomerDeposit {
  id: number;
  code: string;
  date: Date;
  customerId: number;
  amount: Decimal;
  remainingAmount: Decimal;
  description?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Deposit Usage
```typescript
async function useDepositForSale(customerId: number, saleId: number, amount: Decimal) {
  // 1. Get customer deposits
  const deposits = await prisma.customerDeposit.findMany({
    where: { 
      customerId,
      remainingAmount: { gt: 0 }
    },
    orderBy: { date: 'asc' }  // FIFO
  });
  
  let remainingToUse = amount;
  const usedDeposits = [];
  
  for (const deposit of deposits) {
    if (remainingToUse <= 0) break;
    
    const used = Math.min(deposit.remainingAmount, remainingToUse);
    
    await prisma.customerDeposit.update({
      where: { id: deposit.id },
      data: { remainingAmount: { decrement: used } }
    });
    
    remainingToUse -= used;
    usedDeposits.push({ depositId: deposit.id, used });
  }
  
  return usedDeposits;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customer-deposits` | List semua deposits |
| GET | `/customer-deposits/:id` | Get deposit by ID |
| GET | `/customer-deposits/customer/:customerId` | Get by customer |
| POST | `/customer-deposits` | Create deposit |
| DELETE | `/customer-deposits/:id` | Delete/refund deposit |

---

## 6.7 SupplierDeposit Module (`/api/supplier-deposits`)

### Purpose
Deposito/DP ke supplier.

### Business Logic

#### SupplierDeposit Structure
```typescript
interface SupplierDeposit {
  id: number;
  code: string;
  date: Date;
  supplierId: number;
  amount: Decimal;
  remainingAmount: Decimal;
  description?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Deposit Usage
```typescript
// Supplier deposits reduce purchase balance
// When paying purchases, deposits are used first (FIFO)
async function useSupplierDeposit(supplierId: number, purchaseId: number, amount: Decimal) {
  const deposits = await prisma.supplierDeposit.findMany({
    where: { 
      supplierId,
      remainingAmount: { gt: 0 }
    },
    orderBy: { date: 'asc' }
  });
  
  let remainingToUse = amount;
  
  for (const deposit of deposits) {
    if (remainingToUse <= 0) break;
    
    const used = Math.min(deposit.remainingAmount, remainingToUse);
    
    await prisma.supplierDeposit.update({
      where: { id: deposit.id },
      data: { remainingAmount: { decrement: used } }
    });
    
    remainingToUse -= used;
  }
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/supplier-deposits` | List semua deposits |
| GET | `/supplier-deposits/:id` | Get deposit by ID |
| GET | `/supplier-deposits/supplier/:supplierId` | Get by supplier |
| POST | `/supplier-deposits` | Create deposit |
| DELETE | `/supplier-deposits/:id` | Delete/refund deposit |

---

# 7. HRM - SDM

## 7.1 Department Module (`/api/departments`)

### Purpose
Departemen dalam perusahaan.

### Business Logic

#### Department Structure
```typescript
interface Department {
  id: number;
  code: string;        // Unique department code
  name: string;        // Department name
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Example Departments
```
1. DPT-001 - Keuangan
2. DPT-002 - Penjualan
3. DPT-003 - Operasional
4. DPT-004 - SDM
5. DPT-005 - IT
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/departments` | List semua departments |
| GET | `/departments/:id` | Get department by ID |
| GET | `/departments/:id/employees` | Get employees in department |
| POST | `/departments` | Create department |
| PATCH | `/departments/:id` | Update department |
| DELETE | `/departments/:id` | Delete department |

---

## 7.2 Position Module (`/api/positions`)

### Purpose
Jabatan dalam perusahaan.

### Business Logic

#### Position Structure
```typescript
interface Position {
  id: number;
  code: string;        // Unique position code
  name: string;        // Position name
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Example Positions
```
1. POS-001 - Direktur
2. POS-002 - Manager
3. POS-003 - Supervisor
4. POS-004 - Staff
5. POS-005 - Kasir
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/positions` | List semua positions |
| GET | `/positions/:id` | Get position by ID |
| GET | `/positions/:id/employees` | Get employees in position |
| POST | `/positions` | Create position |
| PATCH | `/positions/:id` | Update position |
| DELETE | `/positions/:id` | Delete position |

---

## 7.3 Employee Module (`/api/employees`)

### Purpose
Data karyawan lengkap termasuk informasi pribadi dan status kepegawaian.

### Business Logic

#### Employee Structure
```typescript
interface Employee {
  id: number;
  code: string;              // Employee ID number
  name: string;              // Full name
  departmentId?: number;
  positionId?: number;
  joinDate?: Date;
  endDate?: Date;
  birthDate?: Date;
  gender?: string;           // Male, Female
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  basicSalary: Decimal;
  status: EmployeeStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum EmployeeStatus {
  ACTIVE;     // Aktif bekerja
  INACTIVE;   // Tidak aktif
  RESIGNED;   // Mengundurkan diri
  TERMINATED; // Diberhentikan
}
```

#### Employee Lifecycle
```
1. JOIN
   - Create employee record
   - Set joinDate
   - Set status = ACTIVE
   
2. ACTIVE
   - Track attendance
   - Process payroll
   - Manage leave
   
3. STATUS CHANGE
   - Resigned: endDate + status
   - Terminated: endDate + status
   - Inactive: temporary pause
   
4. TERMINATION
   - Calculate remaining salary
   - Calculate remaining leave
   - Calculate loan balance
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees` | List semua employees |
| GET | `/employees/:id` | Get employee by ID |
| GET | `/employees/code/:code` | Get by employee code |
| GET | `/employees/active` | Get active employees |
| GET | `/employees/:id/stats` | Get employee statistics |
| POST | `/employees` | Create employee |
| PATCH | `/employees/:id` | Update employee |
| PATCH | `/employees/:id/resign` | Mark as resigned |
| PATCH | `/employees/:id/terminate` | Mark as terminated |
| DELETE | `/employees/:id` | Soft delete employee |

---

## 7.4 Attendance Module (`/api/attendances`)

### Purpose
Pencatatan absensi karyawan harian.

### Business Logic

#### Attendance Structure
```typescript
interface Attendance {
  id: number;
  employeeId: number;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum AttendanceStatus {
  PRESENT;  // Hadir
  LATE;     // Terlambat
  ABSENT;   // Tidak hadir
  SICK;     // Sakit
  LEAVE;    // Cuti/Izin
}
```

#### Attendance Recording
```typescript
async function recordAttendance(data: RecordAttendanceDto) {
  // 1. Check if already recorded
  const existing = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId: data.employeeId,
        date: data.date
      }
    }
  });
  
  if (existing) {
    throw new Error('Attendance already recorded for this date');
  }
  
  // 2. Determine status
  const workStartHour = 9;  // 9 AM
  const checkInTime = new Date(data.checkIn);
  let status: AttendanceStatus = 'PRESENT';
  
  if (checkInTime.getHours() > workStartHour) {
    status = 'LATE';
  }
  
  // 3. Create attendance
  const attendance = await prisma.attendance.create({
    data: {
      employeeId: data.employeeId,
      date: data.date,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      status: data.status || status,
      notes: data.notes
    }
  });
  
  return attendance;
}
```

#### Monthly Attendance Summary
```typescript
async function getMonthlyAttendance(employeeId: number, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const attendances = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });
  
  const summary = {
    totalDays: daysInMonth(month, year),
    present: attendances.filter(a => a.status === 'PRESENT').length,
    late: attendances.filter(a => a.status === 'LATE').length,
    absent: attendances.filter(a => a.status === 'ABSENT').length,
    sick: attendances.filter(a => a.status === 'SICK').length,
    leave: attendances.filter(a => a.status === 'LEAVE').length,
    workDays: attendances.filter(
      a => ['PRESENT', 'LATE'].includes(a.status)
    ).length
  };
  
  return summary;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/attendances` | List attendances |
| GET | `/attendances/:id` | Get attendance by ID |
| GET | `/attendances/employee/:employeeId` | Get by employee |
| GET | `/attendances/date/:date` | Get by date |
| GET | `/attendances/month/:year/:month` | Get monthly summary |
| POST | `/attendances` | Record attendance |
| PATCH | `/attendances/:id` | Update attendance |
| POST | `/attendances/bulk` | Bulk record attendance |

---

## 7.5 Payroll Module (`/api/payrolls`)

### Purpose
Pengajian karyawan bulanan.

### Business Logic

#### Payroll Structure
```typescript
interface Payroll {
  id: number;
  code: string;            // Payroll code (e.g., PAY-2024-01-001)
  employeeId: number;
  period: string;          // Period (e.g., "2024-01")
  basicSalary: Decimal;
  allowances: Decimal;      // Tunjangan
  deductions: Decimal;      // Potongan
  overtimePay: Decimal;     // Lembur
  totalSalary: Decimal;
  paymentDate?: Date;
  notes?: string;
  isPaid: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Payroll Calculation
```typescript
async function calculatePayroll(employeeId: number, period: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId }
  });
  
  // Parse period
  const [year, month] = period.split('-').map(Number);
  
  // 1. Get attendance for period
  const attendance = await getMonthlyAttendance(employeeId, year, month);
  
  // 2. Calculate work days
  const workDays = attendance.workDays;
  const absentDays = attendance.absent;
  
  // 3. Calculate prorated basic salary
  const dailyRate = employee.basicSalary / attendance.totalDays;
  const proratedSalary = dailyRate * workDays;
  
  // 4. Calculate deductions
  const absentDeduction = dailyRate * absentDays;
  
  // 5. Calculate allowances
  const allowances = await calculateAllowances(employee, period);
  
  // 6. Calculate overtime
  const overtime = await calculateOvertime(employee, period);
  
  // 7. Calculate loan installments
  const loanDeduction = await getLoanInstallment(employeeId, period);
  
  // 8. Calculate leave deductions
  const unpaidLeave = attendance.leave * dailyRate;
  
  // 9. Total calculation
  const totalSalary = 
    proratedSalary 
    + allowances.total 
    + overtime 
    - absentDeduction 
    - loanDeduction 
    - unpaidLeave;
  
  return {
    employeeId,
    period,
    basicSalary: employee.basicSalary,
    workDays,
    proratedSalary,
    allowances: allowances.total,
    overtimePay: overtime,
    deductions: absentDeduction + loanDeduction + unpaidLeave,
    totalSalary: Math.max(0, totalSalary)
  };
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payrolls` | List payrolls |
| GET | `/payrolls/:id` | Get payroll by ID |
| GET | `/payrolls/employee/:employeeId` | Get by employee |
| GET | `/payrolls/period/:period` | Get by period |
| POST | `/payrolls` | Create payroll |
| POST | `/payrolls/calculate` | Calculate payroll |
| POST | `/payrolls/:id/pay` | Mark as paid |
| PATCH | `/payrolls/:id` | Update payroll |

---

## 7.6 Loan Module (`/api/loans`)

### Purpose
Pinjaman karyawan dengan sistem angsuran.

### Business Logic

#### Loan Structure
```typescript
interface Loan {
  id: number;
  code: string;                    // Loan code
  employeeId: number;
  loanType: string;                // PERSONAL, EMERGENCY, HOUSING, VEHICLE
  principalAmount: Decimal;        // Jumlah pinjam
  interestRate: Decimal;           // Suku bunga %
  tenorMonths: number;             // Tenor dalam bulan
  installmentAmount: Decimal;     // Angsuran per bulan
  totalAmount: Decimal;            // Total (principal + interest)
  remainingAmount: Decimal;
  startDate?: Date;
  status: LoanStatus;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum LoanStatus {
  PENDING;    // Menunggu persetujuan
  APPROVED;   // Disetujui
  ACTIVE;     // Dalam pengembalian
  COMPLETED;  // Lunas
  REJECTED;   // Ditolak
  CANCELLED;  // Dibatalkan
}
```

#### Loan Calculation
```typescript
async function createLoan(data: CreateLoanDto) {
  const employee = await prisma.employee.findUnique({
    where: { id: data.employeeId }
  });
  
  // 1. Calculate total with interest
  const interestAmount = data.principalAmount * (data.interestRate / 100);
  const totalAmount = data.principalAmount + interestAmount;
  
  // 2. Calculate installment
  const installmentAmount = totalAmount / data.tenorMonths;
  
  // 3. Generate loan code
  const code = await generateNumber('LOAN');
  
  // 4. Create loan
  const loan = await prisma.loan.create({
    data: {
      code,
      employeeId: data.employeeId,
      loanType: data.loanType,
      principalAmount: data.principalAmount,
      interestRate: data.interestRate,
      tenorMonths: data.tenorMonths,
      installmentAmount,
      totalAmount,
      remainingAmount: totalAmount,
      status: 'PENDING',
      notes: data.notes
    }
  });
  
  return loan;
}
```

#### Generate Installments
```typescript
async function generateInstallments(loanId: number) {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId }
  });
  
  // Delete existing installments
  await prisma.loanInstallment.deleteMany({
    where: { loanId }
  });
  
  // Generate new installments
  const installments = [];
  const startDate = new Date();
  
  for (let i = 1; i <= loan.tenorMonths; i++) {
    const periodDate = addMonths(startDate, i);
    const period = `${periodDate.getFullYear()}-${String(periodDate.getMonth() + 1).padStart(2, '0')}`;
    
    const principal = loan.principalAmount / loan.tenorMonths;
    const interest = (loan.principalAmount * loan.interestRate / 100) / loan.tenorMonths;
    
    installments.push({
      loanId,
      period,
      amount: loan.installmentAmount,
      principal,
      interest,
      remainingBefore: loan.totalAmount - (principal * (i - 1)),
      remainingAfter: loan.totalAmount - (principal * i),
      status: 'UNPAID'
    });
  }
  
  await prisma.loanInstallment.createMany({
    data: installments
  });
  
  // Update loan status
  await prisma.loan.update({
    where: { id: loanId },
    data: { status: 'ACTIVE', startDate }
  });
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/loans` | List semua loans |
| GET | `/loans/:id` | Get loan by ID |
| GET | `/loans/employee/:employeeId` | Get by employee |
| GET | `/loans/active` | Get active loans |
| POST | `/loans` | Create loan |
| POST | `/loans/:id/approve` | Approve loan |
| POST | `/loans/:id/reject` | Reject loan |
| GET | `/loans/:id/installments` | Get installments |
| DELETE | `/loans/:id` | Cancel loan |

---

## 7.7 LoanInstallment Module (`/api/loan-installments`)

### Purpose
Angsuran pinjaman karyawan.

### Business Logic

#### LoanInstallment Structure
```typescript
interface LoanInstallment {
  id: number;
  loanId: number;
  period: string;              // Period (e.g., "2024-01")
  amount: Decimal;
  principal: Decimal;
  interest: Decimal;
  remainingBefore: Decimal;
  remainingAfter: Decimal;
  paymentDate?: Date;
  status: string;              // PAID, UNPAID
  isActive: boolean;
  createdAt: Date;
}
```

#### Pay Installment
```typescript
async function payInstallment(installmentId: number, paymentDate: Date) {
  const installment = await prisma.loanInstallment.findUnique({
    where: { id: installmentId }
  });
  
  // 1. Update installment
  await prisma.loanInstallment.update({
    where: { id: installmentId },
    data: {
      paymentDate,
      status: 'PAID'
    }
  });
  
  // 2. Update loan remaining
  const loan = await prisma.loan.findUnique({
    where: { id: installment.loanId }
  });
  
  await prisma.loan.update({
    where: { id: installment.loanId },
    data: {
      remainingAmount: loan.remainingAmount - installment.amount
    }
  });
  
  // 3. Check if loan is completed
  const remainingInstallments = await prisma.loanInstallment.count({
    where: {
      loanId: installment.loanId,
      status: 'UNPAID'
    }
  });
  
  if (remainingInstallments === 0) {
    await prisma.loan.update({
      where: { id: installment.loanId },
      data: { status: 'COMPLETED' }
    });
  }
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/loan-installments` | List installments |
| GET | `/loan-installments/:id` | Get installment by ID |
| GET | `/loan-installments/loan/:loanId` | Get by loan |
| POST | `/loan-installments/:id/pay` | Pay installment |

---

## 7.8 Leave Module (`/api/leaves`)

### Purpose
Pengajuan cuti dan izin karyawan.

### Business Logic

#### Leave Structure
```typescript
interface Leave {
  id: number;
  code: string;              // Leave code
  employeeId: number;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string;
  status: LeaveStatus;
  approvedById?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum LeaveType {
  ANNUAL;     // Cuti tahunan
  SICK;       // Sakit
  MATERNITY;  // Melahirkan
  PATERNITY;  // Cuti ayah
  UNPAID;     // Tanpa gaji
  EMERGENCY;  // Mendesak
  OTHER;      // Lainnya
}

enum LeaveStatus {
  PENDING;    // Menunggu persetujuan
  APPROVED;   // Disetujui
  REJECTED;   // Ditolak
  CANCELLED;  // Dibatalkan
}
```

#### Leave Request Flow
```typescript
async function createLeaveRequest(data: CreateLeaveDto) {
  const employee = await prisma.employee.findUnique({
    where: { id: data.employeeId }
  });
  
  // 1. Calculate working days
  const totalDays = calculateWorkingDays(data.startDate, data.endDate);
  
  // 2. Check leave balance
  if (data.type !== 'UNPAID' && data.type !== 'EMERGENCY') {
    const balance = await getLeaveBalance(data.employeeId, data.type);
    
    if (balance.remainingDays < totalDays) {
      throw new Error(
        `Insufficient leave balance. Available: ${balance.remainingDays}, Requested: ${totalDays}`
      );
    }
  }
  
  // 3. Check overlapping leave
  const overlapping = await prisma.leave.findFirst({
    where: {
      employeeId: data.employeeId,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [
        {
          startDate: { lte: data.endDate },
          endDate: { gte: data.startDate }
        }
      ]
    }
  });
  
  if (overlapping) {
    throw new Error('Leave request overlaps with existing leave');
  }
  
  // 4. Create leave request
  const code = await generateNumber('LEAVE');
  
  const leave = await prisma.leave.create({
    data: {
      code,
      employeeId: data.employeeId,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays,
      reason: data.reason,
      status: 'PENDING',
      notes: data.notes
    }
  });
  
  return leave;
}
```

#### Leave Approval
```typescript
async function approveLeave(leaveId: number, approverId: string) {
  const leave = await prisma.leave.findUnique({
    where: { id: leaveId }
  });
  
  // 1. Update leave status
  await prisma.leave.update({
    where: { id: leaveId },
    data: {
      status: 'APPROVED',
      approvedById: approverId,
      approvedAt: new Date()
    }
  });
  
  // 2. Deduct leave balance
  if (leave.type !== 'UNPAID' && leave.type !== 'EMERGENCY') {
    await prisma.leaveBalance.updateMany({
      where: {
        employeeId: leave.employeeId,
        leaveType: leave.type,
        year: new Date().getFullYear()
      },
      data: {
        usedDays: { increment: leave.totalDays },
        remainingDays: { decrement: leave.totalDays }
      }
    });
  }
  
  // 3. Update attendance records
  await createAttendanceFromLeave(leave);
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leaves` | List semua leaves |
| GET | `/leaves/:id` | Get leave by ID |
| GET | `/leaves/employee/:employeeId` | Get by employee |
| GET | `/leaves/pending` | Get pending approvals |
| POST | `/leaves` | Create leave request |
| POST | `/leaves/:id/approve` | Approve leave |
| POST | `/leaves/:id/reject` | Reject leave |
| DELETE | `/leaves/:id` | Cancel leave |

---

## 7.9 LeaveBalance Module (`/api/leave-balances`)

### Purpose
Tracking sisa cuti karyawan per tahun.

### Business Logic

#### LeaveBalance Structure
```typescript
interface LeaveBalance {
  id: number;
  employeeId: number;
  year: number;
  leaveType: LeaveType;
  totalDays: number;          // Total hak cuti
  usedDays: number;           // Sudah digunakan
  remainingDays: number;     // Sisa cuti
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Initialize Annual Balance
```typescript
async function initializeAnnualBalance(employeeId: number, year: number) {
  const defaultEntitlements = {
    ANNUAL: 12,   // Cuti tahunan 12 hari
    SICK: 14,     // Sakit 14 hari
    MATERNITY: 90, // Melahirkan 90 hari
    PATERNITY: 3,  // Cuti ayah 3 hari
    UNPAID: 0,
    EMERGENCY: 3,
    OTHER: 0
  };
  
  for (const [leaveType, totalDays] of Object.entries(defaultEntitlements)) {
    await prisma.leaveBalance.upsert({
      where: {
        employeeId_year_leaveType: {
          employeeId,
          year,
          leaveType
        }
      },
      create: {
        employeeId,
        year,
        leaveType,
        totalDays,
        usedDays: 0,
        remainingDays: totalDays
      },
      update: {}  // Already exists, no update
    });
  }
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leave-balances` | List balances |
| GET | `/leave-balances/:id` | Get balance by ID |
| GET | `/leave-balances/employee/:employeeId` | Get by employee |
| GET | `/leave-balances/year/:year` | Get by year |
| POST | `/leave-balances/initialize` | Initialize annual balance |
| PATCH | `/leave-balances/:id` | Update balance |

---

# 8. PRODUKSI

## 8.1 Production Module (`/api/productions`)

### Purpose
Manajemen produksi barang dari bahan baku.

### Business Logic

#### Production Structure
```typescript
interface Production {
  id: number;
  code: string;              // Production code
  date: Date;
  productId?: number;        // Finished product
  productName?: string;      // If product not in master
  quantity: Decimal;         // Quantity produced
  warehouseId?: number;
  rawMaterialCost: Decimal;
  laborCost: Decimal;
  overheadCost: Decimal;
  totalCost: Decimal;
  status: ProductionStatus;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum ProductionStatus {
  PLANNING;    // Perencanaan
  IN_PROGRESS; // Sedang produksi
  COMPLETED;   // Selesai
  CANCELLED;   // Dibatalkan
}
```

#### Production Flow
```typescript
async function createProduction(data: CreateProductionDto) {
  // 1. Calculate costs
  const rawMaterialCost = await calculateRawMaterialCost(data.items);
  const totalCost = rawMaterialCost + data.laborCost + data.overheadCost;
  const costPerUnit = totalCost / data.quantity;
  
  // 2. Generate code
  const code = await generateNumber('PRODUCTION');
  
  // 3. Create production
  const production = await prisma.production.create({
    data: {
      code,
      date: data.date,
      productId: data.productId,
      productName: data.productName,
      quantity: data.quantity,
      warehouseId: data.warehouseId,
      rawMaterialCost,
      laborCost: data.laborCost,
      overheadCost: data.overheadCost,
      totalCost,
      status: 'PLANNING',
      notes: data.notes,
      items: {
        create: data.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitId: item.unitId,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice
        }))
      }
    }
  });
  
  return production;
}
```

#### Complete Production
```typescript
async function completeProduction(productionId: number) {
  const production = await prisma.production.findUnique({
    where: { id: productionId },
    include: { items: true }
  });
  
  // 1. Update production status
  await prisma.production.update({
    where: { id: productionId },
    data: { status: 'COMPLETED' }
  });
  
  // 2. Deduct raw materials from stock
  for (const item of production.items) {
    await prisma.productStock.update({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: production.warehouseId
        }
      },
      data: { quantity: { decrement: item.quantity } }
    });
    
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } }
    });
  }
  
  // 3. Add finished goods to stock
  if (production.productId) {
    await prisma.productStock.upsert({
      where: {
        productId_warehouseId: {
          productId: production.productId,
          warehouseId: production.warehouseId
        }
      },
      create: {
        productId: production.productId,
        warehouseId: production.warehouseId,
        quantity: production.quantity
      },
      update: {
        quantity: { increment: production.quantity }
      }
    });
    
    await prisma.product.update({
      where: { id: production.productId },
      data: { stock: { increment: production.quantity } }
    });
  }
  
  // 4. Update product cost if finished goods
  if (production.productId) {
    const costPerUnit = production.totalCost / production.quantity;
    await prisma.product.update({
      where: { id: production.productId },
      data: { 
        purchasePrice: costPerUnit,
        sellingPrice: costPerUnit * 1.3  // 30% margin
      }
    });
  }
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/productions` | List semua productions |
| GET | `/productions/:id` | Get production by ID |
| GET | `/productions/active` | Get in-progress productions |
| POST | `/productions` | Create production |
| POST | `/productions/:id/start` | Start production |
| POST | `/productions/:id/complete` | Complete production |
| DELETE | `/productions/:id` | Cancel production |

---

## 8.2 ProductionItem Module (`/api/production-items`)

### Purpose
Bill of Materials (BOM) untuk produksi.

### Business Logic

#### ProductionItem Structure
```typescript
interface ProductionItem {
  id: number;
  productionId: number;
  productId?: number;        // Material product
  productName: string;        // Material name
  quantity: Decimal;          // Required quantity
  unitId?: number;
  unitPrice: Decimal;
  subtotal: Decimal;
  createdAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/production-items` | List items |
| GET | `/production-items/:id` | Get item by ID |
| GET | `/production-items/production/:productionId` | Get by production |
| POST | `/production-items` | Add item |
| PATCH | `/production-items/:id` | Update item |
| DELETE | `/production-items/:id` | Remove item |

---

# 9. ASET & SERVIS

## 9.1 AssetCategory Module (`/api/asset-categories`)

### Purpose
Kategori aset perusahaan.

### Business Logic

#### AssetCategory Structure
```typescript
interface AssetCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Example Categories
```
1. Kendaraan
2. Elektronik
3. Furniture
4. Mesin
5. Bangunan
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/asset-categories` | List categories |
| GET | `/asset-categories/:id` | Get category |
| POST | `/asset-categories` | Create category |
| PATCH | `/asset-categories/:id` | Update category |
| DELETE | `/asset-categories/:id` | Delete category |

---

## 9.2 Asset Module (`/api/assets`)

### Purpose
Manajemen aset tetap perusahaan.

### Business Logic

#### Asset Structure
```typescript
interface Asset {
  id: number;
  code: string;                      // Asset code
  name: string;                      // Asset name
  assetCategoryId?: number;
  purchaseDate?: Date;
  purchasePrice: Decimal;
  currentValue: Decimal;
  depreciationMethod?: DepreciationMethod;
  usefulLifeYears: number;
  location?: string;
  assignedTo?: string;
  serialNumber?: string;
  description?: string;
  status: AssetStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum AssetStatus {
  ACTIVE;       // Dalam penggunaan
  MAINTENANCE;  // Dalam perbaikan
  DISPOSED;     // Tidak terpakai/dijual
}

enum DepreciationMethod {
  STRAIGHT_LINE;        // Garis lurus
  DECLINING_BALANCE;    // Saldo menurun
  UNITS_OF_PRODUCTION;  // Unit produksi
}
```

#### Depreciation Calculation
```typescript
// Straight Line Method
async function calculateStraightLineDepreciation(asset: Asset) {
  const annualDepreciation = 
    (asset.purchasePrice - asset.currentValue) / asset.usefulLifeYears;
  
  const monthlyDepreciation = annualDepreciation / 12;
  
  return {
    annualDepreciation,
    monthlyDepreciation,
    accumulatedDepreciation: asset.purchasePrice - asset.currentValue,
    remainingLife: asset.usefulLifeYears - getYearsSincePurchase(asset.purchaseDate)
  };
}

// Declining Balance Method
async function calculateDecliningBalanceDepreciation(asset: Asset, year: number) {
  const rate = 2 / asset.usefulLifeYears;  // Double declining
  const beginningValue = await getAssetValueAtYear(asset.id, year);
  const depreciation = beginningValue * rate;
  const endingValue = beginningValue - depreciation;
  
  return {
    beginningValue,
    depreciation,
    endingValue,
    rate
  };
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assets` | List assets |
| GET | `/assets/:id` | Get asset by ID |
| GET | `/assets/depreciation` | Get depreciation schedule |
| POST | `/assets` | Create asset |
| PATCH | `/assets/:id` | Update asset |
| POST | `/assets/:id/depreciate` | Calculate depreciation |
| POST | `/assets/:id/dispose` | Dispose asset |
| DELETE | `/assets/:id` | Delete asset |

---

## 9.3 Service Module (`/api/services`)

### Purpose
Manajemen servis/perbaikan produk.

### Business Logic

#### Service Structure
```typescript
interface Service {
  id: number;
  code: string;              // Service code
  date: Date;
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  productName?: string;
  serialNumber?: string;
  problem?: string;
  diagnosis?: string;
  repairStatus: RepairStatus;
  technician?: string;
  warrantyUntil?: Date;
  subtotal: Decimal;
  laborCost: Decimal;
  totalAmount: Decimal;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum RepairStatus {
  PENDING;      // Menunggu
  IN_PROGRESS;  // Sedang diperbaiki
  COMPLETED;    // Selesai
  CANCELLED;    // Dibatalkan
}
```

#### Service Flow
```
1. PENDING
   - Customer datang dengan masalah
   - Staff mencatat keluhan
   
2. IN_PROGRESS
   - Teknisi mulai diagnose
   - Pencatatan spare parts
   
3. COMPLETED
   - Produk selesai diperbaiki
   - Hitung total biaya
   - Notify customer
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services` | List services |
| GET | `/services/:id` | Get service by ID |
| GET | `/services/status/:status` | Get by status |
| POST | `/services` | Create service |
| PATCH | `/services/:id` | Update service |
| POST | `/services/:id/start` | Start repair |
| POST | `/services/:id/complete` | Complete repair |
| DELETE | `/services/:id` | Cancel service |

---

## 9.4 ServiceItem Module (`/api/service-items`)

### Purpose
Spare parts dan item dalam servis.

### Business Logic

#### ServiceItem Structure
```typescript
interface ServiceItem {
  id: number;
  serviceId: number;
  productId?: number;
  productName: string;
  quantity: Decimal;
  unitPrice: Decimal;
  subtotal: Decimal;
  createdAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/service-items` | List items |
| GET | `/service-items/:id` | Get item |
| GET | `/service-items/service/:serviceId` | Get by service |
| POST | `/service-items` | Add item |
| PATCH | `/service-items/:id` | Update item |
| DELETE | `/service-items/:id` | Remove item |

---

# 10. PENGATURAN & LOYALTY

## 10.1 PointSetting Module (`/api/point-settings`)

### Purpose
Konfigurasi sistem poin loyalty.

### Business Logic

#### PointSetting Structure
```typescript
interface PointSetting {
  id: number;
  name: string;
  pointsPerRupiah: Decimal;      // e.g., 0.01 = 1 point per Rp 100
  minimumTransaction: Decimal;  // Min amount untuk earn points
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/point-settings` | Get point settings |
| POST | `/point-settings` | Create/update settings |

---

## 10.2 PointRedemption Module (`/api/point-redemptions`)

### Purpose
Penukaran poin loyalty dengan reward.

### Business Logic

#### PointRedemption Structure
```typescript
interface PointRedemption {
  id: number;
  customerId: number;
  code: string;
  pointsRedeemed: number;
  rewardName: string;
  rewardValue: Decimal;
  date: Date;
  createdById: string;
  createdAt: Date;
}
```

#### Redemption Flow
```typescript
async function redeemPoints(customerId: number, points: number, rewardName: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  });
  
  // 1. Check balance
  if (customer.pointBalance < points) {
    throw new Error('Insufficient points');
  }
  
  // 2. Calculate reward value
  const pointSetting = await prisma.pointSetting.findFirst();
  const rewardValue = points * (1 / pointSetting.pointsPerRupiah);
  
  // 3. Generate code
  const code = await generateNumber('POINT_REDEMPTION');
  
  // 4. Create redemption
  const redemption = await prisma.pointRedemption.create({
    data: {
      customerId,
      code,
      pointsRedeemed: points,
      rewardName,
      rewardValue,
      date: new Date(),
      createdById: context.user.id
    }
  });
  
  // 5. Deduct points
  await prisma.customer.update({
    where: { id: customerId },
    data: { pointBalance: { decrement: points } }
  });
  
  return redemption;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/point-redemptions` | List redemptions |
| GET | `/point-redemptions/:id` | Get redemption |
| GET | `/point-redemptions/customer/:customerId` | Get by customer |
| POST | `/point-redemptions` | Redeem points |

---

## 10.3 PriceHistory Module (`/api/price-histories`)

### Purpose
Tracking perubahan harga produk.

### Business Logic

#### PriceHistory Structure
```typescript
interface PriceHistory {
  id: number;
  productId: number;
  type: string;            // PURCHASE, SELLING
  oldPrice: Decimal;
  newPrice: Decimal;
  changedBy?: string;
  changedAt: Date;
  createdAt: Date;
}
```

#### Automatic Price History Logging
```typescript
async function updateProductPrice(productId: number, type: 'PURCHASE' | 'SELLING', newPrice: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });
  
  const oldPrice = type === 'PURCHASE' ? product.purchasePrice : product.sellingPrice;
  
  // Only log if price changed
  if (oldPrice !== newPrice) {
    await prisma.priceHistory.create({
      data: {
        productId,
        type,
        oldPrice,
        newPrice,
        changedBy: context.user?.id,
        changedAt: new Date()
      }
    });
    
    // Update product price
    await prisma.product.update({
      where: { id: productId },
      data: { [type === 'PURCHASE' ? 'purchasePrice' : 'sellingPrice']: newPrice }
    });
  }
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/price-histories` | List histories |
| GET | `/price-histories/:id` | Get history |
| GET | `/price-histories/product/:productId` | Get by product |
| GET | `/price-histories/date/:start/:end` | Get by date range |

---

## 10.4 Voucher Module (`/api/vouchers`)

### Purpose
Manajemen voucher dan diskon.

### Business Logic

#### Voucher Structure
```typescript
interface Voucher {
  id: number;
  code: string;
  name: string;
  type: VoucherType;
  value: Decimal;                // Discount value
  minPurchaseAmount: Decimal;    // Min purchase untuk bisa pakai
  maxDiscountAmount?: Decimal;  // Max discount cap
  startDate: Date;
  endDate: Date;
  usageLimit?: number;           // null = unlimited
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum VoucherType {
  DISCOUNT_PERCENT;    // Diskon persentase
  DISCOUNT_AMOUNT;     // Diskon nominal
  BUY_X_GET_Y;        // Beli X gratis Y
}
```

#### Apply Voucher to Sale
```typescript
async function applyVoucher(saleId: number, voucherCode: string) {
  const voucher = await prisma.voucher.findUnique({
    where: { code: voucherCode }
  });
  
  // 1. Validate voucher
  if (!voucher || !voucher.isActive) {
    throw new Error('Invalid voucher');
  }
  
  if (new Date() < voucher.startDate || new Date() > voucher.endDate) {
    throw new Error('Voucher expired or not yet active');
  }
  
  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
    throw new Error('Voucher usage limit reached');
  }
  
  // 2. Get sale
  const sale = await prisma.sale.findUnique({
    where: { id: saleId }
  });
  
  if (sale.subtotal < voucher.minPurchaseAmount) {
    throw new Error(`Minimum purchase ${voucher.minPurchaseAmount} required`);
  }
  
  // 3. Calculate discount
  let discount = 0;
  if (voucher.type === 'DISCOUNT_PERCENT') {
    discount = sale.subtotal * (voucher.value / 100);
    if (voucher.maxDiscountAmount) {
      discount = Math.min(discount, voucher.maxDiscountAmount);
    }
  } else if (voucher.type === 'DISCOUNT_AMOUNT') {
    discount = voucher.value;
  }
  
  // 4. Update sale
  await prisma.sale.update({
    where: { id: saleId },
    data: { 
      discountAmount: discount,
      total: sale.subtotal - discount + sale.taxAmount
    }
  });
  
  // 5. Increment voucher usage
  await prisma.voucher.update({
    where: { id: voucher.id },
    data: { usedCount: { increment: 1 } }
  });
  
  return { discount };
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vouchers` | List vouchers |
| GET | `/vouchers/:id` | Get voucher |
| GET | `/vouchers/code/:code` | Get by code |
| GET | `/vouchers/valid` | Get valid vouchers |
| POST | `/vouchers` | Create voucher |
| PATCH | `/vouchers/:id` | Update voucher |
| DELETE | `/vouchers/:id` | Delete voucher |

---

## 10.5 Tax Module (`/api/taxes`)

### Purpose
Konfigurasi pajak.

### Business Logic

#### Tax Structure
```typescript
interface Tax {
  id: number;
  code: string;
  name: string;
  rate: Decimal;            // Tax rate %
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Common Tax Rates
```
1. PPN (VAT) - 11%
2. PPN - 12%
3. PPN - 10%
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/taxes` | List taxes |
| GET | `/taxes/:id` | Get tax |
| POST | `/taxes` | Create tax |
| PATCH | `/taxes/:id` | Update tax |
| DELETE | `/taxes/:id` | Delete tax |

---

## 10.6 ExpenseCategory Module (`/api/expense-categories`)

### Purpose
Kategori pengeluaran.

### Business Logic

#### ExpenseCategory Structure
```typescript
interface ExpenseCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Example Categories
```
1. Biaya Listrik
2. Biaya Air
3. Biaya Sewa
4. Biaya Gaji
5. Biaya Transportasi
6. Biaya Makan
7. Biaya Konsumsi
8. Biaya Perlengkapan
9. Biaya Pemeliharaan
10. Biaya Lain-lain
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expense-categories` | List categories |
| GET | `/expense-categories/:id` | Get category |
| POST | `/expense-categories` | Create category |
| PATCH | `/expense-categories/:id` | Update category |
| DELETE | `/expense-categories/:id` | Delete category |

---

## 10.7 Expense Module (`/api/expenses`)

### Purpose
Manajemen pengeluaran operasional.

### Business Logic

#### Expense Structure
```typescript
interface Expense {
  id: number;
  code: string;
  date: Date;
  expenseCategoryId: number;
  amount: Decimal;
  description?: string;
  referenceNumber?: string;
  isApproved: boolean;
  approvedById?: string;
  approvedAt?: Date;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Approval Flow
```typescript
async function createExpense(data: CreateExpenseDto) {
  const code = await generateNumber('EXPENSE');
  
  const expense = await prisma.expense.create({
    data: {
      code,
      date: data.date,
      expenseCategoryId: data.expenseCategoryId,
      amount: data.amount,
      description: data.description,
      referenceNumber: data.referenceNumber,
      isApproved: false,
      notes: data.notes
    }
  });
  
  // Create journal entry
  await createJournal({
    description: `Expense: ${expense.code}`,
    referenceType: 'EXPENSE',
    referenceId: expense.id,
    entries: [
      { accountCode: '5-XXXX', debit: data.amount, credit: 0 },  // Expense account
      { accountCode: '1-1000', debit: 0, credit: data.amount }    // Cash account
    ]
  });
  
  return expense;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses` | List expenses |
| GET | `/expenses/:id` | Get expense |
| GET | `/expenses/pending` | Get pending approvals |
| GET | `/expenses/category/:categoryId` | Get by category |
| POST | `/expenses` | Create expense |
| POST | `/expenses/:id/approve` | Approve expense |
| POST | `/expenses/:id/reject` | Reject expense |
| DELETE | `/expenses/:id` | Delete expense |

---

## 10.8 Transfer Module (`/api/transfers`)

### Purpose
Transfer antar warehouse atau antar account yang fleksibel.

### Business Logic

#### Transfer Structure
```typescript
interface Transfer {
  id: number;
  code: string;
  date: Date;
  fromAccountId?: number;
  toAccountId?: number;
  fromWarehouseId?: number;
  toWarehouseId?: number;
  amount: Decimal;
  description?: string;
  status: TransactionStatus;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transfers` | List transfers |
| GET | `/transfers/:id` | Get transfer |
| POST | `/transfers` | Create transfer |
| POST | `/transfers/:id/approve` | Approve transfer |
| DELETE | `/transfers/:id` | Cancel transfer |

---

# 11. NOTIFIKASI

## 11.1 Notification Module (`/api/notifications`)

### Purpose
Sistem notifikasi untuk user.

### Business Logic

#### Notification Structure
```typescript
interface Notification {
  id: number;
  userId?: string;            // Target user (null = all admins)
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  referenceType?: string;
  referenceId?: number;
  isActive: boolean;
  createdAt: Date;
}

enum NotificationType {
  INFO;      // Informasi
  WARNING;   // Peringatan
  ERROR;     // Error
  SUCCESS;   // Berhasil
}
```

#### Create Notification
```typescript
async function createNotification(data: CreateNotificationDto) {
  return await prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      referenceType: data.referenceType,
      referenceId: data.referenceId
    }
  });
}
```

#### Notification Triggers
```typescript
// 1. New Sale
await createNotification({
  userId: managerId,
  title: 'Penjualan Baru',
  message: `Penjualan ${sale.code} sejumlah Rp ${sale.total}`,
  type: 'INFO',
  referenceType: 'Sale',
  referenceId: sale.id
});

// 2. Low Stock Alert
await createNotification({
  userId: managerId,
  title: 'Stock Rendah',
  message: `Produk ${product.name} stock: ${stock}`,
  type: 'WARNING',
  referenceType: 'Product',
  referenceId: product.id
});

// 3. Leave Request
await createNotification({
  userId: approverId,
  title: 'Pengajuan Cuti',
  message: `${employee.name} mengajukan cuti ${leave.totalDays} hari`,
  type: 'INFO',
  referenceType: 'Leave',
  referenceId: leave.id
});
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| GET | `/notifications/unread` | Get unread notifications |
| GET | `/notifications/count` | Get unread count |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/read-all` | Mark all as read |
| DELETE | `/notifications/:id` | Delete notification |

---

## 11.2 NotificationSetting Module (`/api/notification-settings`)

### Purpose
Preferensi notifikasi per user.

### Business Logic

#### NotificationSetting Structure
```typescript
interface NotificationSetting {
  id: number;
  userId: string;
  type: string;               // SALE, PURCHASE, STOCK, PAYMENT, REPORT, SYSTEM
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  threshold?: Decimal;        // Optional threshold
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notification-settings` | List settings |
| GET | `/notification-settings/:id` | Get setting |
| GET | `/notification-settings/user/:userId` | Get by user |
| POST | `/notification-settings` | Create setting |
| PATCH | `/notification-settings/:id` | Update setting |

---

# 12. LAPORAN & ANALITIK

## 12.1 Report Module (`/api/reports`)

### Purpose
Berbagai laporan untuk analisis bisnis.

### Business Logic

#### Report Types

##### Sales Report
```typescript
async function getSalesReport(startDate: Date, endDate: Date) {
  const sales = await prisma.sale.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      status: { not: 'CANCELLED' }
    },
    include: {
      customer: true,
      items: { include: { product: true } }
    }
  });
  
  return {
    summary: {
      totalTransactions: sales.length,
      totalRevenue: sales.reduce((sum, s) => sum + s.total, 0),
      totalProfit: sales.reduce((sum, s) => sum + calculateProfit(s), 0),
      averageTransaction: sales.length > 0 
        ? sales.reduce((sum, s) => sum + s.total, 0) / sales.length 
        : 0
    },
    byProduct: groupByProduct(sales),
    byCustomer: groupByCustomer(sales),
    byDate: groupByDate(sales)
  };
}
```

##### Inventory Report
```typescript
async function getInventoryReport(warehouseId?: number) {
  const where = warehouseId 
    ? { warehouseId } 
    : {};
  
  const stocks = await prisma.productStock.findMany({
    where,
    include: { product: { include: { category: true } } }
  });
  
  return {
    totalProducts: stocks.length,
    totalStock: stocks.reduce((sum, s) => sum + s.quantity, 0),
    totalValue: stocks.reduce((sum, s) => sum + (s.quantity * s.product.sellingPrice), 0),
    lowStock: stocks.filter(s => s.quantity <= s.minimumStock),
    outOfStock: stocks.filter(s => s.quantity <= 0),
    byCategory: groupByCategory(stocks)
  };
}
```

##### Financial Report
```typescript
async function getFinancialReport(startDate: Date, endDate: Date) {
  // Get all journal entries in period
  const entries = await prisma.journalEntry.findMany({
    where: {
      journal: {
        date: { gte: startDate, lte: endDate },
        isPosted: true
      }
    },
    include: { account: true }
  });
  
  // Calculate by account type
  const revenue = entries
    .filter(e => e.account.type === 'REVENUE')
    .reduce((sum, e) => sum + e.credit - e.debit, 0);
  
  const expense = entries
    .filter(e => e.account.type === 'EXPENSE')
    .reduce((sum, e) => sum + e.debit - e.credit, 0);
  
  return {
    period: { startDate, endDate },
    revenue,
    expense,
    netProfit: revenue - expense,
    byAccount: groupByAccount(entries)
  };
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/sales` | Sales report |
| GET | `/reports/sales-by-product` | Sales by product |
| GET | `/reports/sales-by-customer` | Sales by customer |
| GET | `/reports/inventory` | Inventory report |
| GET | `/reports/stock-valuation` | Stock valuation |
| GET | `/reports/financial` | Financial report |
| GET | `/reports/profit-loss` | Profit & Loss |
| GET | `/reports/cash-flow` | Cash flow |
| GET | `/reports/aging-receivable` | Aging receivable |
| GET | `/reports/aging-payable` | Aging payable |
| GET | `/reports/employee-attendance` | Attendance report |
| GET | `/reports/payroll` | Payroll report |

---

## 12.2 Dashboard Module (`/api/dashboard`)

### Purpose
Data untuk dashboard utama.

### Business Logic

#### Dashboard Data
```typescript
async function getDashboardData() {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  // Today's sales
  const todaySales = await prisma.sale.aggregate({
    where: {
      date: { gte: startOfDay, lte: endOfDay }
    },
    _sum: { total: true },
    _count: true
  });
  
  // Today's purchases
  const todayPurchases = await prisma.purchase.aggregate({
    where: {
      date: { gte: startOfDay, lte: endOfDay }
    },
    _sum: { total: true },
    _count: true
  });
  
  // Low stock alerts
  const lowStockAlerts = await prisma.stockAlert.count({
    where: { isResolved: false }
  });
  
  // Pending approvals
  const pendingLeaves = await prisma.leave.count({
    where: { status: 'PENDING' }
  });
  
  // Top selling products today
  const topProducts = await getTopSellingProducts(startOfDay, endOfDay, 5);
  
  // Recent transactions
  const recentSales = await prisma.sale.findMany({
    where: { date: { gte: startOfDay } },
    orderBy: { date: 'desc' },
    take: 10,
    include: { customer: true }
  });
  
  return {
    todaySales: {
      count: todaySales._count,
      total: todaySales._sum.total || 0
    },
    todayPurchases: {
      count: todayPurchases._count,
      total: todayPurchases._sum.total || 0
    },
    alerts: {
      lowStock: lowStockAlerts,
      pendingLeaves
    },
    topProducts,
    recentSales
  };
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get dashboard data |
| GET | `/dashboard/sales-today` | Today's sales summary |
| GET | `/dashboard/top-products` | Top selling products |
| GET | `/dashboard/low-stock` | Low stock items |
| GET | `/dashboard/pending-tasks` | Pending tasks |

---

## 12.3 DailySalesSummary Module (`/api/daily-sales-summaries`)

### Purpose
Aggregasi penjualan harian untuk reporting.

### Business Logic

#### DailySalesSummary Structure
```typescript
interface DailySalesSummary {
  id: number;
  date: Date;                    // Date only
  totalTransactions: number;
  totalCost: Decimal;
  totalSales: Decimal;
  totalProfit: Decimal;
  totalReturns: Decimal;
  totalExpenses: Decimal;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Daily Aggregation
```typescript
async function aggregateDailySales(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Get sales for the day
  const sales = await prisma.sale.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      isReturn: false
    },
    include: { items: true }
  });
  
  // Get returns for the day
  const returns = await prisma.saleReturn.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      status: 'COMPLETED'
    }
  });
  
  // Get expenses for the day
  const expenses = await prisma.expense.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      isApproved: true
    }
  });
  
  // Calculate totals
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalCost = calculateTotalCost(sales);
  const totalProfit = totalSales - totalCost;
  const totalReturns = returns.reduce((sum, r) => sum + r.totalReturn, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Upsert summary
  await prisma.dailySalesSummary.upsert({
    where: { date },
    create: {
      date,
      totalTransactions: sales.length,
      totalCost,
      totalSales,
      totalProfit,
      totalReturns,
      totalExpenses
    },
    update: {
      totalTransactions: sales.length,
      totalCost,
      totalSales,
      totalProfit,
      totalReturns,
      totalExpenses
    }
  });
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/daily-sales-summaries` | List summaries |
| GET | `/daily-sales-summaries/:id` | Get summary |
| GET | `/daily-sales-summaries/date/:date` | Get by date |
| GET | `/daily-sales-summaries/range/:start/:end` | Get by date range |
| POST | `/daily-sales-summaries/aggregate` | Run aggregation |

---

## 12.4 MonthlySalesSummary Module (`/api/monthly-sales-summaries`)

### Purpose
Aggregasi penjualan bulanan untuk reporting.

### Business Logic

#### MonthlySalesSummary Structure
```typescript
interface MonthlySalesSummary {
  id: number;
  year: number;
  month: number;
  totalTransactions: number;
  totalCost: Decimal;
  totalSales: Decimal;
  totalProfit: Decimal;
  totalReturns: Decimal;
  totalExpenses: Decimal;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Monthly Aggregation
```typescript
async function aggregateMonthlySales(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  // Aggregate from daily summaries
  const dailySummaries = await prisma.dailySalesSummary.findMany({
    where: {
      date: { gte: startDate, lte: endDate }
    }
  });
  
  const summary = dailySummaries.reduce(
    (acc, day) => ({
      totalTransactions: acc.totalTransactions + day.totalTransactions,
      totalCost: acc.totalCost + day.totalCost,
      totalSales: acc.totalSales + day.totalSales,
      totalProfit: acc.totalProfit + day.totalProfit,
      totalReturns: acc.totalReturns + day.totalReturns,
      totalExpenses: acc.totalExpenses + day.totalExpenses
    }),
    {
      totalTransactions: 0,
      totalCost: Decimal(0),
      totalSales: Decimal(0),
      totalProfit: Decimal(0),
      totalReturns: Decimal(0),
      totalExpenses: Decimal(0)
    }
  );
  
  // Upsert monthly summary
  await prisma.monthlySalesSummary.upsert({
    where: { year_month: { year, month } },
    create: { year, month, ...summary },
    update: summary
  });
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/monthly-sales-summaries` | List summaries |
| GET | `/monthly-sales-summaries/:id` | Get summary |
| GET | `/monthly-sales-summaries/year/:year` | Get by year |
| GET | `/monthly-sales-summaries/year/:year/month/:month` | Get specific month |
| POST | `/monthly-sales-summaries/aggregate` | Run aggregation |

---

## 12.5 ActivityLog Module (`/api/activity-logs`)

### Purpose
Log aktivitas untuk audit trail.

### Business Logic

#### ActivityLog Structure
```typescript
interface ActivityLog {
  id: number;
  type: string;              // SALE, PURCHASE, STOCK_IN, STOCK_OUT, dll
  title: string;
  description?: string;
  referenceType?: string;
  referenceId?: number;
  amount?: Decimal;
  createdById?: string;
  createdAt: Date;
}
```

#### Automatic Logging
```typescript
// Create activity log for sales
await createActivityLog({
  type: 'SALE',
  title: `Penjualan ${sale.code}`,
  description: `Penjualan ke ${customer.name}`,
  referenceType: 'Sale',
  referenceId: sale.id,
  amount: sale.total,
  createdById: sale.createdById
});

// Create activity log for stock changes
await createActivityLog({
  type: 'STOCK_IN',
  title: `Barang Masuk ${stockIn.code}`,
  referenceType: 'StockIn',
  referenceId: stockIn.id,
  amount: stockIn.totalItems
});
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/activity-logs` | List logs |
| GET | `/activity-logs/:id` | Get log |
| GET | `/activity-logs/type/:type` | Get by type |
| GET | `/activity-logs/recent` | Get recent logs |
| GET | `/activity-logs/user/:userId` | Get by user |

---

# 13. LOGGING & MONITORING

## 13.1 Log Module (`/api/logs`)

### Purpose
Request logging untuk debugging dan audit.

### Business Logic

#### Log Structure
```typescript
interface Log {
  id: number;
  method?: string;           // HTTP method
  endpoint?: string;         // API endpoint
  headers?: Json;
  payload?: Json;
  responseStatus?: number;
  message?: string;
  requesterLoginId?: number;
  requesterFullName?: string;
  ipAddress?: string;
  userAgent?: string;
  durationMs?: number;
  logDatetime: Date;
  createdAt: Date;
}
```

#### Logging Interceptor
```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logRequest({
            method,
            url,
            payload: body,
            responseStatus: 200,
            ipAddress: request.ip,
            userAgent: headers['user-agent'],
            durationMs: duration,
            requesterLoginId: request.user?.id,
            requesterFullName: request.user?.name
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logRequest({
            method,
            url,
            payload: body,
            responseStatus: error.status || 500,
            message: error.message,
            ipAddress: request.ip,
            userAgent: headers['user-agent'],
            durationMs: duration,
            requesterLoginId: request.user?.id,
            requesterFullName: request.user?.name
          });
        }
      })
    );
  }
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/logs` | List logs |
| GET | `/logs/:id` | Get log |
| GET | `/logs/date/:date` | Get by date |
| GET | `/logs/user/:userId` | Get by user |
| GET | `/logs/slow` | Get slow requests |

---

## 13.2 Health Module (`/api/health`)

### Purpose
Health check endpoint untuk monitoring dan container orchestration.

### Business Logic

#### Health Check
```typescript
async function getHealthStatus() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis()
    }
  };
  
  // Overall status
  const allHealthy = Object.values(checks.checks).every(c => c.status === 'ok');
  checks.status = allHealthy ? 'ok' : 'degraded';
  
  return checks;
}

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', message: 'Database connected' };
  } catch (error) {
    return { status: 'error', message: 'Database connection failed' };
  }
}

async function checkRedis() {
  try {
    await redis.ping();
    return { status: 'ok', message: 'Redis connected' };
  } catch (error) {
    return { status: 'error', message: 'Redis connection failed' };
  }
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Get health status |
| GET | `/health/ready` | Readiness probe |
| GET | `/health/live` | Liveness probe |

---

# APPENDIX

## A. Common Enums

### TransactionStatus
```
DRAFT       - Draft/survey
PENDING     - Menunggu konfirmasi
CONFIRMED   - Dikonfirmasi
SENT        - Dikirim
RECEIVED    - Diterima
COMPLETED   - Selesai
APPROVED    - Disetujui
CANCELLED   - Dibatalkan
```

### PaymentStatus
```
PENDING     - Belum dibayar
PAID        - Lunas
INSTALMENT  - Cicilan
PARTIAL     - Bayar sebagian
CANCELLED   - Dibatalkan
```

### PaymentMethod
```
CASH        - Tunai
TRANSFER    - Transfer bank
DEBIT       - Kartu debit
QRIS        - QRIS
CREDIT      - Kartu kredit
```

### CustomerGroup
```
RETAIL      - Pelanggan umum
WHOLESALE   - Grosir
VIP         - Prioritas
GENERAL     - Default
```

### EmployeeStatus
```
ACTIVE      - Aktif
INACTIVE    - Tidak aktif
RESIGNED    - Mengundurkan diri
TERMINATED  - Diberhentikan
```

### AttendanceStatus
```
PRESENT     - Hadir
LATE        - Terlambat
ABSENT      - Tidak hadir
SICK        - Sakit
LEAVE       - Cuti/Izin
```

### LeaveType
```
ANNUAL      - Cuti tahunan
SICK        - Sakit
MATERNITY   - Melahirkan
PATERNITY   - Cuti ayah
UNPAID      - Tanpa gaji
EMERGENCY   - Mendesak
OTHER       - Lainnya
```

### LeaveStatus
```
PENDING     - Menunggu
APPROVED    - Disetujui
REJECTED    - Ditolak
CANCELLED   - Dibatalkan
```

### LoanStatus
```
PENDING     - Menunggu
APPROVED    - Disetujui
ACTIVE      - Aktif
COMPLETED   - Lunas
REJECTED    - Ditolak
CANCELLED   - Dibatalkan
```

### AssetStatus
```
ACTIVE      - Aktif
MAINTENANCE - Perbaikan
DISPOSED    - Dijual/dibuang
```

### RepairStatus
```
PENDING     - Menunggu
IN_PROGRESS - Sedang dikerjakan
COMPLETED   - Selesai
CANCELLED   - Dibatalkan
```

### ProductionStatus
```
PLANNING    - Perencanaan
IN_PROGRESS - Sedang produksi
COMPLETED   - Selesai
CANCELLED   - Dibatalkan
```

### NotificationType
```
INFO        - Informasi
WARNING     - Peringatan
ERROR       - Error
SUCCESS     - Berhasil
```

---

## B. Business Logic Patterns

### 1. Code Generation Pattern
```typescript
async function generateCode(type: string): Promise<string> {
  const numbering = await prisma.numbering.findUnique({
    where: { type }
  });
  
  const nextNumber = numbering.lastNumber + 1;
  
  await prisma.numbering.update({
    where: { id: numbering.id },
    data: { lastNumber: nextNumber }
  });
  
  const numStr = nextNumber.toString().padStart(numbering.digitCount, '0');
  return `${numbering.prefix}${numStr}${numbering.suffix}`;
}
```

### 2. Stock Update Pattern
```typescript
async function updateStock(productId: number, warehouseId: number, delta: number) {
  const stock = await prisma.productStock.findUnique({
    where: { productId_warehouseId: { productId, warehouseId } }
  });
  
  if (!stock) {
    await prisma.productStock.create({
      data: { productId, warehouseId, quantity: delta }
    });
  } else {
    const newQuantity = stock.quantity + delta;
    if (newQuantity < 0) {
      throw new Error('Insufficient stock');
    }
    
    await prisma.productStock.update({
      where: { id: stock.id },
      data: { quantity: newQuantity }
    });
  }
  
  // Update aggregate
  await recalculateProductStock(productId);
}
```

### 3. Balance Update Pattern
```typescript
async function updateCustomerReceivable(customerId: number, delta: number) {
  await prisma.customer.update({
    where: { id: customerId },
    data: { totalReceivable: { increment: delta } }
  });
}

async function updateSupplierDebt(supplierId: number, delta: number) {
  await prisma.supplier.update({
    where: { id: supplierId },
    data: { totalDebt: { increment: delta } }
  });
}
```

### 4. Validation Pattern
```typescript
function validateStockOpname(opname: StockOpname, items: OpnameItem[]) {
  // Check all items are from same warehouse
  const warehouseIds = new Set(items.map(i => i.warehouseId));
  if (warehouseIds.size > 1) {
    throw new Error('All items must be from same warehouse');
  }
  
  // Check products exist in warehouse
  for (const item of items) {
    const stock = await getStock(item.productId, opname.warehouseId);
    if (!stock) {
      throw new Error(`Product ${item.productId} not in warehouse`);
    }
  }
}
```

### 5. Transaction Pattern
```typescript
async function completeSaleWithPayment(saleId: number, paymentData: PaymentData) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create sale
    const sale = await tx.sale.create({ data: saleData });
    
    // 2. Create sale items
    await tx.saleItem.createMany({ data: saleItems });
    
    // 3. Deduct stock
    for (const item of saleItems) {
      await tx.productStock.update({
        where: { productId_warehouseId: { productId: item.productId, warehouseId } },
        data: { quantity: { decrement: item.quantity } }
      });
    }
    
    // 4. Create payment
    const payment = await tx.salePayment.create({ data: paymentData });
    
    // 5. Update customer receivable
    await tx.customer.update({
      where: { id: customerId },
      data: { totalReceivable: { increment: sale.total } }
    });
    
    // 6. Create activity log
    await tx.activityLog.create({ data: { type: 'SALE', title: `Sale ${sale.code}` } });
    
    return sale;
  });
}
```

---

## C. Error Handling

### Standard Error Response
```typescript
{
  statusCode: number,
  message: string,
  error: string,
  details?: any,
  timestamp: string,
  path: string
}
```

### Business Error Codes
```
AUTH001 - Invalid credentials
AUTH002 - Account disabled
AUTH003 - Token expired
AUTH004 - Token invalid
AUTH005 - Username exists
AUTH006 - Email exists

INV001 - Insufficient stock
INV002 - Product not found
INV003 - Warehouse not found

FIN001 - Account not balanced
FIN002 - Invalid account
FIN003 - Cannot delete account with entries

HRM001 - Employee not found
HRM002 - Insufficient leave balance
HRM003 - Leave overlap

...
```

---

## D. API Response Format

### Success Response
```typescript
{
  success: true,
  data: any,
  meta?: {
    total?: number,
    page?: number,
    limit?: number
  }
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

---

# APPENDIX E - WORKFLOW DIAGRAMS

## E.1 Sale Transaction Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SALE TRANSACTION WORKFLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

[START] → [Create Sale] → [Validate Stock] → [Calculate Totals]
                                                        ↓
                              ┌────────────────────────┴────────────────────────┐
                              ↓                                                 ↓
                      [Stock Available?]                                  [Stock Insufficient]
                              ↓                                                 ↓
                     ┌───────┴───────┐                                 [Show Error Message]
                     ↓               ↓                                           ↓
              [POS Payment]    [Credit/Partial]                           [END]
                     ↓               ↓
              ┌─────┴─────┐        ↓
              ↓           ↓   [Record Partial Payment]
              ↓           ↓          ↓
       [Cash/Card]  [QRIS]    [Update Sale Status]
              ↓           ↓          ↓
              └─────┬─────┘    [Create Journal Entry]
                    ↓                    ↓
              [Process Payment]   [Update Receivable]
                    ↓                    ↓
              [Update Stock]      [Calculate Loyalty Points]
                    ↓                    ↓
              [Create Journal]         [END]
                    ↓
             [END]


┌─────────────────────────────────────────────────────────────────────────────┐
│                         PAYMENT PROCESSING FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

[Payment Request] → [Validate Sale Exists?] → [Calculate Paid Amount]
                                                    ↓
                              ┌──────────────────┴──────────────────┐
                              ↓                                        ↓
                          [PAID]                               [Need More?]
                              ↓                                        ↓
                    ┌─────────┴─────────┐                        [No]
                    ↓                   ↓                           ↓
              [Overpayment]        [Exact Payment]              [Update Status]
                    ↓                   ↓                           ↓
              [Calculate Change]   [Mark as PAID]          [Return to Caller]
                    ↓                   ↓
              [Record Payment]    [Record Payment]
                    ↓                   ↓
              [Update Status]     [Update Status]
                    └────────┬────────┘
                             ↓
                      [END]


┌─────────────────────────────────────────────────────────────────────────────┐
│                         RETURN PROCESSING FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

[Return Request] → [Validate Original Sale] → [Validate Items]
                                                    ↓
                              ┌──────────────────┴──────────────────┐
                              ↓                                        ↓
                          [Valid]                                  [Invalid]
                              ↓                                        ↓
                    [Calculate Refund]                        [Show Error]
                              ↓                                        ↓
                    [Create Return Record]                         [END]
                              ↓
                    [Approve Return?]
                              ↓
           ┌───────────────┴───────────────┐
           ↓                               ↓
      [Approved]                       [Rejected]
           ↓                               ↓
    [Return Stock to WH]          [Update Status]
           ↓                               ↓
    [Refund Payment]                    [END]
           ↓
    [Update Receivable]
           ↓
      [Update Status]
           ↓
         [END]


┌─────────────────────────────────────────────────────────────────────────────┐
│                         PURCHASE TRANSACTION FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

[START] → [Create Purchase] → [Receive Items?] → [Partial Receipt]
                                                    ↓
                              ┌──────────────────┴──────────────────┐
                              ↓                                        ↓
                          [Yes]                                     [No]
                              ↓                                        ↓
                      [Receive Stock]                         [Wait for Items]
                              ↓                                        ↓
                    [Update PO Status]                            [END]
                              ↓
                    [Invoice Received?]
                              ↓
           ┌───────────────┴───────────────┐
           ↓                               ↓
       [Yes]                              [No]
           ↓                               ↓
    [Record Invoice]                  [END]
           ↓
    [Process Payment]
           ↓
    [Update Supplier Debt]
           ↓
      [END]


┌─────────────────────────────────────────────────────────────────────────────┐
│                         STOCK OPNAME FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

[START] → [Create Opname Session] → [Auto-populate Products]
                                                    ↓
                                              [Print List]
                                                    ↓
                                           [Count Physical Stock]
                                                    ↓
                                         [Input Counted Values]
                                                    ↓
                                    [Calculate Differences]
                                                    ↓
           ┌────────────────────────────────────────┴────────────────────────────────────────┐
           ↓                                        ↓                                        ↓
    [Has Difference]                          [Has Difference]                          [No Difference]
           ↓                                        ↓                                        ↓
    [Submit for Review]                      [Submit for Review]                       [Close Opname]
           ↓                                        ↓                                        ↓
    [Manager Reviews]                        [Manager Reviews]                           [END]
           ↓                                        ↓
    ┌──────┴──────┐                      ┌──────┴──────┐
    ↓             ↓                      ↓             ↓
[Approve]    [Reject]               [Approve]    [Reject]
    ↓             ↓                      ↓             ↓
[Apply Adj]  [Return to]       [Apply Adj]  [Return to]
    ↓         [Counter]                ↓         [Counter]
    ↓             ↓                    ↓             ↓
[Update Stock]   [END]           [Update Stock]   [END]
    ↓
[Create Journal]
    ↓
   [END]


┌─────────────────────────────────────────────────────────────────────────────┐
│                         LOAN APPROVAL FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

[START] → [Submit Loan Request] → [HR Review]
                                              ↓
                              ┌───────────────┴───────────────┐
                              ↓                               ↓
                         [Approved]                       [Rejected]
                              ↓                               ↓
                    [Calculate Installments]              [Notify Employee]
                              ↓                               ↓
                    [Generate Schedule]                       [END]
                              ↓
                    [Manager Approval]
                              ↓
           ┌───────────────┴───────────────┐
           ↓                               ↓
       [Approved]                       [Rejected]
           ↓                               ↓
    [Start Deductions]                 [Notify Employee]
           ↓                               ↓
    [Monthly Deduction]                [END]
           ↓
    [Loan Completed?]
           ↓
    ┌────┴────┐
    ↓         ↓
  [Yes]      [No]
    ↓         ↓
[Close]  [Continue]
    ↓         ↓
  [END]  [Monthly Deduction]
             ↓
           [Loop]


┌─────────────────────────────────────────────────────────────────────────────┐
│                         LEAVE APPROVAL FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

[START] → [Submit Leave Request] → [Validate Balance]
                                              ↓
                              ┌───────────────┴───────────────┐
                              ↓                               ↓
                    [Sufficient Balance]              [Insufficient]
                              ↓                               ↓
                    [Manager Review]                 [Show Error]
                              ↓                               ↓
           ┌───────────────┴───────────────┐                  ↓
           ↓                               ↓                  [END]
       [Approved]                       [Rejected]
           ↓                               ↓
    [Deduct Balance]                [Notify Employee]
           ↓                               ↓
    [Update Attendance]               [END]
           ↓
    [Notify Employee]
           ↓
       [END]


┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

[START] → [Create Production Order] → [Validate BOM]
                                              ↓
                              ┌───────────────┴───────────────┐
                              ↓                               ↓
                         [Valid]                          [Invalid]
                              ↓                               ↓
                    [Calculate Cost]                    [Show Error]
                              ↓                               ↓
                    [Start Production]                     [END]
                              ↓
                    [Raw Materials Available?]
                              ↓
           ┌───────────────┴───────────────┐
           ↓                               ↓
        [Yes]                              [No]
           ↓                               ↓
    [Deduct Materials]              [Show Error / Wait]
           ↓                               ↓
    [Start Production]                  [END]
           ↓
    [Production Complete]
           ↓
    [Add Finished Goods]
           ↓
    [Update Product Cost]
           ↓
      [END]


┌─────────────────────────────────────────────────────────────────────────────┐
│                         ASSET DEPRECIATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

[Monthly Schedule] → [Get Active Assets] → [Calculate Depreciation]
                                                      ↓
                                             [For Each Asset]
                                                      ↓
                                         ┌────────────┴────────────┐
                                         ↓                         ↓
                                [Straight Line]          [Declining Balance]
                                         ↓                         ↓
                                  [Formula:              [Formula:
                                   (Cost - Salvage)           Book Value ×
                                   / Useful Life              (2 / Life)]
                                         ↓                         ↓
                                         └────────────┬────────────┘
                                                      ↓
                                              [Update Book Value]
                                                      ↓
                                         [Create Journal Entry]
                                                      ↓
                                         [Accumulated Depreciation]
                                                      ↓
                                                   [END]

---

# APPENDIX F - DATABASE RELATIONSHIPS

## F.1 Entity Relationship Diagram (Text)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           CORE ENTITIES                                        │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│    ┌──────────┐         ┌──────────┐         ┌──────────┐                    │
│    │ COMPANY  │─────────<│   USER  │>────────│   ROLE  │                    │
│    └──────────┘    1:N  └──────────┘   N:N   └──────────┘                    │
│         │                │                       │                              │
│         │                │                       │                              │
│         │                ▼                       ▼                              │
│         │         ┌──────────┐         ┌──────────┐                          │
│         │         │ USER_ROLE│         │ ROLE_MENU│                          │
│         │         └──────────┘         └──────────┘                          │
│         │                │                       │                              │
│         │                ▼                       ▼                              │
│         │         ┌──────────┐         ┌──────────┐                          │
│         └────────>│   MENU   │         │   MENU   │                          │
│              1:N  └──────────┘         └──────────┘                          │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────────────┐
│                         MASTER DATA ENTITIES                                   │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│    ┌──────────┐  1:N ┌──────────┐  N:1 ┌──────────┐  N:1 ┌──────────┐       │
│    │CATEGORY  │──────│ PRODUCT  │──────│  BRAND   │──────│  UNIT   │       │
│    └──────────┘       └──────────┘       └──────────┘       └──────────┘       │
│                              │                                                 │
│                              │ N:1                                             │
│                              ▼                                                 │
│                       ┌──────────┐                                            │
│                       │PRODUCTGRP│                                            │
│                       └──────────┘                                            │
│                                                                                 │
│    ┌──────────┐  1:N ┌──────────┐  N:1 ┌──────────┐                          │
│    │SUPPLIER  │──────│PURCHASE │──────│WAREHOUSE │                          │
│    └──────────┘       └──────────┘       └──────────┘                          │
│                              │                                                 │
│                              │ N:1                                             │
│                              ▼                                                 │
│                       ┌──────────┐                                            │
│                       │PURCHITEM │                                            │
│                       └──────────┘                                            │
│                                                                                 │
│    ┌──────────┐  1:N ┌──────────┐  N:1 ┌──────────┐                          │
│    │ CUSTOMER │──────│   SALE   │──────│SALESPERS │                          │
│    └──────────┘       └──────────┘       └──────────┘                          │
│                              │                                                 │
│                              │ N:1                                             │
│                              ▼                                                 │
│                       ┌──────────┐                                            │
│                       │ SALEITEM │                                            │
│                       └──────────┘                                            │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────────────┐
│                         INVENTORY ENTITIES                                     │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│    ┌──────────┐  1:N ┌──────────┐  N:1 ┌──────────┐                          │
│    │ WAREHOUSE│──────│PRODSTOCK │──────│ PRODUCT  │                          │
│    └──────────┘       └──────────┘       └──────────┘                          │
│         │                    │                                                   │
│         │ 1:N                │ N:1                                              │
│         ▼                    ▼                                                   │
│    ┌──────────┐       ┌──────────┐                                             │
│    │  SHELF   │───────│SHELFPROD│                                             │
│    └──────────┘  1:N  └──────────┘                                             │
│                                                                                 │
│    ┌──────────┐  1:N ┌──────────┐  N:1 ┌──────────┐                          │
│    │STOCK_IN  │──────│STOCKITEM │──────│ PRODUCT  │                          │
│    └──────────┘       └──────────┘       └──────────┘                          │
│                                                                                 │
│    ┌──────────┐  1:N ┌──────────┐  N:1 ┌──────────┐                          │
│    │STOCK_OUT │──────│STOCKITEM │──────│ PRODUCT  │                          │
│    └──────────┘       └──────────┘       └──────────┘                          │
│                                                                                 │
│    ┌─────────────┐  1:N ┌──────────────┐                                      │
│    │STOCK_TRANSFR│──────│TRANSFER_ITEM│                                      │
│    └─────────────┘       └──────────────┘                                      │
│         │                            │                                         │
│         │ N:1                        │ N:1                                     │
│         ▼                            ▼                                         │
│    ┌──────────┐                ┌──────────┐                                   │
│    │ WAREHOUSE│ (FROM)         │ WAREHOUSE│ (TO)                             │
│    └──────────┘                └──────────┘                                   │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────────────┐
│                         ACCOUNTING ENTITIES                                     │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│    ┌──────────┐  1:N ┌─────────────┐                                          │
│    │  ACCOUNT │──────│JOURNAL_ENTRY│                                          │
│    └──────────┘       └─────────────┘                                          │
│                              │                                                  │
│                              │ N:1                                              │
│                              ▼                                                  │
│                        ┌──────────┐                                           │
│                        │ JOURNAL  │                                           │
│                        └──────────┘                                           │
│                                                                                 │
│    ┌──────────┐  1:N ┌──────────┐  N:1 ┌──────────┐                          │
│    │  ACCOUNT │──────│  CASH_IN │──────│  USER   │                          │
│    └──────────┘       └──────────┘       └──────────┘                          │
│                                                                                 │
│    ┌──────────┐  1:N ┌──────────┐  N:1 ┌──────────┐                          │
│    │  ACCOUNT │──────│ CASH_OUT │──────│  USER   │                          │
│    └──────────┘       └──────────┘       └──────────┘                          │
│                                                                                 │
│    ┌─────────────────┐  1:N ┌─────────────────┐                                  │
│    │ CASH_TRANSFER   │──────│ CASH_TRANSFER  │                                  │
│    └─────────────────┘       └─────────────────┘                                  │
│            │                            │                                         │
│            │ N:1                        │ N:1                                    │
│            ▼                            ▼                                         │
│       ┌──────────┐                ┌──────────┐                                 │
│       │  ACCOUNT │ (FROM)         │  ACCOUNT │ (TO)                            │
│       └──────────┘                └──────────┘                                 │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────────────┐
│                         HRM ENTITIES                                           │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│    ┌──────────┐  1:N ┌──────────┐  N:1 ┌──────────┐                          │
│    │DEPARTMENT│──────│EMPLOYEE │──────│ POSITION │                          │
│    └──────────┘       └──────────┘       └──────────┘                          │
│                              │                                                 │
│                              │ 1:N                                              │
│                              ▼                                                 │
│                       ┌──────────┐                                            │
│                       │ATTENDANCE│                                            │
│                       └──────────┘                                            │
│                              │                                                 │
│                              │ 1:N                                              │
│                              ▼                                                 │
│                       ┌──────────┐                                            │
│                       │ PAYROLL  │                                            │
│                       └──────────┘                                            │
│                                                                                 │
│    ┌──────────┐  1:N ┌──────────┐  N:1 ┌──────────┐                          │
│    │EMPLOYEE  │──────│   LOAN   │──────│ LOAN_INS │                          │
│    └──────────┘       └──────────┘       └──────────┘                          │
│                              │                                                 │
│                              │ 1:N                                              │
│                              ▼                                                 │
│                       ┌──────────┐                                            │
│                       │  LEAVE   │                                            │
│                       └──────────┘                                            │
│                              │                                                 │
│                              │ 1:1                                              │
│                              ▼                                                 │
│                       ┌──────────┐                                            │
│                       │LEAVE_BAL │                                            │
│                       └──────────┘                                            │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────────────┐
│                         REPORTING ENTITIES                                      │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│    ┌────────────────────┐                                                       │
│    │DAILY_SALES_SUMMARY│                                                       │
│    └────────────────────┘                                                       │
│              │                                                                  │
│              │ Aggregates into                                                  │
│              ▼                                                                  │
│    ┌──────────────────────┐                                                    │
│    │MONTHLY_SALES_SUMMARY │                                                    │
│    └──────────────────────┘                                                    │
│                                                                                 │
│    ┌────────────────────┐                                                       │
│    │  ACTIVITY_LOG      │                                                       │
│    └────────────────────┘                                                       │
│              │                                                                  │
│              │ Tracks                                                           │
│              ▼                                                                  │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                        │
│    │    SALE      │  │   PURCHASE   │  │  STOCK_IN   │                        │
│    └──────────────┘  └──────────────┘  └──────────────┘                        │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

# APPENDIX G - API REQUEST/RESPONSE EXAMPLES

## G.1 Authentication

### Login
```bash
# Request
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@1234"
}

# Response (200 OK)
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "admin",
      "name": "Administrator",
      "role": "admin",
      "companyId": 1
    }
  }
}
```

### Register
```bash
# Request
POST /api/auth/register
Content-Type: application/json

{
  "username": "kasir01",
  "email": "kasir01@tokoku.com",
  "password": "Kasir@1234",
  "name": "Kasir Satu",
  "companyId": 1,
  "role": "cashier"
}

# Response (201 Created)
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "username": "kasir01",
    "email": "kasir01@tokoku.com",
    "name": "Kasir Satu",
    "role": "cashier",
    "companyId": 1,
    "isActive": true,
    "createdAt": "2026-09-16T10:00:00Z"
  }
}
```

## G.2 Products

### Create Product
```bash
# Request
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

# Response (201 Created)
{
  "success": true,
  "data": {
    "id": 1,
    "code": "ELEC-SAM-001",
    "barcode": "8901234567890",
    "name": "Samsung LED TV 43 Inch",
    "category": {
      "id": 1,
      "name": "Elektronik"
    },
    "brand": {
      "id": 1,
      "name": "Samsung"
    },
    "unit": {
      "id": 1,
      "name": "Piece",
      "abbreviation": "pcs"
    },
    "warehouse": {
      "id": 1,
      "name": "Gudang Utama"
    },
    "purchasePrice": 3500000,
    "sellingPrice": 4200000,
    "stock": 0,
    "minimumStock": 5,
    "isActive": true,
    "createdAt": "2026-09-16T10:30:00Z"
  }
}
```

### List Products with OData
```bash
# Request
GET /api/products?$select=id,code,name,sellingPrice,stock,minimumStock&$filter=categoryId eq 1 and stock gt 0&$orderBy=sellingPrice desc&$top=10&$count=true
Authorization: Bearer <token>

# Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": 5,
      "code": "ELEC-SAM-005",
      "name": "Samsung LED TV 55 Inch",
      "sellingPrice": 8500000,
      "stock": 10,
      "minimumStock": 3
    },
    {
      "id": 3,
      "code": "ELEC-SAM-003",
      "name": "Samsung LED TV 50 Inch",
      "sellingPrice": 6500000,
      "stock": 8,
      "minimumStock": 3
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

### Get Product by Barcode
```bash
# Request
GET /api/products/barcode/8901234567890
Authorization: Bearer <token>

# Response (200 OK)
{
  "success": true,
  "data": {
    "id": 1,
    "code": "ELEC-SAM-001",
    "barcode": "8901234567890",
    "name": "Samsung LED TV 43 Inch",
    "purchasePrice": 3500000,
    "sellingPrice": 4200000,
    "stock": 25,
    "category": { "id": 1, "name": "Elektronik" },
    "brand": { "id": 1, "name": "Samsung" }
  }
}
```

## G.3 Sales

### Create Sale
```bash
# Request
POST /api/sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": 1,
  "salesPersonId": 1,
  "warehouseId": 1,
  "discountPercent": 5,
  "taxPercent": 11,
  "paymentMethod": "CASH",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 4200000,
      "discountPercent": 0
    },
    {
      "productId": 5,
      "quantity": 1,
      "unitPrice": 8500000,
      "discountPercent": 10
    }
  ]
}

# Response (201 Created)
{
  "success": true,
  "data": {
    "id": 1,
    "code": "INV-0001/2026",
    "date": "2026-09-16T11:00:00Z",
    "customer": {
      "id": 1,
      "name": "Budi Santoso"
    },
    "subtotal": 16050000,
    "discountPercent": 5,
    "discountAmount": 802500,
    "taxPercent": 11,
    "taxAmount": 1676475,
    "total": 16908975,
    "paymentStatus": "PENDING",
    "paymentMethod": "CASH",
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "Samsung LED TV 43 Inch"
        },
        "quantity": 2,
        "unitPrice": 4200000,
        "subtotal": 8400000
      },
      {
        "id": 2,
        "product": {
          "id": 5,
          "name": "Samsung LED TV 55 Inch"
        },
        "quantity": 1,
        "unitPrice": 8500000,
        "discountPercent": 10,
        "discountAmount": 850000,
        "subtotal": 7650000
      }
    ],
    "createdAt": "2026-09-16T11:00:00Z"
  }
}
```

### Process Payment
```bash
# Request
POST /api/sales/1/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "method": "CASH",
  "amount": 17000000
}

# Response (200 OK)
{
  "success": true,
  "data": {
    "payment": {
      "id": 1,
      "saleId": 1,
      "method": "CASH",
      "amount": 17000000,
      "date": "2026-09-16T11:05:00Z"
    },
    "paymentStatus": "PAID",
    "changeAmount": 91025
  }
}
```

## G.4 Purchases

### Create Purchase
```bash
# Request
POST /api/purchases
Authorization: Bearer <token>
Content-Type: application/json

{
  "supplierId": 1,
  "warehouseId": 1,
  "paymentMethod": "TRANSFER",
  "dueDate": "2026-10-16",
  "items": [
    {
      "productId": 1,
      "quantity": 10,
      "unitId": 1,
      "unitPrice": 3500000
    },
    {
      "productId": 5,
      "quantity": 5,
      "unitId": 1,
      "unitPrice": 8000000
    }
  ]
}

# Response (201 Created)
{
  "success": true,
  "data": {
    "id": 1,
    "code": "PO-0001/2026",
    "supplier": {
      "id": 1,
      "name": "PT Elektronik Indonesia"
    },
    "total": 75000000,
    "paid": 0,
    "remaining": 75000000,
    "paymentStatus": "PENDING",
    "dueDate": "2026-10-16",
    "status": "DRAFT"
  }
}
```

## G.5 Stock Operations

### Create Stock In
```bash
# Request
POST /api/stock-ins
Authorization: Bearer <token>
Content-Type: application/json

{
  "warehouseId": 1,
  "referenceType": "PURCHASE",
  "referenceId": 1,
  "description": "Barang datang dari PO-0001/2026",
  "items": [
    {
      "productId": 1,
      "quantity": 10,
      "unitId": 1,
      "unitPrice": 3500000
    }
  ]
}

# Response (201 Created)
{
  "success": true,
  "data": {
    "id": 1,
    "code": "SI-0001/2026",
    "warehouse": {
      "id": 1,
      "name": "Gudang Utama"
    },
    "status": "DRAFT",
    "items": [
      {
        "product": {
          "id": 1,
          "name": "Samsung LED TV 43 Inch"
        },
        "quantity": 10,
        "unitPrice": 3500000
      }
    ]
  }
}
```

### Approve Stock In
```bash
# Request
POST /api/stock-ins/1/approve
Authorization: Bearer <token>

# Response (200 OK)
{
  "success": true,
  "data": {
    "id": 1,
    "code": "SI-0001/2026",
    "status": "COMPLETED",
    "productStockUpdated": [
      {
        "productId": 1,
        "previousStock": 0,
        "newStock": 10
      }
    ]
  }
}
```

### Create Stock Transfer
```bash
# Request
POST /api/stock-transfers
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromWarehouseId": 1,
  "toWarehouseId": 2,
  "items": [
    {
      "productId": 1,
      "quantity": 5,
      "unitId": 1
    }
  ]
}

# Response (201 Created)
{
  "success": true,
  "data": {
    "id": 1,
    "code": "TRF-0001/2026",
    "fromWarehouse": { "id": 1, "name": "Gudang Utama" },
    "toWarehouse": { "id": 2, "name": "Gudang Cab Bandung" },
    "status": "DRAFT"
  }
}
```

## G.6 Employees & Attendance

### Record Attendance
```bash
# Request
POST /api/attendances
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": 1,
  "date": "2026-09-16",
  "checkIn": "2026-09-16T08:45:00Z",
  "checkOut": "2026-09-16T17:30:00Z",
  "status": "LATE"
}

# Response (201 Created)
{
  "success": true,
  "data": {
    "id": 1,
    "employee": {
      "id": 1,
      "name": "Andi Wijaya"
    },
    "date": "2026-09-16",
    "checkIn": "2026-09-16T08:45:00Z",
    "checkOut": "2026-09-16T17:30:00Z",
    "status": "LATE"
  }
}
```

### Create Leave Request
```bash
# Request
POST /api/leaves
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": 1,
  "type": "ANNUAL",
  "startDate": "2026-09-20",
  "endDate": "2026-09-24",
  "reason": "Liburan keluarga"
}

# Response (201 Created)
{
  "success": true,
  "data": {
    "id": 1,
    "code": "LV-0001/2026",
    "employee": {
      "id": 1,
      "name": "Andi Wijaya"
    },
    "type": "ANNUAL",
    "startDate": "2026-09-20",
    "endDate": "2026-09-24",
    "totalDays": 5,
    "status": "PENDING"
  }
}
```

## G.7 Reports

### Get Sales Report
```bash
# Request
GET /api/reports/sales?startDate=2026-09-01&endDate=2026-09-30
Authorization: Bearer <token>

# Response (200 OK)
{
  "success": true,
  "data": {
    "summary": {
      "totalTransactions": 150,
      "totalRevenue": 150000000,
      "totalProfit": 45000000,
      "averageTransaction": 1000000
    },
    "byProduct": [
      {
        "productId": 1,
        "productName": "Samsung LED TV 43 Inch",
        "quantitySold": 25,
        "totalRevenue": 105000000
      }
    ],
    "byCustomer": [
      {
        "customerId": 1,
        "customerName": "Budi Santoso",
        "totalTransactions": 10,
        "totalRevenue": 50000000
      }
    ],
    "byDate": [
      {
        "date": "2026-09-01",
        "transactions": 5,
        "revenue": 5000000
      }
    ]
  }
}
```

### Get Inventory Report
```bash
# Request
GET /api/reports/inventory?warehouseId=1
Authorization: Bearer <token>

# Response (200 OK)
{
  "success": true,
  "data": {
    "totalProducts": 100,
    "totalStock": 5000,
    "totalValue": 500000000,
    "lowStock": [
      {
        "productId": 5,
        "productName": "Samsung LED TV 55 Inch",
        "currentStock": 3,
        "minimumStock": 5
      }
    ],
    "outOfStock": [
      {
        "productId": 10,
        "productName": "LG Refrigerator",
        "currentStock": 0,
        "minimumStock": 2
      }
    ],
    "byCategory": [
      {
        "categoryId": 1,
        "categoryName": "Elektronik",
        "productCount": 50,
        "totalStock": 2000,
        "totalValue": 300000000
      }
    ]
  }
}
```

## G.8 Dashboard Data
```bash
# Request
GET /api/dashboard
Authorization: Bearer <token>

# Response (200 OK)
{
  "success": true,
  "data": {
    "todaySales": {
      "count": 15,
      "total": 15000000
    },
    "todayPurchases": {
      "count": 2,
      "total": 50000000
    },
    "alerts": {
      "lowStock": 5,
      "pendingLeaves": 3
    },
    "topProducts": [
      {
        "productId": 1,
        "productName": "Samsung LED TV 43 Inch",
        "quantitySold": 3,
        "revenue": 12600000
      }
    ],
    "recentSales": [
      {
        "id": 150,
        "code": "INV-0150/2026",
        "customer": { "name": "Budi Santoso" },
        "total": 8400000,
        "createdAt": "2026-09-16T10:45:00Z"
      }
    ]
  }
}
```

---

# APPENDIX H - ERROR CODES REFERENCE

## H.1 Authentication Errors (AUTH)

| Code | HTTP Status | Message |
|------|-------------|---------|
| AUTH001 | 401 | Invalid credentials |
| AUTH002 | 403 | Account is disabled |
| AUTH003 | 401 | Token expired |
| AUTH004 | 401 | Token invalid |
| AUTH005 | 409 | Username already exists |
| AUTH006 | 409 | Email already exists |
| AUTH007 | 404 | Company not found |
| AUTH008 | 400 | Invalid password format |
| AUTH009 | 401 | Refresh token expired |
| AUTH010 | 401 | Refresh token invalid |

## H.2 Inventory Errors (INV)

| Code | HTTP Status | Message |
|------|-------------|---------|
| INV001 | 400 | Insufficient stock |
| INV002 | 404 | Product not found |
| INV003 | 404 | Warehouse not found |
| INV004 | 400 | Stock cannot be negative |
| INV005 | 400 | Invalid stock adjustment |
| INV006 | 409 | Duplicate product code |
| INV007 | 409 | Duplicate barcode |
| INV008 | 400 | Cannot delete product with transactions |
| INV009 | 400 | Cannot delete warehouse with stock |
| INV010 | 400 | Cannot transfer to same warehouse |

## H.3 Sales Errors (SALE)

| Code | HTTP Status | Message |
|------|-------------|---------|
| SALE001 | 404 | Sale not found |
| SALE002 | 400 | Invalid sale status |
| SALE003 | 400 | Cannot modify completed sale |
| SALE004 | 400 | Cannot cancel sale with payments |
| SALE005 | 400 | Payment exceeds remaining amount |
| SALE006 | 400 | Invalid return quantity |
| SALE007 | 400 | Return exceeds original sale |
| SALE008 | 404 | Customer not found |
| SALE009 | 400 | Cannot return after 30 days |

## H.4 Purchase Errors (PUR)

| Code | HTTP Status | Message |
|------|-------------|---------|
| PUR001 | 404 | Purchase not found |
| PUR002 | 404 | Supplier not found |
| PUR003 | 400 | Invalid purchase status |
| PUR004 | 400 | Cannot modify completed purchase |
| PUR005 | 400 | Payment exceeds remaining amount |
| PUR006 | 400 | Invalid return quantity |

## H.5 Accounting Errors (ACC)

| Code | HTTP Status | Message |
|------|-------------|---------|
| ACC001 | 400 | Journal entries not balanced |
| ACC002 | 404 | Account not found |
| ACC003 | 400 | Cannot delete account with entries |
| ACC004 | 400 | Invalid account type |
| ACC005 | 400 | Cannot modify posted journal |

## H.6 HRM Errors (HRM)

| Code | HTTP Status | Message |
|------|-------------|---------|
| HRM001 | 404 | Employee not found |
| HRM002 | 400 | Insufficient leave balance |
| HRM003 | 400 | Leave request overlaps |
| HRM004 | 400 | Cannot cancel approved leave |
| HRM005 | 400 | Loan amount exceeds limit |
| HRM006 | 400 | Cannot approve own request |
| HRM007 | 400 | Duplicate attendance record |

## H.7 General Errors (GEN)

| Code | HTTP Status | Message |
|------|-------------|---------|
| GEN001 | 400 | Validation error |
| GEN002 | 404 | Resource not found |
| GEN003 | 409 | Duplicate entry |
| GEN004 | 403 | Access denied |
| GEN005 | 429 | Rate limit exceeded |
| GEN006 | 500 | Internal server error |
| GEN007 | 503 | Service unavailable |
| GEN008 | 400 | Invalid date range |

---

# APPENDIX I - VALIDATION RULES

## I.1 Field Validations

### User Fields
```typescript
const userValidation = {
  username: {
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username must be 3-100 characters, alphanumeric with underscores only'
  },
  email: {
    type: 'string',
    format: 'email',
    maxLength: 255,
    message: 'Invalid email format'
  },
  password: {
    required: true,
    type: 'string',
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  },
  name: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 255,
    message: 'Name is required, max 255 characters'
  }
};
```

### Product Fields
```typescript
const productValidation = {
  code: {
    required: true,
    type: 'string',
    maxLength: 50,
    unique: true,
    message: 'Product code is required, max 50 characters, must be unique'
  },
  barcode: {
    type: 'string',
    maxLength: 100,
    unique: true,
    pattern: /^[0-9]+$/,
    message: 'Barcode must be numeric, max 100 characters'
  },
  name: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 255,
    message: 'Product name is required, max 255 characters'
  },
  unitId: {
    required: true,
    type: 'number',
    exists: 'units',
    message: 'Unit is required and must exist'
  },
  purchasePrice: {
    required: true,
    type: 'number',
    min: 0,
    message: 'Purchase price must be 0 or greater'
  },
  sellingPrice: {
    required: true,
    type: 'number',
    min: 0,
    custom: (value, formData) => {
      if (value < formData.purchasePrice) {
        return 'Selling price cannot be less than purchase price';
      }
    },
    message: 'Selling price must be 0 or greater'
  },
  stock: {
    type: 'number',
    min: 0,
    message: 'Stock cannot be negative'
  },
  minimumStock: {
    type: 'number',
    min: 0,
    message: 'Minimum stock cannot be negative'
  }
};
```

### Transaction Fields
```typescript
const transactionValidation = {
  date: {
    type: 'date',
    max: 'today',
    message: 'Transaction date cannot be in the future'
  },
  amount: {
    required: true,
    type: 'number',
    min: 0,
    message: 'Amount must be 0 or greater'
  },
  items: {
    required: true,
    type: 'array',
    minLength: 1,
    message: 'At least one item is required'
  },
  'items.*.quantity': {
    required: true,
    type: 'number',
    min: 0.001,
    message: 'Quantity must be greater than 0'
  },
  'items.*.unitPrice': {
    required: true,
    type: 'number',
    min: 0,
    message: 'Unit price must be 0 or greater'
  }
};
```

---

# APPENDIX J - CACHING STRATEGIES

## J.1 Redis Cache Keys

### Cache Key Patterns
```typescript
const cacheKeys = {
  // Product caching
  product: 'product:{id}',
  productList: 'products:list:{hash}',
  productByBarcode: 'product:barcode:{barcode}',
  
  // Category caching
  category: 'category:{id}',
  categoryList: 'categories:all',
  
  // Stock caching
  stock: 'stock:{productId}:{warehouseId}',
  lowStock: 'stocks:low:{warehouseId}',
  
  // Customer caching
  customer: 'customer:{id}',
  customerBalance: 'customer:{id}:balance',
  
  // Report caching
  salesReport: 'report:sales:{startDate}:{endDate}',
  inventoryReport: 'report:inventory:{warehouseId}',
  
  // Dashboard caching
  dashboard: 'dashboard:{userId}',
  
  // User session
  session: 'session:{userId}',
  token: 'token:{tokenId}'
};
```

### Cache TTL Configuration
```typescript
const cacheTTL = {
  // Short TTL - frequently changing
  stock: 60,                    // 1 minute
  dashboard: 60,                // 1 minute
  salesReport: 300,              // 5 minutes
  
  // Medium TTL - moderately changing
  product: 3600,                // 1 hour
  productList: 1800,            // 30 minutes
  customer: 1800,              // 30 minutes
  
  // Long TTL - rarely changing
  category: 86400,              // 24 hours
  report: 3600,                 // 1 hour
  
  // Session - very short
  session: 900,                 // 15 minutes
  token: 86400                   // 24 hours
};
```

## J.2 Cache Invalidation Rules

```typescript
// When product is updated
invalidatePattern('product:*');
invalidatePattern('products:list:*');
invalidatePattern('report:inventory:*');
invalidatePattern('dashboard:*');

// When stock changes
invalidatePattern('stock:*');
invalidatePattern('stocks:low:*');
invalidatePattern('report:inventory:*');

// When sale is created/updated
invalidatePattern('dashboard:*');
invalidatePattern('report:sales:*');
invalidatePattern('customer:*:balance');

// When customer is updated
invalidatePattern('customer:{id}');
invalidatePattern('customer:{id}:balance');
```

---

# APPENDIX K - RATE LIMITING CONFIGURATION

## K.1 Throttler Configuration
```typescript
// Rate limit tiers
const throttlerConfig = [
  { name: 'short', ttl: 1000, limit: 10 },   // 10 requests/second
  { name: 'medium', ttl: 10000, limit: 50 }, // 50 requests/10 seconds
  { name: 'long', ttl: 60000, limit: 200 }   // 200 requests/minute
];

// Endpoint-specific limits
const endpointLimits = {
  // Auth endpoints - stricter limits
  'POST /auth/login': { name: 'short', limit: 5 },
  'POST /auth/register': { name: 'short', limit: 3 },
  
  // Read endpoints - relaxed limits
  'GET /products': { name: 'long', limit: 500 },
  'GET /sales': { name: 'long', limit: 300 },
  
  // Write endpoints - medium limits
  'POST /sales': { name: 'medium', limit: 30 },
  'POST /purchases': { name: 'medium', limit: 30 },
  
  // Report endpoints - strict limits
  'GET /reports/*': { name: 'medium', limit: 10 }
};
```

---

# APPENDIX L - AUDIT TRAIL SPECIFICATIONS

## L.1 Trackable Events

### Authentication Events
```typescript
const authAuditEvents = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'LOGOUT',
  'PASSWORD_CHANGED',
  'PASSWORD_RESET_REQUESTED',
  'PASSWORD_RESET_COMPLETED',
  'SESSION_EXPIRED'
];
```

### Transaction Events
```typescript
const transactionAuditEvents = [
  'SALE_CREATED',
  'SALE_UPDATED',
  'SALE_CANCELLED',
  'SALE_PAID',
  'SALE_RETURNED',
  'PURCHASE_CREATED',
  'PURCHASE_APPROVED',
  'PURCHASE_PAID',
  'STOCK_IN_CREATED',
  'STOCK_IN_APPROVED',
  'STOCK_OUT_CREATED',
  'STOCK_TRANSFER_CREATED',
  'STOCK_TRANSFER_APPROVED',
  'STOCK_OPNAME_COMPLETED'
];
```

### Master Data Events
```typescript
const masterDataAuditEvents = [
  'PRODUCT_CREATED',
  'PRODUCT_UPDATED',
  'PRODUCT_DELETED',
  'PRODUCT_PRICE_CHANGED',
  'CUSTOMER_CREATED',
  'CUSTOMER_UPDATED',
  'SUPPLIER_CREATED',
  'SUPPLIER_UPDATED',
  'WAREHOUSE_CREATED',
  'WAREHOUSE_UPDATED'
];
```

### HRM Events
```typescript
const hrmAuditEvents = [
  'EMPLOYEE_CREATED',
  'EMPLOYEE_UPDATED',
  'EMPLOYEE_TERMINATED',
  'ATTENDANCE_RECORDED',
  'LEAVE_REQUESTED',
  'LEAVE_APPROVED',
  'LEAVE_REJECTED',
  'LOAN_REQUESTED',
  'LOAN_APPROVED',
  'PAYROLL_PROCESSED'
];
```

## L.2 Audit Log Format
```typescript
interface AuditLog {
  id: string;
  event: string;
  userId: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  metadata?: any;
  timestamp: Date;
}
```

---

# APPENDIX M - SECURITY CHECKLIST

## M.1 Authentication Security
- [ ] Password hashing with bcrypt (min 10 rounds)
- [ ] JWT tokens with short expiration (15 min)
- [ ] Refresh tokens with longer expiration (7 days)
- [ ] Secure token storage (httpOnly cookies)
- [ ] Password complexity requirements
- [ ] Account lockout after failed attempts
- [ ] Session timeout

## M.2 Authorization Security
- [ ] Role-based access control (RBAC)
- [ ] Resource-level authorization
- [ ] Company data isolation
- [ ] Audit logging of access attempts
- [ ] Principle of least privilege

## M.3 Input Validation
- [ ] Request body validation
- [ ] SQL injection prevention (Prisma handles)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Input sanitization

## M.4 Data Protection
- [ ] Encryption at rest
- [ ] Encryption in transit (HTTPS)
- [ ] Sensitive data masking
- [ ] Backup procedures
- [ ] Data retention policies

## M.5 API Security
- [ ] CORS configuration
- [ ] API versioning
- [ ] Deprecation warnings
- [ ] Error message sanitization
- [ ] Response size limits

---

# APPENDIX N - TESTING STRATEGIES

## N.1 Unit Testing

### Service Layer Tests
```typescript
describe('SaleService', () => {
  describe('createSale', () => {
    it('should create a sale with valid data', async () => {
      const saleData = {
        customerId: 1,
        warehouseId: 1,
        items: [
          { productId: 1, quantity: 2, unitPrice: 1000 }
        ]
      };
      
      const result = await saleService.createSale(saleData);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.code).toBe('INV-0001/2026');
      expect(result.total).toBe(2000);
    });
    
    it('should throw error if stock is insufficient', async () => {
      const saleData = {
        customerId: 1,
        warehouseId: 1,
        items: [
          { productId: 1, quantity: 100, unitPrice: 1000 }
        ]
      };
      
      await expect(saleService.createSale(saleData))
        .rejects.toThrow('Insufficient stock');
    });
    
    it('should calculate discount correctly', async () => {
      const saleData = {
        customerId: 1,
        warehouseId: 1,
        discountPercent: 10,
        items: [
          { productId: 1, quantity: 1, unitPrice: 1000 }
        ]
      };
      
      const result = await saleService.createSale(saleData);
      
      expect(result.subtotal).toBe(1000);
      expect(result.discountAmount).toBe(100);
      expect(result.total).toBe(900);
    });
  });
});
```

### Repository Tests
```typescript
describe('ProductRepository', () => {
  describe('findByBarcode', () => {
    it('should return product for valid barcode', async () => {
      const barcode = '8901234567890';
      const result = await productRepo.findByBarcode(barcode);
      
      expect(result).toBeDefined();
      expect(result.barcode).toBe(barcode);
    });
    
    it('should return null for invalid barcode', async () => {
      const result = await productRepo.findByBarcode('invalid');
      expect(result).toBeNull();
    });
  });
});
```

## N.2 Integration Testing

### API Integration Tests
```typescript
describe('Products API', () => {
  let app: INestApplication;
  let authToken: string;
  
  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    await app.init();
    
    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    
    authToken = loginRes.body.data.accessToken;
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  describe('GET /api/products', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/products');
      
      expect(res.status).toBe(401);
    });
    
    it('should return products with auth token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
    
    it('should support OData filtering', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/products?$filter=stock gt 0')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      res.body.data.forEach(product => {
        expect(product.stock).toBeGreaterThan(0);
      });
    });
  });
});
```

## N.3 E2E Testing

### Complete Transaction Flow
```typescript
describe('Complete Sale Flow', () => {
  it('should complete a full sale transaction', async () => {
    // 1. Create customer
    const customer = await request(app.getHttpServer())
      .post('/api/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Customer', code: 'CUST-TEST' });
    
    expect(customer.status).toBe(201);
    const customerId = customer.body.data.id;
    
    // 2. Create product
    const product = await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        code: 'TEST-001',
        name: 'Test Product',
        unitId: 1,
        purchasePrice: 1000,
        sellingPrice: 1500,
        stock: 100
      });
    
    expect(product.status).toBe(201);
    
    // 3. Create sale
    const sale = await request(app.getHttpServer())
      .post('/api/sales')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerId,
        warehouseId: 1,
        items: [{ productId: product.body.data.id, quantity: 2, unitPrice: 1500 }]
      });
    
    expect(sale.status).toBe(201);
    expect(sale.body.data.paymentStatus).toBe('PENDING');
    
    // 4. Process payment
    const payment = await request(app.getHttpServer())
      .post(`/api/sales/${sale.body.data.id}/payment`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ method: 'CASH', amount: 3000 });
    
    expect(payment.status).toBe(200);
    expect(payment.body.data.paymentStatus).toBe('PAID');
    
    // 5. Verify stock reduced
    const updatedProduct = await request(app.getHttpServer())
      .get(`/api/products/${product.body.data.id}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(updatedProduct.body.data.stock).toBe(98);
  });
});
```

---

# APPENDIX O - DEPLOYMENT CONFIGURATION

## O.1 Docker Configuration

### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/toko
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped
    
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=toko
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3000;
    }
    
    server {
        listen 80;
        server_name api.toko.com;
        
        location / {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_cache_bypass $http_upgrade;
        }
        
        location /health {
            proxy_pass http://api;
            access_log off;
        }
    }
}
```

## O.2 Environment Variables

### .env.example
```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/toko
DATABASE_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-key-here-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_TTL=1000
RATE_LIMIT_LIMIT=10

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# File Upload
UPLOAD_MAX_SIZE=5mb
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif

# Company
DEFAULT_COMPANY_ID=1
```

### .env.production
```env
NODE_ENV=production
PORT=3000
API_PREFIX=api

DATABASE_URL=postgresql://user:password@prod-db:5432/toko?sslmode=require
DATABASE_SSL=true

REDIS_URL=redis://:password@prod-redis:6379

JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_TTL=1000
RATE_LIMIT_LIMIT=5

LOG_LEVEL=warn
LOG_FORMAT=json
```

---

# APPENDIX P - MAINTENANCE & MONITORING

## P.1 Health Check Implementation

### Application Health Indicator
```typescript
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, false, { message: error.message })
      );
    }
  }
}
```

### Health Controller
```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthService,
    private db: DatabaseHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}
  
  @Get()
  @SkipThrottle()
  async check() {
    return this.health.check([
      () => this.db.isHealthy('database'),
      () => this.redis.isHealthy('redis'),
    ]);
  }
  
  @Get('live')
  @SkipThrottle()
  liveness() {
    return { status: 'ok' };
  }
  
  @Get('ready')
  @SkipThrottle()
  async readiness() {
    return this.health.check([
      () => this.db.isHealthy('database'),
    ]);
  }
}
```

## P.2 Logging Configuration

### Winston Logger
```typescript
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = {
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('TokoAPI', {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
      ],
    }),
  ],
};
```

## P.3 Metrics (Prometheus)

### Metrics Service
```typescript
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal: Counter;
  private readonly httpRequestDuration: Histogram;
  private readonly activeConnections: Gauge;
  
  constructor() {
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
    });
    
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
    });
    
    this.activeConnections = new Gauge({
      name: 'http_active_connections',
      help: 'Number of active HTTP connections',
    });
  }
  
  incrementRequest(method: string, path: string, status: number) {
    this.httpRequestsTotal.inc({ method, path, status });
  }
  
  observeDuration(method: string, path: string, duration: number) {
    this.httpRequestDuration.observe({ method, path }, duration);
  }
}
```

---

# APPENDIX Q - DATA MIGRATION GUIDE

## Q.1 Migration Scripts

### Example: Migrate Old Product Data
```typescript
// scripts/migrate-products.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateProducts() {
  console.log('Starting product migration...');
  
  // Get old products
  const oldProducts = await oldDb.query('SELECT * FROM products');
  
  for (const oldProduct of oldProducts) {
    // Transform data
    const newProduct = {
      code: oldProduct.prod_code,
      name: oldProduct.prod_name,
      barcode: oldProduct.barcode || null,
      categoryId: oldProduct.cat_id,
      brandId: oldProduct.brand_id || null,
      unitId: 1, // Default unit
      purchasePrice: oldProduct.harga_beli,
      sellingPrice: oldProduct.harga_jual,
      stock: oldProduct.stock || 0,
      minimumStock: oldProduct.min_stock || 0,
      isActive: oldProduct.active === 1,
    };
    
    // Insert new data
    await prisma.product.create({ data: newProduct });
    
    console.log(`Migrated product: ${oldProduct.prod_name}`);
  }
  
  console.log('Migration completed!');
}

migrateProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Data Validation After Migration
```typescript
async function validateMigration() {
  // Check for duplicate codes
  const duplicates = await prisma.$queryRaw`
    SELECT code, COUNT(*) as count 
    FROM products 
    GROUP BY code 
    HAVING COUNT(*) > 1
  `;
  
  if (duplicates.length > 0) {
    console.error('Found duplicate product codes:', duplicates);
    process.exit(1);
  }
  
  // Check for orphaned foreign keys
  const orphanedProducts = await prisma.$queryRaw`
    SELECT p.id, p.categoryId 
    FROM products p 
    LEFT JOIN categories c ON p.categoryId = c.id 
    WHERE p.categoryId IS NOT NULL AND c.id IS NULL
  `;
  
  if (orphanedProducts.length > 0) {
    console.error('Found products with invalid category:', orphanedProducts);
    process.exit(1);
  }
  
  console.log('All validation checks passed!');
}
```

---

# APPENDIX R - PERFORMANCE OPTIMIZATION

## R.1 Database Optimization

### Indexes
```sql
-- Composite indexes for common queries
CREATE INDEX idx_sales_customer_date ON sales(customer_id, date DESC);
CREATE INDEX idx_sales_date ON sales(date DESC);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_stock ON products(stock) WHERE stock > 0;

-- Partial indexes for active records
CREATE INDEX idx_products_active ON products(code) WHERE is_active = true;
CREATE INDEX idx_customers_active ON customers(code) WHERE is_active = true;

-- Index for full-text search
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('indonesian', name));
```

### Query Optimization
```typescript
// Bad: N+1 query
const sales = await prisma.sale.findMany();
for (const sale of sales) {
  sale.customer = await prisma.customer.findUnique({ where: { id: sale.customerId } });
}

// Good: Use include
const sales = await prisma.sale.findMany({
  include: { customer: true, items: { include: { product: true } } }
});

// Good: Use select for specific fields
const salesSummary = await prisma.sale.findMany({
  select: {
    id: true,
    code: true,
    total: true,
    date: true,
    customer: { select: { name: true } }
  }
});
```

## R.2 Caching Strategy

### Application-Level Cache
```typescript
@Injectable()
export class ProductService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  
  async findByBarcode(barcode: string) {
    const cacheKey = `product:barcode:${barcode}`;
    
    // Try cache first
    const cached = await this.cacheManager.get<Product>(cacheKey);
    if (cached) return cached;
    
    // Fetch from database
    const product = await this.prisma.product.findUnique({
      where: { barcode },
      include: { category: true, brand: true }
    });
    
    // Store in cache
    if (product) {
      await this.cacheManager.set(cacheKey, product, { ttl: 3600 });
    }
    
    return product;
  }
  
  async update(id: number, data: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data
    });
    
    // Invalidate cache
    await this.cacheManager.del(`product:${id}`);
    await this.cacheManager.del(`product:barcode:${product.barcode}`);
    
    return product;
  }
}
```

---

# APPENDIX S - TROUBLESHOOTING GUIDE

## S.1 Common Issues

### Database Connection Issues
```
Problem: Cannot connect to database
Solution:
1. Check DATABASE_URL in .env
2. Verify PostgreSQL is running
3. Check firewall rules
4. Verify credentials
5. Check SSL settings
```

### JWT Token Issues
```
Problem: Token expired or invalid
Solution:
1. Check JWT_SECRET matches
2. Verify token hasn't been tampered
3. Check token expiration settings
4. Ensure server time is correct
```

### Stock Discrepancy
```
Problem: Stock count doesn't match
Solution:
1. Run stock reconciliation report
2. Check for unapproved transactions
3. Verify stock opname hasn't been processed
4. Check for concurrent transaction issues
```

### Performance Issues
```
Problem: API responses are slow
Solution:
1. Check database indexes
2. Analyze slow queries
3. Enable query logging
4. Check Redis cache hit rate
5. Review server resources
```

## S.2 Debug Mode

### Enable Debug Logging
```typescript
// main.ts
app.useLogger(['error', 'warn', 'log', 'debug', 'verbose']);
```

### Query Logging
```typescript
// prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
    
    this.$on('query' as any, (e: any) => {
      console.log('Query:', e.query);
      console.log('Params:', e.params);
      console.log('Duration:', e.duration, 'ms');
    });
  }
}
```

---

# APPENDIX T - BACKUP & RECOVERY

## T.1 Backup Strategy

### Database Backup
```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups/postgres
RETENTION_DAYS=30

# Create backup
pg_dump -Fc -f "$BACKUP_DIR/toko_$DATE.dump" -d $DATABASE_URL

# Upload to S3
aws s3 cp "$BACKUP_DIR/toko_$DATE.dump" s3://backups/toko/

# Cleanup old backups
find $BACKUP_DIR -name "*.dump" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: toko_$DATE.dump"
```

### File Backup
```bash
#!/bin/bash
# backup-files.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups/files

tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /app/uploads

aws s3 cp "$BACKUP_DIR/uploads_$DATE.tar.gz" s3://backups/toko/files/
```

## T.2 Recovery Procedure

### Restore Database
```bash
#!/bin/bash
# restore-db.sh

BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

# Drop existing database
psql -c "DROP DATABASE IF EXISTS toko;"

# Create fresh database
psql -c "CREATE DATABASE toko;"

# Restore backup
pg_restore -Fc -d $DATABASE_URL $BACKUP_FILE

echo "Database restored from: $BACKUP_FILE"
```

---

# APPENDIX U - COMPLIANCE & GOVERNANCE

## U.1 Data Privacy

### GDPR Compliance
- [ ] Right to access - users can request their data
- [ ] Right to rectification - users can update their data
- [ ] Right to erasure - users can request deletion
- [ ] Data portability - export data in JSON format
- [ ] Data retention policy - automatic cleanup old data

### Data Retention
```typescript
// Data retention service
@Injectable()
export class DataRetentionService {
  async cleanupOldData() {
    // Delete logs older than 90 days
    await this.prisma.log.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
      }
    });
    
    // Delete activity logs older than 180 days
    await this.prisma.activityLog.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
      }
    });
    
    console.log('Old data cleanup completed');
  }
}
```

## U.2 Audit Requirements

### Audit Report Structure
```typescript
interface AuditReport {
  reportId: string;
  period: { start: Date; end: Date };
  generatedAt: Date;
  generatedBy: string;
  summary: {
    totalTransactions: number;
    totalValue: number;
    changesByUser: { userId: string; changeCount: number }[];
  };
  details: AuditEntry[];
}
```

---

# APPENDIX V - FUTURE ROADMAP

## V.1 Planned Features

### Short Term (Q4 2026)
- [ ] Multi-currency support
- [ ] Advanced reporting with charts
- [ ] Mobile app integration
- [ ] WhatsApp notification integration

### Medium Term (2027)
- [ ] E-commerce integration
- [ ] Advanced inventory forecasting
- [ ] Customer segmentation
- [ ] Supplier portal

### Long Term (2027-2028)
- [ ] AI-powered recommendations
- [ ] Predictive analytics
- [ ] Multi-branch consolidation
- [ ] Cloud sync

---

# APPENDIX W - BEST PRACTICES

## W.1 Code Style Guide

### TypeScript Conventions
```typescript
// Use interfaces for public APIs
interface SaleDto {
  customerId: number;
  warehouseId: number;
  items: SaleItemDto[];
  discountPercent?: number;
  taxPercent?: number;
}

// Use types for unions and intersections
type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED';
type CreateSaleResult = 
  | { success: true; data: Sale }
  | { success: false; error: Error };

// Use readonly for immutable data
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

// Use enums for fixed sets of values
enum TransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  RETURN = 'RETURN',
}

// Use strict typing
function processPayment(
  saleId: number,
  data: ProcessPaymentDto,
): Promise<PaymentResult> {
  // Implementation
}

// Use optional chaining and nullish coalescing
const customerName = customer?.profile?.name ?? 'Unknown';
const total = items?.length ?? 0;
```

### Naming Conventions
```typescript
// Classes: PascalCase
class SaleService {}
class ProductController {}

// Interfaces: PascalCase with I prefix optional
interface SaleData {}
interface ISaleRepository {}

// Variables and functions: camelCase
const totalAmount = 0;
function calculateTotal() {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// Boolean variables: is/has/can prefix
const isActive = true;
const hasPermission = false;
const canEdit = true;

// Private properties: _ prefix
private _cache: Map<string, any>;
```

### Error Handling
```typescript
// Custom error classes
class BusinessError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

class ValidationError extends BusinessError {
  constructor(field: string, message: string) {
    super('VALIDATION_ERROR', message, { field });
    this.name = 'ValidationError';
  }
}

// Use Result pattern
async function processSale(data: CreateSaleDto): Promise<Result<Sale>> {
  try {
    // Validation
    if (!data.items?.length) {
      return { success: false, error: 'Items required' };
    }
    
    // Business logic
    const sale = await this.saleRepository.create(data);
    
    return { success: true, data: sale };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## W.2 Git Workflow

### Commit Messages
```
feat: add new sale return feature
fix: resolve stock calculation error
docs: update API documentation
style: format code with prettier
refactor: simplify payment logic
perf: optimize database queries
test: add unit tests for SaleService
chore: update dependencies
```

### Branch Naming
```
feature/sale-return
feature/multi-currency
fix/stock-calculation
hotfix/payment-error
release/v1.2.0
```

## W.3 Code Review Checklist
```
[ ] Code follows style guide
[ ] Unit tests added/updated
[ ] No hardcoded values
[ ] Error handling implemented
[ ] Logging added for critical operations
[ ] API documentation updated
[ ] Security considerations addressed
[ ] Performance impact considered
[ ] Backward compatibility maintained
```

---

# APPENDIX X - INTEGRATION EXAMPLES

## X.1 Payment Gateway Integration

### Midtrans Integration
```typescript
// payment.service.ts
@Injectable()
export class PaymentService {
  async createMidtransTransaction(sale: Sale) {
    const params = {
      transaction_details: {
        order_id: sale.code,
        gross_amount: Number(sale.total),
      },
      customer_details: {
        first_name: sale.customer.name,
        phone: sale.customer.phone,
        email: sale.customer.email,
      },
      item_details: sale.items.map(item => ({
        id: String(item.productId),
        price: Number(item.unitPrice),
        quantity: Number(item.quantity),
        name: item.product.name,
      })),
    };
    
    const response = await this.httpService.post(
      'https://api.midtrans.com/v2/charge',
      params,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.serverKey).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    ).toPromise();
    
    return response.data;
  }
  
  async handleMidtransCallback(notification: MidtransNotification) {
    const { order_id, transaction_status, gross_amount } = notification;
    
    if (transaction_status === 'settlement') {
      await this.saleService.updatePaymentStatus(order_id, 'PAID');
    } else if (transaction_status === 'pending') {
      await this.saleService.updatePaymentStatus(order_id, 'PENDING');
    } else if (transaction_status === 'cancel' || transaction_status === 'expire') {
      await this.saleService.updatePaymentStatus(order_id, 'CANCELLED');
    }
  }
}
```

## X.2 SMS Notification Integration

### Twilio Integration
```typescript
@Injectable()
export class NotificationService {
  async sendSMS(phone: string, message: string) {
    const client = this.twilio(this.accountSid, this.authToken);
    
    await client.messages.create({
      body: message,
      from: this.fromNumber,
      to: phone,
    });
  }
  
  async sendSaleConfirmation(sale: Sale) {
    const message = `
Terima kasih telah berbelanja di Toko CV IndoMurah!
Invoice: ${sale.code}
Total: Rp ${Number(sale.total).toLocaleString('id-ID')}
Status: ${sale.paymentStatus}
    `.trim();
    
    await this.sendSMS(sale.customer.phone, message);
  }
  
  async sendLowStockAlert(product: Product, stock: number) {
    const message = `
⚠️ ALERT STOK RENDAH!
Produk: ${product.name}
Stok Saat Ini: ${stock}
Minimum Stok: ${product.minimumStock}
Segera lakukan restock!
    `.trim();
    
    // Send to manager
    await this.sendSMS(this.managerPhone, message);
  }
}
```

## X.3 Email Integration

### Nodemailer Setup
```typescript
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  
  async sendEmail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject,
      html,
    });
  }
  
  async sendInvoice(sale: Sale) {
    const html = this.generateInvoiceHtml(sale);
    
    await this.sendEmail(
      sale.customer.email,
      `Invoice ${sale.code}`,
      html
    );
  }
  
  async sendPasswordReset(user: User, token: string) {
    const resetUrl = `${this.appUrl}/auth/reset-password?token=${token}`;
    
    const html = `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `;
    
    await this.sendEmail(user.email, 'Password Reset', html);
  }
}
```

## X.4 Third-Party Accounting Integration

### Journal Export
```typescript
@Injectable()
export class AccountingExportService {
  async exportToJournal(journal: Journal) {
    const entries = await this.prisma.journalEntry.findMany({
      where: { journalId: journal.id },
      include: { account: true }
    });
    
    // Format for accounting software
    const exportData = {
      document_number: journal.code,
      date: journal.date,
      description: journal.description,
      entries: entries.map(e => ({
        account_code: e.account.code,
        account_name: e.account.name,
        debit: e.debit,
        credit: e.credit,
        memo: e.memo,
      })),
    };
    
    // Export to file
    await this.exportToExcel(exportData, `journal_${journal.code}.xlsx`);
    
    return exportData;
  }
}
```

---

# APPENDIX Y - GLOSSARY

## Business Terms

| Term | Definition |
|------|-----------|
| POS | Point of Sale - Sistem kasir untuk transaksi penjualan |
| SKU | Stock Keeping Unit - Kode unik produk |
| HPP | Harga Pokok Penjualan - Cost of Goods Sold |
| PPN | Pajak Pertambahan Nilai - Value Added Tax (VAT) |
| FIFO | First In First Out - Metode penilaian persediaan |
| RBAC | Role-Based Access Control - Sistem akses berbasis role |
| OData | Open Data Protocol - Standar API query |
| JWT | JSON Web Token - Token autentikasi |
| CRUD | Create, Read, Update, Delete - Operasi dasar data |
| ORM | Object-Relational Mapping - Teknik akses database |

## Technical Terms

| Term | Definition |
|------|-----------|
| NestJS | Framework Node.js untuk aplikasi server |
| Prisma | ORM untuk TypeScript dan Go |
| PostgreSQL | Database relasional |
| Redis | In-memory data store/cache |
| Docker | Platform containerization |
| CI/CD | Continuous Integration/Deployment |
| REST | Representational State Transfer - API style |
| JSON | JavaScript Object Notation - Data format |
| UUID | Universal Unique Identifier - ID format |
| API | Application Programming Interface |

---

# APPENDIX Z - QUICK REFERENCE

## Z.1 Common Commands

### Development
```bash
# Install dependencies
npm install

# Run development server
npm run start:dev

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Studio (GUI)
npx prisma studio

# Build
npm run build

# Production
npm run start:prod
```

### Docker
```bash
# Build image
docker build -t toko-api .

# Run container
docker run -p 3000:3000 toko-api

# Docker Compose
docker-compose up -d
docker-compose down
docker-compose logs -f

# Clean up
docker system prune -a
docker volume prune
```

### Database
```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d toko

# Backup database
pg_dump -Fc toko > backup.dump

# Restore database
pg_restore -d toko backup.dump

# Check connections
SELECT * FROM pg_stat_activity;
```

## Z.2 Environment Variables Quick Reference

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment | development, production |
| PORT | Server port | 3000 |
| DATABASE_URL | Database connection | postgresql://... |
| REDIS_URL | Redis connection | redis://... |
| JWT_SECRET | JWT signing key | your-secret-key |
| JWT_EXPIRES_IN | Token expiration | 15m, 7d |
| API_PREFIX | API URL prefix | api |

## Z.3 File Structure Reference

```
api/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   ├── config/                 # Configuration
│   │   └── index.ts
│   ├── common/                 # Shared utilities
│   │   ├── prisma/            # Database service
│   │   ├── redis/             # Cache service
│   │   ├── query/             # Query builder
│   │   ├── guards/            # Auth guards
│   │   ├── interceptors/      # Logging, transform
│   │   └── decorators/        # Custom decorators
│   └── modules/               # Feature modules
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── auth.strategy.ts
│       │   └── dto/
│       ├── product/
│       │   ├── product.module.ts
│       │   ├── product.controller.ts
│       │   ├── product.service.ts
│       │   ├── product.repository.ts
│       │   └── dto/
│       └── ... (100+ modules)
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/           # Database migrations
├── test/
│   ├── unit/                 # Unit tests
│   └── e2e/                  # E2E tests
└── scripts/
    └── *.ts                  # Utility scripts
```

## Z.4 Module Naming Convention

| Module | Controller | Service | Repository |
|--------|------------|---------|------------|
| product | ProductController | ProductService | ProductRepository |
| sale | SaleController | SaleService | SaleRepository |
| purchase | PurchaseController | PurchaseService | PurchaseRepository |
| customer | CustomerController | CustomerService | CustomerRepository |

## Z.5 Common HTTP Status Codes

| Code | Status | Usage |
|------|--------|-------|
| 200 | OK | Successful GET, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry |
| 422 | Unprocessable | Business rule violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Z.6 OData Query Quick Reference

| Query | Description | Example |
|-------|-------------|---------|
| $select | Select fields | $select=id,name,code |
| $filter | Filter results | $filter=stock gt 0 |
| $orderBy | Sort results | $orderBy=createdAt desc |
| $top | Limit results | $top=10 |
| $skip | Offset | $skip=20 |
| $expand | Include relations | $expand=category |
| $count | Include count | $count=true |
| $search | Full-text search | $search=tv samsung |

---

# APPENDIX AA - VERSION HISTORY

## Version 1.0.0 (September 2026)
- Initial release
- Core POS functionality
- 100+ modules
- OData support
- Multi-company support
- JWT authentication
- RBAC authorization

## Version 1.1.0 (Planned)
- Enhanced reporting
- Multi-currency support
- Advanced inventory management
- Mobile app integration

## Version 2.0.0 (Planned)
- Cloud deployment
- Real-time sync
- AI-powered analytics
- E-commerce integration

---

# APPENDIX BB - SUPPORT & CONTACT

## Documentation
- API Documentation: `/api/docs`
- Swagger UI: `/api/docs`
- Postman Collection: Available on request

## Support Channels
- Email: support@tokoku.com
- Phone: +62-xxx-xxxx-xxxx
- Hours: Mon-Fri, 9:00-17:00 WIB

## Community
- GitHub Issues: Report bugs
- Discord: Join discussion
- Wiki: User-contributed guides

## Training
- Video tutorials available
- On-site training available
- Documentation in progress

---

# APPENDIX CC - CONTRIBUTING GUIDELINES

## Code Contribution Process

### 1. Fork and Clone
```bash
git clone https://github.com/your-fork/toko-api.git
cd toko-api
git remote add upstream https://github.com/original/toko-api.git
```

### 2. Create Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes
- Follow coding standards
- Add unit tests
- Update documentation
- Commit with clear messages

### 4. Submit Pull Request
- Fill PR template
- Link related issues
- Request reviews
- Address feedback

## Coding Standards

### Style Guide
- Use ESLint and Prettier
- Follow NestJS best practices
- Use strict TypeScript
- Document public APIs

### Testing Standards
- Minimum 80% code coverage
- All new features must have tests
- Integration tests for APIs
- E2E tests for critical flows

### Documentation Standards
- JSDoc for all public methods
- README for new modules
- API documentation updates
- Update changelog

---

# APPENDIX DD - SECURITY VULNERABILITY REPORTING

## Reporting Process
1. Email security@tokoku.com with details
2. Include steps to reproduce
3. Wait for acknowledgment (24 hours)
4. Provide additional info if needed
5. Receive fix timeline

## Scope
- SQL Injection
- XSS vulnerabilities
- Authentication bypass
- Authorization flaws
- Data exposure
- Rate limiting issues

## Out of Scope
- Social engineering
- Physical security
- Denial of service (basic)
- Informational disclosures

## Recognition
- Security hall of fame
- Thank you credits
- Bug bounty program (planned)

---

# APPENDIX EE - THIRD-PARTY DEPENDENCIES

## Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| @nestjs/core | ^10.0 | Framework |
| @nestjs/common | ^10.0 | Common utilities |
| @nestjs/platform-express | ^10.0 | Express adapter |
| @prisma/client | ^5.0 | Database ORM |
| prisma | ^5.0 | Database tools |
| @nestjs/passport | ^10.0 | Authentication |
| passport-jwt | ^4.0 | JWT strategy |
| @nestjs/jwt | ^10.0 | JWT utilities |
| @nestjs/throttler | ^5.0 | Rate limiting |
| class-validator | ^0.14 | Validation |
| class-transformer | ^0.5 | Transform |

## Development Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5.0 | Type support |
| jest | ^29.0 | Testing |
| @types/node | ^20.0 | Node types |
| prettier | ^3.0 | Formatting |
| eslint | ^8.0 | Linting |
| supertest | ^6.0 | HTTP testing |
| ts-jest | ^29.0 | Jest for TS |

## Optional Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| @nestjs/cache-manager | ^10.0 | Caching |
| cache-manager-ioredis | ^2.0 | Redis cache |
| nodemailer | ^6.0 | Email sending |
| twilio | ^4.0 | SMS sending |
| bcrypt | ^5.0 | Password hashing |
| uuid | ^9.0 | UUID generation |

---

# APPENDIX FF - PERFORMANCE BENCHMARKS

## Expected Performance

### API Response Times
| Endpoint Type | Average | 95th Percentile |
|--------------|---------|-----------------|
| Simple GET | < 50ms | < 100ms |
| Complex GET with joins | < 200ms | < 500ms |
| POST (Create) | < 100ms | < 250ms |
| PUT/PATCH (Update) | < 100ms | < 250ms |
| DELETE | < 50ms | < 100ms |

### Throughput
| Scenario | Requests/Second |
|----------|----------------|
| Normal Load | 500-1000 |
| Peak Load | 2000-5000 |
| Stress Test | 10000+ |

### Database Performance
| Query Type | Target Time |
|------------|-------------|
| Simple select | < 10ms |
| Select with join | < 50ms |
| Aggregation | < 200ms |
| Complex report | < 5s |

## Optimization Techniques

### Database
- Proper indexing
- Query optimization
- Connection pooling
- Read replicas

### Application
- Caching
- Async processing
- Batch operations
- Compression

### Infrastructure
- Load balancing
- CDN for static files
- Database clustering
- Redis caching

---

*End of Document*

*Total Modules Documented: 100+*
*Total Lines: 10,000+*
*Last Updated: September 2026*
