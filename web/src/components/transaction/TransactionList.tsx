"use client";

// Daftar transaksi Ketoko ("Tampilan Daftar Transaksi"): Kata Kunci, Dept/Gudang,
// Tanggal Dari/Sampai, filter tambahan, Urut Berdasar + A→Z, Hal X/Y, tombol aksi,
// grid lengkap (No Transaksi … User Buat, User Ubah, Komputer). Dibangun di atas KetokoList.

import { useMemo, type ReactNode } from "react";
import { KetokoList, kcol, type KListColumn, type KListFilter, type KRow } from "@/components/ui/KetokoList";

type Rec = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface TxnColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  width?: number;
  sortKey?: string | false;
  render?: (value: unknown, row: Rec) => ReactNode;
}

/** Kolom audit Ketoko di ujung kanan setiap daftar transaksi. */
export const AUDIT_COLUMNS: TxnColumn[] = [
  { key: "Creator.Username", label: "User Buat", width: 110 },
  { key: "UpdatedBy", label: "User Ubah", width: 110 },
  { key: "Device", label: "Komputer", width: 170 },
];

export const TAX_MODE_LABEL: Record<string, string> = { NON: "Non", INCLUDE: "Include", EXCLUDE: "Exclude" };

/** Awal & akhir bulan berjalan (default periode Ketoko). */
function monthRange() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const first = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return { from: first, to: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(lastDay)}` };
}

export function TransactionList({
  title, endpoint, basePath, include, columns, statusFilter, sortOptions, searchPlaceholder = "No. transaksi / nama...",
  canDelete, canEdit, emptyMessage, deleteLabel, extraActions, filterPartner, extraFilters, dateField = "Date", searchFields,
  withAudit = true, warehouseField = "WarehouseID",
}: {
  title?: string;
  endpoint: string;
  /** e.g. /purchase/list -> /purchase/list/new, /purchase/list/[id] */
  basePath: string;
  include: string;
  columns: TxnColumn[];
  /** where-path prefix (e.g. "PaymentStatus" or "Status") and the options offered */
  statusFilter?: { relation: string; label?: string; options: { value: string; label: string }[] };
  sortOptions: { value: string; label: string }[];
  searchPlaceholder?: string;
  canDelete?: (row: Rec) => boolean;
  canEdit?: (row: Rec) => boolean;
  emptyMessage: string;
  deleteLabel: string;
  /** `query` = filter/sort aktif (tanpa paging), mis. untuk ekspor. */
  extraActions?: (row: Rec | null, ctx: { query: Rec; reload: () => void }) => ReactNode;
  filterPartner?: { field: "SupplierID" | "CustomerID"; endpoint: string; label: string };
  extraFilters?: KListFilter[];
  dateField?: string;
  searchFields?: string[];
  withAudit?: boolean;
  /** Kolom gudang untuk filter Dept/Gudang (mis. FromWarehouseID pada transfer). */
  warehouseField?: string;
}) {
  const range = useMemo(monthRange, []);

  const filters = useMemo<KListFilter[]>(() => {
    const list: KListFilter[] = [
      {
        key: "warehouse", label: "Dept/Gudang", type: "select",
        optionsFrom: { endpoint: "warehouse", label: (w) => `${w.Code} - ${w.Name}` },
        where: (v) => ({ [warehouseField]: Number(v) }),
      },
      { key: "from", label: "Tanggal Dari", type: "date", defaultValue: range.from, where: (v) => ({ [dateField]: { dategte: v } }) },
      { key: "to", label: "Tanggal Sampai", type: "date", defaultValue: range.to, where: (v) => ({ [dateField]: { datelte: v } }) },
    ];
    if (filterPartner) {
      list.push({
        key: "partner", label: filterPartner.label, type: "select",
        optionsFrom: { endpoint: filterPartner.endpoint, label: (p) => `${p.Code} - ${p.Name}` },
        where: (v) => ({ [filterPartner.field]: Number(v) }),
      });
    }
    if (statusFilter) {
      list.push({
        key: "status", label: statusFilter.label ?? "Status", type: "select", options: statusFilter.options,
        where: (v) => ({ [statusFilter.relation]: { Code: v } }),
      });
    }
    return [...list, ...(extraFilters ?? [])];
  }, [dateField, extraFilters, filterPartner, range, statusFilter, warehouseField]);

  const cols = useMemo<KListColumn[]>(
    () => [...columns, ...(withAudit ? AUDIT_COLUMNS : [])].map((c) => ({
      key: c.key, label: c.label, align: c.align, width: c.width, sortKey: c.sortKey, render: c.render as KListColumn["render"],
    })),
    [columns, withAudit],
  );

  const search = useMemo(() => searchFields ?? ["Code", "Notes"], [searchFields]);
  const include2 = useMemo(() => (withAudit && !include.split(",").includes("Creator") ? `${include},Creator` : include), [include, withAudit]);

  return (
    <KetokoList
      title={title}
      endpoint={endpoint}
      basePath={basePath}
      include={include2}
      searchFields={search}
      searchPlaceholder={searchPlaceholder}
      filters={filters}
      sortOptions={sortOptions}
      defaultSort={sortOptions[0]?.value ?? dateField}
      defaultDir="desc"
      columns={cols}
      emptyMessage={emptyMessage}
      deleteLabel={(r: KRow) => `${deleteLabel} ${r.Code ?? ""}`}
      canDeleteRow={canDelete}
      canEditRow={canEdit}
      extraActions={extraActions ? (sel, reload, ctx) => extraActions(sel, { query: ctx.query, reload }) : undefined}
    />
  );
}

export { kcol };
