"use client";

import { EntityEditPage } from "@/components/master-data/pages";
import { categoryConfig } from "@/components/master-data/configs";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EntityEditPage config={categoryConfig} params={params} />;
}
