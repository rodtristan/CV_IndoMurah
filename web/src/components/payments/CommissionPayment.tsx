"use client";

// Komisi Sales Ketoko: Daftar Pembayaran Komisi Sales + form "Bayar Komisi Sales".
// Hanya penjualan yang sudah lunas (dan belum pernah dibayar komisinya) yang tampil.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { cn, formatNumber, localDate, localDateTime } from "@/lib/utils";
import { usePageTitle } from "@/lib/page-title";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { KCard, KCheckbox, KInput, KSelect, KTextarea } from "@/components/kform";
import { KetokoList, kcol, type KListColumn, type KListFilter } from "@/components/ui/KetokoList";
import { PartnerLookup } from "@/components/transaction/PartnerLookup";
import { printTable } from "@/components/transaction/print";
import { LoadingState } from "@/components/ui/Loader";
import { ConfirmModal } from "@/components/ui/Modal";

type Rec = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export const INSTRUMENT: Record<string, string> = { CASH: "Tunai / Transfer", CEK: "Cek", BG: "Bilyet Giro" };
const money = (v: unknown) => formatNumber(Number(v ?? 0), 2);
const firstOfMonth = () => { const d = new Date(); d.setDate(1); return localDate(d); };
const lastOfMonth = () => { const d = new Date(); d.setMonth(d.getMonth() + 1, 0); return localDate(d); };

// ─── Daftar Pembayaran Komisi Sales ─────────────────────────────────────────

const LIST_COLUMNS: KListColumn[] = [
  kcol.text("Code", "No Transaksi", 150),
  kcol.datetime("Date", "Tanggal", 150),
  { key: "InstrumentType", label: "Cara Bayar", width: 130, render: (v) => INSTRUMENT[String(v)] ?? String(v ?? "") },
  kcol.text("SalesPerson.Code", "Kode Sales", 110),
  kcol.text("SalesPerson.Name", "Nama", 160),
  kcol.text("Notes", "Keterangan", 200),
  kcol.money("Total", "Total", 120),
  kcol.text("Creator.Username", "User Buat", 100),
  kcol.text("UpdatedBy", "User Ubah", 100),
  kcol.text("Device", "Komputer", 150),
];
const LIST_FILTERS: KListFilter[] = [
  { key: "from", label: "Tanggal Dari", type: "date", defaultValue: firstOfMonth(), where: (v) => ({ Date: { dategte: v } }) },
  { key: "to", label: "Tanggal Sampai", type: "date", defaultValue: lastOfMonth(), where: (v) => ({ Date: { datelte: v } }) },
  { key: "sales", label: "Sales", type: "select", optionsFrom: { endpoint: "sales-person", label: (r) => `${r.Code} - ${r.Name}` }, where: (v) => ({ SalesPersonID: Number(v) }) },
];
const LIST_SORTS = [
  { value: "Date", label: "Tanggal" },
  { value: "Code", label: "No Transaksi" },
  { value: "SalesPerson.Name", label: "Nama Sales" },
  { value: "Total", label: "Total" },
];
const LIST_SEARCH = ["Code", "Notes", "Number", "SalesPerson.Name", "SalesPerson.Code"];

export function CommissionList() {
  return (
    <KetokoList
      title="Daftar Pembayaran Komisi Sales"
      endpoint="SalesCommissions"
      basePath="/sale/commission"
      include="SalesPerson,Creator"
      searchFields={LIST_SEARCH}
      filters={LIST_FILTERS}
      sortOptions={LIST_SORTS}
      defaultSort="Date"
      defaultDir="desc"
      columns={LIST_COLUMNS}
      canCopy={false}
      deleteLabel={(r) => `pembayaran komisi ${r.Code}`}
      emptyMessage="Belum ada pembayaran komisi sales"
    />
  );
}

// ─── Form Bayar Komisi Sales ────────────────────────────────────────────────

interface Line { SaleID: number; Type: string; Code: string; Date: string; SalesCode: string; Commission: number; ReturnCommission: number; Amount: number }

