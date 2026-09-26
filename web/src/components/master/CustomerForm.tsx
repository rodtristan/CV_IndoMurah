"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KCode, KColumns, KInput, KNumber, KSaveBar, KSelect, KTabs, KTextarea } from "@/components/kform";
import { PartnerFields, emptyPartner, errText, type PartnerCommon } from "./PartnerFields";
import { partnerFromRow, partnerPayload, TAX_MODE_OPTIONS, taxSourceOptions } from "./partner-map";
import { api } from "@/lib/api-client";
import { createWithAutoCode, isEmail } from "@/lib/auto-code";
import { usePageTitle } from "@/lib/page-title";
import { LoadingState } from "@/components/ui/Loader";

const LIST = "/master/customers";

// Data Umum kolom kiri Ketoko (NPWP ada di tab Data Pendukung Pajak).
const LEFT_FIELDS: (keyof PartnerCommon)[] = [
  "address", "city", "province", "country", "postalCode", "phone", "fax", "contact", "email", "accountNo", "accountName", "bank", "notes",
];

const DISCOUNT_TYPES = [
  { value: "ITEM_LIST", label: "Pot. Daftar Item" },
  { value: "GROUP_PER_ITEM", label: "Pot. Grup Per Item" },
  { value: "GROUP_PER_INVOICE", label: "Pot. Grup Per Faktur" },
];

interface CustomerState extends PartnerCommon {
  code: string;
  creditLimit: string;
  creditDayLimit: string;
  dueDays: string;
  maxCredit: string;
  taxMode: string;
  taxSource: string;
  taxRate: string;
  groupId: string;
  discountType: string;
  regionId: string;
  subRegionId: string;
  salesId: string;
  taxNik: string;
  taxName: string;
  taxAddress: string;
}

const empty: CustomerState = {
  ...emptyPartner, code: "", creditLimit: "0", creditDayLimit: "0", dueDays: "0", maxCredit: "0",
  taxMode: "DEFAULT", taxSource: "DEFAULT", taxRate: "0", groupId: "", discountType: "ITEM_LIST",
  regionId: "", subRegionId: "", salesId: "", taxNik: "", taxName: "", taxAddress: "",
};

type Opt = { ID: number; Code?: string; Name: string; IsActive?: boolean };
const arr = <T,>(d: unknown): T[] => (Array.isArray(d) ? (d as T[]) : []);
const opts = (rows: Opt[]) => rows.map((r) => ({ value: String(r.ID), label: r.Name }));

