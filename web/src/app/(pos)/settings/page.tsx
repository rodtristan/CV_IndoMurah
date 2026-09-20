"use client";

import Link from "next/link";
import { Building2, UserRound, ShieldCheck, KeyRound, Settings2, Hash, Menu as MenuIcon, ScrollText, Upload, Globe, Database, DatabaseBackup } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { useAuth } from "@/lib/auth-context";

const SETTINGS_LINKS = [
  { href: "/settings/users", label: "Daftar User", description: "Tambah, ubah dan hapus user program", icon: KeyRound },
  { href: "/settings/roles", label: "Kelompok Akses User", description: "Hak akses per kelompok user dan modul", icon: ShieldCheck },
  { href: "/settings/general", label: "Pengaturan Umum", description: "Umum, transaksi, dan desimal digit", icon: Settings2 },
  { href: "/settings/company", label: "Data Perusahaan", description: "Nama, alamat, logo untuk bukti dan laporan", icon: Building2 },
  { href: "/settings/website", label: "Pengaturan Website", description: "Share Info, ID Toko dan pesanan online", icon: Globe },
  { href: "/settings/numbering", label: "Setting Nomor", description: "Penomoran transaksi, supplier, pelanggan, sales", icon: Hash },
  { href: "/settings/activity-log", label: "Log Aktivitas", description: "Aktivitas Transaksi, Master, Akuntansi, Impor, Sistem", icon: ScrollText },
  { href: "/settings/backup", label: "List Backup", description: "Lihat dan restore data lama", icon: DatabaseBackup },
  { href: "/settings/import", label: "Import Data", description: "Import Item, Supplier dan Pelanggan dari Excel", icon: Upload },
  { href: "/settings/database", label: "Pengaturan Database", description: "Vacuum, Re Index dan informasi sistem", icon: Database },
  { href: "/settings/menus", label: "Menu Aplikasi", description: "Katalog menu untuk hak akses", icon: MenuIcon },
  { href: "/settings/profile", label: "Profil Saya", description: "Lihat data akun Anda", icon: UserRound },
];

export default function SettingsHubPage() {
  const { user } = useAuth();

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-4 text-sm text-muted">
          Masuk sebagai <span className="font-semibold text-highlighted">{user?.name}</span>
          {user?.company && <> &middot; {user.company.Name}</>}
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
