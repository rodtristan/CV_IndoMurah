"use client";

import { TransactionList, kcol, type TxnColumn } from "@/components/transaction/TransactionList";
import type { KListFilter } from "@/components/ui/KetokoList";

// Daftar Item Transfer Ketoko: No Transaksi, Tanggal, Keluar Dari, Masuk Ke, Jumlah, Keterangan + audit.
const COLUMNS: TxnColumn[] = [
  kcol.text("Code", "No Transaksi", 160),
  kcol.datetime("Date", "Tanggal", 160),
  kcol.text("FromWarehouse.Code", "Keluar Dari", 110),
  kcol.text("ToWarehouse.Code", "Masuk Ke", 110),
  kcol.qty("TotalItems", "Jumlah", 100),
  kcol.text("Notes", "Keterangan", 220),
];
const SORTS = [{ value: "Date", label: "Tanggal" }, { value: "Code", label: "No Transaksi" }, { value: "FromWarehouse.Code", label: "Keluar Dari" }, { value: "ToWarehouse.Code", label: "Masuk Ke" }];
const SEARCH = ["Code", "Notes"];
const EXTRA: KListFilter[] = [
  { key: "to", label: "Masuk Ke", type: "select", optionsFrom: { endpoint: "warehouse", label: (w) => `${w.Code} - ${w.Name}` }, where: (v) => ({ ToWarehouseID: Number(v) }) },
];

export default function TransfersPage() {
  return (
    <TransactionList
      title="Daftar Item Transfer"
      endpoint="stock-transfer"
      basePath="/inventory/transfers"
      include="FromWarehouse,ToWarehouse"
      deleteLabel="Item Transfer"
      emptyMessage="Tidak ada item transfer"
      searchPlaceholder="No transaksi / keterangan"
      searchFields={SEARCH}
      warehouseField="FromWarehouseID"
      extraFilters={EXTRA}
      sortOptions={SORTS}
      columns={COLUMNS}
    />
  );
}
