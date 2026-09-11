"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Plus } from "lucide-react";
import { useState } from "react";

const mockStockIn = [
  { id: 1, code: "IN001", date: "2024-09-10", warehouseName: "Gudang Utama", reference: "PO001", total: 5, createdBy: "admin" },
  { id: 2, code: "IN002", date: "2024-09-09", warehouseName: "Gudang Utama", reference: "PO002", total: 10, createdBy: "admin" },
];

export default function StockInPage() {
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
        title="Item Masuk"
        subtitle="Kelola penerimaan barang"
        actions={<Button icon={Plus}>Item Masuk Baru</Button>}
      />
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Cari..." />
      <DataTable data={mockStockIn} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
