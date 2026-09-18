"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, X } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowDeleteIcon } from "@/components/ui/GridActions";
import { api, odata } from "@/lib/api-client";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface DraftItem {
  productId: number;
  productName: string;
  quantity: number;
  unitId: number;
  unitPrice: number;
}

export default function StockOutPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ date: "", warehouseId: "", description: "" });
  const [items, setItems] = useState<DraftItem[]>([]);
  const [draft, setDraft] = useState({ productId: "", quantity: "1", unitPrice: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("stock-out", { $search: search || undefined, $include: "warehouse,status" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchLookups = useCallback(async () => {
    const [whRes, prodRes] = await Promise.all([
      api.get("warehouse", odata().take(100).toParams()).catch(() => ({ success: false, data: [] } as any)),
      api.get<Product[]>("products", odata().include(["category", "unit"]).take(200).toParams()).catch(() => ({ success: false, data: [] } as any)),
    ]);
    setWarehouses(whRes.data || []);
    setProducts(prodRes.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => {
    setForm({ date: new Date().toISOString().split("T")[0], warehouseId: "", description: "" });
    setItems([]);
    setDraft({ productId: "", quantity: "1", unitPrice: "" });
    setFormError("");
  };

  const handleAddItem = () => {
    if (!draft.productId) return;
    const product = products.find(p => p.ID === Number(draft.productId));
    if (!product) return;
    const qty = Number(draft.quantity) || 0;
    const price = draft.unitPrice !== "" ? Number(draft.unitPrice) : Number(product.SellingPrice) || 0;
    if (qty <= 0) return;

    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === product.ID);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { productId: product.ID, productName: product.Name, quantity: qty, unitId: product.UnitID, unitPrice: price }];
    });
    setDraft({ productId: "", quantity: "1", unitPrice: "" });
  };

  const handleRemoveItem = (productId: number) => setItems(prev => prev.filter(i => i.productId !== productId));

  const itemsTotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const openCreate = () => { resetForm(); fetchLookups(); setShowForm(true); };

  const handleSave = async () => {
    setFormError("");
    if (!form.warehouseId) { setFormError("Gudang wajib dipilih"); return; }
    if (items.length === 0) { setFormError("Tambahkan minimal 1 item"); return; }

    setSaving(true);
    try {
      const res = await api.post("stock-out", {
        WarehouseID: Number(form.warehouseId),
        Date: form.date || undefined,
        Description: form.description || undefined,
        Items: items.map(i => ({ ProductID: i.productId, Quantity: i.quantity, UnitID: i.unitId, UnitPrice: i.unitPrice })),
      });
      if (res.success) { setShowForm(false); fetchData(); }
      else setFormError((res as any).message || "Gagal menyimpan");
    } catch (e: any) {
      setFormError(e?.message || "Gagal menyimpan");
      console.error(e);
    } finally { setSaving(false); }
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
          <RowDeleteIcon onClick={() => handleDelete(row.ID)} />
        </div>
      )
    },
  ];

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

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Stock Keluar" size="xl"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}>
        <div className="space-y-4">
          {formError && <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tanggal" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Select label="Gudang *" value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))} options={[{ value: "", label: "Pilih..." }, ...warehouses.map(w => ({ value: w.ID, label: w.Name }))]} required />
          </div>
          <Input label="Keterangan" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

          <div className="rounded-lg border border-default p-4">
            <p className="mb-3 text-sm font-semibold text-highlighted">Item Barang</p>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <Select label="Produk" value={draft.productId} onChange={e => {
                  const p = products.find(pp => pp.ID === Number(e.target.value));
                  setDraft(d => ({ ...d, productId: e.target.value, unitPrice: p ? String(Number(p.SellingPrice) || 0) : d.unitPrice }));
                }} options={[{ value: "", label: "Pilih produk..." }, ...products.map(p => ({ value: p.ID, label: `${p.Code} - ${p.Name} (Stok: ${Number(p.Stock)})` }))]} />
              </div>
              <div className="col-span-2">
                <Input label="Qty" type="number" min={0} value={draft.quantity} onChange={e => setDraft(d => ({ ...d, quantity: e.target.value }))} />
              </div>
              <div className="col-span-3">
                <Input label="Harga Satuan" type="number" min={0} value={draft.unitPrice} onChange={e => setDraft(d => ({ ...d, unitPrice: e.target.value }))} />
              </div>
              <div className="col-span-1 flex items-end">
                <Button variant="secondary" className="w-full justify-center" onClick={handleAddItem}>+</Button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default text-left text-xs text-muted">
                    <th className="py-2">Produk</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Harga</th>
                    <th className="py-2 text-right">Subtotal</th>
                    <th className="py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-muted">
                      <Package className="mx-auto mb-1 size-6" />
                      Belum ada item
                    </td></tr>
                  ) : items.map(i => (
                    <tr key={i.productId} className="border-b border-default/50">
                      <td className="py-2">{i.productName}</td>
                      <td className="py-2 text-right">{i.quantity}</td>
                      <td className="py-2 text-right">{formatCurrency(i.unitPrice)}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(i.quantity * i.unitPrice)}</td>
                      <td className="py-2 text-right">
                        <button onClick={() => handleRemoveItem(i.productId)} className="text-muted hover:text-danger"><X className="size-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {items.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="py-2 text-right font-semibold">Total</td>
                      <td className="py-2 text-right font-bold text-primary">{formatCurrency(itemsTotal)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
