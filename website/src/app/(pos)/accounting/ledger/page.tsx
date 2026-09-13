"use client";

import { useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Download } from "lucide-react";
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

// Mock ledger data by account
const mockLedger = [
  { id: 1, accountCode: "1110", accountName: "Kas Besar", accountType: "Aset", opening: 5000000, debit: 850000, credit: 550000, closing: 5300000 },
  { id: 2, accountCode: "1120", accountName: "Bank BCA", accountType: "Aset", opening: 10000000, debit: 1250000, credit: 350000, closing: 10900000 },
  { id: 3, accountCode: "1130", accountName: "Piutang", accountType: "Aset", opening: 3000000, debit: 450000, credit: 200000, closing: 3250000 },
  { id: 4, accountCode: "2110", accountName: "Hutang Supplier", accountType: "Kewajiban", opening: 2500000, debit: 550000, credit: 750000, closing: 2700000 },
  { id: 5, accountCode: "4100", accountName: "Penjualan", accountType: "Pendapatan", opening: 0, debit: 0, credit: 1300000, closing: 1300000 },
  { id: 6, accountCode: "5100", accountName: "HPP", accountType: "Beban", opening: 0, debit: 800000, credit: 0, closing: 800000 },
];

export default function LedgerPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = mockLedger.filter((p) =>
    p.accountCode.includes(search) ||
    p.accountName.toLowerCase().includes(search.toLowerCase()) ||
    p.accountType.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalDebit = filteredData.reduce((acc, p) => acc + p.debit, 0);
  const totalCredit = filteredData.reduce((acc, p) => acc + p.credit, 0);

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Accounting / Buku Besar"
        subtitle="Lihat saldo dan movement akun"
        actions={
          <Button variant="outline" size="sm" className="border-gray-300">
            <Download className="size-4 mr-2" /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">Total Akun</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{filteredData.length}</span>
            <span className="text-xs text-gray-500">Akun</span>
          </div>
        </div>
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
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kode, nama atau tipe akun..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 w-80 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#9C27B0] focus:ring-1 focus:ring-[#9C27B0]"
              />
            </div>
            <Button variant="outline" size="sm" className="border-gray-200">
              <Filter className="size-4 mr-2" /> Filter
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            <span>{filteredData.length} data</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 text-left">
                <th className="px-4 py-3 font-medium">Kode Akun</th>
                <th className="px-4 py-3 font-medium">Nama Akun</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 font-medium text-right">Saldo Awal</th>
                <th className="px-4 py-3 font-medium text-right">Debit</th>
                <th className="px-4 py-3 font-medium text-right">Credit</th>
                <th className="px-4 py-3 font-medium text-right">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.accountCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.accountName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      item.accountType === "Aset" ? "bg-blue-100 text-blue-700" :
                      item.accountType === "Kewajiban" ? "bg-red-100 text-red-700" :
                      item.accountType === "Pendapatan" ? "bg-green-100 text-green-700" :
                      "bg-orange-100 text-orange-700"
                    )}>
                      {item.accountType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatCurrency(item.opening)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.debit)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.credit)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[#9C27B0] text-right">{formatCurrency(item.closing)}</td>
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
