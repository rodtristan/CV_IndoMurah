"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { SalesForm } from "@/components/pos/master/SalesForm";
import { api } from "@/lib/api";
import type { SalesPerson } from "@/types/pos";
import { cn } from "@/lib/utils";

export default function SalesPage() {
  const [sales, setSales] = useState<SalesPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<"code" | "name">("code");
  const itemsPerPage = 10;
  const [formOpen, setFormOpen] = useState(false);
  const [editingSales, setEditingSales] = useState<SalesPerson | null>(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        $skip: (currentPage - 1) * itemsPerPage,
        $take: itemsPerPage,
        $orderBy: { [sortBy]: "asc" },
      };

      if (search) {
        params.$search = search;
      }

      // Note: Using customers endpoint as a placeholder since sales-persons might be under different name
      // Adjust endpoint based on actual backend API
      const response = await api.getCustomers(params as any);
      if (response.success && response.data && Array.isArray(response.data)) {
        // Map customer data to sales person structure for display
        const salesData = response.data.map((c: any) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          phone: c.phone,
          email: c.email,
          address: c.address,
          isActive: c.isActive,
        })) as SalesPerson[];
        setSales(salesData);
        if (response.meta) {
          setTotal(response.meta.total);
          setTotalPages(response.meta.pages);
        }
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, search, sortBy]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(sales.map((item) => item.id));
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
    fetchSales();
  };

  return (
    <PageWrapper className="bg-gray-100">
      {/* Header - Ketoko Style */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Daftar Sales</h1>
            <p className="text-sm text-gray-500">Total data yang ditemukan : {total.toLocaleString("id-ID")}.</p>
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
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 pr-4 py-2 w-48 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Urut Berdasar */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Urut Berdasar :</span>
            <select
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "code" | "name")}
            >
              <option value="code">Kode</option>
              <option value="name">Nama</option>
            </select>
          </div>

          {/* Search Button */}
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
                  checked={selectedItems.length === sales.length && sales.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Kode ↕</th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Nama Sales ↕</th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Telepon ↕</th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Email ↕</th>
              <th className="px-3 py-3 font-medium cursor-pointer hover:text-purple-600">Status ↕</th>
              <th className="px-3 py-3 font-medium text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  Memuat data...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  Tidak ada data sales
                </td>
              </tr>
            ) : (
              sales.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(s.id)}
                      onChange={(e) => handleSelect(s.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-900">{s.code}</td>
                  <td className="px-3 py-3 text-sm font-medium text-purple-600">{s.name}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{s.phone || "-"}</td>
                  <td className="px-3 py-3 text-sm text-gray-500">{s.email || "-"}</td>
                  <td className="px-3 py-3">
                    <span className={cn("inline-flex px-2 py-0.5 text-xs font-medium rounded-full", s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
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

      <SalesForm open={formOpen} onClose={() => { setFormOpen(false); setEditingSales(null); }} onSave={() => { setFormOpen(false); fetchSales(); }} initialData={editingSales || undefined} isEditing={!!editingSales} />
    </PageWrapper>
  );
}
