"use client";

// Ketoko-style transaction list: filter panel (kata kunci, gudang, periode, urutan) + grid,
// Add / Edit / Copy / Delete all go to the full-page form.

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { ConfirmModal } from "@/components/ui/Modal";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";

type Rec = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface TxnColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: Rec) => ReactNode;
}

export function TransactionList({
  endpoint, basePath, include, columns, statusFilter, sortOptions, searchPlaceholder = "No. transaksi / nama...",
  canDelete, canEdit, emptyMessage, deleteLabel, extraActions, filterPartner,
}: {
  endpoint: string;
  /** e.g. /purchase/list -> /purchase/list/new, /purchase/list/[id] */
  basePath: string;
  include: string;
  columns: TxnColumn[];
  /** where-path prefix (e.g. "PaymentStatus" or "Status") and the options offered */
  statusFilter: { relation: string; options: { value: string; label: string }[] };
  sortOptions: { value: string; label: string }[];
  searchPlaceholder?: string;
  canDelete?: (row: Rec) => boolean;
  canEdit?: (row: Rec) => boolean;
  emptyMessage: string;
  deleteLabel: string;
  /** `query` = the list's active filter/sort params (without paging), e.g. for exports. */
  extraActions?: (row: Rec | null, ctx: { query: Rec }) => ReactNode;
  filterPartner?: { field: "SupplierID" | "CustomerID"; endpoint: string; label: string };
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Rec[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Rec | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [warehouses, setWarehouses] = useState<{ value: string; label: string }[]>([]);
  const [partners, setPartners] = useState<{ value: string; label: string }[]>([]);
  const [f, setF] = useState<Record<string, unknown>>({});
  const partnerField = filterPartner?.field;
  const partnerEndpoint = filterPartner?.endpoint;

  useEffect(() => {
    void api.get<Rec[]>("warehouse", { $take: 200 }).then((r) => setWarehouses((Array.isArray(r.data) ? r.data : []).map((w) => ({ value: String(w.ID), label: w.Name })))).catch(() => undefined);
    if (partnerEndpoint) {
      void api.get<Rec[]>(partnerEndpoint, { $take: 300, $select: "ID,Name" }).then((r) => setPartners((Array.isArray(r.data) ? r.data : []).map((p) => ({ value: String(p.ID), label: p.Name })))).catch(() => undefined);
    }
  }, [partnerEndpoint]);

  // Filter + sort params shared by the grid and by extra actions (CSV export etc.).
  const query = useMemo(() => {
    const where: Rec = {};
    if (f.status) where[statusFilter.relation] = { Code: f.status };
    if (f.warehouse) where.WarehouseID = Number(f.warehouse);
    if (f.partner && partnerField) where[partnerField] = Number(f.partner);
    if (f.from || f.to) {
      where.Date = {};
      if (f.from) where.Date.dategte = f.from;
      if (f.to) where.Date.datelte = f.to;
    }
    const q: Rec = { $orderBy: { [(f.sort as string) || "Date"]: (f.dir as string) || "desc" } };
    if (f.search) { q.$search = f.search; q.$searchFields = "Code"; }
    if (Object.keys(where).length) q.$where = where;
    return q;
  }, [f, statusFilter.relation, partnerField]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: Rec = { ...query, $include: include, $take: pageSize, $skip: (page - 1) * pageSize };
      const res = await api.get<Rec[]>(endpoint, params, { skipCache: true });
      setRows(Array.isArray(res.data) ? res.data : []);
      setTotal(res.meta?.total ?? (Array.isArray(res.data) ? res.data.length : 0));
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [endpoint, include, query, page, pageSize]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const open = (row: Rec) => router.push(`${basePath}/${row.ID}`);

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await api.delete(endpoint, selected.ID);
      setShowDelete(false);
      setSelected(null);
      void fetchData();
    } catch (e) {
      setShowDelete(false);
      setError(e instanceof Error ? e.message : "Gagal menghapus");
    } finally { setDeleting(false); }
  };

  const cols = [
    { key: "edit", label: "", width: 36, render: (_: unknown, row: Rec) => <RowEditIcon onClick={() => open(row)} /> },
    ...columns,
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[
            { key: "search", label: "Kata Kunci", type: "text", placeholder: searchPlaceholder },
            { key: "warehouse", label: "Dept / Gudang", type: "select", options: [{ value: "", label: "Semua" }, ...warehouses] },
            ...(filterPartner ? [{ key: "partner", label: filterPartner.label, type: "select" as const, options: [{ value: "", label: "Semua" }, ...partners] }] : []),
            { key: "status", label: "Status", type: "select", options: [{ value: "", label: "Semua" }, ...statusFilter.options] },
            { key: "from", label: "Dari Tanggal", type: "date" },
            { key: "to", label: "Sampai Tanggal", type: "date" },
            { key: "sort", label: "Urut Berdasar", type: "select", options: sortOptions },
            { key: "dir", label: "Arah Urutan", type: "select", options: [{ value: "desc", label: "Akhir ke Awal (Z-A)" }, { value: "asc", label: "Awal ke Akhir (A-Z)" }] },
          ]}
          onFilter={(v) => { setPage(1); setSelected(null); setF(v); }}
          onReset={() => { setPage(1); setF({}); }}
          loading={loading}
          actions={
            <div className="flex items-center gap-2">
              <GridActions
                onAdd={() => router.push(`${basePath}/new`)}
                onEdit={() => selected && open(selected)}
                onCopy={() => selected && router.push(`${basePath}/new?copy=${selected.ID}`)}
                onDelete={() => selected && setShowDelete(true)}
                disableEdit={!selected || (canEdit ? !canEdit(selected) : false)}
                disableCopy={!selected}
                disableDelete={!selected || (canDelete ? !canDelete(selected) : false)}
              />
              {extraActions?.(selected, { query })}
            </div>
          }
        />
        {error && <div className="mt-3 rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
        <div className="mt-4">
          <DataTable
            data={rows}
            columns={cols}
            loading={loading}
            emptyMessage={emptyMessage}
            selectedId={selected?.ID ?? null}
            onRowClick={(row) => setSelected(row)}
            pagination={{
              page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)),
              onPageChange: setPage, onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
            }}
          />
        </div>
      </Card>
      <ConfirmModal
        open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title={`Hapus ${deleteLabel}`} message={`Yakin menghapus ${deleteLabel.toLowerCase()} "${selected?.Code}"?`} confirmText="Hapus" variant="danger" loading={deleting}
      />
    </PageWrapper>
  );
}
