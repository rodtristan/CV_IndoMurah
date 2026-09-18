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

const groupOptions = [
  { value: "GENERAL", label: "Umum" },
  { value: "RETAIL", label: "Retail" },
  { value: "WHOLESALE", label: "Grosir" },
  { value: "VIP", label: "VIP" },
];

// CustomerGroupID is now a foreign key (see api/prisma/schema.prisma model
// CustomerGroup) instead of a plain string on Customer. There is no
// /customer-group list endpoint, so this maps the group codes seeded in
// api/prisma/seed.ts (in insertion order) to their IDs. If the DB was ever
// seeded in a different order this mapping will be wrong — verify against
// the live CustomerGroups table if customer group assignment looks off.
const groupCodeToId: Record<string, number> = { GENERAL: 1, RETAIL: 2, WHOLESALE: 3, VIP: 4 };
const groupIdToCode: Record<number, string> = { 1: "GENERAL", 2: "RETAIL", 3: "WHOLESALE", 4: "VIP" };

export default function CustomersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", email: "", phone: "", address: "", notes: "", customerGroup: "GENERAL" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("customer", { $search: search || undefined, $include: "CustomerGroup" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const isEdit = Boolean((form as any).ID);
    const payload = {
      Code: form.code,
      Name: form.name,
      Email: form.email || undefined,
      Phone: form.phone || undefined,
      Address: form.address || undefined,
      Notes: form.notes || undefined,
      CustomerGroupID: groupCodeToId[form.customerGroup] ?? undefined,
    };
    if (isEdit) {
      await api.patch("customer", (form as any).ID, payload).catch(() => ({}));
    } else {
      await api.post("customer", payload).catch(() => ({}));
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`customer`, id).catch(() => ({}));
    fetchData();
  };

  const columns = [
    { key: "Code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Name", label: "Nama Pelanggan" },
    { key: "Phone", label: "Telepon", render: (v: unknown) => v ? <span>{v as string}</span> : <span className="text-muted">-</span> },
    { key: "Address", label: "Alamat", render: (v: unknown) => v ? <span className="text-muted">{v as string}</span> : <span className="text-muted">-</span> },
    { key: "CustomerGroup.Name", label: "Grup", render: (v: unknown) => <span className="text-xs uppercase">{(v as string) || "-"}</span> },
    {
      key: "actions", label: "", width: "70px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-1">
          <RowEditIcon onClick={() => setEditRow(row)} />
          <RowDeleteIcon onClick={() => handleDelete(row.ID)} />
        </div>
      )
    },
  ];

  const setEditRow = (row: any) => {
    setForm({
      ...row,
      name: row.Name || "",
      code: row.Code || "",
      email: row.Email || "",
      phone: row.Phone || "",
      address: row.Address || "",
      notes: row.Notes || "",
      customerGroup: groupIdToCode[row.CustomerGroupID] || "GENERAL",
    });
    setShowForm(true);
  };

  const openCreate = () => { setForm({ name: "", code: "", email: "", phone: "", address: "", notes: "", customerGroup: "GENERAL" }); setShowForm(true); };

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari pelanggan..." }]}
          onFilter={(v) => setSearch((v.search as string) || "")}
          loading={loading}
          actions={<GridActions onAdd={openCreate} />}
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada pelanggan" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Pelanggan" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kode" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            <Input label="Nama" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telepon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <Input label="Alamat" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Grup Pelanggan" value={form.customerGroup} onChange={e => setForm(f => ({ ...f, customerGroup: e.target.value }))} options={groupOptions} />
            <Input label="Catatan" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
