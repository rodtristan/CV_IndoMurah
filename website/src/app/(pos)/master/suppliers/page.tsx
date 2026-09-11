"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SupplierForm } from "@/components/pos/master/SupplierForm";
import { mockSuppliers } from "@/lib/mock-data-pos";
import type { Supplier } from "@/types/pos";

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "name", label: "Nama Supplier", sortable: true },
    { key: "contactPerson", label: "Contact Person" },
    { key: "phone", label: "Telepon" },
    { key: "city", label: "Kota" },
    {
      key: "actions",
      label: "",
      align: "right" as const,
      render: (_: unknown, row: Supplier) => (
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
      )
    },
  ];

  const filteredData = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditingSupplier(null);
    setFormOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormOpen(true);
  };

  const handleSave = async (data: Partial<Supplier>) => {
    if (editingSupplier) {
      setSuppliers((prev) =>
        prev.map((s) => s.id === editingSupplier.id ? { ...s, ...data } : s)
      );
    } else {
      const newSupplier: Supplier = {
        ...data as Supplier,
        id: Math.max(...suppliers.map((s) => s.id), 0) + 1,
        code: data.code || "SUP" + String(suppliers.length + 1).padStart(3, "0"),
        createdAt: new Date().toISOString(),
      };
      setSuppliers((prev) => [...prev, newSupplier]);
    }
    setFormOpen(false);
    setEditingSupplier(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin hapus supplier ini?")) {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <PageWrapper>
      <PageTitle
        title="Supplier"
        subtitle="Kelola daftar supplier"
        actions={
          <Button icon={Plus} onClick={handleAdd}>
            Tambah Supplier
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          icon={Plus}
          placeholder="Cari supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm"
        />
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        emptyMessage="Tidak ada supplier"
      />

      <SupplierForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingSupplier(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        initialData={editingSupplier || undefined}
        isEditing={!!editingSupplier}
      />
    </PageWrapper>
  );
}
