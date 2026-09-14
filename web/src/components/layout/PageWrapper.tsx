"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}

export function PageHeader({
  subtitle,
  actions,
  breadcrumb,
}: PageHeaderProps) {
  // The MainLayout top bar already renders the page title, so this only
  // renders as a slim toolbar row (matching the "Refresh / Video Tutorial /
  // ..." row on the real Ketoko.co.id pages) instead of duplicating the
  // title as a second, bigger heading in the page body.
  return (
    <div className="flex flex-col gap-3 rounded border border-default bg-elevated p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {breadcrumb && <div className="mb-1">{breadcrumb}</div>}
        {subtitle && <p className="text-[13px] text-toned">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-default bg-elevated p-5 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}
