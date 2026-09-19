"use client";

import { Frame, Maximize, Ruler, Stamp } from "lucide-react";
import { MARGIN_PRESETS, marginPresetName, pageDimensions } from "@/lib/report/template";
import type { PageSizeName, ReportTemplateDef } from "@/lib/report/types";
import type { DesignerApi } from "../useDesignerState";
import { NumInput, PAGE_SIZE_LABEL, PAGE_SIZE_OPTIONS, inputCls } from "../ui";
import { BigBtn, Group, Menu, MenuItem, MenuLabel, MenuSep, PageIcon } from "./parts";
import { DateMenu, PageNumberMenu } from "./InsertTab";

const lg = { size: 24 } as const;

type Margins = ReportTemplateDef["page"]["margins"];

/** Word behaviour: rotating the page rotates the margins with it. */
export function setOrientation(d: DesignerApi, o: "portrait" | "landscape") {
  d.mutate((x) => {
    if (x.page.orientation === o) return;
    const m = x.page.margins;
    const old: Margins = { ...m };
    x.page.margins =
      o === "landscape"
        ? { top: old.left, right: old.top, bottom: old.right, left: old.bottom }
        : { top: old.right, right: old.bottom, bottom: old.left, left: old.top };
    x.page.orientation = o;
  });
}

