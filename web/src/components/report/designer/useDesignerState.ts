"use client";

import { useCallback, useMemo, useReducer, useRef, useState } from "react";
import type { ElementBorder, ReportColumn, ReportElement, ReportFieldDef, ReportTemplateDef, TextStyle } from "@/lib/report/types";
import { BASE_STYLE, columnFromField, newId, printableWidth, textElement } from "@/lib/report/template";

export type BandKey = "title" | "pageHeader" | "footer";
export type Band = BandKey | "table";
export type Selection =
  | { type: "none" }
  | { type: "el"; ids: string[] }
  | { type: "col"; id: string; part: "header" | "row" }
  | { type: "page" }
  | { type: "band"; band: BandKey };

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

/** Copied formatting for the Format Painter */
interface Painter {
  style: Partial<TextStyle>;
  border?: ElementBorder;
  background?: string;
  padding?: number;
}

export const BAND_KEYS: BandKey[] = ["title", "pageHeader", "footer"];

/** Returns the (existing) element array of a band; creates the optional pageHeader on demand. */
export function bandElements(def: Def, key: BandKey): ReportElement[] {
  if (key === "pageHeader") {
    if (!def.pageHeader) def.pageHeader = { show: false, height: 15, elements: [] };
    return def.pageHeader.elements;
  }
  return def[key].elements;
}

export function bandHeight(def: Def, key: BandKey): number {
  if (key === "pageHeader") return def.pageHeader?.height ?? 15;
  return def[key].height;
}

export function findElement(def: Def, id: string): { el: ReportElement; band: BandKey } | null {
  for (const k of BAND_KEYS) {
    const arr = k === "pageHeader" ? def.pageHeader?.elements : def[k].elements;
    const e = arr?.find((x) => x.id === id);
    if (e) return { el: e, band: k };
  }
  return null;
}

const round1 = (v: number) => Math.round(v * 10) / 10;

export type ArrangeOp = "left" | "center" | "right" | "top" | "middle" | "bottom" | "distH" | "distV" | "sameW" | "sameH";

