"use client";

import { EntityList } from "@/components/master-data/EntityList";
import { categoryConfig } from "@/components/master-data/configs";

export default function Page() {
  return <EntityList config={categoryConfig} />;
}
