"use client";

import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Plus } from "lucide-react";
import { useState } from "react";

const mockData: Record<string, unknown>[] = [];

export default function CashInPage() {
  const [search, setSearch] = useState("");
  const columns = [
    { key: "code", label: "Kode" },
    { key: "date", label: "Tanggal" },
    { key: "accountName", label: "Akun" },
    { key: "description", label: "Keterangan" },
    { key: "amount", label: "Jumlah", align: "right" as const },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Kas Masuk" subtitle="Kelola kas masuk" actions={<Button icon={Plus}>Kas Masuk Baru</Button>} />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockData} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
