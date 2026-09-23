"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";

const EMPTY_FORM = { id: undefined as number | undefined, menuName: "", menuType: "sidebar", icon: "", route: "", sortOrder: 0 };

export default function MenusPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("menus", { $take: 100, $orderBy: { SortOrder: "asc" } } as any).catch(() => ({ success: false, data: [] } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const payload = {
      menuName: form.menuName,
      menuType: form.menuType || undefined,
      icon: form.icon || undefined,
      route: form.route || undefined,
      sortOrder: Number(form.sortOrder) || 0,
    };
    setSaving(true);
    if (form.id) {
      await api.put("menus", form.id, payload).catch(() => ({}));
    } else {
      await api.post("menus", payload).catch(() => ({}));
    }
    setSaving(false);
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete("menus", selected.ID).catch(() => ({}));
      setShowDelete(false);
      setSelected(null);
      fetchData();
    } finally { setSaving(false); }
  };

  const rowToForm = (row: any) => ({ menuName: row.MenuName, menuType: row.MenuType || "sidebar", icon: row.Icon || "", route: row.Route || "", sortOrder: row.SortOrder || 0 });
  const openEdit = (row: any) => { setSelected(row); setForm({ id: row.ID, ...rowToForm(row) }); setShowForm(true); };
  const openCopy = (row: any) => { setForm({ id: undefined, ...rowToForm(row) }); setShowForm(true); };

  const columns = [
    { key: "edit", label: "", width: 36, render: (_: unknown, row: any) => <RowEditIcon onClick={() => openEdit(row)} /> },
    { key: "MenuName", label: "Nama Menu" },
    { key: "MenuType", label: "Tipe", render: (v: unknown) => (v as string) || "-" },
    { key: "Route", label: "Route", render: (v: unknown) => (v as string) || <span className="text-muted">-</span> },
    { key: "SortOrder", label: "Urutan", align: "right" as const },
    { key: "IsActive", label: "Status", render: (v: unknown) => v ? <Badge variant="success">Aktif</Badge> : <Badge variant="default">Nonaktif</Badge> },
  ];

  const openCreate = () => { setForm(EMPTY_FORM); setShowForm(true); };

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-4 text-sm text-muted">
          Daftar menu aplikasi yang bisa diberikan sebagai hak akses ke setiap role
          (lihat Hak Akses di halaman Role).
        </p>
        <FilterBar
          fields={[]}
          onFilter={() => fetchData()}
          loading={loading}
          actions={
            <GridActions
              onAdd={openCreate}
              onEdit={() => selected && openEdit(selected)}
              onCopy={() => selected && openCopy(selected)}
              onDelete={() => selected && setShowDelete(true)}
              disableEdit={!selected}
              disableCopy={!selected}
              disableDelete={!selected}
            />
          }
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} selectedId={selected?.ID ?? null} onRowClick={setSelected} emptyMessage="Belum ada menu" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={form.id ? "Ubah Menu" : "Tambah Menu"} size="sm"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}
      >
        <div className="space-y-4">
          <Input label="Nama Menu" value={form.menuName} onChange={(e) => setForm((f) => ({ ...f, menuName: e.target.value }))} />
          <Select
            label="Tipe"
            value={form.menuType}
            onChange={(e) => setForm((f) => ({ ...f, menuType: e.target.value }))}
            options={[{ value: "sidebar", label: "Sidebar" }, { value: "header", label: "Header" }]}
          />
          <Input label="Route" value={form.route} onChange={(e) => setForm((f) => ({ ...f, route: e.target.value }))} placeholder="/master/items" />
          <Input label="Urutan" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
        </div>
      </Modal>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Menu"
        message={`Yakin ingin menghapus menu ${selected?.MenuName ?? ""}?`}
        confirmText="Hapus"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}
