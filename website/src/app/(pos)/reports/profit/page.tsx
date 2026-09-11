"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { StatCard } from "@/components/pos/ui/StatCard";
import { TrendingUp, Percent, ShoppingCart } from "lucide-react";
import { mockDashboardSummary } from "@/lib/mock-data-pos";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

export default function ProfitReportPage() {
  const { todaySales } = mockDashboardSummary;
  const margin = todaySales.total > 0 ? (todaySales.profit / todaySales.total) * 100 : 0;
  return (
    <PageWrapper>
      <PageTitle title="Laba Jual" subtitle="Laporan laba rugi" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Penjualan" value={formatCurrency(todaySales.total)} icon={<ShoppingCart className="size-5" />} />
        <StatCard title="Total Profit" value={formatCurrency(todaySales.profit)} icon={<TrendingUp className="size-5" />} />
        <StatCard title="Margin" value={`${margin.toFixed(1)}%`} icon={<Percent className="size-5" />} />
      </div>
    </PageWrapper>
  );
}
