"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { RowEditIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SaleShippingPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [editRow, setEditRow] = useState<any>(null);
  const [form, setForm] = useState({ shippingStatus: "PENDING", shippingDate: "", trackingNumber: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { $include: "Customer", $orderBy: { Date: "desc" }, $take: 200 };
      if (statusFilter) params.$where = { ShippingStatus: statusFilter };
      const res = await api.get("sales", params).catch(() => ({ success: false, data: [] } as any));
      if (res.success) setRows(res.data || []);
    } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEdit = (row: any) => {
    setEditRow(row);
    setForm({
      shippingStatus: row.ShippingStatus || "PENDING",
      shippingDate: row.ShippingDate ? row.ShippingDate.split("T")[0] : "",
      trackingNumber: row.TrackingNumber || "",
    });
  };

  const handleSave = async () => {
    if (!editRow) return;
    const payload = {
      ShippingStatus: form.shippingStatus,
      ShippingDate: form.shippingDate || undefined,
      TrackingNumber: form.trackingNumber || undefined,
    };
    const res = await api.put("sales", `${editRow.ID}/shipping`, payload).catch(() => ({ success: false } as any));
    if (res.success) {
      setEditRow(null);
      fetchData();
    }
  };

  const columns = [
    { key: "Code", label: "No. Transaksi", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "Customer.Name", label: "Pelanggan", render: (_: unknown, row: any) => row.Customer?.Name || "-" },
    { key: "Total", label: "Total", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "TrackingNumber", label: "No. Resi", render: (v: unknown) => (v as string) || <span className="text-muted">-</span> },
    { key: "ShippingDate", label: "Tgl Kirim", render: (v: unknown) => v ? formatDate(v as string) : <span className="text-muted">-</span> },
    {
      key: "ShippingStatus", label: "Status Kirim",
      render: (v: unknown) => <Badge variant={v === "SHIPPED" ? "success" : "warning"}>{v === "SHIPPED" ? "Terkirim" : "Pending"}</Badge>,
    },
    {
      key: "actions", label: "", width: "60px",
      render: (_: unknown, row: any) => <RowEditIcon onClick={() => openEdit(row)} />,
    },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-4 text-sm text-muted">
          Data Pengiriman digunakan untuk mengubah status pengiriman/ekspedisi setiap transaksi penjualan.
        </p>
        <div className="flex items-end gap-4">
          <Select
            label="Status Kirim"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[{ value: "", label: "Semua" }, { value: "PENDING", label: "Pending" }, { value: "SHIPPED", label: "Terkirim" }]}
          />
        </div>
        <div className="mt-4">
          <DataTable data={rows} columns={columns} loading={loading} emptyMessage="Tidak ada data transaksi" />
        </div>
      </Card>

      <Modal open={!!editRow} onClose={() => setEditRow(null)} title="Edit Data Pengiriman" size="md">
        <div className="space-y-4">
          <Select
            label="Status Kirim"
            value={form.shippingStatus}
            onChange={(e) => setForm((f) => ({ ...f, shippingStatus: e.target.value }))}
            options={[{ value: "PENDING", label: "Pending" }, { value: "SHIPPED", label: "Terkirim" }]}
          />
          <Input label="Tanggal Kirim" type="date" value={form.shippingDate} onChange={(e) => setForm((f) => ({ ...f, shippingDate: e.target.value }))} />
          <Input label="No. Resi" value={form.trackingNumber} onChange={(e) => setForm((f) => ({ ...f, trackingNumber: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditRow(null)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
