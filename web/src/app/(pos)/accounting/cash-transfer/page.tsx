"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Search, ArrowRight } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CashTransferPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({ date: "", code: "", fromAccountId: "", toAccountId: "", amount: 0, description: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("cash-transfer", { $search: search || undefined } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setTransfers(res.data?.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchAccounts = useCallback(async () => {
    const res = await api.get("accounts", { $select: "id,code,name", $where: "type eq ASSET" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setAccounts(res.data?.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSave = async () => {
    await api.post("cash-transfer", form).catch(() => ({}));
    setShowForm(false);
    fetchData();
  };

  const columns = [
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "fromAccountName", label: "Dari" },
    { key: "toAccountName", label: "Ke" },
    { key: "amount", label: "Jumlah", align: "right" as const, render: (v: unknown) => <span className="font-bold text-primary">{formatCurrency(v as number)}</span> },
    { key: "description", label: "Keterangan" },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Transfer Kas" subtitle="Transfer antar akun kas/bank"
        actions={<Button variant="primary" icon={Plus} onClick={() => { setForm({ date: new Date().toISOString().split("T")[0], code: "", fromAccountId: "", toAccountId: "", amount: 0, description: "" }); setShowForm(true); }}>Tambah</Button>} />

      <Card>
        <div className="mb-4 flex gap-4">
          <Input placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" leftIcon={Search} />
          <Button variant="outline" icon={RefreshCw} onClick={fetchData} loading={loading}>Refresh</Button>
        </div>
        <DataTable data={transfers} columns={columns} loading={loading} emptyMessage="Tidak ada transfer" />
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Transfer Baru" size="md">
        <div className="space-y-4">
          <Input label="Tanggal" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <Select label="Dari Akun" value={form.fromAccountId} onChange={e => setForm(f => ({ ...f, fromAccountId: e.target.value }))} options={accounts.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))} />
          <Select label="Ke Akun" value={form.toAccountId} onChange={e => setForm(f => ({ ...f, toAccountId: e.target.value }))} options={accounts.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))} />
          <Input label="Jumlah" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
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
