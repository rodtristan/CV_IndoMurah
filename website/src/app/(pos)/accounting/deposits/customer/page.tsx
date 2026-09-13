"use client";

import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Plus } from "lucide-react";
import { useState } from "react";

const mockData: Record<string, unknown>[] = [];

export default function CustomerDepositsPage() {
  const [search, setSearch] = useState("");
  const columns = [
    { key: "date", label: "Tanggal" },
    { key: "customerName", label: "Pelanggan" },
    { key: "amount", label: "Jumlah", align: "right" as const },
    { key: "remaining", label: "Sisa", align: "right" as const },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Deposit Pelanggan" subtitle="Kelola deposit pelanggan" actions={<Button icon={Plus}>Deposit Baru</Button>} />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockData} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
