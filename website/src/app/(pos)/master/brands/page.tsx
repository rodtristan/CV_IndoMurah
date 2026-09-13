"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { BrandForm } from "@/components/pos/master/BrandForm";
import { cn } from "@/lib/utils";
import type { Brand } from "@/types/pos";

const mockBrands: Brand[] = [
  { id: 1, name: "Indomie", description: "Mie instan nomor 1" },
  { id: 2, name: "Kopi Luwak", description: "Kopi premium Indonesia" },
  { id: 3, name: "Aqua", description: "Air mineral kemasan" },
  { id: 4, name: "Samsung", description: "Elektronik" },
  { id: 5, name: "Unilever", description: "Barang kebutuhan rumah tangga" },
  { id: 6, name: "Mayora", description: "Makanan dan minuman" },
];

export default function BrandsPage() {
  const [search, setSearch] = useState("");
  const [brands] = useState<Brand[]>(mockBrands);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const itemsPerPage = 10;

  const filteredData = brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            <h1 className="text-lg font-semibold text-gray-900">Daftar Merek</h1>
            <p className="text-sm text-gray-500">Total data yang ditemukan : {filteredData.length.toLocaleString("id-ID")}.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              <Download className="size-4 mr-1" /> Export
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setEditingBrand(null); setFormOpen(true); }}>
              <Plus className="size-4 mr-1" /> Tambah
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
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
                className="pl-9 pr-4 py-2 w-48 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Search Button */}
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <Search className="size-4 mr-1" /> Cari
          </Button>
        </div>

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
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">ID ↕</th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Nama Merek ↕</th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Deskripsi ↕</th>
              <th className="px-3 py-3 font-medium text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((brand) => (
              <tr key={brand.id} className="hover:bg-gray-50">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(brand.id)}
                    onChange={(e) => handleSelect(brand.id, e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </td>
                <td className="px-3 py-3 text-sm text-gray-500">{brand.id}</td>
                <td className="px-3 py-3 text-sm font-medium text-purple-600">{brand.name}</td>
                <td className="px-3 py-3 text-sm text-gray-500">{brand.description || "-"}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => { setEditingBrand(brand); setFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded">
                      <Pencil className="size-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination - Ketoko Style */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length.toLocaleString("id-ID")}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="border-gray-200 px-2"><ChevronLeft className="size-4" /></Button>
            <span className="px-3 py-1 text-sm text-gray-600">Hal {currentPage} / {totalPages || 1}</span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="border-gray-200 px-2"><ChevronRight className="size-4" /></Button>
          </div>
        </div>
      </div>

      <BrandForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingBrand(null); }}
        onSave={() => setFormOpen(false)}
        initialData={editingBrand || undefined}
        isEditing={!!editingBrand}
      />
    </PageWrapper>
  );
}
