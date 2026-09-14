"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SupplierDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [form, setForm] = useState({ date: "", code: "", supplierId: "", amount: 0, description: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("supplier-deposit", { $search: search || undefined, $include: "supplier" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setDeposits(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  const fetchSuppliers = useCallback(async () => {
    const res = await api.get("supplier", { $select: "id,name" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
    if (res.success) setSuppliers(res.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleSave = async () => {
    const isEdit = Boolean((form as any).id);
    const payload = {
      code: form.code || `DP-${Date.now()}`,
      supplierId: Number(form.supplierId),
      amount: Number(form.amount),
      description: form.description || undefined,
    };
    if (isEdit) {
      await api.patch("supplier-deposit", (form as any).id, payload).catch(() => ({}));
    } else {
      await api.post("supplier-deposit", payload).catch(() => ({}));
    }
    setShowForm(false);
    fetchData();
  };

  const columns = [
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "supplier", label: "Supplier", render: (v: unknown) => (v as any)?.name || "-" },
    { key: "amount", label: "Jumlah", align: "right" as const, render: (v: unknown) => <span className="font-bold text-warning">{formatCurrency(v as number)}</span> },
    { key: "remainingAmount", label: "Sisa", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "description", label: "Keterangan" },
  ];

  const openCreate = () => { setForm({ date: new Date().toISOString().split("T")[0], code: "", supplierId: "", amount: 0, description: "" }); setShowForm(true); };

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
          <DataTable data={deposits} columns={columns} loading={loading} emptyMessage="Tidak ada deposit" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Deposit Baru" size="md">
        <div className="space-y-4">
          <Input label="Tanggal" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <Select label="Supplier" value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} options={suppliers.map(s => ({ value: s.id, label: s.name }))} />
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
