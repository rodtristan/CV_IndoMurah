"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FilterBar } from "@/components/ui/FilterBar";
import { ConfirmModal } from "@/components/ui/Modal";
import { GridActions } from "@/components/ui/GridActions";
import { Button } from "@/components/ui/Button";
import { api, odata } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { Account, AccountType } from "@/lib/types";

// AccountType is now its own table (see api/prisma/schema.prisma model
// AccountType) referenced by Account.TypeID, instead of a plain string on
// Account. There is no /account-type list endpoint, so this maps the codes
// seeded in api/prisma/seed.ts (in insertion order) to their IDs. If the DB
// was ever seeded in a different order this mapping will be wrong — verify
// against the live AccountTypes table if account type assignment looks off.
const accountTypeCodeToId: Record<AccountType, number> = {
  ASSET: 1, LIABILITY: 2, EQUITY: 3, REVENUE: 4, EXPENSE: 5,
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<Account | null>(null);
  const [parentAccounts, setParentAccounts] = useState<Account[]>([]);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    code: "", name: "", type: "ASSET" as AccountType, parentId: "", isActive: true,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Account[]>("account", odata().include(["Type", "Parent", "Children"]).orderByMulti({ TypeID: "asc", Code: "asc" }).take(200).toParams());
      if (res.success) setAccounts(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const fetchParents = async () => {
    const res = await api.get<Account[]>("account", odata().where({ ParentID: null }).include(["Type"]).take(100).toParams()).catch(() => ({ data: [] } as any));
    setParentAccounts(res.data || []);
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        Code: form.code, Name: form.name, TypeID: accountTypeCodeToId[form.type],
        ParentID: form.parentId ? Number(form.parentId) : null, IsActive: form.isActive,
      };
      if (selected) {
        await api.patch("account", selected.ID, payload);
      } else {
        await api.post("account", payload);
      }
      setShowForm(false);
      fetchData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete("account", selected.ID);
      setShowDelete(false);
      fetchData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const typeColors: Record<AccountType, string> = {
    ASSET: "text-success", LIABILITY: "text-danger", EQUITY: "text-info",
    REVENUE: "text-primary", EXPENSE: "text-warning",
  };
  const typeLabels: Record<AccountType, string> = {
    ASSET: "Aset", LIABILITY: "Kewajiban", EQUITY: "Modal",
    REVENUE: "Pendapatan", EXPENSE: "Beban",
  };

  // Build tree
  const rootAccounts = accounts.filter(a => !a.ParentID);

  const filteredFlat = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.trim().toLowerCase();
    return accounts.filter(a => a.Code.toLowerCase().includes(q) || a.Name.toLowerCase().includes(q));
  }, [accounts, search]);

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openEdit = (account: Account) => {
    const typeCode = (account.Type?.Code || "ASSET") as AccountType;
    setSelected(account);
    setForm({ code: account.Code, name: account.Name, type: typeCode, parentId: String(account.ParentID || ""), isActive: account.IsActive });
    fetchParents();
    setShowForm(true);
  };

  const renderRow = (account: Account, level: number, hasChildren: boolean, isExpanded: boolean) => {
    const typeCode = (account.Type?.Code || "ASSET") as AccountType;
    const isSelected = selected?.ID === account.ID;

    return (
      <div
        key={account.ID}
        onClick={() => setSelected(account)}
        onDoubleClick={() => openEdit(account)}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors",
          isSelected ? "border-primary bg-primary/5" : "border-transparent hover:bg-elevated",
          level > 0 && "ml-6 border-l border-default"
        )}
      >
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); toggleExpand(account.ID); }} className="flex size-5 items-center justify-center rounded text-muted transition-colors hover:text-highlighted">
            <ChevronRight className={cn("size-3.5 transition-transform", isExpanded && "rotate-90")} />
          </button>
        ) : (
          <div className="size-5" />
        )}
        <div className="flex size-7 items-center justify-center rounded bg-elevated">
          <span className={cn("text-xs font-bold", typeColors[typeCode])}>{account.Code}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{account.Name}</p>
        </div>
        <Badge variant={account.IsActive ? "success" : "danger"} size="sm">
          {account.IsActive ? "Aktif" : "Nonaktif"}
        </Badge>
        <span className={cn("text-xs font-semibold", typeColors[typeCode])}>{typeLabels[typeCode]}</span>
      </div>
    );
  };

  const renderAccount = (account: Account, level = 0): React.ReactNode => {
    const children = accounts.filter(a => a.ParentID === account.ID);
    const hasChildren = children.length > 0;
    const isExpanded = expanded.has(account.ID);

    return (
      <div key={account.ID}>
        {renderRow(account, level, hasChildren, isExpanded)}
        {isExpanded && hasChildren && children.map(child => renderAccount(child, level + 1))}
      </div>
    );
  };

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[
            { key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari kode / nama akun" },
          ]}
          onFilter={(v) => setSearch((v.search as string) || "")}
          loading={loading}
          actions={
            <GridActions
              onAdd={() => { setSelected(null); setForm({ code: "", name: "", type: "ASSET", parentId: "", isActive: true }); fetchParents(); setShowForm(true); }}
              onEdit={() => selected && openEdit(selected)}
              onDelete={() => selected && setShowDelete(true)}
              disableEdit={!selected}
              disableDelete={!selected}
            />
          }
        />

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
          ) : filteredFlat !== null ? (
            <div className="space-y-1">
              {filteredFlat.map(account => renderRow(account, 0, false, false))}
              {filteredFlat.length === 0 && (
                <div className="py-12 text-center text-muted"><p>Tidak ada akun yang cocok.</p></div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {rootAccounts.map(account => renderAccount(account))}
              {rootAccounts.length === 0 && (
                <div className="py-12 text-center text-muted">
                  <p>Tidak ada akun. Tambahkan akun pertama.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={selected ? "Edit Akun" : "Tambah Akun"} size="md"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kode Akun" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required />
            <Select label="Tipe" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as AccountType }))}
              options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} />
          </div>
          <Input label="Nama Akun" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Select label="Induk (Parent)" value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
            options={[{ value: "", label: "Tanpa Induk (Root)" }, ...parentAccounts.filter(a => a.ID !== selected?.ID).map(a => ({ value: a.ID, label: `${a.Code} - ${a.Name}` }))]} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="size-4 rounded border-default" />
            <label htmlFor="isActive" className="text-sm">Akun Aktif</label>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Hapus Akun" message={`Yakin menghapus akun "${selected?.Name}"?`} confirmText="Hapus" variant="danger" loading={saving} />
    </PageWrapper>
  );
}
