"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { useState } from "react";

const mockData = [
  { id: 1, code: "PAY001", date: "2024-09-10", type: "Pembayaran", reference: "BLI001", amount: 500000 },
];

export default function PurchasePaymentsPage() {
  const [search, setSearch] = useState("");
  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "date", label: "Tanggal", sortable: true },
    { key: "type", label: "Tipe" },
    { key: "reference", label: "Referensi" },
    { key: "amount", label: "Jumlah", align: "right" as const },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Daftar Pembayaran" subtitle="Kelola pembayaran pembelian" />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockData} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
