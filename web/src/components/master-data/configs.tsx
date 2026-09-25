"use client";

import { KEditableGrid } from "@/components/kform";
import type { EntityConfig, ListColumn, FieldDef } from "./types";

// ─── Shared bits ─────────────────────────────────────────────────────

const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));
const num = (v: unknown) => (v === "" || v === undefined || v === null ? 0 : Number(v));

const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("id-ID") : "-");
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

// ─── Grup Pelanggan ────────────────────────────────────────────────

export const customerGroupConfig: EntityConfig = {
  singular: "Grup Pelanggan", plural: "Daftar Grup Pelanggan", basePath: "/master/customer-groups",
  endpoint: "customer-group", codePrefix: "GRP", searchFields: ["code", "name"],
  columns: [
    codeCol, { key: "Name", label: "Nama Grup" },
    { key: "DiscountPercent", label: "Potongan (%)", align: "right", width: 110, render: (v) => num(v).toFixed(2) },
    { key: "PointMultiplier", label: "Pengali Point", align: "right", width: 100, render: (v) => num(v).toFixed(2) },
    descCol(), statusCol,
  ],
  intro: null,
  sections: [{
    title: "Data Grup",
    fields: [
      { key: "name", label: "Nama Grup", required: true, hint: "Contoh: General / Umum, Bronze, Silver, Gold." },
      { key: "discountPercent", label: "Potongan (%)", type: "number", hint: "Potongan otomatis untuk anggota grup." },
      { key: "pointMultiplier", label: "Pengali Point", type: "number", hint: "1 = normal, 2 = point dobel." },
      { key: "sortOrder", label: "Urutan", type: "number" },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3, full: true },
      activeField,
    ],
  }],
  defaults: { name: "", discountPercent: "0", pointMultiplier: "1", sortOrder: "0", description: "", isActive: true },
  fromRow: (r) => ({
    name: str(r.Name),
    discountPercent: str(r.DiscountPercent ?? 0),
    pointMultiplier: str(r.PointMultiplier ?? 1),
    sortOrder: str(r.SortOrder ?? 0),
    description: str(r.Description),
    isActive: r.IsActive !== false,
  }),
  toPayload: (v) => ({
    name: v.name.trim(),
    discountPercent: num(v.discountPercent),
    pointMultiplier: num(v.pointMultiplier),
    sortOrder: num(v.sortOrder),
    description: v.description || undefined,
    isActive: !!v.isActive,
  }),
  validate: (v): Record<string, string> => (num(v.discountPercent) < 0 || num(v.discountPercent) > 100 ? { discountPercent: "Potongan harus 0 - 100" } : {}),
};

// ─── Wilayah & Sub Wilayah ─────────────────────────────────────────

export const regionConfig: EntityConfig = {
  singular: "Wilayah", plural: "Daftar Wilayah", basePath: "/master/regions",
  endpoint: "region", codePrefix: "WIL", searchFields: ["code", "name"],
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
  fromRow: (r) => ({ name: str(r.Name), description: str(r.Description), isActive: r.IsActive !== false }),
  toPayload: (v) => ({ name: v.name.trim(), description: v.description || undefined, isActive: !!v.isActive }),
};

export const subRegionConfig: EntityConfig = {
  singular: "Sub Wilayah", plural: "Daftar Sub Wilayah", basePath: "/master/sub-regions",
  endpoint: "sub-region", codePrefix: "SWL", searchFields: ["code", "name"],
  columns: [codeCol, { key: "Name", label: "Nama Sub Wilayah" }, { key: "Region", label: "Wilayah", render: (_v, r) => r.Region?.Name ?? "-" }, descCol(), statusCol],
  sections: [{
    title: "Data Sub Wilayah",
    fields: [
      { key: "name", label: "Nama Sub Wilayah", required: true },
      {
        key: "regionId", label: "Wilayah", type: "select", required: true,
        optionsFrom: { endpoint: "region", label: (r) => `${r.Code} - ${r.Name}` },
        hint: "Wilayah induk dari sub wilayah ini.",
      },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3 },
      activeField,
    ],
  }],
  defaults: { name: "", regionId: "", description: "", isActive: true },
  fromRow: (r) => ({ name: str(r.Name), regionId: str(r.RegionID ?? ""), description: str(r.Description), isActive: r.IsActive !== false }),
  toPayload: (v) => ({ name: v.name.trim(), regionId: Number(v.regionId), description: v.description || undefined, isActive: !!v.isActive }),
};

