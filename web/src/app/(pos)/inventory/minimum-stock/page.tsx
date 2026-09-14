"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { api } from "@/lib/api-client";
import { formatNumber } from "@/lib/utils";

export default function MinimumStockPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [warehouseId, setWarehouseId] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { $where: "minimumStock > 0", $include: "category,unit" };
      if (warehouseId) params.warehouseId = warehouseId;
      const res = await api.get("products", params).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) {
        const items = res.data?.data || [];
        setData(items.filter((p: any) => {
          const stock = p.productStocks?.[0]?.quantity || 0;
          return stock <= (p.minimumStock || 0);
        }));
      }
    } finally { setLoading(false); }
  }, [warehouseId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "name", label: "Nama Produk" },
    { key: "categoryName", label: "Kategori", render: (v: unknown) => v || "-" },
    { key: "quantity", label: "Stok", align: "right" as const, render: (v: unknown) => formatNumber(Number(v)) },
    { key: "minimumStock", label: "Min Stock", align: "right" as const, render: (v: unknown) => formatNumber(Number(v)) },
    { key: "status", label: "Status", render: (_: unknown, row: any): any => {
      const stock = row.quantity || 0;
      if (stock === 0) return <Badge variant="danger">Habis</Badge>;
      if (stock <= (row.minimumStock || 0)) return <Badge variant="warning">Di Bawah Min</Badge>;
      return <Badge variant="success">Normal</Badge>;
    }},
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "warehouseId", label: "Gudang", type: "select", options: [{ value: "", label: "Semua Gudang" }] }]}
          onFilter={(v) => setWarehouseId((v.warehouseId as string) || "")}
          loading={loading}
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada produk di bawah minimum" />
        </div>
      </Card>
    </PageWrapper>
  );
}
