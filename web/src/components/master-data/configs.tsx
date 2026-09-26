"use client";

import { KEditableGrid } from "@/components/kform";
import type { EntityConfig, ListColumn, FieldDef } from "./types";

// ─── Shared bits ─────────────────────────────────────────────────────

const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));
const num = (v: unknown) => (v === "" || v === undefined || v === null ? 0 : Number(v));

/** "YYYY-MM-DD" from a date input -> full ISO timestamp (local start / end of day) for DateTime columns. */
const dayStart = (d: string) => (d ? new Date(`${d}T00:00:00`).toISOString() : undefined);
const dayEnd = (d: string) => (d ? new Date(`${d}T23:59:59.999`).toISOString() : undefined);
/** ISO timestamp -> "YYYY-MM-DD" in local time for a date input. */
const toDateInput = (v: unknown) => {
  if (!v) return "";
  const d = new Date(v as string);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

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
  singular: "Jenis", plural: "Daftar Jenis", basePath: "/master/categories", endpoint: "categories",
  codePrefix: "JNS", codeLabel: "Jenis", codeEditable: true, codeRequired: true,
  formTitle: (isNew) => `${isNew ? "Tambah" : "Edit"} Jenis`,
  searchFields: ["code", "name"], searchPlaceholder: "Cari jenis / keterangan",
  columns: [
    { key: "Code", label: "Jenis", width: 220 },
    { key: "Name", label: "Keterangan", width: 360 },
  ],
  sortOptions: [{ value: "Code", label: "Jenis" }, { value: "Name", label: "Keterangan" }],
  sections: [{
    title: "Data Jenis",
    fields: [
      { key: "name", label: "Keterangan", required: true },
    ],
  }],
  defaults: { name: "" },
  fromRow: (r) => ({ name: str(r.Name) }),
  toPayload: (v) => ({ name: v.name.trim() }),
};

// ─── Data Merek ──────────────────────────────────────────────────────

export const brandConfig: EntityConfig = {
  singular: "Merek", plural: "Daftar Merek", basePath: "/master/brands", endpoint: "brand",
  codePrefix: "MRK", codeLabel: "Merek", codeEditable: true, codeRequired: true,
  formTitle: (isNew) => `${isNew ? "Tambah" : "Edit"} Merek`,
  searchFields: ["code", "name"], searchPlaceholder: "Cari merek / keterangan",
  columns: [
    { key: "Code", label: "Merek", width: 220 },
    { key: "Name", label: "Keterangan", width: 360 },
  ],
  sortOptions: [{ value: "Code", label: "Merek" }, { value: "Name", label: "Keterangan" }],
  sections: [{
    title: "Data Merek",
    fields: [
      { key: "name", label: "Keterangan", required: true },
    ],
  }],
  defaults: { name: "" },
  fromRow: (r) => ({ name: str(r.Name) }),
  toPayload: (v) => ({ name: v.name.trim() }),
};

// ─── Data Satuan (with konversi) ─────────────────────────────────────

export const unitConfig: EntityConfig = {
  singular: "Satuan", plural: "Daftar Satuan", basePath: "/master/units", endpoint: "unit",
  codePrefix: "SAT", codeLabel: "Satuan", codeEditable: true, codeRequired: true,
  formTitle: (isNew) => `${isNew ? "Tambah" : "Edit"} Satuan`,
  searchFields: ["code", "name"], searchPlaceholder: "Cari satuan / keterangan",
  columns: [
    { key: "Code", label: "Satuan", width: 220 },
    { key: "Name", label: "Keterangan", width: 360 },
  ],
  sortOptions: [{ value: "Code", label: "Satuan" }, { value: "Name", label: "Keterangan" }],
  sections: [{
    title: "Data Satuan",
    fields: [
      { key: "name", label: "Keterangan", required: true },
    ],
  }],
  defaults: { name: "" },
  fromRow: (r) => ({ name: str(r.Name) }),
  toPayload: (v) => ({ name: v.name.trim() }),
};

