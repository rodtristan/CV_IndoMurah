"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  RefreshCw,
  PlayCircle,
  BellRing,
  Plus,
  FileText,
  Users,
  Coins,
} from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { StatCard, Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api-client";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import type { DashboardStats, Sale, TopProduct, ChartDataPoint } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);

      // Fetch dashboard stats
      const [statsRes, salesRes, chartRes] = await Promise.all([
        api.get<any>("dashboard").catch(() => ({ success: false } as any)),
        api.get<Sale[]>("sales", { $orderBy: { createdAt: "desc" }, $take: 10 }).catch(() => ({ success: false, data: [] } as any)),
        api.get<ChartDataPoint[]>("reports/sales/summary", {}).catch(() => ({ success: false, data: [] } as any)),
      ]);

      // Backend's GET /dashboard returns { summary, topProducts, ...,
      // lowStockItems, outOfStockItems, recentTransactions } — not a flat
      // DashboardStats object — so it's remapped here rather than in the type.
      if (statsRes.success && statsRes.data) {
        const d = statsRes.data;
        setStats({
          totalSales: d.summary?.totalSales || 0,
          totalPurchases: d.summary?.totalPurchases || 0,
          grossProfit: d.summary?.grossProfit || 0,
          netProfit: d.summary?.netProfit || 0,
          totalProducts: 0,
          totalCategories: 0,
          totalCustomers: 0,
          totalSuppliers: 0,
          newOrders: 0,
          lowStockCount: d.lowStockItems?.length || 0,
          outOfStockCount: d.outOfStockItems?.length || 0,
          totalReceivable: 0,
          totalPayable: 0,
        });
      } else {
        setStats({
          totalSales: 0,
          totalPurchases: 0,
          grossProfit: 0,
          netProfit: 0,
          totalProducts: 0,
          totalCategories: 0,
          totalCustomers: 0,
          totalSuppliers: 0,
          newOrders: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          totalReceivable: 0,
          totalPayable: 0,
        });
      }

      if (salesRes.success && salesRes.data) {
        setRecentSales(salesRes.data);
      }

      if (chartRes.success && chartRes.data) {
        setChartData(chartRes.data);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const maxValue = chartData.length > 0
    ? Math.max(...chartData.map(d => Math.max(d.sales || 0, d.purchases || 0)), 1)
    : 1;

  const columns = [
    {
      key: "code",
      label: "Kode",
      sortable: true,
      render: (v: unknown) => (
        <span className="font-mono text-xs">{v as string}</span>
      ),
    },
    {
      key: "date",
      label: "Tanggal",
      sortable: true,
      render: (v: unknown) => formatDate(v as string),
    },
    {
      key: "customer.name",
      label: "Pelanggan",
      render: (_: unknown, row: Sale) => row.customer?.name || "-",
    },
    {
      key: "total",
      label: "Total",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => (
        <span className="font-semibold">{formatCurrency(v as number)}</span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Status",
      render: (v: unknown) => {
        const status = v as string;
        const variants: Record<string, "success" | "warning" | "danger" | "default"> = {
          PAID: "success",
          PARTIAL: "warning",
          PENDING: "default",
          CANCELLED: "danger",
        };
        const labels: Record<string, string> = {
          PAID: "Lunas",
          PARTIAL: "Sebagian",
          PENDING: "Tertunda",
          CANCELLED: "Batal",
        };
        return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
      },
    },
  ];

  return (
    <PageWrapper>
      {/* Toolbar — matches the Refresh / Video Tutorial / Pengingat Hutang Piutang row on the real Home page */}
      <div className="flex flex-wrap items-center gap-3 rounded border border-default bg-elevated p-3">
        <Button variant="outline" icon={RefreshCw} onClick={fetchData} loading={refreshing}>
          Refresh
        </Button>
        <Button variant="outline" icon={PlayCircle}>
          Video Tutorial
        </Button>
        <Button variant="outline" icon={BellRing}>
          Pengingat Hutang Piutang
        </Button>
        <span className="ml-auto text-[13px] text-toned">
          Informasi Exp. langganan : <span className="font-medium text-highlighted">30/12/2026</span>
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Penjualan"
          value={loading ? "-" : formatCurrency(stats?.totalSales || 0)}
          change="+12.5%"
          changeType="up"
          icon={TrendingUp}
          iconClassName="bg-success/10 text-success"
          href="/sale/list"
        />
        <StatCard
          title="Total Pembelian"
          value={loading ? "-" : formatCurrency(stats?.totalPurchases || 0)}
          change="+8.3%"
          changeType="up"
          icon={ShoppingCart}
          iconClassName="bg-info/10 text-info"
          href="/purchase/list"
        />
        <StatCard
          title="Laba Kotor"
          value={loading ? "-" : formatCurrency(stats?.grossProfit || 0)}
          change="+15.2%"
          changeType="up"
          icon={DollarSign}
          iconClassName="bg-highlight2/10 text-highlight2"
          href="/reports/profit"
        />
        <StatCard
          title="Stock Minim"
          value={loading ? "-" : formatNumber(stats?.lowStockCount || 0)}
          subtitle={`${stats?.outOfStockCount || 0} out of stock`}
          icon={AlertTriangle}
          iconClassName="bg-warning/10 text-warning"
          href="/inventory/minimum-stock"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/sale/pos">
          <Plus className="size-6 text-primary" />
          <span className="text-xs">Penjualan Baru</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/master/items">
          <Package className="size-6 text-primary" />
          <span className="text-xs">Produk</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/inventory/stock-in">
          <TrendingUp className="size-6 text-success" />
          <span className="text-xs">Barang Masuk</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/inventory/stock-out">
          <TrendingDown className="size-6 text-warning" />
          <span className="text-xs">Barang Keluar</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/reports/sale">
          <FileText className="size-6 text-info" />
          <span className="text-xs">Laporan</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/master/customers">
          <Users className="size-6 text-highlight2" />
          <span className="text-xs">Pelanggan</span>
        </Button>
      </div>

      {/* Chart & Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-highlighted">Penjualan vs Pembelian</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-sm bg-success" />
                <span className="text-muted">Penjualan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-sm bg-info" />
                <span className="text-muted">Pembelian</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-muted">
              <Coins className="mb-2 size-10" />
              <p className="text-sm">Tidak ada data untuk periode ini</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-1 h-48">
              {chartData.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-40 w-full items-end justify-center gap-0.5">
                    {d.purchases > 0 && (
                      <div
                        className="w-4 rounded-t-sm bg-info transition-all hover:bg-info/80"
                        style={{ height: `${Math.max((d.purchases / maxValue) * 100, 2)}%` }}
                        title={formatCurrency(d.purchases)}
                      />
                    )}
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

        {/* Summary */}
        <Card>
          <h3 className="mb-4 font-semibold text-highlighted">Ringkasan</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-default pb-3">
              <span className="text-sm text-muted">Total Produk</span>
              <span className="font-semibold">{formatNumber(stats?.totalProducts || 0)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-default pb-3">
              <span className="text-sm text-muted">Total Pelanggan</span>
              <span className="font-semibold">{formatNumber(stats?.totalCustomers || 0)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-default pb-3">
              <span className="text-sm text-muted">Piutang</span>
              <span className="font-semibold text-warning">{formatCurrency(stats?.totalReceivable || 0)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-default pb-3">
              <span className="text-sm text-muted">Hutang</span>
              <span className="font-semibold text-info">{formatCurrency(stats?.totalPayable || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-highlighted">Margin Laba</span>
              <span className="font-bold text-success">
                {stats?.totalSales && stats.totalSales > 0
                  ? ((stats.netProfit / stats.totalSales) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
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
      </Card>
    </PageWrapper>
  );
}
