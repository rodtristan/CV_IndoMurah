"use client";

import { useState, type ReactNode } from "react";
import {
  AlignCenter, AlignLeft, AlignRight, Bold, ClipboardPaste, Columns, Copy, FileDown, Hash, Image as ImageIcon,
  Italic, Minus, Printer, Redo2, RefreshCw, Save, Scissors, Star, Trash2, Type, Underline, Undo2, X, ZoomIn, ZoomOut,
} from "lucide-react";
import type { ReportFieldDef } from "@/lib/report/types";
import type { DesignerApi } from "./useDesignerState";
import { FONT_FAMILIES, FONT_SIZES, NumInput, PAGE_SIZE_OPTIONS, inputCls } from "./ui";

export type RibbonTab = "File" | "Home" | "Insert" | "Page" | "Layout" | "Preview";
const TABS: RibbonTab[] = ["File", "Home", "Insert", "Page", "Layout", "Preview"];

export interface RibbonProps {
  d: DesignerApi;
  fields: ReportFieldDef[];
  tab: RibbonTab;
  setTab: (t: RibbonTab) => void;
  zoom: number;
  setZoom: (z: number) => void;
  busy: boolean;
  onSave: () => void;
  onSaveAs: () => void;
  onSetDefault: () => void;
  onClose: () => void;
  onPrint: () => void;
  onRefreshPreview: () => void;
}

