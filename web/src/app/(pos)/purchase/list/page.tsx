"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Search, Truck, Eye } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PurchaseListPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [detailData, setDetailData] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { $include: "supplier,purchasePayments" };
      if (search) params.$search = search;
      if (filterStatus) params.$where = `status eq '${filterStatus}'`;
      const res = await api.get("purchases", params).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data?.data || []);
    } finally { setLoading(false); }
  }, [search, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statusColors: Record<string, string> = {
    PENDING: "warning", PAID: "success", PARTIAL: "info",
    INSTALMENT: "info", CANCELLED: "danger",
  };

  const columns = [
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "supplierName", label: "Supplier" },
    { key: "status", label: "Status", render: (v: unknown) => <Badge variant={statusColors[v as string] as any || "default"}>{v as string}</Badge> },
    { key: "total", label: "Total", align: "right" as const, render: (v: unknown) => <span className="font-semibold">{formatCurrency(v as number)}</span> },
    { key: "paid", label: "Dibayar", align: "right" as const, render: (v: unknown) => <span className="text-success">{formatCurrency(v as number)}</span> },
    { key: "remaining", label: "Sisa", align: "right" as const, render: (v: unknown) => <span className={Number(v) > 0 ? "font-bold text-danger" : ""}>{formatCurrency(v as number)}</span> },
    {
      key: "actions", label: "", width: "60px",
      render: (_: unknown, row: any) => (
        <Button size="sm" variant="ghost" icon={Eye} onClick={() => { setDetailData(row); setShowDetail(true); }} />
      )
    },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Pembelian" subtitle="Daftar pembelian"
        actions={<Button variant="outline" icon={RefreshCw} onClick={fetchData} loading={loading}>Refresh</Button>} />

      <Card>
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <Input placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" leftIcon={Search} />
          <Select label="Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} options={[{ value: "", label: "Semua" }, { value: "PENDING", label: "Pending" }, { value: "PAID", label: "Lunas" }, { value: "PARTIAL", label: "Sebagian" }, { value: "CANCELLED", label: "Batal" }]} />
        </div>
        <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada pembelian" />
      </Card>

      <Modal open={showDetail} onClose={() => setShowDetail(false)} title={`Pembelian ${detailData?.code || ""}`} size="lg">
        {detailData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted">Tanggal:</span> {formatDate(detailData.date)}</div>
              <div><span className="text-muted">Supplier:</span> {detailData.supplierName}</div>
              <div><span className="text-muted">Status:</span> <Badge variant={statusColors[detailData.status] as any || "default"}>{detailData.status}</Badge></div>
              <div><span className="text-muted">Total:</span> <span className="font-bold">{formatCurrency(detailData.total)}</span></div>
            </div>
            <div className="border-t border-default pt-4">
              <h4 className="font-semibold mb-2">Item Pembelian</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default">
                    <th className="text-left py-1">Produk</th>
                    <th className="text-right py-1">Qty</th>
                    <th className="text-right py-1">Harga</th>
                    <th className="text-right py-1">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(detailData.details || []).map((d: any, i: number) => (
                    <tr key={i} className="border-b border-default">
                      <td className="py-1">{d.productName}</td>
                      <td className="text-right">{d.quantity}</td>
                      <td className="text-right">{formatCurrency(d.price)}</td>
                      <td className="text-right font-semibold">{formatCurrency(d.subtotal)}</td>
                    </tr>
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


