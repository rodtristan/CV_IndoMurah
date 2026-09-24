"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Laporan keuangan dijalankan lewat report-engine (Laba Rugi, Neraca, dll).
export default function FinancialReportPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/reports/run/laba-rugi");
  }, [router]);
  return <p className="p-6 text-sm text-muted">Mengalihkan ke Laporan Laba Rugi...</p>;
}
