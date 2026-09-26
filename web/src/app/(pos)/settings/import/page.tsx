"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Download, CheckCircle2, XCircle, FileSpreadsheet } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { KInfoBox } from "@/components/kform";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/lib/page-title";

type EntityKey = "supplier" | "customer" | "product" | "unit" | "level" | "qty";

type Row = Record<string, unknown>;
type Lookups = Record<string, Map<string, number>>;

interface EntityConfig {
  label: string;
  desc: string;
  /** Column names listed in the Ketoko guide (first ones marked required). */
  docColumns: string[];
  required: string[];
  /** null = no import endpoint on the server yet (template + reference only). */
  endpoint: string | null;
  variant?: Variant;
  /** Varian product-import yang dipakai saat mengirim baris hasil mapRow. */
  importVariant?: Variant;
  columns: string[];
  template: string;
  mapRow?: (cells: string[], lookups: Lookups) => Row;
}

const unitCols = (name: string, n = 4) => Array.from({ length: n }, (_, i) => `${name} ${i + 1}`);
const perUnit = (name: string) => [1, 2, 3, 4].map((i) => `${name} Satuan ${i}`);
const itemTail = ["Point 1", "Point 2", "Point 3", "Point 4", ...unitCols("Komisi Sales"), "Stok Awal Satuan Dasar", "Stok Minimum", "Tipe Item", "Rak", "Kode Gudang", "Kode Supplier", "Keterangan"];

const ENTITIES: Record<EntityKey, EntityConfig> = {
  supplier: {
    label: "Import Data Supplier", desc: "Data supplier dari Excel/CSV",
    docColumns: ["Nama", "Alamat", "Kota", "Provinsi", "Negara", "Kode Pos", "Telepon", "Fax", "Bank", "No Rekening", "AN/Rekening", "Kontak", "Email", "Keterangan"],
    required: ["Nama"],
    endpoint: "supplier",
    columns: ["code", "name", "contactPerson", "phone", "email", "address"],
    template: "code,name,contactPerson,phone,email,address\nSUP001,Supplier Contoh,Budi,08123456789,budi@mail.com,Jl. Contoh No. 1",
    mapRow: (c) => ({
      code: c[0]?.trim(), name: c[1]?.trim(), contactPerson: c[2]?.trim() || undefined,
      phone: c[3]?.trim() || undefined, email: c[4]?.trim() || undefined, address: c[5]?.trim() || undefined,
    }),
  },
  customer: {
    label: "Import Data Pelanggan", desc: "Data pelanggan dari Excel/CSV",
    docColumns: ["Kode", "Nama", "Alamat", "Kota", "Provinsi", "Negara", "Kode Pos", "Telepon", "Fax", "Bank", "No Rekening", "AN/Rekening", "Kontak", "Email", "Keterangan", "Wilayah", "Sub Wilayah"],
    required: ["Kode", "Nama"],
    endpoint: "customer",
    columns: ["code", "name", "phone", "email", "address"],
    template: "code,name,phone,email,address\nCUST001,Pelanggan Contoh,08123456789,pelanggan@mail.com,Jl. Contoh No. 2",
    mapRow: (c) => ({
      Code: c[0]?.trim(), Name: c[1]?.trim(), Phone: c[2]?.trim() || undefined,
      Email: c[3]?.trim() || undefined, Address: c[4]?.trim() || undefined,
    }),
  },
  product: {
    label: "Import Item Berdasarkan 1 Harga", desc: "Item dengan satu satuan dan satu harga jual",
    docColumns: ["Kode Item", "Barcode", "Nama Item", "Jenis", "Merk", "Satuan", "Harga Pokok", "Harga Jual", "Stok Awal", "Stok Minimum", "Tipe Item", "Rak", "Kantor", "Supplier", "Keterangan", "Point", "Komisi Sales"],
    required: ["Kode Item", "Nama Item", "Satuan"],
    // Dikirim ke product-import (1 satuan) supaya stok awal tercatat per gudang lewat buku stok.
    endpoint: "product-import", importVariant: "unit",
    columns: ["code", "name", "categoryCode", "unitCode", "purchasePrice", "sellingPrice", "stock"],
    template: "code,name,categoryCode,unitCode,purchasePrice,sellingPrice,stock\nP001,Item Contoh,CAT1,PCS,1000,1500,10",
    mapRow: (c) => {
      const item = {
        code: c[0]?.trim() ?? "", name: c[1]?.trim() ?? "", category: c[2]?.trim() || undefined,
        stock: Number(c[6]) || 0,
        units: [{ unit: c[3]?.trim() ?? "", conversion: 1, purchasePrice: Number(c[4]) || 0, sellingPrice: Number(c[5]) || 0 }],
      };
      return { code: item.code, name: item.name, categoryCode: c[2]?.trim(), unitCode: c[3]?.trim(), purchasePrice: item.units[0].purchasePrice, sellingPrice: item.units[0].sellingPrice, stock: item.stock, _item: item };
    },
  },
  unit: {
    variant: "unit",
    label: "Import Item Berdasarkan Satuan", desc: "Item multi satuan (sampai 4 satuan)",
    docColumns: ["Kode Item", "Nama Item", "Jenis", "Merek", ...unitCols("Satuan"), ...unitCols("Barcode"), ...unitCols("Konversi Satuan"), ...unitCols("Harga Pokok"), ...unitCols("Harga Jual"), ...unitCols("Point"), ...unitCols("Komisi Sales"), "Stok Awal", "Stok Minimum", "Tipe Item", "Rak", "Kantor", "Supplier", "Keterangan"],
    required: ["Kode Item", "Nama Item", "Satuan 1"],
    endpoint: "product-import", columns: ["code", "name", "units", "stock"], template: "",
  },
  level: {
    variant: "level",
    label: "Import Item Berdasarkan Level", desc: "Item dengan harga jual bertingkat (level 1-4)",
    docColumns: ["Kode Item", "Nama Item", "Jenis", "Merek", ...unitCols("Satuan"), ...perUnit("Barcode"), ...perUnit("Konversi"), ...perUnit("Harga Pokok"),
      ...[1, 2, 3, 4].flatMap((lv) => [1, 2, 3, 4].map((u) => `Harga Jual Satuan ${u} (level ${lv})`)), ...itemTail],
    required: ["Kode Item", "Nama Item", "Satuan 1"],
    endpoint: "product-import", columns: ["code", "name", "units", "stock"], template: "",
  },
  qty: {
    variant: "qty",
    label: "Import Item Berdasarkan Jumlah", desc: "Item dengan harga bertingkat berdasarkan jumlah",
    docColumns: ["Kode Item", "Nama Item", "Jenis", "Merek", ...unitCols("Satuan"), ...perUnit("Barcode"), ...perUnit("Konversi"), ...perUnit("Harga Pokok"),
      ...[1, 2, 3, 4].flatMap((u) => [1, 2, 3, 4].flatMap((n) => [`Jumlah Sampai ${n} Satuan ${u}`, `Harga Sampai ${n} Satuan ${u}`])), ...itemTail],
    required: ["Kode Item", "Nama Item", "Satuan 1"],
    endpoint: "product-import", columns: ["code", "name", "units", "stock"], template: "",
  },
};


