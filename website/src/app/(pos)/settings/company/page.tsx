"use client";

import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function CompanySettingsPage() {
  return (
    <PageWrapper>
      <PageTitle title="Data Perusahaan" subtitle="Pengaturan data perusahaan" />
      <div className="max-w-xl space-y-6">
        <div className="rounded-lg border border-default bg-bg p-6">
          <h3 className="mb-4 font-medium text-highlighted">Informasi Perusahaan</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-toned">Nama Perusahaan</label>
              <Input defaultValue="CV IndoMurah" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-toned">NPWP</label>
              <Input defaultValue="01.234.567.8-901.000" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-toned">Alamat</label>
              <Input defaultValue="Jl. Perusahaan No. 1" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-toned">Kota</label>
              <Input defaultValue="Bandung" />
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
