"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Unit } from "@/types/pos";

interface UnitFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Unit>) => void;
  initialData?: Partial<Unit>;
  isEditing?: boolean;
}

export function UnitForm({
  open,
  onClose,
  onSave,
  initialData,
  isEditing,
}: UnitFormProps) {
  const [formData, setFormData] = useState<Partial<Unit>>(
    initialData || {
      name: "",
      abbreviation: "",
    }
  );

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit Satuan" : "Tambah Satuan Baru"}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nama Satuan *</label>
            <Input
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Dus, Packs"
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Singkatan *</label>
            <Input
              value={formData.abbreviation || ""}
              onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
              placeholder="Contoh: Dus, Pcs"
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              {isEditing ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
