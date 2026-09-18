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
  const [companyId, setCompanyId] = useState<number | null>(null);
  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "cashier", label: "Kasir" },
  ];
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", role: "cashier", isActive: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("users", { $search: search || undefined } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchCompany = useCallback(async () => {
    const res = await api.get("company", { $take: 1 } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) {
      const company = Array.isArray(res.data) ? res.data[0] : res.data;
      if (company?.ID) setCompanyId(company.ID);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  const handleSave = async () => {
    const isEdit = Boolean((form as any).id);
    if (isEdit) {
      const payload = { name: form.name, email: form.email || undefined, isActive: form.isActive };
      await api.put("users", (form as any).id, payload).catch(() => ({}));
    } else {
      const payload = { companyId, username: form.username, name: form.name, email: form.email || undefined, password: form.password };
      await api.post("users", payload).catch(() => ({}));
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`users`, id).catch(() => ({}));
    fetchData();
  };

  const columns = [
    { key: "Name", label: "Nama" },
    { key: "Username", label: "Username" },
    { key: "Email", label: "Email" },
    { key: "Role", label: "Role", render: (v: unknown) => <span className="capitalize">{v as string}</span> },
    { key: "IsActive", label: "Status", render: (v: unknown) => v ? <Badge variant="success">Aktif</Badge> : <Badge variant="default">Nonaktif</Badge> },
    {
      key: "actions", label: "", width: "70px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-1">
          <RowEditIcon onClick={() => { setForm({ id: row.ID, name: row.Name, username: row.Username, email: row.Email || "", password: "", role: row.Role, isActive: row.IsActive } as any); setShowForm(true); }} />
          <RowDeleteIcon onClick={() => handleDelete(row.ID)} />
        </div>
      )
    },
  ];

  const openCreate = () => { setForm({ name: "", username: "", email: "", password: "", role: "cashier", isActive: true }); setShowForm(true); };

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
          {!(form as any).id && (
            <Input label="Username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          )}
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          {!(form as any).id && (
            <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          )}
          <Select label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} options={roleOptions} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
