"use client";

import { ListPage, fmtDate, fmt } from "@/components/kform/erp";

export default function TransfersPage() {
  return (
    <ListPage
      endpoint="stock-transfer"
      base="/inventory/transfers"
      include="fromWarehouse,toWarehouse,status"
      searchFields="Code,Notes"
      rowLabel={(r) => r.Code}
      columns={[
        { key: "Code", label: "No Transaksi", render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
        { key: "Date", label: "Tanggal", render: (v) => fmtDate(v as string) },
        { key: "FromWarehouse.Name", label: "Keluar Dari", render: (_, r) => r.FromWarehouse?.Name ?? "-" },
        { key: "ToWarehouse.Name", label: "Masuk Ke", render: (_, r) => r.ToWarehouse?.Name ?? "-" },
        { key: "Notes", label: "Keterangan", render: (v) => (v as string) || "-" },
        { key: "TotalItems", label: "Total Item", align: "right", render: (v) => fmt(v, 0) },
        { key: "Status.Name", label: "Status", render: (_, r) => r.Status?.Name ?? r.Status?.Code ?? "-" },
      ]}
    />
  );
}
