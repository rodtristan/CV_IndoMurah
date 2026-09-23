"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Minus, Plus, Printer, Maximize2, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { EllipsisLoader } from "@/components/ui/Loader";
import { ReportPaper, paginate } from "@/components/report/ReportPaper";
import { buildDefaultTemplate, decodeParams, pageDimensions } from "@/lib/report/template";
import type {
  ReportCatalogItem,
  ReportDataResponse,
  ReportTemplateDef,
  ReportTemplateRecord,
} from "@/lib/report/types";

const MM_TO_PX = 96 / 25.4;

function Viewer() {
  const sp = useSearchParams();
  const key = sp.get("key") ?? "";
  const variant = sp.get("variant") ?? "";
  const templateParam = sp.get("template") ?? "default";
  const pParam = sp.get("p");
  const autoprint = sp.get("autoprint") === "1";

  const [def, setDef] = useState<ReportTemplateDef | null>(null);
  const [data, setData] = useState<ReportDataResponse | null>(null);
  const [error, setError] = useState("");
  const [scale, setScale] = useState(1);
  const [page, setPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const printed = useRef(false);

  useEffect(() => {
    if (!key) { setError("Parameter laporan tidak lengkap"); return; }
    let cancelled = false;
    (async () => {
      try {
        const cat = await api.get<ReportCatalogItem[]>("report-engine/catalog", undefined, { skipCache: true });
        const item = (Array.isArray(cat.data) ? cat.data : []).find((c) => c.key === key);
        if (!item) throw new Error("Laporan tidak ditemukan");

        let d: ReportTemplateDef;
        if (templateParam === "default") {
          d = buildDefaultTemplate(item.fields);
        } else {
          const tr = await api.get<ReportTemplateRecord[]>(`report-engine/templates/${encodeURIComponent(key)}`, undefined, { skipCache: true });
          const rec = (Array.isArray(tr.data) ? tr.data : []).find((t) => String(t.ID) === templateParam);
          d = rec?.Definition ?? buildDefaultTemplate(item.fields);
        }

        const res = await api.post<ReportDataResponse>(`report-engine/data/${encodeURIComponent(key)}`, {
          params: decodeParams(pParam),
          variant: variant || undefined,
        });
        if (!res.data) throw new Error("Data laporan kosong");
        if (cancelled) return;
        document.title = res.data.info?.InfoFilter?.NamaLaporan || item.title;
        setDef(d);
        setData(res.data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Gagal memuat laporan");
      }
    })();
    return () => { cancelled = true; };
  }, [key, variant, templateParam, pParam]);

  const fitWidth = useCallback(() => {
    if (!def || !scrollRef.current) return;
    const { w } = pageDimensions(def.page);
    const avail = scrollRef.current.clientWidth - 48;
    setScale(Math.min(3, Math.max(0.25, avail / (w * MM_TO_PX))));
  }, [def]);

  useEffect(() => { fitWidth(); }, [fitWidth]);

  useEffect(() => {
    if (autoprint && def && data && !printed.current) {
      printed.current = true;
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [autoprint, def, data]);

  const totalPages = def && data ? paginate(def, data.rows ?? []).length : 1;

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const sheets = el.querySelectorAll<HTMLElement>(".report-sheet");
    const mid = el.getBoundingClientRect().top + el.clientHeight / 3;
    let cur = 1;
    sheets.forEach((s, i) => { if (s.getBoundingClientRect().top <= mid) cur = i + 1; });
    setPage(cur);
  };

  const zoom = (delta: number) => setScale((s) => Math.min(3, Math.max(0.25, Math.round((s + delta) * 100) / 100)));

  const btn = "flex h-8 items-center gap-1.5 rounded px-2.5 text-sm text-white hover:bg-white/15 disabled:opacity-40";

  return (
    <div className="rv-root flex h-screen flex-col" style={{ background: "#525659" }}>
      <style>{`@media print {
  html, body { background: #fff !important; }
  .rv-root { height: auto !important; display: block !important; background: none !important; }
  .rv-toolbar { display: none !important; }
  .rv-scroll { overflow: visible !important; padding: 0 !important; height: auto !important; }
}`}</style>

      <div className="rv-toolbar flex h-11 shrink-0 items-center gap-1 px-3 text-white" style={{ background: "#323639" }}>
        <button className={btn} onClick={() => window.print()} disabled={!data} title="Cetak">
          <Printer className="size-4" /> Print
        </button>
        <span className="hidden text-xs text-white/60 md:inline">Simpan sebagai PDF: pilih &quot;Save as PDF&quot; di dialog cetak</span>
        <div className="mx-auto flex items-center gap-1">
          <button className={btn} onClick={() => zoom(-0.1)} title="Perkecil"><Minus className="size-4" /></button>
          <span className="w-12 text-center text-sm">{Math.round(scale * 100)}%</span>
          <button className={btn} onClick={() => zoom(0.1)} title="Perbesar"><Plus className="size-4" /></button>
          <button className={btn} onClick={fitWidth} title="Sesuaikan lebar"><Maximize2 className="size-4" /> Fit width</button>
        </div>
        <span className="mr-2 text-sm">Hal {page} / {totalPages}</span>
        <button className={btn} onClick={() => window.close()} title="Tutup"><X className="size-4" /> Tutup</button>
      </div>

      <div ref={scrollRef} onScroll={onScroll} className="rv-scroll flex-1 overflow-auto px-6 py-6">
        {error ? (
          <p className="pt-20 text-center text-sm text-white">{error}</p>
        ) : !def || !data ? (
          <div className="flex justify-center pt-20 text-white"><EllipsisLoader /></div>
        ) : (
          <div style={{ width: "fit-content", margin: "0 auto" }}>
            <ReportPaper def={def} info={data.info} rows={data.rows ?? []} scale={scale} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportViewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-white" style={{ background: "#525659" }}>
          <EllipsisLoader />
        </div>
      }
    >
      <Viewer />
    </Suspense>
  );
}
