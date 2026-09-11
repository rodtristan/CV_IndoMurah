"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/ui/DataTable";
import { Button } from "@/components/ui/Button";

const mockNumbering = [
  { id: 1, type: "Penjualan", prefix: "TRX", format: "TRX-YYYYMMDD-####", nextNumber: 1 },
  { id: 2, type: "Pembelian", prefix: "BLI", format: "BLI-YYYYMMDD-####", nextNumber: 1 },
  { id: 3, type: "Item Masuk", prefix: "IN", format: "IN-YYYYMMDD-####", nextNumber: 1 },
  { id: 4, type: "Item Keluar", prefix: "OUT", format: "OUT-YYYYMMDD-####", nextNumber: 1 },
];

export default function NumberingSettingsPage() {
  const columns = [
    { key: "type", label: "Tipe Transaksi", sortable: true },
    { key: "prefix", label: "Prefix" },
    { key: "format", label: "Format" },
    { key: "nextNumber", label: "Next Number", align: "right" as const },
  ];
  return (
    <PageWrapper>
      <PageTitle title="Setting Nomor" subtitle="Pengaturan format nomor transaksi" actions={<Button>Reset Nomor</Button>} />
      <DataTable data={mockNumbering} columns={columns} />
    </PageWrapper>
  );
}
