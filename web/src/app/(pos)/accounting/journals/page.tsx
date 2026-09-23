"use client";

import { useState } from "react";
import { KTabs } from "@/components/kform";
import { ListPage, fmt, fmtDate, num, type Row } from "@/components/kform/erp";

const TABS = [
  { key: "manual", label: "Input Manual" },
  { key: "purchase", label: "Pembelian" },
  { key: "sale", label: "Penjualan" },
  { key: "consign", label: "Konsinyasi" },
  { key: "stock", label: "Persediaan" },
  { key: "assembly", label: "Rakitan" },
  { key: "cash", label: "Kas" },
  { key: "all", label: "Semua Jurnal" },
];
const MATCH: Record<string, RegExp> = {
  purchase: /PURCHASE|PEMBELIAN/i, sale: /SALE|PENJUALAN/i, consign: /CONSIGN|KONSINYASI/i,
  stock: /STOCK|TRANSFER|ADJUST|OPNAME|PERSEDIAAN/i, assembly: /PRODUCTION|ASSEMBL|RAKIT/i, cash: /CASH|KAS|DEPOSIT/i,
};

export default function JournalsPage() {
  const [tab, setTab] = useState("manual");
  const filter = (rows: Row[]) => rows.filter((r) => {
    const ref = String(r.ReferenceType ?? "");
    if (tab === "all") return true;
    if (tab === "manual") return !ref;
    return MATCH[tab]?.test(ref);
  });
  const sum = (r: Row, k: "Debit" | "Credit") => (r.JournalEntries ?? []).reduce((s: number, e: Row) => s + num(e[k]), 0);
  return (
    <ListPage
      endpoint="journal"
      base="/accounting/journals"
      include="JournalEntries"
      searchFields="Code,Description"
      rowLabel={(r) => r.Code}
      canCopy
      canEditRow={(r) => !r.ReferenceType}
      filterRows={filter}
      header={<div className="mb-3"><KTabs tabs={TABS} active={tab} onChange={setTab} /></div>}
      columns={[
        { key: "Code", label: "No Transaksi", render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
        { key: "Date", label: "Tanggal", render: (v) => fmtDate(v as string) },
        { key: "Description", label: "Keterangan", render: (v) => (v as string) || "-" },
        { key: "ReferenceType", label: "Sumber", render: (v) => (v ? String(v) : "Input Manual") },
        { key: "debit", label: "Debet", align: "right", render: (_, r) => fmt(sum(r, "Debit")) },
        { key: "credit", label: "Kredit", align: "right", render: (_, r) => fmt(sum(r, "Credit")) },
      ]}
    />
  );
}
