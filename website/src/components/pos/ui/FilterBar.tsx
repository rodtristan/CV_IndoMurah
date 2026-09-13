"use client";

import type { ReactNode } from "react";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";

interface FilterBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Cari...",
  filters,
  actions,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {/* Search */}
      {onSearchChange && (
        <div className="w-64">
          <Input
            icon={Search}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full"
          />
        </div>
      )}

      {/* Filters */}
      {filters && (
        <div className="flex items-center gap-2 rounded-md bg-elevated px-3 py-2">
          <Filter className="size-4 text-dimmed" />
          {filters}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
