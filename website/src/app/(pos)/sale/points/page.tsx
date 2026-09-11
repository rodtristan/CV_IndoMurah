"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { useState } from "react";
import { mockCustomers } from "@/lib/mock-data-pos";

export default function SalePointsPage() {
  const [search, setSearch] = useState("");
  const columns = [
    { key: "code", label: "Kode" },
    { key: "name", label: "Nama Pelanggan" },
    { key: "customerType", label: "Tipe" },
    { key: "pointBalance", label: "Saldo Poin", align: "right" as const },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Point Penjualan" subtitle="Kelola point pelanggan" />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockCustomers} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
