"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import api from "@/lib/api-client";
import { EllipsisLoader } from "@/components/ui/Loader";
import { ReportPaper } from "../ReportPaper";
import type { ReportCatalogItem, ReportDataResponse, ReportInfo, ReportTemplateDef, ReportTemplateRecord } from "@/lib/report/types";
import { buildDefaultTemplate, decodeParams } from "@/lib/report/template";
import { useDesignerState } from "./useDesignerState";
import { Ribbon, type RibbonTab } from "./Ribbon";
import { DictionaryPanel } from "./DictionaryPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { ReportTree } from "./ReportTree";
import { DesignCanvas } from "./DesignCanvas";

type LeftTab = "Properties" | "Dictionary" | "Report Tree";

const SAMPLE_INFO: ReportInfo = {
  InfoReport: { NamaPerusahaan: "Nama Perusahaan", Alamat1: "Alamat baris 1", Alamat2: "Alamat baris 2", Telepon: "021-0000000", Fax: "", LogoUrl: "" },
  InfoFilter: { NamaLaporan: "Nama Laporan" },
  UserLogin: "user",
  Tanggal: new Date().toISOString(),
};

const errMsg = (e: unknown) => (e instanceof Error ? e.message : typeof e === "string" ? e : "Terjadi kesalahan");

