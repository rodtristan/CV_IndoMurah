"use client";

import { useState } from "react";
import { Download, Printer, Pencil, Copy, Search, ChevronUp, ChevronDown } from "lucide-react";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
};

const mockSuppliers = [
  { kode: "SUP001", nama: "PT Sentosa Jaya", alamat: "Jl. Merdeka No. 123, Jakarta", telepon: "021-1234567", email: "info@sentosajaya.com", hutang: 1400000 },
  { kode: "SUP002", nama: "CV Maju Bersama", alamat: "Jl. Sudirman No. 456, Bandung", telepon: "022-7654321", email: "sales@majubersama.com", hutang: 800000 },
  { kode: "SUP003", nama: "UD Sumber Rezeki", alamat: "Jl. Asia Afrika No. 78, Surabaya", telepon: "031-9876543", email: "src.rejeki@email.com", hutang: 0 },
  { kode: "SUP004", nama: "Toko Elektronik ABC", alamat: "Jl. Gatot Subroto No. 90, Medan", telepon: "061-4567890", email: "tokoabc@email.com", hutang: 1200000 },
];

export default function MasterSuppliersReportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("kode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredSuppliers = mockSuppliers
    .filter(s => !searchQuery || s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.kode.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
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
      <PageTitle title="Laporan / Daftar Supplier" subtitle="Laporan data supplier" actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-gray-300"><Printer className="size-4 mr-2" /> Cetak</Button>
          <Button variant="outline" size="sm" className="border-gray-300"><Pencil className="size-4 mr-2" /> Disain</Button>
          <Button variant="outline" size="sm" className="border-gray-300"><Copy className="size-4 mr-2" /> Duplikat</Button>
          <Button variant="outline" size="sm" className="border-gray-300"><Download className="size-4 mr-2" /> Export</Button>
        </div>
      } />

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Urutkan Kolom</label>
            <Select value={sortColumn} onChange={(e) => setSortColumn(e.target.value)} options={["Kode", "Nama", "Hutang"]} className="text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Arah</label>
            <div className="flex gap-2">
              <Button color={sortDirection === 'asc' ? "primary" : "neutral"} variant="solid" size="sm" onClick={() => setSortDirection('asc')} className="flex-1"><ChevronUp className="size-4" /></Button>
              <Button color={sortDirection === 'desc' ? "primary" : "neutral"} variant="solid" size="sm" onClick={() => setSortDirection('desc')} className="flex-1"><ChevronDown className="size-4" /></Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input placeholder="Cari supplier..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Supplier</div>
          <div className="text-xl font-bold text-gray-900">{filteredSuppliers.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Hutang</div>
          <div className="text-xl font-bold text-red-600">{formatCurrency(filteredSuppliers.reduce((acc, s) => acc + s.hutang, 0))}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Supplier Aktif</div>
          <div className="text-xl font-bold text-green-600">{filteredSuppliers.filter(s => s.hutang > 0).length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 text-left">
              <th className="px-4 py-3 font-medium"><SortButton column="kode">Kode</SortButton></th>
              <th className="px-4 py-3 font-medium"><SortButton column="nama">Nama</SortButton></th>
              <th className="px-4 py-3 font-medium">Alamat</th>
              <th className="px-4 py-3 font-medium">Telepon</th>
              <th className="px-4 py-3 font-medium text-right"><SortButton column="hutang">Hutang</SortButton></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSuppliers.map((s) => (
              <tr key={s.kode} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.kode}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{s.nama}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.alamat}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.telepon}</td>
                <td className={cn("px-4 py-3 text-sm text-right font-medium", s.hutang > 0 ? "text-red-600" : "text-gray-900")}>{formatCurrency(s.hutang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
