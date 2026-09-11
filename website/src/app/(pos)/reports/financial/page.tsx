"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { StatCard } from "@/components/pos/ui/StatCard";
import { DollarSign, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { mockDashboardSummary } from "@/lib/mock-data-pos";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

export default function FinancialReportPage() {
  const { todaySales, receivables, payables } = mockDashboardSummary;
  return (
    <PageWrapper>
      <PageTitle title="Keuangan" subtitle="Laporan keuangan umum" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pendapatan" value={formatCurrency(todaySales.total)} icon={<TrendingUp className="size-5" />} />
        <StatCard title="Profit" value={formatCurrency(todaySales.profit)} icon={<DollarSign className="size-5" />} />
        <StatCard title="Total Piutang" value={formatCurrency(receivables.total)} icon={<TrendingDown className="size-5" />} />
        <StatCard title="Total Hutang" value={formatCurrency(payables.total)} icon={<Scale className="size-5" />} />
      </div>
    </PageWrapper>
  );
}
