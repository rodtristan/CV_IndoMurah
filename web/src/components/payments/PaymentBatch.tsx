"use client";

// Ketoko "Daftar Pembayaran Hutang/Piutang" + form "Bayar Hutang/Piutang Baru":
// satu dokumen (No Transaksi) untuk satu supplier/pelanggan, banyak faktur sekaligus
// (Sisa, Pot, Jml Bayar), Cara Bayar + Kode Akun + Nomor, Total Potongan, Total Bayar, Lunas.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDownAZ, ArrowUpZA, ChevronLeft, ChevronRight, Printer, Save, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn, localDateTime } from "@/lib/utils";
import { usePageTitle } from "@/lib/page-title";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { ConfirmModal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/Loader";
import { KCard, KCheckbox, KInput, KSelect, KTextarea } from "@/components/kform";
import { PartnerLookup } from "@/components/transaction/PartnerLookup";
import { printDocument } from "@/components/transaction/print";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
export type PayKind = "purchase" | "sale";

const CFG = {
  purchase: {
    endpoint: "PurchasePayments", partnerEp: "supplier", partnerLabel: "Supplier", listTitle: "Daftar Pembayaran Hutang",
    newTitle: "Bayar Hutang Baru", viewTitle: "Bayar Hutang", base: "/purchase/payments", remainingLabel: "hutang",
  },
  sale: {
    endpoint: "SalePayments", partnerEp: "customer", partnerLabel: "Pelanggan", listTitle: "Daftar Pembayaran Piutang",
    newTitle: "Bayar Piutang Baru", viewTitle: "Bayar Piutang", base: "/sale/payments", remainingLabel: "piutang",
  },
} as const;

const INSTRUMENT_LABEL: Record<string, string> = { CASH: "Tunai / Transfer", CEK: "Cek", BG: "Bilyet Giro", DEPOSIT: "Deposit" };
const money = (v: unknown) => Number(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dt = (v: unknown, withTime = true) => (v ? new Date(v as string).toLocaleString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) }) : "");
const r2 = (n: number) => Math.round(n * 100) / 100;
const inputCls = "h-9 w-full rounded border border-[#cfd4da] bg-white px-2.5 text-[13px] outline-none focus:border-info";

