# Business Logic API Documentation

## Overview

This document describes all business logic endpoints in the Toko CV IndoMurah POS API. These endpoints handle complex business workflows that span multiple models and require transactional integrity.

## Base URL

```
/api/business-logic
```

## Authentication

All endpoints require JWT Bearer token authentication.

## Module List

1. **POS** - Point of Sale transactions
2. **Receivable** - Customer receivable management
3. **Stock Alert** - Inventory alerts and reorder management
4. **Analytics** - Reports and trend analysis
5. **Inventory** - Stock transfer, adjustment, and opname
6. **Purchase** - Purchase orders, goods receipt, payments
7. **Production** - Manufacturing and BOM management
8. **Service** - Service/repair order management
9. **HRM** - Employee, attendance, payroll, leave, loan management
10. **Expense** - Expense tracking and approval
11. **Voucher** - Voucher/promo code management
12. **Loyalty** - Point system and redemption
13. **Sale Return** - Sales return and refund processing
14. **Accounting** - Chart of accounts, journals, ledger, financial reports
15. **Quality Control** - QC inspection, defect tracking, calibration
16. **Work Order** - Production work orders, scheduling, tracking
17. **Assembly** - Assembly, BOM (Bill of Materials), Rakitan barang
18. **Asset** - Fixed asset management with depreciation
19. **Cash** - Cash in/out/transfer management
20. **Supplier Debt** - Supplier payable management
21. **Price** - Price history and management
22. **Stock Mutation** - Mutasi stok (penyesuaian, penyusutan, rusak)
23. **Cash Flow** - Arus kas category dan transactions
24. **Service Package** - Paket layanan dan quote calculation

---

## 1. POS (Point of Sale)

### 1.1 Product Lookup

#### Search Products for POS Display
```
GET /business-logic/pos/products/search
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search keyword (name, code, barcode) |
| categoryId | number | No | Filter by category |
| brandId | number | No | Filter by brand |
| warehouseId | number | No | Filter by warehouse |
| inStockOnly | boolean | No | Show only products with stock > 0 |
| limit | number | No | Limit results (default: 50) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "PROD-001",
      "name": "Product Name",
      "barcode": "123456789",
      "category": { "id": 1, "name": "Category" },
      "brand": { "id": 1, "name": "Brand" },
      "unit": { "id": 1, "name": "Pcs", "abbreviation": "pcs" },
      "sellingPrice": 10000,
      "stock": 100,
      "minimumStock": 10
    }
  ]
}
```

#### Search Product by Barcode
```
GET /business-logic/pos/products/barcode
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| barcode | string | Yes | Barcode value |
| warehouseId | number | No | Warehouse for stock check |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "PROD-001",
    "name": "Product Name",
    "barcode": "123456789",
    "sellingPrice": 10000,
    "stock": 100,
    "minimumStock": 10,
    "hasEnoughStock": true
  }
}
```

