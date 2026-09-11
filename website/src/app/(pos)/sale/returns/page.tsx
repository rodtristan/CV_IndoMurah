"use client";

import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Plus } from "lucide-react";
import { useState } from "react";

const mockData: Record<string, unknown>[] = [];

export default function SaleReturnsPage() {
  const [search, setSearch] = useState("");
  const columns = [
    { key: "code", label: "Kode" },
    { key: "date", label: "Tanggal" },
    { key: "customerName", label: "Pelanggan" },
    { key: "total", label: "Total", align: "right" as const },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Retur Penjualan" subtitle="Kelola retur penjualan" actions={<Button icon={Plus}>Retur Baru</Button>} />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockData} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
