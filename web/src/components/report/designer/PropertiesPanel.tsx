"use client";

import type { ReactNode } from "react";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Italic, Strikethrough, Underline } from "lucide-react";
import type { ReportColumn, ReportFieldDef, TextStyle } from "@/lib/report/types";
import { findElement, type DesignerApi } from "./useDesignerState";
import { FONT_FAMILIES, FONT_SIZES, LINE_SPACINGS, Field, NumInput, PAGE_SIZE_LABEL, PAGE_SIZE_OPTIONS, inputCls } from "./ui";
import { ImageUpload } from "./ImageUpload";
import { pageDimensions } from "@/lib/report/template";
import { setOrientation } from "./ribbon/PageTab";

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
        <Toggle on={style.strike} onClick={() => apply({ strike: !style.strike })}><Strikethrough size={13} /></Toggle>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <Toggle on={style.align === "left"} onClick={() => apply({ align: "left" })}><AlignLeft size={13} /></Toggle>
        <Toggle on={style.align === "center"} onClick={() => apply({ align: "center" })}><AlignCenter size={13} /></Toggle>
        <Toggle on={style.align === "right"} onClick={() => apply({ align: "right" })}><AlignRight size={13} /></Toggle>
        <Toggle on={style.align === "justify"} onClick={() => apply({ align: "justify" })}><AlignJustify size={13} /></Toggle>
        <input type="color" value={style.color || "#000000"} onChange={(e) => apply({ color: e.target.value })} className="ml-1 h-7 w-8 cursor-pointer rounded border border-gray-300 p-0" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Spasi baris">
          <select className={inputCls} value={style.lineHeight ?? ""} onChange={(e) => apply({ lineHeight: e.target.value ? Number(e.target.value) : undefined })}>
            <option value="">Bawaan</option>
            {LINE_SPACINGS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="Rata vertikal">
          <select className={inputCls} value={style.valign ?? ""} onChange={(e) => apply({ valign: (e.target.value || undefined) as TextStyle["valign"] })}>
            <option value="">Bawaan</option><option value="top">Atas</option><option value="middle">Tengah</option><option value="bottom">Bawah</option>
          </select>
        </Field>
      </div>
    </>
  );
}

