import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeColor = "primary" | "neutral" | "error" | "success" | "warning";
export type BadgeVariant = "solid" | "subtle" | "outline";

interface BadgeProps {
  color?: BadgeColor;
  variant?: BadgeVariant;
  className?: string;
  children?: ReactNode;
}

const colorVariantClasses: Record<BadgeColor, Record<BadgeVariant, string>> = {
  primary: {
    solid: "bg-primary text-white",
    subtle: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/25",
    outline: "text-primary ring-1 ring-inset ring-primary/50",
  },
  neutral: {
    solid: "bg-inverted text-inverted-text",
    subtle: "bg-elevated text-toned ring-1 ring-inset ring-default",
    outline: "text-toned ring-1 ring-inset ring-default",
  },
  error: {
    solid: "bg-error text-white",
    subtle: "bg-error/10 text-error ring-1 ring-inset ring-error/25",
    outline: "text-error ring-1 ring-inset ring-error/50",
  },
  success: {
    solid: "bg-success text-white",
    subtle: "bg-success/10 text-success ring-1 ring-inset ring-success/25",
    outline: "text-success ring-1 ring-inset ring-success/50",
  },
  warning: {
    solid: "bg-warning text-white",
    subtle: "bg-warning/10 text-warning ring-1 ring-inset ring-warning/25",
    outline: "text-warning ring-1 ring-inset ring-warning/50",
  },
};

export function Badge({ color = "primary", variant = "subtle", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-medium",
        colorVariantClasses[color][variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
