"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PurchaseReturnsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [detailData, setDetailData] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState("");
  const [reason, setReason] = useState("");
  const [items, setItems] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { $include: "purchase,supplier,returnItems,returnItems.product" };
      if (search) params.$search = search;
      if (filterStatus) params.$where = { status: filterStatus };
      const res = await api.get("purchase-returns", params).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchPurchases = useCallback(async () => {
    const res = await api.get("purchases", { $select: "id,code,supplierId", $orderBy: { createdAt: "desc" }, $take: 50 } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setPurchases(res.data || []);
  }, []);

  const openCreate = () => {
    setSelectedPurchaseId("");
    setReason("");
    setItems([]);
    fetchPurchases();
    setShowForm(true);
  };

  const handleSelectPurchase = async (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    setItems([]);
    if (!purchaseId) return;
    const res = await api.get(`purchases/${purchaseId}`, { $include: "purchaseItems,purchaseItems.product" } as any).catch(() => ({ success: false, data: null } as any));
    if (res.success && res.data) {
      const purchase = res.data as any;
      setItems((purchase.purchaseItems || []).map((it: any) => ({
        productId: it.productId,
        productName: it.product?.name || "-",
        unitId: it.unitId,
        unitPrice: Number(it.unitPrice),
        maxQuantity: Number(it.quantity),
        quantity: 0,
      })));
    }
  };

  const updateItemQty = (idx: number, qty: number) => {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, quantity: qty } : it));
  };

  const handleSave = async () => {
    const returnItems = items.filter((it) => it.quantity > 0).map((it) => ({
      productId: it.productId,
      unitId: it.unitId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    }));
    if (!selectedPurchaseId || returnItems.length === 0) return;
    await api.post("purchase-returns", {
      purchaseId: Number(selectedPurchaseId),
      reason: reason || undefined,
      items: returnItems,
    }).catch(() => ({}));
    setShowForm(false);
    fetchData();
  };

  const statusColors: Record<string, string> = {
    DRAFT: "warning", CONFIRMED: "info", COMPLETED: "success", CANCELLED: "danger",
  };

  const columns = [
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "purchase", label: "Ref. Pembelian", render: (v: unknown) => <span className="font-mono text-xs">{(v as any)?.code || "-"}</span> },
    { key: "supplier", label: "Supplier", render: (v: unknown) => (v as any)?.name || "-" },
    { key: "status", label: "Status", render: (v: unknown) => <Badge variant={(statusColors[v as string] || "default") as any}>{v as string}</Badge> },
    { key: "totalReturn", label: "Total Retur", align: "right" as const, render: (v: unknown) => <span className="font-bold text-danger">{formatCurrency(v as number)}</span> },
    { key: "reason", label: "Alasan" },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[
            { key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari..." },
            { key: "status", label: "Status", type: "select", options: [{ value: "", label: "Semua" }, { value: "DRAFT", label: "Draft" }, { value: "CONFIRMED", label: "Dikonfirmasi" }, { value: "COMPLETED", label: "Selesai" }, { value: "CANCELLED", label: "Dibatalkan" }] },
          ]}
          onFilter={(v) => { setSearch((v.search as string) || ""); setFilterStatus((v.status as string) || ""); }}
          loading={loading}
          actions={<GridActions onAdd={openCreate} />}
        />
        <div className="mt-4">
          <DataTable
            data={data}
            columns={columns}
            loading={loading}
            emptyMessage="Tidak ada retur pembelian"
            onRowClick={(row) => { setDetailData(row); setShowDetail(true); }}
          />
        </div>
      </Card>

      <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Detail Retur Pembelian" size="lg">
        {detailData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted">Tanggal:</span> {formatDate(detailData.date)}</div>
              <div><span className="text-muted">Supplier:</span> {detailData.supplier?.name || "-"}</div>
              <div><span className="text-muted">Status:</span> <Badge variant={(statusColors[detailData.status] || "default") as any}>{detailData.status}</Badge></div>
              <div><span className="text-muted">Total:</span> <span className="font-bold text-danger">{formatCurrency(detailData.totalReturn)}</span></div>
            </div>
            <div className="border-t border-default pt-4">
              <h4 className="font-semibold mb-2">Item Retur</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default">
                    <th className="text-left py-1">Produk</th>
                    <th className="text-right py-1">Qty Retur</th>
                    <th className="text-right py-1">Harga</th>
                    <th className="text-right py-1">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(detailData.returnItems || []).map((d: any, i: number) => (
                    <tr key={i} className="border-b border-default">
                      <td className="py-1">{d.product?.name || "-"}</td>
                      <td className="text-right">{d.quantity}</td>
                      <td className="text-right">{formatCurrency(d.unitPrice)}</td>
                      <td className="text-right font-semibold">{formatCurrency(d.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Retur Pembelian Baru" size="lg">
        <div className="space-y-4">
          <Select
            label="Pembelian"
            value={selectedPurchaseId}
            onChange={(e) => handleSelectPurchase(e.target.value)}
            options={purchases.map((p) => ({ value: p.id, label: p.code }))}
          />
          <Input label="Alasan" value={reason} onChange={(e) => setReason(e.target.value)} />
          {items.length > 0 && (
            <div className="border-t border-default pt-4">
              <h4 className="font-semibold mb-2">Item</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default">
                    <th className="text-left py-1">Produk</th>
                    <th className="text-right py-1">Qty Dibeli</th>
                    <th className="text-right py-1">Qty Retur</th>
                    <th className="text-right py-1">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} className="border-b border-default">
                      <td className="py-1">{it.productName}</td>
                      <td className="text-right">{it.maxQuantity}</td>
                      <td className="text-right">
                        <input
                          type="number"
                          min={0}
                          max={it.maxQuantity}
                          value={it.quantity}
                          onChange={(e) => updateItemQty(idx, Math.min(Number(e.target.value), it.maxQuantity))}
                          className="w-20 rounded border border-default px-2 py-1 text-right"
                        />
                      </td>
                      <td className="text-right">{formatCurrency(it.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
