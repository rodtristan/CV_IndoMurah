// Product units (ProductUnit) and price tiers (ProductPrice) — shared by the item form
// (master/items) and the cashier (sale/pos).
//
// Storage convention (same as api product-import):
//   STANDARD            = harga jual normal / Level 1, per unit
//   LEVEL2..LEVEL4      = harga jual level 2-4, per unit
//   QTY1..QTY4          = harga per jumlah: berlaku bila MinQuantity < qty <= MaxQuantity
//                         (MinQuantity null = tanpa batas bawah, MaxQuantity null = "dan seterusnya")
// Quantities for QTY tiers are expressed in the tier's own unit.

import { api } from "@/lib/api-client";

export interface ProductUnitInfo {
  unitId: number;
  unitName?: string;
  conversion: number;
  isBase: boolean;
  isSell: boolean;
  isPurchase: boolean;
}

export interface ProductPriceInfo {
  id: number;
  unitId: number;
  priceType: string;
  price: number;
  minQty: number | null;
  maxQty: number | null;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export type PriceLevel = 1 | 2 | 3 | 4;

const n = (v: unknown) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

export async function fetchProductUnits(productId: number): Promise<ProductUnitInfo[]> {
  const res = await api.get<{ Units?: Record<string, unknown>[] }>(
    `business-logic/product-unit/product/${productId}`, undefined, { skipCache: true });
  return (res.data?.Units ?? []).map((u) => ({
    unitId: n(u.UnitId),
    unitName: (u.UnitName as string | undefined) ?? undefined,
    conversion: n(u.conversionValue) || 1,
    isBase: Boolean(u.isBase),
    isSell: u.isSell !== false,
    isPurchase: u.isPurchase !== false,
  }));
}

export async function fetchProductPrices(productId: number): Promise<ProductPriceInfo[]> {
  const res = await api.get<{ Prices?: Record<string, unknown>[] }>(
    `business-logic/product-price/product/${productId}`, undefined, { skipCache: true });
  return (res.data?.Prices ?? []).map((p) => ({
    id: n(p.ID),
    unitId: n(p.UnitId),
    priceType: String(p.PriceType ?? "STANDARD").toUpperCase(),
    price: n(p.Price),
    minQty: p.minQuantity == null ? null : n(p.minQuantity),
    maxQty: p.maxQuantity == null ? null : n(p.maxQuantity),
    isActive: p.IsActive !== false,
    startDate: (p.startDate as string | null | undefined) ?? null,
    endDate: (p.endDate as string | null | undefined) ?? null,
  }));
}

/**
 * Customer "level harga". The Customer model has no level column, so the level is read
 * from the customer group: a group whose Code/Name contains "LEVEL 2" / "LV2" / "HARGA 3"
 * etc. uses that level; every other group uses level 1 (harga standar). The cashier can
 * still override it per transaction.
 */
export function levelFromGroup(group?: { Code?: string | null; Name?: string | null } | null): PriceLevel {
  const text = `${group?.Code ?? ""} ${group?.Name ?? ""}`;
  const m = /(?:level|lvl|lv|harga)[\s_-]*([1-4])\b/i.exec(text);
  return m ? (Number(m[1]) as PriceLevel) : 1;
}

function activeNow(p: ProductPriceInfo, now: Date): boolean {
  if (!p.isActive) return false;
  if (p.startDate && new Date(p.startDate) > now) return false;
  if (p.endDate && new Date(p.endDate) < now) return false;
  return true;
}

export interface ResolvedPrice {
  price: number;
  /** e.g. "STANDARD", "LEVEL3", "QTY2", or "DEFAULT" (Product.SellingPrice x konversi) */
  source: string;
}

/** Picks the unit price for `qty` of `unitId` at the given level. */
export function resolveUnitPrice(opts: {
  prices: ProductPriceInfo[];
  unitId: number;
  qty: number;
  level: PriceLevel;
  /** Product.SellingPrice (per base unit) */
  baseSellingPrice: number;
  /** conversion of `unitId` to the base unit */
  conversion: number;
}): ResolvedPrice {
  const now = new Date();
  const forUnit = opts.prices.filter((p) => p.unitId === opts.unitId && activeNow(p, now));

  const qtyTiers = forUnit
    .filter((p) => /^QTY\d+$/.test(p.priceType) && p.price > 0)
    .sort((a, b) => n(a.priceType.slice(3)) - n(b.priceType.slice(3)));
  if (qtyTiers.length) {
    const hit = qtyTiers.find((t) => (t.minQty == null || opts.qty > t.minQty) && (t.maxQty == null || opts.qty <= t.maxQty));
    if (hit) return { price: hit.price, source: hit.priceType };
    // Above the highest range: keep the last (largest) tier.
    const last = [...qtyTiers].sort((a, b) => n(b.maxQty) - n(a.maxQty))[0];
    if (last && opts.qty > n(last.maxQty)) return { price: last.price, source: last.priceType };
  }

  if (opts.level > 1) {
    const lv = forUnit.find((p) => p.priceType === `LEVEL${opts.level}` && p.price > 0);
    if (lv) return { price: lv.price, source: lv.priceType };
  }
  const std = forUnit.find((p) => p.priceType === "STANDARD");
  if (std) return { price: std.price, source: "STANDARD" };
  return { price: opts.baseSellingPrice * (opts.conversion || 1), source: "DEFAULT" };
}

// ─── Saving (item form) ─────────────────────────────────────────────────

export interface UnitToSave {
  unitId: number;
  conversion: number;
  isBase: boolean;
  isSell: boolean;
  isPurchase: boolean;
}
export interface PriceToSave {
  unitId: number;
  priceType: string;
  price: number;
  minQty?: number | null;
  maxQty?: number | null;
}

/**
 * Replaces the product's unit configuration and price tiers:
 * units are replaced as a set (API deletes + recreates), prices are upserted per
 * (unit, type) and any stored tier that is no longer wanted is deleted.
 */
export async function saveUnitsAndPrices(productId: number, units: UnitToSave[], prices: PriceToSave[]): Promise<void> {
  await api.post("business-logic/product-unit", {
    ProductId: productId,
    Units: units.map((u) => ({
      ProductId: productId,
      UnitId: u.unitId,
      isBase: u.isBase,
      ConversionValue: u.isBase ? 1 : u.conversion,
      isPrimary: u.isBase,
      isSell: u.isSell,
      isPurchase: u.isPurchase,
    })),
  });

  for (const p of prices) {
    const body: Record<string, unknown> = {
      ProductId: productId, UnitId: p.unitId, PriceType: p.priceType, Price: Math.max(0, p.price), IsActive: 1,
    };
    // API validators: MinQuantity/MaxQuantity must be >= 1 when sent; omitted = no bound.
    if (p.minQty != null && p.minQty >= 1) body.MinQuantity = p.minQty;
    if (p.maxQty != null && p.maxQty >= 1) body.MaxQuantity = p.maxQty;
    await api.post("business-logic/product-price", body);
  }

  const wanted = new Set(prices.map((p) => `${p.unitId}|${p.priceType}`));
  const existing = await fetchProductPrices(productId);
  for (const e of existing) {
    if (!wanted.has(`${e.unitId}|${e.priceType}`)) await api.delete("business-logic/product-price", e.id);
  }
}
