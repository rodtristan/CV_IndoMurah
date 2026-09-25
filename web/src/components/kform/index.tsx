"use client";

// Ketoko.co.id-style form primitives: "Label :" above the control, "Auto" code
// fields, PENTING/KETERANGAN callouts, bordered tab strip, green Simpan bar.

import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  AlertTriangle, Lightbulb, Save, Bold, Italic, Strikethrough, Underline, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, List, ListOrdered, Link2, Undo2, Redo2, Trash2, Plus, ImagePlus, Copy,
} from "lucide-react";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

const controlCls =
  "h-10 w-full rounded border border-[#cfd4da] bg-white px-3 text-sm text-[#1e293b] outline-none transition-colors placeholder:text-[#9aa3ad] focus:border-primary disabled:bg-[#f3f4f6] disabled:text-[#9aa3ad] read-only:bg-[#f7f8fa]";

// ─── Layout ───────────────────────────────────────────────────────────

export function KCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded border border-[#d5d9de] bg-white p-4", className)}>{children}</div>;
}

export function KTabs({
  tabs, active, onChange,
}: { tabs: { key: string; label: string }[]; active: string; onChange: (key: string) => void }) {
  return (
    <div className="flex flex-wrap border border-[#c9d3df] bg-[#f5f6f8]">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={cn(
            "px-6 py-3 text-[14px] transition-colors",
            active === t.key
              ? "border-x border-b-0 border-[#7fb0de] bg-white text-[#1e293b] shadow-[inset_0_2px_0_#7fb0de]"
              : "text-[#3a4654] hover:bg-white/60",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function KSaveBar({
  onSave, saving, label = "Simpan", extra,
}: { onSave: () => void; saving?: boolean; label?: string; extra?: ReactNode }) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex h-10 items-center gap-2 rounded bg-[#4caf50] px-5 text-[15px] font-medium text-white transition-colors hover:bg-[#43a047] disabled:opacity-60"
      >
        <Save className="size-4" />
        {saving ? "Menyimpan..." : label}
      </button>
      {extra}
    </div>
  );
}

export function KInfoBox({
  variant = "info", title, items, children,
}: { variant?: "warning" | "info"; title?: string; items?: ReactNode[]; children?: ReactNode }) {
  const warn = variant === "warning";
  const Icon = warn ? AlertTriangle : Lightbulb;
  return (
    <div
      className={cn(
        "my-3 flex gap-3 border-l-4 px-4 py-3 text-[13px]",
        warn ? "border-[#f0a30a] bg-[#fff6e8] text-[#4a3b1f]" : "border-[#4a7fd0] bg-[#eef3fc] text-[#28384f]",
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", warn ? "text-[#f0a30a]" : "text-[#e8b923]")} />
      <div className="space-y-1">
        {title && <p className="font-semibold uppercase">{title} :</p>}
        {items && (
          <ol className={cn("space-y-0.5", items.length > 1 ? "list-decimal pl-5" : "list-none")}>
            {items.map((it, i) => <li key={i}>{it}</li>)}
          </ol>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── Fields ───────────────────────────────────────────────────────────

export function KField({
  label, hint, className, children,
}: { label?: string; hint?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div className={cn("mb-3", className)}>
      {label && <label className="mb-1 block text-[14px] text-[#2b3540]">{label} :</label>}
      {children}
      {hint && <p className="mt-1 text-[13px] text-[#3a4654]">{hint}</p>}
    </div>
  );
}

type InputProps = { label?: string; hint?: ReactNode; className?: string; fieldClassName?: string } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>, "className"
>;

export function KInput({ label, hint, className, fieldClassName, ...rest }: InputProps) {
  return (
    <KField label={label} hint={hint} className={fieldClassName}>
      <input {...rest} className={cn(controlCls, className)} />
    </KField>
  );
}

/** Numeric field, right-aligned like Ketoko. Value kept as string so users can type freely. */
export function KNumber({
  label, hint, value, onChange, fieldClassName, className, ...rest
}: {
  label?: string; hint?: ReactNode; value: string | number; onChange: (v: string) => void;
  fieldClassName?: string; className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className">) {
  return (
    <KField label={label} hint={hint} className={fieldClassName}>
      <input
        {...rest}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className={cn(controlCls, "text-right", className)}
      />
    </KField>
  );
}

/** Code field: read-only "Auto" when creating (server generates it); editable only when explicitly allowed. */
export function KCode({
  label = "Kode", value, isNew, onChange, fieldClassName,
}: { label?: string; value: string; isNew: boolean; onChange?: (v: string) => void; fieldClassName?: string }) {
  return (
    <KField label={label} className={fieldClassName}>
      <input
        value={isNew && !value ? "Auto" : value}
        readOnly={isNew || !onChange}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(controlCls, "max-w-[320px]", (isNew || !onChange) && "bg-[#f7f8fa]")}
      />
    </KField>
  );
}

export function KTextarea({
  label, hint, rows = 4, className, fieldClassName, ...rest
}: { label?: string; hint?: ReactNode; className?: string; fieldClassName?: string } & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"
>) {
  return (
    <KField label={label} hint={hint} className={fieldClassName}>
      <textarea {...rest} rows={rows} className={cn(controlCls, "h-auto py-2", className)} />
    </KField>
  );
}

export interface KOption { value: string | number; label: string; disabled?: boolean }

export function KSelect({
  label, hint, value, onChange, options, placeholder = "Select...", disabled, fieldClassName, className, action,
}: {
  label?: string; hint?: ReactNode; value: string | number; onChange: (v: string) => void; options: KOption[];
  placeholder?: string; disabled?: boolean; fieldClassName?: string; className?: string;
  /** e.g. the "+" quick-add button next to Grup Pelanggan */
  action?: ReactNode;
}) {
  return (
    <KField label={label} hint={hint} className={fieldClassName}>
      <div className="flex gap-1">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(controlCls, "appearance-none bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-8", !value && "text-[#9aa3ad]", className)}
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E\")" }}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>
        {action}
      </div>
    </KField>
  );
}

export function KQuickAdd({ onClick, title = "Tambah" }: { onClick: () => void; title?: string }) {
  return (
    <button type="button" title={title} onClick={onClick} className="flex h-10 w-12 shrink-0 items-center justify-center rounded border border-[#cfd4da] bg-white hover:bg-[#f3f4f6]">
      <Plus className="size-4" />
    </button>
  );
}

export function KRadioGroup({
  label, value, onChange, options, inline, hint,
}: {
  label?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
  inline?: boolean; hint?: ReactNode;
}) {
  return (
    <KField label={label} hint={hint}>
      <div className={cn("flex", inline ? "flex-wrap gap-x-6 gap-y-1" : "flex-col gap-2")}>
        {options.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-center gap-2 text-[15px] text-[#2b3540]">
            <span
              className={cn(
                "flex size-[22px] items-center justify-center rounded-full border",
                value === o.value ? "border-[#4a90d9] bg-white" : "border-[#c4cad1] bg-white",
              )}
            >
              {value === o.value && <span className="size-3 rounded-full bg-[#4a90d9]" />}
            </span>
            <input type="radio" className="sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </KField>
  );
}

export function KCheckbox({
  label, checked, onChange, caption, hint,
}: { label?: string; checked: boolean; onChange: (v: boolean) => void; caption?: string; hint?: ReactNode }) {
  return (
    <KField label={label} hint={hint}>
      <label className="inline-flex cursor-pointer items-center gap-2 text-[14px]">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="size-6 rounded border-[#cfd4da] accent-[#4a90d9]"
        />
        {caption}
      </label>
    </KField>
  );
}

export function KToggle({
  label, checked, onChange,
}: { label?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <span className="inline-flex items-center gap-2">
      {label && <span className="text-[17px] font-semibold text-[#2b3540]">{label} :</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-7 w-14 items-center rounded border px-1 text-[10px] font-semibold transition-colors",
          checked ? "justify-start border-[#4caf50] bg-[#4caf50] text-white" : "justify-end border-[#b6d4ee] bg-[#cfe6fa] text-[#6b8fb0]",
        )}
      >
        {checked ? "ON" : "OFF"}
      </button>
    </span>
  );
}

// ─── Rich text (Sub Keterangan) ────────────────────────────────────────

export function KRichText({
  label, value, onChange, minHeight = 260,
}: { label?: string; value: string; onChange: (html: string) => void; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const cmd = (c: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(c, false, arg);
    onChange(sanitizeRichText(ref.current?.innerHTML ?? ""));
  };
  const Btn = ({ icon: I, c, arg, title }: { icon: typeof Bold; c: string; arg?: string; title: string }) => (
    <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={() => cmd(c, arg)} className="flex size-9 items-center justify-center rounded text-[#3a4654] hover:bg-[#eef1f4]">
      <I className="size-4" />
    </button>
  );
  const Sep = () => <span className="mx-1 h-6 w-px bg-[#d5d9de]" />;
  return (
    <KField label={label}>
      <div className="border border-[#cfd4da] bg-white">
        <div className="flex flex-wrap items-center border-b border-[#cfd4da] px-2 py-1.5">
          <Btn icon={Undo2} c="undo" title="Urungkan" />
          <Btn icon={Redo2} c="redo" title="Ulangi" />
          <Sep />
          <Btn icon={Bold} c="bold" title="Tebal" />
          <Btn icon={Italic} c="italic" title="Miring" />
          <Btn icon={Strikethrough} c="strikeThrough" title="Coret" />
          <Btn icon={Underline} c="underline" title="Garis bawah" />
          <Sep />
          <Btn icon={AlignLeft} c="justifyLeft" title="Rata kiri" />
          <Btn icon={AlignCenter} c="justifyCenter" title="Tengah" />
          <Btn icon={AlignRight} c="justifyRight" title="Rata kanan" />
          <Btn icon={AlignJustify} c="justifyFull" title="Rata kiri-kanan" />
          <Sep />
          <Btn icon={ListOrdered} c="insertOrderedList" title="Daftar bernomor" />
          <Btn icon={List} c="insertUnorderedList" title="Daftar poin" />
          <Sep />
          <button
            type="button"
            title="Tautan"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { const u = window.prompt("URL tautan:"); if (u) cmd("createLink", u); }}
            className="flex size-9 items-center justify-center rounded text-[#3a4654] hover:bg-[#eef1f4]"
          >
            <Link2 className="size-4" />
          </button>
        </div>
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={() => onChange(sanitizeRichText(ref.current?.innerHTML ?? ""))}
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}
          className="prose-sm p-3 text-sm outline-none"
          style={{ minHeight }}
        />
      </div>
    </KField>
  );
}

// Rich-text HTML is user input: strip scripts, event handlers and javascript: URLs
// before it is rendered or handed back to the caller. DOMPurify needs a DOM, so on the
// server (prerender) nothing is rendered; the editor fills in after hydration.
function sanitizeRichText(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined" || !DOMPurify.isSupported) return "";
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

// ─── Images (max N, preview as data URLs until the API supports upload) ──

export function KImageList({
  images, onChange, max = 5,
}: { images: string[]; onChange: (imgs: string[]) => void; max?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const add = async (files: FileList | null) => {
    if (!files) return;
    const room = max - images.length;
    const picked = Array.from(files).slice(0, room);
    const urls = await Promise.all(
      picked.map((f) => new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(f); })),
    );
    onChange([...images, ...urls]);
  };
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {images.map((src, i) => (
          <div key={i} className="relative size-32 overflow-hidden rounded border border-[#d5d9de]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="size-full object-cover" />
            <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded bg-white/90 p-1 text-danger shadow">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={images.length >= max}
        onClick={() => input.current?.click()}
        className="inline-flex h-11 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-[15px] hover:bg-[#f3f4f6] disabled:opacity-50"
      >
        <ImagePlus className="size-4" />
        Tambah Gambar
      </button>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { void add(e.target.files); e.target.value = ""; }} />
    </div>
  );
}

// ─── Editable grid (Potongan Harga, level harga, dll.) ─────────────────

export interface KGridColumn<T> {
  key: keyof T & string;
  label: string;
  type?: "text" | "number" | "select";
  options?: KOption[];
  width?: string;
}

export function KEditableGrid<T extends Record<string, unknown>>({
  columns, rows, onChange, newRow, addLabel = "Tambah", removeLabel = "Hapus", emptyText = "No data",
}: {
  columns: KGridColumn<T>[]; rows: T[]; onChange: (rows: T[]) => void; newRow: () => T;
  addLabel?: string; removeLabel?: string; emptyText?: string;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const setCell = (i: number, key: string, v: unknown) => onChange(rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  return (
    <div>
      <div className="overflow-x-auto border border-[#d5d9de]">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="border-b border-[#d5d9de] bg-white">
              <th className="w-12 border-r border-[#d5d9de] px-2 py-2 text-left font-bold">No</th>
              {columns.map((c) => (
                <th key={c.key} className="border-r border-[#d5d9de] px-3 py-2 text-left font-bold last:border-r-0" style={{ width: c.width }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="h-40 text-center text-[18px] text-[#9aa3ad]">{emptyText}</td></tr>
            ) : rows.map((r, i) => (
              <tr key={i} onClick={() => setSel(i)} className={cn("border-b border-[#eceff2]", sel === i && "bg-primary/5")}>
                <td className="border-r border-[#eceff2] px-2 py-1">{i + 1}</td>
                {columns.map((c) => (
                  <td key={c.key} className="border-r border-[#eceff2] p-1 last:border-r-0">
                    {c.type === "select" ? (
                      <select value={String(r[c.key] ?? "")} onChange={(e) => setCell(i, c.key, e.target.value)} className={cn(controlCls, "h-9")}>
                        <option value="">Select...</option>
                        {c.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input
                        type={c.type === "number" ? "number" : "text"}
                        value={String(r[c.key] ?? "")}
                        onChange={(e) => setCell(i, c.key, e.target.value)}
                        className={cn(controlCls, "h-9", c.type === "number" && "text-right")}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => onChange([...rows, newRow()])} className="h-11 rounded border border-[#cfd4da] bg-white px-4 text-[15px] hover:bg-[#f3f4f6]">{addLabel}</button>
        <button
          type="button"
          disabled={sel === null}
          onClick={() => { if (sel !== null) { onChange(rows.filter((_, i) => i !== sel)); setSel(null); } }}
          className="h-11 rounded border border-[#cfd4da] bg-white px-4 text-[15px] hover:bg-[#f3f4f6] disabled:opacity-50"
        >
          {removeLabel}
        </button>
      </div>
    </div>
  );
}

// ─── Misc ──────────────────────────────────────────────────────────────

export function KShareLink({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex max-w-[1070px] gap-0">
      <input readOnly value={value} className={cn(controlCls, "flex-1 border-dashed")} />
      <button
        type="button"
        onClick={() => { void navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="inline-flex h-10 w-[270px] items-center justify-center gap-2 rounded border border-[#cfd4da] bg-white text-[15px] hover:bg-[#f3f4f6]"
      >
        <Copy className="size-4" />
        {copied ? "Tersalin" : "Copy"}
      </button>
    </div>
  );
}

/** Two-column responsive grid used by the Ketoko forms (left = main data, right = settings). */
export function KColumns({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-x-8 gap-y-0 lg:grid-cols-2", className)}>{children}</div>;
}
export function KRow({ children, cols = 2, className }: { children: ReactNode; cols?: 2 | 3 | 4; className?: string }) {
  return (
    <div className={cn("grid gap-x-3", cols === 2 && "sm:grid-cols-2", cols === 3 && "sm:grid-cols-3", cols === 4 && "sm:grid-cols-4", className)}>
      {children}
    </div>
  );
}