// ─── Dept./Gudang ────────────────────────────────────────────────────

const WAREHOUSE_FN: Record<string, string> = { MAIN: "Utama", BRANCH: "Cabang", WAREHOUSE: "Gudang" };
const accountLabel = (r: any) => `${r.Code} - ${r.Name}`; // eslint-disable-line @typescript-eslint/no-explicit-any
const accountCell = (rel: string) => (_v: unknown, r: any) => (r[rel] ? `${r[rel].Code} - ${r[rel].Name}` : ""); // eslint-disable-line @typescript-eslint/no-explicit-any

export const warehouseConfig: EntityConfig = {
  singular: "Dept./Gudang", plural: "Dept./Gudang", basePath: "/master/warehouses", endpoint: "warehouse",
  codePrefix: "GDG", codeEditable: true, codeRequired: true,
  formTitle: (isNew) => `${isNew ? "Tambah" : "Edit"} Dept./Gudang`,
  searchFields: ["code", "name", "address"], searchPlaceholder: "Cari kode / nama kantor", include: "Account",
  columns: [
    { key: "Code", label: "Kode", width: 90 },
    { key: "Function", label: "Fungsi", width: 100, render: (v) => WAREHOUSE_FN[str(v)] ?? str(v) },
    { key: "Name", label: "Keterangan", width: 160 },
    { key: "Account.Code", label: "Akun", width: 280, render: accountCell("Account") },
    { key: "Address", label: "Alamat", width: 200 },
    { key: "Phone", label: "Telepon", width: 120 },
    { key: "Fax", label: "Fax", width: 120 },
    { key: "IsDefault", label: "Default", width: 80, render: (v) => (v ? "Ya" : "") },
  ],
  sortOptions: [{ value: "Code", label: "Kode" }, { value: "Name", label: "Keterangan" }, { value: "Function", label: "Fungsi" }],
  sections: [{
    title: "Data Gudang",
    fields: [
      {
        key: "function", label: "Fungsi", type: "select", required: true,
        options: [{ value: "MAIN", label: "Utama" }, { value: "BRANCH", label: "Cabang" }, { value: "WAREHOUSE", label: "Gudang" }],
      },
      { key: "name", label: "Nama Kantor", required: true },
      { key: "address", label: "Alamat" },
      { key: "phone", label: "Telepon" },
      { key: "fax", label: "No Fax" },
      {
        key: "accountId", label: "Kode Akun", type: "select",
        optionsFrom: { endpoint: "account", label: accountLabel },
        hint: "Akun persediaan untuk dept./gudang ini.",
      },
      { key: "isDefault", label: "Gudang Default", type: "checkbox", caption: "Jadikan dept./gudang default transaksi" },
    ],
  }],
  defaults: { function: "WAREHOUSE", name: "", address: "", phone: "", fax: "", accountId: "", isDefault: false },
  fromRow: (r) => ({
    function: str(r.Function || "WAREHOUSE"), name: str(r.Name), address: str(r.Address), phone: str(r.Phone), fax: str(r.Fax),
    accountId: str(r.AccountID ?? ""), isDefault: !!r.IsDefault,
  }),
  toPayload: (v) => ({
    function: v.function, name: v.name.trim(), address: v.address || null, phone: v.phone || null, fax: v.fax || null,
    accountId: v.accountId ? Number(v.accountId) : null, isDefault: !!v.isDefault,
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
        key: "warehouseId", label: "Dept./Gudang", type: "select",
        optionsFrom: { endpoint: "warehouse", label: (r) => `${r.Code} - ${r.Name}` },
        hint: "Gudang sumber stok untuk sale point ini.",
      },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3, full: true },
      activeField,
    ],
  }],
  defaults: { name: "", warehouseId: "", description: "", isActive: true },
  fromRow: (r) => ({ name: str(r.Name), warehouseId: str(r.WarehouseID), description: str(r.Description), isActive: r.IsActive !== false }),
  toPayload: (v) => ({ name: v.name.trim(), warehouseId: v.warehouseId ? Number(v.warehouseId) : undefined, description: v.description || undefined, isActive: !!v.isActive }),
};

