"use client";

import { useState } from "react";
import { Download, Printer, Pencil, Copy, Search, ChevronUp, ChevronDown } from "lucide-react";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const mockSales = [
  { no: "TRX240912001", tanggal: "12/09/2024", customer: "Andi Wijaya", sales1: "Rudi Hartono", gudang: "Gudang Utama", subtotal: 850000, diskon: 0, pajak: 93500, total: 943500 },
  { no: "TRX240912002", tanggal: "12/09/2024", customer: "Budi Santoso", sales1: "Siti Aminah", gudang: "Gudang Utama", subtotal: 450000, diskon: 25000, pajak: 46750, total: 471750 },
  { no: "TRX240911001", tanggal: "11/09/2024", customer: "CV Maju Jaya", sales1: "Ahmad Dahlan", gudang: "Gudang Utama", subtotal: 1200000, diskon: 50000, pajak: 126500, total: 1275000 },
  { no: "TRX240910001", tanggal: "10/09/2024", customer: "PT Sumber Rezeki", sales1: "Dewi Sartika", gudang: "Gudang Utama", subtotal: 675000, diskon: 0, pajak: 74250, total: 749250 },
];

export default function SaleTransactionsReportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedSales1, setSelectedSales1] = useState("");
  const [selectedGudang, setSelectedGudang] = useState("");
  const [sortColumn, setSortColumn] = useState("tanggal");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredSales = mockSales.filter(s => {
    if (searchQuery && !s.no.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCustomer && s.customer !== selectedCustomer) return false;
    if (selectedSales1 && s.sales1 !== selectedSales1) return false;
    if (selectedGudang && s.gudang !== selectedGudang) return false;
    return true;
  }).sort((a, b) => {
    const aVal = a[sortColumn as keyof typeof a];
    const bVal = b[sortColumn as keyof typeof b];
    if (typeof aVal === 'string' && typeof bVal === 'string') return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    if (typeof aVal === 'number' && typeof bVal === 'number') return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    return 0;
  });

  const totals = { subtotal: filteredSales.reduce((acc, s) => acc + s.subtotal, 0), diskon: filteredSales.reduce((acc, s) => acc + s.diskon, 0), pajak: filteredSales.reduce((acc, s) => acc + s.pajak, 0), total: filteredSales.reduce((acc, s) => acc + s.total, 0) };

  const SortButton = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <button onClick={() => { if (sortColumn === column) setSortDirection(d => d === 'asc' ? 'desc' : 'asc'); else { setSortColumn(column); setSortDirection('asc'); } }} className="flex items-center gap-1 hover:text-[#9C27B0]">
      {children}{sortColumn === column && (sortDirection === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
    </button>
  );

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle title="Laporan / Penjualan" subtitle="Laporan transaksi penjualan" actions={
        <div className="flex gap-2"><Button variant="outline" size="sm"><Printer className="size-4 mr-2" /> Cetak</Button><Button variant="outline" size="sm"><Pencil className="size-4 mr-2" /> Disain</Button><Button variant="outline" size="sm"><Copy className="size-4 mr-2" /> Duplikat</Button><Button variant="outline" size="sm"><Download className="size-4 mr-2" /> Export</Button></div>
      } />

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-5 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">Pelanggan</label><Select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} options={["Semua", "Andi Wijaya", "Budi Santoso", "CV Maju Jaya"]} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Sales 1</label><Select value={selectedSales1} onChange={(e) => setSelectedSales1(e.target.value)} options={["Semua", "Rudi Hartono", "Siti Aminah", "Ahmad Dahlan", "Dewi Sartika"]} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Gudang</label><Select value={selectedGudang} onChange={(e) => setSelectedGudang(e.target.value)} options={["Semua", "Gudang Utama"]} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Urutkan</label><Select value={sortColumn} onChange={(e) => setSortColumn(e.target.value)} options={["Tanggal", "No Transaksi", "Total"]} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Arah</label><div className="flex gap-2"><Button color={sortDirection === 'asc' ? "primary" : "neutral"} variant="solid" size="sm" onClick={() => setSortDirection('asc')}><ChevronUp className="size-4" /></Button><Button color={sortDirection === 'desc' ? "primary" : "neutral"} variant="solid" size="sm" onClick={() => setSortDirection('desc')}><ChevronDown className="size-4" /></Button></div></div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" /><Input placeholder="Cari nomor transaksi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div></div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Penjualan</div><div className="text-xl font-bold text-green-600">{formatCurrency(totals.total)}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Jumlah Transaksi</div><div className="text-xl font-bold text-gray-900">{filteredSales.length}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Diskon</div><div className="text-xl font-bold text-red-600">{formatCurrency(totals.diskon)}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Pajak</div><div className="text-xl font-bold text-gray-900">{formatCurrency(totals.pajak)}</div></div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50"><tr className="text-xs text-gray-500 text-left">
            <th className="px-4 py-3 font-medium"><SortButton column="no">No Transaksi</SortButton></th>
            <th className="px-4 py-3 font-medium"><SortButton column="tanggal">Tanggal</SortButton></th>
            <th className="px-4 py-3 font-medium">Pelanggan</th>
            <th className="px-4 py-3 font-medium">Sales 1</th>
            <th className="px-4 py-3 font-medium text-right">Subtotal</th>
            <th className="px-4 py-3 font-medium text-right">Diskon</th>
            <th className="px-4 py-3 font-medium text-right">Pajak</th>
            <th className="px-4 py-3 font-medium text-right"><SortButton column="total">Total</SortButton></th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSales.map((s) => (
              <tr key={s.no} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.no}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.tanggal}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{s.customer}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.sales1}</td>
                <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatCurrency(s.subtotal)}</td>
                <td className="px-4 py-3 text-sm text-red-600 text-right">{formatCurrency(s.diskon)}</td>
                <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatCurrency(s.pajak)}</td>
                <td className="px-4 py-3 text-sm text-green-600 text-right font-medium">{formatCurrency(s.total)}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td colSpan={4} className="px-4 py-3 text-sm">TOTAL</td>
              <td className="px-4 py-3 text-sm text-right">{formatCurrency(totals.subtotal)}</td>
              <td className="px-4 py-3 text-sm text-red-600 text-right">{formatCurrency(totals.diskon)}</td>
              <td className="px-4 py-3 text-sm text-right">{formatCurrency(totals.pajak)}</td>
              <td className="px-4 py-3 text-sm text-green-600 text-right">{formatCurrency(totals.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
