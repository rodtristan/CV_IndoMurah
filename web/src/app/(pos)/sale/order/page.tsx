"use client";

import { TransactionList, TAX_MODE_LABEL, kcol, type TxnColumn } from "@/components/transaction/TransactionList";
import type { KListFilter } from "@/components/ui/KetokoList";

const ORDER_STATUS: Record<string, string> = {
  WAITING_PAYMENT: "Menunggu Pembayaran", PAID: "Sudah Dibayar", PROCESSED: "Diproses", SHIPPED: "Dikirim", DONE: "Selesai", CANCELLED: "Batal",
};
const PROCESS: Record<string, string> = { OPEN: "Belum Dijual", PARTIAL: "Terjual Sebagian", DONE: "Terjual Semua" };

// Kolom Daftar Pesanan Penjualan (pola daftar transaksi Ketoko).
const COLUMNS: TxnColumn[] = [
  kcol.text("Code", "No Transaksi", 150),
  kcol.datetime("Date", "Tanggal", 150),
  kcol.date("DeliveryDate", "Tanggal Kirim", 120),
  kcol.text("Warehouse.Code", "Dept/Gudang", 100),
  kcol.text("Customer.Code", "Kode Pelanggan", 120),
  kcol.text("Customer.Name", "Nama", 160),
  kcol.text("SalesPerson.Name", "Sales", 120),
  kcol.qty("OrderedQty", "Jumlah Pesan", 110),
  kcol.qty("DeliveredQty", "Jumlah Terima", 110),
  { key: "ProcessStatus", label: "Status Proses", width: 140, render: (v) => PROCESS[String(v)] ?? "" },
  { key: "OrderStatus", label: "Status Pesanan", width: 160, render: (v) => ORDER_STATUS[String(v)] ?? "" },
  { key: "TaxMode", label: "Pajak", width: 80, render: (v) => TAX_MODE_LABEL[String(v)] ?? "" },
  kcol.money("Total", "Total", 120),
  kcol.money("DownPayment", "DP", 110),
  kcol.text("Notes", "Keterangan", 180),
];

const SORTS = [
  { value: "Date", label: "Tanggal" },
  { value: "Code", label: "No Transaksi" },
  { value: "DeliveryDate", label: "Tanggal Kirim" },
  { value: "Customer.Name", label: "Nama Pelanggan" },
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
const PARTNER = { field: "CustomerID" as const, endpoint: "customer", label: "Pelanggan" };
const SEARCH = ["Code", "Notes", "Customer.Name", "Customer.Code"];

export default function SaleOrderListPage() {
  return (
    <TransactionList
      title="Daftar Pesanan Penjualan"
      endpoint="SaleOrders"
      basePath="/sale/order"
      include="Customer,SalesPerson,Warehouse,Status,Creator"
      deleteLabel="Pesanan"
      emptyMessage="Tidak ada pesanan penjualan"
      searchPlaceholder="No. transaksi / pelanggan..."
      searchFields={SEARCH}
      filterPartner={PARTNER}
      extraFilters={EXTRA_FILTERS}
      sortOptions={SORTS}
      canDelete={(r) => !(Number(r.DeliveredQty) > 0)}
      columns={COLUMNS}
    />
  );
}
