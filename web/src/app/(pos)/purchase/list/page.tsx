"use client";

import { TransactionList, TAX_MODE_LABEL, kcol, type TxnColumn } from "@/components/transaction/TransactionList";

const PAY_LABEL: Record<string, string> = { PENDING: "Kredit", PAID: "Lunas", PARTIAL: "Sebagian", INSTALMENT: "Cicilan", CANCELLED: "Batal" };
const STATUS_LABEL: Record<string, string> = { DRAFT: "Draft", CONFIRMED: "Dikonfirmasi", COMPLETED: "Selesai", CANCELLED: "Batal" };

// Kolom Daftar Pembelian Ketoko (+ jatuh tempo & pembayaran di sebelah kanan).
const COLUMNS: TxnColumn[] = [
  kcol.text("Code", "No Transaksi", 150),
  kcol.datetime("Date", "Tanggal", 150),
  kcol.text("Warehouse.Code", "Dept/Gudang", 100),
  kcol.text("Supplier.Code", "Kode Supplier", 110),
  kcol.text("Supplier.Name", "Nama", 170),
  { key: "TaxMode", label: "Pajak", width: 80, render: (v) => TAX_MODE_LABEL[String(v)] ?? "" },
  kcol.money("Total", "Total", 120),
  kcol.text("Notes", "Keterangan", 180),
  kcol.text("ReferenceNo", "No. Faktur Supplier", 150),
  kcol.date("DueDate", "Jatuh Tempo", 110),
  kcol.money("Paid", "Dibayar", 120),
  kcol.money("Remaining", "Sisa", 120),
  { key: "PaymentStatus.Code", label: "Status Bayar", width: 100, render: (v) => PAY_LABEL[String(v)] ?? String(v ?? "") },
  { key: "Status.Code", label: "Status", width: 110, render: (v) => STATUS_LABEL[String(v)] ?? String(v ?? "") },
  kcol.text("PurchaseOrder.Code", "No. Pesanan", 150),
];

const SORTS = [
  { value: "Date", label: "Tanggal" },
  { value: "Code", label: "No Transaksi" },
  { value: "Supplier.Name", label: "Nama Supplier" },
  { value: "Total", label: "Total" },
  { value: "DueDate", label: "Jatuh Tempo" },
  { value: "CreatedAt", label: "Waktu Input" },
];

const STATUS_FILTER = {
  relation: "PaymentStatus", label: "Status Bayar",
  options: [{ value: "PENDING", label: "Kredit" }, { value: "PARTIAL", label: "Sebagian" }, { value: "PAID", label: "Lunas" }],
};
const PARTNER = { field: "SupplierID" as const, endpoint: "supplier", label: "Supplier" };
const SEARCH = ["Code", "Notes", "ReferenceNo", "Supplier.Name", "Supplier.Code"];

export default function PurchaseListPage() {
  return (
    <TransactionList
      title="Daftar Pembelian"
      endpoint="purchases"
      basePath="/purchase/list"
      include="Supplier,Warehouse,PaymentStatus,Status,PurchaseOrder"
      deleteLabel="Pembelian"
      emptyMessage="Tidak ada pembelian"
      searchPlaceholder="No. transaksi / supplier..."
      searchFields={SEARCH}
      filterPartner={PARTNER}
      statusFilter={STATUS_FILTER}
      sortOptions={SORTS}
      canDelete={(r) => ["DRAFT", "CANCELLED"].includes(r.Status?.Code)}
      columns={COLUMNS}
    />
  );
}
