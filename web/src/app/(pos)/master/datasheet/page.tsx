"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { FilterBar } from "@/components/ui/FilterBar";
import { KInfoBox, KSaveBar } from "@/components/kform";
import { api, odata } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";
import { LoadingState } from "@/components/ui/Loader";

interface ProductRow {
  ID: number; Code: string; Barcode?: string | null; Name: string; PurchasePrice: string | number;
  SellingPrice: string | number; MinimumStock: string | number; DiscountPercent?: string | number | null; IsActive: boolean;
}
interface Draft { barcode: string; name: string; purchasePrice: string; sellingPrice: string; minimumStock: string; discountPercent: string; isActive: boolean }

const toDraft = (r: ProductRow): Draft => ({
  barcode: r.Barcode ?? "", name: r.Name, purchasePrice: String(Number(r.PurchasePrice)), sellingPrice: String(Number(r.SellingPrice)),
  minimumStock: String(Number(r.MinimumStock)), discountPercent: String(Number(r.DiscountPercent ?? 0)), isActive: r.IsActive,
});

const cell = "h-8 w-full border-0 bg-transparent px-2 text-[13px] outline-none focus:bg-primary/5";

export default function DatasheetPage() {
  usePageTitle("Datasheet");
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [orig, setOrig] = useState<Record<number, Draft>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = odata().orderByMulti({ ID: "desc" }).skip((page - 1) * pageSize).take(pageSize);
      if (search) q.search(search, ["code", "barcode", "name"]);
      const res = await api.get<ProductRow[]>("products", q.toParams(), { skipCache: true });
      const data = res.data ?? [];
      setRows(data);
      const d: Record<number, Draft> = {};
      data.forEach((r) => { d[r.ID] = toDraft(r); });
      setDrafts(d);
      setOrig(d);
      setPages(res.meta?.pages ?? 1);
      setTotal(res.meta?.total ?? data.length);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat item");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { void load(); }, [load]);

  const dirtyIds = useMemo(
    () => rows.filter((r) => JSON.stringify(drafts[r.ID]) !== JSON.stringify(orig[r.ID])).map((r) => r.ID),
    [rows, drafts, orig],
  );

  const edit = (id: number, patch: Partial<Draft>) => setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));

  const save = async () => {
    if (!dirtyIds.length) { toast.info("Tidak ada perubahan"); return; }
    for (const id of dirtyIds) {
      const d = drafts[id];
      const n = rows.findIndex((r) => r.ID === id) + 1;
      if (!d.name.trim()) { toast.error(`Nama item pada baris ${n} wajib diisi`); return; }
      if ([d.purchasePrice, d.sellingPrice, d.minimumStock, d.discountPercent].some((x) => x === "" || Number(x) < 0)) {
        toast.error(`Angka pada baris ${n} tidak valid`); return;
      }
    }
    setSaving(true);
    let ok = 0;
    try {
      for (const id of dirtyIds) {
        const d = drafts[id];
        await api.patch("products", id, {
          name: d.name.trim(), barcode: d.barcode || undefined, purchasePrice: Number(d.purchasePrice),
          sellingPrice: Number(d.sellingPrice), minimumStock: Number(d.minimumStock),
          discountPercent: Number(d.discountPercent), isActive: d.isActive,
        });
        ok++;
      }
      toast.success(`${ok} item tersimpan`);
      void load();
    } catch (e) {
      toast.error(`${ok} item tersimpan, lalu gagal: ${e instanceof Error ? e.message : "kesalahan"}`);
      void load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper>
      <KInfoBox variant="info" title="Datasheet">
        <p>Ubah data banyak item sekaligus seperti spreadsheet. Sel yang diubah ditandai, lalu klik Simpan untuk menyimpan semua perubahan.</p>
      </KInfoBox>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari kode / barcode / nama" }]}
          onFilter={(v) => { setPage(1); setSearch(String(v.search ?? "")); }}
          onReset={() => { setPage(1); setSearch(""); }}
          loading={loading}
        />
        <div className="mt-4 overflow-x-auto border border-[#d5d9de]">
          <table className="w-full min-w-[900px] text-[13px]">
            <thead>
              <tr className="border-b border-[#d5d9de] bg-[#f5f6f8] text-left">
                {["No", "Kode Item", "Barcode", "Nama Item", "Harga Pokok", "Harga Jual", "Stok Min", "Diskon (%)", "Aktif"].map((h) => (
                  <th key={h} className="border-r border-[#d5d9de] px-2 py-2 font-bold last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={9} className="h-32 text-center text-[#9aa3ad]">{loading ? <LoadingState className="py-4" /> : "Tidak ada item"}</td></tr>
              )}
              {rows.map((r, i) => {
                const d = drafts[r.ID];
                const o = orig[r.ID];
                if (!d || !o) return null;
                const mark = (k: keyof Draft) => (d[k] !== o[k] ? "bg-[#fff6d6]" : "");
                return (
                  <tr key={r.ID} className="border-b border-[#eceff2]">
                    <td className="border-r border-[#eceff2] px-2">{(page - 1) * pageSize + i + 1}</td>
                    <td className="border-r border-[#eceff2] bg-[#f7f8fa] px-2 font-mono text-xs">{r.Code}</td>
                    <td className={`border-r border-[#eceff2] ${mark("barcode")}`}><input className={cell} value={d.barcode} onChange={(e) => edit(r.ID, { barcode: e.target.value })} /></td>
                    <td className={`border-r border-[#eceff2] ${mark("name")}`}><input className={cell} value={d.name} onChange={(e) => edit(r.ID, { name: e.target.value })} /></td>
                    <td className={`border-r border-[#eceff2] ${mark("purchasePrice")}`}><input type="number" className={`${cell} text-right`} value={d.purchasePrice} onChange={(e) => edit(r.ID, { purchasePrice: e.target.value })} /></td>
                    <td className={`border-r border-[#eceff2] ${mark("sellingPrice")}`}><input type="number" className={`${cell} text-right`} value={d.sellingPrice} onChange={(e) => edit(r.ID, { sellingPrice: e.target.value })} /></td>
                    <td className={`border-r border-[#eceff2] ${mark("minimumStock")}`}><input type="number" className={`${cell} text-right`} value={d.minimumStock} onChange={(e) => edit(r.ID, { minimumStock: e.target.value })} /></td>
                    <td className={`border-r border-[#eceff2] ${mark("discountPercent")}`}><input type="number" className={`${cell} text-right`} value={d.discountPercent} onChange={(e) => edit(r.ID, { discountPercent: e.target.value })} /></td>
                    <td className={`px-2 text-center ${mark("isActive")}`}><input type="checkbox" checked={d.isActive} onChange={(e) => edit(r.ID, { isActive: e.target.checked })} className="size-4 accent-[#4a90d9]" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex items-center justify-between text-[13px] text-[#3a4654]">
          <span>{total} item{dirtyIds.length > 0 && ` - ${dirtyIds.length} baris diubah`}</span>
          <span className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded border border-[#cfd4da] px-3 py-1 disabled:opacity-40">Sebelumnya</button>
            Hal {page} / {Math.max(pages, 1)}
            <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded border border-[#cfd4da] px-3 py-1 disabled:opacity-40">Berikutnya</button>
          </span>
        </div>
      </Card>
      <KSaveBar onSave={save} saving={saving} />
    </PageWrapper>
  );
}
