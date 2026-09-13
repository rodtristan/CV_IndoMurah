"use client";

import { useState } from "react";
import { Download, Printer, Pencil, Copy } from "lucide-react";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const mockDebtLedger: Record<string, { tanggal: string; noTransaksi: string; keterangan: string; debet: number; kredit: number; saldo: number }[]> = {
  "PT Sentosa Jaya": [
    { tanggal: "01/09/2024", noTransaksi: "PO240901001", keterangan: "Pembelian Barang", debet: 1400000, kredit: 0, saldo: 1400000 },
    { tanggal: "05/09/2024", noTransaksi: "BYR240905001", keterangan: "Pembayaran Hutang", debet: 700000, kredit: 0, saldo: 700000 },
    { tanggal: "10/09/2024", noTransaksi: "BYR240910001", keterangan: "Pembayaran Hutang", debet: 400000, kredit: 0, saldo: 300000 },
  ],
  "CV Maju Bersama": [
    { tanggal: "03/09/2024", noTransaksi: "PO240903001", keterangan: "Pembelian Barang", debet: 1300000, kredit: 0, saldo: 1300000 },
    { tanggal: "08/09/2024", noTransaksi: "BYR240908001", keterangan: "Pembayaran Hutang", debet: 500000, kredit: 0, saldo: 800000 },
  ],
};

export default function DebtSubLedgerReportPage() {
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [dateTo, setDateTo] = useState("30/09/2024");
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);

  const suppliers = Object.keys(mockDebtLedger);
  const getTotalSaldo = () => suppliers.reduce((total, s) => total + (mockDebtLedger[s]?.[mockDebtLedger[s].length - 1]?.saldo || 0), 0);
  const getTotalDebet = () => suppliers.reduce((total, s) => total + mockDebtLedger[s].reduce((t, e) => t + e.debet, 0), 0);

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle title="Laporan / Buku Bantu Hutang" subtitle="Laporan piutang per supplier" actions={
        <div className="flex gap-2"><Button variant="outline" size="sm"><Printer className="size-4 mr-2" /> Cetak</Button><Button variant="outline" size="sm"><Pencil className="size-4 mr-2" /> Disain</Button><Button variant="outline" size="sm"><Copy className="size-4 mr-2" /> Duplikat</Button><Button variant="outline" size="sm"><Download className="size-4 mr-2" /> Export</Button></div>
      } />

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">Sampai Tanggal</label><Input value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Supplier</label><Select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} options={["Semua", ...suppliers]} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Gudang</label><Select options={["Semua", "Gudang Utama"]} className="text-sm" /></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Sisa Hutang</div><div className="text-xl font-bold text-red-600">{formatCurrency(getTotalSaldo())}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Pembayaran</div><div className="text-xl font-bold text-green-600">{formatCurrency(getTotalDebet())}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Jumlah Supplier</div><div className="text-xl font-bold text-gray-900">{suppliers.length}</div></div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50"><tr className="text-xs text-gray-500 text-left"><th className="px-4 py-3 font-medium w-10"></th><th className="px-4 py-3 font-medium">Supplier</th><th className="px-4 py-3 font-medium text-right">Saldo</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {suppliers.map((supplier) => {
              const entries = mockDebtLedger[supplier];
              const lastSaldo = entries?.[entries.length - 1]?.saldo || 0;
              const isExpanded = expandedSupplier === supplier;
              return (
                <>
                  <tr key={supplier} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedSupplier(isExpanded ? null : supplier)}>
                    <td className="px-4 py-3"><span className={cn("text-gray-400 transition-transform inline-block", isExpanded && "rotate-90")}>▶</span></td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{supplier}</td>
                    <td className={cn("px-4 py-3 text-sm text-right font-medium", lastSaldo > 0 ? "text-red-600" : "text-green-600")}>{formatCurrency(lastSaldo)}</td>
                  </tr>
                  {isExpanded && entries.map((entry, idx) => (
                    <tr key={`${supplier}-${idx}`} className="bg-gray-50">
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"><div className="pl-4 space-y-1"><div className="text-xs text-gray-500"><span className="text-gray-400">{entry.tanggal}</span> • {entry.noTransaksi}</div><div className="text-sm text-gray-700">{entry.keterangan}</div></div></td>
                      <td className="px-4 py-3 text-sm text-right"><span className="text-green-600 mr-4">{entry.debet > 0 ? formatCurrency(entry.debet) : '-'}</span><span className={entry.saldo > 0 ? "text-red-600" : "text-gray-900"}>{formatCurrency(entry.saldo)}</span></td>
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold"><tr><td colSpan={2} className="px-4 py-3 text-sm">TOTAL</td><td className="px-4 py-3 text-sm text-red-600 text-right">{formatCurrency(getTotalSaldo())}</td></tr></tfoot>
        </table>
      </div>
    </PageWrapper>
  );
}
