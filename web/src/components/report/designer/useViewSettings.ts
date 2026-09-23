"use client";

import { useCallback, useEffect, useState } from "react";

export interface ViewSettings {
  ruler: boolean;
  grid: boolean;
  /** snap-to-grid size in mm */
  snap: 1 | 2 | 5;
  guides: boolean;
  labels: boolean;
}

const KEY = "reportDesigner.view.v1";
const DEFAULTS: ViewSettings = { ruler: true, grid: false, snap: 1, guides: true, labels: true };

function read(): ViewSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ViewSettings>) };
  } catch {
    /* storage unavailable */
  }
  return DEFAULTS;
}

/** View options live in localStorage only (never in the template). */
export function useViewSettings() {
  const [view, setView] = useState<ViewSettings>(DEFAULTS);
  useEffect(() => {
    setView(read());
  }, []);
  const update = useCallback((patch: Partial<ViewSettings>) => {
    setView((v) => {
      const n = { ...v, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(n));
      } catch {
        /* ignore */
      }
      return n;
    });
  }, []);
  return { view, update };
}
