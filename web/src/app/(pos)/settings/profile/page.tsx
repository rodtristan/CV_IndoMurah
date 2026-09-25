"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserRound, Mail, Building2, ShieldCheck, Lock } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { KInput } from "@/components/kform";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

// Ganti password: PATCH /auth/password { currentPassword, newPassword } (user dari JWT).
function ChangePasswordForm() {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!cur) { setError("Password lama wajib diisi."); return; }
    if (next.length < 8) { setError("Password baru minimal 8 karakter."); return; }
    if (next.length > 128) { setError("Password baru maksimal 128 karakter."); return; }
    if (next !== confirm) { setError("Konfirmasi password baru tidak sama."); return; }
    if (next === cur) { setError("Password baru harus berbeda dari password lama."); return; }
    setSaving(true);
    try {
      await api.request("PATCH", "auth/password", { currentPassword: cur, newPassword: next });
      toast.success("Password berhasil diubah");
      setCur(""); setNext(""); setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 border-t border-default pt-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-highlighted"><Lock className="size-4" /> Ganti Password</p>
      <KInput label="Password Lama" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} />
      <KInput label="Password Baru" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} hint="Minimal 8 karakter." />
      <KInput label="Ulangi Password Baru" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      {error && <p className="mb-3 text-sm text-danger">{error}</p>}
      <Button type="submit" loading={saving} disabled={saving}>Simpan Password</Button>
    </form>
  );
}

function Field({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-default py-3 last:border-0">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted" />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium text-highlighted">{value || "-"}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <PageWrapper>
      <Card className="mx-auto max-w-lg p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-success text-2xl font-semibold text-white">
            {user?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-lg font-semibold text-highlighted">{user?.name}</p>
            <Badge variant={user?.isActive ? "success" : "default"}>
              {user?.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
        </div>

        <Field icon={UserRound} label="Username" value={user?.username || ""} />
        <Field icon={Mail} label="Email" value={user?.email || ""} />
        <Field icon={ShieldCheck} label="Role" value={user?.role || ""} />
        <Field icon={Building2} label="Perusahaan" value={user?.company?.Name || ""} />

        <ChangePasswordForm />
      </Card>
    </PageWrapper>
  );
}
