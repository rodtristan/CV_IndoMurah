"use client";

// Jurnal Umum (input manual): debet / kredit grid with live balance check.
// Automatic (system) journals open read-only.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { KInfoBox, KInput, KRow } from "@/components/kform";
import { ConfirmDelete, DocActions, DocShell, KReadOnly, fmt, nowLocal, num, toIso, toLocalInput, useDocRoute, useList, type Row } from "@/components/kform/erp";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";
import { cn } from "@/lib/utils";

interface Line { entryId?: number; accountId: string; memo: string; debit: string; credit: string }
const cell = "h-8 w-full rounded border border-[#cfd4da] bg-white px-2 text-[13px] outline-none focus:border-primary disabled:bg-[#f3f4f6]";

export default function JournalForm() {
  const router = useRouter();
  const { id, copyId } = useDocRoute();
  const loadId = id ?? copyId;
  const isEdit = !!id;
  usePageTitle(isEdit ? "Ubah Jurnal" : "Jurnal Baru");

  const accounts = useList("account", { $take: 500, $orderBy: { Code: "asc" } });
  const [code, setCode] = useState("");
  const [date, setDate] = useState(nowLocal());
  const [desc, setDesc] = useState("");
  const [refType, setRefType] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [del, setDel] = useState(false);
  const readOnly = isEdit && !!refType;

  const opts = useMemo(() => accounts.map((a: Row) => ({ value: a.ID, label: `${a.Code} - ${a.Name}` })), [accounts]);

  useEffect(() => {
    if (!loadId) return;
    api.getOne<Row>("journal", loadId, { $include: "JournalEntries,JournalEntries.Lines" }).then((r) => {
      const d = r.data; if (!d) return setErr("Data tidak ditemukan");
      // Journal -> JournalEntry (header) -> JournalEntryLine (per-account debit/kredit row).
      const allLines: Row[] = (d.JournalEntries ?? []).flatMap((je: Row) => je.Lines ?? []);
      if (isEdit) { setCode(d.Code); setDate(toLocalInput(d.Date)); setRefType(d.ReferenceType ?? ""); }
      setDesc(d.Description ?? "");
      setLines(allLines.map((l): Line => ({ entryId: isEdit ? l.ID : undefined, accountId: String(l.AccountID), memo: l.Description ?? "", debit: String(num(l.Debit)), credit: String(num(l.Credit)) })));
    }).catch(() => setErr("Data tidak ditemukan"));
  }, [loadId, isEdit]);

  const totalD = lines.reduce((s, l) => s + num(l.debit), 0);
  const totalK = lines.reduce((s, l) => s + num(l.credit), 0);
  const balanced = Math.abs(totalD - totalK) < 0.005;
  const setLine = (i: number, p: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...p } : l)));

  const save = async () => {
    setErr("");
    if (lines.length < 2) return setErr("Jurnal minimal memiliki 2 baris");
    if (lines.some((l) => !l.accountId)) return setErr("Kode Akun pada setiap baris wajib diisi");
    if (lines.some((l) => num(l.debit) > 0 && num(l.credit) > 0)) return setErr("Satu baris tidak boleh berisi debet dan kredit sekaligus");
    if (totalD <= 0) return setErr("Nilai jurnal tidak boleh nol");
    if (!balanced) return setErr(`Jurnal tidak seimbang: Debet ${fmt(totalD)} - Kredit ${fmt(totalK)}`);
    setSaving(true);
    try {
      const entries = lines.map((l) => ({ accountId: Number(l.accountId), debit: num(l.debit), credit: num(l.credit), memo: l.memo || undefined }));
      if (isEdit) {
        // Replaces all entry lines atomically in one call (balance re-validated server-side).
        const r = await api.patch("journal", id!, { description: desc || undefined, entries });
        if (r.success === false) throw new Error(r.message || "Gagal menyimpan");
        router.push("/accounting/journals");
      } else {
        const res = await api.post("journal", { date: toIso(date), description: desc || undefined, entries });
        if (res.success) router.push("/accounting/journals"); else setErr(res.message || "Gagal menyimpan");
      }
    } catch (e) { setErr((e as Error).message || "Gagal menyimpan"); } finally { setSaving(false); }
  };
  const remove = async () => {
    try { const r = await api.delete("journal", id!); if (r.success === false) { setErr(r.message || "Gagal menghapus"); setDel(false); } else router.push("/accounting/journals"); }
    catch (e) { setErr((e as Error).message); setDel(false); }
  };

  return (
    <DocShell backHref="/accounting/journals" error={err} notice={readOnly ? `Jurnal otomatis dari sistem (${refType}) hanya dapat dilihat, tidak dapat diubah atau dihapus.` : undefined}>
      <KInfoBox variant="warning" title="Penting"><span>Pencatatan jurnal manual membutuhkan keahlian akuntansi. Sub Total Debet dan Kredit harus sama.</span></KInfoBox>
      <KRow cols={2}>
        <KReadOnly label="No Transaksi" value={isEdit ? code : "Auto"} />
        <KInput label="Tanggal" type="datetime-local" value={date} disabled={isEdit} onChange={(e) => setDate(e.target.value)} hint={isEdit ? "Tanggal jurnal tidak dapat diubah (API)." : undefined} />
      </KRow>
      <KInput label="Keterangan" value={desc} disabled={readOnly} onChange={(e) => setDesc(e.target.value)} />
      <div className="overflow-x-auto border border-[#c9d0d8]">
        <table className="w-full text-[13px]">
          <thead><tr className="border-b border-[#c9d0d8]">
            <th className="w-12 px-2 py-2 text-left font-medium">No</th><th className="px-2 py-2 text-left font-medium">Kode Akun</th><th className="px-2 py-2 text-left font-medium">Keterangan</th>
            <th className="w-40 px-2 py-2 text-right font-medium">Debet</th><th className="w-40 px-2 py-2 text-right font-medium">Kredit</th>
          </tr></thead>
          <tbody>
            {lines.length === 0 && <tr><td colSpan={5} className="h-48 text-center text-[16px] text-[#9aa3ad]">No data</td></tr>}
            {lines.map((l, i) => (
              <tr key={i} onClick={() => setSel(i)} className={cn("border-b border-[#eceff2]", sel === i && "bg-primary/5")}>
                <td className="px-2 py-1">{i + 1}</td>
                <td className="p-1"><select disabled={readOnly} className={cell} value={l.accountId} onChange={(e) => setLine(i, { accountId: e.target.value })}><option value="">Pilih akun...</option>{opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></td>
                <td className="p-1"><input disabled={readOnly} className={cell} value={l.memo} onChange={(e) => setLine(i, { memo: e.target.value })} /></td>
                <td className="p-1"><input disabled={readOnly} type="number" className={cn(cell, "text-right")} value={l.debit} onChange={(e) => setLine(i, { debit: e.target.value, credit: num(e.target.value) > 0 ? "0" : l.credit })} /></td>
                <td className="p-1"><input disabled={readOnly} type="number" className={cn(cell, "text-right")} value={l.credit} onChange={(e) => setLine(i, { credit: e.target.value, debit: num(e.target.value) > 0 ? "0" : l.debit })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!readOnly && (
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => setLines([...lines, { accountId: "", memo: "", debit: totalK > totalD ? String(totalK - totalD) : "0", credit: totalD > totalK ? String(totalD - totalK) : "0" }])} className="inline-flex h-10 items-center gap-1 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6]"><Plus className="size-4" /> Add Data</button>
          <button type="button" disabled={sel === null} onClick={() => { if (sel !== null) { setLines(lines.filter((_, i) => i !== sel)); setSel(null); } }} className="inline-flex h-10 w-11 items-center justify-center rounded border border-[#cfd4da] bg-white hover:bg-[#f3f4f6] disabled:opacity-50"><Trash2 className="size-4" /></button>
        </div>
      )}
      <KRow cols={2} className="mt-3">
        <KReadOnly label="Jumlah Debet" value={fmt(totalD)} align="right" />
        <KReadOnly label="Jumlah Kredit" value={<span className={cn(!balanced && "text-danger")}>{fmt(totalK)}</span>} align="right" />
      </KRow>
      {!balanced && lines.length > 0 && <p className="text-sm text-danger">Selisih Debet - Kredit: {fmt(totalD - totalK)}. Jurnal belum seimbang.</p>}
      {readOnly ? <div className="mt-4" /> : (
        <DocActions onNew={() => router.push("/accounting/journals/new")} onSave={save} saving={saving} canDelete={isEdit} onDelete={() => setDel(true)} />
      )}
      <ConfirmDelete open={del} onClose={() => setDel(false)} onConfirm={remove} label={code || "jurnal"} />
    </DocShell>
  );
}
