import type {
  ReportColumn,
  ReportElement,
  ReportFieldDef,
  ReportInfo,
  ReportTemplateDef,
  TextStyle,
} from "./types";

export const PAGE_SIZES_MM: Record<string, { w: number; h: number }> = {
  A3: { w: 297, h: 420 },
  A4: { w: 210, h: 297 },
  A5: { w: 148, h: 210 },
  B5: { w: 176, h: 250 },
  Letter: { w: 216, h: 279 },
  Legal: { w: 216, h: 356 },
  Folio: { w: 215, h: 330 },
};

/** sizes the browser understands by name in `@page size:`; others get explicit mm */
export const CSS_NAMED_SIZES = ["A4", "A5", "Letter", "Legal"];

export function pageDimensions(page: ReportTemplateDef["page"]) {
  let base = PAGE_SIZES_MM[page.size];
  if (page.size === "Custom") {
    base = { w: Math.max(20, page.customWidth || 210), h: Math.max(20, page.customHeight || 297) };
  }
  base = base ?? PAGE_SIZES_MM.A4;
  return page.orientation === "landscape" ? { w: base.h, h: base.w } : { ...base };
}

export function printableWidth(def: ReportTemplateDef) {
  const { w } = pageDimensions(def.page);
  return w - def.page.margins.left - def.page.margins.right;
}

/** CSS value for `@page { size: ... }` */
export function pageCssSize(page: ReportTemplateDef["page"]) {
  if (CSS_NAMED_SIZES.includes(page.size)) return `${page.size} ${page.orientation}`;
  const { w, h } = pageDimensions(page);
  return `${w}mm ${h}mm`;
}

/** print scale factor (0.5 - 1.5), default 1 */
export function printScaleOf(page: ReportTemplateDef["page"]) {
  const v = page.printScale;
  return v && v >= 50 && v <= 150 ? v / 100 : 1;
}

/** Virtual sheet size the content is laid out on; the whole sheet is then scaled by printScale. */
export function layoutDimensions(page: ReportTemplateDef["page"]) {
  const { w, h } = pageDimensions(page);
  const s = printScaleOf(page);
  return { w: w / s, h: h / s };
}

export const MARGIN_PRESETS: { name: string; label: string; m: { top: number; right: number; bottom: number; left: number } }[] = [
  { name: "normal", label: "Normal", m: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 } },
  { name: "narrow", label: "Sempit", m: { top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 } },
  { name: "moderate", label: "Sedang", m: { top: 25.4, right: 19.1, bottom: 25.4, left: 19.1 } },
  { name: "wide", label: "Lebar", m: { top: 25.4, right: 50.8, bottom: 25.4, left: 50.8 } },
  { name: "ketoko", label: "Sempit Ketoko", m: { top: 12, right: 12, bottom: 12, left: 12 } },
];

export function marginPresetName(m: ReportTemplateDef["page"]["margins"]): string | null {
  const eq = (a: number, b: number) => Math.abs(a - b) < 0.05;
  const hit = MARGIN_PRESETS.find((p) => eq(p.m.top, m.top) && eq(p.m.right, m.right) && eq(p.m.bottom, m.bottom) && eq(p.m.left, m.left));
  return hit ? hit.name : null;
}

/** Table columns as rendered: adds the auto "No" column when table.showRowNumber. */
export const ROW_NO_FIELD = "__no";
export function effectiveColumns(def: ReportTemplateDef): ReportColumn[] {
  const cols = def.table.columns;
  if (!def.table.showRowNumber) return cols;
  const no: ReportColumn = { id: "__no", field: ROW_NO_FIELD, label: "No", width: 8, align: "center", format: "text" };
  return [no, ...cols];
}

export function sortRows(def: ReportTemplateDef, rows: Record<string, unknown>[]): Record<string, unknown>[] {
  const sb = def.table.sortBy;
  if (!sb || !sb.field) return rows;
  const dir = sb.dir === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const x = a[sb.field];
    const y = b[sb.field];
    if (x == null || x === "") return y == null || y === "" ? 0 : 1;
    if (y == null || y === "") return -1;
    const nx = Number(x);
    const ny = Number(y);
    if (!Number.isNaN(nx) && !Number.isNaN(ny) && typeof x !== "object") return (nx - ny) * dir;
    return String(x).localeCompare(String(y), "id") * dir;
  });
}

