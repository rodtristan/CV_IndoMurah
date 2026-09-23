"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { LookupDialog, type LookupPick } from "@/components/report/LookupDialog";
import { KField } from "@/components/kform";
import { cn } from "@/lib/utils";

/** Read-only text box + search button opening a LookupDialog (Supplier / Pelanggan / Sales ...). */
export function PartnerLookup({
  label, endpoint, title, value, onPick, onClear, disabled, placeholder = "Klik untuk memilih...", fieldClassName,
}: {
  label: string;
  endpoint: string;
  title?: string;
  value: string;
  onPick: (pick: LookupPick) => void;
  onClear?: () => void;
  disabled?: boolean;
  placeholder?: string;
  fieldClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <KField label={label} className={fieldClassName}>
      <div className="flex gap-1">
        <div className="relative flex-1">
          <input
            readOnly
            value={value}
            placeholder={placeholder}
            onClick={() => !disabled && setOpen(true)}
            className={cn("h-10 w-full cursor-pointer rounded border border-[#cfd4da] bg-white px-3 pr-8 text-sm outline-none focus:border-primary", disabled && "cursor-default bg-[#f3f4f6]")}
          />
          {value && onClear && !disabled && (
            <button type="button" title="Kosongkan" onClick={onClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9aa3ad] hover:text-danger">
              <X className="size-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          disabled={disabled}
          title="Cari"
          onClick={() => setOpen(true)}
          className="flex h-10 w-12 shrink-0 items-center justify-center rounded border border-[#cfd4da] bg-white hover:bg-[#f3f4f6] disabled:opacity-50"
        >
          <Search className="size-4" />
        </button>
      </div>
      <LookupDialog
        open={open}
        onClose={() => setOpen(false)}
        title={title ?? `Cari ${label}`}
        source={{ endpoint, valueField: "ID", labelField: "Name", codeField: "Code" }}
        onPick={onPick}
      />
    </KField>
  );
}