#### Quick Price Check
```
GET /business-logic/pos/products/price-check
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | number | Yes | Product ID |
| customerId | number | Yes | Customer ID for pricing |
| quantity | number | Yes | Quantity |

---

### 1.2 Cart Management

#### Open Cart Session
```
POST /business-logic/pos/cart/open
```

**Headers:** `X-Session-Id: <unique-session-id>`

**Body:**
```json
{
  "customerId": 1,
  "salePointId": 1,
  "warehouseId": 1
}
```

#### Add Product to Cart
```
POST /business-logic/pos/cart/add
```

**Headers:** `X-Session-Id: <unique-session-id>`

**Body:**
```json
{
  "productId": 1,
  "quantity": 2,
  "unitPrice": 10000,
  "notes": "optional notes"
}
```

#### Update Cart Item
```
PUT /business-logic/pos/cart/item/:productId
```

**Headers:** `X-Session-Id: <unique-session-id>`

**Body:**
```json
{
  "quantity": 3,
  "unitPrice": 9500,
  "discountPercent": 5
}
```

#### Remove Cart Item
```
DELETE /business-logic/pos/cart/item/:productId
```

**Headers:** `X-Session-Id: <unique-session-id>`

#### Get Cart Summary
```
GET /business-logic/pos/cart
```

**Headers:** `X-Session-Id: <unique-session-id>`

#### Clear Cart
```
DELETE /business-logic/pos/cart
```

**Headers:** `X-Session-Id: <unique-session-id>`

---

### 1.3 Hold & Resume Transactions

#### Hold Transaction
```
POST /business-logic/pos/cart/hold
```

**Headers:** `X-Session-Id: <unique-session-id>`

**Body:**
```json
{
  "holdNumber": "HOLD-001",
  "customerName": "John Doe"
}
```

#### Resume Held Transaction
```
POST /business-logic/pos/cart/resume
```

**Headers:** `X-Session-Id: <unique-session-id>`

**Body:**
```json
{
  "holdNumber": "HOLD-001"
}
```

#### List Held Transactions
```
GET /business-logic/pos/holds
```

---

### 1.4 Voucher & Discount

#### Apply Voucher
```
POST /business-logic/pos/voucher/apply
```

**Body:**
```json
{
  "code": "DISKON10",
  "subtotal": 100000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "voucherCode": "DISKON10",
    "voucherName": "Discount 10%",
    "discountType": "PERCENT",
    "discountValue": 10,
    "discountAmount": 10000,
    "newSubtotal": 90000
  }
}
```

---

### 1.5 Complete Transaction

#### Complete POS Transaction
```
POST /business-logic/pos/transaction/complete
```

**Headers:** `X-Session-Id: <unique-session-id>`

**Body:**
```json
{
  "paymentMethodId": 1,
  "cashAmount": 150000,
  "notes": "optional",
  "useCustomerDeposit": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "transaction": {
      "id": 1,
      "code": "TRX-20260918-0001",
      "date": "2026-09-18T10:00:00Z",
      "customer": "Customer Name",
      "itemCount": 3,
      "subtotal": 100000,
      "total": 100000,
      "cashAmount": 150000,
      "changeAmount": 50000,
      "paymentStatus": "PAID"
    },
    "receipt": {
      "header": "Toko CV IndoMurah",
      "transactionCode": "TRX-20260918-0001",
      "date": "2026-09-18T10:00:00Z",
      "items": [...]
    }
  }
}
```

---

## 2. Receivable (Piutang Pelanggan)

### 2.1 Overview & Listing

#### Get Receivables Overview
```
GET /business-logic/receivable/overview
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customerId | number | No | Filter by customer |
| status | string | No | ACTIVE, OVERDUE, PAID, ALL |
| overdueOnly | boolean | No | Show only overdue |
| startDate | date | No | Start date filter |
| endDate | date | No | End date filter |

#### Get Customer Receivables
```
GET /business-logic/receivable/customer/:customerId
```

#### Get Aging Report
```
GET /business-logic/receivable/aging-report
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| asOfDate | date | No | Report date (default: today) |
| customerGroupId | number | No | Filter by group |
| warehouseId | number | No | Filter by warehouse |

**Response:**
```json
{
  "success": true,
  "data": {
    "asOfDate": "2026-09-18",
    "summary": {
      "totalCustomers": 10,
      "totalReceivable": 5000000,
      "buckets": {
        "CURRENT (0-30)": { "amount": 2000000, "count": 5 },
        "31-60 DAYS": { "amount": 1500000, "count": 3 },
        "61-90 DAYS": { "amount": 1000000, "count": 2 },
        "91-180 DAYS": { "amount": 500000, "count": 1 },
        "180+ DAYS": { "amount": 0, "count": 0 }
      }
    },
    "customers": [...]
  }
}
```

---

### 2.2 Payment Recording

#### Record Payment for Sale
```
POST /business-logic/receivable/sale/:saleId/payment
```

**Body:**
```json
{
  "amount": 50000,
  "paymentMethodId": 1,
  "referenceNumber": "TRF-123456",
  "paymentDate": "2026-09-18",
  "notes": "Payment via transfer"
}
```

#### Record Bulk Payment
```
POST /business-logic/receivable/bulk-payment
```

**Body:**
```json
{
  "customerId": 1,
  "amount": 200000,
  "paymentMethodId": 1,
  "saleIds": [1, 2, 3],
  "referenceNumber": "TRF-789",
  "notes": "Payment for multiple invoices"
}
```

---

### 2.3 Customer Deposit

#### Add Customer Deposit
```
POST /business-logic/receivable/customer/:customerId/deposit
```

**Body:**
```json
{
  "amount": 500000,
  "notes": "Deposit for future purchases"
}
```

#### Use Customer Deposit
```
POST /business-logic/receivable/customer/:customerId/use-deposit/:saleId
```

**Body:**
```json
{
  "amount": 100000
}
```

---

### 2.4 Credit Management

#### Check Credit Availability
```
GET /business-logic/receivable/customer/:customerId/credit-check?amount=500000
```

#### Update Credit Limit
```
PUT /business-logic/receivable/customer/:customerId/credit-limit
```

**Body:**
```json
{
  "creditLimit": 10000000,
  "reason": "Customer promotion"
}
```

---

### 2.5 Reminder & Write-Off

#### Send Payment Reminder
```
POST /business-logic/receivable/reminder
```

**Body:**
```json
{
  "customerId": 1,
  "message": "Please complete your payment",
  "channel": "WHATSAPP"
}
```

#### Write Off Receivable
```
POST /business-logic/receivable/write-off
```

**Body:**
```json
{
  "receivableId": 1,
  "reason": "Customer unreachable",
  "amount": 50000
}
```

---

## 3. Stock Alert (Alert Stok)

### 3.1 Stock Alerts

#### Get Stock Alerts
```
GET /business-logic/stock-alert
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| alertTypeId | number | No | Filter by type |
| warehouseId | number | No | Filter by warehouse |
| unreadOnly | boolean | No | Show unread only |
| unresolvedOnly | boolean | No | Show unresolved only |

