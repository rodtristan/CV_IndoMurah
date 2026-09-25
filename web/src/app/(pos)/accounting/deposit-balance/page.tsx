"use client";

// Deposit Saldo: saldo akhir deposit per Pelanggan / Supplier (dihitung dari transaksi deposit).

import { useMemo, useState } from "react";
import { KCard, KRadioGroup, KRow, KSelect } from "@/components/kform";
import { fmt, num, useList, type Row } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function DepositBalancePage() {
  const [type, setType] = useState("customer");
  const [partyId, setPartyId] = useState("");
  const parties = useList(type, { $take: 500 });
  const [rows, setRows] = useState<{ name: string; inn: number; out: number; use: number }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const opts = useMemo(() => parties.map((p: Row) => ({ value: p.ID, label: p.Name })), [parties]);
  const cfg = type === "customer" ? { ep: "customer-deposit", key: "CustomerID", out: "DPOUT", use: "DPUSE" } : { ep: "supplier-deposit", key: "SupplierID", out: "DBOUT", use: "DBUSE" };

  const process = async () => {
    setLoading(true);
    try {
      const r = await api.get<Row[]>(cfg.ep, { $take: 2000, ...(partyId ? { $where: { [cfg.key]: Number(partyId) } } : {}) }, { skipCache: true });
      const m = new Map<number, { name: string; inn: number; out: number; use: number }>();
      for (const d of r.data ?? []) {
        const p = parties.find((x: Row) => x.ID === d[cfg.key]);
        const e = m.get(d[cfg.key]) ?? { name: p?.Name ?? String(d[cfg.key]), inn: 0, out: 0, use: 0 };
        const code = String(d.Code);
        if (code.startsWith(cfg.out) || d.Type === "WITHDRAW") e.out += num(d.Amount);
        else if (code.startsWith(cfg.use) || d.Type === "USAGE") e.use += num(d.Amount);
        else e.inn += num(d.Amount);
        m.set(d[cfg.key], e);
      }
      setRows([...m.values()]);
    } finally { setLoading(false); }
  };

  return (
    <PageWrapper>
      <KCard>
        <KRow cols={3}>
          <KRadioGroup label="Tipe Deposit" inline value={type} onChange={(v) => { setType(v); setPartyId(""); setRows(null); }} options={[{ value: "customer", label: "Deposit Pelanggan" }, { value: "supplier", label: "Deposit Supplier" }]} />
          <KSelect label={type === "customer" ? "Pelanggan" : "Supplier"} value={partyId} onChange={setPartyId} options={opts} placeholder="Semua" />
          <div className="flex items-end pb-3"><button type="button" onClick={process} disabled={loading} className="h-10 rounded bg-[#4caf50] px-6 text-white hover:bg-[#43a047] disabled:opacity-60">{loading ? "Memproses..." : "Proses"}</button></div>
        </KRow>
        <div className="overflow-x-auto border border-[#c9d0d8]">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-[#c9d0d8] bg-[#f5f6f8]">{["No", type === "customer" ? "Pelanggan" : "Supplier", "Deposit Masuk", "Deposit Keluar", "Dipakai Bayar", "Saldo Akhir"].map((h, i) => <th key={h} className={cn("px-3 py-2 font-medium", i >= 2 ? "text-right" : "text-left")}>{h}</th>)}</tr></thead>
            <tbody>
              {(!rows || rows.length === 0) && <tr><td colSpan={6} className="h-32 text-center text-[#9aa3ad]">{rows ? "No data" : "Klik Proses untuk menampilkan saldo"}</td></tr>}
              {(rows ?? []).map((r, i) => <tr key={i} className="border-b border-[#eceff2]"><td className="px-3 py-1.5">{i + 1}</td><td className="px-3 py-1.5">{r.name}</td><td className="px-3 py-1.5 text-right">{fmt(r.inn)}</td><td className="px-3 py-1.5 text-right">{fmt(r.out)}</td><td className="px-3 py-1.5 text-right">{fmt(r.use)}</td><td className="px-3 py-1.5 text-right font-medium">{fmt(r.inn - r.out - r.use)}</td></tr>)}
            </tbody>
          </table>
        </div>
      </KCard>
    </PageWrapper>
  );
}
