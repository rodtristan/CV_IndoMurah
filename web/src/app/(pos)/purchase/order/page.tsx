"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PurchaseOrderPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { $include: "supplier" };
      if (search) params.$search = search;
      if (filterSupplier) params.supplierId = filterSupplier;
      if (filterStatus) params.$where = `status eq '${filterStatus}'`;
      const res = await api.get("PurchaseOrders", params).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search, filterSupplier, filterStatus]);

  const fetchSuppliers = useCallback(async () => {
    const res = await api.get("supplier", { $select: "id,name" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setSuppliers(res.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const statusColors: Record<string, string> = {
    DRAFT: "default", PENDING: "warning", CONFIRMED: "info",
    COMPLETED: "success", CANCELLED: "danger",
  };

  const columns = [
    { key: "Code", label: "Kode PO", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "DueDate", label: "Jatuh Tempo", render: (v: unknown) => v ? formatDate(v as string) : "-" },
    { key: "supplierName", label: "Supplier" },
    { key: "status", label: "Status", render: (v: unknown) => <Badge variant={statusColors[v as string] as any || "default"}>{v as string}</Badge> },
    { key: "Total", label: "Total", align: "right" as const, render: (v: unknown) => <span className="font-semibold">{formatCurrency(v as number)}</span> },
    { key: "paid", label: "Dibayar", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[
            { key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari PO..." },
            { key: "supplierId", label: "Supplier", type: "select", options: [{ value: "", label: "Semua" }, ...suppliers.map(s => ({ value: s.id, label: s.name }))] },
            { key: "status", label: "Status", type: "select", options: [{ value: "", label: "Semua" }, { value: "DRAFT", label: "Draft" }, { value: "PENDING", label: "Pending" }, { value: "CONFIRMED", label: "Dikonfirmasi" }, { value: "COMPLETED", label: "Selesai" }] },
          ]}
          onFilter={(v) => { setSearch((v.search as string) || ""); setFilterSupplier((v.supplierId as string) || ""); setFilterStatus((v.status as string) || ""); }}
          loading={loading}
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada purchase order" />
        </div>
      </Card>
    </PageWrapper>
  );
}
