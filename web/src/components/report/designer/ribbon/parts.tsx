"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { STD_COLORS } from "../ui";

/** small icon(+label) button */
export function RBtn({
  icon, label, onClick, active, disabled, title,
}: { icon: ReactNode; label?: string; onClick: () => void; active?: boolean; disabled?: boolean; title?: string }) {
  return (
    <button
      type="button"
      title={title ?? label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex min-w-[26px] flex-col items-center justify-center gap-0.5 rounded px-1 py-1 text-[11px] transition-colors disabled:opacity-40 ${
        active ? "bg-blue-200 text-blue-900" : "text-gray-800 hover:bg-blue-100"
      }`}
    >
      {icon}
      {label && <span className="leading-none">{label}</span>}
    </button>
  );
}

/** Word-style big button: large icon with the label below */
export function BigBtn({
  icon, label, onClick, active, disabled, title,
}: { icon: ReactNode; label: string; onClick: () => void; active?: boolean; disabled?: boolean; title?: string }) {
  return (
    <button
      type="button"
      title={title ?? label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-[62px] min-w-[52px] flex-col items-center justify-start gap-1 rounded px-1.5 pt-1 text-[11px] leading-tight transition-colors disabled:opacity-40 ${
        active ? "bg-blue-200 text-blue-900 ring-1 ring-blue-400" : "text-gray-800 hover:bg-blue-100"
      }`}
    >
      <span className="flex h-7 items-center">{icon}</span>
      <span className="max-w-[72px] text-center">{label}</span>
    </button>
  );
}

export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col border-r border-blue-200 px-2 last:border-r-0">
      <div className="flex flex-1 items-center gap-1">{children}</div>
      <div className="pt-0.5 text-center text-[10px] text-gray-500">{title}</div>
    </div>
  );
}

export const Sep = () => <span className="mx-0.5 h-5 w-px bg-blue-200" />;

/** dropdown whose popup is `position: fixed` so the ribbon's overflow scrolling never clips it */
export function Menu({
  icon, label, title, big, disabled, active, width = 220, children,
}: {
  icon: ReactNode; label?: string; title?: string; big?: boolean; disabled?: boolean; active?: boolean; width?: number;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (pop.current?.contains(t) || btn.current?.contains(t)) return;
      setOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("keydown", key);
    };
  }, [open]);

  const toggle = () => {
    if (!open && btn.current) {
      const r = btn.current.getBoundingClientRect();
      setPos({ left: Math.max(4, Math.min(r.left, window.innerWidth - width - 8)), top: r.bottom + 2 });
    }
    setOpen(!open);
  };

  return (
    <>
      <button
        ref={btn}
        type="button"
        title={title ?? label}
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggle}
        className={`flex flex-col items-center justify-start rounded text-[11px] leading-tight transition-colors disabled:opacity-40 ${big ? "h-[62px] min-w-[52px] gap-1 px-1.5 pt-1" : "gap-0.5 px-1 py-1"} ${
          active || open ? "bg-blue-200 text-blue-900" : "text-gray-800 hover:bg-blue-100"
        }`}
      >
        <span className={big ? "flex h-7 items-center" : "flex items-center"}>{icon}</span>
        {label && (
          <span className="flex max-w-[80px] items-center text-center">
            {label}
            <ChevronDown size={10} />
          </span>
        )}
      </button>
      {open && (
        <div
          ref={pop}
          style={{ position: "fixed", left: pos.left, top: pos.top, width, zIndex: 90 }}
          className="max-h-[70vh] overflow-y-auto rounded border border-gray-300 bg-white p-1 text-xs text-gray-800 shadow-xl"
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </>
  );
}

export function MenuItem({
  icon, label, onClick, active, disabled, hint,
}: { icon?: ReactNode; label: string; onClick: () => void; active?: boolean; disabled?: boolean; hint?: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs disabled:opacity-40 ${active ? "bg-blue-100 font-semibold text-blue-900" : "hover:bg-blue-50"}`}
    >
      {icon && <span className="flex w-4 justify-center">{icon}</span>}
      <span className="flex-1">{label}</span>
      {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
    </button>
  );
}

export const MenuSep = () => <div className="my-1 border-t border-gray-200" />;

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="px-2 pb-0.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{children}</div>;
}

/** colour dropdown: standard palette + custom picker + "no colour" */
export function ColorMenu({
  icon, label, title, value, onPick, noneLabel = "Tanpa warna", disabled, big,
}: {
  icon: ReactNode; label?: string; title?: string; value?: string; onPick: (c: string | undefined) => void; noneLabel?: string | null; disabled?: boolean; big?: boolean;
}) {
  return (
    <Menu
      icon={
        <span className="flex flex-col items-center">
          {icon}
          <span className="mt-0.5 block h-[3px] w-4 rounded-sm border border-gray-300" style={{ background: value || "transparent" }} />
        </span>
      }
      label={label}
      title={title}
      disabled={disabled}
      big={big}
      width={168}
    >
      {(close) => (
        <div>
          <div className="grid grid-cols-6 gap-1 p-1">
            {STD_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => { onPick(c); close(); }}
                className={`h-5 w-5 rounded-sm border ${value?.toLowerCase() === c ? "border-blue-600 ring-1 ring-blue-500" : "border-gray-300"}`}
                style={{ background: c }}
              />
            ))}
          </div>
          {noneLabel && <MenuItem label={noneLabel} onClick={() => { onPick(undefined); close(); }} />}
          <label className="flex items-center gap-2 px-2 py-1 text-xs">
            Warna lain
            <input type="color" value={value && value.startsWith("#") && value.length === 7 ? value : "#000000"} onChange={(e) => onPick(e.target.value)} className="h-6 w-8 cursor-pointer rounded border border-gray-300 p-0" />
          </label>
        </div>
      )}
    </Menu>
  );
}

/** page-shaped icon used by the orientation buttons */
export function PageIcon({ landscape }: { landscape?: boolean }) {
  const w = landscape ? 24 : 17;
  const h = landscape ? 17 : 24;
  return (
    <svg width={26} height={26} viewBox="0 0 26 26" aria-hidden>
      <rect x={(26 - w) / 2} y={(26 - h) / 2} width={w} height={h} rx={1.5} fill="#fff" stroke="#1e4d8f" strokeWidth={1.6} />
      <path d={landscape ? "M7 10h12M7 13h12M7 16h8" : "M9 8h8M9 11h8M9 14h8M9 17h5"} stroke="#93b4dc" strokeWidth={1.2} />
    </svg>
  );
}
