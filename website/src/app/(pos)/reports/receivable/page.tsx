"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw, FileText, Users, TrendingUp, DollarSign, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { api } from "@/lib/api";
import type { Sale, Customer } from "@/types/pos";

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
  });
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

interface ReceivableStats {
  totalReceivable: number;
  totalOverdue: number;
  customerCount: number;
  dueSoonCount: number;
}

interface CustomerReceivable {
  customerId: number;
  customerName: string;
  customerPhone?: string;
  totalReceivable: number;
  transactionCount: number;
}

export default function ReceivableReportPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Date range
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const [dateFrom, setDateFrom] = useState<string>(firstDay.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState<string>(now.toISOString().split('T')[0]);

  // Filters
  const [customerFilter, setCustomerFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showByCustomer, setShowByCustomer] = useState(false);

  const [stats, setStats] = useState<ReceivableStats>({
    totalReceivable: 0,
    totalOverdue: number,
    customerCount: 0,
    dueSoonCount: 0,
  });

  // Grouped by customer
  const customerReceivables = useMemo<CustomerReceivable[]>(() => {
    const grouped: Record<number, { name: string; phone?: string; totalReceivable: number; count: number }> = {};

    const receivableSales = sales.filter((s: Sale) => {
      const remaining = (s.total || 0) - (s.cashAmount || s.total || 0);
      return remaining > 0;
    });

    receivableSales.forEach((sale) => {
      const customerId = sale.customerId;
      const customerName = sale.customer?.name || 'Umum';
      const customerPhone = sale.customer?.phone;
      const remaining = (sale.total || 0) - (sale.cashAmount || sale.total || 0);

      if (!grouped[customerId]) {
        grouped[customerId] = { name: customerName, phone: customerPhone, totalReceivable: 0, count: 0 };
      }
      grouped[customerId].totalReceivable += remaining;
      grouped[customerId].count += 1;
    });

    return Object.entries(grouped)
      .map(([customerId, data]) => ({
        customerId: Number(customerId),
        customerName: data.name,
        customerPhone: data.phone,
        totalReceivable: data.totalReceivable,
        transactionCount: data.count,
      }))
      .sort((a, b) => b.totalReceivable - a.totalReceivable);
  }, [sales]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        $skip: 0,
        $take: 1000,
        $orderBy: { createdAt: 'desc' },
      };

      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (search) params.$search = search;

      const [salesRes, customerRes] = await Promise.all([
        api.getSales(params),
        api.getCustomers({ $where: { isActive: true }, $take: 100 }),
      ]);

      if (salesRes.success) {
        let salesData = salesRes.data || [];

        // Filter by customer if needed
        if (customerFilter) {
          salesData = salesData.filter((s: Sale) => s.customerId === customerFilter);
        }

        setSales(salesData);

        // Calculate receivable stats
        const today = new Date();
        const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        let totalReceivable = 0;
        let totalOverdue = 0;
        let dueSoonCount = 0;

        salesData.forEach((s: Sale) => {
          const remaining = (s.total || 0) - (s.cashAmount || s.total || 0);
          if (remaining > 0) {
            totalReceivable += remaining;
            // For simplicity, consider older receivables as overdue
            const saleDate = new Date(s.createdAt);
            const daysSinceSale = Math.floor((today.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceSale > 30) {
              totalOverdue += remaining;
            } else if (daysSinceSale > 14) {
              dueSoonCount++;
            }
          }
        });

        // Count unique customers with receivable
        const uniqueCustomers = new Set(
          salesData.filter((s: Sale) => (s.total || 0) - (s.cashAmount || s.total || 0) > 0).map((s: Sale) => s.customerId)
        );

        setStats({
          totalReceivable,
          totalOverdue,
          customerCount: uniqueCustomers.size,
          dueSoonCount,
        });
      }

      if (customerRes.success) {
        setCustomers(customerRes.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, search, customerFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    const receivableSales = sales.filter((s: Sale) => {
      const remaining = (s.total || 0) - (s.cashAmount || s.total || 0);
      return remaining > 0;
    });
    const headers = ['Tanggal', 'Kode', 'Pelanggan', 'Total', 'Dibayar', 'Sisa'];
    const rows = receivableSales.map((s: Sale) => [
      formatDate(s.createdAt),
      s.code,
      s.customer?.name || 'Umum',
      s.total,
      s.cashAmount || s.total,
      (s.total || 0) - (s.cashAmount || s.total || 0),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_piutang_${dateTo}.csv`;
    link.click();
  };

  // Filter sales with remaining receivable
  const receivableSales = sales.filter((s: Sale) => {
    const remaining = (s.total || 0) - (s.cashAmount || s.total || 0);
    return remaining > 0;
  });

  return (
    <PageWrapper>
      <PageTitle
        title="Laporan Piutang"
        subtitle="Daftar piutang pelanggan"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={showByCustomer ? "solid" : "outline"}
              size="sm"
              onClick={() => setShowByCustomer(!showByCustomer)}
            >
              {showByCustomer ? 'Detail' : 'Per Pelanggan'}
            </Button>
            <Button variant="outline" icon={Download} onClick={handleExport}>
              Export CSV
            </Button>
            <Button variant="outline" icon={RefreshCw} onClick={fetchData} disabled={loading}>
              Refresh
            </Button>
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-warning/10">
              <TrendingUp className="size-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Piutang</p>
              <p className="text-xl font-bold text-warning">
                {loading ? '...' : formatCurrency(stats.totalReceivable)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-error/10">
              <TrendingUp className="size-6 text-error" />
            </div>
            <div>
              <p className="text-sm text-muted">Piutang Jatuh Tempo</p>
              <p className="text-xl font-bold text-error">
                {loading ? '...' : formatCurrency(stats.totalOverdue)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-warning/10">
              <CreditCard className="size-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted">Perlu Diingat (>14 hari)</p>
              <p className="text-xl font-bold text-warning">
                {loading ? '...' : stats.dueSoonCount}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">Jumlah Pelanggan</p>
              <p className="text-xl font-bold">
                {loading ? '...' : stats.customerCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <label className="mb-1 block text-sm font-medium">Dari Tanggal</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Sampai Tanggal</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Pelanggan</label>
          <select
            value={customerFilter || ""}
            onChange={(e) => setCustomerFilter(e.target.value ? Number(e.target.value) : null)}
            className="rounded-lg border border-default bg-bg px-3 py-2 text-sm"
          >
            <option value="">Semua Pelanggan</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Pencarian</label>
          <Input
            placeholder="Cari kode atau pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* View: By Customer */}
      {showByCustomer ? (
        <div className="rounded-lg border border-default overflow-hidden">
          <div className="bg-elevated px-4 py-3 border-b border-default">
            <h3 className="font-semibold">Piutang per Pelanggan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-elevated">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted">Pelanggan</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Telepon</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Jumlah Transaksi</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Total Piutang</th>
                  <th className="px-4 py-3 text-center font-medium text-muted">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default bg-bg">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted">Memuat...</td>
                  </tr>
                ) : customerReceivables.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted">
                      <FileText className="size-12 mx-auto mb-2" />
                      <p>Tidak ada piutang</p>
                    </td>
                  </tr>
                ) : (
                  customerReceivables.map((item) => (
                    <tr key={item.customerId} className="hover:bg-elevated/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Users className="size-4 text-muted" />
                          <span className="font-medium">{item.customerName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{item.customerPhone || '-'}</td>
                      <td className="px-4 py-3 text-right">{item.transactionCount}</td>
                      <td className="px-4 py-3 text-right font-semibold text-warning">
                        {formatCurrency(item.totalReceivable)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCustomerFilter(item.customerId);
                            setShowByCustomer(false);
                          }}
                        >
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {!loading && customerReceivables.length > 0 && (
                <tfoot className="bg-elevated font-semibold">
                  <tr>
                    <td colSpan={3} className="px-4 py-3">Total ({customerReceivables.length} Pelanggan)</td>
                    <td className="px-4 py-3 text-right text-warning">
                      {formatCurrency(stats.totalReceivable)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      ) : (
        /* View: Detailed transactions */
        <div className="rounded-lg border border-default overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-elevated">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Kode</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Pelanggan</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Total</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Dibayar</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Sisa Piutang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default bg-bg">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted">
                        <div className="size-5 animate-spin rounded-full border-2 border-default border-t-primary" />
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : receivableSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted">
                      <FileText className="size-12 mx-auto mb-2" />
                      <p>Tidak ada piutang</p>
                    </td>
                  </tr>
                ) : (
                  receivableSales.map((sale) => {
                    const remaining = (sale.total || 0) - (sale.cashAmount || sale.total || 0);
                    const today = new Date();
                    const saleDate = new Date(sale.createdAt);
                    const daysSinceSale = Math.floor((today.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysSinceSale > 30;
                    const isDueSoon = daysSinceSale > 14 && daysSinceSale <= 30;
                    return (
                      <tr key={sale.id} className="hover:bg-elevated/50">
                        <td className="px-4 py-3 text-muted">{formatDate(sale.createdAt)}</td>
                        <td className="px-4 py-3 font-mono">{sale.code}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Users className="size-4 text-muted" />
                            {sale.customer?.name || 'Umum'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">{formatCurrency(sale.total || 0)}</td>
                        <td className="px-4 py-3 text-right text-success">{formatCurrency(sale.cashAmount || 0)}</td>
                        <td className={isOverdue ? "px-4 py-3 text-right font-semibold text-error" :
                                        isDueSoon ? "px-4 py-3 text-right font-semibold text-warning" :
                                        "px-4 py-3 text-right font-semibold text-warning"}>
                          {formatCurrency(remaining)}
                          {isOverdue && <span className="ml-2 text-xs">(LEWAT)</span>}
                          {isDueSoon && <span className="ml-2 text-xs">(SEGERA)</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {!loading && receivableSales.length > 0 && (
                <tfoot className="bg-elevated font-semibold">
                  <tr>
                    <td colSpan={3} className="px-4 py-3">Total ({receivableSales.length} transaksi)</td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(receivableSales.reduce((sum, s) => sum + (s.total || 0), 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-success">
                      {formatCurrency(receivableSales.reduce((sum, s) => sum + (s.cashAmount || 0), 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-warning">
                      {formatCurrency(stats.totalReceivable)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
