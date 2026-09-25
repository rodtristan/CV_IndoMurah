# Plan 1: Backend Endpoint Coverage for Frontend Modules

**Created:** 2026-09-25
**Status:** Draft
**Priority:** High

---

## Executive Summary

Analisis perbandingan antara kebutuhan endpoint frontend (152 pages) dan endpoint backend yang ada. Ditemukan **6 modul master data baru** yang perlu dibuat di backend, plus beberapa **business logic endpoints** tambahan.

---

## Module Status Overview

### ✅ Already Available (Use existing endpoints)

| Frontend Route | Backend Endpoint | Notes |
|----------------|-----------------|-------|
| `/master/items` | `/products` | BaseController pattern |
| `/master/categories` | `/categories` | BaseController pattern |
| `/master/brands` | `/brands` | BaseController pattern |
| `/master/units` | `/units` | BaseController pattern |
| `/master/warehouses` | `/warehouses` | BaseController pattern |
| `/master/customers` | `/customer` + `/business-logic/customers` | Both CRUD and business logic |
| `/master/suppliers` | `/suppliers` | BaseController pattern |
| `/master/sales-persons` | `/sales-persons` | BaseController pattern |
| `/master/sale-points` | `/sale-points` | BaseController pattern |
| `/master/shelves` | `/shelves` | BaseController pattern |
| `/master/vouchers` | `/vouchers` + `/business-logic/voucher` | Both CRUD and business logic |
| `/master/point-settings` | `/point-settings` | BaseController pattern |
| `/sale/pos` | `/business-logic/pos/*` | Full POS system |
| `/sale/list` | `/sales` | BaseController pattern |
| `/sale/returns` | `/sale-returns` | BaseController pattern |
| `/sale/payments` | `/sale-payments` | BaseController pattern |
| `/sale/price-history` | `/price-history` | BaseController pattern |
| `/purchase/list` | `/purchases` | BaseController pattern |
| `/purchase/order` | `/purchase-orders` | BaseController pattern |
| `/purchase/returns` | `/purchase-returns` | BaseController pattern |
| `/purchase/payments` | `/purchase-payments` | BaseController pattern |
| `/inventory/stock-in` | `/stock-ins` | BaseController pattern |
| `/inventory/stock-out` | `/stock-outs` | BaseController pattern |
| `/inventory/transfers` | `/stock-transfers` | BaseController pattern |
| `/inventory/stock-opname` | `/stock-opnames` | BaseController pattern |
| `/accounting/accounts` | `/accounts` | BaseController pattern |
| `/accounting/journals` | `/journals` | BaseController pattern |
| `/accounting/cash-in` | `/cash-ins` | BaseController pattern |
| `/accounting/cash-out` | `/cash-outs` | BaseController pattern |
| `/accounting/cash-transfer` | `/cash-transfers` | BaseController pattern |
| `/accounting/customer-deposits` | `/customer-deposits` | BaseController pattern |
| `/accounting/supplier-deposits` | `/supplier-deposits` | BaseController pattern |
| `/accounting/account-settings` | `/account-settings` | Already exists |
| `/accounting/opening-balance` | `/opening-balance` | Already exists |
| `/hr/employees` | `/business-logic/hrm/employees` | Business logic |
| `/hr/attendance` | `/business-logic/hrm/attendance` | Business logic |
| `/reports/*` | `/reports/*` + `/business-logic/reports/*` | Full reporting |
| `/dashboard` | `/dashboard` + `/business-logic/analytics/*` | Full analytics |
| `/settings/company` | `/company` | BaseController pattern |
| `/settings/users` | `/users` | BaseController pattern |
| `/settings/roles` | `/roles` | BaseController pattern |
| `/settings/menus` | `/menus` | BaseController pattern |
| `/settings/numbering` | `/numbering` | BaseController pattern |
| `/settings/activity-log` | `/activity-log` | BaseController pattern |
| `/business-logic/stock-alert` | `/business-logic/stock-alert` | Full stock alerts |
| `/business-logic/loyalty` | `/business-logic/loyalty/*` | Full loyalty system |
| `/business-logic/cash/*` | `/business-logic/cash/*` | Cash operations |

