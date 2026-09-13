"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Download, TrendingUp, Package, Users, RefreshCw } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api-client";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import type { SalesReport, ChartDataPoint, TopProduct } from "@/lib/types";

export default function SalesReportPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [warehouseId, setWarehouseId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { startDate, endDate };
      if (warehouseId) params.warehouseId = warehouseId;
      if (customerId) params.customerId = customerId;

      const [salesRes, chartRes] = await Promise.all([
        api.get<SalesReport>("reports/sales", params as any).catch(() => ({ success: false, data: null } as any)),
        api.get<ChartDataPoint[]>("reports/sales/summary", params as any).catch(() => ({ success: false, data: [] } as any)),
      ]);

      if (salesRes.success) setReport(salesRes.data);
      if (chartRes.success) setChartData(chartRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, warehouseId, customerId]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const maxValue = chartData.length > 0
    ? Math.max(...chartData.map(d => d.sales || 0), 1)
    : 1;

  const paymentMethods = report ? Object.entries(report.salesByPaymentMethod)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ method: k, amount: v })) : [];

  return (
    <PageWrapper>
      <PageHeader
        title="Laporan Penjualan"
        subtitle={`Periode ${formatDate(startDate)} - ${formatDate(endDate)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={Download} onClick={() => {}}>
              Export
            </Button>
            <Button variant="primary" icon={RefreshCw} onClick={fetchReport} loading={loading}>
              Refresh
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <Input type="date" label="Dari Tanggal" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" label="Sampai Tanggal" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Select
            label="Gudang"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            options={[{ value: "", label: "Semua Gudang" }]}
          />
          <Select
            label="Pelanggan"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            options={[{ value: "", label: "Semua Pelanggan" }]}
          />
          <Button variant="primary" onClick={fetchReport} loading={loading}>Tampilkan</Button>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Penjualan"
          value={formatCurrency(report?.totalSales || 0)}
          icon={TrendingUp}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Jumlah Transaksi"
          value={formatNumber(report?.totalTransactions || 0)}
          icon={FileText}
          iconClassName="bg-info/10 text-info"
        />
        <StatCard
          title="Rata-rata Transaksi"
          value={formatCurrency(report?.averageTransaction || 0)}
          icon={Users}
          iconClassName="bg-highlight2/10 text-highlight2"
        />
        <StatCard
          title="Produk Terjual"
          value={formatNumber(report?.topProducts?.reduce((s, p) => s + p.quantity, 0) || 0)}
          icon={Package}
          iconClassName="bg-warning/10 text-warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-highlighted">Grafik Penjualan</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <div className="size-2.5 rounded-sm bg-success" />
              <span>Penjualan</span>
            </div>
          </div>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-muted">
              <FileText className="mb-2 size-10" />
              <p className="text-sm">Tidak ada data</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-1 h-48">
              {chartData.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-40 w-full items-end justify-center gap-0.5">
                    {d.sales > 0 && (
                      <div
                        className="w-4 rounded-t-sm bg-success transition-all hover:bg-success/80"
                        style={{ height: `${Math.max((d.sales / maxValue) * 100, 2)}%` }}
                        title={formatCurrency(d.sales)}
                      />
                    )}
                  </div>
                  <span className="text-xs text-muted">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* By Payment Method */}
        <Card>
          <h3 className="mb-4 font-semibold text-highlighted">Per Metode Pembayaran</h3>
          <div className="space-y-3">
            {paymentMethods.length === 0 ? (
              <p className="text-sm text-muted">Tidak ada data</p>
            ) : (
              paymentMethods.map((p) => {
                const pct = report!.totalSales > 0 ? (p.amount / report!.totalSales) * 100 : 0;
                return (
                  <div key={p.method} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{p.method}</span>
                      <span className="text-muted">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-elevated">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-right text-xs font-semibold text-primary">{formatCurrency(p.amount)}</p>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <h3 className="mb-4 font-semibold text-highlighted">Produk Terlaris</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default bg-elevated/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Kode</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Nama Produk</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted">Terjual</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {report?.topProducts?.map((p, i) => (
                <tr key={p.productId} className="border-b border-default transition-colors hover:bg-elevated/50">
                  <td className="px-4 py-3 text-muted">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.productCode}</td>
                  <td className="px-4 py-3 font-medium">{p.productName}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(p.quantity)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(p.revenue)}</td>
                </tr>
              ))}
              {(!report?.topProducts || report.topProducts.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageWrapper>
  );
}
