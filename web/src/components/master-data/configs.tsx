"use client";

import { KEditableGrid } from "@/components/kform";
import type { EntityConfig, ListColumn, FieldDef } from "./types";

// ─── Shared bits ─────────────────────────────────────────────────────

const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));
const num = (v: unknown) => (v === "" || v === undefined || v === null ? 0 : Number(v));

const codeCol: ListColumn = { key: "Code", label: "Kode", width: 140, render: (v) => <span className="font-mono text-xs">{str(v)}</span> };

function Badge({ on, yes = "Aktif", no = "Nonaktif" }: { on: boolean; yes?: string; no?: string }) {
  return (
    <span className={on ? "rounded bg-success/15 px-2 py-0.5 text-xs text-success" : "rounded bg-[#eceff2] px-2 py-0.5 text-xs text-[#6b7580]"}>
      {on ? yes : no}
    </span>
  );
}
const statusCol: ListColumn = { key: "IsActive", label: "Status", width: 90, render: (v) => <Badge on={v !== false} /> };
const descCol = (label = "Keterangan"): ListColumn => ({ key: "Description", label, render: (v) => str(v) || "-" });

const activeField: FieldDef = { key: "isActive", label: "Status", type: "checkbox", caption: "Aktif" };

// ─── Data Jenis ──────────────────────────────────────────────────────

export const categoryConfig: EntityConfig = {
  singular: "Jenis", plural: "Data Jenis", basePath: "/master/categories", endpoint: "categories",
  codePrefix: "JNS", searchFields: ["code", "name"], searchPlaceholder: "Cari kode / nama jenis",
  columns: [codeCol, { key: "Name", label: "Nama Jenis" }, descCol(), statusCol],
  sections: [{
    title: "Data Jenis",
    fields: [
      { key: "name", label: "Nama Jenis", required: true, hint: "Pengelompokan item, mis. Makanan, Minuman, ATK, Snack, Obat-obatan." },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3 },
      { key: "icon", label: "Ikon", placeholder: "Opsional", hint: "Nama ikon untuk tampilan kasir (opsional)." },
      activeField,
    ],
  }],
  defaults: { name: "", description: "", icon: "", isActive: true },
  fromRow: (r) => ({ name: str(r.Name), description: str(r.Description), icon: str(r.Icon), isActive: r.IsActive !== false }),
  toPayload: (v) => ({ name: v.name.trim(), description: v.description || undefined, icon: v.icon || undefined, isActive: !!v.isActive }),
};

// ─── Data Merek ──────────────────────────────────────────────────────

export const brandConfig: EntityConfig = {
  singular: "Merek", plural: "Data Merek", basePath: "/master/brands", endpoint: "brand",
  codePrefix: "MRK", searchFields: ["code", "name"], searchPlaceholder: "Cari kode / nama merek",
  columns: [codeCol, { key: "Name", label: "Nama Merek" }, descCol(), statusCol],
  sections: [{
    title: "Data Merek",
    fields: [
      { key: "name", label: "Nama Merek", required: true, hint: "Digunakan untuk mendefinisikan merek dari sebuah item." },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3 },
      activeField,
    ],
  }],
  defaults: { name: "", description: "", isActive: true },
  fromRow: (r) => ({ name: str(r.Name), description: str(r.Description), isActive: r.IsActive !== false }),
  toPayload: (v) => ({ name: v.name.trim(), description: v.description || undefined, isActive: !!v.isActive }),
};

// ─── Data Satuan (with konversi) ─────────────────────────────────────

interface ConvRow extends Record<string, unknown> { unit: string; factor: string }

