"use client";

export function Loading() {
  return (
    <div className="flex h-40 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export function apiError(e: unknown): string {
  return e instanceof Error ? e.message : "Terjadi kesalahan";
}
