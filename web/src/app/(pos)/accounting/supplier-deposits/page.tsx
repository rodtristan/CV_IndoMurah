"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Search, Truck } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SupplierDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({ date: "", code: "", supplierId: "", accountId: "", amount: 0, description: "", paymentMethod: "CASH" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("supplier-deposit", { $search: search || undefined, $include: "supplier" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setDeposits(res.data?.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchSuppliers = useCallback(async () => {
    const res = await api.get("suppliers", { $select: "id,name" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setSuppliers(res.data?.data || []);
  }, []);

  const fetchAccounts = useCallback(async () => {
    const res = await api.get("accounts", { $select: "id,code,name", $where: "type eq ASSET" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setAccounts(res.data?.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);
  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSave = async () => {
    await api.post("supplier-deposit", form).catch(() => ({}));
    setShowForm(false);
    fetchData();
  };

  const columns = [
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "supplierName", label: "Supplier" },
    { key: "paymentMethod", label: "Metode" },
    { key: "amount", label: "Jumlah", align: "right" as const, render: (v: unknown) => <span className="font-bold text-warning">{formatCurrency(v as number)}</span> },
    { key: "description", label: "Keterangan" },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Deposit Supplier" subtitle="Uang muka ke supplier"
        actions={<Button variant="primary" icon={Plus} onClick={() => { setForm({ date: new Date().toISOString().split("T")[0], code: "", supplierId: "", accountId: "", amount: 0, description: "", paymentMethod: "CASH" }); setShowForm(true); }}>Tambah</Button>} />

      <Card>
        <div className="mb-4 flex gap-4">
          <Input placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" leftIcon={Search} />
          <Button variant="outline" icon={RefreshCw} onClick={fetchData} loading={loading}>Refresh</Button>
        </div>
        <DataTable data={deposits} columns={columns} loading={loading} emptyMessage="Tidak ada deposit" />
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Deposit Baru" size="md">
        <div className="space-y-4">
          <Input label="Tanggal" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <Select label="Supplier" value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} options={suppliers.map(s => ({ value: s.id, label: s.name }))} />
          <Select label="Akun Kas" value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} options={accounts.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))} />
          <Select label="Metode Bayar" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} options={[{ value: "CASH", label: "Tunai" }, { value: "TRANSFER", label: "Transfer" }]} />
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
