"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Package,
<<<<<<< HEAD
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
=======
  TrendingUp,
  TrendingDown,
  Users,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import {
  mockDashboardSummary,
  mockRecentTransactions,
  mockProducts,
} from "@/lib/mock-data-pos";
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111

// Format currency to IDR
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

<<<<<<< HEAD
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
=======
// Mock data for charts
const monthlySales = [
  { month: "Jan", sales: 45000000, profit: 12000000 },
  { month: "Feb", sales: 52000000, profit: 14500000 },
  { month: "Mar", sales: 48000000, profit: 13000000 },
  { month: "Apr", sales: 61000000, profit: 17000000 },
  { month: "Mei", sales: 55000000, profit: 15000000 },
  { month: "Jun", sales: 67000000, profit: 18500000 },
];

const bestSellers = [
  { name: "Mie Instan", sold: 1250, revenue: 18750000, percent: 35 },
  { name: "Kopi Sachet", sold: 980, revenue: 9800000, percent: 25 },
  { name: "Sabun Mandi", sold: 750, revenue: 11250000, percent: 20 },
  { name: "Shampo", sold: 520, revenue: 7800000, percent: 12 },
  { name: "Minuman Kaleng", sold: 380, revenue: 3800000, percent: 8 },
];

const branchSales = [
  { branch: "Cabang Bandung", sales: 125000000, target: 100000000 },
  { branch: "Cabang Jakarta", sales: 98000000, target: 120000000 },
  { branch: "Cabang Surabaya", sales: 87000000, target: 80000000 },
  { branch: "Cabang Medan", sales: 65000000, target: 75000000 },
];

