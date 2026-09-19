"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CustomerDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({ date: "", code: "", customerId: "", amount: 0, description: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("customer-deposit", { $search: search || undefined, $include: "customer" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setDeposits(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchCustomers = useCallback(async () => {
    const res = await api.get("customer", { $select: "ID,Name" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setCustomers(res.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleSave = async () => {
    const isEdit = Boolean((form as any).id);
    setSaving(true);
    const payload = {
      code: form.code || `DP-${Date.now()}`,
      customerId: Number(form.customerId),
      amount: Number(form.amount),
      description: form.description || undefined,
    };
    if (isEdit) {
      await api.patch("customer-deposit", (form as any).id, payload).catch(() => ({}));
    } else {
      await api.post("customer-deposit", payload).catch(() => ({}));
    }
    setSaving(false);
    setShowForm(false);
    fetchData();
  };

  const columns = [
    { key: "edit", label: "", width: 36, render: (_: unknown, row: any) => <RowEditIcon onClick={() => openEdit(row)} /> },
    { key: "Date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "Code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Customer", label: "Pelanggan", render: (v: unknown) => (v as any)?.Name || "-" },
    { key: "Amount", label: "Jumlah", align: "right" as const, render: (v: unknown) => <span className="font-bold text-success">{formatCurrency(v as number)}</span> },
    { key: "RemainingAmount", label: "Sisa", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "Description", label: "Keterangan" },
  ];

  const rowToForm = (row: any) => ({ date: row.Date ? String(row.Date).split("T")[0] : "", code: row.Code, customerId: row.CustomerID != null ? String(row.CustomerID) : "", amount: Number(row.Amount), description: row.Description || "" });
  const openEdit = (row: any) => { setSelected(row); setForm({ id: row.ID, ...rowToForm(row) } as any); setShowForm(true); };
  const openCopy = (row: any) => { setForm({ ...rowToForm(row), date: new Date().toISOString().split("T")[0], code: "" } as any); setShowForm(true); };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete("customer-deposit", selected.ID).catch(() => ({}));
      setShowDelete(false);
      setSelected(null);
      fetchData();
    } finally { setSaving(false); }
  };

  const openCreate = () => { setForm({ date: new Date().toISOString().split("T")[0], code: "", customerId: "", amount: 0, description: "" }); setShowForm(true); };

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari..." }]}
          onFilter={(v) => setSearch((v.search as string) || "")}
          loading={loading}
          actions={
            <GridActions
              onAdd={openCreate}
              onEdit={() => selected && openEdit(selected)}
              onCopy={() => selected && openCopy(selected)}
              onDelete={() => selected && setShowDelete(true)}
              disableEdit={!selected}
              disableCopy={!selected}
              disableDelete={!selected}
            />
          }
        />
        <div className="mt-4">
          <DataTable data={deposits} columns={columns} loading={loading} selectedId={selected?.ID ?? null} onRowClick={setSelected} emptyMessage="Tidak ada deposit" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={(form as any).id ? "Ubah Deposit" : "Deposit Baru"} size="md"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}
      >
        <div className="space-y-4">
          <Input label="Tanggal" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <Select label="Pelanggan" value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} options={customers.map(c => ({ value: c.ID, label: c.Name }))} />
          <Input label="Jumlah" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
          <Input label="Keterangan" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
      </Modal>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Deposit"
        message={`Yakin ingin menghapus ${selected?.Code ?? "data ini"}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}
