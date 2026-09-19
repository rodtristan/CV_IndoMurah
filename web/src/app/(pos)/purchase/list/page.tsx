"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, X } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/StatCard";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { api, odata } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DraftItem {
  productId: number;
  productName: string;
  quantity: number;
  unitId: number;
  unitPrice: number;
}

export default function PurchaseListPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({ supplierId: "", warehouseId: "" });
  const [items, setItems] = useState<DraftItem[]>([]);
  const [draft, setDraft] = useState({ productId: "", quantity: "1", unitPrice: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { $include: "Supplier,PaymentStatus,PurchasePayments,PurchaseItems,PurchaseItems.Product" };
      if (search) params.$search = search;
      if (filterStatus) params.$where = { PaymentStatus: { Code: filterStatus } };
      const res = await api.get("purchases", params).catch(() => ({ success: false, data: [] } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statusColors: Record<string, string> = {
    PENDING: "warning", PAID: "success", PARTIAL: "info",
    INSTALMENT: "info", CANCELLED: "danger",
  };

  const fetchLookups = async () => {
    const [supRes, whRes, prodRes] = await Promise.all([
      api.get<any[]>("supplier", odata().take(100).toParams()).catch(() => ({ data: [] } as any)),
      api.get<any[]>("warehouse", odata().take(100).toParams()).catch(() => ({ data: [] } as any)),
      api.get<any[]>("products", odata().include(["unit"]).take(200).toParams()).catch(() => ({ data: [] } as any)),
    ]);
    setSuppliers(supRes.data || []);
    setWarehouses(whRes.data || []);
    setProducts(prodRes.data || []);
  };

  const resetForm = () => {
    setForm({ supplierId: "", warehouseId: "" });
    setItems([]);
    setDraft({ productId: "", quantity: "1", unitPrice: "" });
    setFormError("");
  };

  const openCreate = () => {
    resetForm();
    fetchLookups();
    setShowForm(true);
  };

  const handleAddItem = () => {
    if (!draft.productId) return;
    const product = products.find((p) => p.ID === Number(draft.productId));
    if (!product) return;
    const qty = Number(draft.quantity) || 0;
    const price = draft.unitPrice !== "" ? Number(draft.unitPrice) : Number(product.PurchasePrice) || 0;
    if (qty <= 0) return;

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === product.ID);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { productId: product.ID, productName: product.Name, quantity: qty, unitId: product.UnitID, unitPrice: price }];
    });
    setDraft({ productId: "", quantity: "1", unitPrice: "" });
  };

  const handleRemoveItem = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const itemsTotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const handleSave = async () => {
    setFormError("");
    if (!form.supplierId) { setFormError("Supplier wajib dipilih"); return; }
    if (items.length === 0) { setFormError("Tambahkan minimal 1 item"); return; }

    setSaving(true);
    try {
      const res = await api.post("purchases", {
        SupplierID: Number(form.supplierId),
        WarehouseID: form.warehouseId ? Number(form.warehouseId) : undefined,
        Items: items.map((i) => ({
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
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete("purchases", selected.ID);
      setShowDelete(false);
      setSelected(null);
      fetchData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const columns = [
    {
      key: "edit",
      label: "",
      width: 36,
      render: (_: unknown, row: any) => <RowEditIcon onClick={() => { setSelected(row); setShowDetail(true); }} />,
    },
    { key: "Code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "Supplier", label: "Supplier", render: (v: unknown) => (v as any)?.Name || "-" },
    { key: "PaymentStatus.Code", label: "Status", render: (v: unknown) => <Badge variant={statusColors[v as string] as any || "default"}>{v as string}</Badge> },
    { key: "Total", label: "Total", align: "right" as const, render: (v: unknown) => <span className="font-semibold">{formatCurrency(v as number)}</span> },
    { key: "Paid", label: "Dibayar", align: "right" as const, render: (v: unknown) => <span className="text-success">{formatCurrency(v as number)}</span> },
    { key: "Remaining", label: "Sisa", align: "right" as const, render: (v: unknown) => <span className={Number(v) > 0 ? "font-bold text-danger" : ""}>{formatCurrency(v as number)}</span> },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[
            { key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari..." },
            { key: "status", label: "Status", type: "select", options: [{ value: "", label: "Semua" }, { value: "PENDING", label: "Pending" }, { value: "PAID", label: "Lunas" }, { value: "PARTIAL", label: "Sebagian" }, { value: "CANCELLED", label: "Batal" }] },
          ]}
          onFilter={(v) => { setSearch((v.search as string) || ""); setFilterStatus((v.status as string) || ""); }}
          loading={loading}
          actions={
            <GridActions
              onAdd={openCreate}
              onEdit={() => selected && setShowDetail(true)}
              onDelete={() => selected && setShowDelete(true)}
              disableEdit={!selected}
              disableDelete={!selected || selected.PaymentStatus?.Code === "CANCELLED"}
            />
          }
        />
        <div className="mt-4">
          <DataTable
            data={data}
            columns={columns}
            loading={loading}
            emptyMessage="Tidak ada pembelian"
            selectedId={selected?.ID ?? null}
            onRowClick={(row) => setSelected(row)}
          />
        </div>
      </Card>

      {/* Create Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Pembelian" size="xl"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}>
        <div className="space-y-4">
          {formError && <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</div>}

          <div className="grid grid-cols-2 gap-4">
            <Select label="Supplier *" value={form.supplierId} onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value }))}
              options={[{ value: "", label: "Pilih..." }, ...suppliers.map((s) => ({ value: s.ID, label: s.Name }))]} required />
            <Select label="Gudang" value={form.warehouseId} onChange={(e) => setForm((f) => ({ ...f, warehouseId: e.target.value }))}
              options={[{ value: "", label: "Pilih..." }, ...warehouses.map((w) => ({ value: w.ID, label: w.Name }))]} />
          </div>

          <div className="rounded-lg border border-default p-4">
            <p className="mb-3 text-sm font-semibold text-highlighted">Item Pembelian</p>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <Select label="Produk" value={draft.productId} onChange={(e) => {
                  const p = products.find((pp) => pp.ID === Number(e.target.value));
                  setDraft((d) => ({ ...d, productId: e.target.value, unitPrice: p ? String(Number(p.PurchasePrice) || 0) : d.unitPrice }));
                }} options={[{ value: "", label: "Pilih produk..." }, ...products.map((p) => ({ value: p.ID, label: `${p.Code} - ${p.Name}` }))]} />
              </div>
              <div className="col-span-2">
                <Input label="Qty" type="number" min={0} value={draft.quantity} onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))} />
              </div>
              <div className="col-span-3">
                <Input label="Harga Satuan" type="number" min={0} value={draft.unitPrice} onChange={(e) => setDraft((d) => ({ ...d, unitPrice: e.target.value }))} />
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
                    <th className="w-8 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-muted">
                      <Package className="mx-auto mb-1 size-6" />
                      Belum ada item
                    </td></tr>
                  ) : items.map((i) => (
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

      {/* Detail Modal */}
      <Modal open={showDetail} onClose={() => setShowDetail(false)} title={`Pembelian ${selected?.Code || ""}`} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted">Tanggal:</span> {formatDate(selected.Date)}</div>
              <div><span className="text-muted">Supplier:</span> {selected.Supplier?.Name || "-"}</div>
              <div><span className="text-muted">Status:</span> <Badge variant={statusColors[selected.PaymentStatus?.Code] as any || "default"}>{selected.PaymentStatus?.Code}</Badge></div>
              <div><span className="text-muted">Total:</span> <span className="font-bold">{formatCurrency(selected.Total)}</span></div>
            </div>
            <div className="border-t border-default pt-4">
              <h4 className="mb-2 font-semibold">Item Pembelian</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default">
                    <th className="py-1 text-left">Produk</th>
                    <th className="py-1 text-right">Qty</th>
                    <th className="py-1 text-right">Harga</th>
                    <th className="py-1 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.PurchaseItems || []).map((d: any, i: number) => (
                    <tr key={i} className="border-b border-default">
                      <td className="py-1">{d.Product?.Name || "-"}</td>
                      <td className="py-1 text-right">{d.Quantity}</td>
                      <td className="py-1 text-right">{formatCurrency(d.UnitPrice)}</td>
                      <td className="py-1 text-right font-semibold">{formatCurrency(d.Subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Hapus Pembelian" message={`Yakin menghapus pembelian "${selected?.Code}"?`} confirmText="Hapus" variant="danger" loading={saving} />
    </PageWrapper>
  );
}
