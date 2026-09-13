"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Eye, RefreshCw, Filter, X, ArrowRight, FileText, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/pos/Modal";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/DataTable";
import { api } from "@/lib/api";
import type { StockTransfer, StockTransferItem, Warehouse, Product } from "@/types/pos";
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

interface TransferFormData {
  date: string;
  fromWarehouseId: number | null;
  toWarehouseId: number | null;
  notes: string;
  items: { productId: number | null; quantity: number; unitPrice: number }[];
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Detail modal
  const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<TransferFormData>({
    date: new Date().toISOString().split('T')[0],
    fromWarehouseId: null,
    toWarehouseId: null,
    notes: "",
    items: [{ productId: null, quantity: 1, unitPrice: 0 }],
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

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.request<{ data: Product[] }>('GET', 'products', undefined, {
        $where: { isActive: true },
        $take: 500,
        $include: ['unit'],
      });
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  }, []);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        $skip: (page - 1) * pageSize,
        $take: pageSize,
        $orderBy: { createdAt: 'desc' },
        $include: ['fromWarehouse', 'toWarehouse'],
      };

      if (search) params.$search = search;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (statusFilter) params.status = statusFilter;

      const response = await api.request<{ data: StockTransfer[]; meta: any }>('GET', 'stock-transfers', undefined, params);

      if (response.success) {
        setTransfers(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch stock transfers:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, pageSize, dateFrom, dateTo, statusFilter]);

  useEffect(() => {
    fetchWarehouses();
    fetchProducts();
  }, [fetchWarehouses, fetchProducts]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleViewDetail = async (transfer: StockTransfer) => {
    setDetailLoading(true);
    setSelectedTransfer(transfer);
    setShowDetailModal(true);
    try {
      const res = await api.request<{ data: StockTransfer }>('GET', `stock-transfers/${transfer.id}`, {
        $include: ['fromWarehouse', 'toWarehouse', 'transferItems', 'transferItems.product'],
      });
      if (res.success && res.data) {
        setSelectedTransfer(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch transfer detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSend = async (transfer: StockTransfer) => {
    try {
      const res = await api.request('POST', `stock-transfers/${transfer.id}/send`);
      if (res.success) {
        fetchTransfers();
        if (showDetailModal && selectedTransfer?.id === transfer.id) {
          handleViewDetail({ ...transfer, status: 'SENT' });
        }
      } else {
        alert(res.message || "Gagal mengirim transfer");
      }
    } catch (error) {
      console.error("Failed to send transfer:", error);
      alert("Terjadi kesalahan saat mengirim");
    }
  };

  const handleReceive = async (transfer: StockTransfer) => {
    try {
      const res = await api.request('POST', `stock-transfers/${transfer.id}/receive`);
      if (res.success) {
        fetchTransfers();
        if (showDetailModal && selectedTransfer?.id === transfer.id) {
          handleViewDetail({ ...transfer, status: 'RECEIVED' });
        }
      } else {
        alert(res.message || "Gagal menerima transfer");
      }
    } catch (error) {
      console.error("Failed to receive transfer:", error);
      alert("Terjadi kesalahan saat menerima");
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      fromWarehouseId: warehouses[0]?.id || null,
      toWarehouseId: warehouses.length > 1 ? warehouses[1].id : null,
      notes: "",
      items: [{ productId: null, quantity: 1, unitPrice: 0 }],
    });
    setIsCreateModalOpen(true);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: null, quantity: 1, unitPrice: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index),
      });
    }
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity' | 'unitPrice', value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fromWarehouseId || !formData.toWarehouseId) {
      alert("Mohon pilih gudang asal dan tujuan");
      return;
    }
    if (formData.fromWarehouseId === formData.toWarehouseId) {
      alert("Gudang asal dan tujuan tidak boleh sama");
      return;
    }

    const validItems = formData.items.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      alert("Mohon tambahkan minimal 1 item");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        date: formData.date,
        fromWarehouseId: formData.fromWarehouseId,
        toWarehouseId: formData.toWarehouseId,
        notes: formData.notes || undefined,
        items: validItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
        })),
      };

      const res = await api.request('POST', 'stock-transfers', payload);
      if (!res.success) {
        alert(res.message || "Gagal membuat transfer");
        return;
      }

      setIsCreateModalOpen(false);
      fetchTransfers();
    } catch (error) {
      console.error("Failed to create transfer:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setStatusFilter("");
    setSearch("");
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string; bgClass: string }> = {
      PENDING: { label: 'Tertunda', color: 'text-warning', bgClass: 'bg-warning/10' },
      SENT: { label: 'Dikirim', color: 'text-blue-500', bgClass: 'bg-blue-500/10' },
      RECEIVED: { label: 'Diterima', color: 'text-success', bgClass: 'bg-success/10' },
      CANCELLED: { label: 'Dibatalkan', color: 'text-error', bgClass: 'bg-error/10' },
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
      key: "fromWarehouse",
      label: "Dari Gudang",
      render: (_: unknown, row: StockTransfer) => row.fromWarehouse?.name || '-'
    },
    {
      key: "toWarehouse",
      label: "Ke Gudang",
      render: (_: unknown, row: StockTransfer) => row.toWarehouse?.name || '-'
    },
    {
      key: "totalItems",
      label: "Total Item",
      align: "center" as const,
      render: (v: unknown) => <span className="font-medium">{formatNumber(v as number)}</span>
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
      render: (_: unknown, row: StockTransfer) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(row)} title="Lihat Detail">
            <Eye className="size-4" />
          </Button>
          {row.status === 'PENDING' && (
            <Button variant="ghost" size="sm" onClick={() => handleSend(row)} title="Kirim">
              <Send className="size-4 text-blue-500" />
            </Button>
          )}
          {row.status === 'SENT' && (
            <Button variant="ghost" size="sm" onClick={() => handleReceive(row)} title="Terima">
              <CheckCircle className="size-4 text-success" />
            </Button>
          )}
        </div>
      )
    },
  ];

  const hasActiveFilters = dateFrom || dateTo || statusFilter;

  return (
    <PageWrapper>
      <PageTitle
        title="Transfer Stock"
        subtitle={`Total: ${total} transfer`}
        actions={
          <Button onClick={handleOpenCreateModal} icon={Plus}>
            Transfer Baru
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Cari kode transfer..."
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
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchTransfers} disabled={loading}>
            Refresh
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="rounded-lg border border-default bg-elevated/50 p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Dari Tanggal</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Sampai Tanggal</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
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
                  <option value="SENT">Dikirim</option>
                  <option value="RECEIVED">Diterima</option>
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
        data={transfers}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada data transfer"
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Transfer Stock Baru"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Tanggal *</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Dari Gudang *</label>
              <select
                value={formData.fromWarehouseId || ""}
                onChange={(e) => setFormData({ ...formData, fromWarehouseId: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih Gudang Asal</option>
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Ke Gudang *</label>
              <select
                value={formData.toWarehouseId || ""}
                onChange={(e) => setFormData({ ...formData, toWarehouseId: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih Gudang Tujuan</option>
                {warehouses.filter(wh => wh.id !== formData.fromWarehouseId).map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Catatan</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              placeholder="Catatan transfer..."
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Item Transfer</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="size-4 mr-1" /> Tambah Item
              </Button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 rounded-lg border border-default bg-elevated/30">
                  <div className="flex-1">
                    <select
                      value={item.productId || ""}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value ? Number(e.target.value) : null)}
                      className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Pilih Produk</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.code} - {p.name} (Stok: {p.stock})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      min={1}
                      placeholder="Qty"
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                      min={0}
                      placeholder="Harga"
                    />
                  </div>
                  <div className="w-28 text-right font-medium">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    disabled={formData.items.length <= 1}
                    className="text-error"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-2 text-right font-semibold">
              Total: {formatCurrency(formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))}
            </div>
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
        onClose={() => { setShowDetailModal(false); setSelectedTransfer(null); }}
        title={`Detail Transfer - ${selectedTransfer?.code || ''}`}
        size="lg"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : selectedTransfer ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-elevated/50 p-4">
              <div>
                <p className="text-sm text-muted">Tanggal</p>
                <p className="font-medium">{formatDate(selectedTransfer.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Status</p>
                <div className="mt-1">{getStatusBadge(selectedTransfer.status)}</div>
              </div>
              <div>
                <p className="text-sm text-muted">Dari Gudang</p>
                <p className="font-medium">{selectedTransfer.fromWarehouse?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Ke Gudang</p>
                <p className="font-medium">{selectedTransfer.toWarehouse?.name || '-'}</p>
              </div>
              {selectedTransfer.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-muted">Catatan</p>
                  <p className="font-medium">{selectedTransfer.notes}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <h4 className="mb-2 font-medium">Item Transfer</h4>
              <div className="rounded-lg border border-default overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-elevated">
                    <tr>
                      <th className="px-3 py-2 text-left">Produk</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Harga</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default">
                    {selectedTransfer.transferItems?.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{item.product?.name || `Item #${i + 1}`}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {selectedTransfer.status === 'PENDING' && (
                  <Button onClick={() => handleSend(selectedTransfer)} icon={Send}>
                    Kirim Transfer
                  </Button>
                )}
                {selectedTransfer.status === 'SENT' && (
                  <Button onClick={() => handleReceive(selectedTransfer)} icon={CheckCircle}>
                    Terima Transfer
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={() => { setShowDetailModal(false); setSelectedTransfer(null); }}>
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
