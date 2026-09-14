"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon, RowDeleteIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";

// Backend Role model (prisma/schema.prisma): id, roleName, roleDescription,
// isActive — no `code`/`isDefault` fields exist, so this form only edits
// the fields that are actually persisted.
export default function RolesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ roleName: "", roleDescription: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("roles", { $select: "id,roleName,roleDescription,isActive" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const isEdit = Boolean((form as any).id);
    if (isEdit) {
      await api.put("roles", (form as any).id, form).catch(() => ({}));
    } else {
      await api.post("roles", form).catch(() => ({}));
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`roles`, id).catch(() => ({}));
    fetchData();
  };

  const columns = [
    { key: "roleName", label: "Nama Role" },
    { key: "roleDescription", label: "Deskripsi", render: (v: unknown) => v || "-" },
    { key: "isActive", label: "Status", render: (v: unknown) => v ? <Badge variant="success">Aktif</Badge> : <Badge variant="default">Nonaktif</Badge> },
    {
      key: "actions", label: "", width: "70px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-1">
          <RowEditIcon onClick={() => { setForm(row); setShowForm(true); }} />
          <RowDeleteIcon onClick={() => handleDelete(row.id)} />
        </div>
      )
    },
  ];

  const openCreate = () => { setForm({ roleName: "", roleDescription: "" }); setShowForm(true); };

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[]}
          onFilter={() => fetchData()}
          loading={loading}
          actions={<GridActions onAdd={openCreate} />}
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada role" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Role" size="sm">
        <div className="space-y-4">
          <Input label="Nama Role" value={form.roleName} onChange={e => setForm(f => ({ ...f, roleName: e.target.value }))} />
          <Input label="Deskripsi" value={form.roleDescription} onChange={e => setForm(f => ({ ...f, roleDescription: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
