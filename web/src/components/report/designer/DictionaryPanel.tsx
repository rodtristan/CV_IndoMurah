"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Database, Folder, Hash, Variable } from "lucide-react";
import type { ReportCatalogItem, ReportFieldDef } from "@/lib/report/types";
import { findElement, type DesignerApi } from "./useDesignerState";

function Node({
  label, icon, children, defaultOpen = false,
}: { label: string; icon?: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-1 px-1 py-0.5 text-left text-xs font-medium text-gray-800 hover:bg-gray-100">
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {icon}
        <span className="truncate">{label}</span>
      </button>
      {open && <div className="ml-4 border-l border-gray-200 pl-1">{children}</div>}
    </div>
  );
}

function Leaf({
  label, hint, onClick, onDoubleClick, title,
}: { label: string; hint?: string; onClick?: () => void; onDoubleClick?: () => void; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className="flex w-full items-center justify-between gap-2 px-1.5 py-0.5 text-left text-xs text-gray-700 hover:bg-blue-50"
    >
      <span className="truncate">{label}</span>
      {hint && <span className="shrink-0 text-[10px] text-gray-400">{hint}</span>}
    </button>
  );
}

const INFO_REPORT = ["NamaPerusahaan", "Alamat1", "Alamat2", "Telepon", "Fax", "LogoUrl"];
const SYS_VARS = ["PageNumber", "TotalPages", "Tanggal", "TanggalCetak", "JamCetak", "UserLogin"];

export function DictionaryPanel({
  d, item, fields, sampleRow,
}: { d: DesignerApi; item: ReportCatalogItem | null; fields: ReportFieldDef[]; sampleRow?: Record<string, unknown> }) {
  const [msg, setMsg] = useState("");

  const insertPath = (path: string) => {
    const def = d.def;
    if (!def || d.sel.type !== "el") {
      setMsg("Pilih elemen teks pada Title/Header/Footer dahulu.");
      return;
    }
    const id = d.sel.ids[0];
    const f = findElement(def, id);
    if (!f || f.el.type === "line") {
      setMsg("Elemen terpilih tidak dapat diisi teks.");
      return;
    }
    setMsg("");
    d.mutate((x) => {
      const t = findElement(x, id);
      if (!t) return;
      const token = `{${path}}`;
      // images take the token as their whole source; text appends to its content
      t.el.text = t.el.type === "image" ? token : `${t.el.text ?? ""}${t.el.text ? " " : ""}${token}`;
    });
  };

  const fieldClick = (f: ReportFieldDef) => {
    if (d.band === "table") d.addColumn(f);
    else setMsg("Field data hanya untuk kolom (klik dua kali untuk menambah kolom).");
  };
  const fieldDbl = (f: ReportFieldDef) => {
    if (d.band !== "table") d.addColumn(f);
  };

  return (
    <div className="p-1">
      {msg && <div className="mb-1 rounded bg-amber-50 px-2 py-1 text-[11px] text-amber-800">{msg}</div>}
      <Node label="Data Sources" icon={<Database size={12} />} defaultOpen>
        <Node label="Data_Laporan" icon={<Folder size={12} />} defaultOpen>
          {fields.length === 0 && <div className="px-2 py-1 text-[11px] text-gray-400">Tidak ada field.</div>}
          {fields.map((f) => (
            <Leaf
              key={f.key}
              label={f.label}
              hint={sampleRow && sampleRow[f.key] != null ? String(sampleRow[f.key]).slice(0, 14) : f.type}
              title={`{Data.${f.key}} - klik: tambah kolom (band tabel aktif), dobel klik: tambah kolom`}
              onClick={() => fieldClick(f)}
              onDoubleClick={() => fieldDbl(f)}
            />
          ))}
        </Node>
      </Node>
      <Node label="Info" icon={<Folder size={12} />} defaultOpen>
        <Node label="InfoReport" icon={<Folder size={12} />}>
          {INFO_REPORT.map((k) => <Leaf key={k} label={k} onClick={() => insertPath(`InfoReport.${k}`)} />)}
        </Node>
        <Node label="InfoFilter" icon={<Folder size={12} />}>
          <Leaf label="NamaLaporan" onClick={() => insertPath("InfoFilter.NamaLaporan")} />
          {(item?.params ?? []).map((p) => (
            <Leaf key={p.key} label={p.label} onClick={() => insertPath(`InfoFilter.${p.label}`)} />
          ))}
        </Node>
      </Node>
      <Node label="Variables" icon={<Variable size={12} />}>
        <div className="px-2 py-1 text-[11px] text-gray-400">Tidak ada variabel.</div>
      </Node>
      <Node label="System Variables" icon={<Hash size={12} />} defaultOpen>
        {SYS_VARS.map((k) => <Leaf key={k} label={k} onClick={() => insertPath(k)} />)}
      </Node>
      <Node label="Functions" icon={<Folder size={12} />}>
        <div className="px-2 py-1 text-[11px] text-gray-400">Agregat: atur pada properti kolom.</div>
      </Node>
      <Node label="Resources" icon={<Folder size={12} />}>
        <div className="px-2 py-1 text-[11px] text-gray-400">Logo: {"{InfoReport.LogoUrl}"}</div>
      </Node>
    </div>
  );
}
