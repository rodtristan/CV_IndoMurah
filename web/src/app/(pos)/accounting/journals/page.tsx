"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
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

type EntryLine = { accountId: string; debit: string; credit: string; memo: string };
const EMPTY_LINE: EntryLine = { accountId: "", debit: "0", credit: "0", memo: "" };

export default function JournalsPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ date: "", description: "", reference: "" });
  const [lines, setLines] = useState<EntryLine[]>([{ ...EMPTY_LINE }, { ...EMPTY_LINE }]);
  const [accounts, setAccounts] = useState<any[]>([]);

  const fetchJournals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("journal", { $search: search || undefined, $include: "JournalEntries,JournalEntries.Account" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setJournals(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchAccounts = useCallback(async () => {
    const res = await api.get("account", { $select: "ID,Code,Name" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setAccounts(res.data || []);
  }, []);

  useEffect(() => { fetchJournals(); }, [fetchJournals]);
  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.round(totalDebit * 100) === Math.round(totalCredit * 100) && totalDebit > 0;

  const updateLine = (idx: number, patch: Partial<EntryLine>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };
  const addLine = () => setLines((prev) => [...prev, { ...EMPTY_LINE }]);
  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaveError("");
    const entries = lines
      .filter((l) => l.accountId && (Number(l.debit) > 0 || Number(l.credit) > 0))
      .map((l) => ({ accountId: Number(l.accountId), debit: Number(l.debit) || 0, credit: Number(l.credit) || 0, memo: l.memo || undefined }));

    if (entries.length === 0) { setSaveError("Isi minimal 1 baris debit/kredit."); return; }
    if (!isBalanced) { setSaveError(`Tidak balance: Debit ${formatCurrency(totalDebit)} ≠ Kredit ${formatCurrency(totalCredit)}`); return; }

    setSaving(true);
    try {
      const payload = {
        date: form.date || undefined,
        description: form.description || undefined,
        referenceType: form.reference || undefined,
        entries,
      };
      const res = await api.post("journal", payload).catch(() => ({ success: false } as any));
      if (res.success) {
        setShowForm(false);
        setForm({ date: "", description: "", reference: "" });
        setLines([{ ...EMPTY_LINE }, { ...EMPTY_LINE }]);
        fetchJournals();
      } else {
        setSaveError(res?.message || "Gagal menyimpan jurnal.");
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`journal`, deleteId).catch(() => ({}));
    setDeleteId(null);
    fetchJournals();
  };

  const rowTotals = (row: any) => {
    const entries = row.JournalEntries || [];
    return {
      debit: entries.reduce((s: number, e: any) => s + Number(e.Debit || 0), 0),
      credit: entries.reduce((s: number, e: any) => s + Number(e.Credit || 0), 0),
    };
  };

  const columns = [
    { key: "Date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "Code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Description", label: "Keterangan", render: (v: unknown) => (v as string) || "-" },
    { key: "ReferenceType", label: "Referensi", render: (v: unknown) => v ? <span className="text-muted">{v as string}</span> : <span className="text-muted">-</span> },
    { key: "debit", label: "Debit", align: "right" as const, render: (_: unknown, row: any) => <span className="font-semibold">{formatCurrency(rowTotals(row).debit)}</span> },
    { key: "credit", label: "Kredit", align: "right" as const, render: (_: unknown, row: any) => <span className="font-semibold">{formatCurrency(rowTotals(row).credit)}</span> },
    {
      key: "actions", label: "", width: "80px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => setDetail(row)}>Detail</Button>
          <RowDeleteIcon onClick={() => setDeleteId(row.ID)} />
        </div>
      )
    },
  ];

  const openCreate = () => {
    setSaveError("");
    setForm({ date: new Date().toISOString().split("T")[0], description: "", reference: "" });
    setLines([{ ...EMPTY_LINE }, { ...EMPTY_LINE }]);
    setShowForm(true);
  };

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

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Jurnal Baru" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tanggal" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Input label="Referensi" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
          </div>
          <Input label="Keterangan" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-highlighted">Baris Debit / Kredit</label>
              <Button variant="outline" size="sm" icon={Plus} onClick={addLine}>Tambah Baris</Button>
            </div>
            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_120px_120px_1fr_32px] gap-2">
                  <Select
                    value={line.accountId}
                    onChange={(e) => updateLine(idx, { accountId: e.target.value })}
                    options={[{ value: "", label: "Pilih akun..." }, ...accounts.map((a) => ({ value: String(a.ID), label: `${a.Code} - ${a.Name}` }))]}
                  />
                  <Input type="number" placeholder="Debit" value={line.debit} onChange={(e) => updateLine(idx, { debit: e.target.value, credit: Number(e.target.value) > 0 ? "0" : line.credit })} />
                  <Input type="number" placeholder="Kredit" value={line.credit} onChange={(e) => updateLine(idx, { credit: e.target.value, debit: Number(e.target.value) > 0 ? "0" : line.debit })} />
                  <Input placeholder="Memo" value={line.memo} onChange={(e) => updateLine(idx, { memo: e.target.value })} />
                  <button type="button" onClick={() => removeLine(idx)} className="flex items-center justify-center rounded p-1.5 text-muted hover:bg-elevated hover:text-danger">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end gap-6 rounded-lg bg-elevated p-3 text-sm">
              <span>Total Debit: <span className="font-semibold">{formatCurrency(totalDebit)}</span></span>
              <span>Total Kredit: <span className="font-semibold">{formatCurrency(totalCredit)}</span></span>
              <span className={isBalanced ? "text-success" : "text-danger"}>{isBalanced ? "Balance" : "Belum Balance"}</span>
            </div>
          </div>

          {saveError && <p className="text-sm text-danger">{saveError}</p>}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Detail Jurnal — ${detail?.Code || ""}`} size="md">
        {detail && (
          <div className="space-y-3">
            <p className="text-sm text-muted">{formatDate(detail.Date)} &middot; {detail.Description || "-"}</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default text-left text-muted">
                  <th className="py-2">Akun</th>
                  <th className="py-2 text-right">Debit</th>
                  <th className="py-2 text-right">Kredit</th>
                </tr>
              </thead>
              <tbody>
                {(detail.JournalEntries || []).map((e: any) => (
                  <tr key={e.ID} className="border-b border-default last:border-0">
                    <td className="py-2">{e.Account?.Code} - {e.Account?.Name}{e.Memo && <span className="block text-xs text-muted">{e.Memo}</span>}</td>
                    <td className="py-2 text-right">{Number(e.Debit) > 0 ? formatCurrency(Number(e.Debit)) : "-"}</td>
                    <td className="py-2 text-right">{Number(e.Credit) > 0 ? formatCurrency(Number(e.Credit)) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Jurnal" message="Yakin ingin menghapus jurnal ini?" confirmText="Hapus" variant="danger" />
    </PageWrapper>
  );
}
