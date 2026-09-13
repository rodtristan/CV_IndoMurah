"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Building2 } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api-client";

export default function CompanySettingsPage() {
  const [form, setForm] = useState({
    name: "", code: "", address: "", city: "", phone: "", fax: "",
    email: "", website: "", taxId: "", NPWP: "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await api.get("company").catch(() => ({ success: false, data: null } as any));
    if (res.success && res.data) setForm(res.data);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setLoading(true);
    await api.put("company", "", form).catch(() => ({}));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageWrapper>
      <PageHeader title="Profil Perusahaan" subtitle="Pengaturan profil dan info perusahaan"
        actions={<Button variant="primary" icon={Save} onClick={handleSave} loading={loading}>{saved ? "Tersimpan!" : "Simpan"}</Button>} />

      <Card>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold text-highlighted flex items-center gap-2"><Building2 className="w-4 h-4" /> Info Umum</h3>
            <Input label="Nama Perusahaan" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Kode Perusahaan" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            <Input label="Alamat" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            <Input label="Kota" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-highlighted">Kontak</h3>
            <Input label="Telepon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Input label="Fax" value={form.fax} onChange={e => setForm(f => ({ ...f, fax: e.target.value }))} />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <Input label="Website" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
          </div>
          <div className="space-y-4 lg:col-span-2">
            <h3 className="font-semibold text-highlighted">Pajak</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="NPWP" value={form.NPWP} onChange={e => setForm(f => ({ ...f, NPWP: e.target.value }))} />
              <Input label="No. PKP / Tax ID" value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} />
            </div>
          </div>
        </div>
      </Card>
    </PageWrapper>
  );
}

