"use client";

import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { StatCard } from "@/components/pos/ui/StatCard";
import { Package, Users, ShoppingCart, Building } from "lucide-react";
import { mockProducts, mockCustomers, mockSuppliers } from "@/lib/mock-data-pos";

export default function MasterReportPage() {
  return (
    <PageWrapper>
      <PageTitle title="Laporan Master" subtitle="Summary data master" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Item" value={mockProducts.length} icon={<Package className="size-5" />} />
        <StatCard title="Total Supplier" value={mockSuppliers.length} icon={<ShoppingCart className="size-5" />} />
        <StatCard title="Total Pelanggan" value={mockCustomers.length} icon={<Users className="size-5" />} />
        <StatCard title="Total Gudang" value={2} icon={<Building className="size-5" />} />
      </div>
    </PageWrapper>
  );
}
