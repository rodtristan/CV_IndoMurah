"use client";

import { EntityList } from "@/components/master-data/EntityList";
import { warehouseConfig } from "@/components/master-data/configs";

export default function Page() {
  return <EntityList config={warehouseConfig} />;
}
