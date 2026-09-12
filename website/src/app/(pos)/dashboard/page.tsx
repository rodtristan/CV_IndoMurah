"use client";

import {
  ShoppingCart,
  DollarSign,
  Package,
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

// Format currency helper
const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

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
              </div>
            </div>
          </div>
        </div>

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
            </div>
          </div>
        </div>

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
        </div>
      </div>
    </PageWrapper>
  );
}
