"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Building2 } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api-client";

export default function CompanySettingsPage() {
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "", address: "", city: "", province: "", postalCode: "", phone: "",
    email: "", taxId: "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await api.get<any[]>("company", { $take: 1 } as any).catch(() => ({ success: false, data: [] } as any));
    const company = res.success ? res.data?.[0] : null;
    if (company) {
      setCompanyId(company.ID);
      setForm({
        name: company.Name ?? "", address: company.Address ?? "", city: company.City ?? "",
        province: company.Province ?? "", postalCode: company.PostalCode ?? "",
        phone: company.Phone ?? "", email: company.Email ?? "", taxId: company.TaxID ?? "",
      });
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (companyId) {
        await api.patch("company", companyId, form);
      } else {
        const res = await api.post<any>("company", form);
        if (res.success && res.data) setCompanyId(res.data.ID);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
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
            <Input label="Alamat" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            <Input label="Kota" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            <Input label="Provinsi" value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} />
            <Input label="Kode Pos" value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-highlighted">Kontak</h3>
            <Input label="Telepon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-4 lg:col-span-2">
            <h3 className="font-semibold text-highlighted">Pajak</h3>
            <Input label="No. PKP / Tax ID" value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} />
          </div>
        </div>
      </Card>
    </PageWrapper>
  );
}

