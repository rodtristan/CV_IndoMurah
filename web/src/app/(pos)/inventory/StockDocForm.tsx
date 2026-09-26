"use client";

// One full-page document form for Barang Masuk / Barang Keluar / Transfer Item / Stock Opname
// (Ketoko layout: No Transaksi "Auto", Tanggal, Dept/Gudang, item grid with "+ Item", totals,
// Tambah / Simpan / Hapus / Cetak).

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { KInput, KSelect, KRow } from "@/components/kform";
import { ConfirmDelete, DocActions, DocShell, ItemPicker, KReadOnly, fmt, nowLocal, num, pick, toIso, toLocalInput, useDocRoute, useList, type Row } from "@/components/kform/erp";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";
import { cn } from "@/lib/utils";

export type StockKind = "in" | "out" | "transfer" | "opname";

const CFG = {
  in: { title: "Item Masuk", endpoint: "stock-in", base: "/inventory/stock-in", items: "StockInItems" },
  out: { title: "Item Keluar", endpoint: "stock-out", base: "/inventory/stock-out", items: "StockOutItems" },
  transfer: { title: "Item Transfer", endpoint: "stock-transfer", base: "/inventory/transfers", items: "TransferItems" },
  opname: { title: "Stock Opname", endpoint: "stock-opname", base: "/inventory/stock-opname", items: "OpnameItems" },
} as const;

interface Line {
  productId: number; code: string; name: string; unitId: number; unitName: string;
  qty: string; price: string; system: string; expDate: string; prodCode: string; info: string;
}

const cell = "h-8 w-full rounded border border-[#cfd4da] bg-white px-2 text-[13px] outline-none focus:border-primary disabled:bg-[#f3f4f6]";

