"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { StatCard } from "@/components/pos/ui/StatCard";
import { DataTable } from "@/components/pos/ui/DataTable";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { TrendingDown, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { mockPurchases, mockSuppliers } from "@/lib/mock-data-pos";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

export default function DebtReportPage() {
  const [search, setSearch] = useState("");
  const totalDebt = mockPurchases.reduce((sum, p) => sum + p.remaining, 0);
  const columns = [
    { key: "supplierName", label: "Supplier" },
    { key: "total", label: "Total", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "paid", label: "Bayar", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "remaining", label: "Sisa Hutang", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Laporan Hutang" subtitle="Laporan hutang supplier" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard title="Total Hutang" value={formatCurrency(totalDebt)} icon={<TrendingDown className="size-5" />} />
        <StatCard title="Jumlah Supplier" value={mockSuppliers.length} icon={<AlertTriangle className="size-5" />} />
      </div>
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockPurchases} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