export const unitConfig: EntityConfig = {
  singular: "Satuan", plural: "Data Satuan", basePath: "/master/units", endpoint: "unit",
  codePrefix: "SAT", searchFields: ["code", "name"], searchPlaceholder: "Cari kode / nama satuan",
  columns: [codeCol, { key: "Name", label: "Nama Satuan" }, { key: "Abbreviation", label: "Singkatan", render: (v) => str(v) || "-" }, descCol(), statusCol],
  sections: [{
    title: "Data Satuan",
    fields: [
      { key: "name", label: "Nama Satuan", required: true, hint: "Ukuran / unit item barang, mis. PCS, DUS, PAK, BAL." },
      { key: "abbreviation", label: "Singkatan", local: true, placeholder: "mis. pcs" },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3, full: true },
      activeField,
      {
        key: "conversions", label: "Konversi Satuan", type: "custom", local: true, full: true,
        hint: "Contoh: 1 DUS = 24 PCS. Nilai konversi juga diatur per item pada tab Satuan dan Harga Jual.",
        render: (v, set) => (
          <KEditableGrid<ConvRow>
            columns={[
              { key: "unit", label: "Satuan Dasar (mis. PCS)", type: "text" },
              { key: "factor", label: "Jumlah per satuan ini", type: "number", width: "200px" },
            ]}
            rows={(v.conversions as ConvRow[]) ?? []}
            onChange={(rows) => set({ conversions: rows })}
            newRow={() => ({ unit: "", factor: "1" })}
            addLabel="Tambah Konversi"
            emptyText="Belum ada konversi"
          />
        ),
      },
    ],
  }],
  defaults: { name: "", abbreviation: "", description: "", isActive: true, conversions: [] },
  fromRow: (r) => ({ name: str(r.Name), abbreviation: str(r.Abbreviation), description: str(r.Description), isActive: r.IsActive !== false, conversions: [] }),
  toPayload: (v) => ({ name: v.name.trim(), description: v.description || undefined, isActive: !!v.isActive }),
};

// ─── Dept./Gudang ────────────────────────────────────────────────────

export const warehouseConfig: EntityConfig = {
  singular: "Gudang", plural: "Dept./Gudang", basePath: "/master/warehouses", endpoint: "warehouse",
  codePrefix: "GDG", searchFields: ["code", "name", "address"], searchPlaceholder: "Cari kode / nama gudang",
  columns: [
    codeCol, { key: "Name", label: "Keterangan" }, { key: "Address", label: "Alamat", render: (v) => str(v) || "-" },
    { key: "Phone", label: "Telepon", render: (v) => str(v) || "-" },
    { key: "IsDefault", label: "Default", width: 90, render: (v) => (v ? <Badge on yes="Default" /> : "-") },
    statusCol,
  ],
  sections: [{
    title: "Data Gudang",
    fields: [
      { key: "name", label: "Keterangan (Nama)", required: true },
      {
        key: "function", label: "Fungsi", type: "select", local: true,
        options: [
          { value: "gudang", label: "Gudang" }, { value: "departemen", label: "Departemen" },
          { value: "cabang", label: "Cabang (Beda Lokasi)" }, { value: "canvas", label: "Mobile Canvas" },
        ],
        hint: "Memisahkan stok sebagai departemen, gudang, cabang beda lokasi atau mobile canvas.",
      },
      { key: "address", label: "Alamat", type: "textarea", rows: 3 },
      { key: "phone", label: "Telepon" },
      { key: "isDefault", label: "Gudang Default", type: "checkbox", caption: "Jadikan gudang default" },
      activeField,
    ],
  }],
  defaults: { name: "", function: "gudang", address: "", phone: "", isDefault: false, isActive: true },
  fromRow: (r) => ({
    name: str(r.Name), function: "gudang", address: str(r.Address), phone: str(r.Phone),
    isDefault: !!r.IsDefault, isActive: r.IsActive !== false,
  }),
  toPayload: (v) => ({
    name: v.name.trim(), address: v.address || undefined, phone: v.phone || undefined,
    isDefault: !!v.isDefault, isActive: !!v.isActive,
  }),
};

// ─── Rak ─────────────────────────────────────────────────────────────

