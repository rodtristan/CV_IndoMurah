"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SalesForm } from "@/components/pos/master/SalesForm";
import type { SalesPerson } from "@/types/pos";

const mockSales: SalesPerson[] = [
  { id: 1, code: "SL001", name: "Ahmad Fauzi", phone: "0812-3456-7890", email: "ahmad@email.com", isActive: true },
  { id: 2, code: "SL002", name: "Rina Marlina", phone: "0813-9876-5432", email: "rina@email.com", isActive: true },
  { id: 3, code: "SL003", name: "Budi Santoso", phone: "0814-5555-4444", email: "budi@email.com", isActive: true },
  { id: 4, code: "SL004", name: "Siti Aminah", phone: "0815-6666-7777", email: "siti@email.com", isActive: false },
];

export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState<SalesPerson[]>(mockSales);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSales, setEditingSales] = useState<SalesPerson | null>(null);

  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "name", label: "Nama Sales", sortable: true },
    { key: "phone", label: "Telepon" },
    { key: "email", label: "Email" },
    {
      key: "isActive",
      label: "Status",
      render: (v: unknown) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            v ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}
        >
          {v ? "Aktif" : "Nonaktif"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "right" as const,
      render: (_: unknown, row: SalesPerson) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleEdit(row)}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-purple-400"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-red-400"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredData = sales.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditingSales(null);
    setFormOpen(true);
  };

  const handleEdit = (salesPerson: SalesPerson) => {
    setEditingSales(salesPerson);
    setFormOpen(true);
  };

  const handleSave = async (data: Partial<SalesPerson>) => {
    if (editingSales) {
      setSales((prev) =>
        prev.map((s) => (s.id === editingSales.id ? { ...s, ...data } : s))
      );
    } else {
      const newSales: SalesPerson = {
        ...data as SalesPerson,
        id: Math.max(...sales.map((s) => s.id), 0) + 1,
        code: `SL${String(sales.length + 1).padStart(3, "0")}`,
      };
      setSales((prev) => [...prev, newSales]);
    }
    setFormOpen(false);
    setEditingSales(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin hapus sales ini?")) {
      setSales((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <PageWrapper>
      <PageTitle
        title="Sales"
        subtitle="Kelola data sales"
        actions={
          <Button icon={Plus} onClick={handleAdd}>
            Tambah Sales
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          icon={Plus}
          placeholder="Cari sales..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm"
        />
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        emptyMessage="Tidak ada sales"
      />

      <SalesForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingSales(null);
        }}
        onSave={handleSave}
        initialData={editingSales || undefined}
        isEditing={!!editingSales}
      />
    </PageWrapper>
  );
}
