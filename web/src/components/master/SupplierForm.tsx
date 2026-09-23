"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KCode, KColumns, KNumber, KSaveBar, KSelect } from "@/components/kform";
import { PartnerFields, emptyPartner, type PartnerCommon } from "./PartnerFields";
import { api } from "@/lib/api-client";
import { createWithAutoCode, isEmail } from "@/lib/auto-code";
import { usePageTitle } from "@/lib/page-title";

const LIST = "/master/suppliers";

interface SupplierState extends PartnerCommon {
  code: string;
  dueDays: string;
  taxUse: string;
  taxSource: string;
  taxType: string;
  taxValue: string;
}

const empty: SupplierState = { ...emptyPartner, code: "", dueDays: "0", taxUse: "default", taxSource: "default", taxType: "", taxValue: "0" };

interface SupplierRow {
  ID: number; Code: string; Name: string; ContactPerson?: string | null; Phone?: string | null;
  Email?: string | null; Address?: string | null; Notes?: string | null;
}

export function SupplierForm({ id, copyFrom }: { id?: number; copyFrom?: number }) {
  const router = useRouter();
  const isNew = !id;
  usePageTitle(isNew ? "Supplier Baru" : "Edit Supplier");
  const [f, setF] = useState<SupplierState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerCommon, string>>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id || copyFrom));
  const patch = (p: Partial<SupplierState>) => setF((s) => ({ ...s, ...p }));

  useEffect(() => {
    const src = id ?? copyFrom;
    if (!src) return;
    let alive = true;
    api.get<SupplierRow>(`supplier/${src}`, undefined, { skipCache: true })
      .then((res) => {
        const r = res.data;
        if (!alive || !r) return;
        setF({
          ...empty,
          code: id ? r.Code : "",
          name: r.Name ?? "", contact: r.ContactPerson ?? "", phone: r.Phone ?? "", email: r.Email ?? "",
          address: r.Address ?? "", notes: r.Notes ?? "",
        });
      })
      .catch(() => toast.error("Gagal memuat data supplier"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, copyFrom]);

  const dataSupplier = f.taxSource === "supplier";

  const save = async () => {
    const errs: typeof errors = {};
    if (!f.name.trim()) errs.name = "Nama supplier harus diisi";
    if (f.email && !isEmail(f.email)) errs.email = "Format e-mail tidak valid";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      // Only fields the current API DTO accepts (camelCase, whitelist validation).
      const payload = {
        name: f.name.trim(),
        contactPerson: f.contact || (isNew ? undefined : null),
        phone: f.phone || (isNew ? undefined : null),
        email: f.email || (isNew ? undefined : null),
        address: f.address || (isNew ? undefined : null),
        notes: f.notes || (isNew ? undefined : null),
      };
      if (isNew) await createWithAutoCode("supplier", "SUP", "code", payload);
      else await api.patch("supplier", id!, { ...payload, code: f.code.trim() || undefined });
      toast.success("Data supplier berhasil disimpan");
      router.push(LIST);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan supplier");
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
                <PartnerFields value={f} onChange={patch} nameLabel="Nama" errors={errors} />
              </div>
              <div>
                <div>
                  <KNumber label="Jatuh Tempo" value={f.dueDays} onChange={(v) => patch({ dueDays: v })} min={0} hint="0 = Mengacu Pada Pengaturan" />
                  <KSelect
                    label="Menggunakan Pajak" value={f.taxUse} onChange={(v) => patch({ taxUse: v || "default" })} placeholder="Default"
                    hint="Default = Mengacu Pada Pengaturan"
                    options={[{ value: "default", label: "Default" }, { value: "non", label: "Non" }, { value: "include", label: "Include" }, { value: "exclude", label: "Exclude" }]}
                  />
                  <KSelect
                    label="Nilai Pajak diset Dari" value={f.taxSource}
                    onChange={(v) => patch({ taxSource: v || "default", ...(v !== "supplier" ? { taxType: "", taxValue: "0" } : {}) })}
                    placeholder="Default"
                    options={[{ value: "default", label: "Default" }, { value: "supplier", label: "Data Supplier" }]}
                  />
                  <KSelect
                    label="Jenis Pajak" value={f.taxType} onChange={(v) => patch({ taxType: v })} disabled={!dataSupplier}
                    options={[{ value: "PPN", label: "PPN" }, { value: "PPNBM", label: "PPnBM" }]}
                  />
                  <KNumber
                    label="Nilai Pajak" value={f.taxValue} onChange={(v) => patch({ taxValue: v })} disabled={!dataSupplier} min={0}
                    className={dataSupplier ? "" : "border-dashed"}
                  />
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