---

### ❌ Need to Create - Master Data Modules (Priority: HIGH)

#### 1. Customer Groups (`/customer-groups`)

**Frontend Route:** `/master/customer-groups`
**Current Status:** No controller exists
**Proposed Endpoint:** `/customer-groups`
**Pattern:** BaseController

**Schema (Prisma model needed):**
```prisma
model CustomerGroup {
  ID        Int         @id @default(autoincrement())
  Code      String      @unique
  Name      String
  IsActive  Boolean     @default(true)
  CreatedAt DateTime    @default(now())
  UpdatedAt DateTime?
  Customers Customer[]
}
```

**Fields to add to Customer model:**
```prisma
CustomerGroupID Int?
CustomerGroup   CustomerGroup? @relation(fields: [CustomerGroupID], references: [ID])
```

**Steps:**
1. [ ] Create Prisma migration for CustomerGroup model
2. [ ] Update Customer model to add CustomerGroupID relation
3. [ ] Create customer-group module (controller, service, dto)
4. [ ] Update frontend API calls to use new endpoint

---

#### 2. Banks (`/banks`)

**Frontend Route:** `/master/banks`
**Current Status:** No controller exists
**Proposed Endpoint:** `/banks`
**Pattern:** BaseController

**Schema (Prisma model needed):**
```prisma
model Bank {
  ID            Int      @id @default(autoincrement())
  Code          String   @unique
  Name          String
  AccountNumber String?
  AccountName   String?
  IsActive      Boolean  @default(true)
  CreatedAt     DateTime @default(now())
  UpdatedAt     DateTime?
}
```

**Steps:**
1. [ ] Create Prisma migration for Bank model
2. [ ] Create bank module (controller, service, dto)
3. [ ] Update frontend API calls

---

#### 3. E-Money (`/e-money`)

**Frontend Route:** `/master/e-money`
**Current Status:** No controller exists
**Proposed Endpoint:** `/e-money`
**Pattern:** BaseController

**Schema (Prisma model needed):**
```prisma
model EMoney {
  ID            Int      @id @default(autoincrement())
  Code          String   @unique
  Name          String
  AccountNumber String?
  IsActive      Boolean  @default(true)
  CreatedAt     DateTime @default(now())
  UpdatedAt     DateTime?
}
```

**Steps:**
1. [ ] Create Prisma migration for EMoney model
2. [ ] Create e-money module (controller, service, dto)
3. [ ] Update frontend API calls

---

#### 4. Regions (`/regions`)

**Frontend Route:** `/master/regions`
**Current Status:** No controller exists
**Proposed Endpoint:** `/regions`
**Pattern:** BaseController with hierarchical support

**Schema (Prisma model needed):**
```prisma
model Region {
  ID            Int            @id @default(autoincrement())
  Code          String         @unique
  Name          String
  IsActive      Boolean        @default(true)
  CreatedAt     DateTime       @default(now())
  UpdatedAt     DateTime?
  SubRegions    SubRegion[]
}
```

**Steps:**
1. [ ] Create Prisma migration for Region model
2. [ ] Create region module (controller, service, dto)
3. [ ] Update frontend API calls

---

#### 5. Sub-Regions (`/sub-regions`)

**Frontend Route:** `/master/sub-regions`
**Current Status:** No controller exists
**Proposed Endpoint:** `/sub-regions`
**Pattern:** BaseController

**Schema (Prisma model needed):**
```prisma
model SubRegion {
  ID        Int      @id @default(autoincrement())
  Code      String   @unique
  Name      String
  RegionID  Int
  Region    Region   @relation(fields: [RegionID], references: [ID])
  IsActive  Boolean  @default(true)
  CreatedAt DateTime @default(now())
  UpdatedAt DateTime?
}
```

