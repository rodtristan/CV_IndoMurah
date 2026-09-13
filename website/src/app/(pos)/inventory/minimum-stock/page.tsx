"use client";

import { useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Download, AlertTriangle } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// Mock minimum stock data
const mockMinimumStock = [
  { id: 1, code: "BRG001", name: "Mie Instan Indomie", category: "Makanan", warehouse: "Gudang Utama", currentStock: 5, minimumStock: 20, unit: "Dus", status: "critical" },
  { id: 2, code: "BRG002", name: "Kopi Sachet", category: "Minuman", warehouse: "Gudang Utama", currentStock: 8, minimumStock: 15, unit: "Dus", status: "critical" },
  { id: 3, code: "BRG003", name: "Sabun Mandi", category: "Sabun", warehouse: "Gudang Utama", currentStock: 12, minimumStock: 20, unit: "Pcs", status: "warning" },
  { id: 4, code: "BRG004", name: "Shampo Botol", category: "Shampo", warehouse: "Gudang Cab. Bandung", currentStock: 15, minimumStock: 25, unit: "Pcs", status: "warning" },
  { id: 5, code: "BRG005", name: "Pasta Gigi", category: "Pasta Gigi", warehouse: "Gudang Utama", currentStock: 3, minimumStock: 10, unit: "Pcs", status: "critical" },
  { id: 6, code: "BRG006", name: "Minuman Kaleng", category: "Minuman", warehouse: "Gudang Utama", currentStock: 20, minimumStock: 30, unit: "Dus", status: "warning" },
];

export default function MinimumStockPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = mockMinimumStock.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalItem = filteredData.length;
  const criticalCount = filteredData.filter(p => p.status === "critical").length;
  const warningCount = filteredData.filter(p => p.status === "warning").length;
  const totalBelow = filteredData.reduce((acc, p) => acc + p.currentStock, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1"><AlertTriangle className="size-3" /> Kritis</span>;
      case "warning":
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">Peringatan</span>;
      default:
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Inventory / Minimum Stock"
        subtitle="Daftar item di bawah minimum stock"
        actions={
          <Button variant="outline" size="sm" className="border-gray-300">
            <Download className="size-4 mr-2" /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Item Below Min</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-red-600">{totalItem}</span>
            <span className="text-xs text-gray-500">Items</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Kritis</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-red-600">{criticalCount}</span>
            <span className="text-xs text-gray-500">Items</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Peringatan</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-orange-600">{warningCount}</span>
            <span className="text-xs text-gray-500">Items</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Stock Below</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-red-600">{totalBelow}</span>
            <span className="text-xs text-gray-500">Items</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kode, nama atau kategori..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#9C27B0] focus:ring-1 focus:ring-[#9C27B0]"
              />
            </div>
            <Button variant="outline" size="sm" className="border-gray-200">
              <Filter className="size-4 mr-2" /> Filter
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            <span>{filteredData.length} data</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 text-left">
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Nama Item</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Gudang</th>
                <th className="px-4 py-3 font-medium text-right">Stock Sekarang</th>
                <th className="px-4 py-3 font-medium text-right">Min. Stock</th>
                <th className="px-4 py-3 font-medium text-right">Selisih</th>
                <th className="px-4 py-3 font-medium">Satuan</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((item) => (
                <tr key={item.id} className={cn("hover:bg-gray-50", item.status === "critical" && "bg-red-50")}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.warehouse}</td>
                  <td className={cn("px-4 py-3 text-sm font-bold text-right", item.status === "critical" ? "text-red-600" : "text-orange-600")}>
                    {item.currentStock}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.minimumStock}</td>
                  <td className={cn("px-4 py-3 text-sm font-bold text-right", item.currentStock < item.minimumStock ? "text-red-600" : "text-gray-700")}>
                    {item.currentStock - item.minimumStock}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.unit}</td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="border-gray-200"><ChevronLeft className="size-4" /></Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={cn("w-8 h-8 rounded text-sm font-medium transition-colors", currentPage === page ? "bg-[#9C27B0] text-white" : "border border-gray-200 text-gray-700 hover:bg-gray-50")}>{page}</button>
            ))}
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="border-gray-200"><ChevronRight className="size-4" /></Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
