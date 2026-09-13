"use client";

import { useState } from "react";
import { Download, Calendar, Search } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Mock purchase report data
const mockPurchaseReport = [
  { id: 1, code: "PO240912001", date: "12/09/2024", supplier: "PT Sentosa Jaya", qty: 50, subtotal: 1400000, discount: 0, total: 1400000 },
  { id: 2, code: "PO240912002", date: "12/09/2024", supplier: "CV Maju Bersama", qty: 30, subtotal: 1350000, discount: 50000, total: 1300000 },
  { id: 3, code: "PO240911001", date: "11/09/2024", supplier: "UD Sumber Rezeki", qty: 25, subtotal: 875000, discount: 25000, total: 850000 },
  { id: 4, code: "PO240910001", date: "10/09/2024", supplier: "Toko Elektronik ABC", qty: 40, subtotal: 1200000, discount: 0, total: 1200000 },
];

export default function PurchaseReportPage() {
  const [dateRange] = useState({ from: "01/09/2024", to: "30/09/2024" });

  const totalPurchase = mockPurchaseReport.reduce((acc, p) => acc + p.total, 0);
  const totalQty = mockPurchaseReport.reduce((acc, p) => acc + p.qty, 0);
  const totalDiscount = mockPurchaseReport.reduce((acc, p) => acc + p.discount, 0);

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Reports / Laporan Pembelian"
        subtitle="Laporan transaksi pembelian"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Download className="size-4 mr-2" /> Export PDF
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300">
              <Download className="size-4 mr-2" /> Export Excel
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Pembelian</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-red-600">{formatCurrency(totalPurchase)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Qty</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{totalQty}</span>
            <span className="text-xs text-gray-500">Items</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Diskon</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-green-600">{formatCurrency(totalDiscount)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Jumlah Transaksi</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{mockPurchaseReport.length}</span>
            <span className="text-xs text-gray-500">Transaksi</span>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-gray-400" />
              <span className="text-sm text-gray-500">Periode: {dateRange.from} - {dateRange.to}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 text-left">
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium text-right">Qty</th>
                <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                <th className="px-4 py-3 font-medium text-right">Diskon</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockPurchaseReport.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.supplier}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.qty}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatCurrency(item.subtotal)}</td>
                  <td className="px-4 py-3 text-sm text-green-600 text-right">{formatCurrency(item.discount)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={3} className="px-4 py-3 text-sm text-gray-900">TOTAL</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{totalQty}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(totalPurchase + totalDiscount)}</td>
                <td className="px-4 py-3 text-sm text-green-600 text-right">{formatCurrency(totalDiscount)}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(totalPurchase)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
