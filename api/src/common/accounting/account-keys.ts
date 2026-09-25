/**
 * Setting Perkiraan keys (AccountSetting.Key -> AccountID) used by the automatic journals.
 * `bank` is optional: when empty, non-cash payment methods (transfer/EDC/e-money/cek/BG) post to `cash`.
 */
export const ACCOUNT_KEY_LABELS: Record<string, string> = {
  cash: 'Kas Default',
  bank: 'Bank Default (transfer/EDC/cek/BG)',
  inventory: 'Persediaan Barang',
  receivable: 'Piutang Dagang',
  payable: 'Hutang Dagang',
  sales: 'Pendapatan Penjualan',
  salesDiscount: 'Potongan Penjualan',
  cogs: 'Harga Pokok Penjualan (HPP)',
  salesReturn: 'Retur Penjualan',
  purchaseReturn: 'Retur Pembelian',
  vatOut: 'PPN Keluaran',
  vatIn: 'PPN Masukan',
  custDeposit: 'Deposit Pelanggan',
  suppDeposit: 'Deposit Supplier',
  shipping: 'Biaya Kirim',
  stockDiff: 'Selisih Stok (Opname)',
  retained: 'Laba Ditahan',
  currentProfit: 'Laba Tahun Berjalan',
  otherIncome: 'Pendapatan Lain',
  otherExpense: 'Biaya Lain',
};

export const ACCOUNT_KEYS = Object.keys(ACCOUNT_KEY_LABELS);
export type AccountKey = keyof typeof ACCOUNT_KEY_LABELS;
