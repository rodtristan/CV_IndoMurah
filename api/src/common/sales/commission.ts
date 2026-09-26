// ================================================================
// commission.ts — Komisi Sales per faktur penjualan (Master Sales → Komisi)
// ================================================================
// Sistem komisi (SalesPerson.CommissionSystem):
//   INVOICE_TOTAL : dari total faktur sebelum pajak (DPP)
//   ITEM_PRICE    : per barang dari harga jual (subtotal baris)
//   PER_ITEM      : komisi nominal per item dari master item (Product.SalesCommission × qty dasar)
//   NONE          : tanpa komisi
// Jenis (CommissionType): PERCENT (%), NOMINAL (Rp per faktur / per qty), TIME_PERCENT
// (persentase menurut lama pelunasan: hari ke X s/d Y → %).
// Komisi retur = komisi × (total retur / total faktur).
// ================================================================

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

export interface CommissionSales {
  CommissionSystem: string;
  CommissionType: string;
  CommissionPercent: unknown;
  CommissionNominal: unknown;
  CommissionTiers: unknown;
}

export interface CommissionSale {
  Date: Date;
  Total: unknown;
  TaxAmount: unknown;
  SaleItems: { Quantity: unknown; BaseQuantity: unknown; Subtotal: unknown; Product?: { SalesCommission: unknown } | null }[];
}

/** Persentase untuk jenis "Persentase waktu" berdasar lama hari pelunasan. */
export function tierPercent(tiers: unknown, days: number): number {
  if (!Array.isArray(tiers)) return 0;
  for (const t of tiers as { fromDay?: number; toDay?: number; percent?: number }[]) {
    const from = Number(t.fromDay ?? 0);
    const to = Number(t.toDay ?? 0);
    if (days >= from && (to <= 0 || days <= to)) return Number(t.percent ?? 0);
  }
  return 0;
}

export function computeCommission(sale: CommissionSale, sp: CommissionSales, paidAt?: Date | null): number {
  const system = sp.CommissionSystem ?? 'NONE';
  if (system === 'NONE') return 0;
  const type = sp.CommissionType ?? 'PERCENT';
  const pct = Number(sp.CommissionPercent ?? 0);
  const nominal = Number(sp.CommissionNominal ?? 0);
  const days = paidAt ? Math.max(Math.floor((paidAt.getTime() - new Date(sale.Date).getTime()) / 86400000), 0) : 0;
  const rate = type === 'TIME_PERCENT' ? tierPercent(sp.CommissionTiers, days) : pct;

  if (system === 'PER_ITEM') {
    return r2(sale.SaleItems.reduce((a, i) => a + Number(i.Product?.SalesCommission ?? 0) * Number(Number(i.BaseQuantity) > 0 ? i.BaseQuantity : i.Quantity), 0));
  }
  if (system === 'ITEM_PRICE') {
    if (type === 'NOMINAL') return r2(nominal * sale.SaleItems.reduce((a, i) => a + Number(i.Quantity), 0));
    return r2((sale.SaleItems.reduce((a, i) => a + Number(i.Subtotal), 0) * rate) / 100);
  }
  // INVOICE_TOTAL
  if (type === 'NOMINAL') return r2(nominal);
  const dpp = Number(sale.Total) - Number(sale.TaxAmount);
  return r2((Math.max(dpp, 0) * rate) / 100);
}

export function returnCommission(commission: number, total: number, returns: number): number {
  if (!(total > 0) || !(returns > 0)) return 0;
  return r2(commission * Math.min(returns / total, 1));
}
