"use client";

import type { DesignerApi } from "./useDesignerState";

function Row({ label, depth, active, onClick }: { label: string; depth: number; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ paddingLeft: 8 + depth * 14 }}
      className={`block w-full truncate py-0.5 pr-2 text-left text-xs ${active ? "bg-blue-100 text-blue-900" : "text-gray-700 hover:bg-gray-100"}`}
    >
      {label}
    </button>
  );
}

function elLabel(e: { type: string; text?: string }) {
  const t = (e.text ?? "").replace(/\s+/g, " ").slice(0, 26);
  return `${e.type === "text" ? "Text" : e.type === "image" ? "Image" : "Line"}${t ? `: ${t}` : ""}`;
}

export function ReportTree({ d }: { d: DesignerApi }) {
  const def = d.def;
  if (!def) return null;
  const s = d.sel;
  const elActive = (id: string) => s.type === "el" && s.ids.includes(id);
  return (
    <div className="py-1">
      <Row label="Page1" depth={0} active={s.type === "page"} onClick={() => d.setSel({ type: "page" })} />
      <Row label="ReportTitleBand1" depth={1} active={s.type === "band" && s.band === "title"} onClick={() => d.setSel({ type: "band", band: "title" })} />
      {def.title.elements.map((e) => (
        <Row key={e.id} label={elLabel(e)} depth={2} active={elActive(e.id)} onClick={() => d.setSel({ type: "el", ids: [e.id] })} />
      ))}
      <Row label="HeaderBand1" depth={1} onClick={() => d.setBand("table")} />
      <Row label="DataBand1; Data Source: Data_Laporan" depth={1} onClick={() => d.setBand("table")} />
      {def.table.columns.map((c) => (
        <Row key={c.id} label={`${c.label} {Data.${c.field}}`} depth={2} active={s.type === "col" && s.id === c.id} onClick={() => d.setSel({ type: "col", id: c.id, part: "header" })} />
      ))}
      <Row label={`FooterBand1${def.footer.show ? "" : " (disembunyikan)"}`} depth={1} active={s.type === "band" && s.band === "footer"} onClick={() => d.setSel({ type: "band", band: "footer" })} />
      {def.footer.elements.map((e) => (
        <Row key={e.id} label={elLabel(e)} depth={2} active={elActive(e.id)} onClick={() => d.setSel({ type: "el", ids: [e.id] })} />
      ))}
    </div>
  );
}
