"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/pos/Modal";
import { ConfirmDialog } from "@/components/pos/ConfirmDialog";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/DataTable";
import { apiClient } from "@/lib/api-client";
import type { SalePoint, Warehouse } from "@/types/pos";

interface SalePointFormData {
  code: string;
  name: string;
  warehouseId: number | null;
  description: string;
}

export default function SalesPage() {
  const [salePoints, setSalePoints] = useState<SalePoint[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingSalePoint, setEditingSalePoint] = useState<SalePoint | null>(null);
  const [deletingSalePoint, setDeletingSalePoint] = useState<SalePoint | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<SalePointFormData>({
    code: "",
    name: "",
    warehouseId: null,
    description: "",
  });

  // Fetch warehouses for form
  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await apiClient.warehouses$getAll({ $where: { isActive: true } });
      if (res.success) {
        setWarehouses((res.data as Warehouse[]) || []);
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    }
  }, []);

  // Fetch sale points
  const fetchSalePoints = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        $skip: (page - 1) * pageSize,
        $take: pageSize,
        $include: ["warehouse"],
      };

      if (search) {
        params.$search = search;
      }

      const response = await apiClient.salePoints$getAll(params);

      if (response.success) {
        setSalePoints((response.data as SalePoint[]) || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch sale points:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, pageSize]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  useEffect(() => {
    fetchSalePoints();
  }, [fetchSalePoints]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenModal = (salePoint?: SalePoint) => {
    if (salePoint) {
      setEditingSalePoint(salePoint);
      setFormData({
        code: salePoint.code,
        name: salePoint.name,
        warehouseId: salePoint.warehouseId || null,
        description: salePoint.description || "",
      });
    } else {
      setEditingSalePoint(null);
      setFormData({
        code: "",
        name: "",
        warehouseId: null,
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
        warehouseId: formData.warehouseId,
        description: formData.description || undefined,
      };

      if (editingSalePoint) {
        const res = await apiClient.salePoints$update(editingSalePoint.id, payload);
        if (!res.success) {
          alert((res as any).message || "Gagal mengupdate titik penjualan");
          return;
        }
      } else {
        const res = await apiClient.salePoints$create(payload);
        if (!res.success) {
          alert((res as any).message || "Gagal membuat titik penjualan");
          return;
        }
      }
      setIsModalOpen(false);
      fetchSalePoints();
    } catch (error) {
      console.error("Failed to save sale point:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSalePoint) return;
    setSaving(true);
    try {
      const res = await apiClient.salePoints$delete(deletingSalePoint.id);
      if (res.success) {
        setIsDeleteConfirmOpen(false);
        setDeletingSalePoint(null);
        fetchSalePoints();
      } else {
        alert((res as any).message || "Gagal menghapus titik penjualan");
      }
    } catch (error) {
      console.error("Failed to delete sale point:", error);
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
      label: "Nama Titik Penjualan",
      sortable: true,
      render: (v: unknown, row: SalePoint) => (
        <div>
          <div className="font-medium">{v as string}</div>
          {row.description && (
            <div className="text-xs text-muted truncate max-w-[200px]">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      key: "warehouse",
      label: "Gudang",
      render: (_: unknown, row: SalePoint) => row.warehouse?.name || "-",
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
      render: (_: unknown, row: SalePoint) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} title="Edit">
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeletingSalePoint(row);
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
        title="Titik Penjualan"
        subtitle={`Total: ${total} titik penjualan`}
        actions={
          <Button onClick={() => handleOpenModal()} icon={Plus}>
            Tambah Titik Penjualan
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Cari titik penjualan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={fetchSalePoints}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={salePoints}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada titik penjualan ditemukan"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSalePoint ? "Edit Titik Penjualan" : "Tambah Titik Penjualan Baru"}
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
                placeholder="TP001"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nama Titik Penjualan *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nama titik penjualan"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Gudang</label>
            <select
              value={formData.warehouseId || ""}
              onChange={(e) =>
                setFormData({ ...formData, warehouseId: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
            >
              <option value="">Pilih Gudang</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              placeholder="Deskripsi titik penjualan..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : editingSalePoint ? "Update" : "Simpan"}
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
          setDeletingSalePoint(null);
        }}
        title="Hapus Titik Penjualan?"
        message={`Yakin ingin menghapus titik penjualan "${deletingSalePoint?.name}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}
