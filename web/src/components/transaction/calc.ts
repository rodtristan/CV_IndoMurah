// Shared math + types for the full-page transaction forms (pembelian, penjualan, retur).

export type TaxMode = "NON" | "INCLUDE" | "EXCLUDE";

export interface LineItem {
  key: string;
  productId: number;
  code: string;
  name: string;
  unitId: number;
  unitName: string;
  qty: string;
  price: string;
  discPercent: string;
  discAmount: string;
  /** stock / max returnable qty shown as a hint next to the qty cell */
  maxQty?: number;
  stock?: number;
}

export type TierDiscount = { key: string; percent: string; amount: string };

export interface TotalsInput {
  items: LineItem[];
  discPercent: string;
  discAmount: string;
  tiers: TierDiscount[];
  taxMode: TaxMode;
  taxPercent: string;
  otherCost: string;
  otherCostAdds: boolean;
}

export const num = (v: string | number | null | undefined): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

let seq = 0;
export const newKey = () => `r${Date.now().toString(36)}${(seq++).toString(36)}`;

/** Effective nominal discount of a line: explicit Rp wins, otherwise the percentage of gross. */
export function lineDiscount(l: LineItem): number {
  const gross = num(l.qty) * num(l.price);
  const amt = num(l.discAmount);
  return amt > 0 ? Math.min(amt, gross) : (gross * num(l.discPercent)) / 100;
}

export const lineSubtotal = (l: LineItem) => num(l.qty) * num(l.price) - lineDiscount(l);

export function computeTotals(t: TotalsInput) {
  const subtotal = t.items.reduce((s, l) => s + lineSubtotal(l), 0);
  let base = subtotal;
  base -= (base * num(t.discPercent)) / 100;
  for (const tier of t.tiers) {
    base -= (base * num(tier.percent)) / 100;
    base -= num(tier.amount);
  }
  base -= num(t.discAmount);
  base = Math.max(0, base);
  const discount = subtotal - base;
  const rate = num(t.taxPercent);
  let tax = 0;
  if (t.taxMode === "EXCLUDE") tax = (base * rate) / 100;
  else if (t.taxMode === "INCLUDE") tax = base - base / (1 + rate / 100);
  const other = num(t.otherCost);
  const total = base + (t.taxMode === "EXCLUDE" ? tax : 0) + (t.otherCostAdds ? other : 0);
  return { subtotal, discount, afterDiscount: base, tax, other, total };
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
export const todayStr = () => new Date().toISOString().split("T")[0];
export const toDateInput = (v?: string | null) => (v ? String(v).split("T")[0] : "");
