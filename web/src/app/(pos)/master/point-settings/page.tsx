"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { KCard, KColumns, KInfoBox, KInput, KNumber, KRadioGroup, KSaveBar, KTextarea } from "@/components/kform";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";

interface PointRow { ID: number; Name: string; PointsPerRupiah: string | number; MinimumTransaction: string | number; IsActive: boolean }

const TYPES = [
  { value: "none", label: "Tidak memakai point" },
  { value: "reward", label: "Point tukar hadiah" },
  { value: "discount", label: "Point menjadi potongan" },
  { value: "item", label: "Point item" },
];

const HINTS: Record<string, string> = {
  none: "Sistem point tidak aktif.",
  reward: "Contoh: setiap berbelanja kelipatan 50.000 mendapat 1 point; 150.000 mendapat 3 point. Point dikumpulkan dan dapat ditukar dengan hadiah (Penjualan > Point Penjualan).",
  discount: "Contoh: setiap berbelanja kelipatan 100.000 mendapat potongan 1.000. Potongan dicetak pada nota dan dipakai pada belanja berikutnya; nota hilang berarti potongan hangus.",
  item: "Nilai point ditentukan pada tiap item (master item atau datasheet). Contoh: Mie 1 Dus bernilai 2 point, beli 2 Dus mendapat 2 point.",
};

export default function PointSettingsPage() {
  usePageTitle("Point Pelanggan");
  const [rec, setRec] = useState<PointRow | null>(null);
  const [type, setType] = useState("none");
  const [multiple, setMultiple] = useState("50000");
  const [points, setPoints] = useState("1");
  const [discount, setDiscount] = useState("0");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [redeemFrom, setRedeemFrom] = useState("");
  const [redeemTo, setRedeemTo] = useState("");
  const [printText, setPrintText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PointRow[]>("point-setting", { $take: 1, $orderBy: { ID: "asc" } }, { skipCache: true })
      .then((res) => {
        const r = res.data?.[0];
        if (!r) return;
        setRec(r);
        const min = Number(r.MinimumTransaction) || 0;
        setType(r.IsActive ? "reward" : "none");
        if (min > 0) {
          setMultiple(String(min));
          setPoints(String(Math.round(Number(r.PointsPerRupiah) * min * 1000) / 1000));
        }
      })
      .catch(() => toast.error("Gagal memuat pengaturan point"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setError("");
    const m = Number(multiple);
    const p = Number(points);
    if (type !== "none" && (!(m > 0) || !(p > 0))) { setError("Kelipatan belanja dan jumlah point harus lebih dari 0."); return; }
    const perRupiah = m > 0 ? Math.round((p / m) * 10000) / 10000 : 0;
    if (type !== "none" && perRupiah <= 0) { setError("Nilai point per rupiah terlalu kecil untuk disimpan di server (maksimal 4 desimal). Perbesar jumlah point atau perkecil kelipatan."); return; }
    setSaving(true);
    try {
      const payload = {
        name: "Point Pelanggan",
        pointsPerRupiah: type === "none" ? Number(rec?.PointsPerRupiah ?? 0.01) : perRupiah,
        minimumTransaction: type === "none" ? Number(rec?.MinimumTransaction ?? 0) : m,
        isActive: type !== "none",
      };
      if (rec) await api.patch("point-setting", rec.ID, payload);
      else await api.post("point-setting", payload);
      toast.success("Pengaturan point tersimpan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageWrapper><KCard><p className="py-10 text-center text-[#9aa3ad]">Memuat data...</p></KCard></PageWrapper>;

  return (
    <PageWrapper>
      <KInfoBox variant="info" title="Keterangan">
        <p>Yang tersimpan di server: jenis aktif / tidak, kelipatan belanja dan jumlah point. Masa periode, masa tukar, nilai potongan, dan keterangan cetak belum disimpan di server.</p>
      </KInfoBox>
      <KInfoBox variant="warning" title="Penting">
        <p>Perubahan hanya berlaku pada transaksi penjualan yang baru, tidak pada transaksi yang sudah terjadi.</p>
      </KInfoBox>
      {error && <div className="rounded border border-danger/40 bg-danger/10 px-4 py-3 text-[14px] text-danger" role="alert">{error}</div>}
      <KCard>
        <KRadioGroup label="Jenis Point" value={type} onChange={setType} options={TYPES} hint={HINTS[type]} />
        {type !== "none" && (
          <KColumns>
            <KNumber label="Kelipatan Belanja (Rp)" value={multiple} onChange={setMultiple} hint="Setiap kelipatan belanja ini pelanggan mendapat point / potongan." />
            {type === "discount" ? (
              <KNumber label="Nilai Potongan per Kelipatan (Rp)" value={discount} onChange={setDiscount} />
            ) : (
              <KNumber label="Point per Kelipatan" value={points} onChange={setPoints} />
            )}
            <KInput label="Masa Periode Point (Dari)" type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} hint="Transaksi di luar masa ini tidak mendapat point." />
            <KInput label="Masa Periode Point (Sampai)" type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
            <KInput label="Masa Tukar Point (Dari)" type="date" value={redeemFrom} onChange={(e) => setRedeemFrom(e.target.value)} hint="Hanya sebagai informasi pada struk." />
            <KInput label="Masa Tukar Point (Sampai)" type="date" value={redeemTo} onChange={(e) => setRedeemTo(e.target.value)} />
            <div className="lg:col-span-2">
              <KTextarea label="Keterangan Saat Cetak" rows={3} value={printText} onChange={(e) => setPrintText(e.target.value)} hint="Tulisan yang tampil pada nota, mis. informasi point dan nilainya." />
            </div>
          </KColumns>
        )}
      </KCard>
      <KSaveBar onSave={save} saving={saving} />
    </PageWrapper>
  );
}
