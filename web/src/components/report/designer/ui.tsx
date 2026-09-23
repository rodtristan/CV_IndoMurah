"use client";

import { useEffect, useState, type ReactNode } from "react";

export function NumInput({
  value, onChange, min, max, step = 1, className = "", disabled,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; className?: string; disabled?: boolean }) {
  const [txt, setTxt] = useState(String(value));
  useEffect(() => {
    setTxt((t) => (parseFloat(t) === value ? t : String(value)));
  }, [value]);
  return (
    <input
      type="number"
      disabled={disabled}
      value={txt}
      min={min}
      max={max}
      step={step}
      className={`h-7 w-full rounded border border-gray-300 bg-white px-1.5 text-xs text-gray-900 ${className}`}
      onChange={(e) => {
        setTxt(e.target.value);
        let v = parseFloat(e.target.value);
        if (Number.isNaN(v)) return;
        if (min !== undefined) v = Math.max(min, v);
        if (max !== undefined) v = Math.min(max, v);
        onChange(v);
      }}
      onBlur={() => setTxt(String(value))}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[11px] font-medium text-gray-500">{label}</span>
      {children}
    </label>
  );
}

export const inputCls = "h-7 w-full rounded border border-gray-300 bg-white px-1.5 text-xs text-gray-900";

export const FONT_FAMILIES = ["Arial", "Times New Roman", "Courier New", "Verdana", "Tahoma"];
export const FONT_SIZES = [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36];
export const PAGE_SIZE_OPTIONS = ["A3", "A4", "A5", "B5", "Letter", "Legal", "Folio", "Custom"] as const;
export const PAGE_SIZE_LABEL: Record<string, string> = { Folio: "Folio / F4 (215 x 330)", Custom: "Custom...", A3: "A3 (297 x 420)", A4: "A4 (210 x 297)", A5: "A5 (148 x 210)", B5: "B5 (176 x 250)", Letter: "Letter (216 x 279)", Legal: "Legal (216 x 356)" };
export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 3;
export const LINE_SPACINGS = [1, 1.15, 1.5, 2];
export const STD_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#cccccc", "#ffffff",
  "#c00000", "#ff0000", "#ff9900", "#ffff00", "#92d050", "#00b050",
  "#00b0f0", "#0070c0", "#002060", "#7030a0", "#f4b6c2", "#fce4d6",
];
