"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KCode, KColumns, KSaveBar, KInfoBox } from "@/components/kform";
import { PartnerFields, emptyPartner, type PartnerCommon } from "./PartnerFields";
import { api } from "@/lib/api-client";
import { createWithAutoCode, isEmail } from "@/lib/auto-code";
import { usePageTitle } from "@/lib/page-title";

const LIST = "/master/sales-persons";

interface SalesState extends PartnerCommon {
  code: string;
}

const empty: SalesState = { ...emptyPartner, code: "" };

interface SalesRow { ID: number; Code: string; Name: string; Phone?: string | null; Email?: string | null; Address?: string | null }

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

  return (
    <PageWrapper>
      <Card className="p-4">
        {loading ? <p className="p-6 text-center text-sm text-muted">Memuat...</p> : (
          <>
            <KColumns>
              <div>
                <KCode value={f.code} isNew={isNew} onChange={(v) => patch({ code: v })} />
                <PartnerFields value={f} onChange={patch} nameLabel="Nama Sales" errors={errors} salesLabels fields={["address", "phone", "email"]} />
              </div>
              <div>
                <KInfoBox variant="warning" title="Komisi Sales">
                  Pengaturan sistem komisi (persentase/nominal/persentase waktu) belum didukung oleh server,
                  sehingga belum dapat disimpan. Form ini hanya menyimpan data identitas sales.
                </KInfoBox>
              </div>
            </KColumns>
            <KSaveBar onSave={save} saving={saving} />
          </>
        )}
      </Card>
    </PageWrapper>
  );
}
