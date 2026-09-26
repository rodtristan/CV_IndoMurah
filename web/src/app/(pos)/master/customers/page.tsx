"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { KetokoList, kcol, type KListColumn, type KListFilter, type KRow, type KSortOption } from "@/components/ui/KetokoList";
import { PartnerHistoryModal } from "@/components/master/PartnerHistoryModal";

// Kolom Daftar Pelanggan Ketoko (+ kolom data pelanggan lainnya di sebelah kanan).
const COLUMNS: KListColumn[] = [
  kcol.text("Code", "Kode", 90),
  kcol.text("Name", "Nama", 180),
  kcol.text("Address", "Alamat", 200),
  kcol.text("City", "Kota", 110),
  kcol.text("Province", "Provinsi", 110),
  kcol.text("Phone", "Telepon", 120),
  kcol.text("ContactPerson", "Kontak", 110),
  kcol.text("Email", "Email", 170),
  { ...kcol.int("TransactionCount", "Jml Transaksi", 110), sortKey: false },
  { ...kcol.money("TotalSpent", "Total Belanja", 130), sortKey: false },
  kcol.text("CustomerGroup.Name", "Grup Pelanggan", 130),
  kcol.text("Region.Name", "Wilayah", 110),
  kcol.text("SubRegion.Name", "Sub Wilayah", 110),
  kcol.text("SalesPerson.Name", "Sales", 120),
  kcol.money("CreditLimit", "Limit Piutang", 120),
  kcol.int("DueDays", "Jatuh Tempo", 100),
  kcol.money("TotalReceivable", "Piutang", 120),
  kcol.int("PointBalance", "Point", 80),
  kcol.money("DepositBalance", "Deposit", 120),
  kcol.text("Country", "Negara", 100),
  kcol.text("PostalCode", "Kode Pos", 90),
  kcol.text("Fax", "Fax", 110),
  kcol.text("TaxID", "NPWP", 150),
  kcol.text("Notes", "Keterangan", 200),
];

const SORTS: KSortOption[] = [
  { value: "Code", label: "Kode" },
  { value: "Name", label: "Nama" },
  { value: "Address", label: "Alamat" },
  { value: "City", label: "Kota" },
  { value: "Province", label: "Provinsi" },
  { value: "Phone", label: "Telepon" },
  { value: "Email", label: "Email" },
  { value: "CustomerGroup.Name", label: "Grup Pelanggan" },
  { value: "Region.Name", label: "Wilayah" },
  { value: "CreatedAt", label: "Tanggal Input" },
];

const FILTERS: KListFilter[] = [
  { key: "group", label: "Grup Pelanggan", type: "select", optionsFrom: { endpoint: "customer-group" }, where: (v) => ({ CustomerGroupID: Number(v) }) },
  { key: "region", label: "Wilayah", type: "select", optionsFrom: { endpoint: "region" }, where: (v) => ({ RegionID: Number(v) }) },
  { key: "sales", label: "Sales", type: "select", optionsFrom: { endpoint: "sales-person" }, where: (v) => ({ SalesPersonID: Number(v) }) },
];

const SEARCH = ["Code", "Name", "Address", "City", "Province", "Phone", "Email", "ContactPerson"];

export default function CustomersPage() {
  const [history, setHistory] = useState<KRow | null>(null);
  return (
    <>
      <KetokoList
        title="Daftar Pelanggan"
        endpoint="customer"
        basePath="/master/customers"
        include="CustomerGroup,Region,SubRegion,SalesPerson"
        searchFields={SEARCH}
        searchPlaceholder="Kode / nama / alamat / telepon"
        filters={FILTERS}
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
      <PartnerHistoryModal open={!!history} onClose={() => setHistory(null)} partner={history} kind="customer" />
    </>
  );
}
