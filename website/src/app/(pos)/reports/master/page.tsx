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

// Mock master report summary data
const mockSummary = {
  totalItems: 245,
  totalCategories: 8,
  totalSuppliers: 12,
  totalCustomers: 45,
  totalUnits: 6,
  totalBrands: 15,
  totalWarehouses: 3,
  totalSales: 5,
};

export default function MasterReportPage() {
  const [dateRange, setDateRange] = useState({ from: "01/09/2024", to: "30/09/2024" });

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Reports / Laporan Master"
        subtitle="Laporan data master keseluruhan"
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

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-gray-400" />
            <span className="text-sm text-gray-500">Periode:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#9C27B0]"
            />
            <span className="text-gray-400">-</span>
            <input
              type="text"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#9C27B0]"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Item</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{mockSummary.totalItems}</span>
            <span className="text-xs text-gray-500">Items</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Kategori</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{mockSummary.totalCategories}</span>
            <span className="text-xs text-gray-500">Kategori</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Supplier</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{mockSummary.totalSuppliers}</span>
            <span className="text-xs text-gray-500">Supplier</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Customer</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{mockSummary.totalCustomers}</span>
            <span className="text-xs text-gray-500">Customer</span>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Laporan Master Data</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Total Item Barang</span>
            <span className="text-sm font-medium text-gray-900">{mockSummary.totalItems} Items</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Total Kategori</span>
            <span className="text-sm font-medium text-gray-900">{mockSummary.totalCategories} Kategori</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Total Supplier</span>
            <span className="text-sm font-medium text-gray-900">{mockSummary.totalSuppliers} Supplier</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Total Customer/Pelanggan</span>
            <span className="text-sm font-medium text-gray-900">{mockSummary.totalCustomers} Pelanggan</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Total Satuan</span>
            <span className="text-sm font-medium text-gray-900">{mockSummary.totalUnits} Satuan</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Total Merek</span>
            <span className="text-sm font-medium text-gray-900">{mockSummary.totalBrands} Merek</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Total Gudang</span>
            <span className="text-sm font-medium text-gray-900">{mockSummary.totalWarehouses} Gudang</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">Total Sales Person</span>
            <span className="text-sm font-medium text-gray-900">{mockSummary.totalSales} Sales</span>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
