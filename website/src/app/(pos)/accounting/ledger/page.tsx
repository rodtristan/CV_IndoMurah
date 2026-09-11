"use client";

import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { useState } from "react";

const mockData: Record<string, unknown>[] = [];

export default function LedgerPage() {
  const [search, setSearch] = useState("");
  const columns = [
    { key: "date", label: "Tanggal" },
    { key: "accountCode", label: "Kode Akun" },
    { key: "accountName", label: "Nama Akun" },
    { key: "description", label: "Keterangan" },
    { key: "debit", label: "Debit", align: "right" as const },
    { key: "credit", label: "Kredit", align: "right" as const },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Buku Besar" subtitle="Lihat buku besar" />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockData} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
