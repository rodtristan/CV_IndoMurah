"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ProfitLossReport } from "@/lib/types";

export default function ProfitReportPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ProfitLossReport | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ProfitLossReport>("reports/profit-loss", {
        startDate,
        endDate,
      } as any).catch(() => ({ success: false, data: null } as any));
      if (res.success) setReport(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  return (
    <PageWrapper>
      <PageHeader
        title="Laporan Laba Rugi"
        subtitle={`Periode ${formatDate(startDate)} - ${formatDate(endDate)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={Download}>Export</Button>
            <Button variant="primary" icon={RefreshCw} onClick={fetchReport} loading={loading}>Refresh</Button>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(report?.totalRevenue || 0)}
          icon={TrendingUp}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="HPP"
          value={formatCurrency(report?.costOfGoodsSold || 0)}
          icon={TrendingDown}
          iconClassName="bg-danger/10 text-danger"
        />
        <StatCard
          title="Laba Kotor"
          value={formatCurrency(report?.grossProfit || 0)}
          icon={DollarSign}
          iconClassName="bg-info/10 text-info"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-semibold text-highlighted">Rincian Laba Rugi</h3>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between border-b border-default pb-2">
                <span className="font-semibold text-highlighted">PENDAPATAN</span>
                <span className="font-semibold text-success">{formatCurrency(report?.totalRevenue || 0)}</span>
              </div>
              <div className="flex justify-between border-b border-default pb-2 pl-4 text-sm">
                <span className="text-muted">Penjualan Bersih</span>
                <span>{formatCurrency(report?.totalRevenue || 0)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between border-b border-default pb-2">
                <span className="font-semibold text-danger">HPP / COST OF GOODS SOLD</span>
                <span className="font-semibold text-danger">({formatCurrency(report?.costOfGoodsSold || 0)})</span>
              </div>
            </div>

            <div className="flex justify-between border-b-2 border-default bg-success/5 px-4 py-3 rounded-lg">
              <span className="text-lg font-bold text-success">LABA KOTOR (GROSS PROFIT)</span>
              <span className="text-lg font-bold text-success">{formatCurrency(report?.grossProfit || 0)}</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between border-b border-default pb-2">
                <span className="font-semibold text-muted">BEBAN USAHA</span>
                <span className="font-semibold text-warning">({formatCurrency(report?.totalExpenses || 0)})</span>
              </div>
            </div>

            <div className="flex justify-between border-b-2 border-primary bg-primary/5 px-4 py-3 rounded-lg">
              <span className="text-lg font-bold text-primary">LABA BERSIH (NET PROFIT)</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(report?.netProfit || 0)}</span>
            </div>

            <div className="rounded-lg bg-elevated p-4 text-center">
              <p className="text-sm text-muted">Margin Laba</p>
              <p className="text-3xl font-bold text-success">
                {report?.profitMargin?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-highlighted">Filter</h3>
          <div className="space-y-4">
            <Input type="date" label="Dari Tanggal" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="date" label="Sampai Tanggal" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Button variant="primary" className="w-full" onClick={fetchReport} loading={loading}>
              Tampilkan
            </Button>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
