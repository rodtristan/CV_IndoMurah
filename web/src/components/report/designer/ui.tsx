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
export const PAGE_SIZE_OPTIONS = ["A4", "A5", "Letter", "Legal"] as const;
