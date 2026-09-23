"use client";

import {
  AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignHorizontalDistributeCenter, AlignStartHorizontal,
  AlignStartVertical, AlignVerticalDistributeCenter, ArrowDownToLine, ArrowUpToLine, Copy, Grid3x3, Lock, LockOpen, MoveHorizontal, MoveVertical, Paintbrush,
} from "lucide-react";
import type { GridLines, ReportFieldDef } from "@/lib/report/types";
import type { DesignerApi } from "../useDesignerState";
import { NumInput, inputCls } from "../ui";
import { BigBtn, ColorMenu, Group, Menu, MenuItem, MenuLabel, RBtn } from "./parts";

type Tbl = NonNullable<DesignerApi["def"]>["table"];
const sm = { size: 16 } as const;
const lg = { size: 24 } as const;

const GRID_LABELS: Record<GridLines, string> = {
  header: "Hanya garis header (bawaan)",
  none: "Tanpa garis",
  horizontal: "Garis horizontal",
  vertical: "Garis vertikal",
  all: "Semua garis (kisi)",
};

export function LayoutTab({ d, fields }: { d: DesignerApi; fields: ReportFieldDef[] }) {
  const def = d.def;
  if (!def) return null;
  const t = def.table;
  const set = (fn: (x: Tbl) => void, key?: string) => d.mutate((x) => fn(x.table), key);
  const isEl = d.sel.type === "el";
  const n = d.sel.type === "el" ? d.sel.ids.length : 0;
  const locked = !!d.currentEl?.locked;

  return (
    <>
      <Group title="Garis Tabel">
        <Menu icon={<Grid3x3 {...lg} />} label="Garis Kisi" title="Pilihan garis tabel" big width={230}>
          {(close) => (
            <div>
              <MenuLabel>Garis tabel</MenuLabel>
              {(Object.keys(GRID_LABELS) as GridLines[]).map((k) => (
                <MenuItem key={k} label={GRID_LABELS[k]} active={(t.gridLines ?? "header") === k} onClick={() => { set((x) => { x.gridLines = k === "header" ? undefined : k; }); close(); }} />
              ))}
            </div>
          )}
        </Menu>
        <div className="flex flex-col gap-1">
          <label className="flex items-center justify-between gap-1 text-[10px] text-gray-600" title="Warna garis tabel">
            Warna
            <input type="color" className="h-6 w-10 cursor-pointer rounded border border-gray-300 p-0" value={t.gridColor ?? "#000000"} onChange={(e) => set((x) => { x.gridColor = e.target.value; }, "gridcolor")} />
          </label>
          <label className="flex items-center justify-between gap-1 text-[10px] text-gray-600" title="Tebal garis (mm)">
            Tebal
            <span className="w-14"><NumInput min={0.1} max={2} step={0.1} value={t.gridWidth ?? 0.3} onChange={(v) => set((x) => { x.gridWidth = v; }, "gridw")} /></span>
          </label>
        </div>
      </Group>
      <Group title="Warna">
        <ColorMenu icon={<Paintbrush {...lg} />} label="Latar Header" title="Warna latar baris header" big value={t.headerBackground} onPick={(c) => set((x) => { x.headerBackground = c; })} />
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-[11px] text-gray-700" title="Warna selang-seling baris">
            <input type="checkbox" checked={t.zebra} onChange={(e) => set((x) => { x.zebra = e.target.checked; })} />
            Zebra
            <input type="color" className="h-6 w-8 cursor-pointer rounded border border-gray-300 p-0" value={t.zebraColor ?? "#f3f4f6"} onChange={(e) => set((x) => { x.zebraColor = e.target.value; x.zebra = true; }, "zebracolor")} />
          </label>
        </div>
      </Group>
      <Group title="Ukuran (mm)">
        <div className="grid grid-cols-3 gap-1">
          <label className="w-16 text-[10px] text-gray-600" title="Tinggi baris data">Baris<NumInput value={t.rowHeight} min={2} max={30} step={0.1} onChange={(v) => set((x) => { x.rowHeight = v; }, "rowh")} /></label>
          <label className="w-16 text-[10px] text-gray-600" title="Tinggi baris header">Header<NumInput value={t.headerHeight} min={3} max={30} step={0.1} onChange={(v) => set((x) => { x.headerHeight = v; }, "headh")} /></label>
          <label className="w-16 text-[10px] text-gray-600" title="Padding sel horizontal">Padding<NumInput value={t.cellPadding ?? 1} min={0} max={10} step={0.5} onChange={(v) => set((x) => { x.cellPadding = v === 1 ? undefined : v; }, "cellpad")} /></label>
        </div>
      </Group>
      <Group title="Opsi Tabel">
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-[11px] text-gray-700" title="Ulangi header tabel di setiap halaman">
            <input type="checkbox" checked={t.repeatHeader !== false} onChange={(e) => set((x) => { x.repeatHeader = e.target.checked ? undefined : false; })} />
            Ulangi header tiap halaman
          </label>
          <label className="flex items-center gap-1 text-[11px] text-gray-700" title="Tambah kolom nomor urut otomatis">
            <input type="checkbox" checked={!!t.showRowNumber} onChange={(e) => set((x) => { x.showRowNumber = e.target.checked ? true : undefined; })} />
            Nomor urut (No)
          </label>
        </div>
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-[10px] text-gray-600" title="Urutkan data sebelum dicetak">
            Urutkan
            <select className={`${inputCls} w-28`} value={t.sortBy?.field ?? ""} onChange={(e) => set((x) => { x.sortBy = e.target.value ? { field: e.target.value, dir: x.sortBy?.dir ?? "asc" } : undefined; })}>
              <option value="">(tanpa)</option>
              {fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </label>
          <select disabled={!t.sortBy} title="Arah pengurutan" className={inputCls} value={t.sortBy?.dir ?? "asc"} onChange={(e) => set((x) => { if (x.sortBy) x.sortBy.dir = e.target.value as "asc" | "desc"; })}>
            <option value="asc">Naik (A-Z, 1-9)</option>
            <option value="desc">Turun (Z-A, 9-1)</option>
          </select>
        </div>
      </Group>
      <Group title="Ringkasan">
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-[11px] text-gray-700">
            <input type="checkbox" checked={t.showSummary} onChange={(e) => set((x) => { x.showSummary = e.target.checked; })} />
            Baris total
          </label>
          <label className="flex items-center gap-1 text-[10px] text-gray-600">
            Label
            <input className={`${inputCls} w-24`} value={t.summaryLabel} onChange={(e) => set((x) => { x.summaryLabel = e.target.value; }, "sumlabel")} />
          </label>
        </div>
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-[11px] text-gray-700" title="Baris total dicetak tebal">
            <input type="checkbox" checked={t.summaryStyle?.bold !== false} onChange={(e) => set((x) => { x.summaryStyle = { ...(x.summaryStyle ?? {}), bold: e.target.checked }; })} />
            Tebal
          </label>
          <ColorMenu icon={<span className="text-[13px] font-bold leading-none">A</span>} title="Warna teks baris total" value={t.summaryStyle?.color} onPick={(c) => set((x) => { x.summaryStyle = { ...(x.summaryStyle ?? {}), color: c }; })} noneLabel="Bawaan" />
        </div>
        <span className="max-w-[120px] text-[10px] leading-tight text-gray-500">Pilih kolom, atur &quot;Agregat&quot; di Properties.</span>
      </Group>
      <Group title="Susun (Arrange)">
        <Menu icon={<AlignStartVertical {...lg} />} label="Rata" title="Ratakan elemen: satu elemen terhadap band, banyak elemen terhadap satu sama lain" big disabled={!isEl} width={210}>
          {(close) => (
            <div>
              <MenuLabel>{n > 1 ? "Rata terhadap elemen terpilih" : "Rata terhadap band"}</MenuLabel>
              <MenuItem icon={<AlignStartVertical size={13} />} label="Rata kiri" onClick={() => { d.arrange("left"); close(); }} />
              <MenuItem icon={<AlignCenterVertical size={13} />} label="Rata tengah horizontal" onClick={() => { d.arrange("center"); close(); }} />
              <MenuItem icon={<AlignEndVertical size={13} />} label="Rata kanan" onClick={() => { d.arrange("right"); close(); }} />
              <MenuItem icon={<AlignStartHorizontal size={13} />} label="Rata atas" onClick={() => { d.arrange("top"); close(); }} />
              <MenuItem icon={<AlignCenterHorizontal size={13} />} label="Rata tengah vertikal" onClick={() => { d.arrange("middle"); close(); }} />
              <MenuItem icon={<AlignEndHorizontal size={13} />} label="Rata bawah" onClick={() => { d.arrange("bottom"); close(); }} />
            </div>
          )}
        </Menu>
        <div className="grid grid-cols-2 gap-x-1">
          <RBtn icon={<AlignHorizontalDistributeCenter {...sm} />} label="Sebar H" onClick={() => d.arrange("distH")} disabled={n < 3} title="Distribusi horizontal (minimal 3 elemen)" />
          <RBtn icon={<AlignVerticalDistributeCenter {...sm} />} label="Sebar V" onClick={() => d.arrange("distV")} disabled={n < 3} title="Distribusi vertikal (minimal 3 elemen)" />
        </div>
        <div className="grid grid-cols-2 gap-x-1">
          <RBtn icon={<MoveHorizontal {...sm} />} label="Lebar =" onClick={() => d.arrange("sameW")} disabled={n < 2} title="Samakan lebar dengan elemen pertama" />
          <RBtn icon={<MoveVertical {...sm} />} label="Tinggi =" onClick={() => d.arrange("sameH")} disabled={n < 2} title="Samakan tinggi dengan elemen pertama" />
        </div>
        <div className="grid grid-cols-2 gap-x-1">
          <RBtn icon={<ArrowUpToLine {...sm} />} label="Ke Depan" onClick={() => d.zOrder("front")} disabled={!isEl} title="Bawa ke depan (urutan tumpukan)" />
          <RBtn icon={<ArrowDownToLine {...sm} />} label="Ke Belakang" onClick={() => d.zOrder("back")} disabled={!isEl} title="Kirim ke belakang (urutan tumpukan)" />
        </div>
        <BigBtn icon={locked ? <LockOpen {...lg} /> : <Lock {...lg} />} label={locked ? "Buka Kunci" : "Kunci"} active={locked} onClick={d.toggleLock} disabled={!isEl} title="Kunci/buka kunci elemen (tidak bisa digeser, diubah ukurannya, atau dihapus)" />
        <BigBtn icon={<Copy {...lg} />} label="Duplikat" onClick={d.duplicate} disabled={!(d.sel.type === "el" || d.sel.type === "col")} title="Gandakan elemen/kolom (Ctrl+D)" />
      </Group>
    </>
  );
}
