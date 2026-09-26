"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { KetokoList, kcol, type KListColumn, type KRow, type KSortOption } from "@/components/ui/KetokoList";
import { PartnerHistoryModal } from "@/components/master/PartnerHistoryModal";

// Kolom Daftar Supplier Ketoko (+ data supplier lainnya di sebelah kanan).
const COLUMNS: KListColumn[] = [
  kcol.text("Code", "Kode", 90),
  kcol.text("Name", "Nama", 180),
  kcol.text("Address", "Alamat", 220),
  kcol.text("City", "Kota", 110),
  kcol.text("Province", "Provinsi", 110),
  kcol.text("Phone", "Telepon", 120),
  kcol.text("ContactPerson", "Kontak", 110),
  kcol.text("Email", "Email", 170),
  kcol.text("Notes", "Keterangan", 200),
  kcol.text("Country", "Negara", 100),
  kcol.text("PostalCode", "Kode Pos", 90),
  kcol.text("Fax", "Fax", 110),
  kcol.text("BankName", "Bank", 100),
  kcol.text("BankAccountNumber", "No Rek.", 130),
  kcol.text("BankAccountName", "Rek. A/N", 150),
  kcol.text("TaxID", "NPWP", 150),
  kcol.int("DueDays", "Jatuh Tempo", 100),
  kcol.money("TotalDebt", "Hutang", 120),
];

const SORTS: KSortOption[] = [
  { value: "Code", label: "Kode" },
  { value: "Name", label: "Nama" },
  { value: "Address", label: "Alamat" },
  { value: "City", label: "Kota" },
  { value: "Province", label: "Provinsi" },
  { value: "Phone", label: "Telepon" },
  { value: "Email", label: "Email" },
  { value: "CreatedAt", label: "Tanggal Input" },
];

const SEARCH = ["Code", "Name", "Address", "City", "Province", "Phone", "Email", "ContactPerson", "Notes"];

export default function SuppliersPage() {
  const [history, setHistory] = useState<KRow | null>(null);
  return (
    <>
      <KetokoList
        title="Daftar Supplier"
        endpoint="supplier"
        basePath="/master/suppliers"
        searchFields={SEARCH}
        searchPlaceholder="Kode / nama / alamat / telepon"
        sortOptions={SORTS}
        defaultSort="Name"
        columns={COLUMNS}
        extraActions={(sel) => (
          <button
            type="button"
            disabled={!sel}
            onClick={() => sel && setHistory(sel)}
            className="flex h-9 items-center gap-1.5 rounded border border-[#cfd4da] bg-white px-3 text-[13px] text-[#333] hover:bg-[#f3f4f6] disabled:opacity-40"
          >
            <History className="size-4 text-[#6b7580]" /> History Transaksi
          </button>
        )}
      />
      <PartnerHistoryModal open={!!history} onClose={() => setHistory(null)} partner={history} kind="supplier" />
    </>
  );
}
