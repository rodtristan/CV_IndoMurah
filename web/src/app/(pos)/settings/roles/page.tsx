"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { KInfoBox, KInput, KSelect, KTabs } from "@/components/kform";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/lib/page-title";
import { apiError } from "../_lib/local";
import { MODULE_GROUPS, PERMISSIONS, type PermKey, type PermMap } from "../_lib/modules";

interface RoleRow { ID: number; RoleName: string; RoleDescription?: string | null; IsActive: boolean }
interface MenuRow { ID: number; MenuName: string; Route?: string | null }

const permKey = (roleId: number) => `ketoko_local:role-perms:${roleId}`;
const loadPerms = (roleId: number, admin: boolean): PermMap => {
  try {
    const raw = localStorage.getItem(permKey(roleId));
    if (raw) return JSON.parse(raw) as PermMap;
  } catch { /* ignore */ }
  if (!admin) return {};
  const all: PermMap = {};
  for (const g of MODULE_GROUPS) for (const i of g.items) all[i.key] = { open: true, create: true, update: true, delete: true, print: true, lock: false };
  return all;
};

const btn = "inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-[14px] hover:bg-[#f3f4f6] disabled:opacity-50";

export default function RolesPage() {
  usePageTitle("Kelompok Akses User");
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [roleId, setRoleId] = useState("");
  const [tab, setTab] = useState("modul");
  const [group, setGroup] = useState(MODULE_GROUPS[0].key);
  const [perms, setPerms] = useState<PermMap>({});
  const [menus, setMenus] = useState<MenuRow[]>([]);
  const [assigned, setAssigned] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

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
        api.get<MenuRow[]>("menus", { $take: 200 }, { skipCache: true }),
      ]);
      const list = r.data ?? [];
      setRoles(list);
      setMenus(m.data ?? []);
      setRoleId((cur) => select ?? (cur && list.some((x) => String(x.ID) === cur) ? cur : list[0] ? String(list[0].ID) : ""));
    } catch (e) { toast.error(apiError(e)); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void fetchRoles(); }, [fetchRoles]);

  useEffect(() => {
    if (!role) { setPerms({}); setAssigned(new Set()); return; }
    setPerms(loadPerms(role.ID, role.RoleName.toLowerCase() === "administrator"));
    let cancelled = false;
    api.get<{ MenuID: number }[]>(`menus/role/${role.ID}`, undefined, { skipCache: true })
      .then((res) => { if (!cancelled) setAssigned(new Set((res.data ?? []).map((m) => m.MenuID))); })
      .catch(() => { if (!cancelled) setAssigned(new Set()); });
    return () => { cancelled = true; };
  }, [role]);

  const current = MODULE_GROUPS.find((g) => g.key === group)!;

  const toggle = (itemKey: string, p: PermKey, v: boolean) =>
    setPerms((prev) => ({ ...prev, [itemKey]: { ...prev[itemKey], [p]: v } }));
  const toggleColumn = (p: PermKey, v: boolean) =>
    setPerms((prev) => {
      const next = { ...prev };
      for (const i of current.items) next[i.key] = { ...next[i.key], [p]: v };
      return next;
    });
  const colState = (p: PermKey) => current.items.every((i) => perms[i.key]?.[p]);

  const savePerms = () => {
    if (!role) return;
    try { localStorage.setItem(permKey(role.ID), JSON.stringify(perms)); toast.success("Hak akses disimpan di browser ini"); }
    catch { toast.error("Gagal menyimpan hak akses"); }
  };

  const toggleMenu = async (menuId: number, checked: boolean) => {
    if (!role) return;
    setAssigned((prev) => { const n = new Set(prev); if (checked) n.add(menuId); else n.delete(menuId); return n; });
    try {
      if (checked) await api.post(`menus/role/${role.ID}/assign`, { menuId });
      else await api.delete(`menus/role/${role.ID}/revoke`, menuId);
    } catch (e) {
      toast.error(apiError(e));
      setAssigned((prev) => { const n = new Set(prev); if (checked) n.delete(menuId); else n.add(menuId); return n; });
    }
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
      try { localStorage.removeItem(permKey(role.ID)); } catch { /* ignore */ }
      toast.success("Kelompok user dihapus");
      setShowDelete(false);
      await fetchRoles("");
    } catch (e) { toast.error(apiError(e)); } finally { setBusy(false); }
  };

  const menuList = useMemo(() => menus, [menus]);

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
          <button type="button" onClick={savePerms} disabled={!role}
            className="inline-flex h-10 items-center gap-2 rounded bg-[#4caf50] px-5 text-[15px] font-medium text-white hover:bg-[#43a047] disabled:opacity-60">
            <Save className="size-4" /> Simpan
          </button>
        </div>

        {isAdminRole && <KInfoBox variant="warning" title="Penting" items={["Kelompok ADMINISTRATOR memiliki hak akses paling tinggi, sebaiknya tidak diubah."]} />}

        <div className="mt-3">
          <KTabs tabs={[{ key: "modul", label: "Hak Akses Modul" }, { key: "menu", label: "Akses Menu (Server)" }]} active={tab} onChange={setTab} />
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-[#9aa3ad]">Memuat...</p>
        ) : !role ? (
          <p className="py-10 text-center text-sm text-[#9aa3ad]">Pilih atau buat Kelompok User terlebih dahulu.</p>
        ) : tab === "modul" ? (
          <div className="mt-3 grid gap-4 md:grid-cols-[220px_1fr]">
            <div className="border border-[#d5d9de]">
              <div className="border-b border-[#d5d9de] bg-[#f5f6f8] px-3 py-2 text-[14px] font-bold">Kelompok Modul</div>
              {MODULE_GROUPS.map((g) => (
                <button key={g.key} type="button" onClick={() => setGroup(g.key)}
                  className={cn("block w-full border-b border-[#eceff2] px-3 py-2 text-left text-[14px] hover:bg-[#f3f4f6]", group === g.key && "bg-primary/10 font-semibold text-primary")}>
                  {g.label}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto border border-[#d5d9de]">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="border-b border-[#d5d9de] bg-[#f5f6f8]">
                    <th className="px-3 py-2 text-left font-bold">Point Hak Akses ({current.label})</th>
                    {PERMISSIONS.map((p) => (
                      <th key={p.key} className="w-24 px-2 py-2 text-center font-bold">
                        <label className="flex cursor-pointer flex-col items-center gap-1">
                          <span>{p.label}</span>
                          <input type="checkbox" className="size-4 accent-[#4a90d9]" checked={colState(p.key)} onChange={(e) => toggleColumn(p.key, e.target.checked)} aria-label={`Pilih semua ${p.label}`} />
                        </label>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {current.items.map((i) => (
                    <tr key={i.key} className="border-b border-[#eceff2] hover:bg-[#fafbfc]">
                      <td className="px-3 py-2">{i.label}</td>
                      {PERMISSIONS.map((p) => (
                        <td key={p.key} className="text-center">
                          <input type="checkbox" className="size-5 accent-[#4a90d9]" checked={Boolean(perms[i.key]?.[p.key])} onChange={(e) => toggle(i.key, p.key, e.target.checked)} aria-label={`${i.label} ${p.label}`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <p className="mb-2 text-[13px] text-[#3a4654]">Menu aplikasi yang tersimpan di server untuk kelompok ini. Perubahan langsung tersimpan.</p>
            {menuList.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#9aa3ad]">Belum ada menu.</p>
            ) : (
              <div className="grid max-h-96 gap-1 overflow-y-auto border border-[#d5d9de] p-3 sm:grid-cols-2 lg:grid-cols-3">
                {menuList.map((m) => (
                  <label key={m.ID} className="flex cursor-pointer items-center gap-2 text-[14px]">
                    <input type="checkbox" className="size-5 accent-[#4a90d9]" checked={assigned.has(m.ID)} onChange={(e) => void toggleMenu(m.ID, e.target.checked)} />
                    {m.MenuName}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === "modul" && role && (
          <KInfoBox title="Keterangan" items={[
            "Buka = dapat membuka modul; Baru = dapat menambah data; Ubah = dapat mengubah data; Hapus = dapat menghapus data; Cetak = dapat mencetak; Kunci No & Tanggal = tanggal transaksi tidak dapat diubah.",
            "Penyimpanan hak akses per modul belum tersedia di server; disimpan di browser ini. Tab Akses Menu (Server) tersimpan di server.",
          ]} />
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
