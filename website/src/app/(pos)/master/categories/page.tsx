"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { CategoryForm } from "@/components/pos/master/CategoryForm";
import type { Category } from "@/types/pos";

const mockCategories: Category[] = [
  { id: 1, name: "Makanan", description: "Semua produk makanan", createdAt: "2024-01-01" },
  { id: 2, name: "Minuman", description: "Semua produk minuman", createdAt: "2024-01-01" },
  { id: 3, name: "Snack", description: "Makanan ringan", createdAt: "2024-01-01" },
  { id: 4, name: "Elektronik", description: "Produk elektronik", createdAt: "2024-01-01" },
  { id: 5, name: "Perlengkapan", description: "Alat dan perlengkapan", createdAt: "2024-01-01" },
  { id: 6, name: "Obat-obatan", description: "Obat dan suplemen", createdAt: "2024-01-01" },
  { id: 7, name: "Peralatan Rumah", description: "Peralatan rumah tangga", createdAt: "2024-01-01" },
];

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [categories] = useState<Category[]>(mockCategories);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle title="Kategori / Jenis Barang" subtitle="Kelola jenis/kategori barang" actions={
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setEditingCategory(null); setFormOpen(true); }}>
          <Plus className="size-4 mr-2" /> Tambah Kategori
        </Button>
      } />

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input type="text" placeholder="Cari kategori..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500" />
          </div>
          <span className="text-sm text-gray-500">{filteredData.length} data</span>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 text-left">
              <th className="px-4 py-3 font-medium w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nama Kategori</th>
              <th className="px-4 py-3 font-medium">Deskripsi</th>
              <th className="px-4 py-3 font-medium text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-4 py-3 text-sm text-gray-500">{cat.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{cat.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{cat.description || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => { setEditingCategory(cat); setFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"><Pencil className="size-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="size-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="border-gray-200"><ChevronLeft className="size-4" /></Button>
            <span className="text-sm text-gray-600 px-2">Halaman {currentPage} dari {totalPages || 1}</span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="border-gray-200"><ChevronRight className="size-4" /></Button>
          </div>
        </div>
      </div>

      <CategoryForm open={formOpen} onClose={() => { setFormOpen(false); setEditingCategory(null); }} onSave={() => setFormOpen(false)} initialData={editingCategory || undefined} isEditing={!!editingCategory} />
    </PageWrapper>
  );
}
