"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { UnitForm } from "@/components/pos/master/UnitForm";
import type { Unit } from "@/types/pos";

const mockUnits: Unit[] = [
  { id: 1, name: "Dus", abbreviation: "Dus" },
  { id: 2, name: "Pieces", abbreviation: "Pcs" },
  { id: 3, name: "Kilogram", abbreviation: "Kg" },
  { id: 4, name: "Liter", abbreviation: "L" },
  { id: 5, name: "Meter", abbreviation: "M" },
  { id: 6, name: "Pack", abbreviation: "Pack" },
  { id: 7, name: "Box", abbreviation: "Box" },
  { id: 8, name: "Botol", abbreviation: "Botol" },
];

export default function UnitsPage() {
  const [search, setSearch] = useState("");
  const [units] = useState<Unit[]>(mockUnits);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = units.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.abbreviation.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle title="Satuan" subtitle="Kelola satuan barang" actions={
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setEditingUnit(null); setFormOpen(true); }}>
          <Plus className="size-4 mr-2" /> Tambah Satuan
        </Button>
      } />

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input type="text" placeholder="Cari satuan..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500" />
          </div>
          <span className="text-sm text-gray-500">{filteredData.length} data</span>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 text-left">
              <th className="px-4 py-3 font-medium w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nama Satuan</th>
              <th className="px-4 py-3 font-medium">Singkatan</th>
              <th className="px-4 py-3 font-medium text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((unit) => (
              <tr key={unit.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-4 py-3 text-sm text-gray-500">{unit.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{unit.name}</td>
                <td className="px-4 py-3 text-sm text-purple-600 font-medium">{unit.abbreviation}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => { setEditingUnit(unit); setFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"><Pencil className="size-4" /></button>
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

      <UnitForm open={formOpen} onClose={() => { setFormOpen(false); setEditingUnit(null); }} onSave={() => setFormOpen(false)} initialData={editingUnit || undefined} isEditing={!!editingUnit} />
    </PageWrapper>
  );
}
