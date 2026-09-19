"use client";

import { EntityList } from "@/components/master-data/EntityList";
import { regionConfig } from "@/components/master-data/configs";

export default function Page() {
  return <EntityList config={regionConfig} />;
}
