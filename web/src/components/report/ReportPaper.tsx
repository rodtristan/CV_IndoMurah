"use client";

import type { CSSProperties, ReactNode } from "react";
import type { ReportElement, ReportInfo, ReportTemplateDef, TextStyle } from "@/lib/report/types";
import {
  ROW_NO_FIELD, effectiveColumns, formatCell, layoutDimensions, pageCssSize, pageDimensions, printScaleOf, resolvePlaceholders, sortRows,
} from "@/lib/report/template";

export function mergeStyle(base: TextStyle, over?: Partial<TextStyle>): TextStyle {
  return over ? { ...base, ...over } : base;
}

export function textStyleToCss(s: TextStyle): CSSProperties {
  const deco = [s.underline ? "underline" : "", s.strike ? "line-through" : ""].filter(Boolean).join(" ");
  const css: CSSProperties = {
    fontFamily: s.fontFamily || "Arial, Helvetica, sans-serif",
    fontSize: `${s.fontSize}pt`,
    fontWeight: s.bold ? 700 : 400,
    fontStyle: s.italic ? "italic" : "normal",
    textDecoration: deco || "none",
    textAlign: s.align,
    color: s.color || "#000",
  };
  if (s.highlight) css.backgroundColor = s.highlight;
  if (s.letterSpacing) css.letterSpacing = `${s.letterSpacing}pt`;
  return css;
}

/** border / fill / padding of an element (Word "Borders and Shading") */
export function elementDecorCss(el: ReportElement): CSSProperties {
  const css: CSSProperties = {};
  if (el.background) css.backgroundColor = el.background;
  const b = el.border;
  if (b) {
    const v = `${b.width}mm ${b.style} ${b.color}`;
    if (b.sides.top) css.borderTop = v;
    if (b.sides.right) css.borderRight = v;
    if (b.sides.bottom) css.borderBottom = v;
    if (b.sides.left) css.borderLeft = v;
  }
  if (el.padding) css.padding = `${el.padding}mm`;
  return css;
}

const VALIGN: Record<string, string> = { top: "flex-start", middle: "center", bottom: "flex-end" };

function textBoxCss(el: ReportElement): CSSProperties {
  return { ...textStyleToCss(el.style), lineHeight: el.style.lineHeight ?? 1.25, whiteSpace: "pre-wrap", wordBreak: "break-word" };
}

/** Text element body: fills its box, handles border/fill/padding, vertical alignment and line spacing. */
export function TextBox({ el, children }: { el: ReportElement; children: ReactNode }) {
  const v = el.style.valign;
  if (!v) return <div style={{ ...textBoxCss(el), boxSizing: "border-box", width: "100%", height: "100%", ...elementDecorCss(el) }}>{children}</div>;
  return (
    <div style={{ display: "flex", alignItems: VALIGN[v], width: "100%", height: "100%", boxSizing: "border-box", ...elementDecorCss(el) }}>
      <div style={{ ...textBoxCss(el), width: "100%" }}>{children}</div>
    </div>
  );
}

export function lineCss(el: ReportElement): CSSProperties {
  const c = el.style.color || "#000";
  return el.vertical ? { borderLeft: `0.3mm solid ${c}`, width: 0, height: "100%" } : { borderTop: `0.3mm solid ${c}`, height: 0, width: "100%" };
}

export function ElementView({ el, info, pageNumber, totalPages }: { el: ReportElement; info: ReportInfo; pageNumber?: number; totalPages?: number }) {
  const box: CSSProperties = { position: "absolute", left: `${el.x}mm`, top: `${el.y}mm`, width: `${el.w}mm`, height: `${el.h}mm`, overflow: "hidden" };
  if (el.type === "line") {
    return <div style={{ ...box, overflow: "visible", ...(el.vertical ? { width: 0 } : { height: 0 }), ...lineCss(el) }} />;
  }
  const value = resolvePlaceholders(el.text ?? "", { info, pageNumber, totalPages });
  if (el.type === "image") {
    const st = { ...box, ...elementDecorCss(el), boxSizing: "border-box" as const };
    // eslint-disable-next-line @next/next/no-img-element
    return value ? <img src={value} alt="" style={{ ...st, objectFit: "contain" }} /> : <div style={st} />;
  }
  return (
    <div style={box}>
      <TextBox el={el}>{value}</TextBox>
    </div>
  );
}

