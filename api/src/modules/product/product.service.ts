import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import type { ODataQuery } from '../../common/templates/model-metadata';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService extends BaseService<
  any,
  CreateProductDto,
  UpdateProductDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'product',
      primaryKey: 'ID',
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { CreatedAt: 'desc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: true,
      softDeleteField: 'IsActive',
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC METHODS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Daftar Item Ketoko: kolom Stok mengikuti pilihan Dept/Gudang.
   * `$warehouse=<ID>` → tiap baris diberi `WarehouseStock` (stok di gudang itu, 0 bila belum ada);
   * tanpa parameter, `WarehouseStock` = total stok semua gudang (Product.Stock).
   */
  async findAll(query: ODataQuery = {}) {
    const { $warehouse, ...rest } = query as ODataQuery & { $warehouse?: string };
    const result: any = await super.findAll(rest);
    const rows: any[] = result?.data ?? [];
    const whId = Number($warehouse);
    if (!rows.length) return result;
    if (!Number.isInteger(whId) || whId <= 0) {
      return { ...result, data: rows.map((r) => ({ ...r, WarehouseStock: r.Stock })) };
    }
    const stocks = await this.prisma.productStock.findMany({
      where: { WarehouseID: whId, ProductID: { in: rows.map((r) => r.ID) } },
      select: { ProductID: true, Quantity: true },
    });
    const byId = new Map(stocks.map((x) => [x.ProductID, x.Quantity]));
    return { ...result, data: rows.map((r) => ({ ...r, WarehouseStock: byId.get(r.ID) ?? 0 })) };
  }

  /**
   * Stock Minimum Ketoko: item yang stoknya ≤ batas minimum. Per Dept/Gudang memakai stok gudang dan
   * minimum gudang (bila diisi) atau minimum master item.
   */
  async minimumStock(q: Record<string, string>) {
    const where: any = { IsActive: true };
    if (q.itemFrom || q.itemTo) where.Code = { ...(q.itemFrom ? { gte: String(q.itemFrom) } : {}), ...(q.itemTo ? { lte: String(q.itemTo) } : {}) };
    if (q.supplierId) where.SupplierID = Number(q.supplierId);
    if (q.categoryId) where.CategoryID = Number(q.categoryId);
    const whId = q.warehouseId ? Number(q.warehouseId) : null;
    const products = await this.prisma.product.findMany({
      where,
      select: {
        ID: true, Code: true, Name: true, Stock: true, MinimumStock: true,
        Unit: { select: { Name: true } }, Supplier: { select: { Code: true, Name: true } }, Category: { select: { Name: true } },
        ...(whId ? { ProductStocks: { where: { WarehouseID: whId }, select: { Quantity: true, MinimumStock: true } } } : {}),
      },
    });
    const rows = products
      .map((p: any) => {
        const ps = whId ? p.ProductStocks?.[0] : null;
        const stock = whId ? Number(ps?.Quantity ?? 0) : Number(p.Stock);
        const min = whId && Number(ps?.MinimumStock ?? 0) > 0 ? Number(ps.MinimumStock) : Number(p.MinimumStock);
        return {
          ID: p.ID, Code: p.Code, Name: p.Name, Unit: p.Unit?.Name ?? '', Category: p.Category?.Name ?? '',
          Stock: stock, MinimumStock: min, Shortage: Math.round((min - stock) * 1000) / 1000,
          Supplier: p.Supplier ? `${p.Supplier.Code} - ${p.Supplier.Name}` : '',
        };
      })
      .filter((r) => r.MinimumStock > 0 && r.Stock <= r.MinimumStock);
    const key = (['Code', 'Name', 'Stock', 'MinimumStock', 'Shortage', 'Supplier'].includes(q.sort) ? q.sort : 'Code') as keyof (typeof rows)[number];
    const dir = q.dir === 'desc' ? -1 : 1;
    rows.sort((a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0));
    return rows;
  }

}
