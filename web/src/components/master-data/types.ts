import type { ReactNode } from "react";
import type { KOption } from "@/components/kform";

export type FieldType = "text" | "number" | "textarea" | "select" | "checkbox" | "radio" | "date" | "custom";

export type Values = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  options?: KOption[];
  /** Load select options from an API endpoint (rows are PascalCase). */
  optionsFrom?: { endpoint: string; label: (row: any) => string }; // eslint-disable-line @typescript-eslint/no-explicit-any
  required?: boolean;
  hint?: ReactNode;
  placeholder?: string;
  /** Not accepted by the current API DTO: kept in state only, never sent. */
  local?: boolean;
  /** Span both columns. */
  full?: boolean;
  caption?: string;
  rows?: number;
  inline?: boolean;
  /** Custom renderer (type "custom"). */
  render?: (values: Values, set: (patch: Values) => void) => ReactNode;
}

export interface SectionDef {
  /** Tab label (shown as a tab strip when the form has more than one section). */
  title: string;
  fields: FieldDef[];
  /** Info callout shown at the top of the section. */
  note?: ReactNode;
}

export interface ListColumn {
  key: string;
  label: string;
  width?: string | number;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: any) => ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Field server untuk Urut Berdasar / klik header; false = tidak bisa diurutkan. */
  sortKey?: string | false;
}

export interface EntityConfig {
  /** Header / messages: "Jenis", "Merek" ... */
  singular: string;
  plural: string;
  basePath: string;
  /** API endpoint; omit when the backend has no module for this entity yet. */
  endpoint?: string;
  /** Fields the server does not persist for this entity yet (for the info banner). */
  backendGap?: string[];
  hasCode?: boolean;
  codePrefix: string;
  codeKey?: "Code" | "code";
  codeLabel?: string;
  /** Kode diketik user (Ketoko: Jenis/Merek/Satuan/Gudang/Bank); kosong = Auto kecuali codeRequired. */
  codeEditable?: boolean;
  codeRequired?: boolean;
  /** Judul halaman form (default "Tambah/Edit <singular>"). */
  formTitle?: (isNew: boolean) => string;
  searchFields: string[];
  searchPlaceholder?: string;
  include?: string;
  columns: ListColumn[];
  sections: SectionDef[];
  defaults: Values;
  fromRow: (row: any) => Values; // eslint-disable-line @typescript-eslint/no-explicit-any
  toPayload: (v: Values) => Record<string, unknown>;
  /** Extra validation: returns key -> message. */
  validate?: (v: Values) => Record<string, string>;
  /** Column header hint of the help text at the top of the form. */
  intro?: ReactNode;
  /** Pilihan "Urut Berdasar" (default: semua kolom). */
  sortOptions?: { value: string; label: string }[];
  defaultSort?: string;
  /** Optional extra filter dropdowns on the list. */
  filters?: { key: string; label: string; options: { value: string; label: string }[]; where: (val: string) => Record<string, unknown> }[];
}
