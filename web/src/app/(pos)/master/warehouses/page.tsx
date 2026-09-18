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

export default function WarehousesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ id?: number; name: string; code: string; address: string; phone: string }>({ name: "", code: "", address: "", phone: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("warehouse", { $search: search || undefined, $select: "id,code,name,address,phone" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (form.id) {
      await api.patch("warehouse", form.id, form).catch(() => ({}));
    } else {
      await api.post("warehouse", form).catch(() => ({}));
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`warehouse`, id).catch(() => ({}));
    fetchData();
  };

  const columns = [
    { key: "Code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Name", label: "Nama Gudang" },
    { key: "Address", label: "Alamat", render: (v: unknown) => v ? <span className="text-muted">{v as string}</span> : <span className="text-muted">-</span> },
    { key: "Phone", label: "Telepon", render: (v: unknown) => v ? <span>{v as string}</span> : <span className="text-muted">-</span> },
    {
      key: "actions", label: "", width: "70px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-1">
          <RowEditIcon onClick={() => { setForm({ id: row.ID, code: row.Code, name: row.Name, address: row.Address || "", phone: row.Phone || "" }); setShowForm(true); }} />
          <RowDeleteIcon onClick={() => handleDelete(row.ID)} />
        </div>
      )
    },
  ];

  const openCreate = () => { setForm({ name: "", code: "", address: "", phone: "" }); setShowForm(true); };

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari gudang..." }]}
          onFilter={(v) => setSearch((v.search as string) || "")}
          loading={loading}
          actions={<GridActions onAdd={openCreate} />}
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada gudang" />
        </div>
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

