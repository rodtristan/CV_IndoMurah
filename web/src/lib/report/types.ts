// Shared contract between the report catalog/viewer/designer (web) and the
// report-engine API (api/src/modules/report-engine). Units: mm for geometry,
// pt for font sizes.

export type FieldType = "string" | "number" | "currency" | "date" | "datetime";

export interface ReportFieldDef {
  key: string;
  label: string;
  type: FieldType;
}

export type ReportParamType = "date" | "select" | "text" | "lookup" | "checkbox";

export interface ReportParamDef {
  key: string;
  label: string;
  type: ReportParamType;
  /** static options for `select` */
  options?: { value: string; label: string }[];
  /** for `select`/`lookup`: API endpoint whose rows fill the options (uses ID + label field) */
  source?: { endpoint: string; valueField: string; labelField: string; codeField?: string };
  defaultValue?: string | boolean;
  /** `date` params flagged range => filter panel shows a "Ganti ke range tanggal" toggle: a single date means "sampai tanggal" */
  rangeWith?: string;
}

export interface ReportChartHint {
  type: "bar" | "line";
  labelField: string;
  valueFields: { key: string; label: string }[];
}

export interface ReportCatalogItem {
  key: string;
  group: string; // tab: Master, Pembelian, Penjualan, Hutang, Piutang, Persediaan, Kas, Laba/Jual, Jurnal, Keuangan, ...
  title: string;
  description: string;
  params: ReportParamDef[];
  fields: ReportFieldDef[];
  /** variants listed in the "Pilih Laporan" box on the filter page (e.g. "Laporan Hutang Beredar", "... Sudah Jatuh Tempo") */
  variants?: { key: string; title: string }[];
  /** when set, the viewer renders the rows as a chart above the table */
  chart?: ReportChartHint;
}

export interface ReportInfo {
  InfoReport: {
    NamaPerusahaan: string;
    Alamat1: string;
    Alamat2: string;
    Telepon: string;
    Fax: string;
    LogoUrl: string;
  };
  /** NamaLaporan + one entry per applied filter, keyed by param label (e.g. Item, Jenis, Supel) */
  InfoFilter: Record<string, string>;
  UserLogin: string;
  Tanggal: string; // ISO
}

export interface ReportDataResponse {
  info: ReportInfo;
  rows: Record<string, unknown>[];
}

// ─── Template definition (stored as JSON in ReportTemplates.Definition) ──────

export interface TextStyle {
  fontFamily?: string;
  fontSize: number; // pt
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  align: "left" | "center" | "right" | "justify";
  color?: string;
  /** text highlight (background) color */
  highlight?: string;
  /** unitless line-height multiplier (1, 1.15, 1.5, 2 ...) */
  lineHeight?: number;
  valign?: "top" | "middle" | "bottom";
  /** pt */
  letterSpacing?: number;
}

export interface ElementBorder {
  width: number; // mm
  color: string;
  style: "solid" | "dashed";
  sides: { top: boolean; right: boolean; bottom: boolean; left: boolean };
}

export interface ReportElement {
  id: string;
  type: "text" | "image" | "line";
  x: number; // mm, relative to the band's top-left inside the margins
  y: number;
  w: number;
  h: number;
  /** text elements: may contain {Placeholders}; image elements: url or {InfoReport.LogoUrl} */
  text?: string;
  style: TextStyle;
  /** line elements: draw vertically (uses `h` as length) instead of horizontally */
  vertical?: boolean;
  border?: ElementBorder;
  /** fill color */
  background?: string;
  /** inner padding, mm */
  padding?: number;
  /** locked elements cannot be moved, resized or deleted in the designer */
  locked?: boolean;
}

export interface ReportColumn {
  id: string;
  field: string; // key in the data rows
  label: string;
  width: number; // relative weight (mm); columns are scaled to fill the printable width
  align: "left" | "center" | "right";
  format: "text" | "number" | "currency" | "date" | "datetime";
  decimals?: number;
  aggregate?: "none" | "sum";
  /** per-column overrides merged over table.headerStyle / table.rowStyle */
  headerStyle?: Partial<TextStyle>;
  rowStyle?: Partial<TextStyle>;
  headerBackground?: string;
  rowBackground?: string;
}

export type PageSizeName = "A3" | "A4" | "A5" | "B5" | "Letter" | "Legal" | "Folio" | "Custom";

export interface PageSetup {
  size: PageSizeName;
  orientation: "portrait" | "landscape";
  margins: { top: number; right: number; bottom: number; left: number };
  /** size "Custom": portrait-base dimensions in mm (landscape swaps them) */
  customWidth?: number;
  customHeight?: number;
  watermark?: { text: string; fontSize: number; color: string; opacity: number; rotation: number };
  pageBorder?: { show: boolean; width: number; color: string };
  /** print scale in percent (50-150), default 100 */
  printScale?: number;
  /** optional cap of data rows per page */
  maxRowsPerPage?: number;
}

export type GridLines = "header" | "none" | "horizontal" | "vertical" | "all";

export interface ReportBand {
  show: boolean;
  height: number;
  elements: ReportElement[];
}

export interface ReportTemplateDef {
  version: 1;
  page: PageSetup;
  /** repeating page header, printed above everything on every page */
  pageHeader?: ReportBand;
  title: { height: number; elements: ReportElement[] };
  table: {
    columns: ReportColumn[];
    headerStyle: TextStyle;
    rowStyle: TextStyle;
    rowHeight: number; // mm
    headerHeight: number; // mm
    zebra: boolean;
    showSummary: boolean;
    summaryLabel: string;
    /** "header" (default) = only rules above/below the header row and above the summary */
    gridLines?: GridLines;
    gridColor?: string;
    gridWidth?: number; // mm
    headerBackground?: string;
    zebraColor?: string;
    cellPadding?: number; // mm (horizontal)
    summaryStyle?: Partial<TextStyle>;
    /** repeat the table header on every page (default true) */
    repeatHeader?: boolean;
    /** prepend an auto "No" column */
    showRowNumber?: boolean;
    sortBy?: { field: string; dir: "asc" | "desc" };
  };
  footer: { show: boolean; height: number; elements: ReportElement[] };
}

export interface ReportTemplateRecord {
  ID: number;
  ReportKey: string;
  Name: string;
  Definition: ReportTemplateDef;
  IsDefault: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}
