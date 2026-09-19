"use client";

import { useCallback, useMemo, useReducer, useRef, useState } from "react";
import type { ReportColumn, ReportElement, ReportFieldDef, ReportTemplateDef, TextStyle } from "@/lib/report/types";
import { BASE_STYLE, columnFromField, newId, printableWidth, textElement } from "@/lib/report/template";

export type Band = "title" | "table" | "footer";
export type Selection =
  | { type: "none" }
  | { type: "el"; ids: string[] }
  | { type: "col"; id: string; part: "header" | "row" }
  | { type: "page" }
  | { type: "band"; band: "title" | "footer" };

type Def = ReportTemplateDef;

interface HState {
  def: Def | null;
  past: Def[];
  future: Def[];
  saved: string;
}

type Act =
  | { t: "load"; def: Def }
  | { t: "mutate"; fn: (d: Def) => void; push: boolean }
  | { t: "snapshot" }
  | { t: "undo" }
  | { t: "redo" }
  | { t: "saved" };

const MAX_HISTORY = 100;

function reducer(s: HState, a: Act): HState {
  switch (a.t) {
    case "load":
      return { def: a.def, past: [], future: [], saved: JSON.stringify(a.def) };
    case "saved":
      return { ...s, saved: JSON.stringify(s.def) };
    case "snapshot":
      if (!s.def) return s;
      return { ...s, past: [...s.past.slice(-(MAX_HISTORY - 1)), s.def], future: [] };
    case "mutate": {
      if (!s.def) return s;
      const next = structuredClone(s.def);
      a.fn(next);
      return a.push
        ? { ...s, def: next, past: [...s.past.slice(-(MAX_HISTORY - 1)), s.def], future: [] }
        : { ...s, def: next };
    }
    case "undo": {
      if (!s.def || s.past.length === 0) return s;
      const prev = s.past[s.past.length - 1];
      return { ...s, def: prev, past: s.past.slice(0, -1), future: [s.def, ...s.future] };
    }
    case "redo": {
      if (!s.def || s.future.length === 0) return s;
      const [nx, ...rest] = s.future;
      return { ...s, def: nx, past: [...s.past, s.def], future: rest };
    }
  }
}

interface Clip {
  els?: ReportElement[];
  col?: ReportColumn;
}

export function findElement(def: Def, id: string): { el: ReportElement; band: "title" | "footer" } | null {
  const t = def.title.elements.find((e) => e.id === id);
  if (t) return { el: t, band: "title" };
  const f = def.footer.elements.find((e) => e.id === id);
  if (f) return { el: f, band: "footer" };
  return null;
}

