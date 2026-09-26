"use client";

import { TransactionList, kcol, type TxnColumn } from "@/components/transaction/TransactionList";

const total = (r: Record<string, any>) => (r.StockInItems ?? []).reduce((a: number, i: Record<string, any>) => a + Number(i.Subtotal ?? 0), 0); // eslint-disable-line @typescript-eslint/no-explicit-any

// Daftar Item Masuk Ketoko: No Transaksi, Tanggal, Dept/Gudang, Total, Keterangan, User Buat, User Ubah, Komputer.
const COLUMNS: TxnColumn[] = [
  kcol.text("Code", "No Transaksi", 160),
  kcol.datetime("Date", "Tanggal", 160),
  kcol.text("Warehouse.Code", "Dept/Gudang", 110),
  { key: "Total", label: "Total", width: 130, align: "right", sortKey: false, render: (_v, r) => total(r).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
  kcol.text("Description", "Keterangan", 220),
];
const SORTS = [{ value: "Date", label: "Tanggal" }, { value: "Code", label: "No Transaksi" }, { value: "Warehouse.Code", label: "Dept/Gudang" }];
const SEARCH = ["Code", "Description"];

export default function StockInPage() {
  return (
    <TransactionList
      title="Daftar Item Masuk"
      endpoint="stock-in"
      basePath="/inventory/stock-in"
      include="Warehouse,StockInItems"
      deleteLabel="Item Masuk"
      emptyMessage="Tidak ada item masuk"
      searchPlaceholder="No transaksi / keterangan"
      searchFields={SEARCH}
      sortOptions={SORTS}
      columns={COLUMNS}
    />
  );
}
