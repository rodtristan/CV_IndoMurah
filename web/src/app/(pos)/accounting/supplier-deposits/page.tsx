"use client";

import { ListPage, fmt, fmtDate } from "@/components/kform/erp";

export default function Page() {
  return (
    <ListPage
      endpoint="supplier-deposit"
      base="/accounting/supplier-deposits"
      include="supplier"
      searchFields="Code,Description"
      rowLabel={(r) => r.Code}
      columns={[
        { key: "Code", label: "No Transaksi", render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
        { key: "CreatedAt", label: "Tanggal", render: (v) => fmtDate(v as string) },
        { key: "Jenis", label: "Jenis", render: (_, r) => (String(r.Code).startsWith("DBOUT") ? "DBOUT" : "DBIN") },
        { key: "Supplier.Name", label: "Supplier", render: (_, r) => r.Supplier?.Name ?? "-" },
        { key: "Description", label: "Keterangan", render: (v) => (v as string) || "-" },
        { key: "Amount", label: "Jumlah", align: "right", render: (v) => fmt(v) },
      ]}
    />
  );
}