export const shelfConfig: EntityConfig = {
  singular: "Rak", plural: "Daftar Rak", basePath: "/master/shelves", endpoint: "shelves",
  codePrefix: "RAK", searchFields: ["code", "name"], searchPlaceholder: "Cari kode / nama rak", include: "warehouse",
  columns: [
    codeCol, { key: "Name", label: "Nama Rak" },
    { key: "Warehouse", label: "Dept./Gudang", render: (_v, r) => r.Warehouse?.Name ?? "-" },
    descCol(), statusCol,
  ],
  sections: [{
    title: "Data Rak",
    fields: [
      { key: "name", label: "Nama Rak", required: true },
      {
        key: "warehouseId", label: "Dept./Gudang", type: "select", required: true,
        optionsFrom: { endpoint: "warehouse", label: (r) => `${r.Code} - ${r.Name}` },
        hint: "Lokasi penyimpanan fisik rak berada di gudang mana.",
      },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3, full: true },
      activeField,
    ],
  }],
  defaults: { name: "", warehouseId: "", description: "", isActive: true },
  fromRow: (r) => ({ name: str(r.Name), warehouseId: str(r.WarehouseID), description: str(r.Description), isActive: r.IsActive !== false }),
  toPayload: (v) => ({ name: v.name.trim(), warehouseId: Number(v.warehouseId), description: v.description ?? "", isActive: !!v.isActive }),
};

// ─── Sale Point ──────────────────────────────────────────────────────

export const salePointConfig: EntityConfig = {
  singular: "Sale Point", plural: "Sale Point", basePath: "/master/sale-points", endpoint: "sale-point",
  codePrefix: "SPT", searchFields: ["code", "name"], searchPlaceholder: "Cari kode / nama sale point", include: "warehouse",
  columns: [
    codeCol, { key: "Name", label: "Nama Sale Point" },
    { key: "Warehouse", label: "Dept./Gudang", render: (_v, r) => r.Warehouse?.Name ?? "-" },
    descCol(), statusCol,
  ],
  sections: [{
    title: "Data Sale Point",
    fields: [
      { key: "name", label: "Nama Sale Point", required: true, hint: "Titik / konter penjualan (kasir)." },
      {
        key: "warehouseId", label: "Dept./Gudang", type: "select", local: true,
        optionsFrom: { endpoint: "warehouse", label: (r) => `${r.Code} - ${r.Name}` },
        hint: "Gudang sumber stok untuk sale point ini.",
      },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3, full: true },
      activeField,
    ],
  }],
  defaults: { name: "", warehouseId: "", description: "", isActive: true },
  fromRow: (r) => ({ name: str(r.Name), warehouseId: str(r.WarehouseID), description: str(r.Description), isActive: r.IsActive !== false }),
  toPayload: (v) => ({ name: v.name.trim(), description: v.description || undefined, isActive: !!v.isActive }),
};

// ─── Grup Pelanggan (no backend module yet) ──────────────────────────

const levelOptions = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `Level ${n}${n === 1 ? " (Umum)" : ""}` }));

export const customerGroupConfig: EntityConfig = {
  singular: "Grup Pelanggan", plural: "Daftar Grup Pelanggan", basePath: "/master/customer-groups",
  backendGap: ["seluruh modul Grup Pelanggan (level, potongan, tipe potongan, pengali point)"],
  codePrefix: "GRP", searchFields: ["code", "name"],
  columns: [
    codeCol, { key: "Name", label: "Nama Grup" }, { key: "Level", label: "Level", align: "right", width: 80 },
    { key: "DiscountPercent", label: "Potongan (%)", align: "right", width: 110 }, descCol(), statusCol,
  ],
  intro: null,
  sections: [{
    title: "Data Grup",
    fields: [
      { key: "name", label: "Nama Grup", required: true, hint: "Contoh: General / Umum, Bronze, Silver, Gold." },
      { key: "level", label: "Level Harga Jual", type: "select", options: levelOptions, required: true, hint: "Menentukan harga jual level mana yang dipakai pelanggan grup ini (Level 1 = umum)." },
      {
        key: "discountType", label: "Tipe Potongan", type: "select",
        options: [
          { value: "group_item", label: "Potongan Grup Per Item" },
          { value: "group_invoice", label: "Potongan Grup Per Faktur" },
          { value: "item_list", label: "Potongan Daftar Item" },
        ],
        hint: "Per Item / Per Faktur: potongan diambil dari grup. Daftar Item: diambil dari master item.",
      },
      { key: "discountPercent", label: "Potongan (%)", type: "number", hint: "Potongan otomatis untuk anggota grup." },
      { key: "pointMultiplier", label: "Pengali Point", type: "number", hint: "1 = normal, 2 = point dobel." },
      { key: "sortOrder", label: "Urutan", type: "number" },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3, full: true },
      activeField,
    ],
  }],
  defaults: { name: "", level: "1", discountType: "group_item", discountPercent: "0", pointMultiplier: "1", sortOrder: "0", description: "", isActive: true },
  fromRow: () => ({}),
  toPayload: () => ({}),
  validate: (v): Record<string, string> => (num(v.discountPercent) < 0 || num(v.discountPercent) > 100 ? { discountPercent: "Potongan harus 0 - 100" } : {}),
};

