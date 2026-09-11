"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Plus } from "lucide-react";
import { useState } from "react";

const mockUsers = [
  { id: 1, fullName: "Administrator", email: "admin@tokocvindomurah.com", role: "Admin", isActive: true },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const columns = [
    { key: "fullName", label: "Nama", sortable: true },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "isActive", label: "Status", render: (v: unknown) => v ? "Aktif" : "Nonaktif" },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Data User" subtitle="Kelola user sistem" actions={<Button icon={Plus}>Tambah User</Button>} />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable data={mockUsers} columns={columns} emptyMessage="Tidak ada user" />
    </PageWrapper>
  );
}
