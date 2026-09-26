"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, ShoppingCart, Package, Truck } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api-client";
import { formatCurrency, formatNumber, formatDate, localDate } from "@/lib/utils";

export default function PurchaseReportPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(1); return localDate(d);
  });
  const [endDate, setEndDate] = useState(() => localDate());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("reports/purchase", { startDate, endDate } as any).catch(() => ({ success: false, data: null } as any));
      if (res.success) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { summary = {}, byProduct = [], byDate = [] } = data || {};

  return (
    <PageWrapper>
      <PageHeader title="Laporan Pembelian" subtitle={`Periode ${formatDate(startDate)} - ${formatDate(endDate)}`}
        actions={<><Button variant="outline" icon={Download}>Export</Button><Button variant="primary" icon={RefreshCw} onClick={fetchData} loading={loading}>Refresh</Button></>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Pembelian" value={formatCurrency(summary.totalPurchases || 0)} icon={ShoppingCart} iconClassName="bg-info/10 text-info" />
        <StatCard title="Jumlah Transaksi" value={formatNumber(summary.totalTransactions || 0)} icon={Package} iconClassName="bg-warning/10 text-warning" />
        <StatCard title="Item Dibeli" value={formatNumber(summary.totalItems || 0)} icon={Truck} iconClassName="bg-success/10 text-success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-semibold text-highlighted">Produk Dibeli</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default bg-elevated/50">
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted">Produk</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-muted">Qty</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-muted">Total</th>
                </tr>
              </thead>
              <tbody>
                {byProduct.map((p: any, i: number) => (
                  <tr key={i} className="border-b border-default hover:bg-elevated/50">
                    <td className="px-4 py-2">{p.productName}</td>
                    <td className="px-4 py-2 text-right">{formatNumber(p.quantity)}</td>
                    <td className="px-4 py-2 text-right font-semibold text-primary">{formatCurrency(p.totalPurchases)}</td>
                  </tr>
                ))}
                {byProduct.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted">Tidak ada data</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-highlighted">Filter</h3>
          <div className="space-y-4">
            <Input type="date" label="Dari Tanggal" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <Input type="date" label="Sampai Tanggal" value={endDate} onChange={e => setEndDate(e.target.value)} />
            <Button variant="primary" className="w-full" onClick={fetchData} loading={loading}>Tampilkan</Button>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