// ─── Wilayah & Sub Wilayah (no backend) ──────────────────────────────

export const regionConfig: EntityConfig = {
  singular: "Wilayah", plural: "Daftar Wilayah", basePath: "/master/regions",
  backendGap: ["seluruh modul Wilayah (kode, nama, keterangan)"],
  codePrefix: "WIL", searchFields: ["code", "name"],
  columns: [codeCol, { key: "Name", label: "Nama Wilayah" }, descCol(), statusCol],
  sections: [{
    title: "Data Wilayah",
    fields: [
      { key: "name", label: "Nama Wilayah", required: true, hint: "Dipakai pada data pelanggan untuk laporan penjualan / piutang per wilayah." },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3 },
      activeField,
    ],
  }],
  defaults: { name: "", description: "", isActive: true },
  fromRow: () => ({}), toPayload: () => ({}),
};

export const subRegionConfig: EntityConfig = {
  singular: "Sub Wilayah", plural: "Daftar Sub Wilayah", basePath: "/master/sub-regions",
  backendGap: ["seluruh modul Sub Wilayah (kode, nama, wilayah induk, keterangan)"],
  codePrefix: "SWL", searchFields: ["code", "name"],
  columns: [codeCol, { key: "Name", label: "Nama Sub Wilayah" }, { key: "Region", label: "Wilayah", render: () => "-" }, descCol(), statusCol],
  sections: [{
    title: "Data Sub Wilayah",
    fields: [
      { key: "name", label: "Nama Sub Wilayah", required: true },
      { key: "regionId", label: "Wilayah", type: "select", options: [], placeholder: "Belum ada data wilayah", hint: "Wilayah induk dari sub wilayah ini." },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3 },
      activeField,
    ],
  }],
  defaults: { name: "", regionId: "", description: "", isActive: true },
  fromRow: () => ({}), toPayload: () => ({}),
};

// ─── Diskon & Promosi (no backend) ───────────────────────────────────

export const promoConfig: EntityConfig = {
  singular: "Promo", plural: "Promo Periode", basePath: "/master/promotions",
  backendGap: ["seluruh modul Promo (nama, jenis, nilai, target, grup pelanggan, periode)"],
  codePrefix: "PRM", searchFields: ["code", "name"],
  columns: [
    codeCol, { key: "Name", label: "Nama Promo" }, { key: "Type", label: "Jenis" }, { key: "Value", label: "Nilai", align: "right" },
    { key: "StartDate", label: "Dari" }, { key: "EndDate", label: "Sampai" }, statusCol,
  ],
  sections: [
    {
      title: "Data Promo",
      fields: [
        { key: "name", label: "Nama Promo", required: true },
        {
          key: "type", label: "Jenis Potongan", type: "radio", inline: true,
          options: [{ value: "percent", label: "Persen (%)" }, { value: "amount", label: "Nominal (Rp)" }, { value: "price", label: "Harga Khusus" }],
        },
        { key: "value", label: "Nilai", type: "number", required: true },
        { key: "maxDiscount", label: "Maksimum Potongan (Rp)", type: "number", hint: "0 = tanpa batas." },
        { key: "minPurchase", label: "Minimum Belanja (Rp)", type: "number", hint: "0 = tanpa minimum." },
        { key: "customerGroup", label: "Grup Pelanggan", type: "select", options: [], placeholder: "Semua grup" },
        { key: "description", label: "Keterangan", type: "textarea", rows: 3, full: true },
        activeField,
      ],
    },
    {
      title: "Periode & Target",
      fields: [
        { key: "startDate", label: "Berlaku Dari", type: "date", required: true },
        { key: "endDate", label: "Berlaku Sampai", type: "date", required: true },
        {
          key: "days", label: "Hari Berlaku", type: "select",
          options: [{ value: "all", label: "Setiap Hari" }, { value: "weekday", label: "Senin - Jumat" }, { value: "weekend", label: "Sabtu - Minggu" }],
        },
        {
          key: "scope", label: "Berlaku Untuk", type: "radio", inline: true, full: true,
          options: [{ value: "all", label: "Semua Item" }, { value: "category", label: "Jenis Tertentu" }, { value: "brand", label: "Merek Tertentu" }, { value: "item", label: "Item Tertentu" }],
        },
        { key: "target", label: "Target (kode jenis / merek / item)", placeholder: "Pisahkan dengan koma", full: true },
      ],
    },
  ],
  defaults: {
    name: "", type: "percent", value: "0", maxDiscount: "0", minPurchase: "0", customerGroup: "", description: "", isActive: true,
    startDate: "", endDate: "", days: "all", scope: "all", target: "",
  },
  fromRow: () => ({}), toPayload: () => ({}),
  validate: (v): Record<string, string> => (v.startDate && v.endDate && v.endDate < v.startDate ? { endDate: "Tanggal akhir tidak boleh sebelum tanggal awal" } : {}),
};