#### Get Stock Alert Summary
```
GET /business-logic/stock-alert/summary?warehouseId=1
```

#### Mark Alert as Read
```
PUT /business-logic/stock-alert/:alertId/read
```

#### Resolve Alert
```
PUT /business-logic/stock-alert/:alertId/resolve
```

**Body:**
```json
{
  "notes": "Stock replenished"
}
```

#### Bulk Resolve Alerts
```
PUT /business-logic/stock-alert/resolve-multiple
```

**Body:**
```json
{
  "alertIds": [1, 2, 3],
  "notes": "Bulk resolved"
}
```

---

### 3.2 Stock Level Report

#### Get Stock Level Report
```
GET /business-logic/stock-alert/stock-level-report
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| warehouseId | number | No | Filter by warehouse |
| categoryId | number | No | Filter by category |
| lowStockOnly | boolean | No | Show low stock only |
| outOfStockOnly | boolean | No | Show out of stock only |

---

### 3.3 Reorder Management

#### Get Reorder Suggestion
```
GET /business-logic/stock-alert/reorder-suggestion/:productId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "code": "PROD-001",
      "name": "Product Name",
      "purchasePrice": 8000
    },
    "currentStock": 5,
    "minimumStock": 20,
    "suggestedQuantity": 35,
    "targetStock": 40,
    "estimatedCost": 280000,
    "avgMonthlySales": 50,
    "daysUntilStockout": 3,
    "urgencyLevel": "CRITICAL"
  }
}
```

#### Get Products Needing Reorder
```
GET /business-logic/stock-alert/products-needing-reorder?warehouseId=1
```

#### Create Purchase Order from Reorder
```
POST /business-logic/stock-alert/create-purchase-order
```

**Body:**
```json
{
  "productId": 1,
  "reorderQuantity": 50,
  "supplierId": 1,
  "notes": "Auto reorder"
}
```

#### Check Stock (Scheduler)
```
POST /business-logic/stock-alert/check-stock?warehouseId=1
```

---

## 4. Analytics (Laporan & Analisis)

### 4.1 Dashboard

#### Get Dashboard Summary
```
GET /business-logic/analytics/dashboard
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Start date |
| endDate | date | No | End date |
| warehouseId | number | No | Filter by warehouse |

**Response:**
```json
{
  "success": true,
  "data": {
    "period": { "startDate": "...", "endDate": "..." },
    "summary": {
      "todaySales": 5000000,
      "todayTransactions": 45,
      "lowStockCount": 8,
      "outOfStockCount": 2,
      "overdueReceivables": 1500000
    },
    "recentSales": [...],
    "bestSellers": [...]
  }
}
```

---

### 4.2 Sales Reports