export function useDesignerState() {
  const [state, dispatch] = useReducer(reducer, { def: null, past: [], future: [], saved: "" });
  const [sel, setSelState] = useState<Selection>({ type: "none" });
  const [band, setBand] = useState<Band>("table");
  const [painterOn, setPainterOn] = useState(false);
  const clip = useRef<Clip | null>(null);
  const painter = useRef<Painter | null>(null);
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

  /** which band array new/pasted elements go to */
  const targetBand = (): BandKey => {
    const b = bandRef.current;
    return b === "footer" || b === "pageHeader" ? b : "title";
  };

  const applyPainterTo = useCallback(
    (s: Selection) => {
      const p = painter.current;
      if (!p) return;
      painter.current = null;
      setPainterOn(false);
      if (s.type === "el") {
        mutate((d) => {
          for (const id of s.ids) {
            const f = findElement(d, id);
            if (!f || f.el.locked) continue;
            f.el.style = { ...f.el.style, ...p.style } as TextStyle;
            f.el.border = p.border ? structuredClone(p.border) : undefined;
            f.el.background = p.background;
            f.el.padding = p.padding;
          }
        });
      } else if (s.type === "col") {
        mutate((d) => {
          const c = d.table.columns.find((x) => x.id === s.id);
          if (!c) return;
          if (s.part === "header") {
            c.headerStyle = { ...(c.headerStyle ?? {}), ...p.style };
            c.headerBackground = p.background;
          } else {
            c.rowStyle = { ...(c.rowStyle ?? {}), ...p.style };
            c.rowBackground = p.background;
          }
        });
      }
    },
    [mutate],
  );

  const setSel = useCallback(
    (s: Selection) => {
      setSelState(s);
      selRef.current = s;
      if (s.type === "el" && defRef.current) {
        const f = findElement(defRef.current, s.ids[0]);
        if (f) setBand(f.band);
      } else if (s.type === "col") setBand("table");
      else if (s.type === "band") setBand(s.band);
      if ((s.type === "el" || s.type === "col") && painter.current) applyPainterTo(s);
    },
    [applyPainterTo],
  );

  // ── elements ──
  const addElement = useCallback(
    (kind: "text" | "image" | "line", overrides?: Partial<ReportElement>, toBand?: BandKey) => {
      const target = toBand ?? targetBand();
      const d0 = defRef.current;
      if (!d0) return;
      const pw = printableWidth(d0);
      let el: ReportElement;
      if (kind === "text") el = textElement({ x: 2, y: 2, w: 60, h: 5, text: "Teks", ...overrides });
      else if (kind === "image")
        el = { id: newId(), type: "image", x: 2, y: 2, w: 24, h: 24, text: "{InfoReport.LogoUrl}", style: { ...BASE_STYLE }, ...overrides };
      else el = { id: newId(), type: "line", x: 0, y: Math.max(0, bandHeight(d0, target) - 1), w: pw, h: 0, style: { ...BASE_STYLE }, ...overrides };
      mutate((d) => {
        bandElements(d, target).push(el);
        if (target === "footer") d.footer.show = true;
        if (target === "pageHeader" && d.pageHeader) d.pageHeader.show = true;
      });
      setSelState({ type: "el", ids: [el.id] });
      setBand(target);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate],
  );

  const deleteSelected = useCallback(() => {
    const s = selRef.current;
    if (s.type === "el") {
      const d0 = defRef.current;
      const ids = s.ids.filter((id) => !(d0 && findElement(d0, id)?.el.locked));
      if (ids.length === 0) return;
      mutate((d) => {
        d.title.elements = d.title.elements.filter((e) => !ids.includes(e.id));
        d.footer.elements = d.footer.elements.filter((e) => !ids.includes(e.id));
        if (d.pageHeader) d.pageHeader.elements = d.pageHeader.elements.filter((e) => !ids.includes(e.id));
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
      const target = targetBand();
      const news = c.els.map((e) => ({ ...structuredClone(e), id: newId(), x: e.x + 3, y: e.y + 3, locked: false }));
      mutate((d) => {
        bandElements(d, target).push(...news.map((n) => structuredClone(n)));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutate]);

  /** Ctrl+D: duplicate the selected elements in place (offset), same band. */
  const duplicate = useCallback(() => {
    const s = selRef.current;
    const d0 = defRef.current;
    if (!d0) return;
    if (s.type === "el") {
      const news: { el: ReportElement; band: BandKey }[] = [];
      for (const id of s.ids) {
        const f = findElement(d0, id);
        if (f) news.push({ el: { ...structuredClone(f.el), id: newId(), x: f.el.x + 3, y: f.el.y + 3, locked: false }, band: f.band });
      }
      if (!news.length) return;
      mutate((d) => {
        for (const n of news) bandElements(d, n.band).push(structuredClone(n.el));
      });
      setSelState({ type: "el", ids: news.map((n) => n.el.id) });
    } else if (s.type === "col") {
      const c = d0.table.columns.find((x) => x.id === s.id);
      if (!c) return;
      const col = { ...structuredClone(c), id: newId("col") };
      mutate((d) => {
        const i = d.table.columns.findIndex((x) => x.id === s.id);
        d.table.columns.splice(i + 1, 0, structuredClone(col));
      });
      setSelState({ type: "col", id: col.id, part: s.part });
    }
  }, [mutate]);

  const selectAll = useCallback(() => {
    const d0 = defRef.current;
    if (!d0) return;
    const b = bandRef.current;
    const key: BandKey = b === "footer" || b === "pageHeader" ? b : "title";
    const els = (key === "pageHeader" ? d0.pageHeader?.elements : d0[key].elements) ?? [];
    if (els.length) {
      setSelState({ type: "el", ids: els.map((e) => e.id) });
      setBand(key);
    }
  }, []);

  const nudge = useCallback(
    (dx: number, dy: number) => {
      const s = selRef.current;
      if (s.type !== "el") return;
      mutate((d) => {
        for (const id of s.ids) {
          const f = findElement(d, id);
          if (f && !f.el.locked) {
            f.el.x = round1(f.el.x + dx);
            f.el.y = round1(f.el.y + dy);
          }
        }
      }, `nudge`);
    },
    [mutate],
  );

  /** Run `fn` on every selected element (used for border / shading / lock / …). */
  const editSelected = useCallback(
    (fn: (el: ReportElement) => void, key?: string) => {
      const s = selRef.current;
      if (s.type !== "el") return;
      mutate((d) => {
        for (const id of s.ids) {
          const f = findElement(d, id);
          if (f) fn(f.el);
        }
      }, key);
    },
    [mutate],
  );

  const toggleLock = useCallback(() => {
    const s = selRef.current;
    const d0 = defRef.current;
    if (s.type !== "el" || !d0) return;
    const first = findElement(d0, s.ids[0])?.el;
    const lock = !first?.locked;
    editSelected((el) => {
      el.locked = lock ? true : undefined;
    });
  }, [editSelected]);

  /** z-order = array order within the band */
  const zOrder = useCallback(
    (op: "front" | "back") => {
      const s = selRef.current;
      if (s.type !== "el") return;
      mutate((d) => {
        for (const k of BAND_KEYS) {
          const arr = k === "pageHeader" ? d.pageHeader?.elements : d[k].elements;
          if (!arr) continue;
          const picked = arr.filter((e) => s.ids.includes(e.id));
          if (!picked.length) continue;
          const rest = arr.filter((e) => !s.ids.includes(e.id));
          arr.splice(0, arr.length, ...(op === "front" ? [...rest, ...picked] : [...picked, ...rest]));
        }
      });
    },
    [mutate],
  );

  const arrange = useCallback(
    (op: ArrangeOp) => {
      const s = selRef.current;
      if (s.type !== "el") return;
      mutate((d) => {
        const items = s.ids.map((id) => findElement(d, id)).filter((f): f is NonNullable<typeof f> => !!f && !f.el.locked);
        if (!items.length) return;
        const pw = printableWidth(d);
        const single = items.length === 1;
        const minX = Math.min(...items.map((i) => i.el.x));
        const maxX = Math.max(...items.map((i) => i.el.x + i.el.w));
        const minY = Math.min(...items.map((i) => i.el.y));
        const maxY = Math.max(...items.map((i) => i.el.y + i.el.h));
        for (const { el, band: b } of items) {
          const bx0 = single ? 0 : minX;
          const bx1 = single ? pw : maxX;
          const by0 = single ? 0 : minY;
          const by1 = single ? bandHeight(d, b) : maxY;
          if (op === "left") el.x = round1(bx0);
          else if (op === "right") el.x = round1(bx1 - el.w);
          else if (op === "center") el.x = round1((bx0 + bx1) / 2 - el.w / 2);
          else if (op === "top") el.y = round1(by0);
          else if (op === "bottom") el.y = round1(by1 - el.h);
          else if (op === "middle") el.y = round1((by0 + by1) / 2 - el.h / 2);
        }
        if (op === "sameW") {
          const w = items[0].el.w;
          items.forEach((i) => { i.el.w = w; });
        } else if (op === "sameH") {
          const h = items[0].el.h;
          items.forEach((i) => { i.el.h = h; });
        } else if ((op === "distH" || op === "distV") && items.length >= 3) {
          const horiz = op === "distH";
          const sorted = [...items].sort((a, b) => (horiz ? a.el.x - b.el.x : a.el.y - b.el.y));
          const total = sorted.reduce((a, i) => a + (horiz ? i.el.w : i.el.h), 0);
          const span = horiz ? maxX - minX : maxY - minY;
          const gap = (span - total) / (sorted.length - 1);
          let pos = horiz ? minX : minY;
          for (const i of sorted) {
            if (horiz) { i.el.x = round1(pos); pos += i.el.w + gap; }
            else { i.el.y = round1(pos); pos += i.el.h + gap; }
          }
        }
      });
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

  /** Style patch for the selected element(s), or ONLY the selected column part (header/row) of the selected column. */
  const applyStyle = useCallback(
    (patch: Partial<TextStyle>) => {
      const s = selRef.current;
      if (s.type === "el") {
        mutate((d) => {
          for (const id of s.ids) {
            const f = findElement(d, id);
            if (f && !f.el.locked) Object.assign(f.el.style, patch);
          }
        }, `style:${Object.keys(patch).join(",")}`);
      } else if (s.type === "col") {
        mutate((d) => {
          const c = d.table.columns.find((x) => x.id === s.id);
          if (!c) return;
          if (s.part === "header") c.headerStyle = { ...(c.headerStyle ?? {}), ...patch };
          else c.rowStyle = { ...(c.rowStyle ?? {}), ...patch };
        }, `style:${Object.keys(patch).join(",")}`);
      }
    },
    [mutate],
  );

  /** Shading: element fill, or header/row background of the selected column. */
  const applyShading = useCallback(
    (color: string | undefined) => {
      const s = selRef.current;
      if (s.type === "el") editSelected((el) => { el.background = color; }, "shade");
      else if (s.type === "col")
        mutate((d) => {
          const c = d.table.columns.find((x) => x.id === s.id);
          if (!c) return;
          if (s.part === "header") c.headerBackground = color;
          else c.rowBackground = color;
        }, "shade");
    },
    [editSelected, mutate],
  );

  /** Make the selected column's header/row formatting the table-wide default and drop per-column overrides. */
  const applyToAllColumns = useCallback(() => {
    const s = selRef.current;
    if (s.type !== "col") return;
    mutate((d) => {
      const c = d.table.columns.find((x) => x.id === s.id);
      if (!c) return;
      if (s.part === "header") {
        d.table.headerStyle = { ...d.table.headerStyle, ...(c.headerStyle ?? {}) };
        if (c.headerBackground !== undefined) d.table.headerBackground = c.headerBackground;
        for (const x of d.table.columns) { delete x.headerStyle; delete x.headerBackground; }
      } else {
        d.table.rowStyle = { ...d.table.rowStyle, ...(c.rowStyle ?? {}) };
        for (const x of d.table.columns) { delete x.rowStyle; delete x.rowBackground; }
      }
    });
  }, [mutate]);

  const currentStyle: TextStyle | null = useMemo(() => {
    if (!def) return null;
    if (sel.type === "el") return findElement(def, sel.ids[0])?.el.style ?? null;
    if (sel.type === "col") {
      const c = def.table.columns.find((x) => x.id === sel.id);
      if (!c) return null;
      const base = sel.part === "header" ? def.table.headerStyle : def.table.rowStyle;
      const over = sel.part === "header" ? c.headerStyle : c.rowStyle;
      return { ...base, align: c.align, ...(over ?? {}) };
    }
    return null;
  }, [def, sel]);

  const currentEl = useMemo(() => (def && sel.type === "el" ? findElement(def, sel.ids[0])?.el ?? null : null), [def, sel]);

  const clearFormat = useCallback(() => {
    const s = selRef.current;
    if (s.type === "el") {
      editSelected((el) => {
        el.style = { ...BASE_STYLE, ...(el.type === "line" ? { color: el.style.color } : {}) };
        delete el.border;
        delete el.background;
        delete el.padding;
      });
    } else if (s.type === "col") {
      mutate((d) => {
        const c = d.table.columns.find((x) => x.id === s.id);
        if (!c) return;
        if (s.part === "header") { delete c.headerStyle; delete c.headerBackground; }
        else { delete c.rowStyle; delete c.rowBackground; }
      });
    }
  }, [editSelected, mutate]);

  /** Format Painter: first call copies the formatting of the selection; the next element/column click applies it. */
  const togglePainter = useCallback(() => {
    if (painter.current) {
      painter.current = null;
      setPainterOn(false);
      return;
    }
    const d = defRef.current;
    const s = selRef.current;
    if (!d) return;
    if (s.type === "el") {
      const el = findElement(d, s.ids[0])?.el;
      if (!el) return;
      painter.current = { style: structuredClone(el.style), border: el.border && structuredClone(el.border), background: el.background, padding: el.padding };
    } else if (s.type === "col") {
      const c = d.table.columns.find((x) => x.id === s.id);
      if (!c) return;
      const base = s.part === "header" ? d.table.headerStyle : d.table.rowStyle;
      const over = s.part === "header" ? c.headerStyle : c.rowStyle;
      painter.current = { style: { ...base, ...(over ?? {}) }, background: s.part === "header" ? c.headerBackground : c.rowBackground };
    } else return;
    setPainterOn(true);
  }, []);

  const cancelPainter = useCallback(() => {
    painter.current = null;
    setPainterOn(false);
  }, []);

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
    duplicate,
    selectAll,
    nudge,
    editSelected,
    toggleLock,
    zOrder,
    arrange,
    addColumn,
    moveColumn,
    applyStyle,
    applyShading,
    applyToAllColumns,
    currentStyle,
    currentEl,
    clearFormat,
    painterOn,
    togglePainter,
    cancelPainter,
    hasClip: () => clip.current !== null,
  };
}

export type DesignerApi = ReturnType<typeof useDesignerState>;
