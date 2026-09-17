"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, ClipboardCheck, CheckCircle, AlertTriangle } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { UtilityButton } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StockOpnameReportPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("reports/stock-opname").catch(() => ({ success: false, data: null } as any));
      if (res.success) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { summary = {}, opnames = [] } = data || {};

  const columns = [
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "warehouseName", label: "Gudang" },
    { key: "status", label: "Status", render: (v: unknown) => {
      const s = v as string;
      return s === "COMPLETED" ? <Badge variant="success">Selesai</Badge> :
             s === "IN_PROGRESS" ? <Badge variant="warning">Proses</Badge> :
             <Badge variant="default">{s}</Badge>;
    }},
    { key: "systemQty", label: "Sistem", align: "right" as const },
    { key: "actualQty", label: "Fisik", align: "right" as const },
    { key: "variance", label: "Selisih", align: "right" as const, render: (v: unknown) => <span className={Number(v) !== 0 ? "font-bold text-warning" : ""}>{v as number}</span> },
    { key: "totalValue", label: "Nilai", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
  ];

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Opname" value={summary.totalOpnames || 0} icon={ClipboardCheck} iconClassName="bg-info/10 text-info" />
        <StatCard title="Selesai" value={summary.completedOpnames || 0} icon={CheckCircle} iconClassName="bg-success/10 text-success" />
        <StatCard title="Total Nilai Selisih" value={formatCurrency(summary.totalVarianceValue || 0)} icon={AlertTriangle} iconClassName="bg-warning/10 text-warning" />
      </div>

      <Card className="p-4">
        <FilterBar
          fields={[]}
          onFilter={() => fetchData()}
          loading={loading}
          actions={<UtilityButton icon={Download}>Export</UtilityButton>}
        />
        <div className="mt-4">
          <h3 className="mb-4 font-semibold text-highlighted">Riwayat Opname</h3>
          <DataTable data={opnames} columns={columns} loading={loading} emptyMessage="Tidak ada data" />
        </div>
      </Card>
    </PageWrapper>
  );
}
