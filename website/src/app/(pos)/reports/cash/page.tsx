"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { StatCard } from "@/components/pos/ui/StatCard";
import { DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function CashReportPage() {
  return (
    <PageWrapper>
      <PageTitle title="Laporan Kas" subtitle="Laporan arus kas" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Kas Masuk" value="Rp 0" icon={<ArrowUpRight className="size-5" />} />
        <StatCard title="Kas Keluar" value="Rp 0" icon={<ArrowDownRight className="size-5" />} />
        <StatCard title="Saldo Kas" value="Rp 0" icon={<DollarSign className="size-5" />} />
      </div>
    </PageWrapper>
  );
}
