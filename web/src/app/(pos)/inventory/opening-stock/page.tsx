"use client";

// Saldo Awal Item Barang: pick Dept/Gudang, add items with opening quantity + price, Simpan.
// Backed by product-stock (Quantity per Product+Warehouse). Price / date are UI-only.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { KCard, KInfoBox, KInput, KSelect, KRow } from "@/components/kform";
import { DocActions, ItemPicker, KReadOnly, fmt, nowLocal, num, useList, type Row } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Line { psId?: number; productId: number; code: string; name: string; unit: string; qty: string; price: string }
const cell = "h-8 w-full rounded border border-[#cfd4da] bg-white px-2 text-right text-[13px] outline-none focus:border-primary";

export default function OpeningStockPage() {
  const warehouses = useList("warehouse");
  const [warehouseId, setWarehouseId] = useState("");
  const [date, setDate] = useState(nowLocal());
  const [lines, setLines] = useState<Line[]>([]);
  const [removed, setRemoved] = useState<number[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [picker, setPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const whOpts = useMemo(() => warehouses.map((w) => ({ value: w.ID, label: `${w.Code} - ${w.Name}` })), [warehouses]);

  const load = useCallback(async () => {
    setRemoved([]); setSel(null);
    if (!warehouseId) { setLines([]); return; }
    const r = await api.get<Row[]>("product-stock", { $include: "Product,Product.Unit", $where: { WarehouseID: Number(warehouseId) }, $orderBy: { ID: "asc" }, $take: 500 }, { skipCache: true }).catch(() => null);
    setLines((r?.data ?? []).map((s) => ({
      psId: s.ID, productId: s.ProductID, code: s.Product?.Code ?? "", name: s.Product?.Name ?? "", unit: s.Product?.Unit?.Name ?? "",
      qty: String(num(s.Quantity)), price: String(num(s.Product?.PurchasePrice)),
    })));
  }, [warehouseId]);
  useEffect(() => { void load(); }, [load]);

  const addItem = (p: Row) => setLines((ls) => ls.some((l) => l.productId === p.ID) ? ls : [...ls, { productId: p.ID, code: p.Code, name: p.Name, unit: p.Unit?.Name ?? "", qty: "0", price: String(num(p.PurchasePrice)) }]);
  const setLine = (i: number, patch: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const total = lines.reduce((s, l) => s + num(l.qty) * num(l.price), 0);

  const save = async () => {
    setErr(""); setOk("");
    if (!warehouseId) return setErr("Dept/Gudang wajib dipilih");
    setSaving(true);
    try {
      for (const id of removed) await api.delete("product-stock", id);
      for (const l of lines) {
        const body = { productId: l.productId, warehouseId: Number(warehouseId), quantity: num(l.qty) };
        const r = l.psId ? await api.patch("product-stock", l.psId, { quantity: body.quantity }) : await api.post("product-stock", body);
        if (r.success === false) throw new Error(r.message || "Gagal menyimpan");
      }
      setOk("Saldo awal tersimpan."); await load();
    } catch (e) { setErr((e as Error).message || "Gagal menyimpan"); } finally { setSaving(false); }
  };

  return (
    <PageWrapper>
      <KCard>
        {err && <div className="mb-3 rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</div>}
        {ok && <div className="mb-3 rounded border border-[#4caf50]/40 bg-[#e8f5e9] px-3 py-2 text-sm text-[#2e7d32]">{ok}</div>}
        <KInfoBox variant="warning" title="Penting" items={[
          "Saldo Awal diinput pertama kali saat mulai memakai program. Pembelian setelah tanggal saldo awal diinput dari transaksi pembelian.",
          "Pilih Dept/Gudang dengan benar: salah gudang membuat stok tidak tampil pada daftar item.",
        ]} />
        <KRow cols={3}>
          <KSelect label="Dept/Gudang" value={warehouseId} onChange={setWarehouseId} options={whOpts} />
          <KInput label="Tanggal Saldo Awal" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} hint="Tanggal tidak disimpan oleh API." />
          <span />
        </KRow>
        <div className="overflow-x-auto border border-[#c9d0d8]">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-[#c9d0d8]">
              {["No", "Kode", "Keterangan", "Gudang", "Jumlah", "Satuan", "Harga", "Total"].map((h) => <th key={h} className={cn("border-r border-[#e1e5e9] px-2 py-2 font-medium", ["Jumlah", "Harga", "Total"].includes(h) ? "text-right" : "text-left")}>{h}</th>)}
            </tr></thead>
            <tbody>
              {lines.length === 0 && <tr><td colSpan={8} className="h-52 text-center text-[18px] text-[#9aa3ad]">{warehouseId ? "No data" : "Pilih Dept/Gudang terlebih dahulu"}</td></tr>}
              {lines.map((l, i) => (
                <tr key={l.productId} onClick={() => setSel(i)} className={cn("border-b border-[#eceff2]", sel === i && "bg-primary/5")}>
                  <td className="px-2 py-1">{i + 1}</td>
                  <td className="px-2 py-1 font-mono text-xs">{l.code}</td>
                  <td className="px-2 py-1">{l.name}</td>
                  <td className="px-2 py-1">{warehouses.find((w) => String(w.ID) === warehouseId)?.Name}</td>
                  <td className="w-28 p-1"><input type="number" className={cell} value={l.qty} onChange={(e) => setLine(i, { qty: e.target.value })} /></td>
                  <td className="px-2 py-1">{l.unit}</td>
                  <td className="w-32 p-1"><input type="number" className={cell} value={l.price} onChange={(e) => setLine(i, { price: e.target.value })} /></td>
                  <td className="w-32 px-2 py-1 text-right">{fmt(num(l.qty) * num(l.price), 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-2">
          <button type="button" disabled={!warehouseId} onClick={() => setPicker(true)} className="inline-flex h-10 items-center gap-1 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6] disabled:opacity-50"><Plus className="size-4" /> Tambah Data</button>
          <button type="button" disabled={sel === null} onClick={() => { if (sel === null) return; const l = lines[sel]; if (l.psId) setRemoved((r) => [...r, l.psId!]); setLines(lines.filter((_, i) => i !== sel)); setSel(null); }} className="inline-flex h-10 w-11 items-center justify-center rounded border border-[#cfd4da] bg-white hover:bg-[#f3f4f6] disabled:opacity-50"><Trash2 className="size-4" /></button>
        </div>
        <div className="mt-3 max-w-[360px]"><KReadOnly label="Total Nilai Saldo Awal" value={fmt(total, 2)} align="right" /></div>
        <DocActions hideNew onSave={save} saving={saving} canDelete={false} />
        <ItemPicker open={picker} onClose={() => setPicker(false)} onPick={addItem} />
      </KCard>
    </PageWrapper>
  );
}
