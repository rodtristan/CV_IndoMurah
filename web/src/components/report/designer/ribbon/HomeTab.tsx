"use client";

import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, ArrowDownToLine, ArrowUpToLine, Baseline, Bold, Brush, ClipboardPaste, Copy, Eraser,
  Highlighter, Italic, MousePointerSquareDashed, PaintBucket, Redo2, Scissors, Strikethrough, Trash2, Underline, Undo2,
  Square, SquareDashed, PanelTop, PanelBottom, PanelLeft, PanelRight, ALargeSmall, ChevronsUpDown, Rows3, Type, UnfoldVertical, Columns,
} from "lucide-react";
import type { ElementBorder } from "@/lib/report/types";
import type { DesignerApi } from "../useDesignerState";
import { FONT_FAMILIES, FONT_SIZES, LINE_SPACINGS, NumInput, inputCls } from "../ui";
import { ColorMenu, Group, Menu, MenuItem, MenuLabel, MenuSep, RBtn, Sep } from "./parts";

const sm = { size: 16 } as const;
const xs = { size: 14 } as const;

const NEW_BORDER = (): ElementBorder => ({ width: 0.3, color: "#000000", style: "solid", sides: { top: false, right: false, bottom: false, left: false } });

export function HomeTab({ d }: { d: DesignerApi }) {
  const style = d.currentStyle;
  const hasTarget = d.sel.type === "el" || d.sel.type === "col";
  const isEl = d.sel.type === "el";
  const isCol = d.sel.type === "col";
  const el = d.currentEl;
  const border = el?.border;

  const growShrink = (dir: 1 | -1) => {
    if (!style) return;
    const list = [...FONT_SIZES];
    const cur = style.fontSize;
    let next = cur;
    if (dir > 0) next = list.find((s) => s > cur) ?? cur + 2;
    else next = [...list].reverse().find((s) => s < cur) ?? Math.max(4, cur - 1);
    d.applyStyle({ fontSize: next });
  };

  const setBorder = (kind: "none" | "all" | "outside" | "top" | "bottom" | "left" | "right") => {
    d.editSelected((e) => {
      if (kind === "none") { delete e.border; return; }
      const b = e.border ? { ...e.border, sides: { ...e.border.sides } } : NEW_BORDER();
      if (kind === "all" || kind === "outside") b.sides = { top: true, right: true, bottom: true, left: true };
      else b.sides[kind] = !b.sides[kind];
      e.border = b.sides.top || b.sides.right || b.sides.bottom || b.sides.left ? b : undefined;
    });
  };
  const editBorder = (fn: (b: ElementBorder) => void) => {
    d.editSelected((e) => {
      const b = e.border ?? { ...NEW_BORDER(), sides: { top: true, right: true, bottom: true, left: true } };
      fn(b);
      e.border = b;
    }, "border-prop");
  };

  const sideOn = (k: "top" | "right" | "bottom" | "left") => !!border?.sides[k];
  const allOn = !!border && border.sides.top && border.sides.right && border.sides.bottom && border.sides.left;

  return (
    <>
      <Group title="Riwayat">
        <RBtn icon={<Undo2 {...sm} />} label="Undo" onClick={d.undo} disabled={!d.canUndo} title="Urungkan (Ctrl+Z)" />
        <RBtn icon={<Redo2 {...sm} />} label="Redo" onClick={d.redo} disabled={!d.canRedo} title="Ulangi (Ctrl+Y)" />
      </Group>
      <Group title="Clipboard">
        <RBtn icon={<Scissors {...sm} />} label="Cut" onClick={d.cutSelected} disabled={!hasTarget} title="Potong (Ctrl+X)" />
        <RBtn icon={<Copy {...sm} />} label="Copy" onClick={() => d.copySelected()} disabled={!hasTarget} title="Salin (Ctrl+C)" />
        <RBtn icon={<ClipboardPaste {...sm} />} label="Paste" onClick={d.paste} title="Tempel (Ctrl+V)" />
        <RBtn icon={<Trash2 {...sm} />} label="Delete" onClick={d.deleteSelected} disabled={!hasTarget} title="Hapus (Delete)" />
        <RBtn icon={<Brush {...sm} />} label="Painter" onClick={d.togglePainter} active={d.painterOn} disabled={!hasTarget && !d.painterOn} title="Format Painter: salin format elemen/kolom terpilih, lalu klik elemen/kolom lain untuk menerapkan (Esc membatalkan)" />
      </Group>
      <Group title="Font">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <select disabled={!style} title="Jenis huruf" value={style?.fontFamily ?? "Arial"} onChange={(e) => d.applyStyle({ fontFamily: e.target.value })} className={`${inputCls} w-32`}>
              {FONT_FAMILIES.map((f) => <option key={f}>{f}</option>)}
            </select>
            <select disabled={!style} title="Ukuran huruf (pt)" value={style?.fontSize ?? 9} onChange={(e) => d.applyStyle({ fontSize: Number(e.target.value) })} className={`${inputCls} w-14`}>
              {(style && !FONT_SIZES.includes(style.fontSize) ? [...FONT_SIZES, style.fontSize].sort((a, b) => a - b) : FONT_SIZES).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <RBtn icon={<span className="text-[13px] font-bold leading-none">A<sup className="text-[8px]">▲</sup></span>} onClick={() => growShrink(1)} disabled={!style} title="Perbesar huruf" />
            <RBtn icon={<span className="text-[11px] font-bold leading-none">A<sup className="text-[8px]">▼</sup></span>} onClick={() => growShrink(-1)} disabled={!style} title="Perkecil huruf" />
          </div>
          <div className="flex items-center gap-0.5">
            <RBtn icon={<Bold {...xs} />} onClick={() => d.applyStyle({ bold: !style?.bold })} active={!!style?.bold} disabled={!style} title="Tebal (Ctrl+B)" />
            <RBtn icon={<Italic {...xs} />} onClick={() => d.applyStyle({ italic: !style?.italic })} active={!!style?.italic} disabled={!style} title="Miring (Ctrl+I)" />
            <RBtn icon={<Underline {...xs} />} onClick={() => d.applyStyle({ underline: !style?.underline })} active={!!style?.underline} disabled={!style} title="Garis bawah (Ctrl+U)" />
            <RBtn icon={<Strikethrough {...xs} />} onClick={() => d.applyStyle({ strike: !style?.strike })} active={!!style?.strike} disabled={!style} title="Coret" />
            <Sep />
            <ColorMenu icon={<Highlighter {...xs} />} title="Warna sorot teks (highlight)" value={style?.highlight} onPick={(c) => d.applyStyle({ highlight: c })} disabled={!style} />
            <ColorMenu icon={<Baseline {...xs} />} title="Warna teks" value={style?.color || "#000000"} onPick={(c) => d.applyStyle({ color: c ?? "#000000" })} noneLabel="Otomatis (hitam)" disabled={!style} />
          </div>
        </div>
      </Group>
      <Group title="Paragraf">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-0.5">
            <RBtn icon={<AlignLeft {...xs} />} onClick={() => d.applyStyle({ align: "left" })} active={style?.align === "left"} disabled={!style} title="Rata kiri" />
            <RBtn icon={<AlignCenter {...xs} />} onClick={() => d.applyStyle({ align: "center" })} active={style?.align === "center"} disabled={!style} title="Rata tengah" />
            <RBtn icon={<AlignRight {...xs} />} onClick={() => d.applyStyle({ align: "right" })} active={style?.align === "right"} disabled={!style} title="Rata kanan" />
            <RBtn icon={<AlignJustify {...xs} />} onClick={() => d.applyStyle({ align: "justify" })} active={style?.align === "justify"} disabled={!style} title="Rata kiri-kanan (justify)" />
          </div>
          <div className="flex items-center gap-0.5">
            <Menu icon={<ChevronsUpDown {...xs} />} label="Spasi" title="Spasi baris dan huruf" disabled={!style} width={190}>
              {(close) => (
                <div>
                  <MenuLabel>Spasi baris</MenuLabel>
                  {LINE_SPACINGS.map((v) => (
                    <MenuItem key={v} label={v === 1 ? "1,0" : String(v).replace(".", ",")} active={(style?.lineHeight ?? 0) === v} onClick={() => { d.applyStyle({ lineHeight: v }); close(); }} />
                  ))}
                  <MenuItem label="Bawaan" onClick={() => { d.applyStyle({ lineHeight: undefined }); close(); }} />
                  <MenuSep />
                  <MenuLabel>Spasi huruf (pt)</MenuLabel>
                  <div className="px-2 pb-1">
                    <NumInput step={0.1} min={-2} max={20} value={style?.letterSpacing ?? 0} onChange={(v) => d.applyStyle({ letterSpacing: v || undefined })} />
                  </div>
                </div>
              )}
            </Menu>
            <Menu icon={<UnfoldVertical {...xs} />} label="Vertikal" title="Rata vertikal (atas / tengah / bawah) untuk teks elemen dan sel tabel" disabled={!style} width={150}>
              {(close) => (
                <div>
                  <MenuItem icon={<ArrowUpToLine size={13} />} label="Atas" active={style?.valign === "top"} onClick={() => { d.applyStyle({ valign: "top" }); close(); }} />
                  <MenuItem icon={<Type size={13} />} label="Tengah" active={style?.valign === "middle"} onClick={() => { d.applyStyle({ valign: "middle" }); close(); }} />
                  <MenuItem icon={<ArrowDownToLine size={13} />} label="Bawah" active={style?.valign === "bottom"} onClick={() => { d.applyStyle({ valign: "bottom" }); close(); }} />
                  <MenuItem label="Bawaan" onClick={() => { d.applyStyle({ valign: undefined }); close(); }} />
                </div>
              )}
            </Menu>
          </div>
        </div>
      </Group>
      <Group title="Border & Shading">
        <Menu icon={<Square {...sm} />} label="Border" title="Border elemen (Borders and Shading)" big disabled={!isEl} width={230}>
          {() => (
            <div>
              <MenuItem icon={<SquareDashed size={13} />} label="Tanpa border" active={!border} onClick={() => setBorder("none")} />
              <MenuItem icon={<Square size={13} />} label="Semua border" active={allOn} onClick={() => setBorder("all")} />
              <MenuItem icon={<PanelTop size={13} />} label="Border atas" active={sideOn("top")} onClick={() => setBorder("top")} />
              <MenuItem icon={<PanelBottom size={13} />} label="Border bawah" active={sideOn("bottom")} onClick={() => setBorder("bottom")} />
              <MenuItem icon={<PanelLeft size={13} />} label="Border kiri" active={sideOn("left")} onClick={() => setBorder("left")} />
              <MenuItem icon={<PanelRight size={13} />} label="Border kanan" active={sideOn("right")} onClick={() => setBorder("right")} />
              <MenuItem icon={<Rows3 size={13} />} label="Border luar" onClick={() => setBorder("outside")} />
              <MenuSep />
              <div className="grid grid-cols-2 gap-2 px-2 pb-1">
                <label className="text-[10px] text-gray-500">
                  Tebal (mm)
                  <NumInput step={0.1} min={0.1} max={3} value={border?.width ?? 0.3} onChange={(v) => editBorder((b) => { b.width = v; })} />
                </label>
                <label className="text-[10px] text-gray-500">
                  Warna
                  <input type="color" value={border?.color ?? "#000000"} onChange={(e) => editBorder((b) => { b.color = e.target.value; })} className="h-7 w-full cursor-pointer rounded border border-gray-300 p-0" />
                </label>
                <label className="col-span-2 text-[10px] text-gray-500">
                  Gaya garis
                  <select className={inputCls} value={border?.style ?? "solid"} onChange={(e) => editBorder((b) => { b.style = e.target.value as "solid" | "dashed"; })}>
                    <option value="solid">Solid</option>
                    <option value="dashed">Putus-putus</option>
                  </select>
                </label>
                <label className="col-span-2 text-[10px] text-gray-500">
                  Padding dalam (mm)
                  <NumInput step={0.5} min={0} max={20} value={el?.padding ?? 0} onChange={(v) => d.editSelected((e) => { e.padding = v || undefined; }, "padding")} />
                </label>
              </div>
            </div>
          )}
        </Menu>
        <ColorMenu
          icon={<PaintBucket {...sm} />}
          label="Shading"
          title={isCol ? "Warna latar sel kolom (header/baris terpilih)" : "Warna latar elemen (Shading)"}
          big
          value={isEl ? el?.background : undefined}
          onPick={d.applyShading}
          disabled={!hasTarget}
        />
      </Group>
      <Group title="Editing">
        <RBtn icon={<MousePointerSquareDashed {...sm} />} label="Pilih Semua" onClick={d.selectAll} title="Pilih semua elemen pada band aktif (Ctrl+A)" />
        <RBtn icon={<Eraser {...sm} />} label="Hapus Format" onClick={d.clearFormat} disabled={!hasTarget} title="Hapus semua format elemen/kolom terpilih" />
        <RBtn icon={<Columns {...sm} />} label="Semua Kolom" onClick={d.applyToAllColumns} disabled={!isCol} title="Terapkan format kolom terpilih (header/baris) ke semua kolom" />
        <RBtn icon={<ALargeSmall {...sm} />} label="Duplikat" onClick={d.duplicate} disabled={!hasTarget} title="Gandakan (Ctrl+D)" />
      </Group>
    </>
  );
}
