"use client";

import { UserRound, Mail, Building2, ShieldCheck, Lock } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/StatCard";
import { useAuth } from "@/lib/auth-context";

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

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-default bg-elevated/50 p-3 text-xs text-muted">
          <Lock className="size-4 shrink-0" />
          Ganti password belum tersedia — akan ditambahkan setelah endpoint
          backend-nya dibuat.
        </div>
      </Card>
    </PageWrapper>
  );
}
