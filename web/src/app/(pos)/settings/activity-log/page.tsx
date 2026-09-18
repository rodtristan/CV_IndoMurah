"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/StatCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

const METHOD_OPTIONS = [
  { value: "", label: "Semua Method" },
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PUT", label: "PUT" },
  { value: "PATCH", label: "PATCH" },
  { value: "DELETE", label: "DELETE" },
];

const METHOD_VARIANT: Record<string, "success" | "info" | "warning" | "danger" | "default"> = {
  GET: "info",
  POST: "success",
  PUT: "warning",
  PATCH: "warning",
  DELETE: "danger",
};

export default function ActivityLogPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { $orderBy: { LogDatetime: "desc" }, $take: 50 };
      const where: any = {};
      if (method) where.Method = method;
      if (search) where.Endpoint = { contains: search };
      if (Object.keys(where).length > 0) params.$where = where;
      const res = await api.get("log", params).catch(() => ({ success: false, data: [] } as any));
      if (res.success) setRows(res.data || []);
    } finally { setLoading(false); }
  }, [method, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: "LogDatetime", label: "Waktu", render: (v: unknown) => v ? new Date(v as string).toLocaleString("id-ID") : "-" },
    { key: "Method", label: "Method", render: (v: unknown) => <Badge variant={METHOD_VARIANT[v as string] || "default"}>{(v as string) || "-"}</Badge> },
    { key: "Endpoint", label: "Endpoint", render: (v: unknown) => <span className="font-mono text-xs">{(v as string) || "-"}</span> },
    { key: "ResponseStatus", label: "Status", align: "right" as const, render: (v: unknown) => {
        const status = Number(v);
        return <Badge variant={status >= 500 ? "danger" : status >= 400 ? "warning" : "success"}>{status || "-"}</Badge>;
      } },
    { key: "RequesterFullName", label: "User", render: (v: unknown) => (v as string) || <span className="text-muted">-</span> },
    { key: "IpAddress", label: "IP", render: (v: unknown) => (v as string) || "-" },
    { key: "DurationMs", label: "Durasi", align: "right" as const, render: (v: unknown) => v != null ? `${v} ms` : "-" },
    {
      key: "actions", label: "", width: "70px",
      render: (_: unknown, row: any) => (
        <Button variant="outline" size="sm" onClick={() => setDetail(row)}>Detail</Button>
      ),
    },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-4 text-sm text-muted">
          Log Aktivitas mencatat setiap request yang masuk ke sistem: siapa yang
          mengakses, endpoint apa, dan hasilnya. Menampilkan 50 aktivitas terbaru.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <Select label="Method" value={method} onChange={(e) => setMethod(e.target.value)} options={METHOD_OPTIONS} />
          <Input label="Cari Endpoint" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="/api/v1/sales" />
          <Button variant="primary" onClick={fetchData} loading={loading}>Cari</Button>
        </div>
        <div className="mt-4">
          <DataTable data={rows} columns={columns} loading={loading} emptyMessage="Tidak ada aktivitas" />
        </div>
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail Aktivitas" size="lg">
        {detail && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted">Waktu:</span> {formatDate(detail.LogDatetime)} {new Date(detail.LogDatetime).toLocaleTimeString("id-ID")}</div>
              <div><span className="text-muted">Method:</span> {detail.Method}</div>
              <div className="col-span-2"><span className="text-muted">Endpoint:</span> <span className="font-mono">{detail.Endpoint}</span></div>
              <div><span className="text-muted">Status:</span> {detail.ResponseStatus}</div>
              <div><span className="text-muted">Durasi:</span> {detail.DurationMs} ms</div>
              <div><span className="text-muted">User:</span> {detail.RequesterFullName || "-"}</div>
              <div><span className="text-muted">IP:</span> {detail.IpAddress || "-"}</div>
            </div>
            {detail.Message && (
              <div>
                <p className="mb-1 text-muted">Message:</p>
                <pre className="max-h-32 overflow-auto rounded-lg bg-elevated p-3 text-xs">{detail.Message}</pre>
              </div>
            )}
            {detail.Payload && (
              <div>
                <p className="mb-1 text-muted">Payload:</p>
                <pre className="max-h-48 overflow-auto rounded-lg bg-elevated p-3 text-xs">{JSON.stringify(detail.Payload, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
