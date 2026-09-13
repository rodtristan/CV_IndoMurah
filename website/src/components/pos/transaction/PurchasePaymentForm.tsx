"use client";

import { useState } from "react";
import { X, Save, CreditCard, Banknote, Building } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { mockPurchases } from "@/lib/mock-data-pos";

interface PaymentFormProps {
  purchaseId?: number;
  onClose: () => void;
  onSave: (payment: { purchaseId: number; amount: number; method: string; notes: string }) => void;
}

export function PurchasePaymentForm({ purchaseId, onClose, onSave }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    purchaseId: purchaseId || 0,
    amount: "",
    method: "cash",
    notes: "",
    reference: "",
  });

  const unpaidPurchases = mockPurchases.filter(p => p.remaining > 0);

  const selectedPurchase = mockPurchases.find(p => p.id === formData.purchaseId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      purchaseId: formData.purchaseId,
      amount: Number(formData.amount),
      method: formData.method,
      notes: formData.notes,
    });
  };

  const paymentMethods = [
    { value: "cash", label: "Tunai", icon: Banknote },
    { value: "transfer", label: "Transfer", icon: Building },
    { value: "card", label: "Kartu", icon: CreditCard },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Pembayaran Pembelian
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Purchase Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Pembelian
            </label>
            <select
              value={formData.purchaseId}
              onChange={(e) => setFormData({ ...formData, purchaseId: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9C27B0] focus:border-[#9C27B0]"
              required
            >
              <option value={0}>-- Pilih Pembelian --</option>
              {unpaidPurchases.map((purchase) => (
                <option key={purchase.id} value={purchase.id}>
                  {purchase.code} - Supplier #{purchase.supplierId} (Sisa: {formatCurrency(purchase.remaining)})
                </option>
              ))}
            </select>
          </div>

          {/* Purchase Info */}
          {selectedPurchase && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">{formatCurrency(selectedPurchase.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sudah Bayar:</span>
                <span className="font-medium text-green-600">{formatCurrency(selectedPurchase.paid)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                <span className="text-gray-600">Sisa:</span>
                <span className="font-bold text-[#9C27B0]">{formatCurrency(selectedPurchase.remaining)}</span>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Pembayaran
            </label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Masukkan jumlah"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, method: method.value })}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                    formData.method === method.value
                      ? "border-[#9C27B0] bg-purple-50 text-[#9C27B0]"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <method.icon className="size-5" />
                  <span className="text-xs font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Referensi (opsional)
            </label>
            <Input
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="No. Bukti Bayar / Transfer"
            />
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
              placeholder="Tambahkan catatan..."
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" icon={Save} className="bg-[#9C27B0] hover:bg-[#7B1FA2]">
              Bayar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
