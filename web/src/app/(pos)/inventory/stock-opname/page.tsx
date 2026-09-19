"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, X } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { api, odata } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface DraftItem {
  productId: number;
  productName: string;
  systemStock: number;
  countedStock: number;
  unitId: number;
}

export default function StockOpnamePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [detailItems, setDetailItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ date: "", warehouseId: "", notes: "" });
  const [items, setItems] = useState<DraftItem[]>([]);
  const [draft, setDraft] = useState({ productId: "", countedStock: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("stock-opname", { $search: search || undefined, $include: "warehouse,status" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
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
    setForm({ date: new Date().toISOString().split("T")[0], warehouseId: "", notes: "" });
    setItems([]);
    setDraft({ productId: "", countedStock: "" });
    setFormError("");
  };

  const selectedDraftProduct = products.find(p => p.ID === Number(draft.productId));

  const handleAddItem = () => {
    if (!draft.productId) return;
    const product = products.find(p => p.ID === Number(draft.productId));
    if (!product) return;
    const counted = draft.countedStock !== "" ? Number(draft.countedStock) : 0;

    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === product.ID);
      const entry: DraftItem = { productId: product.ID, productName: product.Name, systemStock: Number(product.Stock), countedStock: counted, unitId: product.UnitID };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [...prev, entry];
    });
    setDraft({ productId: "", countedStock: "" });
  };

  const handleRemoveItem = (productId: number) => setItems(prev => prev.filter(i => i.productId !== productId));

  const openDetail = async (row: any) => {
    setSelected(row);
    setDetailItems([]);
    setShowDetail(true);
    const res = await api.getOne<any>("stock-opname", row.ID, { $include: "OpnameItems,OpnameItems.Product" } as any).catch(() => null as any);
    if (res?.success && res.data) setDetailItems(res.data.OpnameItems || []);
  };

  const openCreate = () => { resetForm(); fetchLookups(); setShowForm(true); };

  const handleSave = async () => {
    setFormError("");
    if (!form.warehouseId) { setFormError("Gudang wajib dipilih"); return; }
    if (items.length === 0) { setFormError("Tambahkan minimal 1 item"); return; }

    setSaving(true);
    try {
      const res = await api.post("stock-opname", {
        WarehouseID: Number(form.warehouseId),
        Date: form.date || undefined,
        Notes: form.notes || undefined,
        Items: items.map(i => ({
          ProductID: i.productId,
          SystemStock: i.systemStock,
          CountedStock: i.countedStock,
          Difference: i.countedStock - i.systemStock,
          UnitID: i.unitId,
        })),
      });
      if (res.success) { setShowForm(false); fetchData(); }
      else setFormError((res as any).message || "Gagal menyimpan");
    } catch (e: any) {
      setFormError(e?.message || "Gagal menyimpan");
      console.error(e);
    } finally { setSaving(false); }
  };

  const columns = [
    { key: "edit", label: "", width: 36, render: (_: unknown, row: any) => <RowEditIcon onClick={() => openDetail(row)} /> },
    { key: "Date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "Code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Warehouse", label: "Gudang", render: (v: unknown) => (v as any)?.Name || "-" },
    { key: "Status", label: "Status", render: (v: unknown) => {
      const s = (v as any)?.Code as string | undefined;
      return s === "COMPLETED" ? <Badge variant="success">Selesai</Badge> : s === "IN_PROGRESS" ? <Badge variant="warning">Proses</Badge> : <Badge variant="default">{s || "-"}</Badge>;
    }},
    { key: "Notes", label: "Catatan", render: (v: unknown) => v ? <span className="text-muted">{v as string}</span> : <span className="text-muted">-</span> },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari..." }]}
          onFilter={(v) => setSearch((v.search as string) || "")}
          loading={loading}
          actions={
            <GridActions
              onAdd={openCreate}
              onEdit={() => selected && openDetail(selected)}
              onDelete={() => {}}
              disableEdit={!selected}
              disableDelete
            />
          }
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada stock opname" selectedId={selected?.ID ?? null} onRowClick={(row) => setSelected(row)} />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Stock Opname Baru" size="xl"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}>
        <div className="space-y-4">
          {formError && <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tanggal" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Select label="Gudang *" value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))} options={[{ value: "", label: "Pilih..." }, ...warehouses.map(w => ({ value: w.ID, label: w.Name }))]} required />
          </div>
          <Input label="Catatan" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />

          <div className="rounded-lg border border-default p-4">
            <p className="mb-3 text-sm font-semibold text-highlighted">Item Opname</p>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <Select label="Produk" value={draft.productId} onChange={e => setDraft(d => ({ ...d, productId: e.target.value }))}
                  options={[{ value: "", label: "Pilih produk..." }, ...products.map(p => ({ value: p.ID, label: `${p.Code} - ${p.Name}` }))]} />
              </div>
              <div className="col-span-3">
                <Input label="Stok Sistem" type="number" value={selectedDraftProduct ? Number(selectedDraftProduct.Stock) : ""} readOnly disabled />
              </div>
              <div className="col-span-3">
                <Input label="Stok Fisik" type="number" min={0} value={draft.countedStock} onChange={e => setDraft(d => ({ ...d, countedStock: e.target.value }))} />
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
                    <th className="py-2 text-right">Stok Sistem</th>
                    <th className="py-2 text-right">Stok Fisik</th>
                    <th className="py-2 text-right">Selisih</th>
                    <th className="py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-muted">
                      <Package className="mx-auto mb-1 size-6" />
                      Belum ada item
                    </td></tr>
                  ) : items.map(i => {
                    const diff = i.countedStock - i.systemStock;
                    return (
                      <tr key={i.productId} className="border-b border-default/50">
                        <td className="py-2">{i.productName}</td>
                        <td className="py-2 text-right">{i.systemStock}</td>
                        <td className="py-2 text-right">{i.countedStock}</td>
                        <td className={`py-2 text-right font-medium ${diff > 0 ? "text-success" : diff < 0 ? "text-danger" : ""}`}>{diff > 0 ? `+${diff}` : diff}</td>
                        <td className="py-2 text-right">
                          <button onClick={() => handleRemoveItem(i.productId)} className="text-muted hover:text-danger"><X className="size-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={showDetail} onClose={() => setShowDetail(false)} title={`Stock Opname ${selected?.Code || ""}`} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted">Tanggal:</span> {formatDate(selected.Date)}</div><div><span className="text-muted">Gudang:</span> {selected.Warehouse?.Name || "-"}</div><div><span className="text-muted">Status:</span> {selected.Status?.Code || "-"}</div><div><span className="text-muted">Catatan:</span> {selected.Notes || "-"}</div>
            </div>
            <div className="border-t border-default pt-4">
              <h4 className="mb-2 font-semibold">Item</h4>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-default"><th className="py-1 text-left">Produk</th><th className="py-1 text-right">Stok Sistem</th><th className="py-1 text-right">Stok Fisik</th><th className="py-1 text-right">Selisih</th></tr></thead>
                <tbody>
                  {detailItems.map((d: any, i: number) => (
                    <tr key={i} className="border-b border-default"><td className="py-1 ">{d.Product?.Name || "-"}</td><td className="py-1 text-right">{d.SystemStock}</td><td className="py-1 text-right">{d.CountedStock}</td><td className="py-1 text-right">{d.Difference}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
