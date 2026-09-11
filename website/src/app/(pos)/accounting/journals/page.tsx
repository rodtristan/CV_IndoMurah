"use client";

import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Plus } from "lucide-react";
import { useState } from "react";

const mockData: Record<string, unknown>[] = [];

export default function JournalsPage() {
  const [search, setSearch] = useState("");
  const columns = [
    { key: "code", label: "Kode" },
    { key: "date", label: "Tanggal" },
    { key: "description", label: "Keterangan" },
    { key: "totalDebit", label: "Total Debit", align: "right" as const },
    { key: "totalCredit", label: "Total Kredit", align: "right" as const },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Daftar Jurnal" subtitle="Kelola jurnal umum" actions={<Button icon={Plus}>Jurnal Baru</Button>} />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockData} columns={columns} emptyMessage="Tidak ada data" />
    </PageWrapper>
  );
}
