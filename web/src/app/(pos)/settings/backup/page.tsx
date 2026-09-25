"use client";

import { DatabaseBackup } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KInfoBox } from "@/components/kform";
import { usePageTitle } from "@/lib/page-title";

// Database backups are not made by this application: the PostgreSQL provider/server takes
// them (automatic snapshots / point-in-time recovery). No fake "Buat Backup"/"Restore" buttons.
export default function BackupPage() {
  usePageTitle("List Backup");
  return (
    <PageWrapper>
      <Card className="p-4">
        <div className="mb-3 flex items-center gap-3">
          <DatabaseBackup className="size-8 text-primary" />
          <p className="text-[15px] font-semibold text-[#2b3540]">Backup database dikelola oleh penyedia database</p>
        </div>
        <KInfoBox title="Keterangan" items={[
          "Aplikasi ini tidak membuat atau me-restore backup sendiri. Data tersimpan di server PostgreSQL, dan backup dilakukan oleh penyedia/server database tersebut (snapshot otomatis atau point-in-time recovery).",
          "Pastikan backup otomatis aktif di panel penyedia database Anda, dan cek jadwal serta masa simpannya secara berkala.",
          "Restore data dilakukan oleh administrator server melalui panel penyedia database, bukan dari halaman ini.",
          "Untuk mengambil salinan data master (item, pelanggan, supplier) gunakan fitur ekspor pada masing-masing daftar atau menu Import Data.",
        ]} />
      </Card>
    </PageWrapper>
  );
}
