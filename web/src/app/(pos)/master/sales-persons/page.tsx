"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon, RowDeleteIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";

export default function SalesPersonsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ id?: number; name: string; code: string; email: string; phone: string; address: string; isActive: boolean }>({ name: "", code: "", email: "", phone: "", address: "", isActive: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("sales-person", { $search: search || undefined, $select: "id,code,name,email,phone,isActive" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const isEdit = Boolean(form.id);
    if (isEdit) {
      await api.patch("sales-person", form.id!, form).catch(() => ({}));
    } else {
      await api.post("sales-person", form).catch(() => ({}));
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`sales-person`, id).catch(() => ({}));
    fetchData();
  };

  const columns = [
    { key: "Code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Name", label: "Nama Sales" },
    { key: "Email", label: "Email", render: (v: unknown) => v ? <span>{v as string}</span> : <span className="text-muted">-</span> },
    { key: "Phone", label: "Telepon", render: (v: unknown) => v ? <span>{v as string}</span> : <span className="text-muted">-</span> },
    { key: "IsActive", label: "Status", render: (v: unknown) => v ? <span className="text-xs text-success font-medium">Aktif</span> : <span className="text-xs text-muted">Nonaktif</span> },
    {
      key: "actions", label: "", width: "70px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-1">
          <RowEditIcon onClick={() => { setForm({ id: row.ID, code: row.Code, name: row.Name, email: row.Email || "", phone: row.Phone || "", address: row.Address || "", isActive: row.IsActive }); setShowForm(true); }} />
          <RowDeleteIcon onClick={() => handleDelete(row.ID)} />
        </div>
      )
    },
  ];

  const openCreate = () => { setForm({ name: "", code: "", email: "", phone: "", address: "", isActive: true }); setShowForm(true); };

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari sales..." }]}
          onFilter={(v) => setSearch((v.search as string) || "")}
          loading={loading}
          actions={<GridActions onAdd={openCreate} />}
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada sales person" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Sales Person" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kode" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            <Input label="Nama" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <Input label="Telepon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <Input label="Alamat" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}

