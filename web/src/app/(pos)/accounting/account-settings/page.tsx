"use client";

// Setting Perkiraan: kode perkiraan default tiap transaksi untuk jurnal otomatis.

import { useEffect, useMemo, useState } from "react";
import { KCard, KInfoBox, KSaveBar, KSelect } from "@/components/kform";
import { useList, type Row } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { api } from "@/lib/api-client";

const ITEMS: [string, string][] = [
  ["cash", "Kas Default"], ["bank", "Bank Default (transfer/EDC/cek/BG; opsional, kosong = Kas)"], ["inventory", "Persediaan Barang"], ["receivable", "Piutang Dagang"], ["payable", "Hutang Dagang"],
  ["sales", "Pendapatan Penjualan"], ["salesDiscount", "Potongan Penjualan"], ["cogs", "Harga Pokok Penjualan (HPP)"],
  ["salesReturn", "Retur Penjualan"], ["purchaseReturn", "Retur Pembelian"], ["vatOut", "PPN Keluaran"], ["vatIn", "PPN Masukan"],
  ["custDeposit", "Deposit Pelanggan"], ["suppDeposit", "Deposit Supplier"], ["shipping", "Biaya Kirim"], ["stockDiff", "Selisih Stok (Opname)"],
  ["retained", "Laba Ditahan"], ["currentProfit", "Laba Tahun Berjalan"], ["otherIncome", "Pendapatan Lain"], ["otherExpense", "Biaya Lain"],
];

export default function AccountSettingsPage() {
  const accounts = useList("account", { $take: 500, $orderBy: { Code: "asc" } });
  const [vals, setVals] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api.request<Record<string, number | null>>("GET", "account-setting").then((r) => {
      if (!r.success || !r.data) return;
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(r.data)) if (v != null) next[k] = String(v);
      setVals(next);
    }).catch((e) => setMsg({ ok: false, text: (e as Error).message || "Gagal memuat setting" }));
  }, []);

  const opts = useMemo(() => accounts.map((a: Row) => ({ value: a.ID, label: `${a.Code} - ${a.Name}` })), [accounts]);
  const missing = ITEMS.filter(([k]) => k !== "bank" && !vals[k]).length;

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const body: Record<string, number | null> = {};
      for (const [k] of ITEMS) body[k] = vals[k] ? Number(vals[k]) : null;
      const r = await api.request("PUT", "account-setting", body);
      setMsg(r.success ? { ok: true, text: "Setting perkiraan tersimpan." } : { ok: false, text: r.message || "Gagal menyimpan" });
    } catch (e) { setMsg({ ok: false, text: (e as Error).message || "Gagal menyimpan" }); } finally { setSaving(false); }
  };

  return (
    <PageWrapper>
      <KCard>
        <KInfoBox variant="warning" title="Penting"><span>Kode perkiraan menentukan jurnal otomatis dari transaksi (penjualan, pembelian, retur, pembayaran, kas, deposit). Transaksi ditolak bila kode yang dibutuhkan belum diisi. Ubah hanya bila Anda memahami akuntansi.{missing > 0 && ` Setting belum lengkap: ${missing} kode belum diisi.`}</span></KInfoBox>
        <div className="grid gap-x-8 lg:grid-cols-2">
          {ITEMS.map(([k, label]) => (
            <KSelect key={k} label={label} value={vals[k] ?? ""} onChange={(v) => { setVals((p) => ({ ...p, [k]: v })); setMsg(null); }} options={opts} />
          ))}
        </div>
        <KSaveBar onSave={save} saving={saving} extra={msg ? <span className={`text-sm ${msg.ok ? "text-[#2e7d32]" : "text-danger"}`}>{msg.text}</span> : undefined} />
      </KCard>
    </PageWrapper>
  );
}
