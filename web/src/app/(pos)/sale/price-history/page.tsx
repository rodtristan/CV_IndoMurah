"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SalePriceHistoryPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [onlyChanged, setOnlyChanged] = useState(true);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);

  const fetchCustomers = useCallback(async () => {
    const res = await api.get("customer", { $select: "ID,Name" } as any).catch(() => ({ success: false, data: [] } as any));
    if (res.success) setCustomers(res.data || []);
  }, []);

  const runReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("SaleItem", {
        $include: "Sale,Sale.Customer,Sale.SalesPerson,Product",
        $orderBy: { createdAt: "desc" },
        $take: 500,
      } as any).catch(() => ({ success: false, data: [] } as any));

      let data: any[] = res.success ? res.data || [] : [];

      data = data.filter((row) => {
        const saleDate = row.Sale?.Date ? new Date(row.Sale.Date) : null;
        if (saleDate) {
          if (startDate && saleDate < new Date(startDate)) return false;
          if (endDate && saleDate > new Date(endDate + "T23:59:59")) return false;
        }
        if (customerId && String(row.Sale?.CustomerID) !== customerId) return false;
        if (onlyChanged) {
          const current = Number(row.Product?.SellingPrice ?? 0);
          const used = Number(row.UnitPrice);
          if (current === used) return false;
        }
        return true;
      });

      setRows(data);
    } finally { setLoading(false); }
  }, [startDate, endDate, customerId, onlyChanged]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { runReport(); }, [runReport]);

  const columns = [
    { key: "Sale.Code", label: "Kode Transaksi", render: (_: unknown, row: any) => <span className="font-mono text-xs">{row.Sale?.Code || "-"}</span> },
    { key: "Sale.Date", label: "Tanggal", render: (_: unknown, row: any) => formatDate(row.Sale?.Date) },
    { key: "productName", label: "Item", render: (_: unknown, row: any) => row.Product?.Name || "-" },
    { key: "customerName", label: "Pelanggan", render: (_: unknown, row: any) => row.Sale?.Customer?.Name || "-" },
    { key: "salesName", label: "Sales", render: (_: unknown, row: any) => row.Sale?.SalesPerson?.Name || "-" },
    { key: "Quantity", label: "Qty", align: "right" as const },
    { key: "UnitPrice", label: "Harga Saat Jual", align: "right" as const, render: (v: unknown) => <span className="font-semibold">{formatCurrency(v as number)}</span> },
    { key: "currentPrice", label: "Harga Saat Ini", align: "right" as const, render: (_: unknown, row: any) => formatCurrency(row.Product?.SellingPrice ?? 0) },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-4 text-sm text-muted">
          History Harga Jual menampilkan transaksi penjualan yang harga jualnya
          berbeda dari harga jual saat ini pada master data item.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <Input type="date" label="Dari Tanggal" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" label="Sampai Tanggal" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Select
            label="Pelanggan"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            options={[{ value: "", label: "Semua Pelanggan" }, ...customers.map((c) => ({ value: String(c.ID), label: c.Name }))]}
          />
          <label className="flex items-center gap-2 pb-2 text-sm text-highlighted">
            <input type="checkbox" checked={onlyChanged} onChange={(e) => setOnlyChanged(e.target.checked)} className="size-4 rounded border-default accent-primary" />
            Hanya yang berubah harga
          </label>
          <Button variant="primary" onClick={runReport} loading={loading}>Proses</Button>
        </div>
        <div className="mt-4">
          <DataTable data={rows} columns={columns} loading={loading} emptyMessage="Tidak ada data" />
        </div>
      </Card>
    </PageWrapper>
  );
}
