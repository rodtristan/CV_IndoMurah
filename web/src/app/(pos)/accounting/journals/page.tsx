"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon, RowDeleteIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export default function JournalsPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ date: "", description: "", reference: "", totalDebit: 0, totalCredit: 0, details: [] as any[] });
  const [accounts, setAccounts] = useState<any[]>([]);

  const fetchJournals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("journal", { $search: search || undefined } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setJournals(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchAccounts = useCallback(async () => {
    const res = await api.get("account", { $select: "id,code,name,type" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setAccounts(res.data || []);
  }, []);

  useEffect(() => { fetchJournals(); }, [fetchJournals]);
  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSave = async () => {
    const isEdit = Boolean((form as any).id);
    const payload = {
      code: (form as any).code || `J-${Date.now()}`,
      description: form.description || undefined,
      referenceType: form.reference || undefined,
    };
    if (isEdit) {
      await api.patch("journal", (form as any).id, payload).catch(() => ({}));
    } else {
      await api.post("journal", payload).catch(() => ({}));
    }
    setShowForm(false);
    setForm({ date: "", description: "", reference: "", totalDebit: 0, totalCredit: 0, details: [] });
    fetchJournals();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`journal`, deleteId).catch(() => ({}));
    setDeleteId(null);
    fetchJournals();
  };

  const columns = [
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "description", label: "Keterangan" },
    { key: "reference", label: "Referensi", render: (v: unknown) => v ? <span className="text-muted">{v as string}</span> : <span className="text-muted">-</span> },
    { key: "totalDebit", label: "Debit", align: "right" as const, render: (v: unknown) => <span className="font-semibold">{formatCurrency(v as number)}</span> },
    { key: "totalCredit", label: "Kredit", align: "right" as const, render: (v: unknown) => <span className="font-semibold">{formatCurrency(v as number)}</span> },
    {
      key: "actions", label: "", width: "70px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-1">
          <RowEditIcon onClick={() => { setEditData(row); setForm({ date: row.date, description: row.description, reference: row.reference || "", totalDebit: row.totalDebit, totalCredit: row.totalCredit, details: row.details || [] }); setShowForm(true); }} />
          <RowDeleteIcon onClick={() => setDeleteId(row.id)} />
        </div>
      )
    },
  ];

  const openCreate = () => { setEditData(null); setForm({ date: new Date().toISOString().split("T")[0], description: "", reference: "", totalDebit: 0, totalCredit: 0, details: [] }); setShowForm(true); };

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari jurnal..." }]}
          onFilter={(v) => setSearch((v.search as string) || "")}
          loading={loading}
          actions={<GridActions onAdd={openCreate} />}
        />
        <div className="mt-4">
          <DataTable data={journals} columns={columns} loading={loading} emptyMessage="Tidak ada jurnal" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editData ? "Edit Jurnal" : "Jurnal Baru"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tanggal" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Input label="Referensi" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
          </div>
          <Input label="Keterangan" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Debit" type="number" value={form.totalDebit} onChange={e => setForm(f => ({ ...f, totalDebit: Number(e.target.value) }))} />
            <Input label="Total Kredit" type="number" value={form.totalCredit} onChange={e => setForm(f => ({ ...f, totalCredit: Number(e.target.value) }))} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Jurnal" message="Yakin ingin menghapus jurnal ini?" confirmText="Hapus" variant="danger" />
    </PageWrapper>
  );
}
