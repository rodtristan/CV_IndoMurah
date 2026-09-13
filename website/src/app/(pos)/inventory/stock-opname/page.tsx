"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Eye, RefreshCw, Filter, X, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/pos/Modal";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/DataTable";
import { api } from "@/lib/api";
import type { StockOpname, StockOpnameItem, Warehouse, Product } from "@/types/pos";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface OpnameFormData {
  date: string;
  warehouseId: number | null;
  notes: string;
}

export default function StockOpnamePage() {
  const [opnames, setOpnames] = useState<StockOpname[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [warehouseFilter, setWarehouseFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Detail modal
  const [selectedOpname, setSelectedOpname] = useState<StockOpname | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<OpnameFormData>({
    date: new Date().toISOString().split('T')[0],
    warehouseId: null,
    notes: "",
  });

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await api.request<{ data: Warehouse[] }>('GET', 'warehouses', undefined, {
        $where: { isActive: true },
        $take: 100,
      });
      if (res.success && res.data) {
        setWarehouses(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    }
  }, []);

  const fetchOpnames = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        $skip: (page - 1) * pageSize,
        $take: pageSize,
        $orderBy: { createdAt: 'desc' },
        $include: ['warehouse'],
      };

      if (search) params.$search = search;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (warehouseFilter) params.warehouseId = warehouseFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await api.request<{ data: StockOpname[]; meta: any }>('GET', 'stock-opnames', undefined, params);

      if (response.success) {
        setOpnames(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch stock opnames:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, pageSize, dateFrom, dateTo, warehouseFilter, statusFilter]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  useEffect(() => {
    fetchOpnames();
  }, [fetchOpnames]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleViewDetail = async (opname: StockOpname) => {
    setDetailLoading(true);
    setSelectedOpname(opname);
    setShowDetailModal(true);
    try {
      const res = await api.request<{ data: StockOpname }>('GET', `stock-opnames/${opname.id}`, {
        $include: ['warehouse', 'opnameItems', 'opnameItems.product'],
      });
      if (res.success && res.data) {
        setSelectedOpname(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch opname detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleComplete = async (opname: StockOpname) => {
    try {
      const res = await api.request('POST', `stock-opnames/${opname.id}/complete`);
      if (res.success) {
        fetchOpnames();
        if (showDetailModal && selectedOpname?.id === opname.id) {
          handleViewDetail({ ...opname, status: 'COMPLETED' });
        }
      } else {
        alert(res.message || "Gagal menyelesaikan stock opname");
      }
    } catch (error) {
      console.error("Failed to complete stock opname:", error);
      alert("Terjadi kesalahan saat menyelesaikan");
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      warehouseId: warehouses.find(w => w.isDefault)?.id || warehouses[0]?.id || null,
      notes: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warehouseId) {
      alert("Mohon pilih gudang");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        date: formData.date,
        warehouseId: formData.warehouseId,
        notes: formData.notes || undefined,
      };

      const res = await api.request('POST', 'stock-opnames', payload);
      if (!res.success) {
        alert(res.message || "Gagal membuat stock opname");
        return;
      }

      setIsCreateModalOpen(false);
      fetchOpnames();
    } catch (error) {
      console.error("Failed to create stock opname:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setWarehouseFilter(null);
    setStatusFilter("");
    setSearch("");
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string; bgClass: string }> = {
      PENDING: { label: 'Tertunda', color: 'text-warning', bgClass: 'bg-warning/10' },
      APPROVED: { label: 'Disetujui', color: 'text-blue-500', bgClass: 'bg-blue-500/10' },
      COMPLETED: { label: 'Selesai', color: 'text-success', bgClass: 'bg-success/10' },
    };
    const config = configs[status] || { label: status, color: 'text-muted', bgClass: 'bg-muted/10' };
    return (
      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", config.bgClass, config.color)}>
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: "code",
      label: "Kode",
      sortable: true,
      render: (v: unknown) => <span className="font-mono font-medium">{v as string}</span>
    },
    {
      key: "createdAt",
      label: "Tanggal",
      sortable: true,
      render: (v: unknown) => <span className="text-sm text-muted">{formatDate(v as string)}</span>
    },
    {
      key: "warehouse",
      label: "Gudang",
      render: (_: unknown, row: StockOpname) => row.warehouse?.name || '-'
    },
    {
      key: "totalItems",
      label: "Total Item",
      align: "center" as const,
      render: (v: unknown) => <span className="font-medium">{formatNumber(v as number)}</span>
    },
    {
      key: "notes",
      label: "Catatan",
      render: (v: unknown) => (
        <span className="text-muted truncate max-w-[150px] block">{v as string || '-'}</span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (v: unknown) => getStatusBadge(v as string)
    },
    {
      key: "actions",
      label: "",
      align: "center" as const,
      render: (_: unknown, row: StockOpname) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(row)} title="Lihat Detail">
            <Eye className="size-4" />
          </Button>
          {(row.status === 'PENDING' || row.status === 'APPROVED') && (
            <Button variant="ghost" size="sm" onClick={() => handleComplete(row)} title="Selesaikan">
              <CheckCircle className="size-4 text-success" />
            </Button>
          )}
        </div>
      )
    },
  ];

  const hasActiveFilters = dateFrom || dateTo || warehouseFilter || statusFilter;

  return (
    <PageWrapper>
      <PageTitle
        title="Stock Opname"
        subtitle={`Total: ${total} stock opname`}
        actions={
          <Button onClick={handleOpenCreateModal} icon={Plus}>
            Stock Opname Baru
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Cari kode stock opname..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter {hasActiveFilters && "*"}
          </Button>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchOpnames} disabled={loading}>
            Refresh
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="rounded-lg border border-default bg-elevated/50 p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Dari Tanggal</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Sampai Tanggal</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Gudang</label>
                <select
                  value={warehouseFilter || ""}
                  onChange={(e) => setWarehouseFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
                >
                  <option value="">Semua Gudang</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
                >
                  <option value="">Semua Status</option>
                  <option value="PENDING">Tertunda</option>
                  <option value="APPROVED">Disetujui</option>
                  <option value="COMPLETED">Selesai</option>
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="size-4 mr-1" /> Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <DataTable
        data={opnames}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada data stock opname"
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Stock Opname Baru"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Tanggal *</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Gudang *</label>
            <select
              value={formData.warehouseId || ""}
              onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value ? Number(e.target.value) : null })}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              required
            >
              <option value="">Pilih Gudang</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Catatan</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              placeholder="Catatan stock opname..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedOpname(null); }}
        title={`Detail Stock Opname - ${selectedOpname?.code || ''}`}
        size="lg"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : selectedOpname ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-elevated/50 p-4">
              <div>
                <p className="text-sm text-muted">Tanggal</p>
                <p className="font-medium">{formatDate(selectedOpname.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Status</p>
                <div className="mt-1">{getStatusBadge(selectedOpname.status)}</div>
              </div>
              <div>
                <p className="text-sm text-muted">Gudang</p>
                <p className="font-medium">{selectedOpname.warehouse?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Total Item</p>
                <p className="font-medium">{formatNumber(selectedOpname.totalItems)}</p>
              </div>
              {selectedOpname.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-muted">Catatan</p>
                  <p className="font-medium">{selectedOpname.notes}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <h4 className="mb-2 font-medium">Detail Item</h4>
              <div className="rounded-lg border border-default overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-elevated">
                    <tr>
                      <th className="px-3 py-2 text-left">Produk</th>
                      <th className="px-3 py-2 text-right">Stok Sistem</th>
                      <th className="px-3 py-2 text-right">Stok Real</th>
                      <th className="px-3 py-2 text-right">Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default">
                    {selectedOpname.opnameItems?.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">
                          <div className="font-medium">{item.product?.name || `Item #${i + 1}`}</div>
                          <div className="text-xs text-muted">{item.product?.code || ''}</div>
                        </td>
                        <td className="px-3 py-2 text-right">{item.systemStock}</td>
                        <td className="px-3 py-2 text-right">{item.countedStock}</td>
                        <td className={cn("px-3 py-2 text-right font-medium",
                          item.difference > 0 ? "text-success" : item.difference < 0 ? "text-error" : ""
                        )}>
                          {item.difference > 0 ? '+' : ''}{item.difference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-center">
                <p className="text-sm text-muted">Item Lebih</p>
                <p className="text-2xl font-bold text-success">
                  {selectedOpname.opnameItems?.filter(i => i.difference > 0).length || 0}
                </p>
              </div>
              <div className="rounded-lg border border-error/30 bg-error/5 p-4 text-center">
                <p className="text-sm text-muted">Item Kurang</p>
                <p className="text-2xl font-bold text-error">
                  {selectedOpname.opnameItems?.filter(i => i.difference < 0).length || 0}
                </p>
              </div>
              <div className="rounded-lg border border-default p-4 text-center">
                <p className="text-sm text-muted">Sesuai</p>
                <p className="text-2xl font-bold">
                  {selectedOpname.opnameItems?.filter(i => i.difference === 0).length || 0}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div>
                {(selectedOpname.status === 'PENDING' || selectedOpname.status === 'APPROVED') && (
                  <Button onClick={() => handleComplete(selectedOpname)} icon={CheckCircle}>
                    Selesaikan Stock Opname
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={() => { setShowDetailModal(false); setSelectedOpname(null); }}>
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-muted">
            <FileText className="size-12 mx-auto mb-2" />
            <p>Tidak ada data</p>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
