"use client";

// Status Lunas Cek/Bg Ketoko (Bayar Piutang / Bayar Hutang): pilih Pelanggan/Supplier + Nomor → Cari.
// Kolom: No Transaksi, Pelanggan/Supplier, Jml Bayar, No Cek Bg, Jatuh Tempo, Status Lunas (centang), Tanggal Lunas.
// Simpan memposting jurnal kas pada tanggal lunas (hapus centang membalik jurnal).

import { useCallback, useEffect, useState } from "react";
import { Printer, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { formatNumber, localDate } from "@/lib/utils";
import { usePageTitle } from "@/lib/page-title";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { KCard, KInput } from "@/components/kform";
import { PartnerLookup } from "@/components/transaction/PartnerLookup";
import { printTable } from "@/components/transaction/print";
import { LoadingState } from "@/components/ui/Loader";

type Rec = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const CFG = {
  sale: { title: "Status Lunas Piutang", endpoint: "SalePayments", parent: "Sale", partner: "Customer", partnerLabel: "Pelanggan", partnerEp: "customer" },
  purchase: { title: "Status Lunas Hutang", endpoint: "PurchasePayments", parent: "Purchase", partner: "Supplier", partnerLabel: "Supplier", partnerEp: "supplier" },
} as const;

const money = (v: unknown) => formatNumber(Number(v ?? 0), 2);

export function ChequeStatus({ kind }: { kind: "sale" | "purchase" }) {
  const c = CFG[kind];
  usePageTitle(c.title);
  const [partner, setPartner] = useState<{ id: number; name: string } | null>(null);
  const [number, setNumber] = useState("");
  const [rows, setRows] = useState<Rec[]>([]);
  const [edits, setEdits] = useState<Record<number, { IsCleared: boolean; ClearedAt: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get<Rec[]>(`${c.endpoint}/list`, { chequeOnly: "true", take: 500, ...(partner ? { partnerId: partner.id } : {}), ...(number ? { number } : {}) }, { skipCache: true });
      setRows(r.data ?? []);
      setEdits({});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat");
    } finally { setLoading(false); }
  }, [c.endpoint, partner, number]);

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const val = (r: Rec) => edits[r.ID] ?? { IsCleared: !!r.IsCleared, ClearedAt: r.IsCleared && r.ClearedAt ? localDate(new Date(r.ClearedAt)) : "" };
  const set = (r: Rec, v: { IsCleared: boolean; ClearedAt: string }) => setEdits((e) => ({ ...e, [r.ID]: v }));

  const save = async () => {
    const items = Object.entries(edits).map(([k, v]) => ({ ID: Number(k), IsCleared: v.IsCleared, ClearedAt: v.ClearedAt || null }));
    if (!items.length) { toast.info("Tidak ada perubahan"); return; }
    setSaving(true);
    try {
      await api.put(c.endpoint, "cheques/status", { Items: items });
      toast.success("Status lunas tersimpan");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const docNo = (r: Rec) => r.BatchCode ?? r[c.parent]?.Code ?? `#${r.ID}`;
  const partnerName = (r: Rec) => { const p = r[c.parent]?.[c.partner]; return p ? `${p.Code} - ${p.Name}` : ""; };
  const total = rows.reduce((a, r) => a + Number(r.Amount ?? 0), 0);

  return (
    <PageWrapper>
      <KCard>
        <div className="max-w-xl">
          <PartnerLookup label={c.partnerLabel} endpoint={c.partnerEp} value={partner?.name ?? ""} onPick={(p) => setPartner({ id: Number(p.value), name: p.label })} onClear={() => setPartner(null)} />
          <KInput label="Nomor" value={number} onChange={(e) => setNumber(e.target.value)} />
        </div>
        <button type="button" disabled={loading} onClick={() => void load()} className="inline-flex h-10 items-center gap-2 rounded border border-[#2b7fd4] bg-white px-5 text-sm text-[#2b7fd4] hover:bg-[#eef5fc]">
          <Search className="size-4" /> Cari
        </button>

        <div className="mt-3 overflow-x-auto border border-[#d5d9de]">
          {loading ? <LoadingState className="py-12" /> : (
            <table className="w-full min-w-[860px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#d5d9de] bg-[#f5f6f8] text-left">
                  <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">No Transaksi</th>
                  <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">{c.partnerLabel}</th>
                  <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Faktur</th>
                  <th className="border-r border-[#e3e6ea] px-2 py-2 text-right font-normal">Jml Bayar</th>
                  <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">No Cek Bg</th>
                  <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Jatuh Tempo</th>
                  <th className="border-r border-[#e3e6ea] px-2 py-2 text-center font-normal">Status Lunas</th>
                  <th className="px-2 py-2 font-normal">Tanggal Lunas</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={8} className="h-40 text-center text-[#9aa3ad]">No data</td></tr>
                ) : rows.map((r) => {
                  const v = val(r);
                  return (
                    <tr key={r.ID} className="border-b border-[#eef0f2]">
                      <td className="border-r border-[#eef0f2] px-2 py-1.5 font-mono text-xs">{docNo(r)}</td>
                      <td className="border-r border-[#eef0f2] px-2 py-1.5">{partnerName(r)}</td>
                      <td className="border-r border-[#eef0f2] px-2 py-1.5 font-mono text-xs">{r[c.parent]?.Code ?? ""}</td>
                      <td className="border-r border-[#eef0f2] px-2 py-1.5 text-right">{money(r.Amount)}</td>
                      <td className="border-r border-[#eef0f2] px-2 py-1.5">{r.ReferenceNumber ?? ""}</td>
                      <td className="border-r border-[#eef0f2] px-2 py-1.5">{r.DueDate ? localDate(new Date(r.DueDate)) : ""}</td>
                      <td className="border-r border-[#eef0f2] px-2 py-1.5 text-center">
                        <input type="checkbox" className="size-4" checked={v.IsCleared}
                          onChange={(e) => set(r, { IsCleared: e.target.checked, ClearedAt: e.target.checked ? v.ClearedAt || localDate() : "" })} />
                      </td>
                      <td className="px-2 py-1">
                        <input type="date" value={v.ClearedAt} disabled={!v.IsCleared} onChange={(e) => set(r, { ...v, ClearedAt: e.target.value })}
                          className="h-8 rounded border border-[#cfd4da] px-2 text-sm disabled:bg-[#f3f4f6]" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-3 flex justify-end">
          <div className="w-72"><KInput label="Total" value={money(total)} readOnly className="border-dashed bg-[#e9afe6] text-right font-bold" /></div>
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6] disabled:opacity-50">
            <Save className="size-4 text-[#2b7fd4]" /> {saving ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => printTable({
            title: c.title,
            subtitle: partner ? `${c.partnerLabel}: ${partner.name}` : undefined,
            columns: ["No Transaksi", c.partnerLabel, "Jml Bayar", "No Cek Bg", "Status Lunas", "Tanggal Lunas"],
            rows: rows.map((r) => { const v = val(r); return [docNo(r), partnerName(r), money(r.Amount), r.ReferenceNumber ?? "", v.IsCleared ? "Lunas" : "Belum", v.ClearedAt]; }),
            rightCols: [2], footer: `Total ${money(total)}`,
          })} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6]">
            <Printer className="size-4" /> Cetak
          </button>
        </div>
      </KCard>
    </PageWrapper>
  );
}
