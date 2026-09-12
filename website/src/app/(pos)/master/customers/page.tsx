"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Filter, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { CustomerForm } from "@/components/pos/master/CustomerForm";
import { mockCustomers } from "@/lib/mock-data-pos";
import type { Customer } from "@/types/pos";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [customers] = useState<Customer[]>(mockCustomers);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
        title="Master / Pelanggan"
        subtitle="Kelola daftar pelanggan"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Download className="size-4 mr-2" /> Export
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setEditingCustomer(null); setFormOpen(true); }}>
              <Plus className="size-4 mr-2" /> Tambah Pelanggan
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input type="text" placeholder="Cari pelanggan..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
            <Button variant="outline" size="sm" className="border-gray-200">
              <Filter className="size-4 mr-2" /> Filter
            </Button>
          </div>
          <div className="text-sm text-gray-500">{filteredData.length} data</div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 text-left">
              <th className="px-4 py-3 font-medium w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Nama Pelanggan</th>
              <th className="px-4 py-3 font-medium">Telepon</th>
              <th className="px-4 py-3 font-medium">Tipe</th>
              <th className="px-4 py-3 font-medium text-right">Saldo Poin</th>
              <th className="px-4 py-3 font-medium text-right">Piutang</th>
              <th className="px-4 py-3 font-medium text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.code}</td>
                <td className="px-4 py-3 text-sm font-medium text-purple-600">{customer.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{customer.phone || "-"}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex px-2 py-0.5 text-xs font-medium rounded-full",
                    customer.customerType === "vip" ? "bg-purple-100 text-purple-700" :
                    customer.customerType === "wholesale" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600")}>
                    {customer.customerType === "vip" ? "VIP" : customer.customerType === "wholesale" ? "Grosir" : "Retail"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(customer.pointBalance || 0)}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(0)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => { setEditingCustomer(customer); setFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"><Pencil className="size-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="size-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="text-sm text-gray-500">Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="border-gray-200"><ChevronLeft className="size-4" /></Button>
            <span className="text-sm text-gray-600 px-2">Halaman {currentPage} dari {totalPages || 1}</span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="border-gray-200"><ChevronRight className="size-4" /></Button>
          </div>
        </div>
      </div>

      <CustomerForm open={formOpen} onClose={() => { setFormOpen(false); setEditingCustomer(null); }} onSave={() => setFormOpen(false)} initialData={editingCustomer || undefined} isEditing={!!editingCustomer} />
    </PageWrapper>
  );
}
