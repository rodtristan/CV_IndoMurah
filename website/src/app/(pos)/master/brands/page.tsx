"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BrandForm } from "@/components/pos/master/BrandForm";
import type { Brand } from "@/types/pos";

const mockBrands: Brand[] = [
  { id: 1, name: "Indomie", description: "Mie instan nomor 1" },
  { id: 2, name: "Kopi Luwak", description: "Kopi premium Indonesia" },
  { id: 3, name: "Aqua", description: "Air mineral kemasan" },
  { id: 4, name: "Samsung", description: "Elektronik" },
  { id: 5, name: " Unilever", description: "Barang kebutuhan rumah tangga" },
];

export default function BrandsPage() {
  const [search, setSearch] = useState("");
  const [brands, setBrands] = useState<Brand[]>(mockBrands);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Nama Merek", sortable: true },
    { key: "description", label: "Deskripsi" },
    {
      key: "actions",
      label: "",
      align: "right" as const,
      render: (_: unknown, row: Brand) => (
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

  const filteredData = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditingBrand(null);
    setFormOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormOpen(true);
  };

  const handleSave = async (data: Partial<Brand>) => {
    if (editingBrand) {
      setBrands((prev) =>
        prev.map((b) => (b.id === editingBrand.id ? { ...b, ...data } : b))
      );
    } else {
      const newBrand: Brand = {
        ...data as Brand,
        id: Math.max(...brands.map((b) => b.id), 0) + 1,
      };
      setBrands((prev) => [...prev, newBrand]);
    }
    setFormOpen(false);
    setEditingBrand(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin hapus merek ini?")) {
      setBrands((prev) => prev.filter((b) => b.id !== id));
    }
  };

  return (
    <PageWrapper>
      <PageTitle
        title="Merek"
        subtitle="Kelola merek barang"
        actions={
          <Button icon={Plus} onClick={handleAdd}>
            Tambah Merek
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          icon={Plus}
          placeholder="Cari merek..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm"
        />
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        emptyMessage="Tidak ada merek"
      />

      <BrandForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingBrand(null);
        }}
        onSave={handleSave}
        initialData={editingBrand || undefined}
        isEditing={!!editingBrand}
      />
    </PageWrapper>
  );
}
