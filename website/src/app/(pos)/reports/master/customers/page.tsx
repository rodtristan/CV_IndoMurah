"use client";

import { useState } from "react";
import { Download, Printer, Pencil, Copy, Search, ChevronUp, ChevronDown } from "lucide-react";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const mockCustomers = [
  { kode: "CUS001", nama: "Andi Wijaya", grup: "Gold", wilayah: "Jakarta", telepon: "081234567890", piutang: 443500, poin: 1500 },
  { kode: "CUS002", nama: "Budi Santoso", grup: "Silver", wilayah: "Bandung", telepon: "081234567891", piutang: 271750, poin: 750 },
  { kode: "CUS003", nama: "CV Maju Jaya", grup: "Platinum", wilayah: "Surabaya", telepon: "081234567892", piutang: 0, poin: 5000 },
  { kode: "CUS004", nama: "PT Sumber Rezeki", grup: "Gold", wilayah: "Medan", telepon: "081234567893", piutang: 449250, poin: 2000 },
];

export default function MasterCustomersReportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrup, setSelectedGrup] = useState("");
  const [selectedWilayah, setSelectedWilayah] = useState("");
  const [sortColumn, setSortColumn] = useState("kode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredCustomers = mockCustomers.filter(c => {
    if (searchQuery && !c.nama.toLowerCase().includes(searchQuery.toLowerCase()) && !c.kode.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedGrup && c.grup !== selectedGrup) return false;
    if (selectedWilayah && c.wilayah !== selectedWilayah) return false;
    return true;
  }).sort((a, b) => {
    const aVal = a[sortColumn as keyof typeof a];
    const bVal = b[sortColumn as keyof typeof b];
    if (typeof aVal === 'string' && typeof bVal === 'string') return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    if (typeof aVal === 'number' && typeof bVal === 'number') return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    return 0;
  });

  const getGrupBadgeColor = (grup: string) => ({ Platinum: "bg-purple-100 text-purple-700", Gold: "bg-yellow-100 text-yellow-700", Silver: "bg-gray-100 text-gray-700", Regular: "bg-blue-100 text-blue-700" }[grup] || "bg-gray-100 text-gray-700");

  const SortButton = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <button onClick={() => { if (sortColumn === column) setSortDirection(d => d === 'asc' ? 'desc' : 'asc'); else { setSortColumn(column); setSortDirection('asc'); } }} className="flex items-center gap-1 hover:text-[#9C27B0] transition-colors">
      {children}{sortColumn === column && (sortDirection === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
    </button>
  );

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle title="Laporan / Daftar Pelanggan" subtitle="Laporan data pelanggan" actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-gray-300"><Printer className="size-4 mr-2" /> Cetak</Button>
          <Button variant="outline" size="sm" className="border-gray-300"><Pencil className="size-4 mr-2" /> Disain</Button>
          <Button variant="outline" size="sm" className="border-gray-300"><Copy className="size-4 mr-2" /> Duplikat</Button>
          <Button variant="outline" size="sm" className="border-gray-300"><Download className="size-4 mr-2" /> Export</Button>
        </div>
      } />

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-4 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">Grup</label><Select value={selectedGrup} onChange={(e) => setSelectedGrup(e.target.value)} options={["Semua", "Platinum", "Gold", "Silver", "Regular"]} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Wilayah</label><Select value={selectedWilayah} onChange={(e) => setSelectedWilayah(e.target.value)} options={["Semua", "Jakarta", "Bandung", "Surabaya", "Medan"]} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Urutkan Kolom</label><Select value={sortColumn} onChange={(e) => setSortColumn(e.target.value)} options={["Kode", "Nama", "Grup", "Piutang"]} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Arah</label><div className="flex gap-2"><Button color={sortDirection === 'asc' ? "primary" : "neutral"} variant="solid" size="sm" onClick={() => setSortDirection('asc')} className="flex-1"><ChevronUp className="size-4" /></Button><Button color={sortDirection === 'desc' ? "primary" : "neutral"} variant="solid" size="sm" onClick={() => setSortDirection('desc')} className="flex-1"><ChevronDown className="size-4" /></Button></div></div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" /><Input placeholder="Cari pelanggan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div></div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Pelanggan</div><div className="text-xl font-bold text-gray-900">{filteredCustomers.length}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Piutang</div><div className="text-xl font-bold text-orange-600">{formatCurrency(filteredCustomers.reduce((acc, c) => acc + c.piutang, 0))}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Poin</div><div className="text-xl font-bold text-purple-600">{filteredCustomers.reduce((acc, c) => acc + c.poin, 0).toLocaleString()}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Piutang Aktif</div><div className="text-xl font-bold text-red-600">{filteredCustomers.filter(c => c.piutang > 0).length}</div></div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 text-left">
              <th className="px-4 py-3 font-medium"><SortButton column="kode">Kode</SortButton></th>
              <th className="px-4 py-3 font-medium"><SortButton column="nama">Nama</SortButton></th>
              <th className="px-4 py-3 font-medium"><SortButton column="grup">Grup</SortButton></th>
              <th className="px-4 py-3 font-medium">Wilayah</th>
              <th className="px-4 py-3 font-medium">Telepon</th>
              <th className="px-4 py-3 font-medium text-right"><SortButton column="piutang">Piutang</SortButton></th>
              <th className="px-4 py-3 font-medium text-right">Poin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomers.map((c) => (
              <tr key={c.kode} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.kode}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{c.nama}</td>
                <td className="px-4 py-3"><span className={cn("inline-block px-2 py-0.5 text-xs font-medium rounded-full", getGrupBadgeColor(c.grup))}>{c.grup}</span></td>
                <td className="px-4 py-3 text-sm text-gray-500">{c.wilayah}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{c.telepon}</td>
                <td className={cn("px-4 py-3 text-sm text-right font-medium", c.piutang > 0 ? "text-orange-600" : "text-gray-900")}>{formatCurrency(c.piutang)}</td>
                <td className="px-4 py-3 text-sm text-purple-600 text-right font-medium">{c.poin.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
