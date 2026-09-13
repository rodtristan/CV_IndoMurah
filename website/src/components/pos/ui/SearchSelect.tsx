"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types/pos";

interface SearchSelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
}

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  disabled = false,
  className,
  allowClear = false,
}: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optValue: string | number) => {
    onChange?.(optValue);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("" as unknown as string | number);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between rounded-md border-0 bg-bg px-3 py-2 text-sm ring-1 ring-inset",
          isOpen
            ? "ring-2 ring-primary"
            : "ring-default hover:ring-accented",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className={selectedOption ? "text-highlighted" : "text-dimmed"}>
          {selectedOption?.label || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {allowClear && selectedOption && (
            <X className="size-4 text-dimmed hover:text-muted" onClick={handleClear} />
          )}
          <ChevronDown
            className={cn("size-4 text-dimmed transition-transform", isOpen && "rotate-180")}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-default bg-bg py-1 shadow-lg">
          {/* Search input */}
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-dimmed" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border-0 bg-elevated py-1.5 pl-8 pr-3 text-sm ring-1 ring-inset ring-default placeholder:text-dimmed focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted">Tidak ditemukan</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-elevated",
                    value === opt.value && "bg-primary/10 text-primary"
                  )}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && <Check className="size-4" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
