"use client";

import { EntityNewPage } from "@/components/master-data/pages";
import { unitConfig } from "@/components/master-data/configs";

export default function Page() {
  return <EntityNewPage config={unitConfig} />;
}
