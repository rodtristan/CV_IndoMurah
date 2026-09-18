"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { Plus, Edit, Trash2, Eye, Package, X } from "lucide-react";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import type { StockIn, Warehouse, Supplier, Product } from "@/lib/types";

interface DraftItem {
  productId: number;
  productName: string;
  quantity: number;
  unitId: number;
  unitPrice: number;
}

export default function StockInPage() {
  const [data, setData] = useState<StockIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<StockIn | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ warehouseId: "", supplierId: "", referenceType: "", description: "" });
  const [items, setItems] = useState<DraftItem[]>([]);
  const [draft, setDraft] = useState({ productId: "", quantity: "1", unitPrice: "" });
  const [formError, setFormError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = odata()
        .include(["warehouse", "supplier", "creator", "status"])
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
    const [whRes, supRes, prodRes] = await Promise.all([
      api.get<Warehouse[]>("warehouse", odata().take(100).toParams()).catch(() => ({ data: [] } as any)),
      api.get<Supplier[]>("supplier", odata().take(100).toParams()).catch(() => ({ data: [] } as any)),
      api.get<Product[]>("products", odata().include(["category", "unit"]).take(200).toParams()).catch(() => ({ data: [] } as any)),
    ]);
    setWarehouses(whRes.data || []);
    setSuppliers(supRes.data || []);
    setProducts(prodRes.data || []);
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => {
    setForm({ warehouseId: "", supplierId: "", referenceType: "", description: "" });
    setItems([]);
    setDraft({ productId: "", quantity: "1", unitPrice: "" });
    setFormError("");
  };

  const handleAddItem = () => {
    if (!draft.productId) return;
    const product = products.find(p => p.ID === Number(draft.productId));
    if (!product) return;
    const qty = Number(draft.quantity) || 0;
    const price = draft.unitPrice !== "" ? Number(draft.unitPrice) : Number(product.PurchasePrice) || 0;
    if (qty <= 0) return;

    setItems(prev => {
      const existingIdx = prev.findIndex(i => i.productId === product.ID);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], quantity: next[existingIdx].quantity + qty };
        return next;
      }
      return [...prev, { productId: product.ID, productName: product.Name, quantity: qty, unitId: product.UnitID, unitPrice: price }];
    });
    setDraft({ productId: "", quantity: "1", unitPrice: "" });
  };

  const handleRemoveItem = (productId: number) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const itemsTotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const handleSave = async () => {
    setFormError("");
    if (!form.warehouseId) { setFormError("Gudang wajib dipilih"); return; }
    if (items.length === 0) { setFormError("Tambahkan minimal 1 item"); return; }

    setSaving(true);
    try {
      const res = await api.post("stock-in", {
        WarehouseID: Number(form.warehouseId),
        SupplierID: form.supplierId ? Number(form.supplierId) : undefined,
        Description: form.description || undefined,
        Items: items.map(i => ({
          ProductID: i.productId,
          Quantity: i.quantity,
          UnitID: i.unitId,
          UnitPrice: i.unitPrice,
        })),
      });
      if (res.success) { setShowForm(false); resetForm(); fetchData(); }
      else setFormError((res as any).message || "Gagal menyimpan");
    } catch (e: any) {
      setFormError(e?.message || "Gagal menyimpan");
      console.error(e);
    }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete("stock-in", selected.ID);
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
    { key: "Code", label: "Kode", sortable: true, render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Date", label: "Tanggal", sortable: true, render: (v: unknown) => formatDate(v as string) },
    { key: "Warehouse.Name", label: "Gudang", render: (_: unknown, row: StockIn) => row.Warehouse?.Name || "-" },
    { key: "Supplier.Name", label: "Supplier", render: (_: unknown, row: StockIn) => row.Supplier?.Name || "-" },
    { key: "TotalItems", label: "Total Item", align: "right" as const, render: (v: unknown): ReactNode => formatCurrency(Number(v)) },
    { key: "Status", label: "Status", render: (_: unknown, row: StockIn) => { const code = row.Status?.Code || ""; return <Badge variant={(statusVariants[code] || "default") as any}>{statusLabels[code] || code || "-"}</Badge>; } },
    { key: "Creator", label: "Dibuat", render: (_: unknown, row: any) => row.Creator?.Name || "-" },
    { key: "actions", label: "", width: 100, render: (_: unknown, row: StockIn) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" icon={Eye} onClick={() => { setSelected(row); setShowDetail(true); }} />
        <Button variant="ghost" size="icon" icon={Trash2} onClick={() => { setSelected(row); setShowDelete(true); }} />
      </div>
    )},
  ];

  return (
    <PageWrapper>
      <PageHeader title="Barang Masuk" subtitle="Kelola transaksi barang masuk"
        actions={<Button variant="primary" icon={Plus} onClick={() => { setSelected(null); resetForm(); fetchLookups(); setShowForm(true); }}>Tambah Barang Masuk</Button>} />

      <Card>
        <FilterBar fields={[
          { key: "warehouseId", label: "Gudang", type: "select", options: [{ value: "", label: "Semua" }, ...warehouses.map(w => ({ value: w.ID, label: w.Name }))] },
          { key: "dateFrom", label: "Dari", type: "date" },
          { key: "dateTo", label: "Sampai", type: "date" },
        ]} onFilter={setFilters} loading={loading} />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada data"
            pagination={{ page: pagination.page, pageSize: pagination.pageSize, total: pagination.total, totalPages: pagination.totalPages, onPageChange: p => setPagination(prev => ({ ...prev, page: p })) }} />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Barang Masuk" size="xl"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}>
        <div className="space-y-4">
          {formError && <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</div>}

          <div className="grid grid-cols-2 gap-4">
            <Select label="Gudang *" value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))}
              options={[{ value: "", label: "Pilih..." }, ...warehouses.map(w => ({ value: w.ID, label: w.Name }))]} required />
            <Select label="Supplier" value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
              options={[{ value: "", label: "Pilih..." }, ...suppliers.map(s => ({ value: s.ID, label: s.Name }))]} />
            <div className="col-span-2"><Input label="Keterangan" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>

          <div className="rounded-lg border border-default p-4">
            <p className="mb-3 text-sm font-semibold text-highlighted">Item Barang</p>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <Select label="Produk" value={draft.productId} onChange={e => {
                  const p = products.find(pp => pp.ID === Number(e.target.value));
                  setDraft(d => ({ ...d, productId: e.target.value, unitPrice: p ? String(Number(p.PurchasePrice) || 0) : d.unitPrice }));
                }} options={[{ value: "", label: "Pilih produk..." }, ...products.map(p => ({ value: p.ID, label: `${p.Code} - ${p.Name}` }))]} />
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

      <Modal open={showDetail} onClose={() => setShowDetail(false)} title={`Detail Barang Masuk ${selected?.Code || ""}`} size="lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted">Gudang: </span>{selected?.Warehouse?.Name || "-"}</div>
            <div><span className="text-muted">Supplier: </span>{selected?.Supplier?.Name || "-"}</div>
            <div><span className="text-muted">Tanggal: </span>{selected ? formatDate(selected.Date) : "-"}</div>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-default text-left text-xs text-muted"><th className="py-2">Produk</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Harga</th><th className="py-2 text-right">Subtotal</th></tr></thead>
            <tbody>
              {(selected?.StockInItems || []).map(it => (
                <tr key={it.ID} className="border-b border-default/50">
                  <td className="py-2">{it.Product?.Name || it.ProductID}</td>
                  <td className="py-2 text-right">{it.Quantity}</td>
                  <td className="py-2 text-right">{formatCurrency(it.UnitPrice)}</td>
                  <td className="py-2 text-right">{formatCurrency(it.Subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      <ConfirmModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Hapus Barang Masuk" message={`Yakin menghapus "${selected?.Code}"?`} confirmText="Hapus" variant="danger" loading={saving} />
    </PageWrapper>
  );
}
