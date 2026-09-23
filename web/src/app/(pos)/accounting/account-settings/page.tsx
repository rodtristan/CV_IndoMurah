"use client";

// Setting Perkiraan: kode perkiraan default tiap transaksi untuk jurnal otomatis.
// TODO backend: no endpoint yet - stored in this browser (localStorage) until the API exists.

import { useMemo, useState } from "react";
import { KCard, KInfoBox, KSaveBar, KSelect } from "@/components/kform";
import { useList, useLocalState, type Row } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";

const ITEMS: [string, string][] = [
  ["cash", "Kas Default"], ["inventory", "Persediaan Barang"], ["receivable", "Piutang Dagang"], ["payable", "Hutang Dagang"],
  ["sales", "Pendapatan Penjualan"], ["salesDiscount", "Potongan Penjualan"], ["cogs", "Harga Pokok Penjualan (HPP)"],
  ["salesReturn", "Retur Penjualan"], ["purchaseReturn", "Retur Pembelian"], ["vatOut", "PPN Keluaran"], ["vatIn", "PPN Masukan"],
  ["custDeposit", "Deposit Pelanggan"], ["suppDeposit", "Deposit Supplier"], ["shipping", "Biaya Kirim"], ["stockDiff", "Selisih Stok (Opname)"],
  ["retained", "Laba Ditahan"], ["currentProfit", "Laba Tahun Berjalan"], ["otherIncome", "Pendapatan Lain"], ["otherExpense", "Biaya Lain"],
];

export default function AccountSettingsPage() {
  const accounts = useList("account", { $take: 500, $orderBy: { Code: "asc" } });
  const [vals, setVals] = useLocalState<Record<string, string>>("ketoko_account_settings", {});
  const [saved, setSaved] = useState(false);
  const opts = useMemo(() => accounts.map((a: Row) => ({ value: a.ID, label: `${a.Code} - ${a.Name}` })), [accounts]);
  const missing = ITEMS.filter(([k]) => !vals[k]).length;
  return (
    <PageWrapper>
      <KCard>
        <KInfoBox variant="warning" title="Penting"><span>Kode perkiraan menentukan jurnal otomatis dari transaksi. Ubah hanya bila Anda memahami akuntansi.{missing > 0 && ` Setting belum lengkap: ${missing} kode belum diisi.`}</span></KInfoBox>
        <div className="grid gap-x-8 lg:grid-cols-2">
          {ITEMS.map(([k, label]) => (
            <KSelect key={k} label={label} value={vals[k] ?? ""} onChange={(v) => { setVals((p) => ({ ...p, [k]: v })); setSaved(false); }} options={opts} />
          ))}
        </div>
        <KSaveBar onSave={() => setSaved(true)} extra={saved ? <span className="text-sm text-[#2e7d32]">Tersimpan di browser ini (belum ada API).</span> : undefined} />
      </KCard>
    </PageWrapper>
  );
}
