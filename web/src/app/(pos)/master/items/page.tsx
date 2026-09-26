"use client";

import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";
import { KetokoList, kcol, type KListColumn, type KListFilter, type KSortOption } from "@/components/ui/KetokoList";
import { UtilityButton } from "@/components/ui/GridActions";
import { ITEM_TYPE_LABEL } from "@/components/master/item-types";


// Kolom Daftar Item Ketoko: Kode Item, Nama Item, Stok, Satuan, Jenis, Merek, Rak, Harga Pokok, Harga Jual, Keterangan (+ lainnya).
const COLUMNS: KListColumn[] = [
  kcol.text("Code", "Kode Item", 110),
  kcol.text("Barcode", "Barcode", 120),
  kcol.text("Name", "Nama Item", 280),
  { ...kcol.qty("WarehouseStock", "Stok", 90), sortKey: "Stock" },
  { key: "Unit.Code", label: "Satuan", width: 70, render: (_v, r) => r.Unit?.Abbreviation || r.Unit?.Code || "" },
  kcol.text("Category.Code", "Jenis", 90),
  kcol.text("Brand.Name", "Merek", 110),
  kcol.text("Shelf", "Rak", 70),
  kcol.money("PurchasePrice", "Harga Pokok", 110),
  kcol.money("SellingPrice", "Harga Jual", 110),
  kcol.text("Description", "Keterangan", 180),
  { key: "ItemType", label: "Tipe Item", width: 110, render: (v) => ITEM_TYPE_LABEL[String(v)] ?? "" },
  kcol.qty("MinimumStock", "Stok Minimum", 110),
  kcol.text("Supplier.Name", "Supplier", 150),
  { key: "IsSold", label: "Status Jual", width: 100, render: (v) => (v === false ? "Tidak dijual" : "Masih dijual") },
  kcol.text("SKU", "SKU", 100),
];

const SORTS: KSortOption[] = [
  { value: "Code", label: "Kode Item" },
  { value: "Name", label: "Nama Item" },
  { value: "Barcode", label: "Barcode" },
  { value: "Stock", label: "Stok" },
  { value: "Category.Code", label: "Jenis" },
  { value: "Brand.Name", label: "Merek" },
  { value: "Shelf", label: "Rak" },
  { value: "PurchasePrice", label: "Harga Pokok" },
  { value: "SellingPrice", label: "Harga Jual" },
  { value: "CreatedAt", label: "Tanggal Input" },
];

const FILTERS: KListFilter[] = [
  {
    key: "warehouse", label: "Dept/Gudang", type: "select", allOption: "Semua Dept/Gudang",
    optionsFrom: { endpoint: "warehouse", label: (w) => `${w.Code} - ${w.Name}` },
    param: (v) => ({ $warehouse: v }),
  },
  {
    key: "type", label: "Tipe Item", type: "select",
    options: Object.entries(ITEM_TYPE_LABEL).map(([value, label]) => ({ value, label })),
    where: (v) => ({ ItemType: v }),
  },
  { key: "category", label: "Jenis", type: "select", optionsFrom: { endpoint: "categories", label: (c) => `${c.Code} - ${c.Name}` }, where: (v) => ({ CategoryID: Number(v) }) },
  { key: "brand", label: "Merek", type: "select", optionsFrom: { endpoint: "brand" }, where: (v) => ({ BrandID: Number(v) }) },
  { key: "shelf", label: "Rak", type: "text", where: (v) => ({ Shelf: { contains: v } }) },
  {
    key: "sold", label: "Status Jual", type: "select",
    options: [{ value: "true", label: "Masih dijual" }, { value: "false", label: "Tidak dijual" }],
    where: (v) => ({ IsSold: v === "true" }),
  },
];

const SEARCH = ["Code", "Name", "Barcode", "SKU", "Description"];

export default function MasterItemsPage() {
  const router = useRouter();
  return (
    <KetokoList
      title="Daftar Item"
      endpoint="products"
      basePath="/master/items"
      include="Unit,Category,Brand,Supplier"
      searchFields={SEARCH}
      searchPlaceholder="Kode / nama / barcode"
      filters={FILTERS}
      sortOptions={SORTS}
      defaultSort="Code"
      columns={COLUMNS}
      onCopy={(r) => router.push(`/master/items/new?copyFrom=${r.ID}`)}
      extraActions={(sel) => (
        <UtilityButton icon={Layers} onClick={() => router.push(sel ? `/master/items/stock-card?productId=${sel.ID}` : "/master/items/stock-card")}>
          Kartu Stok
        </UtilityButton>
      )}
    />
  );
}
