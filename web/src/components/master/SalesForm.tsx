"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KCode, KColumns, KSaveBar, KSelect } from "@/components/kform";
import { PartnerFields, emptyPartner, type PartnerCommon } from "./PartnerFields";
import { partnerFromRow, partnerPayload } from "./partner-map";
import { api } from "@/lib/api-client";
import { createWithAutoCode, isEmail } from "@/lib/auto-code";
import { usePageTitle } from "@/lib/page-title";
import { LoadingState } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

const LIST = "/master/sales-persons";

const FIELDS: (keyof PartnerCommon)[] = [
  "address", "city", "province", "country", "postalCode", "phone", "fax", "contact", "email", "accountNo", "accountName", "bank", "npwp", "notes",
];

const SYSTEMS = [
  { value: "NONE", label: "Tidak Aktif" },
  { value: "ITEM_PRICE", label: "Perbarang Harga Jual" },
  { value: "INVOICE_TOTAL", label: "Total Faktur" },
  { value: "PER_ITEM", label: "Per Item" },
];

interface Tier { fromDay: string; toDay: string; percent: string }
const emptyTiers = (): Tier[] => Array.from({ length: 4 }, () => ({ fromDay: "1", toDay: "0", percent: "0" }));

interface SalesState extends PartnerCommon {
  code: string;
  system: string;
  type: "PERCENT" | "NOMINAL" | "TIME_PERCENT";
  percent: string;
  nominal: string;
  tiers: Tier[];
}

const empty: SalesState = { ...emptyPartner, code: "", system: "NONE", type: "PERCENT", percent: "0", nominal: "0", tiers: emptyTiers() };

const numCls = "h-10 w-full rounded border border-[#cfd4da] bg-white px-3 text-right text-[15px] outline-none focus:border-[#7fb0de] disabled:bg-[#f7f8fa] disabled:text-[#9aa3ad]";

function Radio({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button" disabled={disabled} onClick={onChange}
      className={cn("flex size-[26px] shrink-0 items-center justify-center rounded-full border bg-white", checked ? "border-[#4a90d9]" : "border-[#c4cad1]", disabled && "opacity-50")}
    >
      {checked && <span className="size-3.5 rounded-full bg-[#4a90d9]" />}
    </button>
  );
}

