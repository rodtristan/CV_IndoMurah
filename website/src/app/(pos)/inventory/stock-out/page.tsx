"use client";

import { useState } from "react";
import { Plus, Search, ChevronLeft, ChevronRight, Pencil, Trash2, Download, Eye } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Mock stock out data
const mockStockOut = [
  { id: 1, code: "SO240912001", date: "12/09/2024", warehouse: "UTM", customer: "Andi Wijaya", qty: 20, total: 700000, status: "completed" },
  { id: 2, code: "SO240912002", date: "12/09/2024", warehouse: "UTM", customer: "Budi Santoso", qty: 15, total: 525000, status: "completed" },
  { id: 3, code: "SO240911001", date: "11/09/2024", warehouse: "ATB", customer: "CV Maju Jaya", qty: 10, total: 350000, status: "completed" },
  { id: 4, code: "SO240911002", date: "11/09/2024", warehouse: "UTM", customer: "PT Sumber Rezeki", qty: 8, total: 280000, status: "pending" },
  { id: 5, code: "SO240910001", date: "10/09/2024", warehouse: "UTM", customer: "Toko Elektronik ABC", qty: 12, total: 420000, status: "completed" },
];

export default function StockOutPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const itemsPerPage = 10;

  const filteredData = mockStockOut.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.customer.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalTransaksi = filteredData.length;
  const totalQty = filteredData.reduce((acc, p) => acc + p.qty, 0);
  const totalItem = 38;
  const itemBelowMin = 5;

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
      case "completed":
        return <span className="rounded px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">Selesai</span>;
      case "pending":
        return <span className="rounded px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">Tertunda</span>;
      default:
        return <span className="rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <PageWrapper className="bg-gray-100">
      {/* Header - Ketoko Style */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Item Keluar</h1>
            <p className="text-sm text-gray-500">Total data yang ditemukan : {filteredData.length.toLocaleString("id-ID")}.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              <Download className="size-4 mr-1" /> Export
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Plus className="size-4 mr-1" /> Tambah
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Transaksi</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{totalTransaksi}</span>
            <span className="text-xs text-gray-500">Transaksi</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Qty</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{totalQty.toLocaleString("id-ID")}</span>
            <span className="text-xs text-gray-500">Items</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Item</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{totalItem}</span>
            <span className="text-xs text-gray-500">Items</span>
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
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Kata Kunci :</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 w-48 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Dept/Gudang :</span>
            <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white">
              <option>Semua</option>
              <option>UTM</option>
              <option>ATB</option>
            </select>
          </div>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <Search className="size-4 mr-1" /> Cari
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 text-left">
                <th className="px-3 py-3 font-medium w-10">
                  <input type="checkbox" checked={selectedItems.length === paginatedData.length && paginatedData.length > 0} onChange={(e) => handleSelectAll(e.target.checked)} className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                </th>
                <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Kode ↕</th>
                <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Tanggal ↕</th>
                <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Dept/Gudang ↕</th>
                <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Customer ↕</th>
                <th className="px-3 py-3 font-medium text-right cursor-pointer hover:text-purple-600">Qty ↕</th>
                <th className="px-3 py-3 font-medium text-right cursor-pointer hover:text-purple-600">Total ↕</th>
                <th className="px-3 py-3 font-medium text-center">Status</th>
                <th className="px-3 py-3 font-medium text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={(e) => handleSelect(item.id, e.target.checked)} className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  </td>
                  <td className="px-3 py-3 text-sm font-medium text-purple-600">{item.code}</td>
                  <td className="px-3 py-3 text-sm text-gray-500">{item.date}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{item.warehouse}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{item.customer}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 text-right">{item.qty.toLocaleString("id-ID")}</td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
                  <td className="px-3 py-3 text-center">{getStatusBadge(item.status)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded" title="Detail"><Eye className="size-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded" title="Edit"><Pencil className="size-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Hapus"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - Ketoko Style */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length.toLocaleString("id-ID")}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="border-gray-200 px-2"><ChevronLeft className="size-4" /></Button>
            <span className="px-3 py-1 text-sm text-gray-600">Hal {currentPage} / {totalPages || 1}</span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="border-gray-200 px-2"><ChevronRight className="size-4" /></Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
