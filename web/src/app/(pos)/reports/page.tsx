"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { EllipsisLoader } from "@/components/ui/Loader";
import type { ReportCatalogItem } from "@/lib/report/types";

const TAB_ORDER = [
  "Master", "Pembelian", "Penjualan", "Hutang", "Piutang", "Persediaan", "Perakitan", "Deposit",
  "Aset", "Daftar Perkiraan", "Kas", "Laba/Jual", "Jurnal", "Buku Besar", "Keuangan",
];

export default function ReportMenuPage() {
  const [items, setItems] = useState<ReportCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ReportCatalogItem[]>("report-engine/catalog", undefined, { skipCache: true });
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setItems(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Gagal memuat daftar laporan");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const tabs = useMemo(() => {
    const present = new Set(items.map((i) => i.group));
    const ordered = TAB_ORDER.filter((t) => present.has(t));
    const extra = [...present].filter((g) => !TAB_ORDER.includes(g));
    return [...ordered, ...extra];
  }, [items]);

  const active = tabs.includes(tab) ? tab : tabs[0] ?? "";
  const visible = items.filter((i) => i.group === active);

  return (
    <div className="rounded-lg border border-default bg-elevated shadow-sm">
      <div className="flex flex-wrap gap-x-1 border-b border-default px-3 pt-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              t === active ? "border-primary text-primary" : "border-transparent text-toned hover:text-highlighted"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-10 text-primary"><EllipsisLoader /></div>
        ) : error ? (
          <p className="py-6 text-center text-sm text-danger">{error}</p>
        ) : visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Belum ada laporan.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-2">
            {visible.map((r) => (
              <div key={r.key}>
                <h3 className="text-xl font-semibold text-highlighted">{r.title}</h3>
                <p className="mt-1 text-sm text-toned">{r.description}</p>
                <Link
                  href={`/reports/run/${encodeURIComponent(r.key)}`}
                  className="mt-3 inline-block rounded bg-success px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-success/90"
                >
                  Lihat Laporan
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
