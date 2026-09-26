"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/Loader";
import { api } from "@/lib/api-client";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const money = (v: unknown) => Number(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const date = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("id-ID") : "");

/** "History Transaksi" di Daftar Pelanggan / Supplier: daftar transaksi partner terpilih. */
export function PartnerHistoryModal({
  open, onClose, partner, kind,
}: { open: boolean; onClose: () => void; partner: Row | null; kind: "customer" | "supplier" }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !partner) return;
    let alive = true;
    setLoading(true);
    const ep = kind === "customer" ? "sales" : "purchases";
    const key = kind === "customer" ? "CustomerID" : "SupplierID";
    api.get<Row[]>(ep, { $where: { [key]: partner.ID }, $orderBy: { Date: "desc" }, $take: 100, $include: kind === "customer" ? "PaymentStatus,Warehouse,SalePayments" : "PaymentStatus,Warehouse" } as never, { skipCache: true })
      .then((r) => alive && setRows(Array.isArray(r.data) ? r.data : []))
      .catch(() => alive && setRows([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [open, partner, kind]);

  const total = rows.reduce((s, r) => s + Number(r.Total ?? 0), 0);
  // Penjualan: terbayar = jumlah SalePayments; Pembelian: kolom Paid.
  const paid = (r: Row) =>
    Array.isArray(r.SalePayments) ? r.SalePayments.reduce((s: number, p: Row) => s + Number(p.Amount ?? 0), 0) : Number(r.Paid ?? 0);

  return (
    <Modal open={open} onClose={onClose} title={`History Transaksi — ${partner?.Code ?? ""} ${partner?.Name ?? ""}`} size="xl">
      {loading ? <LoadingState /> : (
        <div className="max-h-[60vh] overflow-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-[#d6dbe0] text-left">
                <th className="px-2 py-2 font-normal">No. Transaksi</th>
                <th className="px-2 py-2 font-normal">Tanggal</th>
                <th className="px-2 py-2 font-normal">Dept/Gudang</th>
                <th className="px-2 py-2 text-right font-normal">Total</th>
                <th className="px-2 py-2 text-right font-normal">Bayar</th>
                <th className="px-2 py-2 text-right font-normal">Sisa</th>
                <th className="px-2 py-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-[#9aa3ad]">Belum ada transaksi</td></tr>
              ) : rows.map((r) => (
                <tr key={r.ID} className="border-b border-[#eef0f2]">
                  <td className="px-2 py-1.5 font-mono text-xs">{r.Code}</td>
                  <td className="px-2 py-1.5">{date(r.Date)}</td>
                  <td className="px-2 py-1.5">{r.Warehouse?.Name ?? ""}</td>
                  <td className="px-2 py-1.5 text-right">{money(r.Total)}</td>
                  <td className="px-2 py-1.5 text-right">{money(paid(r))}</td>
                  <td className="px-2 py-1.5 text-right">{money(Number(r.Total ?? 0) - paid(r))}</td>
                  <td className="px-2 py-1.5">{r.PaymentStatus?.Name ?? ""}</td>
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="font-semibold">
                  <td className="px-2 py-2" colSpan={3}>{rows.length} transaksi</td>
                  <td className="px-2 py-2 text-right">{money(total)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </Modal>
  );
}
