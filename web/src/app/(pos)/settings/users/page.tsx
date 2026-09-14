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

export default function UsersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", roleId: "", phone: "", isActive: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("users", { $search: search || undefined, $include: "role" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchRoles = useCallback(async () => {
    const res = await api.get("roles", { $select: "id,name" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setRoles(res.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const handleSave = async () => {
    const isEdit = Boolean((form as any).id);
    if (isEdit) {
      await api.put("users", (form as any).id, form).catch(() => ({}));
    } else {
      await api.post("users", form).catch(() => ({}));
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`users`, id).catch(() => ({}));
    fetchData();
  };

  const columns = [
    { key: "name", label: "Nama" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Telepon", render: (v: unknown) => v || "-" },
    { key: "roleName", label: "Role" },
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

  const openCreate = () => { setForm({ name: "", email: "", password: "", roleId: "", phone: "", isActive: true }); setShowForm(true); };

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari pengguna..." }]}
          onFilter={(v) => setSearch((v.search as string) || "")}
          loading={loading}
          actions={<GridActions onAdd={openCreate} />}
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada pengguna" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Pengguna" size="md">
        <div className="space-y-4">
          <Input label="Nama" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          <Input label="Telepon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <Select label="Role" value={form.roleId} onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))} options={roles.map(r => ({ value: r.id, label: r.name }))} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