export function Designer() {
  const sp = useSearchParams();
  const reportKey = sp.get("key") ?? "";
  const templateParam = sp.get("template") ?? "default";
  const paramsRaw = sp.get("p");
  const params = useMemo(() => decodeParams(paramsRaw), [paramsRaw]);

  const d = useDesignerState();
  const { def } = d;
  const [item, setItem] = useState<ReportCatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tplId, setTplId] = useState<number | null>(null);
  const [tplName, setTplName] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [tab, setTab] = useState<RibbonTab>("Home");
  const [leftTab, setLeftTab] = useState<LeftTab>("Dictionary");
  const [zoom, setZoom] = useState(1);
  const [data, setData] = useState<{ info: ReportInfo; rows: Record<string, unknown>[] } | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  const fields = useMemo(() => item?.fields ?? [], [item]);

  const [nameDialog, setNameDialog] = useState<{ value: string } | null>(null);
  const nameResolver = useRef<((v: string | null) => void) | null>(null);
  const askName = (initial: string) =>
    new Promise<string | null>((resolve) => {
      nameResolver.current = resolve;
      setNameDialog({ value: initial });
    });
  const closeNameDialog = (v: string | null) => {
    setNameDialog(null);
    nameResolver.current?.(v);
    nameResolver.current = null;
  };

  // ── load catalog + template ──
  useEffect(() => {
    if (!reportKey) {
      setLoadError("Parameter key laporan tidak ada.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const cat = await api.get<ReportCatalogItem[]>("report-engine/catalog", undefined, { skipCache: true });
        const it = (cat.data ?? []).find((x) => x.key === reportKey);
        if (!it) throw new Error(`Laporan "${reportKey}" tidak ditemukan di katalog.`);
        let definition: ReportTemplateDef | null = null;
        const idNum = Number(templateParam);
        if (Number.isFinite(idNum) && templateParam !== "" && !Number.isNaN(idNum)) {
          const r = await api.get<ReportTemplateRecord[]>(`report-engine/templates/${encodeURIComponent(reportKey)}`, undefined, { skipCache: true });
          const rec = (r.data ?? []).find((t) => t.ID === idNum);
          if (!rec) throw new Error(`Template #${idNum} tidak ditemukan.`);
          definition = typeof rec.Definition === "string" ? (JSON.parse(rec.Definition) as ReportTemplateDef) : rec.Definition;
          if (!cancelled) {
            setTplId(rec.ID);
            setTplName(rec.Name);
          }
        } else {
          definition = buildDefaultTemplate(it.fields);
        }
        if (cancelled) return;
        setItem(it);
        d.load(definition);
      } catch (e) {
        if (!cancelled) setLoadError(errMsg(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportKey, templateParam]);

  // ── data for dictionary samples + preview ──
  const fetchData = useCallback(async () => {
    if (!reportKey) return;
    setDataLoading(true);
    setDataError("");
    try {
      const r = await api.post<ReportDataResponse>(`report-engine/data/${encodeURIComponent(reportKey)}`, { params });
      if (!r.success || !r.data) throw new Error(r.message || "Gagal memuat data laporan");
      setData({ info: r.data.info, rows: (r.data.rows ?? []).slice(0, 200) });
    } catch (e) {
      setDataError(errMsg(e));
      setData({ info: SAMPLE_INFO, rows: [] });
    } finally {
      setDataLoading(false);
    }
  }, [reportKey, params]);

  useEffect(() => {
    if (item) void fetchData();
  }, [item, fetchData]);

  // ── save / default / close ──
  const flash = (kind: "ok" | "err", text: string) => {
    setNotice({ kind, text });
    if (kind === "ok") setTimeout(() => setNotice((n) => (n?.text === text ? null : n)), 2500);
  };

  const doSave = useCallback(
    async (asNew: boolean): Promise<number | null> => {
      if (!def) return null;
      let name = tplName;
      let id = asNew ? null : tplId;
      if (id === null) {
        const n = await askName(name || item?.title || "");
        if (!n || !n.trim()) return null;
        name = n.trim();
      }
      setBusy(true);
      setNotice(null);
      try {
        if (id !== null) {
          const r = await api.put(`report-engine/templates`, id, { Name: name, Definition: def });
          if (!r.success) throw new Error(r.message || "Gagal menyimpan");
        } else {
          const r = await api.post<ReportTemplateRecord>("report-engine/templates", { ReportKey: reportKey, Name: name, Definition: def });
          const newId = r.data?.ID;
          if (!r.success || newId == null) throw new Error(r.message || "Gagal menyimpan");
          id = newId;
          const url = new URL(window.location.href);
          url.searchParams.set("template", String(newId));
          window.history.replaceState(null, "", url.toString());
        }
        setTplId(id);
        setTplName(name);
        d.markSaved();
        flash("ok", "Template tersimpan");
        return id;
      } catch (e) {
        flash("err", errMsg(e));
        return null;
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [def, tplId, tplName, item, reportKey],
  );

  const doSetDefault = async () => {
    let id = tplId;
    if (id === null || d.dirty) id = await doSave(false);
    if (id === null) return;
    setBusy(true);
    try {
      const r = await api.put("report-engine/templates", id, { IsDefault: true });
      if (!r.success) throw new Error(r.message || "Gagal mengatur default");
      flash("ok", "Diatur sebagai template default");
    } catch (e) {
      flash("err", errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const doClose = () => {
    if (d.dirty && !window.confirm("Ada perubahan yang belum disimpan. Tutup tanpa menyimpan?")) return;
    window.onbeforeunload = null;
    window.close();
    setTimeout(() => {
      if (window.history.length > 1) window.history.back();
    }, 200);
  };

  // ── unsaved-changes guard ──
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (d.dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [d.dirty]);

  // ── keyboard shortcuts ──
  const saveRef = useRef(doSave);
  saveRef.current = doSave;
  const dRef = useRef(d);
  dRef.current = d;
  const tabRef = useRef(tab);
  tabRef.current = tab;
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && k === "s") {
        e.preventDefault();
        void saveRef.current(false);
        return;
      }
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (tabRef.current === "Preview") return;
      const x = dRef.current;
      if (ctrl && k === "z") { e.preventDefault(); e.shiftKey ? x.redo() : x.undo(); }
      else if (ctrl && k === "y") { e.preventDefault(); x.redo(); }
      else if (ctrl && k === "c") { x.copySelected(); }
      else if (ctrl && k === "x") { e.preventDefault(); x.cutSelected(); }
      else if (ctrl && k === "v") { e.preventDefault(); x.paste(); }
      else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); x.deleteSelected(); }
      else if (e.key.startsWith("Arrow") && x.sel.type === "el") {
        e.preventDefault();
        x.nudge(e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0, e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center gap-3 bg-gray-100 text-[#1e4d8f]">
        <EllipsisLoader className="text-[#1e4d8f]" />
        <span className="text-sm">Memuat desainer laporan</span>
      </div>
    );
  }
  if (loadError || !def) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-gray-100 text-sm text-red-700">
        <AlertCircle size={28} />
        <p>{loadError || "Template tidak dapat dimuat."}</p>
        <button type="button" onClick={() => window.close()} className="rounded border border-gray-300 bg-white px-3 py-1 text-gray-700">Tutup</button>
      </div>
    );
  }

  const isPreview = tab === "Preview";
  const sampleRow = data?.rows[0];

  return (
    <div className="dz-anc fixed inset-0 z-50 flex flex-col bg-gray-100 text-gray-900">
      <style>{`@media print { .dz-anc { position: static !important; overflow: visible !important; height: auto !important; display: block !important; padding: 0 !important; background: none !important; } }`}</style>
      <div className="flex shrink-0 items-center gap-3 bg-[#163a6b] px-3 py-1 text-xs text-white print:hidden">
        <span className="font-semibold">Desainer Laporan</span>
        <span className="text-white/70">{item?.title}{tplName ? ` - ${tplName}` : tplId === null ? " - (draf baru)" : ""}</span>
        <span className={`ml-2 rounded px-2 py-0.5 ${d.dirty ? "bg-amber-400 text-amber-950" : "bg-emerald-500/90 text-white"}`}>
          {busy ? "Menyimpan..." : d.dirty ? "Belum disimpan" : "Tersimpan"}
        </span>
        {notice && (
          <span className={`flex items-center gap-1 rounded px-2 py-0.5 ${notice.kind === "ok" ? "bg-white/15" : "bg-red-500 text-white"}`}>
            {notice.kind === "ok" ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            {notice.text}
          </span>
        )}
      </div>

      <Ribbon
        d={d}
        fields={fields}
        tab={tab}
        setTab={setTab}
        zoom={zoom}
        setZoom={setZoom}
        busy={busy}
        onSave={() => void doSave(false)}
        onSaveAs={() => void doSave(true)}
        onSetDefault={() => void doSetDefault()}
        onClose={doClose}
        onPrint={() => window.print()}
        onRefreshPreview={() => void fetchData()}
      />

      <div className="dz-anc flex min-h-0 flex-1">
        <aside className="flex w-72 shrink-0 flex-col border-r border-gray-300 bg-white print:hidden">
          <div className="border-b border-gray-200 bg-[#eaf0f9] px-2 py-1 text-xs font-semibold text-[#1e4d8f]">{leftTab}</div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {leftTab === "Dictionary" && <DictionaryPanel d={d} item={item} fields={fields} sampleRow={sampleRow} />}
            {leftTab === "Properties" && <PropertiesPanel d={d} fields={fields} />}
            {leftTab === "Report Tree" && <ReportTree d={d} />}
          </div>
          <div className="flex border-t border-gray-300 bg-[#eaf0f9]">
            {(["Properties", "Dictionary", "Report Tree"] as LeftTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setLeftTab(t)}
                className={`flex-1 px-1 py-1.5 text-[11px] font-medium ${leftTab === t ? "bg-white text-[#1e4d8f] shadow-[inset_0_2px_0_#1e4d8f]" : "text-gray-600 hover:bg-white/60"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </aside>

        {isPreview ? (
          <div className="dz-anc flex-1 overflow-auto bg-[#8d97a6] p-6">
            {dataError && (
              <div className="mx-auto mb-3 flex max-w-3xl items-center gap-2 rounded bg-red-50 px-3 py-2 text-xs text-red-700 print:hidden">
                <AlertCircle size={14} /> {dataError} - menampilkan pratinjau dengan data contoh kosong.
              </div>
            )}
            {dataLoading || !data ? (
              <div className="flex justify-center py-20 text-white"><EllipsisLoader /></div>
            ) : (
              <ReportPaper def={def} info={data.info} rows={data.rows} />
            )}
          </div>
        ) : (
          <DesignCanvas d={d} zoom={zoom} setZoom={setZoom} />
        )}
      </div>
      {nameDialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
          <form
            className="w-[380px] rounded-lg bg-white p-5 shadow-xl"
            onSubmit={(e) => { e.preventDefault(); closeNameDialog(nameDialog.value.trim() || null); }}
          >
            <h3 className="mb-3 text-base font-semibold text-gray-900">Simpan Template</h3>
            <label className="mb-1 block text-xs text-gray-600">Nama template</label>
            <input
              autoFocus
              value={nameDialog.value}
              onChange={(e) => setNameDialog({ value: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1e4d8f]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => closeNameDialog(null)} className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700">Batal</button>
              <button type="submit" className="rounded bg-[#1e4d8f] px-3 py-1.5 text-sm text-white">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
