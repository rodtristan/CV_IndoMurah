"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { Plus, Edit, Trash2, Eye, Package } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FilterBar } from "@/components/ui/FilterBar";
import { ConfirmModal } from "@/components/ui/Modal";
import { api, odata } from "@/lib/api-client";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { StockIn, StockInItem, Warehouse, Supplier } from "@/lib/types";

export default function StockInPage() {
  const [data, setData] = useState<StockIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<StockIn | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ warehouseId: "", supplierId: "", referenceType: "", description: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = odata()
        .include(["warehouse", "supplier", "creator"])
        .orderByMulti({ createdAt: "desc" })
        .skip((pagination.page - 1) * pagination.pageSize)
        .take(pagination.pageSize);

      if (filters.search) query.search(filters.search as string, ["code"]);
      if (filters.warehouseId) query.where({ warehouseId: Number(filters.warehouseId) });
      if (filters.dateFrom) query.where({ date: { gte: new Date(filters.dateFrom as string) } });
      if (filters.dateTo) query.where({ date: { lte: new Date(filters.dateTo as string) } });

      const res = await api.get<StockIn[]>("stock-in", query.toParams());
      if (res.success) {
        setData(res.data || []);
        if (res.meta) setPagination(p => ({ ...p, total: res.meta!.total, totalPages: res.meta!.pages }));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters, pagination.page, pagination.pageSize]);

  const fetchLookups = async () => {
    const [whRes, supRes] = await Promise.all([
      api.get<Warehouse[]>("warehouse", odata().take(100).toParams()).catch(() => ({ data: [] } as any)),
      api.get<Supplier[]>("supplier", odata().take(100).toParams()).catch(() => ({ data: [] } as any)),
    ]);
    setWarehouses(whRes.data || []);
    setSuppliers(supRes.data || []);
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selected) {
        // update
      } else {
        const res = await api.post("stock-in", {
          warehouseId: Number(form.warehouseId),
          supplierId: form.supplierId ? Number(form.supplierId) : null,
          referenceType: form.referenceType || null,
          description: form.description || null,
          status: "COMPLETED",
        });
        if (res.success) { setShowForm(false); fetchData(); }
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete("stock-in", selected.id);
      setShowDelete(false);
      fetchData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const statusVariants: Record<string, "default" | "success" | "warning" | "danger"> = {
    DRAFT: "default", CONFIRMED: "info" as any, COMPLETED: "success", CANCELLED: "danger",
  };
  const statusLabels: Record<string, string> = {
    DRAFT: "Draft", CONFIRMED: "Dikonfirmasi", COMPLETED: "Selesai", CANCELLED: "Batal",
  };

  const columns = [
    { key: "code", label: "Kode", sortable: true, render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "date", label: "Tanggal", sortable: true, render: (v: unknown) => formatDate(v as string) },
    { key: "warehouse.name", label: "Gudang", render: (_: unknown, row: StockIn) => row.warehouse?.name || "-" },
    { key: "supplier.name", label: "Supplier", render: (_: unknown, row: StockIn) => row.supplier?.name || "-" },
    { key: "totalItems", label: "Total Item", align: "right" as const, render: (v: unknown): ReactNode => formatCurrency(Number(v)) },
    { key: "status", label: "Status", render: (v: unknown): ReactNode => <Badge variant={(statusVariants[v as string] || "default") as any}>{statusLabels[v as string] || (v as string)}</Badge> },
    { key: "createdBy", label: "Dibuat", render: (_: unknown, row: any) => (row as any).createdBy || (row as any).creatorName || "-" },
    { key: "actions", label: "", width: 100, render: (_: unknown, row: StockIn) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" icon={Eye} onClick={() => { setSelected(row); setShowDetail(true); }} />
        <Button variant="ghost" size="icon" icon={Edit} onClick={() => { setSelected(row); setShowForm(true); }} />
        <Button variant="ghost" size="icon" icon={Trash2} onClick={() => { setSelected(row); setShowDelete(true); }} />
      </div>
    )},
  ];

  return (
    <PageWrapper>
      <PageHeader title="Barang Masuk" subtitle="Kelola transaksi barang masuk"
        actions={<Button variant="primary" icon={Plus} onClick={() => { setSelected(null); setForm({ warehouseId: "", supplierId: "", referenceType: "", description: "" }); fetchLookups(); setShowForm(true); }}>Tambah Barang Masuk</Button>} />

      <Card>
        <FilterBar fields={[
          { key: "warehouseId", label: "Gudang", type: "select", options: [{ value: "", label: "Semua" }, ...warehouses.map(w => ({ value: w.id, label: w.name }))] },
          { key: "dateFrom", label: "Dari", type: "date" },
          { key: "dateTo", label: "Sampai", type: "date" },
        ]} onFilter={setFilters} loading={loading} />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada data"
            pagination={{ page: pagination.page, pageSize: pagination.pageSize, total: pagination.total, totalPages: pagination.totalPages, onPageChange: p => setPagination(prev => ({ ...prev, page: p })) }} />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={selected ? "Edit Barang Masuk" : "Tambah Barang Masuk"} size="lg"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Gudang *" value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))}
            options={[{ value: "", label: "Pilih..." }, ...warehouses.map(w => ({ value: w.id, label: w.name }))]} required />
          <Select label="Supplier" value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
            options={[{ value: "", label: "Pilih..." }, ...suppliers.map(s => ({ value: s.id, label: s.name }))]} />
          <Select label="Tipe Referensi" value={form.referenceType} onChange={e => setForm(f => ({ ...f, referenceType: e.target.value }))}
            options={[{ value: "", label: "Pilih..." }, { value: "PURCHASE", label: "Pembelian" }, { value: "RETURN", label: "Retur" }, { value: "MANUAL", label: "Manual" }]} />
          <div className="col-span-2"><Input label="Keterangan" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
        </div>
      </Modal>

      <ConfirmModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Hapus Barang Masuk" message={`Yakin menghapus "${selected?.code}"?`} confirmText="Hapus" variant="danger" loading={saving} />
    </PageWrapper>
  );
}


