"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  Eye,
  FileText,
} from "lucide-react";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { StatCard } from "@/components/pos/StatCard";
import { DataTable } from "@/components/pos/DataTable";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Sale, DashboardStats, ChartDataPoint, TopProduct } from "@/types/pos";
import { cn } from "@/lib/utils";

// Format currency to IDR
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format number with separator
function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

// Format date
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);

      // Fetch dashboard stats
      const statsRes = await api.request<{ data: DashboardStats }>('GET', 'reports/dashboard');
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      } else {
        // Fallback to individual API calls
        await fetchIndividualStats();
      }

      // Fetch recent sales
      const salesRes = await api.getSales({
        $orderBy: { createdAt: 'desc' },
        $take: 10,
      });
      if (salesRes.success) {
        setRecentSales(salesRes.data || []);
      }

      // Fetch sales report for chart data
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = now.toISOString().split('T')[0];

      const chartRes = await api.request<{ data: ChartDataPoint[] }>('GET', 'reports/sales/summary', undefined, {
        startDate: startOfMonth,
        endDate: endOfMonth,
      });
      if (chartRes.success && chartRes.data) {
        setChartData(chartRes.data);
      }

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchIndividualStats = async () => {
    try {
      const [salesRes, productsRes, customersRes] = await Promise.all([
        api.getSales({ $take: 100 }),
        api.getProducts({ $take: 1 }),
        api.getCustomers({ $take: 1 }),
      ]);

      const totalSales = (salesRes.data || []).reduce((sum: number, s: Sale) => sum + (s.total || 0), 0);
      const totalPurchases = 0; // Add purchase API call when needed
      const grossProfit = totalSales * 0.32; // Estimated margin
      const netProfit = totalSales * 0.22; // Estimated net margin

      setStats({
        totalSales,
        totalPurchases,
        grossProfit,
        netProfit,
        totalProducts: productsRes.meta?.total || 0,
        totalCategories: 0,
        totalCustomers: customersRes.meta?.total || 0,
        totalSuppliers: 0,
        newOrders: salesRes.data?.length || 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalReceivable: 0,
        totalPayable: 0,
      });
    } catch (error) {
      console.error("Failed to fetch individual stats:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const maxValue = chartData.length > 0
    ? Math.max(...chartData.map(d => Math.max(d.sales || 0, d.purchases || 0)))
    : 1;

  const columns = [
    { key: "code", label: "Kode", sortable: true },
    {
      key: "date",
      label: "Tanggal",
      sortable: true,
      render: (v: unknown) => formatDate(v as string)
    },
    {
      key: "customer",
      label: "Pelanggan",
      render: (_: unknown, row: Sale) => row.customer?.name || row.customer?.code || '-'
    },
    {
      key: "total",
      label: "Total",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => formatCurrency(v as number)
    },
    {
      key: "paymentStatus",
      label: "Status",
      render: (v: unknown) => {
        const status = v as string;
        return (
          <span className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            status === 'PAID' ? "bg-success/10 text-success" :
            status === 'PARTIAL' ? "bg-warning/10 text-warning" :
            "bg-muted/10 text-muted"
          )}>
            {status === 'PAID' ? 'Lunas' : status === 'PARTIAL' ? 'Sebagian' : status === 'PENDING' ? 'Tertunda' : status}
          </span>
        );
      }
    },
  ];

  return (
    <PageWrapper>
      <PageTitle
        title="Dashboard"
        subtitle="Selamat datang di Toko IndoMurah"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchDashboardData}
              disabled={refreshing}
            >
              {refreshing ? 'Memuat...' : 'Refresh'}
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Penjualan"
          value={loading ? '-' : formatCurrency(stats?.totalSales || 0)}
          change="+12.5%"
          changeType="up"
          icon={TrendingUp}
          iconClassName="bg-success/10 text-success"
          href="/sale/list"
        />

        <StatCard
          title="Total Pembelian"
          value={loading ? '-' : formatCurrency(stats?.totalPurchases || 0)}
          change="+8.3%"
          changeType="up"
          icon={ShoppingCart}
          iconClassName="bg-blue-500/10 text-blue-500"
          href="/purchase/list"
        />

        <StatCard
          title="Laba Kotor"
          value={loading ? '-' : formatCurrency(stats?.grossProfit || 0)}
          change="+15.2%"
          changeType="up"
          icon={DollarSign}
          iconClassName="bg-purple-500/10 text-purple-500"
          href="/reports/profit"
        />

        <StatCard
          title="Stock Minim"
          value={loading ? '-' : String(stats?.lowStockCount || 0)}
          subtitle={loading ? '' : `${stats?.outOfStockCount || 0} Out of Stock`}
          icon={AlertTriangle}
          iconClassName="bg-warning/10 text-warning"
          href="/inventory/minimum-stock"
        />
      </div>

      {/* Chart and Summary Section */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Chart */}
        <div className="lg:col-span-2 rounded-lg border border-default bg-bg p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-highlighted">Penjualan vs Pembelian</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded bg-green-500" />
                <span className="text-muted">Penjualan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded bg-blue-500" />
                <span className="text-muted">Pembelian</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted">
              <FileText className="size-12 mb-2" />
              <p>Tidak ada data untuk periode ini</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-2 h-64">
              {chartData.map((data, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-48 w-full items-end justify-center gap-1">
                    {data.purchases !== undefined && data.purchases > 0 && (
                      <div
                        className="w-5 rounded-t bg-blue-500 transition-all hover:bg-blue-600"
                        style={{ height: `${Math.max((data.purchases / maxValue) * 100, 2)}%` }}
                        title={formatCurrency(data.purchases)}
                      />
                    )}
                    {data.sales !== undefined && data.sales > 0 && (
                      <div
                        className="w-5 rounded-t bg-green-500 transition-all hover:bg-green-600"
                        style={{ height: `${Math.max((data.sales / maxValue) * 100, 2)}%` }}
                        title={formatCurrency(data.sales)}
                      />
                    )}
                  </div>
                  <span className="text-xs text-muted">{data.label || index + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="rounded-lg border border-default bg-bg p-6">
          <h3 className="mb-4 font-semibold text-highlighted">Ringkasan</h3>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 animate-pulse rounded bg-elevated" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-default pb-3">
                <span className="text-muted">Total Produk</span>
                <span className="font-semibold">{formatNumber(stats?.totalProducts || 0)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-default pb-3">
                <span className="text-muted">Total Pelanggan</span>
                <span className="font-semibold">{formatNumber(stats?.totalCustomers || 0)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-default pb-3">
                <span className="text-muted">Piutang</span>
                <span className="font-semibold text-warning">{formatCurrency(stats?.totalReceivable || 0)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-default pb-3">
                <span className="text-muted">Hutang</span>
                <span className="font-semibold text-info">{formatCurrency(stats?.totalPayable || 0)}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold">Margin Laba</span>
                <span className="font-bold text-success">
                  {stats?.totalSales ? ((stats.netProfit / stats.totalSales) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h3 className="mb-4 font-semibold text-highlighted">Aksi Cepat</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/sale/pos">
            <Plus className="size-6" />
            <span className="text-xs">Penjualan Baru</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/master/items">
            <Package className="size-6" />
            <span className="text-xs">Produk</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/inventory/stock-in">
            <TrendingUp className="size-6" />
            <span className="text-xs">Barang Masuk</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/inventory/stock-out">
            <TrendingDown className="size-6" />
            <span className="text-xs">Barang Keluar</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/reports/sale">
            <FileText className="size-6" />
            <span className="text-xs">Laporan</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/sale/list">
            <Eye className="size-6" />
            <span className="text-xs">Lihat Transaksi</span>
          </Button>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-highlighted">Transaksi Terbaru</h3>
          <Button variant="ghost" size="sm" href="/sale/list">
            Lihat Semua
          </Button>
        </div>
        <DataTable
          data={recentSales}
          columns={columns}
          loading={loading}
          emptyMessage="Tidak ada transaksi"
        />
      </div>
    </PageWrapper>
  );
}
