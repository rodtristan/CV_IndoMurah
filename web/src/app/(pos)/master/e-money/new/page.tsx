"use client";

import { EntityNewPage } from "@/components/master-data/pages";
import { eMoneyConfig } from "@/components/master-data/configs";

export default function Page() {
  return <EntityNewPage config={eMoneyConfig} />;
}
