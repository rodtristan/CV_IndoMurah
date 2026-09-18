"use client";

import { useState, useEffect, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { GridActions, RowEditIcon, RowDeleteIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";

const MODULE_OPTIONS = [
  { value: "sale", label: "Penjualan (Kasir)" },
  { value: "sale-return", label: "Retur Penjualan" },
  { value: "purchase", label: "Pembelian" },
  { value: "purchase-order", label: "Pesanan Pembelian" },
  { value: "purchase-return", label: "Retur Pembelian" },
  { value: "stock-in", label: "Item Masuk" },
  { value: "stock-out", label: "Item Keluar" },
  { value: "stock-transfer", label: "Transfer Stock" },
  { value: "stock-opname", label: "Stock Opname" },
  { value: "cash-in", label: "Kas Masuk" },
  { value: "cash-out", label: "Kas Keluar" },
  { value: "customer", label: "No. Pelanggan" },
  { value: "supplier", label: "No. Supplier" },
  { value: "sales-person", label: "No. Sales" },
];

function preview(prefix: string, digitCount: number, lastNumber: number, suffix: string) {
  const next = String(lastNumber + 1).padStart(digitCount, "0");
  return `${prefix}${next}${suffix}`;
}

export default function NumberingSettingsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [resetTarget, setResetTarget] = useState<any>(null);
  const [form, setForm] = useState({ type: "", prefix: "", suffix: "", digitCount: 4, lastNumber: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("numbering", { $orderBy: { type: "asc" } } as any).catch(() => ({ success: false, data: [] } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setForm({ type: MODULE_OPTIONS[0].value, prefix: "", suffix: "", digitCount: 4, lastNumber: 0 });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.type) return;
    const payload = {
      type: form.type,
      prefix: form.prefix || "",
      suffix: form.suffix || "",
      digitCount: Number(form.digitCount) || 4,
      lastNumber: Number(form.lastNumber) || 0,
    };
    const isEdit = Boolean((form as any).id);
    if (isEdit) {
      await api.patch("numbering", (form as any).id, payload).catch(() => ({}));
    } else {
      await api.post("numbering", payload).catch(() => ({}));
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    await api.delete("numbering", String(id)).catch(() => ({}));
    fetchData();
  };

  const handleResetLastNumber = async () => {
    if (!resetTarget) return;
    await api.patch("numbering", resetTarget.ID, { lastNumber: 0 }).catch(() => ({}));
    setResetTarget(null);
    fetchData();
  };

  const columns = [
    { key: "Type", label: "Modul", render: (v: unknown) => MODULE_OPTIONS.find((m) => m.value === v)?.label || (v as string) },
    { key: "Prefix", label: "Prefix", render: (v: unknown) => <span className="font-mono text-xs">{(v as string) || "-"}</span> },
    { key: "Suffix", label: "Suffix", render: (v: unknown) => <span className="font-mono text-xs">{(v as string) || "-"}</span> },
    { key: "DigitCount", label: "Digit Counter", align: "right" as const },
    { key: "LastNumber", label: "No. Terakhir", align: "right" as const },
    {
      key: "preview", label: "Contoh Nomor Berikutnya",
      render: (_: unknown, row: any) => <span className="font-mono text-xs text-primary">{preview(row.Prefix, row.DigitCount, row.LastNumber, row.Suffix)}</span>,
    },
    {
      key: "actions", label: "", width: "110px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-1">
          <button
            title="Reset No Terakhir"
            onClick={() => setResetTarget(row)}
            className="rounded p-1 text-muted hover:bg-elevated hover:text-warning"
          >
            <RotateCcw className="size-4" />
          </button>
          <RowEditIcon onClick={() => { setForm({ id: row.ID, type: row.Type, prefix: row.Prefix || "", suffix: row.Suffix || "", digitCount: row.DigitCount, lastNumber: row.LastNumber } as any); setShowForm(true); }} />
          <RowDeleteIcon onClick={() => handleDelete(row.ID)} />
        </div>
      )
    },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-4 text-sm text-muted">
          Setting Nomor mengatur format penomoran otomatis untuk setiap jenis transaksi.
          Nomor berikutnya = Prefix + Counter (dipadatkan sesuai Digit) + Suffix.
        </p>
        <div className="flex justify-end">
          <GridActions onAdd={openCreate} />
        </div>
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Belum ada setting nomor" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Setting Nomor" size="md">
        <div className="space-y-4">
          <Select
            label="Modul"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            options={MODULE_OPTIONS}
            disabled={Boolean((form as any).id)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prefix" value={form.prefix} onChange={(e) => setForm((f) => ({ ...f, prefix: e.target.value }))} placeholder="INV-" />
            <Input label="Suffix" value={form.suffix} onChange={(e) => setForm((f) => ({ ...f, suffix: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Jumlah Digit Counter" type="number" value={form.digitCount} onChange={(e) => setForm((f) => ({ ...f, digitCount: Number(e.target.value) }))} />
            <Input label="No. Terakhir" type="number" value={form.lastNumber} onChange={(e) => setForm((f) => ({ ...f, lastNumber: Number(e.target.value) }))} />
          </div>
          <div className="rounded-lg bg-elevated p-3 text-sm">
            Contoh nomor berikutnya: <span className="font-mono font-semibold text-primary">{preview(form.prefix, form.digitCount, form.lastNumber, form.suffix)}</span>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!resetTarget}
        onClose={() => setResetTarget(null)}
        onConfirm={handleResetLastNumber}
        title="Reset No Terakhir"
        message={`Yakin ingin mereset nomor terakhir untuk modul "${MODULE_OPTIONS.find((m) => m.value === resetTarget?.Type)?.label || resetTarget?.Type}" menjadi 0?`}
        confirmText="Reset"
        variant="danger"
      />
    </PageWrapper>
  );
}
