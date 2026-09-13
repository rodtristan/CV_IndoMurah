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
import type { Unit } from "@/types/pos";

interface UnitFormData {
  code: string;
  name: string;
  abbreviation: string;
  description: string;
}
=======
import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Filter, ChevronLeft, ChevronRight, Download, Upload } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
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
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
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
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UnitFormData>({
    code: "",
    name: "",
    abbreviation: "",
    description: "",
  });

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        $skip: (page - 1) * pageSize,
        $take: pageSize,
      };

      if (search) {
        params.$search = search;
      }

      const response = await api.getUnits(params as any);

      if (response.success) {
        setUnits(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch units:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, pageSize]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        code: unit.code,
        name: unit.name,
        abbreviation: unit.abbreviation || "",
        description: unit.description || "",
      });
    } else {
      setEditingUnit(null);
      setFormData({
        code: "",
        name: "",
        abbreviation: "",
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
        abbreviation: formData.abbreviation || undefined,
        description: formData.description || undefined,
      };

      if (editingUnit) {
        const res = await api.updateUnit(editingUnit.id, payload);
        if (!res.success) {
          alert(res.message || "Gagal mengupdate satuan");
          return;
        }
      } else {
        const res = await api.createUnit(payload);
        if (!res.success) {
          alert(res.message || "Gagal membuat satuan");
          return;
        }
      }
      setIsModalOpen(false);
      fetchUnits();
    } catch (error) {
      console.error("Failed to save unit:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUnit) return;
    setSaving(true);
    try {
      const res = await api.deleteUnit(deletingUnit.id);
      if (res.success) {
        setIsDeleteConfirmOpen(false);
        setDeletingUnit(null);
        fetchUnits();
      } else {
        alert(res.message || "Gagal menghapus satuan");
      }
    } catch (error) {
      console.error("Failed to delete unit:", error);
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
      label: "Nama Satuan",
      sortable: true,
      render: (v: unknown, row: Unit) => (
        <div>
          <div className="font-medium">{v as string}</div>
          {row.description && (
            <div className="text-xs text-muted truncate max-w-[200px]">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      key: "abbreviation",
      label: "Singkatan",
      render: (v: unknown) => v || "-",
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
      render: (_: unknown, row: Unit) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} title="Edit">
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeletingUnit(row);
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

>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
<<<<<<< HEAD
        title="Satuan"
        subtitle={`Total: ${total} satuan`}
        actions={
          <Button onClick={() => handleOpenModal()} icon={Plus}>
            Tambah Satuan
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Cari satuan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={fetchUnits}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={units}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada satuan ditemukan"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUnit ? "Edit Satuan" : "Tambah Satuan Baru"}
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
                placeholder="SAT001"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nama Satuan *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nama satuan"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Singkatan *</label>
            <Input
              value={formData.abbreviation}
              onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
              required
              placeholder="Contoh: Dus, Pcs, Kg"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              placeholder="Deskripsi satuan..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : editingUnit ? "Update" : "Simpan"}
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
          setDeletingUnit(null);
        }}
        title="Hapus Satuan?"
        message={`Yakin ingin menghapus satuan "${deletingUnit?.name}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        loading={saving}
=======
        title="Master / Satuan"
        subtitle="Kelola satuan barang"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Download className="size-4 mr-2" /> Export
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300">
              <Upload className="size-4 mr-2" /> Import
            </Button>
            <Button size="sm" className="bg-[#9C27B0] hover:bg-[#7B1FA2]" onClick={() => { setEditingUnit(null); setFormOpen(true); }}>
              <Plus className="size-4 mr-2" /> Tambah
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Satuan</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{filteredData.length}</span>
            <span className="text-xs text-gray-500">Satuan</span>
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
                placeholder="Cari satuan..."
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
              <th className="px-4 py-3 font-medium">Nama Satuan</th>
              <th className="px-4 py-3 font-medium">Singkat</th>
              <th className="px-4 py-3 font-medium text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((unit) => (
              <tr key={unit.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(unit.id)}
                    onChange={(e) => handleSelect(unit.id, e.target.checked)}
                    className="rounded border-gray-300 text-[#9C27B0] focus:ring-[#9C27B0]"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{unit.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{unit.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{unit.abbreviation}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => { setEditingUnit(unit); setFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#9C27B0] hover:bg-purple-50 rounded">
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

      <UnitForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingUnit(null); }}
        onSave={() => setFormOpen(false)}
        initialData={editingUnit || undefined}
        isEditing={!!editingUnit}
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
      />
    </PageWrapper>
  );
}
