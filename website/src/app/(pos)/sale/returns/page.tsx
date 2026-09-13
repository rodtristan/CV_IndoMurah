"use client";

import { useState } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Pencil, Trash2, Download, Upload, Eye } from "lucide-react";
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

// Mock sale returns data
const mockSaleReturns = [
  { id: 1, code: "SR240912001", saleCode: "SO240912001", date: "12/09/2024", customerName: "Andi Wijaya", qty: 3, total: 105000, status: "pending" },
  { id: 2, code: "SR240911001", saleCode: "SO240911001", date: "11/09/2024", customerName: "Budi Santoso", qty: 2, total: 70000, status: "approved" },
  { id: 3, code: "SR240910001", saleCode: "SO240910001", date: "10/09/2024", customerName: "CV Maju Jaya", qty: 1, total: 35000, status: "completed" },
  { id: 4, code: "SR240909001", saleCode: "SO240909001", date: "09/09/2024", customerName: "PT Sumber Rezeki", qty: 2, total: 60000, status: "completed" },
];

export default function SaleReturnsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const itemsPerPage = 10;

  const filteredData = mockSaleReturns.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary data
  const totalRetur = filteredData.reduce((acc, p) => acc + p.total, 0);
  const totalItemRetur = filteredData.length;
  const totalQty = filteredData.reduce((acc, p) => acc + p.qty, 0);
  const itemBelowMin = 3;

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">Tertunda</span>;
      case "approved":
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">Disetujui</span>;
      case "completed":
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">Selesai</span>;
      case "rejected":
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">Ditolak</span>;
      default:
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Penjualan / Retur Penjualan"
        subtitle="Kelola retur barang dagangan"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Download className="size-4 mr-2" /> Export
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300">
              <Upload className="size-4 mr-2" /> Import
            </Button>
            <Button size="sm" className="bg-[#9C27B0] hover:bg-[#7B1FA2]">
              <Plus className="size-4 mr-2" /> Retur Baru
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Retur</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-red-600">{formatCurrency(totalRetur)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Item Retur</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{totalItemRetur}</span>
            <span className="text-xs text-gray-500">Item</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Qty</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{totalQty}</span>
            <span className="text-xs text-gray-500">Qty</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Item Below Min</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-red-600">{itemBelowMin}</span>
            <span className="text-xs text-gray-500">Items</span>
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
                placeholder="Cari kode atau pelanggan..."
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
                <th className="px-4 py-3 font-medium">Kode Retur</th>
                <th className="px-4 py-3 font-medium">Kode Penjualan</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Pelanggan</th>
                <th className="px-4 py-3 font-medium text-right">Qty</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-center w-24">Aksi</th>
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
                  <td className="px-4 py-3 text-sm text-gray-500">{item.saleCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.customerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.qty}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(item.status)}</td>
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
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    Tidak ada data retur
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
