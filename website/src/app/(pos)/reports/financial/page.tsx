"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, FileText, TrendingUp, TrendingDown, DollarSign, Scale, Wallet, Calculator, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { api } from "@/lib/api";
import type { Sale, Purchase, Product } from "@/types/pos";

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

interface FinancialStats {
  // Income Statement
  totalRevenue: number;
  totalExpense: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;

  // Balance Sheet
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalReceivable: number;
  totalPayable: number;
  inventoryValue: number;
  cashBalance: number;
}

type ReportView = 'income' | 'balance' | 'summary';

export default function FinancialReportPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ReportView>('income');

  // Date range - default to current year
  const now = new Date();
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  const [dateFrom, setDateFrom] = useState<string>(firstDayOfYear.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState<string>(now.toISOString().split('T')[0]);

  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    totalExpense: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    totalReceivable: 0,
    totalPayable: 0,
    inventoryValue: 0,
    cashBalance: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const saleParams: Record<string, any> = {
        $skip: 0,
        $take: 1000,
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

      const [salesRes, purchaseRes, productsRes] = await Promise.all([
        api.getSales(saleParams),
        api.getPurchases(purchaseParams),
        api.getProducts({ $take: 1000 }),
      ]);

      if (salesRes.success) {
        setSales(salesRes.data || []);
      }
      if (purchaseRes.success) {
        setPurchases(purchaseRes.data || []);
      }
      if (productsRes.success) {
        setProducts(productsRes.data || []);
      }

      // Calculate stats
      const salesData = salesRes.data || [];
      const purchaseData = purchaseRes.data || [];
      const productsData = productsRes.data || [];

      // Income Statement calculations
      const totalRevenue = salesData.reduce((sum: number, s: Sale) => sum + (s.total || 0), 0);
      const totalExpense = purchaseData.reduce((sum: number, p: Purchase) => sum + (p.total || 0), 0);
      const estimatedCOGS = totalRevenue * 0.70; // Cost of goods sold (70% of revenue)
      const grossProfit = totalRevenue - estimatedCOGS;
      const operationalExpense = totalRevenue * 0.05; // Operational costs (5%)
      const netProfit = grossProfit - operationalExpense;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Balance Sheet calculations
      const totalReceivable = salesData.reduce((sum: number, s: Sale) => {
        const remaining = (s.total || 0) - (s.cashAmount || s.total || 0);
        return sum + remaining;
      }, 0);

      const totalPayable = purchaseData.reduce((sum: number, p: Purchase) => sum + (p.remaining || 0), 0);

      const inventoryValue = productsData.reduce((sum: number, p: Product) => {
        return sum + ((p.stock || 0) * (p.purchasePrice || 0));
      }, 0);

      // Simplified cash balance (in real app, this would come from cash flow calculations)
      const cashIn = salesData.reduce((sum: number, s: Sale) => sum + (s.cashAmount || s.total || 0), 0);
      const cashOut = purchaseData.reduce((sum: number, p: Purchase) => sum + (p.paid || 0), 0);
      const cashBalance = cashIn - cashOut;

      // Assets = Receivables + Inventory + Cash
      const totalAssets = totalReceivable + inventoryValue + cashBalance;

      // Liabilities = Payables (simplified)
      const totalLiabilities = totalPayable;

      // Equity = Assets - Liabilities (simplified capital)
      const totalEquity = totalAssets - totalLiabilities;

      setStats({
        totalRevenue,
        totalExpense,
        grossProfit,
        netProfit,
        profitMargin,
        totalAssets,
        totalLiabilities,
        totalEquity,
        totalReceivable,
        totalPayable,
        inventoryValue,
        cashBalance,
      });
    } catch (error) {
      console.error("Failed to fetch financial data:", error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    const content = `
LAPORAN KEUANGAN UMUM
CV IndoMurah
Periode: ${formatDate(dateFrom)} - ${formatDate(dateTo)}
========================================

╔══════════════════════════════════════════════════════╗
║                  NERACA                             ║
╠══════════════════════════════════════════════════════╣
║ AKTIVA                                              ║
║ Kas & Bank                          : ${formatCurrency(stats.cashBalance).padStart(15)}║
║ Piutang Usaha                        : ${formatCurrency(stats.totalReceivable).padStart(15)}║
║ Persediaan                           : ${formatCurrency(stats.inventoryValue).padStart(15)}║
║ Total Aktiva                         : ${formatCurrency(stats.totalAssets).padStart(15)}║
╠══════════════════════════════════════════════════════╣
║ KEWAJIBAN & EKUITAS                                  ║
║ Hutang Usaha                         : ${formatCurrency(stats.totalPayable).padStart(15)}║
║ Modal / Ekuitas                     : ${formatCurrency(stats.totalEquity).padStart(15)}║
║ Total Kewajiban & Ekuitas            : ${formatCurrency(stats.totalAssets).padStart(15)}║
╚══════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════╗
║                  LABA RUGI                          ║
╠══════════════════════════════════════════════════════╣
║ Penjualan Bersih                    : ${formatCurrency(stats.totalRevenue).padStart(15)}║
║ Harga Pokok Penjualan (HPP)         : ${formatCurrency(stats.totalRevenue * 0.70).padStart(15)}║
║ ---------------------------------                    ║
║ LABA KOTOR                          : ${formatCurrency(stats.grossProfit).padStart(15)}║
║ Beban Operasional (5%)              : ${formatCurrency(stats.totalRevenue * 0.05).padStart(15)}║
║ ---------------------------------                    ║
║ LABA BERSIH                         : ${formatCurrency(stats.netProfit).padStart(15)}║
║ Margin Laba                         : ${stats.profitMargin.toFixed(2).padStart(15)}%║
╚══════════════════════════════════════════════════════╝

Dicetak: ${new Date().toLocaleString('id-ID')}
========================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_keuangan_${dateFrom}_${dateTo}.txt`;
    link.click();
  };

  return (
    <PageWrapper>
      <PageTitle
        title="Laporan Keuangan"
        subtitle={`Periode: ${formatDate(dateFrom)} - ${formatDate(dateTo)}`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-default bg-bg overflow-hidden">
              <button
                onClick={() => setView('income')}
                className={`px-3 py-1.5 text-sm ${view === 'income' ? 'bg-primary text-white' : 'hover:bg-elevated'}`}
              >
                Laba Rugi
              </button>
              <button
                onClick={() => setView('balance')}
                className={`px-3 py-1.5 text-sm ${view === 'balance' ? 'bg-primary text-white' : 'hover:bg-elevated'}`}
              >
                Neraca
              </button>
              <button
                onClick={() => setView('summary')}
                className={`px-3 py-1.5 text-sm ${view === 'summary' ? 'bg-primary text-white' : 'hover:bg-elevated'}`}
              >
                Ringkasan
              </button>
            </div>
            <Button variant="outline" icon={Download} onClick={handleExport}>
              Export
            </Button>
            <Button variant="outline" icon={RefreshCw} onClick={fetchData} disabled={loading}>
              Refresh
            </Button>
          </div>
        }
      />

      {/* Summary Cards - Always visible */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
              <TrendingUp className="size-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Penjualan</p>
              <p className="text-xl font-bold text-success">
                {loading ? '...' : formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">Laba Bersih</p>
              <p className="text-xl font-bold text-primary">
                {loading ? '...' : formatCurrency(stats.netProfit)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
              <Scale className="size-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Aset</p>
              <p className="text-xl font-bold text-success">
                {loading ? '...' : formatCurrency(stats.totalAssets)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-info/10">
              <Scale className="size-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Kewajiban</p>
              <p className="text-xl font-bold text-info">
                {loading ? '...' : formatCurrency(stats.totalLiabilities)}
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
      </div>

      {/* INCOME STATEMENT VIEW */}
      {view === 'income' && (
        <div className="space-y-6">
          {/* Laba Rugi Card */}
          <div className="rounded-lg border border-default bg-bg overflow-hidden">
            <div className="bg-elevated px-6 py-4 border-b border-default flex items-center gap-3">
              <Calculator className="size-5 text-primary" />
              <h3 className="font-semibold text-lg">LAPORAN LABA RUGI</h3>
              <span className="text-sm text-muted ml-auto">
                {formatDate(dateFrom)} - {formatDate(dateTo)}
              </span>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Revenue */}
                <div>
                  <div className="flex justify-between py-2 border-b border-default">
                    <span className="text-muted">Penjualan Bersih</span>
                    <span className="font-semibold text-success">{formatCurrency(stats.totalRevenue)}</span>
                  </div>
                </div>

                {/* COGS */}
                <div>
                  <div className="flex justify-between py-2 border-b border-default pl-4">
                    <span className="text-muted">Harga Pokok Penjualan (HPP) - 70%</span>
                    <span className="font-semibold text-error">-{formatCurrency(stats.totalRevenue * 0.70)}</span>
                  </div>
                </div>

                {/* Gross Profit */}
                <div className="flex justify-between py-3 border-b-2 border-default bg-success/5 px-4 rounded">
                  <span className="text-lg font-bold text-success">LABA KOTOR (GROSS PROFIT)</span>
                  <span className="text-lg font-bold text-success">{formatCurrency(stats.grossProfit)}</span>
                </div>

                {/* Expenses */}
                <div>
                  <div className="flex justify-between py-2 border-b border-default pl-4">
                    <span className="text-muted">Beban Operasional (5% dari penjualan)</span>
                    <span className="font-semibold text-error">-{formatCurrency(stats.totalRevenue * 0.05)}</span>
                  </div>
                </div>

                {/* Net Profit */}
                <div className="flex justify-between py-3 border-b-2 border-default bg-primary/5 px-4 rounded">
                  <span className="text-lg font-bold">LABA BERSIH (NET PROFIT)</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(stats.netProfit)}</span>
                </div>

                {/* Profit Margin */}
                <div className="flex justify-between py-2">
                  <span className="text-muted flex items-center gap-2">
                    <BarChart3 className="size-4" /> Margin Laba
                  </span>
                  <span className="font-bold text-primary">{stats.profitMargin.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BALANCE SHEET VIEW */}
      {view === 'balance' && (
        <div className="space-y-6">
          {/* Neraca Card */}
          <div className="rounded-lg border border-default bg-bg overflow-hidden">
            <div className="bg-elevated px-6 py-4 border-b border-default flex items-center gap-3">
              <Scale className="size-5 text-primary" />
              <h3 className="font-semibold text-lg">NERACA (BALANCE SHEET)</h3>
              <span className="text-sm text-muted ml-auto">
                Per {formatDate(dateTo)}
              </span>
            </div>
            <div className="p-6">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* AKTIVA */}
                <div>
                  <h4 className="font-bold text-lg mb-4 text-success">AKTIVA (ASSETS)</h4>
                  <div className="space-y-3">
                    {/* Current Assets */}
                    <div className="pl-4 space-y-2">
                      <h5 className="font-semibold text-muted text-sm uppercase">Aktiva Lancar</h5>

                      <div className="flex justify-between py-1.5 border-b border-dashed border-default">
                        <span>Kas & Bank</span>
                        <span className="font-medium">{formatCurrency(stats.cashBalance)}</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-dashed border-default">
                        <span>Piutang Usaha</span>
                        <span className="font-medium">{formatCurrency(stats.totalReceivable)}</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-dashed border-default">
                        <span>Persediaan Barang</span>
                        <span className="font-medium">{formatCurrency(stats.inventoryValue)}</span>
                      </div>
                    </div>

                    {/* Total Assets */}
                    <div className="flex justify-between py-3 border-t-2 border-default font-bold bg-success/5 px-3 rounded">
                      <span className="text-success">TOTAL AKTIVA</span>
                      <span className="text-success">{formatCurrency(stats.totalAssets)}</span>
                    </div>
                  </div>
                </div>

                {/* KEWAJIBAN & EKUITAS */}
                <div>
                  <h4 className="font-bold text-lg mb-4 text-info">KEWAJIBAN & EKUITAS</h4>
                  <div className="space-y-3">
                    {/* Liabilities */}
                    <div className="pl-4 space-y-2">
                      <h5 className="font-semibold text-muted text-sm uppercase">Kewajiban (Liabilities)</h5>

                      <div className="flex justify-between py-1.5 border-b border-dashed border-default">
                        <span>Hutang Usaha</span>
                        <span className="font-medium">{formatCurrency(stats.totalPayable)}</span>
                      </div>
                    </div>

                    {/* Total Liabilities */}
                    <div className="flex justify-between py-3 border-t-2 border-default font-bold bg-info/5 px-3 rounded">
                      <span className="text-info">TOTAL KEWAJIBAN</span>
                      <span className="text-info">{formatCurrency(stats.totalLiabilities)}</span>
                    </div>

                    {/* Equity */}
                    <div className="pl-4 space-y-2">
                      <h5 className="font-semibold text-muted text-sm uppercase">Ekuitas (Equity)</h5>

                      <div className="flex justify-between py-1.5 border-b border-dashed border-default">
                        <span>Modal / Laba Ditahan</span>
                        <span className="font-medium">{formatCurrency(stats.totalEquity)}</span>
                      </div>
                    </div>

                    {/* Total Liabilities + Equity */}
                    <div className="flex justify-between py-3 border-t-2 border-default font-bold bg-primary/5 px-3 rounded">
                      <span className="text-primary">TOTAL KEWAJIBAN & EKUITAS</span>
                      <span className="text-primary">{formatCurrency(stats.totalAssets)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY VIEW */}
      {view === 'summary' && (
        <div className="space-y-6">
          {/* Summary Table */}
          <div className="rounded-lg border border-default bg-bg overflow-hidden">
            <div className="bg-elevated px-6 py-4 border-b border-default">
              <h3 className="font-semibold text-lg">Ringkasan Keuangan</h3>
            </div>
            <div className="p-6">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Income Summary */}
                <div>
                  <h4 className="font-bold mb-4 text-success flex items-center gap-2">
                    <TrendingUp className="size-5" /> Laba Rugi
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-default">
                      <span className="text-muted">Penjualan</span>
                      <span className="font-medium">{formatCurrency(stats.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-default">
                      <span className="text-muted">HPP (70%)</span>
                      <span className="font-medium text-error">-{formatCurrency(stats.totalRevenue * 0.70)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-default">
                      <span className="text-muted">Beban Operasional (5%)</span>
                      <span className="font-medium text-error">-{formatCurrency(stats.totalRevenue * 0.05)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t-2 border-default font-bold">
                      <span>Laba Bersih</span>
                      <span className="text-primary">{formatCurrency(stats.netProfit)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-muted">
                      <span>Margin Laba</span>
                      <span className="font-medium">{stats.profitMargin.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {/* Balance Summary */}
                <div>
                  <h4 className="font-bold mb-4 text-info flex items-center gap-2">
                    <Scale className="size-5" /> Neraca
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-default">
                      <span className="text-muted">Kas</span>
                      <span className="font-medium">{formatCurrency(stats.cashBalance)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-default">
                      <span className="text-muted">Piutang</span>
                      <span className="font-medium">{formatCurrency(stats.totalReceivable)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-default">
                      <span className="text-muted">Persediaan</span>
                      <span className="font-medium">{formatCurrency(stats.inventoryValue)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-default font-bold text-success">
                      <span>Total Aset</span>
                      <span>{formatCurrency(stats.totalAssets)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-default">
                      <span className="text-muted">Hutang</span>
                      <span className="font-medium text-error">-{formatCurrency(stats.totalPayable)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-primary">
                      <span>Ekuitas</span>
                      <span>{formatCurrency(stats.totalEquity)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Receivables */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-default bg-bg overflow-hidden">
              <div className="bg-warning/5 px-4 py-3 border-b border-default">
                <h3 className="font-semibold text-warning">Daftar Piutang Teratas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-elevated">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-muted">Tanggal</th>
                      <th className="px-4 py-2 text-left font-medium text-muted">Pelanggan</th>
                      <th className="px-4 py-2 text-right font-medium text-muted">Sisa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-muted">Memuat...</td>
                      </tr>
                    ) : sales.filter(s => (s.total - (s.cashAmount || s.total)) > 0).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-muted">
                          <FileText className="size-8 mx-auto mb-2" />
                          Tidak ada piutang
                        </td>
                      </tr>
                    ) : (
                      sales.filter(s => (s.total - (s.cashAmount || s.total)) > 0)
                        .slice(0, 5)
                        .map((sale) => {
                          const remaining = (sale.total || 0) - (s.cashAmount || sale.total || 0);
                          return (
                            <tr key={sale.id} className="hover:bg-elevated/50">
                              <td className="px-4 py-2 text-muted">{formatDate(sale.createdAt)}</td>
                              <td className="px-4 py-2">{sale.customer?.name || 'Umum'}</td>
                              <td className="px-4 py-2 text-right font-semibold text-warning">{formatCurrency(remaining)}</td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-default bg-bg overflow-hidden">
              <div className="bg-info/5 px-4 py-3 border-b border-default">
                <h3 className="font-semibold text-info">Daftar Hutang Teratas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-elevated">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-muted">Tanggal</th>
                      <th className="px-4 py-2 text-left font-medium text-muted">Supplier</th>
                      <th className="px-4 py-2 text-right font-medium text-muted">Sisa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-muted">Memuat...</td>
                      </tr>
                    ) : purchases.filter(p => (p.remaining || 0) > 0).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-muted">
                          <FileText className="size-8 mx-auto mb-2" />
                          Tidak ada hutang
                        </td>
                      </tr>
                    ) : (
                      purchases.filter(p => (p.remaining || 0) > 0)
                        .slice(0, 5)
                        .map((purchase) => (
                          <tr key={purchase.id} className="hover:bg-elevated/50">
                            <td className="px-4 py-2 text-muted">{formatDate(purchase.createdAt)}</td>
                            <td className="px-4 py-2">{purchase.supplier?.name || '-'}</td>
                            <td className="px-4 py-2 text-right font-semibold text-info">{formatCurrency(purchase.remaining || 0)}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
