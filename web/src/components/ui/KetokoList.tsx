"use client";

/**
 * Tampilan daftar standar Ketoko ("Tampilan Daftar Pencarian" di panduan):
 *
 *  [Kata Kunci] [filter lain…] [Urut Berdasar ▾] [A→Z / Z→A] [Cari]
 *  [‹ Hal x / y ›] [+] [✎] [⧉] [🗑] [tombol tambahan…]
 *  ┌ grid: semua kolom, garis vertikal, scroll horizontal, header bisa diklik untuk urut ┐
 *  [‹ Hal x / y ›] [+] [✎] [⧉] [🗑]
 *
 * Pencarian, filter, pengurutan dan paging dikerjakan di server (Smart Query:
 * $search/$searchFields, $where, $orderBy — mendukung kolom relasi "Relasi.Kolom").
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDownAZ, ArrowUpZA, ChevronLeft, ChevronRight, Search, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { ConfirmModal } from "@/components/ui/Modal";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { usePageTitle } from "@/lib/page-title";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KRow = Record<string, any>;

export interface KListColumn {
  /** Path nilai di baris (boleh "Relasi.Kolom"). */
  key: string;
  label: string;
  width?: number;
  align?: "left" | "center" | "right";
  /** Field server untuk urut saat header diklik; false = tidak bisa diurutkan. Default = key. */
  sortKey?: string | false;
  render?: (value: unknown, row: KRow) => ReactNode;
}

export interface KListFilter {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "number" | "checkbox";
  options?: { value: string; label: string }[];
  /** Muat pilihan dari API (baris PascalCase). */
  optionsFrom?: { endpoint: string; label?: (r: KRow) => string; value?: (r: KRow) => string; where?: Record<string, unknown> };
  placeholder?: string;
  /** Tambahkan "Semua" di awal pilihan (default true untuk select). */
  allOption?: string | false;
  defaultValue?: string | boolean;
  /** Ubah nilai filter menjadi bagian $where. Tidak dipanggil untuk nilai kosong. */
  where?: (value: string) => Record<string, unknown>;
  /** Kirim sebagai parameter query khusus (mis. { $warehouse: v }) alih-alih $where. */
  param?: (value: string) => Record<string, unknown>;
  /** Lebar kolom grid filter (1–4). */
  span?: 1 | 2;
}

export interface KSortOption { value: string; label: string }

export interface KetokoListProps {
  title?: string;
  endpoint: string;
  basePath?: string;
  include?: string;
  searchFields: string[];
  searchPlaceholder?: string;
  filters?: KListFilter[];
  sortOptions: KSortOption[];
  defaultSort?: string;
  defaultDir?: "asc" | "desc";
  columns: KListColumn[];
  /** $where tetap (mis. hanya data aktif). */
  baseWhere?: Record<string, unknown>;
  pageSize?: number;
  /** Tombol tambahan di baris aksi (History Transaksi, Verifikasi, dll). */
  extraActions?: (selected: KRow | null, reload: () => void, ctx: { query: Record<string, unknown> }) => ReactNode;
  /** Sembunyikan tombol aksi tertentu. */
  canAdd?: boolean;
  canEdit?: boolean;
  canCopy?: boolean;
  canDelete?: boolean;
  onAdd?: () => void;
  onEdit?: (row: KRow) => void;
  onCopy?: (row: KRow) => void;
  deleteLabel?: (row: KRow) => string;
  /** Aturan per baris (mis. hanya DRAFT yang boleh dihapus). */
  canEditRow?: (row: KRow) => boolean;
  canDeleteRow?: (row: KRow) => boolean;
  /** Proses baris sebelum ditampilkan (mis. hitung kolom turunan). */
  mapRows?: (rows: KRow[]) => KRow[];
  emptyMessage?: string;
  /** Tanpa PageWrapper/Card (untuk disisipkan di halaman lain). */
  bare?: boolean;
  /** Konten di atas filter (info, dsb). */
  header?: ReactNode;
  rowClassName?: (row: KRow) => string | undefined;
}

export interface KetokoListHandle {
  reload: () => void;
  selected: KRow | null;
}

/** Gabung kondisi filter (mis. Tanggal Dari & Sampai pada kolom yang sama). */
function mergeWhere(target: Record<string, unknown>, add: Record<string, unknown>) {
  for (const [k, v] of Object.entries(add)) {
    const cur = target[k];
    target[k] = cur && typeof cur === "object" && v && typeof v === "object" && !Array.isArray(v)
      ? mergeWhere({ ...(cur as Record<string, unknown>) }, v as Record<string, unknown>)
      : v;
  }
  return target;
}

/** Referensi tetap: default `[]` baru di tiap render memicu fetch berulang. */
const NO_FILTERS: KListFilter[] = [];

