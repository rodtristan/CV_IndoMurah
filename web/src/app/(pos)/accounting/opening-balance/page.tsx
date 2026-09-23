"use client";

// Saldo Awal Perkiraan: Aktiva vs Kewajiban & Modal must balance.
// TODO backend: no endpoint yet - values are kept in this browser (localStorage).

import { useState } from "react";
import { KCard, KInfoBox, KSaveBar } from "@/components/kform";
import { KReadOnly, fmt, num, useList, useLocalState, type Row } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { cn } from "@/lib/utils";
import { groupOf } from "../accounts/groups";

const cell = "h-8 w-full rounded border border-[#cfd4da] bg-white px-2 text-right text-[13px] outline-none focus:border-primary";

export default function OpeningBalancePage() {
  const accounts = useList("account", { $take: 500, $include: "Type,Children", $orderBy: { Code: "asc" } });
  const [vals, setVals] = useLocalState<Record<string, string>>("ketoko_opening_balance", {});
  const [saved, setSaved] = useState(false);
  const detail = accounts.filter((a: Row) => !(a.Children?.length > 0));
  const left = detail.filter((a: Row) => groupOf(a) === "AKTIVA");
  const right = detail.filter((a: Row) => ["KEWAJIBAN", "MODAL"].includes(groupOf(a)));
  const sum = (list: Row[]) => list.reduce((s, a) => s + num(vals[a.ID]), 0);
  const tl = sum(left), tr = sum(right);
  const ok = Math.abs(tl - tr) < 0.005;
  const Table = ({ title, list, total }: { title: string; list: Row[]; total: number }) => (
    <div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <div className="border border-[#c9d0d8]">
        <table className="w-full text-[13px]">
          <thead><tr className="border-b border-[#c9d0d8] bg-[#f5f6f8]"><th className="px-2 py-2 text-left font-medium">Kode</th><th className="px-2 py-2 text-left font-medium">Nama Perkiraan</th><th className="w-40 px-2 py-2 text-right font-medium">Saldo</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-[#9aa3ad]">No data</td></tr>}
            {list.map((a) => (
              <tr key={a.ID} className="border-b border-[#eceff2]"><td className="px-2 py-1 font-mono text-xs">{a.Code}</td><td className="px-2 py-1">{a.Name}</td>
                <td className="p-1"><input type="number" className={cell} value={vals[a.ID] ?? ""} onChange={(e) => { setVals((p) => ({ ...p, [a.ID]: e.target.value })); setSaved(false); }} /></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2"><KReadOnly label={`Total ${title}`} value={fmt(total)} align="right" /></div>
    </div>
  );
  return (
    <PageWrapper>
      <KCard>
        <KInfoBox variant="warning" title="Penting"><span>Saldo awal diinput sekali saat pertama memakai program. Total Aktiva harus sama dengan total Kewajiban &amp; Modal.</span></KInfoBox>
        <div className="grid gap-6 lg:grid-cols-2"><Table title="Aktiva" list={left} total={tl} /><Table title="Kewajiban & Modal" list={right} total={tr} /></div>
        <p className={cn("mt-2 text-sm", ok ? "text-[#2e7d32]" : "text-danger")}>{ok ? "Seimbang (balance)." : `Belum seimbang, selisih ${fmt(tl - tr)}.`}</p>
        <KSaveBar onSave={() => { if (ok) setSaved(true); }} extra={<span className={cn("text-sm", saved ? "text-[#2e7d32]" : "text-[#6b7683]")}>{saved ? "Tersimpan di browser ini (belum ada API)." : ok ? "" : "Simpan aktif bila balance."}</span>} />
      </KCard>
    </PageWrapper>
  );
}
