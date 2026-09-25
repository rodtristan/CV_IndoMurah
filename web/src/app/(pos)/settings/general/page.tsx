"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import {
  KCheckbox, KColumns, KInfoBox, KInput, KNumber, KRadioGroup, KSaveBar, KSelect, KTabs,
} from "@/components/kform";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";
import { Loading, apiError } from "../_lib/local";

// Fields the API (AppSetting) persists.
interface ServerSettings {
  reportDesignEnabled: boolean;
  itemAddMode: string;
  displayMode: string;
  displayRowMode: string;
  timezone: string;
  maxSearchRows: string;
  addressBinding: string;
  showImageOnTransaction: boolean;
  warnPriceBelowCost: boolean;
  showBrandColumn: boolean;
  showInfoColumn: boolean;
  editRequiresAccess: boolean;
  autoShowSalesOnCustomer: boolean;
  decimalPrice: string;
  decimalQty: string;
  decimalTax: string;
  decimalDiscount: string;
}

// Options stored server-side under namespaced "general.*" keys (marked * in the UI).
interface LocalSettings {
  inventoryAccountFromDept: boolean;
  dateFormat: string;
  defaultCustomerName: string;
  purchaseTaxIncludeMode: string;
  transactionCostMode: string;
  allowSellOutOfStock: boolean;
  allowZeroInput: boolean;
  confirmChangeCustomer: boolean;
  dueDays: string;
  taxSystem: string;
  defaultTax: string;
}

const SERVER_DEFAULTS: ServerSettings = {
  reportDesignEnabled: false, itemAddMode: "SEDANG", displayMode: "ACTIVE_ONLY", displayRowMode: "SINGLE_ROW",
  timezone: "Asia/Jakarta", maxSearchRows: "100", addressBinding: "COMPANY", showImageOnTransaction: true,
  warnPriceBelowCost: true, showBrandColumn: false, showInfoColumn: false, editRequiresAccess: false,
  autoShowSalesOnCustomer: false, decimalPrice: "0", decimalQty: "0", decimalTax: "0", decimalDiscount: "0",
};

const LOCAL_DEFAULTS: LocalSettings = {
  inventoryAccountFromDept: false, dateFormat: "dd/MM/yyyy", defaultCustomerName: "Umum",
  purchaseTaxIncludeMode: "hpp", transactionCostMode: "add", allowSellOutOfStock: true, allowZeroInput: false,
  confirmChangeCustomer: true, dueDays: "30", taxSystem: "exclude", defaultTax: "11",
};

const TABS = [
  { key: "umum", label: "Umum" },
  { key: "transaksi", label: "Transaksi" },
  { key: "desimal", label: "Desimal Digit" },
];

const TIMEZONES = [
  { value: "Asia/Jakarta", label: "Asia/Jakarta (WIB, UTC+7)" },
  { value: "Asia/Makassar", label: "Asia/Makassar (WITA, UTC+8)" },
  { value: "Asia/Jayapura", label: "Asia/Jayapura (WIT, UTC+9)" },
];
const DIGITS = [0, 1, 2, 3, 4].map((n) => ({ value: String(n), label: String(n) }));

function toServer(r: Record<string, unknown>): ServerSettings {
  return {
    reportDesignEnabled: Boolean(r.ReportDesignEnabled), itemAddMode: String(r.ItemAddMode ?? "SEDANG"),
    displayMode: String(r.DisplayMode ?? "ACTIVE_ONLY"), displayRowMode: String(r.DisplayRowMode ?? "SINGLE_ROW"),
    timezone: String(r.Timezone ?? "Asia/Jakarta"), maxSearchRows: String(r.MaxSearchRows ?? 100),
    addressBinding: String(r.AddressBinding ?? "COMPANY"), showImageOnTransaction: Boolean(r.ShowImageOnTransaction),
    warnPriceBelowCost: Boolean(r.WarnPriceBelowCost), showBrandColumn: Boolean(r.ShowBrandColumn),
    showInfoColumn: Boolean(r.ShowInfoColumn), editRequiresAccess: Boolean(r.EditRequiresAccess),
    autoShowSalesOnCustomer: Boolean(r.AutoShowSalesOnCustomer), decimalPrice: String(r.DecimalPrice ?? 0),
    decimalQty: String(r.DecimalQty ?? 0), decimalTax: String(r.DecimalTax ?? 0), decimalDiscount: String(r.DecimalDiscount ?? 0),
  };
}

