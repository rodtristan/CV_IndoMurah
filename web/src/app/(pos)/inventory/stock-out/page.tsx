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
import { formatDate } from "@/lib/utils";

export default function StockOutPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [form, setForm] = useState<{ id?: number; date: string; code: string; warehouseId: string; description: string }>({ date: "", code: "", warehouseId: "", description: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("stock-out", { $search: search || undefined, $include: "warehouse,status" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
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
    const isEdit = Boolean(form.id);
    const payload = {
      code: form.code || `SO-${Date.now()}`,
      warehouseId: Number(form.warehouseId),
      description: form.description || undefined,
    };
    if (isEdit) {
      await api.patch("stock-out", form.id!, payload).catch(() => ({}));
    } else {
      await api.post("stock-out", payload).catch(() => ({}));
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`stock-out`, id).catch(() => ({}));
    fetchData();
  };

  const columns = [
    { key: "Date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "Code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Warehouse", label: "Gudang", render: (v: unknown) => (v as any)?.Name || "-" },
    { key: "Description", label: "Keterangan" },
    { key: "Status", label: "Status", render: (v: unknown) => {
      const s = (v as any)?.Code as string | undefined;
      return s === "COMPLETED" ? <Badge variant="success">Selesai</Badge> : s === "PENDING" ? <Badge variant="warning">Pending</Badge> : <Badge variant="default">{s || "-"}</Badge>;
    }},
    { key: "TotalItems", label: "Total Item", align: "right" as const },
    {
      key: "actions", label: "", width: "70px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-1">
          <RowEditIcon onClick={() => { setForm({ id: row.ID, date: row.Date ? String(row.Date).split("T")[0] : "", code: row.Code, warehouseId: row.WarehouseID != null ? String(row.WarehouseID) : "", description: row.Description || "" }); setShowForm(true); }} />
          <RowDeleteIcon onClick={() => handleDelete(row.ID)} />
        </div>
      )
    },
  ];

  const openCreate = () => { setForm({ date: new Date().toISOString().split("T")[0], code: "", warehouseId: "", description: "" }); setShowForm(true); };

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
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada stock keluar" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Stock Keluar" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tanggal" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Select label="Gudang" value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))} options={warehouses.map(w => ({ value: w.ID, label: w.Name }))} />
          </div>
          <Input label="Keterangan" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
