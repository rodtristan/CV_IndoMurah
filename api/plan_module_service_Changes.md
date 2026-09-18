# Plan: SQL Standard Methods untuk Semua Module Services

## Tujuan
Memastikan semua services di modules (kecuali auth) memiliki method-method SQL standar untuk operasi CRUD.

## Method SQL Standar yang Dibutuhkan

| Method | Deskripsi |
|--------|-----------|
| `getCount` | Hitung total data dengan filter |
| `findByField` | Ambil data berdasarkan field tertentu |
| `upsert` | Insert atau update berdasarkan unique constraint |
| `upsertBulk` | Bulk upsert untuk multiple items |
| `createMany` | Buat banyak record sekaligus |
| `updateMany` | Update banyak record berdasarkan IDs |
| `deleteMany` | Delete banyak record berdasarkan IDs |

---

## Services yang SUDAH Extends BaseService (~75 services)

Services ini **sudah memiliki** semua method SQL standar karena mewarisi dari `BaseService`:

```
extends BaseService → semua method sudah diwariskan:
- findAll, getCount, findById, findByField
- create, createBulk
- patchById, patchByFilterReference, patchBulk
- deleteById, deleteByFilterReference, deleteBulk
- upsert, upsertByFilterReference, upsertBulk
```

**Daftar services:**
- account, activity-log, asset, asset-category, attendance, brand, brand-logo
- cash-in, cash-out, cash-transfer, category, company, customer, customer-deposit
- daily-sales-summary, department, employee, expense, expense-category
- journal, journal-entry, leave, leave-balance, loan, loan-installment, log
- monthly-sales-summary, notification, notification-setting, numbering
- payroll, point-redemption, point-setting, position, price-history
- product, product-barcode, product-group, product-image, product-stock
- production, production-item, purchase-item, purchase-order-item, purchase-return-item
- role-menu, sale-item, sale-point, sale-return-item, sales-person
- service, service-item, shelf, shelf-product, stock-alert
- stock-in, stock-in-item, stock-opname, stock-opname-item
- stock-out, stock-out-item, stock-transfer, stock-transfer-item
- supplier, supplier-deposit, tax, testing, transfer, unit, user-menu, user-role, voucher, warehouse

---

## Services yang BUTUH Method SQL Standar (11 services)

Services berikut **BELUM memiliki** method SQL standar dan perlu ditambahkan:

### 1. RoleService (`src/modules/role/role-service.ts`)
**Methods yang perlu ditambahkan:**
- `getCount(query)` - Count records dengan filter
- `findByField(field, value, query)` - Find by any field
- `upsert(where, createData, updateData)` - Insert or update
- `upsertBulk(items[])` - Bulk upsert
- `createMany(data[])` - Create many records
- `updateMany(ids[], data)` - Update many by IDs
- `deleteMany(ids[], softDelete?)` - Delete many by IDs

### 2. MenuService (`src/modules/menu/menu-service.ts`)
**Methods yang perlu ditambahkan:**
- `getCount(query)` - Count records dengan filter
- `findByField(field, value, query)` - Find by any field
- `upsert(where, createData, updateData)` - Insert or update
- `upsertBulk(items[])` - Bulk upsert
- `createMany(data[])` - Create many records
- `updateMany(ids[], data)` - Update many by IDs
- `deleteMany(ids[], softDelete?)` - Delete many by IDs (soft delete)

### 3. UserService (`src/modules/user/user-service.ts`)
**Methods yang perlu ditambahkan:**
- `getCount(query)` - Count records dengan filter
- `findByField(field, value, query)` - Find by any field
- `upsert(where, createData, updateData)` - Insert or update
- `upsertBulk(items[])` - Bulk upsert
- `createMany(data[])` - Create many records
- `updateMany(ids[], data)` - Update many by IDs
- `deleteMany(ids[], softDelete?)` - Delete many by IDs (soft delete)

### 4. PurchaseService (`src/modules/purchase/purchase.service.ts`)
**Methods yang perlu ditambahkan:**
- `getCount(query)` - Count records dengan filter
- `findByField(field, value, query)` - Find by any field
- `upsert(where, createData, updateData)` - Insert or update
- `upsertBulk(items[])` - Bulk upsert
- `createMany(dtos[], userId)` - Create many records
- `updateMany(ids[], data)` - Update many by IDs
- `deleteMany(ids[])` - Delete many by IDs

