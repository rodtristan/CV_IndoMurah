"use client";

import { useState } from "react";
import { Download, Printer, Pencil, Copy } from "lucide-react";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const mockReceivableLedger: Record<string, { tanggal: string; noTransaksi: string; keterangan: string; debet: number; kredit: number; saldo: number }[]> = {
  "Andi Wijaya": [
    { tanggal: "12/09/2024", noTransaksi: "TRX240912001", keterangan: "Penjualan Barang", debet: 0, kredit: 943500, saldo: 943500 },
    { tanggal: "15/09/2024", noTransaksi: "BYR240915001", keterangan: "Pembayaran Piutang", debet: 500000, kredit: 0, saldo: 443500 },
  ],
  "Budi Santoso": [
    { tanggal: "11/09/2024", noTransaksi: "TRX240911001", keterangan: "Penjualan Barang", debet: 0, kredit: 471750, saldo: 471750 },
    { tanggal: "14/09/2024", noTransaksi: "BYR240914001", keterangan: "Pembayaran Piutang", debet: 200000, kredit: 0, saldo: 271750 },
  ],
  "CV Maju Jaya": [
    { tanggal: "10/09/2024", noTransaksi: "TRX240910001", keterangan: "Penjualan Barang", debet: 0, kredit: 1275000, saldo: 1275000 },
    { tanggal: "12/09/2024", noTransaksi: "BYR240912001", keterangan: "Pembayaran Piutang", debet: 1275000, kredit: 0, saldo: 0 },
  ],
};

export default function ReceivableSubLedgerReportPage() {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [dateTo, setDateTo] = useState("30/09/2024");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const customers = Object.keys(mockReceivableLedger);
  const getTotalSaldo = () => customers.reduce((total, c) => total + (mockReceivableLedger[c]?.[mockReceivableLedger[c].length - 1]?.saldo || 0), 0);
  const getTotalKredit = () => customers.reduce((total, c) => total + mockReceivableLedger[c].reduce((t, e) => t + e.kredit, 0), 0);

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle title="Laporan / Buku Bantu Piutang" subtitle="Laporan piutang per pelanggan" actions={
        <div className="flex gap-2"><Button variant="outline" size="sm"><Printer className="size-4 mr-2" /> Cetak</Button><Button variant="outline" size="sm"><Pencil className="size-4 mr-2" /> Disain</Button><Button variant="outline" size="sm"><Copy className="size-4 mr-2" /> Duplikat</Button><Button variant="outline" size="sm"><Download className="size-4 mr-2" /> Export</Button></div>
      } />

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">Sampai Tanggal</label><Input value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Pelanggan</label><Select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} options={["Semua", ...customers]} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Gudang</label><Select options={["Semua", "Gudang Utama"]} className="text-sm" /></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Sisa Piutang</div><div className="text-xl font-bold text-orange-600">{formatCurrency(getTotalSaldo())}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Penjualan</div><div className="text-xl font-bold text-green-600">{formatCurrency(getTotalKredit())}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Jumlah Pelanggan</div><div className="text-xl font-bold text-gray-900">{customers.length}</div></div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50"><tr className="text-xs text-gray-500 text-left"><th className="px-4 py-3 font-medium w-10"></th><th className="px-4 py-3 font-medium">Pelanggan</th><th className="px-4 py-3 font-medium text-right">Saldo</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((customer) => {
              const entries = mockReceivableLedger[customer];
              const lastSaldo = entries?.[entries.length - 1]?.saldo || 0;
              const isExpanded = expandedCustomer === customer;
              return (
                <>
                  <tr key={customer} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedCustomer(isExpanded ? null : customer)}>
                    <td className="px-4 py-3"><span className={cn("text-gray-400 transition-transform inline-block", isExpanded && "rotate-90")}>▶</span></td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer}</td>
                    <td className={cn("px-4 py-3 text-sm text-right font-medium", lastSaldo > 0 ? "text-orange-600" : "text-green-600")}>{formatCurrency(lastSaldo)}</td>
                  </tr>
                  {isExpanded && entries.map((entry, idx) => (
                    <tr key={`${customer}-${idx}`} className="bg-gray-50">
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"><div className="pl-4 space-y-1"><div className="text-xs text-gray-500"><span className="text-gray-400">{entry.tanggal}</span> • {entry.noTransaksi}</div><div className="text-sm text-gray-700">{entry.keterangan}</div></div></td>
                      <td className="px-4 py-3 text-sm text-right"><span className="text-gray-500 mr-4">{entry.debet > 0 ? formatCurrency(entry.debet) : '-'}</span><span className="text-green-600 mr-4">{entry.kredit > 0 ? formatCurrency(entry.kredit) : '-'}</span><span className={entry.saldo > 0 ? "text-orange-600" : "text-gray-900"}>{formatCurrency(entry.saldo)}</span></td>
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold"><tr><td colSpan={2} className="px-4 py-3 text-sm">TOTAL</td><td className="px-4 py-3 text-sm text-orange-600 text-right">{formatCurrency(getTotalSaldo())}</td></tr></tfoot>
        </table>
      </div>
    </PageWrapper>
  );
}
