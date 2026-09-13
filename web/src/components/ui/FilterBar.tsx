"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./Input";
import { Select } from "./Select";
import { Button } from "./Button";
import { Search, Filter, X, Calendar, RefreshCw } from "lucide-react";

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
}

export function FilterBar({ fields, onFilter, onReset, loading }: FilterBarProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [showFilters, setShowFilters] = useState(false);

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

  const activeFiltersCount = Object.values(values).filter(
    (v) => v !== undefined && v !== "" && v !== null
  ).length;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Cari..."
              value={(values.search as string) || ""}
              onChange={(e) => handleChange("search", e.target.value)}
              className="h-10 w-full rounded-lg border border-default bg-elevated pl-10 pr-4 text-sm text-highlighted placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button type="submit" variant="primary" size="md" loading={loading}>
            Cari
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          size="md"
          icon={Filter}
          onClick={() => setShowFilters(!showFilters)}
          className={cn(activeFiltersCount > 0 && "border-primary text-primary")}
        >
          Filter
          {activeFiltersCount > 0 && (
            <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-white">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="md"
          icon={RefreshCw}
          onClick={handleReset}
        />
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-default bg-elevated p-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-highlighted">Filter</h3>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <X className="size-3" />
                Reset filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" variant="primary">
              Terapkan Filter
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