export const voucherConfig: EntityConfig = {
  singular: "Voucher", plural: "Voucher", basePath: "/master/vouchers",
  backendGap: ["tanggal mulai / berakhir dan jenis voucher belum diterima API voucher"],
  codePrefix: "VCR", searchFields: ["code", "name"],
  columns: [
    codeCol, { key: "Name", label: "Nama Voucher" }, { key: "Value", label: "Nilai", align: "right" },
    { key: "EndDate", label: "Berakhir" }, { key: "UsedCount", label: "Terpakai", align: "right" }, statusCol,
  ],
  sections: [{
    title: "Data Voucher",
    fields: [
      { key: "name", label: "Nama Voucher", required: true },
      { key: "type", label: "Jenis", type: "radio", inline: true, options: [{ value: "percent", label: "Persen (%)" }, { value: "amount", label: "Nominal (Rp)" }] },
      { key: "value", label: "Nilai", type: "number", required: true },
      { key: "minPurchase", label: "Minimum Belanja (Rp)", type: "number" },
      { key: "maxDiscount", label: "Maksimum Potongan (Rp)", type: "number" },
      { key: "usageLimit", label: "Batas Pemakaian", type: "number", hint: "0 = tanpa batas." },
      { key: "startDate", label: "Berlaku Dari", type: "date", required: true },
      { key: "endDate", label: "Berlaku Sampai", type: "date", required: true },
      activeField,
    ],
  }],
  defaults: { name: "", type: "percent", value: "0", minPurchase: "0", maxDiscount: "0", usageLimit: "0", startDate: "", endDate: "", isActive: true },
  fromRow: () => ({}), toPayload: () => ({}),
  validate: (v): Record<string, string> => (v.startDate && v.endDate && v.endDate < v.startDate ? { endDate: "Tanggal akhir tidak boleh sebelum tanggal awal" } : {}),
};

// ─── Bank / E-Money / Ongkir (no backend) ────────────────────────────

export const bankConfig: EntityConfig = {
  singular: "Bank", plural: "Daftar Bank", basePath: "/master/banks",
  backendGap: ["seluruh modul Bank (nama, kartu debit / kredit, akun perkiraan, biaya)"],
  codePrefix: "BNK", searchFields: ["code", "name"],
  columns: [
    codeCol, { key: "Name", label: "Nama Bank" },
    { key: "Debit", label: "Kartu Debit", width: 110, render: (v) => (v ? "Ya" : "-") },
    { key: "Credit", label: "Kartu Kredit", width: 110, render: (v) => (v ? "Ya" : "-") }, statusCol,
  ],
  sections: [{
    title: "Data Bank",
    fields: [
      { key: "name", label: "Nama Bank", required: true },
      { key: "account", label: "Akun Perkiraan", placeholder: "Kode akun kas / bank", hint: "Agar transaksi kartu otomatis memutasi akun ini." },
      { key: "debit", label: "Bayar Kartu Debit", type: "checkbox", caption: "Bank ini dapat dipakai untuk kartu debit" },
      { key: "credit", label: "Bayar Kartu Kredit", type: "checkbox", caption: "Bank ini dapat dipakai untuk kartu kredit" },
      { key: "debitFee", label: "Biaya Debit (%)", type: "number" },
      { key: "creditFee", label: "Biaya Kredit (%)", type: "number" },
      activeField,
    ],
  }],
  defaults: { name: "", account: "", debit: true, credit: false, debitFee: "0", creditFee: "0", isActive: true },
  fromRow: () => ({}), toPayload: () => ({}),
  validate: (v): Record<string, string> => (!v.debit && !v.credit ? { debit: "Pilih minimal satu jenis kartu (debit / kredit)" } : {}),
};

