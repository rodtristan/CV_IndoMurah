"use client";

// Laporan CSV Faktur Pajak Keluaran (Ketoko "Ekspor CSV Faktur Penjualan"): filter periode, Dept/Gudang,
// No Transaksi Dari/Sampai, User, Pelanggan Dari/Sampai, "Tampil yang Kena Pajak Saja".
// Proses Ekspor menghasilkan CSV impor e-Faktur (baris FK / LT / OF) dengan data pendukung pajak pelanggan.

import { useCallback, useEffect, useState } from "react";
import { Download, Settings } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { formatNumber, localDate } from "@/lib/utils";
import { usePageTitle } from "@/lib/page-title";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { KCard, KCheckbox, KInput, KSelect } from "@/components/kform";
import { PartnerLookup } from "@/components/transaction/PartnerLookup";
import { LoadingState } from "@/components/ui/Loader";

type Rec = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
interface Pick { id: number; name: string; code: string }

const firstOfMonth = () => { const d = new Date(); d.setDate(1); return localDate(d); };
const lastOfMonth = () => { const d = new Date(); d.setMonth(d.getMonth() + 1, 0); return localDate(d); };
const TAX: Record<string, string> = { NON: "Non", INCLUDE: "Include", EXCLUDE: "Exclude" };
const digits = (s?: string | null) => String(s ?? "").replace(/\D/g, "");

/** Nilai CSV e-Faktur: selalu dikutip; angka tanpa pemisah ribuan. */
const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function efakturCsv(sales: Rec[]): string {
  const out: string[] = [
    ["FK", "KD_JENIS_TRANSAKSI", "FG_PENGGANTI", "NOMOR_FAKTUR", "MASA_PAJAK", "TAHUN_PAJAK", "TANGGAL_FAKTUR", "NPWP", "NAMA", "ALAMAT_LENGKAP", "JUMLAH_DPP", "JUMLAH_PPN", "JUMLAH_PPNBM", "ID_KETERANGAN_TAMBAHAN", "FG_UANG_MUKA", "UANG_MUKA_DPP", "UANG_MUKA_PPN", "UANG_MUKA_PPNBM", "REFERENSI", "KODE_DOKUMEN_PENDUKUNG"].map(q).join(","),
    ["LT", "NPWP", "NAMA", "JALAN", "BLOK", "NOMOR", "RT", "RW", "KECAMATAN", "KELURAHAN", "KABUPATEN", "PROPINSI", "KODE_POS", "NOMOR_TELEPON"].map(q).join(","),
    ["OF", "KODE_OBJEK", "NAMA", "HARGA_SATUAN", "JUMLAH_BARANG", "HARGA_TOTAL", "DISKON", "DPP", "PPN", "TARIF_PPNBM", "PPNBM"].map(q).join(","),
  ];
  for (const s of sales) {
    const c = s.Customer ?? {};
    const d = new Date(s.Date);
    const dpp = Math.floor(Number(s.Total) - Number(s.TaxAmount));
    const ppn = Math.floor(Number(s.TaxAmount));
    const npwp = digits(c.TaxID) || "000000000000000";
    out.push([
      "FK", "01", "0", "", d.getMonth() + 1, d.getFullYear(), `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`,
      npwp, npwp === "000000000000000" && c.TaxNIK ? `${digits(c.TaxNIK)}#NIK#NAMA#${c.TaxName || c.Name}` : c.TaxName || c.Name, c.TaxAddress || c.Address || "",
      dpp, ppn, 0, "", 0, 0, 0, 0, s.Code, "",
    ].map(q).join(","));
    const items: Rec[] = s.SaleItems ?? [];
    const sub = items.reduce((a, i) => a + Number(i.Subtotal), 0) || 1;
    const rate = Number(s.TaxPercent ?? 0);
    for (const it of items) {
      const share = Number(it.Subtotal) / sub;
      const lineDpp = Math.floor(dpp * share);
      const qty = Number(it.Quantity);
      const gross = Number(it.UnitPrice) * qty;
      const incl = s.TaxMode === "INCLUDE" && rate > 0 ? 100 / (100 + rate) : 1;
      out.push([
        "OF", it.Product?.Code ?? "", it.Product?.Name ?? "", Math.round(Number(it.UnitPrice) * incl * 100) / 100, qty,
        Math.round(gross * incl * 100) / 100, Math.round(Math.max(0, gross * incl - lineDpp) * 100) / 100, lineDpp, Math.floor((lineDpp * rate) / 100), 0, 0,
      ].map(q).join(","));
    }
  }
  return out.join("\r\n");
}