function monthRange() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return { from: `${d.getFullYear()}-${p(d.getMonth() + 1)}-01`, to: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())}` };
}

// ─── Daftar ───────────────────────────────────────────────────────────

const LIST_COLS: { key: string; label: string; width: number; align?: "right"; render?: (r: Row) => React.ReactNode }[] = [
  { key: "BatchCode", label: "No Transaksi", width: 150 },
  { key: "Date", label: "Tanggal", width: 140, render: (r) => dt(r.Date) },
  { key: "MethodName", label: "Cara Bayar", width: 130, render: (r) => `${r.MethodName ?? ""}${r.InstrumentType && r.InstrumentType !== "CASH" ? ` (${INSTRUMENT_LABEL[r.InstrumentType] ?? r.InstrumentType})` : ""}` },
  { key: "PartnerCode", label: "Kode", width: 100 },
  { key: "PartnerName", label: "Nama", width: 170 },
  { key: "Notes", label: "Keterangan", width: 170 },
  { key: "Total", label: "Total", width: 120, align: "right", render: (r) => money(r.Total) },
  { key: "Discount", label: "Potongan", width: 110, align: "right", render: (r) => money(r.Discount) },
  { key: "Invoices", label: "Faktur", width: 220 },
  { key: "Number", label: "Nomor", width: 120 },
  { key: "IsCleared", label: "Cair", width: 70, render: (r) => (r.IsCleared ? "Ya" : "Belum") },
  { key: "CreatedBy", label: "User Buat", width: 100 },
  { key: "UpdatedBy", label: "User Ubah", width: 100 },
];

export function PaymentBatchList({ kind }: { kind: PayKind }) {
  const c = CFG[kind];
  usePageTitle(c.listTitle);
  const router = useRouter();
  const range = useMemo(monthRange, []);
  const [draft, setDraft] = useState({ search: "", from: range.from, to: range.to, partnerId: "" });
  const [applied, setApplied] = useState(draft);
  const [sort, setSort] = useState("Date");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [partners, setPartners] = useState<Row[]>([]);
  const [showDelete, setShowDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const pageSize = 50;

  useEffect(() => {
    api.get<Row[]>(c.partnerEp, { $take: 100, $orderBy: { Name: "asc" } } as never).then((r) => setPartners(Array.isArray(r.data) ? r.data : [])).catch(() => undefined);
  }, [c.partnerEp]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ sort, dir, skip: String((page - 1) * pageSize), take: String(pageSize) });
      if (applied.search) q.set("search", applied.search);
      if (applied.from) q.set("from", applied.from);
      if (applied.to) q.set("to", applied.to);
      if (applied.partnerId) q.set("partnerId", applied.partnerId);
      const r = await api.get<Row[]>(`${c.endpoint}/batches?${q.toString()}`, undefined, { skipCache: true });
      setRows(Array.isArray(r.data) ? r.data : []);
      setTotal(r.meta?.total ?? 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [applied, c.endpoint, dir, page, sort]);

  useEffect(() => { void load(); }, [load]);

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const open = (r: Row) => router.push(`${c.base}/${encodeURIComponent(r.BatchCode)}`);

  const del = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await api.delete(`${c.endpoint}/batch`, encodeURIComponent(selected.BatchCode));
      toast.success("Pembayaran dihapus");
      setShowDelete(false);
      setSelected(null);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus");
    } finally { setBusy(false); }
  };

  const nav = (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="flex size-9 items-center justify-center rounded border border-[#cfd4da] bg-white disabled:opacity-40"><ChevronLeft className="size-4" /></button>
      <span className="min-w-16 text-center text-[13px]">Hal {page} / {pages}</span>
      <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="flex size-9 items-center justify-center rounded border border-[#cfd4da] bg-white disabled:opacity-40"><ChevronRight className="size-4" /></button>
      <GridActions
        onAdd={() => router.push(`${c.base}/new`)}
        onEdit={() => selected && open(selected)}
        onDelete={() => selected && setShowDelete(true)}
        disableEdit={!selected}
        disableDelete={!selected}
      />
    </div>
  );

  return (
    <PageWrapper>
      <Card className="p-3">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(draft); }} className="rounded border border-[#d6dbe0] bg-white p-3">
          <div className="grid grid-cols-1 items-end gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <label className="block sm:col-span-2"><span className="mb-1 block text-[13px]">Kata Kunci :</span>
              <input className={inputCls} value={draft.search} placeholder="No transaksi / faktur / nama" onChange={(e) => setDraft({ ...draft, search: e.target.value })} /></label>
            <label className="block"><span className="mb-1 block text-[13px]">Tanggal Dari :</span>
              <input type="date" className={inputCls} value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} /></label>
            <label className="block"><span className="mb-1 block text-[13px]">Tanggal Sampai :</span>
              <input type="date" className={inputCls} value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} /></label>
            <label className="block"><span className="mb-1 block text-[13px]">{c.partnerLabel} :</span>
              <select className={inputCls} value={draft.partnerId} onChange={(e) => setDraft({ ...draft, partnerId: e.target.value })}>
                <option value="">Semua</option>
                {partners.map((p) => <option key={p.ID} value={p.ID}>{p.Code} - {p.Name}</option>)}
              </select></label>
            <label className="block"><span className="mb-1 block text-[13px]">Urut Berdasar :</span>
              <select className={inputCls} value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                <option value="Date">Tanggal</option><option value="BatchCode">No Transaksi</option><option value="PartnerName">Nama</option><option value="Total">Total</option>
              </select></label>
            <div className="flex items-end gap-2">
              <button type="button" onClick={() => setDir(dir === "asc" ? "desc" : "asc")} className="flex h-9 w-14 items-center justify-center rounded border border-[#cfd4da] bg-white" title="Urutan">
                {dir === "asc" ? <ArrowDownAZ className="size-4" /> : <ArrowUpZA className="size-4" />}
              </button>
              <button type="submit" className="flex h-9 items-center gap-1.5 rounded bg-info px-5 text-[13px] font-medium text-white"><Search className="size-3.5" /> Cari</button>
            </div>
          </div>
          <div className="mt-3">{nav}</div>
        </form>

        <div className="mt-2 overflow-x-auto rounded border border-[#d6dbe0] bg-white">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#d6dbe0]">
                <th className="w-9 border-r border-[#e3e6ea]" />
                {LIST_COLS.map((col) => (
                  <th key={col.key} style={{ minWidth: col.width }} onClick={() => { if (sort === col.key) setDir(dir === "asc" ? "desc" : "asc"); else { setSort(col.key); setDir("asc"); } }}
                    className={cn("cursor-pointer whitespace-nowrap border-r border-[#e3e6ea] px-2 py-2 text-left font-normal hover:bg-[#f5f7f9]", col.align === "right" && "text-right")}>
                    {col.label}{sort === col.key ? (dir === "asc" ? " ▲" : " ▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr><td colSpan={LIST_COLS.length + 1}><LoadingState className="py-8" /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={LIST_COLS.length + 1} className="h-40 text-center text-[#9aa3ad]">No data</td></tr>
              ) : rows.map((r) => (
                <tr key={r.BatchCode} onClick={() => setSelected(r)} onDoubleClick={() => open(r)}
                  className={cn("cursor-pointer border-b border-[#eef0f2] hover:bg-[#f5f9fd]", selected?.BatchCode === r.BatchCode && "bg-[#cfe0ef] hover:bg-[#cfe0ef]")}>
                  <td className="w-9 border-r border-[#e3e6ea] px-2 text-center"><RowEditIcon onClick={() => open(r)} /></td>
                  {LIST_COLS.map((col) => (
                    <td key={col.key} className={cn("whitespace-nowrap border-r border-[#e3e6ea] px-2 py-2", col.align === "right" && "text-right")}>
                      {col.render ? col.render(r) : String(r[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex items-center justify-between rounded border border-[#d6dbe0] bg-white p-3">{nav}<span className="text-[12px] text-[#6b7580]">{total} dokumen</span></div>
      </Card>
      <ConfirmModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={del} title="Hapus Pembayaran"
        message={`Hapus pembayaran ${selected?.BatchCode ?? ""}? Semua faktur di dokumen ini akan kembali ke sisa ${c.remainingLabel} sebelumnya.`}
        confirmText="Hapus" variant="danger" loading={busy} />
    </PageWrapper>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────

interface Line { invoiceId: number; code: string; date: string; dueDate: string; remaining: number; total: number; discount: string; amount: string }

export function PaymentBatchForm({ kind, code }: { kind: PayKind; code?: string }) {
  const c = CFG[kind];
  const router = useRouter();
  const isNew = !code;
  usePageTitle(isNew ? c.newTitle : `${c.viewTitle} : ${decodeURIComponent(code ?? "")}`);
  const [partner, setPartner] = useState<{ id: number; name: string } | null>(null);
  const [date, setDate] = useState(() => localDateTime(new Date()));
  const [number, setNumber] = useState("");
  const [methodId, setMethodId] = useState("");
  const [instrument, setInstrument] = useState("CASH");
  const [accountId, setAccountId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [methods, setMethods] = useState<Row[]>([]);
  const [accounts, setAccounts] = useState<Row[]>([]);
  const [doc, setDoc] = useState<Row | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    api.get<Row[]>("payment-methods", { $take: 100 } as never).then((r) => {
      const list = Array.isArray(r.data) ? r.data.filter((m) => m.Code !== "DEPOSIT") : [];
      setMethods(list);
      if (isNew && list[0]) setMethodId((m) => m || String((list.find((x) => x.Code === "CASH") ?? list[0]).ID));
    }).catch(() => undefined);
    api.get<Row[]>("account", { $take: 500, $orderBy: { Code: "asc" } } as never).then((r) => setAccounts(Array.isArray(r.data) ? r.data : [])).catch(() => undefined);
  }, [isNew]);

  useEffect(() => {
    if (!code) return;
    api.get<Row>(`${c.endpoint}/batch/${code}`, undefined, { skipCache: true })
      .then((r) => {
        const d = r.data;
        if (!d) return;
        setDoc(d);
        setPartner(d.Partner ? { id: d.Partner.ID, name: d.Partner.Name } : null);
        setDate(localDateTime(new Date(String(d.Date))));
        setNumber(d.Number ?? "");
        setMethodId(d.Method ? String(d.Method.ID) : "");
        setInstrument(d.InstrumentType ?? "CASH");
        setAccountId(d.AccountID ? String(d.AccountID) : "");
        setNotes(d.Notes ?? "");
        setLines((d.Lines ?? []).map((l: Row) => ({
          invoiceId: l.InvoiceID, code: l.Code, date: l.Date, dueDate: l.DueDate, remaining: Number(l.Remaining), total: Number(l.Total),
          discount: String(l.Discount ?? 0), amount: String(l.Amount ?? 0),
        })));
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Gagal memuat pembayaran"))
      .finally(() => setLoading(false));
  }, [code, c.endpoint]);

  const pickPartner = async (id: number, name: string) => {
    setPartner({ id, name });
    const r = await api.get<Row[]>(`${c.endpoint}/outstanding/${id}`, undefined, { skipCache: true }).catch(() => null);
    const list = Array.isArray(r?.data) ? r!.data : [];
    setLines(list.map((l: Row) => ({
      invoiceId: l.ID, code: l.Code, date: l.Date, dueDate: l.DueDate, remaining: Number(l.Remaining ?? l.Total), total: Number(l.Total),
      discount: "0", amount: "0",
    })));
    if (!list.length) toast.info(`Tidak ada faktur dengan sisa ${c.remainingLabel} untuk ${name}`);
  };

  const n = (v: string) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
  const totalDiscount = r2(lines.reduce((a, l) => a + n(l.discount), 0));
  const totalPay = r2(lines.reduce((a, l) => a + n(l.amount), 0));
  const allPaid = lines.length > 0 && lines.every((l) => n(l.amount) + n(l.discount) >= l.remaining - 0.005);
  const setLine = (i: number, p: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...p } : l)));

  const save = async () => {
    if (!partner) { toast.error(`${c.partnerLabel} wajib dipilih`); return; }
    const payLines = lines.filter((l) => n(l.amount) + n(l.discount) > 0);
    if (!payLines.length) { toast.error("Isi Jml Bayar atau Pot minimal pada satu faktur"); return; }
    const over = payLines.find((l) => n(l.amount) + n(l.discount) > l.remaining + 0.005);
    if (over) { toast.error(`Pembayaran ${over.code} melebihi sisa ${money(over.remaining)}`); return; }
    if (!methodId) { toast.error("Cara Bayar wajib dipilih"); return; }
    setSaving(true);
    try {
      const res = await api.post<Row>(`${c.endpoint}/batch`, {
        PartnerID: partner.id, Date: new Date(date).toISOString(), MethodID: Number(methodId), InstrumentType: instrument,
        AccountID: accountId ? Number(accountId) : null, Number: number || undefined, DueDate: dueDate || undefined, Notes: notes || undefined,
        Lines: payLines.map((l) => ({ InvoiceID: l.invoiceId, Amount: r2(n(l.amount)), Discount: r2(n(l.discount)) })),
      });
      toast.success(`Pembayaran ${res.data?.BatchCode ?? ""} tersimpan`);
      router.push(c.base);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!code) return;
    setSaving(true);
    try {
      await api.delete(`${c.endpoint}/batch`, code);
      toast.success("Pembayaran dihapus");
      router.push(c.base);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus");
    } finally { setSaving(false); setShowDelete(false); }
  };

  const print = () => printDocument({
    title: c.viewTitle, code: doc?.BatchCode ?? "(Auto)", date: date.slice(0, 10), partnerLabel: c.partnerLabel, partner: partner?.name ?? "-",
    rows: lines.filter((l) => n(l.amount) + n(l.discount) > 0).map((l) => ({ code: l.code, name: `Jatuh tempo ${dt(l.dueDate, false)}`, qty: "1", unit: "", price: n(l.amount), disc: n(l.discount), subtotal: n(l.amount) })),
    totals: [{ label: "Total Potongan", value: totalDiscount }, { label: "Total Bayar", value: totalPay }], notes,
  });

  if (loading) return <LoadingState className="py-16" />;
  const ro = !isNew;
  const methodOpts = methods.map((m) => ({ value: String(m.ID), label: m.Name }));
  const accountOpts = accounts.map((a) => ({ value: String(a.ID), label: `${a.Code} - ${a.Name}` }));

  return (
    <PageWrapper>
      <KCard>
        <div className="grid gap-x-3 sm:grid-cols-2 lg:grid-cols-4">
          <KInput label="No Transaksi" value={doc?.BatchCode ?? "Auto"} readOnly className="border-dashed bg-[#f7f8fa]" />
          <KInput label="Tanggal" type="datetime-local" value={date} disabled={ro} onChange={(e) => setDate(e.target.value)} />
          <PartnerLookup label={c.partnerLabel} endpoint={c.partnerEp} value={partner?.name ?? ""} disabled={ro}
            onPick={(p) => void pickPartner(Number(p.value), p.label)} onClear={() => { setPartner(null); setLines([]); }} />
          <KInput label="Nomor" value={number} disabled={ro} onChange={(e) => setNumber(e.target.value)} placeholder="No. cek / BG / referensi" />
          <KSelect label="Cara Bayar" value={methodId} disabled={ro} onChange={setMethodId} options={methodOpts} placeholder="Pilih..." />
          <KSelect label="Jenis" value={instrument} disabled={ro} onChange={(v) => setInstrument(v || "CASH")}
            options={Object.entries(INSTRUMENT_LABEL).map(([value, label]) => ({ value, label }))} placeholder="Tunai / Transfer" />
          <KSelect label="Kode Akun" value={accountId} disabled={ro || instrument === "DEPOSIT"} onChange={setAccountId} options={accountOpts} placeholder="Select... (default dari cara bayar)" />
          {(instrument === "CEK" || instrument === "BG") && (
            <KInput label="Jatuh Tempo Cek/BG" type="date" value={dueDate} disabled={ro} onChange={(e) => setDueDate(e.target.value)} />
          )}
        </div>

        <div className="mt-2 overflow-x-auto border border-[#d5d9de]">
          <table className="w-full min-w-[820px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#d5d9de] bg-[#f5f6f8] text-left">
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">No Transaksi</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Tanggal</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Tanggal JT</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 text-right font-normal">Sisa</th>
                <th className="w-32 border-r border-[#e3e6ea] px-2 py-2 text-right font-normal">Pot</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 text-right font-normal">Total</th>
                <th className="w-36 px-2 py-2 text-right font-normal">Jml Bayar</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr><td colSpan={7} className="h-40 text-center text-[#9aa3ad]">{partner ? "No data" : `Pilih ${c.partnerLabel.toLowerCase()} untuk menampilkan faktur`}</td></tr>
              ) : lines.map((l, i) => (
                <tr key={l.invoiceId} onClick={() => setSelectedLine(i)} className={cn("border-b border-[#eef0f2]", selectedLine === i && "bg-[#e8f1fa]")}>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5 font-mono text-xs">{l.code}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5">{dt(l.date)}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5">{dt(l.dueDate)}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5 text-right">{money(l.remaining)}</td>
                  <td className="border-r border-[#eef0f2] p-1">
                    <input type="number" min={0} step="any" disabled={ro} value={l.discount} onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        // Faktur yang dilunasi tetap lunas: Jml Bayar = Sisa − Pot (tidak boleh melebihi sisa).
                        const disc = n(e.target.value);
                        const wasPaid = n(l.amount) + n(l.discount) >= l.remaining - 0.005;
                        const cap = r2(Math.max(l.remaining - disc, 0));
                        setLine(i, { discount: e.target.value, ...(wasPaid || n(l.amount) > cap ? { amount: String(cap) } : {}) });
                      }} className={cn(inputCls, "text-right")} />
                  </td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5 text-right">{money(l.total)}</td>
                  <td className="p-1">
                    <input type="number" min={0} step="any" disabled={ro} value={l.amount} onFocus={(e) => e.target.select()}
                      onDoubleClick={() => !ro && setLine(i, { amount: String(r2(Math.max(l.remaining - n(l.discount), 0))) })}
                      onChange={(e) => setLine(i, { amount: e.target.value })} className={cn(inputCls, "text-right")} title="Klik dua kali untuk melunasi sisa" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!ro && (
          <button type="button" disabled={selectedLine === null} onClick={() => { if (selectedLine !== null) { setLines((ls) => ls.filter((_, j) => j !== selectedLine)); setSelectedLine(null); } }}
            className="mt-2 inline-flex h-9 items-center gap-1.5 rounded border border-[#cfd4da] bg-white px-3 text-[13px] disabled:opacity-40">
            <Trash2 className="size-4" /> Hapus Detail
          </button>
        )}

        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          <KTextarea label="Keterangan" rows={2} value={notes} disabled={ro} onChange={(e) => setNotes(e.target.value)} />
          <KInput label="Total Potongan" value={money(totalDiscount)} readOnly className="border-dashed bg-[#f7f8fa] text-right" />
          <div>
            <KInput label="Total Bayar" value={money(totalPay)} readOnly className="border-dashed bg-[#f3d9f3] text-right text-[15px] font-bold" />
            <KCheckbox label="Lunas" checked={allPaid} caption="Lunasi semua faktur"
              onChange={(v) => { if (!ro) setLines((ls) => ls.map((l) => ({ ...l, amount: v ? String(r2(Math.max(l.remaining - n(l.discount), 0))) : "0" }))); }} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {!ro && (
            <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-[14px] hover:bg-[#f3f4f6] disabled:opacity-50">
              <Save className="size-4 text-info" /> {saving ? "Menyimpan..." : "Simpan"}
            </button>
          )}
          {ro && (
            <button type="button" disabled={saving} onClick={() => setShowDelete(true)} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-[14px] hover:bg-[#f3f4f6]">
              <Trash2 className="size-4 text-danger" /> Hapus
            </button>
          )}
          <button type="button" onClick={print} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-[14px] hover:bg-[#f3f4f6]">
            <Printer className="size-4" /> Cetak
          </button>
          <button type="button" onClick={() => router.push(c.base)} className="h-10 rounded border border-[#cfd4da] bg-white px-4 text-[14px] hover:bg-[#f3f4f6]">Kembali</button>
        </div>
      </KCard>
      <ConfirmModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => void remove()} title="Hapus Pembayaran"
        message="Hapus dokumen pembayaran ini? Sisa faktur akan kembali seperti sebelum dibayar." confirmText="Hapus" variant="danger" loading={saving} />
    </PageWrapper>
  );
}
