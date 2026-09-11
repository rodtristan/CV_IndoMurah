"use client";

import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { useState } from "react";

const mockData: Record<string, unknown>[] = [];

export default function SalePriceHistoryPage() {
  const [search, setSearch] = useState("");
  const columns = [
    { key: "date", label: "Tanggal" },
    { key: "customerName", label: "Pelanggan" },
    { key: "productName", label: "Produk" },
    { key: "price", label: "Harga", align: "right" as const },
  ];
  return (
    <PageWrapper>
      <PageTitle title="History Harga Jual" subtitle="Riwayat harga penjualan" />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockData} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
