"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Plus } from "lucide-react";
import { useState } from "react";
import { mockPurchases } from "@/lib/mock-data-pos";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function PurchaseListPage() {
  const [search, setSearch] = useState("");

  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "date", label: "Tanggal", sortable: true },
    { key: "supplierName", label: "Supplier" },
    { key: "total", label: "Total", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "paid", label: "Bayar", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "remaining", label: "Sisa", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "status", label: "Status", render: (v: unknown) => (
      <span className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        v === "paid" ? "bg-success/10 text-success" :
        v === "partial" ? "bg-warning/10 text-warning" : "bg-muted/10 text-muted"
      )}>
        {v === "paid" ? "Lunas" : v === "partial" ? "Sebagian" : "Tertunda"}
      </span>
    )},
  ];

  return (
    <PageWrapper>
      <PageTitle
        title="Daftar Pembelian"
        subtitle="Kelola transaksi pembelian"
        actions={<Button icon={Plus}>Pembelian Baru</Button>}
      />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari kode transaksi..."
      />
      <DataTable data={mockPurchases} columns={columns} emptyMessage="Tidak ada pembelian" />
    </PageWrapper>
  );
}