export default function POSDashboardPage() {
  const { todaySales, inventory, receivables, todayPurchases } = mockDashboardSummary;

  // 7-day sales data for the bar chart
  const weeklySales = [
    { day: "Sen", sales: 1250000 },
    { day: "Sel", sales: 980000 },
    { day: "Rab", sales: 1560000 },
    { day: "Kam", sales: 1100000 },
    { day: "Jum", sales: 1890000 },
    { day: "Sab", sales: 2450000 },
    { day: "Min", sales: 875000 },
  ];

  const maxWeeklySales = Math.max(...weeklySales.map(d => d.sales));

  return (
    <PageWrapper className="bg-gray-100">
      {/* Stats Grid - Top Row (Matching Original ketoko) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Penjualan Hari Ini */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-600">Penjualan Hari Ini</span>
            <div className="p-2 bg-[#9C27B0]/10 rounded-lg">
              <DollarSign className="size-5 text-[#9C27B0]" />
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900 mb-1">{todaySales.count} Transaksi</div>
          <div className="text-xl font-bold text-[#9C27B0]">{formatIDR(todaySales.total)}</div>
        </div>

        {/* Pembelian Hari Ini */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-600">Pembelian Hari Ini</span>
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCart className="size-5 text-orange-600" />
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900 mb-1">{todayPurchases.count} Transaksi</div>
          <div className="text-xl font-bold text-orange-600">{formatIDR(todayPurchases.total)}</div>
        </div>

        {/* Total Item */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-600">Total Item</span>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="size-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{inventory.totalItems}</div>
          <div className="text-xs text-gray-500 mt-1">Items</div>
        </div>

        {/* Item Minim Stock */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-600">Item Minim Stock</span>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="size-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">{inventory.lowStockCount}</div>
          <div className="text-xs text-gray-500 mt-1">Items</div>
        </div>
      </div>

      {/* Charts Row (Matching Original ketoko) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grafik Penjualan 7 Hari Terakhir */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Grafik Penjualan 7 Hari Terakhir</h3>
          </div>
          <div className="p-4">
            {/* Bar Chart */}
            <div className="relative h-48 flex items-end justify-around gap-2 px-2">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400">
                <span>{formatIDR(maxWeeklySales)}</span>
                <span>{formatIDR(maxWeeklySales * 0.5)}</span>
                <span>0</span>
              </div>

              {/* Grid lines */}
              <div className="absolute left-10 right-2 top-0 bottom-6 flex flex-col justify-between">
                <div className="border-b border-gray-200 w-full"></div>
                <div className="border-b border-gray-200 w-full"></div>
                <div className="border-b border-gray-300 w-full"></div>
              </div>

              {/* Bars */}
              <div className="flex-1 flex items-end justify-around h-full pb-6 ml-12 gap-2">
                {weeklySales.map((data, idx) => {
                  const height = (data.sales / maxWeeklySales) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 group flex-1">
                      <div
                        className="w-full bg-[#9C27B0] rounded-t transition-all hover:bg-[#7B1FA2] cursor-pointer relative max-w-12"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                          {formatIDR(data.sales)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{data.day}</span>
                    </div>
                  );
                })}
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
              </div>
            </div>
          </div>
        </div>

<<<<<<< HEAD
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
=======
        {/* Omzet Penjualan Perbulan */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Omzet Penjualan Perbulan</h3>
          </div>
          <div className="p-4">
            {/* Bar Chart - Side by Side */}
            <div className="relative h-48 flex items-end justify-between gap-1 px-2">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400">
                <span>80M</span>
                <span>60M</span>
                <span>40M</span>
                <span>20M</span>
                <span>0</span>
              </div>

              {/* Grid lines */}
              <div className="absolute left-10 right-2 top-0 bottom-6 flex flex-col justify-between">
                <div className="border-b border-gray-200 w-full"></div>
                <div className="border-b border-gray-200 w-full"></div>
                <div className="border-b border-gray-200 w-full"></div>
                <div className="border-b border-gray-200 w-full"></div>
                <div className="border-b border-gray-300 w-full"></div>
              </div>

              {/* Bars Container */}
              <div className="flex-1 flex items-end justify-around h-full pb-6 ml-12 gap-1">
                {monthlySales.map((data, idx) => {
                  const salesHeight = (data.sales / 80000000) * 100;
                  return (
                    <div key={idx} className="flex items-end gap-0.5 group flex-1">
                      <div
                        className="w-4 bg-[#7B1FA2] rounded-t transition-all hover:bg-[#6A1B9A] cursor-pointer relative mx-auto"
                        style={{ height: `${Math.min(salesHeight, 100)}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                          {formatIDR(data.sales)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-12 right-2 flex justify-around">
                {monthlySales.map((data, idx) => (
                  <span key={idx} className="text-xs text-gray-500 font-medium text-center">
                    {data.month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Best Selling & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Best Selling Item */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Best Selling Item</h3>
          </div>
          <div className="p-4">
            {/* Pie Chart Visual */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {(() => {
                    let cumulative = 0;
                    return bestSellers.map((item, idx) => {
                      const dashArray = item.percent;
                      const dashOffset = 100 - cumulative;
                      cumulative += item.percent;
                      const colors = ["bg-[#9C27B0]", "bg-purple-400", "bg-purple-300", "bg-purple-200", "bg-purple-100"];
                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          strokeWidth="20"
                          strokeDasharray={`${dashArray} ${100 - dashArray}`}
                          strokeDashoffset={dashOffset}
                          className={colors[idx]}
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-gray-500">Terjual</span>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-2">
              {bestSellers.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", ["bg-[#9C27B0]", "bg-purple-400", "bg-purple-300", "bg-purple-200", "bg-purple-100"][idx])}></div>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-gray-500">{item.percent}%</span>
                </div>
              ))}
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
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

<<<<<<< HEAD
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
=======
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Aksi Cepat</h3>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/sale/pos">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#9C27B0]/10 hover:bg-[#9C27B0]/20 transition-colors cursor-pointer">
                <div className="p-2 bg-[#9C27B0]/20 rounded-lg">
                  <ShoppingCart className="size-5 text-[#9C27B0]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Kasir POS</div>
                  <div className="text-xs text-gray-500">Transaksi baru</div>
                </div>
              </div>
            </Link>
            <Link href="/purchase/list">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="size-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Pembelian Baru</div>
                  <div className="text-xs text-gray-500">Catat pembelian</div>
                </div>
              </div>
            </Link>
            <Link href="/inventory/stock-in">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="size-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Item Masuk</div>
                  <div className="text-xs text-gray-500">Terima barang</div>
                </div>
              </div>
            </Link>
            <Link href="/master/items">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="size-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Data Item</div>
                  <div className="text-xs text-gray-500">Kelola barang</div>
                </div>
              </div>
            </Link>
          </div>
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
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
