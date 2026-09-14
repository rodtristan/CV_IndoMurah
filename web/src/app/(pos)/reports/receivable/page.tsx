"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, Users, AlertTriangle } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { UtilityButton } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ReceivableReportPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("reports/receivable").catch(() => ({ success: false, data: null } as any));
      if (res.success) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { summary = {}, receivables = [] } = data || {};

  const columns = [
    { key: "code", label: "Kode Penjualan", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "customerName", label: "Pelanggan" },
    { key: "total", label: "Total", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "paid", label: "Dibayar", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "remaining", label: "Sisa Piutang", align: "right" as const, render: (v: unknown) => <span className="font-bold text-warning">{formatCurrency(v as number)}</span> },
  ];

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Piutang" value={formatCurrency(summary.totalReceivable || 0)} icon={Users} iconClassName="bg-warning/10 text-warning" />
        <StatCard title="Sudah Dibayar" value={formatCurrency(summary.totalPaid || 0)} icon={Users} iconClassName="bg-success/10 text-success" />
        <StatCard title="Sisa Piutang" value={formatCurrency(summary.remainingReceivable || 0)} icon={AlertTriangle} iconClassName="bg-danger/10 text-danger" />
      </div>

      <Card className="p-4">
        <FilterBar
          fields={[]}
          onFilter={() => fetchData()}
          loading={loading}
          actions={<UtilityButton icon={Download}>Export</UtilityButton>}
        />
        <div className="mt-4">
          <h3 className="mb-4 font-semibold text-highlighted">Rincian Piutang</h3>
          <DataTable data={receivables} columns={columns} loading={loading} emptyMessage="Tidak ada data piutang" />
        </div>
      </Card>
    </PageWrapper>
  );
}
