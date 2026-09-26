"use client";

// Data Pengiriman Ketoko: Kata Kunci, No Resi, Kurir, Status Kirim, Urut Berdasar; kolom No Transaksi,
// Dari, Kepada, TotalPesan, Status, TglKirim, No Resi, Kurir. Edit → Status Kirim, Tanggal Kirim, No Resi, Kurir.

import { useRef, useState } from "react";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { localDateTime } from "@/lib/utils";
import { KetokoList, kcol, type KListColumn, type KListFilter, type KRow } from "@/components/ui/KetokoList";
import { Modal } from "@/components/ui/Modal";
import { KInput, KSelect } from "@/components/kform";
import { printTable } from "@/components/transaction/print";

const STATUS: Record<string, string> = { PENDING: "Belum", SHIPPED: "Sudah" };

const COLUMNS: KListColumn[] = [
  kcol.text("Code", "No Transaksi", 160),
  { key: "Warehouse.Code", label: "Dari", width: 90, render: (v) => String(v ?? "TOKO") },
  { key: "Customer.Name", label: "Kepada", width: 180, render: (v, r) => String(r.ShipName || v || "") },
  { key: "TotalQty", label: "TotalPesan", width: 110, align: "right", sortKey: false, render: (v) => Number(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 }) },
  { key: "ShippingStatus", label: "Status", width: 90, render: (v) => STATUS[String(v ?? "PENDING")] ?? String(v ?? "") },
  kcol.datetime("ShippingDate", "TglKirim", 160),
  kcol.text("TrackingNumber", "No Resi", 140),
  kcol.text("Courier", "Kurir", 120),
  { key: "ShipAddress", label: "Alamat Kirim", width: 240, render: (v, r) => [v, r.ShipCity].filter(Boolean).join(", ") },
];

const FILTERS: KListFilter[] = [
  { key: "resi", label: "No Resi", type: "text", where: (v) => ({ TrackingNumber: { contains: v } }) },
  { key: "kurir", label: "Kurir", type: "text", where: (v) => ({ Courier: { contains: v } }) },
  { key: "status", label: "Status Kirim", type: "select", options: [{ value: "PENDING", label: "Belum" }, { value: "SHIPPED", label: "Sudah" }], where: (v) => ({ ShippingStatus: v }) },
];
const SORTS = [
  { value: "Code", label: "No Transaksi" },
  { value: "Date", label: "Tanggal" },
  { value: "Customer.Name", label: "Kepada" },
  { value: "ShippingDate", label: "Tanggal Kirim" },
  { value: "TrackingNumber", label: "No Resi" },
];
const SEARCH = ["Code", "Customer.Name", "ShipName", "ShipAddress", "TrackingNumber", "Courier"];
const BASE_WHERE = { "PaymentStatus.Code": { ne: "CANCELLED" } };

const mapRows = (rows: KRow[]) => rows.map((r) => ({
  ...r,
  TotalQty: (r.SaleItems ?? []).reduce((a: number, i: KRow) => a + Number(i.Quantity ?? 0), 0),
}));

export default function SaleShippingPage() {
  const reloadRef = useRef<() => void>(() => undefined);
  const lastRows = useRef<KRow[]>([]);
  const [edit, setEdit] = useState<KRow | null>(null);
  const [form, setForm] = useState({ status: "PENDING", date: "", resi: "", courier: "" });
  const [saving, setSaving] = useState(false);

  const openEdit = (row: KRow) => {
    setEdit(row);
    setForm({
      status: row.ShippingStatus || "PENDING",
      date: row.ShippingDate ? localDateTime(new Date(row.ShippingDate)) : localDateTime(new Date()),
      resi: row.TrackingNumber ?? "",
      courier: row.Courier ?? "",
    });
  };

  const save = async () => {
    if (!edit) return;
    setSaving(true);
    try {
      await api.put("sales", `${edit.ID}/shipping`, {
        ShippingStatus: form.status,
        ShippingDate: form.date ? new Date(form.date).toISOString() : undefined,
        TrackingNumber: form.resi,
        Courier: form.courier,
      });
      toast.success("Data pengiriman tersimpan");
      setEdit(null);
      reloadRef.current();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const print = () => printTable({
    title: "Daftar Pengiriman",
    columns: ["No Transaksi", "Dari", "Kepada", "TotalPesan", "Status", "TglKirim", "No Resi", "Kurir"],
    rows: lastRows.current.map((r) => [
      r.Code, r.Warehouse?.Code ?? "TOKO", r.ShipName || r.Customer?.Name || "", Number(r.TotalQty ?? 0).toFixed(2),
      STATUS[r.ShippingStatus ?? "PENDING"] ?? "", r.ShippingDate ? new Date(r.ShippingDate).toLocaleString("id-ID") : "", r.TrackingNumber ?? "", r.Courier ?? "",
    ]),
    rightCols: [3],
  });

  return (
    <>
      <KetokoList
        title="Daftar Pengiriman"
        endpoint="sales"
        include="Customer,Warehouse,SaleItems"
        searchFields={SEARCH}
        searchPlaceholder="No transaksi / pelanggan / alamat"
        filters={FILTERS}
        sortOptions={SORTS}
        defaultSort="Code"
        columns={COLUMNS}
        baseWhere={BASE_WHERE}
        mapRows={(rows) => { const m = mapRows(rows); lastRows.current = m; return m; }}
        canAdd={false}
        canCopy={false}
        canDelete={false}
        onEdit={openEdit}
        extraActions={(_sel, reload) => {
          reloadRef.current = reload;
          return (
            <button type="button" onClick={print} className="inline-flex h-9 items-center gap-1.5 rounded border border-default bg-white px-3 text-sm hover:bg-bg">
              <Printer className="size-4" /> Cetak
            </button>
          );
        }}
        emptyMessage="Tidak ada data pengiriman"
      />
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit Pengiriman" size="md">
        <div className="space-y-1">
          <KInput label="No Transaksi" value={edit?.Code ?? ""} readOnly className="border-dashed bg-[#f7f8fa]" />
          <KSelect label="Status Kirim" value={form.status} onChange={(v) => setForm({ ...form, status: v || "PENDING" })} options={[{ value: "SHIPPED", label: "Sudah" }, { value: "PENDING", label: "Belum" }]} />
          <KInput label="Tanggal Kirim" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <KInput label="No Resi" value={form.resi} onChange={(e) => setForm({ ...form, resi: e.target.value })} />
          <KInput label="Kurir" value={form.courier} onChange={(e) => setForm({ ...form, courier: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <button type="button" disabled={saving} onClick={() => void save()} className="h-10 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6]">✔ Simpan</button>
            <button type="button" onClick={() => setEdit(null)} className="h-10 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6]">Kembali</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
