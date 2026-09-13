"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, Coins, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CashReportPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("reports/cash", { startDate, endDate } as any).catch(() => ({ success: false, data: null } as any));
      if (res.success) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { summary, cashIns = [], cashOuts = [] } = data || { summary: {} };

  return (
    <PageWrapper>
      <PageHeader title="Laporan Arus Kas" subtitle={`Periode ${formatDate(startDate)} - ${formatDate(endDate)}`}
        actions={<><Button variant="outline" icon={Download}>Export</Button><Button variant="primary" icon={RefreshCw} onClick={fetchData} loading={loading}>Refresh</Button></>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Saldo Awal" value={formatCurrency(summary.beginningBalance || 0)} icon={Coins} iconClassName="bg-info/10 text-info" />
        <StatCard title="Kas Masuk" value={formatCurrency(summary.totalCashIn || 0)} icon={ArrowDownCircle} iconClassName="bg-success/10 text-success" />
        <StatCard title="Kas Keluar" value={formatCurrency(summary.totalCashOut || 0)} icon={ArrowUpCircle} iconClassName="bg-danger/10 text-danger" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex justify-between border-b-2 border-primary bg-primary/5 px-4 py-3 rounded-lg">
            <span className="font-bold text-primary">SALDO AKHIR</span>
            <span className="font-bold text-xl text-primary">{formatCurrency(summary.endingBalance || 0)}</span>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-highlighted">Kas Masuk</h4>
            <div className="space-y-2">
              {cashIns.slice(0, 5).map((item: any, i: number) => (
                <div key={i} className="flex justify-between border-b border-default pb-2 text-sm">
                  <span className="text-muted">{formatDate(item.date)}</span>
                  <span className="text-success font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              {cashIns.length === 0 && <p className="text-sm text-muted">Tidak ada data</p>}
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-highlighted">Kas Keluar</h4>
            <div className="space-y-2">
              {cashOuts.slice(0, 5).map((item: any, i: number) => (
                <div key={i} className="flex justify-between border-b border-default pb-2 text-sm">
                  <span className="text-muted">{formatDate(item.date)}</span>
                  <span className="text-danger font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              {cashOuts.length === 0 && <p className="text-sm text-muted">Tidak ada data</p>}
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
