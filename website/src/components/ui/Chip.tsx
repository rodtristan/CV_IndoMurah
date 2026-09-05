import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChipProps {
  color?: "primary" | "error" | "success" | "neutral";
  show?: boolean;
  inset?: boolean;
  children?: ReactNode;
  className?: string;
}

const colorClasses: Record<string, string> = {
  primary: "bg-primary",
  error: "bg-error",
  success: "bg-success",
  neutral: "bg-inverted",
};

export function Chip({ color = "primary", show = true, inset, children, className }: ChipProps) {
  return (
    <span className={cn("relative inline-flex", className)}>
      {children}
      {show && (
        <span
          className={cn(
            "absolute block size-2.5 rounded-full ring-2 ring-bg",
            colorClasses[color],
            inset ? "right-0 top-0" : "-right-0.5 -top-0.5",
          )}
        />
      )}
    </span>
  );
}
