"use client";

// Stock Minimum: per Dept/Gudang total stok, batas minimum and selisih per item. Klik "Proses".

import { useMemo, useState } from "react";
import { KCard, KCheckbox, KRow, KSelect } from "@/components/kform";
import { fmt, num, useList, type Row } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Line { code: string; name: string; unit: string; stock: number; min: number }

export default function MinimumStockPage() {
  const warehouses = useList("warehouse");
  const [warehouseId, setWarehouseId] = useState("");
  const [onlyBelow, setOnlyBelow] = useState(true);
  const [rows, setRows] = useState<Line[] | null>(null);
  const [loading, setLoading] = useState(false);
  const whOpts = useMemo(() => warehouses.map((w) => ({ value: w.ID, label: `${w.Code} - ${w.Name}` })), [warehouses]);

  const process = async () => {
    setLoading(true);
    try {
      if (warehouseId) {
        const r = await api.get<Row[]>("product-stock", { $include: "Product,Product.Unit", $where: { WarehouseID: Number(warehouseId) }, $orderBy: { ID: "asc" }, $take: 1000 }, { skipCache: true });
        setRows((r.data ?? []).map((s) => ({ code: s.Product?.Code, name: s.Product?.Name, unit: s.Product?.Unit?.Name ?? "", stock: num(s.Quantity), min: num(s.MinimumStock || s.Product?.MinimumStock) })));
      } else {
        const r = await api.get<Row[]>("products", { $include: "Unit", $take: 1000, $orderBy: { ID: "asc" } }, { skipCache: true });
        setRows((r.data ?? []).map((p) => ({ code: p.Code, name: p.Name, unit: p.Unit?.Name ?? "", stock: num(p.Stock), min: num(p.MinimumStock) })));
      }
    } finally { setLoading(false); }
  };
  const shown = (rows ?? []).filter((r) => !onlyBelow || r.stock - r.min <= 0);

  return (
    <PageWrapper>
      <KCard>
        <KRow cols={3}>
          <KSelect label="Dept/Gudang" value={warehouseId} onChange={setWarehouseId} options={whOpts} placeholder="Semua Gudang" />
          <KCheckbox label="Tampilkan" checked={onlyBelow} onChange={setOnlyBelow} caption="Hanya yang di bawah / sama dengan minimum" />
          <div className="flex items-end pb-3"><button type="button" onClick={process} disabled={loading} className="h-10 rounded bg-[#4caf50] px-6 text-white hover:bg-[#43a047] disabled:opacity-60">{loading ? "Memproses..." : "Proses"}</button></div>
        </KRow>
        <div className="overflow-x-auto border border-[#c9d0d8]">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-[#c9d0d8] bg-[#f5f6f8]">
              {["No", "Kode", "Nama Item", "Satuan", "Total Stok", "Stok Minimum", "Selisih"].map((h, i) => <th key={h} className={cn("px-3 py-2 font-medium", i >= 4 ? "text-right" : "text-left")}>{h}</th>)}
            </tr></thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={7} className="h-40 text-center text-[16px] text-[#9aa3ad]">{rows ? "No data" : "Klik Proses untuk menampilkan data"}</td></tr>}
              {shown.map((r, i) => (
                <tr key={i} className="border-b border-[#eceff2]">
                  <td className="px-3 py-1.5">{i + 1}</td><td className="px-3 py-1.5 font-mono text-xs">{r.code}</td><td className="px-3 py-1.5">{r.name}</td><td className="px-3 py-1.5">{r.unit}</td>
                  <td className="px-3 py-1.5 text-right">{fmt(r.stock, 0)}</td><td className="px-3 py-1.5 text-right">{fmt(r.min, 0)}</td>
                  <td className={cn("px-3 py-1.5 text-right font-medium", r.stock - r.min <= 0 ? "text-danger" : "text-[#2e7d32]")}>{fmt(r.stock - r.min, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </KCard>
    </PageWrapper>
  );
}
