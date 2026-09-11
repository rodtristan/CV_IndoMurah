"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ItemForm } from "@/components/pos/master/ItemForm";
import { mockProducts } from "@/lib/mock-data-pos";
import type { Product } from "@/types/pos";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function ItemsPage() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Product[]>(mockProducts);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "name", label: "Nama Item", sortable: true },
    { key: "categoryName", label: "Kategori" },
    { key: "unitName", label: "Satuan" },
    {
      key: "purchasePrice", label: "Harga Beli", align: "right" as const,
      render: (v: unknown) => formatCurrency(v as number)
    },
    {
      key: "sellPrice", label: "Harga Jual", align: "right" as const,
      render: (v: unknown) => formatCurrency(v as number)
    },
    {
      key: "stock", label: "Stok", align: "right" as const,
      render: (v: unknown, row: Product) => (
        <span className={cn(
          "font-medium",
          v === 0 ? "text-red-400" :
          v as number <= (row as Product).minStock ? "text-amber-400" : "text-slate-300"
        )}>
          {v as number}
        </span>
      )
    },
    {
      key: "actions",
      label: "",
      align: "right" as const,
      render: (_: unknown, row: Product) => (
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

  const filteredData = items.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: Product) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSave = async (data: Partial<Product>) => {
    if (editingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...data } : item
        )
      );
    } else {
      const newItem: Product = {
        ...data as Product,
        id: Math.max(...items.map((i) => i.id), 0) + 1,
        code: data.code || "BRG" + String(items.length + 1).padStart(3, "0"),
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      setItems((prev) => [...prev, newItem]);
    }
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin hapus item ini?")) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <PageWrapper>
      <PageTitle
        title="Item / Barang"
        subtitle="Kelola daftar item barang dagangan"
        actions={
          <Button icon={Plus} onClick={handleAdd}>
            Tambah Item
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          icon={Plus}
          placeholder="Cari kode atau nama item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm"
        />
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        emptyMessage="Tidak ada item"
      />

      <ItemForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        initialData={editingItem || undefined}
        isEditing={!!editingItem}
      />
    </PageWrapper>
  );
}