export function useDesignerState() {
  const [state, dispatch] = useReducer(reducer, { def: null, past: [], future: [], saved: "" });
  const [sel, setSelState] = useState<Selection>({ type: "none" });
  const [band, setBand] = useState<Band>("table");
  const clip = useRef<Clip | null>(null);
  const lastKey = useRef<{ k: string; t: number } | null>(null);

  const def = state.def;
  const defRef = useRef(def);
  defRef.current = def;
  const selRef = useRef(sel);
  selRef.current = sel;
  const bandRef = useRef(band);
  bandRef.current = band;

  const dirty = useMemo(() => def !== null && JSON.stringify(def) !== state.saved, [def, state.saved]);

  const load = useCallback((d: Def) => {
    dispatch({ t: "load", def: d });
    setSelState({ type: "none" });
  }, []);
  const markSaved = useCallback(() => dispatch({ t: "saved" }), []);
  const undo = useCallback(() => dispatch({ t: "undo" }), []);
  const redo = useCallback(() => dispatch({ t: "redo" }), []);
  const snapshot = useCallback(() => dispatch({ t: "snapshot" }), []);
  const silent = useCallback((fn: (d: Def) => void) => dispatch({ t: "mutate", fn, push: false }), []);

  /** Apply a change; changes with the same `key` within 1.2s collapse into one undo step. */
  const mutate = useCallback((fn: (d: Def) => void, key?: string) => {
    const now = Date.now();
    let push = true;
    if (key && lastKey.current && lastKey.current.k === key && now - lastKey.current.t < 1200) push = false;
    lastKey.current = key ? { k: key, t: now } : null;
    dispatch({ t: "mutate", fn, push });
  }, []);

  const setSel = useCallback((s: Selection) => {
    setSelState(s);
    if (s.type === "el" && defRef.current) {
      const f = findElement(defRef.current, s.ids[0]);
      if (f) setBand(f.band);
    } else if (s.type === "col") setBand("table");
    else if (s.type === "band") setBand(s.band);
  }, []);

  // ── elements ──
  const addElement = useCallback(
    (kind: "text" | "image" | "line", overrides?: Partial<ReportElement>) => {
      const target: "title" | "footer" = bandRef.current === "footer" ? "footer" : "title";
      const d0 = defRef.current;
      if (!d0) return;
      const pw = printableWidth(d0);
      let el: ReportElement;
      if (kind === "text") el = textElement({ x: 2, y: 2, w: 60, h: 5, text: "Teks", ...overrides });
      else if (kind === "image")
        el = { id: newId(), type: "image", x: 2, y: 2, w: 24, h: 24, text: "{InfoReport.LogoUrl}", style: { ...BASE_STYLE }, ...overrides };
      else el = { id: newId(), type: "line", x: 0, y: Math.max(0, d0[target].height - 1), w: pw, h: 0, style: { ...BASE_STYLE }, ...overrides };
      mutate((d) => {
        d[target].elements.push(el);
        if (target === "footer") d.footer.show = true;
      });
      setSelState({ type: "el", ids: [el.id] });
    },
    [mutate],
  );

  const deleteSelected = useCallback(() => {
    const s = selRef.current;
    if (s.type === "el") {
      mutate((d) => {
        d.title.elements = d.title.elements.filter((e) => !s.ids.includes(e.id));
        d.footer.elements = d.footer.elements.filter((e) => !s.ids.includes(e.id));
      });
      setSelState({ type: "none" });
    } else if (s.type === "col") {
      mutate((d) => {
        d.table.columns = d.table.columns.filter((c) => c.id !== s.id);
      });
      setSelState({ type: "none" });
    }
  }, [mutate]);

  const copySelected = useCallback(() => {
    const s = selRef.current;
    const d = defRef.current;
    if (!d) return false;
    if (s.type === "el") {
      const els = s.ids.map((id) => findElement(d, id)?.el).filter((e): e is ReportElement => !!e);
      if (els.length) clip.current = { els: structuredClone(els) };
      return els.length > 0;
    }
    if (s.type === "col") {
      const c = d.table.columns.find((x) => x.id === s.id);
      if (c) clip.current = { col: structuredClone(c) };
      return !!c;
    }
    return false;
  }, []);

  const cutSelected = useCallback(() => {
    if (copySelected()) deleteSelected();
  }, [copySelected, deleteSelected]);

  const paste = useCallback(() => {
    const c = clip.current;
    if (!c) return;
    if (c.els) {
      const target: "title" | "footer" = bandRef.current === "footer" ? "footer" : "title";
      const news = c.els.map((e) => ({ ...structuredClone(e), id: newId(), x: e.x + 3, y: e.y + 3 }));
      mutate((d) => {
        d[target].elements.push(...news.map((n) => structuredClone(n)));
      });
      setSelState({ type: "el", ids: news.map((n) => n.id) });
      setBand(target);
    } else if (c.col) {
      const col = { ...structuredClone(c.col), id: newId("col") };
      const s = selRef.current;
      mutate((d) => {
        const i = s.type === "col" ? d.table.columns.findIndex((x) => x.id === s.id) : -1;
        d.table.columns.splice(i >= 0 ? i + 1 : d.table.columns.length, 0, structuredClone(col));
      });
      setSelState({ type: "col", id: col.id, part: "header" });
    }
  }, [mutate]);

  const nudge = useCallback(
    (dx: number, dy: number) => {
      const s = selRef.current;
      if (s.type !== "el") return;
      mutate((d) => {
        for (const id of s.ids) {
          const f = findElement(d, id);
          if (f) {
            f.el.x = Math.round((f.el.x + dx) * 10) / 10;
            f.el.y = Math.round((f.el.y + dy) * 10) / 10;
          }
        }
      }, `nudge`);
    },
    [mutate],
  );

  // ── columns ──
  const addColumn = useCallback(
    (f: ReportFieldDef) => {
      const c = columnFromField(f, f.type === "string" ? 34 : 24);
      mutate((d) => {
        d.table.columns.push(structuredClone(c));
      });
      setSelState({ type: "col", id: c.id, part: "header" });
      setBand("table");
    },
    [mutate],
  );

  const moveColumn = useCallback(
    (id: string, to: number) => {
      silent((d) => {
        const cols = d.table.columns;
        const from = cols.findIndex((c) => c.id === id);
        if (from < 0 || from === to) return;
        const [c] = cols.splice(from, 1);
        cols.splice(Math.max(0, Math.min(cols.length, to)), 0, c);
      });
    },
    [silent],
  );

  /** Apply style patch to the selected element(s), or to the table header/row style of the selected column. */
  const applyStyle = useCallback(
    (patch: Partial<TextStyle>) => {
      const s = selRef.current;
      if (s.type === "el") {
        mutate((d) => {
          for (const id of s.ids) {
            const f = findElement(d, id);
            if (f) Object.assign(f.el.style, patch);
          }
        }, `style:${Object.keys(patch).join(",")}`);
      } else if (s.type === "col") {
        mutate((d) => {
          Object.assign(s.part === "header" ? d.table.headerStyle : d.table.rowStyle, patch);
          if (patch.align) {
            const c = d.table.columns.find((x) => x.id === s.id);
            if (c) c.align = patch.align;
          }
        }, `style:${Object.keys(patch).join(",")}`);
      }
    },
    [mutate],
  );

  const currentStyle: TextStyle | null = useMemo(() => {
    if (!def) return null;
    if (sel.type === "el") return findElement(def, sel.ids[0])?.el.style ?? null;
    if (sel.type === "col") return sel.part === "header" ? def.table.headerStyle : def.table.rowStyle;
    return null;
  }, [def, sel]);

  return {
    def,
    dirty,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    load,
    markSaved,
    undo,
    redo,
    snapshot,
    silent,
    mutate,
    sel,
    setSel,
    band,
    setBand,
    addElement,
    deleteSelected,
    copySelected,
    cutSelected,
    paste,
    nudge,
    addColumn,
    moveColumn,
    applyStyle,
    currentStyle,
    hasClip: () => clip.current !== null,
  };
}

export type DesignerApi = ReturnType<typeof useDesignerState>;
