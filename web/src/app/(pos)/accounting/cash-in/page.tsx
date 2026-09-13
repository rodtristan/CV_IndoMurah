"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, RefreshCw, Search, ArrowDownCircle } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CashInPage() {
  const [cashIns, setCashIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({ date: "", code: "", accountId: "", amount: 0, description: "", paymentMethod: "CASH" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("cash-in", { $search: search || undefined } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setCashIns(res.data?.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchAccounts = useCallback(async () => {
    const res = await api.get("accounts", { $select: "id,code,name", $where: "type eq REVENUE or type eq ASSET" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setAccounts(res.data?.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSave = async () => {
    await api.post("cash-in", form).catch(() => ({}));
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`cash-in`, id).catch(() => ({}));
    fetchData();
  };

  const columns = [
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "accountName", label: "Akun" },
    { key: "description", label: "Keterangan" },
    { key: "paymentMethod", label: "Metode", render: (v: unknown) => <Badge variant="info">{v as string}</Badge> },
    { key: "amount", label: "Jumlah", align: "right" as const, render: (v: unknown) => <span className="font-bold text-success">{formatCurrency(v as number)}</span> },
    {
      key: "actions", label: "", width: "80px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" icon={Edit2} onClick={() => { setForm(row); setShowForm(true); }} />
          <Button size="sm" variant="ghost" icon={Trash2} onClick={() => handleDelete(row.id)} />
        </div>
      )
    },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Kas Masuk" subtitle="Daftar transaksi kas masuk"
        actions={<Button variant="primary" icon={Plus} onClick={() => { setForm({ date: new Date().toISOString().split("T")[0], code: "", accountId: "", amount: 0, description: "", paymentMethod: "CASH" }); setShowForm(true); }}>Tambah</Button>} />

      <Card>
        <div className="mb-4 flex gap-4">
          <Input placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" leftIcon={Search} />
          <Button variant="outline" icon={RefreshCw} onClick={fetchData} loading={loading}>Refresh</Button>
        </div>
        <DataTable data={cashIns} columns={columns} loading={loading} emptyMessage="Tidak ada data kas masuk" />
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Kas Masuk Baru" size="md">
        <div className="space-y-4">
          <Input label="Tanggal" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <Select label="Akun" value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} options={accounts.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))} />
          <Input label="Jumlah" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
          <Select label="Metode Bayar" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} options={[{ value: "CASH", label: "Tunai" }, { value: "TRANSFER", label: "Transfer" }, { value: "DEBIT", label: "Debit" }, { value: "QRIS", label: "QRIS" }]} />
          <Input label="Keterangan" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}

