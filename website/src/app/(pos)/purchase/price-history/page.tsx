"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { useState } from "react";

const mockData = [
  { id: 1, date: "2024-09-10", supplierName: "PT Sumber Makmur", productName: "Mie Instan", price: 28000 },
];

export default function PriceHistoryPage() {
  const [search, setSearch] = useState("");
  const columns = [
    { key: "date", label: "Tanggal", sortable: true },
    { key: "supplierName", label: "Supplier" },
    { key: "productName", label: "Produk" },
    { key: "price", label: "Harga", align: "right" as const },
  ];
  return (
    <PageWrapper>
      <PageTitle title="History Harga Beli" subtitle="Riwayat harga pembelian" />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockData} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
