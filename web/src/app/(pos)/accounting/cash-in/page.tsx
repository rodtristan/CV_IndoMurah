"use client";

import { ListPage, fmt, fmtDate } from "@/components/kform/erp";

export default function Page() {
  return (
    <ListPage
      endpoint="cash-in"
      base="/accounting/cash-in"
      include="account"
      searchFields="Code,Description"
      rowLabel={(r) => r.Code}
      columns={[
        { key: "Code", label: "No Transaksi", render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
        { key: "Date", label: "Tanggal", render: (v, r) => fmtDate((v as string) ?? r.CreatedAt) },
        { key: "Account.Name", label: "Masuk ke Akun", render: (_, r) => r.Account ? r.Account.Code + " - " + r.Account.Name : "-" },
        { key: "Description", label: "Keterangan", render: (v) => (v as string) || "-" },
        { key: "Amount", label: "Jumlah", align: "right", render: (v) => fmt(v) },
      ]}
    />
  );
}
