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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? "Edit Satuan" : "Tambah Satuan Baru"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Nama Satuan *
            </label>
            <Input
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: Dus, Packs, Botol"
              className="w-full bg-slate-800 text-white placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Singkatan *
            </label>
            <Input
              value={formData.abbreviation || ""}
              onChange={(e) =>
                setFormData({ ...formData, abbreviation: e.target.value })
              }
              placeholder="Contoh: Dus, Pcs, Botol"
              className="w-full bg-slate-800 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400"
            >
              {isEditing ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
