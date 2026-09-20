"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KInfoBox } from "@/components/kform";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";

const TOOLS = [
  { key: "vacuum", title: "Vacuum Standard", desc: "Merampingkan ukuran database dengan menghapus hasil proses perhitungan database yang tidak berguna, sehingga mempercepat kinerja database." },
  { key: "vacuum-full", title: "Vacuum Full", desc: "Merampingkan ukuran database seperti Vacuum Standard, namun dengan proses yang lebih lama." },
  { key: "reindex", title: "Re Index", desc: "Membuat index ulang, yaitu mengatur index data agar pencarian data lebih cepat." },
];

export default function DatabaseSettingsPage() {
  usePageTitle("Pengaturan Database");
  const [health, setHealth] = useState<{ status?: string; timestamp?: string } | null>(null);

  useEffect(() => {
    api.get<unknown>("health", undefined, { skipCache: true })
      .then((r) => setHealth(r as unknown as { status?: string; timestamp?: string }))
      .catch(() => setHealth(null));
  }, []);

  return (
    <PageWrapper>
      <Card className="p-4">
        <KInfoBox title="Keterangan" items={["Menu ini digunakan untuk pengaturan database. Penyimpanan belum tersedia di server: perintah di bawah belum dapat dijalankan."]} />
        <div className="grid gap-4 md:grid-cols-3">
          {TOOLS.map((t) => (
            <div key={t.key} className="flex flex-col rounded border border-[#d5d9de] p-4">
              <p className="text-[16px] font-semibold">{t.title}</p>
              <p className="mt-1 flex-1 text-[13px] text-[#3a4654]">{t.desc}</p>
              <button type="button" onClick={() => toast.info("Fitur ini belum tersedia di server")}
                className="mt-3 h-10 rounded border border-[#cfd4da] bg-white text-[14px] hover:bg-[#f3f4f6]">Jalankan</button>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded border border-[#d5d9de] p-4">
          <p className="mb-2 text-[16px] font-semibold">Informasi Sistem</p>
          <dl className="grid gap-y-1 text-[14px] sm:grid-cols-[200px_1fr]">
            <dt className="text-[#3a4654]">Status Server</dt><dd>{health?.status === "ok" ? "Terhubung" : "Tidak terhubung"}</dd>
            <dt className="text-[#3a4654]">Waktu Server</dt><dd>{health?.timestamp ? new Date(health.timestamp).toLocaleString("id-ID") : "-"}</dd>
          </dl>
        </div>
      </Card>
    </PageWrapper>
  );
}
