"use client";

import { cn } from "@/lib/utils";
import { useApiLoading } from "@/lib/useApiLoading";

/** Three bouncing dots. Purely presentational — renders whenever mounted. */
export function EllipsisLoader({ className, dotClassName }: { className?: string; dotClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} role="status" aria-label="Memuat">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn("size-1.5 animate-bounce rounded-full bg-current", dotClassName)}
          style={{ animationDelay: `${i * 120}ms`, animationDuration: "800ms" }}
        />
      ))}
    </span>
  );
}

/**
 * Renders <EllipsisLoader /> only while at least one api-client request is
 * in flight anywhere in the app — the global signal from api-client.ts.
 * Drop this anywhere (header, page title, toolbar) to get an automatic
 * "backend is loading" indicator with no per-page fetch-state plumbing.
 */
export function GlobalApiLoader({ className, dotClassName }: { className?: string; dotClassName?: string }) {
  const loading = useApiLoading();
  if (!loading) return null;
  return <EllipsisLoader className={className} dotClassName={dotClassName} />;
}