// ── table rendering helpers (shared with the designer canvas) ──

export function tableLook(def: ReportTemplateDef) {
  const t = def.table;
  const g = t.gridLines ?? "header";
  return {
    g,
    line: `${t.gridWidth ?? 0.3}mm solid ${t.gridColor ?? "#000"}`,
    headerRule: g !== "none",
    rowLines: g === "horizontal" || g === "all",
    cellLines: g === "vertical" || g === "all",
    summaryRule: g !== "none",
    pad: t.cellPadding ?? 1,
    zebraColor: t.zebraColor || "#f3f4f6",
  };
}

/** One table cell (header, data or summary). Keeps the fixed-height single-line look; uses flex only when valign / line spacing is set. */
export function Cell({
  width, style, align, height, pad, background, borderBottom, borderRight, borderLeft, children,
}: {
  width: string; style: TextStyle; align: string; height: number; pad: number; background?: string;
  borderBottom?: string; borderRight?: string; borderLeft?: string; children: ReactNode;
}) {
  const base: CSSProperties = {
    ...textStyleToCss(style),
    textAlign: align as CSSProperties["textAlign"],
    width,
    flex: "none",
    height: `${height}mm`,
    boxSizing: "border-box",
    overflow: "hidden",
  };
  if (background) base.background = background;
  if (borderBottom) base.borderBottom = borderBottom;
  if (borderRight) base.borderRight = borderRight;
  if (borderLeft) base.borderLeft = borderLeft;
  if (!style.valign && !style.lineHeight) {
    return <div style={{ ...base, lineHeight: `${height}mm`, padding: `0 ${pad}mm`, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{children}</div>;
  }
  return (
    <div style={{ ...base, display: "flex", alignItems: VALIGN[style.valign ?? "middle"], padding: `0 ${pad}mm` }}>
      <div style={{ width: "100%", lineHeight: style.lineHeight ?? 1.2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{children}</div>
    </div>
  );
}

export function headerStyleOf(def: ReportTemplateDef, col: { headerStyle?: Partial<TextStyle> }) {
  return mergeStyle(def.table.headerStyle, col.headerStyle);
}
export function rowStyleOf(def: ReportTemplateDef, col: { rowStyle?: Partial<TextStyle> }) {
  return mergeStyle(def.table.rowStyle, col.rowStyle);
}
export function summaryStyleOf(def: ReportTemplateDef): TextStyle {
  return { ...def.table.rowStyle, bold: true, ...def.table.summaryStyle };
}

/** watermark + page border, drawn behind the content (w/h in mm) */
export function PageDecor({ def, w, h, px }: { def: ReportTemplateDef; w: number; h: number; px?: (n: number) => string }) {
  void px;
  const wm = def.page.watermark;
  const pb = def.page.pageBorder;
  const m = def.page.margins;
  const inset = Math.max(1, Math.min(m.top, m.right, m.bottom, m.left) / 2);
  return (
    <>
      {pb?.show && (
        <div style={{ position: "absolute", left: `${inset}mm`, top: `${inset}mm`, right: `${inset}mm`, bottom: `${inset}mm`, border: `${pb.width}mm solid ${pb.color}`, pointerEvents: "none" }} />
      )}
      {wm && wm.text && (
        <div style={{ position: "absolute", left: 0, top: 0, width: `${w}mm`, height: `${h}mm`, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ transform: `rotate(${wm.rotation}deg)`, fontSize: `${wm.fontSize}pt`, color: wm.color, opacity: wm.opacity, fontWeight: 700, whiteSpace: "nowrap", userSelect: "none", fontFamily: "Arial, Helvetica, sans-serif" }}>
            {wm.text}
          </div>
        </div>
      )}
    </>
  );
}

export function paginate(def: ReportTemplateDef, rows: Record<string, unknown>[]): Record<string, unknown>[][] {
  const { h } = layoutDimensions(def.page);
  const m = def.page.margins;
  const ph = def.pageHeader?.show ? def.pageHeader.height : 0;
  const usable = h - m.top - m.bottom - (def.footer.show ? def.footer.height : 0) - ph;
  const repeat = def.table.repeatHeader !== false;
  const cap0 = def.page.maxRowsPerPage && def.page.maxRowsPerPage > 0 ? Math.floor(def.page.maxRowsPerPage) : Infinity;
  const perFirst = Math.min(cap0, Math.max(1, Math.floor((usable - def.title.height - def.table.headerHeight) / def.table.rowHeight)));
  const perOther = Math.min(cap0, Math.max(1, Math.floor((usable - (repeat ? def.table.headerHeight : 0)) / def.table.rowHeight)));

  const pages: Record<string, unknown>[][] = [];
  let i = 0;
  let cap = perFirst;
  while (i < rows.length) {
    pages.push(rows.slice(i, i + cap));
    i += cap;
    cap = perOther;
  }
  if (pages.length === 0) pages.push([]);
  // reserve room for the summary row on the last page
  const needsSummary = def.table.showSummary && def.table.columns.some((c) => c.aggregate === "sum");
  if (needsSummary) {
    const last = pages[pages.length - 1];
    const capLast = pages.length === 1 ? perFirst : perOther;
    if (last.length >= capLast) pages.push([]);
  }
  return pages;
}

function Page({
  def, info, rows, pageNumber, totalPages, allRows, isFirst, isLast, rowOffset,
}: {
  def: ReportTemplateDef; info: ReportInfo; rows: Record<string, unknown>[]; pageNumber: number; totalPages: number;
  allRows: Record<string, unknown>[]; isFirst: boolean; isLast: boolean; rowOffset: number;
}) {
  const { w, h } = layoutDimensions(def.page);
  const m = def.page.margins;
  const pw = w - m.left - m.right;
  const cols = effectiveColumns(def);
  const totalWeight = cols.reduce((s, c) => s + c.width, 0) || 1;
  const widthOf = (c: (typeof cols)[number]) => `${(c.width / totalWeight) * pw}mm`;
  const look = tableLook(def);
  const showHead = isFirst || def.table.repeatHeader !== false;
  const ph = def.pageHeader?.show ? def.pageHeader : null;

  const sums = def.table.showSummary
    ? cols.map((c) => (c.aggregate === "sum" ? allRows.reduce((s, r) => s + (Number(r[c.field]) || 0), 0) : null))
    : [];

  const vBorders = (i: number) => (look.cellLines ? { borderRight: look.line, borderLeft: i === 0 ? look.line : undefined } : {});

  return (
    <div className="report-page" style={{ width: `${w}mm`, height: `${h}mm`, position: "relative", background: "#fff", boxSizing: "border-box", overflow: "hidden" }}>
      <PageDecor def={def} w={w} h={h} />
      <div style={{ position: "absolute", left: `${m.left}mm`, top: `${m.top}mm`, width: `${pw}mm` }}>
        {ph && (
          <div style={{ position: "relative", height: `${ph.height}mm` }}>
            {ph.elements.map((el) => (
              <ElementView key={el.id} el={el} info={info} pageNumber={pageNumber} totalPages={totalPages} />
            ))}
          </div>
        )}
        {isFirst && (
          <div style={{ position: "relative", height: `${def.title.height}mm` }}>
            {def.title.elements.map((el) => (
              <ElementView key={el.id} el={el} info={info} pageNumber={pageNumber} totalPages={totalPages} />
            ))}
          </div>
        )}
        {showHead && (
          <div style={{ display: "flex", ...(look.headerRule ? { borderTop: look.line, borderBottom: look.line } : {}) }}>
            {cols.map((c, i) => (
              <Cell
                key={c.id}
                width={widthOf(c)}
                style={headerStyleOf(def, c)}
                align={c.headerStyle?.align ?? c.align}
                height={def.table.headerHeight}
                pad={look.pad}
                background={c.headerBackground || def.table.headerBackground}
                {...vBorders(i)}
              >
                {c.label}
              </Cell>
            ))}
          </div>
        )}
        {rows.map((r, ri) => (
          <div key={ri} style={{ display: "flex", background: def.table.zebra && ri % 2 === 1 ? look.zebraColor : undefined }}>
            {cols.map((c, i) => (
              <Cell
                key={c.id}
                width={widthOf(c)}
                style={rowStyleOf(def, c)}
                align={c.rowStyle?.align ?? c.align}
                height={def.table.rowHeight}
                pad={look.pad}
                background={c.rowBackground}
                borderBottom={look.rowLines ? look.line : undefined}
                {...vBorders(i)}
              >
                {c.field === ROW_NO_FIELD ? String(rowOffset + ri + 1) : formatCell(r[c.field], c)}
              </Cell>
            ))}
          </div>
        ))}
        {isLast && def.table.showSummary && sums.some((s) => s !== null) && (
          <div style={{ display: "flex", ...(look.summaryRule ? { borderTop: look.line } : {}) }}>
            {cols.map((c, i) => (
              <Cell key={c.id} width={widthOf(c)} style={summaryStyleOf(def)} align={c.align} height={def.table.rowHeight} pad={look.pad} {...vBorders(i)}>
                {sums[i] !== null && sums[i] !== undefined ? formatCell(sums[i], c) : i === 0 ? def.table.summaryLabel : ""}
              </Cell>
            ))}
          </div>
        )}
      </div>
      {def.footer.show && (
        <div style={{ position: "absolute", left: `${m.left}mm`, bottom: `${m.bottom}mm`, width: `${pw}mm`, height: `${def.footer.height}mm` }}>
          {def.footer.elements.map((el) => (
            <ElementView key={el.id} el={el} info={info} pageNumber={pageNumber} totalPages={totalPages} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Renders every page of a report as stacked sheets. `className="report-sheet"` wrappers are print-friendly (see globals `.report-print`). */
export function ReportPaper({
  def, info, rows, scale = 1,
}: { def: ReportTemplateDef; info: ReportInfo; rows: Record<string, unknown>[]; scale?: number }) {
  const sorted = sortRows(def, rows);
  const pages = paginate(def, sorted);
  const { w, h } = pageDimensions(def.page);
  const ps = printScaleOf(def.page);
  const lay = layoutDimensions(def.page);
  const mmToPx = 96 / 25.4;
  let offset = 0;
  return (
    <div className="report-print" data-page-w={w} data-page-h={h}>
      <style>{`@page { size: ${pageCssSize(def.page)}; margin: 0; }
@media print {
  body * { visibility: hidden !important; }
  .report-print, .report-print * { visibility: visible !important; }
  .report-print { position: absolute; left: 0; top: 0; }
  .report-sheet { margin: 0 !important; box-shadow: none !important; page-break-after: always; break-after: page; transform: none !important; width: ${w}mm !important; height: ${h}mm !important; }
  .report-sheet:last-of-type { break-after: auto; page-break-after: auto; }
  .report-sheet-inner { transform: scale(${ps}) !important; }
}`}</style>
      {pages.map((p, i) => {
        const o = offset;
        offset += p.length;
        return (
          <div
            key={i}
            className="report-sheet"
            style={{
              width: `${w * mmToPx * scale}px`,
              height: `${h * mmToPx * scale}px`,
              margin: "0 auto 16px",
              boxShadow: "0 1px 6px rgba(0,0,0,.25)",
              background: "#fff",
              overflow: "hidden",
            }}
          >
            <div className="report-sheet-inner" style={{ transform: `scale(${scale * ps})`, transformOrigin: "top left", width: `${lay.w}mm`, height: `${lay.h}mm` }}>
              <Page def={def} info={info} rows={p} allRows={sorted} pageNumber={i + 1} totalPages={pages.length} isFirst={i === 0} isLast={i === pages.length - 1} rowOffset={o} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
