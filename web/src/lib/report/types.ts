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

export interface ReportCatalogItem {
  key: string;
  group: string; // tab: Master, Pembelian, Penjualan, Hutang, Piutang, Persediaan, Kas, Laba/Jual, Jurnal, Keuangan, ...
  title: string;
  description: string;
  params: ReportParamDef[];
  fields: ReportFieldDef[];
  /** variants listed in the "Pilih Laporan" box on the filter page (e.g. "Laporan Hutang Beredar", "... Sudah Jatuh Tempo") */
  variants?: { key: string; title: string }[];
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
  align: "left" | "center" | "right";
  color?: string;
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
}

export interface PageSetup {
  size: "A4" | "A5" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
  margins: { top: number; right: number; bottom: number; left: number };
}

export interface ReportTemplateDef {
  version: 1;
  page: PageSetup;
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
