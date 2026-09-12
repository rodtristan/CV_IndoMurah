"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { WarehouseForm } from "@/components/pos/master/WarehouseForm";
import type { Warehouse } from "@/types/pos";

const mockWarehouses: Warehouse[] = [
  { id: 1, code: "GD001", name: "Gudang Utama", address: "Jl. Gudang No. 1", isDefault: true },
  { id: 2, code: "GD002", name: "Gudang Cadangan", address: "Jl. Cadangan No. 2", isDefault: false },
  { id: 3, code: "GD003", name: "Gudang Branch", address: "Jl. Branch No. 3", isDefault: false },
];

export default function WarehousesPage() {
  const [search, setSearch] = useState("");
  const [warehouses] = useState<Warehouse[]>(mockWarehouses);
  const [formOpen, setFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = warehouses.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()) || w.code.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle title="Master / Gudang" subtitle="Kelola data gudang" actions={
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setEditingWarehouse(null); setFormOpen(true); }}>
          <Plus className="size-4 mr-2" /> Tambah Gudang
        </Button>
      } />

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input type="text" placeholder="Cari gudang..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500" />
          </div>
          <span className="text-sm text-gray-500">{filteredData.length} data</span>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 text-left">
              <th className="px-4 py-3 font-medium w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Nama Gudang</th>
              <th className="px-4 py-3 font-medium">Alamat</th>
              <th className="px-4 py-3 font-medium">Default</th>
              <th className="px-4 py-3 font-medium text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((wh) => (
              <tr key={wh.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{wh.code}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{wh.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{wh.address || "-"}</td>
                <td className="px-4 py-3">
                  {wh.isDefault && <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">Ya</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => { setEditingWarehouse(wh); setFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"><Pencil className="size-4" /></button>
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

      <WarehouseForm open={formOpen} onClose={() => { setFormOpen(false); setEditingWarehouse(null); }} onSave={() => setFormOpen(false)} initialData={editingWarehouse || undefined} isEditing={!!editingWarehouse} />
    </PageWrapper>
  );
}
