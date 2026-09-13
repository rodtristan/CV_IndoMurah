"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download, Upload } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { ItemForm } from "@/components/pos/master/ItemForm";
import { api } from "@/lib/api";
import type { Product, Category, Brand, Unit, Warehouse, PaginatedResponse } from "@/types/pos";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function ItemsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [itemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Filter options
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [showDiscontinued, setShowDiscontinued] = useState(false);
  const [sortBy, setSortBy] = useState<string>("code");

  // Fetch items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        $skip: (currentPage - 1) * itemsPerPage,
        $take: itemsPerPage,
        $orderBy: { [sortBy]: "asc" },
        $include: "category,brand,unit,warehouse",
      };

      if (search) {
        params.$search = search;
      }
      if (selectedCategory) {
        params["$where[categoryId]"] = selectedCategory;
      }
      if (selectedBrand) {
        params["$where[brandId]"] = selectedBrand;
      }
      if (selectedWarehouse) {
        params["$where[warehouseId]"] = selectedWarehouse;
      }

      const response = await api.getProducts(params as any);
      if (response.success && response.data) {
        setItems(Array.isArray(response.data) ? response.data : []);
        if (response.meta) {
          setTotal(response.meta.total);
          setTotalPages(response.meta.pages);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, search, selectedCategory, selectedBrand, selectedWarehouse, sortBy]);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const [categoriesRes, brandsRes, warehousesRes] = await Promise.all([
        api.getCategories({ $select: "id,code,name" }),
        api.getBrands({ $select: "id,code,name" }),
        api.getWarehouses({ $select: "id,code,name" }),
      ]);

      if (categoriesRes.success) setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      if (brandsRes.success) setBrands(Array.isArray(brandsRes.data) ? brandsRes.data : []);
      if (warehousesRes.success) setWarehouses(Array.isArray(warehousesRes.data) ? warehousesRes.data : []);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map((item) => item.id));
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
    fetchItems();
  };

  return (
    <PageWrapper className="bg-gray-100">
      {/* Header - Ketoko Style */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Daftar Item</h1>
            <p className="text-sm text-gray-500">Total data yang ditemukan : {total.toLocaleString("id-ID")}.</p>
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
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 pr-4 py-2 w-48 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Dept/Gudang */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Dept/Gudang :</span>
            <select
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white"
              value={selectedWarehouse || ""}
              onChange={(e) => setSelectedWarehouse(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Semua</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
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
            <select
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white"
              value={selectedBrand || ""}
              onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Semua</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
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
            <select
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="code">Kode Item</option>
              <option value="name">Nama Item</option>
              <option value="stock">Stok</option>
            </select>
          </div>

          {/* Toggle - Tidak Dijual/Discontinued */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Tidak Dijual / Discontinued :</span>
            <button
              onClick={() => setShowDiscontinued(!showDiscontinued)}
              className={cn(
                "px-3 py-1 text-sm border rounded transition-colors",
                showDiscontinued
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-gray-50 text-gray-400 border-gray-200"
              )}
            >
              {showDiscontinued ? "ON" : "OFF"}
            </button>
          </div>

          {/* Search Button */}
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={handleSearch}>
            <Search className="size-4 mr-1" /> Cari
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 text-left">
                <th className="px-3 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === items.length && items.length > 0}
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
              {loading ? (
                <tr>
                  <td colSpan={15} className="px-4 py-12 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-4 py-12 text-center text-gray-400">
                    Tidak ada data item
                  </td>
                </tr>
              ) : (
                items.map((item) => (
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
                      item.stock <= (item.minStock || item.minimumStock) ? "text-orange-600" : "text-gray-700"
                    )}>
                      {item.stock.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500">{(item.unit as any)?.abbreviation || "-"}</td>
                    <td className="px-3 py-3 text-sm text-gray-500">{item.itemType || "-"}</td>
                    <td className="px-3 py-3 text-sm text-gray-500">{item.brand?.name || item.brandName || "-"}</td>
                    <td className="px-3 py-3 text-sm text-gray-500">{item.rack || "-"}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-right">{formatCurrency(item.purchasePrice)}</td>
                    <td className="px-3 py-3 text-sm text-gray-500 text-right">{formatCurrency(item.hppAverage || 0)}</td>
                    <td className="px-3 py-3 text-sm font-medium text-purple-600 text-right">{formatCurrency(item.sellingPrice || item.sellPrice)}</td>
                    <td className="px-3 py-3 text-sm text-gray-400 max-w-[150px] truncate">{item.notes || item.description || "-"}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Ketoko Style */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, total)} dari {total.toLocaleString("id-ID")}
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
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="border-gray-200 px-2"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <ItemForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingItem(null); }}
        onSave={() => { setFormOpen(false); fetchItems(); }}
        initialData={editingItem || undefined}
        isEditing={!!editingItem}
      />
    </PageWrapper>
  );
}
