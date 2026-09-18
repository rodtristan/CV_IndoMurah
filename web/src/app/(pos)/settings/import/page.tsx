"use client";

import { useState, useRef } from "react";
import { Upload, Download, CheckCircle2, XCircle } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api-client";

type EntityKey = "supplier" | "customer" | "product";

interface EntityConfig {
  label: string;
  endpoint: string;
  columns: string[];
  template: string;
  mapRow: (cells: string[], lookups: Record<string, Map<string, number>>) => Record<string, any>;
}

const ENTITIES: Record<EntityKey, EntityConfig> = {
  supplier: {
    label: "Data Supplier",
    endpoint: "supplier",
    columns: ["code", "name", "contactPerson", "phone", "email", "address"],
    template: "code,name,contactPerson,phone,email,address\nSUP001,Supplier Contoh,Budi,08123456789,budi@mail.com,Jl. Contoh No. 1",
    mapRow: (c) => ({
      code: c[0]?.trim(), name: c[1]?.trim(), contactPerson: c[2]?.trim() || undefined,
      phone: c[3]?.trim() || undefined, email: c[4]?.trim() || undefined, address: c[5]?.trim() || undefined,
    }),
  },
  customer: {
    label: "Data Pelanggan",
    endpoint: "customer",
    columns: ["code", "name", "phone", "email", "address"],
    template: "code,name,phone,email,address\nCUST001,Pelanggan Contoh,08123456789,pelanggan@mail.com,Jl. Contoh No. 2",
    mapRow: (c) => ({
      Code: c[0]?.trim(), Name: c[1]?.trim(), Phone: c[2]?.trim() || undefined,
      Email: c[3]?.trim() || undefined, Address: c[4]?.trim() || undefined,
    }),
  },
  product: {
    label: "Data Item (Barang)",
    endpoint: "products",
    columns: ["code", "name", "categoryCode", "unitCode", "purchasePrice", "sellingPrice", "stock"],
    template: "code,name,categoryCode,unitCode,purchasePrice,sellingPrice,stock\nP001,Item Contoh,CAT1,PCS,1000,1500,10",
    mapRow: (c, lookups) => ({
      code: c[0]?.trim(),
      name: c[1]?.trim(),
      categoryId: lookups.category.get(c[2]?.trim().toUpperCase()),
      unitId: lookups.unit.get(c[3]?.trim().toUpperCase()),
      purchasePrice: Number(c[4]) || 0,
      sellingPrice: Number(c[5]) || 0,
      stock: Number(c[6]) || 0,
    }),
  },
};

function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(",").map((cell) => cell.trim()));
}

export default function ImportDataPage() {
  const [entity, setEntity] = useState<EntityKey>("supplier");
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ successCount: number; failedCount: number; failed: any[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = ENTITIES[entity];

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setResult(null);
    const text = await file.text();
    const rowsRaw = parseCsv(text);
    const header = rowsRaw[0]?.map((h) => h.toLowerCase()) || [];
    const dataRows = rowsRaw.slice(1);

    const lookups: Record<string, Map<string, number>> = { category: new Map(), unit: new Map() };
    if (entity === "product") {
      const [catRes, unitRes] = await Promise.all([
        api.get("categories", { $take: 200 } as any).catch(() => ({ success: false, data: [] } as any)),
        api.get("unit", { $take: 200 } as any).catch(() => ({ success: false, data: [] } as any)),
      ]);
      for (const cat of (catRes.success ? catRes.data || [] : [])) lookups.category.set(String(cat.Code || cat.code).toUpperCase(), cat.ID ?? cat.id);
      for (const u of (unitRes.success ? unitRes.data || [] : [])) lookups.unit.set(String(u.Code || u.code).toUpperCase(), u.ID ?? u.id);
    }

    const mapped = dataRows.map((cells) => config.mapRow(cells, lookups));
    setRows(mapped);
    void header;
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    try {
      const res = await api.post(`${config.endpoint}/bulk`, rows).catch(() => ({ success: false, data: null } as any));
      if (res.success && res.data) {
        setResult({ successCount: res.data.successCount, failedCount: res.data.failedCount, failed: res.data.failed || [] });
      }
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([config.template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template-${entity}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewColumns = config.columns.map((key) => ({ key, label: key }));

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-4 text-sm text-muted">
          Import data massal dari file CSV untuk Supplier, Pelanggan, atau Item.
          Unduh template terlebih dahulu agar format kolom sesuai.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <Select
            label="Jenis Data"
            value={entity}
            onChange={(e) => { setEntity(e.target.value as EntityKey); setRows([]); setResult(null); setFileName(""); }}
            options={Object.entries(ENTITIES).map(([key, cfg]) => ({ value: key, label: cfg.label }))}
          />
          <Button variant="outline" icon={Download} onClick={downloadTemplate}>Unduh Template</Button>
          <Button variant="primary" icon={Upload} onClick={() => fileInputRef.current?.click()}>
            Pilih File CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {fileName && <span className="text-sm text-muted">{fileName} &middot; {rows.length} baris</span>}
        </div>

        {result && (
          <div className="mt-4 flex items-center gap-4 rounded-lg bg-elevated p-3">
            <span className="flex items-center gap-1 text-sm text-success"><CheckCircle2 className="size-4" /> {result.successCount} berhasil</span>
            {result.failedCount > 0 && (
              <span className="flex items-center gap-1 text-sm text-danger"><XCircle className="size-4" /> {result.failedCount} gagal</span>
            )}
          </div>
        )}

        {result && result.failed.length > 0 && (
          <div className="mt-2 space-y-1">
            {result.failed.map((f: any, i: number) => (
              <p key={i} className="text-xs text-danger">{JSON.stringify(f.data)} — {f.error}</p>
            ))}
          </div>
        )}

        {rows.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-highlighted">Pratinjau Data ({rows.length} baris)</h3>
              <Button variant="primary" onClick={handleImport} loading={importing}>Import Sekarang</Button>
            </div>
            <DataTable data={rows.slice(0, 50)} columns={previewColumns} emptyMessage="Tidak ada data" />
            {entity === "product" && rows.some((r) => !r.categoryId || !r.unitId) && (
              <p className="mt-2 text-xs text-warning">
                <Badge variant="warning">Perhatian</Badge> Beberapa baris punya kode kategori/satuan yang tidak ditemukan — baris tersebut akan gagal saat import.
              </p>
            )}
          </div>
        )}
      </Card>
    </PageWrapper>
  );
}
