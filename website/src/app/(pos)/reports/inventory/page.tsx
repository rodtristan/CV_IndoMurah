"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { StatCard } from "@/components/pos/ui/StatCard";
import { DataTable } from "@/components/pos/ui/DataTable";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Package, AlertTriangle, DollarSign } from "lucide-react";
import { useState } from "react";
import { mockProducts, mockDashboardSummary } from "@/lib/mock-data-pos";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

export default function InventoryReportPage() {
  const [search, setSearch] = useState("");
  const { inventory } = mockDashboardSummary;
  const columns = [
    { key: "code", label: "Kode" },
    { key: "name", label: "Nama Item" },
    { key: "categoryName", label: "Kategori" },
    { key: "stock", label: "Stok", align: "right" as const },
    { key: "sellPrice", label: "Harga Jual", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Laporan Persediaan" subtitle="Laporan stok persediaan" />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard title="Total Item" value={inventory.totalItems} icon={<Package className="size-5" />} />
        <StatCard title="Stok Rendah" value={inventory.lowStock} icon={<AlertTriangle className="size-5" />} />
        <StatCard title="Stok Habis" value={inventory.outOfStock} icon={<AlertTriangle className="size-5" />} />
        <StatCard title="Total Nilai" value={formatCurrency(inventory.totalValue)} icon={<DollarSign className="size-5" />} />
      </div>
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockProducts} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
