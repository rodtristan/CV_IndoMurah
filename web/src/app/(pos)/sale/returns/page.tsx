"use client";

import { Badge } from "@/components/ui/StatCard";
import { TransactionList } from "@/components/transaction/TransactionList";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusColors: Record<string, string> = { DRAFT: "warning", CONFIRMED: "info", COMPLETED: "success", CANCELLED: "danger" };

export default function SaleReturnsPage() {
  return (
    <TransactionList
      endpoint="SaleReturns"
      basePath="/sale/returns"
      include="Sale,Customer,Warehouse,Status"
      deleteLabel="Retur Penjualan"
      emptyMessage="Tidak ada retur penjualan"
      filterPartner={{ field: "CustomerID", endpoint: "customer", label: "Pelanggan" }}
      statusFilter={{
        relation: "Status",
        options: [{ value: "DRAFT", label: "Draft" }, { value: "CONFIRMED", label: "Dikonfirmasi" }, { value: "COMPLETED", label: "Selesai" }, { value: "CANCELLED", label: "Dibatalkan" }],
      }}
      sortOptions={[{ value: "Date", label: "Tanggal" }, { value: "Code", label: "No. Transaksi" }, { value: "TotalReturn", label: "Total Retur" }, { value: "CreatedAt", label: "Waktu Input" }]}
      canDelete={(r) => r.Status?.Code === "DRAFT"}
      columns={[
        { key: "Code", label: "No. Transaksi", render: (v) => <span className="font-mono text-xs">{v as string}</span> },
        { key: "Date", label: "Tanggal", render: (v) => formatDate(v as string) },
        { key: "Sale", label: "Faktur Penjualan", render: (v) => <span className="font-mono text-xs">{(v as { Code?: string })?.Code || "-"}</span> },
        { key: "Customer", label: "Pelanggan", render: (v) => (v as { Name?: string })?.Name || "-" },
        { key: "Warehouse", label: "Gudang", render: (v) => (v as { Name?: string })?.Name || "-" },
        { key: "Status.Code", label: "Status", render: (v) => <Badge variant={(statusColors[v as string] || "default") as never}>{v as string}</Badge> },
        { key: "TotalReturn", label: "Total Retur", align: "right", render: (v) => <span className="font-bold text-danger">{formatCurrency(v as number)}</span> },
        { key: "Reason", label: "Keterangan" },
      ]}
    />
  );
}
