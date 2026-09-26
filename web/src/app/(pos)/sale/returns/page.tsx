"use client";

import { TransactionList, kcol, type TxnColumn } from "@/components/transaction/TransactionList";

const STATUS_LABEL: Record<string, string> = { DRAFT: "Draft", CONFIRMED: "Dikonfirmasi", COMPLETED: "Selesai", CANCELLED: "Batal" };

// Kolom Daftar Retur Penjualan Ketoko: No Transaksi, Tanggal, Nama, Pajak, Total, Keterangan, Komputer.
const COLUMNS: TxnColumn[] = [
  kcol.text("Code", "No Transaksi", 150),
  kcol.datetime("Date", "Tanggal", 150),
  kcol.text("Warehouse.Code", "Dept/Gudang", 100),
  kcol.text("Customer.Name", "Nama", 170),
  kcol.text("Sale.Code", "No. Penjualan", 150),
  { key: "Sale.TaxMode", label: "Pajak", width: 80, render: (v) => ({ NON: "Non", INCLUDE: "Include", EXCLUDE: "Exclude" } as Record<string, string>)[String(v)] ?? "" },
  kcol.money("TotalReturn", "Total", 120),
  kcol.text("Reason", "Keterangan", 200),
  { key: "Status.Code", label: "Status", width: 110, render: (v) => STATUS_LABEL[String(v)] ?? String(v ?? "") },
];

const SORTS = [
  { value: "Date", label: "Tanggal" },
  { value: "Code", label: "No Transaksi" },
  { value: "Customer.Name", label: "Nama Pelanggan" },
  { value: "TotalReturn", label: "Total" },
];
const STATUS_FILTER = {
  relation: "Status",
  options: Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
};
const PARTNER = { field: "CustomerID" as const, endpoint: "customer", label: "Pelanggan" };
const SEARCH = ["Code", "Reason", "Customer.Name", "Sale.Code"];

export default function SaleReturnsPage() {
  return (
    <TransactionList
      title="Daftar Retur Penjualan"
      endpoint="SaleReturns"
      basePath="/sale/returns"
      include="Sale,Customer,Warehouse,Status,Creator"
      deleteLabel="Retur Penjualan"
      emptyMessage="Tidak ada retur penjualan"
      searchPlaceholder="No. transaksi / pelanggan..."
      searchFields={SEARCH}
      filterPartner={PARTNER}
      statusFilter={STATUS_FILTER}
      sortOptions={SORTS}
      canDelete={(r) => r.Status?.Code === "DRAFT"}
      columns={COLUMNS}
    />
  );
}
