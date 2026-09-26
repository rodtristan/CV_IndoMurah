"use client";

// History Harga Beli / History Harga Jual Ketoko: filter Item Dari/Sampai (kode), Tanggal Dari/Sampai,
// Supplier/Pelanggan, Sales (jual); tiga tingkat urutan (Urut-1/2/3 + A→Z/Z→A); tombol Proses.
// Kolom: Supplier/Pelanggan, No Transaksi, Kode Item, Nama Item, Satuan, Harga, Potongan, Pajak.

import { useCallback, useState } from "react";
import { ArrowDownAZ, ArrowUpZA, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn, formatNumber, localDate } from "@/lib/utils";
import { KCard, KInput, KSelect } from "@/components/kform";
import { PartnerLookup } from "./PartnerLookup";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { LoadingState } from "@/components/ui/Loader";
import { usePageTitle } from "@/lib/page-title";

type Rec = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Kind = "purchase" | "sale";
interface Picked { id: number; name: string; code?: string }

const PAGE = 100;

const CFG = {
  purchase: {
    title: "History Harga Beli", endpoint: "purchase-item", doc: "Purchase", partner: "Supplier", partnerId: "SupplierID",
    partnerLabel: "Supplier", partnerEp: "supplier", include: "Purchase,Purchase.Supplier,Product,Unit",
  },
  sale: {
    title: "History Harga Jual", endpoint: "SaleItem", doc: "Sale", partner: "Customer", partnerId: "CustomerID",
    partnerLabel: "Pelanggan", partnerEp: "customer", include: "Sale,Sale.Customer,Sale.SalesPerson,Product,Unit",
  },
} as const;

const firstOfMonth = () => { const d = new Date(); d.setDate(1); return localDate(d); };
const lastOfMonth = () => { const d = new Date(); d.setMonth(d.getMonth() + 1, 0); return localDate(d); };

