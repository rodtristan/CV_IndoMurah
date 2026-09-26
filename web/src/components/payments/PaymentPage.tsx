"use client";

// Daftar Pembayaran (pembelian / penjualan) + Status Lunas Bg/Cek.
// Talks to /PurchasePayments|/SalePayments (list, create, update, delete, PATCH :id/clear).
// Jenis "Deposit" (InstrumentType DEPOSIT, no MethodID needed) pays from the customer/supplier deposit balance.
// Every save posts the automatic journal on the API; cek/BG only post when marked lunas (cair).

import { toDateInput } from "@/components/transaction/calc";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { KCard, KInput, KNumber, KRow, KSelect } from "@/components/kform";
import { ConfirmDelete, fmt, fmtDate, num, useList, type Row } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { api } from "@/lib/api-client";
import { cn, localDate } from "@/lib/utils";
import { LoadingState } from "@/components/ui/Loader";

type Kind = "purchase" | "sale";

const CFG = {
  purchase: {
    endpoint: "PurchasePayments", parent: "purchases", parentKey: "PurchaseID", parentRel: "Purchase", partyRel: "Supplier", partyLabel: "Supplier",
    parentInclude: "Supplier,PurchasePayments", parentLabel: "Pembelian", title: "Daftar Pembayaran Pembelian", chequeTitle: "Status Lunas Bg/Cek Pembelian",
  },
  sale: {
    endpoint: "SalePayments", parent: "sales", parentKey: "SaleID", parentRel: "Sale", partyRel: "Customer", partyLabel: "Pelanggan",
    parentInclude: "Customer,SalePayments", parentLabel: "Penjualan", title: "Daftar Pembayaran Penjualan", chequeTitle: "Status Lunas Cek/Bg Penjualan",
  },
} as const;

const INSTRUMENTS = [{ value: "CASH", label: "Tunai / Transfer" }, { value: "CEK", label: "Cek" }, { value: "BG", label: "Bilyet Giro (BG)" }, { value: "DEPOSIT", label: "Deposit" }];
const CHEQUES = INSTRUMENTS.filter((i) => i.value === "CEK" || i.value === "BG");
const instLabel = (v: string) => INSTRUMENTS.find((i) => i.value === v)?.label ?? v;
const dateInput = (iso?: string | null) => toDateInput(iso);
const today = () => localDate();
const btn = "inline-flex h-9 items-center gap-1.5 rounded border border-[#cfd4da] bg-white px-3 text-sm hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50";

interface FormState { id?: number; parentId: string; methodId: string; amount: string; instrument: string; date: string; dueDate: string; ref: string; notes: string }
const emptyForm = (): FormState => ({ parentId: "", methodId: "", amount: "", instrument: "CASH", date: today(), dueDate: "", ref: "", notes: "" });

