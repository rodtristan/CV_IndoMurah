"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, RefreshCw, Search } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api-client";

export default function BrandsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("brands", { $search: search || undefined, $select: "id,code,name,description" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data?.data || []);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    await api.post("brands", form).catch(() => ({}));
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`brands`, id).catch(() => ({}));
    fetchData();
  };

  const columns = [
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "name", label: "Nama Merek" },
    { key: "description", label: "Deskripsi", render: (v: unknown) => v ? <span className="text-muted">{v as string}</span> : <span className="text-muted">-</span> },
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
      <PageHeader title="Merek" subtitle="Master merek produk"
        actions={<Button variant="primary" icon={Plus} onClick={() => { setForm({ name: "", code: "", description: "" }); setShowForm(true); }}>Tambah</Button>} />

      <Card>
        <div className="mb-4 flex gap-4">
          <Input placeholder="Cari merek..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" leftIcon={Search} />
          <Button variant="outline" icon={RefreshCw} onClick={fetchData} loading={loading}>Refresh</Button>
        </div>
        <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada merek" />
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Merek" size="sm">
        <div className="space-y-4">
          <Input label="Kode" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
          <Input label="Nama" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Deskripsi" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}

