"use client";

import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <div className={cn("rounded-lg border border-default bg-bg p-4", className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{title}</span>
        {icon && (
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-highlighted">{value}</span>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive ? "text-success" : "text-error"
            )}
          >
            {isPositive ? (
              <TrendingUp className="size-4" />
            ) : (
              <TrendingDown className="size-4" />
            )}
            <span>{isPositive ? "+" : ""}{trend.value}%</span>
            {trend.label && (
              <span className="text-dimmed">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