export function PaymentPage({ kind, chequeOnly = false }: { kind: Kind; chequeOnly?: boolean }) {
  const c = CFG[kind];
  const methods = useList("payment-methods", { $take: 200 });
  const methodOpts = useMemo(() => methods.filter((m) => m.Code !== "DEPOSIT").map((m) => ({ value: m.ID, label: m.Name })), [methods]);

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ from: "", to: "", methodId: "", instrumentType: "", cleared: chequeOnly ? "false" : "", search: "" });
  const [applied, setApplied] = useState(filters);
  const [sel, setSel] = useState<Row | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ skip: String((page - 1) * pageSize), take: String(pageSize) });
      for (const [k, v] of Object.entries(applied)) if (v) q.set(k, v);
      if (chequeOnly) q.set("chequeOnly", "true");
      const r = await api.get<Row[]>(`${c.endpoint}/list?${q.toString()}`, undefined, { skipCache: true });
      setRows(r.data ?? []);
      setTotal(r.meta?.total ?? r.data?.length ?? 0);
    } catch (e) { setErr((e as Error).message || "Gagal memuat data"); setRows([]); } finally { setLoading(false); }
  }, [applied, page, chequeOnly, c.endpoint]);
  useEffect(() => { void load(); }, [load]);

  const flash = (m: string) => { setOk(m); setErr(""); };

  const clearRow = async (row: Row) => {
    setBusy(true); setErr(""); setOk("");
    try {
      const r = await api.patch(c.endpoint, `${row.ID}/clear`, {});
      if (r.success === false) throw new Error(r.message || "Gagal menandai lunas");
      flash("Pembayaran ditandai lunas."); setSel(null); await load();
    } catch (e) { setErr((e as Error).message || "Gagal menandai lunas"); } finally { setBusy(false); }
  };

  const doDelete = async () => {
    if (!sel) return;
    setBusy(true); setErr(""); setOk("");
    try {
      const r = await api.delete(c.endpoint, sel.ID);
      if (r.success === false) throw new Error(r.message || "Gagal menghapus");
      setDel(false); setSel(null); flash("Pembayaran dihapus."); await load();
    } catch (e) { setErr((e as Error).message || "Gagal menghapus"); setDel(false); } finally { setBusy(false); }
  };

  const save = async () => {
    if (!form) return;
    setErr(""); setOk("");
    if (!form.id && !form.parentId) return setErr(`${c.parentLabel} wajib dipilih`);
    const isDeposit = form.instrument === "DEPOSIT";
    if (!isDeposit && !form.methodId) return setErr("Metode pembayaran wajib dipilih");
    if (!(num(form.amount) > 0)) return setErr("Jumlah harus lebih dari 0");
    if ((form.instrument === "CEK" || form.instrument === "BG") && !form.dueDate) return setErr("Tanggal jatuh tempo cek/BG wajib diisi");
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        MethodID: isDeposit || !form.methodId ? undefined : Number(form.methodId), Amount: num(form.amount), InstrumentType: form.instrument,
        Date: new Date(form.date).toISOString(), ReferenceNumber: form.ref || undefined, Notes: form.notes || undefined,
        DueDate: (form.instrument === "CEK" || form.instrument === "BG") && form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      };
      const r = form.id
        ? await api.put(c.endpoint, form.id, body)
        : await api.post(c.endpoint, { ...body, [c.parentKey]: Number(form.parentId) });
      if (r.success === false) throw new Error(r.message || "Gagal menyimpan");
      flash("Pembayaran tersimpan."); setForm(null); setSel(null); await load();
    } catch (e) { setErr((e as Error).message || "Gagal menyimpan"); } finally { setSaving(false); }
  };

  const openEdit = (r: Row) => setForm({
    id: r.ID, parentId: String(r[c.parentKey]), methodId: String(r.MethodID), amount: String(r.Amount), instrument: r.InstrumentType || "CASH",
    date: dateInput(r.Date), dueDate: dateInput(r.DueDate), ref: r.ReferenceNumber ?? "", notes: r.Notes ?? "",
  });

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const title = chequeOnly ? c.chequeTitle : c.title;

  return (
    <PageWrapper>
      <KCard>
        <h2 className="mb-3 text-[18px] font-medium">{title}</h2>
        {err && <div className="mb-3 rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</div>}
        {ok && <div className="mb-3 rounded border border-[#4caf50]/40 bg-[#e8f5e9] px-3 py-2 text-sm text-[#2e7d32]">{ok}</div>}

        {form ? (
          <PaymentForm kind={kind} form={form} setForm={setForm} methodOpts={methodOpts} saving={saving} onSave={save} onCancel={() => setForm(null)} />
        ) : (
          <>
            <KRow cols={4}>
              <KInput label="Dari Tanggal" type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
              <KInput label="Sampai Tanggal" type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
              <KSelect label="Metode" value={filters.methodId} onChange={(v) => setFilters({ ...filters, methodId: v })} options={methodOpts} placeholder="Semua" />
              {chequeOnly
                ? <KSelect label="Jenis" value={filters.instrumentType} onChange={(v) => setFilters({ ...filters, instrumentType: v })} options={CHEQUES} placeholder="Cek & BG" />
                : <KSelect label="Status" value={filters.cleared} onChange={(v) => setFilters({ ...filters, cleared: v })} options={[{ value: "true", label: "Lunas / Cair" }, { value: "false", label: "Belum Cair" }]} placeholder="Semua" />}
            </KRow>
            <KRow cols={4}>
              {chequeOnly && <KSelect label="Status" value={filters.cleared} onChange={(v) => setFilters({ ...filters, cleared: v })} options={[{ value: "false", label: "Belum Lunas" }, { value: "true", label: "Sudah Lunas" }]} placeholder="Semua" />}
              <KInput label="Kata Kunci" placeholder={`No. transaksi / ${c.partyLabel.toLowerCase()} / no. ref`} value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </KRow>
            <div className="mb-3 flex flex-wrap gap-2">
              <button type="button" className={btn} onClick={() => { setPage(1); setSel(null); setApplied(filters); }}>Tampilkan</button>
              {!chequeOnly && <button type="button" className={btn} onClick={() => { setOk(""); setErr(""); setForm(emptyForm()); }}><Plus className="size-4" /> Tambah</button>}
              <button type="button" className={btn} disabled={!sel} onClick={() => sel && openEdit(sel)}><Pencil className="size-4" /> Ubah</button>
              <button type="button" className={btn} disabled={!sel} onClick={() => setDel(true)}><Trash2 className="size-4" /> Hapus</button>
              <button type="button" className={cn(btn, "border-primary text-primary")} disabled={!sel || sel.IsCleared || busy} onClick={() => sel && clearRow(sel)}><Check className="size-4" /> Tandai Lunas</button>
            </div>
            <div className="overflow-x-auto border border-[#c9d0d8]">
              <table className="w-full text-[13px]">
                <thead><tr className="border-b border-[#c9d0d8] bg-[#f6f7f9]">
                  {["Tanggal", "No. Transaksi", c.partyLabel, "Metode", "Jenis", "No. Ref / Cek", "Jatuh Tempo", "Jumlah", "Status"].map((h) => (
                    <th key={h} className={cn("px-2 py-2 font-medium", h === "Jumlah" ? "text-right" : "text-left")}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {loading && <tr><td colSpan={9}><LoadingState className="py-6" /></td></tr>}
                  {!loading && rows.length === 0 && <tr><td colSpan={9} className="h-24 text-center text-[#9aa3ad]">Tidak ada data</td></tr>}
                  {!loading && rows.map((r) => (
                    <tr key={r.ID} onClick={() => setSel(r)} className={cn("cursor-pointer border-b border-[#eceff2] hover:bg-[#f6f7f9]", sel?.ID === r.ID && "bg-primary/10")}>
                      <td className="px-2 py-1.5">{fmtDate(r.Date)}</td>
                      <td className="px-2 py-1.5 font-mono text-xs">{r[c.parentRel]?.Code}</td>
                      <td className="px-2 py-1.5">{r[c.parentRel]?.[c.partyRel]?.Name ?? "-"}</td>
                      <td className="px-2 py-1.5">{r.Method?.Name ?? "-"}</td>
                      <td className="px-2 py-1.5">{instLabel(r.InstrumentType)}</td>
                      <td className="px-2 py-1.5">{r.ReferenceNumber || "-"}</td>
                      <td className="px-2 py-1.5">{r.DueDate ? fmtDate(r.DueDate) : "-"}</td>
                      <td className="px-2 py-1.5 text-right">{fmt(r.Amount, 0)}</td>
                      <td className="px-2 py-1.5">
                        <span className={cn("rounded px-2 py-0.5 text-xs", r.IsCleared ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-[#fff3e0] text-[#e65100]")}>
                          {r.IsCleared ? (r.InstrumentType === "CEK" || r.InstrumentType === "BG" ? "Sudah Cair" : "Lunas") : "Belum Cair"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span>{total} data</span>
              <div className="flex items-center gap-2">
                <button type="button" className={btn} disabled={page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</button>
                <span>{page} / {pages}</span>
                <button type="button" className={btn} disabled={page >= pages} onClick={() => setPage(page + 1)}>Berikutnya</button>
              </div>
            </div>
          </>
        )}
      </KCard>
      <ConfirmDelete open={del} onClose={() => setDel(false)} onConfirm={doDelete} label={sel ? `pembayaran ${sel[c.parentRel]?.Code ?? ""}` : "pembayaran ini"} loading={busy} />
    </PageWrapper>
  );
}

function PaymentForm({ kind, form, setForm, methodOpts, saving, onSave, onCancel }: {
  kind: Kind; form: FormState; setForm: (f: FormState) => void; methodOpts: { value: number; label: string }[];
  saving: boolean; onSave: () => void; onCancel: () => void;
}) {
  const c = CFG[kind];
  const [q, setQ] = useState("");
  const [found, setFound] = useState<Row[]>([]);
  const [chosen, setChosen] = useState<Row | null>(null);
  const paymentsKey = kind === "purchase" ? "PurchasePayments" : "SalePayments";
  const set = (patch: Partial<FormState>) => setForm({ ...form, ...patch });

  // Outstanding = total minus every payment (cleared or not) except the one being edited.
  const outstanding = (p: Row) =>
    num(p.Total) - ((p[paymentsKey] ?? []) as Row[]).filter((x) => x.ID !== form.id).reduce((s, x) => s + num(x.Amount), 0);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      const params: Record<string, unknown> = { $include: c.parentInclude, $take: 30, $orderBy: { Date: "desc" } };
      if (q) { params.$search = q; params.$searchFields = "Code"; }
      const r = await api.get<Row[]>(c.parent, params, { skipCache: true }).catch(() => null);
      if (alive) setFound((r?.data ?? []).filter((p) => outstanding(p) > 0 || String(p.ID) === form.parentId));
    }, 250);
    return () => { alive = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, c.parent]);

  useEffect(() => {
    if (!form.parentId) { setChosen(null); return; }
    const hit = found.find((p) => String(p.ID) === form.parentId);
    if (hit) setChosen(hit);
    else void api.getOne<Row>(c.parent, form.parentId, { $include: c.parentInclude }).then((r) => r.data && setChosen(r.data)).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.parentId, found.length]);

  const opts = found.map((p) => ({ value: p.ID, label: `${p.Code} - ${p[c.partyRel]?.Name ?? ""} (sisa ${fmt(outstanding(p), 0)})` }));
  const isCheque = form.instrument === "CEK" || form.instrument === "BG";
  const isDeposit = form.instrument === "DEPOSIT";
  const partyId = chosen ? (kind === "sale" ? chosen.CustomerID : chosen.SupplierID) : null;
  const [depBalance, setDepBalance] = useState<number | null>(null);
  useEffect(() => {
    if (!isDeposit || !partyId) { setDepBalance(null); return; }
    const ep = kind === "sale" ? "customer-deposit" : "supplier-deposit";
    api.request<{ balance: number }>("GET", `${ep}/balance/${partyId}`).then((r) => setDepBalance(num(r.data?.balance))).catch(() => setDepBalance(null));
  }, [isDeposit, partyId, kind]);

  return (
    <div>
      {!form.id && <KInput label={`Cari No. ${c.parentLabel}`} placeholder="Ketik kode transaksi..." value={q} onChange={(e) => setQ(e.target.value)} />}
      <KSelect label={`No. ${c.parentLabel}`} value={form.parentId} onChange={(v) => set({ parentId: v })} options={opts} disabled={!!form.id} />
      {chosen && (
        <div className="mb-3 rounded border border-dashed border-[#c9d0d8] px-3 py-2 text-sm">
          {c.partyLabel}: <b>{chosen[c.partyRel]?.Name ?? "-"}</b> &nbsp;|&nbsp; Total: <b>{fmt(chosen.Total, 0)}</b> &nbsp;|&nbsp; Sisa tagihan: <b>{fmt(outstanding(chosen), 0)}</b>
        </div>
      )}
      <KRow cols={3}>
        <KSelect label="Jenis Pembayaran" value={form.instrument} onChange={(v) => set({ instrument: v, methodId: v === "DEPOSIT" || !methodOpts.some((o) => String(o.value) === form.methodId) ? "" : form.methodId })} options={INSTRUMENTS} />
        {isDeposit
          ? <KInput label="Saldo Deposit" value={depBalance === null ? "-" : fmt(depBalance, 0)} readOnly />
          : <KSelect label="Metode" value={form.methodId} onChange={(v) => set({ methodId: v })} options={methodOpts} />}
        <KNumber label="Jumlah" value={form.amount} onChange={(v) => set({ amount: v })} />
      </KRow>
      <KRow cols={3}>
        <KInput label="Tanggal" type="date" value={form.date} onChange={(e) => set({ date: e.target.value })} />
        <KInput label={isCheque ? "No. Cek / BG" : "No. Referensi"} value={form.ref} onChange={(e) => set({ ref: e.target.value })} />
        {isCheque && <KInput label="Tanggal Jatuh Tempo" type="date" value={form.dueDate} onChange={(e) => set({ dueDate: e.target.value })} />}
      </KRow>
      <KInput label="Catatan" value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
      {isCheque && <p className="mb-3 text-[13px] text-[#3a4654]">Cek/BG belum dihitung sebagai pembayaran (dan belum dijurnal) sampai ditandai lunas di menu Status Lunas.</p>}
      {isDeposit && <p className="mb-3 text-[13px] text-[#3a4654]">Pembayaran memotong saldo deposit {kind === "sale" ? "pelanggan" : "supplier"}; ditolak bila saldo tidak mencukupi.</p>}
      <div className="flex gap-2">
        <button type="button" className={btn} disabled={saving} onClick={onSave}>{saving ? "Menyimpan..." : "Simpan"}</button>
        <button type="button" className={btn} onClick={onCancel}>Batal</button>
      </div>
    </div>
  );
}
