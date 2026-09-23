"use client";

import { ListPage, fmt, fmtDate } from "@/components/kform/erp";

export default function Page() {
  return (
    <ListPage
      endpoint="cash-transfer"
      base="/accounting/cash-transfer"
      include="fromAccount,toAccount"
      searchFields="Code,Description"
      rowLabel={(r) => r.Code}
      columns={[
        { key: "Code", label: "No Transaksi", render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
        { key: "Date", label: "Tanggal", render: (v, r) => fmtDate((v as string) ?? r.CreatedAt) },
        { key: "FromAccount.Name", label: "Dari Akun", render: (_, r) => r.FromAccount ? r.FromAccount.Code + " - " + r.FromAccount.Name : "-" },
        { key: "ToAccount.Name", label: "Transfer ke", render: (_, r) => r.ToAccount ? r.ToAccount.Code + " - " + r.ToAccount.Name : "-" },
        { key: "Description", label: "Keterangan", render: (v) => (v as string) || "-" },
        { key: "Amount", label: "Jumlah", align: "right", render: (v) => fmt(v) },
      ]}
    />
  );
}
