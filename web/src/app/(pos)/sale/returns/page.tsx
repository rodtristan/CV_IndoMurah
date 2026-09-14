"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SaleReturnsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [detailData, setDetailData] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { $include: "sale,customer" };
      if (search) params.$search = search;
      if (filterStatus) params.$where = `status eq '${filterStatus}'`;
      const res = await api.get("sale-returns", params).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statusColors: Record<string, string> = {
    PENDING: "warning", APPROVED: "success", REJECTED: "danger", COMPLETED: "success",
  };

  const columns = [
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "saleCode", label: "Ref. Penjualan", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "customerName", label: "Pelanggan" },
    { key: "status", label: "Status", render: (v: unknown) => <Badge variant={(statusColors[v as string] || "default") as any}>{v as string}</Badge> },
    { key: "total", label: "Total Retur", align: "right" as const, render: (v: unknown) => <span className="font-bold text-danger">{formatCurrency(v as number)}</span> },
    { key: "reason", label: "Alasan" },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[
            { key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari..." },
            { key: "status", label: "Status", type: "select", options: [{ value: "", label: "Semua" }, { value: "PENDING", label: "Pending" }, { value: "APPROVED", label: "Disetujui" }, { value: "COMPLETED", label: "Selesai" }] },
          ]}
          onFilter={(v) => { setSearch((v.search as string) || ""); setFilterStatus((v.status as string) || ""); }}
          loading={loading}
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada retur" />
        </div>
      </Card>

      <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Detail Retur" size="lg">
        {detailData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted">Tanggal:</span> {formatDate(detailData.date)}</div>
              <div><span className="text-muted">Pelanggan:</span> {detailData.customerName}</div>
              <div><span className="text-muted">Status:</span> <Badge variant={(statusColors[detailData.status] || "default") as any}>{detailData.status}</Badge></div>
              <div><span className="text-muted">Total:</span> <span className="font-bold text-danger">{formatCurrency(detailData.total)}</span></div>
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
