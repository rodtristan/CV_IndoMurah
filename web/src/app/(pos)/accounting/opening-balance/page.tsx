"use client";

// Saldo Awal Perkiraan / Hutang / Piutang. Perkiraan: total Debit harus sama dengan total Kredit.

import { useEffect, useState } from "react";
import { KCard, KInfoBox, KSaveBar, KSelect, KTabs } from "@/components/kform";
import { KReadOnly, fmt, num, useList, type Row } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ACCOUNT_GROUPS, groupOf } from "../accounts/groups";

const cell = "h-8 w-full rounded border border-[#cfd4da] bg-white px-2 text-right text-[13px] outline-none focus:border-primary";
const textCell = "h-8 w-full rounded border border-[#cfd4da] bg-white px-2 text-[13px] outline-none focus:border-primary";

type Msg = { ok: boolean; text: string } | null;
const isDebitNormal = (a: Row) => ACCOUNT_GROUPS.find((g) => g.key === groupOf(a))?.debitNormal ?? true;

async function save(type: string, body: unknown) {
  const r = await api.put<Row[]>("opening-balance", type, body);
  if (!r.success) throw new Error(r.message || "Gagal menyimpan");
  return r.data ?? [];
}

function AccountTab() {
  const accounts = useList("account", { $take: 500, $include: "Type,Children", $orderBy: { Code: "asc" } });
  const [vals, setVals] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const detail = accounts.filter((a: Row) => !(a.Children?.length > 0));

  useEffect(() => {
    if (!accounts.length) return;
    api.request<Row[]>("GET", "opening-balance/account").then((r) => {
      const byId = new Map(accounts.map((a: Row) => [a.ID, a]));
      const next: Record<string, string> = {};
      for (const o of r.data ?? []) {
        const a = byId.get(o.AccountID); if (!a) continue;
        const v = isDebitNormal(a) ? num(o.Debit) - num(o.Credit) : num(o.Credit) - num(o.Debit);
        next[o.AccountID] = String(v);
      }
      setVals(next);
    }).catch(() => {});
  }, [accounts]);

  // Debit/kredit tiap akun mengikuti sisi normalnya; nilai negatif membalik sisi.
  const sides = detail.map((a: Row) => {
    const v = num(vals[a.ID]); const dn = isDebitNormal(a);
    return { a, debit: (dn ? v : -v) > 0 ? Math.abs(v) : 0, credit: (dn ? v : -v) < 0 ? Math.abs(v) : 0 };
  }).filter((s: { debit: number; credit: number }) => s.debit || s.credit);
  const td = sides.reduce((s: number, x: { debit: number }) => s + x.debit, 0);
  const tc = sides.reduce((s: number, x: { credit: number }) => s + x.credit, 0);
  const ok = Math.abs(td - tc) < 0.005;

  const Table = ({ title, list }: { title: string; list: Row[] }) => (
    <div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <div className="border border-[#c9d0d8]">
        <table className="w-full text-[13px]">
          <thead><tr className="border-b border-[#c9d0d8] bg-[#f5f6f8]"><th className="px-2 py-2 text-left font-medium">Kode</th><th className="px-2 py-2 text-left font-medium">Nama Perkiraan</th><th className="w-40 px-2 py-2 text-right font-medium">Saldo</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-[#9aa3ad]">No data</td></tr>}
            {list.map((a) => (
              <tr key={a.ID} className="border-b border-[#eceff2]"><td className="px-2 py-1 font-mono text-xs">{a.Code}</td><td className="px-2 py-1">{a.Name}</td>
                <td className="p-1"><input type="number" className={cell} value={vals[a.ID] ?? ""} onChange={(e) => { setVals((p) => ({ ...p, [a.ID]: e.target.value })); setMsg(null); }} /></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const onSave = async () => {
    setSaving(true); setMsg(null);
    try {
      await save("account", { rows: sides.map((s: { a: Row; debit: number; credit: number }) => ({ accountId: s.a.ID, debit: s.debit, credit: s.credit })) });
      setMsg({ ok: true, text: "Saldo awal perkiraan tersimpan dan jurnal saldo awal diposting." });
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); } finally { setSaving(false); }
  };

  return (
    <>
      <KInfoBox variant="warning" title="Penting"><span>Saldo awal diinput sekali saat pertama memakai program. Total Debit harus sama dengan total Kredit (Aktiva = Kewajiban + Modal). Menyimpan akan mengganti jurnal saldo awal sebelumnya.</span></KInfoBox>
      <div className="grid gap-6 lg:grid-cols-2">
        <Table title="Aktiva" list={detail.filter((a: Row) => groupOf(a) === "AKTIVA")} />
        <Table title="Kewajiban, Modal & Lainnya" list={detail.filter((a: Row) => groupOf(a) !== "AKTIVA")} />
      </div>
      <div className="mt-2 grid gap-2 lg:grid-cols-2"><KReadOnly label="Total Debit" value={fmt(td)} align="right" /><KReadOnly label="Total Kredit" value={fmt(tc)} align="right" /></div>
      <p className={cn("mt-2 text-sm", ok ? "text-[#2e7d32]" : "text-danger")}>{ok ? "Seimbang (balance)." : `Belum seimbang, selisih ${fmt(td - tc)}.`}</p>
      <KSaveBar onSave={() => { if (ok) onSave(); }} saving={saving} extra={<span className={cn("text-sm", msg?.ok ? "text-[#2e7d32]" : "text-danger")}>{msg?.text ?? (ok ? "" : "Simpan aktif bila balance.")}</span>} />
    </>
  );
}

interface PartyRow { party: string; amount: string; dueDate: string; reference: string }

function PartyTab({ kind }: { kind: "DEBT" | "RECEIVABLE" }) {
  const debt = kind === "DEBT";
  const parties = useList(debt ? "supplier" : "customer", { $take: 500, $orderBy: { Name: "asc" } });
  const [rows, setRows] = useState<PartyRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  useEffect(() => {
    api.request<Row[]>("GET", `opening-balance/${kind.toLowerCase()}`).then((r) => {
      setRows((r.data ?? []).map((o) => ({
        party: String(debt ? o.SupplierID : o.CustomerID), amount: String(debt ? num(o.Credit) : num(o.Debit)),
        dueDate: o.DueDate ? String(o.DueDate).slice(0, 10) : "", reference: o.Reference ?? "",
      })));
    }).catch(() => {});
  }, [kind, debt]);

  const set = (i: number, p: Partial<PartyRow>) => { setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...p } : r))); setMsg(null); };
  const total = rows.reduce((s, r) => s + num(r.amount), 0);
  const opts = parties.map((p: Row) => ({ value: p.ID, label: p.Name }));

  const onSave = async () => {
    setSaving(true); setMsg(null);
    try {
      await save(kind.toLowerCase(), { rows: rows.filter((r) => num(r.amount) > 0 || r.party).map((r) => ({
        supplierId: debt && r.party ? Number(r.party) : undefined, customerId: !debt && r.party ? Number(r.party) : undefined,
        amount: num(r.amount), dueDate: r.dueDate || undefined, reference: r.reference || undefined,
      })) });
      setMsg({ ok: true, text: "Saldo awal tersimpan." });
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); } finally { setSaving(false); }
  };

  return (
    <>
      <div className="border border-[#c9d0d8]">
        <table className="w-full text-[13px]">
          <thead><tr className="border-b border-[#c9d0d8] bg-[#f5f6f8]">
            <th className="px-2 py-2 text-left font-medium">{debt ? "Supplier" : "Pelanggan"}</th><th className="w-44 px-2 py-2 text-right font-medium">Saldo</th>
            <th className="w-40 px-2 py-2 text-left font-medium">Jatuh Tempo</th><th className="w-48 px-2 py-2 text-left font-medium">No. Referensi</th><th className="w-10" />
          </tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-[#9aa3ad]">No data</td></tr>}
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-[#eceff2]">
                <td className="p-1"><KSelect value={r.party} onChange={(v) => set(i, { party: v })} options={opts} placeholder="Pilih..." /></td>
                <td className="p-1"><input type="number" className={cell} value={r.amount} onChange={(e) => set(i, { amount: e.target.value })} /></td>
                <td className="p-1"><input type="date" className={textCell} value={r.dueDate} onChange={(e) => set(i, { dueDate: e.target.value })} /></td>
                <td className="p-1"><input className={textCell} value={r.reference} onChange={(e) => set(i, { reference: e.target.value })} /></td>
                <td className="p-1 text-center"><button type="button" className="text-danger" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>x</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="mt-2 text-sm text-primary" onClick={() => setRows((rs) => [...rs, { party: "", amount: "", dueDate: "", reference: "" }])}>+ Tambah baris</button>
      <div className="mt-2 max-w-[320px]"><KReadOnly label="Total" value={fmt(total)} align="right" /></div>
      <KSaveBar onSave={onSave} saving={saving} extra={msg ? <span className={cn("text-sm", msg.ok ? "text-[#2e7d32]" : "text-danger")}>{msg.text}</span> : undefined} />
    </>
  );
}

export default function OpeningBalancePage() {
  const [tab, setTab] = useState("account");
  return (
    <PageWrapper>
      <KCard>
        <KTabs active={tab} onChange={setTab} tabs={[{ key: "account", label: "Saldo Awal Perkiraan" }, { key: "debt", label: "Saldo Awal Hutang" }, { key: "receivable", label: "Saldo Awal Piutang" }]} />
        <div className="mt-4">
          {tab === "account" && <AccountTab />}
          {tab === "debt" && <PartyTab kind="DEBT" />}
          {tab === "receivable" && <PartyTab kind="RECEIVABLE" />}
        </div>
      </KCard>
    </PageWrapper>
  );
}
