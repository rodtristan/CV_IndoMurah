"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { StatCard } from "@/components/pos/ui/StatCard";
import { DataTable } from "@/components/pos/ui/DataTable";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { mockSales, mockCustomers } from "@/lib/mock-data-pos";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

export default function ReceivableReportPage() {
  const [search, setSearch] = useState("");
  const totalReceivable = mockSales.reduce((sum, s) => sum + s.remaining, 0);
  const columns = [
    { key: "customerName", label: "Pelanggan" },
    { key: "total", label: "Total", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "paid", label: "Bayar", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "remaining", label: "Sisa Piutang", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Laporan Piutang" subtitle="Laporan piutang pelanggan" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard title="Total Piutang" value={formatCurrency(totalReceivable)} icon={<TrendingUp className="size-5" />} />
        <StatCard title="Jumlah Pelanggan" value={mockCustomers.length} icon={<Users className="size-5" />} />
      </div>
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockSales} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
