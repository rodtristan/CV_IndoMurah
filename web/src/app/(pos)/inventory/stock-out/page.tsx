"use client";

import { TransactionList, kcol, type TxnColumn } from "@/components/transaction/TransactionList";

const total = (r: Record<string, any>) => (r.StockOutItems ?? []).reduce((a: number, i: Record<string, any>) => a + Number(i.Subtotal ?? 0), 0); // eslint-disable-line @typescript-eslint/no-explicit-any

// Daftar Item Keluar Ketoko.
const COLUMNS: TxnColumn[] = [
  kcol.text("Code", "No Transaksi", 160),
  kcol.datetime("Date", "Tanggal", 160),
  kcol.text("Warehouse.Code", "Dept/Gudang", 110),
  kcol.qty("TotalItems", "Jumlah", 100),
  { key: "Total", label: "Total", width: 130, align: "right", sortKey: false, render: (_v, r) => total(r).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
  kcol.text("Description", "Keterangan", 220),
];
const SORTS = [{ value: "Date", label: "Tanggal" }, { value: "Code", label: "No Transaksi" }, { value: "Warehouse.Code", label: "Dept/Gudang" }];
const SEARCH = ["Code", "Description"];

export default function StockOutPage() {
  return (
    <TransactionList
      title="Daftar Item Keluar"
      endpoint="stock-out"
      basePath="/inventory/stock-out"
      include="Warehouse,StockOutItems"
      deleteLabel="Item Keluar"
      emptyMessage="Tidak ada item keluar"
      searchPlaceholder="No transaksi / keterangan"
      searchFields={SEARCH}
      sortOptions={SORTS}
      columns={COLUMNS}
    />
  );
}
