"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { TransactionList, TAX_MODE_LABEL, kcol, type TxnColumn } from "@/components/transaction/TransactionList";
import type { KListFilter } from "@/components/ui/KetokoList";

const PAY_STATUS: Record<string, string> = { PAID: "Lunas", PARTIAL: "Sebagian", PENDING: "Kredit", CANCELLED: "Batal" };

// Kolom Daftar Penjualan Ketoko: No Transaksi, Tanggal, Dept/Gudang, Nama, Sales, Pajak, Total,
// Keterangan, User Buat, User Ubah, Komputer (+ Status Bayar).
const COLUMNS: TxnColumn[] = [
  kcol.text("Code", "No Transaksi", 150),
  kcol.datetime("Date", "Tanggal", 150),
  kcol.text("Warehouse.Code", "Dept/Gudang", 100),
  kcol.text("Customer.Name", "Nama", 170),
  kcol.text("SalesPerson.Name", "Sales", 120),
  { key: "TaxMode", label: "Pajak", width: 80, render: (v) => TAX_MODE_LABEL[String(v)] ?? "" },
  kcol.money("Total", "Total", 120),
  { key: "PaymentStatus.Code", label: "Status Bayar", width: 100, render: (v) => PAY_STATUS[String(v)] ?? String(v ?? "") },
  kcol.text("Notes", "Keterangan", 180),
];

const SORTS = [
  { value: "Date", label: "Tanggal" },
  { value: "Code", label: "No Transaksi" },
  { value: "Customer.Name", label: "Nama Pelanggan" },
  { value: "SalesPerson.Name", label: "Sales" },
  { value: "Total", label: "Total" },
];
const STATUS_FILTER = {
  relation: "PaymentStatus",
  label: "Status Bayar",
  options: Object.entries(PAY_STATUS).map(([value, label]) => ({ value, label })),
};
const EXTRA_FILTERS: KListFilter[] = [
  { key: "sales", label: "Sales", type: "select", optionsFrom: { endpoint: "sales-person", label: (p) => `${p.Code} - ${p.Name}` }, where: (v) => ({ SalesPersonID: Number(v) }) },
];
const PARTNER = { field: "CustomerID" as const, endpoint: "customer", label: "Pelanggan" };
const SEARCH = ["Code", "Notes", "ReferenceNo", "Customer.Name", "Customer.Code", "SalesPerson.Name"];

export default function SaleListPage() {
  const router = useRouter();
  return (
    <TransactionList
      title="Daftar Penjualan"
      endpoint="sales"
      basePath="/sale/list"
      include="Customer,Warehouse,SalesPerson,Creator,PaymentStatus"
      deleteLabel="Penjualan"
      emptyMessage="Tidak ada penjualan"
      searchPlaceholder="No. transaksi / pelanggan..."
      searchFields={SEARCH}
      filterPartner={PARTNER}
      statusFilter={STATUS_FILTER}
      extraFilters={EXTRA_FILTERS}
      sortOptions={SORTS}
      canDelete={(r) => r.PaymentStatus?.Code === "PENDING" || r.PaymentStatus?.Code === "CANCELLED"}
      extraActions={(row) => (
        <button
          type="button"
          disabled={!row}
          title="Retur penjualan dari transaksi ini"
          onClick={() => row && router.push(`/sale/returns/new?saleId=${row.ID}`)}
          className="inline-flex h-9 items-center gap-1.5 rounded border border-default bg-white px-3 text-sm hover:bg-bg disabled:opacity-40"
        >
          <ArrowLeftRight className="size-4" /> Retur
        </button>
      )}
      columns={COLUMNS}
    />
  );
}