export function PriceHistory({ kind }: { kind: Kind }) {
  const c = CFG[kind];
  usePageTitle(c.title);
  const SORT_OPTS = [
    { value: `${c.doc}.Date`, label: "Tanggal" },
    { value: `${c.doc}.${c.partner}.Name`, label: c.partnerLabel },
    { value: "Product.Code", label: "Kode Item" },
    { value: "Product.Name", label: "Nama Item" },
    { value: `${c.doc}.Code`, label: "No Transaksi" },
    { value: "UnitPrice", label: "Harga" },
  ];
  const [itemFrom, setItemFrom] = useState<Picked | null>(null);
  const [itemTo, setItemTo] = useState<Picked | null>(null);
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(lastOfMonth());
  const [partner, setPartner] = useState<Picked | null>(null);
  const [sales, setSales] = useState<Picked | null>(null);
  const [sorts, setSorts] = useState<{ key: string; dir: "asc" | "desc" }[]>([
    { key: kind === "purchase" ? `${c.doc}.${c.partner}.Name` : `${c.doc}.Date`, dir: "asc" },
    { key: kind === "purchase" ? `${c.doc}.Date` : `${c.doc}.${c.partner}.Name`, dir: "asc" },
    { key: "Product.Code", dir: "asc" },
  ]);
  const [rows, setRows] = useState<Rec[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  const load = useCallback(async (pg: number) => {
    setLoading(true);
    try {
      const where: Rec = {};
      const dateCond: Rec = {};
      if (from) dateCond.dategte = from;
      if (to) dateCond.datelte = to;
      if (Object.keys(dateCond).length) where[`${c.doc}.Date`] = dateCond;
      if (partner) where[`${c.doc}.${c.partnerId}`] = partner.id;
      if (sales && kind === "sale") where["Sale.SalesPersonID"] = sales.id;
      const codeCond: Rec = {};
      if (itemFrom?.code) codeCond.sgte = itemFrom.code;
      if (itemTo?.code) codeCond.slte = itemTo.code;
      if (Object.keys(codeCond).length) where["Product.Code"] = codeCond;
      // dokumen batal tidak ikut
      if (kind === "purchase") where["Purchase.Status.Code"] = { ne: "CANCELLED" };
      else where["Sale.PaymentStatus.Code"] = { ne: "CANCELLED" };
      const orderBy: Rec = {};
      for (const s of sorts) if (s.key && !(s.key in orderBy)) orderBy[s.key] = s.dir;
      const res = await api.get<Rec[]>(c.endpoint, { $include: c.include, $where: where, $orderBy: orderBy, $skip: (pg - 1) * PAGE, $take: PAGE }, { skipCache: true });
      setRows(Array.isArray(res.data) ? res.data : []);
      setTotal(Number(res.meta?.total ?? (Array.isArray(res.data) ? res.data.length : 0)));
      setPage(pg);
      setRan(true);
    } finally {
      setLoading(false);
    }
  }, [c, from, to, partner, sales, itemFrom, itemTo, sorts, kind]);

  const pages = Math.max(1, Math.ceil(total / PAGE));
  const setSort = (i: number, p: Partial<{ key: string; dir: "asc" | "desc" }>) => setSorts((ss) => ss.map((s, j) => (j === i ? { ...s, ...p } : s)));
  const pickItem = (set: (p: Picked | null) => void) => (p: { value: string; label: string; row: Rec }) =>
    set({ id: Number(p.value), name: String(p.row.Code ?? p.label), code: String(p.row.Code ?? "") });

  const money = (v: unknown) => formatNumber(Number(v ?? 0), 2);
  const doc = (r: Rec) => r[c.doc] ?? {};

  return (
    <PageWrapper>
      <KCard>
        <div className="grid gap-x-4 lg:grid-cols-[1fr_1fr_320px]">
          <div className="grid gap-x-3 sm:grid-cols-2 lg:col-span-2">
            <PartnerLookup label="Item Dari" endpoint="products" value={itemFrom?.name ?? ""} onPick={pickItem(setItemFrom)} onClear={() => setItemFrom(null)} />
            <PartnerLookup label="Item Sampai" endpoint="products" value={itemTo?.name ?? ""} onPick={pickItem(setItemTo)} onClear={() => setItemTo(null)} />
            <KInput label="Tanggal Dari" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <KInput label="Tanggal Sampai" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            <PartnerLookup label={c.partnerLabel} endpoint={c.partnerEp} value={partner?.name ?? ""} placeholder="Select..."
              onPick={(p) => setPartner({ id: Number(p.value), name: `${String(p.row.Code ?? "")}, ${p.label}` })} onClear={() => setPartner(null)} />
            {kind === "sale" && (
              <PartnerLookup label="Sales" endpoint="sales-person" value={sales?.name ?? ""} placeholder="Select..."
                onPick={(p) => setSales({ id: Number(p.value), name: p.label })} onClear={() => setSales(null)} />
            )}
          </div>
          <div>
            {sorts.map((s, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <KSelect label={kind === "purchase" ? `Urut-${i + 1}` : "Urut Berdasar"} value={s.key} onChange={(v) => setSort(i, { key: v })} options={SORT_OPTS} placeholder="(tidak diurutkan)" />
                </div>
                <button type="button" title={s.dir === "asc" ? "A → Z" : "Z → A"} onClick={() => setSort(i, { dir: s.dir === "asc" ? "desc" : "asc" })}
                  className="mb-3 flex h-10 w-12 items-center justify-center rounded border border-[#cfd4da] bg-white hover:bg-[#f3f4f6]">
                  {s.dir === "asc" ? <ArrowDownAZ className="size-4" /> : <ArrowUpZA className="size-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={loading} onClick={() => void load(1)} className="inline-flex h-10 items-center gap-2 rounded bg-[#8a9a4a] px-5 text-sm text-white hover:bg-[#7a8a3c] disabled:opacity-60">
            <Settings className="size-4" /> Proses
          </button>
          {ran && (
            <div className="ml-2 flex items-center gap-2 text-sm">
              <button type="button" disabled={page <= 1 || loading} onClick={() => void load(page - 1)} className="flex size-9 items-center justify-center rounded border border-[#cfd4da] bg-white disabled:opacity-40"><ChevronLeft className="size-4" /></button>
              <span>Hal {page} / {pages}</span>
              <button type="button" disabled={page >= pages || loading} onClick={() => void load(page + 1)} className="flex size-9 items-center justify-center rounded border border-[#cfd4da] bg-white disabled:opacity-40"><ChevronRight className="size-4" /></button>
              <span className="text-muted">{total} data</span>
            </div>
          )}
        </div>
      </KCard>

      <div className="mt-3 overflow-x-auto rounded border border-[#d5d9de] bg-white">
        {loading ? <LoadingState className="py-16" /> : (
          <table className="w-full min-w-[1100px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#d5d9de] bg-[#f5f6f8] text-left">
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">{c.partnerLabel}</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">No Transaksi</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Tanggal</th>
                {kind === "sale" && <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Sales</th>}
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Kode Item</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Nama Item</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Satuan</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 text-right font-normal">Jumlah</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 text-right font-normal">Harga</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 text-right font-normal">Potongan</th>
                <th className="px-2 py-2 text-right font-normal">{kind === "purchase" ? "Tax" : "Pajak"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={11} className="h-40 text-center text-[#9aa3ad]">{ran ? "No data" : "Atur filter lalu klik Proses"}</td></tr>
              ) : rows.map((r) => {
                const d = doc(r);
                const p = d[c.partner] ?? {};
                const taxPct = Number(d.TaxPercent ?? 0);
                return (
                  <tr key={r.ID} className="border-b border-[#eef0f2] hover:bg-[#f7fafc]">
                    <td className="border-r border-[#eef0f2] px-2 py-1.5">{p.Code ? `${p.Code}, ${p.Name}` : p.Name ?? "-"}</td>
                    <td className="border-r border-[#eef0f2] px-2 py-1.5 font-mono text-xs">{d.Code}</td>
                    <td className="border-r border-[#eef0f2] px-2 py-1.5">{d.Date ? new Date(d.Date).toLocaleString("id-ID") : ""}</td>
                    {kind === "sale" && <td className="border-r border-[#eef0f2] px-2 py-1.5">{d.SalesPerson?.Name ?? ""}</td>}
                    <td className="border-r border-[#eef0f2] px-2 py-1.5">{r.Product?.Code}</td>
                    <td className="border-r border-[#eef0f2] px-2 py-1.5">{r.Product?.Name}</td>
                    <td className="border-r border-[#eef0f2] px-2 py-1.5">{r.Unit?.Name ?? ""}</td>
                    <td className="border-r border-[#eef0f2] px-2 py-1.5 text-right">{formatNumber(Number(r.Quantity ?? 0), 2)}</td>
                    <td className="border-r border-[#eef0f2] px-2 py-1.5 text-right">{money(r.UnitPrice)}</td>
                    <td className="border-r border-[#eef0f2] px-2 py-1.5 text-right">{money(r.DiscountAmount)}</td>
                    <td className={cn("px-2 py-1.5 text-right")}>{d.TaxMode && d.TaxMode !== "NON" ? `${formatNumber(taxPct, 2)}%` : "0"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </PageWrapper>
  );
}
