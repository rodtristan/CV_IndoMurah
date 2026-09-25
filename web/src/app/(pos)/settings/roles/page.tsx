"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { KInfoBox, KInput, KSelect } from "@/components/kform";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";
import { apiError } from "../_lib/local";

// Hak akses kelompok = daftar menu yang di-assign ke role di server (RoleMenus), lewat
// GET menus/role/:id, POST menus/role/:id/assign, DELETE menus/role/:id/revoke/:menuId.

interface RoleRow { ID: number; RoleName: string; RoleDescription?: string | null; IsActive: boolean }
interface MenuRow { ID: number; MenuName: string; MenuType?: string | null; Route?: string | null; ParentMenuID?: number | null; SortOrder?: number; IsActive?: boolean }

const btn = "inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-[14px] hover:bg-[#f3f4f6] disabled:opacity-50";

export default function RolesPage() {
  usePageTitle("Kelompok Akses User");
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [roleId, setRoleId] = useState("");
  const [menus, setMenus] = useState<MenuRow[]>([]);
  const [assigned, setAssigned] = useState<Set<number>>(new Set()); // as stored on the server
  const [draft, setDraft] = useState<Set<number>>(new Set()); // as edited on screen
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{ id?: number; name: string; desc: string } | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const role = roles.find((r) => String(r.ID) === roleId) ?? null;
  const isAdminRole = role?.RoleName.toLowerCase() === "administrator";

  const fetchRoles = useCallback(async (select?: string) => {
    setLoading(true);
    try {
      const [r, m] = await Promise.all([
        api.get<RoleRow[]>("roles", { $select: "ID,RoleName,RoleDescription,IsActive", $take: 200 }, { skipCache: true }),
        api.get<MenuRow[]>("menus", { $take: 500 }, { skipCache: true }),
      ]);
      const list = r.data ?? [];
      setRoles(list);
      setMenus(m.data ?? []);
      setRoleId((cur) => select ?? (cur && list.some((x) => String(x.ID) === cur) ? cur : list[0] ? String(list[0].ID) : ""));
    } catch (e) { toast.error(apiError(e)); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void fetchRoles(); }, [fetchRoles]);

  const loadAssigned = useCallback(async (roleIdNum: number) => {
    const res = await api.get<{ MenuID: number }[]>(`menus/role/${roleIdNum}`, undefined, { skipCache: true });
    const set = new Set((res.data ?? []).map((m) => m.MenuID));
    setAssigned(set);
    setDraft(new Set(set));
  }, []);

  useEffect(() => {
    if (!role) { setAssigned(new Set()); setDraft(new Set()); return; }
    loadAssigned(role.ID).catch((e) => { toast.error(apiError(e)); setAssigned(new Set()); setDraft(new Set()); });
  }, [role, loadAssigned]);

  const dirty = useMemo(
    () => draft.size !== assigned.size || [...draft].some((id) => !assigned.has(id)),
    [draft, assigned],
  );

  const toggle = (ids: number[], checked: boolean) =>
    setDraft((prev) => { const n = new Set(prev); for (const id of ids) { if (checked) n.add(id); else n.delete(id); } return n; });

  // Saves the difference between the screen and the server, one assign/revoke call per menu.
  const savePerms = async () => {
    if (!role) return;
    const toAssign = [...draft].filter((id) => !assigned.has(id));
    const toRevoke = [...assigned].filter((id) => !draft.has(id));
    setSaving(true);
    let failed = 0;
    for (const menuId of toAssign) {
      try { await api.post(`menus/role/${role.ID}/assign`, { menuId }); } catch { failed++; }
    }
    for (const menuId of toRevoke) {
      try { await api.delete(`menus/role/${role.ID}/revoke`, menuId); } catch { failed++; }
    }
    try { await loadAssigned(role.ID); } catch { /* keep draft */ }
    setSaving(false);
    if (failed) toast.error(`${failed} perubahan hak akses gagal disimpan. Data di layar sudah dimuat ulang dari server.`);
    else toast.success(`Hak akses disimpan (${toAssign.length} ditambah, ${toRevoke.length} dicabut)`);
  };

  const saveRole = async () => {
    if (!form || !form.name.trim()) { toast.error("Nama kelompok wajib diisi"); return; }
    setBusy(true);
    try {
      const payload = { roleName: form.name.trim(), roleDescription: form.desc };
      if (form.id) { await api.put("roles", form.id, payload); await fetchRoles(); }
      else { const res = await api.post<RoleRow>("roles", payload); await fetchRoles(String(res.data?.ID ?? "")); }
      toast.success("Kelompok user disimpan");
      setForm(null);
    } catch (e) { toast.error(apiError(e)); } finally { setBusy(false); }
  };

  const removeRole = async () => {
    if (!role) return;
    setBusy(true);
    try {
      await api.delete("roles", role.ID);
      toast.success("Kelompok user dihapus");
      setShowDelete(false);
      await fetchRoles("");
    } catch (e) { toast.error(apiError(e)); } finally { setBusy(false); }
  };

  // Parent menus with their children; top-level menus without children form "Lainnya".
  const menuGroups = useMemo(() => {
    const active = menus.filter((m) => m.IsActive !== false);
    const order = (a: MenuRow, b: MenuRow) => (a.SortOrder ?? 0) - (b.SortOrder ?? 0) || a.MenuName.localeCompare(b.MenuName);
    const children = (id: number) => active.filter((m) => m.ParentMenuID === id).sort(order);
    const roots = active.filter((m) => !m.ParentMenuID || !active.some((p) => p.ID === m.ParentMenuID)).sort(order);
    const groups: { parent: MenuRow | null; items: MenuRow[] }[] = roots
      .filter((r) => children(r.ID).length > 0)
      .map((r) => ({ parent: r, items: children(r.ID) }));
    const loose = roots.filter((r) => children(r.ID).length === 0);
    if (loose.length) groups.push({ parent: null, items: loose });
    return groups;
  }, [menus]);

  return (
    <PageWrapper>
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-72">
            <KSelect label="Kelompok User" value={roleId} onChange={setRoleId} placeholder="Pilih kelompok" fieldClassName="mb-0"
              options={roles.map((r) => ({ value: String(r.ID), label: r.RoleName }))} />
          </div>
          <button type="button" className={btn} onClick={() => void fetchRoles()}>Cari</button>
          <button type="button" className={btn} onClick={() => setForm({ name: "", desc: "" })}><Plus className="size-4" /> Kelompok Baru</button>
          <button type="button" className={btn} disabled={!role} onClick={() => role && setForm({ id: role.ID, name: role.RoleName, desc: role.RoleDescription ?? "" })}><Pencil className="size-4" /> Edit Kelompok</button>
          <button type="button" className={btn} disabled={!role || isAdminRole} onClick={() => setShowDelete(true)}><Trash2 className="size-4" /> Hapus Kelompok</button>
          <button type="button" onClick={() => void savePerms()} disabled={!role || !dirty || saving}
            className="inline-flex h-10 items-center gap-2 rounded bg-[#4caf50] px-5 text-[15px] font-medium text-white hover:bg-[#43a047] disabled:opacity-60">
            <Save className="size-4" /> {saving ? "Menyimpan..." : "Simpan"}
          </button>
          {dirty && !saving && <span className="text-[13px] text-[#b45309]">Ada perubahan yang belum disimpan.</span>}
        </div>

        {isAdminRole && <KInfoBox variant="warning" title="Penting" items={["Kelompok ADMINISTRATOR memiliki hak akses paling tinggi, sebaiknya tidak diubah."]} />}

        {loading ? (
          <p className="py-10 text-center text-sm text-[#9aa3ad]">Memuat...</p>
        ) : !role ? (
          <p className="py-10 text-center text-sm text-[#9aa3ad]">Pilih atau buat Kelompok User terlebih dahulu.</p>
        ) : menuGroups.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#9aa3ad]">Belum ada menu di server.</p>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-[13px] text-[#3a4654]">
              Centang menu yang boleh diakses kelompok ini, lalu klik <b>Simpan</b>. Hak akses tersimpan di server.
            </p>
            {menuGroups.map((g) => {
              const ids = [...(g.parent ? [g.parent.ID] : []), ...g.items.map((m) => m.ID)];
              const all = ids.every((id) => draft.has(id));
              return (
                <div key={g.parent?.ID ?? "loose"} className="border border-[#d5d9de]">
                  <label className="flex cursor-pointer items-center gap-2 border-b border-[#d5d9de] bg-[#f5f6f8] px-3 py-2 text-[14px] font-bold">
                    <input type="checkbox" className="size-4 accent-[#4a90d9]" checked={all} onChange={(e) => toggle(ids, e.target.checked)} />
                    {g.parent ? g.parent.MenuName : "Lainnya"}
                  </label>
                  <div className="grid gap-1 p-3 sm:grid-cols-2 lg:grid-cols-3">
                    {g.items.map((m) => (
                      <label key={m.ID} className="flex cursor-pointer items-center gap-2 text-[14px]">
                        <input type="checkbox" className="size-5 accent-[#4a90d9]" checked={draft.has(m.ID)} onChange={(e) => toggle([m.ID], e.target.checked)} />
                        {m.MenuName}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit Kelompok" : "Kelompok Baru"} size="sm"
        footer={<><Button variant="outline" onClick={() => setForm(null)}>Batal</Button><Button variant="primary" onClick={saveRole} loading={busy}>Simpan</Button></>}>
        {form && (
          <div>
            <KInput label="Nama Kelompok" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <KInput label="Keterangan" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
          </div>
        )}
      </Modal>

      <ConfirmModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={removeRole} title="Hapus Kelompok"
        message={`Yakin ingin menghapus kelompok ${role?.RoleName ?? ""}?`} confirmText="Hapus" variant="danger" loading={busy} />
    </PageWrapper>
  );
}
