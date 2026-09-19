"use client";

import { useEffect, useRef, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { Image as ImageIcon, Lock, X } from "lucide-react";
import type { ReportElement } from "@/lib/report/types";
import { ROW_NO_FIELD, effectiveColumns, pageDimensions, printableWidth } from "@/lib/report/template";
import { Cell, PageDecor, TextBox, elementDecorCss, headerStyleOf, lineCss, rowStyleOf, summaryStyleOf, tableLook } from "../ReportPaper";
import { bandHeight, findElement, type BandKey, type DesignerApi } from "./useDesignerState";
import type { ViewSettings } from "./useViewSettings";
import { ZOOM_MAX, ZOOM_MIN } from "./ui";

const MM_PX = 96 / 25.4;
const SELECT = "#2563eb";
const RULER = 20;

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

/** mm ruler along one page edge, with margin shading. `s` = screen px per mm. */
function Ruler({ dir, lengthMm, s, m0, m1 }: { dir: "h" | "v"; lengthMm: number; s: number; m0: number; m1: number }) {
  const horiz = dir === "h";
  const step = s >= 3 ? 10 : 20;
  const labels: number[] = [];
  for (let mm = 0; mm <= lengthMm; mm += step) labels.push(mm);
  const len = lengthMm * s;
  const box: CSSProperties = horiz
    ? { position: "absolute", left: 0, top: -RULER, width: len, height: RULER }
    : { position: "absolute", left: -RULER, top: 0, width: RULER, height: len };
  const tick = `repeating-linear-gradient(${horiz ? "to right" : "to bottom"}, #64748b 0 1px, transparent 1px ${s}px)`;
  return (
    <div style={{ ...box, background: "#f1f5f9", overflow: "hidden", fontSize: 9, color: "#475569", pointerEvents: "none", boxShadow: "inset 0 0 0 1px #cbd5e1" }}>
      {/* margin areas */}
      <div style={horiz ? { position: "absolute", left: 0, top: 0, bottom: 0, width: m0 * s, background: "#cbd5e1" } : { position: "absolute", top: 0, left: 0, right: 0, height: m0 * s, background: "#cbd5e1" }} />
      <div style={horiz ? { position: "absolute", right: 0, top: 0, bottom: 0, width: m1 * s, background: "#cbd5e1" } : { position: "absolute", bottom: 0, left: 0, right: 0, height: m1 * s, background: "#cbd5e1" }} />
      {/* 1 mm ticks */}
      <div style={horiz ? { position: "absolute", left: 0, right: 0, bottom: 0, height: 4, backgroundImage: tick } : { position: "absolute", top: 0, bottom: 0, right: 0, width: 4, backgroundImage: tick }} />
      {labels.map((mm) => (
        <span
          key={mm}
          style={horiz ? { position: "absolute", left: mm * s + 2, top: 1, lineHeight: "10px" } : { position: "absolute", top: mm * s + 1, left: 2, lineHeight: "10px" }}
        >
          {mm}
        </span>
      ))}
      {labels.map((mm) => (
        <div key={`t${mm}`} style={horiz ? { position: "absolute", left: mm * s, bottom: 0, width: 1, height: 9, background: "#334155" } : { position: "absolute", top: mm * s, right: 0, height: 1, width: 9, background: "#334155" }} />
      ))}
      {/* margin markers */}
      <div style={horiz ? { position: "absolute", left: m0 * s - 1, top: 0, bottom: 0, width: 2, background: SELECT } : { position: "absolute", top: m0 * s - 1, left: 0, right: 0, height: 2, background: SELECT }} />
      <div style={horiz ? { position: "absolute", right: m1 * s - 1, top: 0, bottom: 0, width: 2, background: SELECT } : { position: "absolute", bottom: m1 * s - 1, left: 0, right: 0, height: 2, background: SELECT }} />
    </div>
  );
}

export function DesignCanvas({
  d, zoom, setZoom, view,
}: { d: DesignerApi; zoom: number; setZoom: (z: number) => void; view: ViewSettings }) {
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
      setZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100)));
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
  const cols = effectiveColumns(def);
  const totalW = cols.reduce((a, c) => a + c.width, 0) || 1;
  const colMm = (w: number) => (w / totalW) * pw;
  const ph = def.pageHeader?.show ? def.pageHeader : null;
  const phTop = m.top;
  const titleTop = m.top + (ph ? ph.height : 0);
  const tableTop = titleTop + def.title.height;
  const footerTop = pageH - m.bottom - def.footer.height;
  const look = tableLook(def);
  const grid = view.grid ? view.snap : 0;
  const snap = (v: number, shift: boolean) => (shift ? Math.round(v * 10) / 10 : grid ? Math.round(v / grid) * grid : Math.round(v));

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
      if (f && !f.el.locked) orig.set(i, { x: f.el.x, y: f.el.y });
    }
    if (orig.size === 0) return;
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
      if (w < 1 && !(el.type === "line" && el.vertical)) { if (k.includes("w")) x = o.x + o.w - 1; w = 1; }
      if (h < 0.5 && el.type !== "line") { if (k.includes("n")) y = o.y + o.h - 0.5; h = 0.5; }
      if (el.type === "line" && el.vertical) w = 0;
      d.silent((dd) => {
        const f = findElement(dd, el.id);
        if (f) Object.assign(f.el, { x, y, w, h });
      });
    });
  };

  const startBandResize = (e: RPointerEvent, which: BandKey) => {
    e.stopPropagation();
    const o = bandHeight(def, which);
    track(e, (_dx, dy, ev) => {
      const v = Math.max(which === "footer" ? 3 : 5, snap(which === "footer" ? o - dy : o + dy, ev.shiftKey));
      d.silent((dd) => {
        if (which === "pageHeader") {
          if (dd.pageHeader) dd.pageHeader.height = v;
        } else dd[which].height = v;
      });
    });
  };

  const startColMove = (e: RPointerEvent, id: string, part: "header" | "row") => {
    e.stopPropagation();
    if (id === "__no") return;
    d.setSel({ type: "col", id, part });
    track(e, (_dx, _dy, ev) => {
      const cur = defRef.current;
      const row = headRowRef.current;
      if (!cur || !row) return;
      const rect = row.getBoundingClientRect();
      const xmm = (ev.clientX - rect.left) / s;
      const cs = effectiveColumns(cur);
      const tot = cs.reduce((a, c) => a + c.width, 0) || 1;
      let acc = 0;
      let idx = cs.length - 1;
      for (let i = 0; i < cs.length; i++) {
        acc += (cs[i].width / tot) * pw;
        if (xmm < acc) { idx = i; break; }
      }
      d.moveColumn(id, cur.table.showRowNumber ? Math.max(0, idx - 1) : idx);
    });
  };

  const startColResize = (e: RPointerEvent, id: string, w0: number) => {
    e.stopPropagation();
    if (id === "__no") return;
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

  const tag = (): CSSProperties => ({
    position: "absolute", top: `-${px(14)}`, left: 0, fontSize: px(10), lineHeight: px(13), padding: `0 ${px(5)}`,
    background: "#1e4d8f", color: "#fff", pointerEvents: "none", zIndex: 5, whiteSpace: "nowrap", opacity: 0.92,
  });

  const renderElement = (el: ReportElement) => {
    const selected = selIds.includes(el.id);
    const single = selected && selIds.length === 1;
    const vertical = el.type === "line" && el.vertical;
    const box: CSSProperties = { position: "absolute", left: `${el.x}mm`, top: `${el.y}mm`, width: `${vertical ? 0 : el.w}mm`, height: el.type === "line" && !vertical ? `${Math.max(el.h, 0)}mm` : `${el.h}mm` };
    return (
      <div
        key={el.id}
        style={{ ...box, cursor: el.locked ? "default" : "move", minHeight: el.type === "line" && !vertical ? px(6) : undefined, minWidth: vertical ? px(6) : undefined }}
        onPointerDown={(e) => startMove(e, el.id)}
      >
        <div style={{ position: "absolute", inset: 0, overflow: el.type === "line" ? "visible" : "hidden", outline: selected ? "none" : `${px(1)} dotted #cbd5e1` }}>
          {el.type === "text" && <TextBox el={el}>{el.text}</TextBox>}
          {el.type === "image" && (
            <div style={{ width: "100%", height: "100%", boxSizing: "border-box", background: "#f1f5f9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: px(10), gap: px(2), ...elementDecorCss(el) }}>
              <ImageIcon style={{ width: px(16), height: px(16) }} />
              <span style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{el.text}</span>
            </div>
          )}
        </div>
        {el.type === "line" && <div style={{ position: "absolute", left: 0, top: 0, ...lineCss(el), ...(vertical ? { height: "100%" } : { width: "100%" }) }} />}
        {el.locked && (
          <div style={{ position: "absolute", right: px(1), top: px(1), color: "#b45309", zIndex: 6, pointerEvents: "none" }}>
            <Lock style={{ width: px(10), height: px(10) }} />
          </div>
        )}
        {selected && (
          <>
            <div style={{ position: "absolute", inset: `-${px(1)}`, border: `${px(1.5)} ${el.locked ? "dashed" : "solid"} ${el.locked ? "#b45309" : SELECT}`, pointerEvents: "none" }} />
            {single && !el.locked &&
              HANDLES.filter((h) => !(vertical && (h.k.includes("e") || h.k.includes("w")) ) ).filter((h) => !(el.type === "line" && !vertical && (h.k === "n" || h.k === "s"))).map((h) => (
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
  const gridBg: CSSProperties = grid
    ? {
        backgroundImage: `linear-gradient(to right, rgba(30,77,143,.18) ${px(1)}, transparent ${px(1)}), linear-gradient(to bottom, rgba(30,77,143,.18) ${px(1)}, transparent ${px(1)})`,
        backgroundSize: `${grid}mm ${grid}mm`,
      }
    : {};
  const bandSel = (b: BandKey) => d.sel.type === "band" && d.sel.band === b;
  const bandStyle = (top: number, height: number, b: BandKey): CSSProperties => ({
    ...bandBox(top, height),
    background: "rgba(239,246,255,.45)",
    ...gridBg,
    outline: bandSel(b) ? `${px(2)} solid ${SELECT}` : `${px(1)} solid #93c5fd`,
  });
  const resizeGrip = (b: BandKey, atTop = false): CSSProperties => ({ position: "absolute", left: 0, right: 0, [atTop ? "top" : "bottom"]: `-${px(4)}`, height: px(8), cursor: "ns-resize", zIndex: 7 });
  const grip = <div style={{ margin: `${px(3)} auto 0`, width: px(40), height: px(3), background: "#1e4d8f", borderRadius: px(2) }} />;

  const vB = (i: number) => (look.cellLines ? { borderRight: look.line, borderLeft: i === 0 ? look.line : undefined } : {});

  return (
    <div
      id="dz-canvas-scroll"
      ref={scrollRef}
      className="flex-1 overflow-auto bg-[#8d97a6] p-8"
      onPointerDown={() => d.setSel({ type: "page" })}
    >
      <div style={{ width: pageW * s, height: pageH * s, margin: "0 auto", position: "relative", flex: "none" }}>
        {view.ruler && (
          <>
            <Ruler dir="h" lengthMm={pageW} s={s} m0={m.left} m1={m.right} />
            <Ruler dir="v" lengthMm={pageH} s={s} m0={m.top} m1={m.bottom} />
          </>
        )}
        <div
          style={{ position: "absolute", left: 0, top: 0, width: `${pageW}mm`, height: `${pageH}mm`, transform: `scale(${zoom})`, transformOrigin: "0 0", background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,.35)" }}
        >
          <PageDecor def={def} w={pageW} h={pageH} />

          {/* margin guides */}
          {view.guides && (
            <div style={{ position: "absolute", left: `${m.left}mm`, top: `${m.top}mm`, right: `${m.right}mm`, bottom: `${m.bottom}mm`, border: `${px(1)} dashed #bfdbfe`, pointerEvents: "none" }} />
          )}

          {/* Page header band (repeats on every page) */}
          {ph && (
            <div style={bandStyle(phTop, ph.height, "pageHeader")} onPointerDown={(e) => { e.stopPropagation(); d.setSel({ type: "band", band: "pageHeader" }); }}>
              {view.labels && <span style={tag()}>PageHeaderBand1</span>}
              {ph.elements.map(renderElement)}
              <div onPointerDown={(e) => startBandResize(e, "pageHeader")} style={resizeGrip("pageHeader")} title="Tarik untuk mengubah tinggi Header halaman">{grip}</div>
            </div>
          )}

          {/* Title band */}
          <div style={bandStyle(titleTop, def.title.height, "title")} onPointerDown={(e) => { e.stopPropagation(); d.setSel({ type: "band", band: "title" }); }}>
            {view.labels && <span style={tag()}>ReportTitleBand1</span>}
            {def.title.elements.map(renderElement)}
            <div onPointerDown={(e) => startBandResize(e, "title")} style={resizeGrip("title")} title="Tarik untuk mengubah tinggi Title">{grip}</div>
          </div>

          {/* Header + Data bands */}
          <div style={{ position: "absolute", left: `${m.left}mm`, top: `${tableTop}mm`, width: `${pw}mm` }}>
            <div style={{ position: "relative" }}>
              {view.labels && <span style={tag()}>HeaderBand1</span>}
              <div ref={headRowRef} style={{ display: "flex", ...(look.headerRule ? { borderTop: look.line, borderBottom: look.line } : {}) }}>
                {cols.map((c, i) => {
                  const synthetic = c.id === "__no";
                  const selHead = !synthetic && d.sel.type === "col" && d.sel.id === c.id && d.sel.part === "header";
                  const st = headerStyleOf(def, c);
                  return (
                    <div
                      key={c.id}
                      onPointerDown={(e) => startColMove(e, c.id, "header")}
                      style={{ position: "relative", width: `${colMm(c.width)}mm`, flex: "none", cursor: synthetic ? "default" : "grab", boxSizing: "border-box", outline: selHead ? `${px(2)} solid ${SELECT}` : "none", outlineOffset: `-${px(2)}`, background: selHead ? "rgba(37,99,235,.08)" : undefined }}
                    >
                      <Cell width="100%" style={st} align={c.headerStyle?.align ?? c.align} height={def.table.headerHeight} pad={look.pad} background={c.headerBackground || def.table.headerBackground} {...vB(i)}>
                        {c.label}
                      </Cell>
                      {!synthetic && !look.cellLines && <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, borderRight: `${px(1)} dotted #cbd5e1`, pointerEvents: "none" }} />}
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
                      {!synthetic && (
                        <div
                          onPointerDown={(e) => startColResize(e, c.id, c.width)}
                          title="Tarik untuk mengubah lebar"
                          style={{ position: "absolute", top: 0, bottom: 0, right: `-${px(3)}`, width: px(6), cursor: "col-resize", zIndex: 8 }}
                        />
                      )}
                    </div>
                  );
                })}
                {cols.length === 0 && <div style={{ height: `${def.table.headerHeight}mm`, lineHeight: `${def.table.headerHeight}mm`, textAlign: "center", width: "100%", color: "#94a3b8", fontSize: "9pt" }}>Belum ada kolom - klik field pada Dictionary.</div>}
              </div>
            </div>
            <div style={{ position: "relative", marginTop: px(16) }}>
              {view.labels && <span style={tag()}>DataBand1; Data Source: Data_Laporan</span>}
              <div style={{ display: "flex", background: "rgba(240,253,244,.6)" }}>
                {cols.map((c, i) => {
                  const synthetic = c.id === "__no";
                  const selRow = !synthetic && d.sel.type === "col" && d.sel.id === c.id && d.sel.part === "row";
                  return (
                    <div
                      key={c.id}
                      onPointerDown={(e) => startColMove(e, c.id, "row")}
                      style={{ width: `${colMm(c.width)}mm`, flex: "none", cursor: synthetic ? "default" : "grab", boxSizing: "border-box", outline: selRow ? `${px(2)} solid ${SELECT}` : "none", outlineOffset: `-${px(2)}` }}
                    >
                      <Cell width="100%" style={rowStyleOf(def, c)} align={c.rowStyle?.align ?? c.align} height={def.table.rowHeight} pad={look.pad} background={c.rowBackground} borderBottom={look.rowLines ? look.line : undefined} {...vB(i)}>
                        {c.field === ROW_NO_FIELD ? "{No}" : `{Data.${c.field}}`}
                      </Cell>
                    </div>
                  );
                })}
              </div>
              {def.table.showSummary && (
                <div style={{ display: "flex", marginTop: px(3), ...(look.summaryRule ? { borderTop: look.line } : {}) }}>
                  {cols.map((c, i) => (
                    <Cell key={c.id} width={`${colMm(c.width)}mm`} style={summaryStyleOf(def)} align={c.align} height={def.table.rowHeight} pad={look.pad} {...vB(i)}>
                      {c.aggregate === "sum" ? "Σ" : i === 0 ? def.table.summaryLabel : ""}
                    </Cell>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer band */}
          {def.footer.show ? (
            <div style={bandStyle(footerTop, def.footer.height, "footer")} onPointerDown={(e) => { e.stopPropagation(); d.setSel({ type: "band", band: "footer" }); }}>
              {view.labels && <span style={tag()}>FooterBand1</span>}
              {def.footer.elements.map(renderElement)}
              <div onPointerDown={(e) => startBandResize(e, "footer")} style={resizeGrip("footer", true)} title="Tarik untuk mengubah tinggi Footer">{grip}</div>
            </div>
          ) : (
            <div style={{ ...bandBox(footerTop, def.footer.height), color: "#94a3b8", fontSize: px(11), textAlign: "center", pointerEvents: "none" }}>Footer disembunyikan</div>
          )}
        </div>
      </div>
    </div>
  );
}
