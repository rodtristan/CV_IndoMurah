"use client";

import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function GeneralSettingsPage() {
  return (
    <PageWrapper>
      <PageTitle title="Pengaturan Umum" subtitle="Pengaturan umum aplikasi" />
      <div className="max-w-xl space-y-6">
        <div className="rounded-lg border border-default bg-bg p-6">
          <h3 className="mb-4 font-medium text-highlighted">Pengaturan Toko</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-toned">Nama Toko</label>
              <Input defaultValue="Toko CV IndoMurah" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-toned">Alamat</label>
              <Input defaultValue="Jl. Contoh No. 1" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-toned">Telepon</label>
              <Input defaultValue="021-12345678" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-toned">Email</label>
              <Input defaultValue="info@tokocvindomurah.com" />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button>Simpan Perubahan</Button>
        </div>
      </div>
    </PageWrapper>
  );
}
