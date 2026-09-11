"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Plus } from "lucide-react";
import { useState } from "react";

const mockStockOut = [
  { id: 1, code: "OUT001", date: "2024-09-10", warehouseName: "Gudang Utama", reference: "SO001", total: 3, createdBy: "admin" },
];

export default function StockOutPage() {
  const [search, setSearch] = useState("");

  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "date", label: "Tanggal", sortable: true },
    { key: "warehouseName", label: "Gudang" },
    { key: "reference", label: "Referensi" },
    { key: "total", label: "Jumlah Item", align: "right" as const },
  ];

  return (
    <PageWrapper>
      <PageTitle
        title="Item Keluar"
        subtitle="Kelola pengeluaran barang"
        actions={<Button icon={Plus}>Item Keluar Baru</Button>}
      />
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Cari..." />
      <DataTable data={mockStockOut} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
