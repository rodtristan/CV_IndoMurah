"use client";

import { useState } from "react";
import { Download, Printer, Pencil, Copy, Search, ChevronUp, ChevronDown } from "lucide-react";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const mockSaleItems = [
  { kode: "BRG001", nama: "Laptop ASUS VivoBook 15", qty: 5, harga: 9500000, subtotal: 47500000, diskon: 500000, pajak: 5170000, total: 52170000 },
  { kode: "BRG002", nama: "Mouse Wireless Logitech", qty: 25, harga: 175000, subtotal: 4375000, diskon: 0, pajak: 481250, total: 4856250 },
  { kode: "BRG004", nama: "Monitor LED 24 inch", qty: 8, harga: 2200000, subtotal: 17600000, diskon: 220000, pajak: 1913000, total: 19733000 },
  { kode: "BRG005", nama: "Kabel LAN Cat6 10m", qty: 15, harga: 85000, subtotal: 1275000, diskon: 50000, pajak: 134750, total: 1409750 },
];

export default function SalePerItemReportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("total");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredItems = mockSaleItems.filter(i => !searchQuery || i.nama.toLowerCase().includes(searchQuery.toLowerCase()) || i.kode.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => {
    const aVal = a[sortColumn as keyof typeof a];
    const bVal = b[sortColumn as keyof typeof b];
    if (typeof aVal === 'number' && typeof bVal === 'number') return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    return 0;
  });

  const totals = { qty: filteredItems.reduce((acc, i) => acc + i.qty, 0), subtotal: filteredItems.reduce((acc, i) => acc + i.subtotal, 0), diskon: filteredItems.reduce((acc, i) => acc + i.diskon, 0), pajak: filteredItems.reduce((acc, i) => acc + i.pajak, 0), total: filteredItems.reduce((acc, i) => acc + i.total, 0) };

  const SortButton = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <button onClick={() => { if (sortColumn === column) setSortDirection(d => d === 'asc' ? 'desc' : 'asc'); else { setSortColumn(column); setSortDirection('asc'); } }} className="flex items-center gap-1 hover:text-[#9C27B0]">
      {children}{sortColumn === column && (sortDirection === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
    </button>
  );

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle title="Laporan / Penjualan Per Item" subtitle="Laporan penjualan per item barang" actions={
        <div className="flex gap-2"><Button variant="outline" size="sm"><Printer className="size-4 mr-2" /> Cetak</Button><Button variant="outline" size="sm"><Pencil className="size-4 mr-2" /> Disain</Button><Button variant="outline" size="sm"><Copy className="size-4 mr-2" /> Duplikat</Button><Button variant="outline" size="sm"><Download className="size-4 mr-2" /> Export</Button></div>
      } />

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-4 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">Urutkan</label><Select value={sortColumn} onChange={(e) => setSortColumn(e.target.value)} options={["Total", "Qty", "Nama"]} className="text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Arah</label><div className="flex gap-2"><Button color={sortDirection === 'asc' ? "primary" : "neutral"} variant="solid" size="sm" onClick={() => setSortDirection('asc')}><ChevronUp className="size-4" /></Button><Button color={sortDirection === 'desc' ? "primary" : "neutral"} variant="solid" size="sm" onClick={() => setSortDirection('desc')}><ChevronDown className="size-4" /></Button></div></div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" /><Input placeholder="Cari item..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div></div>

      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Penjualan</div><div className="text-xl font-bold text-green-600">{formatCurrency(totals.total)}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Qty</div><div className="text-xl font-bold text-gray-900">{totals.qty}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Item</div><div className="text-xl font-bold text-gray-900">{filteredItems.length}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Diskon</div><div className="text-xl font-bold text-red-600">{formatCurrency(totals.diskon)}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3"><div className="text-xs text-gray-500 mb-1">Total Pajak</div><div className="text-xl font-bold text-gray-900">{formatCurrency(totals.pajak)}</div></div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50"><tr className="text-xs text-gray-500 text-left">
            <th className="px-4 py-3 font-medium">Kode</th>
            <th className="px-4 py-3 font-medium">Nama Item</th>
            <th className="px-4 py-3 font-medium text-right"><SortButton column="qty">Qty</SortButton></th>
            <th className="px-4 py-3 font-medium text-right">Harga</th>
            <th className="px-4 py-3 font-medium text-right">Subtotal</th>
            <th className="px-4 py-3 font-medium text-right">Diskon</th>
            <th className="px-4 py-3 font-medium text-right">Pajak</th>
            <th className="px-4 py-3 font-medium text-right"><SortButton column="total">Total</SortButton></th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filteredItems.map((i) => (
              <tr key={i.kode} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{i.kode}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{i.nama}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">{i.qty}</td>
                <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatCurrency(i.harga)}</td>
                <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatCurrency(i.subtotal)}</td>
                <td className="px-4 py-3 text-sm text-red-600 text-right">{formatCurrency(i.diskon)}</td>
                <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatCurrency(i.pajak)}</td>
                <td className="px-4 py-3 text-sm text-green-600 text-right font-medium">{formatCurrency(i.total)}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold"><td colSpan={2} className="px-4 py-3 text-sm">TOTAL</td><td className="px-4 py-3 text-sm text-right">{totals.qty}</td><td className="px-4 py-3 text-sm text-right">-</td><td className="px-4 py-3 text-sm text-right">{formatCurrency(totals.subtotal)}</td><td className="px-4 py-3 text-sm text-red-600 text-right">{formatCurrency(totals.diskon)}</td><td className="px-4 py-3 text-sm text-right">{formatCurrency(totals.pajak)}</td><td className="px-4 py-3 text-sm text-green-600 text-right">{formatCurrency(totals.total)}</td></tr>
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