const BAND_LABEL = { title: "Title", pageHeader: "Header halaman", footer: "Footer" } as const;

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
        <Section title={`Elemen ${el.type === "text" ? "Teks" : el.type === "image" ? "Gambar" : "Garis"} (${BAND_LABEL[f.band]})${sel.ids.length > 1 ? ` +${sel.ids.length - 1}` : ""}`}>
          {el.type === "text" && (
            <Field label="Teks (boleh {Placeholder})">
              <textarea rows={4} className="w-full rounded border border-gray-300 p-1.5 text-xs" value={el.text ?? ""} onChange={(e) => set((t) => { t.text = e.target.value; }, `text${id}`)} />
            </Field>
          )}
          {el.type === "image" && (
            <Field label="Gambar">
              <div className="mb-1 truncate text-[11px] text-gray-500" title={el.text ?? ""}>
                {(el.text ?? "").startsWith("{") ? "Logo perusahaan" : el.text ? "Gambar terunggah" : "Belum ada gambar"}
              </div>
              <ImageUpload onUploaded={(url) => set((t) => { t.text = url; }, `text${id}`)}>Ganti Gambar (Unggah File)</ImageUpload>
              <button
                type="button"
                onClick={() => set((t) => { t.text = "{InfoReport.LogoUrl}"; }, `text${id}`)}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
              >
                Pakai Logo Perusahaan
              </button>
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
        {el.type !== "line" && (
          <Section title="Border & Shading">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Warna latar">
                <div className="flex items-center gap-1">
                  <input type="color" value={el.background || "#ffffff"} onChange={(e) => set((t) => { t.background = e.target.value; }, `bg${id}`)} className="h-7 w-8 cursor-pointer rounded border border-gray-300 p-0" />
                  <button type="button" className="text-[11px] text-gray-500 underline" onClick={() => set((t) => { delete t.background; })}>hapus</button>
                </div>
              </Field>
              <Field label="Padding (mm)"><NumInput step={0.5} min={0} value={el.padding ?? 0} onChange={(v) => set((t) => { t.padding = v || undefined; }, `pad${id}`)} /></Field>
              <Field label="Border">
                <select
                  className={inputCls}
                  value={el.border ? (Object.values(el.border.sides).every(Boolean) ? "all" : "custom") : "none"}
                  onChange={(e) => {
                    const v = e.target.value;
                    set((t) => {
                      if (v === "none") delete t.border;
                      else if (v === "all") t.border = { width: t.border?.width ?? 0.3, color: t.border?.color ?? "#000000", style: t.border?.style ?? "solid", sides: { top: true, right: true, bottom: true, left: true } };
                    });
                  }}
                >
                  <option value="none">Tanpa</option><option value="all">Semua sisi</option>
                  {el.border && !Object.values(el.border.sides).every(Boolean) && <option value="custom">Sebagian (Ribbon)</option>}
                </select>
              </Field>
              <Field label="Tebal border (mm)"><NumInput step={0.1} min={0.1} disabled={!el.border} value={el.border?.width ?? 0.3} onChange={(v) => set((t) => { if (t.border) t.border.width = v; }, `bw${id}`)} /></Field>
            </div>
          </Section>
        )}
        <div className="px-2 pt-2">
          <label className="flex items-center gap-1.5 text-xs text-gray-700">
            <input type="checkbox" checked={!!el.locked} onChange={() => d.toggleLock()} /> Kunci elemen (tidak dapat digeser/dihapus)
          </label>
        </div>
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
        <Section title={sel.part === "header" ? "Gaya header (kolom ini)" : "Gaya baris (kolom ini)"}>
          <StyleForm style={d.currentStyle ?? (sel.part === "header" ? def.table.headerStyle : def.table.rowStyle)} apply={d.applyStyle} />
          <Field label="Warna latar">
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={(sel.part === "header" ? col.headerBackground : col.rowBackground) || "#ffffff"}
                onChange={(e) => d.applyShading(e.target.value)}
                className="h-7 w-8 cursor-pointer rounded border border-gray-300 p-0"
              />
              <button type="button" className="text-[11px] text-gray-500 underline" onClick={() => d.applyShading(undefined)}>hapus</button>
            </div>
          </Field>
          <button type="button" onClick={d.applyToAllColumns} className="rounded border border-blue-300 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50">Terapkan ke semua kolom</button>
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
        <Section title={sel.band === "title" ? "Title Band" : sel.band === "pageHeader" ? "Page Header Band (berulang tiap halaman)" : "Footer Band"}>
          {sel.band === "pageHeader" ? (
            <>
              <label className="flex items-center gap-1.5 text-xs text-gray-700">
                <input type="checkbox" checked={!!def.pageHeader?.show} onChange={(e) => d.mutate((x) => { x.pageHeader = { height: 15, elements: [], ...(x.pageHeader ?? {}), show: e.target.checked }; })} /> Tampilkan header halaman
              </label>
              <Field label="Tinggi (mm)"><NumInput min={3} value={def.pageHeader?.height ?? 15} onChange={(v) => d.mutate((x) => { if (x.pageHeader) x.pageHeader.height = v; }, "phh")} /></Field>
            </>
          ) : sel.band === "title" ? (
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
            <select className={inputCls} value={def.page.size} onChange={(e) => {
              const v = e.target.value as typeof def.page.size;
              d.mutate((x) => {
                if (v === "Custom" && x.page.customWidth === undefined) { x.page.customWidth = 210; x.page.customHeight = 297; }
                x.page.size = v;
              });
            }}>
              {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{PAGE_SIZE_LABEL[s] ?? s}</option>)}
            </select>
          </Field>
          <Field label="Orientasi">
            <select className={inputCls} value={def.page.orientation} onChange={(e) => setOrientation(d, e.target.value as "portrait" | "landscape")}>
              <option value="portrait">Portrait</option><option value="landscape">Landscape</option>
            </select>
          </Field>
          {def.page.size === "Custom" && (
            <>
              <Field label="Lebar kustom (mm)"><NumInput min={20} max={2000} value={pageDimensions(def.page).w} onChange={(v) => d.mutate((x) => { if (x.page.orientation === "landscape") x.page.customHeight = v; else x.page.customWidth = v; }, "cw")} /></Field>
              <Field label="Tinggi kustom (mm)"><NumInput min={20} max={2000} value={pageDimensions(def.page).h} onChange={(v) => d.mutate((x) => { if (x.page.orientation === "landscape") x.page.customWidth = v; else x.page.customHeight = v; }, "ch")} /></Field>
            </>
          )}
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
