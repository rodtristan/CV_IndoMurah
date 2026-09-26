// ================================================================
// doc-totals.ts — perhitungan total dokumen Ketoko (Pembelian, Pesanan, Penjualan)
// ================================================================
//
//   Sub Total  = Σ subtotal baris (setelah potongan per baris)
//   Pot        = potongan faktur (nominal, maks Sub Total)
//   PPN Non     → pajak 0
//   PPN Exclude → pajak = (Sub Total − Pot) × %,         ditambahkan ke total
//   PPN Include → pajak = (Sub Total − Pot) × % / (100+%), sudah termasuk di harga
//   Biaya      → ditambahkan ke total bila OtherCostAdds
//   Total Akhir = Sub Total − Pot + (Exclude ? pajak : 0) + (OtherCostAdds ? biaya : 0)
// ================================================================

export type TaxMode = 'NON' | 'INCLUDE' | 'EXCLUDE';
export const TAX_MODES: TaxMode[] = ['NON', 'INCLUDE', 'EXCLUDE'];

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export interface DocTotals {
  subtotal: number;
  discount: number;
  taxPercent: number;
  tax: number;
  otherCost: number;
  total: number;
}

export function computeDocTotals(input: {
  subtotal: number;
  discount?: number;
  taxMode?: string | null;
  taxPercent?: number;
  otherCost?: number;
  otherCostAdds?: boolean;
}): DocTotals {
  const sub = r2(Math.max(0, input.subtotal || 0));
  const disc = r2(Math.min(Math.max(input.discount || 0, 0), sub));
  const base = r2(sub - disc);
  const mode = (TAX_MODES as string[]).includes(String(input.taxMode)) ? (input.taxMode as TaxMode) : (input.taxPercent ? 'EXCLUDE' : 'NON');
  const pct = mode === 'NON' ? 0 : Math.max(0, input.taxPercent || 0);
  const tax = mode === 'EXCLUDE' ? r2((base * pct) / 100) : mode === 'INCLUDE' ? r2((base * pct) / (100 + pct)) : 0;
  const other = r2(Math.max(0, input.otherCost || 0));
  const total = r2(base + (mode === 'EXCLUDE' ? tax : 0) + (input.otherCostAdds === false ? 0 : other));
  return { subtotal: sub, discount: disc, taxPercent: pct, tax, otherCost: other, total };
}

/**
 * Faktor nilai persediaan per rupiah subtotal baris: memasukkan potongan faktur,
 * mengeluarkan PPN (include/exclude) dan menambahkan biaya yang masuk total (landed cost).
 */
export function inventoryFactor(t: { subtotal: number; total: number; tax: number }): number {
  return t.subtotal > 0 ? Math.max(t.total - t.tax, 0) / t.subtotal : 1;
}
