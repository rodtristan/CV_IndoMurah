"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Eye, RefreshCw, Filter, X, Package, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/pos/Modal";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/DataTable";
import { api } from "@/lib/api";
import type { StockOut, StockOutItem, Warehouse, Product } from "@/types/pos";
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

interface StockOutFormData {
  date: string;
  warehouseId: number | null;
  description: string;
  items: { productId: number | null; quantity: number; unitPrice: number }[];
}

export default function StockOutPage() {
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);
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
  const [warehouseFilter, setWarehouseFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Detail modal
  const [selectedStockOut, setSelectedStockOut] = useState<StockOut | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<StockOutFormData>({
    date: new Date().toISOString().split('T')[0],
    warehouseId: null,
    description: "",
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

  const fetchStockOuts = useCallback(async () => {
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

      const response = await api.request<{ data: StockOut[]; meta: any }>('GET', 'stock-outs', undefined, params);

      if (response.success) {
        setStockOuts(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch stock-outs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, pageSize, dateFrom, dateTo, warehouseFilter, statusFilter]);

  useEffect(() => {
    fetchWarehouses();
    fetchProducts();
  }, [fetchWarehouses, fetchProducts]);

  useEffect(() => {
    fetchStockOuts();
  }, [fetchStockOuts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleViewDetail = async (stockOut: StockOut) => {
    setDetailLoading(true);
    setSelectedStockOut(stockOut);
    setShowDetailModal(true);
    try {
      const res = await api.request<{ data: StockOut }>('GET', `stock-outs/${stockOut.id}`, {
        $include: ['warehouse', 'stockOutItems', 'stockOutItems.product'],
      });
      if (res.success && res.data) {
        setSelectedStockOut(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch stock-out detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async (stockOut: StockOut) => {
    try {
      const res = await api.request('POST', `stock-outs/${stockOut.id}/approve`);
      if (res.success) {
        fetchStockOuts();
        if (showDetailModal && selectedStockOut?.id === stockOut.id) {
          handleViewDetail({ ...stockOut, status: 'COMPLETED' });
        }
      } else {
        alert(res.message || "Gagal approve barang keluar");
      }
    } catch (error) {
      console.error("Failed to approve stock-out:", error);
      alert("Terjadi kesalahan saat approve");
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      warehouseId: warehouses.find(w => w.isDefault)?.id || warehouses[0]?.id || null,
      description: "",
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

    // Auto-fill unit price when product is selected
    if (field === 'productId' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unitPrice = product.sellingPrice || 0;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warehouseId) {
      alert("Mohon pilih gudang");
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
        warehouseId: formData.warehouseId,
        description: formData.description || undefined,
        items: validItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
        })),
      };

      const res = await api.request('POST', 'stock-outs', payload);
      if (!res.success) {
        alert(res.message || "Gagal membuat barang keluar");
        return;
      }

      setIsCreateModalOpen(false);
      fetchStockOuts();
    } catch (error) {
      console.error("Failed to create stock-out:", error);
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
      CONFIRMED: { label: 'Dikonfirmasi', color: 'text-blue-500', bgClass: 'bg-blue-500/10' },
      COMPLETED: { label: 'Selesai', color: 'text-success', bgClass: 'bg-success/10' },
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
      key: "warehouse",
      label: "Gudang",
      render: (_: unknown, row: StockOut) => row.warehouse?.name || '-'
    },
    {
      key: "description",
      label: "Referensi",
      render: (v: unknown) => (
        <span className="text-muted truncate max-w-[150px] block">{v as string || '-'}</span>
      )
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
      render: (_: unknown, row: StockOut) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(row)} title="Lihat Detail">
            <Eye className="size-4" />
          </Button>
          {row.status === 'PENDING' && (
            <Button variant="ghost" size="sm" onClick={() => handleApprove(row)} title="Approve">
              <Package className="size-4 text-success" />
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
        title="Barang Keluar"
        subtitle={`Total: ${total} transaksi`}
        actions={
          <Button onClick={handleOpenCreateModal} icon={Plus}>
            Barang Keluar Baru
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Cari kode transaksi..."
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
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchStockOuts} disabled={loading}>
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
                  <option value="CONFIRMED">Dikonfirmasi</option>
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
        data={stockOuts}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada data barang keluar"
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Barang Keluar Baru"
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
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Keterangan</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              placeholder="Keterangan barang keluar..."
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Item Barang</label>
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
        onClose={() => { setShowDetailModal(false); setSelectedStockOut(null); }}
        title={`Detail Barang Keluar - ${selectedStockOut?.code || ''}`}
        size="lg"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : selectedStockOut ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-elevated/50 p-4">
              <div>
                <p className="text-sm text-muted">Tanggal</p>
                <p className="font-medium">{formatDate(selectedStockOut.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Status</p>
                <div className="mt-1">{getStatusBadge(selectedStockOut.status)}</div>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted">Gudang</p>
                <p className="font-medium">{selectedStockOut.warehouse?.name || '-'}</p>
              </div>
              {selectedStockOut.description && (
                <div className="col-span-2">
                  <p className="text-sm text-muted">Keterangan</p>
                  <p className="font-medium">{selectedStockOut.description}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <h4 className="mb-2 font-medium">Item Barang Keluar</h4>
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
                    {selectedStockOut.stockOutItems?.map((item, i) => (
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
              <div>
                {selectedStockOut.status === 'PENDING' && (
                  <Button onClick={() => handleApprove(selectedStockOut)} icon={Package}>
                    Approve Barang Keluar
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={() => { setShowDetailModal(false); setSelectedStockOut(null); }}>
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
