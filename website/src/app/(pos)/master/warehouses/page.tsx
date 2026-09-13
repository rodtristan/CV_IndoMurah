"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { WarehouseForm } from "@/components/pos/master/WarehouseForm";
import { api } from "@/lib/api";
import type { Warehouse } from "@/types/pos";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const itemsPerPage = 10;
  const [formOpen, setFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        $skip: (currentPage - 1) * itemsPerPage,
        $take: itemsPerPage,
        $orderBy: { name: "asc" },
      };

      if (search) {
        params.$search = search;
      }

      const response = await api.getWarehouses(params as any);
      if (response.success && response.data) {
        setWarehouses(Array.isArray(response.data) ? response.data : []);
        if (response.meta) {
          setTotal(response.meta.total);
          setTotalPages(response.meta.pages);
        }
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, search]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(warehouses.map((item) => item.id));
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

  const handleSearch = () => {
    setCurrentPage(1);
    fetchWarehouses();
  };

  return (
    <PageWrapper className="bg-gray-100">
      {/* Header - Ketoko Style */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Dept./Gudang</h1>
            <p className="text-sm text-gray-500">Total data yang ditemukan : {total.toLocaleString("id-ID")}.</p>
          </div>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setEditingWarehouse(null); setFormOpen(true); }}>
            <Plus className="size-4 mr-1" /> Tambah
          </Button>
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
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 pr-4 py-2 w-48 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={handleSearch}>
            <Search className="size-4 mr-1" /> Cari
          </Button>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 text-left">
              <th className="px-3 py-3 font-medium w-10">
                <input
                  type="checkbox"
                  checked={selectedItems.length === warehouses.length && warehouses.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Kode ↕</th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Nama Gudang ↕</th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Alamat ↕</th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Default ↕</th>
              <th className="px-3 py-3 font-medium text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  Memuat data...
                </td>
              </tr>
            ) : warehouses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  Tidak ada data gudang
                </td>
              </tr>
            ) : (
              warehouses.map((wh) => (
                <tr key={wh.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(wh.id)}
                      onChange={(e) => handleSelect(wh.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-900">{wh.code}</td>
                  <td className="px-3 py-3 text-sm font-medium text-purple-600">{wh.name}</td>
                  <td className="px-3 py-3 text-sm text-gray-500">{wh.address || "-"}</td>
                  <td className="px-3 py-3">
                    {wh.isDefault && <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">Ya</span>}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setEditingWarehouse(wh); setFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"><Pencil className="size-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination - Ketoko Style */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, total)} dari {total.toLocaleString("id-ID")}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="border-gray-200 px-2"><ChevronLeft className="size-4" /></Button>
            <span className="px-3 py-1 text-sm text-gray-600">Hal {currentPage} / {totalPages || 1}</span>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="border-gray-200 px-2"><ChevronRight className="size-4" /></Button>
          </div>
        </div>
      </div>

      <WarehouseForm open={formOpen} onClose={() => { setFormOpen(false); setEditingWarehouse(null); }} onSave={() => { setFormOpen(false); fetchWarehouses(); }} initialData={editingWarehouse || undefined} isEditing={!!editingWarehouse} />
    </PageWrapper>
  );
}