export default function ExportCsvFakturPage() {
  usePageTitle("Laporan CSV Faktur Pajak Keluaran");
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(lastOfMonth());
  const [warehouseId, setWarehouseId] = useState("");
  const [codeFrom, setCodeFrom] = useState("");
  const [codeTo, setCodeTo] = useState("");
  const [userId, setUserId] = useState("");
  const [custFrom, setCustFrom] = useState<Pick | null>(null);
  const [custTo, setCustTo] = useState<Pick | null>(null);
  const [taxedOnly, setTaxedOnly] = useState(true);
  const [warehouses, setWarehouses] = useState<{ value: string; label: string }[]>([]);
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [rows, setRows] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    void (async () => {
      const [wh, us] = await Promise.all([
        api.get<Rec[]>("warehouse", { $take: 200 }).catch(() => null),
        api.get<Rec[]>("users", { $take: 200 }).catch(() => null),
      ]);
      setWarehouses((wh?.data ?? []).map((w: Rec) => ({ value: String(w.ID), label: `${w.Code} - ${w.Name}` })));
      setUsers((us?.data ?? []).map((u: Rec) => ({ value: String(u.ID), label: u.Username ?? u.Name ?? u.Email })));
    })();
  }, []);

  const query = useCallback((take: number, skip: number) => {
    const where: Rec = { PaymentStatus: { Code: { ne: "CANCELLED" } } };
    const date: Rec = {};
    if (from) date.dategte = from;
    if (to) date.datelte = to;
    if (Object.keys(date).length) where.Date = date;
    if (warehouseId) where.WarehouseID = Number(warehouseId);
    if (userId) where.CreatedByID = userId;
    const code: Rec = {};
    if (codeFrom) code.sgte = codeFrom;
    if (codeTo) code.slte = codeTo;
    if (Object.keys(code).length) where.Code = code;
    const cust: Rec = {};
    if (custFrom?.code) cust.sgte = custFrom.code;
    if (custTo?.code) cust.slte = custTo.code;
    if (Object.keys(cust).length) where["Customer.Code"] = cust;
    if (taxedOnly) where.TaxAmount = { gt: 0 };
    return { $include: "Customer,SaleItems,SaleItems.Product", $where: where, $orderBy: { Date: "asc" as const }, $take: take, $skip: skip };
  }, [from, to, warehouseId, userId, codeFrom, codeTo, custFrom, custTo, taxedOnly]);

  const fetchAll = useCallback(async () => {
    const all: Rec[] = [];
    for (let skip = 0; skip < 20000; skip += 500) {
      const r = await api.get<Rec[]>("sales", query(500, skip), { skipCache: true });
      const d = r.data ?? [];
      all.push(...d);
      if (d.length < 500) break;
    }
    return all;
  }, [query]);

  const show = async () => {
    setLoading(true);
    try { setRows(await fetchAll()); setRan(true); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Gagal memuat data"); }
    finally { setLoading(false); }
  };

  const exportCsv = async () => {
    setLoading(true);
    try {
      const data = ran ? rows : await fetchAll();
      if (!data.length) { toast.info("Tidak ada faktur untuk diekspor"); return; }
      const missing = data.filter((s) => !digits(s.Customer?.TaxID) && !digits(s.Customer?.TaxNIK)).length;
      const blob = new Blob([efakturCsv(data)], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `efaktur-keluaran-${from}-sd-${to}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`${data.length} faktur diekspor${missing ? ` (${missing} pelanggan belum punya NPWP/NIK di Data Pendukung Pajak)` : ""}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mengekspor");
    } finally { setLoading(false); }
  };

  return (
    <PageWrapper>
      <KCard>
        <div className="grid gap-x-3 sm:grid-cols-2 lg:grid-cols-3">
          <KInput label="Tanggal Dari" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <KInput label="Tanggal Sampai" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <KSelect label="Dept/Gudang" value={warehouseId} onChange={setWarehouseId} options={warehouses} placeholder="Semua" />
          <KInput label="No Transaksi Dari" value={codeFrom} onChange={(e) => setCodeFrom(e.target.value)} />
          <KInput label="No Transaksi Sampai" value={codeTo} onChange={(e) => setCodeTo(e.target.value)} />
          <KSelect label="User" value={userId} onChange={setUserId} options={users} placeholder="Select..." />
          <PartnerLookup label="Pelanggan Dari" endpoint="customer" value={custFrom?.name ?? ""} placeholder="Select..."
            onPick={(p) => setCustFrom({ id: Number(p.value), name: p.label, code: String(p.row.Code ?? "") })} onClear={() => setCustFrom(null)} />
          <PartnerLookup label="Pelanggan Sampai" endpoint="customer" value={custTo?.name ?? ""} placeholder="Select..."
            onPick={(p) => setCustTo({ id: Number(p.value), name: p.label, code: String(p.row.Code ?? "") })} onClear={() => setCustTo(null)} />
          <KCheckbox label="Tampil yang Kena Pajak Saja" checked={taxedOnly} onChange={setTaxedOnly} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={loading} onClick={() => void show()} className="inline-flex h-10 items-center gap-2 rounded bg-[#7fb8e6] px-5 text-sm text-white hover:bg-[#6aa8da] disabled:opacity-60">
            <Settings className="size-4" /> Tampil Data
          </button>
          <button type="button" disabled={loading} onClick={() => void exportCsv()} className="inline-flex h-10 items-center gap-2 rounded bg-[#4caf50] px-5 text-sm text-white hover:bg-[#43a047] disabled:opacity-60">
            <Download className="size-4" /> Proses Ekspor
          </button>
        </div>
      </KCard>
      <div className="mt-3 overflow-x-auto rounded border border-[#d5d9de] bg-white">
        {loading ? <LoadingState className="py-16" /> : (
          <table className="w-full min-w-[1150px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#d5d9de] bg-[#f5f6f8] text-left">
                {["No Transaksi", "Tanggal", "Pelanggan", "NPWP", "Nama NPWP", "Alamat NPWP", "PPN", "No Faktur Pajak", "Total", "Keterangan"].map((h) => (
                  <th key={h} className={`border-r border-[#e3e6ea] px-2 py-2 font-normal ${h === "Total" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={10} className="h-40 text-center text-[#9aa3ad]">{ran ? "No data" : "Atur filter lalu klik Tampil Data"}</td></tr>
              ) : rows.map((s) => (
                <tr key={s.ID} className="border-b border-[#eef0f2]">
                  <td className="border-r border-[#eef0f2] px-2 py-1.5 font-mono text-xs">{s.Code}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5">{new Date(s.Date).toLocaleString("id-ID")}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5">{s.Customer ? `${s.Customer.Code}-${s.Customer.Name}` : ""}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5">{s.Customer?.TaxID ?? ""}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5">{s.Customer?.TaxName ?? ""}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5">{s.Customer?.TaxAddress ?? ""}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5">{TAX[s.TaxMode] ?? s.TaxMode}</td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5"></td>
                  <td className="border-r border-[#eef0f2] px-2 py-1.5 text-right">{formatNumber(Number(s.Total), 2)}</td>
                  <td className="px-2 py-1.5">{s.Notes ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageWrapper>
  );
}
