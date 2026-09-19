"use client";

import { useState } from "react";
import { KTabs } from "@/components/kform";
import { ListPage, type Row } from "@/components/kform/erp";
import { ACCOUNT_GROUPS, groupOf } from "./groups";

const TABS = [...ACCOUNT_GROUPS.map((g) => ({ key: g.key, label: g.label })), { key: "ALL", label: "Semua Akun" }];

export default function AccountsPage() {
  const [tab, setTab] = useState("ALL");
  return (
    <ListPage
      endpoint="account"
      base="/accounting/accounts"
      include="Type,Children,Parent"
      searchFields="Code,Name"
      orderBy={{ Code: "asc" }}
      pageSize={200}
      canCopy={false}
      rowLabel={(r) => `${r.Code} - ${r.Name}`}
      filterRows={(rows) => rows.filter((r) => tab === "ALL" || groupOf(r) === tab)}
      header={<div className="mb-3"><KTabs tabs={TABS} active={tab} onChange={setTab} /></div>}
      columns={[
        { key: "Code", label: "Kode", render: (v, r: Row) => <span className="font-mono text-xs" style={{ paddingLeft: r.ParentID ? 16 : 0 }}>{String(v)}</span> },
        { key: "Name", label: "Nama Perkiraan" },
        { key: "Kelompok", label: "Kelompok", render: (_, r) => ACCOUNT_GROUPS.find((g) => g.key === groupOf(r))?.label },
        { key: "Parent.Name", label: "Induk", render: (_, r) => r.Parent ? `${r.Parent.Code} - ${r.Parent.Name}` : "-" },
        { key: "Saldo", label: "Saldo Normal", render: (_, r) => (r.Type?.IsDebitNormal ? "Debet" : "Kredit") },
        { key: "Tipe", label: "Tipe", align: "center", render: (_, r) => ((r.Children?.length ?? 0) > 0 ? "H" : "D") },
        { key: "IsActive", label: "Status", render: (v) => (v ? "Aktif" : "Nonaktif") },
      ]}
    />
  );
}
