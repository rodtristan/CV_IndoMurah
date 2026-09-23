"use client";

import { useCallback, useEffect, useState } from "react";
import { KInfoBox } from "@/components/kform";

/**
 * Some Ketoko options have no column in the API yet. Those are kept in the UI
 * state and mirrored to localStorage (per browser) so the screen is complete
 * and remembers values, while the server-backed subset is saved via the API.
 */
export function useLocalDraft<T extends object>(key: string, defaults: T) {
  const [value, setValue] = useState<T>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`ketoko_local:${key}`);
      if (raw) setValue({ ...defaults, ...(JSON.parse(raw) as Partial<T>) });
    } catch { /* ignore */ }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const persist = useCallback((v: T) => {
    try { localStorage.setItem(`ketoko_local:${key}`, JSON.stringify(v)); } catch { /* ignore */ }
  }, [key]);

  return { value, setValue, persist, ready };
}

export function NoServerNote({ children }: { children?: React.ReactNode }) {
  return (
    <KInfoBox variant="info" title="Keterangan">
      {children ?? "Penyimpanan belum tersedia di server untuk opsi bertanda (*). Nilainya hanya disimpan di browser ini."}
    </KInfoBox>
  );
}

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
