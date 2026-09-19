"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { FileSpreadsheet, Palette, Plus, Printer, Search, Trash2, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { EllipsisLoader } from "@/components/ui/Loader";
import { LookupDialog } from "@/components/report/LookupDialog";
import { buildDefaultTemplate, encodeParams, formatCell } from "@/lib/report/template";
import type {
  ReportCatalogItem,
  ReportColumn,
  ReportDataResponse,
  ReportParamDef,
  ReportTemplateDef,
  ReportTemplateRecord,
} from "@/lib/report/types";

type ParamValue = string | boolean;
type TemplateId = "default" | number;

const inputCls =
  "h-9 w-full rounded border border-default bg-elevated px-3 text-sm text-highlighted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

function today() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function unwrapRows(d: unknown): Record<string, unknown>[] {
  if (Array.isArray(d)) return d as Record<string, unknown>[];
  const inner = (d as { data?: unknown })?.data;
  return Array.isArray(inner) ? (inner as Record<string, unknown>[]) : [];
}

// ─── Select whose options may be loaded from an API source ───────────
function ParamSelect({
  param, value, onChange,
}: { param: ReportParamDef; value: string; onChange: (v: string) => void }) {
  const [opts, setOpts] = useState(param.options ?? []);
  const src = param.source;

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    api
      .get<unknown>(src.endpoint, { $take: 500 } as never)
      .then((res) => {
        if (cancelled) return;
        setOpts(
          unwrapRows(res.data).map((r) => ({
            value: String(r[src.valueField] ?? ""),
            label: String(r[src.labelField] ?? ""),
          }))
        );
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [src]);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="">Semua</option>
      {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export default function ReportRunPage() {
  const routeParams = useParams<{ key: string }>();
  const key = decodeURIComponent(String(routeParams.key));

  const [item, setItem] = useState<ReportCatalogItem | null>(null);
  const [templates, setTemplates] = useState<ReportTemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [values, setValues] = useState<Record<string, ParamValue>>({});
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [range, setRange] = useState(false);
  const [variant, setVariant] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>("default");

  const [lookupFor, setLookupFor] = useState<ReportParamDef | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadTemplates = useCallback(async (): Promise<ReportTemplateRecord[]> => {
    const res = await api.get<ReportTemplateRecord[]>(`report-engine/templates/${encodeURIComponent(key)}`, undefined, { skipCache: true });
    const list = Array.isArray(res.data) ? res.data : [];
    setTemplates(list);
    return list;
  }, [key]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const cat = await api.get<ReportCatalogItem[]>("report-engine/catalog", undefined, { skipCache: true });
        const found = (Array.isArray(cat.data) ? cat.data : []).find((c) => c.key === key);
        if (!found) throw new Error("Laporan tidak ditemukan");
        const list = await loadTemplates().catch(() => [] as ReportTemplateRecord[]);
        if (cancelled) return;

        const init: Record<string, ParamValue> = {};
        for (const p of found.params) {
          if (p.defaultValue !== undefined) init[p.key] = p.defaultValue;
          else if (p.type === "date" && /sampai/i.test(`${p.key} ${p.label}`)) init[p.key] = today();
          else if (p.type === "checkbox") init[p.key] = false;
          else init[p.key] = "";
        }
        setItem(found);
        setValues(init);
        setVariant(found.variants?.[0]?.key ?? found.key);
        const def = list.find((t) => t.IsDefault);
        setTemplateId(def ? def.ID : "default");
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Gagal memuat laporan");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [key, loadTemplates]);

  const hasRange = !!item?.params.some((p) => p.rangeWith);
  const visibleParams = useMemo(
    () => (item?.params ?? []).filter((p) => !p.rangeWith || range),
    [item, range]
  );

  const setValue = (k: string, v: ParamValue) => setValues((s) => ({ ...s, [k]: v }));

  const effectiveParams = (): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const p of visibleParams) {
      const v = values[p.key];
      if (v === "" || v === undefined || v === false) continue;
      out[p.key] = v;
    }
    return out;
  };

  const variants = item ? item.variants ?? [{ key: item.key, title: item.title }] : [];

  const currentDef = (): ReportTemplateDef | null => {
    if (!item) return null;
    if (templateId === "default") return buildDefaultTemplate(item.fields);
    return templates.find((t) => t.ID === templateId)?.Definition ?? buildDefaultTemplate(item.fields);
  };

  const openTab = (path: string, q: Record<string, string>) => {
    const qs = new URLSearchParams(q).toString();
    window.open(`${path}?${qs}`, "_blank");
  };

  const baseQuery = () => ({
    key,
    variant,
    template: String(templateId),
    p: encodeParams(effectiveParams()),
  });

  const handlePrint = () => { setActionError(""); openTab("/report-view", baseQuery()); };
  const handleDesign = () => { setActionError(""); openTab("/report-design", baseQuery()); };

  const handleCreate = async () => {
    if (!item || !newName.trim()) return;
    setCreating(true);
    setActionError("");
    try {
      const def = currentDef();
      const res = await api.post<ReportTemplateRecord>("report-engine/templates", {
        ReportKey: key,
        Name: newName.trim(),
        Definition: def,
      });
      const list = await loadTemplates();
      const id = res.data?.ID ?? list.find((t) => t.Name === newName.trim())?.ID;
      if (id !== undefined) setTemplateId(id);
      setShowNew(false);
      setNewName("");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Gagal membuat template");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (templateId === "default") return;
    setDeleting(true);
    setActionError("");
    try {
      await api.delete("report-engine/templates", templateId);
      await loadTemplates();
      setTemplateId("default");
      setShowDelete(false);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Gagal menghapus template");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    if (!item) return;
    setExporting(true);
    setActionError("");
    try {
      const res = await api.post<ReportDataResponse>(`report-engine/data/${encodeURIComponent(key)}`, {
        params: effectiveParams(),
        variant,
      });
      if (!res.data) throw new Error("Tidak ada data");
      const rows = res.data.rows ?? [];
      const def = currentDef();
      const cols = (def?.table.columns ?? []).length
        ? def!.table.columns.map((c) => ({ field: c.field, label: c.label, format: c.format, decimals: c.decimals }))
        : item.fields.map((f) => ({ field: f.key, label: f.label, format: (f.type === "string" ? "text" : f.type) as ReportColumn["format"], decimals: undefined as number | undefined }));

      const lines = [cols.map((c) => csvCell(c.label)).join(",")];
      for (const r of rows) {
        lines.push(
          cols
            .map((c) => {
              const v = r[c.field];
              if (c.format === "date" || c.format === "datetime") return csvCell(formatCell(v, c));
              return csvCell(v);
            })
            .join(",")
        );
      }
      const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.title.replace(/[^\w\- ]+/g, "").trim() || key}-${today()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Gagal mengekspor");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16 text-primary"><EllipsisLoader /></div>;
  }
  if (error || !item) {
    return <p className="py-10 text-center text-sm text-danger">{error || "Laporan tidak ditemukan"}</p>;
  }

  const renderParam = (p: ReportParamDef) => {
    const v = values[p.key];
    switch (p.type) {
      case "date":
        return <input type="date" value={String(v ?? "")} onChange={(e) => setValue(p.key, e.target.value)} className={inputCls} />;
      case "text":
        return <input type="text" value={String(v ?? "")} onChange={(e) => setValue(p.key, e.target.value)} className={inputCls} />;
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={v === true}
            onChange={(e) => setValue(p.key, e.target.checked)}
            className="size-4 accent-primary"
          />
        );
      case "select":
        return <ParamSelect param={p} value={String(v ?? "")} onChange={(x) => setValue(p.key, x)} />;
      case "lookup": {
        const display = labels[p.key] ?? String(v ?? "");
        return (
          <div className="flex gap-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={display}
                onChange={(e) => {
                  setValue(p.key, e.target.value);
                  setLabels((s) => ({ ...s, [p.key]: e.target.value }));
                }}
                className={cn(inputCls, display && "pr-8")}
              />
              {display && (
                <button
                  type="button"
                  title="Hapus"
                  onClick={() => {
                    setValue(p.key, "");
                    setLabels((s) => ({ ...s, [p.key]: "" }));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-danger"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              title="Cari..."
              disabled={!p.source}
              onClick={() => setLookupFor(p)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-default bg-elevated text-toned hover:bg-bg disabled:opacity-40"
            >
              <Search className="size-4" />
            </button>
          </div>
        );
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="mb-4 text-xl font-semibold text-highlighted">{item.title}</h2>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Filters */}
        <div className="rounded-lg border border-default bg-elevated p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-highlighted">Tentukan Filter Laporan :</h3>
          <div className="space-y-3">
            {hasRange && (
              <label className="flex items-center gap-2 text-sm text-toned">
                <input type="checkbox" checked={range} onChange={(e) => setRange(e.target.checked)} className="size-4 accent-primary" />
                Ganti ke range tanggal :
              </label>
            )}
            {visibleParams.map((p) => (
              <div key={p.key} className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-3">
                <label className="text-right text-sm text-toned">{p.label} :</label>
                <div>{renderParam(p)}</div>
              </div>
            ))}
            <div className="pt-2 pl-[142px]">
              <Button variant="success" icon={FileSpreadsheet} loading={exporting} onClick={handleExport}>
                Export Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Report selection */}
        <div className="rounded-lg border border-default bg-elevated p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-highlighted">Pilih Laporan :</h3>
          <div className="flex gap-4">
            <div className="min-w-0 flex-1 space-y-4">
              <div className="max-h-40 overflow-y-auto rounded border border-default">
                {variants.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setVariant(v.key)}
                    className={cn(
                      "block w-full border-b border-default px-3 py-2 text-left text-sm last:border-0",
                      variant === v.key ? "bg-primary text-white" : "hover:bg-primary/5"
                    )}
                  >
                    {v.title}
                  </button>
                ))}
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase text-toned">Template Cetak</p>
                <div className="max-h-56 overflow-y-auto rounded border border-default">
                  <button
                    type="button"
                    onClick={() => setTemplateId("default")}
                    className={cn(
                      "block w-full border-b border-default px-3 py-2 text-left text-sm",
                      templateId === "default" ? "bg-primary/10 font-medium text-primary" : "hover:bg-primary/5"
                    )}
                  >
                    Default (bawaan)
                  </button>
                  {templates.map((t) => (
                    <button
                      key={t.ID}
                      type="button"
                      onClick={() => setTemplateId(t.ID)}
                      className={cn(
                        "block w-full border-b border-default px-3 py-2 text-left text-sm last:border-0",
                        templateId === t.ID ? "bg-primary/10 font-medium text-primary" : "hover:bg-primary/5"
                      )}
                    >
                      {t.Name}
                      {t.IsDefault && <span className="ml-2 text-xs text-muted">(utama)</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex w-28 shrink-0 flex-col gap-2">
              <Button variant="outline" icon={Printer} onClick={handlePrint}>Print</Button>
              <Button variant="outline" icon={Palette} onClick={handleDesign}>Disain</Button>
              <Button variant="success" icon={Plus} onClick={() => { setNewName(""); setShowNew(true); }}>Baru</Button>
              <Button variant="danger" icon={Trash2} disabled={templateId === "default"} onClick={() => setShowDelete(true)}>Hapus</Button>
            </div>
          </div>
        </div>
      </div>

      {actionError && <p className="mt-3 text-sm text-danger">{actionError}</p>}

      {lookupFor?.source && (
        <LookupDialog
          open
          onClose={() => setLookupFor(null)}
          title="Cari data..."
          source={lookupFor.source}
          onPick={(pick) => {
            setValue(lookupFor.key, pick.value);
            setLabels((s) => ({ ...s, [lookupFor.key]: pick.label }));
          }}
        />
      )}

      <Modal
        open={showNew}
        onClose={() => !creating && setShowNew(false)}
        title="Template Baru"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNew(false)} disabled={creating}>Batal</Button>
            <Button loading={creating} disabled={!newName.trim()} onClick={handleCreate}>Simpan</Button>
          </>
        }
      >
        <label className="block text-[13px] font-medium text-gray-700">
          Nama template
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            className={cn(inputCls, "mt-1")}
          />
        </label>
        <p className="mt-2 text-xs text-muted">Disalin dari template yang sedang dipilih.</p>
      </Modal>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Template"
        message="Template yang dipilih akan dihapus permanen. Lanjutkan?"
        confirmText="Hapus"
      />
    </div>
  );
}
