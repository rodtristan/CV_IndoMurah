"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { ConfirmModal } from "@/components/ui/Modal";
import { KColumns, KInfoBox, KInput, KNumber, KSaveBar, KSelect, KTabs } from "@/components/kform";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/lib/page-title";
import { apiError } from "../_lib/local";
import { LoadingState } from "@/components/ui/Loader";

interface ModuleDef { type: string; label: string; defPrefix: string }

const TRANSACTIONS: ModuleDef[] = [
  { type: "PURCHASE_ORDER", label: "Pesanan Beli", defPrefix: "PO" },
  { type: "SALE_ORDER", label: "Pesanan Jual", defPrefix: "SO" },
  { type: "PURCHASE", label: "Pembelian", defPrefix: "BL" },
  { type: "CONSIGN_IN", label: "Konsinyasi Masuk", defPrefix: "KM" },
  { type: "CONSIGN_IN_RETURN", label: "Retur Konsinyasi Masuk", defPrefix: "RKM" },
  { type: "SALE", label: "Penjualan", defPrefix: "JL" },
  { type: "TAX_INVOICE", label: "Faktur Pajak", defPrefix: "FP" },
  { type: "POS", label: "Kasir", defPrefix: "KS" },
  { type: "PURCHASE_RETURN", label: "Retur Beli", defPrefix: "RB" },
  { type: "SALE_RETURN", label: "Retur Jual", defPrefix: "RJ" },
  { type: "STOCK_IN", label: "Item Masuk", defPrefix: "IM" },
  { type: "STOCK_OUT", label: "Item Keluar", defPrefix: "IK" },
  { type: "CASH_TRANSFER", label: "Kas Transfer", defPrefix: "KT" },
  { type: "JOURNAL", label: "Jurnal", defPrefix: "JU" },
  { type: "PAYABLE", label: "Hutang", defPrefix: "HT" },
  { type: "RECEIVABLE", label: "Piutang", defPrefix: "PT" },
  { type: "CONSIGN_PAYABLE", label: "Hutang Konsinyasi", defPrefix: "HK" },
  { type: "CASH_IN", label: "Kas Masuk", defPrefix: "KMS" },
  { type: "CASH_OUT", label: "Kas Keluar", defPrefix: "KKL" },
  { type: "STOCK_TRANSFER", label: "Transfer Stok", defPrefix: "TS" },
  { type: "STOCK_OPNAME", label: "Stok Opname", defPrefix: "OP" },
];
const MASTERS: ModuleDef[] = [
  { type: "SUPPLIER", label: "No Supplier", defPrefix: "SUP" },
  { type: "CUSTOMER", label: "No Pelanggan", defPrefix: "CUS" },
  { type: "SALES_PERSON", label: "No Sales", defPrefix: "SLS" },
];

interface ServerRow { ID: number; Type: string; Prefix: string; Suffix: string; DigitCount: number; LastNumber: number }
interface Draft { format: string; digit: string; last: string }

const TOKENS = ["[CNT]", "[THN]", "[BLN]", "[BLNTHN]", "[DEPT]"];

const toFormat = (r: Pick<ServerRow, "Prefix" | "Suffix">) => `${r.Prefix ?? ""}[CNT]${r.Suffix ?? ""}`;

function splitFormat(format: string): { prefix: string; suffix: string } | null {
  const i = format.indexOf("[CNT]");
  if (i < 0) return null;
  return { prefix: format.slice(0, i), suffix: format.slice(i + 5) };
}

function render(format: string, digit: number, counter: number, dept: string) {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return format
    .replace("[CNT]", String(counter).padStart(Math.max(1, digit), "0"))
    .replace("[BLNTHN]", `${mm}${yy}`)
    .replace("[THN]", yy)
    .replace("[BLN]", mm)
    .replace("[DEPT]", dept);
}