### 5. SaleService (`src/modules/sale/sale.service.ts`)
**Methods yang perlu ditambahkan:**
- `getCount(query)` - Count records dengan filter
- `findByField(field, value, query)` - Find by any field
- `upsert(where, createData, updateData)` - Insert or update
- `upsertBulk(items[])` - Bulk upsert
- `createMany(dtos[], userId)` - Create many records
- `updateMany(ids[], data)` - Update many by IDs
- `deleteMany(ids[])` - Delete many by IDs

### 6. PurchaseOrderService (`src/modules/purchase-order/purchase-order.service.ts`)
**Methods yang perlu ditambahkan:**
- `getCount(query)` - Count records dengan filter
- `findByField(field, value, query)` - Find by any field
- `upsert(where, createData, updateData)` - Insert or update
- `upsertBulk(items[])` - Bulk upsert
- `createMany(dtos[], userId)` - Create many records
- `updateMany(ids[], data)` - Update many by IDs
- `deleteMany(ids[])` - Delete many by IDs

### 7. SaleOrderService (`src/modules/sale-order/sale-order.service.ts`)
**Methods yang perlu ditambahkan:**
- `getCount(query)` - Count records dengan filter
- `findByField(field, value, query)` - Find by any field
- `upsert(where, createData, updateData)` - Insert or update
- `upsertBulk(items[])` - Bulk upsert
- `createMany(dtos[], userId)` - Create many records
- `updateMany(ids[], data)` - Update many by IDs
- `deleteMany(ids[])` - Delete many by IDs

### 8. PurchasePaymentService (`src/modules/purchase-payment/purchase-payment.service.ts`)
**Methods yang perlu ditambahkan:**
- `getCount(query)` - Count records dengan filter
- `findByField(field, value, query)` - Find by any field
- `upsert(where, createData, updateData)` - Insert or update
- `upsertBulk(items[])` - Bulk upsert
- `createMany(dtos[], userId)` - Create many records
- `updateMany(ids[], data)` - Update many by IDs
- `deleteMany(ids[])` - Delete many by IDs

### 9. SalePaymentService (`src/modules/sale-payment/sale-payment.service.ts`)
**Methods yang perlu ditambahkan:**
- `getCount(query)` - Count records dengan filter
- `findByField(field, value, query)` - Find by any field
- `upsert(where, createData, updateData)` - Insert or update
- `upsertBulk(items[])` - Bulk upsert
- `createMany(dtos[], userId)` - Create many records
- `updateMany(ids[], data)` - Update many by IDs
- `deleteMany(ids[])` - Delete many by IDs

### 10. PurchaseReturnService (`src/modules/purchase-return/purchase-return.service.ts`)
**Methods yang perlu ditambahkan:**
- `getCount(query)` - Count records dengan filter
- `findByField(field, value, query)` - Find by any field
- `upsert(where, createData, updateData)` - Insert or update
- `upsertBulk(items[])` - Bulk upsert
- `createMany(dtos[], userId)` - Create many records
- `updateMany(ids[], data)` - Update many by IDs
- `deleteMany(ids[])` - Delete many by IDs

### 11. SaleReturnService (`src/modules/sale-return/sale-return.service.ts`)
**Methods yang perlu ditambahkan:**
- `getCount(query)` - Count records dengan filter
- `findByField(field, value, query)` - Find by any field
- `upsert(where, createData, updateData)` - Insert or update
- `upsertBulk(items[])` - Bulk upsert
- `createMany(dtos[], userId)` - Create many records
- `updateMany(ids[], data)` - Update many by IDs
- `deleteMany(ids[])` - Delete many by IDs

---

## Services yang TIDAK Perlu Diubah

- **DashboardService** - Service khusus dashboard analytics (read-only)
- **ReportService** - Service khusus laporan (read-only)

---

## Contoh Implementasi

### Pattern untuk RoleService:

