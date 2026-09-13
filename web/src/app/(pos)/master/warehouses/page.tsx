"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, RefreshCw, Search } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api-client";

export default function WarehousesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", address: "", phone: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("warehouses", { $search: search || undefined, $select: "id,code,name,address,phone" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data?.data || []);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    await api.post("warehouses", form).catch(() => ({}));
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`warehouses`, id).catch(() => ({}));
    fetchData();
  };

  const columns = [
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "name", label: "Nama Gudang" },
    { key: "address", label: "Alamat", render: (v: unknown) => v ? <span className="text-muted">{v as string}</span> : <span className="text-muted">-</span> },
    { key: "phone", label: "Telepon", render: (v: unknown) => v ? <span>{v as string}</span> : <span className="text-muted">-</span> },
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
      <PageHeader title="Gudang" subtitle="Master gudang/lokasi penyimpanan"
        actions={<Button variant="primary" icon={Plus} onClick={() => { setForm({ name: "", code: "", address: "", phone: "" }); setShowForm(true); }}>Tambah</Button>} />

      <Card>
        <div className="mb-4 flex gap-4">
          <Input placeholder="Cari gudang..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" leftIcon={Search} />
          <Button variant="outline" icon={RefreshCw} onClick={fetchData} loading={loading}>Refresh</Button>
        </div>
        <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada gudang" />
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Gudang" size="md">
        <div className="space-y-4">
          <Input label="Kode" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
          <Input label="Nama" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Alamat" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <Input label="Telepon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}