export function CommissionForm({ id }: { id?: string }) {
  const router = useRouter();
  const isNew = !id;
  usePageTitle(isNew ? "Bayar Komisi Sales" : "Bayar Komisi Sales");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [doc, setDoc] = useState<Rec | null>(null);
  const [date, setDate] = useState(localDateTime(new Date()));
  const [sales, setSales] = useState<{ id: number; name: string } | null>(null);
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(lastOfMonth());
  const [instrument, setInstrument] = useState("CASH");
  const [methodId, setMethodId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [number, setNumber] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [methods, setMethods] = useState<Rec[]>([]);
  const [accounts, setAccounts] = useState<Rec[]>([]);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    void (async () => {
      const [pm, ac] = await Promise.all([
        api.get<Rec[]>("payment-methods", { $take: 100 }).catch(() => null),
        api.get<Rec[]>("account", { $take: 500, $orderBy: { Code: "asc" } }).catch(() => null),
      ]);
      const pms = (pm?.data ?? []).filter((m: Rec) => m.Code !== "DEPOSIT");
      setMethods(pms);
      setAccounts((ac?.data ?? []).filter((a: Rec) => /^1-1[012]/.test(String(a.Code))));
      if (isNew && pms[0]) setMethodId(String(pms.find((m: Rec) => m.Code === "CASH")?.ID ?? pms[0].ID));
    })();
  }, [isNew]);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const r = await api.get<Rec>(`SalesCommissions/${id}`, undefined, { skipCache: true });
        const d = r.data!;
        setDoc(d);
        setDate(localDateTime(new Date(d.Date)));
        setSales({ id: d.SalesPersonID, name: d.SalesPerson?.Name ?? "" });
        if (d.PeriodFrom) setFrom(localDate(new Date(d.PeriodFrom)));
        if (d.PeriodTo) setTo(localDate(new Date(d.PeriodTo)));
        setInstrument(d.InstrumentType ?? "CASH");
        setMethodId(d.MethodID ? String(d.MethodID) : "");
        setAccountId(d.AccountID ? String(d.AccountID) : "");
        setNumber(d.Number ?? "");
        setDueDate(d.DueDate ? localDate(new Date(d.DueDate)) : "");
        setNotes(d.Notes ?? "");
        setLines((d.Lines ?? []).map((l: Rec) => ({
          SaleID: l.SaleID, Type: "Penjualan", Code: l.Sale?.Code ?? "", Date: l.Sale?.Date ?? "", SalesCode: l.Sale?.SalesPerson?.Code ?? d.SalesPerson?.Code ?? "",
          Commission: Number(l.Commission), ReturnCommission: Number(l.ReturnCommission), Amount: Number(l.Amount),
        })));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal memuat");
      } finally { setLoading(false); }
    })();
  }, [id]);

  const loadEligible = useCallback(async (spId: number, f: string, t: string) => {
    const r = await api.get<Line[]>("SalesCommissions/eligible", { salesPersonId: spId, from: f, to: t, ...(id ? { paymentId: id } : {}) }, { skipCache: true }).catch((e) => { toast.error(e instanceof Error ? e.message : "Gagal memuat"); return null; });
    const list = r?.data ?? [];
    setLines(list);
    if (!list.length) toast.info("Tidak ada penjualan lunas dengan komisi pada periode ini");
  }, [id]);

  const totalCommission = lines.reduce((a, l) => a + l.Commission, 0);
  const totalReturn = lines.reduce((a, l) => a + l.ReturnCommission, 0);
  const totalPay = totalCommission - totalReturn;

  const save = async (print: boolean) => {
    if (!sales) { toast.error("Sales wajib dipilih"); return; }
    if (!lines.length) { toast.error("Tidak ada penjualan yang dibayar komisinya"); return; }
    setSaving(true);
    try {
      const body = {
        SalesPersonID: sales.id, Date: new Date(date).toISOString(), MethodID: methodId ? Number(methodId) : null, InstrumentType: instrument,
        AccountID: accountId ? Number(accountId) : null, Number: number || null, DueDate: dueDate || null, PeriodFrom: from || null, PeriodTo: to || null,
        Notes: notes || null, SaleIDs: lines.map((l) => l.SaleID),
      };
      const res = isNew ? await api.post<Rec>("SalesCommissions", body) : await api.put<Rec>("SalesCommissions", id!, body);
      toast.success(`Pembayaran komisi ${res.data?.Code ?? ""} tersimpan`);
      if (print) doPrint(res.data?.Code ?? doc?.Code ?? "");
      router.push("/sale/commission");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!id) return;
    try {
      await api.delete("SalesCommissions", id);
      toast.success("Pembayaran komisi dihapus");
      router.push("/sale/commission");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus");
    } finally { setConfirmDel(false); }
  };

  const doPrint = (code: string) => printTable({
    title: "Bayar Komisi Sales",
    subtitle: `No ${code || "(Auto)"} · ${new Date(date).toLocaleString("id-ID")} · Sales: ${sales?.name ?? "-"} · Periode ${from} s/d ${to}`,
    columns: ["Transaksi", "No Transaksi", "Tanggal", "Kode Sales", "Komisi", "Komisi Retur", "Total"],
    rows: lines.map((l) => [l.Type, l.Code, l.Date ? new Date(l.Date).toLocaleString("id-ID") : "", l.SalesCode, money(l.Commission), money(l.ReturnCommission), money(l.Amount)]),
    rightCols: [4, 5, 6],
    footer: `Total Komisi ${money(totalCommission)} · Total Retur ${money(totalReturn)} · Total Bayar ${money(totalPay)}`,
  });

  if (loading) return <LoadingState className="py-16" />;
  const isCheque = instrument === "CEK" || instrument === "BG";

  return (
    <PageWrapper>
      <KCard>
        <div className="grid gap-x-3 sm:grid-cols-2 lg:grid-cols-5">
          <KInput label="No Transaksi" value={doc?.Code ?? "Auto"} readOnly className="border-dashed bg-[#f7f8fa]" />
          <KInput label="Tanggal" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
          <PartnerLookup label="Sales" endpoint="sales-person" value={sales?.name ?? ""}
            onPick={(p) => { const sp = { id: Number(p.value), name: p.label }; setSales(sp); void loadEligible(sp.id, from, to); }}
            onClear={() => { setSales(null); setLines([]); }} />
          <KInput label="Periode Dari" type="date" value={from} onChange={(e) => { setFrom(e.target.value); if (sales) void loadEligible(sales.id, e.target.value, to); }} />
          <KInput label="s/d" type="date" value={to} onChange={(e) => { setTo(e.target.value); if (sales) void loadEligible(sales.id, from, e.target.value); }} />
          <KSelect label="Cara Bayar" value={instrument} onChange={(v) => setInstrument(v || "CASH")} options={Object.entries(INSTRUMENT).map(([value, label]) => ({ value, label }))} />
          <KSelect label="Metode" value={methodId} onChange={setMethodId} options={methods.map((m) => ({ value: String(m.ID), label: m.Name }))} placeholder="Pilih..." />
          <KSelect label="Kode Akun" value={accountId} onChange={setAccountId} options={accounts.map((a) => ({ value: String(a.ID), label: `${a.Code} - ${a.Name}` }))} placeholder="(default dari metode)" />
          <KInput label="Nomor" value={number} onChange={(e) => setNumber(e.target.value)} placeholder={isCheque ? "No. cek / BG" : ""} />
          {isCheque && <KInput label="Jatuh Tempo Cek/BG" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />}
        </div>

        <div className="mt-2 overflow-x-auto border border-[#d5d9de]">
          <table className="w-full min-w-[820px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#d5d9de] bg-[#f5f6f8] text-left">
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Transaksi</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">No Transaksi</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Tanggal</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Kode Sales</th>
                <th className="border-r border-[#e3e6ea] px-2 py-2 text-right font-normal">Komisi Retur</th>
                <th className="px-2 py-2 text-right font-normal">Total</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr><td colSpan={6} className="h-40 text-center text-[#9aa3ad]">{sales ? "No data" : "Pilih sales untuk menampilkan penjualan lunas"}</td></tr>
              ) : lines.map((l, i) => (
                <tr key={l.SaleID} onClick={() => setSelected(i)} className={cn("cursor-pointer border-b border-[#eef0f2]", selected === i && "bg-[#cfe0ee]")}>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5">{l.Type}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5 font-mono text-xs">{l.Code}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5">{l.Date ? new Date(l.Date).toLocaleString("id-ID") : ""}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5">{l.SalesCode}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5 text-right">{money(l.ReturnCommission)}</td>
                  <td className="px-2 py-1.5 text-right">{money(l.Commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" disabled={selected === null} onClick={() => { if (selected !== null) { setLines(lines.filter((_, j) => j !== selected)); setSelected(null); } }}
          className="mt-2 inline-flex h-9 items-center gap-2 rounded border border-[#cfd4da] bg-white px-3 text-sm hover:bg-[#f3f4f6] disabled:opacity-40">
          <Trash2 className="size-4" /> Hapus Detail
        </button>

        <div className="mt-3 grid gap-x-4 sm:grid-cols-3">
          <KTextarea label="Keterangan" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div>
            <KInput label="Total Retur" value={money(totalReturn)} readOnly className="border-dashed bg-[#f7f8fa] text-right" />
            <KInput label="Total Komisi" value={money(totalCommission)} readOnly className="border-dashed bg-[#f7f8fa] text-right" />
          </div>
          <div>
            <KInput label="Total Bayar" value={money(totalPay)} readOnly className="border-dashed bg-[#f7f8fa] text-right font-bold" />
            <KCheckbox label="Lunas" checked={isNew ? !isCheque : !!doc?.IsCleared} onChange={() => undefined} caption={isCheque ? "Cek/BG: centang di Status Lunas Cek/Bg Sales" : "Tunai / transfer langsung lunas"} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={saving} onClick={() => void save(false)} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6] disabled:opacity-50">
            <Save className="size-4 text-[#2b7fd4]" /> {saving ? "Menyimpan..." : "Simpan"}
          </button>
          {!isNew && (
            <button type="button" onClick={() => setConfirmDel(true)} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6]">
              <Trash2 className="size-4 text-danger" /> Hapus
            </button>
          )}
          <button type="button" onClick={() => doPrint(doc?.Code ?? "")} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6]">
            <Printer className="size-4" /> Cetak
          </button>
          <button type="button" onClick={() => router.push("/sale/commission")} className="h-10 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6]">Kembali</button>
        </div>
      </KCard>
      <ConfirmModal open={confirmDel} onClose={() => setConfirmDel(false)} onConfirm={() => void remove()} title="Hapus Pembayaran Komisi" message={`Hapus pembayaran komisi ${doc?.Code ?? ""}? Jurnal kas dibalik.`} confirmText="Hapus" variant="danger" />
    </PageWrapper>
  );
}

