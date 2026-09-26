"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Check, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { api } from "@/lib/api-client";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/ui/Loader";

export interface LookupSource {
  endpoint: string;
  valueField: string;
  labelField: string;
  codeField?: string;
}

export interface LookupPick {
  value: string;
  label: string;
  row: Record<string, unknown>;
}

const PAGE_SIZE = 10;
const EXTRA_COLS: { key: string; label: string }[] = [
  { key: "Address", label: "Alamat" },
  { key: "Phone", label: "Telepon" },
  { key: "Category", label: "Kategori" },
];

function cellText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return String(o.Name ?? o.Code ?? "");
  }
  return String(v);
}

export function LookupDialog({
  open, onClose, title = "Cari data...", source, onPick,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  source: LookupSource;
  onPick: (pick: LookupPick) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [orderField, setOrderField] = useState(source.labelField);
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (open) {
      setKeyword(""); setQuery(""); setPage(1); setSelected(null); setError("");
      setOrderField(source.labelField); setDir("asc");
    }
  }, [open, source.labelField]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<unknown>(
        source.endpoint,
        {
          $take: PAGE_SIZE,
          $skip: (page - 1) * PAGE_SIZE,
          $search: query || undefined,
          $orderBy: { [orderField]: dir },
        },
        { skipCache: true }
      );
      const d = res.data as unknown;
      const list = Array.isArray(d) ? d : Array.isArray((d as { data?: unknown[] })?.data) ? (d as { data: unknown[] }).data : [];
      setRows(list as Record<string, unknown>[]);
      setTotal(res.meta?.total ?? list.length);
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [source.endpoint, page, query, orderField, dir]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const extra = EXTRA_COLS.filter((c) => rows.some((r) => r[c.key] != null && r[c.key] !== ""));
  const orderOptions = [
    ...(source.codeField ? [{ value: source.codeField, label: "Kode" }] : []),
    { value: source.labelField, label: "Nama" },
  ];

  const pick = (row: Record<string, unknown>) => {
    onPick({ value: String(row[source.valueField] ?? ""), label: cellText(row[source.labelField]), row });
    onClose();
  };

  const submit = () => { setPage(1); setQuery(keyword.trim()); };

  return (
    <Modal open={open} onClose={onClose} title={title} size="xl">
      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[200px] flex-1 text-[13px] font-medium text-gray-700">
            Kata Kunci
            <input
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              className="mt-1 h-9 w-full rounded border border-default bg-elevated px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="text-[13px] font-medium text-gray-700">
            Urut Berdasar
            <div className="mt-1 flex gap-1">
              <select
                value={orderField}
                onChange={(e) => { setOrderField(e.target.value); setPage(1); }}
                className="h-9 rounded border border-default bg-elevated px-2 text-sm focus:border-primary focus:outline-none"
              >
                {orderOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button
                type="button"
                title={dir === "asc" ? "Naik" : "Turun"}
                onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
                className="flex h-9 w-9 items-center justify-center rounded border border-default bg-elevated text-toned hover:bg-bg"
              >
                {dir === "asc" ? <ArrowDownAZ className="size-4" /> : <ArrowUpAZ className="size-4" />}
              </button>
            </div>
          </label>
          <button type="button" onClick={submit} className="flex h-9 items-center gap-1.5 rounded bg-info px-4 text-sm font-medium text-white hover:opacity-90">
            <Search className="size-4" /> Cari
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-toned">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="flex size-7 items-center justify-center rounded border border-default disabled:opacity-40">
              <ChevronLeft className="size-4" />
            </button>
            <span>Hal {page} / {pages}</span>
            <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="flex size-7 items-center justify-center rounded border border-default disabled:opacity-40">
              <ChevronRight className="size-4" />
            </button>
          </div>
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && pick(selected)}
            className="flex h-8 items-center gap-1.5 rounded bg-success px-3 text-sm font-medium text-white hover:bg-success/90 disabled:opacity-50"
          >
            <Check className="size-4" /> Pilih...
          </button>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="overflow-x-auto rounded border border-default">
          <table className="w-full text-sm">
            <thead className="bg-bg text-left text-xs uppercase text-toned">
              <tr>
                <th className="w-10 px-3 py-2" />
                {source.codeField && <th className="px-3 py-2">Kode</th>}
                <th className="px-3 py-2">Nama</th>
                {extra.map((c) => <th key={c.key} className="px-3 py-2">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3 + extra.length}><LoadingState className="py-6" /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={3 + extra.length} className="px-3 py-6 text-center text-muted">Tidak ada data</td></tr>
              ) : (
                rows.map((r, i) => {
                  const isSel = selected === r;
                  return (
                    <tr
                      key={i}
                      onClick={() => setSelected(r)}
                      onDoubleClick={() => pick(r)}
                      className={cn("cursor-pointer border-t border-default hover:bg-primary/5", isSel && "bg-primary/10")}
                    >
                      <td className="px-3 py-2 text-success">
                        <button type="button" title="Pilih" onClick={(e) => { e.stopPropagation(); pick(r); }}>
                          <Check className="size-4" />
                        </button>
                      </td>
                      {source.codeField && <td className="px-3 py-2">{cellText(r[source.codeField])}</td>}
                      <td className="px-3 py-2">{cellText(r[source.labelField])}</td>
                      {extra.map((c) => <td key={c.key} className="px-3 py-2">{cellText(c.key in r ? r[c.key] : "")}</td>)}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
