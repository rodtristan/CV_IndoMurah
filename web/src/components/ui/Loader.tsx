"use client";

import { cn } from "@/lib/utils";
import { useApiLoading } from "@/lib/useApiLoading";
import { useRouteLoading } from "@/lib/useRouteLoading";

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

/**
 * Like GlobalApiLoader, but also lights up during page-to-page navigation
 * (route transition), not just in-flight API calls — so switching pages
 * never feels like it silently hung before landing.
 */
export function GlobalPageLoader({ className, dotClassName }: { className?: string; dotClassName?: string }) {
  const apiLoading = useApiLoading();
  const routeLoading = useRouteLoading();
  if (!apiLoading && !routeLoading) return null;
  return <EllipsisLoader className={className} dotClassName={dotClassName} />;
}

/** Thin animated bar pinned to the top of the viewport during navigation/API activity. */
export function TopProgressBar() {
  const apiLoading = useApiLoading();
  const routeLoading = useRouteLoading();
  const active = apiLoading || routeLoading;
  if (!active) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/20">
      <div className="h-full w-1/3 animate-[loaderbar_1.1s_ease-in-out_infinite] bg-primary" />
      <style jsx>{`
        @keyframes loaderbar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(150%); }
        }
      `}</style>
    </div>
  );
}
