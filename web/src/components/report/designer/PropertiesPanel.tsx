"use client";

import type { ReactNode } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";
import type { ReportColumn, ReportFieldDef, TextStyle } from "@/lib/report/types";
import { findElement, type DesignerApi } from "./useDesignerState";
import { FONT_FAMILIES, FONT_SIZES, Field, NumInput, PAGE_SIZE_OPTIONS, inputCls } from "./ui";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-gray-200 p-2">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#1e4d8f]">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Toggle({ on, onClick, children }: { on?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded border ${on ? "border-blue-400 bg-blue-100 text-blue-900" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
    >
      {children}
    </button>
  );
}

function StyleForm({ style, apply }: { style: TextStyle; apply: (p: Partial<TextStyle>) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Font">
          <select className={inputCls} value={style.fontFamily ?? "Arial"} onChange={(e) => apply({ fontFamily: e.target.value })}>
            {FONT_FAMILIES.map((f) => <option key={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Ukuran (pt)">
          <select className={inputCls} value={style.fontSize} onChange={(e) => apply({ fontSize: Number(e.target.value) })}>
            {(FONT_SIZES.includes(style.fontSize) ? FONT_SIZES : [...FONT_SIZES, style.fontSize].sort((a, b) => a - b)).map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <div className="flex items-center gap-1">
        <Toggle on={style.bold} onClick={() => apply({ bold: !style.bold })}><Bold size={13} /></Toggle>
        <Toggle on={style.italic} onClick={() => apply({ italic: !style.italic })}><Italic size={13} /></Toggle>
        <Toggle on={style.underline} onClick={() => apply({ underline: !style.underline })}><Underline size={13} /></Toggle>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <Toggle on={style.align === "left"} onClick={() => apply({ align: "left" })}><AlignLeft size={13} /></Toggle>
        <Toggle on={style.align === "center"} onClick={() => apply({ align: "center" })}><AlignCenter size={13} /></Toggle>
        <Toggle on={style.align === "right"} onClick={() => apply({ align: "right" })}><AlignRight size={13} /></Toggle>
        <input type="color" value={style.color || "#000000"} onChange={(e) => apply({ color: e.target.value })} className="ml-1 h-7 w-8 cursor-pointer rounded border border-gray-300 p-0" />
      </div>
    </>
  );
}

export function PropertiesPanel({ d, fields }: { d: DesignerApi; fields: ReportFieldDef[] }) {
  const def = d.def;
  const sel = d.sel;
  if (!def) return null;

  if (sel.type === "el") {
    const f = findElement(def, sel.ids[0]);
    if (!f) return <div className="p-3 text-xs text-gray-500">Elemen tidak ditemukan.</div>;
    const el = f.el;
    const id = el.id;
    const set = (fn: (e: typeof el) => void, key?: string) =>
      d.mutate((x) => {
        const t = findElement(x, id);
        if (t) fn(t.el);
      }, key);
    return (
      <div>
        <Section title={`Elemen ${el.type === "text" ? "Teks" : el.type === "image" ? "Gambar" : "Garis"} (${f.band === "title" ? "Title" : "Footer"})${sel.ids.length > 1 ? ` +${sel.ids.length - 1}` : ""}`}>
          {el.type === "text" && (
            <Field label="Teks (boleh {Placeholder})">
              <textarea rows={4} className="w-full rounded border border-gray-300 p-1.5 text-xs" value={el.text ?? ""} onChange={(e) => set((t) => { t.text = e.target.value; }, `text${id}`)} />
            </Field>
          )}
          {el.type === "image" && (
            <Field label="URL gambar / {InfoReport.LogoUrl}">
              <input className={inputCls} value={el.text ?? ""} onChange={(e) => set((t) => { t.text = e.target.value; }, `text${id}`)} />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Field label="X (mm)"><NumInput step={0.5} value={el.x} onChange={(v) => set((t) => { t.x = v; }, `x${id}`)} /></Field>
            <Field label="Y (mm)"><NumInput step={0.5} value={el.y} onChange={(v) => set((t) => { t.y = v; }, `y${id}`)} /></Field>
            <Field label="Lebar (mm)"><NumInput step={0.5} min={1} value={el.w} onChange={(v) => set((t) => { t.w = v; }, `w${id}`)} /></Field>
            <Field label="Tinggi (mm)"><NumInput step={0.5} min={0} value={el.h} onChange={(v) => set((t) => { t.h = v; }, `h${id}`)} /></Field>
          </div>
        </Section>
        {el.type === "text" && (
          <Section title="Gaya">
            <StyleForm style={el.style} apply={d.applyStyle} />
          </Section>
        )}
        {el.type === "line" && (
          <Section title="Warna garis">
            <input type="color" value={el.style.color || "#000000"} onChange={(e) => d.applyStyle({ color: e.target.value })} className="h-7 w-10 cursor-pointer rounded border border-gray-300 p-0" />
          </Section>
        )}
        <div className="p-2">
          <button type="button" onClick={d.deleteSelected} className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Hapus elemen</button>
        </div>
      </div>
    );
  }

  if (sel.type === "col") {
    const col = def.table.columns.find((c) => c.id === sel.id);
    if (!col) return <div className="p-3 text-xs text-gray-500">Kolom tidak ditemukan.</div>;
    const set = (fn: (c: ReportColumn) => void, key?: string) =>
      d.mutate((x) => {
        const t = x.table.columns.find((c) => c.id === col.id);
        if (t) fn(t);
      }, key);
    const numeric = col.format === "number" || col.format === "currency";
    return (
      <div>
        <Section title="Kolom">
          <Field label="Label header"><input className={inputCls} value={col.label} onChange={(e) => set((c) => { c.label = e.target.value; }, `label${col.id}`)} /></Field>
          <Field label="Field data">
            <select
              className={inputCls}
              value={col.field}
              onChange={(e) => {
                const nf = fields.find((x) => x.key === e.target.value);
                set((c) => {
                  c.field = e.target.value;
                  if (nf) {
                    c.format = nf.type === "string" ? "text" : nf.type;
                    if (nf.type === "currency") c.decimals = 2;
                    if (nf.type === "number") c.decimals = 0;
                  }
                });
              }}
            >
              {!fields.some((x) => x.key === col.field) && <option value={col.field}>{col.field}</option>}
              {fields.map((x) => <option key={x.key} value={x.key}>{x.label} ({x.key})</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Lebar (bobot mm)"><NumInput min={5} step={1} value={col.width} onChange={(v) => set((c) => { c.width = v; }, `cw${col.id}`)} /></Field>
            <Field label="Rata">
              <select className={inputCls} value={col.align} onChange={(e) => set((c) => { c.align = e.target.value as typeof c.align; })}>
                <option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option>
              </select>
            </Field>
            <Field label="Format">
              <select className={inputCls} value={col.format} onChange={(e) => set((c) => { c.format = e.target.value as typeof c.format; })}>
                <option value="text">Teks</option><option value="number">Angka</option><option value="currency">Mata uang</option>
                <option value="date">Tanggal</option><option value="datetime">Tanggal &amp; jam</option>
              </select>
            </Field>
            <Field label="Desimal"><NumInput min={0} max={6} disabled={!numeric} value={col.decimals ?? 0} onChange={(v) => set((c) => { c.decimals = v; }, `dec${col.id}`)} /></Field>
          </div>
          <Field label="Agregat (baris total)">
            <select className={inputCls} value={col.aggregate ?? "none"} onChange={(e) => set((c) => { c.aggregate = e.target.value as "none" | "sum"; })}>
              <option value="none">Tidak ada</option><option value="sum">Jumlah (Sum)</option>
            </select>
          </Field>
        </Section>
        <Section title={sel.part === "header" ? "Gaya header (semua kolom)" : "Gaya baris (semua kolom)"}>
          <StyleForm style={sel.part === "header" ? def.table.headerStyle : def.table.rowStyle} apply={d.applyStyle} />
        </Section>
        <div className="p-2">
          <button type="button" onClick={d.deleteSelected} className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Hapus kolom</button>
        </div>
      </div>
    );
  }

  // page / band / nothing
  return (
    <div>
      {sel.type === "band" && (
        <Section title={sel.band === "title" ? "Title Band" : "Footer Band"}>
          {sel.band === "title" ? (
            <Field label="Tinggi (mm)"><NumInput min={5} value={def.title.height} onChange={(v) => d.mutate((x) => { x.title.height = v; }, "titleh")} /></Field>
          ) : (
            <>
              <label className="flex items-center gap-1.5 text-xs text-gray-700">
                <input type="checkbox" checked={def.footer.show} onChange={(e) => d.mutate((x) => { x.footer.show = e.target.checked; })} /> Tampilkan footer
              </label>
              <Field label="Tinggi (mm)"><NumInput min={3} value={def.footer.height} onChange={(v) => d.mutate((x) => { x.footer.height = v; }, "footerh")} /></Field>
            </>
          )}
        </Section>
      )}
      <Section title="Halaman">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Ukuran">
            <select className={inputCls} value={def.page.size} onChange={(e) => d.mutate((x) => { x.page.size = e.target.value as typeof def.page.size; })}>
              {PAGE_SIZE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Orientasi">
            <select className={inputCls} value={def.page.orientation} onChange={(e) => d.mutate((x) => { x.page.orientation = e.target.value as typeof def.page.orientation; })}>
              <option value="portrait">Portrait</option><option value="landscape">Landscape</option>
            </select>
          </Field>
          {(["top", "right", "bottom", "left"] as const).map((k) => (
            <Field key={k} label={`Margin ${{ top: "atas", right: "kanan", bottom: "bawah", left: "kiri" }[k]} (mm)`}>
              <NumInput min={0} max={60} value={def.page.margins[k]} onChange={(v) => d.mutate((x) => { x.page.margins[k] = v; }, `m${k}`)} />
            </Field>
          ))}
        </div>
      </Section>
      <Section title="Tabel">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Tinggi baris"><NumInput min={2} step={0.1} value={def.table.rowHeight} onChange={(v) => d.mutate((x) => { x.table.rowHeight = v; }, "rowh")} /></Field>
          <Field label="Tinggi header"><NumInput min={3} step={0.1} value={def.table.headerHeight} onChange={(v) => d.mutate((x) => { x.table.headerHeight = v; }, "headh")} /></Field>
        </div>
      </Section>
    </div>
  );
}
