"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { UnitForm } from "@/components/pos/master/UnitForm";
import { cn } from "@/lib/utils";
import type { Unit } from "@/types/pos";

const mockUnits: Unit[] = [
  { id: 1, name: "Pieces", abbreviation: "PCS" },
  { id: 2, name: "Kilogram", abbreviation: "KG" },
  { id: 3, name: "Gram", abbreviation: "GR" },
  { id: 4, name: "Liter", abbreviation: "LTR" },
  { id: 5, name: "Dus", abbreviation: "DUS" },
  { id: 6, name: "Meter", abbreviation: "MTR" },
];

export default function UnitsPage() {
  const [search, setSearch] = useState("");
  const [units] = useState<Unit[]>(mockUnits);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const itemsPerPage = 10;

  const filteredData = units.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.abbreviation.toLowerCase().includes(search.toLowerCase())
  );
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
            <h1 className="text-lg font-semibold text-gray-900">Daftar Satuan</h1>
            <p className="text-sm text-gray-500">Total data yang ditemukan : {filteredData.length.toLocaleString("id-ID")}.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              <Download className="size-4 mr-1" /> Export
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setEditingUnit(null); setFormOpen(true); }}>
              <Plus className="size-4 mr-1" /> Tambah
            </Button>
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
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Nama Satuan ↕</th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Singkat ↕</th>
              <th className="px-3 py-3 font-medium text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((unit) => (
              <tr key={unit.id} className="hover:bg-gray-50">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(unit.id)}
                    onChange={(e) => handleSelect(unit.id, e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </td>
                <td className="px-3 py-3 text-sm text-gray-500">{unit.id}</td>
                <td className="px-3 py-3 text-sm font-medium text-purple-600">{unit.name}</td>
                <td className="px-3 py-3 text-sm text-gray-500">{unit.abbreviation}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => { setEditingUnit(unit); setFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded">
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

      <UnitForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingUnit(null); }}
        onSave={() => setFormOpen(false)}
        initialData={editingUnit || undefined}
        isEditing={!!editingUnit}
      />
    </PageWrapper>
  );
}
