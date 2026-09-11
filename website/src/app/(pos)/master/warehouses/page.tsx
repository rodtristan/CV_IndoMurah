"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { WarehouseForm } from "@/components/pos/master/WarehouseForm";
import type { Warehouse } from "@/types/pos";

const mockWarehouses: Warehouse[] = [
  { id: 1, code: "GD001", name: "Gudang Utama", address: "Jl. Gudang No. 1", isDefault: true },
  { id: 2, code: "GD002", name: "Gudang Cadangan", address: "Jl. Cadangan No. 2", isDefault: false },
  { id: 3, code: "GD003", name: "Gudang Branch", address: "Jl. Branch No. 3", isDefault: false },
];

export default function WarehousesPage() {
  const [search, setSearch] = useState("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
  const [formOpen, setFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "name", label: "Nama Gudang", sortable: true },
    { key: "address", label: "Alamat" },
    {
      key: "isDefault",
      label: "Default",
      render: (v: unknown) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            v ? "bg-purple-500/20 text-purple-400" : "bg-slate-500/20 text-slate-400"
          }`}
        >
          {v ? "Ya" : "Tidak"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "right" as const,
      render: (_: unknown, row: Warehouse) => (
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

  const filteredData = warehouses.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditingWarehouse(null);
    setFormOpen(true);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormOpen(true);
  };

  const handleSave = async (data: Partial<Warehouse>) => {
    if (editingWarehouse) {
      setWarehouses((prev) =>
        prev.map((w) => (w.id === editingWarehouse.id ? { ...w, ...data } : w))
      );
    } else {
      const newWarehouse: Warehouse = {
        ...data as Warehouse,
        id: Math.max(...warehouses.map((w) => w.id), 0) + 1,
        code: `GD${String(warehouses.length + 1).padStart(3, "0")}`,
      };
      setWarehouses((prev) => [...prev, newWarehouse]);
    }
    setFormOpen(false);
    setEditingWarehouse(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin hapus gudang ini?")) {
      setWarehouses((prev) => prev.filter((w) => w.id !== id));
    }
  };

  return (
    <PageWrapper>
      <PageTitle
        title="Gudang"
        subtitle="Kelola data gudang"
        actions={
          <Button icon={Plus} onClick={handleAdd}>
            Tambah Gudang
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          icon={Plus}
          placeholder="Cari gudang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm"
        />
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        emptyMessage="Tidak ada gudang"
      />

      <WarehouseForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingWarehouse(null);
        }}
        onSave={handleSave}
        initialData={editingWarehouse || undefined}
        isEditing={!!editingWarehouse}
      />
    </PageWrapper>
  );
}
