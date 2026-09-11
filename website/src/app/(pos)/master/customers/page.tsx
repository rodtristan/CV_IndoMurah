"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CustomerForm } from "@/components/pos/master/CustomerForm";
import { mockCustomers } from "@/lib/mock-data-pos";
import type { Customer } from "@/types/pos";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "name", label: "Nama Pelanggan", sortable: true },
    { key: "phone", label: "Telepon" },
    { key: "city", label: "Kota" },
    {
      key: "customerType", label: "Tipe",
      render: (v: unknown) => (
        <span className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium",
          v === "vip" ? "bg-purple-500/20 text-purple-300" :
          v === "wholesale" ? "bg-blue-500/20 text-blue-400" :
          "bg-slate-500/20 text-slate-400"
        )}>
          {v === "vip" ? "VIP" : v === "wholesale" ? "Grosir" : "Retail"}
        </span>
      )
    },
    {
      key: "pointBalance", label: "Poin", align: "right" as const,
      render: (v: unknown) => formatCurrency(v as number)
    },
    {
      key: "actions",
      label: "",
      align: "right" as const,
      render: (_: unknown, row: Customer) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleEdit(row)}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-purple-400"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-red-400"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      )
    },
  ];

  const filteredData = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const handleSave = async (data: Partial<Customer>) => {
    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) => c.id === editingCustomer.id ? { ...c, ...data } : c)
      );
    } else {
      const newCustomer: Customer = {
        ...data as Customer,
        id: Math.max(...customers.map((c) => c.id), 0) + 1,
        code: data.code || "CST" + String(customers.length + 1).padStart(3, "0"),
        pointBalance: 0,
        createdAt: new Date().toISOString(),
      };
      setCustomers((prev) => [...prev, newCustomer]);
    }
    setFormOpen(false);
    setEditingCustomer(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin hapus pelanggan ini?")) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <PageWrapper>
      <PageTitle
        title="Pelanggan"
        subtitle="Kelola daftar pelanggan"
        actions={
          <Button icon={Plus} onClick={handleAdd}>
            Tambah Pelanggan
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          icon={Plus}
          placeholder="Cari pelanggan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm"
        />
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        emptyMessage="Tidak ada pelanggan"
      />

      <CustomerForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        initialData={editingCustomer || undefined}
        isEditing={!!editingCustomer}
      />
    </PageWrapper>
  );
}
