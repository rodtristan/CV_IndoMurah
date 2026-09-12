"use client";

import { useState } from "react";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { FilterBar } from "@/components/pos/ui/FilterBar";
import { Button } from "@/components/ui/Button";
import { Plus, CreditCard } from "lucide-react";
import { PurchasePaymentForm } from "@/components/pos/transaction/PurchasePaymentForm";

interface Payment {
  id: number;
  code: string;
  date: string;
  purchaseCode: string;
  method: string;
  amount: number;
}

const mockPayments: Payment[] = [
  { id: 1, code: "BYR001", date: "2024-09-08", purchaseCode: "BLI001", method: "Tunai", amount: 500000 },
  { id: 2, code: "BYR002", date: "2024-09-05", purchaseCode: "BLI002", method: "Transfer", amount: 499500 },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function PurchasePaymentsPage() {
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [formOpen, setFormOpen] = useState(false);

  const handleAddPayment = () => {
    setFormOpen(true);
  };

  const handleSavePayment = (payment: { purchaseId: number; amount: number; method: string; notes: string }) => {
    const newPayment: Payment = {
      id: Date.now(),
      code: `BYR${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      purchaseCode: `BLI${payment.purchaseId.toString().padStart(3, "0")}`,
      method: payment.method === "cash" ? "Tunai" : payment.method === "transfer" ? "Transfer" : "Kartu",
      amount: payment.amount,
    };
    setPayments([newPayment, ...payments]);
    setFormOpen(false);
  };

  const columns = [
    { key: "code", label: "Kode Bayar", sortable: true },
    { key: "date", label: "Tanggal", sortable: true },
    { key: "purchaseCode", label: "Ref. Pembelian" },
    { key: "method", label: "Metode" },
    { key: "amount", label: "Jumlah", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
  ];

  return (
    <PageWrapper>
      <PageTitle
        title="Daftar Pembayaran"
        subtitle="Kelola pembayaran pembelian"
        actions={
          <Button onClick={handleAddPayment} icon={Plus} className="bg-[#9C27B0] hover:bg-[#7B1FA2]">
            Pembayaran Baru
          </Button>
        }
      />
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Cari kode pembayaran..." />
      <DataTable data={payments} columns={columns} emptyMessage="Tidak ada pembayaran" />

      {formOpen && (
        <PurchasePaymentForm
          onClose={() => setFormOpen(false)}
          onSave={handleSavePayment}
        />
      )}
    </PageWrapper>
  );
}
