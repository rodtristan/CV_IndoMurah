"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, RefreshCw, Search, ShoppingCart } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
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
      const res = await api.get("purchase-order", params).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data?.data || []);
    } finally { setLoading(false); }
  }, [search, filterSupplier, filterStatus]);

  const fetchSuppliers = useCallback(async () => {
    const res = await api.get("suppliers", { $select: "id,name" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setSuppliers(res.data?.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const statusColors: Record<string, string> = {
    DRAFT: "default", PENDING: "warning", CONFIRMED: "info",
    COMPLETED: "success", CANCELLED: "danger",
  };

  const columns = [
    { key: "code", label: "Kode PO", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "dueDate", label: "Jatuh Tempo", render: (v: unknown) => v ? formatDate(v as string) : "-" },
    { key: "supplierName", label: "Supplier" },
    { key: "status", label: "Status", render: (v: unknown) => <Badge variant={statusColors[v as string] as any || "default"}>{v as string}</Badge> },
    { key: "total", label: "Total", align: "right" as const, render: (v: unknown) => <span className="font-semibold">{formatCurrency(v as number)}</span> },
    { key: "paid", label: "Dibayar", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Purchase Order" subtitle="Daftar purchase order"
        actions={<Button variant="primary" icon={Plus}>PO Baru</Button>} />

      <Card>
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <Input placeholder="Cari PO..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" leftIcon={Search} />
          <Select label="Supplier" value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)} options={[{ value: "", label: "Semua" }, ...suppliers.map(s => ({ value: s.id, label: s.name }))]} />
          <Select label="Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} options={[{ value: "", label: "Semua" }, { value: "DRAFT", label: "Draft" }, { value: "PENDING", label: "Pending" }, { value: "CONFIRMED", label: "Dikonfirmasi" }, { value: "COMPLETED", label: "Selesai" }]} />
          <Button variant="outline" icon={RefreshCw} onClick={fetchData} loading={loading}>Refresh</Button>
        </div>
        <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada purchase order" />
      </Card>
    </PageWrapper>
  );
}

