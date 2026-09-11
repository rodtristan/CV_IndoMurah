"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Plus } from "lucide-react";
import { useState } from "react";

const mockData = [
  { id: 1, code: "PO001", date: "2024-09-10", supplierName: "PT Sumber Makmur", total: 500000, status: "draft" },
];

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState("");
  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "date", label: "Tanggal", sortable: true },
    { key: "supplierName", label: "Supplier" },
    { key: "total", label: "Total", align: "right" as const },
    { key: "status", label: "Status" },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Pesanan Pembelian" subtitle="Kelola pesanan pembelian" actions={<Button icon={Plus}>Pesanan Baru</Button>} />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockData} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
