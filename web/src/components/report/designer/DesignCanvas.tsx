"use client";

import { useEffect, useRef, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import type { ReportElement } from "@/lib/report/types";
import { pageDimensions, printableWidth } from "@/lib/report/template";
import { textStyleToCss } from "../ReportPaper";
import { findElement, type DesignerApi } from "./useDesignerState";

const MM_PX = 96 / 25.4;
const SELECT = "#2563eb";

const HANDLES: { k: string; l: number; t: number; cursor: string }[] = [
  { k: "nw", l: 0, t: 0, cursor: "nwse-resize" },
  { k: "n", l: 0.5, t: 0, cursor: "ns-resize" },
  { k: "ne", l: 1, t: 0, cursor: "nesw-resize" },
  { k: "e", l: 1, t: 0.5, cursor: "ew-resize" },
  { k: "se", l: 1, t: 1, cursor: "nwse-resize" },
  { k: "s", l: 0.5, t: 1, cursor: "ns-resize" },
  { k: "sw", l: 0, t: 1, cursor: "nesw-resize" },
  { k: "w", l: 0, t: 0.5, cursor: "ew-resize" },
];

export function DesignCanvas({ d, zoom, setZoom }: { d: DesignerApi; zoom: number; setZoom: (z: number) => void }) {
  const def = d.def;
  const defRef = useRef(def);
  defRef.current = def;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const scrollRef = useRef<HTMLDivElement>(null);
  const headRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const z = zoomRef.current + (e.deltaY < 0 ? 0.1 : -0.1);
      setZoom(Math.min(2, Math.max(0.5, Math.round(z * 10) / 10)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setZoom]);

  if (!def) return null;

  const s = MM_PX * zoom; // screen px per mm
  const px = (n: number) => `${n / zoom}px`; // constant on-screen px inside the scaled paper
  const { w: pageW, h: pageH } = pageDimensions(def.page);
  const m = def.page.margins;
  const pw = printableWidth(def);
  const cols = def.table.columns;
  const totalW = cols.reduce((a, c) => a + c.width, 0) || 1;
  const colMm = (w: number) => (w / totalW) * pw;
  const titleTop = m.top;
  const tableTop = m.top + def.title.height;
  const footerTop = pageH - m.bottom - def.footer.height;
  const snap = (v: number, shift: boolean) => (shift ? Math.round(v * 10) / 10 : Math.round(v));

  /** Pointer gesture helper: takes a history snapshot on first real movement then streams mm deltas. */
  const track = (e: RPointerEvent, onMove: (dxMm: number, dyMm: number, ev: PointerEvent) => void) => {
    const sx = e.clientX;
    const sy = e.clientY;
    let started = false;
    const mv = (ev: PointerEvent) => {
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      if (!started) {
        if (Math.abs(dx) + Math.abs(dy) < 3) return;
        started = true;
        d.snapshot();
      }
      onMove(dx / s, dy / s, ev);
    };
    const up = () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
  };

  const startMove = (e: RPointerEvent, id: string) => {
    e.stopPropagation();
    const cur = d.sel;
    let ids: string[];
    if (e.shiftKey) {
      const base = cur.type === "el" ? cur.ids : [];
      ids = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
      d.setSel(ids.length ? { type: "el", ids } : { type: "none" });
      return;
    }
    ids = cur.type === "el" && cur.ids.includes(id) ? cur.ids : [id];
    d.setSel({ type: "el", ids });
    const orig = new Map<string, { x: number; y: number }>();
    for (const i of ids) {
      const f = findElement(def, i);
      if (f) orig.set(i, { x: f.el.x, y: f.el.y });
    }
    track(e, (dx, dy, ev) => {
      d.silent((x) => {
        for (const [i, o] of orig) {
          const f = findElement(x, i);
          if (f) {
            f.el.x = snap(o.x + dx, ev.shiftKey);
            f.el.y = snap(o.y + dy, ev.shiftKey);
          }
        }
      });
    });
  };

  const startResize = (e: RPointerEvent, el: ReportElement, k: string) => {
    e.stopPropagation();
    const o = { x: el.x, y: el.y, w: el.w, h: el.h };
    track(e, (dx, dy, ev) => {
      let { x, y, w, h } = o;
      if (k.includes("e")) w = snap(o.w + dx, ev.shiftKey);
      if (k.includes("s")) h = snap(o.h + dy, ev.shiftKey);
      if (k.includes("w")) {
        const nx = snap(o.x + dx, ev.shiftKey);
        w = o.w + (o.x - nx);
        x = nx;
      }
      if (k.includes("n")) {
        const ny = snap(o.y + dy, ev.shiftKey);
        h = o.h + (o.y - ny);
        y = ny;
      }
      if (w < 1) { if (k.includes("w")) x = o.x + o.w - 1; w = 1; }
      if (h < 0.5 && el.type !== "line") { if (k.includes("n")) y = o.y + o.h - 0.5; h = 0.5; }
      d.silent((dd) => {
        const f = findElement(dd, el.id);
        if (f) Object.assign(f.el, { x, y, w, h });
      });
    });
  };

  const startBandResize = (e: RPointerEvent, which: "title" | "footer") => {
    e.stopPropagation();
    const o = which === "title" ? def.title.height : def.footer.height;
    track(e, (_dx, dy, ev) => {
      const v = Math.max(which === "title" ? 5 : 3, snap(which === "title" ? o + dy : o - dy, ev.shiftKey));
      d.silent((dd) => {
        dd[which].height = v;
      });
    });
  };

  const startColMove = (e: RPointerEvent, id: string, part: "header" | "row") => {
    e.stopPropagation();
    d.setSel({ type: "col", id, part });
    track(e, (_dx, _dy, ev) => {
      const cur = defRef.current;
      const row = headRowRef.current;
      if (!cur || !row) return;
      const rect = row.getBoundingClientRect();
      const xmm = (ev.clientX - rect.left) / s;
      const cs = cur.table.columns;
      const tot = cs.reduce((a, c) => a + c.width, 0) || 1;
      let acc = 0;
      let idx = cs.length - 1;
      for (let i = 0; i < cs.length; i++) {
        acc += (cs[i].width / tot) * pw;
        if (xmm < acc) { idx = i; break; }
      }
      d.moveColumn(id, idx);
    });
  };

  const startColResize = (e: RPointerEvent, id: string, w0: number) => {
    e.stopPropagation();
    d.setSel({ type: "col", id, part: "header" });
    track(e, (dx) => {
      const nw = Math.max(5, Math.round((w0 + (dx * totalW) / pw) * 10) / 10);
      d.silent((dd) => {
        const c = dd.table.columns.find((x) => x.id === id);
        if (c) c.width = nw;
      });
    });
  };

  const selIds = d.sel.type === "el" ? d.sel.ids : [];

  const tag = (_id: string): CSSProperties => ({
    position: "absolute", top: `-${px(14)}`, left: 0, fontSize: px(10), lineHeight: px(13), padding: `0 ${px(5)}`,
    background: "#1e4d8f", color: "#fff", pointerEvents: "none", zIndex: 5, whiteSpace: "nowrap", opacity: 0.92,
  });

  const renderElement = (el: ReportElement) => {
    const selected = selIds.includes(el.id);
    const single = selected && selIds.length === 1;
    const box: CSSProperties = { position: "absolute", left: `${el.x}mm`, top: `${el.y}mm`, width: `${el.w}mm`, height: el.type === "line" ? `${Math.max(el.h, 0)}mm` : `${el.h}mm` };
    return (
      <div key={el.id} style={{ ...box, cursor: "move", minHeight: el.type === "line" ? px(6) : undefined }} onPointerDown={(e) => startMove(e, el.id)}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", outline: selected ? "none" : `${px(1)} dotted #cbd5e1` }}>
          {el.type === "text" && <div style={{ ...textStyleToCss(el.style), lineHeight: 1.25, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{el.text}</div>}
          {el.type === "image" && (
            <div style={{ width: "100%", height: "100%", background: "#f1f5f9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: px(10), gap: px(2) }}>
              <ImageIcon style={{ width: px(16), height: px(16) }} />
              <span style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{el.text}</span>
            </div>
          )}
        </div>
        {el.type === "line" && <div style={{ position: "absolute", left: 0, right: 0, top: 0, borderTop: `0.3mm solid ${el.style.color || "#000"}` }} />}
        {selected && (
          <>
            <div style={{ position: "absolute", inset: `-${px(1)}`, border: `${px(1.5)} solid ${SELECT}`, pointerEvents: "none" }} />
            {single &&
              HANDLES.map((h) => (
                <div
                  key={h.k}
                  onPointerDown={(e) => startResize(e, el, h.k)}
                  style={{
                    position: "absolute", left: `${h.l * 100}%`, top: `${h.t * 100}%`, width: px(8), height: px(8),
                    marginLeft: `-${px(4)}`, marginTop: `-${px(4)}`, background: "#fff", border: `${px(1.5)} solid ${SELECT}`, cursor: h.cursor, zIndex: 6,
                  }}
                />
              ))}
          </>
        )}
      </div>
    );
  };

  const bandBox = (top: number, height: number): CSSProperties => ({ position: "absolute", left: `${m.left}mm`, top: `${top}mm`, width: `${pw}mm`, height: `${height}mm` });
  const cellCss = (align: string, h: number): CSSProperties => ({
    height: `${h}mm`, lineHeight: `${h}mm`, padding: "0 1mm", boxSizing: "border-box", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", textAlign: align as CSSProperties["textAlign"],
  });
  const bandSel = (b: "title" | "footer") => d.sel.type === "band" && d.sel.band === b;

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-auto bg-[#8d97a6] p-8"
      onPointerDown={() => d.setSel({ type: "page" })}
    >
      <div style={{ width: pageW * s, height: pageH * s, margin: "0 auto", position: "relative", flex: "none" }}>
        <div
          style={{ position: "absolute", left: 0, top: 0, width: `${pageW}mm`, height: `${pageH}mm`, transform: `scale(${zoom})`, transformOrigin: "0 0", background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,.35)" }}
        >
          {/* margin guides */}
          <div style={{ position: "absolute", left: `${m.left}mm`, top: `${m.top}mm`, right: `${m.right}mm`, bottom: `${m.bottom}mm`, border: `${px(1)} dashed #bfdbfe`, pointerEvents: "none" }} />

          {/* Title band */}
          <div
            style={{ ...bandBox(titleTop, def.title.height), background: "rgba(239,246,255,.45)", outline: bandSel("title") ? `${px(2)} solid ${SELECT}` : `${px(1)} solid #93c5fd` }}
            onPointerDown={(e) => { e.stopPropagation(); d.setSel({ type: "band", band: "title" }); }}
          >
            <span style={tag("t")}>ReportTitleBand1</span>
            {def.title.elements.map(renderElement)}
            <div
              onPointerDown={(e) => startBandResize(e, "title")}
              style={{ position: "absolute", left: 0, right: 0, bottom: `-${px(4)}`, height: px(8), cursor: "ns-resize", zIndex: 7 }}
              title="Tarik untuk mengubah tinggi Title"
            >
              <div style={{ margin: `${px(3)} auto 0`, width: px(40), height: px(3), background: "#1e4d8f", borderRadius: px(2) }} />
            </div>
          </div>

          {/* Header + Data bands */}
          <div style={{ position: "absolute", left: `${m.left}mm`, top: `${tableTop}mm`, width: `${pw}mm` }}>
            <div style={{ position: "relative" }}>
              <span style={tag("h")}>HeaderBand1</span>
              <div ref={headRowRef} style={{ display: "flex", borderTop: "0.3mm solid #000", borderBottom: "0.3mm solid #000" }}>
                {cols.map((c) => {
                  const selected = d.sel.type === "col" && d.sel.id === c.id;
                  const selHead = selected && d.sel.type === "col" && d.sel.part === "header";
                  return (
                    <div
                      key={c.id}
                      onPointerDown={(e) => startColMove(e, c.id, "header")}
                      style={{ position: "relative", width: `${colMm(c.width)}mm`, flex: "none", cursor: "grab", borderRight: `${px(1)} dotted #cbd5e1`, boxSizing: "border-box", outline: selHead ? `${px(2)} solid ${SELECT}` : "none", outlineOffset: `-${px(2)}`, background: selHead ? "rgba(37,99,235,.08)" : undefined }}
                    >
                      <div style={{ ...textStyleToCss(def.table.headerStyle), ...cellCss(c.align, def.table.headerHeight) }}>{c.label}</div>
                      {selHead && (
                        <button
                          type="button"
                          title="Hapus kolom"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); d.deleteSelected(); }}
                          style={{ position: "absolute", top: px(1), right: px(5), width: px(14), height: px(14), background: "#dc2626", color: "#fff", borderRadius: px(3), display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 8, padding: 0, border: 0 }}
                        >
                          <X style={{ width: px(10), height: px(10) }} />
                        </button>
                      )}
                      <div
                        onPointerDown={(e) => startColResize(e, c.id, c.width)}
                        title="Tarik untuk mengubah lebar"
                        style={{ position: "absolute", top: 0, bottom: 0, right: `-${px(3)}`, width: px(6), cursor: "col-resize", zIndex: 8 }}
                      />
                    </div>
                  );
                })}
                {cols.length === 0 && <div style={{ ...cellCss("center", def.table.headerHeight), width: "100%", color: "#94a3b8", fontSize: "9pt" }}>Belum ada kolom - klik field pada Dictionary.</div>}
              </div>
            </div>
            <div style={{ position: "relative", marginTop: px(16) }}>
              <span style={tag("d")}>DataBand1; Data Source: Data_Laporan</span>
              <div style={{ display: "flex", background: "rgba(240,253,244,.6)" }}>
                {cols.map((c, i) => {
                  const selRow = d.sel.type === "col" && d.sel.id === c.id && d.sel.part === "row";
                  return (
                    <div
                      key={c.id}
                      onPointerDown={(e) => startColMove(e, c.id, "row")}
                      style={{ width: `${colMm(c.width)}mm`, flex: "none", cursor: "grab", boxSizing: "border-box", outline: selRow ? `${px(2)} solid ${SELECT}` : "none", outlineOffset: `-${px(2)}`, background: def.table.zebra && i % 2 ? undefined : undefined }}
                    >
                      <div style={{ ...textStyleToCss(def.table.rowStyle), ...cellCss(c.align, def.table.rowHeight) }}>{`{Data.${c.field}}`}</div>
                    </div>
                  );
                })}
              </div>
              {def.table.showSummary && (
                <div style={{ display: "flex", borderTop: "0.3mm solid #000", marginTop: px(3) }}>
                  {cols.map((c, i) => (
                    <div key={c.id} style={{ width: `${colMm(c.width)}mm`, flex: "none", ...textStyleToCss({ ...def.table.rowStyle, bold: true }), ...cellCss(c.align, def.table.rowHeight) }}>
                      {c.aggregate === "sum" ? "Σ" : i === 0 ? def.table.summaryLabel : ""}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer band */}
          {def.footer.show ? (
            <div
              style={{ ...bandBox(footerTop, def.footer.height), background: "rgba(239,246,255,.45)", outline: bandSel("footer") ? `${px(2)} solid ${SELECT}` : `${px(1)} solid #93c5fd` }}
              onPointerDown={(e) => { e.stopPropagation(); d.setSel({ type: "band", band: "footer" }); }}
            >
              <span style={tag("f")}>FooterBand1</span>
              {def.footer.elements.map(renderElement)}
              <div
                onPointerDown={(e) => startBandResize(e, "footer")}
                style={{ position: "absolute", left: 0, right: 0, top: `-${px(4)}`, height: px(8), cursor: "ns-resize", zIndex: 7 }}
                title="Tarik untuk mengubah tinggi Footer"
              >
                <div style={{ margin: `${px(3)} auto 0`, width: px(40), height: px(3), background: "#1e4d8f", borderRadius: px(2) }} />
              </div>
            </div>
          ) : (
            <div style={{ ...bandBox(footerTop, def.footer.height), color: "#94a3b8", fontSize: px(11), textAlign: "center", pointerEvents: "none" }}>Footer disembunyikan</div>
          )}
        </div>
      </div>
    </div>
  );
}
