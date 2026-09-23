"use client";

import { useEffect, useSyncExternalStore } from "react";

// Lets a page override the header title MainLayout derives from the URL
// (e.g. /master/items/new -> "Item Baru"). Cleared automatically on unmount.
let current: string | null = null;
const listeners = new Set<() => void>();

function set(title: string | null) {
  current = title;
  listeners.forEach((l) => l());
}

export function usePageTitle(title: string | null | undefined) {
  useEffect(() => {
    if (!title) return;
    set(title);
    return () => set(null);
  }, [title]);
}

export function usePageTitleOverride(): string | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => null,
  );
}
