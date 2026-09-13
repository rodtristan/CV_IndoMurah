"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Search, ClipboardCheck } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

export default function StockOpnamePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [form, setForm] = useState({ date: "", code: "", warehouseId: "", notes: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("stock-opname", { $search: search || undefined, $include: "warehouse" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data?.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchWarehouses = useCallback(async () => {
    const res = await api.get("warehouses", { $select: "id,name" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setWarehouses(res.data?.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const handleSave = async () => {
    await api.post("stock-opname", form).catch(() => ({}));
    setShowForm(false);
    fetchData();
  };

  const columns = [
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "warehouseName", label: "Gudang" },
    { key: "status", label: "Status", render: (v: unknown) => {
      const s = v as string;
      return s === "COMPLETED" ? <Badge variant="success">Selesai</Badge> : s === "IN_PROGRESS" ? <Badge variant="warning">Proses</Badge> : <Badge variant="default">{s}</Badge>;
    }},
    { key: "notes", label: "Catatan", render: (v: unknown) => v ? <span className="text-muted">{v as string}</span> : <span className="text-muted">-</span> },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Stock Opname" subtitle="Pencatatan stock opname"
        actions={<Button variant="primary" icon={Plus} onClick={() => { setForm({ date: new Date().toISOString().split("T")[0], code: "", warehouseId: "", notes: "" }); setShowForm(true); }}>Mulai Opname</Button>} />

      <Card>
        <div className="mb-4 flex gap-4">
          <Input placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" leftIcon={Search} />
          <Button variant="outline" icon={RefreshCw} onClick={fetchData} loading={loading}>Refresh</Button>
        </div>
        <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada stock opname" />
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Stock Opname Baru" size="sm">
        <div className="space-y-4">
          <Input label="Tanggal" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <Select label="Gudang" value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))} options={warehouses.map(w => ({ value: w.id, label: w.name }))} />
          <Input label="Catatan" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Mulai Opname</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
