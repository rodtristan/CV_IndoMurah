"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    code: initialData?.code || "",
    barcode: initialData?.barcode || "",
    name: initialData?.name || "",
    categoryId: initialData?.categoryId,
    categoryName: initialData?.categoryName,
    unitId: initialData?.unitId || 1,
    unitName: initialData?.unitName || "Pcs",
    brandId: initialData?.brandId,
    brandName: initialData?.brandName,
    purchasePrice: initialData?.purchasePrice || 0,
    sellPrice: initialData?.sellPrice || 0,
    stock: initialData?.stock || 0,
    minStock: initialData?.minStock || 0,
    warehouseId: initialData?.warehouseId || 1,
    isActive: initialData?.isActive ?? true,
  });

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Product, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? "Edit Item" : "Tambah Item Baru"}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Kode */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Kode Item *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="BRG001"
                required
              />
            </div>

            {/* Barcode */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Barcode</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => handleChange("barcode", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="8991234567890"
              />
            </div>

            {/* Nama Item */}
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-sm font-medium text-slate-300">Nama Item *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="Mie Instan Goreng"
                required
              />
            </div>

            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Kategori</label>
              <select
                value={formData.categoryId || ""}
                onChange={(e) => handleChange("categoryId", parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="">Pilih Kategori</option>
                <option value="1">Makanan</option>
                <option value="2">Minuman</option>
                <option value="3">Snack</option>
                <option value="4">Bumbu</option>
                <option value="5">Sembako</option>
              </select>
            </div>

            {/* Satuan */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Satuan *</label>
              <select
                value={formData.unitId || 1}
                onChange={(e) => handleChange("unitId", parseInt(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="1">Pcs</option>
                <option value="2">Dus</option>
                <option value="3">Kg</option>
                <option value="4">Liter</option>
                <option value="5">Meter</option>
              </select>
            </div>

            {/* Merek */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Merek</label>
              <select
                value={formData.brandId || ""}
                onChange={(e) => handleChange("brandId", parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="">Pilih Merek</option>
                <option value="1">Indomie</option>
                <option value="2">Kopi Luwak</option>
                <option value="3">Lux</option>
                <option value="4">Sunco</option>
                <option value="5">Gulaku</option>
              </select>
            </div>

            {/* Gudang */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Gudang Default</label>
              <select
                value={formData.warehouseId || 1}
                onChange={(e) => handleChange("warehouseId", parseInt(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="1">Gudang Utama</option>
                <option value="2">Gudang Cab. Bandung</option>
              </select>
            </div>

            {/* Harga Beli */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Harga Beli *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
                <input
                  type="number"
                  value={formData.purchasePrice || ""}
                  onChange={(e) => handleChange("purchasePrice", parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Harga Jual */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Harga Jual *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
                <input
                  type="number"
                  value={formData.sellPrice || ""}
                  onChange={(e) => handleChange("sellPrice", parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Stok Awal */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Stok Awal</label>
              <input
                type="number"
                value={formData.stock || ""}
                onChange={(e) => handleChange("stock", parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="0"
              />
            </div>

            {/* Stok Minimum */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Stok Minimum</label>
              <input
                type="number"
                value={formData.minStock || ""}
                onChange={(e) => handleChange("minStock", parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="0"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-700 pt-6">
            <div>
              {isEditing && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  color="error"
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
              <Button type="submit" loading={loading}>
                {isEditing ? "Simpan Perubahan" : "Simpan"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
