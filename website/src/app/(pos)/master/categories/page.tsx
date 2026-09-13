"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Image, RefreshCw, Palette } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/pos/Modal";
import { ConfirmDialog } from "@/components/pos/ConfirmDialog";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/DataTable";
import { api } from "@/lib/api";
import type { Category } from "@/types/pos";
import { cn } from "@/lib/utils";

// Available icons for categories
const CATEGORY_ICONS = [
  "🍔", "🍕", "🍜", "🍰", "☕", "🧃", "🍎", "🥗",
  "🧴", "🧹", "👕", "👖", "👟", "🎒", "📱", "💻",
  "📚", "✏️", "🎨", "🎮", "🏠", "🌿", "🔧", "💡",
];

interface CategoryFormData {
  code: string;
  name: string;
  icon: string;
  image: string;
  description: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    code: "",
    name: "",
    icon: "📦",
    image: "",
    description: "",
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        $skip: (page - 1) * pageSize,
        $take: pageSize,
        $orderBy: { sortOrder: "asc" },
      };

      if (search) {
        params.$search = search;
      }

      const response = await api.getCategories(params as any);

      if (response.success) {
        setCategories(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, pageSize]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        code: category.code,
        name: category.name,
        icon: (category as any).icon || "📦",
        image: category.image || "",
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        code: "",
        name: "",
        icon: "📦",
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
        name: formData.name,
        icon: formData.icon,
        image: formData.image || undefined,
        description: formData.description || undefined,
      };

      if (editingCategory) {
        const res = await api.updateCategory(editingCategory.id, payload);
        if (!res.success) {
          alert(res.message || "Gagal mengupdate kategori");
          return;
        }
      } else {
        const res = await api.createCategory(payload);
        if (!res.success) {
          alert(res.message || "Gagal membuat kategori");
          return;
        }
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setSaving(true);
    try {
      const res = await api.deleteCategory(deletingCategory.id);
      if (res.success) {
        setIsDeleteConfirmOpen(false);
        setDeletingCategory(null);
        fetchCategories();
      } else {
        alert(res.message || "Gagal menghapus kategori");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Terjadi kesalahan saat menghapus");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "icon",
      label: "",
      width: "50px",
      render: (v: unknown) => (
        <div className="size-10 flex items-center justify-center rounded-lg bg-elevated text-xl">
          {(v as string) || "📦"}
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
      label: "Nama Kategori",
      sortable: true,
      render: (v: unknown, row: Category) => (
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
      label: "Jumlah Produk",
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
      render: (_: unknown, row: Category) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} title="Edit">
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeletingCategory(row);
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

  return (
    <PageWrapper>
      <PageTitle
        title="Kategori"
        subtitle={`Total: ${total} kategori`}
        actions={
          <Button onClick={() => handleOpenModal()} icon={Plus}>
            Tambah Kategori
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={fetchCategories}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={categories}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada kategori ditemukan"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
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
                placeholder="KAT001"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nama Kategori *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nama kategori"
              />
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              <Palette className="inline size-4 mr-1" />
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {CATEGORY_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={cn(
                    "size-10 flex items-center justify-center rounded-lg border text-xl transition-colors hover:bg-elevated",
                    formData.icon === icon ? "border-primary bg-primary/10" : "border-default"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">URL Gambar</label>
            <div className="flex gap-2">
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" title="Preview">
                <Image className="size-4" />
              </Button>
            </div>
            {formData.image && (
              <div className="mt-2 size-20 overflow-hidden rounded-lg border">
                <img src={formData.image} alt="Preview" className="size-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              placeholder="Deskripsi kategori..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : editingCategory ? "Update" : "Simpan"}
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
          setDeletingCategory(null);
        }}
        title="Hapus Kategori?"
        message={`Yakin ingin menghapus kategori "${deletingCategory?.name}"? Produk dalam kategori ini mungkin perlu dipindahkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}
