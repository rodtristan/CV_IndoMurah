"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KColumns, KField, KInfoBox, KInput, KNumber, KRow, KSaveBar, KTextarea } from "@/components/kform";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";
import { Loading, NoServerNote, apiError, useLocalDraft } from "../_lib/local";

interface Server {
  companyCode: string; name: string; address: string; city: string; province: string;
  postalCode: string; phone: string; email: string; taxId: string;
}
interface Extra {
  country: string; fax: string; website: string; bank: string; bankAccount: string; bankHolder: string;
  maxNota: string; maxUser: string; footerNote: string; logoData: string;
}

const EMPTY: Server = { companyCode: "", name: "", address: "", city: "", province: "", postalCode: "", phone: "", email: "", taxId: "" };
const EXTRA: Extra = {
  country: "Indonesia", fax: "", website: "", bank: "", bankAccount: "", bankHolder: "", maxNota: "0", maxUser: "0", footerNote: "", logoData: "",
};

export default function CompanySettingsPage() {
  usePageTitle("Data Perusahaan");
  const [id, setId] = useState<number | null>(null);
  const [f, setF] = useState<Server>(EMPTY);
  const { value: x, setValue: setX, persist, ready } = useLocalDraft<Extra>("company", EXTRA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Record<string, unknown>[]>("company", { $take: 1 }, { skipCache: true });
      const c = res.data?.[0];
      if (c) {
        setId(Number(c.ID));
        const s = (k: string) => String(c[k] ?? "");
        setF({ companyCode: s("CompanyCode"), name: s("Name"), address: s("Address"), city: s("City"), province: s("Province"), postalCode: s("PostalCode"), phone: s("Phone"), email: s("Email"), taxId: s("TaxID") });
      }
    } catch (e) { toast.error(apiError(e)); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const set = (k: keyof Server) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const setEx = (k: keyof Extra) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setX((p) => ({ ...p, [k]: e.target.value }));

  const pickLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar"); return; }
    if (file.size > 500 * 1024) { toast.error("Ukuran logo maksimal 500 KB"); return; }
    const reader = new FileReader();
    reader.onload = () => setX((p) => ({ ...p, logoData: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!f.name.trim()) { toast.error("Nama perusahaan wajib diisi"); return; }
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) { toast.error("Format email tidak valid"); return; }
    setSaving(true);
    try {
      const { companyCode: _code, ...payload } = f;
      void _code;
      if (id) await api.patch("company", id, payload);
      persist(x);
      toast.success("Data perusahaan berhasil disimpan");
      await load();
    } catch (e) { toast.error(apiError(e)); } finally { setSaving(false); }
  };

  if (loading || !ready) return <PageWrapper><Loading /></PageWrapper>;

  return (
    <PageWrapper>
      <Card className="p-4">
        <KInfoBox variant="warning" title="Penting" items={["Data Perusahaan belum tampak pada bukti transaksi atau laporan apabila belum melakukan aktivasi."]} />
        <KColumns>
          <div>
            <KInput label="Kode Perusahaan" value={f.companyCode} readOnly />
            <KInput label="Nama Perusahaan / Nama Toko" value={f.name} onChange={set("name")} />
            <KTextarea label="Alamat" rows={3} value={f.address} onChange={set("address")} />
            <KRow>
              <KInput label="Kota" value={f.city} onChange={set("city")} />
              <KInput label="Provinsi" value={f.province} onChange={set("province")} />
            </KRow>
            <KRow>
              <KInput label="Kode Pos" value={f.postalCode} onChange={set("postalCode")} />
              <KInput label="Negara (*)" value={x.country} onChange={setEx("country")} />
            </KRow>
            <KRow>
              <KInput label="Telepon" value={f.phone} onChange={set("phone")} />
              <KInput label="Fax (*)" value={x.fax} onChange={setEx("fax")} />
            </KRow>
            <KRow>
              <KInput label="Email" type="email" value={f.email} onChange={set("email")} />
              <KInput label="Website (*)" value={x.website} onChange={setEx("website")} placeholder="https://" />
            </KRow>
            <KInput label="NPWP / No. PKP" value={f.taxId} onChange={set("taxId")} />
          </div>
          <div>
            <KField label="Logo Perusahaan" hint="Format gambar (PNG/JPG), maks. 500 KB. Tampil pada bukti, faktur dan laporan. (*)">
              <div className="flex items-start gap-3">
                <div className="flex size-32 items-center justify-center overflow-hidden rounded border border-dashed border-[#cfd4da] bg-[#f7f8fa]">
                  {x.logoData
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={x.logoData} alt="Logo perusahaan" className="max-h-full max-w-full object-contain" />
                    : <ImagePlus className="size-8 text-[#9aa3ad]" />}
                </div>
                <div className="flex flex-col gap-2">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { pickLogo(e.target.files?.[0]); e.target.value = ""; }} />
                  <button type="button" onClick={() => fileRef.current?.click()} className="h-10 rounded border border-[#cfd4da] bg-white px-4 text-[14px] hover:bg-[#f3f4f6]">Choose File</button>
                  {x.logoData && (
                    <button type="button" onClick={() => setX((p) => ({ ...p, logoData: "" }))} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-[14px] hover:bg-[#f3f4f6]">
                      <Trash2 className="size-4" /> Hapus Logo
                    </button>
                  )}
                </div>
              </div>
            </KField>
            <KRow>
              <KNumber label="Max Nota (*)" value={x.maxNota} onChange={(v) => setX((p) => ({ ...p, maxNota: v }))} min={0} />
              <KNumber label="Max User (*)" value={x.maxUser} onChange={(v) => setX((p) => ({ ...p, maxUser: v }))} min={0} />
            </KRow>
            <KRow>
              <KInput label="Bank (*)" value={x.bank} onChange={setEx("bank")} />
              <KInput label="No Rekening (*)" value={x.bankAccount} onChange={setEx("bankAccount")} />
            </KRow>
            <KInput label="Atas Nama Rekening (*)" value={x.bankHolder} onChange={setEx("bankHolder")} />
            <KTextarea label="Catatan Kaki Faktur (*)" rows={3} value={x.footerNote} onChange={setEx("footerNote")} />
          </div>
        </KColumns>
        <NoServerNote>Kolom bertanda (*) belum tersedia di server; nilainya (termasuk logo) hanya disimpan di browser ini.</NoServerNote>
        <KSaveBar onSave={save} saving={saving} />
      </Card>
    </PageWrapper>
  );
}
