"use client";

import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  iconClassName?: string;
  href?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  changeType = "neutral",
  icon: Icon,
  iconClassName = "bg-primary/10 text-primary",
  href,
  className,
}: StatCardProps) {
  const content = (
    <div className={cn("rounded-xl border border-default bg-elevated p-5 shadow-sm transition-shadow hover:shadow-md", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="text-2xl font-bold text-highlighted">
            {typeof value === "number" ? (
              value > 1000000
                ? formatCurrency(value)
                : formatNumber(value)
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-muted">{subtitle}</p>
          )}
          {change && (
            <div
              className={cn(
                "mt-1 flex items-center gap-1 text-xs font-medium",
                changeType === "up" && "text-success",
                changeType === "down" && "text-danger",
                changeType === "neutral" && "text-muted"
              )}
            >
              {changeType === "up" && <TrendingUp className="size-3" />}
              {changeType === "down" && <TrendingDown className="size-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("flex size-10 items-center justify-center rounded-lg", iconClassName)}>
            <Icon className="size-5" />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "primary";
  size?: "sm" | "md";
}

export function Badge({ children, variant = "default", size = "sm" }: BadgeProps) {
  const variants = {
    default: "bg-elevated text-muted border-default",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    info: "bg-info/10 text-info",
    primary: "bg-primary/10 text-primary",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variants[variant],
        sizes[size]
      )}
    >
      {children}
    </span>
  );
}

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const sizes = {
    sm: "size-7 text-xs",
    md: "size-9 text-sm",
    lg: "size-12 text-base",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover", sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary",
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
}

export function Progress({
  value,
  max = 100,
  label,
  showPercent = false,
  variant = "default",
}: ProgressProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  const variants = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  return (
    <div className="space-y-1.5">
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-muted">{label}</span>}
          {showPercent && <span className="font-medium text-highlighted">{percent}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-elevated">
        <div
          className={cn("h-full rounded-full transition-all duration-500", variants[variant])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded bg-elevated", className)}
    />
  );
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-elevated">
          <Icon className="size-7 text-muted" />
        </div>
      )}
      <h3 className="mb-1 text-lg font-semibold text-highlighted">{title}</h3>
      {description && <p className="mb-4 text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}
