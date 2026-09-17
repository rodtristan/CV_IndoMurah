"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Settings = {
  id?: number;
  reportDesignEnabled: boolean;
  itemAddMode: string;
  displayMode: string;
  displayRowMode: string;
  timezone: string;
  maxSearchRows: number;
  addressBinding: string;
  showImageOnTransaction: boolean;
  warnPriceBelowCost: boolean;
  showBrandColumn: boolean;
  showInfoColumn: boolean;
  editRequiresAccess: boolean;
  autoShowSalesOnCustomer: boolean;
  decimalPrice: number;
  decimalQty: number;
  decimalTax: number;
  decimalDiscount: number;
};

const DEFAULTS: Settings = {
  reportDesignEnabled: false,
  itemAddMode: "SEDANG",
  displayMode: "ACTIVE_ONLY",
  displayRowMode: "SINGLE_ROW",
  timezone: "Asia/Jakarta",
  maxSearchRows: 100,
  addressBinding: "COMPANY",
  showImageOnTransaction: true,
  warnPriceBelowCost: true,
  showBrandColumn: false,
  showInfoColumn: false,
  editRequiresAccess: false,
  autoShowSalesOnCustomer: false,
  decimalPrice: 0,
  decimalQty: 0,
  decimalTax: 0,
  decimalDiscount: 0,
};

const TABS = ["Umum", "Transaksi", "Desimal Digit"] as const;

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 border-b border-default py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-highlighted">{label}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 shrink-0 rounded border-default accent-primary"
      />
    </label>
  );
}

export default function GeneralSettingsPage() {
  const [tab, setTab] = useState<typeof TABS[number]>("Umum");
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Settings[]>("app-setting", { $take: 1 } as any).catch(() => ({ success: false, data: [] } as any));
      if (res.success && res.data && res.data.length > 0) {
        setSettings(res.data[0]);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (settings.id) {
        await api.patch("app-setting", settings.id, settings).catch(() => ({}));
      } else {
        await api.post("app-setting", settings).catch(() => ({}));
      }
      await fetchData();
    } finally { setSaving(false); }
  };

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((s) => ({ ...s, [key]: value }));

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Card className="p-0">
        <div className="flex border-b border-default">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-3 text-sm font-medium transition-colors",
                tab === t ? "border-b-2 border-primary text-primary" : "text-muted hover:text-highlighted"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "Umum" && (
            <div className="space-y-1">
              <Toggle
                label="Aktifkan Design Report"
                hint="Jika tidak dicentang, menu Disain Bukti dan Laporan tidak dapat diakses."
                checked={settings.reportDesignEnabled}
                onChange={(v) => set("reportDesignEnabled", v)}
              />
              <div className="grid grid-cols-2 gap-4 py-3">
                <Select
                  label="Mode Tambah/Edit Item"
                  value={settings.itemAddMode}
                  onChange={(e) => set("itemAddMode", e.target.value)}
                  options={[{ value: "MUDAH", label: "Mode Mudah" }, { value: "SEDANG", label: "Mode Sedang" }]}
                />
                <Select
                  label="Mode Tampil Data"
                  value={settings.displayMode}
                  onChange={(e) => set("displayMode", e.target.value)}
                  options={[{ value: "ALL", label: "Semua Data" }, { value: "ACTIVE_ONLY", label: "Hanya yang Aktif Dijual" }]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 py-3">
                <Select
                  label="Mode Tampil Baris Item"
                  value={settings.displayRowMode}
                  onChange={(e) => set("displayRowMode", e.target.value)}
                  options={[{ value: "PER_UNIT", label: "Per Satuan" }, { value: "SINGLE_ROW", label: "Satu Baris" }]}
                />
                <Input
                  label="Time Zone"
                  value={settings.timezone}
                  onChange={(e) => set("timezone", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 py-3">
                <Input
                  label="Maksimum Baris Pada Pencarian"
                  type="number"
                  value={settings.maxSearchRows}
                  onChange={(e) => set("maxSearchRows", Number(e.target.value))}
                />
                <Select
                  label="Binding Data Alamat"
                  value={settings.addressBinding}
                  onChange={(e) => set("addressBinding", e.target.value)}
                  options={[{ value: "WAREHOUSE", label: "Sesuai Dept/Gudang" }, { value: "COMPANY", label: "Sesuai Data Perusahaan" }]}
                />
              </div>
            </div>
          )}

          {tab === "Transaksi" && (
            <div className="space-y-1">
              <Toggle label="Tampil Gambar pada Transaksi" checked={settings.showImageOnTransaction} onChange={(v) => set("showImageOnTransaction", v)} />
              <Toggle
                label="Tampil Konfirmasi Harga Jual lebih kecil dari Harga Pokok"
                hint="Muncul di menu Penjualan dan Kasir."
                checked={settings.warnPriceBelowCost}
                onChange={(v) => set("warnPriceBelowCost", v)}
              />
              <Toggle label="Aktifkan Kolom Merek pada semua transaksi" checked={settings.showBrandColumn} onChange={(v) => set("showBrandColumn", v)} />
              <Toggle label="Aktifkan Kolom Info pada semua transaksi" checked={settings.showInfoColumn} onChange={(v) => set("showInfoColumn", v)} />
              <Toggle
                label='Tombol Edit tetap bisa melihat data walau hak akses edit dimatikan'
                hint="Hanya berlaku pada menu Master Data."
                checked={settings.editRequiresAccess}
                onChange={(v) => set("editRequiresAccess", v)}
              />
              <Toggle
                label="Aktifkan Pilih Customer langsung tampil sales"
                hint="Nama sales pelanggan harus sudah diisi di Master Data Pelanggan."
                checked={settings.autoShowSalesOnCustomer}
                onChange={(v) => set("autoShowSalesOnCustomer", v)}
              />
            </div>
          )}

          {tab === "Desimal Digit" && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Digit Desimal Harga" type="number" min={0} max={4} value={settings.decimalPrice} onChange={(e) => set("decimalPrice", Number(e.target.value))} />
              <Input label="Digit Desimal Jumlah" type="number" min={0} max={4} value={settings.decimalQty} onChange={(e) => set("decimalQty", Number(e.target.value))} />
              <Input label="Digit Desimal Pajak" type="number" min={0} max={4} value={settings.decimalTax} onChange={(e) => set("decimalTax", Number(e.target.value))} />
              <Input label="Digit Desimal Potongan/Diskon" type="number" min={0} max={4} value={settings.decimalDiscount} onChange={(e) => set("decimalDiscount", Number(e.target.value))} />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-default p-4">
          <Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button>
        </div>
      </Card>
    </PageWrapper>
  );
}
