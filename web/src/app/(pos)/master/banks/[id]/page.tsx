"use client";

import { EntityEditPage } from "@/components/master-data/pages";
import { bankConfig } from "@/components/master-data/configs";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EntityEditPage config={bankConfig} params={params} />;
}
