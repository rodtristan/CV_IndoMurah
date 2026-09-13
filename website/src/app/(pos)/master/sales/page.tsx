"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { SalesForm } from "@/components/pos/master/SalesForm";
import type { SalesPerson } from "@/types/pos";

const mockSales: SalesPerson[] = [
  { id: 1, code: "SL001", name: "Ahmad Fauzi", phone: "0812-3456-7890", email: "ahmad@email.com", isActive: true },
  { id: 2, code: "SL002", name: "Rina Marlina", phone: "0813-9876-5432", email: "rina@email.com", isActive: true },
  { id: 3, code: "SL003", name: "Budi Santoso", phone: "0814-5555-4444", email: "budi@email.com", isActive: true },
  { id: 4, code: "SL004", name: "Siti Aminah", phone: "0815-6666-7777", email: "siti@email.com", isActive: false },
];

export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [sales] = useState<SalesPerson[]>(mockSales);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSales, setEditingSales] = useState<SalesPerson | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = sales.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <PageWrapper className="bg-gray-100">
      {/* Header - Ketoko Style */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Daftar Sales</h1>
            <p className="text-sm text-gray-500">Total data yang ditemukan : {filteredData.length.toLocaleString("id-ID")}.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              <Download className="size-4 mr-1" /> Export
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setEditingSales(null); setFormOpen(true); }}>
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

          {/* Urut Berdasar */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Urut Berdasar :</span>
            <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white">
              <option>Kode</option>
              <option>Nama</option>
            </select>
          </div>

          {/* Search Button */}
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <Search className="size-4 mr-1" /> Cari
          </Button>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 text-left">
              <th className="px-3 py-3 font-medium w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Kode ↕</th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Nama Sales ↕</th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Telepon ↕</th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Email ↕</th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Status ↕</th>
              <th className="px-3 py-3 font-medium text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-3 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-3 py-3 text-sm font-medium text-gray-900">{s.code}</td>
                <td className="px-3 py-3 text-sm font-medium text-purple-600">{s.name}</td>
                <td className="px-3 py-3 text-sm text-gray-700">{s.phone || "-"}</td>
                <td className="px-3 py-3 text-sm text-gray-500">{s.email || "-"}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => { setEditingSales(s); setFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"><Pencil className="size-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="size-4" /></button>
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

      <SalesForm open={formOpen} onClose={() => { setFormOpen(false); setEditingSales(null); }} onSave={() => setFormOpen(false)} initialData={editingSales || undefined} isEditing={!!editingSales} />
    </PageWrapper>
  );
}
