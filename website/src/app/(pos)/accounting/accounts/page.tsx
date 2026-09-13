"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Plus } from "lucide-react";
import { useState } from "react";

const mockAccounts = [
  { id: 1, code: "1-1000", name: "Kas", type: "asset", isActive: true },
  { id: 2, code: "1-1100", name: "Piutang", type: "asset", isActive: true },
  { id: 3, code: "2-1000", name: "Hutang", type: "liability", isActive: true },
  { id: 4, code: "4-1000", name: "Penjualan", type: "revenue", isActive: true },
  { id: 5, code: "5-1000", name: "Harga Pokok Penjualan", type: "expense", isActive: true },
];

export default function AccountsPage() {
  const [search, setSearch] = useState("");
  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "name", label: "Nama Akun", sortable: true },
    { key: "type", label: "Tipe" },
    { key: "isActive", label: "Status", render: (v: unknown) => v ? "Aktif" : "Nonaktif" },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Daftar Perkiraan" subtitle="Kelola chart of accounts" actions={<Button icon={Plus}>Akun Baru</Button>} />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockAccounts} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
