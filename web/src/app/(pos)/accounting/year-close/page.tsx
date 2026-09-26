"use client";

// Year Close - Tutup Tahun Buku.
// Satu-satunya implementasi: GET /fiscal-year + POST /fiscal-year/close (FiscalYearClose + satu jurnal YEAR_CLOSE
// yang menutup akun pendapatan/biaya ke Laba Ditahan). Saldo neraca otomatis terbawa ke tahun berikutnya dari jurnal,
// jadi tidak ada saldo awal tahun baru yang dibuat terpisah.

import { useEffect, useState } from "react";
import { Lock, Unlock, AlertTriangle } from "lucide-react";
import { KCard, KInfoBox, KRow, KSelect } from "@/components/kform";
import { KReadOnly, fmt } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/ui/Loader";

interface FiscalYear {
  year: number;
  startDate: string;
  endDate: string;
  finished: boolean;
  closed: boolean;
  closedAt: string | null;
  journalCode: string | null;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}
interface FiscalStatus { currentYear: number; retainedAccountID: number | null; years: FiscalYear[] }

export default function YearClosePage() {
  const [years, setYears] = useState<FiscalYear[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [retainedSet, setRetainedSet] = useState(true);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadYears();
  }, []);

  const loadYears = async () => {
    setLoading(true);
    try {
      const r = await api.request<FiscalStatus>("GET", "fiscal-year");
      const list = r.data?.years ?? [];
      setYears(list);
      setRetainedSet(!!r.data?.retainedAccountID);
      // oldest finished year that is still open, else the newest year
      const open = [...list].reverse().find((y) => y.finished && !y.closed);
      setSelectedYear(String((open ?? list[0])?.year ?? ""));
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
      const r = await api.request<{ year: number; netIncome: number; journalCode: string | null }>("POST", "fiscal-year/close", { year: parseInt(selectedYear) });
      if (r.success) {
        setMessage({ type: "success", text: `Tahun ${selectedYear} berhasil ditutup${r.data?.journalCode ? ` (jurnal ${r.data.journalCode})` : ""}.` });
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
    label: `${y.year} ${y.closed ? "(Tertutup)" : !y.finished ? "(Berjalan)" : ""}`,
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
          "Laba/rugi bersih dipindahkan ke akun Laba Ditahan (Setting Perkiraan) lewat jurnal penutup 31 Desember.",
          "Hanya tahun yang sudah berakhir yang dapat ditutup.",
        ]} />
        {!retainedSet && <div className="mb-4 rounded bg-red-50 px-4 py-3 text-sm text-red-700">Setting Perkiraan &quot;Laba Ditahan&quot; belum diisi. Lengkapi dulu di menu Setting Perkiraan.</div>}

        {loading ? (
          <LoadingState />
        ) : years.length === 0 ? (
          <div className="py-8 text-center text-gray-500">Tidak ada data tahun fiskal</div>
        ) : (
          <>
            <KRow cols={3}>
              <KSelect label="Tahun Fiskal" value={selectedYear} onChange={setSelectedYear} options={yearOpts} />
              <KReadOnly label="Tanggal Penutupan" value={selectedYear ? `31-12-${selectedYear}` : "-"} />
              <KReadOnly label="Jurnal Penutup" value={selectedYearData?.journalCode ?? "-"} />
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
                        {selectedYearData.closed ? (
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

            {selectedYearData && !selectedYearData.closed && selectedYearData.finished && (
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
