"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { SalesPerson } from "@/types/pos";

interface SalesFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<SalesPerson>) => void;
  initialData?: Partial<SalesPerson>;
  isEditing?: boolean;
}

export function SalesForm({
  open,
  onClose,
  onSave,
  initialData,
  isEditing,
}: SalesFormProps) {
  const [formData, setFormData] = useState<Partial<SalesPerson>>(
    initialData || {
      name: "",
      phone: "",
      email: "",
      isActive: true,
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
            {isEditing ? "Edit Sales" : "Tambah Sales Baru"}
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
              Nama Sales *
            </label>
            <Input
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: Ahmad Fauzi"
              className="w-full bg-slate-800 text-white placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Telepon
            </label>
            <Input
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Contoh: 0812-3456-7890"
              className="w-full bg-slate-800 text-white placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Email
            </label>
            <Input
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Contoh: sales@email.com"
              className="w-full bg-slate-800 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive ?? true}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="size-4 rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-sm text-slate-300">
              Sales Aktif
            </label>
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
