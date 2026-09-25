"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { KCheckbox, KCode, KColumns, KInfoBox, KNumber, KRow, KSaveBar, KSelect } from "@/components/kform";
import { PartnerFields, emptyPartner, type PartnerCommon } from "./PartnerFields";
import { api } from "@/lib/api-client";
import { createWithAutoCode, isEmail } from "@/lib/auto-code";
import { usePageTitle } from "@/lib/page-title";

const LIST = "/master/customers";

// Partner fields the Customer model can store (see api Customer: City, TaxID, ...).
const CUSTOMER_FIELDS: (keyof PartnerCommon)[] = ["address", "city", "phone", "email", "npwp", "notes"];

interface CustomerState extends PartnerCommon {
  code: string;
  creditLimit: string;
  dueDays: string;
  groupId: string;
  regionId: string;
  subRegionId: string;
  active: boolean;
}

const empty: CustomerState = {
  ...emptyPartner, code: "", creditLimit: "0", dueDays: "0", groupId: "", regionId: "", subRegionId: "", active: true,
};

interface CustomerRow {
  ID: number; Code: string; Name: string; Phone?: string | null; Email?: string | null; Address?: string | null;
  Notes?: string | null; CustomerGroupID?: number; IsActive?: boolean;
  RegionID?: number | null; SubRegionID?: number | null; City?: string | null; TaxID?: string | null;
  CreditLimit?: string | number | null; DueDays?: number | null;
}
interface GroupOpt { ID: number; Code: string; Name: string; DiscountPercent?: string | number; IsActive?: boolean }
interface RegionOpt { ID: number; Code: string; Name: string; RegionID?: number }

const arr = <T,>(d: unknown): T[] => (Array.isArray(d) ? (d as T[]) : []);

