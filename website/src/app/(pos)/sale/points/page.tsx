"use client";

import { useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Pencil, Trash2, Eye } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// Mock customer points data
const mockCustomerPoints = [
  { id: 1, code: "MEM001", name: "Andi Wijaya", phone: "0812-3456-7890", type: "VIP", totalPoin: 15000, poinUsed: 5000, sisaPoin: 10000, activeUntil: "31/12/2024" },
  { id: 2, code: "MEM002", name: "Budi Santoso", phone: "0813-9876-5432", type: "Gold", totalPoin: 8000, poinUsed: 2000, sisaPoin: 6000, activeUntil: "30/06/2025" },
  { id: 3, code: "MEM003", name: "CV Maju Jaya", phone: "0814-5555-4444", type: "Silver", totalPoin: 3500, poinUsed: 500, sisaPoin: 3000, activeUntil: "31/03/2025" },
  { id: 4, code: "MEM004", name: "PT Sumber Rezeki", phone: "0815-6666-7777", type: "VIP", totalPoin: 25000, poinUsed: 10000, sisaPoin: 15000, activeUntil: "31/12/2024" },
  { id: 5, code: "MEM005", name: "Toko Elektronik ABC", phone: "0816-8888-9999", type: "Gold", totalPoin: 12000, poinUsed: 3000, sisaPoin: 9000, activeUntil: "30/09/2025" },
];

export default function SalePointsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const itemsPerPage = 10;

  const filteredData = mockCustomerPoints.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary data
  const totalPelangganPoin = filteredData.length;
  const totalPoin = filteredData.reduce((acc, p) => acc + p.sisaPoin, 0);
  const avgPoin = totalPoin / filteredData.length;
  const poinExpired = 0;

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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "VIP":
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700">VIP</span>;
      case "Gold":
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700">Gold</span>;
      case "Silver":
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">Silver</span>;
      default:
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">{type}</span>;
    }
  };

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Penjualan / Poin Pelanggan"
        subtitle="Kelola poin pelanggan"
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
          <div className="text-xs text-gray-500 mb-1">Total Pelanggan Poin</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{totalPelangganPoin}</span>
            <span className="text-xs text-gray-500">Pelanggan</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Poin</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#9C27B0]">{totalPoin.toLocaleString()}</span>
            <span className="text-xs text-gray-500">Poin</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Rata-rata Poin</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{Math.round(avgPoin).toLocaleString()}</span>
            <span className="text-xs text-gray-500">Poin</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Poin Expired</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-red-600">{poinExpired}</span>
            <span className="text-xs text-gray-500">Poin</span>
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
                placeholder="Cari kode, nama atau telepon..."
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
                <th className="px-4 py-3 font-medium">Kode Member</th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Telepon</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 font-medium text-right">Total Poin</th>
                <th className="px-4 py-3 font-medium text-right">Poin Digunakan</th>
                <th className="px-4 py-3 font-medium text-right">Sisa Poin</th>
                <th className="px-4 py-3 font-medium">Masa Aktif</th>
                <th className="px-4 py-3 font-medium text-center w-20">Aksi</th>
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
                  <td className="px-4 py-3 text-sm text-gray-500">{item.phone}</td>
                  <td className="px-4 py-3">{getTypeBadge(item.type)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">{item.totalPoin.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-red-600 text-right">{item.poinUsed.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#9C27B0] text-right">{item.sisaPoin.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.activeUntil}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        className="p-1.5 text-gray-400 hover:text-[#9C27B0] hover:bg-purple-50 rounded"
                        title="Detail"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-[#9C27B0] hover:bg-purple-50 rounded"
                        title="Edit"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Hapus"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                    Tidak ada data poin
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
