"use client";

import { KetokoList, kcol, type KListColumn, type KSortOption } from "@/components/ui/KetokoList";

const COMMISSION: Record<string, string> = {
  NONE: "Tidak Aktif", ITEM_PRICE: "Perbarang Harga Jual", INVOICE_TOTAL: "Total Faktur", PER_ITEM: "Per Item",
};

// Kolom Daftar Sales Ketoko (+ data sales lainnya di sebelah kanan).
const COLUMNS: KListColumn[] = [
  kcol.text("Code", "Kode", 90),
  kcol.text("Name", "Nama", 160),
  kcol.text("Address", "Alamat", 200),
  kcol.text("City", "Kota", 110),
  kcol.text("Province", "Provinsi", 110),
  kcol.text("Phone", "Telepon", 120),
  kcol.text("ContactPerson", "Kontak", 110),
  kcol.text("Email", "Email", 170),
  kcol.text("Notes", "Keterangan", 200),
  { key: "CommissionSystem", label: "Sistem Komisi", width: 150, render: (v) => COMMISSION[String(v)] ?? "" },
  kcol.money("CommissionPercent", "Komisi %", 90),
  kcol.money("CommissionNominal", "Komisi Nominal", 120),
  kcol.text("Country", "Negara", 100),
  kcol.text("PostalCode", "Kode Pos", 90),
  kcol.text("Fax", "Fax", 110),
  kcol.text("BankName", "Bank", 100),
  kcol.text("BankAccountNumber", "No Rekening", 130),
  kcol.text("BankAccountName", "Rekening A/N", 150),
  kcol.text("TaxID", "NPWP", 150),
];

const SORTS: KSortOption[] = [
  { value: "Code", label: "Kode" },
  { value: "Name", label: "Nama" },
  { value: "Address", label: "Alamat" },
  { value: "City", label: "Kota" },
  { value: "Province", label: "Provinsi" },
  { value: "Phone", label: "Telepon" },
  { value: "Email", label: "Email" },
];

const SEARCH = ["Code", "Name", "Address", "City", "Province", "Phone", "Email", "ContactPerson", "Notes"];

export default function SalesPersonsPage() {
  return (
    <KetokoList
      title="Daftar Sales"
      endpoint="sales-person"
      basePath="/master/sales-persons"
      searchFields={SEARCH}
      searchPlaceholder="Kode / nama / alamat / telepon"
      sortOptions={SORTS}
      defaultSort="Name"
      columns={COLUMNS}
    />
  );
}
