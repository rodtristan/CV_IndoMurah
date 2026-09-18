"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon, RowDeleteIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";

const EMPTY_FORM = { id: undefined as number | undefined, code: "", name: "", phone: "", email: "", address: "" };

export default function EmployeesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("employees", { $search: search || undefined, $include: "Status" } as any).catch(() => ({ success: false, data: [] } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const payload = { code: form.code, name: form.name, phone: form.phone || undefined, email: form.email || undefined, address: form.address || undefined };
    if (form.id) {
      await api.patch("employees", form.id, payload).catch(() => ({}));
    } else {
      await api.post("employees", payload).catch(() => ({}));
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete("employees", deleteId).catch(() => ({}));
    setDeleteId(null);
    fetchData();
  };

  const columns = [
    { key: "Code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Name", label: "Nama" },
    { key: "Phone", label: "Telepon", render: (v: unknown) => (v as string) || "-" },
    { key: "Email", label: "Email", render: (v: unknown) => (v as string) || "-" },
    { key: "Status", label: "Status", render: (_: unknown, row: any) => <Badge variant={row.Status?.Code === "ACTIVE" ? "success" : "default"}>{row.Status?.Name || "-"}</Badge> },
    {
      key: "actions", label: "", width: "70px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-1">
          <RowEditIcon onClick={() => { setForm({ id: row.ID, code: row.Code, name: row.Name, phone: row.Phone || "", email: row.Email || "", address: row.Address || "" }); setShowForm(true); }} />
          <RowDeleteIcon onClick={() => setDeleteId(row.ID)} />
        </div>
      )
    },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari karyawan..." }]}
          onFilter={(v) => setSearch((v.search as string) || "")}
          loading={loading}
          actions={<GridActions onAdd={() => { setForm(EMPTY_FORM); setShowForm(true); }} />}
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Belum ada data karyawan" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Karyawan" size="sm">
        <div className="space-y-4">
          <Input label="Kode" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          <Input label="Nama" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Telepon" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Alamat" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Karyawan" message="Yakin ingin menghapus karyawan ini?" confirmText="Hapus" variant="danger" />
    </PageWrapper>
  );
}