const getPath = (row: KRow, path: string): unknown =>
  path.split(".").reduce<unknown>((o, k) => (o == null ? undefined : (o as KRow)[k]), row);

const fmtNum = (v: unknown, digits = 2) =>
  v === null || v === undefined || v === "" ? "" : Number(v).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Helper render kolom standar Ketoko. */
export const kcol = {
  money: (key: string, label: string, width = 120): KListColumn => ({ key, label, width, align: "right", render: (v) => fmtNum(v, 2) }),
  qty: (key: string, label: string, width = 100): KListColumn => ({ key, label, width, align: "right", render: (v) => fmtNum(v, 2) }),
  int: (key: string, label: string, width = 90): KListColumn => ({ key, label, width, align: "right", render: (v) => (v == null ? "" : String(v)) }),
  date: (key: string, label: string, width = 110): KListColumn => ({
    key, label, width,
    render: (v) => (v ? new Date(v as string).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""),
  }),
  datetime: (key: string, label: string, width = 150): KListColumn => ({
    key, label, width,
    render: (v) => (v ? new Date(v as string).toLocaleString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""),
  }),
  bool: (key: string, label: string, yes = "Ya", no = "Tidak", width = 80): KListColumn => ({
    key, label, width, align: "center", render: (v) => (v ? yes : no),
  }),
  text: (key: string, label: string, width?: number, sortKey?: string | false): KListColumn => ({ key, label, width, sortKey }),
};

/** "YYYY-MM-DD" (input tanggal) → batas awal/akhir hari (ISO) untuk filter periode. */
export const dayRange = {
  from: (d: string) => new Date(`${d}T00:00:00`).toISOString(),
  to: (d: string) => new Date(`${d}T23:59:59.999`).toISOString(),
};

const inputCls = "h-9 w-full rounded border border-[#cfd4da] bg-white px-2.5 text-[13px] text-[#333] outline-none focus:border-info";

