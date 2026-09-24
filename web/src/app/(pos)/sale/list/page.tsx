"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftRight, Download } from "lucide-react";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/StatCard";
import { TransactionList } from "@/components/transaction/TransactionList";
import { formatCurrency, formatDate } from "@/lib/utils";

const variants: Record<string, string> = { PAID: "success", PARTIAL: "warning", PENDING: "default", CANCELLED: "danger" };
const labels: Record<string, string> = { PAID: "Lunas", PARTIAL: "Sebagian", PENDING: "Kredit", CANCELLED: "Batal" };
const methods: Record<string, string> = { CASH: "Tunai", TRANSFER: "Transfer", DEBIT: "Debit", QRIS: "QRIS", CREDIT: "Kredit" };

// Exports every sale (all pages, newest first) as CSV; the list's on-screen filters are internal to TransactionList.
async function exportSalesCsv() {
  const rows: any[] = [];
  for (let skip = 0; skip < 20000; skip += 500) {
    const r = await api.get<any[]>("sales", { $include: "Customer,SalesPerson,PaymentStatus,PaymentMethod", $take: 500, $skip: skip, $orderBy: { Date: "desc" } }, { skipCache: true });
    const d = r.data ?? [];
    rows.push(...d);
    if (d.length < 500) break;
  }
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["No. Transaksi", "Tanggal", "Pelanggan", "Sales", "Metode", "Status", "Subtotal", "Diskon", "Pajak", "Total"];
  const lines = rows.map((s) => [s.Code, String(s.Date ?? "").slice(0, 10), s.Customer?.Name, s.SalesPerson?.Name, s.PaymentMethod?.Name, s.PaymentStatus?.Code, s.Subtotal, s.DiscountAmount, s.TaxAmount, s.Total].map(esc).join(","));
  const blob = new Blob(["\uFEFF" + [head.map(esc).join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `faktur-penjualan-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function SaleListPage() {
  const router = useRouter();
  return (
    <TransactionList
      endpoint="sales"
      basePath="/sale/list"
      include="Customer,Warehouse,SalesPerson,Creator,PaymentStatus,PaymentMethod"
      deleteLabel="Penjualan"
      emptyMessage="Tidak ada penjualan"
      searchPlaceholder="No. transaksi..."
      filterPartner={{ field: "CustomerID", endpoint: "customer", label: "Pelanggan" }}
      statusFilter={{
        relation: "PaymentStatus",
        options: [{ value: "PAID", label: "Lunas" }, { value: "PENDING", label: "Kredit / Tertunda" }, { value: "PARTIAL", label: "Sebagian" }, { value: "CANCELLED", label: "Batal" }],
      }}
      sortOptions={[{ value: "Date", label: "Tanggal" }, { value: "Code", label: "No. Transaksi" }, { value: "Total", label: "Total" }, { value: "CreatedAt", label: "Waktu Input" }]}
      canDelete={(r) => r.PaymentStatus?.Code === "PENDING"}
      extraActions={(row) => (
        <>
        <button type="button" title="Ekspor semua faktur penjualan ke CSV" onClick={() => void exportSalesCsv()} className="inline-flex h-9 items-center gap-1.5 rounded border border-default bg-white px-3 text-sm hover:bg-bg"><Download className="size-4" /> Ekspor CSV</button>
        <button
          type="button"
          disabled={!row}
          title="Retur penjualan dari transaksi ini"
          onClick={() => row && router.push(`/sale/returns/new?saleId=${row.ID}`)}
          className="inline-flex h-9 items-center gap-1.5 rounded border border-default bg-white px-3 text-sm hover:bg-bg disabled:opacity-40"
        >
          <ArrowLeftRight className="size-4" /> Retur
        </button>
        </>
      )}
      columns={[
        { key: "Code", label: "No. Transaksi", render: (v) => <span className="font-mono text-xs">{v as string}</span> },
        { key: "Date", label: "Tanggal", render: (v) => formatDate(v as string) },
        { key: "Customer", label: "Pelanggan", render: (v) => (v as { Name?: string })?.Name || "-" },
        { key: "SalesPerson", label: "Sales", render: (v) => (v as { Name?: string })?.Name || "-" },
        { key: "Warehouse", label: "Gudang", render: (v) => (v as { Name?: string })?.Name || "-" },
        { key: "PaymentMethod.Code", label: "Metode", render: (_, row) => <span className="text-xs">{methods[row.PaymentMethod?.Code] || row.PaymentMethod?.Code || "-"}</span> },
        { key: "PaymentStatus.Code", label: "Status", render: (v) => <Badge variant={(variants[v as string] || "default") as never}>{labels[v as string] || (v as string)}</Badge> },
        { key: "Total", label: "Total", align: "right", render: (v) => <span className="font-semibold">{formatCurrency(v as number)}</span> },
        { key: "Creator.Name", label: "Kasir", render: (_, row) => row.Creator?.Name || "-" },
      ]}
    />
  );
}