#### Get Sales Report
```
GET /business-logic/analytics/sales-report
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Start date |
| endDate | date | No | End date |
| warehouseId | number | No | Filter by warehouse |
| groupBy | string | No | day, week, month |
| categoryId | number | No | Filter by category |
| customerId | number | No | Filter by customer |

#### Get Sales by Category
```
GET /business-logic/analytics/sales-by-category
```

---

### 4.3 Profit Report

#### Get Profit Report
```
GET /business-logic/analytics/profit-report
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Start date |
| endDate | date | No | End date |
| warehouseId | number | No | Filter by warehouse |
| includeReturns | boolean | No | Include returns |

**Response:**
```json
{
  "success": true,
  "data": {
    "period": { "startDate": "...", "endDate": "..." },
    "summary": {
      "totalRevenue": 10000000,
      "totalCost": 6000000,
      "totalProfit": 4000000,
      "profitMargin": 40
    },
    "byProduct": [
      {
        "productId": 1,
        "productName": "Product A",
        "quantitySold": 100,
        "totalRevenue": 1500000,
        "totalCost": 900000,
        "totalProfit": 600000
      }
    ]
  }
}
```

---

### 4.4 Top Performers

#### Get Top Products
```
GET /business-logic/analytics/top-products
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Start date |
| endDate | date | No | End date |
| limit | number | No | Number of products (default: 10) |
| sortBy | string | No | quantity, revenue, profit |
| categoryId | number | No | Filter by category |

#### Get Top Customers
```
GET /business-logic/analytics/top-customers
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Start date |
| endDate | date | No | End date |
| limit | number | No | Number of customers (default: 10) |
| sortBy | string | No | quantity, revenue |

---

### 4.5 Cash Flow & Tax

#### Get Cash Flow Report
```
GET /business-logic/analytics/cash-flow
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Start date |
| endDate | date | No | End date |
| accountId | number | No | Filter by account |

#### Get Tax Report
```
GET /business-logic/analytics/tax-report
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Start date |
| endDate | date | No | End date |
| taxRate | number | No | Filter by tax rate |

---

### 4.6 Trend Analysis

#### Get Sales Trend
```
GET /business-logic/analytics/sales-trend
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Start date |
| endDate | date | No | End date |
| compareWithPrevious | boolean | No | Compare with previous period |
| categoryId | number | No | Filter by category |

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPeriod": { "startDate": "...", "endDate": "..." },
    "previousPeriod": { "startDate": "...", "endDate": "..." },
    "current": {
      "totalRevenue": 10000000,
      "transactionCount": 100,
      "itemsSold": 500,
      "averageTransaction": 100000
    },
    "previous": {...},
    "changes": {
      "revenue": 15.5,
      "transactionCount": 10.2,
      "itemsSold": 8.3,
      "trend": "UP"
    },
    "dailyBreakdown": [...]
  }
}
```

---

## 5. Inventory (Manajemen Stok)

### 5.1 Stock Transfer

#### Transfer Stock Between Warehouses
```
POST /business-logic/inventory/transfer
```

**Body:**
```json
{
  "fromWarehouseId": 1,
  "toWarehouseId": 2,
  "transferItems": [
    {
      "productId": 1,
      "quantity": 50
    },
    {
      "productId": 2,
      "quantity": 30
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "transfer": {
      "id": 1,
      "code": "TRF-202609-0001",
      "fromWarehouse": "Warehouse A",
      "toWarehouse": "Warehouse B",
      "totalItems": 80,
      "itemCount": 2,
      "status": "COMPLETED"
    }
  }
}
```

---

### 5.2 Stock Adjustment

#### Adjust Stock
```
POST /business-logic/inventory/adjustment
```

**Body:**
```json
{
  "warehouseId": 1,
  "adjustmentType": "STOCK_IN",
  "referenceType": "PURCHASE",
  "referenceId": 1,
  "notes": "Stock received from supplier",
  "adjustmentItems": [
    {
      "productId": 1,
      "quantity": 100,
      "unitPrice": 8000
    }
  ]
}
```

**Adjustment Types:**
- `STOCK_IN` - Goods received
- `STOCK_OUT` - Goods issued/damaged
- `CORRECTION` - Stock correction

---

### 5.3 Stock Opname

#### Perform Stock Opname
```
POST /business-logic/inventory/opname
```

