"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { KCard, KCheckbox, KInput, KNumber, KRadioGroup, KRow, KSaveBar, KTextarea } from "@/components/kform";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";
import { LoadingState } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// Form "Point Pelanggan" Ketoko.
const TYPES = [
  { value: "NONE", label: "Tidak memakai point." },
  { value: "DISCOUNT", label: "Point menjadi potongan." },
  { value: "REWARD", label: "Point tukar hadiah." },
  { value: "ITEM", label: "Point item." },
];

const DEF_REWARD = "Point Transaksi : [PNT], Periode penukaran Point dari [TTD] s/d [TTS]. Kumpulkan sebanyak banyaknya dapatkan hadiahnya.";
const DEF_DISCOUNT = "Nilai Point Nominal [PNT], Tukarkan sebagai Voucher belanja, sampai tanggal [TBP]";
const DEF_ITEM = "Point Transaksi : [PNT], Periode penukaran Point dari [TTD] s/d [TTS]. Kumpulkan sebanyak banyaknya dapatkan hadiahnya. Total Point : [TOP]";

const d = (v: unknown) => (v ? String(v).slice(0, 10) : "");
const iso = (v: string) => (v ? new Date(`${v}T00:00:00`).toISOString() : null);

function Box({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <fieldset disabled={disabled} className={cn("mb-3 rounded border border-[#d5d9de] p-4", disabled && "opacity-60")}>
      {children}
    </fieldset>
  );
}