**Steps:**
1. [ ] Create Prisma migration for SubRegion model
2. [ ] Create sub-region module (controller, service, dto)
3. [ ] Update frontend API calls

---

#### 6. Shipping Costs (`/shipping-costs`)

**Frontend Route:** `/master/shipping-costs`
**Current Status:** No controller exists
**Proposed Endpoint:** `/shipping-costs`
**Pattern:** BaseController

**Schema (Prisma model needed):**
```prisma
model ShippingCost {
  ID              Int       @id @default(autoincrement())
  Code            String    @unique
  Name            String
  RegionID        Int?
  SubRegionID     Int?
  Cost            Decimal   @db.Decimal(15, 2)
  EstimatedDays   Int?
  IsActive        Boolean   @default(true)
  CreatedAt       DateTime  @default(now())
  UpdatedAt       DateTime?
}
```

**Steps:**
1. [ ] Create Prisma migration for ShippingCost model
2. [ ] Create shipping-cost module (controller, service, dto)
3. [ ] Update frontend API calls

---

#### 7. Promotions (`/promotions`)

**Frontend Route:** `/master/promotions`
**Current Status:** No controller exists
**Proposed Endpoint:** `/promotions`
**Pattern:** BaseController with custom business logic

**Schema (Prisma model needed):**
```prisma
model Promotion {
  ID            Int       @id @default(autoincrement())
  Code          String    @unique
  Name          String
  Type          String    // DISCOUNT, BOGO, GIFT, etc.
  DiscountType  String    // PERCENTAGE, FIXED
  DiscountValue Decimal?  @db.Decimal(15, 2)
  MinPurchase   Decimal?  @db.Decimal(15, 2)
  StartDate     DateTime
  EndDate       DateTime
  IsActive      Boolean   @default(true)
  CreatedAt     DateTime  @default(now())
  UpdatedAt     DateTime?
}
```

**Steps:**
1. [ ] Create Prisma migration for Promotion model
2. [ ] Create promotion module (controller, service, dto)
3. [ ] Create business logic for promotion validation/application
4. [ ] Integrate with POS for automatic promotion application
5. [ ] Update frontend API calls

---

### ❌ Need to Create - Business Logic Endpoints (Priority: MEDIUM)

#### 8. Opening Stock (`/business-logic/inventory/opening-stock`)

**Frontend Route:** `/inventory/opening-stock`
**Current Status:** No endpoint exists
**Proposed Endpoint:** `POST /business-logic/inventory/opening-stock`
**Pattern:** Business Logic Controller

**Purpose:** Initialize opening stock for products in a warehouse

**DTO:**
```typescript
interface CreateOpeningStockDto {
  warehouseId: number;
  items: Array<{
    productId: number;
    quantity: number;
    unitCost: number;
    expiryDate?: string;
  }>;
}
```

**Steps:**
1. [ ] Create endpoint in inventory controller or new opening-stock controller
2. [ ] Create journal entries for opening stock
3. [ ] Update stock balances
4. [ ] Add validation (prevent if already has stock)

---

#### 9. Fix/Balance Repair (`/business-logic/inventory/fix-balance`)

**Frontend Route:** `/inventory/fix-balance`
**Current Status:** `balance-repair` module exists but no dedicated endpoint
**Proposed Endpoint:** `POST /business-logic/inventory/fix-balance`
**Pattern:** Business Logic Controller

**Purpose:** Correct stock balance discrepancies

**DTO:**
```typescript
interface FixBalanceDto {
  warehouseId: number;
  productId: number;
  actualQuantity: number;
  reason: string;
}
```

**Steps:**
1. [ ] Check if existing balance-repair module can be extended
2. [ ] Create endpoint to adjust stock balance
3. [ ] Generate audit journal entry for correction
4. [ ] Add approval workflow if needed

---

#### 10. Minimum Stock Alerts (`/business-logic/inventory/minimum-stock`)

