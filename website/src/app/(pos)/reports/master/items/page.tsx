"use client";

import { useState } from "react";
import { Download, Printer, Pencil, Copy, Search, ChevronUp, ChevronDown } from "lucide-react";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const mockItems = [
  { kode: "BRG001", nama: "Laptop ASUS VivoBook 15", jenis: "Elektronik", merek: "ASUS", satuan: "Unit", gudang: "Gudang Utama", stok: 15, hpp: 8500000, hj1: 9500000 },
  { kode: "BRG002", nama: "Mouse Wireless Logitech", jenis: "Aksesoris", merek: "Logitech", satuan: "Pcs", gudang: "Gudang Utama", stok: 50, hpp: 125000, hj1: 175000 },
  { kode: "BRG003", nama: "Keyboard Mechanical RGB", jenis: "Aksesoris", merek: "Rexus", satuan: "Pcs", gudang: "Gudang Utama", stok: 0, hpp: 450000, hj1: 625000 },
  { kode: "BRG004", nama: "Monitor LED 24 inch", jenis: "Elektronik", merek: "Samsung", satuan: "Unit", gudang: "Gudang Utama", stok: 8, hpp: 1800000, hj1: 2200000 },
  { kode: "BRG005", nama: "Kabel LAN Cat6 10m", jenis: "Aksesoris", merek: "D-Link", satuan: "Pcs", gudang: "Gudang Utama", stok: 25, hpp: 55000, hj1: 85000 },
  { kode: "BRG006", nama: "Webcam HD 1080p", jenis: "Elektronik", merek: "Logitech", satuan: "Pcs", gudang: "Gudang Utama", stok: 0, hpp: 380000, hj1: 525000 },
];

export default function MasterItemsReportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("");
  const [selectedGudang, setSelectedGudang] = useState("");
  const [sortColumn, setSortColumn] = useState("kode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showZeroStock, setShowZeroStock] = useState(false);
  const [showNotForSale, setShowNotForSale] = useState(false);
  const [reportType, setReportType] = useState("standard");

  const filteredItems = mockItems
    .filter(item => {
      if (searchQuery && !item.nama.toLowerCase().includes(searchQuery.toLowerCase()) && !item.kode.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedJenis && item.jenis !== selectedJenis) return false;
      if (selectedGudang && item.gudang !== selectedGudang) return false;
      if (!showZeroStock && item.stok === 0) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortColumn as keyof typeof a];
      const bVal = b[sortColumn as keyof typeof b];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortButton = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <button onClick={() => handleSort(column)} className="flex items-center gap-1 hover:text-[#9C27B0] transition-colors">
      {children}
      {sortColumn === column && (sortDirection === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
    </button>
  );

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Laporan / Daftar Item"
        subtitle="Laporan data item barang"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300"><Printer className="size-4 mr-2" /> Cetak</Button>
            <Button variant="outline" size="sm" className="border-gray-300"><Pencil className="size-4 mr-2" /> Disain</Button>
            <Button variant="outline" size="sm" className="border-gray-300"><Copy className="size-4 mr-2" /> Duplikat</Button>
            <Button variant="outline" size="sm" className="border-gray-300"><Download className="size-4 mr-2" /> Export</Button>
          </div>
        }
      />

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Range Kode Item</label>
            <div className="flex items-center gap-2">
              <Input placeholder="Dari" className="text-sm" />
              <span className="text-gray-400">-</span>
              <Input placeholder="Sampai" className="text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Jenis</label>
            <Select value={selectedJenis} onChange={(e) => setSelectedJenis(e.target.value)} options={["Semua", "Elektronik", "Aksesoris"]} className="text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Gudang</label>
            <Select value={selectedGudang} onChange={(e) => setSelectedGudang(e.target.value)} options={["Semua", "Gudang Utama"]} className="text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Urutkan Kolom</label>
            <Select value={sortColumn} onChange={(e) => setSortColumn(e.target.value)} options={["Kode", "Nama", "Jenis", "Stok"]} className="text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Arah</label>
            <div className="flex gap-2">
              <Button color={sortDirection === 'asc' ? "primary" : "neutral"} variant="solid" size="sm" onClick={() => setSortDirection('asc')} className="flex-1"><ChevronUp className="size-4" /></Button>
              <Button color={sortDirection === 'desc' ? "primary" : "neutral"} variant="solid" size="sm" onClick={() => setSortDirection('desc')} className="flex-1"><ChevronDown className="size-4" /></Button>
            </div>
          </div>
        </div>

        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showZeroStock} onChange={(e) => setShowZeroStock(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
            <span className="text-sm text-gray-600">Tampilkan barang stok kosong</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showNotForSale} onChange={(e) => setShowNotForSale(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
            <span className="text-sm text-gray-600">Hanya tampilkan barang yang tidak dijual</span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input placeholder="Cari kode atau nama item..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Item</div>
          <div className="text-xl font-bold text-gray-900">{filteredItems.length} <span className="text-xs font-normal text-gray-500">Items</span></div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Stok</div>
          <div className="text-xl font-bold text-gray-900">{filteredItems.reduce((acc, i) => acc + i.stok, 0)} <span className="text-xs font-normal text-gray-500">Unit</span></div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Item Stok Habis</div>
          <div className="text-xl font-bold text-red-600">{filteredItems.filter(i => i.stok === 0).length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Nilai Stok</div>
          <div className="text-xl font-bold text-green-600">{formatCurrency(filteredItems.reduce((acc, i) => acc + (i.stok * i.hpp), 0))}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 text-left">
                <th className="px-4 py-3 font-medium"><SortButton column="kode">Kode</SortButton></th>
                <th className="px-4 py-3 font-medium"><SortButton column="nama">Nama Item</SortButton></th>
                <th className="px-4 py-3 font-medium"><SortButton column="jenis">Jenis</SortButton></th>
                <th className="px-4 py-3 font-medium">Merek</th>
                <th className="px-4 py-3 font-medium">Satuan</th>
                <th className="px-4 py-3 font-medium">Gudang</th>
                <th className="px-4 py-3 font-medium text-right"><SortButton column="stok">Stok</SortButton></th>
                <th className="px-4 py-3 font-medium text-right">HPP</th>
                <th className="px-4 py-3 font-medium text-right">HJ1</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <tr key={item.kode} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.kode}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.nama}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.jenis}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.merek}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.satuan}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.gudang}</td>
                  <td className={cn("px-4 py-3 text-sm text-right font-medium", item.stok === 0 ? "text-red-600" : "text-gray-900")}>{item.stok}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatCurrency(item.hpp)}</td>
                  <td className="px-4 py-3 text-sm text-green-600 text-right font-medium">{formatCurrency(item.hj1)}</td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Tidak ada data item yang sesuai dengan filter</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