export function CustomerForm({ id, copyFrom }: { id?: number; copyFrom?: number }) {
  const router = useRouter();
  const isNew = !id;
  const [f, setF] = useState<CustomerState>(empty);
  usePageTitle(isNew ? "Pelanggan Baru" : `Pelanggan Edit : ${f.code}`);
  const [tab, setTab] = useState("umum");
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerCommon, string>>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id || copyFrom));
  const [groups, setGroups] = useState<Opt[]>([]);
  const [regions, setRegions] = useState<Opt[]>([]);
  const [subRegions, setSubRegions] = useState<Opt[]>([]);
  const [salesList, setSalesList] = useState<Opt[]>([]);
  const patch = (p: Partial<CustomerState>) => setF((s) => ({ ...s, ...p }));

  const loadGroups = useCallback(() => {
    api.get<Opt[]>("customer-group", { $take: 100, $orderBy: { Name: "asc" } }, { skipCache: true })
      .then((r) => setGroups(arr<Opt>(r.data).filter((g) => g.IsActive !== false)))
      .catch(() => toast.error("Gagal memuat grup pelanggan"));
  }, []);

  useEffect(() => {
    loadGroups();
    api.get<Opt[]>("region", { $take: 100, $orderBy: { Name: "asc" } }, { skipCache: true }).then((r) => setRegions(arr<Opt>(r.data))).catch(() => undefined);
    api.get<Opt[]>("sales-person", { $take: 100, $orderBy: { Name: "asc" } }, { skipCache: true }).then((r) => setSalesList(arr<Opt>(r.data))).catch(() => undefined);
  }, [loadGroups]);

  useEffect(() => {
    if (!f.regionId) { setSubRegions([]); return; }
    let alive = true;
    api.get<Opt[]>("sub-region", { $take: 100, $orderBy: { Name: "asc" }, $where: { RegionID: Number(f.regionId) } }, { skipCache: true })
      .then((r) => alive && setSubRegions(arr<Opt>(r.data)))
      .catch(() => undefined);
    return () => { alive = false; };
  }, [f.regionId]);

  useEffect(() => {
    const src = id ?? copyFrom;
    if (!src) return;
    let alive = true;
    api.get<Record<string, any>>(`customer/${src}`, undefined, { skipCache: true }) // eslint-disable-line @typescript-eslint/no-explicit-any
      .then((res) => {
        const r = res.data;
        if (!alive || !r) return;
        const n = (v: unknown) => String(Number(v ?? 0));
        setF({
          ...empty,
          ...partnerFromRow(r),
          code: id ? String(r.Code ?? "") : "",
          creditLimit: n(r.CreditLimit), creditDayLimit: n(r.CreditDayLimit), dueDays: n(r.DueDays), maxCredit: n(r.MaxCreditAmount),
          taxMode: r.TaxMode ?? "DEFAULT", taxSource: r.TaxValueSource ?? "DEFAULT", taxRate: n(r.TaxRate),
          groupId: r.CustomerGroupID ? String(r.CustomerGroupID) : "", discountType: r.DiscountType ?? "ITEM_LIST",
          regionId: r.RegionID ? String(r.RegionID) : "", subRegionId: r.SubRegionID ? String(r.SubRegionID) : "",
          salesId: r.SalesPersonID ? String(r.SalesPersonID) : "",
          taxNik: r.TaxNIK ?? "", taxName: r.TaxName ?? "", taxAddress: r.TaxAddress ?? "",
        });
      })
      .catch(() => toast.error("Gagal memuat data pelanggan"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, copyFrom]);

  // Grup default untuk pelanggan baru: grup pertama.
  useEffect(() => {
    if (!f.groupId && groups.length && !(id || copyFrom)) patch({ groupId: String(groups[0].ID) });
  }, [groups, f.groupId, id, copyFrom]);

  const save = async () => {
    const errs: typeof errors = {};
    if (!f.name.trim()) errs.name = "Nama pelanggan harus diisi";
    if (f.email && !isEmail(f.email)) errs.email = "Format e-mail tidak valid";
    setErrors(errs);
    if (Object.keys(errs).length) { setTab("umum"); return; }
    if (!f.groupId) { toast.error("Grup pelanggan harus dipilih"); setTab("umum"); return; }
    setSaving(true);
    try {
      const num = (v: string) => Math.max(0, Number(v) || 0);
      const int = (v: string) => Math.max(0, Math.trunc(Number(v) || 0));
      const opt = (v: string) => (v ? Number(v) : isNew ? undefined : null);
      const txt = (v: string) => (v.trim() ? v.trim() : isNew ? undefined : null);
      const payload = {
        ...partnerPayload(f, isNew),
        CreditLimit: num(f.creditLimit), CreditDayLimit: int(f.creditDayLimit), DueDays: int(f.dueDays), MaxCreditAmount: num(f.maxCredit),
        TaxMode: f.taxMode, TaxValueSource: f.taxSource, TaxRate: f.taxSource === "PARTNER" ? num(f.taxRate) : 0,
        CustomerGroupID: Number(f.groupId), DiscountType: f.discountType,
        RegionID: opt(f.regionId), SubRegionID: opt(f.subRegionId), SalesPersonID: opt(f.salesId),
        TaxNIK: txt(f.taxNik), TaxName: txt(f.taxName), TaxAddress: txt(f.taxAddress),
      };
      if (isNew) await createWithAutoCode("customer", "PL", "Code", payload);
      else await api.patch("customer", id!, { ...payload, Code: f.code.trim() || undefined });
      toast.success("Data pelanggan berhasil disimpan");
      router.push(LIST);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan pelanggan");
    } finally {
      setSaving(false);
    }
  };

  const hintCls = "text-[13px] text-[#3a4654]";

  return (
    <PageWrapper>
      <Card className="p-4">
        {loading ? <LoadingState /> : (
          <>
            <KTabs
              tabs={[{ key: "umum", label: "Data Umum" }, { key: "pajak", label: "Data Pendukung Pajak" }]}
              active={tab}
              onChange={setTab}
            />
            <div className="border border-t-0 border-[#c9d3df] p-4">
              {tab === "umum" ? (
                <KColumns>
                  <div>
                    <KCode value={f.code} isNew={isNew} onChange={(v) => patch({ code: v })} />
                    <PartnerFields value={f} onChange={patch} nameLabel="Nama" errors={errors} fields={LEFT_FIELDS} />
                  </div>
                  <div className="max-w-[460px]">
                    <KNumber label="Limit Jumlah Piutang" value={f.creditLimit} onChange={(v) => patch({ creditLimit: v })} min={0} step="0.01" />
                    <KNumber label="Limit Hari Piutang" value={f.creditDayLimit} onChange={(v) => patch({ creditDayLimit: v })} min={0} fieldClassName="max-w-[260px]" hint={<span className={hintCls}>0 = Tanpa Limit</span>} />
                    <KNumber label="Jatuh Tempo" value={f.dueDays} onChange={(v) => patch({ dueDays: v })} min={0} fieldClassName="max-w-[260px]" hint={<span className={hintCls}>0 = Mengacu Pada Pengaturan</span>} />
                    <KNumber label="Max Jumlah Kredit" value={f.maxCredit} onChange={(v) => patch({ maxCredit: v })} min={0} step="0.01" />
                    <KSelect
                      label="Menggunakan Pajak" value={f.taxMode} options={TAX_MODE_OPTIONS} placeholder="Default"
                      onChange={(v) => patch({ taxMode: v || "DEFAULT", taxSource: v !== "EXCLUDE" && f.taxSource === "ITEM" ? "DEFAULT" : f.taxSource })}
                      hint={<span className={hintCls}>Default = Mengacu Pada Pengaturan</span>}
                    />
                    <KSelect
                      label="Nilai Pajak diset Dari" value={f.taxSource} options={taxSourceOptions("Data Pelanggan", f.taxMode)} placeholder="Default"
                      onChange={(v) => patch({ taxSource: v || "DEFAULT" })}
                    />
                    <KNumber label="Nilai Pajak" value={f.taxRate} onChange={(v) => patch({ taxRate: v })} min={0} max={100} step="0.01" disabled={f.taxSource !== "PARTNER"} fieldClassName="max-w-[260px]" />
                    <KSelect
                      label="Grup Pelanggan" value={f.groupId} onChange={(v) => patch({ groupId: v })} options={opts(groups)}
                      action={
                        <button
                          type="button" title="Tambah grup pelanggan (tab baru), lalu klik lagi untuk memuat ulang"
                          onClick={() => { window.open("/master/customer-groups/new", "_blank", "noopener"); setTimeout(loadGroups, 3000); }}
                          onFocus={loadGroups}
                          className="flex h-10 w-12 shrink-0 items-center justify-center rounded border border-[#cfd4da] bg-white hover:bg-[#f3f4f6]"
                        >
                          <Plus className="size-4" />
                        </button>
                      }
                    />
                    <KSelect label="Tipe Potongan" value={f.discountType} options={DISCOUNT_TYPES} placeholder="Pot. Daftar Item" onChange={(v) => patch({ discountType: v || "ITEM_LIST" })} />
                    <KSelect label="Wilayah" value={f.regionId} options={opts(regions)} onChange={(v) => patch({ regionId: v, subRegionId: "" })} />
                    <KSelect label="Sub Wilayah" value={f.subRegionId} options={opts(subRegions)} onChange={(v) => patch({ subRegionId: v })} disabled={!f.regionId} />
                    <KSelect label="Sales" value={f.salesId} options={opts(salesList)} onChange={(v) => patch({ salesId: v })} />
                  </div>
                </KColumns>
              ) : (
                <div className="max-w-[560px]">
                  <KInput label="NPWP" value={f.npwp} onChange={(e) => patch({ npwp: e.target.value })} maxLength={50} />
                  <KInput label="NIK" value={f.taxNik} onChange={(e) => patch({ taxNik: e.target.value })} maxLength={50} />
                  <KInput label="Nama NPWP" value={f.taxName} onChange={(e) => patch({ taxName: e.target.value })} maxLength={255} />
                  <KTextarea label="Alamat NPWP" rows={3} value={f.taxAddress} onChange={(e) => patch({ taxAddress: e.target.value })} maxLength={500} />
                </div>
              )}
            </div>
            {errors.name && tab === "pajak" && <p className="mt-2 text-sm">{errText(errors.name)}</p>}
            <KSaveBar onSave={save} saving={saving} />
          </>
        )}
      </Card>
    </PageWrapper>
  );
}

