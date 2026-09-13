"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw, FileText, Truck, BarChart3, ShoppingBag, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { api } from "@/lib/api";
import type { Purchase, Supplier, Warehouse } from "@/types/pos";
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
  });
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

interface PurchaseStats {
  totalPurchase: number;
  totalPaid: number;
  totalPayable: number;
  transactionCount: number;
}

interface ChartDataPoint {
  date: string;
  label: string;
  purchases: number;
  transactions: number;
}

export default function PurchaseReportPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Date range - default to current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const [dateFrom, setDateFrom] = useState<string>(firstDay.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState<string>(now.toISOString().split('T')[0]);

  // Filters
  const [supplierFilter, setSupplierFilter] = useState<number | null>(null);
  const [warehouseFilter, setWarehouseFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showChart, setShowChart] = useState(true);

  const [stats, setStats] = useState<PurchaseStats>({
    totalPurchase: 0,
    totalPaid: 0,
    totalPayable: 0,
    transactionCount: 0,
  });

  // Chart data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const grouped: Record<string, { purchases: number; transactions: number }> = {};

    purchases.forEach(purchase => {
      const dateKey = new Date(purchase.createdAt).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = { purchases: 0, transactions: 0 };
      }
      grouped[dateKey].purchases += purchase.total || 0;
      grouped[dateKey].transactions += 1;
    });

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        label: formatDate(date),
        purchases: data.purchases,
        transactions: data.transactions,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [purchases]);

  const maxPurchase = useMemo(() => Math.max(...chartData.map(d => d.purchases), 1), [chartData]);

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
      if (supplierFilter) params.supplierId = supplierFilter;
      if (warehouseFilter) params.warehouseId = warehouseFilter;
      if (statusFilter) params.paymentStatus = statusFilter;

      const [purchaseRes, supplierRes, warehouseRes] = await Promise.all([
        api.getPurchases(params),
        api.getSuppliers({ $where: { isActive: true }, $take: 100 }),
        api.getWarehouses({ $where: { isActive: true }, $take: 100 }),
      ]);

      if (purchaseRes.success) {
        const data = purchaseRes.data || [];
        setPurchases(data);

        const totalPurchase = data.reduce((sum: number, p: Purchase) => sum + (p.total || 0), 0);
        const totalPaid = data.reduce((sum: number, p: Purchase) => sum + (p.paid || 0), 0);
        const totalPayable = data.reduce((sum: number, p: Purchase) => sum + (p.remaining || 0), 0);

        setStats({
          totalPurchase,
          totalPaid,
          totalPayable,
          transactionCount: data.length,
        });
      }

      if (supplierRes.success) {
        setSuppliers(supplierRes.data || []);
      }
      if (warehouseRes.success) {
        setWarehouses(warehouseRes.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, search, supplierFilter, warehouseFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    const headers = ['Kode', 'Tanggal', 'Supplier', 'Gudang', 'Total', 'Dibayar', 'Sisa', 'Status'];
    const rows = purchases.map(p => [
      p.code,
      formatDate(p.createdAt),
      p.supplier?.name || '-',
      p.warehouse?.name || '-',
      p.total,
      p.paid || 0,
      p.remaining || 0,
      p.paymentStatus,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_pembelian_${dateFrom}_${dateTo}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        status === 'PAID' ? "bg-success/10 text-success" :
        status === 'PARTIAL' ? "bg-warning/10 text-warning" : "bg-muted/10 text-muted"
      )}>
        {status === 'PAID' ? 'Lunas' : status === 'PARTIAL' ? 'Sebagian' : 'Tertunda'}
      </span>
    );
  };

  return (
    <PageWrapper>
      <PageTitle
        title="Laporan Pembelian"
        subtitle={`Periode: ${formatDate(dateFrom)} - ${formatDate(dateTo)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={showChart ? "solid" : "outline"}
              icon={BarChart3}
              onClick={() => setShowChart(!showChart)}
              size="sm"
            >
              Chart
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
              <ShoppingBag className="size-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Pembelian</p>
              <p className="text-xl font-bold text-info">
                {loading ? '...' : formatCurrency(stats.totalPurchase)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">Jumlah Transaksi</p>
              <p className="text-xl font-bold">
                {loading ? '...' : formatNumber(stats.transactionCount)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="size-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Sudah Dibayar</p>
              <p className="text-xl font-bold text-success">
                {loading ? '...' : formatCurrency(stats.totalPaid)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-warning/10">
              <Truck className="size-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted">Hutang Supplier</p>
              <p className="text-xl font-bold text-warning">
                {loading ? '...' : formatCurrency(stats.totalPayable)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {showChart && chartData.length > 0 && (
        <div className="mb-6 rounded-lg border border-default bg-bg p-4">
          <h3 className="mb-4 font-semibold">Pembelian per Hari</h3>
          <div className="space-y-2">
            {chartData.map((point) => {
              const barWidth = (point.purchases / maxPurchase) * 100;
              return (
                <div key={point.date} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-muted">{point.label}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="h-8 flex-1 bg-elevated rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-info to-info/70 rounded transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="w-32 text-right text-sm font-medium">
                      {formatCurrency(point.purchases)}
                    </span>
                    <span className="w-16 text-right text-xs text-muted">
                      {point.transactions}x
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          <label className="mb-1 block text-sm font-medium">Gudang</label>
          <select
            value={warehouseFilter || ""}
            onChange={(e) => setWarehouseFilter(e.target.value ? Number(e.target.value) : null)}
            className="rounded-lg border border-default bg-bg px-3 py-2 text-sm"
          >
            <option value="">Semua Gudang</option>
            {warehouses.map(wh => (
              <option key={wh.id} value={wh.id}>{wh.name}</option>
            ))}
          </select>
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
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-default bg-bg px-3 py-2 text-sm"
          >
            <option value="">Semua</option>
            <option value="PAID">Lunas</option>
            <option value="PARTIAL">Sebagian</option>
            <option value="PENDING">Tertunda</option>
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

      {/* Table */}
      <div className="rounded-lg border border-default overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted">Kode</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Tanggal</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Supplier</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Gudang</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Total</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Dibayar</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Sisa</th>
                <th className="px-4 py-3 text-center font-medium text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default bg-bg">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted">
                      <div className="size-5 animate-spin rounded-full border-2 border-default border-t-primary" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted">
                    <FileText className="size-12 mx-auto mb-2" />
                    <p>Tidak ada data untuk periode ini</p>
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => {
                  const remaining = purchase.remaining || 0;
                  return (
                    <tr key={purchase.id} className="hover:bg-elevated/50">
                      <td className="px-4 py-3 font-mono font-medium">{purchase.code}</td>
                      <td className="px-4 py-3 text-muted">{formatDate(purchase.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Truck className="size-4 text-muted" />
                          {purchase.supplier?.name || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{purchase.warehouse?.name || '-'}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(purchase.total || 0)}</td>
                      <td className="px-4 py-3 text-right text-success">{formatCurrency(purchase.paid || 0)}</td>
                      <td className={cn("px-4 py-3 text-right", remaining > 0 ? "text-warning font-medium" : "text-muted")}>
                        {formatCurrency(remaining)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(purchase.paymentStatus)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {!loading && purchases.length > 0 && (
              <tfoot className="bg-elevated font-semibold">
                <tr>
                  <td colSpan={4} className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(stats.totalPurchase)}</td>
                  <td className="px-4 py-3 text-right text-success">{formatCurrency(stats.totalPaid)}</td>
                  <td className="px-4 py-3 text-right text-warning">{formatCurrency(stats.totalPayable)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
