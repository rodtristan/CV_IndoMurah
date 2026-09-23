"use client";

import { Badge } from "@/components/ui/StatCard";
import { TransactionList } from "@/components/transaction/TransactionList";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusColors: Record<string, string> = { PENDING: "warning", PAID: "success", PARTIAL: "info", INSTALMENT: "info", CANCELLED: "danger" };
const statusLabels: Record<string, string> = { PENDING: "Kredit", PAID: "Lunas", PARTIAL: "Sebagian", INSTALMENT: "Cicilan", CANCELLED: "Batal" };

export default function PurchaseListPage() {
  return (
    <TransactionList
      endpoint="purchases"
      basePath="/purchase/list"
      include="Supplier,Warehouse,PaymentStatus,Status"
      deleteLabel="Pembelian"
      emptyMessage="Tidak ada pembelian"
      searchPlaceholder="No. transaksi..."
      filterPartner={{ field: "SupplierID", endpoint: "supplier", label: "Supplier" }}
      statusFilter={{
        relation: "PaymentStatus",
        options: [{ value: "PENDING", label: "Kredit" }, { value: "PARTIAL", label: "Sebagian" }, { value: "PAID", label: "Lunas" }, { value: "CANCELLED", label: "Batal" }],
      }}
      sortOptions={[{ value: "Date", label: "Tanggal" }, { value: "Code", label: "No. Transaksi" }, { value: "Total", label: "Total" }, { value: "CreatedAt", label: "Waktu Input" }]}
      canDelete={(r) => r.Status?.Code === "DRAFT"}
      columns={[
        { key: "Code", label: "No. Transaksi", render: (v) => <span className="font-mono text-xs">{v as string}</span> },
        { key: "Date", label: "Tanggal", render: (v) => formatDate(v as string) },
        { key: "DueDate", label: "Jatuh Tempo", render: (v) => (v ? formatDate(v as string) : "-") },
        { key: "Supplier", label: "Supplier", render: (v) => (v as { Name?: string })?.Name || "-" },
        { key: "Warehouse", label: "Gudang", render: (v) => (v as { Name?: string })?.Name || "-" },
        { key: "Status.Code", label: "Status", render: (v) => <Badge variant={((v as string) === "DRAFT" ? "warning" : "info") as never}>{v as string}</Badge> },
        { key: "PaymentStatus.Code", label: "Pembayaran", render: (v) => <Badge variant={(statusColors[v as string] || "default") as never}>{statusLabels[v as string] || (v as string)}</Badge> },
        { key: "Total", label: "Total", align: "right", render: (v) => <span className="font-semibold">{formatCurrency(v as number)}</span> },
        { key: "Paid", label: "Dibayar", align: "right", render: (v) => <span className="text-success">{formatCurrency(v as number)}</span> },
        { key: "Remaining", label: "Sisa", align: "right", render: (v) => <span className={Number(v) > 0 ? "font-bold text-danger" : ""}>{formatCurrency(v as number)}</span> },
      ]}
    />
  );
}