export function CustomerForm({ id, copyFrom }: { id?: number; copyFrom?: number }) {
  const router = useRouter();
  const isNew = !id;
  usePageTitle(isNew ? "Pelanggan Baru" : "Edit Pelanggan");
  const [f, setF] = useState<CustomerState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerCommon, string>>>({});
  const [groupError, setGroupError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id || copyFrom));
  const [groups, setGroups] = useState<GroupOpt[]>([]);
  const [regions, setRegions] = useState<RegionOpt[]>([]);
  const [subRegions, setSubRegions] = useState<RegionOpt[]>([]);
  const patch = (p: Partial<CustomerState>) => setF((s) => ({ ...s, ...p }));

  const loadGroups = useCallback(() => {
    api.get<GroupOpt[]>("customer-group", { $take: 100, $orderBy: { SortOrder: "asc" } }, { skipCache: true })
      .then((r) => setGroups(arr<GroupOpt>(r.data).filter((g) => g.IsActive !== false)))
      .catch(() => toast.error("Gagal memuat grup pelanggan"));
  }, []);

  const loadRegions = useCallback(() => {
    api.get<RegionOpt[]>("region", { $take: 100, $orderBy: { Name: "asc" }, $where: { IsActive: true } }, { skipCache: true })
      .then((r) => setRegions(arr<RegionOpt>(r.data)))
      .catch(() => toast.error("Gagal memuat wilayah"));
  }, []);

  useEffect(() => { loadGroups(); loadRegions(); }, [loadGroups, loadRegions]);

  // Sub Wilayah depends on the chosen Wilayah.
  useEffect(() => {
    if (!f.regionId) { setSubRegions([]); return; }
    let alive = true;
    api.get<RegionOpt[]>("sub-region", { $take: 100, $orderBy: { Name: "asc" }, $where: { RegionID: Number(f.regionId), IsActive: true } }, { skipCache: true })
      .then((r) => alive && setSubRegions(arr<RegionOpt>(r.data)))
      .catch(() => alive && toast.error("Gagal memuat sub wilayah"));
    return () => { alive = false; };
  }, [f.regionId]);

  // Default group for a new customer: the first (lowest SortOrder) active group.
  useEffect(() => {
    if (!f.groupId && groups.length && !(id || copyFrom)) patch({ groupId: String(groups[0].ID) });
  }, [groups, f.groupId, id, copyFrom]);

  useEffect(() => {
    const src = id ?? copyFrom;
    if (!src) return;
    let alive = true;
    api.get<CustomerRow>(`customer/${src}`, undefined, { skipCache: true })
      .then((res) => {
        const r = res.data;
        if (!alive || !r) return;
        setF({
          ...empty,
          code: id ? r.Code : "",
          name: r.Name ?? "", phone: r.Phone ?? "", email: r.Email ?? "", address: r.Address ?? "", notes: r.Notes ?? "",
          city: r.City ?? "", npwp: r.TaxID ?? "",
          creditLimit: String(Number(r.CreditLimit ?? 0)), dueDays: String(r.DueDays ?? 0),
          groupId: r.CustomerGroupID ? String(r.CustomerGroupID) : "",
          regionId: r.RegionID ? String(r.RegionID) : "", subRegionId: r.SubRegionID ? String(r.SubRegionID) : "",
          active: r.IsActive ?? true,
        });
      })
      .catch(() => toast.error("Gagal memuat data pelanggan"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, copyFrom]);

  const groupOptions = useMemo(
    () => groups.map((g) => ({
      value: String(g.ID),
      label: `${g.Name}${Number(g.DiscountPercent ?? 0) > 0 ? ` (diskon ${Number(g.DiscountPercent)}%)` : ""}`,
    })),
    [groups],
  );

  const save = async () => {
    const errs: typeof errors = {};
    if (!f.name.trim()) errs.name = "Nama pelanggan harus diisi";
    if (f.email && !isEmail(f.email)) errs.email = "Format e-mail tidak valid";
    setErrors(errs);
    setGroupError(f.groupId ? "" : "Grup pelanggan harus dipilih");
    if (Object.keys(errs).length || !f.groupId) return;
    setSaving(true);
    try {
      const orNull = (v: string) => v.trim() || (isNew ? undefined : null);
      // Every field shown on this form is sent (PascalCase, validated by CreateCustomerDto/UpdateCustomerDto).
      const payload = {
        Name: f.name.trim(),
        Phone: orNull(f.phone),
        Email: orNull(f.email),
        Address: orNull(f.address),
        Notes: orNull(f.notes),
        City: orNull(f.city),
        TaxID: orNull(f.npwp),
        CustomerGroupID: Number(f.groupId),
        RegionID: f.regionId ? Number(f.regionId) : (isNew ? undefined : null),
        SubRegionID: f.subRegionId ? Number(f.subRegionId) : (isNew ? undefined : null),
        CreditLimit: Math.max(0, Number(f.creditLimit) || 0),
        DueDays: Math.max(0, Math.trunc(Number(f.dueDays) || 0)),
        IsActive: f.active,
      };
      if (isNew) await createWithAutoCode("customer", "CUST", "Code", payload);
      else await api.patch("customer", id!, { ...payload, Code: f.code.trim() || undefined });
      toast.success("Data pelanggan berhasil disimpan");
      router.push(LIST);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan pelanggan");
    } finally {
      setSaving(false);
    }
  };

  const iconBtn = "flex h-10 w-12 shrink-0 items-center justify-center rounded border border-[#cfd4da] bg-white text-[#3a4654] hover:bg-[#f3f4f6]";

  return (
    <PageWrapper>
      <Card className="p-4">
        {loading ? <p className="p-6 text-center text-sm text-muted">Memuat...</p> : (
          <>
            <KColumns>
              <div>
                <KCode value={f.code} isNew={isNew} onChange={(v) => patch({ code: v })} />
                <PartnerFields value={f} onChange={patch} nameLabel="Nama" errors={errors} fields={CUSTOMER_FIELDS} />
              </div>
              <div>
                <KNumber
                  label="Limit Jumlah Piutang" value={f.creditLimit} onChange={(v) => patch({ creditLimit: v })} min={0}
                  hint="0 = Tanpa Limit"
                />
                <KNumber
                  label="Jatuh Tempo (hari)" value={f.dueDays} onChange={(v) => patch({ dueDays: v })} min={0}
                  hint="0 = Mengacu Pada Pengaturan"
                />
                <KSelect
                  label="Grup Pelanggan" value={f.groupId} onChange={(v) => { patch({ groupId: v }); setGroupError(""); }}
                  placeholder="Pilih grup..." options={groupOptions}
                  hint={groupError ? <span className="text-danger">{groupError}</span> : "Diskon grup otomatis dipakai di kasir (POS)."}
                  action={
                    <>
                      <button
                        type="button" title="Tambah grup pelanggan (tab baru)"
                        onClick={() => window.open("/master/customer-groups", "_blank", "noopener")}
                        className={iconBtn}
                      >
                        <Plus className="size-4" />
                      </button>
                      <button type="button" title="Muat ulang daftar grup" onClick={loadGroups} className={iconBtn}>
                        <RefreshCw className="size-4" />
                      </button>
                    </>
                  }
                />
                <KRow>
                  <KSelect
                    label="Wilayah" value={f.regionId} onChange={(v) => patch({ regionId: v, subRegionId: "" })}
                    placeholder={regions.length ? "Pilih wilayah..." : "Belum ada data wilayah"}
                    options={regions.map((r) => ({ value: String(r.ID), label: r.Name }))}
                  />
                  <KSelect
                    label="Sub Wilayah" value={f.subRegionId} onChange={(v) => patch({ subRegionId: v })}
                    placeholder="Pilih sub wilayah..."
                    options={subRegions.map((r) => ({ value: String(r.ID), label: r.Name }))} disabled={!f.regionId}
                  />
                </KRow>
                {regions.length === 0 && (
                  <KInfoBox variant="info">
                    Data wilayah dikelola di menu Master &gt; Wilayah dan Sub Wilayah.
                  </KInfoBox>
                )}
                <KCheckbox label="Status" caption="Aktif" checked={f.active} onChange={(v) => patch({ active: v })} />
              </div>
            </KColumns>
            <KSaveBar onSave={save} saving={saving} />
          </>
        )}
      </Card>
    </PageWrapper>
  );
}
