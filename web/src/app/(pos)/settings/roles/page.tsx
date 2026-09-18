"use client";

import { useState, useEffect, useCallback } from "react";
import { KeyRound } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon, RowDeleteIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";

function RoleAccessModal({ role, onClose }: { role: any; onClose: () => void }) {
  const [menus, setMenus] = useState<any[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [menusRes, roleMenusRes] = await Promise.all([
        api.get("menus", { $take: 100 } as any).catch(() => ({ success: false, data: [] } as any)),
        api.get(`menus/role/${role.ID}`).catch(() => ({ success: false, data: [] } as any)),
      ]);
      setMenus(menusRes.success ? menusRes.data || [] : []);
      setAssignedIds(new Set((roleMenusRes.success ? roleMenusRes.data || [] : []).map((rm: any) => rm.MenuID)));
    } finally { setLoading(false); }
  }, [role.ID]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (menuId: number, checked: boolean) => {
    setAssignedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(menuId); else next.delete(menuId);
      return next;
    });
    if (checked) {
      await api.post(`menus/role/${role.ID}/assign`, { menuId }).catch(() => {});
    } else {
      await api.delete(`menus/role/${role.ID}/revoke`, menuId).catch(() => {});
    }
  };

  return (
    <Modal open onClose={onClose} title={`Hak Akses Menu — ${role.RoleName}`} size="md">
      <div className="space-y-2">
        <p className="text-sm text-muted">Pilih menu yang boleh diakses oleh role ini.</p>
        {loading ? (
          <p className="py-6 text-center text-sm text-muted">Memuat...</p>
        ) : menus.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Belum ada menu. Tambahkan di Menu Aplikasi.</p>
        ) : (
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {menus.map((menu) => (
              <label key={menu.ID} className="flex items-center gap-3 rounded-lg p-2 hover:bg-elevated">
                <input
                  type="checkbox"
                  className="size-4 rounded border-default accent-primary"
                  checked={assignedIds.has(menu.ID)}
                  onChange={(e) => toggle(menu.ID, e.target.checked)}
                />
                <span className="text-sm text-highlighted">{menu.MenuName}</span>
                {menu.Route && <span className="text-xs text-muted">{menu.Route}</span>}
              </label>
            ))}
          </div>
        )}
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </Modal>
  );
}

// Backend Role model (prisma/schema.prisma): ID, RoleName, RoleDescription,
// IsActive — no `code`/`isDefault` fields exist, so this form only edits
// the fields that are actually persisted.
export default function RolesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [accessRole, setAccessRole] = useState<any>(null);
  const [form, setForm] = useState<{ id?: number; roleName: string; roleDescription: string }>({ roleName: "", roleDescription: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("roles", { $select: "ID,RoleName,RoleDescription,IsActive" } as any).catch(() => ({ success: false, data: { data: [] } } as any));
      if (res.success) setData(res.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const isEdit = Boolean((form as any).id);
    if (isEdit) {
      await api.put("roles", (form as any).id, form).catch(() => ({}));
    } else {
      await api.post("roles", form).catch(() => ({}));
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`roles`, id).catch(() => ({}));
    fetchData();
  };

  const columns = [
    { key: "RoleName", label: "Nama Role" },
    { key: "RoleDescription", label: "Deskripsi", render: (v: unknown) => v || "-" },
    { key: "IsActive", label: "Status", render: (v: unknown) => v ? <Badge variant="success">Aktif</Badge> : <Badge variant="default">Nonaktif</Badge> },
    {
      key: "actions", label: "", width: "100px",
      render: (_: unknown, row: any) => (
        <div className="flex gap-1">
          <button
            type="button"
            title="Hak Akses Menu"
            onClick={() => setAccessRole(row)}
            className="rounded p-1.5 text-muted hover:bg-elevated hover:text-primary"
          >
            <KeyRound className="size-4" />
          </button>
          <RowEditIcon onClick={() => { setForm({ id: row.ID, roleName: row.RoleName, roleDescription: row.RoleDescription || "" }); setShowForm(true); }} />
          <RowDeleteIcon onClick={() => handleDelete(row.ID)} />
        </div>
      )
    },
  ];

  const openCreate = () => { setForm({ roleName: "", roleDescription: "" }); setShowForm(true); };

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[]}
          onFilter={() => fetchData()}
          loading={loading}
          actions={<GridActions onAdd={openCreate} />}
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} emptyMessage="Tidak ada role" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Role" size="sm">
        <div className="space-y-4">
          <Input label="Nama Role" value={form.roleName} onChange={e => setForm(f => ({ ...f, roleName: e.target.value }))} />
          <Input label="Deskripsi" value={form.roleDescription} onChange={e => setForm(f => ({ ...f, roleDescription: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>

      {accessRole && <RoleAccessModal role={accessRole} onClose={() => setAccessRole(null)} />}
    </PageWrapper>
  );
}