function FilterInput({ f, value, onChange, options }: { f: KListFilter; value: unknown; onChange: (v: unknown) => void; options: { value: string; label: string }[] }) {
  if (f.type === "checkbox") {
    return (
      <label className="flex h-9 items-center gap-2 text-[13px] text-[#333]">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-info" />
        {f.label}
      </label>
    );
  }
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] text-[#333]">{f.label} :</span>
      {f.type === "select" ? (
        <select className={inputCls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {f.allOption !== false && <option value="">{typeof f.allOption === "string" ? f.allOption : "Semua"}</option>}
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
          className={inputCls}
          value={String(value ?? "")}
          placeholder={f.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function PageNav({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  const btn = "flex size-9 items-center justify-center rounded border border-[#cfd4da] bg-white text-[#333] hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)} title="Halaman sebelumnya"><ChevronLeft className="size-4" /></button>
      <span className="min-w-16 text-center text-[13px] text-[#333]">Hal {page} / {Math.max(pages, 1)}</span>
      <button type="button" className={btn} disabled={page >= pages} onClick={() => onChange(page + 1)} title="Halaman berikutnya"><ChevronRight className="size-4" /></button>
    </div>
  );
}

export const KetokoList = forwardRef<KetokoListHandle, KetokoListProps>(function KetokoList(props, ref) {
  const {
    title, endpoint, basePath, include, searchFields, searchPlaceholder, filters = NO_FILTERS, sortOptions,
    defaultSort, defaultDir = "asc", columns, baseWhere, pageSize = 50, extraActions,
    canAdd = true, canEdit = true, canCopy = true, canDelete = true, onAdd, onEdit, onCopy, deleteLabel, canEditRow, canDeleteRow,
    mapRows, emptyMessage = "Tidak ada data", bare, header, rowClassName,
  } = props;
  const router = useRouter();
  usePageTitle(title ?? null);

  const initialFilters = useMemo(() => {
    const v: Record<string, unknown> = {};
    for (const f of filters) if (f.defaultValue !== undefined) v[f.key] = f.defaultValue;
    return v;
  }, [filters]);

  // Nilai yang sedang diketik (draft) vs nilai yang dipakai (applied setelah Cari).
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Record<string, unknown>>(initialFilters);
  const [applied, setApplied] = useState<{ search: string; filters: Record<string, unknown> }>({ search: "", filters: initialFilters });
  const [sortBy, setSortBy] = useState(defaultSort ?? sortOptions[0]?.value ?? "ID");
  const [dir, setDir] = useState<"asc" | "desc">(defaultDir);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<KRow[]>([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<KRow | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [options, setOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  const [lastQuery, setLastQuery] = useState<Record<string, unknown>>({});

  // Pilihan filter dari API.
  useEffect(() => {
    let alive = true;
    for (const f of filters) {
      if (!f.optionsFrom) continue;
      const src = f.optionsFrom;
      api.get<KRow[]>(src.endpoint, { $take: 100, $orderBy: { Name: "asc" }, ...(src.where ? { $where: src.where } : {}) } as never)
        .then((r) => {
          if (!alive || !Array.isArray(r.data)) return;
          setOptions((o) => ({
            ...o,
            [f.key]: (r.data as KRow[]).map((x) => ({
              value: src.value ? src.value(x) : String(x.ID),
              label: src.label ? src.label(x) : String(x.Name ?? x.Code ?? x.ID),
            })),
          }));
        })
        .catch(() => undefined);
    }
    return () => { alive = false; };
  }, [filters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const where: Record<string, unknown> = { ...(baseWhere ?? {}) };
      for (const f of filters) {
        const v = applied.filters[f.key];
        if (v === undefined || v === "" || v === false || v === null) continue;
        if (f.param) continue;
        mergeWhere(where, f.where ? f.where(String(v)) : { [f.key]: v });
      }
      const params: Record<string, unknown> = {
        $skip: (page - 1) * pageSize,
        $take: pageSize,
        $orderBy: { [sortBy]: dir },
      };
      for (const f of filters) {
        const v = applied.filters[f.key];
        if (f.param && v !== undefined && v !== "" && v !== false && v !== null) Object.assign(params, f.param(String(v)));
      }
      if (include) params.$include = include;
      if (Object.keys(where).length) params.$where = where;
      if (applied.search.trim()) {
        params.$search = applied.search.trim();
        params.$searchFields = searchFields.join(",");
      }
      const { $skip: _skip, $take: _take, ...query } = params;
      void _skip; void _take;
      setLastQuery(query);
      const res = await api.get<KRow[]>(endpoint, params as never, { skipCache: true });
      const data = Array.isArray(res.data) ? res.data : [];
      setRows(mapRows ? mapRows(data) : data);
      const total = res.meta?.total ?? data.length;
      setMeta({ total, pages: res.meta?.pages ?? Math.max(1, Math.ceil(total / pageSize)) });
      setSelected((s) => (s ? data.find((r) => r.ID === s.ID) ?? null : null));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [applied, baseWhere, dir, endpoint, filters, include, mapRows, page, pageSize, searchFields, sortBy]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  useImperativeHandle(ref, () => ({ reload: () => void fetchData(), selected }), [fetchData, selected]);

  const doSearch = () => { setPage(1); setApplied({ search, filters: draft }); };

  const toggleHeaderSort = (col: KListColumn) => {
    if (col.sortKey === false) return;
    const key = col.sortKey ?? col.key;
    if (key === sortBy) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setDir("asc"); }
    setPage(1);
  };

  const goAdd = onAdd ?? (basePath ? () => router.push(`${basePath}/new`) : undefined);
  const goEdit = onEdit ?? (basePath ? (r: KRow) => router.push(`${basePath}/${r.ID}`) : undefined);
  const goCopy = onCopy ?? (basePath ? (r: KRow) => router.push(`${basePath}/new?copy=${r.ID}&copyFrom=${r.ID}`) : undefined);

  const handleDelete = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await api.delete(endpoint, selected.ID);
      toast.success("Data dihapus");
      setShowDelete(false);
      setSelected(null);
      void fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus (data mungkin sudah dipakai transaksi)");
    } finally {
      setBusy(false);
    }
  };

  // Urut Berdasar selalu memuat pilihan yang sedang aktif (mis. hasil klik header).
  const sortChoices = useMemo(() => {
    const list = [...sortOptions];
    if (!list.some((o) => o.value === sortBy)) {
      const col = columns.find((c) => (c.sortKey ?? c.key) === sortBy);
      list.push({ value: sortBy, label: col?.label ?? sortBy });
    }
    return list;
  }, [columns, sortBy, sortOptions]);

  const actionRow = (
    <div className="flex flex-wrap items-center gap-2">
      <PageNav page={page} pages={meta.pages} onChange={setPage} />
      <GridActions
        onAdd={canAdd ? goAdd : undefined}
        onEdit={canEdit && goEdit ? () => selected && goEdit(selected) : undefined}
        onCopy={canCopy && goCopy ? () => selected && goCopy(selected) : undefined}
        onDelete={canDelete ? () => selected && setShowDelete(true) : undefined}
        disableEdit={!selected || (canEditRow ? !canEditRow(selected) : false)}
        disableCopy={!selected}
        disableDelete={!selected || (canDeleteRow ? !canDeleteRow(selected) : false)}
      />
      {extraActions?.(selected, () => void fetchData(), { query: lastQuery })}
    </div>
  );

  const body = (
    <div className="flex flex-col gap-2">
      {header}
      <form
        onSubmit={(e) => { e.preventDefault(); doSearch(); }}
        className="rounded border border-[#d6dbe0] bg-white p-3"
      >
        <div className="grid grid-cols-1 items-end gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-[13px] text-[#333]">Kata Kunci :</span>
            <input className={inputCls} value={search} placeholder={searchPlaceholder} onChange={(e) => setSearch(e.target.value)} />
          </label>
          {filters.map((f) => (
            <div key={f.key} className={cn(f.span === 2 && "sm:col-span-2")}>
              <FilterInput
                f={f}
                value={draft[f.key]}
                options={f.options ?? options[f.key] ?? []}
                onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
              />
            </div>
          ))}
          <label className="block">
            <span className="mb-1 block text-[13px] text-[#333]">Urut Berdasar :</span>
            <select className={inputCls} value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
              {sortChoices.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => { setDir((d) => (d === "asc" ? "desc" : "asc")); setPage(1); }}
              title={dir === "asc" ? "Urut A→Z (klik untuk Z→A)" : "Urut Z→A (klik untuk A→Z)"}
              className="flex h-9 w-14 items-center justify-center rounded border border-[#cfd4da] bg-white text-[#333] hover:bg-[#f3f4f6]"
            >
              {dir === "asc" ? <ArrowDownAZ className="size-4" /> : <ArrowUpZA className="size-4" />}
            </button>
            <button type="submit" className="flex h-9 items-center gap-1.5 rounded bg-info px-5 text-[13px] font-medium text-white hover:bg-info/90">
              <Search className="size-3.5" /> Cari
            </button>
          </div>
        </div>
        <div className="mt-3">{actionRow}</div>
      </form>

      <div className="overflow-x-auto rounded border border-[#d6dbe0] bg-white">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[#d6dbe0] bg-white">
              <th className="w-9 border-r border-[#e3e6ea]" />
              {columns.map((c) => {
                const key = c.sortKey ?? c.key;
                const active = c.sortKey !== false && key === sortBy;
                return (
                  <th
                    key={c.key + c.label}
                    style={{ minWidth: c.width, width: c.width }}
                    onClick={() => toggleHeaderSort(c)}
                    className={cn(
                      "whitespace-nowrap border-r border-[#e3e6ea] px-2 py-2 text-left font-normal text-[#333] last:border-r-0",
                      c.align === "right" && "text-right", c.align === "center" && "text-center",
                      c.sortKey !== false && "cursor-pointer select-none hover:bg-[#f5f7f9]",
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      {active && (dir === "asc" ? <ChevronUp className="size-3 text-info" /> : <ChevronDown className="size-3 text-info" />)}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[#eef0f2]">
                  <td className="border-r border-[#e3e6ea]" />
                  {columns.map((c) => <td key={c.key + c.label} className="border-r border-[#e3e6ea] px-2 py-2.5"><div className="h-3 animate-pulse rounded bg-[#eef0f2]" /></td>)}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="h-40 text-center text-[#9aa3ad]">{emptyMessage}</td></tr>
            ) : (
              rows.map((r, i) => {
                const isSel = selected?.ID === r.ID;
                return (
                  <tr
                    key={r.ID ?? i}
                    onClick={() => setSelected(r)}
                    onDoubleClick={() => canEdit && goEdit?.(r)}
                    className={cn("cursor-pointer border-b border-[#eef0f2] hover:bg-[#f5f9fd]", isSel && "bg-[#cfe0ef] hover:bg-[#cfe0ef]", rowClassName?.(r))}
                  >
                    <td className="w-9 border-r border-[#e3e6ea] px-2 text-center">
                      {canEdit && goEdit && <RowEditIcon onClick={() => goEdit(r)} />}
                    </td>
                    {columns.map((c) => {
                      const v = getPath(r, c.key);
                      return (
                        <td
                          key={c.key + c.label}
                          className={cn(
                            "whitespace-nowrap border-r border-[#e3e6ea] px-2 py-2 text-[#333] last:border-r-0",
                            c.align === "right" && "text-right", c.align === "center" && "text-center",
                          )}
                        >
                          {c.render ? c.render(v, r) : v === null || v === undefined ? "" : String(v)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between rounded border border-[#d6dbe0] bg-white p-3">
        {actionRow}
        <span className="text-[12px] text-[#6b7580]">{meta.total.toLocaleString("id-ID")} data</span>
      </div>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Data"
        message={`Yakin ingin menghapus "${selected ? (deleteLabel ? deleteLabel(selected) : selected.Name ?? selected.Code ?? selected.ID) : ""}"?`}
        confirmText="Hapus"
        variant="danger"
        loading={busy}
      />
    </div>
  );

  if (bare) return body;
  return (
    <PageWrapper>
      <Card className="p-3">{body}</Card>
    </PageWrapper>
  );
});
