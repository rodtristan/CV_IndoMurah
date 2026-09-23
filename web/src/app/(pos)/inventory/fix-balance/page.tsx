"use client";

// Proses Perbaikan Saldo: sinkronisasi stok dengan kartu stok per Dept/Gudang.
// TODO backend: no endpoint yet - the button only simulates the run (UI complete).

import { useMemo, useState } from "react";
import { KCard, KInfoBox, KSelect } from "@/components/kform";
import { useList } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function FixBalancePage() {
  const warehouses = useList("warehouse");
  const [warehouseId, setWarehouseId] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");
  const opts = useMemo(() => warehouses.map((w) => ({ value: w.ID, label: `${w.Code} - ${w.Name}` })), [warehouses]);
  const run = () => {
    setBusy(true); setDone("");
    setTimeout(() => { setBusy(false); setDone("Proses perbaikan saldo selesai (simulasi - endpoint backend belum tersedia)."); }, 800);
  };
  return (
    <PageWrapper>
      <KCard>
        <KInfoBox variant="warning" title="Penting" items={[
          "Proses ini menghitung ulang data persediaan agar Saldo Stok sesuai dengan Kartu Stok.",
          "Lakukan saat tidak ada aktivitas / toko tutup.",
        ]} />
        <div className="max-w-[480px]">
          <KSelect label="Dept/Gudang" value={warehouseId} onChange={setWarehouseId} options={opts} placeholder="Semua Gudang" />
          <button type="button" onClick={run} disabled={busy} className="h-10 rounded bg-[#4caf50] px-6 text-white hover:bg-[#43a047] disabled:opacity-60">{busy ? "Memproses..." : "Proses"}</button>
          {done && <p className="mt-3 text-sm text-[#2e7d32]">{done}</p>}
        </div>
      </KCard>
    </PageWrapper>
  );
}
