"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageWrapper } from "@/components/layout/PageWrapper";
import {
  KCard, KCheckbox, KCode, KColumns, KField, KInfoBox, KInput, KNumber, KRadioGroup, KSaveBar, KSelect,
  KTabs, KTextarea, type KOption,
} from "@/components/kform";
import { api } from "@/lib/api-client";
import { createWithAutoCode } from "@/lib/auto-code";
import { usePageTitle } from "@/lib/page-title";
import type { EntityConfig, FieldDef, Values } from "./types";
import { LoadingState } from "@/components/ui/Loader";

function isEmpty(v: unknown): boolean {
  return v === undefined || v === null || String(v).trim() === "";
}

export function EntityForm({ config, id, copyFrom }: { config: EntityConfig; id?: string; copyFrom?: string }) {
  const router = useRouter();
  const isNew = !id;
  const hasCode = config.hasCode !== false;
  usePageTitle(config.formTitle ? config.formTitle(isNew) : `${isNew ? "Tambah" : "Edit"} ${config.singular}`);

  const [v, setV] = useState<Values>(config.defaults);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean((id || copyFrom) && config.endpoint));
  const [tab, setTab] = useState(config.sections[0].title);
  const [opts, setOpts] = useState<Record<string, KOption[]>>({});
  const [flash, setFlash] = useState(false);

  const set = (patch: Values) => setV((s) => ({ ...s, ...patch }));
  const fields = useMemo(() => config.sections.flatMap((s) => s.fields), [config]);

  // Load record (edit / copy).
  useEffect(() => {
    const src = id ?? copyFrom;
    if (!src || !config.endpoint) return;
    let alive = true;
    api.get<Record<string, unknown>>(`${config.endpoint}/${src}`, undefined, { skipCache: true })
      .then((res) => {
        if (!alive || !res.data) return;
        setV({ ...config.defaults, ...config.fromRow(res.data) });
        if (id) setCode(String(res.data.Code ?? ""));
      })
      .catch(() => toast.error(`Gagal memuat data ${config.singular.toLowerCase()}`))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, copyFrom, config]);

  // Load select options.
  useEffect(() => {
    let alive = true;
    for (const f of fields) {
      if (!f.optionsFrom) continue;
      const { endpoint, label } = f.optionsFrom;
      api.get<Record<string, unknown>[]>(endpoint, { $take: 200 }, { skipCache: true })
        .then((res) => {
          if (alive) setOpts((o) => ({ ...o, [f.key]: (res.data ?? []).map((r) => ({ value: String(r.ID), label: label(r) })) }));
        })
        .catch(() => undefined);
    }
    return () => { alive = false; };
  }, [fields]);

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    for (const f of fields) {
      if (f.required && isEmpty(v[f.key])) e[f.key] = `${f.label} wajib diisi`;
    }
    if (hasCode && (!isNew || config.codeRequired) && isEmpty(code)) e.__code = `${config.codeLabel ?? "Kode"} wajib diisi`;
    return { ...e, ...(config.validate?.(v) ?? {}) };
  };

  const handleSave = async () => {
    setFormError("");
    const e = validate();
    setErrors(e);
    const firstKey = Object.keys(e)[0];
    if (firstKey) {
      const sec = config.sections.find((s) => s.fields.some((f) => f.key === firstKey));
      if (sec) setTab(sec.title);
      setFormError("Periksa kembali isian yang ditandai.");
      return;
    }
    if (!config.endpoint) {
      setFlash(true);
      toast.info("Penyimpanan belum tersedia di server");
      return;
    }
    setSaving(true);
    try {
      const payload = config.toPayload(v);
      if (isNew) {
        if (hasCode && config.codeEditable && code.trim()) await api.post(config.endpoint, { ...payload, [config.codeKey ?? "code"]: code.trim() });
        else if (hasCode) await createWithAutoCode(config.endpoint, config.codePrefix, config.codeKey ?? "code", payload);
        else await api.post(config.endpoint, payload);
      } else {
        await api.patch(config.endpoint, id!, { ...payload, ...(hasCode ? { [config.codeKey ?? "code"]: code } : {}) });
      }
      toast.success(`${config.singular} tersimpan`);
      router.push(config.basePath);
    } catch (err) {
      setFormError(err instanceof Error && err.message ? err.message : "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const localFields = fields.filter((f) => f.local);

  const renderField = (f: FieldDef) => {
    const err = errors[f.key];
    const label = f.required ? `${f.label} *` : f.label;
    const common = { label, hint: f.hint };
    let control;
    switch (f.type ?? "text") {
      case "number":
        control = <KNumber {...common} value={v[f.key] ?? ""} onChange={(x) => set({ [f.key]: x })} placeholder={f.placeholder} />;
        break;
      case "textarea":
        control = <KTextarea {...common} rows={f.rows ?? 3} value={v[f.key] ?? ""} onChange={(x) => set({ [f.key]: x.target.value })} placeholder={f.placeholder} />;
        break;
      case "select":
        control = (
          <KSelect
            {...common}
            value={String(v[f.key] ?? "")}
            onChange={(x) => set({ [f.key]: x })}
            options={f.options ?? opts[f.key] ?? []}
            placeholder={f.placeholder ?? "Pilih..."}
          />
        );
        break;
      case "radio":
        control = <KRadioGroup {...common} inline={f.inline} value={String(v[f.key] ?? "")} onChange={(x) => set({ [f.key]: x })} options={(f.options ?? []).map((o) => ({ value: String(o.value), label: o.label }))} />;
        break;
      case "checkbox":
        control = <KCheckbox {...common} checked={Boolean(v[f.key])} onChange={(x) => set({ [f.key]: x })} caption={f.caption} />;
        break;
      case "date":
        control = <KInput {...common} type="date" value={v[f.key] ?? ""} onChange={(x) => set({ [f.key]: x.target.value })} />;
        break;
      case "custom":
        control = <KField label={label} hint={f.hint}>{f.render?.(v, set)}</KField>;
        break;
      default:
        control = <KInput {...common} value={v[f.key] ?? ""} onChange={(x) => set({ [f.key]: x.target.value })} placeholder={f.placeholder} />;
    }
    return (
      <div key={f.key} className={f.full ? "lg:col-span-2" : undefined}>
        {control}
        {err && <p className="-mt-2 mb-2 text-[13px] text-danger">{err}</p>}
      </div>
    );
  };

  const section = config.sections.find((s) => s.title === tab) ?? config.sections[0];
  const multi = config.sections.length > 1;

  if (loading) return <PageWrapper><KCard><LoadingState /></KCard></PageWrapper>;

  return (
    <PageWrapper>
      {!config.endpoint && (
        <KInfoBox variant="warning" title="Penyimpanan belum tersedia di server">
          <p className={flash ? "font-semibold" : undefined}>
            Modul {config.plural.toLowerCase()} belum memiliki API di server, sehingga tombol Simpan belum menyimpan data.
            {config.backendGap?.length ? ` Belum ada di server: ${config.backendGap.join(", ")}.` : ""}
          </p>
        </KInfoBox>
      )}
      {config.endpoint && localFields.length > 0 && (
        <KInfoBox variant="info" title="Keterangan">
          <p>Isian berikut belum disimpan di server (API belum mendukung): {localFields.map((f) => f.label).join(", ")}.</p>
        </KInfoBox>
      )}
      {config.intro}
      {formError && (
        <div className="rounded border border-danger/40 bg-danger/10 px-4 py-3 text-[14px] text-danger" role="alert">{formError}</div>
      )}
      {multi && <KTabs tabs={config.sections.map((s) => ({ key: s.title, label: s.title }))} active={tab} onChange={setTab} />}
      <KCard>
        {section.note}
        <KColumns>
          {hasCode && section === config.sections[0] && (
            <div>
              {config.codeEditable ? (
                <KInput
                  label={config.codeRequired ? `${config.codeLabel ?? "Kode"} *` : config.codeLabel ?? "Kode"}
                  value={code} maxLength={50}
                  placeholder={isNew && !config.codeRequired ? "Auto" : undefined}
                  onChange={(e) => setCode(e.target.value)}
                />
              ) : (
                <KCode label={config.codeLabel ?? "Kode"} value={code} isNew={isNew} onChange={isNew ? undefined : setCode} />
              )}
              {errors.__code && <p className="-mt-2 mb-2 text-[13px] text-danger">{errors.__code}</p>}
            </div>
          )}
          {section.fields.map(renderField)}
        </KColumns>
      </KCard>
      <KSaveBar
        onSave={handleSave}
        saving={saving}
        extra={
          <button type="button" onClick={() => router.push(config.basePath)} className="h-10 rounded border border-[#cfd4da] bg-white px-5 text-[15px] hover:bg-[#f3f4f6]">
            Kembali
          </button>
        }
      />
    </PageWrapper>
  );
}
