"use client";

// Year Close - Tutup Tahun Buku

import { useEffect, useState } from "react";
import { Lock, Unlock, AlertTriangle } from "lucide-react";
import { KCard, KInfoBox, KRow, KSelect } from "@/components/kform";
import { KReadOnly, fmt, nowLocal } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface FiscalYear {
  year: number;
  startDate: string;
  endDate: string;
  isLocked: boolean;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export default function YearClosePage() {
  const [years, setYears] = useState<FiscalYear[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [closingDate, setClosingDate] = useState(nowLocal().split("T")[0]);
  const [createOpening, setCreateOpening] = useState(true);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadYears();
  }, []);

  const loadYears = async () => {
    setLoading(true);
    try {
      const r = await api.get<FiscalYear[]>("business-logic/accounting/fiscal-years");
      setYears(r.data || []);
      if (r.data && r.data.length > 0) {
        // Find first unlocked year
        const unlocked = r.data.find(y => !y.isLocked);
        if (unlocked) setSelectedYear(String(unlocked.year));
        else if (r.data.length > 0) setSelectedYear(String(r.data[0].year));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    if (!selectedYear) return;
    if (!confirm(`Tutup tahun ${selectedYear}? Actions cannot be undone.`)) return;

    setProcessing(true);
    setMessage(null);
    try {
      const r = await api.post("business-logic/accounting/year-close", {
        fiscalYear: parseInt(selectedYear),
        closingDate: closingDate,
        createOpeningEntries: createOpening,
      });
      if (r.success) {
        setMessage({ type: "success", text: r.message || `Tahun ${selectedYear} berhasil ditutup` });
        await loadYears();
      } else {
        setMessage({ type: "error", text: r.message || "Gagal menutup tahun" });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Terjadi kesalahan" });
    } finally {
      setProcessing(false);
    }
  };

  const selectedYearData = years.find(y => y.year === parseInt(selectedYear));
  const yearOpts = years.map(y => ({
    value: String(y.year),
    label: `${y.year} ${y.isLocked ? "(Tertutup)" : ""}`,
  }));

  return (
    <PageWrapper>
      <KCard>
        {message && (
          <div className={cn("mb-4 rounded px-4 py-3 text-sm", message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
            {message.text}
          </div>
        )}

        <KInfoBox variant="warning" title="Peringatan" items={[
          "Tutup tahun akan mengunci semua transaksi untuk tahun yang dipilih.",
          "Data yang sudah dikunci TIDAK DAPAT diedit atau dihapus.",
          "Pastikan semua jurnal dan transaksi sudah benar sebelum menutup tahun.",
          "Net income akan dipindahkan ke saldo laba ditahan (retained earnings).",
        ]} />

        {loading ? (
          <div className="py-8 text-center text-gray-500">Memuat data...</div>
        ) : years.length === 0 ? (
          <div className="py-8 text-center text-gray-500">Tidak ada data tahun fiskal</div>
        ) : (
          <>
            <KRow cols={3}>
              <KSelect label="Tahun Fiskal" value={selectedYear} onChange={setSelectedYear} options={yearOpts} />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal Penutupan</label>
                <input type="date" className="h-9 w-full rounded border border-[#cfd4da] px-3"
                  value={closingDate} onChange={e => setClosingDate(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="createOpening" checked={createOpening}
                  onChange={e => setCreateOpening(e.target.checked)} className="size-4" />
                <label htmlFor="createOpening" className="text-sm">Buat saldo awal tahun baru</label>
              </div>
            </KRow>

            {selectedYearData && (
              <div className="mt-6 overflow-hidden rounded-lg border border-[#c9d0d8]">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[#c9d0d8] bg-[#f5f6f8]">
                      <th colSpan={2} className="px-4 py-3 text-left font-semibold">Ringkasan Tahun {selectedYearData.year}</th>
                      <th className="px-4 py-3 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceff2]">
                    <tr>
                      <td className="px-4 py-2 text-gray-600">Total Pendapatan</td>
                      <td className="px-4 py-2 text-right font-medium text-green-600">{fmt(selectedYearData.totalRevenue)}</td>
                      <td rowSpan={4} className="px-4 py-2 text-center align-middle">
                        {selectedYearData.isLocked ? (
                          <span className="inline-flex items-center gap-1 rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            <Lock className="size-4" /> Tertutup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            <Unlock className="size-4" /> Terbuka
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-600">Total Beban</td>
                      <td className="px-4 py-2 text-right font-medium text-red-600">{fmt(selectedYearData.totalExpenses)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-600">Laba/Rugi Bersih</td>
                      <td className={cn("px-4 py-2 text-right font-bold text-lg", selectedYearData.netIncome >= 0 ? "text-green-600" : "text-red-600")}>
                        {fmt(selectedYearData.netIncome)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-600">Periode</td>
                      <td className="px-4 py-2 text-right">
                        {new Date(selectedYearData.startDate).toLocaleDateString("id-ID")} - {new Date(selectedYearData.endDate).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {!selectedYearData?.isLocked && selectedYearData && (
              <div className="mt-6 flex items-center justify-end gap-3">
                <button type="button" onClick={() => void handleClose()} disabled={processing}
                  className="inline-flex h-10 items-center gap-2 rounded bg-[#f44336] px-6 text-white hover:bg-[#e53935] disabled:opacity-60">
                  {processing ? "Memproses..." : "Tutup Tahun"}
                </button>
              </div>
            )}
          </>
        )}
      </KCard>
    </PageWrapper>
  );
}