// ─── Promo ────────────────────────────────────────────────────────────

export const promoConfig: EntityConfig = {
  singular: "Promo", plural: "Promo Periode", basePath: "/master/promotions",
  endpoint: "promotion", codePrefix: "PRM", searchFields: ["code", "name"],
  columns: [
    codeCol, { key: "Name", label: "Nama Promo" },
    { key: "Type", label: "Jenis" },
    { key: "DiscountType", label: "Tipe Diskon" },
    { key: "DiscountValue", label: "Nilai", align: "right", render: (v) => num(v).toLocaleString("id-ID") },
    { key: "StartDate", label: "Dari", render: (v) => fmtDate(v) },
    { key: "EndDate", label: "Sampai", render: (v) => fmtDate(v) },
    statusCol,
  ],
  sections: [
    {
      title: "Data Promo",
      fields: [
        { key: "name", label: "Nama Promo", required: true },
        {
          key: "type", label: "Jenis Promo", type: "select", required: true,
          options: [
            { value: "DISCOUNT", label: "Diskon" },
            { value: "BOGO", label: "Beli 1 Gratis 1" },
            { value: "GIFT", label: "Hadiah" },
            { value: "BUY_GET", label: "Beli X Gratis Y" },
          ],
        },
        {
          key: "discountType", label: "Tipe Diskon", type: "select", required: true,
          options: [
            { value: "PERCENTAGE", label: "Persen (%)" },
            { value: "FIXED", label: "Nominal (Rp)" },
          ],
        },
        { key: "discountValue", label: "Nilai Diskon", type: "number", required: true },
        { key: "maxDiscountAmount", label: "Maksimum Potongan (Rp)", type: "number", hint: "0 = tanpa batas." },
        { key: "minPurchase", label: "Minimum Belanja (Rp)", type: "number", hint: "0 = tanpa minimum." },
        { key: "usageLimit", label: "Batas Penggunaan", type: "number", hint: "0 = tanpa batas." },
        { key: "description", label: "Keterangan", type: "textarea", rows: 3, full: true },
        activeField,
      ],
    },
    {
      title: "Periode Promo",
      fields: [
        { key: "startDate", label: "Berlaku Dari", type: "date", required: true },
        { key: "endDate", label: "Berlaku Sampai", type: "date", required: true },
      ],
    },
  ],
  defaults: {
    name: "", type: "DISCOUNT", discountType: "PERCENTAGE", discountValue: "0", maxDiscountAmount: "0", minPurchase: "0",
    usageLimit: "0", description: "", startDate: "", endDate: "", isActive: true,
  },
  fromRow: (r) => ({
    name: str(r.Name),
    type: str(r.Type),
    discountType: str(r.DiscountType),
    discountValue: str(r.DiscountValue ?? 0),
    maxDiscountAmount: str(r.MaxDiscountAmount ?? 0),
    minPurchase: str(r.MinPurchase ?? 0),
    usageLimit: str(r.UsageLimit ?? 0),
    description: str(r.Description),
    startDate: r.StartDate ? new Date(r.StartDate).toISOString().split("T")[0] : "",
    endDate: r.EndDate ? new Date(r.EndDate).toISOString().split("T")[0] : "",
    isActive: r.IsActive !== false,
  }),
  toPayload: (v) => ({
    name: v.name.trim(),
    type: v.type,
    discountType: v.discountType,
    discountValue: num(v.discountValue),
    maxDiscountAmount: num(v.maxDiscountAmount) || undefined,
    minPurchase: num(v.minPurchase) || undefined,
    usageLimit: v.usageLimit ? parseInt(v.usageLimit) : undefined,
    description: v.description || undefined,
    startDate: v.startDate,
    endDate: v.endDate,
    isActive: !!v.isActive,
  }),
  validate: (v): Record<string, string> => (v.startDate && v.endDate && v.endDate < v.startDate ? { endDate: "Tanggal akhir tidak boleh sebelum tanggal awal" } : {}),
};

