"use client";

// Shared building blocks for the Ketoko-style ERP pages (Persediaan / Akuntansi / Pengaturan):
// generic list page (grid + Tambah/Ubah/Salin/Hapus -> full-page forms), document shell with the
// "Auto" number / date header, item picker and small helpers.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Save, Trash2, Printer, Search, X } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { api, type ODataParams } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { KCard } from "./index";

// ─── helpers ───────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Row = any;

export const pick = (row: Row, ...keys: string[]) => {
  for (const k of keys) if (row?.[k] !== undefined && row?.[k] !== null) return row[k];
  return undefined;
};
export const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};
export const fmt = (v: unknown, digits = 2) =>
  num(v).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

const pad = (n: number) => String(n).padStart(2, "0");
/** value for <input type="datetime-local"> */
export const nowLocal = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const toLocalInput = (iso?: string | null) => (iso ? nowLocal(new Date(iso)) : nowLocal());
export const toIso = (local: string) => (local ? new Date(local).toISOString() : undefined);
export const fmtDate = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Reads /x/[id] and ?copy=<id> for the shared new/edit form pages. */
export function useDocRoute(): { id?: string; copyId?: string } {
  const [state, setState] = useState<{ id?: string; copyId?: string }>({});
  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    const copyId = new URLSearchParams(window.location.search).get("copy") ?? undefined;
    setState({ id: last && last !== "new" ? decodeURIComponent(last) : undefined, copyId });
  }, []);
  return state;
}

/** Load a list once (lookups for selects). */
export function useList<T = Row>(endpoint: string, params: ODataParams = { $take: 500 }) {
  const [data, setData] = useState<T[]>([]);
  const key = JSON.stringify(params);
  useEffect(() => {
    let alive = true;
    api.get<T[]>(endpoint, params).then((r) => { if (alive && r.success) setData(r.data ?? []); }).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, key]);
  return data;
}