type Variant = "unit" | "level" | "qty";

/** Header-based parse of the multi-unit / level / quantity-tier item sheets into the product-import payload. */
function mapVariantRows(header: string[], dataRows: string[][], variant: Variant): Row[] {
  const idx = new Map<string, number>();
  header.forEach((h, i) => { const k = h.trim().toLowerCase(); if (!idx.has(k)) idx.set(k, i); });
  return dataRows.map((cells) => {
    const get = (name: string) => { const i = idx.get(name.toLowerCase()); return i === undefined ? "" : (cells[i] ?? "").trim(); };
    const n = (name: string) => Number(get(name).replace(/[^0-9.\-]/g, "")) || 0;
    const units = [1, 2, 3, 4].map((u) => {
      const unit = get(`Satuan ${u}`);
      if (!unit) return null;
      if (variant === "unit") {
        return { unit, barcode: get(`Barcode ${u}`) || undefined, conversion: n(`Konversi Satuan ${u}`) || 1, purchasePrice: n(`Harga Pokok ${u}`), sellingPrice: n(`Harga Jual ${u}`) };
      }
      const base = { unit, barcode: get(`Barcode Satuan ${u}`) || undefined, conversion: n(`Konversi Satuan ${u}`) || 1, purchasePrice: n(`Harga Pokok Satuan ${u}`) };
      if (variant === "level") return { ...base, levelPrices: [1, 2, 3, 4].map((lv) => n(`Harga Jual Satuan ${u} (level ${lv})`)) };
      return { ...base, qtyTiers: [1, 2, 3, 4].map((t) => ({ upTo: n(`Jumlah Sampai ${t} Satuan ${u}`), price: n(`Harga Sampai ${t} Satuan ${u}`) })) };
    }).filter(Boolean);
    const item = {
      code: get("Kode Item"), name: get("Nama Item"), category: get("Jenis") || undefined, brand: get("Merek") || get("Merk") || undefined,
      warehouse: get("Kode Gudang") || get("Kantor") || undefined,
      stock: n("Stok Awal Satuan Dasar") || n("Stok Awal"), minStock: n("Stok Minimum"), description: get("Keterangan") || undefined, units,
    };
    return { code: item.code, name: item.name, units: units.map((u) => (u as { unit: string }).unit).join(" / "), stock: item.stock, _item: item };
  });
}

function parseCsv(text: string): string[][] {
  return text.split(/\r?\n/).filter((line) => line.trim().length > 0).map((line) => line.split(",").map((cell) => cell.trim()));
}

