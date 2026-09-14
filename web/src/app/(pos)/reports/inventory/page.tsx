"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, Package, AlertTriangle } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { UtilityButton } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function InventoryReportPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [filters, setFilters] = useState({ warehouseId: "", categoryId: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.warehouseId) params.warehouseId = filters.warehouseId;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      const res = await api.get("reports/inventory", params).catch(() => ({ success: false, data: null } as any));
      if (res.success) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { summary = {}, items = [] } = data || {};

  const columns = [
    { key: "productCode", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "productName", label: "Nama Produk" },
    { key: "categoryName", label: "Kategori" },
    { key: "quantity", label: "Stok", align: "right" as const, render: (v: unknown) => formatNumber(Number(v)) },
    { key: "purchasePrice", label: "Harga Beli", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "stockValue", label: "Nilai Stock", align: "right" as const, render: (v: unknown) => <span className="font-semibold">{formatCurrency(v as number)}</span> },
    { key: "isLowStock", label: "Status", render: (v: unknown, row: any) => row.isOutOfStock ? <Badge variant="danger">Habis</Badge> : row.isLowStock ? <Badge variant="warning">Minim</Badge> : <Badge variant="success">Normal</Badge> },
  ];

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Item" value={formatNumber(summary.totalProducts || 0)} icon={Package} iconClassName="bg-info/10 text-info" />
        <StatCard title="Nilai Inventory" value={formatCurrency(summary.totalValue || 0)} icon={Package} iconClassName="bg-success/10 text-success" />
        <StatCard title="Stock Minim" value={formatNumber(summary.lowStockCount || 0)} icon={AlertTriangle} iconClassName="bg-warning/10 text-warning" />
      </div>

      <Card className="p-4">
        <FilterBar
          fields={[
            { key: "warehouseId", label: "Gudang", type: "select", options: [{ value: "", label: "Semua Gudang" }] },
            { key: "categoryId", label: "Kategori", type: "select", options: [{ value: "", label: "Semua Kategori" }] },
          ]}
          onFilter={(v) => setFilters({ warehouseId: (v.warehouseId as string) || "", categoryId: (v.categoryId as string) || "" })}
          loading={loading}
          actions={<UtilityButton icon={Download}>Export</UtilityButton>}
        />
        <div className="mt-4">
          <DataTable data={items} columns={columns} loading={loading} emptyMessage="Tidak ada data" />
        </div>
      </Card>
    </PageWrapper>
  );
}
