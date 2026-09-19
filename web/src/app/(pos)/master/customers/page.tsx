"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { ConfirmModal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";

export default function CustomersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("customer", { $search: search || undefined, $include: "CustomerGroup" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete("customer", selected.ID).catch(() => ({}));
      setShowDelete(false);
      setSelected(null);
      fetchData();
    } finally { setSaving(false); }
  };

  const columns = [
    { key: "edit", label: "", width: 36, render: (_: unknown, row: any) => <RowEditIcon onClick={() => openEdit(row)} /> },
    { key: "Code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Name", label: "Nama Pelanggan" },
    { key: "Phone", label: "Telepon", render: (v: unknown) => v ? <span>{v as string}</span> : <span className="text-muted">-</span> },
    { key: "Address", label: "Alamat", render: (v: unknown) => v ? <span className="text-muted">{v as string}</span> : <span className="text-muted">-</span> },
    { key: "CustomerGroup.Name", label: "Grup", render: (v: unknown) => <span className="text-xs uppercase">{(v as string) || "-"}</span> },
  ];

  const openCreate = () => router.push("/master/customers/new");
  const openEdit = (row: any) => router.push(`/master/customers/${row.ID}`);
  const openCopy = () => { if (selected) router.push(`/master/customers/new?copyFrom=${selected.ID}`); };

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari pelanggan..." }]}
          onFilter={(v) => setSearch((v.search as string) || "")}
          loading={loading}
          actions={
            <GridActions
              onAdd={openCreate}
              onEdit={() => selected && openEdit(selected)}
              onCopy={openCopy}
              onDelete={() => selected && setShowDelete(true)}
              disableEdit={!selected}
              disableCopy={!selected}
              disableDelete={!selected}
            />
          }
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} selectedId={selected?.ID ?? null} onRowClick={(row) => setSelected(row)} emptyMessage="Tidak ada pelanggan" />
        </div>
      </Card>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Data"
        message={`Yakin ingin menghapus "${selected?.Name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}