export const eMoneyConfig: EntityConfig = {
  singular: "E-Money", plural: "Daftar E-Money", basePath: "/master/e-money",
  backendGap: ["seluruh modul E-Money (nama, akun perkiraan, biaya)"],
  codePrefix: "EMN", searchFields: ["code", "name"],
  columns: [codeCol, { key: "Name", label: "Nama E-Money" }, { key: "Fee", label: "Biaya (%)", align: "right" }, statusCol],
  sections: [{
    title: "Data E-Money",
    fields: [
      { key: "name", label: "Nama E-Money", required: true, hint: "Contoh: GoPay, OVO, DANA, QRIS." },
      { key: "account", label: "Akun Perkiraan", placeholder: "Kode akun kas / bank" },
      { key: "fee", label: "Biaya (%)", type: "number" },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3 },
      activeField,
    ],
  }],
  defaults: { name: "", account: "", fee: "0", description: "", isActive: true },
  fromRow: () => ({}), toPayload: () => ({}),
};

export const shippingConfig: EntityConfig = {
  singular: "Ongkir", plural: "Daftar Ongkir", basePath: "/master/shipping-costs", hasCode: false,
  backendGap: ["seluruh modul Ongkir (expedisi, kota asal / tujuan, paket 1-3)"],
  codePrefix: "ONG", searchFields: ["expedition", "destination"], searchPlaceholder: "Cari expedisi / kota tujuan",
  columns: [
    { key: "Expedition", label: "Expedisi" }, { key: "Origin", label: "Dari Kota" }, { key: "Destination", label: "Kota Tujuan" },
    { key: "Package1", label: "Paket 1", align: "right" }, { key: "Package2", label: "Paket 2", align: "right" }, { key: "Package3", label: "Paket 3", align: "right" },
  ],
  sections: [
    {
      title: "Data Ongkir",
      fields: [
        { key: "expedition", label: "Expedisi", required: true, placeholder: "mis. JNE, J&T, SiCepat" },
        { key: "origin", label: "Dari Kota" },
        { key: "destination", label: "Kota Tujuan", required: true },
        { key: "estimate", label: "Estimasi (hari)", type: "number" },
        { key: "description", label: "Keterangan", type: "textarea", rows: 2, full: true },
      ],
    },
    {
      title: "Paket & Tarif",
      note: null,
      fields: [
        { key: "package1Name", label: "Nama Paket 1", placeholder: "REG", hint: "Paket paling murah, mis. REG (Reguler)." },
        { key: "package1", label: "Tarif Paket 1 (Rp / kg)", type: "number" },
        { key: "package2Name", label: "Nama Paket 2", placeholder: "YES", hint: "Paket lebih cepat sampai, mis. YES." },
        { key: "package2", label: "Tarif Paket 2 (Rp / kg)", type: "number" },
        { key: "package3Name", label: "Nama Paket 3", placeholder: "Express", hint: "Paket paling cepat. Tidak semua paket harus diisi." },
        { key: "package3", label: "Tarif Paket 3 (Rp / kg)", type: "number" },
      ],
    },
  ],
  defaults: {
    expedition: "", origin: "", destination: "", estimate: "", description: "",
    package1Name: "", package1: "0", package2Name: "", package2: "0", package3Name: "", package3: "0",
  },
  fromRow: () => ({}), toPayload: () => ({}),
};
