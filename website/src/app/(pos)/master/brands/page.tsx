"use client";

<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, RefreshCw, Image } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/pos/Modal";
import { ConfirmDialog } from "@/components/pos/ConfirmDialog";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/DataTable";
import { api } from "@/lib/api";
import type { Brand } from "@/types/pos";

interface BrandFormData {
  code: string;
  name: string;
  description: string;
  logoUrl: string;
}
=======
import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Filter, ChevronLeft, ChevronRight, Download, Upload } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
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
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
<<<<<<< HEAD
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<BrandFormData>({
    code: "",
    name: "",
    description: "",
    logoUrl: "",
  });

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        $skip: (page - 1) * pageSize,
        $take: pageSize,
      };

      if (search) {
        params.$search = search;
      }

      const response = await api.getBrands(params as any);

      if (response.success) {
        setBrands(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, pageSize]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        code: brand.code,
        name: brand.name,
        description: brand.description || "",
        logoUrl: brand.logoUrl || "",
      });
    } else {
      setEditingBrand(null);
      setFormData({
        code: "",
        name: "",
        description: "",
        logoUrl: "",
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
        name: formData.name,
        description: formData.description || undefined,
        logoUrl: formData.logoUrl || undefined,
      };

      if (editingBrand) {
        const res = await api.updateBrand(editingBrand.id, payload);
        if (!res.success) {
          alert(res.message || "Gagal mengupdate merek");
          return;
        }
      } else {
        const res = await api.createBrand(payload);
        if (!res.success) {
          alert(res.message || "Gagal membuat merek");
          return;
        }
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (error) {
      console.error("Failed to save brand:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBrand) return;
    setSaving(true);
    try {
      const res = await api.deleteBrand(deletingBrand.id);
      if (res.success) {
        setIsDeleteConfirmOpen(false);
        setDeletingBrand(null);
        fetchBrands();
      } else {
        alert(res.message || "Gagal menghapus merek");
      }
    } catch (error) {
      console.error("Failed to delete brand:", error);
      alert("Terjadi kesalahan saat menghapus");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "logoUrl",
      label: "",
      width: "60px",
      render: (v: unknown, row: Brand) => (
        <div className="size-10 overflow-hidden rounded bg-elevated flex items-center justify-center">
          {v ? (
            <img src={v as string} alt={row.name} className="size-full object-contain" />
          ) : (
            <span className="text-lg">🏷️</span>
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
      label: "Nama Merek",
      sortable: true,
      render: (v: unknown, row: Brand) => (
        <div>
          <div className="font-medium">{v as string}</div>
          {row.description && (
            <div className="text-xs text-muted truncate max-w-[200px]">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      key: "productCount",
      label: "Total Produk",
      align: "center" as const,
      render: (v: unknown) => (
        <Badge variant="subtle">{(v as number) || 0} produk</Badge>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      align: "center" as const,
      render: (v: unknown) => (
        <Badge color={v ? "success" : "default"} variant="subtle">
          {v ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "center" as const,
      render: (_: unknown, row: Brand) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} title="Edit">
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeletingBrand(row);
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

>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
<<<<<<< HEAD
        title="Merek"
        subtitle={`Total: ${total} merek`}
        actions={
          <Button onClick={() => handleOpenModal()} icon={Plus}>
            Tambah Merek
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Cari merek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={fetchBrands}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={brands}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada merek ditemukan"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? "Edit Merek" : "Tambah Merek Baru"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Kode *</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="MRK001"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nama Merek *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nama merek"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              placeholder="Deskripsi merek..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">URL Logo</label>
            <div className="flex gap-2">
              <Input
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" title="Preview">
                <Image className="size-4" />
              </Button>
            </div>
            {formData.logoUrl && (
              <div className="mt-2 size-20 overflow-hidden rounded-lg border flex items-center justify-center bg-elevated">
                <img src={formData.logoUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : editingBrand ? "Update" : "Simpan"}
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
          setDeletingBrand(null);
        }}
        title="Hapus Merek?"
        message={`Yakin ingin menghapus merek "${deletingBrand?.name}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        loading={saving}
=======
        title="Master / Merek"
        subtitle="Kelola merek barang dagangan"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Download className="size-4 mr-2" /> Export
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300">
              <Upload className="size-4 mr-2" /> Import
            </Button>
            <Button size="sm" className="bg-[#9C27B0] hover:bg-[#7B1FA2]" onClick={() => { setEditingBrand(null); setFormOpen(true); }}>
              <Plus className="size-4 mr-2" /> Tambah
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Merek</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{filteredData.length}</span>
            <span className="text-xs text-gray-500">Merek</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari merek..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#9C27B0] focus:ring-1 focus:ring-[#9C27B0]"
              />
            </div>
            <Button variant="outline" size="sm" className="border-gray-200">
              <Filter className="size-4 mr-2" /> Filter
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            {selectedItems.length > 0 ? <span>{selectedItems.length} dipilih</span> : <span>{filteredData.length} data</span>}
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 text-left">
              <th className="px-4 py-3 font-medium w-10">
                <input
                  type="checkbox"
                  checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-[#9C27B0] focus:ring-[#9C27B0]"
                />
              </th>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nama Merek</th>
              <th className="px-4 py-3 font-medium">Deskripsi</th>
              <th className="px-4 py-3 font-medium text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((brand) => (
              <tr key={brand.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(brand.id)}
                    onChange={(e) => handleSelect(brand.id, e.target.checked)}
                    className="rounded border-gray-300 text-[#9C27B0] focus:ring-[#9C27B0]"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{brand.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{brand.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{brand.description || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => { setEditingBrand(brand); setFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#9C27B0] hover:bg-purple-50 rounded">
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

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="border-gray-200">
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-8 h-8 rounded text-sm font-medium transition-colors",
                  currentPage === page
                    ? "bg-[#9C27B0] text-white hover:bg-[#7B1FA2]"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                {page}
              </button>
            ))}
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="border-gray-200">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <BrandForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingBrand(null); }}
        onSave={() => setFormOpen(false)}
        initialData={editingBrand || undefined}
        isEditing={!!editingBrand}
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
      />
    </PageWrapper>
  );
}