**Body:**
```json
{
  "warehouseId": 1,
  "opnameDate": "2026-09-18",
  "notes": "Monthly stock opname",
  "opnameItems": [
    {
      "productId": 1,
      "systemStock": 100,
      "countedStock": 98,
      "notes": "Found 2 damaged items"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "opname": {
      "id": 1,
      "code": "OPN-202609-0001",
      "warehouse": "Main Warehouse",
      "opnameDate": "2026-09-18",
      "itemCount": 1,
      "totalPositive": 0,
      "totalNegative": 2,
      "status": "COMPLETED"
    }
  }
}
```

---

### 5.4 Inventory Reports

#### Get Stock Movement Report
```
GET /business-logic/inventory/stock-report
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| warehouseId | number | No | Filter by warehouse |
| startDate | date | No | Start date |
| endDate | date | No | End date |

#### Get Stock Valuation Report
```
GET /business-logic/inventory/valuation-report
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| warehouseId | number | No | Filter by warehouse |
| categoryId | number | No | Filter by category |
| valuationMethod | string | No | FIFO, AVERAGE, LIFO |

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalProducts": 100,
      "totalCostValue": 50000000,
      "totalRetailValue": 75000000,
      "totalGrossProfit": 25000000
    },
    "items": [
      {
        "id": 1,
        "code": "PROD-001",
        "name": "Product Name",
        "category": "Electronics",
        "currentStock": 50,
        "purchasePrice": 10000,
        "sellingPrice": 15000,
        "costValue": 500000,
        "retailValue": 750000,
        "grossProfit": 250000
      }
    ]
  }
}
```

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| NOT_FOUND | 404 | Resource not found |
| BAD_REQUEST | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| CONFLICT | 409 | Resource conflict (e.g., duplicate) |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

Business Logic endpoints are subject to rate limiting:
- **Standard endpoints**: 100 requests/minute
- **Report endpoints**: 30 requests/minute
- **Bulk operations**: 10 requests/minute

---

## Notes

1. All monetary values are in Indonesian Rupiah (IDR)
2. All dates are in ISO 8601 format (UTC)
3. Stock operations are transactional and atomic
4. All write operations create audit logs automatically
5. Payment recording automatically updates customer receivable balances

---

## 6. Asset Management (Manajemen Aset Tetap)

### 6.1 Asset CRUD

#### Create Asset
```
POST /business-logic/asset
```

**Body:**
```json
{
  "code": "AST-001",
  "name": "Laptop HP ProBook",
  "purchasePrice": 15000000,
  "purchaseDate": "2026-01-15",
  "usefulLifeYears": 4,
  "location": "Kantor Utama",
  "assignedTo": "John Doe"
}
```

#### List Assets
```
GET /business-logic/asset
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| categoryId | number | No | Filter by category |
| statusId | number | No | Filter by status |
| search | string | No | Search keyword |
| activeOnly | boolean | No | Show active only |

### 6.2 Depreciation

#### Calculate Depreciation
```
GET /business-logic/asset/depreciation/calculate?asOfDate=2026-09-18
```

**Response:**
```json
{
  "success": true,
  "data": {
    "asOfDate": "2026-09-18",
    "assets": [
      {
        "assetId": 1,
        "assetCode": "AST-001",
        "assetName": "Laptop HP ProBook",
        "purchasePrice": 15000000,
        "accumulatedDepreciation": 2812500,
        "bookValue": 12187500,
        "monthlyDepreciation": 312500,
        "remainingLifeMonths": 39
      }
    ],
    "summary": {
      "totalAssets": 5,
      "totalPurchaseValue": 75000000,
      "totalBookValue": 50000000,
      "totalMonthlyDepreciation": 625000
    }
  }
}
```

#### Get Depreciation Report
```
GET /business-logic/asset/reports/depreciation?categoryId=1&asOfDate=2026-09-18
```

#### Get Asset Valuation
```
GET /business-logic/asset/reports/valuation?asOfDate=2026-09-18
```

### 6.3 Asset Operations

#### Dispose Asset
```
POST /business-logic/asset/:id/dispose
```

**Body:**
```json
{
  "date": "2026-09-18",
  "disposalValue": 5000000,
  "reason": "Sold to employee"
}
```

#### Transfer Asset
```
POST /business-logic/asset/:id/transfer
```

**Body:**
```json
{
  "newLocation": "Cabang Surabaya",
  "newAssignedTo": "Jane Doe",
  "notes": "Dipindahkan karena rotasi"
}
```

