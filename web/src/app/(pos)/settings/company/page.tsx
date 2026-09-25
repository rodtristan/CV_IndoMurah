"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KColumns, KField, KInput, KRow, KSaveBar, KTextarea } from "@/components/kform";
import { api } from "@/lib/api-client";
import { uploadImage } from "@/lib/upload-image";
import { usePageTitle } from "@/lib/page-title";
import { Loading, apiError } from "../_lib/local";

// Company columns (PATCH /company/:id) + extra fields without a Company column, stored on the
// server as "general.company.*" keys via PUT /general-settings/all (same store as Pengaturan Umum).

interface Server {
  companyCode: string; name: string; address: string; city: string; province: string;
  postalCode: string; phone: string; email: string; taxId: string; logoUrl: string;
}
interface Extra {
  country: string; fax: string; website: string; bank: string; bankAccount: string; bankHolder: string; footerNote: string;
}

const EMPTY: Server = { companyCode: "", name: "", address: "", city: "", province: "", postalCode: "", phone: "", email: "", taxId: "", logoUrl: "" };
const EXTRA: Extra = { country: "Indonesia", fax: "", website: "", bank: "", bankAccount: "", bankHolder: "", footerNote: "" };
const NS = "general.company.";

export default function CompanySettingsPage() {
  usePageTitle("Data Perusahaan");
  const [id, setId] = useState<number | null>(null);
  const [f, setF] = useState<Server>(EMPTY);
  const [x, setX] = useState<Extra>(EXTRA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, g] = await Promise.all([
        api.get<Record<string, unknown>[]>("company", { $take: 1 }, { skipCache: true }),
        api.get<Record<string, unknown>>("general-settings", undefined, { skipCache: true }),
      ]);
      const c = res.data?.[0];
      if (c) {
        setId(Number(c.ID));
        const s = (k: string) => String(c[k] ?? "");
        setF({
          companyCode: s("CompanyCode"), name: s("Name"), address: s("Address"), city: s("City"), province: s("Province"),
          postalCode: s("PostalCode"), phone: s("Phone"), email: s("Email"), taxId: s("TaxID"), logoUrl: s("LogoUrl"),
        });
      }
      const d = (g.data ?? {}) as Record<string, unknown>;
      setX(() => {
        const next = { ...EXTRA };
        for (const k of Object.keys(EXTRA) as (keyof Extra)[]) {
          const v = d[`${NS}${k}`];
          if (v !== undefined && v !== null) next[k] = String(v);
        }
        return next;
      });
    } catch (e) { toast.error(apiError(e)); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const set = (k: keyof Server) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const setEx = (k: keyof Extra) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setX((p) => ({ ...p, [k]: e.target.value }));

  // Logo is uploaded to file storage right away; its URL is saved to Company.LogoUrl on "Simpan".
  const pickLogo = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setF((p) => ({ ...p, logoUrl: url }));
      toast.success("Logo terunggah. Klik Simpan untuk menyimpan.");
    } catch (e) { toast.error(apiError(e)); } finally { setUploading(false); }
  };

  const save = async () => {
    if (!id) { toast.error("Data perusahaan tidak ditemukan"); return; }
    if (!f.name.trim()) { toast.error("Nama perusahaan wajib diisi"); return; }
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) { toast.error("Format email tidak valid"); return; }
    setSaving(true);
    try {
      const { companyCode: _code, ...rest } = f;
      void _code;
      await api.patch("company", id, { ...rest, name: rest.name.trim(), logoUrl: rest.logoUrl || null });
      const extra: Record<string, string> = {};
      for (const [k, v] of Object.entries(x)) extra[`${NS}${k}`] = v;
      await api.put("general-settings", "all", extra);
      toast.success("Data perusahaan berhasil disimpan");
      await load();
    } catch (e) { toast.error(apiError(e)); } finally { setSaving(false); }
  };

  if (loading) return <PageWrapper><Loading /></PageWrapper>;

  return (
    <PageWrapper>
      <Card className="p-4">
        <KColumns>
          <div>
            <KInput label="Kode Perusahaan" value={f.companyCode} readOnly />
            <KInput label="Nama Perusahaan / Nama Toko" value={f.name} onChange={set("name")} maxLength={255} />
            <KTextarea label="Alamat" rows={3} value={f.address} onChange={set("address")} maxLength={500} />
            <KRow>
              <KInput label="Kota" value={f.city} onChange={set("city")} maxLength={100} />
              <KInput label="Provinsi" value={f.province} onChange={set("province")} maxLength={100} />
            </KRow>
            <KRow>
              <KInput label="Kode Pos" value={f.postalCode} onChange={set("postalCode")} maxLength={20} />
              <KInput label="Negara" value={x.country} onChange={setEx("country")} />
            </KRow>
            <KRow>
              <KInput label="Telepon" value={f.phone} onChange={set("phone")} maxLength={50} />
              <KInput label="Fax" value={x.fax} onChange={setEx("fax")} />
            </KRow>
            <KRow>
              <KInput label="Email" type="email" value={f.email} onChange={set("email")} maxLength={255} />
              <KInput label="Website" value={x.website} onChange={setEx("website")} placeholder="https://" />
            </KRow>
            <KInput label="NPWP / No. PKP" value={f.taxId} onChange={set("taxId")} maxLength={50} />
          </div>
          <div>
            <KField label="Logo Perusahaan" hint="Format PNG/JPG/GIF/WEBP, maks. 2 MB.">
              <div className="flex items-start gap-3">
                <div className="flex size-32 items-center justify-center overflow-hidden rounded border border-dashed border-[#cfd4da] bg-[#f7f8fa]">
                  {f.logoUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={f.logoUrl} alt="Logo perusahaan" className="max-h-full max-w-full object-contain" />
                    : <ImagePlus className="size-8 text-[#9aa3ad]" />}
                </div>
                <div className="flex flex-col gap-2">
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={(e) => { void pickLogo(e.target.files?.[0]); e.target.value = ""; }} />
                  <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="h-10 rounded border border-[#cfd4da] bg-white px-4 text-[14px] hover:bg-[#f3f4f6] disabled:opacity-60">
                    {uploading ? "Mengunggah..." : "Pilih File"}
                  </button>
                  {f.logoUrl && (
                    <button type="button" onClick={() => setF((p) => ({ ...p, logoUrl: "" }))} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-[14px] hover:bg-[#f3f4f6]">
                      <Trash2 className="size-4" /> Hapus Logo
                    </button>
                  )}
                </div>
              </div>
            </KField>
            <KRow>
              <KInput label="Bank" value={x.bank} onChange={setEx("bank")} />
              <KInput label="No Rekening" value={x.bankAccount} onChange={setEx("bankAccount")} />
            </KRow>
            <KInput label="Atas Nama Rekening" value={x.bankHolder} onChange={setEx("bankHolder")} />
            <KTextarea label="Catatan Kaki Faktur" rows={3} value={x.footerNote} onChange={setEx("footerNote")} />
          </div>
        </KColumns>
        <KSaveBar onSave={save} saving={saving} />
      </Card>
    </PageWrapper>
  );
}