// ─── Grup Pelanggan ────────────────────────────────────────────────

export const customerGroupConfig: EntityConfig = {
  singular: "Grup Pelanggan", plural: "Daftar Grup Pelanggan", basePath: "/master/customer-groups",
  endpoint: "customer-group", codePrefix: "GRP", codeEditable: true, codeRequired: true,
  formTitle: (isNew) => `${isNew ? "Tambah" : "Edit"} Grup Pelanggan`,
  searchFields: ["code", "name"],
  columns: [
    { key: "Code", label: "Kode", width: 180 },
    { key: "Name", label: "Grup", width: 180 },
    { key: "DiscountPercent", label: "Potongan", align: "right", width: 260, render: (v) => num(v).toFixed(2) },
    { key: "PriceLevel", label: "Level Harga", align: "right", width: 300 },
  ],
  sortOptions: [{ value: "Code", label: "Kode" }, { value: "Name", label: "Grup" }, { value: "DiscountPercent", label: "Potongan" }, { value: "PriceLevel", label: "Level Harga" }],
  sections: [{
    title: "Data Grup",
    fields: [
      { key: "name", label: "Grup", required: true, hint: "Contoh: General, Bronze, Silver, Gold." },
      { key: "discountPercent", label: "Potongan (%)", type: "number", hint: "Potongan untuk pelanggan grup ini (Tipe Potongan Grup Per Item / Per Faktur)." },
      {
        key: "priceLevel", label: "Level Harga", type: "select", required: true,
        options: [1, 2, 3, 4].map((n) => ({ value: String(n), label: String(n) })),
        hint: "Level harga jual yang dipakai untuk item dengan harga jual berdasarkan level.",
      },
    ],
  }],
  defaults: { name: "", discountPercent: "0", priceLevel: "1" },
  fromRow: (r) => ({ name: str(r.Name), discountPercent: str(r.DiscountPercent ?? 0), priceLevel: str(r.PriceLevel ?? 1) }),
  toPayload: (v) => ({
    name: v.name.trim(),
    discountPercent: num(v.discountPercent),
    priceLevel: Math.min(4, Math.max(1, Math.trunc(num(v.priceLevel) || 1))),
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
  endpoint: "sub-region", codePrefix: "SWL", codeKey: "Code", searchFields: ["code", "name"], include: "region",
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
  // sub-region DTO is PascalCase (Code, Name, RegionID, ...).
  toPayload: (v) => ({ Name: v.name.trim(), RegionID: Number(v.regionId), Description: v.description || undefined, IsActive: !!v.isActive }),
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
    startDate: toDateInput(r.StartDate),
    endDate: toDateInput(r.EndDate),
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
    startDate: dayStart(v.startDate),
    endDate: dayEnd(v.endDate),
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
    startDate: toDateInput(r.StartDate),
    endDate: toDateInput(r.EndDate),
    isActive: r.IsActive !== false,
  }),
  toPayload: (v) => ({
    name: v.name.trim(),
    typeId: Number(v.typeId),
    value: num(v.value),
    minPurchaseAmount: num(v.minPurchaseAmount) || undefined,
    maxDiscountAmount: num(v.maxDiscountAmount) || undefined,
    usageLimit: v.usageLimit ? parseInt(v.usageLimit) : undefined,
    startDate: dayStart(v.startDate),
    endDate: dayEnd(v.endDate),
    isActive: !!v.isActive,
  }),
  validate: (v): Record<string, string> => (v.startDate && v.endDate && v.endDate < v.startDate ? { endDate: "Tanggal akhir tidak boleh sebelum tanggal awal" } : {}),
};

// ─── Bank ─────────────────────────────────────────────────────────────