let idCounter = 0;
export function newId(prefix = "el") {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${idCounter}`;
}

export const BASE_STYLE: TextStyle = { fontFamily: "Arial", fontSize: 9, align: "left", color: "#000000" };

export function textElement(partial: Partial<ReportElement> & { text: string }): ReportElement {
  return {
    id: newId(),
    type: "text",
    x: 0,
    y: 0,
    w: 80,
    h: 5,
    style: { ...BASE_STYLE },
    ...partial,
  };
}

export function columnFromField(f: ReportFieldDef, width = 30): ReportColumn {
  const numeric = f.type === "number" || f.type === "currency";
  return {
    id: newId("col"),
    field: f.key,
    label: f.label,
    width,
    align: numeric ? "right" : "left",
    format: f.type === "string" ? "text" : f.type,
    decimals: f.type === "currency" ? 2 : f.type === "number" ? 0 : undefined,
    aggregate: "none",
  };
}

/** Default layout modelled on the Ketoko printout: logo + company block left, filter block right, boxed header, plain rows. */
export function buildDefaultTemplate(fields: ReportFieldDef[], opts?: { landscape?: boolean }): ReportTemplateDef {
  const landscape = opts?.landscape ?? fields.length > 6;
  const def: ReportTemplateDef = {
    version: 1,
    page: {
      size: "A4",
      orientation: landscape ? "landscape" : "portrait",
      margins: { top: 12, right: 12, bottom: 12, left: 12 },
    },
    title: {
      height: 30,
      elements: [
        { id: newId(), type: "image", x: 0, y: 0, w: 24, h: 24, text: "{InfoReport.LogoUrl}", style: { ...BASE_STYLE } },
        textElement({ x: 27, y: 0, w: 110, h: 7, text: "{InfoFilter.NamaLaporan}", style: { ...BASE_STYLE, fontSize: 13, bold: true } }),
        textElement({ x: 27, y: 8, w: 110, h: 6, text: "{InfoReport.NamaPerusahaan}", style: { ...BASE_STYLE, fontSize: 11, bold: true } }),
        textElement({ x: 27, y: 14, w: 110, h: 5, text: "{InfoReport.Alamat1}" }),
        textElement({ x: 27, y: 19, w: 110, h: 5, text: "{InfoReport.Alamat2}" }),
        textElement({ x: 27, y: 24, w: 110, h: 5, text: "{InfoReport.Telepon}" }),
        textElement({ x: landscape ? 200 : 130, y: 0, w: 60, h: 5, text: "Tanggal : {Tanggal}" }),
        textElement({ x: landscape ? 200 : 130, y: 5, w: 60, h: 5, text: "User : {UserLogin}" }),
      ],
    },
    table: {
      columns: fields.map((f) => columnFromField(f, f.type === "string" ? 30 : f.type === "currency" ? 30 : f.type === "number" ? 20 : 22)),
      headerStyle: { ...BASE_STYLE, bold: true, fontSize: 9.5 },
      rowStyle: { ...BASE_STYLE },
      rowHeight: 5.2,
      headerHeight: 7,
      zebra: false,
      showSummary: fields.some((f) => f.type === "currency"),
      summaryLabel: "Total",
    },
    footer: {
      show: true,
      height: 8,
      elements: [
        textElement({ x: 0, y: 2, w: 60, h: 5, text: "{InfoReport.NamaPerusahaan}", style: { ...BASE_STYLE, fontSize: 8, color: "#666666" } }),
        textElement({ x: landscape ? 220 : 140, y: 2, w: 40, h: 5, text: "Halaman {PageNumber} / {TotalPages}", style: { ...BASE_STYLE, fontSize: 8, align: "right", color: "#666666" } }),
      ],
    },
  };
  return def;
}

// ─── Placeholder + value formatting ────────────────────────────────────

export interface PlaceholderCtx {
  info: ReportInfo;
  pageNumber?: number;
  totalPages?: number;
}

function fmtDate(v: unknown, withTime = false) {
  if (v == null || v === "") return "";
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return String(v);
  return withTime
    ? d.toLocaleString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function resolvePlaceholders(text: string, ctx: PlaceholderCtx): string {
  return text.replace(/\{([A-Za-z0-9_.\- ]+)\}/g, (whole, path: string) => {
    if (path === "PageNumber") return String(ctx.pageNumber ?? 1);
    if (path === "TotalPages") return String(ctx.totalPages ?? 1);
    if (path === "Tanggal") return fmtDate(ctx.info.Tanggal, true);
    if (path === "TanggalCetak") return fmtDate(ctx.info.Tanggal, false);
    if (path === "JamCetak") {
      const t = new Date(ctx.info.Tanggal);
      return Number.isNaN(t.getTime()) ? "" : t.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    }
    if (path === "UserLogin") return ctx.info.UserLogin ?? "";
    const parts = path.split(".");
    let cur: unknown = ctx.info;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) cur = (cur as Record<string, unknown>)[p];
      else return "";
    }
    return cur == null ? "" : String(cur);
  });
}

export function formatCell(value: unknown, col: Pick<ReportColumn, "format" | "decimals">): string {
  if (value == null || value === "") return "";
  switch (col.format) {
    case "number":
    case "currency": {
      const n = Number(value);
      if (Number.isNaN(n)) return String(value);
      const d = col.decimals ?? (col.format === "currency" ? 2 : 0);
      return n.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });
    }
    case "date":
      return fmtDate(value);
    case "datetime":
      return fmtDate(value, true);
    default:
      return String(value);
  }
}

export function encodeParams(params: Record<string, unknown>): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(params))));
}
export function decodeParams(s: string | null): Record<string, unknown> {
  if (!s) return {};
  try {
    return JSON.parse(decodeURIComponent(escape(atob(s))));
  } catch {
    return {};
  }
}
