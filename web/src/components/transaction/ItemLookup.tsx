"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { api } from "@/lib/api-client";
import { Modal } from "@/components/ui/Modal";
import { cn, formatCurrency } from "@/lib/utils";

export interface LookupProduct {
  ID: number;
  Code: string;
  Barcode?: string | null;
  Name: string;
  UnitID: number;
  Unit?: { ID: number; Name: string } | null;
  PurchasePrice: number | string;
  SellingPrice: number | string;
  Stock: number | string;
}

const PAGE_SIZE = 10;

/** Multi-select item picker ("Tambah Item" in Ketoko): tick rows then Pilih. */
export function ItemLookup({
  open, onClose, onPick, initialKeyword = "", priceField = "SellingPrice",
}: {
  open: boolean;
  onClose: () => void;
  onPick: (products: LookupProduct[]) => void;
  initialKeyword?: string;
  priceField?: "PurchasePrice" | "SellingPrice";
}) {
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<LookupProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<Map<number, LookupProduct>>(new Map());

  useEffect(() => {
    if (open) { setKeyword(initialKeyword); setQuery(initialKeyword); setPage(1); setPicked(new Map()); }
  }, [open, initialKeyword]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<LookupProduct[]>(
        "products",
        { $include: "Unit", $take: PAGE_SIZE, $skip: (page - 1) * PAGE_SIZE, $search: query || undefined, $searchFields: "Code,Name,Barcode", $orderBy: { Name: "asc" } },
        { skipCache: true },
      );
      const list = Array.isArray(res.data) ? res.data : [];
      setRows(list);
      setTotal(res.meta?.total ?? list.length);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => { if (open) void load(); }, [open, load]);

  const toggle = (p: LookupProduct) => setPicked((m) => {
    const n = new Map(m);
    if (n.has(p.ID)) n.delete(p.ID); else n.set(p.ID, p);
    return n;
  });
  const submit = () => { setPage(1); setQuery(keyword.trim()); };
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const confirm = (list: LookupProduct[]) => { if (list.length) { onPick(list); onClose(); } };

  return (
    <Modal open={open} onClose={onClose} title="Pilih Item" size="xl">
      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[200px] flex-1 text-[13px] font-medium text-gray-700">
            Kata Kunci (kode / nama / barcode)
            <input
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              className="mt-1 h-9 w-full rounded border border-default bg-elevated px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <button type="button" onClick={submit} className="flex h-9 items-center gap-1.5 rounded bg-info px-4 text-sm font-medium text-white hover:opacity-90">
            <Search className="size-4" /> Cari
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-toned">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="flex size-7 items-center justify-center rounded border border-default disabled:opacity-40"><ChevronLeft className="size-4" /></button>
            <span>Hal {page} / {pages}</span>
            <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="flex size-7 items-center justify-center rounded border border-default disabled:opacity-40"><ChevronRight className="size-4" /></button>
            <span className="ml-3 text-muted">{picked.size} item dipilih</span>
          </div>
          <button type="button" disabled={picked.size === 0} onClick={() => confirm([...picked.values()])} className="flex h-8 items-center gap-1.5 rounded bg-success px-3 text-sm font-medium text-white hover:bg-success/90 disabled:opacity-50">
            <Check className="size-4" /> Pilih
          </button>
        </div>
        <div className="overflow-x-auto rounded border border-default">
          <table className="w-full text-sm">
            <thead className="bg-bg text-left text-xs uppercase text-toned">
              <tr>
                <th className="w-10 px-3 py-2" />
                <th className="px-3 py-2">Kode</th>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2">Satuan</th>
                <th className="px-3 py-2 text-right">Stok</th>
                <th className="px-3 py-2 text-right">{priceField === "PurchasePrice" ? "Harga Beli" : "Harga Jual"}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-muted">Memuat...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-muted">Tidak ada data</td></tr>
              ) : rows.map((r) => (
                <tr
                  key={r.ID}
                  onClick={() => toggle(r)}
                  onDoubleClick={() => confirm([r])}
                  className={cn("cursor-pointer border-t border-default hover:bg-primary/5", picked.has(r.ID) && "bg-primary/10")}
                >
                  <td className="px-3 py-2"><input type="checkbox" readOnly checked={picked.has(r.ID)} className="size-4 accent-primary" /></td>
                  <td className="px-3 py-2 font-mono text-xs">{r.Code}</td>
                  <td className="px-3 py-2">{r.Name}</td>
                  <td className="px-3 py-2">{r.Unit?.Name ?? "-"}</td>
                  <td className="px-3 py-2 text-right">{Number(r.Stock)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(Number(r[priceField]))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
