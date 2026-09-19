"use client";

import { ListPage } from "@/components/kform/erp";
import { fmtDate, fmt } from "@/components/kform/erp";

export default function StockInPage() {
  return (
    <ListPage
      endpoint="stock-in"
      base="/inventory/stock-in"
      include="warehouse,supplier,status"
      searchFields="Code,Description"
      rowLabel={(r) => r.Code}
      columns={[
        { key: "Code", label: "No Transaksi", render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
        { key: "Date", label: "Tanggal", render: (v) => fmtDate(v as string) },
        { key: "Warehouse.Name", label: "Dept/Gudang", render: (_, r) => r.Warehouse?.Name ?? "-" },
        { key: "Supplier.Name", label: "Supplier", render: (_, r) => r.Supplier?.Name ?? "-" },
        { key: "Description", label: "Keterangan", render: (v) => (v as string) || "-" },
        { key: "TotalItems", label: "Total Item", align: "right", render: (v) => fmt(v, 0) },
        { key: "Status.Name", label: "Status", render: (_, r) => r.Status?.Name ?? r.Status?.Code ?? "-" },
      ]}
    />
  );
}