---

## 7. Cash Management (Manajemen Kas)

### 7.1 Cash In

#### Record Cash In
```
POST /business-logic/cash/in
```

**Body:**
```json
{
  "accountId": 1,
  "amount": 500000,
  "description": "Pembayaran dari pelanggan A",
  "referenceType": "SALE",
  "referenceId": 123
}
```

#### List Cash In
```
GET /business-logic/cash/in/list?startDate=2026-09-01&endDate=2026-09-18
```

### 7.2 Cash Out

#### Record Cash Out
```
POST /business-logic/cash/out
```

**Body:**
```json
{
  "accountId": 1,
  "amount": 200000,
  "description": "Pembelian supplies kantor",
  "referenceType": "EXPENSE",
  "referenceId": 456
}
```

### 7.3 Cash Transfer

#### Transfer Cash Between Accounts
```
POST /business-logic/cash/transfer
```

**Body:**
```json
{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 1000000,
  "description": "Transfer ke rekening operasional"
}
```

### 7.4 Cash Flow Reports

#### Get Cash Balance
```
GET /business-logic/cash/balance?asOfDate=2026-09-18
```

**Response:**
```json
{
  "success": true,
  "data": {
    "asOfDate": "2026-09-18",
    "accounts": [
      {
        "id": 1,
        "code": "CASH-001",
        "name": "Kas Besar",
        "cashIn": 5000000,
        "cashOut": 2000000,
        "balance": 3000000
      }
    ],
    "summary": {
      "totalBalance": 3000000,
      "totalCashIn": 5000000,
      "totalCashOut": 2000000
    }
  }
}
```

#### Get Cash Flow Report
```
GET /business-logic/cash/report/flow?startDate=2026-09-01&endDate=2026-09-18
```

---

## 8. Supplier Debt (Hutang Supplier)

### 8.1 Debt Overview

#### Get Supplier Debt Overview
```
GET /business-logic/supplier-debt/overview
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalDebt": 50000000,
      "totalSuppliers": 10,
      "totalPurchases": 25,
      "overdueDebt": 15000000,
      "overdueCount": 5
    },
    "bySupplier": [
      {
        "supplierId": 1,
        "supplierName": "PT ABC Supplier",
        "totalDebt": 20000000,
        "purchaseCount": 5,
        "overdueAmount": 5000000,
        "overdueCount": 2
      }
    ]
  }
}
```

### 8.2 Supplier Debt Details

#### Get Supplier Debt Details
```
GET /business-logic/supplier-debt/supplier/:supplierId
```

### 8.3 Payment

#### Record Supplier Payment
```
POST /business-logic/supplier-debt/payment
```

**Body:**
```json
{
  "supplierId": 1,
  "amount": 5000000,
  "paymentMethodId": 1,
  "purchaseIds": [1, 2, 3],
  "referenceNumber": "TRF-123456",
  "notes": "Pelunasan Purchase Order September"
}
```

### 8.4 Supplier Deposit

#### Add Supplier Deposit
```
POST /business-logic/supplier-debt/deposit
```

**Body:**
```json
{
  "supplierId": 1,
  "amount": 10000000,
  "notes": "Uang muka purchase order"
}
```

#### Use Supplier Deposit
```
POST /business-logic/supplier-debt/deposit/use
```

**Body:**
```json
{
  "purchaseId": 123,
  "amount": 5000000
}
```

### 8.5 Reports

#### Get Debt Aging Report
```
GET /business-logic/supplier-debt/reports/aging?asOfDate=2026-09-18
```

**Response:**
```json
{
  "success": true,
  "data": {
    "asOfDate": "2026-09-18",
    "summary": {
      "totalDebt": 50000000,
      "totalSuppliers": 10
    },
    "buckets": [
      { "name": "CURRENT (0-30 days)", "amount": 20000000, "count": 10 },
      { "name": "31-60 DAYS", "amount": 15000000, "count": 8 },
      { "name": "61-90 DAYS", "amount": 10000000, "count": 5 },
      { "name": "91-180 DAYS", "amount": 5000000, "count": 2 }
    ]
  }
}
```

---

## 9. Price Management (Manajemen Harga)

### 9.1 Price Update

