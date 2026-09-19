"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";

export default function SalePointsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [form, setForm] = useState<{ id?: number; name: string; code: string; warehouseId: string; description: string; isActive: boolean }>({ name: "", code: "", warehouseId: "", description: "", isActive: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("sale-point", { $search: search || undefined, $include: "warehouse" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchWarehouses = useCallback(async () => {
    const res = await api.get("warehouse", { $select: "id,name" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setWarehouses(res.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const handleSave = async () => {
    setSaving(true);
    try {
    const isEdit = Boolean(form.id);
    const payload = {
      code: form.code,
      name: form.name,
      warehouseId: form.warehouseId ? Number(form.warehouseId) : undefined,
      description: form.description || undefined,
      isActive: form.isActive,
    };
    if (isEdit) {
      await api.patch("sale-point", form.id!, payload).catch(() => ({}));
    } else {
      await api.post("sale-point", payload).catch(() => ({}));
    }
    } finally { setSaving(false); }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete("sale-point", selected.ID).catch(() => ({}));
      setShowDelete(false);
      setSelected(null);
      fetchData();
    } finally { setSaving(false); }
  };

  const columns = [
    { key: "edit", label: "", width: 36, render: (_: unknown, row: any) => <RowEditIcon onClick={() => openEdit(row)} /> },
    { key: "Code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Name", label: "Nama POS" },
    { key: "Warehouse", label: "Gudang", render: (v: unknown) => (v as any)?.Name || "-" },
    { key: "Description", label: "Keterangan", render: (v: unknown) => v ? <span className="text-muted">{v as string}</span> : <span className="text-muted">-</span> },
    { key: "IsActive", label: "Status", render: (v: unknown) => v ? <span className="text-xs text-success font-medium">Aktif</span> : <span className="text-xs text-muted">Nonaktif</span> },
  ];

  const openCreate = () => { setForm({ name: "", code: "", warehouseId: "", description: "", isActive: true }); setShowForm(true); };
  const openEdit = (row: any) => { setSelected(row); setForm({ id: row.ID, code: row.Code, name: row.Name, description: row.Description || "", isActive: row.IsActive, warehouseId: row.WarehouseID != null ? String(row.WarehouseID) : "" }); setShowForm(true); };
  const openCopy = () => {
    if (!selected) return;
    openEdit(selected);
    setForm((f: any) => ({ ...f, id: undefined, ID: undefined, code: "" }));
  };

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari POS..." }]}
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
          <DataTable data={data} columns={columns} loading={loading} selectedId={selected?.ID ?? null} onRowClick={(row) => setSelected(row)} emptyMessage="Tidak ada titik penjualan" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Titik Penjualan" size="md" footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kode" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            <Input label="Nama" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <Select label="Gudang" value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))} options={warehouses.map(w => ({ value: w.ID, label: w.Name }))} />
          <Input label="Keterangan" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
      </Modal>
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
