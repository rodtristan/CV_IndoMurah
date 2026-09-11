"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { StatCard } from "@/components/pos/ui/StatCard";
import { DataTable } from "@/components/pos/ui/DataTable";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { DollarSign, ShoppingCart, TrendingDown } from "lucide-react";
import { useState } from "react";
import { mockPurchases } from "@/lib/mock-data-pos";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

export default function PurchaseReportPage() {
  const [search, setSearch] = useState("");
  const total = mockPurchases.reduce((sum, p) => sum + p.total, 0);
  const paid = mockPurchases.reduce((sum, p) => sum + p.paid, 0);
  const remaining = mockPurchases.reduce((sum, p) => sum + p.remaining, 0);
  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "date", label: "Tanggal", sortable: true },
    { key: "supplierName", label: "Supplier" },
    { key: "total", label: "Total", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "paid", label: "Bayar", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "remaining", label: "Sisa", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Laporan Pembelian" subtitle="Laporan transaksi pembelian" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Pembelian" value={formatCurrency(total)} icon={<ShoppingCart className="size-5" />} />
        <StatCard title="Sudah Dibayar" value={formatCurrency(paid)} icon={<DollarSign className="size-5" />} />
        <StatCard title="Hutang Supplier" value={formatCurrency(remaining)} icon={<TrendingDown className="size-5" />} />
      </div>
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockPurchases} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
