"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Warehouse } from "@/types/pos";

interface WarehouseFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Warehouse>) => void;
  initialData?: Partial<Warehouse>;
  isEditing?: boolean;
}

export function WarehouseForm({
  open,
  onClose,
  onSave,
  initialData,
  isEditing,
}: WarehouseFormProps) {
  const [formData, setFormData] = useState<Partial<Warehouse>>(
    initialData || {
      name: "",
      address: "",
      isDefault: false,
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
            {isEditing ? "Edit Gudang" : "Tambah Gudang Baru"}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nama Gudang *</label>
            <Input
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Gudang Utama"
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Alamat</label>
            <textarea
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat gudang"
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault ?? false}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">Gudang Default</label>
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