```typescript
/**
 * GET /count — Count total records with filter
 */
async getCount(query: Record<string, any> = {}): Promise<{ count: number }> {
  const pq = this.queryService.buildPrismaQuery(query, {
    searchableFields: ['roleName', 'roleDescription'],
  });
  const count = await this.prisma.role.count({ where: pq.where });
  return { count };
}

/**
 * GET /by/:field/:value — Find by any field
 */
async findByField(field: string, value: any, query: Record<string, any> = {}): Promise<any | null> {
  const pq = this.queryService.buildPrismaQuery(query, { allowedIncludes: ['users'] });
  const findArgs: any = {
    where: { [field]: value },
    ...(pq.select ? { select: pq.select } : {}),
    ...(pq.include ? { include: pq.include } : {}),
  };
  return this.prisma.role.findFirst(findArgs);
}

/**
 * UPSERT — Insert or update by unique field
 */
async upsert(where: any, createData: any, updateData: any): Promise<any> {
  const result = await this.prisma.role.upsert({
    where,
    create: createData,
    update: updateData,
  });
  await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
  return result;
}

/**
 * UPSERT /bulk — Bulk upsert
 */
async upsertBulk(items: { where: any; create: any; update: any }[]): Promise<BulkOperationResult<any>> {
  const success: any[] = [];
  const failed: { data?: any; error: string }[] = [];

  for (const item of items) {
    try {
      const result = await this.prisma.role.upsert({
        where: item.where,
        create: item.create,
        update: item.update,
      });
      success.push(result);
    } catch (error) {
      failed.push({
        data: item,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (success.length > 0) {
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
  }

  return { success, failed, total: items.length, successCount: success.length, failedCount: failed.length };
}

/**
 * POST /bulk — Create many records
 */
async createMany(data: any[]): Promise<BulkOperationResult<any>> {
  const success: any[] = [];
  const failed: { data?: any; error: string }[] = [];

  for (const item of data) {
    try {
      const result = await this.prisma.role.create({ data: item });
      success.push(result);
    } catch (error) {
      failed.push({
        data: item,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (success.length > 0) {
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
  }

  return { success, failed, total: data.length, successCount: success.length, failedCount: failed.length };
}

/**
 * PATCH /bulk — Update many records by IDs
 */
async updateMany(ids: number[], data: any): Promise<BulkOperationResult<any>> {
  const success: any[] = [];
  const failed: { id?: number; error: string }[] = [];

  for (const id of ids) {
    try {
      const role = await this.prisma.role.findUnique({ where: { id } });
      if (!role) {
        failed.push({ id, error: 'Not found' });
        continue;
      }
      const result = await this.prisma.role.update({ where: { id }, data });
      success.push(result);
    } catch (error) {
      failed.push({ id, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  if (success.length > 0) {
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
  }

  return { success, failed, total: ids.length, successCount: success.length, failedCount: failed.length };
}

/**
 * DELETE /bulk — Delete many records by IDs
 */
async deleteMany(ids: number[], softDelete = true): Promise<BulkOperationResult<any>> {
  const success: any[] = [];
  const failed: { id?: number; error: string }[] = [];

  for (const id of ids) {
    try {
      const role = await this.prisma.role.findUnique({ where: { id } });
      if (!role) {
        failed.push({ id, error: 'Not found' });
        continue;
      }

      let result: any;
      if (softDelete) {
        result = await this.prisma.role.update({ where: { id }, data: { isActive: false } });
      } else {
        result = await this.prisma.role.delete({ where: { id } });
      }
      success.push(result);
    } catch (error) {
      failed.push({ id, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  if (success.length > 0) {
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
  }

  return { success, failed, total: ids.length, successCount: success.length, failedCount: failed.length };
}
```

### BulkOperationResult Type:

```typescript
interface BulkOperationResult<T> {
  success: T[];
  failed: { data?: any; id?: any; error: string }[];
  total: number;
  successCount: number;
  failedCount: number;
}
```

---

## Checklist Implementasi

- [ ] RoleService - Tambah semua method SQL standar
- [ ] MenuService - Tambah semua method SQL standar
- [ ] UserService - Tambah semua method SQL standar
- [ ] PurchaseService - Tambah semua method SQL standar
- [ ] SaleService - Tambah semua method SQL standar
- [ ] PurchaseOrderService - Tambah semua method SQL standar
- [ ] SaleOrderService - Tambah semua method SQL standar
- [ ] PurchasePaymentService - Tambah semua method SQL standar
- [ ] SalePaymentService - Tambah semua method SQL standar
- [ ] PurchaseReturnService - Tambah semua method SQL standar
- [ ] SaleReturnService - Tambah semua method SQL standar
- [ ] Verifikasi dengan TypeScript compile
- [ ] Test endpoints untuk setiap method baru

---

## Tanggal Dibuat
2026-09-17

## Status
**REVERTED** - Perubahan di-revert sementara, menunggu approval untuk implementasi ulang.