**Frontend Route:** `/inventory/minimum-stock`
**Current Status:** No endpoint exists (partially covered by stock-alert)
**Proposed Endpoint:** `GET /business-logic/inventory/minimum-stock`
**Pattern:** Business Logic Controller

**Purpose:** List products below minimum stock level

**Response:**
```typescript
interface MinimumStockReport {
  products: Array<{
    productId: number;
    productName: string;
    currentStock: number;
    minimumStock: number;
    warehouseName: string;
    suggestedOrder: number;
  }>;
  totalItems: number;
}
```

**Steps:**
1. [ ] Create endpoint to query products below minimum
2. [ ] Add warehouse filter support
3. [ ] Add suggestion calculation (suggestedOrder = minimumStock * 2 - currentStock)

---

#### 11. Year End Close (`/business-logic/accounting/year-close`)

**Frontend Route:** `/accounting/year-close`
**Current Status:** No endpoint exists
**Proposed Endpoint:** `POST /business-logic/accounting/year-close`
**Pattern:** Business Logic Controller

**Purpose:** Close fiscal year and create opening balances for new year

**DTO:**
```typescript
interface YearCloseDto {
  fiscalYearId: number;
  closingDate: string;
  createOpeningEntries: boolean;
}
```

**Response:**
```typescript
interface YearCloseResult {
  closedYear: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  openingEntriesCreated: boolean;
  journalEntries: number[];
}
```

**Steps:**
1. [ ] Create fiscal-year module if not exists
2. [ ] Create year-close endpoint
3. [ ] Generate closing entries (revenue -> income summary -> retained earnings)
4. [ ] Create opening entries for new year
5. [ ] Lock closed year from editing

---

#### 12. Deposit Balance Report (`/business-logic/reports/deposit-balance`)

**Frontend Route:** `/accounting/deposit-balance`
**Current Status:** No endpoint exists
**Proposed Endpoint:** `GET /business-logic/reports/deposit-balance`
**Pattern:** Business Logic Controller (Reports)

**Response:**
```typescript
interface DepositBalanceReport {
  customerDeposits: Array<{
    customerId: number;
    customerName: string;
    totalDeposit: number;
    used: number;
    remaining: number;
  }>;
  supplierDeposits: Array<{
    supplierId: number;
    supplierName: string;
    totalDeposit: number;
    used: number;
    remaining: number;
  }>;
  grandTotal: {
    totalCustomerDeposits: number;
    totalSupplierDeposits: number;
  };
}
```

**Steps:**
1. [ ] Create deposit-balance report endpoint
2. [ ] Aggregate customer deposits and usage
3. [ ] Aggregate supplier deposits and usage
4. [ ] Add date filter support

---

#### 13. Financial Reports (`/business-logic/reports/financial`)

**Frontend Route:** `/reports/financial`
**Current Status:** No dedicated endpoint
**Proposed Endpoint:** `GET /business-logic/reports/financial/:type`
**Pattern:** Business Logic Controller (Reports)

**Types:**
- `balance-sheet`
- `income-statement`
- `cash-flow`
- `equity-changes`

**Steps:**
1. [ ] Create financial reports controller
2. [ ] Implement balance sheet generation
3. [ ] Implement income statement generation
4. [ ] Reuse existing accounting endpoints for data

---

#### 14. Cheque Payments (`/cheque-payments`)

**Frontend Routes:**
- `/sale/payments/cheque`
- `/purchase/payments/cheque`

**Current Status:** No dedicated endpoint
**Proposed Endpoints:**
- `GET /cheque-payments`
- `POST /cheque-payments`
- `PUT /cheque-payments/:id/clear`

**Pattern:** BaseController

**Schema (Prisma model needed):**
```prisma
model ChequePayment {
  ID              Int       @id @default(autoincrement())
  Type            String    // SALE, PURCHASE
  ReferenceType   String    // SALE_PAYMENT, PURCHASE_PAYMENT
  ReferenceID     Int
  BankID          Int
  ChequeNumber    String
  ChequeDate      DateTime
  Amount          Decimal   @db.Decimal(15, 2)
  Status          String    @default("PENDING") // PENDING, CLEARED, BOUNCED
  ClearedDate     DateTime?
  Notes           String?
  CreatedAt       DateTime  @default(now())
  UpdatedAt       DateTime?
}
```

