"use client";

import { useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
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

// Mock price history data
const mockPriceHistory = [
  { id: 1, code: "BRG001", name: "Mie Instan Indomie", category: "Makanan", oldPrice: 3000, newPrice: 3500, difference: 500, date: "12/09/2024" },
  { id: 2, code: "BRG002", name: "Kopi Sachet", category: "Minuman", oldPrice: 2000, newPrice: 2200, difference: 200, date: "12/09/2024" },
  { id: 3, code: "BRG003", name: "Sabun Mandi", category: "Sabun", oldPrice: 5000, newPrice: 5000, difference: 0, date: "11/09/2024" },
  { id: 4, code: "BRG004", name: "Shampo Botol", category: "Shampo", oldPrice: 15000, newPrice: 18000, difference: 3000, date: "11/09/2024" },
  { id: 5, code: "BRG005", name: "Mie Goreng", category: "Makanan", oldPrice: 3500, newPrice: 3000, difference: -500, date: "10/09/2024" },
];

export default function SalePriceHistoryPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const itemsPerPage = 10;

  const filteredData = mockPriceHistory.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary data
  const totalItem = filteredData.length;
  const avgPrice = filteredData.reduce((acc, p) => acc + p.newPrice, 0) / filteredData.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(paginatedData.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    }
  };

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Penjualan / History Harga Jual"
        subtitle="Riwayat perubahan harga jual barang"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              Export
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Item</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{totalItem}</span>
            <span className="text-xs text-gray-500">Items</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Rata-rata Harga</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#9C27B0]">{formatCurrency(avgPrice)}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kode atau nama item..."
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
            {selectedItems.length > 0 ? (
              <span>{selectedItems.length} dipilih</span>
            ) : (
              <span>{filteredData.length} data</span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 text-left">
                <th className="px-4 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-[#9C27B0] focus:ring-[#9C27B0]"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Kode Item</th>
                <th className="px-4 py-3 font-medium">Nama Item</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium text-right">Harga Jual Lama</th>
                <th className="px-4 py-3 font-medium text-right">Harga Jual Baru</th>
                <th className="px-4 py-3 font-medium text-right">Selisih</th>
                <th className="px-4 py-3 font-medium">Tanggal Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => handleSelect(item.id, e.target.checked)}
                      className="rounded border-gray-300 text-[#9C27B0] focus:ring-[#9C27B0]"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatCurrency(item.oldPrice)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.newPrice)}</td>
                  <td className={cn(
                    "px-4 py-3 text-sm font-medium text-right",
                    item.difference > 0 ? "text-green-600" : item.difference < 0 ? "text-red-600" : "text-gray-700"
                  )}>
                    {item.difference > 0 ? "+" : ""}{formatCurrency(item.difference)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.date}</td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    Tidak ada data history harga
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="border-gray-200"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-8 h-8 rounded text-sm font-medium transition-colors",
                  currentPage === page
                    ? "bg-[#9C27B0] text-white hover:bg-[#7B1FA2]"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                {page}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="border-gray-200"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
