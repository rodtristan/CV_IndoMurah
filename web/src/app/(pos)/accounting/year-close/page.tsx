"use client";

// Proses Tutup Tahun. TODO backend: no endpoint yet - the run only simulates (UI complete).

import { useState } from "react";
import { KCard, KInfoBox, KSelect } from "@/components/kform";
import { ConfirmModal } from "@/components/ui/Modal";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function YearClosePage() {
  const now = new Date().getFullYear();
  const [year, setYear] = useState(String(now - 1));
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState("");
  return (
    <PageWrapper>
      <KCard>
        <KInfoBox variant="warning" title="Penting" items={[
          "Proses ini dilakukan hanya satu kali pada akhir tahun akuntansi. Jangan tutup tahun bila belum akhir tahun.",
          "Bila tahun sudah berganti tetapi belum tutup tahun, proses untuk tahun yang lalu tetap dapat dilakukan.",
          "Proses menutup transaksi dan memindahkan saldo akhir menjadi saldo awal periode tahun berikutnya.",
        ]} />
        <div className="max-w-[360px]">
          <KSelect label="Tahun yang ditutup" value={year} onChange={setYear} placeholder="Pilih tahun..." options={Array.from({ length: 6 }, (_, i) => ({ value: now - i, label: String(now - i) }))} />
          <button type="button" disabled={!year} onClick={() => setConfirm(true)} className="h-10 rounded bg-[#4caf50] px-6 text-white hover:bg-[#43a047] disabled:opacity-60">Proses</button>
          {done && <p className="mt-3 text-sm text-[#2e7d32]">{done}</p>}
        </div>
      </KCard>
      <ConfirmModal open={confirm} onClose={() => setConfirm(false)} onConfirm={() => { setConfirm(false); setDone(`Proses tutup tahun ${year} selesai (simulasi - endpoint backend belum tersedia).`); }} title="Proses Tutup Tahun" message={`Tutup tahun akuntansi ${year}? Proses ini tidak dapat dibatalkan.`} confirmText="Proses" variant="danger" />
    </PageWrapper>
  );
}
