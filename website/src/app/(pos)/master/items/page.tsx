"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download, Upload } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { ItemForm } from "@/components/pos/master/ItemForm";
import { mockProducts } from "@/lib/mock-data-pos";
import type { Product } from "@/types/pos";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function ItemsPage() {
  const [search, setSearch] = useState("");
  const [items] = useState<Product[]>(mockProducts);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const itemsPerPage = 10;

  const filteredData = items.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      {/* Header - Ketoko Style */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Daftar Item</h1>
            <p className="text-sm text-gray-500">Total data yang ditemukan : {filteredData.length.toLocaleString("id-ID")}.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              <Download className="size-4 mr-1" /> Export
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              Kartu Stok
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              Satuan Salah
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              Tambah Data Marketplace
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              <Upload className="size-4 mr-1" /> Import
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Plus className="size-4 mr-1" /> Tambah
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar - Ketoko Style Filters */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
          {/* Kata Kunci */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Kata Kunci :</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 w-48 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Dept/Gudang */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Dept/Gudang :</span>
            <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white">
              <option>UTM - CV INDOMURAH GROUP</option>
            </select>
          </div>

          {/* Tipe Item */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Tipe Item :</span>
            <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white">
              <option>Semua</option>
            </select>
          </div>

          {/* Jenis */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Jenis :</span>
            <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white">
              <option>Semua</option>
            </select>
          </div>

          {/* Merek */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Merek :</span>
            <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white">
              <option>Semua</option>
            </select>
          </div>

          {/* Rak */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Rak :</span>
            <input
              type="text"
              placeholder="-"
              className="px-3 py-2 w-24 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Pilihan Item */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Pilihan Item :</span>
            <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white">
              <option>Semua Data</option>
            </select>
          </div>

          {/* Urut Berdasar */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Urut Berdasar :</span>
            <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white">
              <option>Kode Item</option>
              <option>Nama Item</option>
              <option>Stok</option>
            </select>
          </div>

          {/* Toggle - Tidak Dijual/Discontinued */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Tidak Dijual / Discontinued :</span>
            <button className="px-3 py-1 text-sm border border-gray-200 rounded bg-gray-50 text-gray-400">
              OFF
            </button>
          </div>

          {/* Search Button */}
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <Search className="size-4 mr-1" /> Cari
          </Button>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
          <div className="text-sm text-gray-500">
            Total data yang ditemukan : {filteredData.length.toLocaleString("id-ID")}.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              <Download className="size-4 mr-1" /> Export
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              Kartu Stok
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              Satuan Salah
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              Tambah Data Marketplace
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              <Upload className="size-4 mr-1" /> Import
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Plus className="size-4 mr-1" /> Tambah
            </Button>
          </div>
        </div>
      </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 text-left">
                <th className="px-3 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Kode Item ↕</th>
                <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Barcode ↕</th>
                <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">SKU ↕</th>
                <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Nama Item ↕</th>
                <th className="px-3 py-3 font-medium text-right cursor-pointer hover:text-purple-600">Stok Fisik ↕</th>
                <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Satuan ↕</th>
                <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Jenis ↕</th>
                <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Merek ↕</th>
                <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Rak ↕</th>
                <th className="px-3 py-3 font-medium text-right cursor-pointer hover:text-purple-600">Harga Pokok ↕</th>
                <th className="px-3 py-3 font-medium text-right cursor-pointer hover:text-purple-600">HPP Rata-rata (AVG) ↕</th>
                <th className="px-3 py-3 font-medium text-right cursor-pointer hover:text-purple-600">Harga Jual ↕</th>
                <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Keterangan ↕</th>
                <th className="px-3 py-3 font-medium text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => handleSelect(item.id, e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-3 py-3 text-sm text-gray-500 font-mono">{item.barcode || "-"}</td>
                  <td className="px-3 py-3 text-sm text-gray-500">{item.sku || "-"}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 font-medium">{item.name}</td>
                  <td className={cn(
                    "px-3 py-3 text-sm font-medium text-right",
                    item.stock === 0 ? "text-red-600" :
                    item.stock <= item.minStock ? "text-orange-600" : "text-gray-700"
                  )}>
                    {item.stock.toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">{item.unitName}</td>
                  <td className="px-3 py-3 text-sm text-gray-500">{item.itemType || "-"}</td>
                  <td className="px-3 py-3 text-sm text-gray-500">{item.brandName || "-"}</td>
                  <td className="px-3 py-3 text-sm text-gray-500">{item.rack || "-"}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 text-right">{formatCurrency(item.purchasePrice)}</td>
                  <td className="px-3 py-3 text-sm text-gray-500 text-right">{formatCurrency(item.hppAverage || 0)}</td>
                  <td className="px-3 py-3 text-sm font-medium text-purple-600 text-right">{formatCurrency(item.sellPrice)}</td>
                  <td className="px-3 py-3 text-sm text-gray-400 max-w-[150px] truncate">{item.notes || "-"}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => { setEditingItem(item); setFormOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
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
                  <td colSpan={15} className="px-4 py-12 text-center text-gray-400">
                    Tidak ada data item
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Ketoko Style */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length.toLocaleString("id-ID")}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="border-gray-200 px-2"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Hal {currentPage} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="border-gray-200 px-2"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <ItemForm
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditingItem(null); }}
          onSave={() => setFormOpen(false)}
          initialData={editingItem || undefined}
          isEditing={!!editingItem}
        />
    </PageWrapper>
  );
}
