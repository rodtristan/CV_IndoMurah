"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import {
  KCheckbox, KCode, KColumns, KInfoBox, KInput, KNumber, KRow, KSaveBar, KSelect, KTabs,
} from "@/components/kform";
import { PartnerFields, emptyPartner, type PartnerCommon } from "./PartnerFields";
import { api } from "@/lib/api-client";
import { createWithAutoCode, isEmail } from "@/lib/auto-code";
import { usePageTitle } from "@/lib/page-title";

const LIST = "/master/customers";

// There is no /customer-group endpoint yet; ids follow the seed order
// (api/prisma/seed.ts) exactly like the previous customers page did.
const GROUPS = [
  { value: "1", label: "Umum" },
  { value: "2", label: "Retail" },
  { value: "3", label: "Grosir" },
  { value: "4", label: "VIP" },
];

// No Wilayah master exists in the API; static choices keep the UI complete.
const REGIONS: Record<string, string[]> = {
  Sumatera: ["Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Lampung"],
  Jawa: ["DKI Jakarta", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Banten"],
  "Kalimantan": ["Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur"],
  Sulawesi: ["Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Selatan"],
  "Bali & Nusa Tenggara": ["Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur"],
  "Maluku & Papua": ["Maluku", "Papua"],
};

interface CustomerState extends PartnerCommon {
  code: string;
  birthDate: string;
  gender: string;
  idNumber: string;
  creditLimit: string;
  creditDays: string;
  dueDays: string;
  maxCredit: string;
  groupId: string;
  discountType: string;
  region: string;
  subRegion: string;
  salesId: string;
  startPoint: string;
  active: boolean;
  taxUse: string;
  taxSource: string;
  taxType: string;
  taxValue: string;
}

const empty: CustomerState = {
  ...emptyPartner, code: "", birthDate: "", gender: "", idNumber: "", creditLimit: "0", creditDays: "0", dueDays: "0",
  maxCredit: "0", groupId: "1", discountType: "", region: "", subRegion: "", salesId: "", startPoint: "0", active: true,
  taxUse: "default", taxSource: "default", taxType: "", taxValue: "0",
};

interface CustomerRow {
  ID: number; Code: string; Name: string; Phone?: string | null; Email?: string | null; Address?: string | null;
  Notes?: string | null; CustomerGroupID?: number; IsActive?: boolean;
}
interface SalesOpt { ID: number; Code: string; Name: string }

export function CustomerForm({ id, copyFrom }: { id?: number; copyFrom?: number }) {
  const router = useRouter();
  const isNew = !id;
  usePageTitle(isNew ? "Pelanggan Baru" : "Edit Pelanggan");
  const [tab, setTab] = useState("umum");
  const [f, setF] = useState<CustomerState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerCommon, string>>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id || copyFrom));
  const [sales, setSales] = useState<SalesOpt[]>([]);
  const patch = (p: Partial<CustomerState>) => setF((s) => ({ ...s, ...p }));

  useEffect(() => {
    api.get<SalesOpt[]>("sales-person", { $select: "ID,Code,Name", $take: 100 })
      .then((r) => setSales(r.data ?? []))
      .catch(() => setSales([]));
  }, []);

  useEffect(() => {
    const src = id ?? copyFrom;
    if (!src) return;
    let alive = true;
    api.get<CustomerRow>(`customer/${src}`, undefined, { skipCache: true })
      .then((res) => {
        const r = res.data;
        if (!alive || !r) return;
        setF({
          ...empty,
          code: id ? r.Code : "",
          name: r.Name ?? "", phone: r.Phone ?? "", email: r.Email ?? "", address: r.Address ?? "", notes: r.Notes ?? "",
          groupId: String(r.CustomerGroupID ?? 1), active: r.IsActive ?? true,
        });
      })
      .catch(() => toast.error("Gagal memuat data pelanggan"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, copyFrom]);

  const subRegions = useMemo(() => (REGIONS[f.region] ?? []).map((v) => ({ value: v, label: v })), [f.region]);
  const dataCustomer = f.taxSource === "customer";

  const save = async () => {
    const errs: typeof errors = {};
    if (!f.name.trim()) errs.name = "Nama pelanggan harus diisi";
    if (f.email && !isEmail(f.email)) errs.email = "Format e-mail tidak valid";
    setErrors(errs);
    if (Object.keys(errs).length) { setTab("umum"); return; }
    setSaving(true);
    try {
      // Only fields the current API DTO accepts (PascalCase, whitelist validation).
      const payload = {
        Name: f.name.trim(),
        Phone: f.phone || (isNew ? undefined : null),
        Email: f.email || (isNew ? undefined : null),
        Address: f.address || (isNew ? undefined : null),
        Notes: f.notes || (isNew ? undefined : null),
        CustomerGroupID: Number(f.groupId) || 1,
        IsActive: f.active,
      };
      if (isNew) await createWithAutoCode("customer", "CUST", "Code", payload);
      else await api.patch("customer", id!, { ...payload, Code: f.code.trim() || undefined });
      toast.success("Data pelanggan berhasil disimpan");
      router.push(LIST);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan pelanggan");
    } finally {
      setSaving(false);
    }
  };

  const num = (k: keyof CustomerState) => ({ value: f[k] as string, onChange: (v: string) => patch({ [k]: v } as Partial<CustomerState>), min: 0 });

  return (
    <PageWrapper>
      <Card className="p-4">
        {loading ? <p className="p-6 text-center text-sm text-muted">Memuat...</p> : (
          <>
            <KTabs
              tabs={[{ key: "umum", label: "Data Umum" }, { key: "pajak", label: "Data Pendukung Pajak" }]}
              active={tab} onChange={setTab}
            />
            <div className="pt-4">
              <div className={tab === "umum" ? "" : "hidden"}>
                <KColumns>
                  <div>
                    <KCode value={f.code} isNew={isNew} onChange={(v) => patch({ code: v })} />
                    <PartnerFields value={f} onChange={patch} nameLabel="Nama" errors={errors} />
                    <KRow cols={3}>
                      <KInput label="Tanggal Lahir" type="date" value={f.birthDate} onChange={(e) => patch({ birthDate: e.target.value })} />
                      <KSelect
                        label="Jenis Kelamin" value={f.gender} onChange={(v) => patch({ gender: v })}
                        options={[{ value: "L", label: "Laki-laki" }, { value: "P", label: "Perempuan" }]}
                      />
                      <KInput label="No. KTP" value={f.idNumber} onChange={(e) => patch({ idNumber: e.target.value })} maxLength={20} />
                    </KRow>
                  </div>
                  <div>
                    <KNumber label="Limit Jumlah Piutang" {...num("creditLimit")} />
                    <KNumber label="Limit Hari Piutang" {...num("creditDays")} hint="0 = Tanpa Limit" />
                    <KNumber label="Jatuh Tempo" {...num("dueDays")} hint="0 = Mengacu Pada Pengaturan" />
                    <KNumber label="Max Jumlah Kredit" {...num("maxCredit")} hint="Nominal kredit per nota. 0 = Tanpa Limit" />
                    <KSelect
                      label="Grup Pelanggan" value={f.groupId} onChange={(v) => patch({ groupId: v || "1" })} placeholder="Umum" options={GROUPS}
                      action={
                        <button
                          type="button" disabled title="Belum tersedia: API grup pelanggan belum ada"
                          className="flex h-10 w-12 shrink-0 cursor-not-allowed items-center justify-center rounded border border-[#cfd4da] bg-[#f3f4f6] text-[#9aa3ad]"
                        >
                          <Plus className="size-4" />
                        </button>
                      }
                    />
                    <KSelect
                      label="Tipe Potongan" value={f.discountType} onChange={(v) => patch({ discountType: v })}
                      options={[
                        { value: "group_item", label: "Potongan Grup Per Item" },
                        { value: "group_invoice", label: "Potongan Grup Per Faktur" },
                        { value: "item_list", label: "Potongan Daftar Item" },
                      ]}
                    />
                    <KRow>
                      <KSelect
                        label="Wilayah" value={f.region} onChange={(v) => patch({ region: v, subRegion: "" })}
                        options={Object.keys(REGIONS).map((r) => ({ value: r, label: r }))}
                      />
                      <KSelect label="Sub Wilayah" value={f.subRegion} onChange={(v) => patch({ subRegion: v })} options={subRegions} disabled={!f.region} />
                    </KRow>
                    <KSelect
                      label="Sales" value={f.salesId} onChange={(v) => patch({ salesId: v })}
                      options={sales.map((s) => ({ value: s.ID, label: `${s.Code} - ${s.Name}` }))}
                    />
                    <KNumber label="Point Awal" {...num("startPoint")} />
                    <KCheckbox label="Status" caption="Aktif" checked={f.active} onChange={(v) => patch({ active: v })} />
                  </div>
                </KColumns>
              </div>

              <div className={tab === "pajak" ? "" : "hidden"}>
                <div className="max-w-xl">
                  <KSelect
                    label="Menggunakan Pajak" value={f.taxUse} placeholder="Default"
                    onChange={(v) => patch({ taxUse: v || "default", ...(v !== "exclude" && f.taxSource === "item" ? { taxSource: "default" } : {}) })}
                    hint="Default = Mengacu Pada Pengaturan"
                    options={[{ value: "default", label: "Default" }, { value: "non", label: "Non" }, { value: "include", label: "Include" }, { value: "exclude", label: "Exclude" }]}
                  />
                  <KSelect
                    label="Nilai Pajak diset Dari" value={f.taxSource} placeholder="Default"
                    onChange={(v) => patch({ taxSource: v || "default", ...(v !== "customer" ? { taxType: "", taxValue: "0" } : {}) })}
                    options={[
                      { value: "default", label: "Default" }, { value: "customer", label: "Data Pelanggan" },
                      ...(f.taxUse === "exclude" ? [{ value: "item", label: "Data Item" }] : []),
                    ]}
                  />
                  <KSelect
                    label="Jenis Pajak" value={f.taxType} onChange={(v) => patch({ taxType: v })} disabled={!dataCustomer}
                    options={[{ value: "PPN", label: "PPN" }, { value: "PPNBM", label: "PPnBM" }]}
                  />
                  <KNumber
                    label="Nilai Pajak" {...num("taxValue")} disabled={!dataCustomer}
                    className={dataCustomer ? "" : "border-dashed"}
                  />
                  <KInfoBox variant="info">
                    Data pajak ini akan terisi otomatis saat membuat transaksi penjualan untuk pelanggan ini.
                  </KInfoBox>
                </div>
              </div>
            </div>
            <KSaveBar onSave={save} saving={saving} />
          </>
        )}
      </Card>
    </PageWrapper>
  );
}