export function PageTab({ d }: { d: DesignerApi }) {
  const def = d.def;
  if (!def) return null;
  const pg = def.page;
  const dims = pageDimensions(pg);
  const presetName = marginPresetName(pg.margins);
  const presetLabel = MARGIN_PRESETS.find((p) => p.name === presetName)?.label ?? "Kustom";
  const wm = pg.watermark;
  const pb = pg.pageBorder;
  const ph = def.pageHeader;

  const setSize = (s: PageSizeName) =>
    d.mutate((x) => {
      if (s === "Custom" && x.page.size !== "Custom") {
        // start from the current dimensions so nothing jumps
        const cur = pageDimensions(x.page);
        const portrait = x.page.orientation === "landscape" ? { w: cur.h, h: cur.w } : cur;
        x.page.customWidth = portrait.w;
        x.page.customHeight = portrait.h;
      }
      x.page.size = s;
    });
  const setMargin = (m: Margins) => d.mutate((x) => { x.page.margins = { ...m }; });
  const setWm = (patch: Partial<NonNullable<typeof wm>>) =>
    d.mutate((x) => {
      x.page.watermark = { text: "DRAFT", fontSize: 80, color: "#999999", opacity: 0.25, rotation: -45, ...(x.page.watermark ?? {}), ...patch };
    }, "watermark");
  const setPb = (patch: Partial<NonNullable<typeof pb>>) =>
    d.mutate((x) => {
      x.page.pageBorder = { show: true, width: 0.5, color: "#000000", ...(x.page.pageBorder ?? {}), ...patch };
    }, "pageborder");
  const setPh = (patch: Partial<{ show: boolean; height: number }>) =>
    d.mutate((x) => {
      x.pageHeader = { show: false, height: 15, elements: [], ...(x.pageHeader ?? {}), ...patch };
    }, "pageheader");

  return (
    <>
      <Group title="Orientasi">
        <BigBtn icon={<PageIcon />} label="Portrait" active={pg.orientation === "portrait"} onClick={() => setOrientation(d, "portrait")} title="Orientasi tegak (Portrait)" />
        <BigBtn icon={<PageIcon landscape />} label="Landscape" active={pg.orientation === "landscape"} onClick={() => setOrientation(d, "landscape")} title="Orientasi mendatar (Landscape)" />
      </Group>
      <Group title="Ukuran Kertas">
        <Menu icon={<Maximize {...lg} />} label={pg.size === "Custom" ? "Custom" : pg.size} title="Ukuran kertas" big width={240}>
          {(close) => (
            <div>
              <MenuLabel>Ukuran kertas</MenuLabel>
              {PAGE_SIZE_OPTIONS.map((s) => (
                <MenuItem key={s} label={PAGE_SIZE_LABEL[s] ?? s} active={pg.size === s} onClick={() => { setSize(s); if (s !== "Custom") close(); }} />
              ))}
              {pg.size === "Custom" && (
                <>
                  <MenuSep />
                  <div className="grid grid-cols-2 gap-2 px-2 pb-1">
                    <label className="text-[10px] text-gray-500">
                      Lebar (mm)
                      <NumInput min={20} max={2000} step={1} value={dims.w} onChange={(v) => d.mutate((x) => { if (x.page.orientation === "landscape") x.page.customHeight = v; else x.page.customWidth = v; }, "cw")} />
                    </label>
                    <label className="text-[10px] text-gray-500">
                      Tinggi (mm)
                      <NumInput min={20} max={2000} step={1} value={dims.h} onChange={(v) => d.mutate((x) => { if (x.page.orientation === "landscape") x.page.customWidth = v; else x.page.customHeight = v; }, "ch")} />
                    </label>
                  </div>
                </>
              )}
              <div className="px-2 py-1 text-[10px] text-gray-400">Sekarang: {dims.w} x {dims.h} mm</div>
            </div>
          )}
        </Menu>
      </Group>
      <Group title="Margin">
        <Menu icon={<Ruler {...lg} />} label={`Margin: ${presetLabel}`} title="Margin halaman" big width={250}>
          {(close) => (
            <div>
              <MenuLabel>Preset</MenuLabel>
              {MARGIN_PRESETS.map((p) => (
                <MenuItem
                  key={p.name}
                  label={p.label}
                  active={presetName === p.name}
                  hint={p.m.top === p.m.left ? `${p.m.top}` : `${p.m.top} / ${p.m.left}`}
                  onClick={() => { setMargin(p.m); close(); }}
                />
              ))}
              <MenuSep />
              <MenuLabel>Kustom (mm){presetName === null ? " - aktif" : ""}</MenuLabel>
              <div className="grid grid-cols-2 gap-2 px-2 pb-1">
                {(["top", "bottom", "left", "right"] as const).map((k) => (
                  <label key={k} className="text-[10px] text-gray-500">
                    {{ top: "Atas", bottom: "Bawah", left: "Kiri", right: "Kanan" }[k]}
                    <NumInput min={0} max={100} step={0.1} value={pg.margins[k]} onChange={(v) => d.mutate((x) => { x.page.margins[k] = v; }, `margin${k}`)} />
                  </label>
                ))}
              </div>
            </div>
          )}
        </Menu>
      </Group>
      <Group title="Latar Halaman">
        <Menu icon={<Stamp {...lg} />} label="Watermark" title="Watermark (teks di belakang isi, tiap halaman)" big active={!!wm?.text} width={250}>
          {(close) => (
            <div className="space-y-1.5 p-1">
              <label className="block text-[10px] text-gray-500">
                Teks
                <input className={inputCls} list="wm-presets" value={wm?.text ?? ""} placeholder="DRAFT / SALINAN" onChange={(e) => setWm({ text: e.target.value })} />
                <datalist id="wm-presets"><option value="DRAFT" /><option value="SALINAN" /><option value="RAHASIA" /><option value="LUNAS" /></datalist>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[10px] text-gray-500">Ukuran (pt)<NumInput min={10} max={400} value={wm?.fontSize ?? 80} onChange={(v) => setWm({ fontSize: v })} /></label>
                <label className="text-[10px] text-gray-500">Rotasi (derajat)<NumInput min={-180} max={180} value={wm?.rotation ?? -45} onChange={(v) => setWm({ rotation: v })} /></label>
                <label className="text-[10px] text-gray-500">Opasitas (0-1)<NumInput min={0.02} max={1} step={0.05} value={wm?.opacity ?? 0.25} onChange={(v) => setWm({ opacity: v })} /></label>
                <label className="text-[10px] text-gray-500">Warna<input type="color" className="h-7 w-full cursor-pointer rounded border border-gray-300 p-0" value={wm?.color ?? "#999999"} onChange={(e) => setWm({ color: e.target.value })} /></label>
              </div>
              <div className="flex gap-1">
                <button type="button" className="flex-1 rounded bg-[#1e4d8f] px-2 py-1 text-xs text-white" onClick={() => { if (!wm?.text) setWm({ text: "DRAFT" }); close(); }}>OK</button>
                <button type="button" className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs" onClick={() => { d.mutate((x) => { delete x.page.watermark; }); close(); }}>Hapus</button>
              </div>
            </div>
          )}
        </Menu>
        <Menu icon={<Frame {...lg} />} label="Border Halaman" title="Border di sekeliling halaman" big active={!!pb?.show} width={220}>
          {() => (
            <div className="space-y-1.5 p-1">
              <label className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" checked={!!pb?.show} onChange={(e) => setPb({ show: e.target.checked })} /> Tampilkan border halaman
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[10px] text-gray-500">Tebal (mm)<NumInput min={0.1} max={5} step={0.1} value={pb?.width ?? 0.5} onChange={(v) => setPb({ width: v })} /></label>
                <label className="text-[10px] text-gray-500">Warna<input type="color" className="h-7 w-full cursor-pointer rounded border border-gray-300 p-0" value={pb?.color ?? "#000000"} onChange={(e) => setPb({ color: e.target.value })} /></label>
              </div>
            </div>
          )}
        </Menu>
      </Group>
      <Group title="Opsi Cetak">
        <div className="flex flex-col gap-1">
          <label className="flex w-40 items-center justify-between gap-1 text-[10px] text-gray-600" title="Skala cetak 50-150%">
            Skala cetak (%)
            <span className="w-14"><NumInput min={50} max={150} step={5} value={pg.printScale ?? 100} onChange={(v) => d.mutate((x) => { x.page.printScale = v === 100 ? undefined : v; }, "pscale")} /></span>
          </label>
          <label className="flex w-40 items-center justify-between gap-1 text-[10px] text-gray-600" title="Batas jumlah baris data per halaman (0 = otomatis)">
            Baris / halaman
            <span className="w-14"><NumInput min={0} max={500} step={1} value={pg.maxRowsPerPage ?? 0} onChange={(v) => d.mutate((x) => { x.page.maxRowsPerPage = v > 0 ? v : undefined; }, "maxrows")} /></span>
          </label>
        </div>
      </Group>
      <Group title="Header / Footer">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <label className="flex w-[110px] items-center gap-1 text-[11px] text-gray-700" title="Header halaman: berulang di setiap halaman">
              <input type="checkbox" checked={!!ph?.show} onChange={(e) => setPh({ show: e.target.checked })} />
              Header hal.
            </label>
            <span className="w-14"><NumInput min={3} max={100} disabled={!ph?.show} value={ph?.height ?? 15} onChange={(v) => setPh({ height: v })} /></span>
          </div>
          <div className="flex items-center gap-1">
            <label className="flex w-[110px] items-center gap-1 text-[11px] text-gray-700" title="Footer halaman">
              <input type="checkbox" checked={def.footer.show} onChange={(e) => d.mutate((x) => { x.footer.show = e.target.checked; })} />
              Footer
            </label>
            <span className="w-14"><NumInput min={3} max={80} disabled={!def.footer.show} value={def.footer.height} onChange={(v) => d.mutate((x) => { x.footer.height = v; }, "footerh")} /></span>
          </div>
          <label className="flex items-center gap-1 text-[11px] text-gray-700">
            <span className="w-[110px]">Tinggi Title</span>
            <span className="w-14"><NumInput min={5} max={150} value={def.title.height} onChange={(v) => d.mutate((x) => { x.title.height = v; }, "titleh")} /></span>
          </label>
        </div>
        <PageNumberMenu d={d} big />
        <DateMenu d={d} big />
      </Group>
    </>
  );
}
