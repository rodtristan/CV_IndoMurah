"use client";

import { TransactionList, TAX_MODE_LABEL, kcol, type TxnColumn } from "@/components/transaction/TransactionList";
import type { KListFilter } from "@/components/ui/KetokoList";

const ORDER_STATUS: Record<string, string> = {
  WAITING_PAYMENT: "Menunggu Pembayaran", PAID: "Sudah Dibayar", PROCESSED: "Diproses", SHIPPED: "Dikirim", DONE: "Selesai", CANCELLED: "Batal",
};
const PROCESS: Record<string, string> = { OPEN: "Belum Diterima", PARTIAL: "Diterima Sebagian", DONE: "Diterima Semua" };

// Kolom Daftar Pesanan Pembelian Ketoko.
const COLUMNS: TxnColumn[] = [
  kcol.text("Code", "No Transaksi", 150),
  kcol.datetime("Date", "Tanggal", 150),
  kcol.date("DeliveryDate", "Tanggal Kirim", 120),
  kcol.text("Warehouse.Code", "Dept/Gudang", 100),
  kcol.text("Supplier.Code", "Kode Supplier", 110),
  kcol.text("Supplier.Name", "Nama", 160),
  kcol.qty("OrderedQty", "Jumlah Pesan", 110),
  kcol.qty("ReceivedQty", "Jumlah Terima", 110),
  { key: "ProcessStatus", label: "Status Proses", width: 140, render: (v) => PROCESS[String(v)] ?? "" },
  { key: "OrderStatus", label: "Status Pesanan", width: 160, render: (v) => ORDER_STATUS[String(v)] ?? "" },
  { key: "TaxMode", label: "Pajak", width: 80, render: (v) => TAX_MODE_LABEL[String(v)] ?? "" },
  kcol.money("Total", "Total", 120),
  kcol.money("DownPayment", "Titip/DP", 110),
  kcol.text("Notes", "Keterangan", 180),
];

const SORTS = [
  { value: "Date", label: "Tanggal" },
  { value: "Code", label: "No Transaksi" },
  { value: "DeliveryDate", label: "Tanggal Kirim" },
  { value: "Supplier.Name", label: "Nama Supplier" },
  { value: "Total", label: "Total" },
];

const EXTRA_FILTERS: KListFilter[] = [
  {
    key: "process", label: "Status Proses", type: "select",
    options: Object.entries(PROCESS).map(([value, label]) => ({ value, label })),
    where: (v) => ({ ProcessStatus: v }),
  },
  {
    key: "orderStatus", label: "Status Pesanan", type: "select",
    options: Object.entries(ORDER_STATUS).map(([value, label]) => ({ value, label })),
    where: (v) => ({ OrderStatus: v }),
  },
];
const PARTNER = { field: "SupplierID" as const, endpoint: "supplier", label: "Supplier" };
const SEARCH = ["Code", "Notes", "Supplier.Name", "Supplier.Code"];

export default function PurchaseOrderListPage() {
  return (
    <TransactionList
      title="Daftar Pesanan Pembelian"
      endpoint="PurchaseOrders"
      basePath="/purchase/order"
      include="Supplier,Warehouse,Status"
      deleteLabel="Pesanan"
      emptyMessage="Tidak ada pesanan pembelian"
      searchPlaceholder="No. transaksi / supplier..."
      searchFields={SEARCH}
      filterPartner={PARTNER}
      extraFilters={EXTRA_FILTERS}
      sortOptions={SORTS}
      canDelete={(r) => r.Status?.Code === "DRAFT" && !(Number(r.ReceivedQty) > 0)}
      columns={COLUMNS}
    />
  );
}
