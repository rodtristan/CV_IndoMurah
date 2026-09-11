"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UnitForm } from "@/components/pos/master/UnitForm";
import type { Unit } from "@/types/pos";

const mockUnits: Unit[] = [
  { id: 1, name: "Dus", abbreviation: "Dus" },
  { id: 2, name: "Pieces", abbreviation: "Pcs" },
  { id: 3, name: "Kilogram", abbreviation: "Kg" },
  { id: 4, name: "Liter", abbreviation: "L" },
  { id: 5, name: "Meter", abbreviation: "M" },
  { id: 6, name: "Pack", abbreviation: "Pack" },
];

export default function UnitsPage() {
  const [search, setSearch] = useState("");
  const [units, setUnits] = useState<Unit[]>(mockUnits);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Nama Satuan", sortable: true },
    { key: "abbreviation", label: "Singkatan" },
    {
      key: "actions",
      label: "",
      align: "right" as const,
      render: (_: unknown, row: Unit) => (
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

  const filteredData = units.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.abbreviation.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditingUnit(null);
    setFormOpen(true);
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormOpen(true);
  };

  const handleSave = async (data: Partial<Unit>) => {
    if (editingUnit) {
      setUnits((prev) =>
        prev.map((u) => (u.id === editingUnit.id ? { ...u, ...data } : u))
      );
    } else {
      const newUnit: Unit = {
        ...data as Unit,
        id: Math.max(...units.map((u) => u.id), 0) + 1,
      };
      setUnits((prev) => [...prev, newUnit]);
    }
    setFormOpen(false);
    setEditingUnit(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin hapus satuan ini?")) {
      setUnits((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <PageWrapper>
      <PageTitle
        title="Satuan"
        subtitle="Kelola satuan barang"
        actions={
          <Button icon={Plus} onClick={handleAdd}>
            Tambah Satuan
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          icon={Plus}
          placeholder="Cari satuan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm"
        />
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        emptyMessage="Tidak ada satuan"
      />

      <UnitForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingUnit(null);
        }}
        onSave={handleSave}
        initialData={editingUnit || undefined}
        isEditing={!!editingUnit}
      />
    </PageWrapper>
  );
}
