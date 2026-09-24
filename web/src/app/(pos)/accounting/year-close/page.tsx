"use client";

// Proses Tutup Tahun: menutup akun pendapatan/biaya ke Laba Ditahan lewat jurnal penutup.

import { useCallback, useEffect, useState } from "react";
import { KCard, KInfoBox, KSelect } from "@/components/kform";
import { fmt, fmtDate } from "@/components/kform/erp";
import { ConfirmModal } from "@/components/ui/Modal";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { api } from "@/lib/api-client";

interface YearRow { year: number; finished: boolean; closed: boolean; closedAt: string | null; journalCode: string | null; netIncome: number }
interface Status { currentYear: number; retainedAccountID: number | null; years: YearRow[] }

export default function YearClosePage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [year, setYear] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.request<Status>("GET", "fiscal-year");
      if (r.success && r.data) setStatus(r.data);
    } catch (e) { setMsg({ ok: false, text: (e as Error).message || "Gagal memuat status" }); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const open = (status?.years ?? []).filter((y) => y.finished && !y.closed);
  const sel = status?.years.find((y) => String(y.year) === year);

  const run = async () => {
    setConfirm(false); setBusy(true); setMsg(null);
    try {
      const r = await api.post<{ year: number; netIncome: number }>("fiscal-year/close", { year: Number(year) });
      if (r.success) { setMsg({ ok: true, text: `Tutup tahun ${year} selesai. Laba/rugi bersih ${fmt(r.data?.netIncome ?? 0)} dipindahkan ke Laba Ditahan.` }); setYear(""); await load(); }
      else setMsg({ ok: false, text: r.message || "Gagal menutup tahun" });
    } catch (e) { setMsg({ ok: false, text: (e as Error).message || "Gagal menutup tahun" }); } finally { setBusy(false); }
  };

  return (
    <PageWrapper>
      <KCard>
        <KInfoBox variant="warning" title="Penting" items={[
          "Proses ini dilakukan hanya satu kali pada akhir tahun akuntansi. Jangan tutup tahun bila belum akhir tahun.",
          "Bila tahun sudah berganti tetapi belum tutup tahun, proses untuk tahun yang lalu tetap dapat dilakukan.",
          "Proses membuat jurnal penutup yang menolkan akun pendapatan dan biaya, lalu memindahkan laba/rugi ke akun Laba Ditahan (Setting Perkiraan).",
        ]} />
        {status && !status.retainedAccountID && <p className="mb-3 text-sm text-danger">Akun &quot;Laba Ditahan&quot; belum diatur di Setting Perkiraan.</p>}
        <div className="max-w-[360px]">
          <KSelect label="Tahun yang ditutup" value={year} onChange={setYear} placeholder="Pilih tahun..." options={open.map((y) => ({ value: y.year, label: String(y.year) }))} />
          {sel && <p className="mb-3 text-sm text-[#3a4654]">Laba/rugi bersih tahun {sel.year}: <b>{fmt(sel.netIncome)}</b></p>}
          <button type="button" disabled={!year || busy || !status?.retainedAccountID} onClick={() => setConfirm(true)} className="h-10 rounded bg-[#4caf50] px-6 text-white hover:bg-[#43a047] disabled:opacity-60">{busy ? "Memproses..." : "Proses"}</button>
          {msg && <p className={`mt-3 text-sm ${msg.ok ? "text-[#2e7d32]" : "text-danger"}`}>{msg.text}</p>}
        </div>
        <h3 className="mb-2 mt-6 font-semibold">Status Tahun Buku</h3>
        <div className="border border-[#c9d0d8]">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-[#c9d0d8] bg-[#f5f6f8]"><th className="px-2 py-2 text-left font-medium">Tahun</th><th className="px-2 py-2 text-left font-medium">Status</th><th className="px-2 py-2 text-right font-medium">Laba/Rugi Bersih</th><th className="px-2 py-2 text-left font-medium">Ditutup</th><th className="px-2 py-2 text-left font-medium">Jurnal</th></tr></thead>
            <tbody>
              {(status?.years ?? []).map((y) => (
                <tr key={y.year} className="border-b border-[#eceff2]">
                  <td className="px-2 py-1">{y.year}</td>
                  <td className="px-2 py-1">{y.closed ? "Sudah ditutup" : y.finished ? "Belum ditutup" : "Berjalan"}</td>
                  <td className="px-2 py-1 text-right">{fmt(y.netIncome)}</td>
                  <td className="px-2 py-1">{y.closedAt ? fmtDate(y.closedAt) : "-"}</td>
                  <td className="px-2 py-1 font-mono text-xs">{y.journalCode ?? "-"}</td>
                </tr>
              ))}
              {!status?.years.length && <tr><td colSpan={5} className="py-6 text-center text-[#9aa3ad]">No data</td></tr>}
            </tbody>
          </table>
        </div>
      </KCard>
      <ConfirmModal open={confirm} onClose={() => setConfirm(false)} onConfirm={run} title="Proses Tutup Tahun" message={`Tutup tahun akuntansi ${year}? Proses ini tidak dapat dibatalkan.`} confirmText="Proses" variant="danger" />
    </PageWrapper>
  );
}
