"use client";

import type { CSSProperties } from "react";
import type { ReportElement, ReportInfo, ReportTemplateDef, TextStyle } from "@/lib/report/types";
import { formatCell, pageDimensions, printableWidth, resolvePlaceholders } from "@/lib/report/template";

export function textStyleToCss(s: TextStyle): CSSProperties {
  return {
    fontFamily: s.fontFamily || "Arial, Helvetica, sans-serif",
    fontSize: `${s.fontSize}pt`,
    fontWeight: s.bold ? 700 : 400,
    fontStyle: s.italic ? "italic" : "normal",
    textDecoration: s.underline ? "underline" : "none",
    textAlign: s.align,
    color: s.color || "#000",
  };
}

export function ElementView({ el, info, pageNumber, totalPages }: { el: ReportElement; info: ReportInfo; pageNumber?: number; totalPages?: number }) {
  const box: CSSProperties = { position: "absolute", left: `${el.x}mm`, top: `${el.y}mm`, width: `${el.w}mm`, height: `${el.h}mm`, overflow: "hidden" };
  if (el.type === "line") {
    return <div style={{ ...box, height: 0, borderTop: `0.3mm solid ${el.style.color || "#000"}` }} />;
  }
  const value = resolvePlaceholders(el.text ?? "", { info, pageNumber, totalPages });
  if (el.type === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return value ? <img src={value} alt="" style={{ ...box, objectFit: "contain" }} /> : <div style={box} />;
  }
  return <div style={{ ...box, ...textStyleToCss(el.style), lineHeight: 1.25, whiteSpace: "pre-wrap" }}>{value}</div>;
}

export interface PaginatedLayout {
  pages: Record<string, unknown>[][];
}

export function paginate(def: ReportTemplateDef, rows: Record<string, unknown>[]): Record<string, unknown>[][] {
  const { h } = pageDimensions(def.page);
  const m = def.page.margins;
  const usable = h - m.top - m.bottom - (def.footer.show ? def.footer.height : 0);
  const perFirst = Math.max(1, Math.floor((usable - def.title.height - def.table.headerHeight) / def.table.rowHeight));
  const perOther = Math.max(1, Math.floor((usable - def.table.headerHeight) / def.table.rowHeight));

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
  def, info, rows, pageNumber, totalPages, allRows, isFirst, isLast,
}: {
  def: ReportTemplateDef; info: ReportInfo; rows: Record<string, unknown>[]; pageNumber: number; totalPages: number;
  allRows: Record<string, unknown>[]; isFirst: boolean; isLast: boolean;
}) {
  const { w, h } = pageDimensions(def.page);
  const m = def.page.margins;
  const pw = printableWidth(def);
  const cols = def.table.columns;
  const totalWeight = cols.reduce((s, c) => s + c.width, 0) || 1;
  const widthOf = (c: (typeof cols)[number]) => `${(c.width / totalWeight) * pw}mm`;

  const cell = (style: TextStyle, align: string, height: number): CSSProperties => ({
    ...textStyleToCss(style),
    textAlign: align as CSSProperties["textAlign"],
    height: `${height}mm`,
    lineHeight: `${height}mm`,
    padding: "0 1mm",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    boxSizing: "border-box",
  });

  const sums = def.table.showSummary
    ? cols.map((c) => (c.aggregate === "sum" ? allRows.reduce((s, r) => s + (Number(r[c.field]) || 0), 0) : null))
    : [];

  return (
    <div
      className="report-page"
      style={{ width: `${w}mm`, height: `${h}mm`, position: "relative", background: "#fff", boxSizing: "border-box", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", left: `${m.left}mm`, top: `${m.top}mm`, width: `${pw}mm` }}>
        {isFirst && (
          <div style={{ position: "relative", height: `${def.title.height}mm` }}>
            {def.title.elements.map((el) => (
              <ElementView key={el.id} el={el} info={info} pageNumber={pageNumber} totalPages={totalPages} />
            ))}
          </div>
        )}
        <div style={{ display: "flex", borderTop: "0.3mm solid #000", borderBottom: "0.3mm solid #000" }}>
          {cols.map((c) => (
            <div key={c.id} style={{ width: widthOf(c), flex: "none", ...cell(def.table.headerStyle, c.align, def.table.headerHeight) }}>
              {c.label}
            </div>
          ))}
        </div>
        {rows.map((r, ri) => (
          <div key={ri} style={{ display: "flex", background: def.table.zebra && ri % 2 === 1 ? "#f3f4f6" : undefined }}>
            {cols.map((c) => (
              <div key={c.id} style={{ width: widthOf(c), flex: "none", ...cell(def.table.rowStyle, c.align, def.table.rowHeight) }}>
                {formatCell(r[c.field], c)}
              </div>
            ))}
          </div>
        ))}
        {isLast && def.table.showSummary && sums.some((s) => s !== null) && (
          <div style={{ display: "flex", borderTop: "0.3mm solid #000" }}>
            {cols.map((c, i) => (
              <div key={c.id} style={{ width: widthOf(c), flex: "none", ...cell({ ...def.table.rowStyle, bold: true }, c.align, def.table.rowHeight) }}>
                {sums[i] !== null && sums[i] !== undefined ? formatCell(sums[i], c) : i === 0 ? def.table.summaryLabel : ""}
              </div>
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

/** Renders every page of a report as stacked A4-like sheets. `className="report-sheet"` wrappers are print-friendly (see globals `.report-print`). */
export function ReportPaper({
  def, info, rows, scale = 1,
}: { def: ReportTemplateDef; info: ReportInfo; rows: Record<string, unknown>[]; scale?: number }) {
  const pages = paginate(def, rows);
  const { w, h } = pageDimensions(def.page);
  const mmToPx = 96 / 25.4;
  return (
    <div className="report-print" data-page-w={w} data-page-h={h}>
      <style>{`@page { size: ${def.page.size} ${def.page.orientation}; margin: 0; }
@media print {
  body * { visibility: hidden !important; }
  .report-print, .report-print * { visibility: visible !important; }
  .report-print { position: absolute; left: 0; top: 0; }
  .report-sheet { margin: 0 !important; box-shadow: none !important; page-break-after: always; break-after: page; transform: none !important; width: ${w}mm !important; height: ${h}mm !important; }
  .report-sheet:last-of-type { break-after: auto; page-break-after: auto; }
  .report-sheet-inner { transform: none !important; }
}`}</style>
      {pages.map((p, i) => (
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
          <div className="report-sheet-inner" style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: `${w}mm`, height: `${h}mm` }}>
            <Page def={def} info={info} rows={p} allRows={rows} pageNumber={i + 1} totalPages={pages.length} isFirst={i === 0} isLast={i === pages.length - 1} />
          </div>
        </div>
      ))}
    </div>
  );
}