export const bankConfig: EntityConfig = {
  singular: "Bank", plural: "Daftar Bank", basePath: "/master/banks",
  endpoint: "bank", codePrefix: "BNK", codeEditable: true, codeRequired: true, codeLabel: "Kode",
  formTitle: (isNew) => `${isNew ? "Tambah" : "Edit"} Bank`,
  searchFields: ["code", "name"], include: "DebitAccount,CreditAccount",
  columns: [
    { key: "Code", label: "Kode Bank", width: 160 },
    { key: "Name", label: "Nama Bank", width: 260 },
    { key: "DebitAccount.Code", label: "Bayar Kartu Debit", width: 240, render: accountCell("DebitAccount") },
    { key: "CreditAccount.Code", label: "Bayar Kartu Kredit", width: 240, render: accountCell("CreditAccount") },
    { key: "AccountNumber", label: "No. Rekening", width: 140 },
    { key: "AccountName", label: "Atas Nama", width: 160 },
    { key: "Branch", label: "Cabang", width: 120 },
  ],
  sortOptions: [{ value: "Code", label: "Kode Bank" }, { value: "Name", label: "Nama Bank" }],
  sections: [{
    title: "Data Bank",
    fields: [
      { key: "name", label: "Nama Bank", required: true },
      { key: "debitAccountId", label: "Bayar Kartu Debit", type: "select", optionsFrom: { endpoint: "account", label: accountLabel }, hint: "Akun kas/bank penerima pembayaran kartu debit." },
      { key: "creditAccountId", label: "Bayar Kartu Kredit", type: "select", optionsFrom: { endpoint: "account", label: accountLabel }, hint: "Akun piutang kartu kredit." },
      { key: "accountNumber", label: "No. Rekening" },
      { key: "accountName", label: "Atas Nama" },
      { key: "branch", label: "Cabang" },
    ],
  }],
  defaults: { name: "", debitAccountId: "", creditAccountId: "", accountNumber: "", accountName: "", branch: "" },
  fromRow: (r) => ({
    name: str(r.Name), debitAccountId: str(r.DebitAccountID ?? ""), creditAccountId: str(r.CreditAccountID ?? ""),
    accountNumber: str(r.AccountNumber), accountName: str(r.AccountName), branch: str(r.Branch),
  }),
  toPayload: (v) => ({
    name: v.name.trim(),
    debitAccountId: v.debitAccountId ? Number(v.debitAccountId) : null,
    creditAccountId: v.creditAccountId ? Number(v.creditAccountId) : null,
    accountNumber: v.accountNumber || undefined, accountName: v.accountName || undefined, branch: v.branch || undefined,
  }),
};

export const eMoneyConfig: EntityConfig = {
  singular: "E-Money", plural: "Daftar E-Money", basePath: "/master/e-money",
  endpoint: "e-money", codePrefix: "EMN", codeKey: "Code", codeEditable: true, codeRequired: true,
  formTitle: (isNew) => `${isNew ? "Tambah" : "Edit"} E-Money`,
  searchFields: ["code", "name"], include: "Account",
  columns: [
    { key: "Code", label: "Kode", width: 160 },
    { key: "Name", label: "Nama E-Money", width: 240 },
    { key: "Account.Code", label: "Akun", width: 260, render: accountCell("Account") },
    { key: "AccountNumber", label: "No. Akun", width: 150 },
    { key: "AccountName", label: "Atas Nama", width: 180 },
    { key: "Description", label: "Keterangan", width: 220 },
  ],
  sortOptions: [{ value: "Code", label: "Kode" }, { value: "Name", label: "Nama E-Money" }],
  sections: [{
    title: "Data E-Money",
    fields: [
      { key: "name", label: "Nama E-Money", required: true, hint: "Contoh: GoPay, OVO, DANA, ShopeePay, QRIS." },
      { key: "accountId", label: "Akun", type: "select", optionsFrom: { endpoint: "account", label: accountLabel }, hint: "Akun penampung pembayaran e-money." },
      { key: "accountNumber", label: "No. Akun" },
      { key: "accountName", label: "Atas Nama" },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3 },
    ],
  }],
  defaults: { name: "", accountId: "", accountNumber: "", accountName: "", description: "" },
  fromRow: (r) => ({
    name: str(r.Name), accountId: str(r.AccountID ?? ""), accountNumber: str(r.AccountNumber), accountName: str(r.AccountName), description: str(r.Description),
  }),
  // e-money DTO is PascalCase.
  toPayload: (v) => ({
    Name: v.name.trim(), AccountID: v.accountId ? Number(v.accountId) : null,
    AccountNumber: v.accountNumber || undefined, AccountName: v.accountName || undefined, Description: v.description || undefined,
  }),
};

