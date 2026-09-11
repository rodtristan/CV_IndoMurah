"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Plus } from "lucide-react";
import { useState } from "react";

const mockStockOpname = [
  { id: 1, code: "SO001", date: "2024-09-01", warehouseName: "Gudang Utama", notes: "Stock opname bulanan", status: "completed", createdBy: "admin" },
];

export default function StockOpnamePage() {
  const [search, setSearch] = useState("");

  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "date", label: "Tanggal", sortable: true },
    { key: "warehouseName", label: "Gudang" },
    { key: "status", label: "Status" },
  ];

  return (
    <PageWrapper>
      <PageTitle
        title="Stock Opname"
        subtitle="Kelola stock opname"
        actions={<Button icon={Plus}>Stock Opname Baru</Button>}
      />
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Cari..." />
      <DataTable data={mockStockOpname} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
