"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, FileText, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function FinancialReportPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("reports/financial", { startDate, endDate } as any).catch(() => ({ success: false, data: null } as any));
      if (res.success) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { summary } = data || { summary: {} };

  return (
    <PageWrapper>
      <PageHeader title="Laporan Keuangan" subtitle={`Periode ${formatDate(startDate)} - ${formatDate(endDate)}`}
        actions={<><Button variant="outline" icon={Download}>Export</Button><Button variant="primary" icon={RefreshCw} onClick={fetchData} loading={loading}>Refresh</Button></>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Pendapatan" value={formatCurrency(summary.totalRevenue || 0)} icon={TrendingUp} iconClassName="bg-success/10 text-success" />
        <StatCard title="HPP" value={formatCurrency(summary.totalCostOfGoodsSold || 0)} icon={TrendingDown} iconClassName="bg-danger/10 text-danger" />
        <StatCard title="Laba Kotor" value={formatCurrency(summary.grossProfit || 0)} icon={DollarSign} iconClassName="bg-info/10 text-info" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-semibold text-highlighted">Detail Laporan Keuangan</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-default pb-2">
              <span className="font-semibold text-highlighted">Total Pendapatan</span>
              <span className="font-bold text-success">{formatCurrency(summary.totalRevenue || 0)}</span>
            </div>
            <div className="flex justify-between border-b border-default pb-2 text-sm">
              <span className="text-muted">Harga Pokok Penjualan</span>
              <span className="text-danger">({formatCurrency(summary.totalCostOfGoodsSold || 0)})</span>
            </div>
            <div className="flex justify-between border-b-2 border-success bg-success/5 px-4 py-3 rounded-lg">
              <span className="font-bold text-success">LABA KOTOR</span>
              <span className="font-bold text-success">{formatCurrency(summary.grossProfit || 0)}</span>
            </div>
            <div className="flex justify-between border-b border-default pb-2 text-sm">
              <span className="text-muted">Total Beban</span>
              <span className="text-warning">({formatCurrency(summary.totalExpenses || 0)})</span>
            </div>
            <div className="flex justify-between border-b-2 border-primary bg-primary/5 px-4 py-3 rounded-lg">
              <span className="font-bold text-primary">LABA BERSIH</span>
              <span className="font-bold text-primary">{formatCurrency(summary.netProfit || 0)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-highlighted">Filter</h3>
          <div className="space-y-4">
            <Input type="date" label="Dari Tanggal" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <Input type="date" label="Sampai Tanggal" value={endDate} onChange={e => setEndDate(e.target.value)} />
            <Button variant="primary" className="w-full" onClick={fetchData} loading={loading}>Tampilkan</Button>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
