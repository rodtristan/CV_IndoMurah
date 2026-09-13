"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw, FileText, AlertTriangle, Truck, DollarSign, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { api } from "@/lib/api";
import type { Purchase, Supplier } from "@/types/pos";

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

interface DebtStats {
  totalDebt: number;
  totalOverdue: number;
  supplierCount: number;
  dueSoonCount: number;
}

interface SupplierDebt {
  supplierId: number;
  supplierName: string;
  totalDebt: number;
  transactionCount: number;
}

export default function DebtReportPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Date range
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const [dateFrom, setDateFrom] = useState<string>(firstDay.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState<string>(now.toISOString().split('T')[0]);

  // Filters
  const [supplierFilter, setSupplierFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showBySupplier, setShowBySupplier] = useState(false);

  const [stats, setStats] = useState<DebtStats>({
    totalDebt: 0,
    totalOverdue: 0,
    supplierCount: 0,
    dueSoonCount: 0,
  });

  // Grouped by supplier
  const supplierDebts = useMemo<SupplierDebt[]>(() => {
    const grouped: Record<number, { name: string; totalDebt: number; count: number }> = {};

    const debtPurchases = purchases.filter((p: Purchase) => (p.remaining || 0) > 0);

    debtPurchases.forEach((purchase) => {
      const supplierId = purchase.supplierId;
      const supplierName = purchase.supplier?.name || 'Unknown';

      if (!grouped[supplierId]) {
        grouped[supplierId] = { name: supplierName, totalDebt: 0, count: 0 };
      }
      grouped[supplierId].totalDebt += purchase.remaining || 0;
      grouped[supplierId].count += 1;
    });

    return Object.entries(grouped)
      .map(([supplierId, data]) => ({
        supplierId: Number(supplierId),
        supplierName: data.name,
        totalDebt: data.totalDebt,
        transactionCount: data.count,
      }))
      .sort((a, b) => b.totalDebt - a.totalDebt);
  }, [purchases]);

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

      const [purchaseRes, supplierRes] = await Promise.all([
        api.getPurchases(params),
        api.getSuppliers({ $where: { isActive: true }, $take: 100 }),
      ]);

      if (purchaseRes.success) {
        let purchaseData = purchaseRes.data || [];

        // Filter by supplier if needed
        if (supplierFilter) {
          purchaseData = purchaseData.filter((p: Purchase) => p.supplierId === supplierFilter);
        }

        setPurchases(purchaseData);

        // Calculate debt stats
        const totalDebt = purchaseData.reduce((sum: number, p: Purchase) => sum + (p.remaining || 0), 0);

        // Calculate overdue (if dueDate is passed)
        const today = new Date();
        const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        let totalOverdue = 0;
        let dueSoonCount = 0;

        purchaseData.forEach((p: Purchase) => {
          if (p.remaining && p.remaining > 0) {
            if (p.dueDate) {
              const dueDate = new Date(p.dueDate);
              if (dueDate < today) {
                totalOverdue += p.remaining || 0;
              } else if (dueDate <= sevenDaysLater) {
                dueSoonCount++;
              }
            }
          }
        });

        // Count unique suppliers with debt
        const uniqueSuppliers = new Set(
          purchaseData.filter((p: Purchase) => (p.remaining || 0) > 0).map((p: Purchase) => p.supplierId)
        );

        setStats({
          totalDebt,
          totalOverdue,
          supplierCount: uniqueSuppliers.size,
          dueSoonCount,
        });
      }

      if (supplierRes.success) {
        setSuppliers(supplierRes.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, search, supplierFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    const debtPurchases = purchases.filter((p: Purchase) => (p.remaining || 0) > 0);
    const headers = ['Tanggal', 'Kode', 'Supplier', 'Total', 'Dibayar', 'Sisa', 'Jatuh Tempo', 'Status'];
    const rows = debtPurchases.map((p: Purchase) => {
      const today = new Date();
      const dueDate = p.dueDate ? new Date(p.dueDate) : null;
      const isOverdue = dueDate && dueDate < today;
      return [
        formatDate(p.createdAt),
        p.code,
        p.supplier?.name || '-',
        p.total,
        p.paid || 0,
        p.remaining || 0,
        p.dueDate ? formatDate(p.dueDate) : '-',
        isOverdue ? 'LEWAT' : dueDate ? 'AKTIF' : '-',
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_hutang_${dateTo}.csv`;
    link.click();
  };

  // Filter purchases with remaining debt
  const debtPurchases = purchases.filter((p: Purchase) => (p.remaining || 0) > 0);

  return (
    <PageWrapper>
      <PageTitle
        title="Laporan Hutang"
        subtitle="Daftar hutang supplier"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={showBySupplier ? "solid" : "outline"}
              size="sm"
              onClick={() => setShowBySupplier(!showBySupplier)}
            >
              {showBySupplier ? 'Detail' : 'Per Supplier'}
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
            <div className="flex size-12 items-center justify-center rounded-full bg-info/10">
              <Truck className="size-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Hutang</p>
              <p className="text-xl font-bold text-info">
                {loading ? '...' : formatCurrency(stats.totalDebt)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-error/10">
              <AlertTriangle className="size-6 text-error" />
            </div>
            <div>
              <p className="text-sm text-muted">Hutang Jatuh Tempo</p>
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
              <p className="text-sm text-muted">Jatuh Tempo (7 Hari)</p>
              <p className="text-xl font-bold text-warning">
                {loading ? '...' : stats.dueSoonCount}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Truck className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">Jumlah Supplier</p>
              <p className="text-xl font-bold">
                {loading ? '...' : stats.supplierCount}
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
          <label className="mb-1 block text-sm font-medium">Supplier</label>
          <select
            value={supplierFilter || ""}
            onChange={(e) => setSupplierFilter(e.target.value ? Number(e.target.value) : null)}
            className="rounded-lg border border-default bg-bg px-3 py-2 text-sm"
          >
            <option value="">Semua Supplier</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Pencarian</label>
          <Input
            placeholder="Cari kode atau supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* View: By Supplier */}
      {showBySupplier ? (
        <div className="rounded-lg border border-default overflow-hidden">
          <div className="bg-elevated px-4 py-3 border-b border-default">
            <h3 className="font-semibold">Hutang per Supplier</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-elevated">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted">Supplier</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Jumlah Transaksi</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Total Hutang</th>
                  <th className="px-4 py-3 text-center font-medium text-muted">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default bg-bg">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-muted">Memuat...</td>
                  </tr>
                ) : supplierDebts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-muted">
                      <FileText className="size-12 mx-auto mb-2" />
                      <p>Tidak ada hutang</p>
                    </td>
                  </tr>
                ) : (
                  supplierDebts.map((item) => (
                    <tr key={item.supplierId} className="hover:bg-elevated/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Truck className="size-4 text-muted" />
                          <span className="font-medium">{item.supplierName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">{item.transactionCount}</td>
                      <td className="px-4 py-3 text-right font-semibold text-info">
                        {formatCurrency(item.totalDebt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSupplierFilter(item.supplierId);
                            setShowBySupplier(false);
                          }}
                        >
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {!loading && supplierDebts.length > 0 && (
                <tfoot className="bg-elevated font-semibold">
                  <tr>
                    <td colSpan={2} className="px-4 py-3">Total ({supplierDebts.length} Supplier)</td>
                    <td className="px-4 py-3 text-right text-info">
                      {formatCurrency(stats.totalDebt)}
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
                  <th className="px-4 py-3 text-left font-medium text-muted">Supplier</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Total</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Dibayar</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Sisa Hutang</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Jatuh Tempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default bg-bg">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted">
                        <div className="size-5 animate-spin rounded-full border-2 border-default border-t-primary" />
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : debtPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted">
                      <FileText className="size-12 mx-auto mb-2" />
                      <p>Tidak ada hutang</p>
                    </td>
                  </tr>
                ) : (
                  debtPurchases.map((purchase) => {
                    const today = new Date();
                    const dueDate = purchase.dueDate ? new Date(purchase.dueDate) : null;
                    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    const isOverdue = dueDate && dueDate < today;
                    const isDueSoon = dueDate && !isOverdue && dueDate <= sevenDaysLater;
                    return (
                      <tr key={purchase.id} className="hover:bg-elevated/50">
                        <td className="px-4 py-3 text-muted">{formatDate(purchase.createdAt)}</td>
                        <td className="px-4 py-3 font-mono">{purchase.code}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Truck className="size-4 text-muted" />
                            {purchase.supplier?.name || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">{formatCurrency(purchase.total || 0)}</td>
                        <td className="px-4 py-3 text-right text-success">{formatCurrency(purchase.paid || 0)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-info">
                          {formatCurrency(purchase.remaining || 0)}
                        </td>
                        <td className={isOverdue ? "px-4 py-3 text-error font-medium" :
                                        isDueSoon ? "px-4 py-3 text-warning font-medium" : "px-4 py-3 text-muted"}>
                          {dueDate ? formatDate(purchase.dueDate!) : '-'}
                          {isOverdue && <span className="ml-2 text-xs">(LEWAT)</span>}
                          {isDueSoon && <span className="ml-2 text-xs">(SEGERA)</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {!loading && debtPurchases.length > 0 && (
                <tfoot className="bg-elevated font-semibold">
                  <tr>
                    <td colSpan={3} className="px-4 py-3">Total ({debtPurchases.length} transaksi)</td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(debtPurchases.reduce((sum, p) => sum + (p.total || 0), 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-success">
                      {formatCurrency(debtPurchases.reduce((sum, p) => sum + (p.paid || 0), 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-info">
                      {formatCurrency(stats.totalDebt)}
                    </td>
                    <td></td>
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
