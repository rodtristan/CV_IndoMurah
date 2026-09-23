"use client";

import { Frame, Grid3x3, MoveHorizontal, Ruler, Scan, Tag } from "lucide-react";
import type { ViewSettings } from "../useViewSettings";
import { BigBtn, Group, RBtn } from "./parts";

const lg = { size: 24 } as const;
const ZOOMS = [50, 75, 100, 125, 150, 200];

export interface ViewTabProps {
  view: ViewSettings;
  updateView: (p: Partial<ViewSettings>) => void;
  zoom: number;
  setZoom: (z: number) => void;
  fit: (kind: "width" | "page") => void;
}

export function ViewTab({ view, updateView, zoom, setZoom, fit }: ViewTabProps) {
  return (
    <>
      <Group title="Tampilkan">
        <BigBtn icon={<Ruler {...lg} />} label="Penggaris" active={view.ruler} onClick={() => updateView({ ruler: !view.ruler })} title="Tampilkan/sembunyikan penggaris (mm) di atas dan kiri halaman" />
        <BigBtn icon={<Grid3x3 {...lg} />} label="Garis Kisi" active={view.grid} onClick={() => updateView({ grid: !view.grid })} title="Tampilkan garis kisi pada band dan aktifkan snap ke kisi" />
        <BigBtn icon={<Frame {...lg} />} label="Panduan Margin" active={view.guides} onClick={() => updateView({ guides: !view.guides })} title="Tampilkan garis panduan margin" />
        <BigBtn icon={<Tag {...lg} />} label="Label Band" active={view.labels} onClick={() => updateView({ labels: !view.labels })} title="Tampilkan nama band (ReportTitleBand1, dst.)" />
      </Group>
      <Group title="Snap Kisi">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[10px] text-gray-600">Ukuran kisi:</div>
          <div className="flex items-center gap-1">
            {([1, 2, 5] as const).map((v) => (
              <button
                key={v}
                type="button"
                title={`Kisi ${v} mm`}
                onClick={() => updateView({ snap: v, grid: true })}
                className={`h-7 rounded border px-2 text-xs ${view.snap === v ? "border-blue-500 bg-blue-200 text-blue-900" : "border-gray-300 bg-white hover:bg-blue-50"}`}
              >
                {v} mm
              </button>
            ))}
          </div>
        </div>
      </Group>
      <Group title="Zoom">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            {ZOOMS.map((z) => (
              <button
                key={z}
                type="button"
                title={`Zoom ${z}%`}
                onClick={() => setZoom(z / 100)}
                className={`h-7 rounded border px-1.5 text-xs ${Math.round(zoom * 100) === z ? "border-blue-500 bg-blue-200 text-blue-900" : "border-gray-300 bg-white hover:bg-blue-50"}`}
              >
                {z}%
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <RBtn icon={<MoveHorizontal size={15} />} label="Lebar" onClick={() => fit("width")} title="Sesuaikan zoom dengan lebar halaman" />
            <RBtn icon={<Scan size={15} />} label="Satu Halaman" onClick={() => fit("page")} title="Sesuaikan zoom agar satu halaman penuh terlihat" />
            <span className="ml-1 text-xs text-gray-600">{Math.round(zoom * 100)}%</span>
          </div>
        </div>
      </Group>
    </>
  );
}
