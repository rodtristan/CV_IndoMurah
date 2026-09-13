"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Eye, Printer, RotateCcw, Filter, RefreshCw, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/pos/Modal";
import { ConfirmDialog } from "@/components/pos/ConfirmDialog";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/DataTable";
import { DateRangePicker } from "@/components/pos/ui/DateRangePicker";
import { api } from "@/lib/api";
import type { Sale, Customer } from "@/types/pos";
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

export default function SaleListPage() {
  const [sales, setSales] = useState<Sale[]>([]);
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
  const [customerFilter, setCustomerFilter] = useState<number | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Detail modal
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Refund confirmation
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refundSale, setRefundSale] = useState<Sale | null>(null);
  const [processingRefund, setProcessingRefund] = useState(false);

  const fetchSales = useCallback(async () => {
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

      if (customerFilter) {
        params.customerId = customerFilter;
      }

      const response = await api.getSales(params);

      if (response.success && response.data) {
        setSales(Array.isArray(response.data) ? response.data : []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, pageSize, dateFrom, dateTo, statusFilter, customerFilter]);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await api.getCustomers({
        $where: { isActive: true },
        $take: 100,
      });
      if (res.success && res.data) {
        setCustomers(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleViewDetail = async (sale: Sale) => {
    setDetailLoading(true);
    setSelectedSale(sale);
    setShowDetailModal(true);
    try {
      const res = await api.getSale(sale.id);
      if (res.success && res.data) {
        setSelectedSale(res.data as Sale);
      }
    } catch (error) {
      console.error("Failed to fetch sale detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePrintReceipt = (sale: Sale) => {
    const receiptContent = `
=================================
         TOKO INDOMURAH
=================================
Tanggal: ${formatDate(sale.createdAt)}
No: ${sale.code}
---------------------------------
Pelanggan: ${sale.customer?.name || 'Umum'}
Kasir: ${sale.creator?.name || 'Admin'}
=================================

${sale.saleItems?.map((item, i) =>
`${i + 1}. ${item.product?.name || 'Item'}
   ${item.quantity} x ${formatCurrency(item.unitPrice)}
   Sub: ${formatCurrency(item.subtotal)}`
).join('\n') || 'No items'}

---------------------------------
Subtotal: ${formatCurrency(sale.subtotal)}
Diskon: -${formatCurrency(sale.discountAmount || 0)}
Pajak: +${formatCurrency(sale.taxAmount || 0)}
---------------------------------
TOTAL: ${formatCurrency(sale.total)}
Bayar: ${formatCurrency(sale.cashAmount || sale.total)}
Kembalian: ${formatCurrency(sale.changeAmount || 0)}
=================================

    Terima Kasih!
    Selamat Belanja Kembali

=================================
    `.trim();

    const printWindow = window.open('', '', 'width=300,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${sale.code}</title>
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
            <pre>${receiptContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleRefund = async () => {
    if (!refundSale) return;
    setProcessingRefund(true);
    try {
      const res = await api.request('POST', `sales/${refundSale.id}/return`, {
        reason: "Refund from list page",
      });
      if (res.success) {
        setShowRefundConfirm(false);
        setRefundSale(null);
        fetchSales();
      } else {
        alert(res.message || "Gagal memproses refund");
      }
    } catch (error) {
      console.error("Failed to process refund:", error);
      alert("Terjadi kesalahan saat memproses refund");
    } finally {
      setProcessingRefund(false);
    }
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setStatusFilter("");
    setCustomerFilter(null);
    setSearch("");
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string; bgClass: string }> = {
      PAID: { label: 'Lunas', color: 'text-success', bgClass: 'bg-success/10' },
      PARTIAL: { label: 'Sebagian', color: 'text-warning', bgClass: 'bg-warning/10' },
      PENDING: { label: 'Tertunda', color: 'text-muted', bgClass: 'bg-muted/10' },
      INSTALMENT: { label: 'Cicilan', color: 'text-info', bgClass: 'bg-info/10' },
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
      key: "customer",
      label: "Pelanggan",
      render: (_: unknown, row: Sale) => (
        <div>
          <div className="font-medium">{row.customer?.name || 'Umum'}</div>
          {row.customer?.phone && <div className="text-xs text-muted">{row.customer.phone}</div>}
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
      key: "cashAmount",
      label: "Bayar",
      align: "right" as const,
      render: (v: unknown, row: Sale) => (
        <span>{formatCurrency(v as number || row.total)}</span>
      )
    },
    {
      key: "changeAmount",
      label: "Kembalian",
      align: "right" as const,
      render: (v: unknown) => (
        <span className="text-muted">{formatCurrency(v as number || 0)}</span>
      )
    },
    {
      key: "paymentMethod",
      label: "Metode",
      render: (v: unknown) => {
        const methods: Record<string, string> = {
          CASH: 'Tunai',
          DEBIT: 'Debit',
          QRIS: 'QRIS',
          TRANSFER: 'Transfer',
          CREDIT: 'Kredit',
        };
        return <span className="text-sm">{methods[v as string] || String(v)}</span>;
      }
    },
    {
      key: "paymentStatus",
      label: "Status",
      render: (v: unknown) => getStatusBadge(v as string)
    },
    {
      key: "actions",
      label: "",
      align: "center" as const,
      render: (_: unknown, row: Sale) => (
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
            onClick={() => handlePrintReceipt(row)}
            title="Cetak Struk"
          >
            <Printer className="size-4" />
          </Button>
          {!row.isReturn && row.paymentStatus === 'PAID' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRefundSale(row);
                setShowRefundConfirm(true);
              }}
              title="Refund"
            >
              <RotateCcw className="size-4 text-warning" />
            </Button>
          )}
        </div>
      )
    },
  ];

  const hasActiveFilters = dateFrom || dateTo || statusFilter || customerFilter;

  return (
    <PageWrapper>
      <PageTitle
        title="Daftar Penjualan"
        subtitle={`Total: ${total} transaksi`}
        actions={
          <Button icon={Plus} href="/sale/pos">
            Penjualan Baru
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Cari kode transaksi atau pelanggan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? "solid" : "outline"}
            size="sm"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter {hasActiveFilters && `(${Number(!!dateFrom) + Number(!!dateTo) + Number(!!statusFilter) + Number(!!customerFilter)})`}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchSales}
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
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
                >
                  <option value="">Semua Status</option>
                  <option value="PAID">Lunas</option>
                  <option value="PARTIAL">Sebagian</option>
                  <option value="PENDING">Tertunda</option>
                  <option value="INSTALMENT">Cicilan</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Pelanggan</label>
                <select
                  value={customerFilter || ""}
                  onChange={(e) => setCustomerFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
                >
                  <option value="">Semua Pelanggan</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
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
        data={sales}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada penjualan ditemukan"
      />

      {/* Sale Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedSale(null);
        }}
        title={`Detail Transaksi - ${selectedSale?.code || ''}`}
        size="lg"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : selectedSale ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-elevated/50 p-4">
              <div>
                <p className="text-sm text-muted">Tanggal</p>
                <p className="font-medium">{formatDate(selectedSale.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Status</p>
                <div className="mt-1">{getStatusBadge(selectedSale.paymentStatus)}</div>
              </div>
              <div>
                <p className="text-sm text-muted">Pelanggan</p>
                <p className="font-medium">{selectedSale.customer?.name || 'Umum'}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Kasir</p>
                <p className="font-medium">{selectedSale.creator?.name || 'Admin'}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="mb-2 font-medium">Item Penjualan</h4>
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
                    {selectedSale.saleItems?.map((item, i) => (
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
                <span>{formatCurrency(selectedSale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Diskon</span>
                <span className="text-error">-{formatCurrency(selectedSale.discountAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Pajak</span>
                <span>+{formatCurrency(selectedSale.taxAmount || 0)}</span>
              </div>
              <div className="flex justify-between border-t border-default pt-2 font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(selectedSale.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Bayar</span>
                <span>{formatCurrency(selectedSale.cashAmount || selectedSale.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-success">
                <span className="text-muted">Kembalian</span>
                <span>{formatCurrency(selectedSale.changeAmount || 0)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowDetailModal(false);
                setSelectedSale(null);
              }}>
                Tutup
              </Button>
              <Button onClick={() => handlePrintReceipt(selectedSale)} icon={Printer}>
                Cetak Struk
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

      {/* Refund Confirmation */}
      <ConfirmDialog
        isOpen={showRefundConfirm}
        onConfirm={handleRefund}
        onCancel={() => {
          setShowRefundConfirm(false);
          setRefundSale(null);
        }}
        title="Refund Transaksi?"
        message={`Yakin ingin me-refund transaksi "${refundSale?.code}"? Total: ${formatCurrency(refundSale?.total || 0)}`}
        confirmText="Refund"
        cancelText="Batal"
        variant="danger"
        loading={processingRefund}
      />
    </PageWrapper>
  );
}
