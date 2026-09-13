"use client";

import { useState } from "react";
import { Download, Printer, Pencil, Copy, Search, ChevronUp, ChevronDown } from "lucide-react";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const mockSales = [
  { kode: "SLS001", nama: "Rudi Hartono", telepon: "081234567890", email: "rudi@email.com", totalTransaksi: 45, totalPenjualan: 125000000 },
  { kode: "SLS002", nama: "Siti Aminah", telepon: "081234567891", email: "siti@email.com", totalTransaksi: 38, totalPenjualan: 98000000 },
  { kode: "SLS003", nama: "Ahmad Dahlan", telepon: "081234567892", email: "ahmad@email.com", totalTransaksi: 52, totalPenjualan: 156000000 },
  { kode: "SLS004", nama: "Dewi Sartika", telepon: "081234567893", email: "dewi@email.com", totalTransaksi: 28, totalPenjualan: 72000000 },
];

export default function MasterSalesReportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("kode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredSales = mockSales.filter(s => !searchQuery || s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.kode.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => {
    const aVal = a[sortColumn as keyof typeof a];
    const bVal = b[sortColumn as keyof typeof b];
    if (typeof aVal === 'string' && typeof bVal === 'string') return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    if (typeof aVal === 'number' && typeof bVal === 'number') return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    return 0;
  });

  const SortButton = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <button onClick={() => { if (sortColumn === column) setSortDirection(d => d === 'asc' ? 'desc' : 'asc'); else { setSortColumn(column); setSortDirection('asc'); } }} className="flex items-center gap-1 hover:text-[#9C27B0] transition-colors">
      {children}{sortColumn === column && (sortDirection === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
    </button>
  );

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle title="Laporan / Daftar Sales" subtitle="Laporan data sales person" actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-gray-300"><Printer className="size-4 mr-2" /> Cetak</Button>
          <Button variant="outline" size="sm" className="border-gray-300"><Pencil className="size-4 mr-2" /> Disain</Button>
          <Button variant="outline" size="sm" className="border-gray-300"><Copy className="size-4 mr-2" /> Duplikat</Button>
          <Button variant="outline" size="sm" className="border-gray-300"><Download className="size-4 mr-2" /> Export</Button>
        </div>
      } />

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-4 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">Urutkan Kolom</label><Select value={sortColumn} onChange={(e) => setSortColumn(e.target.value)} options={["Kode", "Nama", "Total Transaksi", "Total Penjualan"]} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Arah</label><div className="flex gap-2"><Button color={sortDirection === 'asc' ? "primary" : "neutral"} variant="solid" size="sm" onClick={() => setSortDirection('asc')} className="flex-1"><ChevronUp className="size-4" /></Button><Button color={sortDirection === 'desc' ? "primary" : "neutral"} variant="solid" size="sm" onClick={() => setSortDirection('desc')} className="flex-1"><ChevronDown className="size-4" /></Button></div></div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" /><Input placeholder="Cari sales..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div></div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Sales</div><div className="text-xl font-bold text-gray-900">{filteredSales.length}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Transaksi</div><div className="text-xl font-bold text-gray-900">{filteredSales.reduce((acc, s) => acc + s.totalTransaksi, 0)}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Penjualan</div><div className="text-xl font-bold text-green-600">{formatCurrency(filteredSales.reduce((acc, s) => acc + s.totalPenjualan, 0))}</div></div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 text-left">
              <th className="px-4 py-3 font-medium"><SortButton column="kode">Kode</SortButton></th>
              <th className="px-4 py-3 font-medium"><SortButton column="nama">Nama</SortButton></th>
              <th className="px-4 py-3 font-medium">Telepon</th>
              <th className="px-4 py-3 font-medium text-right"><SortButton column="totalTransaksi">Total TRX</SortButton></th>
              <th className="px-4 py-3 font-medium text-right"><SortButton column="totalPenjualan">Total Penjualan</SortButton></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSales.map((s) => (
              <tr key={s.kode} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.kode}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{s.nama}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.telepon}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{s.totalTransaksi}</td>
                <td className="px-4 py-3 text-sm text-green-600 text-right font-medium">{formatCurrency(s.totalPenjualan)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
