"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatCard, Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { Package, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatNumber, formatDate, localDate } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  IN: "Barang Masuk",
  OUT: "Barang Keluar",
  TRANSFER_IN: "Transfer Masuk",
  TRANSFER_OUT: "Transfer Keluar",
  OPNAME: "Stock Opname",
};

const TYPE_VARIANT: Record<string, "success" | "danger" | "info" | "warning"> = {
  IN: "success",
  OUT: "danger",
  TRANSFER_IN: "info",
  TRANSFER_OUT: "warning",
  OPNAME: "info",
};

export default function StockMutationReportPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return localDate(d);
  });
  const [endDate, setEndDate] = useState(() => localDate());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("products", { $select: "ID,Code,Name" } as any).then((res: any) => {
      if (res.success) {
        setProducts(res.data || []);
        if (!productId && res.data?.[0]) setProductId(String(res.data[0].ID));
      }
    }).catch(() => {});
    api.get("warehouse", { $select: "ID,Name" } as any).then((res: any) => {
      if (res.success) setWarehouses(res.data || []);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runReport = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const params: any = { productId, startDate, endDate };
      if (warehouseId) params.warehouseId = warehouseId;
      const res = await api.get("reports/stock-mutation", params).catch(() => ({ success: false, data: null } as any));
      setData(res.success ? res.data : null);
    } finally { setLoading(false); }
  }, [productId, warehouseId, startDate, endDate]);

  useEffect(() => { runReport(); }, [runReport]);

  const { openingBalance = 0, closingBalance = 0, totalIn = 0, totalOut = 0, mutations = [] } = data || {};

  const columns = [
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "type", label: "Jenis", render: (v: unknown) => <Badge variant={TYPE_VARIANT[v as string] || "info"}>{TYPE_LABEL[v as string] || (v as string)}</Badge> },
    { key: "code", label: "No. Referensi", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "warehouseName", label: "Gudang" },
    { key: "qtyIn", label: "Masuk", align: "right" as const, render: (v: unknown) => (v as number) > 0 ? <span className="font-semibold text-success">+{formatNumber(v as number)}</span> : "-" },
    { key: "qtyOut", label: "Keluar", align: "right" as const, render: (v: unknown) => (v as number) > 0 ? <span className="font-semibold text-danger">-{formatNumber(v as number)}</span> : "-" },
    { key: "balance", label: "Saldo", align: "right" as const, render: (v: unknown) => <span className="font-bold">{formatNumber(v as number)}</span> },
    { key: "description", label: "Keterangan", render: (v: unknown) => (v as string) || <span className="text-muted">-</span> },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-4 text-sm text-muted">
          Laporan Mutasi Stok (Kartu Stok) menampilkan riwayat pergerakan stok
          suatu item dari barang masuk, barang keluar, transfer antar gudang,
          dan penyesuaian stock opname, lengkap dengan saldo berjalan.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <Select
            label="Item"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            options={products.map((p) => ({ value: String(p.ID), label: `${p.Code} - ${p.Name}` }))}
          />
          <Select
            label="Gudang"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            options={[{ value: "", label: "Semua Gudang" }, ...warehouses.map((w) => ({ value: String(w.ID), label: w.Name }))]}
          />
          <Input type="date" label="Dari Tanggal" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" label="Sampai Tanggal" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Button variant="primary" onClick={runReport} loading={loading}>Proses</Button>
        </div>
      </Card>

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatCard title="Saldo Awal" value={formatNumber(openingBalance)} icon={Package} iconClassName="bg-info/10 text-info" />
          <StatCard title="Total Masuk" value={formatNumber(totalIn)} icon={ArrowDownCircle} iconClassName="bg-success/10 text-success" />
          <StatCard title="Total Keluar" value={formatNumber(totalOut)} icon={ArrowUpCircle} iconClassName="bg-danger/10 text-danger" />
          <StatCard title="Saldo Akhir" value={formatNumber(closingBalance)} icon={Package} iconClassName="bg-primary/10 text-primary" />
        </div>
      )}

      <Card className="p-4">
        <h3 className="mb-4 font-semibold text-highlighted">Rincian Mutasi</h3>
        <DataTable data={mutations} columns={columns} loading={loading} emptyMessage="Tidak ada mutasi pada periode ini" />
      </Card>
    </PageWrapper>
  );
}
