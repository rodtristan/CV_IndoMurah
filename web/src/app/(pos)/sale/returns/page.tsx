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

export default function SaleReturnsPage() {
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

  const [sales, setSales] = useState<any[]>([]);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [form, setForm] = useState({ saleId: "", reason: "" });
  const [items, setItems] = useState<DraftItem[]>([]);
  const [draft, setDraft] = useState({ productId: "", quantity: "1" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { $include: "Sale,Customer,Status,ReturnItems,ReturnItems.Product" };
      if (search) params.$search = search;
      if (filterStatus) params.$where = { Status: { Code: filterStatus } };
      const res = await api.get("SaleReturns", params).catch(() => ({ success: false, data: [] } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Deep-link from the "Retur" button on a sale's detail modal
  // (/sale/returns?saleId=123) — read via window.location instead of
  // useSearchParams to avoid the Suspense-boundary requirement that hook
  // imposes on the whole page.
  useEffect(() => {
    const saleId = new URLSearchParams(window.location.search).get("saleId");
    if (!saleId) return;
    (async () => {
      const list = await fetchSales();
      setForm((f) => ({ ...f, saleId }));
      setSelectedSale(list.find((s: any) => String(s.ID) === saleId) || null);
      setShowForm(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusColors: Record<string, string> = {
    DRAFT: "warning", CONFIRMED: "info", COMPLETED: "success", CANCELLED: "danger",
  };

  const fetchSales = async () => {
    const res = await api.get<any[]>("sales", odata().include(["Customer", "SaleItems", "SaleItems.Product", "SaleItems.Unit"]).orderByMulti({ createdAt: "desc" }).take(100).toParams()).catch(() => ({ data: [] } as any));
    const list = res.data || [];
    setSales(list);
    return list;
  };

  const resetForm = () => {
    setForm({ saleId: "", reason: "" });
    setSelectedSale(null);
    setItems([]);
    setDraft({ productId: "", quantity: "1" });
    setFormError("");
  };

  const openCreate = () => {
    resetForm();
    fetchSales();
    setShowForm(true);
  };

  const handleSelectSale = (saleId: string) => {
    setForm((f) => ({ ...f, saleId }));
    const sale = sales.find((s) => String(s.ID) === saleId);
    setSelectedSale(sale || null);
    setItems([]);
  };

  const handleAddItem = () => {
    if (!draft.productId || !selectedSale) return;
    const saleItem = (selectedSale.SaleItems || []).find((i: any) => String(i.ProductID) === draft.productId);
    if (!saleItem) return;
    const qty = Number(draft.quantity) || 0;
    if (qty <= 0) return;

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === saleItem.ProductID);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, {
        productId: saleItem.ProductID,
        productName: saleItem.Product?.Name || `Produk #${saleItem.ProductID}`,
        quantity: qty,
        unitId: saleItem.UnitID,
        unitPrice: Number(saleItem.UnitPrice),
      }];
    });
    setDraft({ productId: "", quantity: "1" });
  };

  const handleRemoveItem = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const itemsTotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const handleSave = async () => {
    setFormError("");
    if (!form.saleId) { setFormError("Pilih transaksi penjualan"); return; }
    if (items.length === 0) { setFormError("Tambahkan minimal 1 item"); return; }

    setSaving(true);
    try {
      const res = await api.post("SaleReturns", {
        SaleID: Number(form.saleId),
        CustomerID: selectedSale?.CustomerID || undefined,
        WarehouseID: selectedSale?.WarehouseID || undefined,
        Reason: form.reason || undefined,
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
      await api.delete("SaleReturns", selected.ID);
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
    { key: "Sale", label: "Ref. Penjualan", render: (v: unknown) => <span className="font-mono text-xs">{(v as any)?.Code || "-"}</span> },
    { key: "Customer", label: "Pelanggan", render: (v: unknown) => (v as any)?.Name || "-" },
    { key: "Status.Code", label: "Status", render: (v: unknown) => <Badge variant={(statusColors[v as string] || "default") as any}>{v as string}</Badge> },
    { key: "TotalReturn", label: "Total Retur", align: "right" as const, render: (v: unknown) => <span className="font-bold text-danger">{formatCurrency(v as number)}</span> },
    { key: "Reason", label: "Alasan" },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[
            { key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari..." },
            { key: "status", label: "Status", type: "select", options: [{ value: "", label: "Semua" }, { value: "DRAFT", label: "Draft" }, { value: "CONFIRMED", label: "Dikonfirmasi" }, { value: "COMPLETED", label: "Selesai" }, { value: "CANCELLED", label: "Batal" }] },
          ]}
          onFilter={(v) => { setSearch((v.search as string) || ""); setFilterStatus((v.status as string) || ""); }}
          loading={loading}
          actions={
            <GridActions
              onAdd={openCreate}
              onEdit={() => selected && setShowDetail(true)}
              onDelete={() => selected && setShowDelete(true)}
              disableEdit={!selected}
              disableDelete={!selected || selected.Status?.Code !== "DRAFT"}
            />
          }
        />
        <div className="mt-4">
          <DataTable
            data={data}
            columns={columns}
            loading={loading}
            emptyMessage="Tidak ada retur"
            selectedId={selected?.ID ?? null}
            onRowClick={(row) => setSelected(row)}
          />
        </div>
      </Card>

      {/* Create Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Retur Penjualan" size="xl"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}>
        <div className="space-y-4">
          {formError && <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</div>}

          <div className="grid grid-cols-2 gap-4">
            <Select label="Transaksi Penjualan *" value={form.saleId} onChange={(e) => handleSelectSale(e.target.value)}
              options={[{ value: "", label: "Pilih transaksi..." }, ...sales.map((s) => ({ value: s.ID, label: `${s.Code} - ${s.Customer?.Name || "Umum"}` }))]} required />
            <Input label="Alasan" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
          </div>

          <div className="rounded-lg border border-default p-4">
            <p className="mb-3 text-sm font-semibold text-highlighted">Item Retur</p>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-8">
                <Select label="Produk" value={draft.productId} onChange={(e) => setDraft((d) => ({ ...d, productId: e.target.value }))}
                  disabled={!selectedSale}
                  options={[{ value: "", label: selectedSale ? "Pilih produk..." : "Pilih transaksi dahulu" }, ...((selectedSale?.SaleItems || []).map((i: any) => ({ value: i.ProductID, label: `${i.Product?.Name || i.ProductID} (terjual ${i.Quantity})` })))]} />
              </div>
              <div className="col-span-3">
                <Input label="Qty Retur" type="number" min={0} value={draft.quantity} onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))} />
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
                      <td className="py-2 text-right font-bold text-danger">{formatCurrency(itemsTotal)}</td>
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
      <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Detail Retur" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted">Tanggal:</span> {formatDate(selected.Date)}</div>
              <div><span className="text-muted">Pelanggan:</span> {selected.Customer?.Name || "-"}</div>
              <div><span className="text-muted">Status:</span> <Badge variant={(statusColors[selected.Status?.Code] || "default") as any}>{selected.Status?.Code}</Badge></div>
              <div><span className="text-muted">Total:</span> <span className="font-bold text-danger">{formatCurrency(selected.TotalReturn)}</span></div>
            </div>
            <div className="border-t border-default pt-4">
              <h4 className="mb-2 font-semibold">Item Retur</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default">
                    <th className="py-1 text-left">Produk</th>
                    <th className="py-1 text-right">Qty Retur</th>
                    <th className="py-1 text-right">Harga</th>
                    <th className="py-1 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.ReturnItems || []).map((d: any, i: number) => (
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
        title="Hapus Retur" message={`Yakin menghapus retur "${selected?.Code}"?`} confirmText="Hapus" variant="danger" loading={saving} />
    </PageWrapper>
  );
}
