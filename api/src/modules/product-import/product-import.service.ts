import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma-service';

export interface ImportUnitDto {
  unit: string; // unit Code or Name
  barcode?: string;
  conversion?: number; // qty of base unit in 1 of this unit (unit 1 = 1)
  purchasePrice?: number;
  sellingPrice?: number;
  levelPrices?: number[]; // level 1..4
  qtyTiers?: { upTo: number; price: number }[]; // tiered by quantity
}

export interface ImportItemDto {
  code: string;
  name: string;
  barcode?: string;
  category?: string;
  brand?: string;
  warehouse?: string;
  stock?: number;
  minStock?: number;
  description?: string;
  units: ImportUnitDto[];
}

export interface ImportBody {
  variant: 'unit' | 'level' | 'qty';
  items: ImportItemDto[];
}

const D = (n: unknown) => new Prisma.Decimal(Number(n) || 0);
const eq = (a?: string | null, b?: string | null) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

@Injectable()
export class ProductImportService {
  constructor(private readonly prisma: PrismaService) {}

  async import(body: ImportBody) {
    const [units, cats, brands, whs] = await Promise.all([
      this.prisma.unit.findMany(),
      this.prisma.category.findMany(),
      this.prisma.brand.findMany(),
      this.prisma.warehouse.findMany({ orderBy: { ID: 'asc' } }),
    ]);
    const findBy = <T extends { Code: string; Name: string }>(list: T[], v?: string) =>
      v ? list.find((x) => eq(x.Code, v) || eq(x.Name, v)) : undefined;

    let successCount = 0;
    const failed: { data: unknown; error: string }[] = [];

    for (const it of body.items ?? []) {
      try {
        if (!it.code?.trim() || !it.name?.trim()) throw new Error('Kode Item dan Nama Item wajib diisi');
        if (!it.units?.length) throw new Error('Satuan 1 wajib diisi');
        if (it.units.length > 4) throw new Error('Maksimum 4 satuan');
        const resolved = it.units.map((u) => {
          const unit = findBy(units, u.unit);
          if (!unit) throw new Error(`Satuan '${u.unit}' tidak ditemukan`);
          return { u, unit };
        });
        if (new Set(resolved.map((r) => r.unit.ID)).size !== resolved.length) throw new Error('Satuan tidak boleh duplikat');
        const wh = it.warehouse ? findBy(whs, it.warehouse) : whs.find((w) => w.IsDefault) ?? whs[0];
        if (it.warehouse && !wh) throw new Error(`Kantor/Gudang '${it.warehouse}' tidak ditemukan`);
        const base = resolved[0];

        await this.prisma.$transaction(async (tx) => {
          if (await tx.product.findUnique({ where: { Code: it.code.trim() } })) throw new Error(`Kode item '${it.code}' sudah ada`);
          const stock = Number(it.stock) || 0;
          const product = await tx.product.create({
            data: {
              Code: it.code.trim(), Name: it.name.trim(), Barcode: it.barcode || base.u.barcode || null,
              CategoryID: findBy(cats, it.category)?.ID ?? null, BrandID: findBy(brands, it.brand)?.ID ?? null,
              UnitID: base.unit.ID, WarehouseID: wh?.ID ?? null,
              PurchasePrice: D(base.u.purchasePrice),
              SellingPrice: D(body.variant === 'level' ? base.u.levelPrices?.[0] ?? base.u.sellingPrice : base.u.sellingPrice ?? base.u.qtyTiers?.[0]?.price),
              Stock: D(stock), MinimumStock: D(it.minStock), Description: it.description || null,
            },
          });
          for (let i = 0; i < resolved.length; i++) {
            const { u, unit } = resolved[i];
            await tx.productUnit.create({
              data: {
                ProductID: product.ID, UnitID: unit.ID, IsBase: i === 0, IsPrimary: i === 0,
                ConversionValue: D(i === 0 ? 1 : u.conversion || 1),
              },
            });
            const sell = body.variant === 'level' ? u.levelPrices?.[0] ?? u.sellingPrice : u.sellingPrice;
            await tx.productPrice.create({ data: { ProductID: product.ID, UnitID: unit.ID, PriceType: 'STANDARD', Price: D(sell ?? u.qtyTiers?.[0]?.price) } });
            if (body.variant === 'level') {
              for (let lv = 1; lv < 4; lv++) {
                const price = u.levelPrices?.[lv];
                if (price && price > 0) await tx.productPrice.create({ data: { ProductID: product.ID, UnitID: unit.ID, PriceType: `LEVEL${lv + 1}`, Price: D(price) } });
              }
            }
            if (body.variant === 'qty') {
              let prev = 0;
              const tiers = (u.qtyTiers ?? []).filter((t) => t.upTo > 0 && t.price > 0);
              for (let n = 0; n < tiers.length; n++) {
                await tx.productPrice.create({
                  data: { ProductID: product.ID, UnitID: unit.ID, PriceType: `QTY${n + 1}`, Price: D(tiers[n].price), MinQuantity: D(prev), MaxQuantity: D(tiers[n].upTo) },
                });
                prev = tiers[n].upTo;
              }
            }
          }
          if (wh && stock !== 0) {
            await tx.productStock.upsert({
              where: { ProductID_WarehouseID: { ProductID: product.ID, WarehouseID: wh.ID } },
              update: { Quantity: D(stock) },
              create: { ProductID: product.ID, WarehouseID: wh.ID, Quantity: D(stock), MinimumStock: D(it.minStock) },
            });
          }
        });
        successCount++;
      } catch (e) {
        failed.push({ data: { code: it?.code, name: it?.name }, error: e instanceof Error ? e.message : String(e) });
      }
    }
    return { successCount, failedCount: failed.length, failed };
  }
}
