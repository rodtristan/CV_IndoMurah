"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";
import { formatNumber } from "@/lib/utils";

export default function OpeningStockPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [form, setForm] = useState({ productId: "", warehouseId: "", quantity: 0, minimumStock: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { $include: "product,warehouse" };
      if (warehouseFilter) params.$where = { warehouseId: Number(warehouseFilter) };
      const res = await api.get("product-stock", params).catch(() => ({ success: false, data: { data: [] } } as any));
      let rows: any[] = res.success ? res.data || [] : [];
      if (search) {
        const q = search.toLowerCase();
        rows = rows.filter((r) => r.Product?.Name?.toLowerCase().includes(q) || r.Product?.Code?.toLowerCase().includes(q));
      }
      setData(rows);
    } finally { setLoading(false); }
  }, [search, warehouseFilter]);

  const fetchOptions = useCallback(async () => {
    const [prodRes, whRes] = await Promise.all([
      api.get("products", { $select: "id,code,name", $take: 500 } as any).catch(() => ({ success: false, data: [] } as any)),
      api.get("warehouse", { $select: "id,name" } as any).catch(() => ({ success: false, data: [] } as any)),
    ]);
    if (prodRes.success) setProducts(prodRes.data || []);
    if (whRes.success) setWarehouses(whRes.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchOptions(); }, [fetchOptions]);

  const openCreate = () => {
    setForm({
      productId: products[0]?.ID ? String(products[0].ID) : "",
      warehouseId: warehouses[0]?.ID ? String(warehouses[0].ID) : "",
      quantity: 0,
      minimumStock: 0,
    });
    setShowForm(true);
  };

  const openEdit = (row: any) => {
    setForm({ id: row.ID, productId: row.ProductID, warehouseId: row.WarehouseID, quantity: row.Quantity, minimumStock: row.MinimumStock } as any);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.productId || !form.warehouseId) return;
    const payload = {
      productId: Number(form.productId),
      warehouseId: Number(form.warehouseId),
      quantity: Number(form.quantity),
      minimumStock: Number(form.minimumStock) || undefined,
    };
    const isEdit = Boolean((form as any).id);
    setSaving(true);
    try {
      if (isEdit) {
        await api.patch("product-stock", (form as any).id, payload).catch(() => ({}));
      } else {
        await api.post("product-stock", payload).catch(() => ({}));
      }
      setShowForm(false);
      fetchData();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete("product-stock", selected.ID);
      setShowDelete(false);
      setSelected(null);
      fetchData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: "edit", label: "", width: 36, render: (_: unknown, row: any) => <RowEditIcon onClick={() => openEdit(row)} /> },
    { key: "productCode", label: "Kode Item", render: (_: unknown, row: any) => <span className="font-mono text-xs">{row.Product?.Code || "-"}</span> },
    { key: "Product", label: "Nama Item", render: (v: unknown) => (v as any)?.Name || "-" },
    { key: "Warehouse", label: "Gudang", render: (v: unknown) => (v as any)?.Name || "-" },
    { key: "Quantity", label: "Saldo Awal", align: "right" as const, render: (v: unknown) => <span className="font-semibold">{formatNumber(v as number)}</span> },
    { key: "MinimumStock", label: "Stok Minimum", align: "right" as const, render: (v: unknown) => formatNumber(v as number) },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-4 text-sm text-muted">
          Saldo Awal Item digunakan untuk mengisi jumlah stok awal barang saat pertama kali menggunakan aplikasi.
          Nilai ini tidak akan berubah saat terjadi transaksi — gunakan halaman transaksi (Barang Masuk/Keluar) untuk stok setelahnya.
        </p>
        <FilterBar
          fields={[
            { key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari item..." },
            { key: "warehouse", label: "Gudang", type: "select", options: [{ value: "", label: "Semua Gudang" }, ...warehouses.map((w) => ({ value: String(w.ID), label: w.Name }))] },
          ]}
          onFilter={(v) => { setSearch((v.search as string) || ""); setWarehouseFilter((v.warehouse as string) || ""); }}
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
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Belum ada saldo awal item" selectedId={selected?.ID ?? null} onRowClick={(row) => setSelected(row)} />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Saldo Awal Item" size="md"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}>
        <div className="space-y-4">
          <Select
            label="Item"
            value={form.productId}
            onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
            options={products.map((p) => ({ value: p.ID, label: `${p.Code} - ${p.Name}` }))}
            disabled={Boolean((form as any).id)}
          />
          <Select
            label="Gudang"
            value={form.warehouseId}
            onChange={(e) => setForm((f) => ({ ...f, warehouseId: e.target.value }))}
            options={warehouses.map((w) => ({ value: w.ID, label: w.Name }))}
            disabled={Boolean((form as any).id)}
          />
          <Input label="Jumlah Saldo Awal" type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
          <Input label="Stok Minimum" type="number" value={form.minimumStock} onChange={(e) => setForm((f) => ({ ...f, minimumStock: Number(e.target.value) }))} />
        </div>
      </Modal>

      <ConfirmModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Hapus Saldo Awal" message={`Yakin menghapus saldo awal "${selected?.Product?.Name || ""}"?`} confirmText="Hapus" variant="danger" loading={saving} />
    </PageWrapper>
  );
}
