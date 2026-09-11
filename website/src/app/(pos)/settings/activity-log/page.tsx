"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { useState } from "react";

const mockLogs = [
  { id: 1, datetime: "2024-09-10 15:30:00", user: "admin", action: "Login", description: "Login ke sistem" },
  { id: 2, datetime: "2024-09-10 15:35:00", user: "admin", action: "Create", description: "Menambah item baru: Mie Instan" },
  { id: 3, datetime: "2024-09-10 16:00:00", user: "admin", action: "Update", description: "Update stok item" },
];

export default function ActivityLogPage() {
  const [search, setSearch] = useState("");
  const columns = [
    { key: "datetime", label: "Waktu", sortable: true },
    { key: "user", label: "User" },
    { key: "action", label: "Aksi" },
    { key: "description", label: "Deskripsi" },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Log Aktivitas" subtitle="Riwayat aktivitas user" />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockLogs} columns={columns} emptyMessage="Tidak ada log" />
    </PageWrapper>
  );
}
