"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KCheckbox, KCode, KColumns, KNumber, KSaveBar } from "@/components/kform";
import { PartnerFields, emptyPartner, type PartnerCommon } from "./PartnerFields";
import { api } from "@/lib/api-client";
import { createWithAutoCode, isEmail } from "@/lib/auto-code";
import { usePageTitle } from "@/lib/page-title";

const LIST = "/master/suppliers";

// Partner fields the Supplier model can store (City, Province, TaxID, Bank*, ContactPerson, ...).
const SUPPLIER_FIELDS: (keyof PartnerCommon)[] = [
  "address", "city", "province", "phone", "contact", "email", "accountNo", "accountName", "bank", "npwp", "notes",
];

interface SupplierState extends PartnerCommon {
  code: string;
  dueDays: string;
  active: boolean;
}

const empty: SupplierState = { ...emptyPartner, code: "", dueDays: "0", active: true };

interface SupplierRow {
  ID: number; Code: string; Name: string; ContactPerson?: string | null; Phone?: string | null;
  Email?: string | null; Address?: string | null; Notes?: string | null; IsActive?: boolean;
  City?: string | null; Province?: string | null; TaxID?: string | null; BankName?: string | null;
  BankAccountNumber?: string | null; BankAccountName?: string | null; DueDays?: number | null;
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
          city: r.City ?? "", province: r.Province ?? "", npwp: r.TaxID ?? "", bank: r.BankName ?? "",
          accountNo: r.BankAccountNumber ?? "", accountName: r.BankAccountName ?? "",
          dueDays: String(r.DueDays ?? 0), active: r.IsActive ?? true,
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
      const orNull = (v: string) => v.trim() || (isNew ? undefined : null);
      // Every field shown on this form is sent (camelCase, validated by Create/UpdateSupplierDto).
      const payload = {
        name: f.name.trim(),
        contactPerson: orNull(f.contact),
        phone: orNull(f.phone),
        email: orNull(f.email),
        address: orNull(f.address),
        notes: orNull(f.notes),
        city: orNull(f.city),
        province: orNull(f.province),
        taxId: orNull(f.npwp),
        bankName: orNull(f.bank),
        bankAccountNumber: orNull(f.accountNo),
        bankAccountName: orNull(f.accountName),
        dueDays: Math.max(0, Math.trunc(Number(f.dueDays) || 0)),
        isActive: f.active,
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
                <PartnerFields value={f} onChange={patch} nameLabel="Nama" errors={errors} fields={SUPPLIER_FIELDS} />
              </div>
              <div>
                <KNumber label="Jatuh Tempo (hari)" value={f.dueDays} onChange={(v) => patch({ dueDays: v })} min={0} hint="0 = Mengacu Pada Pengaturan" />
                <KCheckbox label="Status" caption="Aktif" checked={f.active} onChange={(v) => patch({ active: v })} />
              </div>
            </KColumns>
            <KSaveBar onSave={save} saving={saving} />
          </>
        )}
      </Card>
    </PageWrapper>
  );
}
