"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, RotateCcw } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { KInput, KSelect } from "@/components/kform";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";
import { apiError } from "../_lib/local";

interface LogRow {
  ID: number; Method: string; Endpoint: string; ResponseStatus?: number | null; Message?: string | null;
  RequesterFullName?: string | null; IpAddress?: string | null; DurationMs?: number | null;
  LogDatetime: string; Payload?: unknown;
}

const ACTIONS = [
  { value: "GET", label: "Lihat" }, { value: "POST", label: "Tambah" }, { value: "PUT", label: "Ubah" },
  { value: "PATCH", label: "Ubah (sebagian)" }, { value: "DELETE", label: "Hapus" },
];
const ACTION_LABEL: Record<string, string> = Object.fromEntries(ACTIONS.map((a) => [a.value, a.label]));
const ACTION_VARIANT: Record<string, "success" | "info" | "warning" | "danger" | "default"> = { GET: "info", POST: "success", PUT: "warning", PATCH: "warning", DELETE: "danger" };

// Menu filter -> endpoint fragment (server-side "contains").
const MENUS = [
  { value: "product", label: "Master - Item" }, { value: "customer", label: "Master - Pelanggan" },
  { value: "supplier", label: "Master - Supplier" }, { value: "warehouse", label: "Master - Dept/Gudang" },
  { value: "purchase", label: "Pembelian" }, { value: "sale", label: "Penjualan" }, { value: "stock", label: "Persediaan" },
  { value: "cash", label: "Kas & Bank" }, { value: "journal", label: "Akuntansi - Jurnal" }, { value: "account", label: "Akuntansi - Perkiraan" },
  { value: "import", label: "Import Data" }, { value: "users", label: "Sistem - User" }, { value: "roles", label: "Sistem - Kelompok Akses" },
  { value: "app-setting", label: "Sistem - Pengaturan" }, { value: "numbering", label: "Sistem - Setting Nomor" }, { value: "auth", label: "Sistem - Login" },
];

const CATEGORY: [RegExp, string][] = [
  [/(sale|purchase|stock|cash|payment|return|order)/, "Transaksi"],
  [/(journal|account|expense|asset)/, "Akuntansi"],
  [/import|bulk/, "Impor"],
  [/(users|roles|menu|auth|numbering|app-setting|company|log)/, "Sistem"],
  [/.*/, "Master"],
];
const categoryOf = (endpoint: string) => CATEGORY.find(([re]) => re.test(endpoint.toLowerCase()))![1];
const CATEGORIES = ["Transaksi", "Master", "Akuntansi", "Impor", "Sistem"];

const PAGE_SIZE = 25;

