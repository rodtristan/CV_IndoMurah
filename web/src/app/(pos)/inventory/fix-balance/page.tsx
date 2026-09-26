"use client";

// Stock Fix Balance: Fix discrepancies between system stock and actual stock

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import { KCard, KInfoBox, KInput, KSelect, KRow } from "@/components/kform";
import { DocActions, ItemPicker, KReadOnly, fmt, nowLocal, num, useList, type Row } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Line {
  psId?: number;
  productId: number;
  code: string;
  name: string;
  unit: string;
  currentStock: number;
  actualStock: string;
  notes: string;
}
const cell = "h-8 w-full rounded border border-[#cfd4da] bg-white px-2 text-right text-[13px] outline-none focus:border-primary";
const cellInput = "h-8 w-full rounded border border-[#cfd4da] bg-white px-2 text-[13px] outline-none focus:border-primary";

export default function FixBalancePage() {
  const warehouses = useList("warehouse");
  const [warehouseId, setWarehouseId] = useState("");
  const [date, setDate] = useState(nowLocal());
  const [lines, setLines] = useState<Line[]>([]);
  const [removed, setRemoved] = useState<number[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [picker, setPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const whOpts = useMemo(() => warehouses.map((w) => ({ value: w.ID, label: `${w.Code} - ${w.Name}` })), [warehouses]);

  const load = useCallback(async () => {
    setRemoved([]); setSel(null);
    if (!warehouseId) { setLines([]); return; }
    setLoading(true);
    try {
      const r = await api.get<Row[]>("product-stock", {
        $include: "Product,Product.Unit",
        $where: { WarehouseID: Number(warehouseId) },
        $orderBy: { ID: "asc" },
        $take: 500
      }, { skipCache: true }).catch(() => null);
      setLines((r?.data ?? []).map((s) => ({
        psId: s.ID,
        productId: s.ProductID,
        code: s.Product?.Code ?? "",
        name: s.Product?.Name ?? "",
        unit: s.Product?.Unit?.Name ?? "",
        currentStock: num(s.Quantity),
        actualStock: String(num(s.Quantity)),
        notes: "",
      })));
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => { void load(); }, [load]);

  const addItem = (p: Row) => setLines((ls) =>
    ls.some((l) => l.productId === p.ID) ? ls : [
      ...ls,
      {
        productId: p.ID,
        code: p.Code,
        name: p.Name,
        unit: p.Unit?.Name ?? "",
        currentStock: 0,
        actualStock: "0",
        notes: "",
      },
    ]
  );

  const setLine = (i: number, patch: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const diff = (l: Line) => num(l.actualStock) - l.currentStock;
  const totalDiff = lines.reduce((s, l) => s + diff(l), 0);
  const positiveCount = lines.filter(l => diff(l) > 0).length;
  const negativeCount = lines.filter(l => diff(l) < 0).length;

  const save = async () => {
    setErr(""); setOk("");
    if (!warehouseId) return setErr("Dept/Gudang wajib dipilih");

    const itemsToFix = lines.filter(l => diff(l) !== 0);
    if (itemsToFix.length === 0) return setErr("Tidak ada perubahan saldo untuk disimpan");

    setSaving(true);
    try {
      const body = {
        warehouseId: Number(warehouseId),
        items: itemsToFix.map(l => ({
          productId: l.productId,
          currentStock: l.currentStock,
          actualStock: num(l.actualStock),
          notes: l.notes || undefined,
        })),
        notes: "Perbaikan Saldo Stok",
      };

      const r = await api.post("stock-balance/adjust", { ...body, date: date ? new Date(date).toISOString() : undefined });
      if (r.success === false) throw new Error(r.message || "Gagal menyimpan");
      setOk(`Saldo berhasil diperbaiki. ${positiveCount} item bertambah, ${negativeCount} item berkurang.`);
      await load();
    } catch (e: any) {
      setErr((e as Error).message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper>
      <KCard>
        {err && <div className="mb-3 rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</div>}
        {ok && <div className="mb-3 rounded border border-[#4caf50]/40 bg-[#e8f5e9] px-3 py-2 text-sm text-[#2e7d32]">{ok}</div>}
        <KInfoBox variant="warning" title="Penting" items={[
          "Perbaikan Saldo digunakan untuk mengkoreksi saldo stok yang tidak sesuai antara system dengan kenyataan di gudang.",
          "Saldo yang diperbaiki akan langsung berubah sesuai input di kolom 'Saldo Aktual'.",
          "Pilih Dept/Gudang dengan benar: salah gudang membuat stok tidak tampil pada daftar item.",
        ]} />
        <KRow cols={3}>
          <KSelect label="Dept/Gudang" value={warehouseId} onChange={setWarehouseId} options={whOpts} />
          <KInput label="Tanggal" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} hint="Tanggal mutasi penyesuaian di kartu stok." />
          <span />
        </KRow>
        <div className="overflow-x-auto border border-[#c9d0d8]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#c9d0d8]">
                {["No", "Kode", "Keterangan", "Gudang", "Saldo System", "Saldo Aktual", "Selisih", "Satuan", "Notes"].map((h) => (
                  <th key={h} className={cn("border-r border-[#e1e5e9] px-2 py-2 font-medium",
                    ["Saldo System", "Saldo Aktual", "Selisih"].includes(h) ? "text-right" : "text-left"
                  )}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 && (
                <tr>
                  <td colSpan={9} className="h-52 text-center text-[18px] text-[#9aa3ad]">
                    {loading ? "Memuat..." : warehouseId ? "No data" : "Pilih Dept/Gudang terlebih dahulu"}
                  </td>
                </tr>
              )}
              {lines.map((l, i) => {
                const d = diff(l);
                const hasDiff = d !== 0;
                return (
                  <tr key={l.productId} onClick={() => setSel(i)}
                    className={cn("border-b border-[#eceff2]", sel === i && "bg-primary/5", hasDiff && "bg-yellow-50")}>
                    <td className="px-2 py-1">{i + 1}</td>
                    <td className="px-2 py-1 font-mono text-xs">{l.code}</td>
                    <td className="px-2 py-1">{l.name}</td>
                    <td className="px-2 py-1">{warehouses.find((w) => String(w.ID) === warehouseId)?.Name}</td>
                    <td className="w-28 p-1 text-right font-medium">{fmt(l.currentStock, 0)}</td>
                    <td className="w-32 p-1">
                      <input type="number" className={cell} value={l.actualStock}
                        onChange={(e) => setLine(i, { actualStock: e.target.value })} />
                    </td>
                    <td className={cn("w-28 p-1 text-right font-medium", hasDiff ? (d > 0 ? "text-green-600" : "text-red-600") : "")}>
                      {hasDiff && <span className="mr-1">{d > 0 ? "+" : ""}{fmt(d, 0)}</span>}
                      {!hasDiff && "-"}
                    </td>
                    <td className="px-2 py-1">{l.unit}</td>
                    <td className="w-40 p-1">
                      <input type="text" className={cellInput} value={l.notes}
                        onChange={(e) => setLine(i, { notes: e.target.value })}
                        placeholder="Catatan..." />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-2">
          <button type="button" disabled={!warehouseId} onClick={() => setPicker(true)}
            className="inline-flex h-10 items-center gap-1 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6] disabled:opacity-50">
            <Plus className="size-4" /> Tambah Data
          </button>
          <button type="button" disabled={sel === null} onClick={() => {
            if (sel === null) return;
            const l = lines[sel];
            if (l.psId) setRemoved((r) => [...r, l.psId!]);
            setLines(lines.filter((_, i) => i !== sel));
            setSel(null);
          }}
            className="inline-flex h-10 w-11 items-center justify-center rounded border border-[#cfd4da] bg-white hover:bg-[#f3f4f6] disabled:opacity-50">
            <Trash2 className="size-4" />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-4">
          <KReadOnly label="Total Item" value={String(lines.length)} />
          <KReadOnly label="Bertambah" value={String(positiveCount)} />
          <KReadOnly label="Berkurang" value={String(negativeCount)} />
          <KReadOnly label="Selisih Total" value={fmt(totalDiff, 0)} align="right" />
        </div>
        <DocActions hideNew onSave={save} saving={saving} canDelete={false} />
        <ItemPicker open={picker} onClose={() => setPicker(false)} onPick={addItem} />
      </KCard>
    </PageWrapper>
  );
}
