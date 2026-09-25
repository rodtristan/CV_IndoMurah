"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCOUNT_KEYS = exports.ACCOUNT_KEY_LABELS = void 0;
exports.ACCOUNT_KEY_LABELS = {
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
exports.ACCOUNT_KEYS = Object.keys(exports.ACCOUNT_KEY_LABELS);