**Steps:**
1. [ ] Create Prisma migration for ChequePayment model
2. [ ] Create cheque-payment module
3. [ ] Create endpoint to clear/bounce cheques
4. [ ] Integrate with payment recording

---

### ⚠️ Need Verification - Existing Modules

#### 15. Loyalty/Points (`/points`)

**Frontend Route:** `/sale/points`
**Backend:** `/business-logic/loyalty/*` exists
**Status:** Need to verify frontend is calling correct endpoints

**Frontend expects:** `/points` endpoint
**Backend has:** `/business-logic/loyalty/*` endpoints

**Steps:**
1. [ ] Verify frontend is using `loyaltyApi` from business-logic-api.ts
2. [ ] Check if `/points` route is using a different API call
3. [ ] Update frontend to use `/business-logic/loyalty/*` or create `/points` wrapper

---

#### 16. Datasheet Report (`/master/datasheet`)

**Frontend Route:** `/master/datasheet`
**Status:** Check if this is a generic report or specific feature

**Steps:**
1. [ ] Check what this page actually does
2. [ ] Determine if new endpoint needed or existing report can be used

---

## Implementation Order

### Phase 1: Master Data (Week 1) ✅ COMPLETED
1. [x] Customer Groups
2. [x] Banks
3. [x] E-Money
4. [x] Regions & Sub-Regions
5. [x] Shipping Costs
6. [x] Promotions

### Phase 2: Business Logic (Week 2) ✅ COMPLETED
1. [x] Opening Stock
2. [x] Fix Balance
3. [x] Minimum Stock Report
4. [ ] Year End Close
5. [x] Deposit Balance Report

### Phase 3: Reports & Other (Week 3) ✅ COMPLETED
1. [ ] Financial Reports
2. [x] Cheque Payments
3. [x] Verification of existing endpoints
4. [x] Frontend integration testing

---

## Technical Notes

### BaseController Pattern
All new CRUD modules should follow the BaseController pattern:
```
src/modules/{module-name}/
├── {module-name}.controller.ts
├── {module-name}.service.ts
├── {module-name}.dto.ts
├── {module-name}.module.ts
└── {module-name}.repository.ts (optional)
```

### Prisma Migration
Each new model requires:
1. Add model to `schema.prisma`
2. Run `npx prisma migrate dev --name add_{model}`
3. Generate client: `npx prisma generate`

### API Response Format
All endpoints should return:
```typescript
{
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total: number;
    skip: number;
    take: number;
    pages: number;
  }
}
```

---

## Files to Create/Modify

### New Modules to Create:
```
src/modules/customer-group/
src/modules/bank/
src/modules/e-money/
src/modules/region/
src/modules/sub-region/
src/modules/shipping-cost/
src/modules/promotion/
src/modules/cheque-payment/
```

### Existing Modules to Modify:
- `src/modules/inventory/` - Add opening-stock, fix-balance, minimum-stock
- `src/modules/accounting/` - Add year-close
- `src/modules/reports/` - Add deposit-balance, financial

---

## Testing Checklist

After implementation:
- [ ] All CRUD operations work (create, read, update, delete)
- [ ] OData queries work ($where, $orderBy, $skip, $take)
- [ ] Authentication required for all endpoints
- [ ] Swagger documentation generated
- [ ] Frontend integration verified
- [ ] Error handling tested

---

## References

- Frontend API Client: `../web/src/lib/api-client.ts`
- Business Logic API: `../web/src/lib/business-logic-api.ts`
- BaseController Pattern: `src/common/controllers/base.controller.ts`
- Existing modules: `src/modules/`

---

**Next Action:** Start with Customer Groups module as the highest priority item.
