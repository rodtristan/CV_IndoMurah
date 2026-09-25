"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KCheckbox, KColumns, KInfoBox, KInput, KRow, KSaveBar, KSelect } from "@/components/kform";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";
import { Loading, apiError } from "./local";

const LIST = "/settings/users";

interface RoleRow { ID: number; RoleName: string }

interface State { username: string; name: string; email: string; password: string; confirm: string; roleId: string; active: boolean }
const EMPTY: State = { username: "", name: "", email: "", password: "", confirm: "", roleId: "", active: true };

export function UserForm({ id }: { id?: string }) {
  const router = useRouter();
  const isNew = !id;
  usePageTitle(isNew ? "User Baru" : "Edit User");
  const [f, setF] = useState<State>(EMPTY);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [origRoleIds, setOrigRoleIds] = useState<number[]>([]);
  const [isMainAdmin, setIsMainAdmin] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r, c] = await Promise.all([
          api.get<RoleRow[]>("roles", { $select: "ID,RoleName", $take: 200 }),
          api.get<{ ID: number }[]>("company", { $take: 1 }),
        ]);
        if (cancelled) return;
        setRoles(r.data ?? []);
        setCompanyId(c.data?.[0]?.ID ?? null);
        if (id) {
          const [u, ur] = await Promise.all([
            api.get<Record<string, unknown>>(`users/${id}`, undefined, { skipCache: true }),
            api.get<{ mainRole: string; extraRoles: RoleRow[] }>(`users/${id}/roles`, undefined, { skipCache: true }),
          ]);
          if (cancelled) return;
          const d = u.data!;
          const extra = ur.data?.extraRoles ?? [];
          setOrigRoleIds(extra.map((e) => e.ID));
          setIsMainAdmin(String(d.Username) === "admin");
          setF({ ...EMPTY, username: String(d.Username ?? ""), name: String(d.Name ?? ""), email: String(d.Email ?? ""), active: Boolean(d.IsActive), roleId: extra[0] ? String(extra[0].ID) : "" });
        }
      } catch (e) { toast.error(apiError(e)); } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const set = (k: keyof State) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const syncRole = async (userId: string) => {
    const want = f.roleId ? Number(f.roleId) : null;
    for (const rid of origRoleIds) if (rid !== want) await api.delete(`users/${userId}/roles`, rid);
    if (want && !origRoleIds.includes(want)) await api.post(`users/${userId}/roles`, { roleId: want });
  };

  const save = async () => {
    if (!f.username.trim()) { toast.error("User ID wajib diisi"); return; }
    if (!f.name.trim()) { toast.error("Nama User wajib diisi"); return; }
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) { toast.error("Format email tidak valid"); return; }
    if (isNew) {
      if (!f.password) { toast.error("Password wajib diisi"); return; }
      if (f.password.length < 8) { toast.error("Password minimal 8 karakter"); return; }
      if (f.password !== f.confirm) { toast.error("Konfirmasi password tidak sama"); return; }
      if (!companyId) { toast.error("Data perusahaan belum termuat"); return; }
    }
    setSaving(true);
    try {
      if (isNew) {
        const res = await api.post<{ ID: string }>("users", {
          companyId, username: f.username.trim(), name: f.name.trim(), email: f.email || undefined, password: f.password,
        });
        const newId = res.data!.ID;
        try { await syncRole(newId); } catch (e) { toast.error(`User dibuat, tetapi kelompok gagal: ${apiError(e)}`); }
      } else {
        await api.put("users", id!, { username: f.username.trim(), name: f.name.trim(), email: f.email || undefined, isActive: f.active });
        await syncRole(id!);
      }
      toast.success("User berhasil disimpan");
      router.push(LIST);
    } catch (e) { toast.error(apiError(e)); } finally { setSaving(false); }
  };

  if (loading) return <PageWrapper><Loading /></PageWrapper>;

  return (
    <PageWrapper>
      <Card className="p-4">
        {isMainAdmin && <KInfoBox variant="warning" title="Penting" items={["User \"admin\" memiliki hak akses paling tinggi. Disarankan tidak mengubah hak akses user admin."]} />}
        <div className="pt-2">
          <KColumns>
            <div>
              <KInput label="User ID" value={f.username} onChange={set("username")} readOnly={isMainAdmin} />
              <KInput label="Nama User" value={f.name} onChange={set("name")} />
              <KInput label="Email" type="email" value={f.email} onChange={set("email")} />
            </div>
            <div>
              <KSelect label="Kelompok User" value={f.roleId} onChange={(v) => setF((p) => ({ ...p, roleId: v }))}
                options={roles.map((r) => ({ value: String(r.ID), label: r.RoleName }))} placeholder="Pilih kelompok user"
                hint="Kelompok menentukan hak akses (lihat Kelompok Akses User)." />
              {isNew ? (
                <KRow>
                  <KInput label="Password" type="password" value={f.password} onChange={set("password")} autoComplete="new-password" hint="Minimal 8 karakter." />
                  <KInput label="Ulangi Password" type="password" value={f.confirm} onChange={set("confirm")} autoComplete="new-password" />
                </KRow>
              ) : (
                <KInput label="Password" type="password" value="" disabled placeholder="********"
                  hint="Password diganti oleh pemilik akun sendiri lewat menu Profil > Ganti Password." />
              )}
              <KCheckbox label="Status" caption="User aktif (dapat login)" checked={f.active} onChange={(v) => setF((p) => ({ ...p, active: v }))} />
            </div>
          </KColumns>
        </div>
        <KSaveBar onSave={save} saving={saving} extra={
          <button type="button" onClick={() => router.push(LIST)} className="h-10 rounded border border-[#cfd4da] bg-white px-5 text-[15px] hover:bg-[#f3f4f6]">Batal</button>
        } />
      </Card>
    </PageWrapper>
  );
}
