"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, Users, AlertTriangle, Wallet, Trash2 } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { StatCard, Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { UtilityButton, GridActions } from "@/components/ui/GridActions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

function PaymentModal({ row, onClose, onPaid }: { row: any; onClose: () => void; onPaid: () => void }) {
  const [methods, setMethods] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ methodId: "", amount: "", referenceNumber: "", notes: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [methodsRes, paymentsRes] = await Promise.all([
        api.get("payment-methods").catch(() => ({ success: false, data: [] } as any)),
        api.get(`SalePayments/sale/${row.saleId}`).catch(() => ({ success: false, data: [] } as any)),
      ]);
      setMethods(methodsRes.success ? methodsRes.data || [] : []);
      setPayments(paymentsRes.success ? paymentsRes.data || [] : []);
      if (methodsRes.success && methodsRes.data?.[0]) {
        setForm((f) => ({ ...f, methodId: String(methodsRes.data[0].ID) }));
      }
    } finally { setLoading(false); }
  }, [row.saleId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setError("");
    const amount = Number(form.amount);
    if (!form.methodId || !amount || amount <= 0) { setError("Pilih metode dan isi jumlah bayar."); return; }
    if (amount > row.remaining) { setError(`Jumlah melebihi sisa piutang (${formatCurrency(row.remaining)}).`); return; }

    setSaving(true);
    try {
      const res = await api.post("SalePayments", {
        SaleID: row.saleId,
        MethodID: Number(form.methodId),
        Amount: amount,
        ReferenceNumber: form.referenceNumber || undefined,
        Notes: form.notes || undefined,
      }).catch(() => ({ success: false } as any));
      if (res.success) {
        setForm({ methodId: form.methodId, amount: "", referenceNumber: "", notes: "" });
        await load();
        onPaid();
      } else {
        setError(res?.message || "Gagal menyimpan pembayaran.");
      }
    } finally { setSaving(false); }
  };

  const handleDeletePayment = async (id: number) => {
    await api.delete("SalePayments", id).catch(() => ({}));
    await load();
    onPaid();
  };

  return (
    <Modal open onClose={onClose} title={`Pembayaran — ${row.code}`} size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 rounded-lg bg-elevated p-3 text-sm">
          <div><span className="text-muted">Total</span><p className="font-semibold">{formatCurrency(row.total)}</p></div>
          <div><span className="text-muted">Dibayar</span><p className="font-semibold text-success">{formatCurrency(row.paid)}</p></div>
          <div><span className="text-muted">Sisa</span><p className="font-semibold text-warning">{formatCurrency(row.remaining)}</p></div>
        </div>

        {payments.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-highlighted">Riwayat Pembayaran</p>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {payments.map((p) => (
                <div key={p.ID} className="flex items-center justify-between rounded-lg border border-default px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{formatCurrency(Number(p.Amount))}</p>
                    <p className="text-xs text-muted">{formatDate(p.Date)} {p.ReferenceNumber ? `· ${p.ReferenceNumber}` : ""}</p>
                  </div>
                  <button onClick={() => handleDeletePayment(p.ID)} className="rounded p-1.5 text-muted hover:bg-danger/10 hover:text-danger">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {row.remaining > 0 && (
          <div className="space-y-3 border-t border-default pt-4">
            <p className="text-sm font-medium text-highlighted">Bayar Sekarang</p>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Metode Bayar"
                value={form.methodId}
                onChange={(e) => setForm((f) => ({ ...f, methodId: e.target.value }))}
                options={methods.map((m) => ({ value: String(m.ID), label: m.Name }))}
              />
              <Input label="Jumlah" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
            </div>
            <Input label="No. Referensi (opsional)" value={form.referenceNumber} onChange={(e) => setForm((f) => ({ ...f, referenceNumber: e.target.value }))} placeholder="No. giro/cek/transfer" />
            <Input label="Catatan" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Tutup</Button>
              <Button variant="primary" icon={Wallet} onClick={handleSave} loading={saving}>Simpan Pembayaran</Button>
            </div>
          </div>
        )}
        {row.remaining <= 0 && (
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Tutup</Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function ReceivableReportPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [payRow, setPayRow] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("reports/receivable").catch(() => ({ success: false, data: null } as any));
      if (res.success) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { summary = {}, receivables = [], aging = [] } = data || {};

  const agingVariant = (label: string) =>
    label === "Belum Jatuh Tempo" ? "success" : label === "> 90 Hari" ? "danger" : "warning";

  const columns = [
    { key: "code", label: "Kode Penjualan", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "customerName", label: "Pelanggan" },
    { key: "total", label: "Total", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "paid", label: "Dibayar", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "remaining", label: "Sisa Piutang", align: "right" as const, render: (v: unknown) => <span className="font-bold text-warning">{formatCurrency(v as number)}</span> },
    {
      key: "agingBucket", label: "Umur Piutang",
      render: (v: unknown) => <Badge variant={agingVariant(v as string)}>{v as string}</Badge>,
    },
    {
      key: "actions", label: "", width: "90px",
      render: (_: unknown, row: any) => (
        <Button variant="outline" size="sm" icon={Wallet} onClick={() => setPayRow(row)}>Bayar</Button>
      ),
    },
  ];

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Piutang" value={formatCurrency(summary.totalReceivable || 0)} icon={Users} iconClassName="bg-warning/10 text-warning" />
        <StatCard title="Sudah Dibayar" value={formatCurrency(summary.totalPaid || 0)} icon={Users} iconClassName="bg-success/10 text-success" />
        <StatCard title="Sisa Piutang" value={formatCurrency(summary.remainingReceivable || 0)} icon={AlertTriangle} iconClassName="bg-danger/10 text-danger" />
      </div>

      {aging.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-3 font-semibold text-highlighted">Umur Piutang (Aging)</h3>
          <div className="flex flex-wrap gap-3">
            {aging.map((bucket: any) => (
              <div key={bucket.label} className="flex items-center gap-2 rounded-lg border border-default px-3 py-2">
                <Badge variant={agingVariant(bucket.label)}>{bucket.label}</Badge>
                <span className="text-sm text-muted">{bucket.count} transaksi</span>
                <span className="text-sm font-semibold">{formatCurrency(bucket.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <FilterBar
          fields={[]}
          onFilter={() => fetchData()}
          loading={loading}
          actions={<UtilityButton icon={Download}>Export</UtilityButton>}
        />
        <div className="mt-4">
          <h3 className="mb-4 font-semibold text-highlighted">Rincian Piutang</h3>
          <DataTable data={receivables} columns={columns} loading={loading} emptyMessage="Tidak ada data piutang" />
        </div>
      </Card>

      {payRow && <PaymentModal row={payRow} onClose={() => setPayRow(null)} onPaid={fetchData} />}
    </PageWrapper>
  );
}
