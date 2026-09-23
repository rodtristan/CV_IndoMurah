"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KCode, KColumns, KSaveBar, KSelect, KInfoBox, KCheckbox, KField } from "@/components/kform";
import { PartnerFields, emptyPartner, type PartnerCommon } from "./PartnerFields";
import { api } from "@/lib/api-client";
import { createWithAutoCode, isEmail } from "@/lib/auto-code";
import { usePageTitle } from "@/lib/page-title";

const LIST = "/master/sales-persons";

interface Tier { to: string; pct: string }

interface SalesState extends PartnerCommon {
  code: string;
  commissionSystem: string;
  valueMode: "percent" | "nominal";
  percent: string;
  nominal: string;
  timeBased: boolean;
  tiers: Tier[];
}

const empty: SalesState = {
  ...emptyPartner, code: "", commissionSystem: "off", valueMode: "percent", percent: "0", nominal: "0",
  timeBased: false, tiers: [0, 1, 2, 3].map(() => ({ to: "0", pct: "0" })),
};

interface SalesRow { ID: number; Code: string; Name: string; Phone?: string | null; Email?: string | null; Address?: string | null }

const dashed = "h-10 w-full rounded border border-dashed border-[#cfd4da] bg-white px-3 text-right text-sm outline-none focus:border-primary disabled:bg-[#f3f4f6] disabled:text-[#9aa3ad]";

export function SalesForm({ id, copyFrom }: { id?: number; copyFrom?: number }) {
  const router = useRouter();
  const isNew = !id;
  usePageTitle(isNew ? "Sales Baru" : "Edit Sales");
  const [f, setF] = useState<SalesState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerCommon, string>>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id || copyFrom));
  const patch = (p: Partial<SalesState>) => setF((s) => ({ ...s, ...p }));

  useEffect(() => {
    const src = id ?? copyFrom;
    if (!src) return;
    let alive = true;
    api.get<SalesRow>(`sales-person/${src}`, undefined, { skipCache: true })
      .then((res) => {
        const r = res.data;
        if (!alive || !r) return;
        setF({ ...empty, code: id ? r.Code : "", name: r.Name ?? "", phone: r.Phone ?? "", email: r.Email ?? "", address: r.Address ?? "" });
      })
      .catch(() => toast.error("Gagal memuat data sales"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, copyFrom]);

  const commissionOn = f.commissionSystem !== "off";
  const setTier = (i: number, p: Partial<Tier>) => patch({ tiers: f.tiers.map((t, j) => (j === i ? { ...t, ...p } : t)) });
  const tierStart = (i: number) => (i === 0 ? 1 : (Number(f.tiers[i - 1].to) || 0) + 1);

  const save = async () => {
    const errs: typeof errors = {};
    if (!f.name.trim()) errs.name = "Nama sales harus diisi";
    if (f.email && !isEmail(f.email)) errs.email = "Format email tidak valid";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      // Only fields the current API DTO accepts (camelCase, whitelist validation).
      const payload = {
        name: f.name.trim(),
        phone: f.phone || (isNew ? undefined : null),
        email: f.email || (isNew ? undefined : null),
        address: f.address || (isNew ? undefined : null),
      };
      if (isNew) await createWithAutoCode("sales-person", "SLS", "code", payload);
      else await api.patch("sales-person", id!, { ...payload, code: f.code.trim() || undefined });
      toast.success("Data sales berhasil disimpan");
      router.push(LIST);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan sales");
    } finally {
      setSaving(false);
    }
  };

  const radio = (mode: "percent" | "nominal", label: string) => (
    <label className="mb-1 flex cursor-pointer items-center gap-2 text-[14px] text-[#2b3540]">
      <input type="radio" checked={f.valueMode === mode} disabled={!commissionOn} onChange={() => patch({ valueMode: mode })} className="size-4 accent-[#4a90d9]" />
      {label} :
    </label>
  );

  return (
    <PageWrapper>
      <Card className="p-4">
        {loading ? <p className="p-6 text-center text-sm text-muted">Memuat...</p> : (
          <>
            <KColumns>
              <div>
                <KCode value={f.code} isNew={isNew} onChange={(v) => patch({ code: v })} />
                <PartnerFields value={f} onChange={patch} nameLabel="Nama Sales" errors={errors} salesLabels />
              </div>
              <div>
                <KSelect
                  label="Sistem Komisi" value={f.commissionSystem} onChange={(v) => patch({ commissionSystem: v || "off" })} placeholder="Tidak Aktif"
                  options={[
                    { value: "off", label: "Tidak Aktif" }, { value: "item_price", label: "Perbarang Harga Jual" },
                    { value: "invoice", label: "Total Faktur" }, { value: "per_item", label: "Per Item" },
                  ]}
                />
                <div className="grid gap-x-3 sm:grid-cols-2">
                  <div className="mb-3">
                    {radio("percent", "Persentase")}
                    <input type="number" className={dashed} disabled={!commissionOn || f.valueMode !== "percent"} value={f.percent} onChange={(e) => patch({ percent: e.target.value })} min={0} />
                  </div>
                  <div className="mb-3">
                    {radio("nominal", "Nominal")}
                    <input type="number" className={dashed} disabled={!commissionOn || f.valueMode !== "nominal"} value={f.nominal} onChange={(e) => patch({ nominal: e.target.value })} min={0} />
                  </div>
                </div>
                <KCheckbox label="Persentase Waktu" caption="Aktifkan" checked={f.timeBased} onChange={(v) => patch({ timeBased: v })} />
                {f.tiers.map((t, i) => (
                  <KField key={i}>
                    <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2 text-[14px]">
                      <span className="whitespace-nowrap">Hari ke : {tierStart(i)}</span>
                      <div className="flex items-center gap-2">
                        <span>s/d</span>
                        <input type="number" min={0} className={dashed} disabled={!f.timeBased} value={t.to} onChange={(e) => setTier(i, { to: e.target.value })} />
                      </div>
                      <span className="whitespace-nowrap">Persentase %</span>
                      <input type="number" min={0} className={dashed} disabled={!f.timeBased} value={t.pct} onChange={(e) => setTier(i, { pct: e.target.value })} />
                    </div>
                  </KField>
                ))}
                <KInfoBox
                  variant="warning" title="PENTING"
                  items={[
                    "Jika anda memilih sistem komisi perbarang Harga Jual atau Total Faktur, maka nilai komisi pada saat transaksi akan dihitung otomatis dan tidak dapat diubah. Apabila memilih sistem komisi tidak aktif maka nilai komisi dapat diubah secara flexibel.",
                    "Jika anda mengaktifkan opsi Persentase Waktu, maka nilai komisi yang dihitung adalah nilai dari Komisi Awal.",
                    "Pastikan semua transaksi piutang dan pembayaran komisi sales sudah terlunasi sebelum mengaktifkan opsi Persentase Waktu.",
                  ]}
                />
              </div>
            </KColumns>
            <KSaveBar onSave={save} saving={saving} />
          </>
        )}
      </Card>
    </PageWrapper>
  );
}
