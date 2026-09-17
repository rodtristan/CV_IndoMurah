"use client";

import Link from "next/link";
import { Building2, UserRound, ShieldCheck, KeyRound } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { useAuth } from "@/lib/auth-context";

const SETTINGS_LINKS = [
  { href: "/settings/profile", label: "Profil Saya", description: "Lihat data akun Anda", icon: UserRound },
  { href: "/settings/company", label: "Data Perusahaan", description: "Kelola informasi perusahaan", icon: Building2 },
  { href: "/settings/users", label: "Pengguna", description: "Kelola akun pengguna", icon: KeyRound },
  { href: "/settings/roles", label: "Hak Akses", description: "Kelola role & izin", icon: ShieldCheck },
];

export default function SettingsHubPage() {
  const { user } = useAuth();

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-4 text-sm text-muted">
          Masuk sebagai <span className="font-semibold text-highlighted">{user?.name}</span>
          {user?.company && <> &middot; {user.company.name}</>}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SETTINGS_LINKS.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg border border-default p-4 transition-colors hover:bg-elevated"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="font-medium text-highlighted">{label}</p>
                <p className="text-xs text-muted">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </PageWrapper>
  );
}
