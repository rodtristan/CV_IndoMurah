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
import { GridActions } from "@/components/ui/GridActions";
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
      const res = await api.get("stock-opname", { $search: search || undefined, $include: "warehouse,status" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchWarehouses = useCallback(async () => {
    const res = await api.get("warehouse", { $select: "id,name" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setWarehouses(res.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const handleSave = async () => {
    const isEdit = Boolean((form as any).id);
    const payload = {
      code: form.code || `SOP-${Date.now()}`,
      warehouseId: Number(form.warehouseId),
      notes: form.notes || undefined,
    };
    if (isEdit) {
      await api.patch("stock-opname", (form as any).id, payload).catch(() => ({}));
    } else {
      await api.post("stock-opname", payload).catch(() => ({}));
    }
    setShowForm(false);
    fetchData();
  };

  const columns = [
    { key: "Date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "Code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Warehouse", label: "Gudang", render: (v: unknown) => (v as any)?.Name || "-" },
    { key: "Status", label: "Status", render: (v: unknown) => {
      const s = (v as any)?.Code as string | undefined;
      return s === "COMPLETED" ? <Badge variant="success">Selesai</Badge> : s === "IN_PROGRESS" ? <Badge variant="warning">Proses</Badge> : <Badge variant="default">{s || "-"}</Badge>;
    }},
    { key: "Notes", label: "Catatan", render: (v: unknown) => v ? <span className="text-muted">{v as string}</span> : <span className="text-muted">-</span> },
  ];

  const openCreate = () => { setForm({ date: new Date().toISOString().split("T")[0], code: "", warehouseId: "", notes: "" }); setShowForm(true); };

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari..." }]}
          onFilter={(v) => setSearch((v.search as string) || "")}
          loading={loading}
          actions={<GridActions onAdd={openCreate} />}
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada stock opname" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Stock Opname Baru" size="sm">
        <div className="space-y-4">
          <Input label="Tanggal" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <Select label="Gudang" value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))} options={warehouses.map(w => ({ value: w.ID, label: w.Name }))} />
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
