"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon, RowDeleteIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";

const EMPTY_FORM = { id: undefined as number | undefined, menuName: "", menuType: "sidebar", icon: "", route: "", sortOrder: 0 };

export default function MenusPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
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
    if (form.id) {
      await api.put("menus", form.id, payload).catch(() => ({}));
    } else {
      await api.post("menus", payload).catch(() => ({}));
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    await api.delete("menus", id).catch(() => ({}));
    fetchData();
  };

  const columns = [
    { key: "MenuName", label: "Nama Menu" },
    { key: "MenuType", label: "Tipe", render: (v: unknown) => (v as string) || "-" },
    { key: "Route", label: "Route", render: (v: unknown) => (v as string) || <span className="text-muted">-</span> },
    { key: "SortOrder", label: "Urutan", align: "right" as const },
    { key: "IsActive", label: "Status", render: (v: unknown) => v ? <Badge variant="success">Aktif</Badge> : <Badge variant="default">Nonaktif</Badge> },
    {
      key: "actions", label: "", width: "70px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-1">
          <RowEditIcon onClick={() => {
            setForm({ id: row.ID, menuName: row.MenuName, menuType: row.MenuType || "sidebar", icon: row.Icon || "", route: row.Route || "", sortOrder: row.SortOrder || 0 });
            setShowForm(true);
          }} />
          <RowDeleteIcon onClick={() => handleDelete(row.ID)} />
        </div>
      )
    },
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
          actions={<GridActions onAdd={openCreate} />}
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Belum ada menu" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Menu" size="sm">
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
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