export const voucherConfig: EntityConfig = {
  singular: "Voucher", plural: "Voucher", basePath: "/master/vouchers",
  endpoint: "vouchers", codePrefix: "VCR", searchFields: ["code", "name"],
  columns: [
    codeCol, { key: "Name", label: "Nama Voucher" },
    { key: "Type", label: "Tipe" },
    { key: "Value", label: "Nilai", align: "right", render: (v) => num(v).toLocaleString("id-ID") },
    { key: "MinPurchaseAmount", label: "Min. Belanja", align: "right", render: (v) => num(v).toLocaleString("id-ID") },
    { key: "EndDate", label: "Berakhir", render: (v) => fmtDate(v) },
    { key: "UsedCount", label: "Terpakai", align: "right" },
    statusCol,
  ],
  sections: [{
    title: "Data Voucher",
    fields: [
      { key: "name", label: "Nama Voucher", required: true },
      {
        key: "typeId", label: "Jenis", type: "select", required: true,
        options: [{ value: "1", label: "Persen (%)" }, { value: "2", label: "Nominal (Rp)" }],
      },
      { key: "value", label: "Nilai", type: "number", required: true },
      { key: "minPurchaseAmount", label: "Minimum Belanja (Rp)", type: "number" },
      { key: "maxDiscountAmount", label: "Maksimum Potongan (Rp)", type: "number" },
      { key: "usageLimit", label: "Batas Pemakaian", type: "number", hint: "0 = tanpa batas." },
      { key: "startDate", label: "Berlaku Dari", type: "date", required: true },
      { key: "endDate", label: "Berlaku Sampai", type: "date", required: true },
      activeField,
    ],
  }],
  defaults: { name: "", typeId: "1", value: "0", minPurchaseAmount: "0", maxDiscountAmount: "0", usageLimit: "0", startDate: "", endDate: "", isActive: true },
  fromRow: (r: any) => ({
    name: str(r.Name),
    typeId: str(r.TypeID ?? "1"),
    value: str(r.Value ?? 0),
    minPurchaseAmount: str(r.MinPurchaseAmount ?? 0),
    maxDiscountAmount: str(r.MaxDiscountAmount ?? 0),
    usageLimit: str(r.UsageLimit ?? 0),
    startDate: r.StartDate ? new Date(r.StartDate).toISOString().split("T")[0] : "",
    endDate: r.EndDate ? new Date(r.EndDate).toISOString().split("T")[0] : "",
    isActive: r.IsActive !== false,
  }),
  toPayload: (v) => ({
    name: v.name.trim(),
    typeId: Number(v.typeId),
    value: num(v.value),
    minPurchaseAmount: num(v.minPurchaseAmount) || undefined,
    maxDiscountAmount: num(v.maxDiscountAmount) || undefined,
    usageLimit: v.usageLimit ? parseInt(v.usageLimit) : undefined,
    startDate: v.startDate,
    endDate: v.endDate,
    isActive: !!v.isActive,
  }),
  validate: (v): Record<string, string> => (v.startDate && v.endDate && v.endDate < v.startDate ? { endDate: "Tanggal akhir tidak boleh sebelum tanggal awal" } : {}),
};

// ─── Bank ─────────────────────────────────────────────────────────────

export const bankConfig: EntityConfig = {
  singular: "Bank", plural: "Daftar Bank", basePath: "/master/banks",
  endpoint: "bank", codePrefix: "BNK", searchFields: ["code", "name"],
  columns: [
    codeCol, { key: "Name", label: "Nama Bank" },
    { key: "AccountNumber", label: "No. Rekening", width: 150, render: (v) => str(v) || "-" },
    { key: "AccountName", label: "Atas Nama", render: (v) => str(v) || "-" },
    { key: "Branch", label: "Cabang", render: (v) => str(v) || "-" },
    statusCol,
  ],
  sections: [{
    title: "Data Bank",
    fields: [
      { key: "name", label: "Nama Bank", required: true },
      { key: "branch", label: "Cabang" },
      { key: "accountNumber", label: "Nomor Rekening" },
      { key: "accountName", label: "Atas Nama Rekening" },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3 },
      activeField,
    ],
  }],
  defaults: { name: "", branch: "", accountNumber: "", accountName: "", description: "", isActive: true },
  fromRow: (r) => ({
    name: str(r.Name),
    branch: str(r.Branch),
    accountNumber: str(r.AccountNumber),
    accountName: str(r.AccountName),
    description: str(r.Description),
    isActive: r.IsActive !== false,
  }),
  toPayload: (v) => ({
    name: v.name.trim(),
    branch: v.branch || undefined,
    accountNumber: v.accountNumber || undefined,
    accountName: v.accountName || undefined,
    description: v.description || undefined,
    isActive: !!v.isActive,
  }),
};

