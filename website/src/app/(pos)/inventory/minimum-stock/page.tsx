"use client";

import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { mockProducts } from "@/lib/mock-data-pos";
import { cn } from "@/lib/utils";

export default function MinimumStockPage() {
  const [search, setSearch] = useState("");

  const lowStockItems = mockProducts
    .filter((p) => p.stock <= p.minStock)
    .map((p) => ({
      ...p,
      warehouseName: "Gudang Utama",
      shortage: p.minStock - p.stock,
    }));

  const columns = [
    { key: "code", label: "Kode" },
    { key: "name", label: "Nama Item" },
    { key: "warehouseName", label: "Gudang" },
    { key: "stock", label: "Stok Sekarang", align: "right" as const },
    { key: "minStock", label: "Min Stok", align: "right" as const },
    { key: "shortage", label: "Kekurangan", align: "right" as const },
  ];

  return (
    <PageWrapper>
      <PageTitle
        title="Stock Minimum"
        subtitle="Daftar item dengan stok di bawah minimum"
      />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari item..."
      />
      {lowStockItems.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-warning/10 px-4 py-3 text-warning">
          <AlertTriangle className="size-5" />
          <span className="text-sm font-medium">
            {lowStockItems.length} item memiliki stok di bawah minimum
          </span>
        </div>
      )}
      <DataTable data={lowStockItems} columns={columns} emptyMessage="Semua item memiliki stok yang cukup" />
    </PageWrapper>
  );
}
