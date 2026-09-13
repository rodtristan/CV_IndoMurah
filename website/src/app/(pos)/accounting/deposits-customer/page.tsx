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

// Mock customer deposits data
const mockCustomerDeposits = [
  { id: 1, code: "DC240912001", date: "12/09/2024", customer: "Andi Wijaya", account: "Kas Besar", description: "Uang muka penjualan", amount: 500000, remaining: 250000 },
  { id: 2, code: "DC240912002", date: "12/09/2024", customer: "Budi Santoso", account: "Bank BCA", description: "Down payment", amount: 1000000, remaining: 750000 },
  { id: 3, code: "DC240911001", date: "11/09/2024", customer: "CV Maju Jaya", account: "Kas Besar", description: "Uang muka", amount: 300000, remaining: 100000 },
  { id: 4, code: "DC240910001", date: "10/09/2024", customer: "PT Sumber Rezeki", account: "Bank Mandiri", description: "Deposit", amount: 2000000, remaining: 1500000 },
];

export default function DepositsCustomerPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const itemsPerPage = 10;

  const filteredData = mockCustomerDeposits.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.customer.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalDeposit = filteredData.reduce((acc, p) => acc + p.amount, 0);
  const totalRemaining = filteredData.reduce((acc, p) => acc + p.remaining, 0);

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
        title="Accounting / Deposito Customer"
        subtitle="Kelola deposito pelanggan"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Download className="size-4 mr-2" /> Export
            </Button>
            <Button size="sm" className="bg-[#9C27B0] hover:bg-[#7B1FA2]">
              <Plus className="size-4 mr-2" /> Deposito Baru
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Deposito</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-green-600">{formatCurrency(totalDeposit)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Sisa Deposito</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#9C27B0]">{formatCurrency(totalRemaining)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Jumlah Customer</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{filteredData.length}</span>
            <span className="text-xs text-gray-500">Customer</span>
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
                placeholder="Cari kode atau customer..."
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
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Akun</th>
                <th className="px-4 py-3 font-medium text-right">Jumlah</th>
                <th className="px-4 py-3 font-medium text-right">Sisa</th>
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
                  <td className="px-4 py-3 text-sm text-gray-700">{item.customer}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.account}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600 text-right">{formatCurrency(item.amount)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#9C27B0] text-right">{formatCurrency(item.remaining)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-[#9C27B0] hover:bg-purple-50 rounded" title="Detail"><Eye className="size-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-[#9C27B0] hover:bg-purple-50 rounded" title="Edit"><Pencil className="size-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Hapus"><Trash2 className="size-4" /></button>
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
