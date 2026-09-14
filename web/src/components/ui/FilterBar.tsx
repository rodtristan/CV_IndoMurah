"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./Input";
import { Select } from "./Select";
import { Search, RotateCcw } from "lucide-react";

interface FilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  options?: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  className?: string;
}

interface FilterBarProps {
  fields: FilterField[];
  onFilter: (values: Record<string, unknown>) => void;
  onReset?: () => void;
  loading?: boolean;
  /** Extra controls (add/edit/copy/delete icon buttons, utility buttons) rendered next to the search box. */
  actions?: React.ReactNode;
}

export function FilterBar({ fields, onFilter, onReset, loading, actions }: FilterBarProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});

  const handleChange = useCallback((key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onFilter(values);
    },
    [values, onFilter]
  );

  const handleReset = useCallback(() => {
    setValues({});
    onReset?.();
  }, [onReset]);

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border border-default bg-elevated p-4">
      {fields.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {fields.map((field) => {
            if (field.type === "select") {
              return (
                <Select
                  key={field.key}
                  label={field.label}
                  options={field.options || []}
                  value={values[field.key] as string | number}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={field.className}
                />
              );
            }

            if (field.type === "date") {
              return (
                <Input
                  key={field.key}
                  type="date"
                  label={field.label}
                  value={values[field.key] as string}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={field.className}
                />
              );
            }

            if (field.type === "number") {
              return (
                <Input
                  key={field.key}
                  type="number"
                  label={field.label}
                  value={values[field.key] as string}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={field.className}
                />
              );
            }

            return (
              <Input
                key={field.key}
                type="text"
                label={field.label}
                value={values[field.key] as string}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={field.className}
              />
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-default pt-3">
        {actions}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex h-9 items-center gap-1.5 rounded border border-default px-3 text-[13px] text-toned transition-colors hover:bg-bg"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded bg-info px-4 text-[13px] font-medium text-white transition-colors hover:bg-info/90",
              loading && "opacity-60"
            )}
          >
            <Search className="size-3.5" />
            Cari
          </button>
        </div>
      </div>
    </form>
  );
}