export default function NumberingSettingsPage() {
  usePageTitle("Setting Nomor");
  const [tab, setTab] = useState("trx");
  const [rows, setRows] = useState<Record<string, ServerRow>>({});
  const [dept, setDept] = useState("");
  const [depts, setDepts] = useState<{ ID: number; Code: string; Name: string }[]>([]);
  const [selected, setSelected] = useState<ModuleDef>(TRANSACTIONS[0]);
  const [draft, setDraft] = useState<Draft>({ format: "", digit: "4", last: "0" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [n, w] = await Promise.all([
        api.get<ServerRow[]>("numbering", { $take: 500 }, { skipCache: true }),
        api.get<{ ID: number; Code: string; Name: string }[]>("warehouse", { $select: "ID,Code,Name", $take: 200 }).catch(() => null),
      ]);
      const map: Record<string, ServerRow> = {};
      for (const r of n.data ?? []) map[r.Type] = r;
      setRows(map);
      setDepts(w?.data ?? []);
    } catch (e) { toast.error(apiError(e)); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const list = tab === "trx" ? TRANSACTIONS : MASTERS;

  const pick = useCallback((m: ModuleDef, source: Record<string, ServerRow>) => {
    setSelected(m);
    const r = source[m.type];
    setDraft(r ? { format: toFormat(r), digit: String(r.DigitCount), last: String(r.LastNumber) } : { format: `${m.defPrefix}[CNT]`, digit: "4", last: "0" });
  }, []);

  // Re-sync the editor whenever server data or the tab changes.
  useEffect(() => { pick(list.includes(selected) ? selected : list[0], rows); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [rows, tab]);

  const deptCode = depts.find((d) => String(d.ID) === dept)?.Code ?? "GDG";
  const digitN = Number(draft.digit) || 0;
  const lastN = Number(draft.last) || 0;
  const preview = useMemo(() => render(draft.format, digitN, lastN + 1, deptCode), [draft.format, digitN, lastN, deptCode]);

  const save = async (override?: Partial<Draft>) => {
    const d = { ...draft, ...override };
    const parts = splitFormat(d.format);
    if (!parts) { toast.error("Format penulisan harus mengandung [CNT] sebagai penghitung otomatis"); return; }
    const digit = Number(d.digit);
    const last = Number(d.last);
    if (!Number.isInteger(digit) || digit < 1 || digit > 10) { toast.error("Digit counter harus antara 1 dan 10"); return; }
    if (!Number.isInteger(last) || last < 0) { toast.error("No terakhir harus angka >= 0"); return; }
    setSaving(true);
    try {
      const payload = { type: selected.type, prefix: parts.prefix, suffix: parts.suffix, digitCount: digit, lastNumber: last };
      const existing = rows[selected.type];
      if (existing) await api.patch("numbering", existing.ID, payload); else await api.post("numbering", payload);
      toast.success("Setting nomor disimpan");
      await load();
    } catch (e) { toast.error(apiError(e)); } finally { setSaving(false); }
  };

  const reset = async () => {
    setConfirmReset(false);
    await save({ last: "0" });
  };

  return (
    <PageWrapper>
      <Card className="p-4">
        <KTabs tabs={[{ key: "trx", label: "No Transaksi" }, { key: "master", label: "No Supplier, Pelanggan, Sales" }]} active={tab} onChange={setTab} />
        <div className="pt-4">
          {tab === "trx" && (
            <div className="max-w-sm">
              <KSelect label="Dept" value={dept} onChange={setDept} placeholder="Semua Dept/Gudang"
                options={depts.map((d) => ({ value: String(d.ID), label: `${d.Code} - ${d.Name}` }))}
                hint="Dipakai untuk contoh token [DEPT]. Format nomor berlaku untuk semua Dept/Gudang." />
            </div>
          )}
          <KColumns className="lg:grid-cols-[1.2fr_1fr]">
            <div className="overflow-x-auto border border-[#d5d9de]">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="border-b border-[#d5d9de] bg-[#f5f6f8]">
                    <th className="px-3 py-2 text-left font-bold">Modul</th>
                    <th className="px-3 py-2 text-left font-bold">Format</th>
                    <th className="px-3 py-2 text-right font-bold">Digit</th>
                    <th className="px-3 py-2 text-right font-bold">Terakhir</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4}><LoadingState /></td></tr>
                  ) : list.map((m) => {
                    const r = rows[m.type];
                    return (
                      <tr key={m.type} onClick={() => pick(m, rows)}
                        className={cn("cursor-pointer border-b border-[#eceff2] hover:bg-[#fafbfc]", selected.type === m.type && "bg-primary/10")}>
                        <td className="px-3 py-2">{m.label}</td>
                        <td className="px-3 py-2 font-mono text-[13px]">{r ? toFormat(r) : <span className="text-[#9aa3ad]">{m.defPrefix}[CNT] (belum diatur)</span>}</td>
                        <td className="px-3 py-2 text-right">{r?.DigitCount ?? "-"}</td>
                        <td className="px-3 py-2 text-right">{r?.LastNumber ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div>
              <p className="mb-2 text-[15px] font-semibold">{selected.label}</p>
              <KInput label="Format" value={draft.format} onChange={(e) => setDraft((p) => ({ ...p, format: e.target.value }))} className="font-mono" />
              <div className="-mt-1 mb-3 flex flex-wrap gap-1">
                {TOKENS.map((t) => (
                  <button key={t} type="button" onClick={() => setDraft((p) => ({ ...p, format: p.format + t }))}
                    className="rounded border border-[#cfd4da] bg-white px-2 py-1 font-mono text-[12px] hover:bg-[#f3f4f6]">{t}</button>
                ))}
              </div>
              <div className="grid gap-x-3 sm:grid-cols-2">
                <KNumber label="Digit" value={draft.digit} onChange={(v) => setDraft((p) => ({ ...p, digit: v }))} min={1} max={10} />
                <KNumber label="Terakhir" value={draft.last} onChange={(v) => setDraft((p) => ({ ...p, last: v }))} min={0} />
              </div>
              <div className="rounded border border-[#d5d9de] bg-[#f7f8fa] px-3 py-2 text-[14px]">
                Contoh nomor berikutnya : <span className="font-mono font-semibold text-primary">{preview}</span>
              </div>
              <KSaveBar onSave={() => void save()} saving={saving} extra={
                <button type="button" onClick={() => setConfirmReset(true)} disabled={!rows[selected.type]}
                  className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-[14px] hover:bg-[#f3f4f6] disabled:opacity-50">
                  <RotateCcw className="size-4" /> Reset No Terakhir
                </button>
              } />
            </div>
          </KColumns>
        </div>
        <KInfoBox title="Keterangan" items={[
          "[CNT] = penghitung otomatis (wajib ada), [THN] = tahun 2 digit, [BLN] = bulan 2 digit, [BLNTHN] = bulan dan tahun 4 digit, [DEPT] = kode Dept/Gudang.",
          "Digit = jumlah digit counter, contoh 4 digit = 0069. Terakhir = nomor terakhir pada counter.",
          "Server menyimpan teks sebelum [CNT] sebagai prefix dan teks sesudahnya sebagai suffix; penggantian token [THN]/[BLN]/[DEPT] pada nomor final belum diproses di server.",
        ]} />
      </Card>

      <ConfirmModal open={confirmReset} onClose={() => setConfirmReset(false)} onConfirm={reset} title="Reset No Terakhir"
        message={`Yakin mereset nomor terakhir "${selected.label}" menjadi 0?`} confirmText="Reset" variant="danger" />
    </PageWrapper>
  );
}
