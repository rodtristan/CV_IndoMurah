"use client";

<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Download, Upload, Barcode, Image, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/pos/Modal";
import { ConfirmDialog } from "@/components/pos/ConfirmDialog";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/DataTable";
import { api } from "@/lib/api";
import type { Product, Category, Brand, Unit, Warehouse } from "@/types/pos";
=======
import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Filter, ChevronLeft, ChevronRight, Download, Upload, MoreVertical, Check, X } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ItemForm } from "@/components/pos/master/ItemForm";
import { mockProducts, mockWarehouses } from "@/lib/mock-data-pos";
import type { Product } from "@/types/pos";
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

interface ProductFormData {
  code: string;
  barcode: string;
  name: string;
  categoryId: number | null;
  unitId: number;
  brandId: number | null;
  warehouseId: number | null;
  purchasePrice: number;
  sellingPrice: number;
  discountPercent: number;
  stock: number;
  minimumStock: number;
  image?: string;
  description?: string;
}

export default function ItemsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
<<<<<<< HEAD
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Related data for forms
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    code: "",
    barcode: "",
    name: "",
    categoryId: null,
    unitId: 1,
    brandId: null,
    warehouseId: null,
    purchasePrice: 0,
    sellingPrice: 0,
    discountPercent: 0,
    stock: 0,
    minimumStock: 0,
    image: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  // Fetch related data
  const fetchFormData = useCallback(async () => {
    try {
      const [categoriesRes, brandsRes, unitsRes, warehousesRes] = await Promise.all([
        api.getCategories(),
        api.getBrands(),
        api.getUnits(),
        api.getWarehouses(),
      ]);

      if (categoriesRes.success) setCategories(categoriesRes.data || []);
      if (brandsRes.success) setBrands(brandsRes.data || []);
      if (unitsRes.success) setUnits(unitsRes.data || []);
      if (warehousesRes.success) setWarehouses(warehousesRes.data || []);
    } catch (error) {
      console.error("Failed to fetch form data:", error);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        $skip: (page - 1) * pageSize,
        $take: pageSize,
        $orderBy: { createdAt: "desc" },
      };

      if (search) {
        params.$search = search;
      }

      if (categoryFilter) {
        params.$where = { ...(params.$where as object || {}), categoryId: parseInt(categoryFilter) };
      }

      if (warehouseFilter) {
        params.$where = { ...(params.$where as object || {}), warehouseId: parseInt(warehouseFilter) };
      }

      const response = await api.getProducts(params as any);

      if (response.success) {
        setProducts(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, warehouseFilter, pageSize]);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        code: product.code,
        barcode: product.barcode || "",
        name: product.name,
        categoryId: product.categoryId || null,
        unitId: product.unitId,
        brandId: product.brandId || null,
        warehouseId: product.warehouseId || null,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        discountPercent: product.discountPercent,
        stock: product.stock,
        minimumStock: product.minimumStock,
        image: product.image || "",
        description: product.description || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        code: "",
        barcode: "",
        name: "",
        categoryId: null,
        unitId: units[0]?.id || 1,
        brandId: null,
        warehouseId: null,
        purchasePrice: 0,
        sellingPrice: 0,
        discountPercent: 0,
        stock: 0,
        minimumStock: 0,
        image: "",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: formData.code,
        barcode: formData.barcode || undefined,
        name: formData.name,
        categoryId: formData.categoryId,
        unitId: formData.unitId,
        brandId: formData.brandId,
        warehouseId: formData.warehouseId,
        purchasePrice: formData.purchasePrice,
        sellingPrice: formData.sellingPrice,
        discountPercent: formData.discountPercent,
        stock: formData.stock,
        minimumStock: formData.minimumStock,
        image: formData.image || undefined,
        description: formData.description || undefined,
      };

      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, payload);
        if (!res.success) {
          alert(res.message || "Gagal mengupdate produk");
          return;
        }
      } else {
        const res = await api.createProduct(payload);
        if (!res.success) {
          alert(res.message || "Gagal membuat produk");
          return;
        }
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setSaving(true);
    try {
      const res = await api.deleteProduct(deletingProduct.id);
      if (res.success) {
        setIsDeleteConfirmOpen(false);
        setDeletingProduct(null);
        fetchProducts();
      } else {
        alert(res.message || "Gagal menghapus produk");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Terjadi kesalahan saat menghapus");
    } finally {
      setSaving(false);
    }
  };

  // Generate barcode
  const generateBarcode = () => {
    const barcode = Date.now().toString().slice(-12);
    setFormData({ ...formData, barcode });
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { label: "Out of Stock", color: "error" as const };
    if (stock <= minStock) return { label: "Low Stock", color: "warning" as const };
    return { label: "In Stock", color: "success" as const };
  };

  const columns = [
    {
      key: "image",
      label: "",
      width: "60px",
      render: (_: unknown, row: Product) => (
        <div className="size-10 overflow-hidden rounded bg-elevated flex items-center justify-center">
          {row.image ? (
            <img src={row.image} alt={row.name} className="size-full object-cover" />
          ) : (
            <span className="text-lg">📦</span>
          )}
        </div>
      ),
    },
    {
      key: "code",
      label: "Kode",
      sortable: true,
      render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span>,
    },
    {
      key: "name",
      label: "Nama",
      sortable: true,
      render: (v: unknown, row: Product) => (
        <div className="max-w-[200px]">
          <div className="font-medium truncate">{v as string}</div>
          {row.barcode && <div className="text-xs text-muted font-mono">{row.barcode}</div>}
        </div>
      ),
    },
    {
      key: "category",
      label: "Kategori",
      render: (_: unknown, row: Product) => row.category?.name || "-",
    },
    {
      key: "brand",
      label: "Merek",
      render: (_: unknown, row: Product) => row.brand?.name || "-",
    },
    {
      key: "unit",
      label: "Satuan",
      render: (_: unknown, row: Product) => row.unit?.name || "-",
    },
    {
      key: "purchasePrice",
      label: "Harga Beli",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => formatCurrency(v as number),
    },
    {
      key: "sellingPrice",
      label: "Harga Jual",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => (
        <span className="font-semibold text-primary">{formatCurrency(v as number)}</span>
      ),
    },
    {
      key: "stock",
      label: "Stok",
      align: "center" as const,
      sortable: true,
      render: (v: unknown, row: Product) => (
        <span
          className={cn(
            "font-medium",
            (v as number) <= 0 ? "text-error" : (v as number) <= row.minimumStock ? "text-warning" : ""
          )}
        >
          {v as number}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center" as const,
      render: (_: unknown, row: Product) => {
        const status = getStockStatus(row.stock, row.minimumStock);
        return <Badge color={status.color} variant="subtle">{status.label}</Badge>;
      },
    },
    {
      key: "actions",
      label: "",
      align: "center" as const,
      render: (_: unknown, row: Product) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} title="Edit">
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeletingProduct(row);
              setIsDeleteConfirmOpen(true);
            }}
            title="Hapus"
          >
            <Trash2 className="size-4 text-error" />
          </Button>
        </div>
      ),
    },
  ];

