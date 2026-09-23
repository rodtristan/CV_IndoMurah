// Ketoko access-right modules ("Kelompok Modul" -> menu rows) as listed in the
// Kelompok Akses User guide. Used for the permission grid.
export interface ModuleGroup { key: string; label: string; items: { key: string; label: string }[] }

const item = (group: string, label: string) => ({ key: `${group}.${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, label });

export const MODULE_GROUPS: ModuleGroup[] = [
  { key: "master", label: "Master Data", items: ["Daftar Item", "Kategori / Jenis", "Merek", "Satuan", "Pelanggan", "Grup Pelanggan", "Supplier", "Sales", "Dept/Gudang", "Rak", "Point Pelanggan"].map((l) => item("master", l)) },
  { key: "pembelian", label: "Pembelian", items: ["Pesanan Pembelian", "Pembelian", "Retur Pembelian", "Hutang Supplier", "Bayar Hutang"].map((l) => item("pembelian", l)) },
  { key: "penjualan", label: "Penjualan", items: ["Pesanan Penjualan", "Penjualan", "Kasir", "Retur Penjualan", "Piutang Pelanggan", "Bayar Piutang", "Faktur Pajak"].map((l) => item("penjualan", l)) },
  { key: "persediaan", label: "Persediaan", items: ["Item Masuk", "Item Keluar", "Transfer Stok", "Stok Opname", "Kartu Stok"].map((l) => item("persediaan", l)) },
  { key: "kas", label: "Kas & Bank", items: ["Kas Masuk", "Kas Keluar", "Kas Transfer", "Rekonsiliasi"].map((l) => item("kas", l)) },
  { key: "akuntansi", label: "Akuntansi", items: ["Daftar Perkiraan", "Jurnal Umum", "Setting Perkiraan", "Tutup Buku"].map((l) => item("akuntansi", l)) },
  { key: "laporan", label: "Laporan", items: ["Laporan Pembelian", "Laporan Penjualan", "Laporan Persediaan", "Laporan Keuangan", "Menu Laporan", "Design Report"].map((l) => item("laporan", l)) },
  { key: "pengaturan", label: "Pengaturan", items: ["Daftar User", "Kelompok Akses User", "Pengaturan Umum", "Data Perusahaan", "Setting Nomor", "Log Aktivitas", "List Backup", "Import Data"].map((l) => item("pengaturan", l)) },
];

export const PERMISSIONS = [
  { key: "open", label: "Buka" },
  { key: "create", label: "Baru" },
  { key: "update", label: "Ubah" },
  { key: "delete", label: "Hapus" },
  { key: "print", label: "Cetak" },
  { key: "lock", label: "Kunci No & Tanggal" },
] as const;

export type PermKey = (typeof PERMISSIONS)[number]["key"];
export type PermMap = Record<string, Partial<Record<PermKey, boolean>>>;