#### Update Product Selling Price
```
PUT /business-logic/price/:productId/selling
```

**Body:**
```json
{
  "sellingPrice": 150000,
  "reason": "Harga naik karena biaya operasional naik",
  "notes": "Disetujui oleh owner"
}
```

#### Update Product Purchase Price
```
PUT /business-logic/price/:productId/purchase
```

**Body:**
```json
{
  "purchasePrice": 120000,
  "reason": "Harga supplier terbaru"
}
```

### 9.2 Bulk Price Update

#### Bulk Update Prices
```
POST /business-logic/price/bulk-update
```

**Body:**
```json
{
  "updates": [
    { "productId": 1, "sellingPrice": 150000 },
    { "productId": 2, "sellingPrice": 200000 }
  ],
  "reason": "Penyesuaian harga akhir tahun"
}
```

#### Adjust Prices by Percentage
```
POST /business-logic/price/adjust-by-percent
```

**Body:**
```json
{
  "categoryId": 1,
  "adjustmentPercent": 10,
  "adjustmentType": "INCREASE",
  "reason": "Kenaikan harga 10% untuk kategori Electronics"
}
```

### 9.3 Price History

#### Get Price History
```
GET /business-logic/price/history?productId=1&startDate=2026-01-01&endDate=2026-09-18
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "productCode": "PROD-001",
      "productName": "Product Name",
      "type": "SELLING",
      "oldPrice": 100000,
      "newPrice": 120000,
      "changeAmount": 20000,
      "changePercent": 20,
      "changedBy": "admin",
      "changedAt": "2026-09-15T10:00:00Z"
    }
  ]
}
```

#### Get Product Price History
```
GET /business-logic/price/history/:productId
```

### 9.4 Reports

#### Get Price Change Report
```
GET /business-logic/price/reports/change?startDate=2026-09-01&endDate=2026-09-18
```

#### Get Price Analysis
```
GET /business-logic/price/reports/analysis?categoryId=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalProducts": 50,
      "averageMargin": 35.5,
      "increasingCount": 5,
      "decreasingCount": 2,
      "stableCount": 43
    },
    "products": [
      {
        "productId": 1,
        "productName": "Product A",
        "currentPrice": 150000,
        "purchasePrice": 100000,
        "grossMargin": 33.33,
        "markup": 50,
        "priceTrend": "INCREASING",
        "priceChangeCount": 3
      }
    ]
  }
}
```

---

## 22. Stock Mutation (Mutasi Stok)

### 22.1 Mutation Category

#### Create Mutation Category
```
POST /business-logic/stock-mutation/categories
```

**Body:**
```json
{
  "code": "ADJ-IN",
  "name": "Stock Adjustment In",
  "mutationType": "IN",
  "color": "#4CAF50"
}
```

#### List Mutation Categories
```
GET /business-logic/stock-mutation/categories
```

### 22.2 Stock Mutation

#### Create Stock Mutation
```
POST /business-logic/stock-mutation
```

**Body:**
```json
{
  "mutationCategoryId": 1,
  "warehouseId": 1,
  "mutationDate": "2026-09-18",
  "referenceNumber": "ADJ-001",
  "notes": "Stock adjustment for damaged goods",
  "items": [
    {
      "productId": 1,
      "quantity": 5,
      "unitPrice": 10000,
      "notes": "Found 5 damaged units"
    }
  ]
}
```

**Mutation Types:**
- `IN` - Stock masuk (transfer, adjustment positive)
- `OUT` - Stock keluar (mutation negative)
- `ADJUSTMENT` - Koreksi stok
- `TRANSFER` - Transfer antar gudang

