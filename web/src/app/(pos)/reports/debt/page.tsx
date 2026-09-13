"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, Truck, AlertTriangle } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DebtReportPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("reports/debt").catch(() => ({ success: false, data: null } as any));
      if (res.success) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { summary = {}, debts = [] } = data || {};

  const columns = [
    { key: "code", label: "Kode Pembelian", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "supplierName", label: "Supplier" },
    { key: "total", label: "Total", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "paid", label: "Dibayar", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "remaining", label: "Sisa Hutang", align: "right" as const, render: (v: unknown) => <span className="font-bold text-danger">{formatCurrency(v as number)}</span> },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Laporan Hutang" subtitle="Daftar hutang supplier"
        actions={<><Button variant="outline" icon={Download}>Export</Button><Button variant="primary" icon={RefreshCw} onClick={fetchData} loading={loading}>Refresh</Button></>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Hutang" value={formatCurrency(summary.totalDebt || 0)} icon={Truck} iconClassName="bg-danger/10 text-danger" />
        <StatCard title="Sudah Dibayar" value={formatCurrency(summary.totalPaid || 0)} icon={Truck} iconClassName="bg-success/10 text-success" />
        <StatCard title="Sisa Hutang" value={formatCurrency(summary.remainingDebt || 0)} icon={AlertTriangle} iconClassName="bg-warning/10 text-warning" />
      </div>

      <Card>
        <h3 className="mb-4 font-semibold text-highlighted">Rincian Hutang</h3>
        <DataTable data={debts} columns={columns} loading={loading} emptyMessage="Tidak ada data hutang" />
      </Card>
    </PageWrapper>
  );
}
