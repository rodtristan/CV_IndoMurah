"use client";

import { useState } from "react";
import { Download, Calendar } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Mock sale report data
const mockSaleReport = [
  { id: 1, code: "TRX240912001", date: "12/09/2024", customer: "Andi Wijaya", qty: 15, subtotal: 850000, discount: 0, tax: 93500, total: 943500 },
  { id: 2, code: "TRX240912002", date: "12/09/2024", customer: "Budi Santoso", qty: 10, subtotal: 450000, discount: 25000, tax: 46750, total: 471750 },
  { id: 3, code: "TRX240911001", date: "11/09/2024", customer: "CV Maju Jaya", qty: 20, subtotal: 1200000, discount: 50000, tax: 126500, total: 1275000 },
  { id: 4, code: "TRX240910001", date: "10/09/2024", customer: "PT Sumber Rezeki", qty: 25, subtotal: 675000, discount: 0, tax: 74250, total: 749250 },
];

export default function SaleReportPage() {
  const [dateRange] = useState({ from: "01/09/2024", to: "30/09/2024" });

  const totalSale = mockSaleReport.reduce((acc, p) => acc + p.total, 0);
  const totalQty = mockSaleReport.reduce((acc, p) => acc + p.qty, 0);
  const totalDiscount = mockSaleReport.reduce((acc, p) => acc + p.discount, 0);
  const totalTax = mockSaleReport.reduce((acc, p) => acc + p.tax, 0);

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Reports / Laporan Penjualan"
        subtitle="Laporan transaksi penjualan"
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
          <div className="text-xs text-gray-500 mb-1">Total Penjualan</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-green-600">{formatCurrency(totalSale)}</span>
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
            <span className="text-xl font-bold text-red-600">{formatCurrency(totalDiscount)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Pajak</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{formatCurrency(totalTax)}</span>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-gray-400" />
            <span className="text-sm text-gray-500">Periode: {dateRange.from} - {dateRange.to}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 text-left">
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium text-right">Qty</th>
                <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                <th className="px-4 py-3 font-medium text-right">Diskon</th>
                <th className="px-4 py-3 font-medium text-right">Pajak</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockSaleReport.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.customer}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.qty}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatCurrency(item.subtotal)}</td>
                  <td className="px-4 py-3 text-sm text-red-600 text-right">{formatCurrency(item.discount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatCurrency(item.tax)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={3} className="px-4 py-3 text-sm text-gray-900">TOTAL</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{totalQty}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(totalSale - totalTax)}</td>
                <td className="px-4 py-3 text-sm text-red-600 text-right">{formatCurrency(totalDiscount)}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(totalTax)}</td>
                <td className="px-4 py-3 text-sm text-green-600 text-right">{formatCurrency(totalSale)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