#### List Stock Mutations
```
GET /business-logic/stock-mutation
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Start date filter |
| endDate | date | No | End date filter |
| mutationCategoryId | number | No | Filter by category |
| warehouseId | number | No | Filter by warehouse |
| mutationType | string | No | IN, OUT, ADJUSTMENT, TRANSFER |
| search | string | No | Search code or reference |

#### Reverse Stock Mutation
```
POST /business-logic/stock-mutation/:id/reverse
```

**Body:**
```json
{
  "reason": "Mistake in original mutation"
}
```

### 22.3 Mutation Reports

#### Get Mutation Summary
```
GET /business-logic/stock-mutation/report/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": { "startDate": "...", "endDate": "..." },
    "summary": [
      { "type": "IN", "label": "Stock In", "count": 10, "totalAmount": 500000 },
      { "type": "OUT", "label": "Stock Out", "count": 5, "totalAmount": 200000 }
    ]
  }
}
```

#### Get Product Mutation History
```
GET /business-logic/stock-mutation/product/:productId/history
```

---

## 23. Cash Flow (Arus Kas)

### 23.1 Cash Flow Category

#### Create Cash Flow Category
```
POST /business-logic/cash-flow/categories
```

**Body:**
```json
{
  "name": "Penjualan Tunai",
  "type": "INFLOW",
  "color": "#4CAF50"
}
```

**Types:**
- `INFLOW` - Arus masuk (penerimaan kas)
- `OUTFLOW` - Arus keluar (pengeluaran kas)

#### List Cash Flow Categories
```
GET /business-logic/cash-flow/categories
```

### 23.2 Cash Flow Transaction

#### Create Cash Flow Transaction
```
POST /business-logic/cash-flow
```

**Body:**
```json
{
  "categoryId": 1,
  "accountId": 1,
  "transactionDate": "2026-09-18",
  "amount": 500000,
  "referenceNumber": "TRF-123456",
  "description": "Pembayaran dari pelanggan A"
}
```

#### List Cash Flow Transactions
```
GET /business-logic/cash-flow
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Start date filter |
| endDate | date | No | End date filter |
| categoryId | number | No | Filter by category |
| accountId | number | No | Filter by account |
| type | string | No | INFLOW, OUTFLOW |

### 23.3 Cash Flow Reports

#### Get Cash Flow Summary
```
GET /business-logic/cash-flow/report/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalInflow": 5000000,
      "totalOutflow": 3000000,
      "netCashFlow": 2000000
    },
    "byCategory": [
      { "categoryName": "Penjualan", "total": 5000000, "count": 50 }
    ]
  }
}
```

#### Get Cash Flow Projection
```
GET /business-logic/cash-flow/report/projection
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Projection start |
| endDate | date | No | Projection end |
| accountId | number | No | Filter by account |

---

## 24. Service Package (Paket Layanan)

### 24.1 Service Category

#### Create Service Category
```
POST /business-logic/service-package/categories
```

**Body:**
```json
{
  "code": "SVC-GADGET",
  "name": "Service Gadget",
  "defaultLaborCost": 50000
}
```

#### List Service Categories
```
GET /business-logic/service-package/categories
```

### 24.2 Service Package

#### Create Service Package
```
POST /business-logic/service-package
```

**Body:**
```json
{
  "code": "PKG-SCREEN-001",
  "name": "Screen Replacement Package",
  "serviceCategoryId": 1,
  "estimatedDuration": 120,
  "sellingPrice": 350000,
  "items": [
    {
      "productId": 1,
      "itemName": "LCD Replacement",
      "quantity": 1,
      "unitPrice": 150000
    },
    {
      "itemName": "Labor",
      "quantity": 1,
      "unitPrice": 50000
    }
  ]
}
```

#### List Service Packages
```
GET /business-logic/service-package
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| serviceCategoryId | number | No | Filter by category |
| search | string | No | Search by code or name |
| isActive | boolean | No | Show active only |

#### Clone Service Package
```
POST /business-logic/service-package/:id/clone
```

**Body:**
```json
{
  "newCode": "PKG-SCREEN-002",
  "newName": "Screen Replacement Package v2"
}
```

### 24.3 Quote & Calculation

#### Calculate Package Quote
```
POST /business-logic/service-package/quote
```

**Body:**
```json
{
  "packageId": 1,
  "quantity": 1,
  "discountPercent": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "packageName": "Screen Replacement Package",
    "quantity": 1,
    "calculation": {
      "itemSubtotal": 200000,
      "laborCost": 50000,
      "totalCost": 250000,
      "sellingPrice": 350000,
      "discountAmount": 35000,
      "finalPrice": 315000,
      "profit": 65000,
      "profitMargin": 20.63
    }
  }
}
```

#### Compare Packages
```
POST /business-logic/service-package/compare
```

**Body:**
```json
{
  "packageIds": [1, 2, 3]
}
```

#### Get Packages by Category with Quick Quote
```
GET /business-logic/service-package/category/:categoryId/packages
```
