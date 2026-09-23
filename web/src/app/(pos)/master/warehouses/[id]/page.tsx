"use client";

import { EntityEditPage } from "@/components/master-data/pages";
import { warehouseConfig } from "@/components/master-data/configs";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EntityEditPage config={warehouseConfig} params={params} />;
}
