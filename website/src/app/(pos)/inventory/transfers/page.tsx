"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Plus } from "lucide-react";
import { useState } from "react";

const mockTransfers = [
  { id: 1, code: "TRF001", date: "2024-09-08", fromWarehouse: "Gudang Utama", toWarehouse: "Gudang Cab. Bandung", total: 5, status: "received" },
];

export default function TransfersPage() {
  const [search, setSearch] = useState("");

  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "date", label: "Tanggal", sortable: true },
    { key: "fromWarehouse", label: "Dari" },
    { key: "toWarehouse", label: "Ke" },
    { key: "total", label: "Jumlah", align: "right" as const },
    { key: "status", label: "Status" },
  ];

  return (
    <PageWrapper>
      <PageTitle
        title="Transfer Item"
        subtitle="Kelola transfer antar gudang"
        actions={<Button icon={Plus}>Transfer Baru</Button>}
      />
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Cari..." />
      <DataTable data={mockTransfers} columns={columns} emptyMessage="Tidak ada transfer" />
    </PageWrapper>
  );
}
