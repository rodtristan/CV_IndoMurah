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

export default function UsersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
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
    setSaving(true);
    if (isEdit) {
      const payload = { name: form.name, email: form.email || undefined, isActive: form.isActive };
      await api.put("users", (form as any).id, payload).catch(() => ({}));
    } else {
      const payload = { companyId, username: form.username, name: form.name, email: form.email || undefined, password: form.password };
      await api.post("users", payload).catch(() => ({}));
    }
    setSaving(false);
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete("users", selected.ID).catch(() => ({}));
      setShowDelete(false);
      setSelected(null);
      fetchData();
    } finally { setSaving(false); }
  };

  const openEdit = (row: any) => { setSelected(row); setForm({ id: row.ID, name: row.Name, username: row.Username, email: row.Email || "", password: "", role: row.Role, isActive: row.IsActive } as any); setShowForm(true); };

  const columns = [
    { key: "edit", label: "", width: 36, render: (_: unknown, row: any) => <RowEditIcon onClick={() => openEdit(row)} /> },
    { key: "Name", label: "Nama" },
    { key: "Username", label: "Username" },
    { key: "Email", label: "Email" },
    { key: "Role", label: "Role", render: (v: unknown) => <span className="capitalize">{v as string}</span> },
    { key: "IsActive", label: "Status", render: (v: unknown) => v ? <Badge variant="success">Aktif</Badge> : <Badge variant="default">Nonaktif</Badge> },
  ];

  const openCreate = () => { setForm({ name: "", username: "", email: "", password: "", role: "cashier", isActive: true }); setShowForm(true); };

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari pengguna..." }]}
          onFilter={(v) => setSearch((v.search as string) || "")}
          loading={loading}
          actions={
            <GridActions
              onAdd={openCreate}
              onEdit={() => selected && openEdit(selected)}
              onDelete={() => selected && setShowDelete(true)}
              disableEdit={!selected}
              disableDelete={!selected}
            />
          }
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} selectedId={selected?.ID ?? null} onRowClick={setSelected} emptyMessage="Tidak ada pengguna" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={(form as any).id ? "Ubah Pengguna" : "Tambah Pengguna"} size="md"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}
      >
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
        </div>
      </Modal>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Pengguna"
        message={`Yakin ingin menghapus pengguna ${selected?.Name ?? ""}?`}
        confirmText="Hapus"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}
