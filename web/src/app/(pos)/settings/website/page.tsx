"use client";

import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KInfoBox } from "@/components/kform";
import { usePageTitle } from "@/lib/page-title";

// The Ketoko "Share Info / toko online" feature (public item pages + online orders) does not
// exist in this application, so there is nothing to configure here. The page says so instead
// of offering inputs that would not have any effect.
export default function WebsiteSettingsPage() {
  usePageTitle("Pengaturan Website");
  return (
    <PageWrapper>
      <Card className="p-4">
        <KInfoBox variant="warning" title="Belum tersedia" items={[
          "Fitur Share Info / toko online (halaman item publik dan pesanan dari pelanggan lewat link) belum tersedia di aplikasi ini.",
          "Karena itu belum ada pengaturan website yang dapat disimpan. Halaman ini akan diaktifkan bila fitur tersebut dibuat.",
          "Data perusahaan (nama, alamat, website, logo) diatur di menu Pengaturan > Data Perusahaan.",
        ]} />
      </Card>
    </PageWrapper>
  );
}
