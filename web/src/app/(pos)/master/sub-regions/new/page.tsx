"use client";

import { EntityNewPage } from "@/components/master-data/pages";
import { subRegionConfig } from "@/components/master-data/configs";

export default function Page() {
  return <EntityNewPage config={subRegionConfig} />;
}
