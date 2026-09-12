"use client";

import { useState } from "react";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Plus, Pencil } from "lucide-react";
import { mockPurchases } from "@/lib/mock-data-pos";
import { PurchaseForm } from "@/components/pos/transaction/PurchaseForm";
import { cn } from "@/lib/utils";
import type { Purchase } from "@/types/pos";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function PurchaseListPage() {
  const [search, setSearch] = useState("");
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  const handleAddNew = () => {
    setEditingPurchase(null);
    setFormOpen(true);
  };

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setFormOpen(true);
  };

  const handleSave = (purchase: Purchase) => {
    if (editingPurchase) {
      setPurchases(purchases.map(p => p.id === purchase.id ? purchase : p));
    } else {
      setPurchases([purchase, ...purchases]);
    }
    setFormOpen(false);
  };

  const columns = [
    { key: "code", label: "Kode", sortable: true },
    { key: "date", label: "Tanggal", sortable: true },
    { key: "supplierName", label: "Supplier" },
    { key: "total", label: "Total", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "paid", label: "Bayar", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "remaining", label: "Sisa", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "status", label: "Status", render: (v: unknown) => (
      <span className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        v === "paid" ? "bg-green-100 text-green-700" :
        v === "partial" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"
      )}>
        {v === "paid" ? "Lunas" : v === "partial" ? "Sebagian" : "Tertunda"}
      </span>
    )},
    {
      key: "actions",
      label: "",
      render: (_: unknown, row: Purchase) => (
        <button
          onClick={() => handleEdit(row)}
          className="p-1.5 text-gray-400 hover:text-[#9C27B0] hover:bg-purple-50 rounded transition-colors"
        >
          <Pencil className="size-4" />
        </button>
      ),
    },
  ];

  return (
    <PageWrapper>
      <PageTitle
        title="Daftar Pembelian"
        subtitle="Kelola transaksi pembelian"
        actions={<Button onClick={handleAddNew} icon={Plus} className="bg-[#9C27B0] hover:bg-[#7B1FA2]">Pembelian Baru</Button>}
      />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari kode transaksi..."
      />
      <DataTable data={purchases} columns={columns} emptyMessage="Tidak ada pembelian" />

      {formOpen && (
        <PurchaseForm
          purchase={editingPurchase || undefined}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
        />
      )}
    </PageWrapper>
  );
}
