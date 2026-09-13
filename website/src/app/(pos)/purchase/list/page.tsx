"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Eye, Printer, Filter, RefreshCw, X, FileText, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/pos/Modal";
import { ConfirmDialog } from "@/components/pos/ConfirmDialog";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/DataTable";
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

      if (response.success) {
        setPurchases(response.data || []);
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
      if (res.success) {
        setSuppliers(res.data || []);
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
      if (res.success) {
        setSelectedPurchase(res.data);
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
      return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-success/10 text-success">Lunas</span>;
    }
    if (paymentStatus === 'PARTIAL') {
      return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-warning/10 text-warning">Sebagian</span>;
    }
    if (status === 'CANCELLED') {
      return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-error/10 text-error">Dibatalkan</span>;
    }
    return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted/10 text-muted">Tertunda</span>;
  };

  const columns = [
    {
      key: "code",
      label: "Kode",
      sortable: true,
      render: (v: unknown) => (
        <span className="font-mono font-medium">{v as string}</span>
      )
    },
    {
      key: "createdAt",
      label: "Tanggal",
      sortable: true,
      render: (v: unknown) => (
        <span className="text-sm text-muted">{formatDate(v as string)}</span>
      )
    },
    {
      key: "supplier",
      label: "Supplier",
      render: (_: unknown, row: Purchase) => (
        <div>
          <div className="font-medium">{row.supplier?.name || 'N/A'}</div>
          {row.supplier?.phone && <div className="text-xs text-muted">{row.supplier.phone}</div>}
        </div>
      )
    },
    {
      key: "total",
      label: "Total",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => (
        <span className="font-semibold">{formatCurrency(v as number)}</span>
      )
    },
    {
      key: "paid",
      label: "Dibayar",
      align: "right" as const,
      render: (v: unknown) => (
        <span className="text-info">{formatCurrency(v as number || 0)}</span>
      )
    },
    {
      key: "remaining",
      label: "Sisa",
      align: "right" as const,
      render: (v: unknown) => (
        <span className={cn((v as number || 0) > 0 ? "text-warning font-medium" : "text-muted")}>
          {formatCurrency(v as number || 0)}
        </span>
      )
    },
    {
      key: "dueDate",
      label: "Jatuh Tempo",
      render: (v: unknown) => {
        if (!v) return <span className="text-muted">-</span>;
        const dueDate = new Date(v as string);
        const today = new Date();
        const isOverdue = dueDate < today;
        return (
          <span className={cn("text-sm", isOverdue ? "text-error font-medium" : "")}>
            {formatDate(v as string)}
          </span>
        );
      }
    },
    {
      key: "paymentStatus",
      label: "Status",
      render: (_: unknown, row: Purchase) => getStatusBadge(row.status, row.paymentStatus)
    },
    {
      key: "actions",
      label: "",
      align: "center" as const,
      render: (_: unknown, row: Purchase) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetail(row)}
            title="Lihat Detail"
          >
            <Eye className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePrint(row)}
            title="Cetak"
          >
            <Printer className="size-4" />
          </Button>
        </div>
      )
    },
  ];

  const hasActiveFilters = dateFrom || dateTo || statusFilter || supplierFilter;

  return (
    <PageWrapper>
      <PageTitle
        title="Daftar Pembelian"
        subtitle={`Total: ${total} transaksi`}
        actions={
          <Button icon={Plus} href="/purchase/orders">
            Pembelian Baru
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Cari kode transaksi atau supplier..."
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
            Filter {hasActiveFilters && `(${1 + (!!dateFrom) + (!!dateTo) + (!!statusFilter) + (!!supplierFilter)})`}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchPurchases}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="rounded-lg border border-default bg-elevated/50 p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Dari Tanggal</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Sampai Tanggal</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Status Pembayaran</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
                >
                  <option value="">Semua Status</option>
                  <option value="PAID">Lunas</option>
                  <option value="PARTIAL">Sebagian</option>
                  <option value="PENDING">Tertunda</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Supplier</label>
                <select
                  value={supplierFilter || ""}
                  onChange={(e) => setSupplierFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
                >
                  <option value="">Semua Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="size-4 mr-1" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <DataTable
        data={purchases}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada pembelian ditemukan"
      />

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
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : selectedPurchase ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-elevated/50 p-4">
              <div>
                <p className="text-sm text-muted">Tanggal</p>
                <p className="font-medium">{formatDate(selectedPurchase.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Supplier</p>
                <p className="font-medium">{selectedPurchase.supplier?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Gudang</p>
                <p className="font-medium">{selectedPurchase.warehouse?.name || 'Default'}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Jatuh Tempo</p>
                <p className="font-medium">{selectedPurchase.dueDate ? formatDate(selectedPurchase.dueDate) : '-'}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="mb-2 font-medium">Item Pembelian</h4>
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
            <div className="space-y-2 rounded-lg bg-elevated/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span>{formatCurrency(selectedPurchase.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Diskon</span>
                <span className="text-success">-{formatCurrency(selectedPurchase.discountAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Pajak</span>
                <span>+{formatCurrency(selectedPurchase.taxAmount || 0)}</span>
              </div>
              <div className="flex justify-between border-t border-default pt-2 font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(selectedPurchase.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Dibayar</span>
                <span className="text-info">{formatCurrency(selectedPurchase.paid || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Sisa</span>
                <span className={cn((selectedPurchase.remaining || 0) > 0 ? "text-warning font-medium" : "text-success")}>
                  {formatCurrency(selectedPurchase.remaining || 0)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {selectedPurchase.notes && (
              <div>
                <h4 className="mb-2 font-medium">Catatan</h4>
                <p className="rounded-lg bg-elevated/50 p-3 text-sm text-muted">
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
              <Button onClick={() => handlePrint(selectedPurchase)} icon={Printer}>
                Cetak
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
