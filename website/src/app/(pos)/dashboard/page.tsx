"use client";

import {
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/pos/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import {
  mockDashboardSummary,
  mockRecentTransactions,
  mockSalesChartData,
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

export default function POSDashboardPage() {
  const { todaySales, inventory, receivables } = mockDashboardSummary;
  const lowStockItems = mockProducts.filter((p) => p.stock <= p.minStock).slice(0, 5);

  return (
    <PageWrapper>
      <PageTitle
        title="Dashboard"
        subtitle="Selamat datang di sistem POS"
      />

      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Penjualan Hari Ini"
          value={formatIDR(todaySales.total)}
          icon={<DollarSign className="size-5" />}
          trend={{ value: 12.5, label: "vs yesterday" }}
        />
        <StatCard
          title="Transaksi Hari Ini"
          value={todaySales.count.toString()}
          icon={<ShoppingCart className="size-5" />}
          trend={{ value: 8.2, label: "vs yesterday" }}
        />
        <StatCard
          title="Total Items"
          value={inventory.totalItems.toString()}
          icon={<Package className="size-5" />}
        />
        <StatCard
          title="Piutang"
          value={formatIDR(receivables.total)}
          icon={<TrendingUp className="size-5" />}
          trend={{ value: -3.1, label: "vs last week" }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Chart */}
        <div className="lg:col-span-2 rounded-lg border border-default bg-bg p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-highlighted">Grafik Penjualan</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-primary" />
                <span className="text-muted">Penjualan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-success" />
                <span className="text-muted">Profit</span>
              </div>
            </div>
          </div>

          <div className="h-64">
            <div className="flex h-full items-end justify-between gap-2">
              {mockSalesChartData.map((data, index) => {
                const maxSales = Math.max(...mockSalesChartData.map((d) => d.sales));
                const height = (data.sales / maxSales) * 100;
                return (
                  <div key={index} className="group relative flex flex-1 flex-col items-center">
                    <div
                      className="w-full rounded-t bg-primary/20 transition-all hover:bg-primary/30"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-inverted px-2 py-1 text-xs text-inverted-text opacity-0 shadow transition-opacity group-hover:opacity-100">
                        {formatIDR(data.sales)}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted">{data.date.split("-")[2]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-default bg-bg p-6">
          <h2 className="mb-4 text-lg font-semibold text-highlighted">Aksi Cepat</h2>
          <div className="space-y-3">
            <Link href="/sale/pos" className="block">
              <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4 text-primary transition-all hover:bg-primary/20">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="size-6" />
                  <div>
                    <div className="font-medium">Kasir POS</div>
                    <div className="text-sm text-primary/70">Mulai transaksi baru</div>
                  </div>
                </div>
                <ArrowRight className="size-5" />
              </div>
            </Link>

            <Link href="/purchase/list/new" className="block">
              <div className="flex items-center justify-between rounded-lg bg-elevated p-4 text-toned transition-all hover:bg-default">
                <div className="flex items-center gap-3">
                  <DollarSign className="size-6" />
                  <div>
                    <div className="font-medium">Pembelian Baru</div>
                    <div className="text-sm text-muted">Catat pembelian</div>
                  </div>
                </div>
                <ArrowRight className="size-5" />
              </div>
            </Link>

            <Link href="/inventory/stock-in" className="block">
              <div className="flex items-center justify-between rounded-lg bg-elevated p-4 text-toned transition-all hover:bg-default">
                <div className="flex items-center gap-3">
                  <Package className="size-6" />
                  <div>
                    <div className="font-medium">Item Masuk</div>
                    <div className="text-sm text-muted">Terima barang</div>
                  </div>
                </div>
                <ArrowRight className="size-5" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <div className="rounded-lg border border-default bg-bg">
          <div className="flex items-center justify-between border-b border-default px-6 py-4">
            <h2 className="text-lg font-semibold text-highlighted">Transaksi Terakhir</h2>
            <Link href="/sale/list">
              <Button variant="ghost" size="sm">Lihat Semua</Button>
            </Link>
          </div>
          <div className="divide-y divide-default">
            {mockRecentTransactions.map((trx) => (
              <div key={trx.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex size-10 items-center justify-center rounded-full",
                    trx.type === "sale" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  )}>
                    {trx.type === "sale" ? <ArrowUpRight className="size-5" /> : <ArrowDownRight className="size-5" />}
                  </div>
                  <div>
                    <div className="font-medium text-highlighted">{trx.code}</div>
                    <div className="text-sm text-muted">{trx.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-highlighted">{formatIDR(trx.total)}</div>
                  <div className={cn(
                    "text-sm",
                    trx.status === "paid" ? "text-success" : trx.status === "partial" ? "text-warning" : "text-muted"
                  )}>
                    {trx.status === "paid" ? "Lunas" : trx.status === "partial" ? "Sebagian" : "Tertunda"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="rounded-lg border border-default bg-bg">
          <div className="flex items-center justify-between border-b border-default px-6 py-4">
            <h2 className="text-lg font-semibold text-highlighted">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-warning" />
                Stok Rendah
              </div>
            </h2>
            <Link href="/inventory/minimum-stock">
              <Button variant="ghost" size="sm">Lihat Semua</Button>
            </Link>
          </div>
          <div className="divide-y divide-default">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <div className="font-medium text-highlighted">{item.name}</div>
                  <div className="text-sm text-muted">{item.code} • {item.categoryName}</div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "font-medium",
                    item.stock === 0 ? "text-error" : "text-warning"
                  )}>
                    {item.stock} {item.unitName}
                  </div>
                  <div className="text-sm text-muted">Min: {item.minStock}</div>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="px-6 py-8 text-center text-muted">
                Semua item memiliki stok yang cukup
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
