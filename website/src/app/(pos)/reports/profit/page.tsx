"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw, TrendingUp, TrendingDown, FileText, BarChart3, Calculator, Percent } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { api } from "@/lib/api";
import type { Sale, SaleItem, Purchase, PurchaseItem } from "@/types/pos";

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

interface ProfitData {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  operationalExpense: number;
  netProfit: number;
  margin: number;
  transactionCount: number;
}

interface ChartDataPoint {
  month: string;
  label: string;
  revenue: number;
  cost: number;
  profit: number;
}

export default function ProfitReportPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showChart, setShowChart] = useState(true);

  // Date range - default to current year
  const now = new Date();
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  const [dateFrom, setDateFrom] = useState<string>(firstDayOfYear.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState<string>(now.toISOString().split('T')[0]);

  // Profit data
  const [profitData, setProfitData] = useState<ProfitData>({
    totalRevenue: 0,
    totalCost: 0,
    grossProfit: 0,
    operationalExpense: 0,
    netProfit: 0,
    margin: 0,
    transactionCount: 0,
  });

  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  // Monthly chart data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const monthly: Record<string, { revenue: number; cost: number; profit: number }> = {};

    // Initialize all months in range
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d <= end; d.setMonth(d.getMonth() + 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      monthly[key] = { revenue: 0, cost: 0, profit: 0 };
      (monthly[key] as any).label = label;
    }

    // Aggregate sales
    sales.forEach(sale => {
      const date = new Date(sale.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthly[key]) {
        monthly[key].revenue += sale.total || 0;
        // Estimate cost as 70% of revenue
        monthly[key].cost += (sale.total || 0) * 0.70;
        monthly[key].profit += (sale.total || 0) * 0.30;
      }
    });

    return Object.entries(monthly)
      .map(([month, data]) => ({
        month,
        label: (data as any).label || month,
        revenue: data.revenue,
        cost: data.cost,
        profit: data.profit,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [sales, dateFrom, dateTo]);

  const maxProfit = useMemo(() => Math.max(...chartData.map(d => Math.max(d.profit, d.revenue - d.cost)), 1), [chartData]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const saleParams: Record<string, any> = {
        $skip: 0,
        $take: 1000,
        $orderBy: { createdAt: 'desc' },
      };

      const purchaseParams: Record<string, any> = {
        $skip: 0,
        $take: 1000,
      };

      if (dateFrom) {
        saleParams.dateFrom = dateFrom;
        purchaseParams.dateFrom = dateFrom;
      }
      if (dateTo) {
        saleParams.dateTo = dateTo;
        purchaseParams.dateTo = dateTo;
      }
      if (search) saleParams.$search = search;

      const [salesRes, purchasesRes] = await Promise.all([
        api.getSales(saleParams),
        api.getPurchases(purchaseParams),
      ]);

      if (salesRes.success && salesRes.data) {
        const salesData = Array.isArray(salesRes.data) ? salesRes.data : [];
        setSales(salesData);

        // Calculate profit with COGS from sale items
        let totalRevenue = 0;
        let totalCost = 0;

        salesData.forEach((sale: Sale) => {
          totalRevenue += sale.total || 0;

          // Calculate actual cost from sale items if available
          if (sale.saleItems && sale.saleItems.length > 0) {
            sale.saleItems.forEach((item: SaleItem) => {
              totalCost += (item.subtotal || 0);
            });
          } else {
            // Fallback: estimate cost as 70% of revenue
            totalCost += (sale.total || 0) * 0.70;
          }
        });

        const grossProfit = totalRevenue - totalCost;
        const operationalExpense = totalRevenue * 0.05; // Estimated 5% operational costs
        const netProfit = grossProfit - operationalExpense;
        const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        setProfitData({
          totalRevenue,
          totalCost,
          grossProfit,
          operationalExpense,
          netProfit,
          margin,
          transactionCount: salesData.length,
        });
      }

      if (purchasesRes.success && purchasesRes.data) {
        setPurchases(Array.isArray(purchasesRes.data) ? purchasesRes.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, search]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = () => {
    const content = `
LAPORAN LABA RUGI
Periode: ${formatDate(dateFrom)} - ${formatDate(dateTo)}
========================================

PENJUALAN           : ${formatCurrency(profitData.totalRevenue)}
HARGA POKOK (HPP)  : ${formatCurrency(profitData.totalCost)}
-----------------------------------------
LABA KOTOR          : ${formatCurrency(profitData.grossProfit)}
BEBAN OPERASIONAL   : ${formatCurrency(profitData.operationalExpense)}
-----------------------------------------
LABA BERSIH         : ${formatCurrency(profitData.netProfit)}
MARGIN LABA         : ${profitData.margin.toFixed(2)}%

JUMLAH TRANSAKSI   : ${profitData.transactionCount}
========================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_laba_rugi_${dateFrom}_${dateTo}.txt`;
    link.click();
  };

  return (
    <PageWrapper>
      <PageTitle
        title="Laporan Laba Rugi"
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
              Export
            </Button>
            <Button variant="outline" icon={RefreshCw} onClick={fetchReport} disabled={loading}>
              Refresh
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
              <TrendingUp className="size-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Penjualan</p>
              <p className="text-xl font-bold text-success">
                {loading ? '...' : formatCurrency(profitData.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-error/10">
              <Calculator className="size-6 text-error" />
            </div>
            <div>
              <p className="text-sm text-muted">Harga Pokok (HPP)</p>
              <p className="text-xl font-bold text-error">
                {loading ? '...' : formatCurrency(profitData.totalCost)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
              <TrendingUp className="size-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Laba Kotor</p>
              <p className="text-xl font-bold text-success">
                {loading ? '...' : formatCurrency(profitData.grossProfit)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <TrendingDown className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">Laba Bersih</p>
              <p className="text-xl font-bold text-primary">
                {loading ? '...' : formatCurrency(profitData.netProfit)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {showChart && chartData.length > 0 && (
        <div className="mb-6 rounded-lg border border-default bg-bg p-4">
          <h3 className="mb-4 font-semibold">Laba per Bulan</h3>
          <div className="space-y-3">
            {chartData.map((point) => {
              const revenueWidth = (point.revenue / maxProfit) * 100;
              const profitWidth = (point.profit / maxProfit) * 100;
              return (
                <div key={point.month} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{point.label}</span>
                    <span className="text-success font-semibold">{formatCurrency(point.profit)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-xs text-muted">Revenue</span>
                      <div className="flex-1 h-4 bg-elevated rounded overflow-hidden">
                        <div
                          className="h-full bg-success/60 rounded transition-all duration-500"
                          style={{ width: `${revenueWidth}%` }}
                        />
                      </div>
                      <span className="w-24 text-xs text-right text-muted">{formatCurrency(point.revenue)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-xs text-muted">Profit</span>
                      <div className="flex-1 h-4 bg-elevated rounded overflow-hidden">
                        <div
                          className="h-full bg-primary rounded transition-all duration-500"
                          style={{ width: `${profitWidth}%` }}
                        />
                      </div>
                      <span className="w-24 text-xs text-right">{formatCurrency(point.profit)}</span>
                    </div>
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
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Pencarian</label>
          <Input
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Profit Summary Table */}
      <div className="mb-6 rounded-lg border border-default bg-bg overflow-hidden">
        <div className="bg-elevated px-6 py-3 border-b border-default">
          <h3 className="font-semibold">Ringkasan Laba Rugi</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-default">
              <span className="text-muted">Total Penjualan (Revenue)</span>
              <span className="font-semibold text-success">{formatCurrency(profitData.totalRevenue)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-default">
              <span className="text-muted">Harga Pokok Penjualan (HPP)</span>
              <span className="font-semibold text-error">-{formatCurrency(profitData.totalCost)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-default font-bold bg-success/5 px-3 -mx-3 rounded">
              <span className="text-lg text-success">Laba Kotor (Gross Profit)</span>
              <span className="text-lg text-success">{formatCurrency(profitData.grossProfit)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-default">
              <span className="text-muted">Beban Operasional (estimasi 5%)</span>
              <span className="font-semibold text-error">-{formatCurrency(profitData.operationalExpense)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-default font-bold bg-primary/5 px-3 -mx-3 rounded">
              <span className="text-lg">Laba Bersih (Net Profit)</span>
              <span className="text-lg text-primary">{formatCurrency(profitData.netProfit)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted flex items-center gap-2">
                <Percent className="size-4" /> Margin Laba
              </span>
              <span className="font-bold text-primary">{profitData.margin.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="rounded-lg border border-default bg-bg overflow-hidden">
        <div className="bg-elevated px-6 py-3 border-b border-default">
          <h3 className="font-semibold">Detail Transaksi ({profitData.transactionCount})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted">Kode</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Tanggal</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Pelanggan</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Total</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Est. Laba</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-5 animate-spin rounded-full border-2 border-default border-t-primary" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted">
                    <FileText className="size-12 mx-auto mb-2" />
                    <p>Tidak ada data</p>
                  </td>
                </tr>
              ) : (
                sales.map((sale) => {
                  const estimatedProfit = (sale.total || 0) * 0.30;
                  return (
                    <tr key={sale.id} className="hover:bg-elevated/50">
                      <td className="px-4 py-3 font-mono">{sale.code}</td>
                      <td className="px-4 py-3 text-muted">{formatDate(sale.createdAt)}</td>
                      <td className="px-4 py-3">{sale.customer?.name || 'Umum'}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(sale.total || 0)}</td>
                      <td className="px-4 py-3 text-right text-success">{formatCurrency(estimatedProfit)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