export const eMoneyConfig: EntityConfig = {
  singular: "E-Money", plural: "Daftar E-Money", basePath: "/master/e-money",
  endpoint: "e-money", codePrefix: "EMN", searchFields: ["code", "name"],
  columns: [
    codeCol, { key: "Name", label: "Nama E-Money" },
    { key: "AccountNumber", label: "No. Akun", width: 150, render: (v) => str(v) || "-" },
    { key: "AccountName", label: "Atas Nama", render: (v) => str(v) || "-" },
    statusCol,
  ],
  sections: [{
    title: "Data E-Money",
    fields: [
      { key: "name", label: "Nama E-Money", required: true, hint: "Contoh: GoPay, OVO, DANA, QRIS." },
      { key: "accountNumber", label: "Nomor Akun" },
      { key: "accountName", label: "Atas Nama Akun" },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3 },
      activeField,
    ],
  }],
  defaults: { name: "", accountNumber: "", accountName: "", description: "", isActive: true },
  fromRow: (r) => ({
    name: str(r.Name),
    accountNumber: str(r.AccountNumber),
    accountName: str(r.AccountName),
    description: str(r.Description),
    isActive: r.IsActive !== false,
  }),
  toPayload: (v) => ({
    name: v.name.trim(),
    accountNumber: v.accountNumber || undefined,
    accountName: v.accountName || undefined,
    description: v.description || undefined,
    isActive: !!v.isActive,
  }),
};

export const shippingConfig: EntityConfig = {
  singular: "Ongkir", plural: "Daftar Ongkir", basePath: "/master/shipping-costs",
  endpoint: "shipping-cost", codePrefix: "ONG", searchFields: ["code", "name"],
  columns: [
    codeCol, { key: "Name", label: "Nama Expedisi" },
    { key: "Region", label: "Region", render: (_v, r) => r.Region?.Name ?? "-" },
    { key: "SubRegion", label: "Sub Region", render: (_v, r) => r.SubRegion?.Name ?? "-" },
    { key: "Cost", label: "Tarif (Rp)", align: "right", render: (v) => num(v).toLocaleString("id-ID") },
    { key: "EstimatedDays", label: "Estimasi (Hari)", align: "right", render: (v) => v ? `${v} hari` : "-" },
    statusCol,
  ],
  sections: [{
    title: "Data Ongkir",
    fields: [
      { key: "name", label: "Nama Expedisi", required: true, hint: "Contoh: JNE, J&T, SiCepat, Pos Indonesia" },
      {
        key: "regionId", label: "Region/Wilayah", type: "select",
        optionsFrom: { endpoint: "region", label: (r: any) => `${r.Code} - ${r.Name}` },
        hint: "Wilayah tujuan expedisi",
      },
      {
        key: "subRegionId", label: "Sub Region", type: "select",
        optionsFrom: { endpoint: "sub-region", label: (r: any) => `${r.Code} - ${r.Name}` },
        hint: "Sub wilayah tujuan expedisi",
      },
      { key: "cost", label: "Tarif (Rp)", type: "number", required: true },
      { key: "estimatedDays", label: "Estimasi Pengiriman (Hari)", type: "number" },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3 },
      activeField,
    ],
  }],
  defaults: { name: "", regionId: "", subRegionId: "", cost: "0", estimatedDays: "0", description: "", isActive: true },
  fromRow: (r) => ({
    name: str(r.Name),
    regionId: str(r.RegionID ?? ""),
    subRegionId: str(r.SubRegionID ?? ""),
    cost: str(r.Cost ?? 0),
    estimatedDays: str(r.EstimatedDays ?? 0),
    description: str(r.Description),
    isActive: r.IsActive !== false,
  }),
  toPayload: (v) => ({
    name: v.name.trim(),
    regionId: v.regionId ? Number(v.regionId) : undefined,
    subRegionId: v.subRegionId ? Number(v.subRegionId) : undefined,
    cost: num(v.cost),
    estimatedDays: v.estimatedDays ? parseInt(v.estimatedDays) : undefined,
    description: v.description || undefined,
    isActive: !!v.isActive,
  }),
};
