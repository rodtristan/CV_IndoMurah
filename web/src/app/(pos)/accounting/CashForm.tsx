"use client";

// Kas Masuk / Kas Keluar / Kas Transfer full-page form (Ketoko layout).
// Header: No Transaksi (Auto), Tanggal, Masuk ke / Keluar dari Akun, Saldo Kas, Jumlah Kas, Keterangan.
// Grid: Kode Akun (sumber / penggunaan dana), Keterangan Rincian, Jumlah. Total must equal Jumlah Kas.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { KInfoBox, KInput, KNumber, KRow, KSelect } from "@/components/kform";
import { ConfirmDelete, DocActions, DocShell, KReadOnly, fmt, nowLocal, num, toLocalInput, useDocRoute, useList, type Row } from "@/components/kform/erp";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";
import { cn } from "@/lib/utils";

export type CashKind = "in" | "out" | "transfer";
const CFG = {
  in: { title: "Kas Masuk", endpoint: "cash-in", base: "/accounting/cash-in", prefix: "KM", accLabel: "Masuk ke Akun", srcHint: "Umumnya akun kelompok 4-Pendapatan, 7-Pendapatan Lain atau 3-Modal." },
  out: { title: "Kas Keluar", endpoint: "cash-out", base: "/accounting/cash-out", prefix: "KK", accLabel: "Keluar dari Akun", srcHint: "Umumnya akun kelompok 6-Biaya dan 8-Biaya Lain." },
  transfer: { title: "Kas Transfer", endpoint: "cash-transfer", base: "/accounting/cash-transfer", prefix: "KT", accLabel: "Dari Akun", srcHint: "" },
} as const;

interface Line { accountId: string; info: string; amount: string }
const cell = "h-8 w-full rounded border border-[#cfd4da] bg-white px-2 text-[13px] outline-none focus:border-primary";
const stamp = () => new Date().toISOString().replace(/\D/g, "").slice(0, 14);

