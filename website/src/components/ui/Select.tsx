import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options: (SelectOption | string)[];
  variant?: "outline" | "ghost";
  uiSize?: "xs" | "sm" | "md";
}

export function Select({ options, variant = "outline", uiSize = "md", className, ...props }: SelectProps) {
  const normalized = options.map((o) => (typeof o === "string" ? { label: o, value: o } : o));

  return (
    <div className={cn("relative inline-flex", className)}>
      <select
        className={cn(
          "block w-full appearance-none rounded-md border-0 py-1.5 pl-3 pr-8 text-sm capitalize text-highlighted focus:outline-none focus:ring-2 focus:ring-primary",
          variant === "outline" ? "bg-bg ring-1 ring-inset ring-default" : "bg-transparent hover:bg-elevated",
          uiSize === "xs" && "py-1 text-xs",
        )}
        {...props}
      >
        {normalized.map((opt) => (
          <option key={opt.value} value={opt.value} className="capitalize">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-dimmed" />
    </div>
  );
}
