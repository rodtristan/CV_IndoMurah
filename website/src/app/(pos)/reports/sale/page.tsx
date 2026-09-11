"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { StatCard } from "@/components/pos/ui/StatCard";
import { DataTable } from "@/components/pos/ui/DataTable";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { useState } from "react";
import { mockSales } from "@/lib/mock-data-pos";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

export default function SaleReportPage() {
  const [search, setSearch] = useState("");
  const total = mockSales.reduce((sum, s) => sum + s.total, 0);
  const paid = mockSales.reduce((sum, s) => sum + s.paid, 0);
  const remaining = mockSales.reduce((sum, s) => sum + s.remaining, 0);
  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "date", label: "Tanggal", sortable: true },
    { key: "customerName", label: "Pelanggan" },
    { key: "total", label: "Total", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "paid", label: "Bayar", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "remaining", label: "Sisa", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Laporan Penjualan" subtitle="Laporan transaksi penjualan" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Penjualan" value={formatCurrency(total)} icon={<ShoppingCart className="size-5" />} />
        <StatCard title="Sudah Dibayar" value={formatCurrency(paid)} icon={<DollarSign className="size-5" />} />
        <StatCard title="Piutang" value={formatCurrency(remaining)} icon={<TrendingUp className="size-5" />} />
      </div>
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockSales} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