export default function StockDocForm({ kind }: { kind: StockKind }) {
  const cfg = CFG[kind];
  const router = useRouter();
  const { id, copyId } = useDocRoute();
  const loadId = id ?? copyId;
  const isEdit = !!id;
  usePageTitle(isEdit ? `Ubah ${cfg.title}` : `${cfg.title} Baru`);

  const warehouses = useList("warehouse");
  const accounts = useList("account");
  const [code, setCode] = useState("");
  const [date, setDate] = useState(nowLocal());
  const [warehouseId, setWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [picker, setPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [del, setDel] = useState(false);
  const [msg, setMsg] = useState("");

  const whOpts = useMemo(() => warehouses.map((w) => ({ value: w.ID, label: `${w.Code} - ${w.Name}` })), [warehouses]);
  const accOpts = useMemo(() => accounts.filter((a) => /^[1-9]-/.test(String(a.Code))).map((a) => ({ value: a.ID, label: `${a.Code} - ${a.Name}` })), [accounts]);

  const load = useCallback(async () => {
    if (!loadId) return;
    const inc = `${cfg.items},${cfg.items}.Product,${cfg.items}.Product.Unit`;
    const r = await api.getOne<Row>(cfg.endpoint, loadId, { $include: inc }, ).catch(() => null);
    const d = r?.success ? r.data : null;
    if (!d) { setErr("Data tidak ditemukan"); return; }
    if (isEdit) { setCode(d.Code ?? ""); setDate(toLocalInput(d.Date)); }
    setWarehouseId(String(pick(d, "WarehouseID", "FromWarehouseID") ?? ""));
    setToWarehouseId(String(d.ToWarehouseID ?? ""));
    setAccountId(d.AccountID ? String(d.AccountID) : "");
    setNote(d.Description ?? d.Notes ?? "");
    setLines((d[cfg.items] ?? []).map((it: Row): Line => ({
      productId: it.ProductID, code: it.Product?.Code ?? "", name: it.Product?.Name ?? String(it.ProductID),
      unitId: it.UnitID ?? it.Product?.UnitID, unitName: it.Product?.Unit?.Name ?? "",
      qty: String(num(kind === "opname" ? it.CountedStock : it.Quantity)), price: String(num(it.UnitPrice)),
      system: String(num(it.SystemStock)), expDate: it.ExpDate ? String(it.ExpDate).slice(0, 10) : "", prodCode: it.ProductionCode ?? "", info: it.Note ?? "",
    })));
  }, [loadId, cfg, isEdit, kind]);
  useEffect(() => { void load(); }, [load]);

  const addItem = (p: Row) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.productId === p.ID);
      if (i >= 0 && kind !== "opname") return prev.map((l, j) => (j === i ? { ...l, qty: String(num(l.qty) + 1) } : l));
      if (i >= 0) return prev;
      return [...prev, {
        productId: p.ID, code: p.Code, name: p.Name, unitId: p.UnitID, unitName: p.Unit?.Name ?? "",
        qty: kind === "opname" ? String(num(p.Stock)) : "1", price: String(num(p.PurchasePrice)),
        system: String(num(p.Stock)), expDate: "", prodCode: "", info: "",
      }];
    });
  };
  const setLine = (i: number, patch: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const subtotal = lines.reduce((s, l) => s + (kind === "opname" ? (num(l.qty) - num(l.system)) * num(l.price) : num(l.qty) * num(l.price)), 0);
  const locked = false; // item dapat diubah (server membalik & menerapkan ulang mutasi stok)

  const save = async () => {
    setErr(""); setMsg("");
    if (!warehouseId) return setErr("Dept/Gudang wajib dipilih");
    if (kind === "transfer") {
      if (!toWarehouseId) return setErr("Gudang tujuan wajib dipilih");
      if (toWarehouseId === warehouseId) return setErr("Gudang asal dan tujuan tidak boleh sama");
    }
    if (lines.length === 0) return setErr("Tambahkan minimal 1 item");
    if (lines.some((l) => (kind === "opname" ? num(l.qty) < 0 : num(l.qty) <= 0))) return setErr("Jumlah item harus lebih dari 0");
    setSaving(true);
    try {
      const wid = Number(warehouseId);
      const items = lines.map((l) => {
        if (kind === "opname") return { ProductID: l.productId, SystemStock: num(l.system), CountedStock: num(l.qty), Difference: num(l.qty) - num(l.system), UnitID: l.unitId, UnitPrice: num(l.price), Note: l.info || undefined };
        if (kind === "transfer") return { ProductID: l.productId, Quantity: num(l.qty), UnitID: l.unitId, ExpDate: l.expDate || undefined, ProductionCode: l.prodCode || undefined };
        return { ProductID: l.productId, Quantity: num(l.qty), UnitID: l.unitId, UnitPrice: num(l.price), Subtotal: num(l.qty) * num(l.price) };
      });
      const body: Record<string, unknown> = { Date: toIso(date) };
      if (kind === "transfer") Object.assign(body, { FromWarehouseID: wid, ToWarehouseID: Number(toWarehouseId), Notes: note || undefined });
      else if (kind === "opname") Object.assign(body, { WarehouseID: wid, Notes: note || undefined, AccountID: accountId ? Number(accountId) : undefined });
      else Object.assign(body, { WarehouseID: wid, Description: note || undefined, AccountID: accountId ? Number(accountId) : null });
      // Opname tersimpan tidak dapat diganti itemnya (hapus & buat ulang); dokumen lain mengirim item baru.
      if (!(isEdit && kind === "opname")) body.Items = items;
      const res = isEdit ? await api.patch(cfg.endpoint, id!, body) : await api.post(cfg.endpoint, body);
      if (res.success) router.push(cfg.base);
      else setErr(res.message || "Gagal menyimpan");
    } catch (e) { setErr((e as Error).message || "Gagal menyimpan"); } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!id) return;
    try { const r = await api.delete(cfg.endpoint, id); if (r.success === false) { setErr(r.message || "Gagal menghapus"); setDel(false); } else router.push(cfg.base); }
    catch (e) { setErr((e as Error).message); setDel(false); }
  };

  const headers = kind === "opname"
    ? ["No", "Kode", "Keterangan", "Stok Sistem", "Stok Fisik", "Selisih", "Satuan", "Harga Pokok", "Info"]
    : kind === "transfer"
      ? ["No", "Kode", "Keterangan", "Jumlah", "Satuan", "Tgl Exp", "Kode Produksi"]
      : kind === "in"
        ? ["No", "Kode", "Nama", "Jumlah", "Satuan", "Harga", "Total"]
        : ["No", "Kode", "Nama", "Jumlah", "Satuan"];

  return (
    <DocShell backHref={cfg.base} error={err} notice={msg}>
      <KRow cols={3}>
        <KReadOnly label="No Transaksi" value={isEdit ? code : "Auto"} />
        <KInput label="Tanggal" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        <span />
      </KRow>
      <KRow cols={3}>
        <KSelect label={kind === "in" ? "Masuk Ke" : kind === "opname" ? "Gudang" : "Keluar Dari"} value={warehouseId} onChange={setWarehouseId} options={whOpts} />
        {kind === "transfer"
          ? <KSelect label="Masuk Ke" value={toWarehouseId} onChange={setToWarehouseId} options={whOpts.filter((o) => String(o.value) !== warehouseId)} />
          : <KSelect label="Kode Akun" value={accountId} onChange={setAccountId} options={accOpts} placeholder={kind === "in" ? "(default: Item Masuk)" : kind === "out" ? "(default: Item Keluar)" : "(default: Selisih Stok)"} />}
        <span />
      </KRow>
      <div className="overflow-x-auto border border-[#c9d0d8]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#c9d0d8] bg-white">
              {headers.map((h, i) => (
                <th key={h} className={cn("border-r border-[#e1e5e9] px-2 py-2 font-medium last:border-r-0", i >= 3 && ["Jumlah", "Harga", "Total", "Stok Sistem", "Stok Fisik", "Selisih", "Harga Pokok"].includes(h) ? "text-right" : "text-left")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 && <tr><td colSpan={headers.length} className="h-52 text-center text-[18px] text-[#9aa3ad]">No data</td></tr>}
            {lines.map((l, i) => (
              <tr key={l.productId} onClick={() => setSel(i)} className={cn("border-b border-[#eceff2]", sel === i && "bg-primary/5")}>
                <td className="px-2 py-1">{i + 1}</td>
                <td className="px-2 py-1 font-mono text-xs">{l.code}</td>
                <td className="px-2 py-1">{l.name}</td>
                {kind === "opname" ? (
                  <>
                    <td className="px-2 py-1 text-right">{fmt(l.system, 0)}</td>
                    <td className="w-28 p-1"><input disabled={locked} type="number" className={cn(cell, "text-right")} value={l.qty} onChange={(e) => setLine(i, { qty: e.target.value })} /></td>
                    <td className={cn("px-2 py-1 text-right font-medium", num(l.qty) - num(l.system) < 0 ? "text-danger" : "text-[#2e7d32]")}>{fmt(num(l.qty) - num(l.system), 0)}</td>
                    <td className="px-2 py-1">{l.unitName}</td>
                    <td className="w-32 px-2 py-1 text-right">{fmt(l.price, 0)}</td>
                    <td className="w-40 p-1"><input disabled={locked} className={cell} value={l.info} onChange={(e) => setLine(i, { info: e.target.value })} /></td>
                  </>
                ) : (
                  <>
                    <td className="w-24 p-1"><input disabled={locked} type="number" className={cn(cell, "text-right")} value={l.qty} onChange={(e) => setLine(i, { qty: e.target.value })} /></td>
                    <td className="px-2 py-1">{l.unitName}</td>
                    {kind === "in" && <td className="w-32 p-1"><input disabled={locked} type="number" className={cn(cell, "text-right")} value={l.price} onChange={(e) => setLine(i, { price: e.target.value })} /></td>}
                    {kind === "in" && <td className="w-32 px-2 py-1 text-right">{fmt(num(l.qty) * num(l.price), 0)}</td>}
                    {kind === "transfer" && <td className="w-36 p-1"><input disabled={locked} type="date" className={cell} value={l.expDate} onChange={(e) => setLine(i, { expDate: e.target.value })} /></td>}
                    {kind === "transfer" && <td className="w-32 p-1"><input disabled={locked} className={cell} value={l.prodCode} onChange={(e) => setLine(i, { prodCode: e.target.value })} /></td>}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={locked || !warehouseId} title={!warehouseId ? "Pilih Dept/Gudang dahulu" : ""} onClick={() => setPicker(true)} className="inline-flex h-10 items-center gap-1 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6] disabled:opacity-50"><Plus className="size-4" /> Item</button>
        <button type="button" disabled={locked || sel === null} onClick={() => { if (sel !== null) { setLines(lines.filter((_, i) => i !== sel)); setSel(null); } }} className="inline-flex h-10 w-11 items-center justify-center rounded border border-[#cfd4da] bg-white hover:bg-[#f3f4f6] disabled:opacity-50"><Trash2 className="size-4" /></button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_160px_220px]">
        <KInput label="Keterangan" value={note} onChange={(e) => setNote(e.target.value)} />
        <KReadOnly label="Item" value={fmt(lines.reduce((a, l) => a + num(l.qty), 0), 2)} align="right" />
        <KReadOnly label={kind === "opname" ? "Total Selisih Nilai" : "Sub Total"} value={fmt(kind === "out" ? lines.reduce((a, l) => a + num(l.qty) * num(l.price), 0) : subtotal, 2)} align="right" />
      </div>
      <DocActions
        onNew={() => router.push(`${cfg.base}/new`)}
        onSave={save}
        saving={saving}
        canDelete={isEdit}
        onDelete={() => setDel(true)}
      />
      <ItemPicker open={picker} onClose={() => setPicker(false)} onPick={addItem} />
      <ConfirmDelete open={del} onClose={() => setDel(false)} onConfirm={remove} label={code || cfg.title} />
    </DocShell>
  );
}