export function SalesForm({ id, copyFrom }: { id?: number; copyFrom?: number }) {
  const router = useRouter();
  const isNew = !id;
  const [f, setF] = useState<SalesState>(empty);
  usePageTitle(isNew ? "Sales Baru" : `Sales Edit : ${f.code}`);
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerCommon, string>>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id || copyFrom));
  const patch = (p: Partial<SalesState>) => setF((s) => ({ ...s, ...p }));

  useEffect(() => {
    const src = id ?? copyFrom;
    if (!src) return;
    let alive = true;
    api.get<Record<string, any>>(`sales-person/${src}`, undefined, { skipCache: true }) // eslint-disable-line @typescript-eslint/no-explicit-any
      .then((res) => {
        const r = res.data;
        if (!alive || !r) return;
        const saved: Tier[] = Array.isArray(r.CommissionTiers)
          ? r.CommissionTiers.map((t: { fromDay: number; toDay: number; percent: number }) => ({ fromDay: String(t.fromDay), toDay: String(t.toDay), percent: String(t.percent) }))
          : [];
        setF({
          ...empty, ...partnerFromRow(r), code: id ? String(r.Code ?? "") : "",
          system: r.CommissionSystem ?? "NONE", type: r.CommissionType ?? "PERCENT",
          percent: String(Number(r.CommissionPercent ?? 0)), nominal: String(Number(r.CommissionNominal ?? 0)),
          tiers: [...saved, ...emptyTiers()].slice(0, 4),
        });
      })
      .catch(() => toast.error("Gagal memuat data sales"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, copyFrom]);

  const setTier = (i: number, p: Partial<Tier>) => setF((s) => ({ ...s, tiers: s.tiers.map((t, j) => (j === i ? { ...t, ...p } : t)) }));

  const save = async () => {
    const errs: typeof errors = {};
    if (!f.name.trim()) errs.name = "Nama sales harus diisi";
    if (f.email && !isEmail(f.email)) errs.email = "Format email tidak valid";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    // Baris persentase waktu yang terisi (s/d > 0).
    const tiers = f.tiers
      .map((t) => ({ fromDay: Math.max(0, Math.trunc(Number(t.fromDay) || 0)), toDay: Math.max(0, Math.trunc(Number(t.toDay) || 0)), percent: Math.max(0, Number(t.percent) || 0) }))
      .filter((t) => t.toDay > 0);
    if (f.system !== "NONE" && f.type === "TIME_PERCENT") {
      const bad = tiers.find((t) => t.toDay < t.fromDay || t.percent > 100);
      if (bad) { toast.error("Persentase waktu: 's/d' harus ≥ 'Hari ke' dan persentase maksimal 100%"); return; }
      if (!tiers.length) { toast.error("Isi minimal satu baris persentase waktu"); return; }
    }
    setSaving(true);
    try {
      const payload = {
        ...partnerPayload(f, isNew),
        CommissionSystem: f.system,
        CommissionType: f.type,
        CommissionPercent: Math.min(100, Math.max(0, Number(f.percent) || 0)),
        CommissionNominal: Math.max(0, Number(f.nominal) || 0),
        CommissionTiers: f.type === "TIME_PERCENT" ? tiers : isNew ? undefined : null,
      };
      if (isNew) await createWithAutoCode("sales-person", "SL", "Code", payload);
      else await api.patch("sales-person", id!, { ...payload, Code: f.code.trim() || undefined });
      toast.success("Data sales berhasil disimpan");
      router.push(LIST);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan sales");
    } finally {
      setSaving(false);
    }
  };

  const off = f.system === "NONE";

  return (
    <PageWrapper>
      <Card className="p-4">
        {loading ? <LoadingState /> : (
          <>
            <KColumns>
              <div>
                <KCode value={f.code} isNew={isNew} onChange={(v) => patch({ code: v })} />
                <PartnerFields value={f} onChange={patch} nameLabel="Nama Sales" errors={errors} salesLabels fields={FIELDS} />
              </div>
              <div>
                <KSelect label="Sistem Komisi" value={f.system} options={SYSTEMS} placeholder="Tidak Aktif" onChange={(v) => patch({ system: v || "NONE" })} />

                <p className="mb-1 mt-3 text-[15px] text-[#2b3540]">Persentase :</p>
                <div className="flex items-center gap-3">
                  <Radio checked={f.type === "PERCENT"} onChange={() => patch({ type: "PERCENT" })} disabled={off} />
                  <input type="number" min={0} max={100} step="0.01" className={numCls} value={f.percent} disabled={off || f.type !== "PERCENT"} onChange={(e) => patch({ percent: e.target.value })} />
                </div>

                <p className="mb-1 mt-3 text-[15px] text-[#2b3540]">Nominal :</p>
                <div className="flex items-center gap-3">
                  <Radio checked={f.type === "NOMINAL"} onChange={() => patch({ type: "NOMINAL" })} disabled={off} />
                  <input type="number" min={0} step="0.01" className={numCls} value={f.nominal} disabled={off || f.type !== "NOMINAL"} onChange={(e) => patch({ nominal: e.target.value })} />
                </div>

                <p className="mb-1 mt-3 text-[15px] text-[#2b3540]">Persentase Waktu :</p>
                <div className="flex items-start gap-3">
                  <Radio checked={f.type === "TIME_PERCENT"} onChange={() => patch({ type: "TIME_PERCENT" })} disabled={off} />
                  <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                    {f.tiers.map((t, i) => {
                      const dis = off || f.type !== "TIME_PERCENT";
                      return (
                        <div key={i} className="rounded border border-[#e3e6ea] p-2 text-[13px] text-[#3a4654]">
                          <div className="flex items-center gap-2">
                            <span className="w-24 shrink-0">Hari ke :</span>
                            <input type="number" min={0} className={cn(numCls, "h-8 text-[13px]")} value={t.fromDay} disabled={dis} onChange={(e) => setTier(i, { fromDay: e.target.value })} />
                            <span className="shrink-0">s/d</span>
                            <input type="number" min={0} className={cn(numCls, "h-8 text-[13px]")} value={t.toDay} disabled={dis} onChange={(e) => setTier(i, { toDay: e.target.value })} />
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="w-24 shrink-0">Persentase %</span>
                            <input type="number" min={0} max={100} step="0.01" className={cn(numCls, "h-8 text-[13px]")} value={t.percent} disabled={dis} onChange={(e) => setTier(i, { percent: e.target.value })} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 text-[13px] text-danger">
                  <p className="font-semibold">PENTING:</p>
                  <p>
                    Jika anda memilih sistem komisi Perbarang Harga Jual atau Total Faktur, maka komisi tidak dapat diisi secara
                    fleksibel pada saat penjualan karena nilai komisi dihitung otomatis. Pilih &quot;Tidak Aktif&quot; untuk komisi
                    fleksibel. Sistem komisi harus diisi sebelum transaksi; transaksi sebelumnya tidak dihitung ulang.
                    Persentase Waktu: komisi dihitung dari lama hari pelunasan faktur (Hari ke … s/d …).
                  </p>
                </div>
              </div>
            </KColumns>
            <KSaveBar onSave={save} saving={saving} />
          </>
        )}
      </Card>
    </PageWrapper>
  );
}
