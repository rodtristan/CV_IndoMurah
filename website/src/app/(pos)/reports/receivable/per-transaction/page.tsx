"use client";

import { useState } from "react";
import { Download, Printer, Pencil, Copy, Search } from "lucide-react";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const mockReceivableTransactions = [
  { noTransaksi: "TRX240912001", customer: "Andi Wijaya", tanggal: "12/09/2024", jatuhTempo: "19/09/2024", total: 943500, sudahBayar: 500000, sisaPiutang: 443500, status: "Piutang" },
  { noTransaksi: "TRX240911001", customer: "Budi Santoso", tanggal: "11/09/2024", jatuhTempo: "18/09/2024", total: 471750, sudahBayar: 200000, sisaPiutang: 271750, status: "Piutang" },
  { noTransaksi: "TRX240910001", customer: "CV Maju Jaya", tanggal: "10/09/2024", jatuhTempo: "17/09/2024", total: 1275000, sudahBayar: 1275000, sisaPiutang: 0, status: "Lunas" },
  { noTransaksi: "TRX240909001", customer: "PT Sumber Rezeki", tanggal: "09/09/2024", jatuhTempo: "16/09/2024", total: 749250, sudahBayar: 300000, sisaPiutang: 449250, status: "Piutang" },
];

export default function ReceivablePerTransactionReportPage() {
  const [noTransaksi, setNoTransaksi] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const filteredTransactions = mockReceivableTransactions.filter(t => {
    if (noTransaksi && !t.noTransaksi.toLowerCase().includes(noTransaksi.toLowerCase())) return false;
    if (selectedCustomer && t.customer !== selectedCustomer) return false;
    if (selectedStatus && t.status !== selectedStatus) return false;
    return true;
  });

  const totals = { total: filteredTransactions.reduce((acc, t) => acc + t.total, 0), sudahBayar: filteredTransactions.reduce((acc, t) => acc + t.sudahBayar, 0), sisaPiutang: filteredTransactions.reduce((acc, t) => acc + t.sisaPiutang, 0) };

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle title="Laporan / Buku Piutang Per Transaksi" subtitle="Laporan piutang per transaksi" actions={
        <div className="flex gap-2"><Button variant="outline" size="sm"><Printer className="size-4 mr-2" /> Cetak</Button><Button variant="outline" size="sm"><Pencil className="size-4 mr-2" /> Disain</Button><Button variant="outline" size="sm"><Copy className="size-4 mr-2" /> Duplikat</Button><Button variant="outline" size="sm"><Download className="size-4 mr-2" /> Export</Button></div>
      } />

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-5 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">No Transaksi</label><Input value={noTransaksi} onChange={(e) => setNoTransaksi(e.target.value)} placeholder="Semua" className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Pelanggan</label><Select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} options={["Semua", "Andi Wijaya", "Budi Santoso", "CV Maju Jaya"]} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Status Lunas</label><Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} options={["Semua", "Piutang", "Lunas"]} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Gudang</label><Select options={["Semua", "Gudang Utama"]} className="text-sm" /></div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Piutang</div><div className="text-xl font-bold text-orange-600">{formatCurrency(totals.total)}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Sudah Bayar</div><div className="text-xl font-bold text-green-600">{formatCurrency(totals.sudahBayar)}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Sisa Piutang</div><div className="text-xl font-bold text-red-600">{formatCurrency(totals.sisaPiutang)}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Jumlah Transaksi</div><div className="text-xl font-bold text-gray-900">{filteredTransactions.length}</div></div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50"><tr className="text-xs text-gray-500 text-left">
            <th className="px-4 py-3 font-medium">No Transaksi</th><th className="px-4 py-3 font-medium">Pelanggan</th><th className="px-4 py-3 font-medium">Tanggal</th><th className="px-4 py-3 font-medium">Jatuh Tempo</th>
            <th className="px-4 py-3 font-medium text-right">Total</th><th className="px-4 py-3 font-medium text-right">Sudah Bayar</th><th className="px-4 py-3 font-medium text-right">Sisa Piutang</th><th className="px-4 py-3 font-medium text-center">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTransactions.map((t) => (
              <tr key={t.noTransaksi} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.noTransaksi}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{t.customer}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{t.tanggal}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{t.jatuhTempo}</td>
                <td className="px-4 py-3 text-sm text-right">{formatCurrency(t.total)}</td>
                <td className="px-4 py-3 text-sm text-green-600 text-right">{formatCurrency(t.sudahBayar)}</td>
                <td className={cn("px-4 py-3 text-sm text-right font-medium", t.sisaPiutang > 0 ? "text-orange-600" : "text-gray-900")}>{formatCurrency(t.sisaPiutang)}</td>
                <td className="px-4 py-3 text-center"><span className={cn("inline-block px-2 py-0.5 text-xs font-medium rounded-full", t.status === "Lunas" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{t.status}</span></td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold"><td colSpan={4} className="px-4 py-3 text-sm">TOTAL</td><td className="px-4 py-3 text-sm text-right">{formatCurrency(totals.total)}</td><td className="px-4 py-3 text-sm text-green-600 text-right">{formatCurrency(totals.sudahBayar)}</td><td className="px-4 py-3 text-sm text-orange-600 text-right">{formatCurrency(totals.sisaPiutang)}</td><td></td></tr>
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
