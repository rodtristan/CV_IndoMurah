"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, RefreshCw, Search, UserCog } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
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
      if (res.success) setData(res.data?.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchRoles = useCallback(async () => {
    const res = await api.get("roles", { $select: "id,name" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setRoles(res.data?.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const handleSave = async () => {
    await api.post("users", form).catch(() => ({}));
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
      key: "actions", label: "", width: "80px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" icon={Edit2} onClick={() => { setForm(row); setShowForm(true); }} />
          <Button size="sm" variant="ghost" icon={Trash2} onClick={() => handleDelete(row.id)} />
        </div>
      )
    },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Pengguna" subtitle="Manajemen user dan akses"
        actions={<Button variant="primary" icon={Plus} onClick={() => { setForm({ name: "", email: "", password: "", roleId: "", phone: "", isActive: true }); setShowForm(true); }}>Tambah</Button>} />

      <Card>
        <div className="mb-4 flex gap-4">
          <Input placeholder="Cari pengguna..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" leftIcon={Search} />
          <Button variant="outline" icon={RefreshCw} onClick={fetchData} loading={loading}>Refresh</Button>
        </div>
        <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada pengguna" />
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

