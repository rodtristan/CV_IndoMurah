"use client";

import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { useState } from "react";

const mockData: Record<string, unknown>[] = [];

export default function SalePaymentsPage() {
  const [search, setSearch] = useState("");
  const columns = [
    { key: "code", label: "Kode" },
    { key: "date", label: "Tanggal" },
    { key: "customerName", label: "Pelanggan" },
    { key: "amount", label: "Jumlah", align: "right" as const },
    { key: "method", label: "Metode" },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Daftar Pembayaran" subtitle="Kelola pembayaran penjualan" />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockData} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
