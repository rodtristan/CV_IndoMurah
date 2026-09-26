"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KCode, KColumns, KNumber, KSaveBar, KSelect } from "@/components/kform";
import { PartnerFields, emptyPartner, type PartnerCommon } from "./PartnerFields";
import { partnerFromRow, partnerPayload, TAX_MODE_OPTIONS, taxSourceOptions } from "./partner-map";
import { api } from "@/lib/api-client";
import { createWithAutoCode, isEmail } from "@/lib/auto-code";
import { usePageTitle } from "@/lib/page-title";
import { LoadingState } from "@/components/ui/Loader";

const LIST = "/master/suppliers";

// Semua field form Supplier Ketoko (kolom kiri).
const FIELDS: (keyof PartnerCommon)[] = [
  "address", "city", "province", "country", "postalCode", "phone", "fax", "contact", "email", "accountNo", "accountName", "bank", "npwp", "notes",
];

interface SupplierState extends PartnerCommon {
  code: string;
  dueDays: string;
  taxMode: string;
  taxSource: string;
  taxRate: string;
}

const empty: SupplierState = { ...emptyPartner, code: "", dueDays: "0", taxMode: "DEFAULT", taxSource: "DEFAULT", taxRate: "0" };

export function SupplierForm({ id, copyFrom }: { id?: number; copyFrom?: number }) {
  const router = useRouter();
  const isNew = !id;
  const [f, setF] = useState<SupplierState>(empty);
  usePageTitle(isNew ? "Supplier Baru" : `Supplier Edit : ${f.code}`);
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerCommon, string>>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id || copyFrom));
  const patch = (p: Partial<SupplierState>) => setF((s) => ({ ...s, ...p }));

  useEffect(() => {
    const src = id ?? copyFrom;
    if (!src) return;
    let alive = true;
    api.get<Record<string, any>>(`supplier/${src}`, undefined, { skipCache: true }) // eslint-disable-line @typescript-eslint/no-explicit-any
      .then((res) => {
        const r = res.data;
        if (!alive || !r) return;
        setF({
          ...empty, ...partnerFromRow(r), code: id ? String(r.Code ?? "") : "",
          dueDays: String(r.DueDays ?? 0), taxMode: r.TaxMode ?? "DEFAULT", taxSource: r.TaxValueSource ?? "DEFAULT", taxRate: String(Number(r.TaxRate ?? 0)),
        });
      })
      .catch(() => toast.error("Gagal memuat data supplier"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, copyFrom]);

  const save = async () => {
    const errs: typeof errors = {};
    if (!f.name.trim()) errs.name = "Nama supplier harus diisi";
    if (f.email && !isEmail(f.email)) errs.email = "Format e-mail tidak valid";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      const payload = {
        ...partnerPayload(f, isNew),
        DueDays: Math.max(0, Math.trunc(Number(f.dueDays) || 0)),
        TaxMode: f.taxMode, TaxValueSource: f.taxSource, TaxRate: f.taxSource === "PARTNER" ? Math.max(0, Number(f.taxRate) || 0) : 0,
      };
      if (isNew) await createWithAutoCode("supplier", "SP", "Code", payload);
      else await api.patch("supplier", id!, { ...payload, Code: f.code.trim() || undefined });
      toast.success("Data supplier berhasil disimpan");
      router.push(LIST);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan supplier");
    } finally {
      setSaving(false);
    }
  };

  const hintCls = "text-[13px] text-[#3a4654]";

  return (
    <PageWrapper>
      <Card className="p-4">
        {loading ? <LoadingState /> : (
          <>
            <KColumns>
              <div>
                <KCode value={f.code} isNew={isNew} onChange={(v) => patch({ code: v })} />
                <PartnerFields value={f} onChange={patch} nameLabel="Nama" errors={errors} fields={FIELDS} />
              </div>
              <div className="max-w-[420px]">
                <KNumber label="Jatuh Tempo" value={f.dueDays} onChange={(v) => patch({ dueDays: v })} min={0} fieldClassName="max-w-[260px]" hint={<span className={hintCls}>0 = Mengacu Pada Pengaturan</span>} />
                <KSelect
                  label="Menggunakan Pajak" value={f.taxMode} options={TAX_MODE_OPTIONS} placeholder="Default"
                  onChange={(v) => patch({ taxMode: v || "DEFAULT", taxSource: v !== "EXCLUDE" && f.taxSource === "ITEM" ? "DEFAULT" : f.taxSource })}
                  hint={<span className={hintCls}>Default = Mengacu Pada Pengaturan</span>}
                />
                <KSelect label="Nilai Pajak diset Dari" value={f.taxSource} options={taxSourceOptions("Data Supplier", f.taxMode)} placeholder="Default" onChange={(v) => patch({ taxSource: v || "DEFAULT" })} />
                <KNumber label="Nilai Pajak" value={f.taxRate} onChange={(v) => patch({ taxRate: v })} min={0} max={100} step="0.01" disabled={f.taxSource !== "PARTNER"} fieldClassName="max-w-[260px]" />
              </div>
            </KColumns>
            <KSaveBar onSave={save} saving={saving} />
          </>
        )}
      </Card>
    </PageWrapper>
  );
}
