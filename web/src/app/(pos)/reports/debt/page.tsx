"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, Truck, AlertTriangle } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { StatCard, Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { UtilityButton } from "@/components/ui/GridActions";
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

  const { summary = {}, debts = [], aging = [] } = data || {};

  const agingVariant = (label: string) =>
    label === "Belum Jatuh Tempo" ? "success" : label === "> 90 Hari" ? "danger" : "warning";

  const columns = [
    { key: "code", label: "Kode Pembelian", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "supplierName", label: "Supplier" },
    { key: "total", label: "Total", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "paid", label: "Dibayar", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "remaining", label: "Sisa Hutang", align: "right" as const, render: (v: unknown) => <span className="font-bold text-danger">{formatCurrency(v as number)}</span> },
    {
      key: "agingBucket", label: "Umur Hutang",
      render: (v: unknown) => <Badge variant={agingVariant(v as string)}>{v as string}</Badge>,
    },
  ];

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Hutang" value={formatCurrency(summary.totalDebt || 0)} icon={Truck} iconClassName="bg-danger/10 text-danger" />
        <StatCard title="Sudah Dibayar" value={formatCurrency(summary.totalPaid || 0)} icon={Truck} iconClassName="bg-success/10 text-success" />
        <StatCard title="Sisa Hutang" value={formatCurrency(summary.remainingDebt || 0)} icon={AlertTriangle} iconClassName="bg-warning/10 text-warning" />
      </div>

      {aging.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-3 font-semibold text-highlighted">Umur Hutang (Aging)</h3>
          <div className="flex flex-wrap gap-3">
            {aging.map((bucket: any) => (
              <div key={bucket.label} className="flex items-center gap-2 rounded-lg border border-default px-3 py-2">
                <Badge variant={agingVariant(bucket.label)}>{bucket.label}</Badge>
                <span className="text-sm text-muted">{bucket.count} transaksi</span>
                <span className="text-sm font-semibold">{formatCurrency(bucket.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <FilterBar
          fields={[]}
          onFilter={() => fetchData()}
          loading={loading}
          actions={<UtilityButton icon={Download}>Export</UtilityButton>}
        />
        <div className="mt-4">
          <h3 className="mb-4 font-semibold text-highlighted">Rincian Hutang</h3>
          <DataTable data={debts} columns={columns} loading={loading} emptyMessage="Tidak ada data hutang" />
        </div>
      </Card>
    </PageWrapper>
  );
}