export const shippingConfig: EntityConfig = {
  singular: "Ongkir", plural: "Daftar Ongkir", basePath: "/master/shipping-costs",
  endpoint: "shipping-cost", codePrefix: "ONG", codeKey: "Code", hasCode: true,
  formTitle: (isNew) => `${isNew ? "Tambah" : "Edit"} Ongkir`,
  searchFields: ["name", "fromCity", "toCity", "country"], searchPlaceholder: "Cari expedisi / kota",
  columns: [
    { key: "Name", label: "Expedisi", width: 140 },
    { key: "FromCity", label: "Dari Kota", width: 140 },
    { key: "ToCity", label: "Kota Tujuan", width: 140 },
    { key: "Country", label: "Negara", width: 120 },
    { key: "Cost", label: "Biaya 1", align: "right", width: 120, render: (v) => num(v).toLocaleString("en-US", { minimumFractionDigits: 2 }) },
    { key: "Cost2", label: "Biaya 2", align: "right", width: 120, render: (v) => num(v).toLocaleString("en-US", { minimumFractionDigits: 2 }) },
    { key: "Cost3", label: "Biaya 3", align: "right", width: 120, render: (v) => num(v).toLocaleString("en-US", { minimumFractionDigits: 2 }) },
    { key: "Description", label: "Keterangan", width: 220 },
  ],
  sortOptions: [
    { value: "Name", label: "Expedisi" }, { value: "FromCity", label: "Dari Kota" }, { value: "ToCity", label: "Kota Tujuan" }, { value: "Cost", label: "Biaya 1" },
  ],
  defaultSort: "Name",
  sections: [{
    title: "Data Ongkir",
    fields: [
      { key: "name", label: "Expedisi", required: true, hint: "Contoh: JNE, TIKI, J&T, SiCepat, Pos Indonesia" },
      { key: "fromCity", label: "Dari Kota" },
      { key: "toCity", label: "Kota Tujuan" },
      { key: "country", label: "Negara" },
      { key: "cost", label: "Biaya 1", type: "number", required: true },
      { key: "cost2", label: "Biaya 2", type: "number" },
      { key: "cost3", label: "Biaya 3", type: "number" },
      { key: "description", label: "Keterangan", type: "textarea", rows: 3, hint: "Contoh: 1(REG), 2(YES), 3(Express)" },
    ],
  }],
  defaults: { name: "", fromCity: "", toCity: "", country: "Indonesia", cost: "0", cost2: "0", cost3: "0", description: "" },
  fromRow: (r) => ({
    name: str(r.Name), fromCity: str(r.FromCity), toCity: str(r.ToCity), country: str(r.Country),
    cost: str(r.Cost ?? 0), cost2: str(r.Cost2 ?? 0), cost3: str(r.Cost3 ?? 0), description: str(r.Description),
  }),
  // shipping-cost DTO is PascalCase.
  toPayload: (v) => ({
    Name: v.name.trim(), FromCity: v.fromCity || null, ToCity: v.toCity || null, Country: v.country || null,
    Cost: num(v.cost), Cost2: num(v.cost2), Cost3: num(v.cost3), Description: v.description || undefined,
  }),
};