=======
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

>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Produk"
        subtitle={`Total: ${total} item`}
        actions={
<<<<<<< HEAD
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={Upload}>
              Import
            </Button>
            <Button variant="outline" size="sm" icon={Download}>
              Export
            </Button>
            <Button onClick={() => handleOpenModal()} icon={Plus}>
              Tambah Produk
=======
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Download className="size-4 mr-2" /> Export
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300">
              <Upload className="size-4 mr-2" /> Import
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Plus className="size-4 mr-2" /> Tambah
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
            </Button>
          </div>
        }
      />

<<<<<<< HEAD
      {/* Search and Filters */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Cari kode, nama, atau barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-default bg-bg px-3 py-2 text-sm"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={warehouseFilter}
          onChange={(e) => {
            setWarehouseFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-default bg-bg px-3 py-2 text-sm"
        >
          <option value="">Semua Gudang</option>
          {warehouses.map((wh) => (
            <option key={wh.id} value={wh.id}>
              {wh.name}
            </option>
          ))}
        </select>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchProducts} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={products}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada produk ditemukan"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Kode *</label>
              <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required placeholder="BRG001" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Barcode</label>
              <div className="flex gap-2">
                <Input value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} placeholder="8991234567890" className="flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={generateBarcode} title="Generate Barcode">
                  <Barcode className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Nama Produk *</label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Nama produk" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Kategori</label>
              <select
                value={formData.categoryId || ""}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Merek</label>
              <select
                value={formData.brandId || ""}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              >
                <option value="">Pilih Merek</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Harga Beli *</label>
              <Input type="number" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })} required min={0} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Harga Jual *</label>
              <Input type="number" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })} required min={0} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Stok</label>
              <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} min={0} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Stok Minimum</label>
              <Input type="number" value={formData.minimumStock} onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })} min={0} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Diskon (%)</label>
              <Input type="number" value={formData.discountPercent} onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })} min={0} max={100} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Satuan</label>
              <select
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: Number(e.target.value) })}
                className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              >
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name} ({unit.abbreviation || unit.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Gudang</label>
              <select
                value={formData.warehouseId || ""}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              >
                <option value="">Pilih Gudang</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">URL Gambar</label>
            <div className="flex gap-2">
              <Input value={formData.image || ""} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://example.com/image.jpg" className="flex-1" />
              <Button type="button" variant="outline" size="sm" title="Preview Image">
                <Image className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Deskripsi</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              placeholder="Deskripsi produk..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : editingProduct ? "Update" : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setDeletingProduct(null);
        }}
        title="Hapus Produk?"
        message={`Yakin ingin menghapus produk "${deletingProduct?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        loading={saving}
=======
      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kode atau nama item..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <Button variant="outline" size="sm" className="border-gray-200">
              <Filter className="size-4 mr-2" /> Filter
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            {selectedItems.length > 0 ? (
              <span>{selectedItems.length} dipilih</span>
            ) : (
              <span>{filteredData.length} data</span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 text-left">
                <th className="px-4 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Nama Item</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Satuan</th>
                <th className="px-4 py-3 font-medium">Gudang</th>
                <th className="px-4 py-3 font-medium text-right">Harga Beli</th>
                <th className="px-4 py-3 font-medium text-right">Harga Jual</th>
                <th className="px-4 py-3 font-medium text-right">Stok</th>
                <th className="px-4 py-3 font-medium text-right">Min. Stok</th>
                <th className="px-4 py-3 font-medium text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => handleSelect(item.id, e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.categoryName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.unitName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {mockWarehouses.find(w => w.id === item.warehouseId)?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatCurrency(item.purchasePrice)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.sellPrice)}</td>
                  <td className={cn(
                    "px-4 py-3 text-sm font-medium text-right",
                    item.stock === 0 ? "text-red-600" :
                    item.stock <= item.minStock ? "text-orange-600" : "text-gray-700"
                  )}>
                    {item.stock} {item.unitName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">{item.minStock}</td>
                  <td className="px-4 py-3">
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
                  <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                    Tidak ada data item
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="border-gray-200"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-8 h-8 rounded text-sm font-medium transition-colors",
                  currentPage === page
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                {page}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="border-gray-200"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <ItemForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingItem(null); }}
        onSave={() => setFormOpen(false)}
        initialData={editingItem || undefined}
        isEditing={!!editingItem}
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
      />
    </PageWrapper>
  );
}
