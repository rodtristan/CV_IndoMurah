"use client";

import { FileDown, Printer, RefreshCw, Save, Star, X, ZoomIn, ZoomOut } from "lucide-react";
import type { ReportFieldDef } from "@/lib/report/types";
import type { DesignerApi } from "./useDesignerState";
import type { ViewSettings } from "./useViewSettings";
import { ZOOM_MAX, ZOOM_MIN } from "./ui";
import { Group, RBtn } from "./ribbon/parts";
import { HomeTab } from "./ribbon/HomeTab";
import { InsertTab } from "./ribbon/InsertTab";
import { PageTab } from "./ribbon/PageTab";
import { LayoutTab } from "./ribbon/LayoutTab";
import { ViewTab } from "./ribbon/ViewTab";

export type RibbonTab = "File" | "Home" | "Insert" | "Page" | "Layout" | "View" | "Preview";
const TABS: RibbonTab[] = ["File", "Home", "Insert", "Page", "Layout", "View", "Preview"];

export interface RibbonProps {
  d: DesignerApi;
  fields: ReportFieldDef[];
  tab: RibbonTab;
  setTab: (t: RibbonTab) => void;
  zoom: number;
  setZoom: (z: number) => void;
  view: ViewSettings;
  updateView: (p: Partial<ViewSettings>) => void;
  fit: (kind: "width" | "page") => void;
  busy: boolean;
  onSave: () => void;
  onSaveAs: () => void;
  onSetDefault: () => void;
  onClose: () => void;
  onPrint: () => void;
  onRefreshPreview: () => void;
}

const sm = { size: 16 } as const;
const clampZ = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100));

export function Ribbon(p: RibbonProps) {
  const { d, tab, setTab } = p;

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
      <div className="flex h-[98px] items-stretch overflow-x-auto border-b border-blue-300 bg-[#eaf0f9] px-1 py-1">
        {tab === "File" && (
          <Group title="Template">
            <RBtn icon={<Save {...sm} />} label="Simpan" onClick={p.onSave} disabled={p.busy} title="Simpan (Ctrl+S)" />
            <RBtn icon={<FileDown {...sm} />} label="Simpan Sebagai" onClick={p.onSaveAs} disabled={p.busy} title="Simpan sebagai template baru" />
            <RBtn icon={<Star {...sm} />} label="Set Default" onClick={p.onSetDefault} disabled={p.busy} title="Setel sebagai default" />
            <RBtn icon={<X {...sm} />} label="Tutup" onClick={p.onClose} title="Tutup desainer" />
          </Group>
        )}
        {tab === "Home" && <HomeTab d={d} />}
        {tab === "Insert" && <InsertTab d={d} fields={p.fields} />}
        {tab === "Page" && <PageTab d={d} />}
        {tab === "Layout" && <LayoutTab d={d} fields={p.fields} />}
        {tab === "View" && <ViewTab view={p.view} updateView={p.updateView} zoom={p.zoom} setZoom={p.setZoom} fit={p.fit} />}
        {tab === "Preview" && (
          <Group title="Pratinjau">
            <RBtn icon={<Printer {...sm} />} label="Print" onClick={p.onPrint} title="Cetak pratinjau" />
            <RBtn icon={<RefreshCw {...sm} />} label="Muat Ulang" onClick={p.onRefreshPreview} title="Muat ulang data pratinjau" />
          </Group>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-1 self-center pr-2">
          {tab !== "Preview" && (
            <>
              <RBtn icon={<ZoomOut size={15} />} onClick={() => p.setZoom(clampZ(p.zoom - 0.1))} title="Perkecil" />
              <span className="w-10 text-center text-xs text-gray-700">{Math.round(p.zoom * 100)}%</span>
              <RBtn icon={<ZoomIn size={15} />} onClick={() => p.setZoom(clampZ(p.zoom + 0.1))} title="Perbesar" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
