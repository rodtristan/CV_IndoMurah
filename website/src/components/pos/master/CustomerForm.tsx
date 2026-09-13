"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Customer } from "@/types/pos";

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Customer>) => void;
  onDelete?: (id: number) => void;
  initialData?: Partial<Customer>;
  isEditing?: boolean;
}

export function CustomerForm({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEditing,
}: CustomerFormProps) {
  const [formData, setFormData] = useState<Partial<Customer>>(
    initialData || {
      code: "",
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      customerType: "retail",
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
            {isEditing ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
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
                placeholder="CST001"
                className="w-full"
              />
            </div>

            {/* Nama */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama Pelanggan *
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nama pelanggan"
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
                placeholder="0812-xxxx-xxxx"
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
                placeholder="email@pelanggan.com"
                className="w-full"
              />
            </div>

            {/* Tipe */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tipe Pelanggan
              </label>
              <select
                value={formData.customerType || "retail"}
                onChange={(e) =>
                  setFormData({ ...formData, customerType: e.target.value as "retail" | "wholesale" | "vip" })
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="retail">Retail</option>
                <option value="wholesale">Grosir</option>
                <option value="vip">VIP</option>
              </select>
            </div>

            {/* Kota */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kota
              </label>
              <Input
                value={formData.city || ""}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
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
                  Hapus Pelanggan
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
