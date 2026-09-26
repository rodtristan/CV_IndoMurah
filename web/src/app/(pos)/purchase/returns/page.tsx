"use client";

import { TransactionList, kcol, type TxnColumn } from "@/components/transaction/TransactionList";

const STATUS_LABEL: Record<string, string> = { DRAFT: "Draft", CONFIRMED: "Dikonfirmasi", COMPLETED: "Selesai", CANCELLED: "Batal" };

// Kolom Daftar Retur Pembelian (pola daftar transaksi Ketoko).
const COLUMNS: TxnColumn[] = [
  kcol.text("Code", "No Transaksi", 150),
  kcol.datetime("Date", "Tanggal", 150),
  kcol.text("Warehouse.Code", "Dept/Gudang", 100),
  kcol.text("Supplier.Code", "Kode Supplier", 110),
  kcol.text("Supplier.Name", "Nama", 170),
  kcol.text("Purchase.Code", "No. Pembelian", 150),
  kcol.money("TotalReturn", "Total", 120),
  kcol.text("Reason", "Keterangan", 200),
  { key: "Status.Code", label: "Status", width: 110, render: (v) => STATUS_LABEL[String(v)] ?? String(v ?? "") },
];

const SORTS = [
  { value: "Date", label: "Tanggal" },
  { value: "Code", label: "No Transaksi" },
  { value: "Supplier.Name", label: "Nama Supplier" },
  { value: "TotalReturn", label: "Total" },
];
const STATUS_FILTER = {
  relation: "Status",
  options: [{ value: "DRAFT", label: "Draft" }, { value: "CONFIRMED", label: "Dikonfirmasi" }, { value: "COMPLETED", label: "Selesai" }, { value: "CANCELLED", label: "Batal" }],
};
const PARTNER = { field: "SupplierID" as const, endpoint: "supplier", label: "Supplier" };
const SEARCH = ["Code", "Reason", "Supplier.Name", "Purchase.Code"];

export default function PurchaseReturnsPage() {
  return (
    <TransactionList
      title="Daftar Retur Pembelian"
      endpoint="PurchaseReturns"
      basePath="/purchase/returns"
      include="Purchase,Supplier,Warehouse,Status"
      deleteLabel="Retur Pembelian"
      emptyMessage="Tidak ada retur pembelian"
      searchPlaceholder="No. transaksi / supplier..."
      searchFields={SEARCH}
      filterPartner={PARTNER}
      statusFilter={STATUS_FILTER}
      sortOptions={SORTS}
      canDelete={(r) => r.Status?.Code === "DRAFT"}
      columns={COLUMNS}
    />
  );
}