const sample = (n: number, d: string) => n.toLocaleString("id-ID", { minimumFractionDigits: Number(d), maximumFractionDigits: Number(d) });

export default function GeneralSettingsPage() {
  usePageTitle("Pengaturan Umum");
  const [tab, setTab] = useState("umum");
  const [id, setId] = useState<number | null>(null);
  const [s, setS] = useState<ServerSettings>(SERVER_DEFAULTS);
  const [l, setL] = useState<LocalSettings>(LOCAL_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Record<string, unknown>[]>("app-setting", { $take: 1 }, { skipCache: true });
      const row = res.data?.[0];
      if (row) { setId(Number(row.ID)); setS(toServer(row)); }
      const g = await api.get<Record<string, unknown>>("general-settings", undefined, { skipCache: true });
      const d = (g.data ?? {}) as Record<string, unknown>;
      setL((prev) => {
        const next = { ...prev } as Record<string, unknown>;
        for (const k of Object.keys(LOCAL_DEFAULTS)) {
          const v = d[`general.${k}`];
          if (v !== undefined && v !== null) next[k] = typeof (LOCAL_DEFAULTS as unknown as Record<string, unknown>)[k] === "string" ? String(v) : v;
        }
        return next as unknown as LocalSettings;
      });
    } catch (e) { toast.error(apiError(e)); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const setSv = <K extends keyof ServerSettings>(k: K, v: ServerSettings[K]) => setS((p) => ({ ...p, [k]: v }));
  const setLc = <K extends keyof LocalSettings>(k: K, v: LocalSettings[K]) => setL((p) => ({ ...p, [k]: v }));

  const save = async () => {
    const max = Number(s.maxSearchRows);
    if (!Number.isInteger(max) || max < 1) { toast.error("Maksimum baris pencarian harus angka >= 1"); setTab("umum"); return; }
    const payload = {
      ...s, maxSearchRows: max, decimalPrice: Number(s.decimalPrice), decimalQty: Number(s.decimalQty),
      decimalTax: Number(s.decimalTax), decimalDiscount: Number(s.decimalDiscount),
    };
    setSaving(true);
    try {
      if (id) await api.patch("app-setting", id, payload); else await api.post("app-setting", payload);
      const extra: Record<string, string | number | boolean> = {};
      for (const [k, v] of Object.entries(l)) extra[`general.${k}`] = v as string | number | boolean;
      await api.put("general-settings", "all", extra);
      toast.success("Pengaturan berhasil disimpan");
      await load();
    } catch (e) { toast.error(apiError(e)); } finally { setSaving(false); }
  };

  if (loading) return <PageWrapper><Loading /></PageWrapper>;

  return (
    <PageWrapper>
      <Card className="p-4">
        <KTabs tabs={TABS} active={tab} onChange={setTab} />
        <div className="pt-4">
          {tab === "umum" && (
            <KColumns>
              <div>
                <KCheckbox label="Aktifkan Design Report" caption="Design Report bisa diakses" checked={s.reportDesignEnabled}
                  onChange={(v) => setSv("reportDesignEnabled", v)}
                  hint="Jika tidak dicentang, Design Report tidak bisa diakses." />
                <KRadioGroup label="Mode Tambah/Edit Item" value={s.itemAddMode} onChange={(v) => setSv("itemAddMode", v)} inline
                  options={[{ value: "MUDAH", label: "Mode Mudah" }, { value: "SEDANG", label: "Mode Sedang" }]}
                  hint="Default modul Tambah/Edit Item." />
                <KRadioGroup label="Mode Tampil Data" value={s.displayMode} onChange={(v) => setSv("displayMode", v)} inline
                  options={[{ value: "ALL", label: "Tampil Semua Data" }, { value: "ACTIVE_ONLY", label: "Hanya Item yang Masih Dijual" }]}
                  hint="Item yang tidak dijual diubah pada master data item." />
                <KRadioGroup label="Mode Tampil Baris Item" value={s.displayRowMode} onChange={(v) => setSv("displayRowMode", v)} inline
                  options={[{ value: "PER_UNIT", label: "Tampil Per Satuan" }, { value: "SINGLE_ROW", label: "Tampil Satu Baris" }]}
                  hint="Item multi satuan: semua satuan tampil, atau hanya satu baris." />
              </div>
              <div>
                <KSelect label="Time Zone" value={s.timezone} onChange={(v) => setSv("timezone", v)} options={TIMEZONES} placeholder="Pilih zona waktu" />
                <KSelect label="Format Tanggal (*)" value={l.dateFormat} onChange={(v) => setLc("dateFormat", v)}
                  options={[{ value: "dd/MM/yyyy", label: "31/12/2026" }, { value: "dd-MM-yyyy", label: "31-12-2026" }, { value: "yyyy-MM-dd", label: "2026-12-31" }, { value: "dd MMM yyyy", label: "31 Des 2026" }]} />
                <KNumber label="Maksimum Baris Pada Pencarian" value={s.maxSearchRows} onChange={(v) => setSv("maxSearchRows", v)} min={1}
                  hint="Membatasi baris yang tampil agar kinerja tetap ringan." />
                <KCheckbox label="Binding Data Alamat Sesuai Login Kantor" caption="Alamat laporan/faktur dari Master Data -> Dept/Gudang"
                  checked={s.addressBinding === "WAREHOUSE"} onChange={(v) => setSv("addressBinding", v ? "WAREHOUSE" : "COMPANY")}
                  hint="Tidak dicentang: alamat dari Pengaturan -> Data Perusahaan." />
                <KCheckbox label="Persediaan Barang Menggunakan Akun pada Dept/Gudang (*)" caption="Akun persediaan dari Master Data -> Dept/Gudang"
                  checked={l.inventoryAccountFromDept} onChange={(v) => setLc("inventoryAccountFromDept", v)}
                  hint="Tidak dicentang: akun dari Akuntansi -> Setting Perkiraan." />
              </div>
            </KColumns>
          )}

          {tab === "transaksi" && (
            <KColumns>
              <div>
                <KCheckbox label="Tampil Gambar pada Transaksi" caption="Gambar item tampil pada transaksi" checked={s.showImageOnTransaction} onChange={(v) => setSv("showImageOnTransaction", v)} />
                <KCheckbox label="Tampil Konfirmasi Harga Jual lebih kecil dari Harga Pokok" caption="Berlaku di menu Penjualan dan Kasir" checked={s.warnPriceBelowCost} onChange={(v) => setSv("warnPriceBelowCost", v)} />
                <KCheckbox label="Aktifkan Kolom Merek pada semua transaksi" caption="Kolom Merek" checked={s.showBrandColumn} onChange={(v) => setSv("showBrandColumn", v)} />
                <KCheckbox label="Aktifkan Kolom Info pada semua transaksi" caption="Keterangan manual per barang" checked={s.showInfoColumn} onChange={(v) => setSv("showInfoColumn", v)} />
                <KCheckbox label="Tombol Edit Bisa melihat data apabila hak akses edit dimatikan (Group Master Data)" caption="Hanya berlaku pada menu Master Data" checked={s.editRequiresAccess} onChange={(v) => setSv("editRequiresAccess", v)} />
                <KCheckbox label="Aktifkan Pilih Customer langsung tampil sales" caption="Nama sales pelanggan harus sudah diisi" checked={s.autoShowSalesOnCustomer} onChange={(v) => setSv("autoShowSalesOnCustomer", v)} />
                <KInput label="Pelanggan Umum/Non Member (*)" value={l.defaultCustomerName} onChange={(e) => setLc("defaultCustomerName", e.target.value)}
                  hint="Nama pelanggan default pada menu Kasir." />
              </div>
              <div>
                <KRadioGroup label="Opsi Pajak Include Pada Pembelian (*)" value={l.purchaseTaxIncludeMode} onChange={(v) => setLc("purchaseTaxIncludeMode", v)}
                  options={[{ value: "hpp", label: "Pajak menjadi HPP" }, { value: "ppn", label: "Pajak masuk Akun PPN Masukan" }]} />
                <KRadioGroup label="Opsi Biaya pada Transaksi (*)" value={l.transactionCostMode} onChange={(v) => setLc("transactionCostMode", v)} inline
                  options={[{ value: "add", label: "Ditambahkan ke total" }, { value: "none", label: "Tidak ditambahkan" }]} />
                <KInput label="Bisa Jual Stok Habis" value="Tidak" readOnly
                  hint="Server selalu menolak penjualan yang melebihi stok gudang (stok tidak boleh minus)." />
                <KCheckbox label="Transaksi Bisa input angka nol (*)" caption="Mis. jumlah item bernilai 0" checked={l.allowZeroInput} onChange={(v) => setLc("allowZeroInput", v)} />
                <KCheckbox label="Tampil Konfirmasi ganti pelanggan pada penjualan (*)" caption="Ganti pelanggan dengan group potongan mengubah harga jual" checked={l.confirmChangeCustomer} onChange={(v) => setLc("confirmChangeCustomer", v)} />
                <KNumber label="Jumlah Hari Jatuh Tempo (*)" value={l.dueDays} onChange={(v) => setLc("dueDays", v)} min={0} hint="Default jatuh tempo kredit Pembelian/Penjualan." />
                <KRadioGroup label="Sistem Pajak Include/Exclude (*)" value={l.taxSystem} onChange={(v) => setLc("taxSystem", v)} inline
                  options={[{ value: "include", label: "Include" }, { value: "exclude", label: "Exclude" }]} />
                <KNumber label="Default Pajak (%) (*)" value={l.defaultTax} onChange={(v) => setLc("defaultTax", v)} min={0} step="0.01" />
              </div>
            </KColumns>
          )}

          {tab === "desimal" && (
            <KColumns>
              <div>
                <KSelect label="Digit Desimal Harga" value={s.decimalPrice} onChange={(v) => setSv("decimalPrice", v)} options={DIGITS} placeholder="0" hint={`Contoh: ${sample(1234567.891, s.decimalPrice)}`} />
                <KSelect label="Digit Desimal Jumlah" value={s.decimalQty} onChange={(v) => setSv("decimalQty", v)} options={DIGITS} placeholder="0" hint={`Contoh: ${sample(12.3456, s.decimalQty)}`} />
              </div>
              <div>
                <KSelect label="Digit Desimal Pajak" value={s.decimalTax} onChange={(v) => setSv("decimalTax", v)} options={DIGITS} placeholder="0" hint={`Contoh: ${sample(110.555, s.decimalTax)}`} />
                <KSelect label="Digit Desimal Potongan/Diskon" value={s.decimalDiscount} onChange={(v) => setSv("decimalDiscount", v)} options={DIGITS} placeholder="0" hint={`Contoh: ${sample(5000.5, s.decimalDiscount)}`} />
              </div>
            </KColumns>
          )}
        </div>
        {tab !== "desimal" && <KInfoBox title="Keterangan" items={["Opsi bertanda (*) tersimpan di server sebagai preferensi, tetapi belum semuanya dipakai otomatis oleh proses transaksi."]} />}
        {tab === "desimal" && <KInfoBox title="Keterangan" items={["Digit desimal mengatur jumlah angka di belakang koma pada tampilan harga, jumlah, pajak dan potongan di semua transaksi."]} />}
        <KSaveBar onSave={save} saving={saving} />
      </Card>
    </PageWrapper>
  );
}
