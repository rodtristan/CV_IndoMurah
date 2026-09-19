"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { ConfirmModal } from "@/components/ui/Modal";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { KInfoBox } from "@/components/kform";
import { api, odata } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";
import type { EntityConfig } from "./types";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export function EntityList({ config }: { config: EntityConfig }) {
  const router = useRouter();
  usePageTitle(config.plural);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [selected, setSelected] = useState<Row | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 0 });
  const pageSize = 20;

  const fetchData = useCallback(async () => {
    if (!config.endpoint) return;
    setLoading(true);
    try {
      const q = odata().orderByMulti({ ID: "desc" }).skip((page - 1) * pageSize).take(pageSize);
      if (config.include) q.include(config.include);
      if (filters.search) q.search(String(filters.search), config.searchFields);
      for (const f of config.filters ?? []) {
        const val = filters[f.key];
        if (val) q.where(f.where(String(val)));
      }
      const res = await api.get<Row[]>(config.endpoint, q.toParams(), { skipCache: true });
      if (res.success) {
        setRows(res.data ?? []);
        setMeta({ total: res.meta?.total ?? res.data?.length ?? 0, pages: res.meta?.pages ?? 1 });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [config, filters, page]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const goEdit = (row: Row) => router.push(`${config.basePath}/${row.ID}`);

  const handleDelete = async () => {
    if (!selected || !config.endpoint) return;
    setBusy(true);
    try {
      await api.delete(config.endpoint, selected.ID);
      toast.success(`${config.singular} dihapus`);
      setShowDelete(false);
      setSelected(null);
      void fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus (data mungkin masih dipakai)");
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: "edit", label: "", width: 36, render: (_: unknown, row: Row) => <RowEditIcon onClick={() => goEdit(row)} /> },
    ...config.columns,
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        {!config.endpoint && (
          <KInfoBox variant="warning" title="Penyimpanan belum tersedia di server">
            <p>Modul {config.plural.toLowerCase()} belum memiliki API di server. Tampilan dan form sudah lengkap, tetapi data belum dapat disimpan atau ditampilkan.</p>
          </KInfoBox>
        )}
        <FilterBar
          fields={[
            { key: "search", label: "Kata Kunci", type: "text", placeholder: config.searchPlaceholder ?? "Cari kode / nama" },
            ...(config.filters ?? []).map((f) => ({
              key: f.key, label: f.label, type: "select" as const,
              options: [{ value: "", label: "Semua" }, ...f.options],
            })),
          ]}
          onFilter={(v) => { setPage(1); setFilters(v); }}
          onReset={() => { setPage(1); setFilters({}); }}
          loading={loading}
          actions={
            <GridActions
              onAdd={() => router.push(`${config.basePath}/new`)}
              onEdit={() => selected && goEdit(selected)}
              onCopy={() => selected && router.push(`${config.basePath}/new?copy=${selected.ID}`)}
              onDelete={() => selected && setShowDelete(true)}
              disableEdit={!selected}
              disableCopy={!selected}
              disableDelete={!selected || !config.endpoint}
            />
          }
        />
        <div className="mt-4">
          <DataTable
            data={rows}
            columns={columns}
            loading={loading}
            emptyMessage={config.endpoint ? `Tidak ada data ${config.plural.toLowerCase()}` : "Belum ada data (penyimpanan belum tersedia)"}
            selectedId={selected?.ID ?? null}
            onRowClick={(row) => setSelected(row)}
            pagination={{
              page, pageSize, total: meta.total, totalPages: meta.pages,
              onPageChange: setPage,
            }}
          />
        </div>
      </Card>
      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Data"
        message={`Yakin ingin menghapus "${selected?.Name ?? selected?.Code ?? ""}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="danger"
        loading={busy}
      />
    </PageWrapper>
  );
}
