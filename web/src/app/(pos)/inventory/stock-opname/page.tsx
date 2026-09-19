"use client";

import { ListPage, fmtDate, fmt } from "@/components/kform/erp";

export default function StockOpnamePage() {
  return (
    <ListPage
      endpoint="stock-opname"
      base="/inventory/stock-opname"
      include="warehouse,status"
      searchFields="Code,Notes"
      canCopy={false}
      rowLabel={(r) => r.Code}
      columns={[
        { key: "Code", label: "No Transaksi", render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
        { key: "Date", label: "Tanggal", render: (v) => fmtDate(v as string) },
        { key: "Warehouse.Name", label: "Dept/Gudang", render: (_, r) => r.Warehouse?.Name ?? "-" },
        { key: "Notes", label: "Keterangan", render: (v) => (v as string) || "-" },
        { key: "TotalItems", label: "Total Item", align: "right", render: (v) => fmt(v, 0) },
        { key: "Status.Name", label: "Status", render: (_, r) => r.Status?.Name ?? r.Status?.Code ?? "-" },
      ]}
    />
  );
}
