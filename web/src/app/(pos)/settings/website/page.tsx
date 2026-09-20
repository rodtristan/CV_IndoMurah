"use client";

import { toast } from "sonner";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KCheckbox, KColumns, KInfoBox, KInput, KSaveBar, KShareLink } from "@/components/kform";
import { usePageTitle } from "@/lib/page-title";
import { Loading, NoServerNote, useLocalDraft } from "../_lib/local";

interface Website { companyName: string; shopId: string; email: string; share: boolean; canOrder: boolean }
const DEFAULTS: Website = { companyName: "", shopId: "", email: "", share: false, canOrder: false };

export default function WebsiteSettingsPage() {
  usePageTitle("Pengaturan Website");
  const { value: w, setValue: setW, persist, ready } = useLocalDraft<Website>("website", DEFAULTS);
  if (!ready) return <PageWrapper><Loading /></PageWrapper>;

  const save = () => {
    if (!w.companyName.trim()) { toast.error("Nama perusahaan wajib diisi"); return; }
    if (w.email && !/^\S+@\S+\.\S+$/.test(w.email)) { toast.error("Format email tidak valid"); return; }
    if (w.shopId && !/^[a-z0-9-]+$/i.test(w.shopId)) { toast.error("ID Toko hanya boleh huruf, angka dan tanda hubung"); return; }
    persist(w);
    toast.success("Pengaturan website disimpan di browser ini");
  };

  return (
    <PageWrapper>
      <Card className="p-4">
        <KInfoBox title="Keterangan" items={[
          "Share Info adalah fitur promosi untuk membagikan informasi item (gambar, spesifikasi, stok). Pelanggan dapat memesan item yang tercatat pada pesanan penjualan.",
          "ID Toko hanya bisa dimasukkan satu kali dan disarankan tidak sama dengan nama perusahaan.",
        ]} />
        <KColumns>
          <div>
            <KInput label="Nama Perusahaan" value={w.companyName} onChange={(e) => setW((p) => ({ ...p, companyName: e.target.value }))} />
            <KInput label="ID Toko" value={w.shopId} onChange={(e) => setW((p) => ({ ...p, shopId: e.target.value }))} />
            <KInput label="Email Penerima Pesan" type="email" value={w.email} onChange={(e) => setW((p) => ({ ...p, email: e.target.value }))}
              hint="Menerima pesan jika ada pelanggan yang terdaftar via Ketoko Share." />
          </div>
          <div>
            <KCheckbox label="Share" caption="Produk dapat dilihat umum melalui link share" checked={w.share} onChange={(v) => setW((p) => ({ ...p, share: v }))} />
            <KCheckbox label="Bisa Order" caption="Pelanggan bisa memesan lewat link (masuk ke pesanan penjualan)" checked={w.canOrder} onChange={(v) => setW((p) => ({ ...p, canOrder: v }))} />
            {w.shopId && (
              <div className="mb-3">
                <label className="mb-1 block text-[14px]">Link Share :</label>
                <KShareLink value={`https://ketoko.co.id/share/${w.shopId}`} />
              </div>
            )}
          </div>
        </KColumns>
        <NoServerNote>Penyimpanan belum tersedia di server; pengaturan hanya disimpan di browser ini.</NoServerNote>
        <KSaveBar onSave={save} />
      </Card>
    </PageWrapper>
  );
}