export default function ImportDataPage() {
  usePageTitle("Import Data");
  const [entity, setEntity] = useState<EntityKey>("supplier");
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ successCount: number; failedCount: number; failed: { data: unknown; error: string }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = ENTITIES[entity];
  const canImport = config.endpoint !== null;

  const choose = (k: EntityKey) => { setEntity(k); setRows([]); setResult(null); setFileName(""); };

  const handleFile = async (file: File) => {
    if (!config.mapRow && !config.variant) return;
    setFileName(file.name);
    setResult(null);
    const text = await file.text();
    const parsed = parseCsv(text);
    if (config.variant) { setRows(mapVariantRows(parsed[0] ?? [], parsed.slice(1), config.variant)); return; }
    const dataRows = parsed.slice(1);
    const lookups: Lookups = { category: new Map(), unit: new Map() };
    setRows(dataRows.map((cells) => config.mapRow!(cells, lookups)));
  };

  const handleImport = async () => {
    if (rows.length === 0 || !config.endpoint) return;
    const sendVariant = config.variant ?? config.importVariant;
    setImporting(true);
    try {
      const res = await api.post<{ successCount: number; failedCount: number; failed?: { data: unknown; error: string }[] }>(
        sendVariant ? config.endpoint : `${config.endpoint}/bulk`,
        sendVariant ? { variant: sendVariant, items: rows.map((r) => r._item) } : rows);
      if (res.success && res.data) setResult({ successCount: res.data.successCount, failedCount: res.data.failedCount, failed: res.data.failed ?? [] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import gagal");
    } finally { setImporting(false); }
  };

  const downloadTemplate = () => {
    const content = config.template || `${config.docColumns.join(",")}\n`;
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contoh-${entity}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-3 text-[13px] text-[#3a4654]">
          Import Data berfungsi untuk memindahkan master data Item, Supplier dan Pelanggan dari Excel ke program. Pilih jenis data, unduh Contoh File, isi datanya, lalu Upload File dan klik Import Data.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(ENTITIES) as EntityKey[]).map((k) => (
            <button key={k} type="button" onClick={() => choose(k)}
              className={cn("flex items-start gap-3 rounded border p-3 text-left transition-colors hover:bg-elevated", entity === k ? "border-primary bg-primary/5" : "border-[#d5d9de]")}>
              <FileSpreadsheet className="mt-0.5 size-5 shrink-0 text-primary" />
              <span>
                <span className="block text-[14px] font-semibold">{ENTITIES[k].label}</span>
                <span className="block text-[12px] text-[#3a4654]">{ENTITIES[k].desc}</span>
                {!ENTITIES[k].endpoint && <span className="mt-1 inline-block text-[11px] text-[#b26a00]">Import belum tersedia di server</span>}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="mb-2 text-[16px] font-semibold">{config.label}</h3>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button variant="outline" icon={Download} onClick={downloadTemplate}>Contoh File</Button>
          <Button variant="outline" icon={Upload} onClick={() => fileInputRef.current?.click()} disabled={!canImport}>Upload File</Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }} />
          <Button variant="primary" onClick={handleImport} loading={importing} disabled={!canImport || rows.length === 0}>Import Data</Button>
          {fileName && <span className="text-sm text-muted">{fileName} &middot; {rows.length} baris</span>}
        </div>

        {!canImport && (
          <KInfoBox title="Keterangan" items={["Penyimpanan belum tersedia di server untuk jenis import ini. Contoh File berisi kolom sesuai panduan Ketoko."]} />
        )}
        {canImport && <KInfoBox title="Penting" items={["File berformat CSV (kolom dipisah koma), baris pertama = judul kolom. Kode tidak boleh sama dengan kode lain (pelanggan/supplier/item)."]} />}

        <p className="mb-1 mt-3 text-[14px] font-semibold">Kolom pada tabel import ({config.docColumns.length} kolom, <span className="text-danger">merah = wajib diisi</span>)</p>
        <div className="flex max-h-56 flex-wrap gap-1 overflow-y-auto rounded border border-[#d5d9de] p-2">
          {config.docColumns.map((c) => (
            <span key={c} className={cn("rounded border px-2 py-0.5 text-[12px]", config.required.includes(c) ? "border-danger/50 bg-danger/10 text-danger" : "border-[#d5d9de] bg-[#f7f8fa]")}>{c}</span>
          ))}
        </div>

        {result && (
          <div className="mt-4 flex items-center gap-4 rounded-lg bg-elevated p-3">
            <span className="flex items-center gap-1 text-sm text-success"><CheckCircle2 className="size-4" /> {result.successCount} berhasil</span>
            {result.failedCount > 0 && <span className="flex items-center gap-1 text-sm text-danger"><XCircle className="size-4" /> {result.failedCount} gagal</span>}
          </div>
        )}
        {result && result.failed.map((f, i) => <p key={i} className="mt-1 text-xs text-danger">{JSON.stringify(f.data)} - {f.error}</p>)}

        {rows.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 font-semibold text-highlighted">Pratinjau Data ({rows.length} baris)</h3>
            <DataTable data={rows.slice(0, 50)} columns={config.columns.map((key) => ({ key, label: key }))} emptyMessage="Tidak ada data" />
            {entity === "product" && rows.some((r) => !r.categoryId || !r.unitId) && (
              <p className="mt-2 text-xs text-warning">
                <Badge variant="warning">Perhatian</Badge> Beberapa baris punya kode kategori/satuan yang tidak ditemukan - baris tersebut akan gagal saat import.
              </p>
            )}
          </div>
        )}
      </Card>
    </PageWrapper>
  );
}
