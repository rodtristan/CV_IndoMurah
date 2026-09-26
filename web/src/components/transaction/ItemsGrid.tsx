"use client";

import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn, formatCurrency } from "@/lib/utils";
import { ItemLookup, type LookupProduct } from "./ItemLookup";
import { lineSubtotal, newKey, num, type LineItem } from "./calc";

const cell =
  "h-9 w-full rounded border border-[#cfd4da] bg-white px-2 text-right text-sm outline-none focus:border-primary disabled:bg-[#f3f4f6]";

type Col = "qty" | "price" | "discPercent" | "discAmount";

export function productToLine(p: LookupProduct, priceField: "PurchasePrice" | "SellingPrice", qty = "1"): LineItem {
  return {
    key: newKey(),
    productId: p.ID,
    code: p.Code,
    name: p.Name,
    unitId: p.UnitID,
    unitName: p.Unit?.Name ?? "",
    qty,
    price: String(Number(p[priceField]) || 0),
    discPercent: "",
    discAmount: "",
    stock: Number(p.Stock),
  };
}

/** Keyboard-friendly item grid: Enter walks qty -> harga -> pot -> the "kode item" box, where Enter adds the item. */
export function ItemsGrid({
  items, onChange, readOnly, priceField, showDiscount = true, qtyLimit, lockAdd, showOrdered, showReceived,
}: {
  /** Kolom "Jml Pesan" (pembelian dari pesanan) */
  showOrdered?: boolean;
  /** Kolom "Jml Terima" (pesanan pembelian) */
  showReceived?: boolean;
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  readOnly?: boolean;
  priceField: "PurchasePrice" | "SellingPrice";
  showDiscount?: boolean;
  /** returns: qty cannot exceed the original transaction */
  qtyLimit?: boolean;
  /** returns: items come from the referenced invoice, so no free adding */
  lockAdd?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const quick = useRef<HTMLInputElement>(null);
  const [lookup, setLookup] = useState<{ open: boolean; keyword: string }>({ open: false, keyword: "" });
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  const cols: Col[] = showDiscount ? ["qty", "price", "discPercent", "discAmount"] : ["qty", "price"];

  const setField = (i: number, k: keyof LineItem, v: string) =>
    onChange(items.map((r, j) => {
      if (j !== i) return r;
      const next = { ...r, [k]: v };
      // percent and Rp are mutually exclusive: typing one clears the other
      if (k === "discPercent" && v) next.discAmount = "";
      if (k === "discAmount" && v) next.discPercent = "";
      return next;
    }));

  const addProducts = (ps: LookupProduct[]) => {
    const next = [...items];
    for (const p of ps) {
      const idx = next.findIndex((r) => r.productId === p.ID);
      if (idx >= 0) next[idx] = { ...next[idx], qty: String(num(next[idx].qty) + 1) };
      else next.push(productToLine(p, priceField));
    }
    onChange(next);
    setTimeout(() => wrap.current?.querySelector<HTMLInputElement>(`[data-cell="${next.length - 1}-qty"]`)?.select(), 30);
  };

  const quickAdd = async () => {
    const kw = code.trim();
    if (!kw) return;
    setMsg("");
    try {
      const res = await api.get<LookupProduct[]>("products", { $include: "Unit", $search: kw, $searchFields: "Code,Name,Barcode", $take: 20 }, { skipCache: true });
      const list = Array.isArray(res.data) ? res.data : [];
      const exact = list.filter((p) => p.Code.toLowerCase() === kw.toLowerCase() || (p.Barcode ?? "").toLowerCase() === kw.toLowerCase());
      if (exact.length === 1 || (exact.length === 0 && list.length === 1)) {
        addProducts([exact[0] ?? list[0]]);
        setCode("");
      } else {
        setLookup({ open: true, keyword: kw });
        setCode("");
      }
    } catch {
      setMsg("Gagal mencari item");
    }
  };

  const onCellKey = (e: React.KeyboardEvent<HTMLInputElement>, i: number, c: Col) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const at = cols.indexOf(c);
    if (at < cols.length - 1) {
      wrap.current?.querySelector<HTMLInputElement>(`[data-cell="${i}-${cols[at + 1]}"]`)?.select();
    } else if (i < items.length - 1 && lockAdd) {
      wrap.current?.querySelector<HTMLInputElement>(`[data-cell="${i + 1}-${cols[0]}"]`)?.select();
    } else {
      quick.current?.focus();
    }
  };

  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));

  return (
    <div ref={wrap}>
      <div className="overflow-x-auto border border-[#d5d9de]">
        <table className="w-full min-w-[900px] text-[14px]">
          <thead>
            <tr className="border-b border-[#d5d9de] bg-[#f5f6f8] text-left">
              <th className="w-10 border-r border-[#d5d9de] px-2 py-2 font-bold">No</th>
              <th className="w-32 border-r border-[#d5d9de] px-2 py-2 font-bold">Kode</th>
              <th className="border-r border-[#d5d9de] px-2 py-2 font-bold">Nama Item</th>
              {showOrdered && <th className="w-24 border-r border-[#d5d9de] px-2 py-2 text-right font-bold">Jml Pesan</th>}
              <th className="w-28 border-r border-[#d5d9de] px-2 py-2 text-right font-bold">Jumlah</th>
              {showReceived && <th className="w-24 border-r border-[#d5d9de] px-2 py-2 text-right font-bold">Jml Terima</th>}
              <th className="w-24 border-r border-[#d5d9de] px-2 py-2 font-bold">Satuan</th>
              <th className="w-36 border-r border-[#d5d9de] px-2 py-2 text-right font-bold">Harga</th>
              {showDiscount && <th className="w-24 border-r border-[#d5d9de] px-2 py-2 text-right font-bold">Pot (%)</th>}
              {showDiscount && <th className="w-32 border-r border-[#d5d9de] px-2 py-2 text-right font-bold">Pot (Rp)</th>}
              <th className="w-36 border-r border-[#d5d9de] px-2 py-2 text-right font-bold">Subtotal</th>
              {!readOnly && !lockAdd && <th className="w-10 px-2 py-2" />}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={13} className="h-28 text-center text-[16px] text-[#9aa3ad]">{lockAdd ? "Pilih faktur terlebih dahulu" : "Belum ada item. Klik \"Tambah Item\" atau ketik kode item di bawah lalu Enter."}</td></tr>
            ) : items.map((r, i) => {
              const over = qtyLimit && r.maxQty !== undefined && num(r.qty) > r.maxQty;
              const input = (c: Col, v: string, w?: string) => (
                <input
                  data-cell={`${i}-${c}`}
                  type="number"
                  min={0}
                  step="any"
                  value={v}
                  disabled={readOnly}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setField(i, c, e.target.value)}
                  onKeyDown={(e) => onCellKey(e, i, c)}
                  className={cn(cell, w, c === "qty" && over && "border-danger text-danger")}
                />
              );
              return (
                <tr key={r.key} className="border-b border-[#eceff2]">
                  <td className="border-r border-[#eceff2] px-2 py-1">{i + 1}</td>
                  <td className="border-r border-[#eceff2] px-2 py-1 font-mono text-xs">{r.code}</td>
                  <td className="border-r border-[#eceff2] px-2 py-1">
                    {r.name}
                    {r.maxQty !== undefined && <span className="ml-2 text-xs text-muted">(maks {r.maxQty})</span>}
                    {r.maxQty === undefined && r.stock !== undefined && <span className="ml-2 text-xs text-muted">(stok {r.stock})</span>}
                  </td>
                  {showOrdered && <td className="border-r border-[#eceff2] px-2 py-1 text-right">{r.orderedQty ?? 0}</td>}
                  <td className="border-r border-[#eceff2] p-1">{input("qty", r.qty)}</td>
                  {showReceived && <td className="border-r border-[#eceff2] px-2 py-1 text-right">{r.receivedQty ?? 0}</td>}
                  <td className="border-r border-[#eceff2] px-2 py-1">{r.unitName || "-"}</td>
                  <td className="border-r border-[#eceff2] p-1">{input("price", r.price)}</td>
                  {showDiscount && <td className="border-r border-[#eceff2] p-1">{input("discPercent", r.discPercent)}</td>}
                  {showDiscount && <td className="border-r border-[#eceff2] p-1">{input("discAmount", r.discAmount)}</td>}
                  <td className="border-r border-[#eceff2] px-2 py-1 text-right font-medium">{formatCurrency(lineSubtotal(r))}</td>
                  {!readOnly && !lockAdd && (
                    <td className="px-1 py-1 text-center">
                      <button type="button" title="Hapus baris" onClick={() => remove(i)} className="text-muted hover:text-danger"><Trash2 className="size-4" /></button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!readOnly && !lockAdd && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setLookup({ open: true, keyword: "" })} className="inline-flex h-10 items-center gap-1.5 rounded border border-[#cfd4da] bg-white px-4 text-[14px] hover:bg-[#f3f4f6]">
            <Plus className="size-4" /> Tambah Item
          </button>
          <input
            ref={quick}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void quickAdd(); } }}
            placeholder="Ketik kode / barcode / nama item lalu Enter"
            className="h-10 w-full max-w-[380px] rounded border border-[#cfd4da] px-3 text-sm outline-none focus:border-primary"
          />
          {msg && <span className="text-sm text-danger">{msg}</span>}
        </div>
      )}
      <ItemLookup
        open={lookup.open}
        initialKeyword={lookup.keyword}
        priceField={priceField}
        onClose={() => setLookup({ open: false, keyword: "" })}
        onPick={addProducts}
      />
    </div>
  );
}
