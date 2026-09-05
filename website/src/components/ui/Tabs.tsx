import { cn } from "@/lib/utils";

export interface TabItem {
  label: string;
  value: string;
}

export function Tabs({
  items,
  value,
  onChange,
  size = "md",
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  size?: "xs" | "md";
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-lg bg-elevated p-1", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            "rounded-md font-medium transition-colors",
            size === "xs" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
            value === item.value ? "bg-bg text-highlighted shadow-sm" : "text-muted hover:text-highlighted",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
