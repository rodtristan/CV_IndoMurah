"use client";

import { ListPage, fmt, fmtDate } from "@/components/kform/erp";

export default function Page() {
  return (
    <ListPage
      endpoint="customer-deposit"
      base="/accounting/customer-deposits"
      include="customer"
      searchFields="Code,Description"
      rowLabel={(r) => r.Code}
      columns={[
        { key: "Code", label: "No Transaksi", render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
        { key: "CreatedAt", label: "Tanggal", render: (v) => fmtDate(v as string) },
        { key: "Jenis", label: "Jenis", render: (_, r) => (String(r.Code).startsWith("DPOUT") ? "DPOUT" : String(r.Code).startsWith("DPUSE") ? "DPUSE (dipakai)" : "DPIN") },
        { key: "Customer.Name", label: "Pelanggan", render: (_, r) => r.Customer?.Name ?? "-" },
        { key: "Description", label: "Keterangan", render: (v) => (v as string) || "-" },
        { key: "Amount", label: "Jumlah", align: "right", render: (v) => fmt(v) },
        { key: "RemainingAmount", label: "Sisa", align: "right", render: (v, r) => (String(r.Code).startsWith("DPIN") ? fmt(v) : "-") },
      ]}
    />
  );
}
