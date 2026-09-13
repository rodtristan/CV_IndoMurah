"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Package,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Sale, Product, Customer } from "@/types/pos";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export default function DashboardPage() {
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const [todaySalesTotal, setTodaySalesTotal] = useState(0);
  const [todaySalesCount, setTodaySalesCount] = useState(0);
  const [todayPurchasesTotal, setTodayPurchasesTotal] = useState(0);
  const [todayPurchasesCount, setTodayPurchasesCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);

  // 7-day sales data for chart
  const [weeklySales, setWeeklySales] = useState<{ day: string; sales: number }[]>([]);
  const maxWeeklySales = weeklySales.length > 0 ? Math.max(...weeklySales.map(d => d.sales)) : 1;

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);

      // Fetch recent sales
      const salesRes = await api.getSales({
        $orderBy: { createdAt: 'desc' },
        $take: 10,
      });
      if (salesRes.success && salesRes.data) {
        setRecentSales(Array.isArray(salesRes.data) ? salesRes.data : []);
      }

      // Fetch all sales for stats
      const allSalesRes = await api.getSales({ $take: 1000 });
      if (allSalesRes.success && allSalesRes.data) {
        const allSales = Array.isArray(allSalesRes.data) ? allSalesRes.data as Sale[] : [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySales = allSales.filter((s) => {
          const saleDate = new Date(s.createdAt);
          saleDate.setHours(0, 0, 0, 0);
          return saleDate.getTime() === today.getTime();
        });

        setTodaySalesTotal(todaySales.reduce((sum, s) => sum + (s.total || 0), 0));
        setTodaySalesCount(todaySales.length);

        // Calculate 7-day sales
        const last7Days: { day: string; sales: number }[] = [];
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const dayStart = date.getTime();
          const dayEnd = dayStart + 86400000;

          const daySales = allSales.filter((s) => {
            const saleDate = new Date(s.createdAt).getTime();
            return saleDate >= dayStart && saleDate < dayEnd;
          });

          last7Days.push({
            day: dayNames[date.getDay()],
            sales: daySales.reduce((sum: number, s: Sale) => sum + (s.total || 0), 0),
          });
        }
        setWeeklySales(last7Days);
      }

      // Fetch products for stock info
      const productsRes = await api.getProducts({ $take: 1000 });
      if (productsRes.success && productsRes.data) {
        const products = Array.isArray(productsRes.data) ? productsRes.data as Product[] : [];
        setTotalProducts(productsRes.meta?.total || 0);
        setLowStockCount(products.filter((p) => p.minStock && p.stock < p.minStock).length);
      }

      // Fetch customers for receivable
      const customersRes = await api.getCustomers({ $take: 1000 });
      if (customersRes.success && customersRes.data) {
        const customers = Array.isArray(customersRes.data) ? customersRes.data : [];
        setTotalReceivable(customers.reduce((sum: number, c: any) => sum + (c.totalTransaction || 0), 0));
      }

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const columns = [
    { key: "code", label: "Kode", sortable: true },
    {
      key: "createdAt",
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
            status === 'PAID' ? "bg-green-100 text-green-700" :
            status === 'PARTIAL' ? "bg-orange-100 text-orange-700" :
            "bg-gray-100 text-gray-700"
          )}>
            {status === 'PAID' ? 'Lunas' : status === 'PARTIAL' ? 'Sebagian' : status === 'PENDING' ? 'Tertunda' : status}
          </span>
        );
      }
    },
  ];

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Dashboard"
        subtitle="Selamat datang di Toko IndoMurah"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="border-gray-300"
          >
            <RefreshCw className={cn("size-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      {/* Stats Cards - Ketoko Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Penjualan Hari Ini */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-600">Penjualan Hari Ini</span>
            <div className="p-2 bg-[#9C27B0]/10 rounded-lg">
              <DollarSign className="size-5 text-[#9C27B0]" />
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900 mb-1">{todaySalesCount} Transaksi</div>
          <div className="text-xl font-bold text-[#9C27B0]">{formatCurrency(todaySalesTotal)}</div>
        </div>

        {/* Pembelian Hari Ini */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-600">Pembelian Hari Ini</span>
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCart className="size-5 text-orange-600" />
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900 mb-1">{todayPurchasesCount} Transaksi</div>
          <div className="text-xl font-bold text-orange-600">{formatCurrency(todayPurchasesTotal)}</div>
        </div>

        {/* Total Item */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-600">Total Item</span>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="size-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(totalProducts)}</div>
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
          <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
          <div className="text-xs text-gray-500 mt-1">Items</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grafik Penjualan 7 Hari Terakhir */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Grafik Penjualan 7 Hari Terakhir</h3>
          </div>
          <div className="p-4">
            <div className="relative h-48 flex items-end justify-around gap-2 px-2">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400">
                <span>{formatCurrency(maxWeeklySales)}</span>
                <span>{formatCurrency(maxWeeklySales * 0.5)}</span>
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
                  const height = maxWeeklySales > 0 ? (data.sales / maxWeeklySales) * 100 : 0;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 group flex-1">
                      <div
                        className="w-full bg-[#9C27B0] rounded-t transition-all hover:bg-[#7B1FA2] cursor-pointer relative max-w-12"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                          {formatCurrency(data.sales)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{data.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Summary & Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Ringkasan & Aksi Cepat</h3>
          </div>
          <div className="p-4">
            {/* Summary */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Produk</span>
                <span className="font-semibold">{formatNumber(totalProducts)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Piutang</span>
                <span className="font-semibold text-orange-600">{formatCurrency(totalReceivable)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Hutang</span>
                <span className="font-semibold text-blue-600">{formatCurrency(totalPayable)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Item Minim Stock</span>
                <span className="font-semibold text-red-600">{lowStockCount}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
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
                    <div className="text-sm font-semibold text-gray-900">Pembelian</div>
                    <div className="text-xs text-gray-500">Catat pembelian</div>
                  </div>
                </div>
              </Link>
              <Link href="/inventory/stock-in">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="size-5 text-blue-600" />
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
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Transaksi Terbaru</h3>
          <Link href="/sale/list" className="text-sm text-[#9C27B0] hover:underline">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 text-left">
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Pelanggan</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : recentSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    Tidak ada transaksi
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">{sale.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(sale.createdAt)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#9C27B0]">{sale.customer?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(sale.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        sale.paymentStatus === 'PAID' ? "bg-green-100 text-green-700" :
                        sale.paymentStatus === 'PARTIAL' ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-700"
                      )}>
                        {sale.paymentStatus === 'PAID' ? 'Lunas' : sale.paymentStatus === 'PARTIAL' ? 'Sebagian' : 'Tertunda'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
