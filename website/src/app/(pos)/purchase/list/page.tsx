"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Eye, Printer, Filter, RefreshCw, X, FileText, Download, Upload, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { Modal } from "@/components/pos/Modal";
import { api } from "@/lib/api";
import type { Purchase, Supplier } from "@/types/pos";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
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

export default function PurchaseListPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
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
  const [supplierFilter, setSupplierFilter] = useState<number | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Detail modal
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Selection
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        $skip: (page - 1) * pageSize,
        $take: pageSize,
        $orderBy: { createdAt: 'desc' },
      };

      if (search) {
        params.$search = search;
      }

      if (dateFrom) {
        params.dateFrom = dateFrom;
      }

      if (dateTo) {
        params.dateTo = dateTo;
      }

      if (statusFilter) {
        params.paymentStatus = statusFilter;
      }

      if (supplierFilter) {
        params.supplierId = supplierFilter;
      }

      const response = await api.getPurchases(params);

      if (response.success && response.data) {
        setPurchases(Array.isArray(response.data) ? response.data : []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch purchases:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, pageSize, dateFrom, dateTo, statusFilter, supplierFilter]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await api.getSuppliers({
        $where: { isActive: true },
        $take: 100,
      });
      if (res.success && res.data) {
        setSuppliers(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

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

  const handleViewDetail = async (purchase: Purchase) => {
    setDetailLoading(true);
    setSelectedPurchase(purchase);
    setShowDetailModal(true);
    try {
      const res = await api.getPurchase(purchase.id);
      if (res.success && res.data) {
        setSelectedPurchase(res.data as Purchase);
      }
    } catch (error) {
      console.error("Failed to fetch purchase detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePrint = (purchase: Purchase) => {
    const content = `
=================================
      PEMBELIAN - TOKO INDOMURAH
=================================
Tanggal: ${formatDate(purchase.createdAt)}
No: ${purchase.code}
---------------------------------
Supplier: ${purchase.supplier?.name || 'N/A'}
=================================

${purchase.purchaseItems?.map((item, i) =>
`${i + 1}. ${item.product?.name || 'Item'}
   ${item.quantity} x ${formatCurrency(item.unitPrice)}
   Sub: ${formatCurrency(item.subtotal)}`
).join('\n') || 'No items'}

---------------------------------
Subtotal: ${formatCurrency(purchase.subtotal)}
Diskon: -${formatCurrency(purchase.discountAmount || 0)}
Pajak: +${formatCurrency(purchase.taxAmount || 0)}
---------------------------------
TOTAL: ${formatCurrency(purchase.total)}
Bayar: ${formatCurrency(purchase.paid || 0)}
Sisa: ${formatCurrency(purchase.remaining || 0)}
=================================
    `.trim();

    const printWindow = window.open('', '', 'width=300,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Purchase - ${purchase.code}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                margin: 0;
                padding: 10px;
                width: 280px;
              }
              @media print {
                @page { margin: 0; size: 80mm auto; }
              }
            </style>
          </head>
          <body>
            <pre>${content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setStatusFilter("");
    setSupplierFilter(null);
    setSearch("");
    setPage(1);
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'PAID') {
      return <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Lunas</span>;
    }
    if (paymentStatus === 'PARTIAL') {
      return <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">Sebagian</span>;
    }
    if (status === 'CANCELLED') {
      return <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Dibatalkan</span>;
    }
    return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">Tertunda</span>;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(purchases.map((item) => item.id));
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

  const hasActiveFilters = dateFrom || dateTo || statusFilter || supplierFilter;

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Pembelian / List Pembelian"
        subtitle={`Total: ${total} transaksi`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Download className="size-4 mr-2" /> Export
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300">
              <Upload className="size-4 mr-2" /> Import
            </Button>
            <Button size="sm" className="bg-[#9C27B0] hover:bg-[#7B1FA2]" href="/purchase/orders">
              <Plus className="size-4 mr-2" /> Transaksi Baru
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Transaksi</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-500">Transaksi</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Item</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">
              {purchases.reduce((acc, p) => acc + (p.purchaseItems?.length || 0), 0)}
            </span>
            <span className="text-xs text-gray-500">Items</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Nilai</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#9C27B0]">
              {formatCurrency(purchases.reduce((acc, p) => acc + (p.total || 0), 0))}
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Belum Lunas</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-red-600">
              {formatCurrency(purchases.reduce((acc, p) => acc + (p.remaining || 0), 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kode atau supplier..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); }}
                className="pl-9 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#9C27B0] focus:ring-1 focus:ring-[#9C27B0]"
              />
            </div>
            <Button
              color="primary"
              variant={showFilters ? "solid" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="size-4 mr-2" />
              Filter {hasActiveFilters && `(${[dateFrom, dateTo, statusFilter, supplierFilter].filter(Boolean).length})`}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPurchases}
              disabled={loading}
              className="border-gray-200"
            >
              <RefreshCw className={cn("size-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            {selectedItems.length > 0 ? (
              <span>{selectedItems.length} dipilih</span>
            ) : (
              <span>{total} data</span>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Dari Tanggal</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Sampai Tanggal</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                >
                  <option value="">Semua</option>
                  <option value="PAID">Lunas</option>
                  <option value="PARTIAL">Sebagian</option>
                  <option value="PENDING">Tertunda</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Supplier</label>
                <select
                  value={supplierFilter || ""}
                  onChange={(e) => setSupplierFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                >
                  <option value="">Semua</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="size-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 text-left">
                <th className="px-4 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === purchases.length && purchases.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-[#9C27B0] focus:ring-[#9C27B0]"
                  />
                </th>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-[#9C27B0]">Kode ↕</th>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-[#9C27B0]">Tanggal ↕</th>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-[#9C27B0]">Supplier ↕</th>
                <th className="px-4 py-3 font-medium text-right cursor-pointer hover:text-[#9C27B0]">Total ↕</th>
                <th className="px-4 py-3 font-medium text-right cursor-pointer hover:text-[#9C27B0]">Dibayar ↕</th>
                <th className="px-4 py-3 font-medium text-right cursor-pointer hover:text-[#9C27B0]">Sisa ↕</th>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-[#9C27B0]">Jatuh Tempo ↕</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                    Tidak ada data pembelian
                  </td>
                </tr>
              ) : (
                purchases.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelect(item.id, e.target.checked)}
                        className="rounded border-gray-300 text-[#9C27B0] focus:ring-[#9C27B0]"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium font-mono text-gray-900">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-[#9C27B0]">{item.supplier?.name || 'N/A'}</div>
                      {item.supplier?.phone && <div className="text-xs text-gray-400">{item.supplier.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(item.total)}</td>
                    <td className="px-4 py-3 text-sm text-blue-600 text-right">{formatCurrency(item.paid || 0)}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={(item.remaining || 0) > 0 ? "text-orange-500 font-medium" : "text-gray-400"}>
                        {formatCurrency(item.remaining || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.dueDate ? formatDate(item.dueDate) : '-'}</td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(item.status, item.paymentStatus)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleViewDetail(item)}
                          className="p-1.5 text-gray-400 hover:text-[#9C27B0] hover:bg-purple-50 rounded"
                          title="Lihat"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(item)}
                          className="p-1.5 text-gray-400 hover:text-[#9C27B0] hover:bg-purple-50 rounded"
                          title="Cetak"
                        >
                          <Printer className="size-4" />
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-[#9C27B0] hover:bg-purple-50 rounded"
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Menampilkan {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} dari {total}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="border-gray-200 px-2"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-3 py-1 text-sm text-gray-600">Hal {page} / {totalPages || 1}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="border-gray-200 px-2"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Purchase Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPurchase(null);
        }}
        title={`Detail Pembelian - ${selectedPurchase?.code || ''}`}
        size="lg"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-8 animate-spin rounded-full border-4 border-[#9C27B0] border-t-transparent" />
          </div>
        ) : selectedPurchase ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
              <div>
                <p className="text-sm text-gray-500">Tanggal</p>
                <p className="font-medium">{formatDate(selectedPurchase.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-medium">{selectedPurchase.supplier?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gudang</p>
                <p className="font-medium">{selectedPurchase.warehouse?.name || 'Default'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Jatuh Tempo</p>
                <p className="font-medium">{selectedPurchase.dueDate ? formatDate(selectedPurchase.dueDate) : '-'}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="mb-2 font-medium">Item Pembelian</h4>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Produk</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Harga</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedPurchase.purchaseItems?.map((item, i) => (
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

            {/* Summary */}
            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(selectedPurchase.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Diskon</span>
                <span className="text-green-600">-{formatCurrency(selectedPurchase.discountAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pajak</span>
                <span>+{formatCurrency(selectedPurchase.taxAmount || 0)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                <span>Total</span>
                <span className="text-[#9C27B0]">{formatCurrency(selectedPurchase.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dibayar</span>
                <span className="text-blue-600">{formatCurrency(selectedPurchase.paid || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sisa</span>
                <span className={(selectedPurchase.remaining || 0) > 0 ? "text-orange-500 font-medium" : "text-green-600"}>
                  {formatCurrency(selectedPurchase.remaining || 0)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {selectedPurchase.notes && (
              <div>
                <h4 className="mb-2 font-medium">Catatan</h4>
                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                  {selectedPurchase.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowDetailModal(false);
                setSelectedPurchase(null);
              }}>
                Tutup
              </Button>
              <Button onClick={() => handlePrint(selectedPurchase)} className="bg-[#9C27B0] hover:bg-[#7B1FA2]">
                <Printer className="size-4 mr-2" />
                Cetak
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">
            <FileText className="size-12 mx-auto mb-2" />
            <p>Tidak ada data</p>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
