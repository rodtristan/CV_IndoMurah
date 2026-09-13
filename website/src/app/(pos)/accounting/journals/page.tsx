"use client";

import { useState } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Pencil, Trash2, Download, Eye } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Mock journal entries data
const mockJournals = [
  { id: 1, code: "JRN240912001", date: "12/09/2024", account: "Kas Besar", description: "Penjualan tunai", debit: 850000, credit: 0 },
  { id: 2, code: "JRN240912001", date: "12/09/2024", account: "Penjualan", description: "Pendapatan penjualan", debit: 0, credit: 850000 },
  { id: 3, code: "JRN240912002", date: "12/09/2024", account: "Hutang Supplier", description: "Pembelian barang", debit: 550000, credit: 0 },
  { id: 4, code: "JRN240912002", date: "12/09/2024", account: "Kas Besar", description: "Pembayaran hutang", debit: 0, credit: 550000 },
  { id: 5, code: "JRN240911001", date: "11/09/2024", account: "Piutang", description: "Penjualan kredit", debit: 450000, credit: 0 },
  { id: 6, code: "JRN240911001", date: "11/09/2024", account: "Penjualan", description: "Pendapatan penjualan", debit: 0, credit: 450000 },
];

export default function JournalsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const itemsPerPage = 10;

  const filteredData = mockJournals.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.account.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalDebit = filteredData.reduce((acc, p) => acc + p.debit, 0);
  const totalCredit = filteredData.reduce((acc, p) => acc + p.credit, 0);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(paginatedData.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    }
  };

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Accounting / Jurnal"
        subtitle="Kelola entri jurnal umum"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Download className="size-4 mr-2" /> Export
            </Button>
            <Button size="sm" className="bg-[#9C27B0] hover:bg-[#7B1FA2]">
              <Plus className="size-4 mr-2" /> Jurnal Baru
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Debit</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{formatCurrency(totalDebit)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Credit</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{formatCurrency(totalCredit)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Jumlah Entri</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#9C27B0]">{filteredData.length / 2}</span>
            <span className="text-xs text-gray-500">Entri</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kode atau akun..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#9C27B0] focus:ring-1 focus:ring-[#9C27B0]"
              />
            </div>
            <Button variant="outline" size="sm" className="border-gray-200">
              <Filter className="size-4 mr-2" /> Filter
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            {selectedItems.length > 0 ? <span>{selectedItems.length} dipilih</span> : <span>{filteredData.length} data</span>}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 text-left">
                <th className="px-4 py-3 font-medium w-10">
                  <input type="checkbox" checked={selectedItems.length === paginatedData.length && paginatedData.length > 0} onChange={(e) => handleSelectAll(e.target.checked)} className="rounded border-gray-300 text-[#9C27B0] focus:ring-[#9C27B0]" />
                </th>
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Akun</th>
                <th className="px-4 py-3 font-medium">Deskripsi</th>
                <th className="px-4 py-3 font-medium text-right">Debit</th>
                <th className="px-4 py-3 font-medium text-right">Credit</th>
                <th className="px-4 py-3 font-medium text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={(e) => handleSelect(item.id, e.target.checked)} className="rounded border-gray-300 text-[#9C27B0] focus:ring-[#9C27B0]" />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.account}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.description}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{item.debit > 0 ? formatCurrency(item.debit) : "-"}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{item.credit > 0 ? formatCurrency(item.credit) : "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-[#9C27B0] hover:bg-purple-50 rounded" title="Detail"><Eye className="size-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-[#9C27B0] hover:bg-purple-50 rounded" title="Edit"><Pencil className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="border-gray-200"><ChevronLeft className="size-4" /></Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={cn("w-8 h-8 rounded text-sm font-medium transition-colors", currentPage === page ? "bg-[#9C27B0] text-white" : "border border-gray-200 text-gray-700 hover:bg-gray-50")}>{page}</button>
            ))}
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="border-gray-200"><ChevronRight className="size-4" /></Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
