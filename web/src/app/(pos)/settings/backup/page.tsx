"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DatabaseBackup, RotateCcw } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { ConfirmModal } from "@/components/ui/Modal";
import { KInfoBox } from "@/components/kform";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/lib/page-title";

interface BackupRow { id: string; date: string; file: string; size: string; note: string }

// There is no backup endpoint on the server yet, so the list is empty.
const BACKUPS: BackupRow[] = [];

const btn = "inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-[14px] hover:bg-[#f3f4f6] disabled:opacity-50";

export default function BackupPage() {
  usePageTitle("List Backup");
  const [selected, setSelected] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const notAvailable = () => toast.info("Fitur backup belum tersedia di server");

  return (
    <PageWrapper>
      <Card className="p-4">
        <KInfoBox title="Keterangan" items={[
          "List Backup berfungsi untuk melihat dan melakukan restore data lama. Pilih data sesuai tanggal, klik Restore Data, lalu klik tombol Proses.",
          "Penyimpanan belum tersedia di server: daftar backup, Buat Backup dan Restore belum dapat digunakan.",
        ]} />
        <div className="mb-3 flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={notAvailable}><DatabaseBackup className="size-4" /> Buat Backup</button>
          <button type="button" className={btn} disabled={!selected} onClick={() => setConfirm(true)}><RotateCcw className="size-4" /> Restore Data</button>
        </div>
        <div className="overflow-x-auto border border-[#d5d9de]">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-[#d5d9de] bg-[#f5f6f8]">
                {["No", "Tanggal", "Nama File", "Ukuran", "Keterangan"].map((h) => <th key={h} className="px-3 py-2 text-left font-bold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {BACKUPS.length === 0 ? (
                <tr><td colSpan={5} className="h-40 text-center text-[18px] text-[#9aa3ad]">No data</td></tr>
              ) : BACKUPS.map((b, i) => (
                <tr key={b.id} onClick={() => setSelected(b.id)} className={cn("cursor-pointer border-b border-[#eceff2]", selected === b.id && "bg-primary/10")}>
                  <td className="px-3 py-2">{i + 1}</td><td className="px-3 py-2">{b.date}</td><td className="px-3 py-2">{b.file}</td>
                  <td className="px-3 py-2">{b.size}</td><td className="px-3 py-2">{b.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <ConfirmModal open={confirm} onClose={() => setConfirm(false)} onConfirm={() => { setConfirm(false); notAvailable(); }}
        title="Restore Data" message="Proses restore akan mengganti data saat ini dengan data backup yang dipilih. Lanjutkan?" confirmText="Proses" variant="danger" />
    </PageWrapper>
  );
}
