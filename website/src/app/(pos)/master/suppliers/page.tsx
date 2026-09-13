"use client";

<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/pos/Modal";
import { ConfirmDialog } from "@/components/pos/ConfirmDialog";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/DataTable";
import { api } from "@/lib/api";
=======
import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Filter, ChevronLeft, ChevronRight, Download, MoreVertical } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { SupplierForm } from "@/components/pos/master/SupplierForm";
import { mockSuppliers } from "@/lib/mock-data-pos";
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
import type { Supplier } from "@/types/pos";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

interface SupplierFormData {
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<SupplierFormData>({
    code: "",
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
  });

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        $skip: (page - 1) * pageSize,
        $take: pageSize,
      };

      if (search) {
        params.$search = search;
      }

      const response = await api.getSuppliers(params as any);

      if (response.success) {
        setSuppliers(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, pageSize]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        code: supplier.code,
        name: supplier.name,
        contactPerson: supplier.contactPerson || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        city: (supplier as any).city || "",
        notes: supplier.notes || "",
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        code: "",
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        notes: "",
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
        contactPerson: formData.contactPerson || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        notes: formData.notes || undefined,
      };

      if (editingSupplier) {
        const res = await api.updateSupplier(editingSupplier.id, payload);
        if (!res.success) {
          alert(res.message || "Gagal mengupdate supplier");
          return;
        }
      } else {
        const res = await api.createSupplier(payload);
        if (!res.success) {
          alert(res.message || "Gagal membuat supplier");
          return;
        }
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      console.error("Failed to save supplier:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;
    setSaving(true);
    try {
      const res = await api.deleteSupplier(deletingSupplier.id);
      if (res.success) {
        setIsDeleteConfirmOpen(false);
        setDeletingSupplier(null);
        fetchSuppliers();
      } else {
        alert(res.message || "Gagal menghapus supplier");
      }
    } catch (error) {
      console.error("Failed to delete supplier:", error);
      alert("Terjadi kesalahan saat menghapus");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "code",
      label: "Kode",
      sortable: true,
      render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span>,
    },
    {
      key: "name",
      label: "Nama Supplier",
      sortable: true,
      render: (v: unknown, row: Supplier) => (
        <div>
          <div className="font-medium">{v as string}</div>
          {row.contactPerson && (
            <div className="text-xs text-muted">{row.contactPerson}</div>
          )}
        </div>
      ),
    },
    {
      key: "phone",
      label: "Telepon",
      render: (v: unknown) => v || "-",
    },
    {
      key: "email",
      label: "Email",
      render: (v: unknown) => v || "-",
    },
    {
      key: "totalDebt",
      label: "Total Hutang",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => (
        <span className="font-medium text-error">{formatCurrency(v as number)}</span>
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
      render: (_: unknown, row: Supplier) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} title="Edit">
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeletingSupplier(row);
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
  const [suppliers] = useState<Supplier[]>(mockSuppliers);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const itemsPerPage = 10;

  const filteredData = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
<<<<<<< HEAD
        title="Supplier"
        subtitle={`Total: ${total} supplier`}
        actions={
          <Button onClick={() => handleOpenModal()} icon={Plus}>
            Tambah Supplier
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Cari supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={fetchSuppliers}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={suppliers}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada supplier ditemukan"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? "Edit Supplier" : "Tambah Supplier Baru"}
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
                placeholder="SUP001"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nama Supplier *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nama supplier"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Contact Person</label>
              <Input
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Nama kontak"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Telepon</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="021-12345678"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="supplier@email.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Alamat</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              placeholder="Alamat supplier..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Kota</label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Kota"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Catatan</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              placeholder="Catatan tambahan..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : editingSupplier ? "Update" : "Simpan"}
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
          setDeletingSupplier(null);
        }}
        title="Hapus Supplier?"
        message={`Yakin ingin menghapus supplier "${deletingSupplier?.name}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        loading={saving}
=======
        title="Master / Supplier"
        subtitle="Kelola daftar supplier"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Download className="size-4 mr-2" /> Export
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setEditingSupplier(null); setFormOpen(true); }}>
              <Plus className="size-4 mr-2" /> Tambah Supplier
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari supplier..."
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
            {filteredData.length} data
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 text-left">
                <th className="px-4 py-3 font-medium w-10">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                </th>
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Nama Supplier</th>
                <th className="px-4 py-3 font-medium">Contact Person</th>
                <th className="px-4 py-3 font-medium">Telepon</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Kota</th>
                <th className="px-4 py-3 font-medium text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{supplier.code}</td>
                  <td className="px-4 py-3 text-sm font-medium text-purple-600">{supplier.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{supplier.contactPerson || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{supplier.phone || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{supplier.email || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{supplier.city || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => { setEditingSupplier(supplier); setFormOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                        title="Edit"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Hapus">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    Tidak ada data supplier
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
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="border-gray-200">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm text-gray-600 px-2">Halaman {currentPage} dari {totalPages || 1}</span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="border-gray-200">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <SupplierForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingSupplier(null); }}
        onSave={() => setFormOpen(false)}
        initialData={editingSupplier || undefined}
        isEditing={!!editingSupplier}
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
      />
    </PageWrapper>
  );
}