export default function ActivityLogPage() {
  usePageTitle("Log Aktivitas");
  const [rows, setRows] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [menu, setMenu] = useState("");
  const [action, setAction] = useState("");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [applied, setApplied] = useState({ user: "", menu: "", action: "", from: "", to: "" });
  const [detail, setDetail] = useState<LogRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const where: Record<string, unknown> = {};
      if (applied.action) where.Method = applied.action;
      if (applied.menu) where.Endpoint = { contains: applied.menu };
      if (applied.user) where.RequesterFullName = { contains: applied.user };
      const range: Record<string, string> = {};
      if (applied.from) range.gte = new Date(`${applied.from}T00:00:00`).toISOString();
      if (applied.to) range.lte = new Date(`${applied.to}T23:59:59.999`).toISOString();
      if (Object.keys(range).length) where.LogDatetime = range;
      const res = await api.get<LogRow[]>("log", {
        $orderBy: { LogDatetime: "desc" }, $take: PAGE_SIZE, $skip: (page - 1) * PAGE_SIZE,
        ...(Object.keys(where).length ? { $where: where } : {}),
      }, { skipCache: true });
      setRows(res.data ?? []);
      setTotal(res.meta?.total ?? (res.data?.length ?? 0));
    } catch (e) { toast.error(apiError(e)); } finally { setLoading(false); }
  }, [applied, page]);
  useEffect(() => { void fetchData(); }, [fetchData]);

  const search = () => { setPage(1); setApplied({ user, menu, action, from, to }); };
  const reset = () => {
    setUser(""); setMenu(""); setAction(""); setCategory(""); setFrom(""); setTo(""); setPage(1);
    setApplied({ user: "", menu: "", action: "", from: "", to: "" });
  };

  const shown = category ? rows.filter((r) => categoryOf(r.Endpoint) === category) : rows;

  const columns = [
    { key: "LogDatetime", label: "Waktu", render: (v: unknown) => new Date(v as string).toLocaleString("id-ID") },
    { key: "RequesterFullName", label: "User", render: (v: unknown) => (v as string) || <span className="text-muted">-</span> },
    { key: "cat", label: "Kategori", render: (_: unknown, r: LogRow) => categoryOf(r.Endpoint) },
    { key: "Endpoint", label: "Menu / Endpoint", render: (v: unknown) => <span className="font-mono text-xs">{(v as string).replace("/api/v1/", "")}</span> },
    { key: "Method", label: "Aksi", render: (v: unknown) => <Badge variant={ACTION_VARIANT[v as string] || "default"}>{ACTION_LABEL[v as string] || (v as string)}</Badge> },
    { key: "ResponseStatus", label: "Status", align: "right" as const, render: (v: unknown) => {
        const s = Number(v);
        return <Badge variant={s >= 500 ? "danger" : s >= 400 ? "warning" : "success"}>{s || "-"}</Badge>;
      } },
    { key: "IpAddress", label: "IP", render: (v: unknown) => (v as string) || "-" },
    { key: "act", label: "", width: "70px", render: (_: unknown, r: LogRow) => <Button variant="outline" size="sm" onClick={() => setDetail(r)}>Detail</Button> },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-3 text-[13px] text-[#3a4654]">Log Aktivitas mencatat aktivitas penggunaan program: Transaksi, Master, Akuntansi, Impor dan Sistem.</p>
        <div className="grid gap-x-3 sm:grid-cols-2 lg:grid-cols-4">
          <KInput label="User" value={user} onChange={(e) => setUser(e.target.value)} placeholder="Nama user" />
          <KSelect label="Kategori" value={category} onChange={setCategory} placeholder="Semua" options={CATEGORIES.map((c) => ({ value: c, label: c }))} hint="Memfilter baris pada halaman ini." />
          <KSelect label="Menu" value={menu} onChange={setMenu} placeholder="Semua Menu" options={MENUS} />
          <KSelect label="Aksi" value={action} onChange={setAction} placeholder="Semua Aksi" options={ACTIONS} />
          <KInput label="Dari Tanggal" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <KInput label="Sampai Tanggal" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="mb-4 flex gap-2">
          <Button variant="primary" icon={Search} onClick={search} loading={loading}>Cari</Button>
          <Button variant="outline" icon={RotateCcw} onClick={reset}>Reset</Button>
        </div>
        <DataTable data={shown} columns={columns} loading={loading} emptyMessage="Tidak ada aktivitas"
          pagination={{ page, pageSize: PAGE_SIZE, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)), onPageChange: setPage }} />
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail Aktivitas" size="lg">
        {detail && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted">Waktu:</span> {new Date(detail.LogDatetime).toLocaleString("id-ID")}</div>
              <div><span className="text-muted">Aksi:</span> {ACTION_LABEL[detail.Method] || detail.Method}</div>
              <div className="col-span-2"><span className="text-muted">Endpoint:</span> <span className="font-mono">{detail.Endpoint}</span></div>
              <div><span className="text-muted">Status:</span> {detail.ResponseStatus}</div>
              <div><span className="text-muted">Durasi:</span> {detail.DurationMs} ms</div>
              <div><span className="text-muted">User:</span> {detail.RequesterFullName || "-"}</div>
              <div><span className="text-muted">IP:</span> {detail.IpAddress || "-"}</div>
            </div>
            {detail.Message && <pre className="max-h-32 overflow-auto rounded-lg bg-elevated p-3 text-xs">{detail.Message}</pre>}
            {detail.Payload != null && Object.keys(detail.Payload as object).length > 0 && (
              <pre className="max-h-48 overflow-auto rounded-lg bg-elevated p-3 text-xs">{JSON.stringify(detail.Payload, null, 2)}</pre>
            )}
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
