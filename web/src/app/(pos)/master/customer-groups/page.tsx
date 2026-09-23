"use client";

import { EntityList } from "@/components/master-data/EntityList";
import { customerGroupConfig } from "@/components/master-data/configs";

export default function Page() {
  return <EntityList config={customerGroupConfig} />;
}
