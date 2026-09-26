"use client";

// Point Penjualan Ketoko: periode + pelanggan → Saldo Awal (SA), point per faktur (JL) dan
// pengambilan point (AP). Sisa Point di bawah, tombol Ambil Poin / Hapus Ambil Point.

import { useCallback, useState } from "react";
import { Plus, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { cn, formatNumber, localDate, localDateTime } from "@/lib/utils";
import { usePageTitle } from "@/lib/page-title";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { KCard, KInput, KTextarea } from "@/components/kform";
import { PartnerLookup } from "@/components/transaction/PartnerLookup";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/Loader";

type Rec = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const firstOfMonth = () => { const d = new Date(); d.setDate(1); return localDate(d); };
const lastOfMonth = () => { const d = new Date(); d.setMonth(d.getMonth() + 1, 0); return localDate(d); };

export default function SalePointsPage() {
  usePageTitle("Point Penjualan");
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(lastOfMonth());
  const [customer, setCustomer] = useState<{ id: number; name: string; code: string } | null>(null);
  const [data, setData] = useState<{ rows: Rec[]; closing: number } | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showTake, setShowTake] = useState(false);
  const [take, setTake] = useState({ date: localDateTime(new Date()), points: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!customer) { toast.error("Pilih pelanggan terlebih dahulu"); return; }
    setLoading(true);
    try {
      const r = await api.get<Rec>("point-redemption/ledger", { customerId: customer.id, from, to }, { skipCache: true });
      setData({ rows: r.data?.rows ?? [], closing: Number(r.data?.closing ?? 0) });
      setSelected("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat point");
    } finally { setLoading(false); }
  }, [customer, from, to]);

  const saveTake = async () => {
    if (!customer) return;
    const pts = Math.floor(Number(take.points));
    if (!(pts > 0)) { toast.error("Jumlah point diambil harus lebih dari 0"); return; }
    setSaving(true);
    try {
      await api.post("point-redemption", { customerId: customer.id, pointsRedeemed: pts, date: new Date(take.date).toISOString(), notes: take.notes || undefined });
      toast.success("Point diambil");
      setShowTake(false);
      setTake({ date: localDateTime(new Date()), points: "", notes: "" });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const removeTake = async () => {
    const row = data?.rows.find((r) => r.Key === selected);
    if (!row || row.Type !== "AP") { toast.error("Pilih baris Ambil Point (AP) yang akan dihapus"); return; }
    if (!window.confirm(`Hapus ambil point ${row.Code}?`)) return;
    try {
      await api.delete("point-redemption", String(row.ID));
      toast.success("Ambil point dihapus");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus");
    }
  };

  return (
    <PageWrapper>
      <KCard>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <KInput label="Tanggal Dari" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <KInput label="Tanggal Sampai" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <PartnerLookup label="Pelanggan" endpoint="customer" value={customer?.name ?? ""}
            onPick={(p) => setCustomer({ id: Number(p.value), name: p.label, code: String(p.row.Code ?? "") })} onClear={() => { setCustomer(null); setData(null); }} />
        </div>
        <button type="button" disabled={loading} onClick={() => void load()} className="inline-flex h-10 items-center gap-2 rounded bg-[#4caf50] px-5 text-sm text-white hover:bg-[#43a047] disabled:opacity-60">
          <Settings className="size-4" /> Proses
        </button>
      </KCard>

      <div className="mt-3 overflow-x-auto rounded border border-[#d5d9de] bg-white">
        {loading ? <LoadingState className="py-16" /> : (
          <table className="w-full min-w-[800px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#d5d9de] bg-[#f5f6f8] text-left">
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">No Transaksi</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Tipe Transaksi</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Tanggal</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 text-right font-normal">Total Transaksi</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 text-right font-normal">Point Transaksi</th>
                <th className="px-2 py-2 font-normal">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {!data?.rows.length ? (
                <tr><td colSpan={6} className="h-40 text-center text-[#9aa3ad]">{data ? "No data" : "Atur periode & pelanggan lalu klik Proses"}</td></tr>
              ) : data.rows.map((r) => (
                <tr key={r.Key} onClick={() => setSelected(r.Key)} className={cn("cursor-pointer border-b border-[#eef0f2]", selected === r.Key ? "bg-[#cfe0ee]" : "hover:bg-[#f7fafc]")}>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5">{r.Code}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5">{r.Type}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5">{r.Date ? new Date(r.Date).toLocaleString("id-ID") : ""}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5 text-right">{formatNumber(Number(r.TotalTransaction ?? 0), 2)}</td>
                  <td className={cn("border-r border-[#eef0f2] px-2 py-1.5 text-right", Number(r.Points) < 0 && "text-danger")}>{formatNumber(Number(r.Points ?? 0), 2)}</td>
                  <td className="px-2 py-1.5">{r.Notes ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <KCard className="mt-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[16px] font-bold">Sisa Point :</span>
          <div className="flex h-10 w-48 items-center justify-end rounded border border-dashed border-[#cfd4da] px-3 text-[17px]">{formatNumber(data?.closing ?? 0, 2)}</div>
          <button type="button" disabled={!customer} onClick={() => setShowTake(true)} className="inline-flex h-10 items-center gap-2 rounded border border-[#f3b6b6] bg-[#fde0e0] px-5 text-sm disabled:opacity-50">
            <Plus className="size-4" /> Ambil Poin
          </button>
          <button type="button" disabled={!selected} onClick={() => void removeTake()} className="inline-flex h-10 items-center gap-2 rounded bg-[#d9534f] px-5 text-sm text-white disabled:opacity-50">
            <Trash2 className="size-4" /> Hapus Ambil Point
          </button>
        </div>
      </KCard>

      <Modal open={showTake} onClose={() => setShowTake(false)} title="Ambil Point" size="md">
        <div className="space-y-1">
          <KInput label="No Transaksi" value="(Auto Number)" readOnly className="border-dashed bg-[#f7f8fa]" />
          <KInput label="Pelanggan" value={customer?.code || customer?.name || ""} readOnly className="border-dashed bg-[#f7f8fa]" />
          <KInput label="Periode" value={`${from} s/d ${to}`} readOnly className="border-dashed bg-[#f7f8fa]" />
          <KInput label="Tanggal" type="datetime-local" value={take.date} onChange={(e) => setTake({ ...take, date: e.target.value })} />
          <KInput label="Jumlah Point Diambil" type="number" min={0} value={take.points} onChange={(e) => setTake({ ...take, points: e.target.value })} className="text-right" />
          <KTextarea label="Keterangan" rows={2} value={take.notes} onChange={(e) => setTake({ ...take, notes: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <button type="button" disabled={saving} onClick={() => void saveTake()} className="h-10 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6]">✔ Simpan</button>
            <button type="button" onClick={() => setShowTake(false)} className="h-10 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6]">Kembali</button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
