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

// Mock payment data
const mockPaymentsList = [
  { id: 1, code: "BYR240912001", date: "12/09/2024", supplierName: "PT Sentosa Jaya", total: 550000, paid: 550000, remaining: 0, method: "Tunai", status: "paid" },
  { id: 2, code: "BYR240912002", date: "12/09/2024", supplierName: "CV Maju Bersama", total: 450000, paid: 450000, remaining: 0, method: "Transfer", status: "paid" },
  { id: 3, code: "BYR240911001", date: "11/09/2024", supplierName: "UD Sumber Rezeki", total: 750000, paid: 500000, remaining: 250000, method: "Tunai", status: "partial" },
  { id: 4, code: "BYR240911002", date: "11/09/2024", supplierName: "Toko Elektronik ABC", total: 875000, paid: 0, remaining: 875000, method: "-", status: "unpaid" },
  { id: 5, code: "BYR240910001", date: "10/09/2024", supplierName: "PT Sentosa Jaya", total: 1250000, paid: 1250000, remaining: 0, method: "Transfer", status: "paid" },
];

export default function PurchasePaymentsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const itemsPerPage = 10;

  const filteredData = mockPaymentsList.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary data
  const totalBayar = filteredData.reduce((acc, p) => acc + p.paid, 0);
  const totalBelumBayar = filteredData.reduce((acc, p) => acc + p.remaining, 0);
  const totalHutang = filteredData.filter(p => p.status !== "paid").reduce((acc, p) => acc + p.total, 0);
  const jumlahTransaksi = filteredData.length;

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
      case "paid":
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">Lunas</span>;
      case "partial":
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">Sebagian</span>;
      default:
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">Belum Bayar</span>;
    }
  };

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Pembelian / Pembayaran Pembelian"
        subtitle="Kelola pembayaran transaksi pembelian"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Download className="size-4 mr-2" /> Export
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300">
              <Upload className="size-4 mr-2" /> Import
            </Button>
            <Button size="sm" className="bg-[#9C27B0] hover:bg-[#7B1FA2]">
              <Plus className="size-4 mr-2" /> Bayar Hutang
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Bayar</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-green-600">{formatCurrency(totalBayar)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Belum Bayar</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-red-600">{formatCurrency(totalBelumBayar)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Hutang</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-orange-600">{formatCurrency(totalHutang)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Jumlah Transaksi</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{jumlahTransaksi}</span>
            <span className="text-xs text-gray-500">Transaksi</span>
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
                placeholder="Cari kode atau supplier..."
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
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-right">Dibayar</th>
                <th className="px-4 py-3 font-medium text-right">Sisa</th>
                <th className="px-4 py-3 font-medium">Metode Bayar</th>
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
                  <td className="px-4 py-3 text-sm text-gray-500">{item.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.supplierName}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
                  <td className="px-4 py-3 text-sm text-green-600 text-right font-medium">{formatCurrency(item.paid)}</td>
                  <td className={cn(
                    "px-4 py-3 text-sm text-right font-medium",
                    item.remaining > 0 ? "text-red-600" : "text-gray-700"
                  )}>
                    {formatCurrency(item.remaining)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.method}</td>
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
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                    Tidak ada data pembayaran
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
