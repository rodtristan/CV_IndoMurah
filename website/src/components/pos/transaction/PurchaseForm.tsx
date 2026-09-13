"use client";

import { useState } from "react";
import { X, Plus, Minus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { mockSuppliers, mockProducts } from "@/lib/mock-data-pos";
import type { Purchase } from "@/types/pos";

interface PurchaseFormProps {
  purchase?: Purchase;
  onClose: () => void;
  onSave: (purchase: Purchase) => void;
}

interface PurchaseItem {
  id: string;
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitName: string;
  price: number;
  discount: number;
  subtotal: number;
}

export function PurchaseForm({ purchase, onClose, onSave }: PurchaseFormProps) {
  const [formData, setFormData] = useState({
    code: purchase?.code || `BLI${Date.now().toString().slice(-6)}`,
    supplierId: purchase?.supplierId || 0,
    date: purchase?.date || new Date().toISOString().split("T")[0],
    dueDate: purchase?.dueDate || "",
    notes: purchase?.notes || "",
    taxPercent: purchase?.taxPercent || 11,
    discountPercent: purchase?.discountPercent || 0,
    discountAmount: purchase?.discountAmount || 0,
  });

  const [items, setItems] = useState<PurchaseItem[]>([
    {
      id: "1",
      productId: 1,
      productCode: "BRG001",
      productName: "Mie Instan",
      quantity: 10,
      unitName: "Dus",
      price: 45000,
      discount: 0,
      subtotal: 450000,
    },
  ]);

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = Math.round((subtotal * formData.taxPercent) / 100);
  const total = subtotal + taxAmount - formData.discountAmount;

  const handleAddItem = () => {
    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      productId: 0,
      productCode: "",
      productName: "",
      quantity: 1,
      unitName: "Pcs",
      price: 0,
      discount: 0,
      subtotal: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof PurchaseItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "price" || field === "discount") {
          const qty = field === "quantity" ? (value as number) : item.quantity;
          const price = field === "price" ? (value as number) : item.price;
          const disc = field === "discount" ? (value as number) : item.discount;
          updated.subtotal = qty * price - disc;
        }
        return updated;
      })
    );
  };

  const handleProductSelect = (id: string, productId: number) => {
    const product = mockProducts.find((p) => p.id === productId);
    if (product) {
      setItems(
        items.map((item) => {
          if (item.id !== id) return item;
          return {
            ...item,
            productId: product.id,
            productCode: product.code,
            productName: product.name,
            unitName: (product as any).unitName || "Pcs",
            price: product.purchasePrice || 0,
            subtotal: item.quantity * (product.purchasePrice || 0),
          };
        })
      );
    }
  };

  const handleSupplierChange = (supplierId: number) => {
    setFormData({
      ...formData,
      supplierId,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPurchase: Purchase = {
      id: purchase?.id || Date.now(),
      code: formData.code,
      supplierId: formData.supplierId,
      date: formData.date,
      dueDate: formData.dueDate || undefined,
      subtotal,
      discountPercent: formData.discountPercent,
      discountAmount: formData.discountAmount,
      taxPercent: formData.taxPercent,
      taxAmount: taxAmount,
      total,
      paid: 0,
      remaining: total,
      paymentStatus: "PENDING",
      paymentMethod: "CASH",
      isReturn: false,
      status: "PENDING",
      notes: formData.notes,
      createdById: "admin",
      createdAt: new Date().toISOString(),
    };
    onSave(newPurchase);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {purchase ? "Edit Pembelian" : "Pembelian Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Pembelian
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jatuh Tempo
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => handleSupplierChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9C27B0] focus:border-[#9C27B0]"
                  required
                >
                  <option value={0}>-- Pilih Supplier --</option>
                  {mockSuppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Item Pembelian</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={handleAddItem}
                  className="border-[#9C27B0] text-[#9C27B0] hover:bg-purple-50"
                >
                  Tambah Item
                </Button>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 w-10">#</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Produk</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 w-20">Qty</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 w-24">Satuan</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-600 w-32">Harga</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-600 w-24">Disc</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-600 w-32">Subtotal</th>
                      <th className="px-3 py-2 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                        <td className="px-3 py-2">
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductSelect(item.id, Number(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          >
                            <option value={0}>-- Pilih --</option>
                            {mockProducts.slice(0, 10).map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.code} - {product.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right"
                            min="1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            value={item.unitName}
                            onChange={(e) => handleItemChange(item.id, "unitName", e.target.value)}
                            className="text-sm py-1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(item.id, "price", Number(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right"
                            min="0"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleItemChange(item.id, "discount", Number(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right"
                            min="0"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">
                          {formatCurrency(item.subtotal)}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            disabled={items.length === 1}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Pajak (%)</span>
                    <input
                      type="number"
                      value={formData.taxPercent}
                      onChange={(e) => setFormData({ ...formData, taxPercent: Number(e.target.value) })}
                      className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-right"
                      min="0"
                      max="100"
                    />
                  </div>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Diskon</span>
                    <input
                      type="number"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
                      className="w-28 px-2 py-1 border border-gray-200 rounded text-sm text-right"
                      min="0"
                    />
                  </div>
                  <span className="font-medium text-red-600">-{formatCurrency(formData.discountAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-[#9C27B0]">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9C27B0] focus:border-[#9C27B0]"
                placeholder="Tambahkan catatan jika diperlukan..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" icon={Save} className="bg-[#9C27B0] hover:bg-[#7B1FA2]">
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
