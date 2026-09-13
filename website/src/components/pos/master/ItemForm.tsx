"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Product } from "@/types/pos";

interface ItemFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
  onDelete?: (id: number) => void;
  initialData?: Partial<Product>;
  isEditing?: boolean;
}

export function ItemForm({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEditing,
}: ItemFormProps) {
  const [formData, setFormData] = useState<Partial<Product> & { categoryName?: string; unitName?: string; brandName?: string }>(
    initialData || {
      code: "",
      name: "",
      categoryId: 0,
      unitId: 0,
      brandId: 0,
      purchasePrice: 0,
      sellingPrice: 0,
      sellPrice: 0,
      discountPercent: 0,
      stock: 0,
      minStock: 0,
      minimumStock: 0,
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
            {isEditing ? "Edit Item" : "Tambah Item Baru"}
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
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kode *
              </label>
              <Input
                value={formData.code || ""}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="BRG001"
                className="w-full"
              />
            </div>

            {/* Nama */}
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama Item *
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nama item"
                className="w-full"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kategori
              </label>
              <select
                value={formData.categoryId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: Number(e.target.value) })
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Pilih Kategori</option>
                <option value="1">Makanan</option>
                <option value="2">Minuman</option>
                <option value="3">Snack</option>
              </select>
            </div>

            {/* Satuan */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Satuan
              </label>
              <select
                value={formData.unitId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, unitId: Number(e.target.value) })
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Pilih Satuan</option>
                <option value="1">Dus</option>
                <option value="2">Pcs</option>
                <option value="3">Kg</option>
              </select>
            </div>

            {/* Harga Beli */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Harga Beli
              </label>
              <Input
                type="number"
                value={formData.purchasePrice || ""}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: Number(e.target.value) })
                }
                placeholder="0"
                className="w-full"
              />
            </div>

            {/* Harga Jual */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Harga Jual
              </label>
              <Input
                type="number"
                value={formData.sellPrice || ""}
                onChange={(e) =>
                  setFormData({ ...formData, sellPrice: Number(e.target.value) })
                }
                placeholder="0"
                className="w-full"
              />
            </div>

            {/* Stok */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Stok
              </label>
              <Input
                type="number"
                value={formData.stock || ""}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
                placeholder="0"
                className="w-full"
              />
            </div>

            {/* Min Stok */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Min. Stok
              </label>
              <Input
                type="number"
                value={formData.minStock || ""}
                onChange={(e) =>
                  setFormData({ ...formData, minStock: Number(e.target.value) })
                }
                placeholder="0"
                className="w-full"
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
                  Hapus Item
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