export default function PointSettingsPage() {
  usePageTitle("Point Pelanggan");
  const [rec, setRec] = useState<Row | null>(null);
  const [f, setF] = useState({
    type: "NONE", multiple: "100", periodFrom: "", periodTo: "", redeemFrom: "", redeemTo: "", nonMember: false,
    rewardText: DEF_REWARD, nominal: "100", validDays: "15", discountText: DEF_DISCOUNT, itemText: DEF_ITEM,
  });
  const [generalCustomer, setGeneralCustomer] = useState("UMUM");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const set = (p: Partial<typeof f>) => setF((s) => ({ ...s, ...p }));

  useEffect(() => {
    api.get<Row[]>("point-setting", { $take: 1, $orderBy: { ID: "asc" } }, { skipCache: true })
      .then((res) => {
        const r = res.data?.[0];
        if (!r) return;
        setRec(r);
        setF({
          type: r.PointType ?? (r.IsActive ? "REWARD" : "NONE"),
          multiple: String(Number(r.InvoiceMultiple) || Number(r.MinimumTransaction) || 100),
          periodFrom: d(r.PeriodFrom), periodTo: d(r.PeriodTo), redeemFrom: d(r.RedeemFrom), redeemTo: d(r.RedeemTo),
          nonMember: !!r.NonMemberEarns,
          rewardText: r.RewardPrintText ?? DEF_REWARD,
          nominal: String(Number(r.NominalPerPoint ?? 100)),
          validDays: String(r.ValidDays ?? 15),
          discountText: r.DiscountPrintText ?? DEF_DISCOUNT,
          itemText: r.ItemPrintText ?? DEF_ITEM,
        });
      })
      .catch(() => toast.error("Gagal memuat pengaturan point"))
      .finally(() => setLoading(false));
    api.get<Row[]>("customer", { $take: 1, $orderBy: { ID: "asc" } }, { skipCache: true })
      .then((r) => { const c = r.data?.[0]; if (c) setGeneralCustomer(String(c.Code)); })
      .catch(() => undefined);
  }, []);

  const save = async () => {
    setError("");
    const m = Number(f.multiple);
    const active = f.type !== "NONE";
    if (active && f.type !== "ITEM" && !(m > 0)) { setError("1 Point kelipatan faktur harus lebih dari 0."); return; }
    if (f.periodFrom && f.periodTo && f.periodTo < f.periodFrom) { setError("Masa periode point: tanggal akhir sebelum tanggal awal."); return; }
    if (f.redeemFrom && f.redeemTo && f.redeemTo < f.redeemFrom) { setError("Masa tukar point: tanggal akhir sebelum tanggal awal."); return; }
    setSaving(true);
    try {
      const payload = {
        name: "Point Pelanggan",
        isActive: active,
        pointType: f.type,
        invoiceMultiple: m > 0 ? m : 0,
        // Kompatibilitas modul loyalty lama: 1 point per kelipatan faktur.
        pointsPerRupiah: m > 0 ? Math.max(0.0001, Math.round((1 / m) * 10000) / 10000) : 0,
        minimumTransaction: m > 0 ? m : 0,
        periodFrom: iso(f.periodFrom), periodTo: iso(f.periodTo), redeemFrom: iso(f.redeemFrom), redeemTo: iso(f.redeemTo),
        nonMemberEarns: f.nonMember,
        nominalPerPoint: Math.max(0, Number(f.nominal) || 0),
        validDays: Math.max(0, Math.trunc(Number(f.validDays) || 0)),
        rewardPrintText: f.rewardText || null,
        discountPrintText: f.discountText || null,
        itemPrintText: f.itemText || null,
      };
      if (rec) await api.patch("point-setting", rec.ID, payload);
      else setRec((await api.post<Row>("point-setting", payload)).data ?? null);
      toast.success("Pengaturan point tersimpan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageWrapper><KCard><LoadingState /></KCard></PageWrapper>;

  const t = f.type;
  return (
    <PageWrapper>
      {error && <div className="rounded border border-danger/40 bg-danger/10 px-4 py-3 text-[14px] text-danger" role="alert">{error}</div>}
      <KCard>
        <KRadioGroup label="Tipe Poin" value={t} onChange={(v) => set({ type: v })} options={TYPES} />

        <Box disabled={t === "NONE"}>
          <KNumber label="1 Point kelipatan faktur" value={f.multiple} onChange={(v) => set({ multiple: v })} min={0} step="0.01" />
          <KRow>
            <KInput label="Masa periode point" type="date" value={f.periodFrom} onChange={(e) => set({ periodFrom: e.target.value })} />
            <KInput label="s/d" type="date" value={f.periodTo} onChange={(e) => set({ periodTo: e.target.value })} />
          </KRow>
          <KRow>
            <KInput label="Masa tukar point dari" type="date" value={f.redeemFrom} onChange={(e) => set({ redeemFrom: e.target.value })} />
            <KInput label="s/d" type="date" value={f.redeemTo} onChange={(e) => set({ redeemTo: e.target.value })} />
          </KRow>
          <KInput label="Pelanggan Umum" value={generalCustomer} readOnly className="border-dashed bg-[#f7f8fa]" />
          <KCheckbox label="Non member dapat point" checked={f.nonMember} onChange={(v) => set({ nonMember: v })} />
        </Box>

        <Box disabled={t !== "REWARD"}>
          <KTextarea label="Keterangan saat cetak penjualan" rows={2} value={f.rewardText} onChange={(e) => set({ rewardText: e.target.value })} maxLength={1000} />
        </Box>

        <Box disabled={t !== "DISCOUNT"}>
          <KNumber label="Nilai tukar nominal per 1 point" value={f.nominal} onChange={(v) => set({ nominal: v })} min={0} step="0.01" fieldClassName="max-w-[700px]" />
          <KNumber label="Masa berlaku Poin setiap transaksi" value={f.validDays} onChange={(v) => set({ validDays: v })} min={0} fieldClassName="max-w-[700px]" hint="Hari" />
          <KTextarea label="Keterangan saat cetak penjualan" rows={2} value={f.discountText} onChange={(e) => set({ discountText: e.target.value })} maxLength={1000} />
        </Box>

        <Box disabled={t !== "ITEM"}>
          <KTextarea label="Keterangan saat cetak penjualan" rows={2} value={f.itemText} onChange={(e) => set({ itemText: e.target.value })} maxLength={1000} />
        </Box>

        <p className="text-[14px] text-[#3a4654]">
          Keterangan : [PNT] : Point Faktur, [MPD]/[MPS] : Masa Pengumpulan Point Dari/Sampai, [TTD] [TTS] Tanggal Tukar Dari/Sampai,
          [TBP] : Tanggal Berlaku Point (untuk point yang menjadi potongan/voucher), [TOP] : Total Point
        </p>
        <p className="mt-2 text-[14px] text-danger">Penting : Jangan mengubah Setting point ini apabila proses masa periode pengumpulan point sudah berjalan.</p>
      </KCard>
      <KSaveBar onSave={save} saving={saving} />
    </PageWrapper>
  );
}
