"use client";

import { useState } from "react";
import { Download, Calendar } from "lucide-react";
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

// Mock debt report data (Hutang Supplier)
const mockDebtReport = [
  { id: 1, code: "PO240912001", supplier: "PT Sentosa Jaya", date: "12/09/2024", dueDate: "19/09/2024", total: 1400000, paid: 700000, remaining: 700000 },
  { id: 2, code: "PO240911001", supplier: "CV Maju Bersama", date: "11/09/2024", dueDate: "18/09/2024", total: 1300000, paid: 500000, remaining: 800000 },
  { id: 3, code: "PO240910001", supplier: "UD Sumber Rezeki", date: "10/09/2024", dueDate: "17/09/2024", total: 850000, paid: 850000, remaining: 0 },
  { id: 4, code: "PO240909001", supplier: "Toko Elektronik ABC", date: "09/09/2024", dueDate: "16/09/2024", total: 1200000, paid: 400000, remaining: 800000 },
];

export default function DebtReportPage() {
  const [dateRange] = useState({ from: "01/09/2024", to: "30/09/2024" });

  const totalDebt = mockDebtReport.reduce((acc, p) => acc + p.remaining, 0);
  const totalPaid = mockDebtReport.reduce((acc, p) => acc + p.paid, 0);
  const overdueCount = mockDebtReport.filter(p => p.remaining > 0).length;

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Reports / Laporan Hutang"
        subtitle="Laporan hutang supplier"
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
          <div className="text-xs text-gray-500 mb-1">Total Hutang</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-red-600">{formatCurrency(totalDebt)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Sudah Dibayar</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Jumlah Hutang</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{mockDebtReport.length}</span>
            <span className="text-xs text-gray-500">Transaksi</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Belum Lunas</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-orange-600">{overdueCount}</span>
            <span className="text-xs text-gray-500">Transaksi</span>
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
                <th className="px-4 py-3 font-medium">Kode PO</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Jatuh Tempo</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-right">Sudah Bayar</th>
                <th className="px-4 py-3 font-medium text-right">Sisa Hutang</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockDebtReport.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.supplier}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.dueDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.total)}</td>
                  <td className="px-4 py-3 text-sm text-green-600 text-right">{formatCurrency(item.paid)}</td>
                  <td className={cn("px-4 py-3 text-sm font-medium text-right", item.remaining > 0 ? "text-red-600" : "text-gray-900")}>
                    {formatCurrency(item.remaining)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      item.remaining === 0 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    )}>
                      {item.remaining === 0 ? "Lunas" : "Belum Lunas"}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={4} className="px-4 py-3 text-sm text-gray-900">TOTAL</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(mockDebtReport.reduce((acc, p) => acc + p.total, 0))}</td>
                <td className="px-4 py-3 text-sm text-green-600 text-right">{formatCurrency(totalPaid)}</td>
                <td className="px-4 py-3 text-sm text-red-600 text-right">{formatCurrency(totalDebt)}</td>
                <td className="px-4 py-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