function RBtn({
  icon, label, onClick, active, disabled, title,
}: { icon: ReactNode; label?: string; onClick: () => void; active?: boolean; disabled?: boolean; title?: string }) {
  return (
    <button
      type="button"
      title={title ?? label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex min-w-[44px] flex-col items-center justify-center gap-0.5 rounded px-1.5 py-1 text-[11px] transition-colors disabled:opacity-40 ${
        active ? "bg-blue-200 text-blue-900" : "text-gray-800 hover:bg-blue-100"
      }`}
    >
      {icon}
      {label && <span className="leading-none">{label}</span>}
    </button>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col border-r border-blue-200 px-2 last:border-r-0">
      <div className="flex flex-1 items-center gap-1">{children}</div>
      <div className="pt-0.5 text-center text-[10px] text-gray-500">{title}</div>
    </div>
  );
}

const sm = { size: 16 } as const;

export function Ribbon(p: RibbonProps) {
  const { d, tab, setTab } = p;
  const def = d.def;
  const [fieldKey, setFieldKey] = useState("");
  const style = d.currentStyle;
  const hasStyleTarget = d.sel.type === "el" || d.sel.type === "col";

  return (
    <div className="shrink-0 select-none print:hidden">
      <div className="flex items-end gap-0.5 bg-[#1e4d8f] px-2 pt-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-t px-4 py-1.5 text-xs font-medium ${tab === t ? "bg-[#eaf0f9] text-[#1e4d8f]" : "text-white/90 hover:bg-white/15"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex h-[74px] items-stretch overflow-x-auto border-b border-blue-300 bg-[#eaf0f9] px-1 py-1">
        {tab === "File" && (
          <Group title="Template">
            <RBtn icon={<Save {...sm} />} label="Simpan" onClick={p.onSave} disabled={p.busy} title="Simpan (Ctrl+S)" />
            <RBtn icon={<FileDown {...sm} />} label="Simpan Sebagai" onClick={p.onSaveAs} disabled={p.busy} />
            <RBtn icon={<Star {...sm} />} label="Set Default" onClick={p.onSetDefault} disabled={p.busy} title="Setel sebagai default" />
            <RBtn icon={<X {...sm} />} label="Tutup" onClick={p.onClose} />
          </Group>
        )}

        {tab === "Home" && (
          <>
            <Group title="Riwayat">
              <RBtn icon={<Undo2 {...sm} />} label="Undo" onClick={d.undo} disabled={!d.canUndo} title="Undo (Ctrl+Z)" />
              <RBtn icon={<Redo2 {...sm} />} label="Redo" onClick={d.redo} disabled={!d.canRedo} title="Redo (Ctrl+Y)" />
            </Group>
            <Group title="Clipboard">
              <RBtn icon={<Scissors {...sm} />} label="Cut" onClick={d.cutSelected} disabled={!hasStyleTarget} />
              <RBtn icon={<Copy {...sm} />} label="Copy" onClick={() => d.copySelected()} disabled={!hasStyleTarget} />
              <RBtn icon={<ClipboardPaste {...sm} />} label="Paste" onClick={d.paste} />
              <RBtn icon={<Trash2 {...sm} />} label="Delete" onClick={d.deleteSelected} disabled={!hasStyleTarget} title="Hapus (Delete)" />
            </Group>
            <Group title="Font">
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <select
                    disabled={!style}
                    value={style?.fontFamily ?? "Arial"}
                    onChange={(e) => d.applyStyle({ fontFamily: e.target.value })}
                    className={`${inputCls} w-32`}
                  >
                    {FONT_FAMILIES.map((f) => <option key={f}>{f}</option>)}
                  </select>
                  <select
                    disabled={!style}
                    value={style?.fontSize ?? 9}
                    onChange={(e) => d.applyStyle({ fontSize: Number(e.target.value) })}
                    className={`${inputCls} w-16`}
                  >
                    {(style && !FONT_SIZES.includes(style.fontSize) ? [...FONT_SIZES, style.fontSize].sort((a, b) => a - b) : FONT_SIZES).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-0.5">
                  <RBtn icon={<Bold size={14} />} onClick={() => d.applyStyle({ bold: !style?.bold })} active={!!style?.bold} disabled={!style} title="Tebal" />
                  <RBtn icon={<Italic size={14} />} onClick={() => d.applyStyle({ italic: !style?.italic })} active={!!style?.italic} disabled={!style} title="Miring" />
                  <RBtn icon={<Underline size={14} />} onClick={() => d.applyStyle({ underline: !style?.underline })} active={!!style?.underline} disabled={!style} title="Garis bawah" />
                  <span className="mx-1 h-5 w-px bg-blue-200" />
                  <RBtn icon={<AlignLeft size={14} />} onClick={() => d.applyStyle({ align: "left" })} active={style?.align === "left"} disabled={!style} title="Rata kiri" />
                  <RBtn icon={<AlignCenter size={14} />} onClick={() => d.applyStyle({ align: "center" })} active={style?.align === "center"} disabled={!style} title="Tengah" />
                  <RBtn icon={<AlignRight size={14} />} onClick={() => d.applyStyle({ align: "right" })} active={style?.align === "right"} disabled={!style} title="Rata kanan" />
                  <span className="mx-1 h-5 w-px bg-blue-200" />
                  <label className="flex items-center gap-1 text-[11px] text-gray-700" title="Warna teks">
                    A
                    <input
                      type="color"
                      disabled={!style}
                      value={style?.color || "#000000"}
                      onChange={(e) => d.applyStyle({ color: e.target.value })}
                      className="h-6 w-7 cursor-pointer rounded border border-gray-300 p-0"
                    />
                  </label>
                </div>
              </div>
            </Group>
          </>
        )}

        {tab === "Insert" && (
          <>
            <Group title={`Komponen (${d.band === "footer" ? "Footer" : "Title"} band)`}>
              <RBtn icon={<Type {...sm} />} label="Teks" onClick={() => d.addElement("text")} />
              <RBtn icon={<ImageIcon {...sm} />} label="Gambar" onClick={() => d.addElement("image")} />
              <RBtn icon={<Minus {...sm} />} label="Garis" onClick={() => d.addElement("line")} />
              <RBtn
                icon={<Hash {...sm} />}
                label="No. Halaman"
                onClick={() => {
                  d.setBand("footer");
                  d.addElement("text", { text: "Halaman {PageNumber} / {TotalPages}", x: 0, y: 2, w: 50, h: 5 });
                }}
                title="Tambah teks nomor halaman ke Footer"
              />
            </Group>
            <Group title="Kolom Data">
              <div className="flex items-center gap-1">
                <select value={fieldKey} onChange={(e) => setFieldKey(e.target.value)} className={`${inputCls} w-44`}>
                  <option value="">-- pilih field --</option>
                  {p.fields.map((f) => <option key={f.key} value={f.key}>{f.label} ({f.key})</option>)}
                </select>
                <RBtn
                  icon={<Columns {...sm} />}
                  label="Tambah"
                  disabled={!fieldKey}
                  onClick={() => {
                    const f = p.fields.find((x) => x.key === fieldKey);
                    if (f) d.addColumn(f);
                  }}
                />
              </div>
            </Group>
          </>
        )}

        {tab === "Page" && def && (
          <>
            <Group title="Kertas">
              <div className="flex flex-col gap-1 text-[11px]">
                <select value={def.page.size} onChange={(e) => d.mutate((x) => { x.page.size = e.target.value as typeof def.page.size; })} className={`${inputCls} w-24`}>
                  {PAGE_SIZE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select value={def.page.orientation} onChange={(e) => d.mutate((x) => { x.page.orientation = e.target.value as typeof def.page.orientation; })} className={`${inputCls} w-24`}>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </Group>
            <Group title="Margin (mm)">
              <div className="grid grid-cols-4 gap-1">
                {(["top", "right", "bottom", "left"] as const).map((k) => (
                  <label key={k} className="w-14 text-[10px] text-gray-600">
                    {{ top: "Atas", right: "Kanan", bottom: "Bawah", left: "Kiri" }[k]}
                    <NumInput value={def.page.margins[k]} min={0} max={60} onChange={(v) => d.mutate((x) => { x.page.margins[k] = v; }, `margin${k}`)} />
                  </label>
                ))}
              </div>
            </Group>
            <Group title="Band (mm)">
              <label className="w-20 text-[10px] text-gray-600">
                Tinggi Title
                <NumInput value={def.title.height} min={5} max={150} onChange={(v) => d.mutate((x) => { x.title.height = v; }, "titleh")} />
              </label>
              <label className="flex items-center gap-1 text-[11px] text-gray-700">
                <input type="checkbox" checked={def.footer.show} onChange={(e) => d.mutate((x) => { x.footer.show = e.target.checked; })} />
                Footer
              </label>
              <label className="w-20 text-[10px] text-gray-600">
                Tinggi Footer
                <NumInput value={def.footer.height} min={3} max={80} disabled={!def.footer.show} onChange={(v) => d.mutate((x) => { x.footer.height = v; }, "footerh")} />
              </label>
            </Group>
          </>
        )}

        {tab === "Layout" && def && (
          <>
            <Group title="Ukuran (mm)">
              <label className="w-20 text-[10px] text-gray-600">
                Tinggi Baris
                <NumInput value={def.table.rowHeight} min={2} max={30} step={0.1} onChange={(v) => d.mutate((x) => { x.table.rowHeight = v; }, "rowh")} />
              </label>
              <label className="w-20 text-[10px] text-gray-600">
                Tinggi Header
                <NumInput value={def.table.headerHeight} min={3} max={30} step={0.1} onChange={(v) => d.mutate((x) => { x.table.headerHeight = v; }, "headh")} />
              </label>
            </Group>
            <Group title="Tampilan">
              <label className="flex items-center gap-1 text-[11px] text-gray-700">
                <input type="checkbox" checked={def.table.zebra} onChange={(e) => d.mutate((x) => { x.table.zebra = e.target.checked; })} />
                Baris zebra
              </label>
            </Group>
            <Group title="Ringkasan">
              <label className="flex items-center gap-1 text-[11px] text-gray-700">
                <input type="checkbox" checked={def.table.showSummary} onChange={(e) => d.mutate((x) => { x.table.showSummary = e.target.checked; })} />
                Baris total
              </label>
              <label className="w-28 text-[10px] text-gray-600">
                Label
                <input
                  className={inputCls}
                  value={def.table.summaryLabel}
                  onChange={(e) => d.mutate((x) => { x.table.summaryLabel = e.target.value; }, "sumlabel")}
                />
              </label>
              <span className="max-w-[170px] text-[10px] leading-tight text-gray-500">Pilih kolom, lalu atur &quot;Agregat&quot; di panel Properties.</span>
            </Group>
          </>
        )}

        {tab === "Preview" && (
          <Group title="Pratinjau">
            <RBtn icon={<Printer {...sm} />} label="Print" onClick={p.onPrint} />
            <RBtn icon={<RefreshCw {...sm} />} label="Muat Ulang" onClick={p.onRefreshPreview} />
          </Group>
        )}

        <div className="ml-auto flex items-center gap-1 self-center pr-2">
          {tab !== "Preview" && (
            <>
              <RBtn icon={<ZoomOut size={15} />} onClick={() => p.setZoom(Math.max(0.5, Math.round((p.zoom - 0.1) * 10) / 10))} title="Perkecil" />
              <span className="w-10 text-center text-xs text-gray-700">{Math.round(p.zoom * 100)}%</span>
              <RBtn icon={<ZoomIn size={15} />} onClick={() => p.setZoom(Math.min(2, Math.round((p.zoom + 0.1) * 10) / 10))} title="Perbesar" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
