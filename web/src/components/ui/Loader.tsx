"use client";

import { useEffect, useState } from "react";
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

/** true bila `active` sudah menyala terus minimal `delayMs` — mencegah loader berkedip pada request cepat. */
function useDelayedFlag(active: boolean, delayMs: number): boolean {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!active) {
      setShown(false);
      return;
    }
    const t = setTimeout(() => setShown(true), delayMs);
    return () => clearTimeout(t);
  }, [active, delayMs]);
  return active && shown;
}

/** Spinner bulat. Ukuran lewat className (default size-5). */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Memuat"
      className={cn("inline-block size-5 animate-spin rounded-full border-2 border-current border-r-transparent", className)}
    />
  );
}

/** Blok "sedang memuat" untuk isi kartu / tabel / halaman. */
export function LoadingState({ text = "Memuat data...", className }: { text?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-10 text-sm text-muted", className)}>
      <Spinner className="size-7 text-primary" />
      <span>{text}</span>
    </div>
  );
}

/** Bar progres di tepi atas layar selama navigasi / request API berjalan. */
export function TopProgressBar() {
  const apiLoading = useApiLoading();
  const routeLoading = useRouteLoading();
  const active = useDelayedFlag(apiLoading || routeLoading, 120);
  if (!active) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[3px] overflow-hidden bg-primary/20" aria-hidden>
      <div className="h-full w-1/3 animate-[loaderbar_1.1s_ease-in-out_infinite] rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
      <style jsx>{`
        @keyframes loaderbar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(320%); }
        }
      `}</style>
    </div>
  );
}

/**
 * Badge melayang "Memuat data…" di atas area konten. Muncul otomatis bila ada
 * request API (atau pindah halaman) yang berjalan lebih dari 300 ms, jadi
 * setiap halaman punya indikator fetching tanpa kode tambahan.
 */
export function FetchingIndicator() {
  const apiLoading = useApiLoading();
  const routeLoading = useRouteLoading();
  const active = useDelayedFlag(apiLoading || routeLoading, 300);
  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed left-1/2 top-20 z-[55] -translate-x-1/2 transition-all duration-200",
        active ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
      )}
    >
      <div className="flex items-center gap-2 rounded-full border border-default bg-elevated px-4 py-2 text-sm font-medium text-highlighted shadow-lg">
        <Spinner className="size-4 text-primary" />
        {routeLoading && !apiLoading ? "Membuka halaman..." : "Memuat data..."}
      </div>
    </div>
  );
}
