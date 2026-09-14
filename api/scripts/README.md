# Template System - OData CRUD Generator

## Overview

Sistem template ini menyediakan base class untuk membuat CRUD endpoints dengan OData query support secara otomatis.

## Struktur File

```
src/common/templates/
├── base.service.ts      # Base service dengan semua method CRUD
├── base.controller.ts   # Base controller dengan semua endpoint
├── model-metadata.ts    # Type definitions
└── index.ts            # Export semua template

scripts/
├── generate-module.js   # Generator untuk membuat module baru
└── utils-case.js        # Utility untuk case conversion
```

## Cara Penggunaan

### 1. Generate Module Baru

```bash
# Generate module Brand
node scripts/generate-module.js Brand

# Generate module Supplier
node scripts/generate-module.js Supplier

# Generate module Warehouse
node scripts/generate-module.js Warehouse
```

### 2. Import Module di app-module.ts

```typescript
import { BrandModule } from './modules/brand/brand.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';

// Tambahkan ke imports array
@Module({
  imports: [
    // ... other modules
    BrandModule,
    SupplierModule,
    WarehouseModule,
  ],
})
export class AppModule {}
```

### 3. Customize DTO

Edit file `src/modules/<model>/dto/<model>.dto.ts` untuk menambahkan field yang sesuai dengan schema Prisma.

## Endpoints yang Dibuat

Untuk setiap module, endpoint berikut otomatis dibuat:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/<model>` | Get all dengan OData query |
| GET | `/api/v1/<model>/count` | Get total count |
| GET | `/api/v1/<model>/:id` | Get by ID |
| GET | `/api/v1/<model>/by/:field/:value` | Get by field reference |
| POST | `/api/v1/<model>` | Create new |
| POST | `/api/v1/<model>/bulk` | Create multiple |
| PATCH | `/api/v1/<model>/:id` | Update by ID |
| PATCH | `/api/v1/<model>/by/:field/:value` | Update by field reference |
| PATCH | `/api/v1/<model>/bulk` | Update multiple |
| DELETE | `/api/v1/<model>/:id` | Delete by ID |
| DELETE | `/api/v1/<model>/by/:field/:value` | Delete by field reference |
| DELETE | `/api/v1/<model>/bulk` | Delete multiple |
| PUT | `/api/v1/<model>` | Upsert by ID |
| PUT | `/api/v1/<model>/by/:field` | Upsert by field reference |
| PUT | `/api/v1/<model>/bulk` | Bulk upsert |

## OData Query Support

Semua GET endpoints mendukung OData-style query:

```
GET /api/v1/brand?$select=id,name
GET /api/v1/brand?$include=products
GET /api/v1/brand?$where[isActive]=true
GET /api/v1/brand?$orderBy[name]=asc
GET /api/v1/brand?$skip=0&$take=10
GET /api/v1/brand?$search=keyword
```

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| `$select` | Pilih field yang mau diambil |
| `$include` | Include relations |
| `$where[field]` | Filter berdasarkan field |
| `$where[field][$gt]` | Greater than |
| `$where[field][$gte]` | Greater than or equal |
| `$where[field][$lt]` | Less than |
| `$where[field][$lte]` | Less than or equal |
| `$where[field][$in]` | In array |
| `$where[field][$like]` | Contains |
| `$orderBy[field]` | Sort asc/desc |
| `$skip` | Offset pagination |
| `$take` | Limit (max 100) |
| `$search` | Full-text search |
| `$searchFields` | Fields untuk search |

## Filter Reference

Filter reference memungkinkan operasi berdasarkan field non-primary key:

```
# Update semua Brand yang isActive = false
PATCH /api/v1/brand/by/isActive/false
Body: { "name": "Updated Name" }

# Delete semua Brand yang isActive = false
DELETE /api/v1/brand/by/isActive/false
```

## Bulk Operations

### Create Bulk
```json
POST /api/v1/brand/bulk
Body: [
  { "code": "B001", "name": "Brand 1" },
  { "code": "B002", "name": "Brand 2" }
]
```

### Update Bulk
```json
PATCH /api/v1/brand/bulk
Body: {
  "ids": [1, 2, 3],
  "data": { "isActive": false }
}
```

### Delete Bulk
```json
DELETE /api/v1/brand/bulk
Body: { "ids": [1, 2, 3] }
```

### Upsert Bulk
```json
PUT /api/v1/brand/bulk
Body: {
  "items": [
    {
      "where": { "code": "B001" },
      "create": { "code": "B001", "name": "New Brand" },
      "update": { "name": "Updated Brand" }
    }
  ]
}
```

## Available Model Configurations

Script generator sudah punya konfigurasi untuk:

- User
- Category
- Product
- Supplier
- Customer
- Warehouse
- Brand
- Unit
- Account
- CashIn
- CashOut
- CashTransfer
- CustomerDeposit
- SupplierDeposit
- StockIn
- StockOut
- StockTransfer
- StockOpname
- Journal
- JournalEntry
- Sale
- SaleItem
- SalePayment
- SaleReturn
- Purchase
- PurchaseItem
- PurchasePayment
- PurchaseReturn
- PurchaseOrder
- PurchaseOrderItem
- ProductStock
- SalesPerson
- SalePoint

Untuk model lain, akan menggunakan default configuration.

## Customization

### Edit Service Configuration

Edit file `src/modules/<model>/<model>.service.ts`:

```typescript
super(prisma, redis, queryService, {
  modelName: 'brand',
  primaryKey: 'id',
  searchableFields: ['code', 'name'],
  allowedIncludes: ['products'],
  allowedSortFields: ['id', 'code', 'name', 'createdAt'],
  allowedSelectFields: ['id', 'code', 'name', 'isActive'],
  defaultOrderBy: { createdAt: 'desc' },
  maxTake: 100,
  defaultTake: 20,
  cacheTtl: 60,
  softDelete: true,
  softDeleteField: 'isActive',
});
```

### Edit Controller Configuration

Edit file `src/modules/<model>/<model>.controller.ts`:

```typescript
super(brandService, {
  modelName: 'Brand',
  pluralName: 'Brands',
  primaryKeyType: 'number', // atau 'string' untuk UUID
  paramId: 'id',
  routePrefix: 'brand',
});
```

## Response Format

Semua response menggunakan format standar:

```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Brand created successfully"
}

// Paginated
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "skip": 0,
    "take": 20,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}

// Error
{
  "success": false,
  "message": "Brand not found"
}
```
