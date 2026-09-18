"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon, RowDeleteIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CashOutPage() {
  const [cashOuts, setCashOuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({ date: "", code: "", accountId: "", amount: 0, description: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("cash-out", { $search: search || undefined, $include: "account" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setCashOuts(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchAccounts = useCallback(async () => {
    const res = await api.get("account", { $select: "ID,Code,Name", $where: { Type: { Code: { in: ["EXPENSE", "ASSET"] } } } } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setAccounts(res.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSave = async () => {
    const isEdit = Boolean((form as any).id);
    const payload = {
      code: form.code || `CO-${Date.now()}`,
      accountId: Number(form.accountId),
      amount: Number(form.amount),
      description: form.description || undefined,
    };
    if (isEdit) {
      await api.patch("cash-out", (form as any).id, payload).catch(() => ({}));
    } else {
      await api.post("cash-out", payload).catch(() => ({}));
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`cash-out`, id).catch(() => ({}));
    fetchData();
  };

  const columns = [
    { key: "Date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "Code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Account", label: "Akun", render: (v: unknown) => (v as any)?.Name || "-" },
    { key: "Description", label: "Keterangan" },
    { key: "Amount", label: "Jumlah", align: "right" as const, render: (v: unknown) => <span className="font-bold text-danger">{formatCurrency(v as number)}</span> },
    {
      key: "actions", label: "", width: "70px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-1">
          <RowEditIcon onClick={() => { setForm({ id: row.ID, date: row.Date ? String(row.Date).split("T")[0] : "", code: row.Code, accountId: row.AccountID != null ? String(row.AccountID) : "", amount: row.Amount, description: row.Description || "" } as any); setShowForm(true); }} />
          <RowDeleteIcon onClick={() => handleDelete(row.ID)} />
        </div>
      )
    },
  ];

  const openCreate = () => { setForm({ date: new Date().toISOString().split("T")[0], code: "", accountId: "", amount: 0, description: "" }); setShowForm(true); };

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari..." }]}
          onFilter={(v) => setSearch((v.search as string) || "")}
          loading={loading}
          actions={<GridActions onAdd={openCreate} />}
        />
        <div className="mt-4">
          <DataTable data={cashOuts} columns={columns} loading={loading} emptyMessage="Tidak ada data kas keluar" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Kas Keluar Baru" size="md">
        <div className="space-y-4">
          <Input label="Tanggal" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <Select label="Akun" value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} options={accounts.map(a => ({ value: a.ID, label: `${a.Code} - ${a.Name}` }))} />
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