/** localStorage-backed state for settings that the API cannot store yet. */
export function useLocalState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [val, setVal] = useState<T>(initial);
  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw) setVal({ ...(initial as object), ...JSON.parse(raw) } as T); } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback((v: T | ((p: T) => T)) => {
    setVal((prev) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [key]);
  return [val, set];
}

// ─── document shell ────────────────────────────────────────────────────

export function DocShell({ backHref, children, error, notice }: { backHref: string; children: ReactNode; error?: string; notice?: string }) {
  const router = useRouter();
  return (
    <PageWrapper>
      <div className="-mb-3">
        <button type="button" onClick={() => router.push(backHref)} className="inline-flex items-center gap-1 text-sm text-[#3a4654] hover:text-primary">
          <ArrowLeft className="size-4" /> Kembali ke daftar
        </button>
      </div>
      <KCard>
        {error && <div className="mb-3 rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
        {notice && <div className="mb-3 rounded border border-[#7fb0de] bg-[#eef3fc] px-3 py-2 text-sm text-[#28384f]">{notice}</div>}
        {children}
      </KCard>
    </PageWrapper>
  );
}

const btnCls = "inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-[14px] text-[#1e293b] hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50";

/** Tambah / Simpan / Hapus / Cetak bar at the bottom of a document form. */
export function DocActions({
  onNew, onSave, onDelete, saving, canDelete, extra, hideNew,
}: { onNew?: () => void; onSave: () => void; onDelete?: () => void; saving?: boolean; canDelete?: boolean; extra?: ReactNode; hideNew?: boolean }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {!hideNew && onNew && <button type="button" className={btnCls} onClick={onNew}><Plus className="size-4 text-[#2e9d4a]" /> Tambah</button>}
      <button type="button" className={btnCls} onClick={onSave} disabled={saving}><Save className="size-4 text-[#3a8dbb]" /> {saving ? "Menyimpan..." : "Simpan"}</button>
      <button type="button" className={btnCls} onClick={onDelete} disabled={!canDelete}><Trash2 className="size-4 text-[#e05a3a]" /> Hapus</button>
      <button type="button" className={btnCls} onClick={() => window.print()}><Printer className="size-4 text-[#4a5a6a]" /> Cetak</button>
      {extra}
    </div>
  );
}

/** Dashed read-only box (No Transaksi, Total, Saldo). */
export function KReadOnly({ label, value, align = "left", className }: { label?: string; value: ReactNode; align?: "left" | "right"; className?: string }) {
  return (
    <div className={cn("mb-3", className)}>
      {label && <label className="mb-1 block text-[14px] text-[#2b3540]">{label} :</label>}
      <div className={cn("flex h-10 items-center rounded border border-dashed border-[#b9c0c8] bg-[#f7f8fa] px-3 text-sm text-[#3a4654]", align === "right" && "justify-end")}>{value}</div>
    </div>
  );
}

export function ConfirmDelete({ open, onClose, onConfirm, label, loading }: { open: boolean; onClose: () => void; onConfirm: () => void; label: string; loading?: boolean }) {
  return <ConfirmModal open={open} onClose={onClose} onConfirm={onConfirm} title="Hapus Data" message={`Yakin ingin menghapus ${label}? Tindakan ini tidak dapat dibatalkan.`} confirmText="Hapus" variant="danger" loading={loading} />;
}

// ─── item picker ───────────────────────────────────────────────────────

export function ItemPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (p: Row) => void }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!open) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      api.get<Row[]>("products", { $take: 50, $include: "unit", $search: q || undefined, $searchFields: "Code,Name,Barcode" } as ODataParams)
        .then((r) => setRows(r.success ? r.data ?? [] : [])).catch(() => setRows([]));
    }, 200);
    return () => clearTimeout(timer.current);
  }, [open, q]);
  return (
    <Modal open={open} onClose={onClose} title="Pilih Item" size="xl">
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-[#9aa3ad]" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kode / nama / barcode..." className="h-10 w-full rounded border border-[#cfd4da] pl-9 pr-3 text-sm outline-none focus:border-primary" />
        </div>
        {q && <button type="button" onClick={() => setQ("")} className="text-[#9aa3ad]"><X className="size-4" /></button>}
      </div>
      <div className="max-h-[50vh] overflow-auto border border-[#d5d9de]">
        <table className="w-full text-[13px]">
          <thead className="sticky top-0 bg-[#f5f6f8]">
            <tr><th className="px-3 py-2 text-left">Kode</th><th className="px-3 py-2 text-left">Nama Item</th><th className="px-3 py-2 text-left">Satuan</th><th className="px-3 py-2 text-right">Stok</th><th className="px-3 py-2 text-right">Harga Beli</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-[#9aa3ad]">No data</td></tr>}
            {rows.map((p) => (
              <tr key={p.ID} className="cursor-pointer border-t border-[#eceff2] hover:bg-primary/5" onClick={() => { onPick(p); }}>
                <td className="px-3 py-1.5 font-mono text-xs">{p.Code}</td>
                <td className="px-3 py-1.5">{p.Name}</td>
                <td className="px-3 py-1.5">{p.Unit?.Name ?? p.Unit?.Code ?? "-"}</td>
                <td className="px-3 py-1.5 text-right">{fmt(p.Stock, 0)}</td>
                <td className="px-3 py-1.5 text-right">{fmt(p.PurchasePrice, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-[#6b7683]">Klik item untuk menambahkan ke daftar. Tutup jendela ini bila sudah selesai.</p>
    </Modal>
  );
}

// ─── generic list page ─────────────────────────────────────────────────

export interface ListColumn { key: string; label: string; align?: "left" | "center" | "right"; width?: string | number; render?: (v: unknown, row: Row) => ReactNode }

export function ListPage({
  endpoint, base, columns, include, searchFields, orderBy = { ID: "desc" }, canCopy = true, canDelete = true,
  rowLabel, filterRows, toolbarExtra, header, canEditRow, where, emptyMessage, pageSize = 20,
}: {
  endpoint: string; base: string; columns: ListColumn[]; include?: string; searchFields?: string;
  orderBy?: Record<string, "asc" | "desc">; canCopy?: boolean; canDelete?: boolean; rowLabel: (r: Row) => string;
  filterRows?: (rows: Row[]) => Row[]; toolbarExtra?: ReactNode; header?: ReactNode; canEditRow?: (r: Row) => boolean;
  where?: Record<string, unknown>; emptyMessage?: string; pageSize?: number;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState<Row | null>(null);
  const [del, setDel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 0 });
  const whereKey = JSON.stringify(where ?? {});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: ODataParams = { $skip: (page - 1) * pageSize, $take: pageSize, $orderBy: orderBy };
      if (include) params.$include = include;
      if (search) { params.$search = search; if (searchFields) params.$searchFields = searchFields; }
      if (where) params.$where = where;
      const r = await api.get<Row[]>(endpoint, params, { skipCache: true });
      if (r.success) { setRows(r.data ?? []); setMeta({ total: r.meta?.total ?? (r.data?.length ?? 0), pages: r.meta?.pages ?? 1 }); }
    } catch { /* ignore */ } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, include, search, searchFields, page, pageSize, whereKey]);
  useEffect(() => { void load(); }, [load]);

  const go = (suffix: string) => router.push(`${base}/${suffix}`);
  const edit = (r: Row) => go(String(pick(r, "ID", "id")));
  const doDelete = async () => {
    if (!sel) return;
    setBusy(true); setErr("");
    try {
      const r = await api.delete(endpoint, pick(sel, "ID", "id"));
      if (r && r.success === false) setErr(r.message || "Gagal menghapus");
      else { setDel(false); setSel(null); void load(); }
    } catch (e: unknown) { setErr((e as Error)?.message || "Gagal menghapus"); setDel(false); } finally { setBusy(false); }
  };

  const shown = filterRows ? filterRows(rows) : rows;
  const cols = [{ key: "edit", label: "", width: 36, render: (_: unknown, r: Row) => <RowEditIcon onClick={() => edit(r)} /> }, ...columns];
  const editable = sel && (!canEditRow || canEditRow(sel));

  return (
    <PageWrapper>
      <Card className="p-4">
        {header}
        {err && <div className="mb-3 rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</div>}
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari..." }]}
          onFilter={(v) => { setPage(1); setSearch((v.search as string) || ""); }}
          loading={loading}
          actions={
            <>
              <GridActions
                onAdd={() => go("new")}
                onEdit={() => sel && edit(sel)}
                onCopy={canCopy ? () => sel && go(`new?copy=${pick(sel, "ID", "id")}`) : undefined}
                onDelete={canDelete ? () => sel && setDel(true) : undefined}
                disableEdit={!sel}
                disableCopy={!sel}
                disableDelete={!sel || !editable}
              />
              {toolbarExtra}
            </>
          }
        />
        <div className="mt-4">
          <DataTable
            data={shown}
            columns={cols}
            loading={loading}
            emptyMessage={emptyMessage ?? "Tidak ada data"}
            selectedId={sel ? pick(sel, "ID", "id") : null}
            onRowClick={setSel}
            pagination={{ page, pageSize, total: meta.total, totalPages: meta.pages, onPageChange: setPage }}
          />
        </div>
      </Card>
      <ConfirmDelete open={del} onClose={() => setDel(false)} onConfirm={doDelete} label={sel ? rowLabel(sel) : "data ini"} loading={busy} />
    </PageWrapper>
  );
}
