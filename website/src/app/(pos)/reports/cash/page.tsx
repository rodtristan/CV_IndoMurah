"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, FileText, ArrowLeftRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { api } from "@/lib/api";
import type { CashIn, CashOut, CashTransfer } from "@/types/pos";

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

interface CashStats {
  totalIn: number;
  totalOut: number;
  totalTransfer: number;
  balance: number;
  openingBalance: number;
  closingBalance: number;
}

interface ChartDataPoint {
  date: string;
  label: string;
  cashIn: number;
  cashOut: number;
  balance: number;
}

export default function CashReportPage() {
  const [cashIns, setCashIns] = useState<CashIn[]>([]);
  const [cashOuts, setCashOuts] = useState<CashOut[]>([]);
  const [transfers, setTransfers] = useState<CashTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  // Date range - default to current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const [dateFrom, setDateFrom] = useState<string>(firstDay.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState<string>(now.toISOString().split('T')[0]);

  // Estimated opening balance (simplified - could be calculated from prior periods)
  const [openingBalance, setOpeningBalance] = useState<number>(0);

  const [stats, setStats] = useState<CashStats>({
    totalIn: 0,
    totalOut: 0,
    totalTransfer: 0,
    balance: 0,
    openingBalance: 0,
    closingBalance: 0,
  });

  // Chart data - aggregate by day
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const daily: Record<string, { cashIn: number; cashOut: number }> = {};

    cashIns.forEach(c => {
      const dateKey = new Date(c.date).toISOString().split('T')[0];
      if (!daily[dateKey]) daily[dateKey] = { cashIn: 0, cashOut: 0 };
      daily[dateKey].cashIn += c.amount;
    });

    cashOuts.forEach(c => {
      const dateKey = new Date(c.date).toISOString().split('T')[0];
      if (!daily[dateKey]) daily[dateKey] = { cashIn: 0, cashOut: 0 };
      daily[dateKey].cashOut += c.amount;
    });

    let runningBalance = openingBalance;
    return Object.entries(daily)
      .map(([date, data]) => {
        runningBalance += data.cashIn - data.cashOut;
        return {
          date,
          label: formatDate(date),
          cashIn: data.cashIn,
          cashOut: data.cashOut,
          balance: runningBalance,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [cashIns, cashOuts, openingBalance]);

  const maxAmount = useMemo(() => {
    const maxIn = Math.max(...chartData.map(d => d.cashIn), 1);
    const maxOut = Math.max(...chartData.map(d => d.cashOut), 1);
    return Math.max(maxIn, maxOut);
  }, [chartData]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const [inRes, outRes, transferRes] = await Promise.all([
        api.request<CashIn[]>('GET', 'cash-ins', undefined, { ...params, $take: 1000 }),
        api.request<CashOut[]>('GET', 'cash-outs', undefined, { ...params, $take: 1000 }),
        api.request<CashTransfer[]>('GET', 'cash-transfers', undefined, { ...params, $take: 1000 }),
      ]);

      if (inRes.success && inRes.data) setCashIns(Array.isArray(inRes.data) ? inRes.data : []);
      if (outRes.success && outRes.data) setCashOuts(Array.isArray(outRes.data) ? outRes.data : []);
      if (transferRes.success && transferRes.data) setTransfers(Array.isArray(transferRes.data) ? transferRes.data : []);

      const cashInData = (inRes.data && Array.isArray(inRes.data)) ? inRes.data : [];
      const cashOutData = (outRes.data && Array.isArray(outRes.data)) ? outRes.data : [];
      const transferData = (transferRes.data && Array.isArray(transferRes.data)) ? transferRes.data : [];
      const totalIn = cashInData.reduce((sum: number, c: CashIn) => sum + c.amount, 0);
      const totalOut = cashOutData.reduce((sum: number, c: CashOut) => sum + c.amount, 0);
      const totalTransfer = transferData.reduce((sum: number, t: CashTransfer) => sum + t.amount, 0);
      const balance = totalIn - totalOut;

      setStats({
        totalIn,
        totalOut,
        totalTransfer,
        balance,
        openingBalance,
        closingBalance: openingBalance + balance,
      });
    } catch (error) {
      console.error("Failed to fetch cash data:", error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, openingBalance]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    const content = `
LAPORAN ARUS KAS
Periode: ${formatDate(dateFrom)} - ${formatDate(dateTo)}
========================================

SALDO AWAL        : ${formatCurrency(stats.openingBalance)}
KAS MASUK         : ${formatCurrency(stats.totalIn)}
KAS KELUAR       : ${formatCurrency(stats.totalOut)}
-----------------------------------------
SALDO AKHIR      : ${formatCurrency(stats.closingBalance)}

========================================
Detail Kas Masuk (${cashIns.length} transaksi):
${cashIns.map(c => `- ${c.code} | ${formatDate(c.date)} | ${c.account?.name || '-'} | ${formatCurrency(c.amount)}`).join('\n') || '- Tidak ada data'}

Detail Kas Keluar (${cashOuts.length} transaksi):
${cashOuts.map(c => `- ${c.code} | ${formatDate(c.date)} | ${c.account?.name || '-'} | ${formatCurrency(c.amount)}`).join('\n') || '- Tidak ada data'}

Detail Transfer (${transfers.length} transaksi):
${transfers.map(t => `- ${t.code} | ${formatDate(t.date)} | ${formatCurrency(t.amount)}`).join('\n') || '- Tidak ada data'}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_kas_${dateFrom}_${dateTo}.txt`;
    link.click();
  };

  return (
    <PageWrapper>
      <PageTitle
        title="Laporan Arus Kas"
        subtitle={`Periode: ${formatDate(dateFrom)} - ${formatDate(dateTo)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={Download} onClick={handleExport}>
              Export
            </Button>
            <Button variant="outline" icon={RefreshCw} onClick={fetchData} disabled={loading}>
              Refresh
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-info/10">
              <Wallet className="size-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted">Saldo Awal</p>
              <p className="text-xl font-bold text-info">
                {loading ? '...' : formatCurrency(stats.openingBalance)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
              <ArrowUpRight className="size-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Kas Masuk</p>
              <p className="text-xl font-bold text-success">
                {loading ? '...' : formatCurrency(stats.totalIn)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-error/10">
              <ArrowDownRight className="size-6 text-error" />
            </div>
            <div>
              <p className="text-sm text-muted">Kas Keluar</p>
              <p className="text-xl font-bold text-error">
                {loading ? '...' : formatCurrency(stats.totalOut)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <ArrowLeftRight className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">Transfer</p>
              <p className="text-xl font-bold text-primary">
                {loading ? '...' : formatCurrency(stats.totalTransfer)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
              <TrendingDown className="size-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Saldo Akhir</p>
              <p className="text-xl font-bold text-success">
                {loading ? '...' : formatCurrency(stats.closingBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="mb-6 rounded-lg border border-default bg-bg p-4">
          <h3 className="mb-4 font-semibold">Arus Kas Harian</h3>
          <div className="space-y-2">
            {chartData.slice(-14).map((point) => {
              const inWidth = (point.cashIn / maxAmount) * 100;
              const outWidth = (point.cashOut / maxAmount) * 100;
              return (
                <div key={point.date} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-muted">{point.label}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-xs text-success">In</span>
                      <div className="flex-1 h-4 bg-elevated rounded overflow-hidden">
                        <div
                          className="h-full bg-success/70 rounded"
                          style={{ width: `${inWidth}%` }}
                        />
                      </div>
                      <span className="w-24 text-xs text-right">{formatCurrency(point.cashIn)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-xs text-error">Out</span>
                      <div className="flex-1 h-4 bg-elevated rounded overflow-hidden">
                        <div
                          className="h-full bg-error/70 rounded"
                          style={{ width: `${outWidth}%` }}
                        />
                      </div>
                      <span className="w-24 text-xs text-right">{formatCurrency(point.cashOut)}</span>
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
        <div>
          <label className="mb-1 block text-sm font-medium">Saldo Awal (Rp)</label>
          <Input
            type="number"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(Number(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>

      {/* Cash In Table */}
      <div className="mb-6 rounded-lg border border-default bg-bg overflow-hidden">
        <div className="bg-success/5 px-4 py-3 border-b border-default">
          <h3 className="font-semibold text-success">Kas Masuk ({cashIns.length} transaksi)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-muted">Kode</th>
                <th className="px-4 py-2 text-left font-medium text-muted">Tanggal</th>
                <th className="px-4 py-2 text-left font-medium text-muted">Akun</th>
                <th className="px-4 py-2 text-left font-medium text-muted">Keterangan</th>
                <th className="px-4 py-2 text-right font-medium text-muted">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default">
              {cashIns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    <FileText className="size-8 mx-auto mb-2" />
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                cashIns.map((c) => (
                  <tr key={c.id} className="hover:bg-elevated/50">
                    <td className="px-4 py-2 font-mono">{c.code}</td>
                    <td className="px-4 py-2 text-muted">{formatDate(c.date)}</td>
                    <td className="px-4 py-2">{c.account?.name || '-'}</td>
                    <td className="px-4 py-2 text-muted">{c.description || '-'}</td>
                    <td className="px-4 py-2 text-right font-semibold text-success">{formatCurrency(c.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {cashIns.length > 0 && (
              <tfoot className="bg-elevated font-semibold">
                <tr>
                  <td colSpan={4} className="px-4 py-2">Total Kas Masuk</td>
                  <td className="px-4 py-2 text-right text-success">{formatCurrency(stats.totalIn)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Cash Out Table */}
      <div className="mb-6 rounded-lg border border-default bg-bg overflow-hidden">
        <div className="bg-error/5 px-4 py-3 border-b border-default">
          <h3 className="font-semibold text-error">Kas Keluar ({cashOuts.length} transaksi)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-muted">Kode</th>
                <th className="px-4 py-2 text-left font-medium text-muted">Tanggal</th>
                <th className="px-4 py-2 text-left font-medium text-muted">Akun</th>
                <th className="px-4 py-2 text-left font-medium text-muted">Keterangan</th>
                <th className="px-4 py-2 text-right font-medium text-muted">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default">
              {cashOuts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    <FileText className="size-8 mx-auto mb-2" />
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                cashOuts.map((c) => (
                  <tr key={c.id} className="hover:bg-elevated/50">
                    <td className="px-4 py-2 font-mono">{c.code}</td>
                    <td className="px-4 py-2 text-muted">{formatDate(c.date)}</td>
                    <td className="px-4 py-2">{c.account?.name || '-'}</td>
                    <td className="px-4 py-2 text-muted">{c.description || '-'}</td>
                    <td className="px-4 py-2 text-right font-semibold text-error">{formatCurrency(c.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {cashOuts.length > 0 && (
              <tfoot className="bg-elevated font-semibold">
                <tr>
                  <td colSpan={4} className="px-4 py-2">Total Kas Keluar</td>
                  <td className="px-4 py-2 text-right text-error">{formatCurrency(stats.totalOut)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Transfer Table */}
      {transfers.length > 0 && (
        <div className="rounded-lg border border-default bg-bg overflow-hidden">
          <div className="bg-primary/5 px-4 py-3 border-b border-default">
            <h3 className="font-semibold text-primary">Transfer Kas ({transfers.length} transaksi)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-elevated">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted">Kode</th>
                  <th className="px-4 py-2 text-left font-medium text-muted">Tanggal</th>
                  <th className="px-4 py-2 text-left font-medium text-muted">Dari Akun</th>
                  <th className="px-4 py-2 text-left font-medium text-muted">Ke Akun</th>
                  <th className="px-4 py-2 text-right font-medium text-muted">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-elevated/50">
                    <td className="px-4 py-2 font-mono">{t.code}</td>
                    <td className="px-4 py-2 text-muted">{formatDate(t.date)}</td>
                    <td className="px-4 py-2">{t.fromAccount?.name || '-'}</td>
                    <td className="px-4 py-2">{t.toAccount?.name || '-'}</td>
                    <td className="px-4 py-2 text-right font-semibold text-primary">{formatCurrency(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-elevated font-semibold">
                <tr>
                  <td colSpan={4} className="px-4 py-2">Total Transfer</td>
                  <td className="px-4 py-2 text-right text-primary">{formatCurrency(stats.totalTransfer)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
