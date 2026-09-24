"use client";

// Proses Perbaikan Saldo: hitung ulang saldo stok dari mutasi (kartu stok), pratinjau lalu proses.

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { KCard, KInfoBox, KSelect } from "@/components/kform";
import { useList } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { api } from "@/lib/api-client";

interface BalanceRow {
  productId: number; code: string; name: string; oldBalance: number; newBalance: number; difference: number;
}
interface Preview { scanned: number; changed: number; rows: BalanceRow[] }

const fmt = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 3 });

export default function FixBalancePage() {
  const warehouses = useList("warehouse");
  const [warehouseId, setWarehouseId] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [done, setDone] = useState("");
  const opts = useMemo(() => warehouses.map((w) => ({ value: w.ID, label: `${w.Code} - ${w.Name}` })), [warehouses]);
  const body = () => ({ warehouseId: warehouseId ? Number(warehouseId) : undefined });

  const doPreview = async () => {
    setBusy(true); setDone(""); setPreview(null);
    try {
      const res = await api.post<Preview>("stock-balance/preview", body());
      setPreview(res.data as Preview);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Gagal menghitung saldo"); } finally { setBusy(false); }
  };

  const doApply = async () => {
    if (!preview || preview.rows.length === 0) return;
    if (!window.confirm(`Perbaiki saldo ${preview.rows.length} item? Data stok akan diubah.`)) return;
    setBusy(true);
    try {
      const res = await api.post<{ updated: number }>("stock-balance/apply", body());
      const n = (res.data as { updated: number }).updated;
      setDone(`Proses perbaikan saldo selesai: ${n} item diperbarui.`);
      setPreview(null);
      toast.success("Saldo stok diperbaiki");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Proses gagal"); } finally { setBusy(false); }
  };

  return (
    <PageWrapper>
      <KCard>
        <KInfoBox variant="warning" title="Penting" items={[
          "Proses ini menghitung ulang Saldo Stok dari mutasi (Stok Masuk/Keluar, Mutasi, Opname, Pembelian, Penjualan, Retur) agar sesuai Kartu Stok.",
          "Item tanpa mutasi tidak diubah, karena saldo awal yang diinput langsung tidak tercatat sebagai mutasi.",
          "Lakukan saat tidak ada aktivitas / toko tutup.",
        ]} />
        <div className="max-w-[480px]">
          <KSelect label="Dept/Gudang" value={warehouseId} onChange={(v) => { setWarehouseId(v); setPreview(null); }} options={opts} placeholder="Semua Gudang" />
          <div className="flex gap-2">
            <button type="button" onClick={doPreview} disabled={busy} className="h-10 rounded border border-[#4caf50] px-6 text-[#2e7d32] hover:bg-[#f1f8f1] disabled:opacity-60">{busy && !preview ? "Menghitung..." : "Pratinjau"}</button>
            <button type="button" onClick={doApply} disabled={busy || !preview || preview.rows.length === 0} className="h-10 rounded bg-[#4caf50] px-6 text-white hover:bg-[#43a047] disabled:opacity-60">{busy && preview ? "Memproses..." : "Proses"}</button>
          </div>
          {done && <p className="mt-3 text-sm text-[#2e7d32]">{done}</p>}
        </div>
        {preview && (
          <div className="mt-4">
            <p className="mb-2 text-sm">{preview.scanned} item bermutasi diperiksa, {preview.changed} item saldo berbeda.</p>
            {preview.rows.length > 0 && (
              <div className="max-h-[420px] overflow-auto rounded border border-[#d5d9de]">
                <table className="w-full text-[13px]">
                  <thead className="sticky top-0 bg-[#f7f8fa]"><tr>
                    <th className="p-2 text-left">Kode</th><th className="p-2 text-left">Nama Item</th>
                    <th className="p-2 text-right">Saldo Lama</th><th className="p-2 text-right">Saldo Baru</th><th className="p-2 text-right">Selisih</th>
                  </tr></thead>
                  <tbody>{preview.rows.map((r) => (
                    <tr key={r.productId} className="border-t border-[#eceff2]">
                      <td className="p-2">{r.code}</td><td className="p-2">{r.name}</td>
                      <td className="p-2 text-right">{fmt(r.oldBalance)}</td><td className="p-2 text-right">{fmt(r.newBalance)}</td>
                      <td className={`p-2 text-right ${r.difference < 0 ? "text-danger" : "text-[#2e7d32]"}`}>{fmt(r.difference)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </KCard>
    </PageWrapper>
  );
}