// ─── Status Lunas Cek/Bg Sales ──────────────────────────────────────────────

export function CommissionChequeStatus() {
  usePageTitle("Status Lunas Cek/Bg Sales");
  const [sales, setSales] = useState<{ id: number; name: string } | null>(null);
  const [number, setNumber] = useState("");
  const [rows, setRows] = useState<Rec[]>([]);
  const [edits, setEdits] = useState<Record<number, { IsCleared: boolean; ClearedAt: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get<Rec[]>("SalesCommissions/cheques", { ...(sales ? { salesPersonId: sales.id } : {}), ...(number ? { number } : {}) }, { skipCache: true });
      setRows(r.data ?? []);
      setEdits({});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat");
    } finally { setLoading(false); }
  }, [sales, number]);

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const val = (r: Rec) => edits[r.ID] ?? { IsCleared: !!r.IsCleared, ClearedAt: r.ClearedAt ? localDate(new Date(r.ClearedAt)) : "" };
  const save = async () => {
    const items = Object.entries(edits).map(([k, v]) => ({ ID: Number(k), IsCleared: v.IsCleared, ClearedAt: v.ClearedAt || null }));
    if (!items.length) { toast.info("Tidak ada perubahan"); return; }
    setSaving(true);
    try {
      await api.put("SalesCommissions", "cheques", { Items: items });
      toast.success("Status lunas tersimpan");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally { setSaving(false); }
  };
  const total = rows.reduce((a, r) => a + Number(r.Total ?? 0), 0);

  return (
    <PageWrapper>
      <KCard>
        <div className="max-w-xl">
          <PartnerLookup label="Sales" endpoint="sales-person" value={sales?.name ?? ""} onPick={(p) => setSales({ id: Number(p.value), name: p.label })} onClear={() => setSales(null)} />
          <KInput label="Nomor" value={number} onChange={(e) => setNumber(e.target.value)} />
        </div>
        <button type="button" onClick={() => void load()} className="h-10 rounded border border-[#2b7fd4] bg-white px-5 text-sm text-[#2b7fd4] hover:bg-[#eef5fc]">Cari</button>
        <div className="mt-3 overflow-x-auto border border-[#d5d9de]">
          {loading ? <LoadingState className="py-12" /> : (
            <table className="w-full min-w-[800px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#d5d9de] bg-[#f5f6f8] text-left">
                  <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">No Transaksi</th>
                  <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Sales</th>
                  <th className="border-r border-[#e3e6ea] px-2 py-2 text-right font-normal">Jml Bayar</th>
                  <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">No Cek Bg</th>
                  <th className="border-r border-[#e3e6ea] px-2 py-2 font-normal">Jatuh Tempo</th>
                  <th className="border-r border-[#e3e6ea] px-2 py-2 text-center font-normal">Status Lunas</th>
                  <th className="px-2 py-2 font-normal">Tanggal Lunas</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={7} className="h-32 text-center text-[#9aa3ad]">No data</td></tr>
                ) : rows.map((r) => {
                  const v = val(r);
                  return (
                    <tr key={r.ID} className="border-b border-[#eef0f2]">
                      <td className="border-r border-[#eef0f2] px-2 py-1.5 font-mono text-xs">{r.Code}</td>
                      <td className="border-r border-[#eef0f2] px-2 py-1.5">{r.SalesPerson ? `${r.SalesPerson.Code} - ${r.SalesPerson.Name}` : ""}</td>
                      <td className="border-r border-[#eef0f2] px-2 py-1.5 text-right">{money(r.Total)}</td>
                      <td className="border-r border-[#eef0f2] px-2 py-1.5">{r.Number ?? ""}</td>
                      <td className="border-r border-[#eef0f2] px-2 py-1.5">{r.DueDate ? localDate(new Date(r.DueDate)) : ""}</td>
                      <td className="border-r border-[#eef0f2] px-2 py-1.5 text-center">
                        <input type="checkbox" className="size-4" checked={v.IsCleared}
                          onChange={(e) => setEdits({ ...edits, [r.ID]: { IsCleared: e.target.checked, ClearedAt: e.target.checked ? v.ClearedAt || localDate() : "" } })} />
                      </td>
                      <td className="px-2 py-1">
                        <input type="date" value={v.ClearedAt} disabled={!v.IsCleared} onChange={(e) => setEdits({ ...edits, [r.ID]: { ...v, ClearedAt: e.target.value } })}
                          className="h-8 rounded border border-[#cfd4da] px-2 text-sm disabled:bg-[#f3f4f6]" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="mt-3 flex justify-end">
          <div className="w-72">
            <KInput label="Total" value={money(total)} readOnly className="border-dashed bg-[#e9afe6] text-right font-bold" />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6] disabled:opacity-50">
            <Save className="size-4 text-[#2b7fd4]" /> Simpan
          </button>
          <button type="button" onClick={() => printTable({
            title: "Status Lunas Cek/Bg Sales",
            columns: ["No Transaksi", "Sales", "Jml Bayar", "No Cek Bg", "Status Lunas", "Tanggal Lunas"],
            rows: rows.map((r) => { const v = val(r); return [r.Code, r.SalesPerson?.Name ?? "", money(r.Total), r.Number ?? "", v.IsCleared ? "Lunas" : "Belum", v.ClearedAt]; }),
            rightCols: [2], footer: `Total ${money(total)}`,
          })} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6]">
            <Printer className="size-4" /> Cetak
          </button>
        </div>
      </KCard>
    </PageWrapper>
  );
}
