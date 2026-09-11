"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CategoryForm } from "@/components/pos/master/CategoryForm";
import type { Category } from "@/types/pos";

const mockCategories: Category[] = [
  { id: 1, name: "Makanan", description: "Semua produk makanan", createdAt: "2024-01-01" },
  { id: 2, name: "Minuman", description: "Semua produk minuman", createdAt: "2024-01-01" },
  { id: 3, name: "Snack", description: "Makanan ringan", createdAt: "2024-01-01" },
  { id: 4, name: "Elektronik", description: "Produk elektronik", createdAt: "2024-01-01" },
  { id: 5, name: "Perlengkapan", description: "Alat dan perlengkapan", createdAt: "2024-01-01" },
];

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Nama Kategori", sortable: true },
    { key: "description", label: "Deskripsi" },
    {
      key: "actions",
      label: "",
      align: "right" as const,
      render: (_: unknown, row: Category) => (
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

  const filteredData = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleSave = async (data: Partial<Category>) => {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...c, ...data } : c))
      );
    } else {
      const newCategory: Category = {
        ...data as Category,
        id: Math.max(...categories.map((c) => c.id), 0) + 1,
        createdAt: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCategory]);
    }
    setFormOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin hapus kategori ini?")) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <PageWrapper>
      <PageTitle
        title="Kategori / Jenis Barang"
        subtitle="Kelola jenis/kategori barang"
        actions={
          <Button icon={Plus} onClick={handleAdd}>
            Tambah Kategori
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          icon={Plus}
          placeholder="Cari kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm"
        />
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        emptyMessage="Tidak ada kategori"
      />

      <CategoryForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSave}
        initialData={editingCategory || undefined}
        isEditing={!!editingCategory}
      />
    </PageWrapper>
  );
}