export default function CashForm({ kind }: { kind: CashKind }) {
  const cfg = CFG[kind];
  const router = useRouter();
  const { id, copyId } = useDocRoute();
  const loadId = id ?? copyId;
  const isEdit = !!id;
  usePageTitle(isEdit ? `Ubah ${cfg.title}` : `${cfg.title} Baru`);

  const accounts = useList("account", { $take: 500, $include: "Type", $orderBy: { Code: "asc" } });
  const [code, setCode] = useState("");
  const [date, setDate] = useState(nowLocal());
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [del, setDel] = useState(false);

  const label = (a: Row) => `${a.Code} - ${a.Name}`;
  const cashOpts = useMemo(() => accounts.filter((a: Row) => (a.Type?.Code ?? "ASSET") === "ASSET").map((a: Row) => ({ value: a.ID, label: label(a) })), [accounts]);
  const srcOpts = useMemo(() => accounts.map((a: Row) => ({ value: a.ID, label: label(a) })), [accounts]);

  useEffect(() => {
    if (!loadId) return;
    api.getOne<Row>(cfg.endpoint, loadId, {}).then((r) => {
      const d = r.data; if (!d) return setErr("Data tidak ditemukan");
      if (isEdit) { setCode(d.Code); setDate(toLocalInput(d.Date ?? d.CreatedAt)); }
      setAccountId(String(kind === "transfer" ? d.FromAccountID : d.AccountID));
      setToAccountId(String(d.ToAccountID ?? ""));
      setAmount(String(num(d.Amount)));
      setNote(d.Description ?? "");
      if (kind !== "transfer") setLines([{ accountId: "", info: d.Description ?? "", amount: String(num(d.Amount)) }]);
    }).catch(() => setErr("Data tidak ditemukan"));
  }, [loadId, cfg.endpoint, isEdit, kind]);

  const total = lines.reduce((s, l) => s + num(l.amount), 0);
  const setLine = (i: number, p: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...p } : l)));

  const save = async () => {
    setErr("");
    if (!accountId) return setErr(`${cfg.accLabel} wajib dipilih`);
    if (num(amount) <= 0) return setErr("Jumlah harus lebih dari 0");
    if (kind === "transfer") {
      if (!toAccountId) return setErr("Akun tujuan wajib dipilih");
      if (toAccountId === accountId) return setErr("Akun asal dan tujuan tidak boleh sama");
    } else {
      if (lines.length === 0) return setErr("Tambahkan minimal 1 rincian akun");
      if (!isEdit && lines.some((l) => !l.accountId)) return setErr("Kode Akun pada rincian wajib diisi");
      if (Math.abs(total - num(amount)) > 0.005) return setErr(`Jumlah Kas (${fmt(amount)}) dan Total rincian (${fmt(total)}) harus sama`);
    }
    setSaving(true);
    try {
      const desc = note || (kind === "transfer" ? undefined : lines[0]?.info) || undefined;
      const common = { amount: num(amount), description: desc };
      const body = kind === "transfer"
        ? { ...common, fromAccountId: Number(accountId), toAccountId: Number(toAccountId) }
        : { ...common, accountId: Number(accountId) };
      const res = isEdit
        ? await api.patch(cfg.endpoint, id!, body)
        : await api.post(cfg.endpoint, { code: `${cfg.prefix}-${stamp()}`, ...body });
      if (res.success) router.push(cfg.base); else setErr(res.message || "Gagal menyimpan");
    } catch (e) { setErr((e as Error).message || "Gagal menyimpan"); } finally { setSaving(false); }
  };
  const remove = async () => {
    try { const r = await api.delete(cfg.endpoint, id!); if (r.success === false) { setErr(r.message || "Gagal menghapus"); setDel(false); } else router.push(cfg.base); }
    catch (e) { setErr((e as Error).message); setDel(false); }
  };

  return (
    <DocShell backHref={cfg.base} notice={kind !== "transfer" ? "API hanya menyimpan Akun Kas, Jumlah dan Keterangan. Rincian akun (grid) dan Tanggal belum disimpan di backend." : "Tanggal belum disimpan di backend."} error={err}>
      <KRow cols={2}>
        <div>
          <KReadOnly label="No Transaksi" value={isEdit ? code : "Auto"} />
          <KInput label="Tanggal" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
          <KInput label="Keterangan" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div>
          <KRow cols={2}>
            <KSelect label={cfg.accLabel} value={accountId} onChange={setAccountId} options={cashOpts} />
            {kind === "transfer"
              ? <KSelect label="Transfer ke" value={toAccountId} onChange={setToAccountId} options={cashOpts.filter((o) => String(o.value) !== accountId)} />
              : <KReadOnly label="Saldo Kas" value="-" align="right" />}
          </KRow>
          <KNumber label={kind === "transfer" ? "Jumlah" : "Jumlah Kas"} value={amount} onChange={setAmount} />
        </div>
      </KRow>

      {kind !== "transfer" && (
        <>
          <KInfoBox title="Penting"><span>Nominal Jumlah Kas dan Total di bagian bawah harus sama. {cfg.srcHint}</span></KInfoBox>
          <div className="overflow-x-auto border border-[#c9d0d8]">
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-[#c9d0d8]">
                <th className="w-12 px-2 py-2 text-left font-medium">No</th>
                <th className="px-2 py-2 text-left font-medium">Kode Akun</th>
                <th className="px-2 py-2 text-left font-medium">Keterangan Rincian</th>
                <th className="w-44 px-2 py-2 text-right font-medium">Jumlah</th>
              </tr></thead>
              <tbody>
                {lines.length === 0 && <tr><td colSpan={4} className="h-40 text-center text-[16px] text-[#9aa3ad]">No data</td></tr>}
                {lines.map((l, i) => (
                  <tr key={i} onClick={() => setSel(i)} className={cn("border-b border-[#eceff2]", sel === i && "bg-primary/5")}>
                    <td className="px-2 py-1">{i + 1}</td>
                    <td className="p-1">
                      <select className={cell} value={l.accountId} onChange={(e) => setLine(i, { accountId: e.target.value })}>
                        <option value="">Pilih akun...</option>
                        {srcOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="p-1"><input className={cell} value={l.info} onChange={(e) => setLine(i, { info: e.target.value })} /></td>
                    <td className="p-1"><input type="number" className={cn(cell, "text-right")} value={l.amount} onChange={(e) => setLine(i, { amount: e.target.value })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div className="flex gap-2">
              <button type="button" onClick={() => setLines([...lines, { accountId: "", info: "", amount: String(Math.max(num(amount) - total, 0) || "") }])} className="inline-flex h-10 items-center gap-1 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6]"><Plus className="size-4" /> Add Data</button>
              <button type="button" disabled={sel === null} onClick={() => { if (sel !== null) { setLines(lines.filter((_, i) => i !== sel)); setSel(null); } }} className="inline-flex h-10 w-11 items-center justify-center rounded border border-[#cfd4da] bg-white hover:bg-[#f3f4f6] disabled:opacity-50"><Trash2 className="size-4" /></button>
            </div>
            <div className="w-72"><KReadOnly label="Total" value={<span className={cn(Math.abs(total - num(amount)) > 0.005 && "text-danger")}>{fmt(total)}</span>} align="right" /></div>
          </div>
        </>
      )}
      <DocActions onNew={() => router.push(`${cfg.base}/new`)} onSave={save} saving={saving} canDelete={isEdit} onDelete={() => setDel(true)} />
      <ConfirmDelete open={del} onClose={() => setDel(false)} onConfirm={remove} label={code || cfg.title} />
    </DocShell>
  );
}
