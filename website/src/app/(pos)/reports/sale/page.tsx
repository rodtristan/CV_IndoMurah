"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw, FileText, BarChart3, TrendingUp, ShoppingCart, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { api } from "@/lib/api";
import type { Sale, Warehouse, Customer } from "@/types/pos";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

interface SaleStats {
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  totalPaid: number;
  totalReceivable: number;
}

interface ChartDataPoint {
  date: string;
  label: string;
  sales: number;
  transactions: number;
}

export default function SaleReportPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Date range - default to current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const [dateFrom, setDateFrom] = useState<string>(firstDay.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState<string>(now.toISOString().split('T')[0]);

  // Filters
  const [warehouseFilter, setWarehouseFilter] = useState<number | null>(null);
  const [customerFilter, setCustomerFilter] = useState<number | null>(null);
  const [showChart, setShowChart] = useState(true);

  // Summary stats
  const [stats, setStats] = useState<SaleStats>({
    totalSales: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    totalPaid: 0,
    totalReceivable: 0,
  });

  // Chart data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const grouped: Record<string, { sales: number; transactions: number }> = {};

    sales.forEach(sale => {
      const dateKey = new Date(sale.createdAt).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = { sales: 0, transactions: 0 };
      }
      grouped[dateKey].sales += sale.total || 0;
      grouped[dateKey].transactions += 1;
    });

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        label: formatDate(date),
        sales: data.sales,
        transactions: data.transactions,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [sales]);

  const maxSales = useMemo(() => Math.max(...chartData.map(d => d.sales), 1), [chartData]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        $skip: 0,
        $take: 1000,
        $orderBy: { createdAt: 'desc' },
      };

      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (search) params.$search = search;
      if (warehouseFilter) params.warehouseId = warehouseFilter;
      if (customerFilter) params.customerId = customerFilter;

      const [salesRes, warehouseRes, customerRes] = await Promise.all([
        api.getSales(params),
        api.getWarehouses({ $where: { isActive: true }, $take: 100 }),
        api.getCustomers({ $where: { isActive: true }, $take: 100 }),
      ]);

      if (salesRes.success) {
        const salesData = salesRes.data || [];
        setSales(salesData);

        // Calculate stats
        const totalSales = salesData.reduce((sum: number, s: Sale) => sum + (s.total || 0), 0);
        const totalPaid = salesData.reduce((sum: number, s: Sale) => sum + (s.cashAmount || s.total || 0), 0);
        const totalTransactions = salesData.length;

        setStats({
          totalSales,
          totalTransactions,
          averageTransaction: totalTransactions > 0 ? totalSales / totalTransactions : 0,
          totalPaid,
          totalReceivable: totalSales - totalPaid,
        });
      }

      if (warehouseRes.success) {
        setWarehouses(warehouseRes.data || []);
      }
      if (customerRes.success) {
        setCustomers(customerRes.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, search, warehouseFilter, customerFilter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = () => {
    const headers = ['Kode', 'Tanggal', 'Pelanggan', 'Gudang', 'Total', 'Bayar', 'Sisa', 'Status'];
    const rows = sales.map(s => [
      s.code,
      formatDate(s.createdAt),
      s.customer?.name || 'Umum',
      s.warehouse?.name || '-',
      s.total,
      s.cashAmount || s.total,
      s.total - (s.cashAmount || s.total),
      s.paymentStatus,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_penjualan_${dateFrom}_${dateTo}.csv`;
    link.click();
  };

  return (
    <PageWrapper>
      <PageTitle
        title="Laporan Penjualan"
        subtitle={`Periode: ${formatDate(dateFrom)} - ${formatDate(dateTo)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={showChart ? "solid" : "outline"}
              icon={BarChart3}
              onClick={() => setShowChart(!showChart)}
              size="sm"
            >
              Chart
            </Button>
            <Button variant="outline" icon={Download} onClick={handleExport}>
              Export CSV
            </Button>
            <Button variant="outline" icon={RefreshCw} onClick={fetchReport} disabled={loading}>
              Refresh
            </Button>
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
              <TrendingUp className="size-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Penjualan</p>
              <p className="text-xl font-bold text-success">
                {loading ? '...' : formatCurrency(stats.totalSales)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <ShoppingCart className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">Jumlah Transaksi</p>
              <p className="text-xl font-bold">
                {loading ? '...' : formatNumber(stats.totalTransactions)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-info/10">
              <DollarSign className="size-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted">Rata-rata Transaksi</p>
              <p className="text-xl font-bold">
                {loading ? '...' : formatCurrency(stats.averageTransaction)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
              <DollarSign className="size-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Bayar</p>
              <p className="text-xl font-bold text-success">
                {loading ? '...' : formatCurrency(stats.totalPaid)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-warning/10">
              <DollarSign className="size-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted">Piutang</p>
              <p className="text-xl font-bold text-warning">
                {loading ? '...' : formatCurrency(stats.totalReceivable)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {showChart && chartData.length > 0 && (
        <div className="mb-6 rounded-lg border border-default bg-bg p-4">
          <h3 className="mb-4 font-semibold">Penjualan per Hari</h3>
          <div className="space-y-2">
            {chartData.map((point) => {
              const barWidth = (point.sales / maxSales) * 100;
              return (
                <div key={point.date} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-muted">{point.label}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="h-8 flex-1 bg-elevated rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-success to-success/70 rounded transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="w-32 text-right text-sm font-medium">
                      {formatCurrency(point.sales)}
                    </span>
                    <span className="w-16 text-right text-xs text-muted">
                      {point.transactions}x
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <label className="mb-1 block text-sm font-medium">Dari Tanggal</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Sampai Tanggal</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Gudang</label>
          <select
            value={warehouseFilter || ""}
            onChange={(e) => setWarehouseFilter(e.target.value ? Number(e.target.value) : null)}
            className="rounded-lg border border-default bg-bg px-3 py-2 text-sm"
          >
            <option value="">Semua Gudang</option>
            {warehouses.map(wh => (
              <option key={wh.id} value={wh.id}>{wh.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Pelanggan</label>
          <select
            value={customerFilter || ""}
            onChange={(e) => setCustomerFilter(e.target.value ? Number(e.target.value) : null)}
            className="rounded-lg border border-default bg-bg px-3 py-2 text-sm"
          >
            <option value="">Semua Pelanggan</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Pencarian</label>
          <Input
            placeholder="Cari kode atau pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-default overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-muted">Kode</th>
                <th className="px-3 py-3 text-left font-medium text-muted">Tanggal</th>
                <th className="px-3 py-3 text-left font-medium text-muted">Pelanggan</th>
                <th className="px-3 py-3 text-left font-medium text-muted">Gudang</th>
                <th className="px-3 py-3 text-right font-medium text-muted">Total</th>
                <th className="px-3 py-3 text-right font-medium text-muted">Bayar</th>
                <th className="px-3 py-3 text-right font-medium text-muted">Sisa</th>
                <th className="px-3 py-3 text-center font-medium text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default bg-bg">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted">
                      <div className="size-5 animate-spin rounded-full border-2 border-default border-t-primary" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-muted">
                    <FileText className="size-12 mx-auto mb-2" />
                    <p>Tidak ada data untuk periode ini</p>
                  </td>
                </tr>
              ) : (
                sales.map((sale) => {
                  const remaining = (sale.total || 0) - (sale.cashAmount || sale.total || 0);
                  return (
                    <tr key={sale.id} className="hover:bg-elevated/50">
                      <td className="px-3 py-3 font-mono font-medium">{sale.code}</td>
                      <td className="px-3 py-3 text-muted">{formatDate(sale.createdAt)}</td>
                      <td className="px-3 py-3">{sale.customer?.name || 'Umum'}</td>
                      <td className="px-3 py-3 text-muted">{sale.warehouse?.name || '-'}</td>
                      <td className="px-3 py-3 text-right font-semibold">{formatCurrency(sale.total || 0)}</td>
                      <td className="px-3 py-3 text-right text-success">{formatCurrency(sale.cashAmount || sale.total || 0)}</td>
                      <td className={cn("px-3 py-3 text-right", remaining > 0 ? "text-warning font-medium" : "text-muted")}>
                        {formatCurrency(remaining)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          sale.paymentStatus === 'PAID' ? "bg-success/10 text-success" :
                          sale.paymentStatus === 'PARTIAL' ? "bg-warning/10 text-warning" : "bg-muted/10 text-muted"
                        )}>
                          {sale.paymentStatus === 'PAID' ? 'Lunas' : sale.paymentStatus === 'PARTIAL' ? 'Sebagian' : 'Tertunda'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {!loading && sales.length > 0 && (
              <tfoot className="bg-elevated font-semibold">
                <tr>
                  <td colSpan={4} className="px-3 py-3">Total</td>
                  <td className="px-3 py-3 text-right">{formatCurrency(stats.totalSales)}</td>
                  <td className="px-3 py-3 text-right text-success">{formatCurrency(stats.totalPaid)}</td>
                  <td className="px-3 py-3 text-right text-warning">{formatCurrency(stats.totalReceivable)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
