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
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { WarehouseForm } from "@/components/pos/master/WarehouseForm";
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
import type { Warehouse } from "@/types/pos";

interface WarehouseFormData {
  code: string;
  name: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
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
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<WarehouseFormData>({
    code: "",
    name: "",
    address: "",
    phone: "",
    isDefault: false,
  });

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        $skip: (page - 1) * pageSize,
        $take: pageSize,
      };

      if (search) {
        params.$search = search;
      }

      const response = await api.getWarehouses(params as any);

      if (response.success) {
        setWarehouses(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, pageSize]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenModal = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setFormData({
        code: warehouse.code,
        name: warehouse.name,
        address: warehouse.address || "",
        phone: warehouse.phone || "",
        isDefault: warehouse.isDefault,
      });
    } else {
      setEditingWarehouse(null);
      setFormData({
        code: "",
        name: "",
        address: "",
        phone: "",
        isDefault: false,
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
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        isDefault: formData.isDefault,
      };

      if (editingWarehouse) {
        const res = await api.updateWarehouse(editingWarehouse.id, payload);
        if (!res.success) {
          alert(res.message || "Gagal mengupdate gudang");
          return;
        }
      } else {
        const res = await api.createWarehouse(payload);
        if (!res.success) {
          alert(res.message || "Gagal membuat gudang");
          return;
        }
      }
      setIsModalOpen(false);
      fetchWarehouses();
    } catch (error) {
      console.error("Failed to save warehouse:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingWarehouse) return;
    setSaving(true);
    try {
      const res = await api.deleteWarehouse(deletingWarehouse.id);
      if (res.success) {
        setIsDeleteConfirmOpen(false);
        setDeletingWarehouse(null);
        fetchWarehouses();
      } else {
        alert(res.message || "Gagal menghapus gudang");
      }
    } catch (error) {
      console.error("Failed to delete warehouse:", error);
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
      label: "Nama Gudang",
      sortable: true,
      render: (v: unknown, row: Warehouse) => (
        <div>
          <div className="font-medium">{v as string}</div>
          {row.address && <div className="text-xs text-muted truncate max-w-[200px]">{row.address}</div>}
        </div>
      ),
    },
    {
      key: "phone",
      label: "Telepon",
      render: (v: unknown) => v || "-",
    },
    {
      key: "isDefault",
      label: "Default",
      align: "center" as const,
      render: (v: unknown) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            v ? "bg-purple-500/20 text-purple-400" : "bg-slate-500/20 text-slate-400"
          }`}
        >
          {v ? "Ya" : "Tidak"}
        </span>
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
      render: (_: unknown, row: Warehouse) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} title="Edit">
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeletingWarehouse(row);
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
        title="Gudang"
        subtitle={`Total: ${total} gudang`}
        actions={
          <Button onClick={() => handleOpenModal()} icon={Plus}>
            Tambah Gudang
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Cari gudang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={fetchWarehouses}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={warehouses}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada gudang ditemukan"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarehouse ? "Edit Gudang" : "Tambah Gudang Baru"}
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
                placeholder="GD001"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nama Gudang *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nama gudang"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Alamat</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              placeholder="Alamat gudang..."
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="size-4 rounded border-slate-600 bg-bg text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="isDefault" className="text-sm font-medium">
              Gudang Default
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : editingWarehouse ? "Update" : "Simpan"}
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
          setDeletingWarehouse(null);
        }}
        title="Hapus Gudang?"
        message={`Yakin ingin menghapus gudang "${deletingWarehouse?.name}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        loading={saving}
      />
=======
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
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
    </PageWrapper>
  );
}
