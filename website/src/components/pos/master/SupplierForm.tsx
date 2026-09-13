"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Supplier } from "@/types/pos";

interface SupplierFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Supplier>) => void;
  onDelete?: (id: number) => void;
  initialData?: Partial<Supplier>;
  isEditing?: boolean;
}

export function SupplierForm({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEditing,
}: SupplierFormProps) {
  const [formData, setFormData] = useState<Partial<Supplier> & { city?: string }>(
    initialData || {
      code: "",
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
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
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit Supplier" : "Tambah Supplier Baru"}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Kode */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kode *
              </label>
              <Input
                value={formData.code || ""}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="SUP001"
                className="w-full"
              />
            </div>

            {/* Nama */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama Supplier *
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nama supplier"
                className="w-full"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Contact Person
              </label>
              <Input
                value={formData.contactPerson || ""}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
                placeholder="Nama kontak"
                className="w-full"
              />
            </div>

            {/* Telepon */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Telepon
              </label>
              <Input
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="021-xxxx"
                className="w-full"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@supplier.com"
                className="w-full"
              />
            </div>

            {/* Kota */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kota
              </label>
              <Input
                value={(formData as any).city || ""}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value } as any)
                }
                placeholder="Jakarta"
                className="w-full"
              />
            </div>

            {/* Alamat */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Alamat
              </label>
              <textarea
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Alamat lengkap"
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              {isEditing && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => initialData?.id && onDelete(initialData.id)}
                >
                  Hapus Supplier
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isEditing ? "Simpan" : "Tambah"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
